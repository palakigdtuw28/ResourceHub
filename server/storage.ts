import { 
  users, 
  subjects, 
  resources, 
  downloads,
  type User, 
  type InsertUser,
  type Subject,
  type InsertSubject,
  type Resource,
  type InsertResource,
  type Download,
  type InsertDownload
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, count, and, sql } from "drizzle-orm";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserById(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User>;
  updateUserPassword(id: string, hashedPassword: string): Promise<void>;

  getSubjects(year: number, semester: number, branch?: string): Promise<Subject[]>;
  getAllSubjects(): Promise<Subject[]>;
  getSubject(id: string): Promise<Subject | undefined>;
  findExistingSubject(name: string, code: string, year: number, semester: number, branch: string): Promise<Subject | undefined>;
  createSubject(subject: InsertSubject): Promise<Subject>;
  updateSubject(id: string, updateData: Partial<InsertSubject>): Promise<Subject | undefined>;
  deleteSubject(id: string): Promise<boolean>;
  cleanupDuplicateSubjects(): Promise<{ removed: number; kept: number }>;
  fixSubjectBranches(): Promise<{ changes: number }>;

  getResources(subjectId: string, resourceType?: string): Promise<Resource[]>;
  getResource(id: string): Promise<Resource | undefined>;
  createResource(resource: InsertResource): Promise<Resource>;
  getUserResources(userId: string): Promise<Resource[]>;
  incrementDownloadCount(resourceId: string): Promise<void>;
  deleteResource(id: string): Promise<void>;

  createDownload(download: InsertDownload): Promise<Download>;
  getUserDownloads(userId: string): Promise<Download[]>;
  getResourceStats(userId: string): Promise<{ uploads: number; downloads: number; totalDownloads: number }>;

  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  public sessionStore: session.Store;

  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: string, updateData: Partial<InsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...updateData, updatedAt: new Date().toISOString() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getUserById(id: string): Promise<User | undefined> {
    return this.getUser(id); // Reuse existing getUser method
  }

  async updateUserPassword(id: string, hashedPassword: string): Promise<void> {
    await db
      .update(users)
      .set({ password: hashedPassword, updatedAt: new Date().toISOString() })
      .where(eq(users.id, id));
  }

  async getSubjects(year: number, semester: number, branch = "CSE"): Promise<Subject[]> {
    return await db
      .select()
      .from(subjects)
      .where(and(
        eq(subjects.year, year),
        eq(subjects.semester, semester),
        eq(subjects.branch, branch)
      ));
  }

  async getAllSubjects(): Promise<Subject[]> {
    return await db
      .select()
      .from(subjects);
  }

  async getSubject(id: string): Promise<Subject | undefined> {
    const [subject] = await db.select().from(subjects).where(eq(subjects.id, id));
    return subject;
  }

  async findExistingSubject(name: string, code: string, year: number, semester: number, branch: string): Promise<Subject | undefined> {
    // Try exact match first
    let [subject] = await db
      .select()
      .from(subjects)
      .where(
        and(
          eq(subjects.name, name),
          eq(subjects.code, code),
          eq(subjects.year, year),
          eq(subjects.semester, semester),
          eq(subjects.branch, branch)
        )
      );

    // If no exact match and branch is CSE, also try "Computer Science" for backward compatibility
    if (!subject && branch === 'CSE') {
      [subject] = await db
        .select()
        .from(subjects)
        .where(
          and(
            eq(subjects.name, name),
            eq(subjects.code, code),
            eq(subjects.year, year),
            eq(subjects.semester, semester),
            eq(subjects.branch, 'Computer Science')
          )
        );
    }

    return subject;
  }

  async createSubject(subject: InsertSubject): Promise<Subject> {
    // Check if subject already exists (with fallback for undefined branch)
    const subjectBranch = subject.branch || "CSE";
    const existing = await this.findExistingSubject(
      subject.name,
      subject.code,
      subject.year,
      subject.semester,
      subjectBranch
    );

    if (existing) {
      // Return existing subject instead of creating duplicate
      return existing;
    }

    const [newSubject] = await db
      .insert(subjects)
      .values(subject)
      .returning();
    return newSubject;
  }

  async updateSubject(id: string, updateData: Partial<InsertSubject>): Promise<Subject | undefined> {
    const [updatedSubject] = await db
      .update(subjects)
      .set(updateData)
      .where(eq(subjects.id, id))
      .returning();
    return updatedSubject;
  }

  async deleteSubject(id: string): Promise<boolean> {
    try {
      console.log("Attempting to delete subject with ID:", id);
      const result = await db
        .delete(subjects)
        .where(eq(subjects.id, id));
      console.log("Delete result:", result);
      return result.changes > 0;
    } catch (error) {
      console.error("Error in deleteSubject:", error);
      throw error;
    }
  }

  async cleanupDuplicateSubjects(): Promise<{ removed: number; kept: number }> {
    try {
      // Get all subjects
      const allSubjects = await db.select().from(subjects);
      
      // Group subjects by unique key (name + code + year + semester + branch)
      const subjectGroups: { [key: string]: Subject[] } = {};
      
      allSubjects.forEach(subject => {
        const key = `${subject.name}-${subject.code}-${subject.year}-${subject.semester}-${subject.branch}`;
        if (!subjectGroups[key]) {
          subjectGroups[key] = [];
        }
        subjectGroups[key].push(subject);
      });

      let removedCount = 0;
      let keptCount = 0;

      // For each group, keep the first one and remove the rest
      for (const [key, duplicates] of Object.entries(subjectGroups)) {
        if (duplicates.length > 1) {
          // Sort by creation date (keep the oldest one)
          duplicates.sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateA - dateB;
          });
          
          const keepSubject = duplicates[0];
          const removeSubjects = duplicates.slice(1);
          
          // Move resources from duplicate subjects to the kept subject
          for (const removeSubject of removeSubjects) {
            // Update resources to point to the kept subject
            await db
              .update(resources)
              .set({ subjectId: keepSubject.id })
              .where(eq(resources.subjectId, removeSubject.id));
            
            // Delete the duplicate subject
            await db
              .delete(subjects)
              .where(eq(subjects.id, removeSubject.id));
            
            removedCount++;
          }
          
          keptCount++;
        } else {
          keptCount++;
        }
      }

      return { removed: removedCount, kept: keptCount };
    } catch (error) {
      console.error("Error cleaning up duplicate subjects:", error);
      throw error;
    }
  }

  async fixSubjectBranches(): Promise<{ changes: number }> {
    try {
      // First, run duplicate cleanup to merge similar subjects
      await this.cleanupDuplicateSubjects();
      
      // Then update branch names
      const result = await db
        .update(subjects)
        .set({ branch: 'CSE' })
        .where(eq(subjects.branch, 'Computer Science'));
      
      console.log(`Branch migration: updated ${result.changes} subjects from 'Computer Science' to 'CSE'`);
      
      // Also update MAE branch to CSE if needed (since we saw MAE in the duplicates)
      const maeResult = await db
        .update(subjects)
        .set({ branch: 'CSE' })
        .where(eq(subjects.branch, 'MAE'));
      
      console.log(`Branch migration: updated ${maeResult.changes} subjects from 'MAE' to 'CSE'`);
      
      return { changes: result.changes + maeResult.changes };
    } catch (error) {
      console.error("Error in branch migration:", error);
      throw error;
    }
  }

  async getResources(subjectId: string, resourceType?: string): Promise<Resource[]> {
    const query = db
      .select()
      .from(resources)
      .where(eq(resources.subjectId, subjectId))
      .orderBy(desc(resources.createdAt));
    
    if (resourceType) {
      return await db
        .select()
        .from(resources)
        .where(
          and(
            eq(resources.subjectId, subjectId),
            eq(resources.resourceType, resourceType)
          )
        )
        .orderBy(desc(resources.createdAt));
    }
    
    return await query;
  }

  async getResource(id: string): Promise<Resource | undefined> {
    const [resource] = await db.select().from(resources).where(eq(resources.id, id));
    return resource;
  }

  async createResource(resource: InsertResource): Promise<Resource> {
    const [newResource] = await db
      .insert(resources)
      .values(resource)
      .returning();
    return newResource;
  }

  async getUserResources(userId: string): Promise<Resource[]> {
    return await db
      .select()
      .from(resources)
      .where(eq(resources.uploadedBy, userId))
      .orderBy(desc(resources.createdAt));
  }

  async incrementDownloadCount(resourceId: string): Promise<void> {
    await db
      .update(resources)
      .set({ downloadCount: sql`download_count + 1` })
      .where(eq(resources.id, resourceId));
  }

  async deleteResource(id: string): Promise<void> {
    await db
      .delete(resources)
      .where(eq(resources.id, id));
  }

  async createDownload(download: InsertDownload): Promise<Download> {
    const [newDownload] = await db
      .insert(downloads)
      .values(download)
      .returning();
    return newDownload;
  }

  async getUserDownloads(userId: string): Promise<Download[]> {
    return await db
      .select()
      .from(downloads)
      .where(eq(downloads.userId, userId))
      .orderBy(desc(downloads.downloadedAt));
  }

  async getResourceStats(userId: string): Promise<{ uploads: number; downloads: number; totalDownloads: number }> {
    const [uploadsResult] = await db
      .select({ count: count() })
      .from(resources)
      .where(eq(resources.uploadedBy, userId));

    const [downloadsResult] = await db
      .select({ count: count() })
      .from(downloads)
      .where(eq(downloads.userId, userId));

    const [totalDownloadsResult] = await db
      .select({ 
        total: sql<number>`sum(${resources.downloadCount})`.mapWith(Number)
      })
      .from(resources)
      .where(eq(resources.uploadedBy, userId));

    return {
      uploads: uploadsResult.count,
      downloads: downloadsResult.count,
      totalDownloads: totalDownloadsResult.total || 0,
    };
  }


}

export const storage = new DatabaseStorage();

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
  getSubject(id: string): Promise<Subject | undefined>;
  createSubject(subject: InsertSubject): Promise<Subject>;
  updateSubject(id: string, updateData: Partial<InsertSubject>): Promise<Subject | undefined>;
  deleteSubject(id: string): Promise<boolean>;

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

  async getSubject(id: string): Promise<Subject | undefined> {
    const [subject] = await db.select().from(subjects).where(eq(subjects.id, id));
    return subject;
  }

  async createSubject(subject: InsertSubject): Promise<Subject> {
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

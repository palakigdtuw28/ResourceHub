import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertResourceSchema, insertSubjectSchema, insertDownloadSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";
import bcrypt from "bcryptjs";

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  dest: uploadDir,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.doc', '.docx', '.ppt', '.pptx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, DOCX, PPT, PPTX are allowed.'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint for Docker
  app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // sets up /api/register, /api/login, /api/logout, /api/user
  setupAuth(app);

  // Middleware to check authentication
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };

  // Middleware to check admin access
  const requireAdmin = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (!req.user?.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }
    next();
  };

  // Subject routes
  // Get all subjects (for admin/upload purposes)
  app.get("/api/subjects", async (req, res) => {
    try {
      const subjects = await storage.getAllSubjects();
      res.json(subjects);
    } catch (error) {
      console.error("Error fetching all subjects:", error);
      res.status(500).json({ message: "Failed to fetch subjects" });
    }
  });

  app.get("/api/subjects/:year/:semester", async (req, res) => {
    try {
      const year = parseInt(req.params.year);
      const semester = parseInt(req.params.semester);
      const branch = req.query.branch as string || "CSE";
      
      const subjects = await storage.getSubjects(year, semester, branch);
      res.json(subjects);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      res.status(500).json({ message: "Failed to fetch subjects" });
    }
  });

  app.get("/api/subject/:id", async (req, res) => {
    try {
      const subjectId = req.params.id;
      const subject = await storage.getSubject(subjectId);
      
      if (!subject) {
        return res.status(404).json({ message: "Subject not found" });
      }
      
      res.json(subject);
    } catch (error) {
      console.error("Error fetching subject:", error);
      res.status(500).json({ message: "Failed to fetch subject" });
    }
  });

  app.post("/api/subjects", requireAdmin, async (req, res) => {
    try {
      const subjectData = insertSubjectSchema.parse(req.body);
      const subject = await storage.createSubject(subjectData);
      res.status(201).json(subject);
    } catch (error) {
      console.error("Error creating subject:", error);
      res.status(400).json({ message: "Invalid subject data" });
    }
  });

  app.put("/api/subjects/:id", requireAdmin, async (req, res) => {
    try {
      const subjectId = req.params.id;
      const updateData = {
        name: req.body.name,
        code: req.body.code,
        icon: req.body.icon,
      };
      
      const subject = await storage.updateSubject(subjectId, updateData);
      if (!subject) {
        return res.status(404).json({ message: "Subject not found" });
      }
      
      res.json(subject);
    } catch (error) {
      console.error("Error updating subject:", error);
      res.status(400).json({ message: "Failed to update subject" });
    }
  });

  app.delete("/api/subjects/:id", requireAdmin, async (req, res) => {
    try {
      const subjectId = req.params.id;
      console.log(`[DELETE SUBJECT] Starting deletion for subject ID: ${subjectId}`);
      
      // First check if subject exists
      const subject = await storage.getSubject(subjectId);
      console.log(`[DELETE SUBJECT] Subject found:`, subject ? 'YES' : 'NO');
      
      if (!subject) {
        console.log(`[DELETE SUBJECT] Subject not found: ${subjectId}`);
        return res.status(404).json({ message: "Subject not found" });
      }
      
      // Check if subject has any resources
      console.log(`[DELETE SUBJECT] Checking resources for subject: ${subjectId}`);
      const resources = await storage.getResources(subjectId);
      console.log(`[DELETE SUBJECT] Resources found: ${resources.length}`);
      
      if (resources.length > 0) {
        console.log(`[DELETE SUBJECT] Subject has ${resources.length} resources, cannot delete`);
        return res.status(400).json({ 
          message: `Cannot delete subject with existing resources (${resources.length} resources found). Please delete all resources first.` 
        });
      }
      
      console.log(`[DELETE SUBJECT] Proceeding with deletion of subject: ${subjectId}`);
      const deleted = await storage.deleteSubject(subjectId);
      console.log(`[DELETE SUBJECT] Deletion result:`, deleted);
      
      if (!deleted) {
        console.log(`[DELETE SUBJECT] Failed to delete subject: ${subjectId}`);
        return res.status(500).json({ message: "Failed to delete subject" });
      }
      
      console.log(`[DELETE SUBJECT] Successfully deleted subject: ${subjectId}`);
      res.json({ message: "Subject deleted successfully" });
    } catch (error) {
      console.error("[DELETE SUBJECT] Error deleting subject:", error);
      console.error("[DELETE SUBJECT] Error stack:", error instanceof Error ? error.stack : "No stack trace");
      res.status(500).json({ 
        message: "Failed to delete subject",
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  // Resource routes
  app.get("/api/resources/:subjectId", async (req, res) => {
    try {
      const subjectId = req.params.subjectId;
      const resourceType = req.query.type as string;
      
      const resources = await storage.getResources(subjectId, resourceType);
      res.json(resources);
    } catch (error) {
      console.error("Error fetching resources:", error);
      res.status(500).json({ message: "Failed to fetch resources" });
    }
  });

  app.post("/api/resources", requireAdmin, upload.single('file'), async (req, res) => {
    try {
      console.log("Upload request received:", {
        hasFile: !!req.file,
        fileSize: req.file?.size,
        fileName: req.file?.originalname,
        body: req.body
      });

      if (!req.file) {
        console.error("No file uploaded in request");
        return res.status(400).json({ message: "No file uploaded" });
      }

      const resourceData = {
        title: req.body.title,
        description: req.body.description,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        fileType: path.extname(req.file.originalname).toLowerCase(),
        resourceType: req.body.resourceType,
        subjectId: req.body.subjectId,
        uploadedBy: (req.user as any).id,
      };

      console.log("Resource data to validate:", resourceData);
      
      const validatedData = insertResourceSchema.parse(resourceData);
      console.log("Validation successful, creating resource...");
      
      const resource = await storage.createResource(validatedData);
      console.log("Resource created:", resource.id);
      
      // Rename file to resource ID for better organization
      const newFileName = `${resource.id}${path.extname(req.file.originalname)}`;
      const newPath = path.join(uploadDir, newFileName);
      
      console.log("Renaming file from", req.file.path, "to", newPath);
      fs.renameSync(req.file.path, newPath);

      console.log("Upload completed successfully");
      res.status(201).json(resource);
    } catch (error) {
      console.error("Error uploading resource:", error);
      console.error("Error stack:", error instanceof Error ? error.stack : 'Unknown error');
      res.status(500).json({ 
        message: "Failed to upload resource", 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  app.get("/api/resources/user/:userId", requireAuth, async (req, res) => {
    try {
      const userId = req.params.userId;
      if ((req.user as any).id !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const resources = await storage.getUserResources(userId);
      res.json(resources);
    } catch (error) {
      console.error("Error fetching user resources:", error);
      res.status(500).json({ message: "Failed to fetch user resources" });
    }
  });

  app.delete("/api/resources/:resourceId", requireAuth, async (req, res) => {
    try {
      const resourceId = req.params.resourceId;
      
      // Get the resource to check ownership
      const resource = await storage.getResource(resourceId);
      if (!resource) {
        return res.status(404).json({ message: "Resource not found" });
      }
      
      // Only allow the resource owner or admin to delete
      const user = req.user as any;
      if (resource.uploadedBy !== user.id && !user.isAdmin) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      // Delete the physical file
      const fileName = (resource as any).fileName || (resource as any).file_name;
      if (fileName) {
        const filePath = path.join(uploadDir, fileName);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      
      // Delete from database
      await storage.deleteResource(resourceId);
      
      res.json({ message: "Resource deleted successfully" });
    } catch (error) {
      console.error("Error deleting resource:", error);
      res.status(500).json({ message: "Failed to delete resource" });
    }
  });

  // Download routes
  app.post("/api/downloads", requireAuth, async (req, res) => {
    try {
      const downloadData = {
        userId: (req.user as any).id,
        resourceId: req.body.resourceId,
      };

      const validatedData = insertDownloadSchema.parse(downloadData);
      const download = await storage.createDownload(validatedData);
      await storage.incrementDownloadCount(req.body.resourceId);
      
      res.status(201).json(download);
    } catch (error) {
      console.error("Error recording download:", error);
      res.status(400).json({ message: "Failed to record download" });
    }
  });

  app.get("/api/download/:resourceId", requireAuth, async (req, res) => {
    try {
      const resourceId = req.params.resourceId;
      const resource = await storage.getResource(resourceId);
      
      if (!resource) {
        return res.status(404).json({ message: "Resource not found" });
      }

      const filePath = path.join(uploadDir, `${resourceId}${resource.fileType}`);
      
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: "File not found" });
      }

      // Record the download
      await storage.createDownload({
        userId: (req.user as any).id,
        resourceId: resourceId,
      });
      await storage.incrementDownloadCount(resourceId);

      res.download(filePath, resource.fileName);
    } catch (error) {
      console.error("Error downloading file:", error);
      res.status(500).json({ message: "Failed to download file" });
    }
  });

  // Stats routes
  app.get("/api/stats/:userId", requireAuth, async (req, res) => {
    try {
      const userId = req.params.userId;
      if ((req.user as any).id !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const stats = await storage.getResourceStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Profile update route
  app.put("/api/user/:userId", requireAuth, async (req, res) => {
    try {
      const userId = req.params.userId;
      if ((req.user as any).id !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const { fullName, year, branch } = req.body;
      const updatedUser = await storage.updateUser(userId, { fullName, year, branch });
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Password change route
  app.put("/api/user/:userId/password", requireAuth, async (req, res) => {
    try {
      const userId = req.params.userId;
      if ((req.user as any).id !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Current password and new password are required" });
      }

      // Verify current password
      const user = await storage.getUserById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }

      // Hash new password and update
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      await storage.updateUserPassword(userId, hashedNewPassword);
      
      res.json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Error updating password:", error);
      res.status(500).json({ message: "Failed to update password" });
    }
  });

  // Error handling middleware for multer and other errors
  app.use((error: any, req: any, res: any, next: any) => {
    if (error instanceof multer.MulterError) {
      console.error("Multer error:", error);
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ 
          message: "File too large. Maximum size allowed is 100MB." 
        });
      }
      return res.status(400).json({ 
        message: `Upload error: ${error.message}` 
      });
    }
    
    console.error("Unhandled error:", error);
    res.status(500).json({ 
      message: "Internal server error" 
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}

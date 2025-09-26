import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertResourceSchema, insertSubjectSchema, insertDownloadSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  dest: uploadDir,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
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
  // sets up /api/register, /api/login, /api/logout, /api/user
  setupAuth(app);

  // Middleware to check authentication
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };

  // Subject routes
  app.get("/api/subjects/:year/:semester", async (req, res) => {
    try {
      const year = parseInt(req.params.year);
      const semester = parseInt(req.params.semester);
      const branch = req.query.branch as string || "Computer Science";
      
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

  app.post("/api/subjects", requireAuth, async (req, res) => {
    try {
      const subjectData = insertSubjectSchema.parse(req.body);
      const subject = await storage.createSubject(subjectData);
      res.status(201).json(subject);
    } catch (error) {
      console.error("Error creating subject:", error);
      res.status(400).json({ message: "Invalid subject data" });
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

  app.post("/api/resources", requireAuth, upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
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

      const validatedData = insertResourceSchema.parse(resourceData);
      const resource = await storage.createResource(validatedData);
      
      // Rename file to resource ID for better organization
      const newFileName = `${resource.id}${path.extname(req.file.originalname)}`;
      const newPath = path.join(uploadDir, newFileName);
      fs.renameSync(req.file.path, newPath);

      res.status(201).json(resource);
    } catch (error) {
      console.error("Error uploading resource:", error);
      res.status(400).json({ message: "Failed to upload resource" });
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

  const httpServer = createServer(app);
  return httpServer;
}

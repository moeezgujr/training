import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./simple-auth";
import { requireInstructor, requireAdmin, preventRoleEscalation } from "./auth-middleware";
import { emailService } from "./email-service";
import { CourseDto, moduleSchema, courseSchema, enrollmentSchema, moduleContentSchema, quizSchema, assignmentSchema, certificateSchema } from "@shared/schema";
import { ZodError } from "zod";
import { env } from "@shared/env";

import { seedDatabase } from "./seed-data";
import multer from "multer";
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { DurationCalculator } from './duration-calculator';

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
  },
  fileFilter: (req, file, cb) => {
    // Accept common document formats
    const allowedMimeTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/zip',
      'application/x-zip-compressed'
    ];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not supported. Please upload PDF, DOC, DOCX, TXT, or ZIP files.'));
    }
  }
});

// Configure multer for image uploads
const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size for images
  },
  fileFilter: (req, file, cb) => {
    // Accept image formats
    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp'
    ];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not supported. Please upload JPG, PNG, GIF, or WebP images.'));
    }
  }
});

// Configure multer for audio uploads
const audioUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max file size for audio
  },
  fileFilter: (req, file, cb) => {
    // Accept audio formats
    const allowedMimeTypes = [
      'audio/mp3',
      'audio/mpeg',
      'audio/wav',
      'audio/ogg',
      'audio/m4a',
      'audio/aac'
    ];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not supported. Please upload MP3, WAV, OGG, M4A, or AAC audio files.'));
    }
  }
});

// Configure multer for video uploads
const videoUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max file size for videos
  },
  fileFilter: (req, file, cb) => {
    // Accept video formats
    const allowedMimeTypes = [
      'video/mp4',
      'video/avi',
      'video/mov',
      'video/wmv',
      'video/flv',
      'video/webm'
    ];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not supported. Please upload MP4, AVI, MOV, WMV, FLV, or WebM video files.'));
    }
  }
});

// Configure multer for document uploads
const documentUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max file size for documents
  },
  fileFilter: (req, file, cb) => {
    // Accept document formats
    const allowedMimeTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not supported. Please upload PDF, DOC, or DOCX files.'), false);
    }
  }
});

// Configure unified multer for all media content (videos, audio, documents, PDFs)
const mediaContentUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max file size
  },
  fileFilter: (req, file, cb) => {
    // Accept video, audio, and document formats with real browser MIME types
    const allowedMimeTypes = [
      // Videos (with browser-reported MIME types)
      'video/mp4', 'video/x-m4v', 'video/quicktime', // MP4, M4V, MOV
      'video/x-msvideo', 'video/avi', // AVI
      'video/x-ms-wmv', 'video/x-ms-asf', // WMV
      'video/x-flv', // FLV
      'video/webm', // WebM
      // Audio (with browser-reported MIME types)
      'audio/mp3', 'audio/mpeg', 'audio/mp4', // MP3, MPEG, MP4 audio
      'audio/x-m4a', 'audio/m4a', 'audio/aac', // M4A, AAC
      'audio/wav', 'audio/x-wav', // WAV
      'audio/ogg', 'audio/vorbis', // OGG
      // Documents
      'application/pdf', // PDF
      'application/msword', // DOC
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // DOCX
    ];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type "${file.mimetype}" not supported. Please upload video, audio, or document files.`));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Object Storage - serve audio/video files from object storage
  // Referenced from javascript_object_storage integration blueprint
  const { ObjectStorageService, ObjectNotFoundError } = await import("./objectStorage");
  
  app.get("/objects/:objectPath(*)", async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error serving object:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });
  
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      // Check if user session exists
      if (!req.session || !(req.session as any).user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const userId = (req.session as any).user.id;
      const user = await storage.getUser(userId);
      
      // If user not found in database, clear the session
      if (!user) {
        req.session.destroy((err) => {
          if (err) console.error("Error destroying session:", err);
        });
        return res.status(401).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Student Registration endpoint
  app.post('/api/auth/register', async (req, res) => {
    try {
      const {
        firstName,
        lastName,
        email,
        password,
        gender,
        country,
        city,
        phoneNumber,
        emergencyContact,
        emergencyPhone,
        educationLevel,
        fieldOfStudy,
        learningGoals,
        hearAboutUs,
        marketingEmails,
        role = "learner"
      } = req.body;

      // Validate required fields
      if (!firstName || !lastName || !email || !password || !gender || !country || !city) {
        return res.status(400).json({ 
          message: "Missing required fields: firstName, lastName, email, password, gender, country, city" 
        });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ message: "User with this email already exists" });
      }

      // Hash the password securely
      const bcrypt = await import("bcrypt");
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Create user profile with extended student information
      const userData = {
        id: `student_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        email,
        firstName,
        lastName,
        role,
        passwordHash,
        profileImageUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName + ' ' + lastName)}&background=3b82f6&color=fff`,
        dateOfBirth: null,
        gender,
        country,
        city,
        phoneNumber: phoneNumber || null,
        emergencyContact: emergencyContact || null,
        emergencyPhone: emergencyPhone || null,
        educationLevel,
        fieldOfStudy: fieldOfStudy || null,
        learningGoals,
        hearAboutUs,
        marketingEmails: marketingEmails || false,
        registrationDate: new Date(),
        emailVerified: false,
        isActive: true,
        lastLoginAt: null
      };

      // Create the user
      const newUser = await storage.createExtendedUser(userData);

      // Send welcome email
      try {
        await emailService.sendWelcomeEmail(email, firstName);
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
        // Don't fail registration if email fails
      }

      // Send registration notification to admin
      try {
        await emailService.sendRegistrationNotification({
          studentName: `${firstName} ${lastName}`,
          studentEmail: email,
          registrationDate: new Date().toLocaleDateString(),
          phone: phoneNumber || undefined,
          city: city || undefined,
          educationLevel: educationLevel || undefined,
          fieldOfStudy: fieldOfStudy || undefined,
          interests: learningGoals || undefined,
          goals: hearAboutUs || undefined
        });
      } catch (notificationError) {
        console.error('Failed to send registration notification:', notificationError);
        // Don't fail registration if notification email fails
      }

      // Return success response (don't include sensitive data)
      res.status(201).json({
        message: "Registration successful",
        user: {
          id: newUser.id,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          role: newUser.role
        }
      });

    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: "Registration failed. Please try again." });
    }
  });

  // Image upload route with automatic resizing and optimization
  app.post('/api/upload/image', isAuthenticated, imageUpload.single('image'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No image file provided' });
      }

      // Define standard course thumbnail dimensions (16:9 aspect ratio)
      const THUMBNAIL_WIDTH = 1200;
      const THUMBNAIL_HEIGHT = 675;
      
      // Process and optimize the image using Sharp
      const processedImageBuffer = await sharp(req.file.buffer)
        .resize(THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT, {
          fit: 'cover', // Crop to fill the dimensions while maintaining aspect ratio
          position: 'center' // Center the crop area
        })
        .jpeg({
          quality: 85, // High quality while keeping file size reasonable
          progressive: true, // Enable progressive JPEG for better loading
          mozjpeg: true // Use mozjpeg encoder for better compression
        })
        .toBuffer();

      // Convert optimized buffer to base64 data URL
      const base64 = processedImageBuffer.toString('base64');
      const dataUrl = `data:image/jpeg;base64,${base64}`;

      res.json({ 
        url: dataUrl,
        filename: req.file.originalname,
        size: processedImageBuffer.length,
        mimeType: 'image/jpeg',
        dimensions: {
          width: THUMBNAIL_WIDTH,
          height: THUMBNAIL_HEIGHT
        },
        optimized: true
      });
    } catch (error) {
      console.error('Image upload error:', error);
      res.status(500).json({ message: 'Failed to upload and process image' });
    }
  });

  // Audio upload endpoint - now using object storage for published version compatibility
  app.post('/api/upload/audio', audioUpload.single('audio'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No audio file uploaded' });
      }

      const { ObjectStorageService } = await import("./objectStorage");
      const objectStorageService = new ObjectStorageService();
      
      // Upload to object storage
      const extension = path.extname(req.file.originalname);
      const filename = `${Date.now()}${extension}`;
      const audioUrl = await objectStorageService.uploadFileToStorage(
        req.file.buffer,
        filename,
        req.file.mimetype
      );
      
      // Calculate duration using a temp file
      let durationResult;
      try {
        const tempDir = path.join(process.cwd(), 'temp');
        if (!fs.existsSync(tempDir)) {
          fs.mkdirSync(tempDir, { recursive: true });
        }
        const tempFilepath = path.join(tempDir, filename);
        fs.writeFileSync(tempFilepath, req.file.buffer);
        durationResult = await DurationCalculator.calculateAudioDuration(tempFilepath);
        fs.unlinkSync(tempFilepath);
      } catch (error) {
        console.error('Duration calculation failed:', error);
        durationResult = {
          duration: 5,
          type: 'audio' as const,
          method: 'estimated' as const
        };
      }
      
      res.json({ 
        message: 'Audio uploaded successfully',
        url: audioUrl,
        filename: filename,
        duration: durationResult.duration,
        durationMethod: durationResult.method
      });
    } catch (error) {
      console.error('Audio upload error:', error);
      res.status(500).json({ message: 'Failed to upload audio' });
    }
  });

  // Video upload endpoint
  app.post('/api/upload/video', videoUpload.single('video'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No video file uploaded' });
      }
      
      // Create uploads directory if it doesn't exist
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'videos');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      
      // Generate unique filename
      const timestamp = Date.now();
      const extension = path.extname(req.file.originalname);
      const filename = `video_${timestamp}${extension}`;
      const filepath = path.join(uploadsDir, filename);
      
      // Save file
      fs.writeFileSync(filepath, req.file.buffer);
      
      // Calculate duration
      let durationResult;
      try {
        durationResult = await DurationCalculator.calculateVideoDuration(filepath);
      } catch (error) {
        console.error('Duration calculation failed:', error);
        durationResult = {
          duration: 10, // fallback
          type: 'video' as const,
          method: 'estimated' as const
        };
      }
      
      // Return the URL
      const videoUrl = `/uploads/videos/${filename}`;
      
      res.json({ 
        message: 'Video uploaded successfully',
        url: videoUrl,
        filename: filename,
        duration: durationResult.duration,
        durationMethod: durationResult.method
      });
    } catch (error) {
      console.error('Video upload error:', error);
      res.status(500).json({ message: 'Failed to upload video' });
    }
  });

  // Document upload endpoint
  app.post('/api/upload/document', documentUpload.single('document'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No document file uploaded' });
      }
      
      // Create uploads directory if it doesn't exist
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'documents');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      
      // Generate unique filename
      const timestamp = Date.now();
      const extension = path.extname(req.file.originalname);
      const filename = `document_${timestamp}${extension}`;
      const filepath = path.join(uploadsDir, filename);
      
      // Save file
      fs.writeFileSync(filepath, req.file.buffer);
      
      // Calculate duration for PDF files
      let durationResult;
      try {
        if (extension.toLowerCase() === '.pdf') {
          durationResult = await DurationCalculator.calculatePdfDuration(filepath);
        } else {
          // For other document types, use a basic estimation
          durationResult = {
            duration: 5, // basic fallback for non-PDF documents
            type: 'pdf' as const,
            method: 'estimated' as const
          };
        }
      } catch (error) {
        console.error('Duration calculation failed:', error);
        durationResult = {
          duration: 5, // fallback
          type: 'pdf' as const,
          method: 'estimated' as const
        };
      }
      
      // Return the URL
      const documentUrl = `/uploads/documents/${filename}`;
      
      res.json({ 
        message: 'Document uploaded successfully',
        url: documentUrl,
        filename: filename,
        duration: durationResult.duration,
        durationMethod: durationResult.method
      });
    } catch (error) {
      console.error('Document upload error:', error);
      res.status(500).json({ message: 'Failed to upload document' });
    }
  });
  
  // User routes
  app.patch('/api/users/:id/role', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.params.id;
      const { role } = req.body;
      
      // Validate role
      if (!['learner', 'instructor', 'admin'].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }
      
      // Check if user is updating their own role (for development purposes only)
      const currentUserId = (req.session as any).user.id;
      if (userId !== currentUserId) {
        return res.status(403).json({ message: "You can only update your own role" });
      }
      
      // Update user role
      await storage.updateUserRole(userId, role);
      
      // Get updated user
      const updatedUser = await storage.getUser(userId);
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update user role" });
    }
  });
  
  // Seed database (admin only)
  app.post('/api/seed-database', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).user.id;
      const user = await storage.getUser(userId);
      
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Unauthorized: Admin access required" });
      }
      
      const success = await seedDatabase(userId);
      
      if (success) {
        res.status(200).json({ message: "Database seeded successfully" });
      } else {
        res.status(500).json({ message: "Failed to seed database" });
      }
    } catch (error) {
      console.error("Error seeding database:", error);
      res.status(500).json({ message: "Failed to seed database" });
    }
  });
  
  // Seed anxiety and depression course (accessible without auth for demo purposes)
  app.post('/api/seed-anxiety-course', async (req, res) => {
    try {
      const { v4: uuidv4 } = await import('uuid');
      
      // Course data
      const courseId = uuidv4();
      const instructorId = req.body.instructorId || "42726954"; // Use provided ID or fallback
      
      // Create course
      const courseData = {
        id: courseId,
        title: "Understanding Anxiety and Depression: Strategies for Well-being",
        description: "This comprehensive course explores anxiety and depression, providing evidence-based tools and strategies for understanding, managing, and treating these common mental health conditions.",
        imageUrl: "https://images.unsplash.com/photo-1517021897933-0e0319cfbc28?q=80&w=2070&auto=format&fit=crop",
        instructorId: instructorId,
        status: "published",
        duration: 20,
        tags: ["Mental Health", "Psychology", "Self-Care", "Wellness", "Therapy"],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      console.log("Creating course with ID:", courseId);
      const course = await storage.createCourse(courseData);
      console.log("Course created successfully:", course.id);
      
      // Create modules
      const module1Id = uuidv4();
      const module1 = await storage.createModule({
        id: module1Id,
        courseId: courseId,
        title: "Understanding Anxiety and Depression",
        description: "This module introduces the fundamental concepts of anxiety and depression, exploring their definitions, prevalence, and impact on daily life.",
        order: 1
      });
      
      const module2Id = uuidv4();
      const module2 = await storage.createModule({
        id: module2Id,
        courseId: courseId,
        title: "The Science Behind Mental Health",
        description: "Explore the biological and psychological factors that contribute to anxiety and depression.",
        order: 2
      });
      
      const module3Id = uuidv4();
      const module3 = await storage.createModule({
        id: module3Id,
        courseId: courseId,
        title: "Treatment Approaches and Therapies",
        description: "Learn about evidence-based treatments for anxiety and depression, including psychotherapy approaches, medication options, and holistic interventions.",
        order: 3
      });
      
      // Create content for module 1
      await storage.createModuleContent({
        id: uuidv4(),
        moduleId: module1Id,
        title: "What are Anxiety and Depression?",
        type: "video",
        url: "https://www.youtube.com/embed/tEmt1Znux58",
        description: "This video provides an introduction to anxiety and depression, explaining key symptoms, prevalence rates, and how these conditions affect individuals worldwide.",
        order: 1,
        duration: 15
      });
      
      await storage.createModuleContent({
        id: uuidv4(),
        moduleId: module1Id,
        title: "Common Symptoms and Diagnosis",
        type: "pdf",
        url: "https://www.nimh.nih.gov/sites/default/files/documents/health/publications/depression/21-mh-8079-depressionbasics_0.pdf",
        description: "This reading explores the diagnostic criteria for anxiety and depression, examining how clinicians identify and differentiate these conditions from other mental health challenges.",
        order: 2,
        duration: 20
      });
      
      // Create quiz for module 1
      const quiz1Id = uuidv4();
      const quiz1 = await storage.createQuiz({
        id: quiz1Id,
        moduleId: module1Id,
        title: "Understanding Anxiety and Depression Quiz",
        description: "Test your knowledge of the fundamental concepts of anxiety and depression covered in this module.",
        passingScore: 70
      });
      
      // Create quiz questions
      await storage.createQuiz({
        id: uuidv4(),
        quizId: quiz1Id,
        questionText: "Which of the following is NOT typically a symptom of depression?",
        questionType: "multiple_choice",
        options: [
          "Persistent feelings of sadness",
          "Loss of interest in activities",
          "Euphoria and increased energy",
          "Changes in sleep patterns"
        ],
        correctAnswer: "Euphoria and increased energy",
        explanation: "Depression is characterized by persistent sadness, loss of interest, and often decreased energy - not euphoria or increased energy, which are more associated with mania.",
        points: 25
      });
      
      await storage.createQuiz({
        id: uuidv4(),
        quizId: quiz1Id,
        questionText: "Anxiety disorders are the most common mental health conditions worldwide.",
        questionType: "true_false",
        correctAnswer: "true",
        explanation: "Anxiety disorders are indeed the most common mental health conditions globally, affecting approximately 284 million people.",
        points: 25
      });
      
      // Create content for module 2
      await storage.createModuleContent({
        id: uuidv4(),
        moduleId: module2Id,
        title: "The Neurobiology of Anxiety and Depression",
        type: "video",
        url: "https://www.youtube.com/embed/ySgv_Nj7gsA",
        description: "This video explores the brain structures and neurotransmitter systems involved in anxiety and depression.",
        order: 1,
        duration: 18
      });
      
      await storage.createModuleContent({
        id: uuidv4(),
        moduleId: module2Id,
        title: "Genetic and Environmental Factors",
        type: "pdf",
        url: "https://www.nimh.nih.gov/sites/default/files/documents/health/publications/looking-at-my-genes/20-mh-4316-looking-at-my-genes.pdf",
        description: "This reading examines the role of genetics and environmental factors in the development of anxiety and depression.",
        order: 2,
        duration: 22
      });
      
      // Create content for module 3
      await storage.createModuleContent({
        id: uuidv4(),
        moduleId: module3Id,
        title: "Evidence-Based Psychotherapies",
        type: "video",
        url: "https://www.youtube.com/embed/ZFsHcYYkO9g",
        description: "This video explores different psychotherapy approaches for anxiety and depression.",
        order: 1,
        duration: 22
      });
      
      await storage.createModuleContent({
        id: uuidv4(),
        moduleId: module3Id,
        title: "Medication Options and Considerations",
        type: "pdf",
        url: "https://www.nimh.nih.gov/sites/default/files/documents/health/publications/mental-health-medications/22-mh-8090-mentalhealthmeds_0.pdf",
        description: "This reading provides an overview of medications commonly used to treat anxiety and depression.",
        order: 2,
        duration: 18
      });
      
      // Create assignment for module 3
      await storage.createAssignment({
        id: uuidv4(),
        moduleId: module3Id,
        title: "Treatment Approaches Comparison",
        description: "Create a comparison chart of at least three different treatment approaches for either anxiety or depression.",
        submissionType: "text",
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days from now
      });
      
      res.status(200).json({ 
        success: true, 
        message: "Anxiety and Depression course created successfully",
        courseId: courseId
      });
    } catch (error) {
      console.error("Error creating anxiety and depression course:", error);
      res.status(500).json({ message: "Failed to create anxiety and depression course" });
    }
  });

  // === QUIZ ROUTES ===
  app.post('/api/quizzes/:quizId/submit', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).user.id;
      const { quizId } = req.params;
      const { answers } = req.body;

      if (!answers || typeof answers !== 'object') {
        return res.status(400).json({ message: "Invalid answers format" });
      }

      const result = await storage.submitQuiz(userId, quizId, answers);
      res.status(200).json(result);
    } catch (error) {
      console.error("Error submitting quiz:", error);
      res.status(500).json({ message: "Failed to submit quiz" });
    }
  });
  
  // === ASSIGNMENT ROUTES ===
  app.post('/api/assignments/:assignmentId/submit', isAuthenticated, (req: any, res) => {
    // Use multer for file uploads based on the assignment submission type
    const handleUpload = upload.single('submissionFile');
    
    handleUpload(req, res, async (err) => {
      if (err) {
        console.error("File upload error:", err);
        return res.status(400).json({ message: err.message });
      }
      
      try {
        const userId = (req.session as any).user.id;
        const { assignmentId } = req.params;
        
        // Handle text submission
        if (req.body.submissionText) {
          const result = await storage.submitAssignment(userId, assignmentId, {
            type: 'text',
            content: req.body.submissionText
          });
          return res.status(200).json(result);
        }
        
        // Handle file submission
        if (req.file) {
          const result = await storage.submitAssignment(userId, assignmentId, {
            type: 'file',
            content: req.file.buffer,
            filename: req.file.originalname,
            mimeType: req.file.mimetype
          });
          return res.status(200).json(result);
        }
        
        return res.status(400).json({ message: "No submission content provided" });
      } catch (error) {
        console.error("Error submitting assignment:", error);
        res.status(500).json({ message: "Failed to submit assignment" });
      }
    });
  });
  
  // Grade assignment (instructor only)
  app.post('/api/submissions/:submissionId/grade', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).user.id;
      const { submissionId } = req.params;
      const { grade, feedback } = req.body;
      
      // Validate user is instructor
      const user = await storage.getUser(userId);
      if (user?.role !== 'instructor' && user?.role !== 'admin') {
        return res.status(403).json({ message: "Only instructors can grade assignments" });
      }
      
      if (typeof grade !== 'number' || grade < 0 || grade > 100) {
        return res.status(400).json({ message: "Grade must be a number between 0 and 100" });
      }
      
      await storage.gradeAssignment(submissionId, grade, feedback || '');
      res.status(200).json({ message: "Assignment graded successfully" });
    } catch (error) {
      console.error("Error grading assignment:", error);
      res.status(500).json({ message: "Failed to grade assignment" });
    }
  });

  // === COURSES ROUTES ===
  
  // Get all courses (public)
  app.get('/api/courses', async (req, res) => {
    try {
      const courses = await storage.getAllCourses();
      res.json(courses || []);
    } catch (error) {
      console.error("Error fetching courses:", error);
      res.status(500).json({ message: "Failed to fetch courses" });
    }
  });

  // Get user's enrolled courses
  app.get('/api/courses/enrolled', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).user.id;
      const enrolledCourses = await storage.getEnrolledCourses(userId);
      res.json(enrolledCourses);
    } catch (error) {
      console.error("Error fetching enrolled courses:", error);
      res.status(500).json({ message: "Failed to fetch enrolled courses" });
    }
  });

  // Get recommended courses for user
  app.get('/api/courses/recommended', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).user.id;
      const recommendedCourses = await storage.getRecommendedCourses(userId);
      res.json(recommendedCourses);
    } catch (error) {
      console.error("Error fetching recommended courses:", error);
      res.status(500).json({ message: "Failed to fetch recommended courses" });
    }
  });

  // Get course by id
  app.get('/api/courses/:id', async (req, res) => {
    try {
      const courseId = req.params.id;
      const userId = req.session && (req.session as any).user ? (req.session as any).user.id : null;
      
      const course = await storage.getCourseById(courseId, userId);
      
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      res.json(course);
    } catch (error) {
      console.error("Error fetching course:", error);
      res.status(500).json({ message: "Failed to fetch course" });
    }
  });

  // Enroll in a course
  app.post('/api/courses/:id/enroll', isAuthenticated, async (req: any, res) => {
    try {
      const courseId = req.params.id;
      const userId = req.session.user.id;
      
      const enrollmentData = {
        userId,
        courseId,
        status: 'in_progress',
        progress: 0,
        currentModuleId: null,
        completedModules: 0
      };
      
      // Validate with zod
      try {
        enrollmentSchema.parse(enrollmentData);
      } catch (err) {
        if (err instanceof ZodError) {
          const validationError = err.message;
          return res.status(400).json({ message: validationError.message });
        }
        throw err;
      }
      
      const enrollment = await storage.enrollInCourse(enrollmentData);
      
      // Send notification to admin about enrollment
      try {
        const user = await storage.getUser(userId);
        const course = await storage.getCourseById(courseId);
        if (user && course) {
          const { notifyCourseEnrollment } = await import('./notification-service');
          await notifyCourseEnrollment(
            user.email!,
            course.title,
            user.firstName || user.email!
          );
        }
      } catch (notificationError) {
        console.error('Failed to send enrollment notification:', notificationError);
      }
      
      res.status(201).json(enrollment);
    } catch (error) {
      console.error("Error enrolling in course:", error);
      res.status(500).json({ message: "Failed to enroll in course" });
    }
  });

  // Bulk enroll in multiple courses from cart
  app.post('/api/courses/enroll-bulk', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.user.id;
      const { courseIds } = req.body;
      
      if (!courseIds || !Array.isArray(courseIds) || courseIds.length === 0) {
        return res.status(400).json({ message: "Course IDs are required" });
      }
      
      const enrollments = [];
      const errors = [];
      
      for (const courseId of courseIds) {
        try {
          const enrollmentData = {
            userId,
            courseId,
            status: 'in_progress',
            progress: 0,
            currentModuleId: null,
            completedModules: 0
          };
          
          const enrollment = await storage.enrollInCourse(enrollmentData);
          enrollments.push(enrollment);
          
          // Send notification for each enrollment
          try {
            const user = await storage.getUser(userId);
            const course = await storage.getCourseById(courseId);
            if (user && course) {
              const { notifyCourseEnrollment } = await import('./notification-service');
              await notifyCourseEnrollment(
                user.email!,
                course.title,
                user.firstName || user.email!
              );
            }
          } catch (notificationError) {
            console.error('Failed to send enrollment notification:', notificationError);
          }
        } catch (error: any) {
          errors.push({ courseId, error: error.message });
        }
      }
      
      res.status(201).json({ 
        enrollments, 
        errors,
        message: `Successfully enrolled in ${enrollments.length} course(s)`
      });
    } catch (error) {
      console.error("Error in bulk enrollment:", error);
      res.status(500).json({ message: "Failed to enroll in courses" });
    }
  });

  // === MODULE ROUTES ===

  // Save course structure (modules and lessons)
  app.post('/api/instructor/courses/:courseId/modules', isAuthenticated, requireInstructor, async (req: any, res) => {
    try {
      console.log("=== COURSE SAVING DEBUG START ===");
      const courseId = req.params.courseId;
      const user = req.user as any;
      const userId = user?.claims?.sub || user?.id;
      const { modules } = req.body;
      
      console.log("Course ID:", courseId);
      console.log("User:", user);
      console.log("User ID:", userId);
      console.log("Modules received:", JSON.stringify(modules, null, 2));
      
      if (!userId) {
        console.log("Authentication failed - no user ID");
        return res.status(401).json({ message: "User authentication failed" });
      }
      
      // Verify the course belongs to the instructor
      console.log("Fetching course with ID:", courseId);
      const course = await storage.getCourseById(courseId);
      console.log("Course found:", course);
      
      if (!course || course.instructorId !== userId) {
        console.log("Access denied - course not found or wrong instructor");
        console.log("Course instructor ID:", course?.instructorId, "User ID:", userId);
        return res.status(403).json({ message: "Access denied" });
      }
      
      console.log("Starting to save modules...");
      
      // Save modules and their lessons
      for (const moduleData of modules) {
        let moduleId = moduleData.id;
        console.log("Processing module:", moduleData.title, "ID:", moduleData.id);
        
        // Create new module if it has a temporary ID
        if (moduleData.id.startsWith('temp-module-')) {
          console.log("Creating new module:", moduleData.title);
          const newModule = await storage.createModule({
            title: moduleData.title,
            description: moduleData.description || '',
            courseId: courseId,
            order: moduleData.order || 0
          });
          moduleId = newModule.id;
          console.log("New module created with ID:", moduleId);
        } else {
          // Update existing module
          console.log("Updating existing module:", moduleId);
          await storage.updateModule(moduleId, {
            title: moduleData.title,
            description: moduleData.description || '',
            order: moduleData.order || 0
          });
          console.log("Module updated");
        }
        
        // Save lessons for this module
        if (moduleData.lessons && Array.isArray(moduleData.lessons)) {
          console.log("Processing", moduleData.lessons.length, "lessons for module", moduleId);
          for (const lessonData of moduleData.lessons) {
            console.log("Processing lesson:", lessonData.title, "ID:", lessonData.id);
            if (lessonData.id && lessonData.id.startsWith('temp-lesson-')) {
              console.log("Creating new lesson:", lessonData.title);
              const contentData = {
                moduleId: moduleId,
                title: lessonData.title || '',
                type: lessonData.type || 'audio',
                url: lessonData.url || '',
                description: lessonData.description || '',
                order: lessonData.order || 0,
                duration: lessonData.duration || null
              };
              console.log("Lesson data:", contentData);
              
              const newContent = await storage.createModuleContent(contentData);
              console.log("Lesson created with ID:", newContent.id);
            }
          }
        }
      }
      
      console.log("=== COURSE SAVING SUCCESS ===");
      res.status(200).json({ message: "Course structure saved successfully" });
    } catch (error: any) {
      console.error("=== COURSE SAVING ERROR ===");
      console.error("Error saving course structure:", error);
      console.error("Stack trace:", error.stack);
      res.status(500).json({ 
        message: "Failed to save course structure",
        error: error.message 
      });
    }
  });

  // Mark module content as completed
  app.post('/api/modules/content/:id/complete', isAuthenticated, async (req: any, res) => {
    try {
      const contentId = req.params.id;
      const userId = (req.session as any).user.id;
      
      await storage.markContentComplete(userId, contentId);
      res.status(200).json({ message: "Content marked as complete" });
    } catch (error) {
      console.error("Error marking content as complete:", error);
      res.status(500).json({ message: "Failed to mark content as complete" });
    }
  });

  // Submit a quiz
  app.post('/api/modules/quiz/:id/submit', isAuthenticated, async (req: any, res) => {
    try {
      const quizId = req.params.id;
      const userId = (req.session as any).user.id;
      const answers = req.body.answers;
      
      const result = await storage.submitQuiz(userId, quizId, answers);
      res.status(200).json(result);
    } catch (error) {
      console.error("Error submitting quiz:", error);
      res.status(500).json({ message: "Failed to submit quiz" });
    }
  });

  // Submit an assignment
  app.post('/api/modules/assignment/:id/submit', isAuthenticated, async (req: any, res) => {
    try {
      const assignmentId = req.params.id;
      const userId = (req.session as any).user.id;
      const submission = req.body;
      
      const result = await storage.submitAssignment(userId, assignmentId, submission);
      res.status(200).json(result);
    } catch (error) {
      console.error("Error submitting assignment:", error);
      res.status(500).json({ message: "Failed to submit assignment" });
    }
  });

  // === CERTIFICATES ROUTES ===

  // Get user's certificates
  app.get('/api/certificates', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).user.id;
      const certificates = await storage.getUserCertificates(userId);
      res.json(certificates);
    } catch (error) {
      console.error("Error fetching certificates:", error);
      res.status(500).json({ message: "Failed to fetch certificates" });
    }
  });

  // View certificate
  app.get('/api/certificates/:id/view', isAuthenticated, async (req: any, res) => {
    try {
      const certificateId = req.params.id;
      const userId = (req.session as any).user.id;
      
      const certificate = await storage.getCertificateById(certificateId, userId);
      
      if (!certificate) {
        return res.status(404).json({ message: "Certificate not found" });
      }
      
      // Generate certificate HTML
      const certificateHtml = await storage.generateCertificateHtml(certificate);
      res.send(certificateHtml);
    } catch (error) {
      console.error("Error viewing certificate:", error);
      res.status(500).json({ message: "Failed to view certificate" });
    }
  });

  // Download certificate
  app.get('/api/certificates/:id/download', isAuthenticated, async (req: any, res) => {
    try {
      const certificateId = req.params.id;
      const userId = (req.session as any).user.id;
      
      const certificate = await storage.getCertificateById(certificateId, userId);
      
      if (!certificate) {
        return res.status(404).json({ message: "Certificate not found" });
      }
      
      // Generate certificate PDF
      const certificatePdf = await storage.generateCertificatePdf(certificate);
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="certificate-${certificateId}.pdf"`);
      res.send(certificatePdf);
    } catch (error) {
      console.error("Error downloading certificate:", error);
      res.status(500).json({ message: "Failed to download certificate" });
    }
  });
  
  // === NOTES ROUTES ===
  
  // Get user notes (all or filtered by content)
  app.get('/api/notes', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).user.id;
      const contentId = req.query.contentId;
      
      const notes = await storage.getUserNotes(userId, contentId);
      res.json(notes);
    } catch (error) {
      console.error("Error fetching notes:", error);
      res.status(500).json({ message: "Failed to fetch notes" });
    }
  });
  
  // Create a new note
  app.post('/api/notes', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).user.id;
      const { contentId, text, timestamp } = req.body;
      
      if (!contentId || !text) {
        return res.status(400).json({ message: "Content ID and text are required" });
      }
      
      const noteData = {
        userId,
        contentId,
        text,
        timestamp: timestamp || null
      };
      
      const note = await storage.createNote(noteData);
      res.status(201).json(note);
    } catch (error) {
      console.error("Error creating note:", error);
      res.status(500).json({ message: "Failed to create note" });
    }
  });
  
  // Update a note
  app.put('/api/notes/:id', isAuthenticated, async (req: any, res) => {
    try {
      const noteId = req.params.id;
      const userId = (req.session as any).user.id;
      const { text, timestamp } = req.body;
      
      // Verify ownership
      const notes = await storage.getUserNotes(userId);
      const noteExists = notes.some(note => note.id === noteId);
      
      if (!noteExists) {
        return res.status(404).json({ message: "Note not found or you don't have permission" });
      }
      
      const updatedNote = await storage.updateNote(noteId, { text, timestamp });
      res.json(updatedNote);
    } catch (error) {
      console.error("Error updating note:", error);
      res.status(500).json({ message: "Failed to update note" });
    }
  });
  
  // Delete a note
  app.delete('/api/notes/:id', isAuthenticated, async (req: any, res) => {
    try {
      const noteId = req.params.id;
      const userId = (req.session as any).user.id;
      
      // Verify ownership
      const notes = await storage.getUserNotes(userId);
      const noteExists = notes.some(note => note.id === noteId);
      
      if (!noteExists) {
        return res.status(404).json({ message: "Note not found or you don't have permission" });
      }
      
      await storage.deleteNote(noteId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting note:", error);
      res.status(500).json({ message: "Failed to delete note" });
    }
  });

  // === ADMIN ROUTES ===

  // Check if user is admin
  const isAdmin = async (req: any, res: any, next: any) => {
    try {
      const userId = (req.session as any).user.id;
      const user = await storage.getUser(userId);
      
      if (user && user.role === 'admin') {
        return next();
      }
      
      return res.status(403).json({ message: "Unauthorized: Admin access required" });
    } catch (error) {
      console.error("Error checking admin status:", error);
      return res.status(500).json({ message: "Failed to verify admin status" });
    }
  };

  // Get admin dashboard stats
  app.get('/api/admin/stats', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch admin stats" });
    }
  });

  // Get all users (admin only)
  app.get('/api/admin/users', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Create new tutor (admin only)
  app.post('/api/admin/tutors', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { username, email, password, bio, role = 'instructor' } = req.body;
      
      // Validate required fields
      if (!username || !email || !password) {
        return res.status(400).json({ message: "Username, email, and password are required" });
      }
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User with this email already exists" });
      }
      
      // Create tutor with a generated ID
      const userId = `tutor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const newTutor = await storage.upsertUser({
        id: userId,
        email,
        username,
        role: 'instructor',
        profileImageUrl: null
      });
      
      res.status(201).json(newTutor);
    } catch (error) {
      console.error("Error creating tutor:", error);
      res.status(500).json({ message: "Failed to create tutor" });
    }
  });

  // Create new user (admin only)
  app.post('/api/admin/users', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { email, firstName, lastName, role, password } = req.body;
      
      // Validate required fields
      if (!email || !firstName || !lastName || !role) {
        return res.status(400).json({ message: "Email, first name, last name, and role are required" });
      }
      
      // Validate role
      if (!['admin', 'instructor', 'learner'].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User with this email already exists" });
      }
      
      // Create user with a generated ID
      const userId = `manual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const newUser = await storage.upsertUser({
        id: userId,
        email,
        firstName,
        lastName,
        role,
        profileImageUrl: null
      });
      
      // Send welcome email with login credentials
      try {
        await emailService.sendWelcomeEmail(email, `${firstName} ${lastName}`);
      } catch (emailError) {
        console.error("Error sending welcome email:", emailError);
        // Don't fail the user creation if email fails
      }
      
      res.status(201).json(newUser);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  // Update user (admin only)
  app.put('/api/admin/users/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const userId = req.params.id;
      const { email, firstName, lastName, role } = req.body;
      
      // Validate required fields
      if (!email || !firstName || !lastName || !role) {
        return res.status(400).json({ message: "Email, first name, last name, and role are required" });
      }
      
      // Validate role
      if (!['admin', 'instructor', 'learner'].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }
      
      // Check if user exists
      const existingUser = await storage.getUser(userId);
      if (!existingUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check if email is already taken by another user
      const userWithEmail = await storage.getUserByEmail(email);
      if (userWithEmail && userWithEmail.id !== userId) {
        return res.status(400).json({ message: "Email is already taken by another user" });
      }
      
      const updatedUser = await storage.updateUser(userId, {
        email,
        firstName,
        lastName,
        role
      });
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Update user role (admin only)
  app.patch('/api/admin/users/:id/role', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const userId = req.params.id;
      const { role } = req.body;
      
      if (!['admin', 'instructor', 'learner'].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }
      
      await storage.updateUserRole(userId, role);
      res.status(200).json({ message: "User role updated successfully" });
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update user role" });
    }
  });

  // Create instructor account (admin only)
  app.post('/api/admin/create-instructor', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const { email, firstName, lastName, bio, specialization } = req.body;
      
      if (!email || !firstName || !lastName) {
        return res.status(400).json({ message: "Email, first name, and last name are required" });
      }
      
      // Generate a secure temporary password
      const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
      const loginUrl = `${req.protocol}://${req.hostname}/auth/instructor-login`;
      
      // Create instructor user with temporary credentials
      const newInstructor = await storage.createInstructorAccount({
        email,
        firstName,
        lastName,
        bio: bio || "",
        specialization: specialization || "",
        tempPassword,
        role: 'instructor'
      });
      
      // Send welcome email with credentials
      const emailSent = await emailService.sendInstructorWelcomeEmail({
        email,
        firstName,
        tempPassword,
        loginUrl,
        adminName: req.user.dbUser?.firstName || "Administrator"
      });
      
      if (!emailSent) {
        console.warn("Failed to send welcome email to instructor");
      }
      
      res.status(201).json({ 
        message: "Instructor account created successfully",
        instructor: {
          id: newInstructor.id,
          email: newInstructor.email,
          firstName: newInstructor.firstName,
          lastName: newInstructor.lastName,
          role: newInstructor.role
        },
        emailSent
      });
    } catch (error) {
      console.error("Error creating instructor:", error);
      res.status(500).json({ message: "Failed to create instructor account" });
    }
  });

  // Delete user (admin only)
  app.delete('/api/admin/users/:id', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const userId = req.params.id;
      await storage.deleteUser(userId);
      res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // Get all courses (admin only)
  app.get('/api/admin/courses', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const courses = await storage.getAllCoursesWithStats();
      res.json(courses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      res.status(500).json({ message: "Failed to fetch courses" });
    }
  });

  // Get course modules (admin only) - must come before /:id route
  app.get('/api/admin/courses/:id/modules', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const courseId = req.params.id;
      const modules = await storage.getModulesByCourse(courseId);
      res.json(modules);
    } catch (error) {
      console.error("Error fetching course modules:", error);
      res.status(500).json({ message: "Failed to fetch course modules" });
    }
  });

  // Create module for course (admin only)
  app.post('/api/admin/courses/:id/modules', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const courseId = req.params.id;
      const moduleData = {
        ...req.body,
        courseId
      };
      
      // Validate course exists
      const existingCourse = await storage.getCourseById(courseId);
      if (!existingCourse) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      const module = await storage.createModule(moduleData);
      res.status(201).json(module);
    } catch (error) {
      console.error("Error creating module:", error);
      res.status(500).json({ message: "Failed to create module" });
    }
  });

  // === MODULE CONTENT ROUTES (ADMIN) ===
  
  // Get module by ID (admin only)
  app.get('/api/admin/modules/:moduleId', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const moduleId = req.params.moduleId;
      const module = await storage.getModuleById(moduleId);
      if (!module) {
        return res.status(404).json({ message: "Module not found" });
      }
      res.json(module);
    } catch (error) {
      console.error("Error fetching module:", error);
      res.status(500).json({ message: "Failed to fetch module" });
    }
  });

  // Get module content including quizzes (admin only)
  app.get('/api/admin/modules/:moduleId/content', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const moduleId = req.params.moduleId;
      const content = await storage.getModuleContent(moduleId);
      const quizzes = await storage.getQuizzesByModule(moduleId);
      
      // Transform quizzes to look like content items
      const quizContent = quizzes.map((quiz: any) => ({
        ...quiz,
        type: 'quiz',
        url: `/quiz/${quiz.id}`, // Virtual URL for routing
        order: 999 // Place quizzes at the end by default
      }));
      
      // Combine content and quizzes
      const allContent = [...content, ...quizContent];
      
      res.json(allContent);
    } catch (error) {
      console.error("Error fetching module content:", error);
      res.status(500).json({ message: "Failed to fetch module content" });
    }
  });

  // Create module content (admin only) - Supports both URL and file upload
  app.post('/api/admin/modules/:moduleId/content', isAuthenticated, isAdmin, (req: any, res) => {
    // Determine if this is a file upload or JSON request
    const contentType = req.headers['content-type'] || '';
    const isMultipart = contentType.includes('multipart/form-data');
    
    if (isMultipart) {
      // Use unified media content upload for all content types
      const uploadMiddleware = mediaContentUpload.single('file');
      
      uploadMiddleware(req, res, async (err) => {
        if (err) {
          console.error("File upload error:", err);
          return res.status(400).json({ message: err.message });
        }
        
        try {
          const moduleId = req.params.moduleId;
          
          // Validate module exists
          const module = await storage.getModuleById(moduleId);
          if (!module) {
            return res.status(404).json({ message: "Module not found" });
          }
          
          if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
          }
          
          // Create uploads directory based on type
          const type = req.body.type || 'document';
          const uploadsDir = path.join(process.cwd(), 'public', 'uploads', type + 's');
          if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
          }
          
          // Generate unique filename
          const timestamp = Date.now();
          const extension = path.extname(req.file.originalname);
          const filename = `${type}_${timestamp}${extension}`;
          const filepath = path.join(uploadsDir, filename);
          
          // Save file
          fs.writeFileSync(filepath, req.file.buffer);
          
          // Calculate duration for audio/video/pdf files
          let duration: number | undefined;
          if (type === 'audio') {
            try {
              const durationResult = await DurationCalculator.calculateAudioDuration(filepath);
              duration = durationResult.duration;
            } catch (error) {
              console.log("Could not calculate audio duration:", error);
            }
          } else if (type === 'video') {
            try {
              const durationResult = await DurationCalculator.calculateVideoDuration(filepath);
              duration = durationResult.duration;
            } catch (error) {
              console.log("Could not calculate video duration:", error);
            }
          } else if (type === 'pdf') {
            try {
              const durationResult = await DurationCalculator.calculatePdfDuration(filepath);
              duration = durationResult.duration;
            } catch (error) {
              console.log("Could not calculate PDF duration:", error);
            }
          }
          
          // Create content data with file URL
          const fileUrl = `/uploads/${type}s/${filename}`;
          
          // Get existing content count to set order
          const existingContent = await storage.getModuleContent(moduleId);
          const order = existingContent.length + 1;
          
          const contentData = {
            title: req.body.title,
            type: type,
            url: fileUrl,
            description: req.body.description || '',
            duration: duration || (req.body.duration ? parseInt(req.body.duration) : undefined),
            order: order,
            moduleId
          };
          
          // Validate with Zod
          try {
            moduleContentSchema.parse(contentData);
          } catch (err) {
            if (err instanceof ZodError) {
              console.error("Validation error details:", JSON.stringify(err.errors, null, 2));
              console.error("Content data:", JSON.stringify(contentData, null, 2));
              return res.status(400).json({ 
                message: "Validation error", 
                errors: err.errors 
              });
            }
            throw err;
          }
          
          const content = await storage.createModuleContent(contentData);
          res.status(201).json(content);
        } catch (error) {
          console.error("Error creating module content:", error);
          res.status(500).json({ message: "Failed to create module content" });
        }
      });
    } else {
      // Handle JSON request (URL-based content)
      (async () => {
        try {
          const moduleId = req.params.moduleId;
          
          // Validate module exists
          const module = await storage.getModuleById(moduleId);
          if (!module) {
            return res.status(404).json({ message: "Module not found" });
          }
          
          // Get existing content count to set order if not provided
          const existingContent = await storage.getModuleContent(moduleId);
          const order = req.body.order !== undefined ? req.body.order : existingContent.length + 1;
          
          const contentData = {
            ...req.body,
            order: order,
            moduleId
          };
          
          // Validate with Zod
          try {
            moduleContentSchema.parse(contentData);
          } catch (err) {
            if (err instanceof ZodError) {
              return res.status(400).json({ 
                message: "Validation error", 
                errors: err.errors 
              });
            }
            throw err;
          }
          
          const content = await storage.createModuleContent(contentData);
          res.status(201).json(content);
        } catch (error) {
          console.error("Error creating module content:", error);
          res.status(500).json({ message: "Failed to create module content" });
        }
      })();
    }
  });

  // Update module content (admin only)
  app.put('/api/admin/modules/:moduleId/content/:contentId', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const contentId = req.params.contentId;
      const updateData = req.body;
      
      // Validate with Zod (partial validation for updates)
      try {
        moduleContentSchema.partial().parse(updateData);
      } catch (err) {
        if (err instanceof ZodError) {
          return res.status(400).json({ 
            message: "Validation error", 
            errors: err.errors 
          });
        }
        throw err;
      }
      
      const updatedContent = await storage.updateModuleContent(contentId, updateData);
      res.json(updatedContent);
    } catch (error) {
      console.error("Error updating module content:", error);
      res.status(500).json({ message: "Failed to update module content" });
    }
  });

  // Delete module content (admin only)
  app.delete('/api/admin/modules/:moduleId/content/:contentId', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const contentId = req.params.contentId;
      await storage.deleteModuleContent(contentId);
      res.json({ message: "Content deleted successfully" });
    } catch (error) {
      console.error("Error deleting module content:", error);
      res.status(500).json({ message: "Failed to delete module content" });
    }
  });

  // === QUIZ ROUTES (ADMIN) ===
  
  // Get all quizzes for a module (admin only)
  app.get('/api/admin/modules/:moduleId/quizzes', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const moduleId = req.params.moduleId;
      const quizzes = await storage.getQuizzesByModule(moduleId);
      res.json(quizzes);
    } catch (error) {
      console.error("Error fetching quizzes:", error);
      res.status(500).json({ message: "Failed to fetch quizzes" });
    }
  });

  // Get quiz with questions (admin only)
  app.get('/api/admin/quizzes/:quizId', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const quizId = req.params.quizId;
      const quiz = await storage.getQuizWithQuestions(quizId);
      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }
      res.json(quiz);
    } catch (error) {
      console.error("Error fetching quiz:", error);
      res.status(500).json({ message: "Failed to fetch quiz" });
    }
  });

  // Create quiz (admin only)
  app.post('/api/admin/modules/:moduleId/quizzes', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const moduleId = req.params.moduleId;
      const quizData = {
        ...req.body,
        moduleId
      };
      
      // Validate module exists
      const module = await storage.getModuleById(moduleId);
      if (!module) {
        return res.status(404).json({ message: "Module not found" });
      }
      
      // Validate with Zod
      try {
        quizSchema.parse(quizData);
      } catch (err) {
        if (err instanceof ZodError) {
          return res.status(400).json({ 
            message: "Validation error", 
            errors: err.errors 
          });
        }
        throw err;
      }
      
      const quiz = await storage.createQuiz(quizData);
      res.status(201).json(quiz);
    } catch (error) {
      console.error("Error creating quiz:", error);
      res.status(500).json({ message: "Failed to create quiz" });
    }
  });

  // Update quiz (admin only)
  app.put('/api/admin/quizzes/:quizId', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const quizId = req.params.quizId;
      const updateData = req.body;
      
      // Validate with Zod (partial validation for updates)
      try {
        quizSchema.partial().parse(updateData);
      } catch (err) {
        if (err instanceof ZodError) {
          return res.status(400).json({ 
            message: "Validation error", 
            errors: err.errors 
          });
        }
        throw err;
      }
      
      const updatedQuiz = await storage.updateQuiz(quizId, updateData);
      res.json(updatedQuiz);
    } catch (error) {
      console.error("Error updating quiz:", error);
      res.status(500).json({ message: "Failed to update quiz" });
    }
  });

  // Delete quiz (admin only)
  app.delete('/api/admin/quizzes/:quizId', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const quizId = req.params.quizId;
      await storage.deleteQuiz(quizId);
      res.json({ message: "Quiz deleted successfully" });
    } catch (error) {
      console.error("Error deleting quiz:", error);
      res.status(500).json({ message: "Failed to delete quiz" });
    }
  });

  // === QUIZ QUESTION ROUTES (ADMIN) ===
  
  // Create quiz question (admin only)
  app.post('/api/admin/quizzes/:quizId/questions', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const quizId = req.params.quizId;
      const questionData = {
        ...req.body,
        quizId
      };
      
      // Validate quiz exists
      const quiz = await storage.getQuizById(quizId);
      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }
      
      const question = await storage.createQuizQuestion(questionData);
      res.status(201).json(question);
    } catch (error) {
      console.error("Error creating question:", error);
      res.status(500).json({ message: "Failed to create question" });
    }
  });

  // Update quiz question (admin only)
  app.put('/api/admin/quizzes/:quizId/questions/:questionId', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const questionId = req.params.questionId;
      const updateData = req.body;
      
      const updatedQuestion = await storage.updateQuizQuestion(questionId, updateData);
      res.json(updatedQuestion);
    } catch (error) {
      console.error("Error updating question:", error);
      res.status(500).json({ message: "Failed to update question" });
    }
  });

  // Delete quiz question (admin only)
  app.delete('/api/admin/quizzes/:quizId/questions/:questionId', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const questionId = req.params.questionId;
      await storage.deleteQuizQuestion(questionId);
      res.json({ message: "Question deleted successfully" });
    } catch (error) {
      console.error("Error deleting question:", error);
      res.status(500).json({ message: "Failed to delete question" });
    }
  });

  // Get individual course (admin only)
  app.get('/api/admin/courses/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const courseId = req.params.id;
      const course = await storage.getCourseById(courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      res.json(course);
    } catch (error) {
      console.error("Error fetching course:", error);
      res.status(500).json({ message: "Failed to fetch course" });
    }
  });

  // Update course (admin only)
  app.put('/api/admin/courses/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const courseId = req.params.id;
      const updateData = req.body;
      
      // Validate required fields
      if (!updateData.title || !updateData.description) {
        return res.status(400).json({ message: "Title and description are required" });
      }

      // Convert price from dollars to cents (integer)
      if (updateData.price !== undefined && updateData.price !== null) {
        const priceInDollars = parseFloat(updateData.price.toString());
        updateData.price = Math.round(priceInDollars * 100);
      }

      const updatedCourse = await storage.updateCourse(courseId, updateData);
      res.json(updatedCourse);
    } catch (error) {
      console.error("Error updating course:", error);
      res.status(500).json({ message: "Failed to update course" });
    }
  });

  // Create course (admin only)
  app.post('/api/admin/courses', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      console.log("Admin creating course - Session user:", (req.session as any)?.user);
      const userId = (req.session as any).user.id;
      const courseData = {
        ...req.body,
        instructorId: userId
      };
      
      console.log("Admin course data to create:", courseData);
      
      // Validate with zod
      try {
        courseSchema.parse(courseData);
      } catch (err) {
        if (err instanceof ZodError) {
          console.error("Validation error:", err.errors);
          return res.status(400).json({ message: err.message, errors: err.errors });
        }
        throw err;
      }
      
      const course = await storage.createCourse(courseData);
      console.log("Admin course created successfully:", course.id);
      res.status(201).json(course);
    } catch (error) {
      console.error("Error creating course (admin):", error);
      res.status(500).json({ message: "Failed to create course", error: error instanceof Error ? error.message : String(error) });
    }
  });

  // Delete course (admin only)
  app.delete('/api/admin/courses/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const courseId = req.params.id;
      await storage.deleteCourse(courseId);
      res.status(200).json({ message: "Course deleted successfully" });
    } catch (error) {
      console.error("Error deleting course:", error);
      res.status(500).json({ message: "Failed to delete course" });
    }
  });

  // === INSTRUCTOR ROUTES ===

  // Check if user is instructor or admin
  const isInstructor = async (req: any, res: any, next: any) => {
    try {
      const userId = (req.session as any).user.id;
      const user = await storage.getUser(userId);
      
      if (user && (user.role === 'instructor' || user.role === 'admin')) {
        return next();
      }
      
      return res.status(403).json({ message: "Unauthorized: Instructor access required" });
    } catch (error) {
      console.error("Error checking instructor status:", error);
      return res.status(500).json({ message: "Failed to verify instructor status" });
    }
  };

  // Get student dashboard stats
  app.get('/api/student/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).user.id;
      
      // Get enrolled courses
      const enrolledCourses = await storage.getEnrolledCourses(userId);
      
      // Calculate stats
      const totalCoursesEnrolled = enrolledCourses.length;
      const completedCourses = enrolledCourses.filter((c: any) => c.enrollmentStatus === 'completed').length;
      const certificates = await storage.getUserCertificates(userId);
      
      const stats = {
        totalCoursesEnrolled,
        completedCourses,
        totalHoursLearned: 0, // Can be calculated based on lesson progress
        certificatesEarned: certificates.length,
        currentStreak: 0, // Can be implemented with activity tracking
        averageScore: 0 // Can be calculated from quiz attempts
      };
      
      res.json(stats);
    } catch (error) {
      console.error("Error fetching student stats:", error);
      res.status(500).json({ message: "Failed to fetch student stats" });
    }
  });

  // Get instructor dashboard stats
  app.get('/api/instructor/stats', isAuthenticated, isInstructor, async (req: any, res) => {
    try {
      const userId = (req.session as any).user.id;
      const stats = await storage.getInstructorStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching instructor stats:", error);
      res.status(500).json({ message: "Failed to fetch instructor stats" });
    }
  });

  // Get instructor courses
  app.get('/api/instructor/courses', isAuthenticated, isInstructor, async (req: any, res) => {
    try {
      const userId = (req.session as any).user.id;
      const courses = await storage.getInstructorCourses(userId);
      res.json(courses);
    } catch (error) {
      console.error("Error fetching instructor courses:", error);
      res.status(500).json({ message: "Failed to fetch instructor courses" });
    }
  });

  // Create a new course
  app.post('/api/instructor/courses', isAuthenticated, isInstructor, async (req: any, res) => {
    try {
      console.log("Creating course - Session user:", (req.session as any)?.user);
      const userId = (req.session as any).user.id;
      const courseData = {
        ...req.body,
        instructorId: userId
      };
      
      console.log("Course data to create:", courseData);
      
      // Validate with zod
      try {
        courseSchema.parse(courseData);
      } catch (err) {
        if (err instanceof ZodError) {
          console.error("Validation error:", err.errors);
          return res.status(400).json({ message: err.message, errors: err.errors });
        }
        throw err;
      }
      
      const course = await storage.createCourse(courseData);
      console.log("Course created successfully:", course.id);
      res.status(201).json(course);
    } catch (error) {
      console.error("Error creating course:", error);
      res.status(500).json({ message: "Failed to create course", error: error instanceof Error ? error.message : String(error) });
    }
  });

  // Update a course
  app.put('/api/instructor/courses/:id', isAuthenticated, isInstructor, async (req: any, res) => {
    try {
      const courseId = req.params.id;
      const userId = (req.session as any).user.id;
      const courseData = req.body;
      
      // Validate course ownership
      const existingCourse = await storage.getCourseById(courseId);
      if (!existingCourse) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      if (existingCourse.instructorId !== userId) {
        return res.status(403).json({ message: "Unauthorized: You don't own this course" });
      }
      
      // Validate with zod
      try {
        courseSchema.partial().parse(courseData);
      } catch (err) {
        if (err instanceof ZodError) {
          const validationError = err.message;
          return res.status(400).json({ message: validationError.message });
        }
        throw err;
      }
      
      const updatedCourse = await storage.updateCourse(courseId, courseData);
      res.json(updatedCourse);
    } catch (error) {
      console.error("Error updating course:", error);
      res.status(500).json({ message: "Failed to update course" });
    }
  });

  // Delete instructor's course
  app.delete('/api/instructor/courses/:id', isAuthenticated, isInstructor, async (req: any, res) => {
    try {
      const courseId = req.params.id;
      const userId = (req.session as any).user.id;
      
      // Validate course ownership
      const existingCourse = await storage.getCourseById(courseId);
      if (!existingCourse) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      if (existingCourse.instructorId !== userId) {
        return res.status(403).json({ message: "Unauthorized: You don't own this course" });
      }
      
      await storage.deleteCourse(courseId);
      res.status(200).json({ message: "Course deleted successfully" });
    } catch (error) {
      console.error("Error deleting course:", error);
      res.status(500).json({ message: "Failed to delete course" });
    }
  });

  // Publish a course
  app.patch('/api/instructor/courses/:id/publish', isAuthenticated, isInstructor, async (req: any, res) => {
    try {
      const courseId = req.params.id;
      const userId = (req.session as any).user.id;
      
      // Validate course ownership
      const existingCourse = await storage.getCourseById(courseId);
      if (!existingCourse) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      if (existingCourse.instructorId !== userId) {
        return res.status(403).json({ message: "Unauthorized: You don't own this course" });
      }
      
      // Update course status to published
      const updatedCourse = await storage.updateCourse(courseId, { status: 'published' });
      res.json({ message: "Course published successfully", course: updatedCourse });
    } catch (error) {
      console.error("Error publishing course:", error);
      res.status(500).json({ message: "Failed to publish course" });
    }
  });

  // Duplicate a course
  app.post('/api/instructor/courses/:id/duplicate', isAuthenticated, isInstructor, async (req: any, res) => {
    try {
      const courseId = req.params.id;
      const userId = (req.session as any).user.id;
      
      // Validate course ownership
      const existingCourse = await storage.getCourseById(courseId);
      if (!existingCourse) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      if (existingCourse.instructorId !== userId) {
        return res.status(403).json({ message: "Unauthorized: You don't own this course" });
      }
      
      const newCourse = await storage.duplicateCourse(courseId);
      res.status(201).json(newCourse);
    } catch (error) {
      console.error("Error duplicating course:", error);
      res.status(500).json({ message: "Failed to duplicate course" });
    }
  });

  // Update course status
  app.patch('/api/instructor/courses/:id/status', isAuthenticated, isInstructor, async (req: any, res) => {
    try {
      const courseId = req.params.id;
      const userId = (req.session as any).user.id;
      const { status } = req.body;
      
      if (!['draft', 'published', 'archived'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      // Validate course ownership
      const existingCourse = await storage.getCourseById(courseId);
      if (!existingCourse) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      if (existingCourse.instructorId !== userId) {
        return res.status(403).json({ message: "Unauthorized: You don't own this course" });
      }
      
      await storage.updateCourseStatus(courseId, status);
      res.status(200).json({ message: "Course status updated successfully" });
    } catch (error) {
      console.error("Error updating course status:", error);
      res.status(500).json({ message: "Failed to update course status" });
    }
  });

  // Add a module to a course
  app.post('/api/instructor/courses/:id/modules', isAuthenticated, isInstructor, async (req: any, res) => {
    try {
      const courseId = req.params.id;
      const userId = (req.session as any).user.id;
      const moduleData = {
        ...req.body,
        courseId
      };
      
      // Validate course ownership
      const existingCourse = await storage.getCourseById(courseId);
      if (!existingCourse) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      if (existingCourse.instructorId !== userId) {
        return res.status(403).json({ message: "Unauthorized: You don't own this course" });
      }
      
      // Validate with zod
      try {
        moduleSchema.parse(moduleData);
      } catch (err) {
        if (err instanceof ZodError) {
          const validationError = err.message;
          return res.status(400).json({ message: validationError.message });
        }
        throw err;
      }
      
      const module = await storage.createModule(moduleData);
      res.status(201).json(module);
    } catch (error) {
      console.error("Error creating module:", error);
      res.status(500).json({ message: "Failed to create module" });
    }
  });

  // Add content to a module
  app.post('/api/instructor/modules/:id/content', isAuthenticated, isInstructor, async (req: any, res) => {
    try {
      const moduleId = req.params.id;
      const userId = (req.session as any).user.id;
      const contentData = {
        ...req.body,
        moduleId
      };
      
      // Validate module ownership
      const module = await storage.getModuleById(moduleId);
      if (!module) {
        return res.status(404).json({ message: "Module not found" });
      }
      
      const course = await storage.getCourseById(module.courseId);
      if (course?.instructorId !== userId) {
        return res.status(403).json({ message: "Unauthorized: You don't own this module" });
      }
      
      // Validate with zod
      try {
        moduleContentSchema.parse(contentData);
      } catch (err) {
        if (err instanceof ZodError) {
          const validationError = err.message;
          return res.status(400).json({ message: validationError.message });
        }
        throw err;
      }
      
      const content = await storage.createModuleContent(contentData);
      res.status(201).json(content);
    } catch (error) {
      console.error("Error adding content to module:", error);
      res.status(500).json({ message: "Failed to add content to module" });
    }
  });

  // Add quiz to a module
  app.post('/api/instructor/modules/:id/quizzes', isAuthenticated, isInstructor, async (req: any, res) => {
    try {
      const moduleId = req.params.id;
      const userId = (req.session as any).user.id;
      const quizData = {
        ...req.body,
        moduleId
      };
      
      // Validate module ownership
      const module = await storage.getModuleById(moduleId);
      if (!module) {
        return res.status(404).json({ message: "Module not found" });
      }
      
      const course = await storage.getCourseById(module.courseId);
      if (course?.instructorId !== userId) {
        return res.status(403).json({ message: "Unauthorized: You don't own this module" });
      }
      
      // Validate with zod
      try {
        quizSchema.parse(quizData);
      } catch (err) {
        if (err instanceof ZodError) {
          const validationError = err.message;
          return res.status(400).json({ message: validationError.message });
        }
        throw err;
      }
      
      const quiz = await storage.createQuiz(quizData);
      res.status(201).json(quiz);
    } catch (error) {
      console.error("Error adding quiz to module:", error);
      res.status(500).json({ message: "Failed to add quiz to module" });
    }
  });

  // Add assignment to a module
  app.post('/api/instructor/modules/:id/assignments', isAuthenticated, isInstructor, async (req: any, res) => {
    try {
      const moduleId = req.params.id;
      const userId = (req.session as any).user.id;
      const assignmentData = {
        ...req.body,
        moduleId
      };
      
      // Validate module ownership
      const module = await storage.getModuleById(moduleId);
      if (!module) {
        return res.status(404).json({ message: "Module not found" });
      }
      
      const course = await storage.getCourseById(module.courseId);
      if (course?.instructorId !== userId) {
        return res.status(403).json({ message: "Unauthorized: You don't own this module" });
      }
      
      // Validate with zod
      try {
        assignmentSchema.parse(assignmentData);
      } catch (err) {
        if (err instanceof ZodError) {
          const validationError = err.message;
          return res.status(400).json({ message: validationError.message });
        }
        throw err;
      }
      
      const assignment = await storage.createAssignment(assignmentData);
      res.status(201).json(assignment);
    } catch (error) {
      console.error("Error adding assignment to module:", error);
      res.status(500).json({ message: "Failed to add assignment to module" });
    }
  });

  // Grade an assignment
  app.post('/api/instructor/assignments/:id/grade', isAuthenticated, isInstructor, async (req: any, res) => {
    try {
      const assignmentId = req.params.id;
      const userId = (req.session as any).user.id;
      const { grade, feedback, submissionId } = req.body;
      
      // Validate assignment ownership
      const assignment = await storage.getAssignmentById(assignmentId);
      if (!assignment) {
        return res.status(404).json({ message: "Assignment not found" });
      }
      
      const module = await storage.getModuleById(assignment.moduleId);
      const course = await storage.getCourseById(module.courseId);
      
      if (course?.instructorId !== userId) {
        return res.status(403).json({ message: "Unauthorized: You don't own this assignment" });
      }
      
      await storage.gradeAssignment(submissionId, grade, feedback);
      res.status(200).json({ message: "Assignment graded successfully" });
    } catch (error) {
      console.error("Error grading assignment:", error);
      res.status(500).json({ message: "Failed to grade assignment" });
    }
  });

  // === CERTIFICATE ROUTES ===

  // Get user certificates
  app.get('/api/certificates', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).user.id;
      const certificates = await storage.getUserCertificates(userId);
      res.json(certificates);
    } catch (error) {
      console.error("Error fetching certificates:", error);
      res.status(500).json({ message: "Failed to fetch certificates" });
    }
  });

  // Get certificate by id
  app.get('/api/certificates/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).user.id;
      const certificateId = req.params.id;
      
      const certificate = await storage.getCertificateById(certificateId, userId);
      
      if (!certificate) {
        return res.status(404).json({ message: "Certificate not found" });
      }
      
      res.json(certificate);
    } catch (error) {
      console.error("Error fetching certificate:", error);
      res.status(500).json({ message: "Failed to fetch certificate" });
    }
  });

  // View certificate as HTML
  app.get('/api/certificates/:id/view', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).user.id;
      const certificateId = req.params.id;
      
      const certificate = await storage.getCertificateById(certificateId, userId);
      
      if (!certificate) {
        return res.status(404).json({ message: "Certificate not found" });
      }
      
      const html = await storage.generateCertificateHtml(certificate);
      res.setHeader('Content-Type', 'text/html');
      res.send(html);
    } catch (error) {
      console.error("Error generating certificate HTML:", error);
      res.status(500).json({ message: "Failed to generate certificate HTML" });
    }
  });

  // Download certificate as PDF
  app.get('/api/certificates/:id/download', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).user.id;
      const certificateId = req.params.id;
      
      const certificate = await storage.getCertificateById(certificateId, userId);
      
      if (!certificate) {
        return res.status(404).json({ message: "Certificate not found" });
      }
      
      const pdfBuffer = await storage.generateCertificatePdf(certificate);
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="certificate-${certificateId}.pdf"`);
      res.send(pdfBuffer);
    } catch (error) {
      console.error("Error generating certificate PDF:", error);
      res.status(500).json({ message: "Failed to generate certificate PDF" });
    }
  });

  // Automatically generate certificate when course is completed
  app.post('/api/courses/:id/complete', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).user.id;
      const courseId = req.params.id;
      
      // Generate certificate for user and course
      const certificate = await storage.generateCertificate(userId, courseId);
      
      if (!certificate) {
        return res.status(400).json({ message: "Failed to generate certificate" });
      }
      
      res.status(201).json(certificate);
    } catch (error) {
      console.error("Error completing course:", error);
      res.status(500).json({ message: "Failed to complete course" });
    }
  });

  // Micro-feedback routes for lesson engagement tracking
  app.post('/api/lesson-feedback', isAuthenticated, async (req, res) => {
    try {
      const { contentId, feedbackType, timestamp } = req.body;
      const userId = req.user?.claims?.sub;

      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const feedback = await storage.createLessonFeedback({
        userId,
        contentId,
        feedbackType,
        timestamp: timestamp || null,
      });

      res.json(feedback);
    } catch (error) {
      console.error('Error creating lesson feedback:', error);
      res.status(500).json({ message: 'Failed to record feedback' });
    }
  });

  // Get feedback analytics for content (for instructors)
  app.get('/api/content/:contentId/feedback-analytics', isAuthenticated, async (req, res) => {
    try {
      const { contentId } = req.params;
      const analytics = await storage.getContentFeedbackAnalytics(contentId);
      res.json(analytics);
    } catch (error) {
      console.error('Error getting feedback analytics:', error);
      res.status(500).json({ message: 'Failed to get feedback analytics' });
    }
  });

  // Certificate routes
  app.get('/api/certificates', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      
      const certificates = await storage.getUserCertificates(userId);
      res.json(certificates);
    } catch (error) {
      console.error('Error fetching certificates:', error);
      res.status(500).json({ message: 'Failed to fetch certificates' });
    }
  });

  // Download certificate (HTML or PDF)
  app.get('/api/certificates/:certificateId/download', isAuthenticated, async (req, res) => {
    try {
      const { certificateId } = req.params;
      const { format = 'pdf' } = req.query;
      const userId = req.user?.claims?.sub;

      const certificate = await storage.getCertificateById(certificateId, userId);
      if (!certificate) {
        return res.status(404).json({ message: 'Certificate not found' });
      }

      if (format === 'html') {
        const html = await storage.generateCertificateHtml(certificate);
        res.setHeader('Content-Type', 'text/html');
        res.send(html);
      } else {
        const pdfBuffer = await storage.generateCertificatePdf(certificate);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="certificate-${certificateId}.pdf"`);
        res.send(pdfBuffer);
      }
    } catch (error) {
      console.error('Error downloading certificate:', error);
      res.status(500).json({ message: 'Failed to download certificate' });
    }
  });

  // === ADMIN CERTIFICATE ROUTES ===

  // Get all certificates (admin)
  app.get('/api/admin/certificates', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const certificates = await storage.getAllCertificates();
      res.json(certificates);
    } catch (error) {
      console.error('Error fetching certificates:', error);
      res.status(500).json({ message: 'Failed to fetch certificates' });
    }
  });

  // Get certificate templates
  app.get('/api/admin/certificate-templates', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const templates = await storage.getCertificateTemplates();
      res.json(templates);
    } catch (error) {
      console.error('Error fetching certificate templates:', error);
      res.status(500).json({ message: 'Failed to fetch certificate templates' });
    }
  });

  // Create certificate template
  app.post('/api/admin/certificate-templates', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const templateData = req.body;
      const template = await storage.createCertificateTemplate(templateData);
      res.status(201).json(template);
    } catch (error) {
      console.error('Error creating certificate template:', error);
      res.status(500).json({ message: 'Failed to create certificate template' });
    }
  });

  // Update certificate template
  app.put('/api/admin/certificate-templates/:id', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const templateData = req.body;
      const template = await storage.updateCertificateTemplate(id, templateData);
      res.json(template);
    } catch (error) {
      console.error('Error updating certificate template:', error);
      res.status(500).json({ message: 'Failed to update certificate template' });
    }
  });

  // Delete certificate template
  app.delete('/api/admin/certificate-templates/:id', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteCertificateTemplate(id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting certificate template:', error);
      res.status(500).json({ message: 'Failed to delete certificate template' });
    }
  });

  // Issue certificate
  app.post('/api/admin/certificates/issue', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const { studentId, courseId, certificateType, customText, templateId } = req.body;
      const certificate = await storage.issueCertificate({
        userId: studentId,
        courseId,
        type: certificateType,
        customText,
        templateId
      });
      res.status(201).json(certificate);
    } catch (error) {
      console.error('Error issuing certificate:', error);
      res.status(500).json({ message: 'Failed to issue certificate' });
    }
  });

  // Download certificate (admin)
  app.get('/api/admin/certificates/:id/download', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const certificate = await storage.getCertificateById(id);
      if (!certificate) {
        return res.status(404).json({ message: 'Certificate not found' });
      }

      const pdfBuffer = await storage.generateCertificatePdf(certificate);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="certificate-${id}.pdf"`);
      res.send(pdfBuffer);
    } catch (error) {
      console.error('Error downloading certificate:', error);
      res.status(500).json({ message: 'Failed to download certificate' });
    }
  });

  // Bundle routes
  app.get('/api/bundles', async (req, res) => {
    try {
      const bundles = await storage.getAllBundles();
      res.json(bundles);
    } catch (error) {
      console.error('Error fetching bundles:', error);
      res.status(500).json({ message: 'Failed to fetch bundles' });
    }
  });

  app.get('/api/bundles/:bundleId', async (req, res) => {
    try {
      const { bundleId } = req.params;
      const bundle = await storage.getBundleById(bundleId);
      if (!bundle) {
        return res.status(404).json({ message: 'Bundle not found' });
      }
      res.json(bundle);
    } catch (error) {
      console.error('Error fetching bundle:', error);
      res.status(500).json({ message: 'Failed to fetch bundle' });
    }
  });

  // Admin: Create bundle
  app.post('/api/admin/bundles', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }

      const bundle = await storage.createBundle(req.body);
      res.status(201).json(bundle);
    } catch (error) {
      console.error('Error creating bundle:', error);
      res.status(500).json({ message: 'Failed to create bundle' });
    }
  });

  // Admin: Update bundle
  app.put('/api/admin/bundles/:bundleId', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }

      const { bundleId } = req.params;
      const bundle = await storage.updateBundle(bundleId, req.body);
      res.json(bundle);
    } catch (error) {
      console.error('Error updating bundle:', error);
      res.status(500).json({ message: 'Failed to update bundle' });
    }
  });

  // Promo code validation
  app.post('/api/promo-codes/validate', async (req, res) => {
    try {
      const { code, itemType, itemId } = req.body;
      const validation = await storage.validatePromoCode(code, itemType, itemId);
      res.json(validation);
    } catch (error) {
      console.error('Error validating promo code:', error);
      res.status(500).json({ message: 'Failed to validate promo code' });
    }
  });

  // Admin: Create promo code
  app.post('/api/admin/promo-codes', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }

      const promoCode = await storage.createPromoCode(req.body);
      res.status(201).json(promoCode);
    } catch (error) {
      console.error('Error creating promo code:', error);
      res.status(500).json({ message: 'Failed to create promo code' });
    }
  });

  // Order calculation
  app.post('/api/orders/calculate', async (req, res) => {
    try {
      const { itemType, itemId, promoCode } = req.body;
      const total = await storage.calculateOrderTotal(itemType, itemId, promoCode);
      res.json(total);
    } catch (error) {
      console.error('Error calculating order total:', error);
      res.status(500).json({ message: 'Failed to calculate order total' });
    }
  });

  // Create order
  app.post('/api/orders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const { courseId, paymentMethod, promoCode, orderSummary } = req.body;
      
      // Get promo code ID if provided
      let promoCodeId = null;
      if (promoCode) {
        const promo = await storage.getPromoCodeByCode(promoCode);
        if (promo) {
          promoCodeId = promo.id;
        }
      }

      const orderData = {
        userId,
        orderType: 'course',
        courseId,
        bundleId: null,
        promoCodeId,
        originalPrice: orderSummary.coursePrice || 0,
        discountAmount: orderSummary.discount || 0,
        finalPrice: orderSummary.totalAmount || 0,
        status: 'pending',
        paymentMethod,
        transactionId: null,
      };

      const order = await storage.createOrder(orderData);
      res.status(201).json(order);
    } catch (error) {
      console.error('Error creating order:', error);
      res.status(500).json({ message: 'Failed to create order' });
    }
  });

  // Get user orders
  app.get('/api/orders', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const orders = await storage.getUserOrders(userId);
      res.json(orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).json({ message: 'Failed to fetch orders' });
    }
  });

  // Process payment (simulated for now)
  app.post('/api/orders/:orderId/payment', isAuthenticated, async (req, res) => {
    try {
      const { orderId } = req.params;
      const paymentData = req.body;
      const userId = req.user?.claims?.sub;

      // Get user and order details for email
      const user = await storage.getUser(userId);
      const order = await storage.getOrderById(orderId);
      
      if (!user || !order) {
        return res.status(404).json({ message: 'User or order not found' });
      }

      // Simulate payment processing
      const success = await storage.processPayment(orderId, {
        transactionId: `txn_${Date.now()}`,
        ...paymentData
      });

      if (success) {
        // Enroll user in courses after successful payment
        await storage.enrollUserAfterPayment(orderId);

        // Prepare email data
        let itemTitle = '';
        let courses: any[] = [];

        if (order.bundleId) {
          const bundle = await storage.getBundleById(order.bundleId);
          itemTitle = bundle?.title || 'Course Bundle';
          courses = bundle?.courses || [];
        } else if (order.courseId) {
          const course = await storage.getCourseById(order.courseId);
          itemTitle = course?.title || 'Course';
          courses = course ? [{
            id: course.id,
            title: course.title,
            description: course.description
          }] : [];
        }

        // Send purchase confirmation email
        if (user.email) {
          try {
            await emailService.sendPurchaseConfirmation({
              userEmail: user.email,
              userName: user.firstName || user.email,
              itemType: order.bundleId ? 'bundle' : 'course',
              itemTitle,
              totalAmount: order.totalAmount,
              originalAmount: order.originalAmount,
              discountAmount: order.discountAmount,
              promoCode: order.promoCodeName,
              courses,
              orderDate: order.createdAt
            });
          } catch (emailError) {
            console.error('Failed to send confirmation email:', emailError);
            // Don't fail the payment if email fails
          }
        }

        res.json({ success: true, message: 'Payment processed successfully' });
      } else {
        res.status(400).json({ success: false, message: 'Payment failed' });
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      res.status(500).json({ message: 'Failed to process payment' });
    }
  });
  
  // Personal Notebook API endpoints
  app.get('/api/personal-notes', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const notes = await storage.getUserPersonalNotes(userId);
      res.json(notes);
    } catch (error) {
      console.error('Error fetching personal notes:', error);
      res.status(500).json({ message: 'Failed to fetch notes' });
    }
  });

  app.get('/api/personal-notes/search', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const query = req.query.q as string;
      
      if (!query) {
        return res.status(400).json({ message: 'Search query is required' });
      }

      const notes = await storage.searchPersonalNotes(userId, query);
      res.json(notes);
    } catch (error) {
      console.error('Error searching personal notes:', error);
      res.status(500).json({ message: 'Failed to search notes' });
    }
  });

  app.get('/api/personal-notes/:id', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const noteId = req.params.id;
      
      const note = await storage.getPersonalNoteById(noteId, userId);
      if (!note) {
        return res.status(404).json({ message: 'Note not found' });
      }

      res.json(note);
    } catch (error) {
      console.error('Error fetching personal note:', error);
      res.status(500).json({ message: 'Failed to fetch note' });
    }
  });

  app.post('/api/personal-notes', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const noteData = {
        ...req.body,
        userId
      };

      // Validate required fields
      if (!noteData.title || !noteData.content) {
        return res.status(400).json({ message: 'Title and content are required' });
      }

      const newNote = await storage.createPersonalNote(noteData);
      res.status(201).json(newNote);
    } catch (error) {
      console.error('Error creating personal note:', error);
      res.status(500).json({ message: 'Failed to create note' });
    }
  });

  app.put('/api/personal-notes/:id', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const noteId = req.params.id;
      
      // Validate required fields
      if (!req.body.title || !req.body.content) {
        return res.status(400).json({ message: 'Title and content are required' });
      }

      const updatedNote = await storage.updatePersonalNote(noteId, req.body, userId);
      res.json(updatedNote);
    } catch (error) {
      if (error.message === 'Note not found or access denied') {
        return res.status(404).json({ message: error.message });
      }
      console.error('Error updating personal note:', error);
      res.status(500).json({ message: 'Failed to update note' });
    }
  });

  app.delete('/api/personal-notes/:id', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const noteId = req.params.id;
      
      await storage.deletePersonalNote(noteId, userId);
      res.json({ message: 'Note deleted successfully' });
    } catch (error) {
      if (error.message === 'Note not found or access denied') {
        return res.status(404).json({ message: error.message });
      }
      console.error('Error deleting personal note:', error);
      res.status(500).json({ message: 'Failed to delete note' });
    }
  });

  // Quiz attempt routes
  
  // Submit quiz attempt
  app.post("/api/quiz-attempts", isAuthenticated, async (req, res) => {
    try {
      const { quizId, answers, timeSpent } = req.body;
      const userId = req.user!.id;
      
      // Get quiz with questions
      const quiz = await storage.getQuizWithQuestions(quizId);
      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }
      
      // Calculate score
      let correctAnswers = 0;
      const totalQuestions = quiz.questions.length;
      const feedbackResults = [];
      
      for (const question of quiz.questions) {
        const userAnswer = answers[question.id];
        const correctAnswer = question.correctAnswer;
        let isCorrect = false;
        
        if (question.questionType === 'multiple_choice') {
          isCorrect = userAnswer === correctAnswer;
        } else if (question.questionType === 'true_false') {
          isCorrect = userAnswer === correctAnswer;
        } else if (question.questionType === 'fill_blank') {
          isCorrect = userAnswer?.toLowerCase().trim() === correctAnswer?.toLowerCase().trim();
        }
        
        if (isCorrect) {
          correctAnswers++;
        }
        
        feedbackResults.push({
          questionId: question.id,
          questionText: question.questionText,
          userAnswer,
          correctAnswer,
          isCorrect,
          explanation: question.explanation,
          points: isCorrect ? question.points : 0
        });
      }
      
      const score = Math.round((correctAnswers / totalQuestions) * 100);
      const passed = score >= quiz.passingScore;
      
      // Save attempt
      const attempt = await storage.createQuizAttempt({
        userId,
        quizId,
        score,
        totalQuestions,
        correctAnswers,
        timeSpent: timeSpent || null,
        passed,
        answers
      });
      
      res.json({
        attempt,
        feedback: feedbackResults,
        passed,
        score,
        passingScore: quiz.passingScore
      });
    } catch (error) {
      console.error("Error submitting quiz attempt:", error);
      res.status(500).json({ message: "Error submitting quiz attempt", error });
    }
  });
  
  // Get quiz attempts for a user and quiz
  app.get("/api/quiz-attempts/:quizId", isAuthenticated, async (req, res) => {
    try {
      const { quizId } = req.params;
      const userId = req.user!.id;
      
      const attempts = await storage.getQuizAttempts(userId, quizId);
      res.json(attempts);
    } catch (error) {
      console.error("Error fetching quiz attempts:", error);
      res.status(500).json({ message: "Error fetching quiz attempts", error });
    }
  });
  
  // Admin route to update quiz passing score
  app.patch("/api/admin/quiz/:quizId/passing-score", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const { quizId } = req.params;
      const { passingScore } = req.body;
      
      if (passingScore < 0 || passingScore > 100) {
        return res.status(400).json({ message: "Passing score must be between 0 and 100" });
      }
      
      const quiz = await storage.updateQuizPassingScore(quizId, passingScore);
      res.json(quiz);
    } catch (error) {
      console.error("Error updating quiz passing score:", error);
      res.status(500).json({ message: "Error updating quiz passing score", error });
    }
  });

  // Student Monitoring endpoints
  app.get("/api/student-monitoring", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const user = req.user as any;
      const { courseId } = req.query;

      let instructorId: string | undefined;
      
      // If user is instructor, filter by their courses only
      if (user.role === 'instructor') {
        instructorId = user.id;
      }

      const students = await storage.getStudentMonitoringData(
        instructorId, 
        courseId as string | undefined
      );
      
      res.json(students);
    } catch (error) {
      console.error('Error fetching student monitoring data:', error);
      res.status(500).json({ message: 'Failed to fetch student monitoring data' });
    }
  });

  app.get("/api/student-monitoring/summary", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const user = req.user as any;
      const { courseId } = req.query;

      let instructorId: string | undefined;
      
      // If user is instructor, filter by their courses only
      if (user.role === 'instructor') {
        instructorId = user.id;
      }

      const summary = await storage.getStudentActivitySummary(
        instructorId,
        courseId as string | undefined
      );
      
      res.json(summary);
    } catch (error) {
      console.error('Error fetching activity summary:', error);
      res.status(500).json({ message: 'Failed to fetch activity summary' });
    }
  });

  app.get("/api/student-monitoring/progress/:studentId", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const user = req.user as any;
      const { studentId } = req.params;

      let instructorId: string | undefined;
      
      // If user is instructor, filter by their courses only
      if (user.role === 'instructor') {
        instructorId = user.id;
      }

      const progress = await storage.getStudentCourseProgress(
        studentId,
        instructorId
      );
      
      res.json(progress);
    } catch (error) {
      console.error('Error fetching student progress:', error);
      res.status(500).json({ message: 'Failed to fetch student progress' });
    }
  });

  app.post("/api/student-monitoring/session", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const user = req.user as any;
      const sessionData = {
        ...req.body,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      };

      const session = await storage.trackStudentSession(user.id, sessionData);
      res.json(session);
    } catch (error) {
      console.error('Error tracking session:', error);
      res.status(500).json({ message: 'Failed to track session' });
    }
  });

  app.post("/api/student-monitoring/activity", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const user = req.user as any;
      const activity = await storage.updateStudentActivity(user.id, req.body);
      res.json(activity);
    } catch (error) {
      console.error('Error updating activity:', error);
      res.status(500).json({ message: 'Failed to update activity' });
    }
  });

  app.get("/api/student-monitoring/inactive", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const user = req.user as any;
      
      // Only admins and instructors can view inactive students
      if (user.role !== 'admin' && user.role !== 'instructor') {
        return res.status(403).json({ message: "Forbidden" });
      }

      const { days = 7 } = req.query;
      const inactiveStudents = await storage.getInactiveStudents(Number(days));
      
      res.json(inactiveStudents);
    } catch (error) {
      console.error('Error fetching inactive students:', error);
      res.status(500).json({ message: 'Failed to fetch inactive students' });
    }
  });

  // Prerequisite Management Routes
  
  // Course Prerequisites
  app.post("/api/courses/:courseId/prerequisites", isAuthenticated, isInstructor, async (req, res) => {
    try {
      const { courseId } = req.params;
      const { prerequisiteCourseId } = req.body;

      if (!prerequisiteCourseId) {
        return res.status(400).json({ message: "Prerequisite course ID is required" });
      }

      // Prevent self-reference
      if (courseId === prerequisiteCourseId) {
        return res.status(400).json({ message: "A course cannot be a prerequisite of itself" });
      }

      await storage.addCoursePrerequisite(courseId, prerequisiteCourseId);
      res.status(201).json({ message: "Prerequisite added successfully" });
    } catch (error) {
      console.error("Error adding course prerequisite:", error);
      res.status(500).json({ message: "Failed to add prerequisite" });
    }
  });

  app.delete("/api/courses/:courseId/prerequisites/:prerequisiteId", isAuthenticated, isInstructor, async (req, res) => {
    try {
      const { courseId, prerequisiteId } = req.params;
      await storage.removeCoursePrerequisite(courseId, prerequisiteId);
      res.json({ message: "Prerequisite removed successfully" });
    } catch (error) {
      console.error("Error removing course prerequisite:", error);
      res.status(500).json({ message: "Failed to remove prerequisite" });
    }
  });

  app.get("/api/courses/:courseId/prerequisites", async (req, res) => {
    try {
      const { courseId } = req.params;
      const prerequisites = await storage.getCoursePrerequisites(courseId);
      res.json(prerequisites);
    } catch (error) {
      console.error("Error fetching course prerequisites:", error);
      res.status(500).json({ message: "Failed to fetch prerequisites" });
    }
  });

  // Lesson Prerequisites
  app.post("/api/lessons/:lessonId/prerequisites", isAuthenticated, isInstructor, async (req, res) => {
    try {
      const { lessonId } = req.params;
      const { prerequisiteLessonId } = req.body;

      if (!prerequisiteLessonId) {
        return res.status(400).json({ message: "Prerequisite lesson ID is required" });
      }

      // Prevent self-reference
      if (lessonId === prerequisiteLessonId) {
        return res.status(400).json({ message: "A lesson cannot be a prerequisite of itself" });
      }

      await storage.addLessonPrerequisite(lessonId, prerequisiteLessonId);
      res.status(201).json({ message: "Prerequisite added successfully" });
    } catch (error) {
      console.error("Error adding lesson prerequisite:", error);
      res.status(500).json({ message: "Failed to add prerequisite" });
    }
  });

  app.delete("/api/lessons/:lessonId/prerequisites/:prerequisiteId", isAuthenticated, isInstructor, async (req, res) => {
    try {
      const { lessonId, prerequisiteId } = req.params;
      await storage.removeLessonPrerequisite(lessonId, prerequisiteId);
      res.json({ message: "Prerequisite removed successfully" });
    } catch (error) {
      console.error("Error removing lesson prerequisite:", error);
      res.status(500).json({ message: "Failed to remove prerequisite" });
    }
  });

  app.get("/api/lessons/:lessonId/prerequisites", async (req, res) => {
    try {
      const { lessonId } = req.params;
      const prerequisites = await storage.getLessonPrerequisites(lessonId);
      res.json(prerequisites);
    } catch (error) {
      console.error("Error fetching lesson prerequisites:", error);
      res.status(500).json({ message: "Failed to fetch prerequisites" });
    }
  });

  // Access Check Routes
  app.get("/api/courses/:courseId/access", isAuthenticated, async (req, res) => {
    try {
      const { courseId } = req.params;
      const user = req.user as any;
      const accessCheck = await storage.checkCourseAccess(user.id, courseId);
      res.json(accessCheck);
    } catch (error) {
      console.error("Error checking course access:", error);
      res.status(500).json({ message: "Failed to check course access" });
    }
  });

  app.get("/api/lessons/:lessonId/access", isAuthenticated, async (req, res) => {
    try {
      const { lessonId } = req.params;
      const user = req.user as any;
      const accessCheck = await storage.checkLessonAccess(user.id, lessonId);
      res.json(accessCheck);
    } catch (error) {
      console.error("Error checking lesson access:", error);
      res.status(500).json({ message: "Failed to check lesson access" });
    }
  });

  // Enhanced Audio Player API Routes
  
  // Get lesson progress
  app.get("/api/lessons/:lessonId/progress", async (req, res) => {
    try {
      if (!req.session || !(req.session as any).user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const user = (req.session as any).user;
      const { lessonId } = req.params;

      const progress = await storage.getLessonProgress(user.id, lessonId);
      res.json(progress || { lastPosition: 0, completed: false, watchTime: 0 });
    } catch (error) {
      console.error('Error fetching lesson progress:', error);
      res.status(500).json({ message: 'Failed to fetch lesson progress' });
    }
  });

  // Update lesson progress
  app.post("/api/lessons/:lessonId/progress", async (req, res) => {
    try {
      if (!req.session || !(req.session as any).user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const user = (req.session as any).user;
      const { lessonId } = req.params;
      const { lastPosition, completed, watchTime } = req.body;

      const progress = await storage.updateLessonProgress(user.id, lessonId, {
        lastPosition,
        completed,
        watchTime
      });

      res.json(progress);
    } catch (error) {
      console.error('Error updating lesson progress:', error);
      res.status(500).json({ message: 'Failed to update lesson progress' });
    }
  });

  // Get lesson notes
  app.get("/api/lessons/:lessonId/notes", async (req, res) => {
    try {
      if (!req.session || !(req.session as any).user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const user = (req.session as any).user;
      const { lessonId } = req.params;

      const notes = await storage.getLessonNotes(user.id, lessonId);
      res.json(notes);
    } catch (error) {
      console.error('Error fetching lesson notes:', error);
      res.status(500).json({ message: 'Failed to fetch lesson notes' });
    }
  });

  // Add lesson note
  app.post("/api/lessons/:lessonId/notes", async (req, res) => {
    try {
      if (!req.session || !(req.session as any).user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const user = (req.session as any).user;
      const { lessonId } = req.params;
      const { timestamp, content } = req.body;

      const note = await storage.addLessonNote(user.id, lessonId, timestamp, content);
      res.json(note);
    } catch (error) {
      console.error('Error adding lesson note:', error);
      res.status(500).json({ message: 'Failed to add lesson note' });
    }
  });

  // Delete lesson note
  app.delete("/api/lessons/:lessonId/notes/:noteId", async (req, res) => {
    try {
      if (!req.session || !(req.session as any).user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const user = (req.session as any).user;
      const { noteId } = req.params;

      await storage.deleteLessonNote(user.id, noteId);
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting lesson note:', error);
      res.status(500).json({ message: 'Failed to delete lesson note' });
    }
  });

  // Certificate generation and management endpoints
  app.post("/api/certificates/generate", isAuthenticated, async (req, res) => {
    try {
      const { type, courseId, bundleId, moduleContentId, emailCertificate } = req.body;
      const userId = (req.user as any).id;

      // Import certificate service
      const { certificateService } = await import('./certificateService');
      const { emailService } = await import('./emailService');

      // Check eligibility
      const isEligible = await storage.checkCertificateEligibility(userId, courseId, bundleId, moduleContentId);
      if (!isEligible) {
        return res.status(400).json({ message: "Not eligible for certificate" });
      }

      // Get user details
      const user = await storage.getUserById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      let title = '';
      let instructorName = '';
      let totalDuration = 0;
      let totalSessions = 0;
      let completedModules: string[] = [];

      if (type === 'session_completion' && moduleContentId) {
        // Get module content details
        const content = await storage.getModuleContentById(moduleContentId);
        if (!content) {
          return res.status(404).json({ message: "Content not found" });
        }
        title = content.title;
        totalDuration = content.duration || 0;
        totalSessions = 1;
        
        // Get instructor info from course
        const module = await storage.getModuleById(content.moduleId);
        if (module) {
          const course = await storage.getCourseById(module.courseId);
          if (course) {
            const instructor = await storage.getUserById(course.instructorId);
            instructorName = instructor ? `${instructor.firstName || ''} ${instructor.lastName || ''}`.trim() || instructor.email || 'Instructor' : 'Instructor';
          }
        }
      } else if (type === 'course_completion' && courseId) {
        // Get course details
        const course = await storage.getCourseById(courseId);
        if (!course) {
          return res.status(404).json({ message: "Course not found" });
        }
        title = course.title;
        totalDuration = course.duration || 0;
        
        const instructor = await storage.getUserById(course.instructorId);
        instructorName = instructor ? `${instructor.firstName || ''} ${instructor.lastName || ''}`.trim() || instructor.email || 'Instructor' : 'Instructor';
        
        // Get completed modules
        const modules = await storage.getModulesByCourseId(courseId);
        completedModules = modules.map(m => m.title);
        totalSessions = modules.reduce((acc, m) => acc + (m.content?.length || 0), 0);
      }

      // Generate certificate
      const certificateNumber = certificateService.generateCertificateNumber();
      const verificationCode = certificateService.generateVerificationCode();
      const learnerName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'Learner';

      const certificateData = {
        learnerName,
        title,
        description: `Certificate of completion for ${title}`,
        completionDate: new Date(),
        instructorName,
        certificateNumber,
        verificationCode,
        type,
        completedModules,
        totalDuration,
        totalSessions
      };

      const pdfBuffer = await certificateService.generateCertificate(certificateData);
      const filename = `certificate-${certificateNumber}.pdf`;
      const pdfUrl = await certificateService.saveCertificatePDF(pdfBuffer, filename);

      // Save certificate to database
      const certificate = await storage.createCertificate({
        userId,
        courseId,
        bundleId,
        moduleContentId,
        type,
        certificateNumber,
        title,
        description: certificateData.description,
        completionDate: certificateData.completionDate,
        totalDuration,
        totalSessions,
        instructorName,
        completedModules: JSON.stringify(completedModules),
        pdfUrl,
        verificationCode,
        emailSent: false
      });

      // Send email if requested
      if (emailCertificate && user.email) {
        const emailSent = await emailService.sendCertificateEmail(
          user.email,
          learnerName,
          type,
          title,
          pdfBuffer,
          certificateNumber
        );
        
        if (emailSent) {
          await storage.updateCertificateEmail(certificate.id, true);
        }
      }

      res.json({
        certificate: {
          ...certificate,
          downloadUrl: pdfUrl
        },
        message: "Certificate generated successfully"
      });
    } catch (error: any) {
      console.error('Error generating certificate:', error);
      res.status(500).json({ message: "Error generating certificate", error: error.message });
    }
  });

  app.get("/api/certificates", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const certificates = await storage.getUserCertificates(userId);
      res.json(certificates);
    } catch (error: any) {
      console.error('Error fetching certificates:', error);
      res.status(500).json({ message: "Error fetching certificates", error: error.message });
    }
  });

  app.get("/api/certificates/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const certificate = await storage.getCertificateById(id);
      
      if (!certificate) {
        return res.status(404).json({ message: "Certificate not found" });
      }

      // Check if user owns the certificate or is an admin/instructor
      const userId = (req.user as any).id;
      const user = await storage.getUserById(userId);
      
      if (certificate.userId !== userId && user?.role !== 'admin' && user?.role !== 'instructor') {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(certificate);
    } catch (error: any) {
      console.error('Error fetching certificate:', error);
      res.status(500).json({ message: "Error fetching certificate", error: error.message });
    }
  });

  app.get("/api/certificates/verify/:code", async (req, res) => {
    try {
      const { code } = req.params;
      const certificate = await storage.getCertificateByVerificationCode(code);
      
      if (!certificate) {
        return res.status(404).json({ message: "Certificate not found" });
      }

      // Get user name for verification display
      const user = await storage.getUserById(certificate.userId);
      const learnerName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email : 'Learner';

      // Return public certificate information for verification
      res.json({
        certificateNumber: certificate.certificateNumber,
        title: certificate.title,
        learnerName,
        completionDate: certificate.completionDate,
        instructorName: certificate.instructorName,
        type: certificate.type,
        verified: true
      });
    } catch (error: any) {
      console.error('Error verifying certificate:', error);
      res.status(500).json({ message: "Error verifying certificate", error: error.message });
    }
  });

  app.post("/api/certificates/:id/email", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = (req.user as any).id;
      
      const certificate = await storage.getCertificateById(id);
      if (!certificate || certificate.userId !== userId) {
        return res.status(404).json({ message: "Certificate not found" });
      }

      const user = await storage.getUserById(userId);
      if (!user?.email) {
        return res.status(400).json({ message: "No email address on file" });
      }

      // Import email service
      const { emailService } = await import('./emailService');

      // Read PDF file
      const fs = require('fs');
      const path = require('path');
      const pdfPath = path.join(process.cwd(), 'public', certificate.pdfUrl || '');
      
      if (!fs.existsSync(pdfPath)) {
        return res.status(404).json({ message: "Certificate file not found" });
      }

      const pdfBuffer = fs.readFileSync(pdfPath);
      const learnerName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email;

      const emailSent = await emailService.sendCertificateEmail(
        user.email,
        learnerName,
        certificate.type as 'session_completion' | 'course_completion',
        certificate.title,
        pdfBuffer,
        certificate.certificateNumber
      );

      if (emailSent) {
        await storage.updateCertificateEmail(certificate.id, true);
        res.json({ message: "Certificate sent successfully" });
      } else {
        res.status(500).json({ message: "Failed to send certificate email" });
      }
    } catch (error: any) {
      console.error('Error sending certificate email:', error);
      res.status(500).json({ message: "Error sending certificate email", error: error.message });
    }
  });

  // Promo code management routes
  app.get("/api/admin/promo-codes", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const promoCodes = await storage.getAllPromoCodes();
      res.json(promoCodes);
    } catch (error) {
      console.error("Error fetching promo codes:", error);
      res.status(500).json({ message: "Failed to fetch promo codes" });
    }
  });

  app.post("/api/admin/promo-codes", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const promoCodeData = req.body;
      
      // Validate required fields
      if (!promoCodeData.code || !promoCodeData.discountType || !promoCodeData.discountValue) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Validate discount value based on type
      if (promoCodeData.discountType === "percentage" && promoCodeData.discountValue > 100) {
        return res.status(400).json({ message: "Percentage discount cannot exceed 100%" });
      }

      if (promoCodeData.discountValue <= 0) {
        return res.status(400).json({ message: "Discount value must be greater than 0" });
      }

      // Check if promo code already exists
      const existingPromoCode = await storage.getPromoCodeByCode(promoCodeData.code);
      if (existingPromoCode) {
        return res.status(400).json({ message: "Promo code already exists" });
      }

      const promoCode = await storage.createPromoCode(promoCodeData);
      res.status(201).json(promoCode);
    } catch (error) {
      console.error("Error creating promo code:", error);
      res.status(500).json({ message: "Failed to create promo code" });
    }
  });

  app.patch("/api/admin/promo-codes/:id", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // If updating code, check for duplicates
      if (updateData.code) {
        const existingPromoCode = await storage.getPromoCodeByCode(updateData.code);
        if (existingPromoCode && existingPromoCode.id !== id) {
          return res.status(400).json({ message: "Promo code already exists" });
        }
      }

      // Validate discount value if provided
      if (updateData.discountValue !== undefined) {
        if (updateData.discountValue <= 0) {
          return res.status(400).json({ message: "Discount value must be greater than 0" });
        }
        
        if (updateData.discountType === "percentage" && updateData.discountValue > 100) {
          return res.status(400).json({ message: "Percentage discount cannot exceed 100%" });
        }
      }

      const promoCode = await storage.updatePromoCode(id, updateData);
      if (!promoCode) {
        return res.status(404).json({ message: "Promo code not found" });
      }

      res.json(promoCode);
    } catch (error) {
      console.error("Error updating promo code:", error);
      res.status(500).json({ message: "Failed to update promo code" });
    }
  });

  app.delete("/api/admin/promo-codes/:id", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      
      const success = await storage.deletePromoCode(id);
      if (!success) {
        return res.status(404).json({ message: "Promo code not found" });
      }

      res.json({ message: "Promo code deleted successfully" });
    } catch (error) {
      console.error("Error deleting promo code:", error);
      res.status(500).json({ message: "Failed to delete promo code" });
    }
  });

  // Get promo code statistics
  app.get("/api/admin/coupons/stats", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const stats = await storage.getPromoCodeStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching promo code stats:", error);
      res.status(500).json({ message: "Failed to fetch promo code statistics" });
    }
  });

  // Alias routes for coupon management (same as promo codes)
  app.get("/api/admin/coupons", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const promoCodes = await storage.getAllPromoCodes();
      res.json(promoCodes);
    } catch (error) {
      console.error("Error fetching coupons:", error);
      res.status(500).json({ message: "Failed to fetch coupons" });
    }
  });

  app.post("/api/admin/coupons", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const promoCodeData = req.body;
      
      // Validate required fields
      if (!promoCodeData.code || !promoCodeData.discountType || !promoCodeData.discountValue) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Validate discount value based on type
      if (promoCodeData.discountType === "percentage" && promoCodeData.discountValue > 100) {
        return res.status(400).json({ message: "Percentage discount cannot exceed 100%" });
      }

      if (promoCodeData.discountValue <= 0) {
        return res.status(400).json({ message: "Discount value must be greater than 0" });
      }

      // Check if promo code already exists
      const existingPromoCode = await storage.getPromoCodeByCode(promoCodeData.code);
      if (existingPromoCode) {
        return res.status(400).json({ message: "Coupon code already exists" });
      }

      const promoCode = await storage.createPromoCode(promoCodeData);
      res.status(201).json(promoCode);
    } catch (error) {
      console.error("Error creating coupon:", error);
      res.status(500).json({ message: "Failed to create coupon" });
    }
  });

  app.put("/api/admin/coupons/:id", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // If updating code, check for duplicates
      if (updateData.code) {
        const existingPromoCode = await storage.getPromoCodeByCode(updateData.code);
        if (existingPromoCode && existingPromoCode.id !== id) {
          return res.status(400).json({ message: "Coupon code already exists" });
        }
      }

      // Validate discount value if provided
      if (updateData.discountValue !== undefined) {
        if (updateData.discountValue <= 0) {
          return res.status(400).json({ message: "Discount value must be greater than 0" });
        }
        
        if (updateData.discountType === "percentage" && updateData.discountValue > 100) {
          return res.status(400).json({ message: "Percentage discount cannot exceed 100%" });
        }
      }

      const promoCode = await storage.updatePromoCode(id, updateData);
      if (!promoCode) {
        return res.status(404).json({ message: "Coupon not found" });
      }

      res.json(promoCode);
    } catch (error) {
      console.error("Error updating coupon:", error);
      res.status(500).json({ message: "Failed to update coupon" });
    }
  });

  app.delete("/api/admin/coupons/:id", isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      
      const success = await storage.deletePromoCode(id);
      if (!success) {
        return res.status(404).json({ message: "Coupon not found" });
      }

      res.json({ message: "Coupon deleted successfully" });
    } catch (error) {
      console.error("Error deleting coupon:", error);
      res.status(500).json({ message: "Failed to delete coupon" });
    }
  });

  // Validate promo code (for use in checkout)
  app.post("/api/promo-codes/validate", async (req, res) => {
    try {
      const { code } = req.body;
      
      if (!code) {
        return res.status(400).json({ message: "Promo code is required" });
      }

      const promoCode = await storage.validatePromoCode(code);
      if (!promoCode) {
        return res.status(404).json({ message: "Invalid promo code" });
      }

      res.json(promoCode);
    } catch (error) {
      console.error("Error validating promo code:", error);
      res.status(500).json({ message: "Failed to validate promo code" });
    }
  });

  // Tour Management Routes (Admin only)
  app.get('/api/admin/tour-sections', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const sections = await storage.getTourSections();
      res.json(sections);
    } catch (error) {
      console.error('Error fetching tour sections:', error);
      res.status(500).json({ message: 'Failed to fetch tour sections' });
    }
  });

  app.post('/api/admin/tour-sections', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const section = await storage.createTourSection(req.body);
      res.json(section);
    } catch (error) {
      console.error('Error creating tour section:', error);
      res.status(500).json({ message: 'Failed to create tour section' });
    }
  });

  app.put('/api/admin/tour-sections/:id', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const section = await storage.updateTourSection(req.params.id, req.body);
      res.json(section);
    } catch (error) {
      console.error('Error updating tour section:', error);
      res.status(500).json({ message: 'Failed to update tour section' });
    }
  });

  app.delete('/api/admin/tour-sections/:id', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      await storage.deleteTourSection(req.params.id);
      res.json({ message: 'Tour section deleted successfully' });
    } catch (error) {
      console.error('Error deleting tour section:', error);
      res.status(500).json({ message: 'Failed to delete tour section' });
    }
  });

  app.get('/api/admin/tour-faqs', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const faqs = await storage.getTourFAQs();
      res.json(faqs);
    } catch (error) {
      console.error('Error fetching tour FAQs:', error);
      res.status(500).json({ message: 'Failed to fetch tour FAQs' });
    }
  });

  app.post('/api/admin/tour-faqs', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const faq = await storage.createTourFAQ(req.body);
      res.json(faq);
    } catch (error) {
      console.error('Error creating tour FAQ:', error);
      res.status(500).json({ message: 'Failed to create tour FAQ' });
    }
  });

  app.put('/api/admin/tour-faqs/:id', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const faq = await storage.updateTourFAQ(req.params.id, req.body);
      res.json(faq);
    } catch (error) {
      console.error('Error updating tour FAQ:', error);
      res.status(500).json({ message: 'Failed to update tour FAQ' });
    }
  });

  app.delete('/api/admin/tour-faqs/:id', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      await storage.deleteTourFAQ(req.params.id);
      res.json({ message: 'Tour FAQ deleted successfully' });
    } catch (error) {
      console.error('Error deleting tour FAQ:', error);
      res.status(500).json({ message: 'Failed to delete tour FAQ' });
    }
  });

  app.put('/api/admin/tour-sections/reorder', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const { items } = req.body;
      await storage.reorderTourSections(items);
      res.json({ message: 'Tour sections reordered successfully' });
    } catch (error) {
      console.error('Error reordering tour sections:', error);
      res.status(500).json({ message: 'Failed to reorder tour sections' });
    }
  });

  app.put('/api/admin/tour-faqs/reorder', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const { items } = req.body;
      await storage.reorderTourFAQs(items);
      res.json({ message: 'Tour FAQs reordered successfully' });
    } catch (error) {
      console.error('Error reordering tour FAQs:', error);
      res.status(500).json({ message: 'Failed to reorder tour FAQs' });
    }
  });

  app.get('/api/admin/tour-settings', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const settings = await storage.getTourSettings();
      res.json(settings);
    } catch (error) {
      console.error('Error fetching tour settings:', error);
      res.status(500).json({ message: 'Failed to fetch tour settings' });
    }
  });

  app.put('/api/admin/tour-settings', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const settings = await storage.updateTourSettings(req.body);
      res.json(settings);
    } catch (error) {
      console.error('Error updating tour settings:', error);
      res.status(500).json({ message: 'Failed to update tour settings' });
    }
  });

  // Payment Settings Management Routes
  app.get('/api/admin/payment-settings', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const paymentSettings = await storage.getPaymentSettings();
      res.json(paymentSettings);
    } catch (error) {
      console.error('Error fetching payment settings:', error);
      res.status(500).json({ message: 'Failed to fetch payment settings' });
    }
  });

  app.post('/api/admin/payment-settings', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const paymentSettings = await storage.createPaymentSettings(req.body);
      res.json(paymentSettings);
    } catch (error) {
      console.error('Error creating payment settings:', error);
      res.status(500).json({ message: 'Failed to create payment settings' });
    }
  });

  app.put('/api/admin/payment-settings/:id', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const paymentSettings = await storage.updatePaymentSettings(id, req.body);
      res.json(paymentSettings);
    } catch (error) {
      console.error('Error updating payment settings:', error);
      res.status(500).json({ message: 'Failed to update payment settings' });
    }
  });

  app.delete('/api/admin/payment-settings/:id', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deletePaymentSettings(id);
      res.json({ message: 'Payment settings deleted successfully' });
    } catch (error) {
      console.error('Error deleting payment settings:', error);
      res.status(500).json({ message: 'Failed to delete payment settings' });
    }
  });

  // Public payment methods endpoint
  app.get('/api/payment-methods', async (req, res) => {
    try {
      const paymentSettings = await storage.getPaymentSettings();
      const enabledMethods = paymentSettings.filter(setting => setting.isEnabled);
      res.json(enabledMethods);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      res.status(500).json({ message: 'Failed to fetch payment methods' });
    }
  });

  // Promo code validation endpoint
  app.post('/api/promo/validate', async (req, res) => {
    try {
      const { code, itemType, itemId } = req.body;
      
      const promoCode = await storage.validatePromoCode(code, itemType, itemId);
      
      if (!promoCode) {
        return res.status(400).json({ message: 'Invalid or expired promo code' });
      }
      
      res.json(promoCode);
    } catch (error) {
      console.error('Error validating promo code:', error);
      res.status(500).json({ message: 'Failed to validate promo code' });
    }
  });

  // Order creation endpoint
  app.post('/api/orders', async (req, res) => {
    try {
      const { courseId, paymentMethod, promoCode, customerDetails, orderSummary } = req.body;
      
      // Create order record
      const orderData = {
        courseId,
        userId: req.isAuthenticated() ? req.user?.claims?.sub : null,
        status: 'pending',
        totalAmount: orderSummary.totalAmount,
        paymentMethod,
        promoCode: promoCode || null,
        customerDetails: JSON.stringify(customerDetails),
        orderDetails: JSON.stringify(orderSummary)
      };

      const order = await storage.createOrder(orderData);
      res.json(order);
    } catch (error) {
      console.error('Error creating order:', error);
      res.status(500).json({ message: 'Failed to create order' });
    }
  });

  // Payment Transaction Management Routes
  app.get('/api/admin/payment-transactions', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const transactions = await storage.getPaymentTransactions();
      res.json(transactions);
    } catch (error) {
      console.error('Error fetching payment transactions:', error);
      res.status(500).json({ message: 'Failed to fetch payment transactions' });
    }
  });

  app.post('/api/admin/payment-transactions/:id/verify', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { action, notes, rejectionReason } = req.body;
      const adminId = req.user?.claims?.sub;

      const result = await storage.verifyPaymentTransaction(id, action, {
        adminId,
        notes,
        rejectionReason
      });

      res.json(result);
    } catch (error) {
      console.error('Error verifying payment transaction:', error);
      res.status(500).json({ message: 'Failed to verify payment transaction' });
    }
  });

  app.post('/api/payment-transactions', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const transactionData = {
        ...req.body,
        userId,
        status: 'pending',
        verificationStatus: 'pending'
      };

      const transaction = await storage.createPaymentTransaction(transactionData);
      res.json(transaction);
    } catch (error) {
      console.error('Error creating payment transaction:', error);
      res.status(500).json({ message: 'Failed to create payment transaction' });
    }
  });



  // Receipt management routes
  app.get('/api/receipts/:transactionId', isAuthenticated, async (req, res) => {
    try {
      const { transactionId } = req.params;
      const receipt = await storage.getReceipt(transactionId);
      res.json(receipt);
    } catch (error) {
      console.error('Error fetching receipt:', error);
      res.status(500).json({ message: 'Failed to fetch receipt' });
    }
  });

  app.post('/api/receipts/:transactionId/regenerate', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const { transactionId } = req.params;
      const receipt = await storage.generateReceipt(transactionId);
      res.json(receipt);
    } catch (error) {
      console.error('Error regenerating receipt:', error);
      res.status(500).json({ message: 'Failed to regenerate receipt' });
    }
  });

  // Payment history routes
  app.get('/api/payment-history/:transactionId', isAuthenticated, async (req, res) => {
    try {
      const { transactionId } = req.params;
      const history = await storage.getPaymentHistory(transactionId);
      res.json(history);
    } catch (error) {
      console.error('Error fetching payment history:', error);
      res.status(500).json({ message: 'Failed to fetch payment history' });
    }
  });

  // Refund management routes
  app.get('/api/refunds/:transactionId', isAuthenticated, async (req, res) => {
    try {
      const { transactionId } = req.params;
      const refunds = await storage.getRefunds(transactionId);
      res.json(refunds);
    } catch (error) {
      console.error('Error fetching refunds:', error);
      res.status(500).json({ message: 'Failed to fetch refunds' });
    }
  });

  app.post('/api/refunds', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const refundData = {
        ...req.body,
        requestedBy: userId
      };
      
      const refund = await storage.createRefundRequest(req.body.transactionId, refundData);
      res.json(refund);
    } catch (error) {
      console.error('Error creating refund request:', error);
      res.status(500).json({ message: 'Failed to create refund request' });
    }
  });

  app.post('/api/admin/refunds/:refundId/process', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const { refundId } = req.params;
      const { action, notes } = req.body;
      const adminId = req.user?.claims?.sub;

      const result = await storage.processRefund(refundId, action, adminId, notes);
      res.json(result);
    } catch (error) {
      console.error('Error processing refund:', error);
      res.status(500).json({ message: 'Failed to process refund' });
    }
  });

  app.get('/api/admin/refunds', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const refunds = await storage.getAllRefunds();
      res.json(refunds);
    } catch (error) {
      console.error('Error fetching all refunds:', error);
      res.status(500).json({ message: 'Failed to fetch refunds' });
    }
  });

  // Student payment dashboard
  app.get('/api/student/payments', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const payments = await storage.getStudentPayments(userId);
      res.json(payments);
    } catch (error) {
      console.error('Error fetching student payments:', error);
      res.status(500).json({ message: 'Failed to fetch student payments' });
    }
  });

  // Payment analytics for admin
  app.get('/api/admin/payment-analytics', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const { startDate, endDate, paymentMethod } = req.query;
      const analytics = await storage.getPaymentAnalytics({
        startDate: startDate as string,
        endDate: endDate as string,
        paymentMethod: paymentMethod as string
      });
      res.json(analytics);
    } catch (error) {
      console.error('Error fetching payment analytics:', error);
      res.status(500).json({ message: 'Failed to fetch payment analytics' });
    }
  });

  // Course pricing routes
  app.patch('/api/admin/courses/:courseId/pricing', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const { courseId } = req.params;
      const pricingData = req.body;
      
      const updatedCourse = await storage.updateCoursePricing(courseId, pricingData);
      res.json(updatedCourse);
    } catch (error) {
      console.error('Error updating course pricing:', error);
      res.status(500).json({ message: 'Failed to update course pricing' });
    }
  });

  // Bundle management routes
  app.get('/api/admin/bundles', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const bundles = await storage.getAllBundles();
      res.json(bundles);
    } catch (error) {
      console.error('Error fetching bundles:', error);
      res.status(500).json({ message: 'Failed to fetch bundles' });
    }
  });

  app.get('/api/admin/bundles/:bundleId', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const { bundleId } = req.params;
      const bundle = await storage.getBundleById(bundleId);
      
      if (!bundle) {
        return res.status(404).json({ message: 'Bundle not found' });
      }
      
      res.json(bundle);
    } catch (error) {
      console.error('Error fetching bundle:', error);
      res.status(500).json({ message: 'Failed to fetch bundle' });
    }
  });

  app.post('/api/admin/bundles', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const bundleData = req.body;
      const userId = req.user?.claims?.sub;
      
      const bundle = await storage.createBundle({
        ...bundleData,
        createdById: userId,
      });
      
      res.status(201).json(bundle);
    } catch (error) {
      console.error('Error creating bundle:', error);
      res.status(500).json({ message: 'Failed to create bundle' });
    }
  });

  app.patch('/api/admin/bundles/:bundleId', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const { bundleId } = req.params;
      const bundleData = req.body;
      
      const updatedBundle = await storage.updateBundle(bundleId, bundleData);
      res.json(updatedBundle);
    } catch (error) {
      console.error('Error updating bundle:', error);
      res.status(500).json({ message: 'Failed to update bundle' });
    }
  });

  app.delete('/api/admin/bundles/:bundleId', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const { bundleId } = req.params;
      await storage.deleteBundle(bundleId);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting bundle:', error);
      res.status(500).json({ message: 'Failed to delete bundle' });
    }
  });

  app.post('/api/admin/bundles/:bundleId/courses/:courseId', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const { bundleId, courseId } = req.params;
      await storage.addCourseToBundle(bundleId, courseId);
      res.status(201).json({ message: 'Course added to bundle successfully' });
    } catch (error) {
      console.error('Error adding course to bundle:', error);
      res.status(500).json({ message: 'Failed to add course to bundle' });
    }
  });

  app.delete('/api/admin/bundles/:bundleId/courses/:courseId', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const { bundleId, courseId } = req.params;
      await storage.removeCourseFromBundle(bundleId, courseId);
      res.status(204).send();
    } catch (error) {
      console.error('Error removing course from bundle:', error);
      res.status(500).json({ message: 'Failed to remove course from bundle' });
    }
  });

  // Public bundle routes for students
  app.get('/api/bundles', async (req, res) => {
    try {
      const bundles = await storage.getAllBundles();
      const activeBundles = bundles.filter(bundle => bundle.isActive);
      res.json(activeBundles);
    } catch (error) {
      console.error('Error fetching public bundles:', error);
      res.status(500).json({ message: 'Failed to fetch bundles' });
    }
  });

  app.get('/api/bundles/:bundleId', async (req, res) => {
    try {
      const { bundleId } = req.params;
      const bundle = await storage.getBundleById(bundleId);
      
      if (!bundle || !bundle.isActive) {
        return res.status(404).json({ message: 'Bundle not found' });
      }
      
      res.json(bundle);
    } catch (error) {
      console.error('Error fetching public bundle:', error);
      res.status(500).json({ message: 'Failed to fetch bundle' });
    }
  });

  // Cart Routes
  app.get('/api/cart', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session?.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const cart = await storage.getOrCreateCart(userId);
      res.json(cart);
    } catch (error) {
      console.error('Error fetching cart:', error);
      res.status(500).json({ message: 'Failed to fetch cart' });
    }
  });

  app.post('/api/cart/add', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session?.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { itemType, itemId, quantity = 1 } = req.body;
      
      if (!itemType || !itemId) {
        return res.status(400).json({ message: 'Item type and ID are required' });
      }

      if (!['course', 'bundle'].includes(itemType)) {
        return res.status(400).json({ message: 'Invalid item type' });
      }

      // Check if item exists
      if (itemType === 'course') {
        const course = await storage.getCourseById(itemId);
        if (!course) {
          return res.status(404).json({ message: 'Course not found' });
        }
      }

      const cart = await storage.addToCart(userId, itemType, itemId, quantity);
      res.json(cart);
    } catch (error) {
      console.error('Error adding to cart:', error);
      res.status(500).json({ message: 'Failed to add item to cart' });
    }
  });

  app.delete('/api/cart/items/:itemId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session?.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { itemId } = req.params;
      const cart = await storage.removeFromCart(userId, itemId);
      res.json(cart);
    } catch (error) {
      console.error('Error removing from cart:', error);
      res.status(500).json({ message: 'Failed to remove item from cart' });
    }
  });

  app.patch('/api/cart/items/:itemId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session?.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { itemId } = req.params;
      const { quantity } = req.body;

      if (typeof quantity !== 'number' || quantity < 0) {
        return res.status(400).json({ message: 'Invalid quantity' });
      }

      const cart = await storage.updateCartItemQuantity(userId, itemId, quantity);
      res.json(cart);
    } catch (error) {
      console.error('Error updating cart item:', error);
      res.status(500).json({ message: 'Failed to update cart item' });
    }
  });

  app.delete('/api/cart/clear', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session?.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      await storage.clearCart(userId);
      res.json({ message: 'Cart cleared successfully' });
    } catch (error) {
      console.error('Error clearing cart:', error);
      res.status(500).json({ message: 'Failed to clear cart' });
    }
  });

  app.get('/api/cart/count', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session?.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const count = await storage.getCartItemCount(userId);
      res.json({ count });
    } catch (error) {
      console.error('Error fetching cart count:', error);
      res.status(500).json({ message: 'Failed to fetch cart count' });
    }
  });

  // Protected Content Library Routes
  app.get('/api/admin/library-content', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const content = await storage.getAllLibraryContent();
      res.json(content);
    } catch (error) {
      console.error('Error fetching library content:', error);
      res.status(500).json({ message: 'Failed to fetch library content' });
    }
  });

  app.get('/api/admin/library-categories', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const categories = await storage.getAllLibraryCategories();
      res.json(categories);
    } catch (error) {
      console.error('Error fetching library categories:', error);
      res.status(500).json({ message: 'Failed to fetch library categories' });
    }
  });

  app.post('/api/admin/library-content', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const contentData = {
        ...req.body,
        uploadedBy: userId,
        tags: req.body.tags ? req.body.tags.split(',').map((tag: string) => tag.trim()) : []
      };

      const newContent = await storage.createLibraryContent(contentData);
      res.status(201).json(newContent);
    } catch (error) {
      console.error('Error creating library content:', error);
      res.status(500).json({ message: 'Failed to create library content' });
    }
  });

  app.put('/api/admin/library-content/:id', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const contentData = {
        ...req.body,
        tags: req.body.tags ? req.body.tags.split(',').map((tag: string) => tag.trim()) : []
      };

      const updatedContent = await storage.updateLibraryContent(id, contentData);
      res.json(updatedContent);
    } catch (error) {
      console.error('Error updating library content:', error);
      res.status(500).json({ message: 'Failed to update library content' });
    }
  });

  app.delete('/api/admin/library-content/:id', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteLibraryContent(id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting library content:', error);
      res.status(500).json({ message: 'Failed to delete library content' });
    }
  });

  app.post('/api/admin/library-content/:id/access', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { userIds } = req.body;
      const adminId = (req.user as any)?.claims?.sub;

      if (!adminId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const accessPromises = userIds.map((userId: string) => 
        storage.grantContentAccess(id, userId, adminId)
      );

      await Promise.all(accessPromises);
      res.status(201).json({ message: 'Access granted successfully' });
    } catch (error) {
      console.error('Error granting content access:', error);
      res.status(500).json({ message: 'Failed to grant content access' });
    }
  });

  app.delete('/api/admin/library-content/:id/access/:userId', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const { id, userId } = req.params;
      await storage.revokeContentAccess(id, userId);
      res.status(204).send();
    } catch (error) {
      console.error('Error revoking content access:', error);
      res.status(500).json({ message: 'Failed to revoke content access' });
    }
  });

  app.get('/api/admin/library-content/:id/access', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const accessList = await storage.getContentAccessList(id);
      res.json(accessList);
    } catch (error) {
      console.error('Error fetching content access list:', error);
      res.status(500).json({ message: 'Failed to fetch content access list' });
    }
  });

  app.post('/api/admin/library-categories', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const newCategory = await storage.createLibraryCategory(req.body);
      res.status(201).json(newCategory);
    } catch (error) {
      console.error('Error creating library category:', error);
      res.status(500).json({ message: 'Failed to create library category' });
    }
  });

  app.put('/api/admin/library-categories/:id', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const updatedCategory = await storage.updateLibraryCategory(id, req.body);
      res.json(updatedCategory);
    } catch (error) {
      console.error('Error updating library category:', error);
      res.status(500).json({ message: 'Failed to update library category' });
    }
  });

  app.delete('/api/admin/library-categories/:id', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteLibraryCategory(id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting library category:', error);
      res.status(500).json({ message: 'Failed to delete library category' });
    }
  });

  // Student Library Access Routes
  app.get('/api/library/my-content', isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const accessibleContent = await storage.getUserAccessibleContent(userId);
      res.json(accessibleContent);
    } catch (error) {
      console.error('Error fetching user accessible content:', error);
      res.status(500).json({ message: 'Failed to fetch accessible content' });
    }
  });

  app.get('/api/library/content/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = (req.user as any)?.claims?.sub;

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const hasAccess = await storage.checkContentAccess(id, userId);
      if (!hasAccess) {
        return res.status(403).json({ message: 'Access denied to this content' });
      }

      const content = await storage.getLibraryContentById(id);
      if (!content) {
        return res.status(404).json({ message: 'Content not found' });
      }

      res.json(content);
    } catch (error) {
      console.error('Error fetching library content:', error);
      res.status(500).json({ message: 'Failed to fetch content' });
    }
  });

  app.post('/api/library/content/:id/view', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = (req.user as any)?.claims?.sub;

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const hasAccess = await storage.checkContentAccess(id, userId);
      if (!hasAccess) {
        return res.status(403).json({ message: 'Access denied to this content' });
      }

      const viewData = {
        ...req.body,
        sessionId: req.sessionID,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      };

      const view = await storage.recordContentView(id, userId, viewData);
      res.status(201).json(view);
    } catch (error) {
      console.error('Error recording content view:', error);
      res.status(500).json({ message: 'Failed to record content view' });
    }
  });

  app.get('/api/admin/library-content/:id/stats', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const stats = await storage.getContentViewStats(id);
      res.json(stats);
    } catch (error) {
      console.error('Error fetching content stats:', error);
      res.status(500).json({ message: 'Failed to fetch content stats' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

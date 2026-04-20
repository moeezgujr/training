# Meeting Matters LMS

## Overview

Meeting Matters LMS is a comprehensive Learning Management System designed to provide a complete educational platform. It features course management, secure user authentication, detailed progress tracking, versatile assessment tools, and automated certificate generation. The system supports various user roles (admin, instructor, learner) and integrates interactive quizzes, file uploads, payment processing, and email notifications to create a rich learning environment.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom components using Radix UI and Shadcn/ui
- **State Management**: TanStack Query
- **Routing**: Wouter

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: OpenID Connect (OIDC) integration with Replit Auth
- **Session Management**: Express sessions with PostgreSQL store
- **File Handling**: Multer for uploads
- **Email Service**: SendGrid and Nodemailer integration
- **Environment Management**: Centralized, typed configuration with Zod validation

### Data Flow
- **Authentication**: OIDC-based with role-based access control.
- **Course Management**: Instructors create hierarchical courses (Course → Module → Content) with various media types.
- **Student Enrollment**: Learners enroll, track progress, and complete interactive assessments.
- **Certificate Generation**: PDF certificates are generated upon course completion.
- **Payment Processing**: Integrated Stripe and PayPal for course purchases and subscriptions.

### Key Features
- **User Management**: Role-based access control and user profiles.
- **Course System**: Drag-and-drop course builder, content protection, and prerequisite management.
- **Assessment Engine**: Multiple question types, time tracking, and instant feedback.
- **Content Management**: File upload system with automatic media duration calculation and content library.
- **Certificate System**: Customizable PDF certificates with verification features.
- **Payment Integration**: Stripe and PayPal for course purchases, including promo codes and subscriptions.

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL connectivity
- **drizzle-orm**: Type-safe ORM
- **express**: Web application framework
- **react**: Frontend UI library
- **typescript**: Language support

### Authentication & Security
- **openid-client**: OIDC authentication
- **passport**: Authentication middleware
- **express-session**: Session management
- **connect-pg-simple**: PostgreSQL session store

### UI & Styling
- **@radix-ui/***: Headless UI components
- **tailwindcss**: CSS framework
- **lucide-react**: Icon library
- **@dnd-kit/***: Drag and drop functionality

### File Processing
- **multer**: File upload handling
- **sharp**: Image processing
- **pdf-lib**: PDF generation
- **get-video-duration**: Media duration extraction

### Email & Notifications
- **@sendgrid/mail**: Email service integration
- **nodemailer**: Alternative email service

### Payment Processing
- **@stripe/stripe-js**: Stripe integration
- **@paypal/paypal-server-sdk**: PayPal integration
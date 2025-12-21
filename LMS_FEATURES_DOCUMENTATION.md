# Meeting Matters LMS - Features & Functionalities Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [User Roles & Authentication](#user-roles--authentication)
3. [Student Features](#student-features)
4. [Instructor Features](#instructor-features)
5. [Admin Features](#admin-features)
6. [Course Management System](#course-management-system)
7. [Content Management](#content-management)
8. [Assessment & Quiz Engine](#assessment--quiz-engine)
9. [Certificate System](#certificate-system)
10. [Payment & E-commerce](#payment--e-commerce)
11. [Communication System](#communication-system)
12. [Technical Architecture](#technical-architecture)
13. [API Endpoints Overview](#api-endpoints-overview)

---

## System Overview

Meeting Matters LMS is a comprehensive Learning Management System built with modern web technologies. It provides a complete educational platform supporting multiple user roles, course management, progress tracking, assessments, certificate generation, and payment processing.

### Core Capabilities
- Multi-role user management (Admin, Instructor, Learner)
- Hierarchical course structure (Course → Module → Content)
- Interactive assessments and quizzes
- Certificate generation with PDF export
- E-commerce functionality with shopping cart
- Payment processing (Stripe & PayPal)
- Student progress tracking and analytics
- Email notifications and communications
- Content library management
- Note-taking and bookmarking

---

## User Roles & Authentication

### Authentication Methods
1. **Email/Password Authentication**
   - User registration with validation
   - Secure password hashing (bcrypt with 12 salt rounds)
   - Session-based authentication
   - Role-based access control

2. **Google OAuth (Optional)**
   - Single Sign-On with Google accounts
   - Automatic user creation from Google profile
   - Email verification through Google

### User Roles

#### 1. **Learner (Student)**
- Default role for new registrations
- Can enroll in courses
- Submit assignments and take quizzes
- Earn certificates upon completion
- Purchase courses through the platform

#### 2. **Instructor**
- Create and manage courses
- Grade assignments and view quiz results
- Monitor student progress
- Access teaching analytics
- Manage course content and modules

#### 3. **Admin**
- Full system access
- User management and role assignment
- Course approval and oversight
- Payment processing and verification
- System-wide analytics and reporting
- Certificate template management
- Content library administration

### User Profile Information
- Basic information: First name, last name, email
- Extended profile: Date of birth, gender, country, city
- Contact: Phone number, emergency contact
- Education: Education level, field of study
- Learning preferences: Learning goals, interests
- Marketing: Email subscription preferences
- Account status: Email verification, active status

---

## Student Features

### Course Discovery & Enrollment
- **Browse Courses**: View all published courses with thumbnails and descriptions
- **Course Details**: View detailed course information, modules, and content
- **Shopping Cart**: Add multiple courses to cart before checkout
- **Recommendations**: Receive personalized course recommendations
- **Enrollment Status**: Track enrolled vs. available courses

### Learning Experience
- **Module Navigation**: Progress through courses module-by-module
- **Content Types**: Access videos, audio, PDFs, and documents
- **Progress Tracking**: Automatic tracking of completed content
- **Sequential Learning**: Complete content in order (if prerequisites set)
- **Duration Tracking**: View estimated time for each content item

### Assessment & Assignments
- **Interactive Quizzes**: 
  - Multiple choice questions
  - True/false questions
  - Fill-in-the-blank questions
  - Immediate feedback on answers
  - Passing score requirements
  - Multiple attempt support

- **Assignment Submission**:
  - Upload assignment files
  - View submission history
  - Receive grades and feedback
  - Track submission deadlines

### Note-Taking
- **Personal Notes**: Create notes while learning
- **Rich Text Editor**: Format notes with Quill.js
- **Search Functionality**: Search across all notes
- **Organization**: Associate notes with specific courses/modules
- **CRUD Operations**: Create, read, update, delete notes

### Certificates
- **Automatic Generation**: Receive certificates upon course completion
- **PDF Download**: Download certificates as PDF files
- **Certificate Verification**: Unique verification codes
- **Email Delivery**: Certificates sent via email
- **View History**: Access all earned certificates

### Shopping & Payment
- **Shopping Cart**: Add/remove courses, view totals
- **Promo Codes**: Apply discount codes at checkout
- **Multiple Payment Options**: Stripe and PayPal integration
- **Payment History**: View all transactions and receipts
- **Order Management**: Track order status and details

---

## Instructor Features

### Course Creation & Management
- **Course Builder**: Drag-and-drop course creation interface
- **Course Information**:
  - Title and description
  - Course thumbnail image
  - Tags and categorization
  - Duration and difficulty level
  - Pricing information

- **Module Management**:
  - Create hierarchical course structure
  - Set module order and prerequisites
  - Add descriptions to modules
  - Reorder modules via drag-and-drop

- **Content Upload**:
  - Video content (MP4, AVI, MOV, WMV, FLV, WebM)
  - Audio content (MP3, WAV, OGG, M4A, AAC)
  - PDF documents
  - Word documents (DOC, DOCX)
  - Automatic duration calculation
  - File size limits and validation

### Assessment Creation
- **Quiz Builder**:
  - Create multiple question types
  - Set correct answers and explanations
  - Assign points per question
  - Set passing score thresholds
  - Preview quizzes before publishing

- **Assignment Management**:
  - Create assignment descriptions
  - Set due dates and submission requirements
  - Specify grading criteria
  - Attach reference materials

### Student Monitoring
- **Progress Tracking**:
  - View student enrollment data
  - Monitor course completion rates
  - Track module and content completion
  - View quiz scores and attempts
  - Monitor assignment submissions

- **Grading Tools**:
  - Grade assignment submissions
  - Provide feedback to students
  - Track grading history
  - Bulk grading capabilities

### Analytics & Reporting
- **Course Analytics**:
  - Enrollment statistics
  - Completion rates
  - Average quiz scores
  - Time spent on content
  - Student engagement metrics

- **Student Analytics**:
  - Individual student progress
  - Performance trends
  - Inactive student identification
  - Session tracking

### Course Management
- **Publish/Unpublish**: Control course visibility
- **Course Duplication**: Clone existing courses
- **Status Management**: Draft, Published, Archived states
- **Course Deletion**: Remove courses (with safeguards)

---

## Admin Features

### User Management
- **View All Users**: Comprehensive user list with filters
- **Create Users**: Manual user creation with role assignment
- **Edit Users**: Update user information and profiles
- **Delete Users**: Remove users from the system
- **Role Management**: Assign/change user roles
- **Instructor Creation**: Dedicated instructor account creation
- **User Statistics**: Active users, registrations, demographics

### Course Administration
- **Course Oversight**: View all courses regardless of status
- **Course Statistics**: Enrollment, completion, revenue data
- **Course Approval**: Review and approve instructor courses
- **Pricing Management**: Set and update course prices
- **Bundle Management**: Create course bundles with package pricing
- **Course Editing**: Modify any course content
- **Course Deletion**: Remove courses with confirmation

### Payment Management
- **Payment Settings**:
  - Configure Stripe API keys
  - Configure PayPal credentials
  - Set default payment provider
  - Manage payment account settings

- **Transaction Management**:
  - View all payment transactions
  - Verify manual payments
  - Process refunds
  - Generate receipts
  - Payment analytics dashboard

- **Promo Code System**:
  - Create discount codes
  - Set percentage or fixed amount discounts
  - Set usage limits and expiration dates
  - Track promo code usage
  - Enable/disable promo codes

- **Refund Management**:
  - View refund requests
  - Process refunds
  - Track refund history
  - Refund reasons and notes

### Certificate Management
- **Certificate Templates**:
  - Create custom certificate templates
  - Define certificate layouts
  - Set template variables (name, date, course)
  - Preview templates

- **Certificate Issuance**:
  - Manually issue certificates
  - Bulk certificate generation
  - View all issued certificates
  - Resend certificates via email
  - Certificate verification codes

### Content Library
- **Library Management**:
  - Upload reusable content
  - Categorize content
  - Set access permissions
  - Track content usage
  - Content analytics

- **Access Control**:
  - Grant/revoke user access
  - Role-based content access
  - Content visibility settings
  - Access history tracking

### Enrollment Management
- **Manual Enrollment**: Enroll students in courses
- **Bulk Enrollment**: Enroll multiple students at once
- **Enrollment Status**: Track enrollment dates and progress
- **Enrollment Reports**: Generate enrollment reports

### Communication Tools
- **Email Notifications**:
  - Welcome emails to new users
  - Registration notifications
  - Course enrollment confirmations
  - Certificate delivery
  - Payment receipts

- **Bulk Communications**: Send announcements to user groups

### System Analytics
- **Dashboard Metrics**:
  - Total users, courses, enrollments
  - Revenue tracking
  - Active users and sessions
  - Completion rates
  - Payment statistics

- **Payment Analytics**:
  - Revenue by course
  - Revenue by time period
  - Payment method breakdown
  - Refund statistics

### Onboarding Tour Management
- **Tour Sections**: Create guided tours for new users
- **FAQ Management**: Manage frequently asked questions
- **Tour Settings**: Configure tour behavior and visibility
- **Section Ordering**: Reorder tour steps

### Database Seeding
- **Sample Data**: Generate sample courses and users for testing
- **Demo Course**: Create demo courses for demonstrations

---

## Course Management System

### Course Structure
```
Course
├── Basic Information
│   ├── Title
│   ├── Description
│   ├── Thumbnail Image
│   ├── Tags
│   ├── Status (Draft/Published/Archived)
│   └── Pricing
├── Modules
│   ├── Module 1
│   │   ├── Title & Description
│   │   ├── Order/Sequence
│   │   └── Content Items
│   │       ├── Videos
│   │       ├── Audio
│   │       ├── Documents
│   │       ├── Quizzes
│   │       └── Assignments
│   └── Module 2...
└── Enrollment & Prerequisites
```

### Course Creation Workflow
1. **Course Setup**: Create course with basic information
2. **Module Creation**: Add modules in desired order
3. **Content Upload**: Upload content to each module
4. **Assessment Addition**: Add quizzes and assignments
5. **Preview**: Review course structure
6. **Publishing**: Publish course for student enrollment

### Course Features
- **Prerequisites**: Require completion of other courses
- **Sequential Learning**: Lock content until previous items completed
- **Duration Tracking**: Automatic duration calculation for all content
- **Progress Tracking**: Track student progress through courses
- **Completion Certificates**: Auto-generate upon completion

---

## Content Management

### Supported Content Types

#### 1. **Video Content**
- **Formats**: MP4, AVI, MOV, WMV, FLV, WebM
- **Max Size**: 100MB
- **Features**: 
  - Automatic duration calculation
  - Embedded video player
  - Progress tracking
  - Playback controls

#### 2. **Audio Content**
- **Formats**: MP3, WAV, OGG, M4A, AAC
- **Max Size**: 50MB
- **Features**:
  - Enhanced audio player
  - Automatic duration calculation
  - Waveform visualization
  - Playback speed control

#### 3. **Document Content**
- **PDF Files**: Full PDF rendering
- **Word Documents**: DOC, DOCX support
- **Max Size**: 100MB
- **Features**:
  - In-browser PDF viewer
  - Page count calculation
  - Duration estimation (reading time)
  - Download capability

#### 4. **Image Content**
- **Formats**: JPEG, PNG, GIF, WebP
- **Max Size**: 5MB
- **Features**:
  - Automatic optimization (Sharp.js)
  - Thumbnail generation (1200x675)
  - Quality compression (85%)
  - Progressive JPEG loading

### Upload System
- **Memory-based Upload**: Multer with memory storage
- **File Type Validation**: MIME type checking
- **Size Validation**: Per-file type size limits
- **Error Handling**: Detailed error messages
- **Progress Tracking**: Upload progress indicators

### Duration Calculation
- **Video**: Extracted using get-video-duration library
- **Audio**: Extracted using get-audio-duration library
- **PDF**: Estimated based on page count (2 minutes per page)
- **Documents**: Fallback estimation (5 minutes)

---

## Assessment & Quiz Engine

### Question Types

#### 1. **Multiple Choice**
- Single correct answer from multiple options
- 2-6 answer options
- Points per question
- Explanation for correct answer

#### 2. **True/False**
- Binary choice questions
- Simplified multiple choice
- Quick assessment format

#### 3. **Fill-in-the-Blank**
- Text input answers
- Case-sensitive or insensitive matching
- Multiple acceptable answers support

### Quiz Features
- **Attempts**: Track all quiz attempts per student
- **Scoring**: Automatic grading with immediate feedback
- **Passing Score**: Set minimum passing percentage
- **Time Tracking**: Record time spent on quizzes
- **Review Mode**: Students can review answers after submission
- **Explanations**: Show explanations for correct/incorrect answers
- **Progress Impact**: Quiz completion required for course progress

### Assignment System
- **File Upload**: Students upload assignment files
- **Submission Tracking**: Track submission date and time
- **Grading**: Instructors assign scores and feedback
- **Multiple Submissions**: Support for resubmissions
- **Grade History**: Track grading history
- **Feedback**: Text feedback from instructors

---

## Certificate System

### Certificate Generation
- **Automatic Trigger**: Generated upon course completion
- **PDF Generation**: Using pdf-lib library
- **Custom Templates**: Admin-configurable templates
- **Personalization**: Student name, course title, completion date
- **Verification Code**: Unique code for authenticity
- **Digital Signature**: Optional signature images

### Certificate Features
- **PDF Download**: Download certificates as PDF
- **HTML Preview**: View certificates in browser
- **Email Delivery**: Automatic email delivery upon issuance
- **Certificate Library**: Students can view all earned certificates
- **Re-send Option**: Admin can resend certificates via email
- **Template Management**: Multiple certificate templates
- **Verification System**: Verify certificate authenticity

### Certificate Templates
- **Custom Layouts**: HTML-based templates
- **Variables**: Dynamic content (name, course, date, etc.)
- **Styling**: CSS styling for professional appearance
- **Logo Integration**: Include organization logos
- **Preview Mode**: Preview before issuance

---

## Payment & E-commerce

### Shopping Cart System
- **Add to Cart**: Add courses to shopping cart
- **Remove Items**: Remove individual items
- **Update Quantity**: Modify cart quantities
- **Cart Persistence**: Cart saved in database
- **Cart Count**: Display cart item count
- **Clear Cart**: Empty entire cart
- **Cart Calculation**: Automatic total calculation

### Checkout Process
1. **Cart Review**: Review items and quantities
2. **Promo Code**: Apply discount codes
3. **Order Calculation**: Calculate total with discounts
4. **Payment Method**: Select Stripe or PayPal
5. **Payment Processing**: Process payment
6. **Enrollment**: Automatic course enrollment
7. **Confirmation**: Email receipt and confirmation

### Payment Integration

#### Stripe Integration
- **Stripe Checkout**: Embedded payment form
- **Payment Intents**: Secure payment processing
- **Card Payments**: Credit/debit card support
- **3D Secure**: Enhanced security for card payments
- **Webhook Support**: Payment status updates

#### PayPal Integration
- **PayPal SDK**: Server-side PayPal integration
- **PayPal Checkout**: PayPal payment flow
- **Payment Capture**: Automatic payment capture
- **Refund Support**: Process refunds through PayPal

### Promo Code System
- **Discount Types**: Percentage or fixed amount
- **Usage Limits**: Maximum number of uses
- **Expiration Dates**: Time-limited promotions
- **Course Restrictions**: Apply to specific courses
- **User Restrictions**: Limit to specific users
- **Validation**: Real-time code validation
- **Usage Tracking**: Track promo code usage

### Payment Management
- **Transaction History**: View all transactions
- **Payment Verification**: Manual payment verification
- **Receipt Generation**: Automatic receipt creation
- **Refund Processing**: Process refunds
- **Payment Analytics**: Revenue tracking and reporting

### Bundle Pricing
- **Course Bundles**: Package multiple courses
- **Bundle Pricing**: Discounted bundle rates
- **Bundle Management**: Add/remove courses from bundles
- **Bundle Enrollment**: Enroll in all bundle courses

---

## Communication System

### Email Service
- **Multiple Providers**: SendGrid and Nodemailer support
- **Email Templates**: HTML email templates
- **Transactional Emails**:
  - Welcome emails
  - Registration confirmations
  - Enrollment notifications
  - Certificate delivery
  - Payment receipts
  - Password reset (if implemented)

### Notification Types
1. **Student Registration**: Admin notified of new registrations
2. **Course Enrollment**: Student notified of enrollment
3. **Certificate Issuance**: Student receives certificate via email
4. **Payment Confirmation**: Receipt sent after payment
5. **Assignment Grading**: Student notified of grades
6. **Course Completion**: Congratulations on course completion

### Email Configuration
- **SMTP Settings**: Configurable SMTP server
- **SendGrid API**: SendGrid API key configuration
- **From Address**: Customizable sender email
- **Template Customization**: Custom email templates

---

## Technical Architecture

### Frontend Stack
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack Query (React Query)
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/ui with Radix UI primitives
- **Forms**: React Hook Form with Zod validation
- **Rich Text**: Quill.js for note editor
- **Drag & Drop**: @dnd-kit for course builder

### Backend Stack
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Express Session + Passport.js
- **Session Store**: PostgreSQL session store
- **File Uploads**: Multer
- **Image Processing**: Sharp
- **PDF Generation**: pdf-lib
- **Email**: SendGrid + Nodemailer

### Database Schema
- **Users**: User accounts and profiles
- **Courses**: Course information and metadata
- **Modules**: Course modules and structure
- **ModuleContent**: Content items (videos, PDFs, etc.)
- **Enrollments**: Student course enrollments
- **Progress**: Content completion tracking
- **Quizzes**: Quiz definitions
- **QuizQuestions**: Individual quiz questions
- **QuizAttempts**: Student quiz attempts
- **Assignments**: Assignment definitions
- **AssignmentSubmissions**: Student submissions
- **Certificates**: Issued certificates
- **CertificateTemplates**: Certificate templates
- **ShoppingCart**: User shopping carts
- **CartItems**: Individual cart items
- **Orders**: Purchase orders
- **PaymentTransactions**: Payment records
- **PromoCodes**: Discount codes
- **PersonalNotes**: User notes
- **LibraryContent**: Content library items

### Security Features
- **Password Hashing**: bcrypt with 12 salt rounds
- **Session Management**: Secure session cookies
- **CSRF Protection**: Session-based CSRF protection
- **Role-based Access**: Middleware for role verification
- **Input Validation**: Zod schema validation
- **SQL Injection Prevention**: Parameterized queries via Drizzle ORM
- **File Upload Validation**: MIME type and size validation
- **XSS Prevention**: React's built-in XSS protection

### Performance Optimizations
- **Database Connection Pooling**: Efficient database connections
- **Image Optimization**: Automatic image compression
- **Caching**: React Query caching for API responses
- **Lazy Loading**: Code splitting and lazy route loading
- **Progressive Images**: Progressive JPEG loading

---

## API Endpoints Overview

### Authentication Endpoints
```
POST   /api/signup                          # User registration
POST   /api/login                           # User login
GET    /api/logout                          # User logout
GET    /api/auth/user                       # Get current user
POST   /api/auth/register                   # Extended registration
GET    /auth/google                         # Google OAuth initiation
GET    /auth/google/callback                # Google OAuth callback
```

### User Management (Admin)
```
GET    /api/admin/users                     # List all users
POST   /api/admin/users                     # Create user
PUT    /api/admin/users/:id                 # Update user
DELETE /api/admin/users/:id                 # Delete user
PATCH  /api/users/:id/role                  # Update user role
POST   /api/admin/create-instructor         # Create instructor
```

### Course Endpoints
```
GET    /api/courses                         # List published courses
GET    /api/courses/:id                     # Get course details
GET    /api/courses/enrolled                # User's enrolled courses
GET    /api/courses/recommended             # Recommended courses
GET    /api/instructor/courses              # Instructor's courses
POST   /api/instructor/courses              # Create course
PUT    /api/courses/:id                     # Update course
DELETE /api/instructor/courses/:id          # Delete course
PATCH  /api/instructor/courses/:id/publish  # Publish course
POST   /api/instructor/courses/:id/duplicate # Duplicate course
GET    /api/admin/courses                   # Admin: all courses
PATCH  /api/admin/courses/:courseId/pricing # Update pricing
```

### Module & Content Endpoints
```
POST   /api/instructor/courses/:courseId/modules       # Create module
GET    /api/courses/:courseId/modules                  # List modules
POST   /api/instructor/modules/:id/content             # Add content
POST   /api/instructor/modules/:id/quizzes             # Add quiz
POST   /api/instructor/modules/:id/assignments         # Add assignment
POST   /api/modules/content/:id/complete               # Mark complete
```

### Assessment Endpoints
```
POST   /api/quiz-attempts                   # Submit quiz
GET    /api/quiz-attempts/:quizId           # Get quiz attempts
POST   /api/assignments/:id/submit          # Submit assignment
POST   /api/instructor/assignments/:id/grade # Grade assignment
PATCH  /api/admin/quiz/:quizId/passing-score # Update passing score
```

### Certificate Endpoints
```
GET    /api/certificates                    # User's certificates
GET    /api/certificates/:id                # Certificate details
GET    /api/certificates/:id/view           # View certificate HTML
GET    /api/certificates/:id/download       # Download PDF
POST   /api/certificates/generate           # Generate certificate
GET    /api/admin/certificates              # All certificates
POST   /api/admin/certificates/issue        # Issue certificate
```

### Cart & Payment Endpoints
```
GET    /api/cart                            # Get user cart
POST   /api/cart/add                        # Add to cart
DELETE /api/cart/items/:itemId              # Remove from cart
DELETE /api/cart/clear                      # Clear cart
GET    /api/cart/count                      # Cart item count
POST   /api/promo-codes/validate            # Validate promo code
POST   /api/orders                          # Create order
POST   /api/orders/:id/payment              # Process payment
GET    /api/orders                          # User's orders
GET    /api/student/payments                # Payment history
GET    /api/receipts/:transactionId         # Get receipt
```

### File Upload Endpoints
```
POST   /api/upload/image                    # Upload image
POST   /api/upload/video                    # Upload video
POST   /api/upload/audio                    # Upload audio
POST   /api/upload/document                 # Upload document
```

### Notes Endpoints
```
GET    /api/personal-notes                  # List notes
POST   /api/personal-notes                  # Create note
GET    /api/personal-notes/:id              # Get note
PUT    /api/personal-notes/:id              # Update note
DELETE /api/personal-notes/:id              # Delete note
GET    /api/personal-notes/search           # Search notes
```

### Library Content (Admin)
```
GET    /api/admin/library-content           # List library content
POST   /api/admin/library-content           # Create content
PUT    /api/admin/library-content/:id       # Update content
DELETE /api/admin/library-content/:id       # Delete content
GET    /api/library/my-content              # User's accessible content
```

### Admin Analytics
```
GET    /api/admin/payment-analytics         # Payment analytics
GET    /api/student-monitoring              # Student monitoring
GET    /api/student-monitoring/summary      # Monitoring summary
GET    /api/student-monitoring/progress/:studentId # Student progress
```

---

## Development Guidelines

### Code Organization
- **Frontend**: `client/src/` directory
  - `components/`: Reusable UI components
  - `pages/`: Route-based page components
  - `hooks/`: Custom React hooks
  - `lib/`: Utility functions
- **Backend**: `server/` directory
  - `routes.ts`: API route definitions
  - `storage/`: Database storage layer
  - `auth-middleware.ts`: Authentication middleware
- **Shared**: `shared/` directory
  - `schema.ts`: Database schema and types
  - `env.ts`: Environment configuration

### Testing Considerations
- End-to-end testing with Playwright
- API testing with proper authentication
- Role-based access testing
- Payment flow testing (use test keys)
- File upload testing
- Quiz and assignment workflows

### Deployment Notes
- Environment variables required:
  - `SESSION_SECRET`: Session encryption key
  - `DATABASE_URL`: PostgreSQL connection string
  - `GOOGLE_CLIENT_ID/SECRET`: Optional for Google OAuth
  - `STRIPE_SECRET_KEY`: For payment processing
  - `SENDGRID_API_KEY` or SMTP settings: For emails
- Database migrations via Drizzle
- Static asset serving for uploads
- SSL/TLS for production

---

## Additional Notes for Developers

### Key Design Patterns
- **Repository Pattern**: Storage layer abstracts database operations
- **Middleware Pattern**: Authentication and authorization middleware
- **Factory Pattern**: Certificate generation and template system
- **Observer Pattern**: Email notifications triggered by events

### Performance Considerations
- Database indexing on frequently queried fields
- Image optimization before storage
- Lazy loading of course content
- Query optimization for analytics
- Session store in database for scalability

### Extensibility Points
- Payment providers (can add more beyond Stripe/PayPal)
- Email providers (SendGrid, Nodemailer, or others)
- Content types (can add new content types)
- Certificate templates (customizable)
- Authentication methods (OAuth providers)

### Known Dependencies
- PostgreSQL database (required)
- Email service (SendGrid or SMTP)
- Payment gateway accounts (Stripe and/or PayPal)
- Node.js 18+ runtime
- Modern browser with JavaScript enabled

---

**Document Version**: 1.0  
**Last Updated**: October 2025  
**System Version**: Meeting Matters LMS v1.0

For technical implementation details, refer to the codebase and inline code documentation.

# Meeting Matters LMS

A comprehensive Learning Management System focused on sexual abuse prevention education, providing an engaging and personalized learning experience with advanced user interaction capabilities.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL 12+
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd meeting-matters-lms
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your actual configuration values.

4. **Set up the database**
   ```bash
   # Create database
   createdb meeting_matters_lms
   
   # Push database schema
   npm run db:push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5000`

## 🏗️ Project Structure

```
meeting-matters-lms/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── admin/      # Admin-specific components
│   │   │   ├── assignments/# Assignment-related components
│   │   │   ├── auth/       # Authentication components
│   │   │   ├── cart/       # Shopping cart components
│   │   │   ├── certificates/# Certificate components
│   │   │   ├── course/     # Course-related components
│   │   │   ├── instructor/ # Instructor-specific components
│   │   │   ├── layouts/    # Layout components
│   │   │   ├── quiz/       # Quiz components
│   │   │   ├── shared/     # Shared components
│   │   │   └── ui/         # Base UI components (shadcn/ui)
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility functions and configurations
│   │   └── pages/          # Page components
│   │       ├── admin/      # Admin dashboard pages
│   │       ├── auth/       # Authentication pages
│   │       ├── courses/    # Course pages
│   │       ├── dashboard/  # User dashboard pages
│   │       └── instructor/ # Instructor pages
├── server/                 # Backend Express.js application
│   ├── auth-middleware.ts  # Authentication middleware
│   ├── email-service.ts    # Email service integration
│   ├── routes.ts          # API routes
│   ├── storage.ts         # Database operations
│   └── index.ts           # Server entry point
├── shared/                 # Shared types and schemas
│   └── schema.ts          # Database schema and types
└── public/                # Static assets
```

## 🔧 Environment Configuration

### Required Environment Variables

#### Core Requirements (Must be set)
- `SESSION_SECRET` - Secret key for session management (generate a long random string)
- `DATABASE_URL` - PostgreSQL connection string (or individual PG* variables)
- `PGDATABASE` - Database name
- `PGHOST` - Database host
- `PGPORT` - Database port
- `PGUSER` - Database username  
- `PGPASSWORD` - Database password

#### Optional Services (Add only if needed)
- **Email Service**: `SENDGRID_API_KEY` or SMTP settings
- **Stripe Payments**: `STRIPE_SECRET_KEY`, `VITE_STRIPE_PUBLIC_KEY`
- **PayPal Payments**: `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`

#### For Replit Deployment
Most variables are automatically provided by Replit. You only need to add the above variables as Secrets in your Replit project.

### Getting API Keys

#### Stripe Setup
1. Visit [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
2. Copy your **Publishable key** (starts with `pk_`) to `VITE_STRIPE_PUBLIC_KEY`
3. Copy your **Secret key** (starts with `sk_`) to `STRIPE_SECRET_KEY`

#### SendGrid Setup
1. Create account at [SendGrid](https://sendgrid.com/)
2. Navigate to Settings > API Keys
3. Create new API key and copy to `SENDGRID_API_KEY`

#### PayPal Setup
1. Visit [PayPal Developer Dashboard](https://developer.paypal.com/)
2. Create new application
3. Copy Client ID and Secret to respective environment variables

## 🎯 Key Features

### 👨‍🎓 Student Portal
- Course enrollment and progress tracking
- Interactive quizzes and assignments
- Certificate generation upon completion
- Note-taking and bookmarking
- Shopping cart for course purchases

### 👨‍🏫 Instructor Dashboard
- Course creation and management
- Student progress monitoring
- Assignment grading
- Analytics and reporting
- Content library management

### 👨‍💼 Admin Panel
- User management and role assignment
- Course approval and oversight
- Payment processing and reports
- System analytics
- Certificate template management

### 🔧 Technical Features
- **Authentication**: OpenID Connect (OIDC) integration
- **Database**: PostgreSQL with Drizzle ORM
- **File Uploads**: Secure file handling with validation
- **Payment Processing**: Stripe and PayPal integration
- **Email Notifications**: SendGrid and SMTP support
- **Certificate Generation**: PDF certificates with verification codes
- **Responsive Design**: Mobile-first UI with Tailwind CSS

## 📚 Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Database
npm run db:push      # Push schema changes to database
npm run db:studio    # Open database studio
npm run db:generate  # Generate database migrations

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
```

### Database Schema Management

This project uses Drizzle ORM for database management:

```bash
# Make schema changes in shared/schema.ts
# Then push changes to database
npm run db:push

# For production, generate and run migrations
npm run db:generate
npm run db:migrate
```

### Adding New Features

1. **Database Changes**: Update `shared/schema.ts`
2. **API Routes**: Add endpoints in `server/routes.ts`
3. **Storage Layer**: Update `server/storage.ts`
4. **Frontend Components**: Create in appropriate `client/src/components/` directory
5. **Pages**: Add to `client/src/pages/` and register in `client/src/App.tsx`

## 🚀 Deployment

### Replit Deployment (Recommended)

1. Fork this repository to Replit
2. Set environment variables in Replit Secrets
3. Database will be automatically provisioned
4. Click Deploy to create your production instance

### Manual Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Set up production database**
   ```bash
   npm run db:push
   ```

3. **Start production server**
   ```bash
   npm start
   ```

### Environment-Specific Configuration

- **Development**: Uses local database and development APIs
- **Production**: Requires production database and API credentials
- **Testing**: Uses test database and mock services

## 🔒 Security

### Authentication & Authorization
- Role-based access control (Admin, Instructor, Learner)
- Session-based authentication with secure cookies
- CSRF protection and secure headers

### Data Protection
- File upload validation and size limits
- SQL injection prevention with Drizzle ORM
- Input sanitization and validation
- Secure password handling

### Privacy Compliance
- GDPR and CCPA compliance features
- Data retention policies
- User data export and deletion

## 🎨 UI/UX

### Design System
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS
- **Components**: Shadcn/ui component library
- **Icons**: Lucide React
- **Responsive**: Mobile-first design

### Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support

## 📞 Support

### Documentation
- API documentation available at `/api/docs` (when running)
- Component documentation in Storybook (if configured)

### Getting Help
1. Check the troubleshooting section in this README
2. Review environment configuration
3. Check application logs for errors
4. Contact system administrator

### Common Issues

**Database Connection Issues**
- Verify `DATABASE_URL` is correct
- Ensure PostgreSQL is running
- Check network connectivity

**Email Not Sending**
- Verify email service credentials
- Check spam folders
- Ensure SMTP/API configuration is correct

**Payment Processing Issues**
- Verify API keys are correct and for the right environment
- Check webhook endpoints are configured
- Ensure payment provider account is active

## 📝 License

This project is proprietary software. All rights reserved.

## 🤝 Contributing

This is a private project. Please contact the system administrator for contribution guidelines.

---

**Meeting Matters LMS** - Empowering education through technology
# This file is only for editing file nodes, do not break the structure
## Project Description
Complete marketing automation platform with Node.js backend API and React frontend. Features email OTP authentication, comprehensive lead management, campaign automation, and performance analytics. Fully portable and production-ready with deployment guides for Render/Vercel.

## Key Features
- **✅ Complete Authentication**: Email OTP verification with JWT tokens and session management
- **✅ Lead Management System**: Full CRUD operations with filtering, search, and regional targeting
- **✅ Professional Dashboard**: Real-time metrics, regional performance, and actionable insights  
- **✅ Campaign Management**: Email campaigns with templates and automation workflows
- **✅ Multi-Region Support**: UAE, India, Australia, and US market specialization
- **✅ Production Backend**: Node.js + Express API with security, validation, and rate limiting
- **✅ Deployment Ready**: Complete deployment guides for Render, Vercel, Heroku, and Netlify
- **✅ Email Integration**: Resend, SendGrid, and Gmail SMTP support for OTP delivery

## Data Storage
**Backend Storage:** In-memory (development) with database upgrade path
- **Leads**: Complete lead management with CRUD operations, filtering, and analytics
- **Campaigns**: Email campaign management with templates and automation
- **Users**: Authentication system with JWT tokens and session management
- **Templates**: Email template library with variable substitution
- **Production Ready**: Easy upgrade to PostgreSQL, MongoDB, or Supabase

## Backend & Services
**API Architecture:** RESTful Node.js + Express backend with comprehensive endpoints
**Authentication:** Email OTP verification with Resend/SendGrid/Gmail integration
**Security:** JWT tokens, rate limiting, input validation, CORS protection
**Deployment:** Ready for Render, Heroku, Railway with environment configuration

## API Integration
**Architecture:** Fully portable, API-agnostic design using environment variables
**Backend:** Generic REST API (see CONFIGURATION.md and API.md for implementation details)
**Services:** Auth, Leads, Campaigns, Email, Web Search, Web Reader (all configurable via .env)

## Special Requirements
Multi-phase development focused on automation pipeline from lead discovery to conversion, minimizing human intervention while maintaining personalization at scale.

/src
├── components/      # Components directory
│   ├── ui/         # Pre-installed shadcn/ui components
│   ├── ProtectedRoute.tsx # Route protection for authenticated users
│   ├── LeadScoring.tsx # Advanced lead scoring and qualification system
│   ├── DuplicateDetection.tsx # Duplicate lead detection and merge functionality
│   ├── PersonalizationEngine.tsx # AI-powered email personalization with variable replacement
│   └── SequenceBuilder.tsx # Visual email sequence builder with conditional logic
│
├── hooks/          # Custom Hooks directory
│   ├── use-mobile.ts # Mobile detection Hook
│   └── use-toast.ts  # Toast notification system Hook
│
├── lib/            # Utility library directory
│   └── utils.ts    # Utility functions, including cn function for merging Tailwind classes
│
├── pages/          # Page components directory (React Router structure)
│   ├── LoginPage.tsx # Authentication page with email OTP
│   ├── DashboardPage.tsx # Main dashboard with metrics and regional insights
│   ├── LeadsPage.tsx # Lead management interface with CRUD operations and scoring
│   ├── LeadSourcingPage.tsx # Automated lead discovery and web scraping interface
│   ├── CampaignsPage.tsx # Email campaign builder with templates and sequences [next: advanced analytics]
│   └── NotFoundPage.tsx # 404 error page
│
├── store/          # State management directory (Zustand)
│   ├── auth-store.ts # User authentication and session management
│   ├── leads-store.ts # Lead data management with filtering and CRUD operations
│   └── campaigns-store.ts # Email campaign and template management with personalization and sequence automation
│
├── App.tsx         # Root component with protected routes and authentication flow
├── main.tsx        # Entry file, renders root component and mounts to DOM
├── index.css       # Design system with agency branding and professional B2B SaaS styling
└── tailwind.config.js  # Tailwind CSS v3 configuration file
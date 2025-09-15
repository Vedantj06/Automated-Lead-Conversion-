# Marketing Automation Platform

A comprehensive marketing automation platform designed for digital agencies to discover, engage, and convert leads across multiple regions with minimal human intervention.

## 🚀 Features

- **Lead Discovery & Management**: Automated web scraping and lead sourcing with advanced scoring
- **Email Campaign Builder**: Professional templates with personalization and multi-step sequences  
- **Performance Analytics**: Real-time metrics and regional performance tracking
- **Multi-Region Support**: Specialized workflows for UAE, India, Australia, and US markets
- **Agency Services Integration**: Tailored for website development, social media management, and performance marketing

## 🏗️ Architecture

This platform is built with **full portability** in mind:
- **Frontend**: React 18 + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: API-agnostic design - works with any REST API backend
- **State Management**: Zustand with persistence
- **Styling**: Modern design system with professional B2B SaaS aesthetics

## 🔧 Quick Start

### 1. Clone and Install
```bash
git clone <repository-url>
cd marketing-automation-platform
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your API endpoints and keys
```

### 3. Set Your API URL
Edit `.env` and set your backend API URL:
```env
VITE_API_URL=http://localhost:3001/api
```

### 4. Run Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 📋 Backend Requirements

This frontend expects a REST API backend with the following endpoints:
- **Authentication**: OTP-based login system
- **Lead Management**: CRUD operations with filtering and search
- **Campaign Management**: Email campaign creation and analytics
- **Email Services**: Single and bulk email sending
- **Optional**: Web search and content extraction services

See [API.md](./API.md) for complete API documentation and [CONFIGURATION.md](./CONFIGURATION.md) for setup details.

## 🌍 Multi-Region Support

Built-in support for:
- 🇦🇪 **UAE**: Asia/Dubai timezone, Arabic/English content
- 🇮🇳 **India**: Asia/Kolkata timezone, English/Hindi content  
- 🇦🇺 **Australia**: Australia/Sydney timezone, English content
- 🇺🇸 **United States**: America/New_York timezone, English content

## 🎯 Target Services

Optimized campaign templates for:
- **Website Development**: Lead qualification, portfolio showcase, technical discussions
- **Social Media Management**: Platform strategy, content planning, engagement metrics
- **Performance Marketing**: ROI-focused campaigns, conversion optimization, analytics reporting

## 📊 Lead Scoring System

Intelligent lead scoring based on:
- **Contact Information** (30%): Email, phone, website completeness
- **Company Data** (25%): Industry, size, decision-maker title
- **Regional Targeting** (20%): Geographic alignment with service areas
- **Engagement** (25%): Email opens, clicks, website visits

## 📧 Email Campaign Features

- **Professional Templates**: Pre-built templates for each service offering
- **Personalization Engine**: Dynamic variable replacement with AI assistance
- **Multi-Step Sequences**: Automated follow-up based on engagement
- **A/B Testing**: Subject line and content optimization
- **Analytics Dashboard**: Open rates, click rates, conversion tracking

## 🔒 Authentication

Secure email OTP-based authentication:
1. User enters email address
2. System sends OTP via email
3. User verifies OTP to gain access
4. JWT tokens for subsequent API calls
5. Automatic session refresh

## 🛠️ Development

### Project Structure
```
src/
├── components/         # Reusable UI components
├── pages/             # Route-based page components  
├── store/             # Zustand state management
├── lib/               # API services and utilities
└── hooks/             # Custom React hooks
```

### Environment Variables
```env
# Required
VITE_API_URL=http://localhost:3001/api

# Optional External Services
VITE_EMAIL_API_KEY=your_email_service_key
VITE_WEB_SEARCH_API_KEY=your_search_service_key
VITE_AI_API_KEY=your_ai_service_key

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_LEAD_SCORING=true
VITE_DEBUG_MODE=false
```

### Available Scripts
```bash
npm run dev          # Development server
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # ESLint checking
```

## 🚀 Deployment

### Production Build
```bash
npm run build
npm run preview
```

### Environment Setup
1. Set production `VITE_API_URL`
2. Configure external service API keys
3. Enable/disable features via environment flags
4. Set up proper CORS on your backend

### Hosting Options
- **Vercel**: Zero-config deployment with environment variables
- **Netlify**: Drag-and-drop deployment with build settings
- **Docker**: Container-based deployment with Nginx
- **Static Hosting**: Any static file hosting service

## 📚 Documentation

- [Configuration Guide](./CONFIGURATION.md) - Complete setup instructions
- [API Documentation](./API.md) - Backend implementation requirements
- [Component Library](./src/components/) - Reusable UI components
- [State Management](./src/store/) - Application state structure

## 🎨 Customization

### Design System
Modify `src/index.css` to customize:
- Color palette and themes
- Typography and spacing
- Component styling
- Responsive breakpoints

### Branding
Update application branding in:
- `index.html` - Page title and meta tags
- `src/lib/config.ts` - App name and settings
- `src/components/` - Logo and visual elements

### Regional Settings
Configure supported regions in:
- `src/lib/config.ts` - Region definitions and timezones
- `src/store/leads-store.ts` - Region-specific lead handling
- Email templates - Region-appropriate messaging

## 🔧 Backend Implementation

This frontend is designed to work with any backend that implements the required API endpoints. Popular choices:

- **Node.js**: Express + MongoDB/PostgreSQL
- **Python**: FastAPI + SQLAlchemy  
- **PHP**: Laravel + MySQL
- **Ruby**: Rails + PostgreSQL
- **Java**: Spring Boot + JPA
- **C#**: ASP.NET Core + Entity Framework

See [API.md](./API.md) for complete endpoint specifications.

## 📈 Performance

Optimized for production with:
- Code splitting and lazy loading
- Image optimization and lazy loading
- Efficient state management with Zustand
- Minimal bundle size with tree shaking
- Progressive Web App capabilities

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Implement changes with tests
4. Update documentation if needed
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For technical support:
1. Check [CONFIGURATION.md](./CONFIGURATION.md) for setup issues
2. Review [API.md](./API.md) for backend implementation
3. Enable debug mode for detailed logging
4. Check browser console for client-side errors

---

Built with ❤️ for digital agencies worldwide
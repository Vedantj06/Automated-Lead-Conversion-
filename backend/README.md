# Marketing Hub Backend API

A robust Node.js + Express backend for the Marketing Hub platform with OTP authentication, leads management, and campaign automation.

## 🚀 Features

- **Authentication System**: Email OTP verification with JWT tokens
- **Leads Management**: Complete CRUD operations with filtering and analytics
- **Campaign Management**: Email campaign creation and template system
- **Role-based Access**: User and admin roles with proper permissions
- **Rate Limiting**: Protection against abuse with configurable limits
- **Email Integration**: Support for Resend, SendGrid, and Gmail SMTP
- **Validation**: Comprehensive input validation with Joi
- **Security**: Helmet, CORS, and JWT security best practices

## 📋 Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn
- Email service account (Resend, SendGrid, or Gmail)

## 🛠 Installation & Setup

### 1. Clone and Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Configuration

Copy the example environment file and configure your settings:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```bash
# Server Configuration
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Email Configuration (Choose one)
EMAIL_PROVIDER=resend
RESEND_API_KEY=your-resend-api-key-here

# Email Settings
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=Marketing Hub
```

### 3. Email Service Setup

Choose one of the following email providers:

#### Option A: Resend (Recommended)
1. Sign up at [Resend.com](https://resend.com)
2. Get your API key from the dashboard
3. Set `EMAIL_PROVIDER=resend` and `RESEND_API_KEY=your-key`

#### Option B: SendGrid
1. Sign up at [SendGrid.com](https://sendgrid.com)
2. Create an API key with mail send permissions
3. Set `EMAIL_PROVIDER=sendgrid` and `SENDGRID_API_KEY=your-key`

#### Option C: Gmail (Development Only)
1. Enable 2-factor authentication on your Gmail account
2. Generate an app password
3. Set `EMAIL_PROVIDER=gmail`, `GMAIL_USER=your-email`, `GMAIL_PASS=app-password`

### 4. Start the Server

Development mode with auto-reload:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/send-otp` - Send OTP to email
- `POST /api/auth/verify-otp` - Verify OTP and login
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/refresh` - Refresh JWT token

### Leads Management
- `GET /api/leads` - Get all leads (with filtering)
- `POST /api/leads` - Create new lead
- `GET /api/leads/:id` - Get specific lead
- `PUT /api/leads/:id` - Update lead
- `DELETE /api/leads/:id` - Delete lead
- `GET /api/leads/stats` - Get lead statistics
- `GET /api/leads/export` - Export leads to CSV

### Campaigns
- `GET /api/campaigns` - Get all campaigns
- `POST /api/campaigns` - Create new campaign
- `GET /api/campaigns/:id` - Get specific campaign
- `PUT /api/campaigns/:id` - Update campaign
- `DELETE /api/campaigns/:id` - Delete campaign
- `POST /api/campaigns/:id/start` - Start campaign
- `POST /api/campaigns/:id/pause` - Pause campaign

### Email Templates
- `GET /api/campaigns/templates` - Get all templates
- `POST /api/campaigns/templates` - Create new template

## 🔒 Authentication Flow

1. **Send OTP**: User enters email, receives 6-digit code
2. **Verify OTP**: User enters code, gets JWT token
3. **Protected Routes**: Include `Authorization: Bearer <token>` header

## 🚀 Deployment

### Deploy to Render

1. Create account at [Render.com](https://render.com)
2. Connect your GitHub repository
3. Create a new Web Service
4. Configure environment variables in Render dashboard
5. Deploy automatically on git push

### Deploy to Heroku

1. Install Heroku CLI
2. Login and create app:
```bash
heroku login
heroku create marketing-hub-api
```

3. Set environment variables:
```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-production-secret
heroku config:set EMAIL_PROVIDER=resend
heroku config:set RESEND_API_KEY=your-key
# ... other variables
```

4. Deploy:
```bash
git push heroku main
```

### Deploy to Railway

1. Sign up at [Railway.app](https://railway.app)
2. Connect GitHub repository
3. Add environment variables
4. Deploy with one click

## 🔧 Development

### Project Structure

```
backend/
├── src/
│   ├── middleware/          # Express middleware
│   ├── routes/             # API route handlers
│   ├── services/           # Business logic
│   ├── utils/              # Utility functions
│   └── server.js           # Main server file
├── .env                    # Environment variables
├── .env.example           # Environment template
└── package.json           # Dependencies
```

### Adding New Features

1. **Create Service**: Add business logic in `src/services/`
2. **Add Routes**: Create route handlers in `src/routes/`
3. **Add Validation**: Define schemas in `src/middleware/validation.js`
4. **Test**: Use Postman or curl to test endpoints

### Error Handling

All errors use the `ApiError` class with proper HTTP status codes:

```javascript
throw new ApiError(400, 'Validation error message');
```

## 🔐 Security Features

- **Rate Limiting**: Configurable request limits
- **JWT Authentication**: Secure token-based auth
- **Input Validation**: Joi schema validation
- **CORS Protection**: Configured for frontend domain
- **Helmet Security**: Standard security headers
- **Environment Variables**: Sensitive data protection

## 📈 Monitoring & Logs

- **Health Check**: `GET /health` endpoint
- **Request Logging**: Morgan HTTP request logger
- **Error Logging**: Comprehensive error tracking
- **Performance**: Monitor response times and errors

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For issues and questions:
1. Check the [troubleshooting guide](#troubleshooting)
2. Review the [API documentation](#api-endpoints)
3. Open an issue on GitHub

## 🐛 Troubleshooting

### Email Not Sending
- Check email provider credentials
- Verify API key permissions
- Check spam folder
- Review server logs

### Authentication Issues
- Verify JWT secret is set
- Check token expiration
- Ensure frontend sends proper headers

### Database Errors
- Currently using in-memory storage
- For production, implement database integration
- Check data validation schemas
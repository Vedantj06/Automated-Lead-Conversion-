# 🚀 Marketing Hub - Complete Deployment Guide

This guide will help you deploy both the frontend and backend of the Marketing Hub application.

## 📋 Overview

- **Frontend**: React + TypeScript + Vite (Deploy to Vercel/Netlify)
- **Backend**: Node.js + Express API (Deploy to Render/Heroku)
- **Email Service**: Resend/SendGrid for OTP verification
- **Database**: Currently in-memory (upgrade to PostgreSQL/MongoDB in production)

## 🎯 Quick Start (5 Minutes)

### Step 1: Deploy Backend (Render - Free Tier)

1. **Create Render Account**: Go to [render.com](https://render.com) and sign up
2. **Connect GitHub**: Link your GitHub repository
3. **Create Web Service**:
   - Click "New +" → "Web Service"
   - Connect your repository
   - Set root directory to `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`

4. **Set Environment Variables** in Render dashboard:
   ```
   NODE_ENV=production
   JWT_SECRET=your-super-secret-jwt-key-change-this
   JWT_EXPIRES_IN=7d
   EMAIL_PROVIDER=resend
   RESEND_API_KEY=your-resend-api-key
   FROM_EMAIL=noreply@yourdomain.com
   FROM_NAME=Marketing Hub
   FRONTEND_URL=https://your-frontend-url.vercel.app
   ```

5. **Get Email API Key**:
   - Go to [resend.com](https://resend.com) → Create account → Get API key
   - Add it as `RESEND_API_KEY` in Render

6. **Deploy**: Click "Create Web Service" - Your backend will be live in 2-3 minutes!

### Step 2: Deploy Frontend (Vercel - Free Tier)

1. **Create Vercel Account**: Go to [vercel.com](https://vercel.com) and sign up
2. **Import Project**:
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect it's a Vite app

3. **Set Environment Variables**:
   ```
   VITE_API_URL=https://your-backend-url.onrender.com/api
   VITE_AUTH_ENDPOINT=/auth
   VITE_LEADS_ENDPOINT=/leads
   VITE_CAMPAIGNS_ENDPOINT=/campaigns
   ```

4. **Deploy**: Click "Deploy" - Your frontend will be live in 1-2 minutes!

### Step 3: Update CORS Settings

1. Go back to Render backend settings
2. Update `FRONTEND_URL` environment variable with your Vercel URL
3. Redeploy the backend service

## 🔧 Detailed Backend Deployment

### Option A: Render (Recommended - Free Tier Available)

**Advantages**: Free tier, easy setup, great for Node.js apps

1. **Prepare Repository**:
   ```bash
   # Ensure backend/package.json has correct scripts
   cd backend
   npm install
   npm start  # Test locally first
   ```

2. **Deploy Steps**:
   - Fork/clone this repository to your GitHub
   - Go to [render.com](https://render.com)
   - Click "New +" → "Web Service"
   - Connect GitHub repository
   - Configure:
     - **Name**: `marketing-hub-api`
     - **Root Directory**: `backend`
     - **Environment**: `Node`
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`

3. **Environment Variables** (Add in Render dashboard):
   ```
   NODE_ENV=production
   PORT=10000
   JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
   JWT_EXPIRES_IN=7d
   EMAIL_PROVIDER=resend
   RESEND_API_KEY=re_your_api_key_here
   FROM_EMAIL=noreply@yourdomain.com
   FROM_NAME=Marketing Hub
   FRONTEND_URL=https://your-frontend-url.vercel.app
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_ATTEMPTS=5
   ```

4. **Custom Domain** (Optional):
   - Go to Settings → Custom Domains
   - Add your domain (e.g., api.yourdomain.com)

### Option B: Heroku

**Advantages**: Well-known platform, good documentation

1. **Install Heroku CLI**:
   ```bash
   # Install Heroku CLI from heroku.com/cli
   heroku login
   ```

2. **Prepare App**:
   ```bash
   cd backend
   heroku create marketing-hub-api
   ```

3. **Set Environment Variables**:
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set JWT_SECRET=your-super-secret-jwt-key
   heroku config:set EMAIL_PROVIDER=resend
   heroku config:set RESEND_API_KEY=your-key
   heroku config:set FROM_EMAIL=noreply@yourdomain.com
   heroku config:set FROM_NAME="Marketing Hub"
   ```

4. **Deploy**:
   ```bash
   git add .
   git commit -m "Deploy to Heroku"
   git push heroku main
   ```

### Option C: Railway

**Advantages**: Modern platform, simple deployment

1. Go to [railway.app](https://railway.app)
2. Click "Deploy from GitHub"
3. Select your repository
4. Set root directory to `backend`
5. Add environment variables in Railway dashboard
6. Deploy with one click

## 🎨 Detailed Frontend Deployment

### Option A: Vercel (Recommended - Best for React/Vite)

**Advantages**: Optimized for React, excellent performance, free tier

1. **Prepare Repository**:
   ```bash
   # Test build locally
   npm run build
   npm run preview
   ```

2. **Deploy Steps**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel auto-detects Vite configuration

3. **Environment Variables** (Add in Vercel dashboard):
   ```
   VITE_API_URL=https://marketing-hub-api.onrender.com/api
   VITE_AUTH_ENDPOINT=/auth
   VITE_LEADS_ENDPOINT=/leads
   VITE_CAMPAIGNS_ENDPOINT=/campaigns
   VITE_APP_NAME=Marketing Automation Platform
   VITE_SUPPORTED_REGIONS=UAE,India,Australia,US
   ```

4. **Custom Domain** (Optional):
   - Go to Project Settings → Domains
   - Add your domain (e.g., app.yourdomain.com)

### Option B: Netlify

**Advantages**: Good free tier, easy drag-and-drop deployment

1. **Build Locally**:
   ```bash
   npm run build
   ```

2. **Deploy Options**:

   **Option 2A: Drag & Drop**:
   - Go to [netlify.com](https://netlify.com)
   - Drag the `dist` folder to deployment area

   **Option 2B: GitHub Integration**:
   - Connect GitHub repository
   - Set build command: `npm run build`
   - Set publish directory: `dist`

3. **Environment Variables**:
   - Go to Site Settings → Environment Variables
   - Add the same variables as Vercel above

### Option C: GitHub Pages

**Advantages**: Free, integrated with GitHub

1. **Add GitHub Actions Workflow**:
   Create `.github/workflows/deploy.yml`:
   ```yaml
   name: Deploy to GitHub Pages
   
   on:
     push:
       branches: [ main ]
   
   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - uses: actions/setup-node@v3
           with:
             node-version: 18
         - run: npm install
         - run: npm run build
         - uses: peaceiris/actions-gh-pages@v3
           with:
             github_token: ${{ secrets.GITHUB_TOKEN }}
             publish_dir: ./dist
   ```

2. **Configure Repository**:
   - Go to Settings → Pages
   - Source: GitHub Actions

## 📧 Email Service Setup

### Resend (Recommended - Easiest Setup)

1. **Sign Up**: Go to [resend.com](https://resend.com)
2. **Verify Domain** (Optional but recommended):
   - Add your domain in Resend dashboard
   - Add DNS records provided by Resend
3. **Get API Key**:
   - Go to API Keys section
   - Create new API key
   - Copy and add to backend environment variables

### SendGrid (Alternative)

1. **Sign Up**: Go to [sendgrid.com](https://sendgrid.com)
2. **Create API Key**:
   - Go to Settings → API Keys
   - Create API key with "Mail Send" permissions
3. **Configure Backend**:
   ```
   EMAIL_PROVIDER=sendgrid
   SENDGRID_API_KEY=your_sendgrid_api_key
   ```

### Gmail (Development Only)

1. **Enable 2FA** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. **Configure Backend**:
   ```
   EMAIL_PROVIDER=gmail
   GMAIL_USER=your-email@gmail.com
   GMAIL_PASS=your-app-password
   ```

## 🔒 Security Checklist

### Backend Security

- [ ] Strong JWT secret (minimum 32 characters)
- [ ] HTTPS enabled (automatic with Render/Heroku)
- [ ] CORS configured for your frontend domain only
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] Environment variables secured

### Frontend Security

- [ ] API URL uses HTTPS
- [ ] No sensitive data in client code
- [ ] CSP headers configured (automatic with Vercel/Netlify)
- [ ] Dependencies updated and scanned

## 🚀 Performance Optimization

### Backend Optimization

1. **Enable Compression**:
   ```javascript
   // Add to server.js
   const compression = require('compression');
   app.use(compression());
   ```

2. **Add Caching Headers**:
   ```javascript
   app.use('/api', (req, res, next) => {
     res.set('Cache-Control', 'public, max-age=300');
     next();
   });
   ```

### Frontend Optimization

1. **Code Splitting**: Already configured with Vite
2. **Asset Optimization**: Vite handles automatically
3. **Bundle Analysis**:
   ```bash
   npm run build -- --analyze
   ```

## 🔧 Database Upgrade (Production)

### Option A: Supabase (PostgreSQL)

1. **Sign up**: [supabase.com](https://supabase.com)
2. **Create project** and get database URL
3. **Update backend**:
   ```bash
   npm install @supabase/supabase-js
   ```
4. **Replace in-memory storage** with Supabase client

### Option B: MongoDB Atlas

1. **Sign up**: [mongodb.com/atlas](https://mongodb.com/atlas)
2. **Create cluster** and get connection string
3. **Update backend**:
   ```bash
   npm install mongodb mongoose
   ```

## 🐛 Troubleshooting

### Common Issues

**Issue: CORS Error**
```
Solution: Update FRONTEND_URL in backend environment variables
```

**Issue: OTP Email Not Sending**
```
Solution: Check email provider API key and configuration
```

**Issue: Authentication Not Working**
```
Solution: Verify JWT_SECRET is set and same across deployments
```

**Issue: Build Failing**
```
Solution: Check Node.js version (use 18+), verify dependencies
```

### Debug Mode

Enable debug logging:
```bash
# Backend
NODE_ENV=development

# Frontend  
VITE_DEBUG_MODE=true
```

## 📊 Monitoring & Analytics

### Backend Monitoring

1. **Render**: Built-in metrics and logs
2. **Heroku**: Heroku Metrics add-on
3. **Custom**: Add logging service like LogRocket

### Frontend Analytics

1. **Vercel**: Built-in Web Analytics
2. **Google Analytics**: Add tracking code
3. **Performance**: Web Vitals monitoring

## 🔄 CI/CD Setup

### Automatic Deployment

**Frontend (Vercel)**:
- Automatic deployment on git push to main
- Preview deployments for pull requests

**Backend (Render)**:
- Automatic deployment on git push to main
- Health checks and auto-restart

### Manual Deployment

```bash
# Frontend
npm run build
vercel --prod

# Backend  
git push heroku main
```

## 📞 Support

- **Documentation**: Check README files in backend/ and frontend/
- **Issues**: Create GitHub issue with error details
- **Email**: Contact your development team

---

## 🎉 Success! Your Marketing Hub is Live!

After following this guide, you should have:
- ✅ Backend API running on Render/Heroku
- ✅ Frontend app deployed on Vercel/Netlify  
- ✅ Email OTP authentication working
- ✅ Lead management system functional
- ✅ Campaign management operational
- ✅ Secure HTTPS endpoints
- ✅ Production-ready configuration

**Test your deployment**:
1. Visit your frontend URL
2. Try the login flow with OTP
3. Add a test lead
4. Create a test campaign
5. Check all dashboard metrics

Your Marketing Automation Platform is now ready for production use! 🚀
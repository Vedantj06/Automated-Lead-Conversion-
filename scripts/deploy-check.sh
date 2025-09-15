#!/bin/bash

# Marketing Hub Deployment Readiness Check
echo "🔍 Marketing Hub Deployment Readiness Check"
echo "==========================================="

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PASSED=0
FAILED=0

check_pass() {
    echo -e "${GREEN}✅ $1${NC}"
    ((PASSED++))
}

check_fail() {
    echo -e "${RED}❌ $1${NC}"
    ((FAILED++))
}

check_warn() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

echo -e "${BLUE}📁 Checking project structure...${NC}"

# Check if required files exist
if [ -f "package.json" ]; then
    check_pass "Frontend package.json found"
else
    check_fail "Frontend package.json missing"
fi

if [ -f "backend/package.json" ]; then
    check_pass "Backend package.json found"
else
    check_fail "Backend package.json missing"
fi

if [ -f "backend/src/server.js" ]; then
    check_pass "Backend server.js found"
else
    check_fail "Backend server.js missing"
fi

if [ -f "vite.config.ts" ]; then
    check_pass "Vite config found"
else
    check_fail "Vite config missing"
fi

echo ""
echo -e "${BLUE}🔧 Checking environment configuration...${NC}"

# Check frontend .env
if [ -f ".env" ]; then
    check_pass "Frontend .env file exists"
    if grep -q "VITE_API_URL" .env; then
        check_pass "VITE_API_URL configured"
    else
        check_fail "VITE_API_URL not configured in .env"
    fi
else
    check_fail "Frontend .env file missing"
fi

# Check backend .env  
if [ -f "backend/.env" ]; then
    check_pass "Backend .env file exists"
    
    # Check required backend variables
    if grep -q "JWT_SECRET" backend/.env; then
        JWT_SECRET=$(grep "JWT_SECRET" backend/.env | cut -d '=' -f2)
        if [ ${#JWT_SECRET} -ge 32 ]; then
            check_pass "JWT_SECRET is sufficiently long"
        else
            check_fail "JWT_SECRET should be at least 32 characters"
        fi
    else
        check_fail "JWT_SECRET not configured"
    fi
    
    if grep -q "EMAIL_PROVIDER" backend/.env; then
        check_pass "EMAIL_PROVIDER configured"
    else
        check_fail "EMAIL_PROVIDER not configured"
    fi
    
    if grep -q "RESEND_API_KEY\|SENDGRID_API_KEY\|GMAIL_PASS" backend/.env; then
        check_pass "Email service API key configured"
    else
        check_warn "Email service API key not configured (OTP won't work)"
    fi
else
    check_fail "Backend .env file missing"
fi

echo ""
echo -e "${BLUE}📦 Checking dependencies...${NC}"

# Check if node_modules exist
if [ -d "node_modules" ]; then
    check_pass "Frontend dependencies installed"
else
    check_fail "Frontend dependencies not installed (run: npm install)"
fi

if [ -d "backend/node_modules" ]; then
    check_pass "Backend dependencies installed"
else
    check_fail "Backend dependencies not installed (run: cd backend && npm install)"
fi

echo ""
echo -e "${BLUE}🔨 Testing builds...${NC}"

# Test frontend build
echo "Testing frontend build..."
if npm run build > /tmp/frontend_build.log 2>&1; then
    check_pass "Frontend build successful"
else
    check_fail "Frontend build failed (check: npm run build)"
    echo "Build output:"
    cat /tmp/frontend_build.log | tail -20
fi

# Test backend startup
echo "Testing backend startup..."
cd backend
if timeout 10s npm start > /tmp/backend_start.log 2>&1; then
    check_pass "Backend starts successfully"
else
    if grep -q "server running" /tmp/backend_start.log; then
        check_pass "Backend starts successfully"
    else
        check_fail "Backend startup failed (check: cd backend && npm start)"
        echo "Startup output:"
        cat /tmp/backend_start.log | tail -20
    fi
fi
cd ..

echo ""
echo -e "${BLUE}🔒 Security check...${NC}"

# Check for sensitive data in code
if grep -r "password\|secret\|key" src/ --include="*.ts" --include="*.tsx" | grep -v "password:" | grep -v "// " | grep -v "passwordRef" > /dev/null; then
    check_warn "Potential sensitive data found in source code"
else
    check_pass "No obvious sensitive data in source code"
fi

# Check for production environment variables
if [ -f ".env.production" ]; then
    check_pass ".env.production template exists"
else
    check_warn ".env.production template missing"
fi

echo ""
echo -e "${BLUE}🌐 Deployment files check...${NC}"

if [ -f "backend/vercel.json" ]; then
    check_pass "Vercel deployment config found"
fi

if [ -f "backend/render.yaml" ]; then
    check_pass "Render deployment config found"
fi

if [ -f "DEPLOYMENT_GUIDE.md" ]; then
    check_pass "Deployment guide available"
fi

echo ""
echo "=========================================="
echo -e "${GREEN}✅ Passed: $PASSED${NC}"
echo -e "${RED}❌ Failed: $FAILED${NC}"
echo "=========================================="

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 Your project is ready for deployment!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. 🚀 Deploy backend to Render/Heroku"
    echo "2. 🎨 Deploy frontend to Vercel/Netlify"  
    echo "3. 📧 Configure email service API key"
    echo "4. 🔗 Update CORS settings with frontend URL"
    echo ""
    echo "See DEPLOYMENT_GUIDE.md for detailed instructions."
else
    echo -e "${RED}⚠️ Please fix the failed checks before deploying.${NC}"
    echo ""
    echo "Common fixes:"
    echo "• Run: npm install && cd backend && npm install"
    echo "• Copy .env.example to .env and configure"
    echo "• Set JWT_SECRET to a strong 32+ character string"
    echo "• Configure email service (Resend recommended)"
fi

echo ""
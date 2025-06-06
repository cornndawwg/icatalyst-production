# 🚀 Railway Dual-Service Deployment Checklist

## 🎯 iCatalyst Smart Home CRM - Production Deployment Guide

### 📋 **PRE-DEPLOYMENT VALIDATION**

#### ✅ **Backend Service Requirements**
- [ ] `src/index.js` exists and runs without errors
- [ ] Prisma schema is valid (`npx prisma validate`)
- [ ] All environment variables configured in Railway:
  - [ ] `DATABASE_URL` (PostgreSQL connection string)
  - [ ] `JWT_SECRET` (cryptographically secure token)
  - [ ] `NODE_ENV=production`
  - [ ] `PORT=3001`
- [ ] Health endpoint responds: `GET /health`
- [ ] API routes mounted correctly: `GET /api`

#### ✅ **Frontend Service Requirements**
- [ ] `pages/` directory structure exists
- [ ] `next.config.js` properly configured
- [ ] Frontend environment variables:
  - [ ] `NEXT_PUBLIC_API_URL` points to backend service
  - [ ] `NODE_ENV=production`
  - [ ] `PORT=3002`
- [ ] Next.js builds successfully: `npm run build:frontend`

### 🏗️ **RAILWAY SERVICE SETUP**

#### **Backend Service Configuration**
```bash
# Railway CLI Commands
railway login
railway project create icatalyst-backend
railway service create backend
railway up --service backend
```

**Service Settings:**
- **Build Command:** `npm run build`
- **Start Command:** `npm start`
- **Health Check:** `/health`
- **Port:** `3001`

#### **Frontend Service Configuration**
```bash
# Railway CLI Commands (in same project)
railway service create frontend
railway up --service frontend
```

**Service Settings:**
- **Build Command:** `npm run build:frontend`
- **Start Command:** `npm run start:frontend`
- **Health Check:** `/`
- **Port:** `3002`

### 🔧 **ENVIRONMENT VARIABLES SETUP**

#### **Backend Service Variables**
```env
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://user:pass@host:port/db
JWT_SECRET=iCatalyst2024_SecureJWT_ProductionKey_[your-secure-key]
```

#### **Frontend Service Variables**
```env
NODE_ENV=production
PORT=3002
NEXT_PUBLIC_API_URL=https://[backend-service-url].railway.app
```

### 🧪 **DEPLOYMENT TESTING PROTOCOL**

#### **Backend Service Tests**
1. **Health Check:** `curl https://[backend-url]/health`
2. **API Documentation:** `curl https://[backend-url]/api`
3. **Database Connection:** Check logs for Prisma connection success
4. **Route Mounting:** Verify all 9 API routes are accessible:
   - `/api/auth`
   - `/api/customers`
   - `/api/properties`
   - `/api/products`
   - `/api/proposals`
   - `/api/proposal-personas`
   - `/api/upload`
   - `/api/portal`
   - `/api/test-db`

#### **Frontend Service Tests**
1. **Homepage Load:** `curl https://[frontend-url]/`
2. **API Connection:** Test API calls from frontend
3. **Static Assets:** Verify CSS/JS loading
4. **Navigation:** Test all frontend routes

### ⚡ **DEPLOYMENT WORKFLOW**

#### **Step 1: Backend Deployment**
```bash
# Ensure clean build
npm run clean:full
git add .
git commit -m "RAILWAY BACKEND: Production deployment"
git push origin main

# Deploy to Railway
railway up --service backend
```

#### **Step 2: Frontend Deployment**
```bash
# Update API URL if needed
# Deploy frontend
railway up --service frontend
```

#### **Step 3: Service Linking**
```bash
# Link services in Railway dashboard
# Update NEXT_PUBLIC_API_URL to backend service URL
```

### 🚨 **TROUBLESHOOTING GUIDE**

#### **Common Backend Issues**
- **Database Connection:** Check DATABASE_URL format
- **Environment Variables:** Verify all vars are set in Railway
- **Build Failures:** Check Prisma schema and dependencies
- **Port Conflicts:** Ensure PORT=3001 is consistent

#### **Common Frontend Issues**
- **API Connection:** Verify NEXT_PUBLIC_API_URL is correct
- **Build Failures:** Check Next.js configuration
- **Static Assets:** Ensure proper build output
- **CORS Issues:** Verify backend CORS configuration

### ✅ **POST-DEPLOYMENT VALIDATION**

#### **Production Verification Checklist**
- [ ] Backend health endpoint returns 200
- [ ] Frontend loads without errors
- [ ] API calls work from frontend to backend
- [ ] Database operations function correctly
- [ ] File uploads work (if applicable)
- [ ] Authentication flow works
- [ ] All Smart Home CRM features operational

#### **Performance Monitoring**
- [ ] Response times under 1000ms
- [ ] Memory usage within limits
- [ ] No memory leaks detected
- [ ] Error rates under 1%

### 📊 **SERVICE ARCHITECTURE**

```
┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │
│   Service       │───▶│    Service      │
│   (Next.js)     │    │   (Express)     │
│   Port: 3002    │    │   Port: 3001    │
└─────────────────┘    └─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │   PostgreSQL    │
                    │   Database      │
                    │   (Railway)     │
                    └─────────────────┘
```

### 🎯 **SUCCESS CRITERIA**

Your iCatalyst Smart Home CRM deployment is successful when:

1. ✅ **Backend Service:** All API endpoints respond correctly
2. ✅ **Frontend Service:** UI loads and functions properly
3. ✅ **Database:** All CRUD operations work
4. ✅ **Integration:** Frontend can communicate with backend
5. ✅ **Security:** JWT authentication functions correctly
6. ✅ **Performance:** System responds within acceptable timeframes

---

## 🏆 **DEPLOYMENT COMPLETE!**

Once all checklist items are verified, your revolutionary AI-powered Smart Home CRM will be fully operational in production! 🚀 
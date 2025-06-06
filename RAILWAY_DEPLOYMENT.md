# 🚀 Railway Deployment Guide - iCatalyst Smart Home CRM

## 🎯 **UNIFIED DEPLOYMENT ARCHITECTURE**

**Single Railway Service** serves both:
- ✅ **Next.js Frontend** (React application)
- ✅ **Express.js Backend** (API server)
- ✅ **PostgreSQL Database** (Railway service)

**Result**: One URL provides complete iCatalyst experience!

## 🔧 **Critical Railway Environment Variables**

In your Railway project **Variables** tab, set these **EXACT** values:

### **Required Environment Variables**
```bash
# Database (connect to Railway PostgreSQL service)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Application Security
JWT_SECRET=iCatalyst2024SecureKey!
JWT_EXPIRES_IN=24h

# Application Configuration
NODE_ENV=production
NEXT_PUBLIC_API_URL=${{RAILWAY_PUBLIC_DOMAIN}}

# Railway automatically provides PORT - DO NOT SET PORT VARIABLE
```

## ⚠️ **Critical Railway Configuration Notes**

### **1. DO NOT SET PORT VARIABLE**
- Railway automatically provides `PORT=8080`
- Application correctly uses `process.env.PORT || 3001`
- **NEVER** manually set PORT in Railway Variables

### **2. Database Connection**
- Use `${{Postgres.DATABASE_URL}}` (Railway service reference)
- **NOT** a manual connection string
- Ensure PostgreSQL service is connected to your app

### **3. Public Domain**
- Use `${{RAILWAY_PUBLIC_DOMAIN}}` for NEXT_PUBLIC_API_URL
- This automatically resolves to your Railway domain

## 🏗️ **BUILD PROCESS**

Railway executes these steps automatically:

```bash
1. npm install                    # Install dependencies
2. npx prisma generate           # Generate Prisma client
3. next build                    # Build Next.js application
4. next export                   # Create static files
5. node src/index.js            # Start Express server
```

**Result**: Express serves both frontend and API from single port!

## 🔍 **Debugging Railway Deployment**

### **Check Environment Variables in Logs**
Look for this section in deployment logs:
```
=== RAILWAY DEPLOYMENT DEBUG ===
NODE_ENV: production
PORT: 8080
DATABASE_URL present: true
JWT_SECRET present: true
================================
```

### **Expected Startup Success**
```
✅ Logger loaded successfully
✅ Error handler loaded successfully  
✅ All routes loaded successfully
🎯 Production mode: Setting up Next.js static file serving
✅ Found Next.js static export directory
🚀 iCatalyst CRM Server Started Successfully!
📡 Server running on port 8080
🌐 Environment: production
🎯 Production mode: Serving Next.js frontend + Express API
```

## 🌐 **URL STRUCTURE**

**Single Railway URL provides everything:**

```
https://your-app.railway.app/
├── /                          # iCatalyst Frontend (Next.js)
├── /customers                 # Customer Management UI
├── /proposals                 # Proposal System UI
├── /portal/[token]           # Customer Portal
├── /api/                     # API Root (JSON response)
├── /api/customers            # Customer API
├── /api/proposals            # Proposal API
├── /api/products             # Product Catalog API
├── /api/portal               # Portal API
├── /health                   # Health Check
└── /debug/env               # Environment Debug
```

## 🚨 **Common Railway Issues & Fixes**

### **Issue: Environment Variables Missing**
**Symptoms**: `DATABASE_URL present: false` or `JWT_SECRET present: false`
**Fix**: Verify all variables are set in Railway Variables tab

### **Issue: Frontend Not Loading**
**Symptoms**: API responses but no UI
**Check**: Look for "Found Next.js static export directory" in logs
**Fix**: Verify build process completed successfully

### **Issue: API Routes Not Working**  
**Symptoms**: Frontend loads but API calls fail
**Check**: API routes should use `/api/` prefix
**Fix**: Verify API configuration in `src/lib/api.ts`

### **Issue: Database Connection Failed**
**Symptoms**: Prisma connection errors
**Fix**: Ensure PostgreSQL service is connected and DATABASE_URL uses service reference

### **Issue: Build Succeeds, Runtime Fails**
**Symptoms**: App restarts in infinite loop
**Fix**: Check for missing environment variables or file system issues

## 🎯 **Railway Deployment Checklist**

- [ ] PostgreSQL service connected to app
- [ ] All environment variables set (no PORT)
- [ ] DATABASE_URL uses `${{Postgres.DATABASE_URL}}`
- [ ] JWT_SECRET is set
- [ ] NODE_ENV set to `production`
- [ ] Latest code pushed to GitHub
- [ ] Railway auto-deploy triggered
- [ ] Build logs show Next.js export success
- [ ] Startup logs show frontend serving enabled

## 📊 **Health Check Endpoints**

Once deployed, test these endpoints:

### **Frontend Health**
- `https://your-app.railway.app/` - Full iCatalyst application
- `https://your-app.railway.app/customers` - Customer management
- `https://your-app.railway.app/proposals` - Proposal system

### **API Health**
- `https://your-app.railway.app/health` - Service health check
- `https://your-app.railway.app/api/` - API root information
- `https://your-app.railway.app/api/test-db` - Database connectivity
- `https://your-app.railway.app/debug/env` - Environment variables

## 🔄 **Redeployment Process**

1. Make changes to code
2. Commit and push to GitHub
3. Railway auto-deploys from GitHub
4. Monitor build logs for:
   - ✅ `next build` success
   - ✅ `next export` success
   - ✅ `Found Next.js static export directory`
5. Test both frontend and API endpoints

## 🎉 **Success Indicators**

**Complete deployment success when you see:**

1. **Build Logs**: "next export" completes successfully
2. **Startup Logs**: "Production mode: Serving Next.js frontend + Express API"
3. **Frontend**: iCatalyst UI loads at Railway URL
4. **API**: All `/api/*` endpoints respond correctly
5. **Database**: Customer/proposal data accessible
6. **Portal**: Customer portal links work properly

## 📞 **Support**

If deployment fails:
1. Check Railway build logs for Next.js export errors
2. Verify environment variables in debug endpoint
3. Test API endpoints separately from frontend
4. Ensure PostgreSQL service is healthy
5. Check for file serving errors in startup logs

**🎯 Final Result**: Complete iCatalyst Smart Home CRM system accessible from single Railway URL with voice-to-proposal, customer portal, and all features fully operational! 
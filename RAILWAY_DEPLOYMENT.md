# 🚀 Railway Deployment Guide - iCatalyst Smart Home CRM

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
🚀 iCatalyst CRM Server Started Successfully!
📡 Server running on port 8080
🌐 Environment: production
```

## 🚨 **Common Railway Issues & Fixes**

### **Issue: Environment Variables Missing**
**Symptoms**: `DATABASE_URL present: false` or `JWT_SECRET present: false`
**Fix**: Verify all variables are set in Railway Variables tab

### **Issue: Port Binding Failed**
**Symptoms**: `EADDRINUSE` or port conflicts
**Fix**: Remove any manual PORT variable - let Railway handle it

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

## 📊 **Health Check Endpoints**

Once deployed, test these endpoints:
- `https://your-app.railway.app/health` - Health check
- `https://your-app.railway.app/` - API root with all endpoints
- `https://your-app.railway.app/api/test-db` - Database connectivity test

## 🔄 **Redeployment Process**

1. Fix any issues in code
2. Commit and push to GitHub
3. Railway auto-deploys from GitHub
4. Monitor deployment logs for success messages
5. Test health endpoints

## 📞 **Support**

If deployment fails:
1. Check Railway logs for specific error messages
2. Verify all environment variables are present
3. Ensure PostgreSQL service is healthy
4. Test database connectivity with test endpoint 
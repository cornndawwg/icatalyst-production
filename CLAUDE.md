# iCatalyst Smart Home CRM - Project Instructions

## Railway Service Architecture

Based on the console errors and user clarification:

### **Current Railway Services (CORRECTED):**
- **Frontend**: `https://icatalyst-frontend-production.up.railway.app/`
  - Serves the **Next.js application** (main Smart Home CRM)
  - Has its own `/api/*` routes that need database access
  - Requires `DATABASE_URL` environment variable
  
- **Backend**: `https://icatalyst-production-production.up.railway.app/`
  - Serves the **Express.js API server**
  - Contains additional API routes and services
  - Also requires `DATABASE_URL` environment variable

## Console Errors Indicating Issues:

```
Access to fetch at 'https://icatalyst-production-production.up.railway.app/api/customers?summary=true' 
from origin 'https://icatalyst-frontend-production.up.railway.app' 
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present
```

## Root Cause Analysis (UPDATED):

1. **Frontend is actually the Next.js app** - not just a React proxy
2. **Next.js app has `/api/*` routes** that directly access the database
3. **Missing DATABASE_URL**: Frontend service needs database access for its API routes
4. **Previous CORS issue was secondary** - main issue is missing database connection

## Required Fixes:

### 1. Railway Environment Variables (CRITICAL):
Set in Railway **frontend** service dashboard:
```
DATABASE_URL=<your_postgresql_connection_string>
JWT_SECRET=<your_jwt_secret>
```

Optional (if still needed for cross-service calls):
```
NEXT_PUBLIC_API_URL=https://icatalyst-production-production.up.railway.app
```

### 2. Backend CORS Configuration:
- ✅ Already correctly allows `https://icatalyst-frontend-production.up.railway.app` 
- Located in `src/server.js`

### 3. Frontend Proxy Configuration:
- ✅ Already correctly configured in `frontend/server.js`
- Uses `NEXT_PUBLIC_API_URL` environment variable
- Falls back to hardcoded URL (this is causing the issue)

### 4. API Client Configuration:
- ✅ `frontend/src/utils/api.ts` - Correctly uses `/api` base URL
- ✅ Frontend React components use API utility correctly

## Project Structure:

```
smart-home-crm/
├── src/                     # Next.js + Express API (backend service)
│   ├── server.js           # Backend API server
│   ├── pages/              # Next.js pages
│   ├── lib/api.ts         # API client for Next.js
│   └── routes/            # Express API routes
├── frontend/               # React Vite app (frontend service)
│   ├── server.js          # Frontend proxy server
│   ├── src/
│   │   └── utils/api.ts   # API client for React app
│   └── dist/              # Built React app
└── prisma/                # Database schema
```

## Environment Variables:

- `NEXT_PUBLIC_API_URL=https://icatalyst-production-production.up.railway.app`
- `DATABASE_URL` - PostgreSQL connection
- `JWT_SECRET` - Authentication secret

## Current Status:
- ✅ CORS correctly configured in backend
- ✅ Frontend proxy correctly configured  
- ✅ API clients correctly configured
- ✅ Database environment variables added to frontend
- ✅ TypeScript compilation errors fixed
- ✅ **CRITICAL FIX**: Backend package.json start script corrected
- ❌ **Auth routes are test stubs** - no real authentication implementation
- ❌ **Proposals API expects auth** but no auth middleware exists

## Root Cause Found:
The backend service was running `npm start` which executed the Next.js app instead of the Express API server!

**Fix Applied**: Changed `package.json` start script from `next start` to `node src/index.js`

This means:
- Backend will now serve the Express API with /api/proposals routes
- Frontend will continue serving the Next.js CRM app
- The 404 errors should be resolved

## Next Steps:
1. **Set Railway Environment Variable**: Add `NEXT_PUBLIC_API_URL=https://icatalyst-production-production.up.railway.app` to frontend service
2. Redeploy frontend service after environment variable is set
3. Test API connectivity - should resolve CORS errors

## How to Set Railway Environment Variables:
1. Go to Railway dashboard
2. Select the **frontend** service (`icatalyst-frontend-production`)
3. Go to "Variables" tab
4. Add these variables:
   - Name: `DATABASE_URL`, Value: `<copy from backend service>`
   - Name: `JWT_SECRET`, Value: `<copy from backend service>`
5. Save and redeploy

## To Copy Variables from Backend Service:
1. Go to backend service variables
2. Copy the `DATABASE_URL` value
3. Copy the `JWT_SECRET` value  
4. Add them to frontend service
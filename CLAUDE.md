# iCatalyst Smart Home CRM - Project Instructions

## Railway Service Architecture

Based on the console errors and user clarification:

### **Current Railway Services:**
- **Frontend**: `https://icatalyst-frontend-production.up.railway.app/`
  - Serves the React Vite frontend application
  - Should proxy `/api/*` requests to the backend
  
- **Backend**: `https://icatalyst-production-production.up.railway.app/`
  - Serves the Express.js API and Next.js application
  - Contains all API routes under `/api/*`
  - Main Smart Home CRM with advanced features

## Console Errors Indicating Issues:

```
Access to fetch at 'https://icatalyst-production-production.up.railway.app/api/customers?summary=true' 
from origin 'https://icatalyst-frontend-production.up.railway.app' 
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present
```

## Root Cause Analysis:

1. **Frontend proxy is working correctly** - React app calls `/api/*` 
2. **Frontend server proxy** forwards to backend via hardcoded URL fallback
3. **Environment variable missing**: `NEXT_PUBLIC_API_URL` not set in Railway frontend service
4. **CORS configuration is correct** but proxy is using hardcoded URL instead of env var

## Required Fixes:

### 1. Railway Environment Variable (CRITICAL):
Set in Railway frontend service dashboard:
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
- ❌ **CRITICAL**: Missing `NEXT_PUBLIC_API_URL` environment variable in Railway frontend service
- ✅ TypeScript compilation errors fixed

## Next Steps:
1. **Set Railway Environment Variable**: Add `NEXT_PUBLIC_API_URL=https://icatalyst-production-production.up.railway.app` to frontend service
2. Redeploy frontend service after environment variable is set
3. Test API connectivity - should resolve CORS errors

## How to Set Railway Environment Variable:
1. Go to Railway dashboard
2. Select the **frontend** service (`icatalyst-frontend-production`)
3. Go to "Variables" tab
4. Add new variable:
   - Name: `NEXT_PUBLIC_API_URL`
   - Value: `https://icatalyst-production-production.up.railway.app`
5. Save and redeploy
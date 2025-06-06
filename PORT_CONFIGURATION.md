# Smart Home CRM - Standard Port Configuration

## Overview
This document defines the standard port configuration for the Smart Home CRM system to ensure consistency across development and deployment.

## Standard Ports ✅

### Backend (API Server)
- **Port**: `3001`
- **Technology**: Express.js
- **Purpose**: REST API endpoints for all CRM functionality
- **Start Command**: `npm run dev:api`
- **URL**: `http://localhost:3001`

### Frontend (Next.js Application)
- **Port**: `3002`
- **Technology**: Next.js (React)
- **Purpose**: CRM interface and Customer Portal
- **Start Command**: `npm run dev`
- **URL**: `http://localhost:3002`

## Environment Configuration

### Required Environment Variables
```env
# API Server (runs on 3001)
PORT=3001
NODE_ENV=development

# Frontend Configuration (Next.js runs on 3002)
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3002

# Database
DATABASE_URL="file:./database.sqlite"
```

## API Communication Flow
```
Frontend (3002) → API Calls → Backend (3001)
```

### Example API Calls
- Frontend at `http://localhost:3002` makes requests to:
  - `http://localhost:3001/api/proposals`
  - `http://localhost:3001/api/customers`
  - `http://localhost:3001/api/products`

## Customer Portal Configuration
- **Portal URLs**: `http://localhost:3002/portal/[token]`
- **Portal Layout**: Uses clean PortalLayout (no CRM sidebar)
- **CRM Interface**: Uses AppLayout with full navigation

## Development Commands

### Start Both Services
```bash
# Terminal 1: Start API Server (port 3001)
npm run dev:api

# Terminal 2: Start Frontend (port 3002) 
npm run dev
```

### Concurrent Start (Alternative)
```bash
npm run dev:full
```

## File Configuration References

### package.json
```json
{
  "scripts": {
    "dev": "next dev --port 3002",
    "dev:api": "node src/index.js"
  }
}
```

### src/lib/api.ts
```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
```

### src/index.js (Express Server)
```javascript
const PORT = process.env.PORT || 3001;
```

## Portal Layout Exclusion

### Pages WITHOUT CRM Layout (AppLayout)
- `/portal/[token]` - Customer portal pages
- `/portal-test` - Portal testing page
- `/login`, `/register`, `/404`, `/500` - Auth and error pages

### Pages WITH CRM Layout (AppLayout)
- All other pages (dashboard, proposals, customers, etc.)

## Troubleshooting

### Port Already in Use
If you get "EADDRINUSE" errors:

```bash
# For Windows
netstat -ano | findstr :3001
netstat -ano | findstr :3002

# Kill the process by PID
taskkill /PID [PID] /F
```

### API Connection Issues
1. Verify API server is running on port 3001
2. Check `NEXT_PUBLIC_API_URL` environment variable
3. Verify CORS configuration includes port 3002

## Production Notes
- Ports may differ in production environments
- Update environment variables accordingly
- Ensure firewall rules allow configured ports
- Use HTTPS in production (`https://yourdomain.com`)

---

**Last Updated**: January 2024  
**Standard Configuration**: API (3001) + Frontend (3002) 
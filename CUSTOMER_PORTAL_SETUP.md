# Customer Portal - Phase 1 MVP Setup

## Overview
The Customer Portal Phase 1 MVP provides secure, token-based proposal review and approval functionality for smart home integrators and their clients.

## Features Implemented ✅

### 🔒 Secure URL System
- JWT-based token authentication
- URL-safe base64 encoding
- Configurable expiration (7-90 days)
- Server-side token validation

### 🏠 Portal Interface
- **Overview Section**: Project summary, client info, highlights
- **Products Section**: Categorized product listings with specs and pricing
- **Investment Section**: Pricing breakdown and payment options
- **Approval Section**: Digital approval workflow (Approve/Changes/Reject)

### 📱 Design & UX
- Mobile-responsive Material-UI components
- Professional branding with integrator information
- Progress navigation stepper
- Clean, intuitive interface for all client personas

### 🔧 Technical Infrastructure
- Database schema updates with portal fields
- API endpoints for token generation and approval
- Component-based architecture
- TypeScript implementation

## Required Environment Variables

Create a `.env.local` file with:

```env
# Customer Portal Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production-2024
NEXT_PUBLIC_APP_URL=http://localhost:3002

# Database
DATABASE_URL="file:./dev.db"
```

## Database Schema Updates

The following fields were added to the `Proposal` model:

```prisma
// Portal functionality
portalToken     String?       @unique
portalExpiresAt DateTime?
portalViewCount Int           @default(0)
portalLastViewed DateTime?

// Client approval workflow
clientStatus    String?       // pending, approved, changes-requested, rejected
clientFeedback  String?
clientSignature String?
approvedAt      DateTime?
approvedBy      String?
```

## API Endpoints

### Generate Portal Token
```
POST /api/proposals/[id]/portal
```

**Request Body:**
```json
{
  "customExpiry": "30d"  // Optional: 7d, 14d, 30d, 60d, 90d
}
```

**Response:**
```json
{
  "portalUrl": "http://localhost:3002/portal/eyJhbGc...",
  "token": "eyJhbGc...",
  "expiresAt": "2024-02-15T10:30:00.000Z",
  "proposal": {
    "id": "proposal-id",
    "name": "Smart Home System",
    "clientName": "John Smith",
    "clientEmail": "john@example.com"
  }
}
```

### Submit Approval Decision
```
POST /api/portal/[token]/approve
```

**Request Body:**
```json
{
  "decision": "approved",  // approved | changes-requested | rejected
  "comment": "Looks great!",
  "clientSignature": "data:image/png;base64,..."  // Optional
}
```

## Usage

### 1. Generate Portal Link (Admin Interface)
```tsx
import PortalLinkGenerator from '../components/PortalLinkGenerator';

<PortalLinkGenerator
  proposalId="proposal-123"
  proposalName="Smart Home System"
  clientName="John Smith"
  clientEmail="john@example.com"
  onClose={() => setShowGenerator(false)}
  onGenerated={(url) => console.log('Portal URL:', url)}
/>
```

### 2. Client Access Portal
- Client receives secure URL via email
- URL format: `/portal/[secure-token]`
- Token automatically validates and loads proposal data

### 3. Approval Workflow
- Client reviews proposal sections using navigation stepper
- Makes approval decision on final step
- Decision is tracked in database with timestamp

## Testing

### Demo Portal
Visit `/portal-test` to see the implementation demo and generate test portal links.

### Demo Client Portal
Visit `/portal/demo-token` to experience the client-facing portal interface.

## Security Features

1. **JWT Tokens**: Cryptographically signed tokens with expiration
2. **URL Encoding**: Base64URL encoding for safe URL transmission
3. **Expiration Control**: Configurable token expiration dates
4. **Server Validation**: All tokens validated server-side
5. **Unique Tokens**: Each proposal gets a unique token

## Phase 2 Roadmap

### Advanced Features (Future Implementation)
- 📧 **Email Integration**: Automatic email notifications
- 💬 **Comment System**: Section-specific feedback
- ✍️ **Digital Signatures**: Canvas-based signature capture
- 📊 **Analytics**: View tracking and engagement metrics
- 🔄 **Version Control**: Proposal revision history
- 📄 **PDF Export**: Client-friendly PDF generation
- 🎨 **Custom Branding**: Per-integrator styling
- 📱 **Push Notifications**: Real-time updates

## File Structure

```
src/
├── pages/
│   ├── portal/
│   │   └── [token].tsx          # Client portal page
│   ├── api/
│   │   ├── proposals/
│   │   │   └── [id]/portal.ts   # Generate portal token
│   │   └── portal/
│   │       └── [token]/
│   │           └── approve.ts   # Handle approvals
│   └── portal-test.tsx          # Demo/testing page
├── components/
│   └── PortalLinkGenerator.tsx  # Admin component
├── lib/
│   └── portalAuth.ts           # JWT utilities
└── prisma/
    └── schema.prisma           # Updated schema
```

## Next Steps

1. **Database Migration**: Run `npx prisma migrate dev` to apply schema changes
2. **Environment Setup**: Configure JWT_SECRET and APP_URL
3. **Testing**: Use `/portal-test` to verify functionality
4. **Integration**: Add portal generation to existing proposal management
5. **Email Setup**: Configure SMTP for automated portal link delivery

## Support

The portal is designed to work seamlessly with the existing Smart Home CRM proposal system. All components are TypeScript-based with comprehensive error handling and fallback data for robust operation. 
# Smart Home CRM

A comprehensive customer relationship management system specifically designed for smart home integrators. This system helps manage customer relationships, properties, projects, and smart proposal generation with AI-powered recommendations.

## 🚀 Features

### **Customer Management**
- Track customer details and preferences
- Manage multiple properties per customer
- Monitor customer interactions and follow-ups
- Tag and categorize customers
- Customer-specific analytics and metrics

### **Smart Proposal System**
- AI-powered product recommendations
- Customer persona-based pricing (Good/Better/Best)
- Voice-to-text proposal input
- Smart product catalog with 10 categories
- Client portal for proposal reviews and approvals

### **Property & Project Management**
- Store property details and specifications
- Track installed smart home systems
- Manage project timelines and milestones
- Monitor budgets and expenses
- Document and photo management

### **Client Portal System**
- Secure portal access with tokens
- Client proposal review and approval workflow
- Digital signature collection
- Real-time status updates

## 🛠 Tech Stack

### **Backend**
- **Node.js** with Express.js API
- **PostgreSQL** database with Prisma ORM
- **JWT** authentication
- **Winston** logging
- **Multer** file uploads

### **Frontend**
- **Next.js 15** with TypeScript
- **Material-UI (MUI)** components
- **React 18** with modern hooks
- **Emotion** CSS-in-JS styling

### **Database**
- **PostgreSQL** with 35+ performance indexes
- **Prisma** ORM with full type safety
- Smart proposal data seeding
- Migration system with version control

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.x or later
- **npm** 9.x or later
- **PostgreSQL** 12+ (local or cloud)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/smart-home-crm.git
   cd smart-home-crm
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   Update `.env` with your database credentials:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
   JWT_SECRET="your-super-secure-jwt-secret-key"
   ```

4. **Set up the database:**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Apply database schema
   npm run db:migrate
   
   # Seed smart proposal data
   npm run db:seed
   ```

5. **Start the development servers:**
   ```bash
   # Terminal 1: Start API server (port 3001)
   npm run dev:api
   
   # Terminal 2: Start frontend (port 3002)
   npm run dev
   ```

6. **Access the application:**
   - Frontend: [http://localhost:3002](http://localhost:3002)
   - API: [http://localhost:3001](http://localhost:3001)
   - Database Studio: `npm run db:studio`

## 📦 Database Scripts

```bash
npm run db:generate    # Generate Prisma client
npm run db:migrate     # Apply schema changes
npm run db:studio      # Open database browser
npm run db:seed        # Seed smart proposal data
```

## 🌐 Deployment

### **Railway Deployment**

1. **Fork this repository**
2. **Connect to Railway:**
   - Create new project on [Railway](https://railway.app)
   - Connect your GitHub repository
   
3. **Set environment variables in Railway:**
   ```env
   DATABASE_URL=postgresql://user:pass@host:port/db
   JWT_SECRET=your-production-jwt-secret
   NODE_ENV=production
   PORT=3001
   ```

4. **Deploy:**
   - Railway will automatically build and deploy
   - Database migrations run automatically

### **Other Platforms**
- **Vercel:** Frontend-ready with API routes
- **Heroku:** Postgres add-on compatible
- **DigitalOcean:** App Platform ready
- **AWS/GCP:** Container deployment ready

## 📁 Project Structure

```
smart-home-crm/
├── src/
│   ├── components/        # React UI components
│   ├── pages/            # Next.js pages & API routes
│   ├── routes/           # Express API routes
│   ├── utils/            # Shared utilities
│   ├── services/         # Business logic services
│   └── types/            # TypeScript definitions
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── migrations/       # Database migrations
├── generated/            # Generated Prisma client
├── uploads/              # File upload storage
├── .env.example         # Environment template
└── package.json         # Dependencies & scripts
```

## 🎯 API Endpoints

- `GET /api/customers` - Customer management
- `GET /api/proposals` - Smart proposal system
- `GET /api/products` - Product catalog
- `GET /api/portal/:token` - Client portal access
- `POST /api/upload` - File uploads
- `GET /api/test-db` - Database health check

## 🔧 Development

### **Available Scripts**

```bash
npm run dev:api        # Start API server (port 3001)
npm run dev           # Start frontend (port 3002)
npm run dev:full      # Start both servers
npm run build         # Build for production
npm run lint          # ESLint check
npm run clean         # Clean build cache
```

### **Database Management**

- **Schema changes:** Update `prisma/schema.prisma`
- **Apply changes:** `npm run db:migrate`
- **Reset database:** `npx prisma db push --force-reset`
- **View data:** `npm run db:studio`

## 📊 Smart Proposal System

### **Customer Personas**
- **Residential:** homeowner, interior-designer, builder, architect
- **Commercial:** cto-cio, business-owner, c-suite, office-manager, facilities-manager

### **Product Categories**
- Audio/Video, Lighting, Security, Networking, Climate, Access Control

### **Pricing Tiers**
- **Good:** Base tier pricing
- **Better:** Enhanced features
- **Best:** Premium tier with full features

## 🔒 Security Features

- JWT authentication with secure tokens
- Password hashing with bcrypt
- Input validation on all routes
- SQL injection prevention with Prisma
- File upload security with Multer
- Environment variable protection

## 📈 Performance Optimizations

- **Database:** 35+ performance indexes
- **API:** Shared Prisma client instance
- **Frontend:** Next.js optimization
- **Caching:** Ready for Redis integration
- **CDN:** Static asset optimization

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ for Smart Home Integrators** 
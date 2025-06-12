# Smart Home CRM
<!-- Force Railway sync after cloud outage -->

A customer relationship management system specifically designed for smart home integrators. This system helps manage customer relationships, properties, projects, and interactions.

## Features

- **Customer Management**
  - Track customer details and preferences
  - Manage multiple properties per customer
  - Monitor customer interactions and follow-ups
  - Tag and categorize customers

- **Property Management**
  - Store property details and specifications
  - Track installed smart home systems
  - Manage property photos and documents
  - Record service history

- **Project Management**
  - Track installation and upgrade projects
  - Manage project timelines and milestones
  - Monitor budgets and expenses
  - Store project documents

- **Communication History**
  - Log all customer interactions
  - Schedule follow-ups and reminders
  - Track communication preferences
  - Monitor response times

- **Dashboard Analytics**
  - View key performance metrics
  - Track customer satisfaction
  - Monitor project progress
  - Analyze revenue trends

## Tech Stack

- Next.js
- TypeScript
- Material-UI
- Emotion (CSS-in-JS)

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm 9.x or later

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/smart-home-crm.git
   cd smart-home-crm
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory and add your environment variables:
   ```
   # Add your environment variables here
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

1. Build the application:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

## Project Structure

```
smart-home-crm/
├── src/
│   ├── components/     # Reusable React components
│   ├── pages/         # Next.js pages and API routes
│   ├── types/         # TypeScript type definitions
│   ├── styles/        # Global styles and themes
│   └── utils/         # Helper functions and utilities
├── public/           # Static files
├── package.json      # Project dependencies and scripts
├── tsconfig.json    # TypeScript configuration
└── next.config.js   # Next.js configuration
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 
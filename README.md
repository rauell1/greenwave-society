# Greenwave Society

> Empowering youth holistically to be changemakers and conserve the environment

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16.x-black)](https://nextjs.org/)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Development](#development)
- [Deployment](#deployment)
- [Security](#security)
- [Performance](#performance)
- [Contributing](#contributing)
- [License](#license)

## 🌟 Overview

Greenwave Society is a Kenyan non-profit organization dedicated to empowering young people to conserve the environment and become agents of sustainable change in their communities. This is the official website showcasing our programs, impact, and providing ways for the community to get involved.

## ✨ Features

### Core Features
- **Responsive Design**: Mobile-first, fully responsive across all devices
- **Contact Form**: Secure contact form with rate limiting and input validation
- **Newsletter Subscription**: Email subscription with duplicate prevention
- **Impact Metrics**: Dynamic counters showcasing organizational impact
- **Program Showcase**: Detailed information about our environmental programs
- **Team Profiles**: Meet the people behind the mission

### Technical Features
- **Production-Grade Security**:
  - Rate limiting on all API endpoints
  - Input validation and sanitization
  - CORS configuration
  - Security headers (CSP, X-Frame-Options, etc.)
  - XSS and injection attack prevention

- **Performance Optimizations**:
  - Database indexing on frequently queried fields
  - Connection pooling
  - Static asset optimization
  - Image optimization with Next.js

- **Observability**:
  - Structured logging
  - Health check endpoints
  - Request tracking and timing
  - Error monitoring

- **Developer Experience**:
  - TypeScript with strict mode
  - Environment variable validation
  - Centralized configuration
  - Comprehensive error handling

## 🛠 Tech Stack

### Frontend
- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: [TypeScript 5](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)

### Backend
- **Runtime**: Node.js / Bun
- **Database**: SQLite (via Prisma ORM)
- **Validation**: [Zod](https://zod.dev/)
- **API**: Next.js API Routes

### Development Tools
- **Linting**: ESLint
- **Package Manager**: npm / Bun
- **Git Hooks**: (optional) Husky

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or higher (or Bun 1.x)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/rauell1/greenwave-society.git
   cd greenwave-society
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   bun install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and configure the required variables (see [Environment Variables](#environment-variables))

4. **Initialize the database**
   ```bash
   npm run db:push
   # or
   bun run db:push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   # or
   bun run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
greenwave-society/
├── prisma/
│   └── schema.prisma          # Database schema
├── public/
│   ├── images/                # Static images
│   └── logo.svg               # Logo file
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── api/               # API routes
│   │   │   ├── contact/       # Contact form endpoint
│   │   │   ├── newsletter/    # Newsletter subscription
│   │   │   └── health/        # Health check endpoint
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Homepage
│   │   └── globals.css        # Global styles
│   ├── components/
│   │   └── ui/                # Reusable UI components (shadcn/ui)
│   ├── config/
│   │   └── app.config.ts      # Application configuration
│   ├── hooks/                 # Custom React hooks
│   ├── lib/
│   │   ├── db.ts              # Database client
│   │   ├── env.ts             # Environment validation
│   │   ├── logger.ts          # Structured logging
│   │   ├── rate-limit.ts      # Rate limiting
│   │   ├── utils.ts           # Utility functions
│   │   └── validation.ts      # Input validation schemas
│   └── middleware.ts          # Next.js middleware (CORS, security)
├── .env.example               # Environment variables template
├── next.config.ts             # Next.js configuration
├── tailwind.config.ts         # Tailwind CSS configuration
├── tsconfig.json              # TypeScript configuration
└── package.json               # Project dependencies

```

### Feature-Based Organization

The codebase follows a modular, feature-based organization:
- **Separation of Concerns**: API routes, components, and utilities are clearly separated
- **Type Safety**: TypeScript with strict mode enabled
- **Configuration Management**: Centralized config for easy maintenance
- **Security First**: Validation, sanitization, and rate limiting built-in

## 🔐 Environment Variables

Create a `.env` file in the root directory. See `.env.example` for all available options.

### Required Variables

```bash
DATABASE_URL="file:./db/custom.db"
NODE_ENV="development"
```

### Optional Variables

```bash
# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
PORT=3000

# Security
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000
CORS_ORIGIN="http://localhost:3000"
ENABLE_RATE_LIMITING=true

# Database Pool
DB_POOL_MIN=2
DB_POOL_MAX=10
DB_IDLE_TIMEOUT_MS=30000
DB_CONNECTION_TIMEOUT_MS=2000
```

## 💻 Development

### Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint

# Database
npm run db:push          # Push schema changes to database
npm run db:generate      # Generate Prisma client
npm run db:migrate       # Create and apply migrations
npm run db:reset         # Reset database (WARNING: deletes data)
```

### Development Workflow

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** with proper testing

3. **Lint your code**
   ```bash
   npm run lint
   ```

4. **Test the build**
   ```bash
   npm run build
   ```

5. **Commit and push**
   ```bash
   git add .
   git commit -m "feat: your feature description"
   git push origin feature/your-feature-name
   ```

## 🚢 Deployment

### Build for Production

```bash
npm run build
```

This creates:
- `.next/standalone/` - Standalone server for production
- `.next/static/` - Static assets
- `public/` - Public files

### Environment Setup

1. Set `NODE_ENV=production`
2. Configure all required environment variables
3. Ensure database is accessible
4. Set up proper CORS origins

### Deployment Platforms

#### Vercel (Recommended)
```bash
npm install -g vercel
vercel --prod
```

#### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build
CMD ["npm", "start"]
```

#### Traditional Server
```bash
npm run build
NODE_ENV=production npm start
```

## 🔒 Security

### Implemented Security Measures

1. **Input Validation**: All user inputs are validated using Zod schemas
2. **Sanitization**: HTML/script tags and dangerous patterns are removed
3. **Rate Limiting**: API endpoints are rate-limited (100 requests per 15 minutes)
4. **CORS**: Configured for specific origins in production
5. **Security Headers**: CSP, X-Frame-Options, X-Content-Type-Options, etc.
6. **SQL Injection Prevention**: Prisma ORM with parameterized queries
7. **XSS Prevention**: Input sanitization and CSP headers

### Security Best Practices

- Never commit `.env` files
- Rotate `SESSION_SECRET` regularly
- Keep dependencies updated
- Monitor logs for suspicious activity
- Use HTTPS in production
- Implement database backups

## ⚡ Performance

### Optimizations Implemented

1. **Database**:
   - Indexes on frequently queried fields
   - Connection pooling
   - Optimized queries

2. **Frontend**:
   - Image optimization with Next.js
   - Code splitting
   - Static generation where possible
   - Lazy loading of components

3. **API**:
   - Response caching headers
   - Efficient data fetching
   - Rate limiting to prevent abuse

### Performance Monitoring

- Health check endpoint: `/api/health`
- Structured logging with request timing
- Error tracking and reporting

## 🐛 Troubleshooting

### Common Issues

**Database connection errors**:
```bash
npm run db:push
```

**Build errors**:
```bash
rm -rf .next node_modules
npm install
npm run build
```

**Port already in use**:
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill
```

## 📈 Scalability Considerations

### Current Limitations (SQLite)
- Single file database
- Limited concurrent writes
- No built-in replication

### Scaling Recommendations (10,000+ users)

1. **Database**: Migrate to PostgreSQL or MySQL
2. **File Storage**: Move to S3/CloudFlare R2 for images
3. **Caching**: Implement Redis for sessions and caching
4. **CDN**: Use Cloudflare or similar for static assets
5. **Load Balancing**: Multiple application instances
6. **Background Jobs**: Queue system for emails/notifications
7. **Monitoring**: Application Performance Monitoring (APM)

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Write clean, documented code
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Contact

- **Email**: info@greenwavesociety.org
- **WhatsApp**: +254 700 519 130
- **Website**: [greenwavesociety.org](https://greenwavesociety.org)
- **Social Media**:
  - Instagram: [@green_wavesociety](https://instagram.com/green_wavesociety)
  - Twitter: [@greenwaveke](https://x.com/greenwaveke)
  - Facebook: [Greenwave Society](https://www.facebook.com/share/19byoMf2Re/)
  - TikTok: [@greenwave.society](https://tiktok.com/@greenwave.society)

## 🙏 Acknowledgments

- Built with love for the planet 🌍
- Powered by the amazing open-source community
- Special thanks to all our volunteers and supporters

---

**Made with 💚 by Greenwave Society**
<!-- deploy: trigger -->

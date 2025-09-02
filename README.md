# Lovees App

A modern dating app built with Next.js 15, featuring real-time chat, photo uploads, and advanced matching algorithms.

## ✨ Features

- ⚡ **Next.js 15** with App Router and TypeScript
- 🎨 **Tailwind CSS v4** with shadcn/ui components
- 🗄️ **PostgreSQL** with Prisma ORM
- 🔐 **NextAuth** with Google OAuth and credentials
- 💬 **Real-time chat** with Socket.IO
- 📁 **S3 file uploads** with Cloudflare R2
- 🎯 **Smart matching** with location and interests
- 🛡️ **User safety** with reports and blocking
- 📊 **Analytics** with PostHog (optional)
- 🐛 **Error tracking** with Sentry (optional)
- 🧪 **Testing** with Vitest and Playwright
- 🚀 **Production ready** with Vercel deployment

## 🚀 Quick Start

### Local Development

1. **Clone and setup:**
   ```bash
   git clone <repository-url>
   cd lovees-app
   npm install
   npm run setup:env
   ```

2. **Configure services:**
   - Set up [Neon Database](https://neon.tech)
   - Configure [Cloudflare R2](https://dash.cloudflare.com)
   - Set up [Google OAuth](https://console.cloud.google.com)

3. **Run migrations:**
   ```bash
   npm run prisma:migrate
   ```

4. **Start development:**
   ```bash
   npm run dev
   ```

### Production Deployment

1. **Deploy to Vercel:**
   - Connect your GitHub repository
   - Configure environment variables
   - Deploy automatically

2. **See detailed instructions:**
   - [Deployment Guide](DEPLOYMENT.md)
   - [Service Setup](SETUP_SERVICES.md)

## 📚 Documentation

- 🚀 [Deployment Guide](DEPLOYMENT.md) - Complete deployment instructions
- 🔧 [Service Setup](SETUP_SERVICES.md) - External services configuration
- 🧪 [Testing Guide](TESTING.md) - Unit and E2E testing
- ☁️ [S3 Setup](S3_SETUP.md) - File storage configuration
- 🛡️ [Reports & Blocks](REPORTS_AND_BLOCKS.md) - User safety features
- ⚙️ [Account Settings](ACCOUNT_SETTINGS.md) - User data management

## 🛠️ Available Scripts

### Development
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run setup:env` - Setup environment variables

### Code Quality
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier
- `npm run type-check` - TypeScript type checking

### Testing
- `npm run test` - Run unit tests (watch mode)
- `npm run test:run` - Run unit tests once
- `npm run test:coverage` - Run tests with coverage
- `npm run test:e2e` - Run E2E tests
- `npm run test:e2e:ui` - Run E2E tests with UI

### Database
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio
- `npm run prisma:reset` - Reset database
- `npm run prisma:deploy` - Deploy migrations to production

## 🌐 Live Demo

- **Production**: [your-app.vercel.app](https://your-app.vercel.app)
- **Staging**: [your-app-git-develop.vercel.app](https://your-app-git-develop.vercel.app)

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js App   │    │   PostgreSQL    │    │  Cloudflare R2  │
│                 │    │                 │    │                 │
│ • App Router    │◄──►│ • User data     │    │ • Photo storage │
│ • API Routes    │    │ • Matches       │    │ • CDN delivery  │
│ • Real-time     │    │ • Messages      │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │
         ▼
┌─────────────────┐    ┌─────────────────┐
│   NextAuth      │    │   Socket.IO     │
│                 │    │                 │
│ • Google OAuth  │    │ • Real-time     │
│ • JWT sessions  │    │ • Chat messages │
│ • Middleware    │    │ • Notifications │
└─────────────────┘    └─────────────────┘
```

## 🔒 Security Features

- ✅ **Rate limiting** on all POST endpoints
- ✅ **Input validation** with Zod schemas
- ✅ **SQL injection protection** with Prisma
- ✅ **XSS protection** with Next.js
- ✅ **CSRF protection** with NextAuth
- ✅ **File upload validation** (type, size, count)
- ✅ **User reporting and blocking**
- ✅ **Admin moderation tools**

## 📊 Monitoring

- **Error tracking**: Sentry integration
- **Analytics**: PostHog (optional)
- **Performance**: Vercel Analytics
- **Uptime**: Vercel monitoring
- **Online users**: Real-time metrics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
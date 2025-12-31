# HiNobody

A full-stack progressive web application for eye detection and masking using AI technology, built with Next.js (frontend) and NestJS (backend), both using TypeScript.

## 🌟 Features

### Core Features
- **AI-Powered Eye Detection & Masking**: Automatic eye detection and masking using TensorFlow.js and MediaPipe
- **Manual Masking Mode**: Manual mask creation by dragging on images
- **Multi-Language Support**: Full localization in English, Korean, Chinese, and Japanese
- **User Authentication**: Secure JWT-based authentication system
- **Progressive Web App (PWA)**: Installable PWA with offline capabilities


## 📁 Project Structure

```
hinobody/
├── frontend/                 # Next.js 16 application
│   ├── src/
│   │   ├── app/             # Next.js App Router pages
│   │   │   ├── [locale]/   # Localized routes
│   │   │   ├── layout.tsx  # Root layout with providers
│   │   │   ├── page.tsx    # Eye masking tool page
│   │   │   ├── home/       # Home page (Reddit-style feed)
│   │   │   ├── login/      # Login page
│   │   │   ├── register/   # Registration page
│   │   │   ├── dashboard/  # User dashboard
│   │   │   ├── profile/    # User profile
│   │   │   ├── settings/   # User settings
│   │   │   └── about/      # About page
│   │   ├── components/     # React components
│   │   │   ├── LocaleProvider.tsx
│   │   │   ├── LanguageSwitcher.tsx
│   │   │   ├── EyeMaskingForm.tsx
│   │   │   ├── topHeader/  # Header component
│   │   │   ├── sidebar/    # Sidebar navigation
│   │   │   ├── feedSection/ # Feed components
│   │   │   └── reuseComponents/ # Reusable components
│   │   ├── contexts/       # React contexts
│   │   │   ├── AuthContext.tsx
│   │   │   └── LanguageContext.tsx
│   │   ├── i18n/          # Internationalization config
│   │   │   ├── config.ts
│   │   │   ├── request.ts
│   │   │   └── routing.ts
│   │   ├── lib/           # Utility libraries
│   │   │   ├── locale-storage.ts
│   │   │   └── locale-cookie.ts
│   │   └── middleware.ts  # Next.js middleware
│   ├── messages/          # Translation files
│   │   ├── en.json        # English translations
│   │   ├── ko.json        # Korean translations
│   │   ├── zh.json        # Chinese translations
│   │   └── ja.json        # Japanese translations
│   └── public/            # Static assets
├── backend/                # NestJS API server
│   ├── src/
│   │   ├── auth/          # Authentication module
│   │   ├── user/         # User management
│   │   ├── board/        # Board management
│   │   ├── post/         # Post management
│   │   ├── comment/      # Comment system
│   │   ├── vote/         # Voting system
│   │   ├── report/       # Reporting system
│   │   ├── block/        # User blocking
│   │   ├── image/        # Image management
│   │   ├── s3/           # AWS S3 service
│   │   ├── prisma/       # Prisma service
│   │   └── main.ts       # Application entry
│   └── prisma/
│       ├── schema.prisma # Database schema
│       └── migrations/   # Database migrations
└── package.json          # Root workspace config
```

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Internationalization**: next-intl
- **AI/ML**: TensorFlow.js, MediaPipe Face Mesh
- **Image Processing**: browser-image-compression
- **Cloud Storage**: AWS SDK (S3)
- **PWA**: next-pwa

### Backend
- **Framework**: NestJS 11
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma 7
- **Authentication**: JWT (Passport.js)
- **Validation**: class-validator, class-transformer
- **API Documentation**: Swagger/OpenAPI
- **Cloud Storage**: AWS SDK (S3)

## 📋 Prerequisites

- **Node.js**: 18+ 
- **npm**: 9+ (or yarn)
- **PostgreSQL**: 14+ (for backend)
- **AWS Account**: (for S3 image storage - optional for development)

## 🚀 Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd hinobody
```

### 2. Install dependencies
```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend && npm install

# Install backend dependencies
cd ../backend && npm install
```

### 3. Environment Setup

#### Backend Environment
Create `backend/.env`:
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/hinobody?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# AWS S3
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_S3_BUCKET_NAME="hinobody-images"

# Server
NODE_ENV="development"
PORT=3001
```

### 4. Database Setup
```bash
cd backend

# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed initial data (optional)
npm run prisma:seed
```

## 💻 Development

### Run both frontend and backend concurrently:
```bash
npm run dev
```

### Run separately:

**Frontend (Next.js):**
```bash
npm run dev:frontend
# or
cd frontend && npm run dev
```
Frontend runs on: **http://localhost:3000**

**Backend (NestJS):**
```bash
npm run dev:backend
# or
cd backend && npm run start:dev
```
Backend runs on: **http://localhost:3001**

**API Documentation (Swagger):**
- Available at: **http://localhost:3001/api**

## 🌐 Internationalization (i18n)

The application supports 4 languages:
- 🇺🇸 English (en)
- 🇰🇷 Korean (ko)
- 🇨🇳 Chinese (zh)
- 🇯🇵 Japanese (ja)

### How it works:
- Language preference is stored in `localStorage` and synced to cookies
- All user-facing strings are localized using `next-intl`
- Translation files are located in `frontend/messages/`
- Language switcher is available in the header

### Adding new translations:
1. Add translation keys to `frontend/messages/en.json`
2. Add corresponding translations to `ko.json`, `zh.json`, `ja.json`
3. Use `useTranslations('namespace')` hook in components


### Build separately:
```bash
npm run build:frontend
npm run build:backend
```

## 🚢 Production

### Start production servers:
```bash
npm run start:frontend
npm run start:backend
```

## 📡 API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user

### Users
- `GET /users` - Get all users (protected)
- `GET /users/:id` - Get user by ID (protected)
- `GET /users/me/profile` - Get current user profile (protected)
- `PATCH /users/:id` - Update user (protected)
- `DELETE /users/:id` - Delete user (protected)

### Boards
- `GET /boards` - Get all active boards
- `GET /boards/:id` - Get board by ID
- `POST /boards` - Create board (protected)

### Posts
- `GET /posts` - Get all posts (with pagination)
- `GET /posts/feed` - Get home feed
- `GET /posts/:id` - Get post by ID
- `POST /posts` - Create post (protected)
- `PATCH /posts/:id` - Update post (protected)
- `DELETE /posts/:id` - Delete post (protected)

### Comments
- `GET /comments/post/:postId` - Get comments for a post
- `POST /comments` - Create comment (protected)
- `PATCH /comments/:id` - Update comment (protected)
- `DELETE /comments/:id` - Delete comment (protected)

### Votes
- `POST /votes` - Create/update/remove vote (protected)

### Images
- `GET /images` - Get all images
- `POST /images` - Create image record (protected)
- `DELETE /images/:id` - Delete image (protected)

For complete API documentation, visit `http://localhost:3001/api` when the backend is running.

## 🎨 Key Components

### Backend Modules
- **AuthModule**: JWT authentication
- **UserModule**: User management
- **PostModule**: Post CRUD operations
- **CommentModule**: Nested comment system
- **VoteModule**: Upvote/downvote system
- **ImageModule**: Image management with S3

## 🔧 Development Tools

### Database Management
```bash
# Open Prisma Studio (database GUI)
cd backend && npm run prisma:studio
```

### Code Quality
```bash
# Lint frontend
cd frontend && npm run lint

# Lint backend
cd backend && npm run lint
```

## 📝 Environment Variables

### Required for Frontend
- None (AWS S3 is optional)

### Required for Backend
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `JWT_EXPIRES_IN` - JWT expiration time

### Optional
- AWS credentials for S3 image storage
- Translation API keys (if using external translation service)

## 🐛 Troubleshooting

### Common Issues

**Port already in use:**
- Change ports in `.env` files or kill the process using the port

**Database connection errors:**
- Ensure PostgreSQL is running
- Check `DATABASE_URL` in `backend/.env`
- Run `npm run prisma:generate` in backend directory

**Translation not working:**
- Clear browser cache and localStorage
- Check translation files in `frontend/messages/`
- Ensure `next-intl` is properly configured

**AI model not loading:**
- Check internet connection (model downloads from CDN)
- Try manual masking mode as fallback
- Check browser console for errors

## 📄 License

MIT

## 👥 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

For issues and questions, please open an issue on GitHub.

---

**Built with ❤️ using Next.js, NestJS, and TypeScript**

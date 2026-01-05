# HiNobody Backend API

Backend API for HiNobody - A beauty review platform built with NestJS, PostgreSQL, and Prisma.

## Tech Stack

- **Framework**: NestJS
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT (Passport)
- **Validation**: class-validator, class-transformer

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/hinobody?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# AWS S3 (for image uploads)
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_S3_BUCKET_NAME="hinobody-images"

# Translation API (optional)
TRANSLATION_API_KEY="your-translation-api-key"
TRANSLATION_API_TYPE="google"

# App
NODE_ENV="development"
PORT=3001
```

### 3. Set Up Database

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed initial data (boards)
npm run prisma:seed
```

### 4. Start Development Server

```bash
npm run start:dev
```

The API will be available at `http://localhost:3001`

## Database Schema

### Core Tables

- **User**: User accounts with email, nickname, language preference
- **Board**: Community boards (Review, Assessment, Talk)
- **Post**: User posts with title, body, images
- **Comment**: Nested comments on posts
- **Vote**: Upvote/downvote on posts and comments
- **Report**: User reports for moderation
- **Block**: User blocking functionality
- **Image**: S3 image references

### Relationships

- User → Posts (1:N)
- User → Comments (1:N)
- User → Votes (1:N)
- Board → Posts (1:N)
- Post → Comments (1:N)
- Post → Images (1:N)
- Post → Votes (1:N)
- Comment → Votes (1:N)
- Comment → Replies (self-referencing)

## API Endpoints

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
- `GET /boards/slug/:slug` - Get board by slug
- `POST /boards` - Create board (protected)
- `PATCH /boards/:id` - Update board (protected)
- `DELETE /boards/:id` - Delete board (protected)

### Posts

- `GET /posts` - Get all posts (with pagination and filters)
- `GET /posts/feed` - Get home feed (all boards)
- `GET /posts/:id` - Get post by ID
- `POST /posts` - Create post (protected)
- `PATCH /posts/:id` - Update post (protected, author only)
- `DELETE /posts/:id` - Delete post (protected, author or admin)

### Comments

- `GET /comments/post/:postId` - Get comments for a post
- `GET /comments/:id` - Get comment by ID
- `POST /comments` - Create comment (protected)
- `PATCH /comments/:id` - Update comment (protected, author only)
- `DELETE /comments/:id` - Delete comment (protected, author or admin)

### Votes

- `POST /votes` - Create/update/remove vote (protected)
- `GET /votes/user-vote` - Get user's vote for post/comment (protected)

### Reports

- `GET /reports` - Get all reports (protected)
- `GET /reports/:id` - Get report by ID (protected)
- `POST /reports` - Create report (protected)
- `PATCH /reports/:id` - Update report status (protected, admin only)
- `DELETE /reports/:id` - Delete report (protected)

### Blocks

- `GET /blocks` - Get user's blocked users (protected)
- `GET /blocks/:id` - Get block by ID (protected)
- `POST /blocks` - Block a user (protected)
- `DELETE /blocks/:blockedId` - Unblock a user (protected)

### Images

- `GET /images` - Get all images
- `GET /images/post/:postId` - Get images for a post
- `GET /images/:id` - Get image by ID
- `POST /images` - Create image record (protected)
- `DELETE /images/:id` - Delete image (protected)

## Features

### ✅ Implemented

- User authentication (JWT)
- User management with language preferences
- Board CRUD operations
- Post CRUD with images
- Comment system with nested replies
- Upvote/Downvote system
- Report system
- User blocking
- Image management
- Full-text search (PostgreSQL)
- Pagination
- Soft deletes
- Admin moderation

### 🔄 To Be Implemented

- Translation API integration (Google/DeepL)
- AWS S3 upload service
- Search API with full-text search
- Real-time notifications
- Admin panel APIs

## Database Migrations

```bash
# Create a new migration
npm run prisma:migrate

# View database in Prisma Studio
npm run prisma:studio
```

## Code Structure

```
backend/
├── src/
│   ├── auth/          # Authentication module
│   ├── user/          # User management
│   ├── board/         # Board management
│   ├── post/          # Post management
│   ├── comment/       # Comment management
│   ├── vote/          # Voting system
│   ├── report/        # Reporting system
│   ├── block/         # User blocking
│   ├── image/         # Image management
│   ├── prisma/        # Prisma service
│   └── main.ts        # Application entry point
├── prisma/
│   ├── schema.prisma  # Database schema
│   └── seed.ts        # Database seed script
└── .env               # Environment variables
```

## Best Practices

- ✅ Modular architecture (feature-based modules)
- ✅ DTO validation with class-validator
- ✅ Service layer for business logic
- ✅ Proper error handling
- ✅ JWT authentication guards
- ✅ Soft deletes for data retention
- ✅ Type-safe with TypeScript
- ✅ Database relationships properly defined
- ✅ Indexes for performance

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Production Deployment

1. Set `NODE_ENV=production` in `.env`
2. Update `DATABASE_URL` to production database
3. Set strong `JWT_SECRET`
4. Configure AWS S3 credentials
5. Build the application:
   ```bash
   npm run build
   npm run start:prod
   ```

## License

MIT





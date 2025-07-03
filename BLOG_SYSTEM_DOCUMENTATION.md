# Blog System Documentation

## Overview

The blog system is a comprehensive community blogging platform integrated into the Next.js application. It provides a full-featured blogging experience with user authentication, content management, social interactions, and advanced features like series, categories, and analytics.

## Table of Contents

1. [Architecture](#architecture)
2. [Database Schema](#database-schema)
3. [API Endpoints](#api-endpoints)
4. [Frontend Components](#frontend-components)
5. [Features](#features)
6. [Authentication & Authorization](#authentication--authorization)
7. [Content Management](#content-management)
8. [Social Features](#social-features)
9. [Analytics & Tracking](#analytics--tracking)
10. [Search & Discovery](#search--discovery)
11. [Moderation System](#moderation-system)
12. [SEO & Performance](#seo--performance)
13. [Installation & Setup](#installation--setup)
14. [Usage Examples](#usage-examples)
15. [API Reference](#api-reference)
16. [Troubleshooting](#troubleshooting)

## Architecture

The blog system follows a modern full-stack architecture:

- **Frontend**: Next.js 14 with App Router
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Clerk
- **Styling**: Tailwind CSS with custom theme system
- **State Management**: React Hooks (useState, useEffect, useCallback)

### System Flow

```
User Request → Next.js App Router → API Routes → Mongoose Models → MongoDB
                     ↓
User Interface ← React Components ← API Response ← Database Query
```

## Database Schema

The blog system uses 10 main MongoDB collections:

### 1. Blog Collection
```javascript
{
  _id: ObjectId,
  title: String (required),
  slug: String (required, unique, indexed),
  excerpt: String (required, max 300 chars),
  content: String (required),
  coverImage: String,
  author: ObjectId (ref: User),
  category: String (required, default: 'general'),
  tags: [String],
  status: Enum ['draft', 'published', 'archived'],
  isPublic: Boolean,
  isFeatured: Boolean,
  publishedAt: Date,
  readTime: Number (minutes),
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String],
    ogImage: String
  },
  analytics: {
    readCount: Number,
    likeCount: Number,
    commentCount: Number,
    shareCount: Number,
    uniqueReaders: Number
  },
  averageRating: Number (0-5),
  ratingCount: Number,
  moderation: {
    isApproved: Boolean,
    approvedBy: ObjectId (ref: User),
    approvedAt: Date,
    rejectionReason: String,
    reportCount: Number,
    isHidden: Boolean
  },
  relatedPosts: [ObjectId] (ref: Blog),
  series: ObjectId (ref: BlogSeries),
  seriesOrder: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### 2. BlogComment Collection
```javascript
{
  _id: ObjectId,
  blogId: ObjectId (ref: Blog),
  author: ObjectId (ref: User),
  content: String (required, max 1000 chars),
  parentComment: ObjectId (ref: BlogComment),
  isEdited: Boolean,
  editedAt: Date,
  likeCount: Number,
  isHidden: Boolean,
  hiddenReason: String,
  replies: [ObjectId] (ref: BlogComment),
  createdAt: Date,
  updatedAt: Date
}
```

### 3. BlogCategory Collection
```javascript
{
  _id: ObjectId,
  name: String (required, unique),
  slug: String (required, unique, indexed),
  description: String,
  color: String (hex color),
  icon: String,
  isActive: Boolean,
  order: Number,
  postCount: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### 4. BlogSeries Collection
```javascript
{
  _id: ObjectId,
  title: String (required),
  slug: String (required, unique, indexed),
  description: String (required),
  coverImage: String,
  author: ObjectId (ref: User),
  posts: [{
    postId: ObjectId (ref: Blog),
    order: Number
  }],
  isComplete: Boolean,
  isPublic: Boolean,
  viewCount: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### 5. BlogLike Collection
```javascript
{
  _id: ObjectId,
  blogId: ObjectId (ref: Blog),
  userId: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

### 6. BlogBookmark Collection
```javascript
{
  _id: ObjectId,
  blogId: ObjectId (ref: Blog),
  userId: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

### 7. BlogRating Collection
```javascript
{
  _id: ObjectId,
  blogId: ObjectId (ref: Blog),
  userId: ObjectId (ref: User),
  rating: Number (1-5),
  review: String (max 500 chars),
  createdAt: Date,
  updatedAt: Date
}
```

### 8. BlogReport Collection
```javascript
{
  _id: ObjectId,
  blogId: ObjectId (ref: Blog),
  reportedBy: ObjectId (ref: User),
  reason: Enum ['spam', 'inappropriate', 'copyright', 'misinformation', 'harassment', 'other'],
  description: String (max 500 chars),
  status: Enum ['pending', 'reviewed', 'resolved', 'dismissed'],
  reviewedBy: ObjectId (ref: User),
  reviewedAt: Date,
  resolution: String,
  createdAt: Date,
  updatedAt: Date
}
```

### 9. BlogCommentLike Collection
```javascript
{
  _id: ObjectId,
  commentId: ObjectId (ref: BlogComment),
  userId: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

### 10. BlogReadingProgress Collection
```javascript
{
  _id: ObjectId,
  blogId: ObjectId (ref: Blog),
  userId: ObjectId (ref: User),
  progress: Number (0-100),
  isCompleted: Boolean,
  completedAt: Date,
  timeSpent: Number (seconds),
  createdAt: Date,
  updatedAt: Date
}
```

## API Endpoints

### Blog CRUD Operations

#### GET /api/blogs/public
**Description**: Fetch public published blogs with pagination, search, and filtering
**Query Parameters**:
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `search` (string): Search in title, excerpt, content, tags
- `category` (string): Filter by category slug
- `sort` (string): Sort by 'newest', 'popular', 'rating', 'trending'
- `featured` (boolean): Filter featured posts only

**Response**:
```javascript
{
  success: true,
  blogs: [...],
  categories: [...],
  pagination: {
    currentPage: 1,
    totalPages: 5,
    totalBlogs: 50,
    hasNext: true,
    hasPrev: false
  }
}
```

#### GET /api/blogs
**Description**: Fetch user's own blogs (authenticated)
**Query Parameters**: Same as public endpoint
**Headers**: Requires authentication

#### POST /api/blogs
**Description**: Create a new blog post
**Headers**: Requires authentication
**Body**:
```javascript
{
  title: "Blog Title",
  excerpt: "Brief description",
  content: "Full blog content",
  coverImage: "https://...",
  category: "technology",
  tags: ["react", "nextjs"],
  status: "draft", // or "published"
  isPublic: false,
  seo: {
    metaTitle: "SEO Title",
    metaDescription: "SEO Description",
    keywords: ["keyword1", "keyword2"]
  }
}
```

#### GET /api/blogs/[id]
**Description**: Get a specific blog by ID
**Parameters**: `id` - Blog ID

#### PUT /api/blogs/[id]
**Description**: Update a blog post (author only)
**Parameters**: `id` - Blog ID
**Headers**: Requires authentication
**Body**: Same as POST with optional fields

#### DELETE /api/blogs/[id]
**Description**: Delete a blog post (author only)
**Parameters**: `id` - Blog ID
**Headers**: Requires authentication

### Blog Interactions

#### POST /api/blogs/[id]/like
**Description**: Like/unlike a blog post
**Parameters**: `id` - Blog ID
**Headers**: Requires authentication

#### POST /api/blogs/[id]/bookmark
**Description**: Bookmark/unbookmark a blog post
**Parameters**: `id` - Blog ID
**Headers**: Requires authentication

#### POST /api/blogs/[id]/rating
**Description**: Rate a blog post
**Parameters**: `id` - Blog ID
**Headers**: Requires authentication
**Body**:
```javascript
{
  rating: 5, // 1-5
  review: "Optional review text"
}
```

#### POST /api/blogs/[id]/report
**Description**: Report a blog post
**Parameters**: `id` - Blog ID
**Headers**: Requires authentication
**Body**:
```javascript
{
  reason: "spam", // 'spam', 'inappropriate', 'copyright', etc.
  description: "Additional details"
}
```

### Comments

#### GET /api/blogs/[id]/comments
**Description**: Get comments for a blog post
**Parameters**: `id` - Blog ID
**Query Parameters**:
- `page` (number): Page number
- `limit` (number): Items per page
- `sort` (string): 'newest', 'oldest', 'popular'

#### POST /api/blogs/[id]/comments
**Description**: Add a comment to a blog post
**Parameters**: `id` - Blog ID
**Headers**: Requires authentication
**Body**:
```javascript
{
  content: "Comment text",
  parentComment: "optional_parent_id" // For replies
}
```

#### PUT /api/blogs/[id]/comments/[commentId]
**Description**: Edit a comment (author only)
**Parameters**: `id` - Blog ID, `commentId` - Comment ID
**Headers**: Requires authentication

#### DELETE /api/blogs/[id]/comments/[commentId]
**Description**: Delete a comment (author only)
**Parameters**: `id` - Blog ID, `commentId` - Comment ID
**Headers**: Requires authentication

### Categories

#### GET /api/blogs/categories
**Description**: Get all blog categories
**Response**:
```javascript
{
  success: true,
  categories: [
    {
      _id: "...",
      name: "Technology",
      slug: "technology",
      description: "Tech-related posts",
      color: "#3B82F6",
      postCount: 15,
      isActive: true
    }
  ]
}
```

#### POST /api/blogs/categories
**Description**: Create a new category (admin only)
**Headers**: Requires admin authentication

### Series

#### GET /api/blog-series
**Description**: Get blog series
**Query Parameters**:
- `author` (string): Filter by author ID
- `public` (boolean): Filter public series only

#### POST /api/blog-series
**Description**: Create a new blog series
**Headers**: Requires authentication

### User Bookmarks

#### GET /api/bookmarks
**Description**: Get user's bookmarked blogs
**Headers**: Requires authentication
**Query Parameters**:
- `page` (number): Page number
- `limit` (number): Items per page

## Frontend Components

### Pages

#### /blog
**File**: `src/app/blog/page.js`
**Description**: Main blog listing page with search, filtering, and pagination
**Features**:
- Public blog discovery
- Category filtering
- Search functionality
- Sort options (newest, popular, rating, trending)
- User's own blogs section
- Responsive grid layout
- Skeleton loading states

#### /blog/create
**File**: `src/app/blog/create/page.js`
**Description**: Blog creation page with rich editor
**Features**:
- Rich text editor
- Cover image upload
- Category selection
- Tag management
- SEO settings
- Draft/publish options
- Auto-save functionality

#### /blog/[slug]
**File**: `src/app/blog/[slug]/page.js`
**Description**: Individual blog post view
**Features**:
- Full blog content display
- Social interactions (like, bookmark, share)
- Comment system
- Related posts
- Reading progress tracking
- Author information
- Series navigation

#### /blog/edit/[id]
**File**: `src/app/blog/edit/[id]/page.js`
**Description**: Blog editing page (author only)
**Features**: Same as create page with pre-filled data

### Components

#### BlogCard
**Description**: Reusable blog post card component
**Props**:
- `blog`: Blog object
- `showActions`: Boolean for showing action buttons
- `compact`: Boolean for compact view

#### BlogEditor
**Description**: Rich text editor component
**Features**:
- Markdown support
- Image insertion
- Code syntax highlighting
- Preview mode

#### CommentSection
**Description**: Comments display and interaction component
**Features**:
- Nested comments/replies
- Comment editing and deletion
- Like functionality
- Pagination

## Features

### Core Features

1. **Blog Creation & Management**
   - Rich text editor with markdown support
   - Cover image upload
   - Category and tag system
   - Draft/publish workflow
   - SEO optimization fields

2. **Content Organization**
   - Categories with custom colors and icons
   - Tag system for better organization
   - Blog series for multi-part content
   - Related posts suggestions

3. **Social Interactions**
   - Like/unlike posts
   - Bookmark system
   - Comment system with replies
   - Rating system (1-5 stars)
   - Share functionality

4. **Discovery & Search**
   - Full-text search across title, content, tags
   - Category-based filtering
   - Sort options (newest, popular, rating, trending)
   - Featured posts highlighting

5. **Analytics & Tracking**
   - View count tracking
   - Reading progress monitoring
   - User engagement metrics
   - Popular content identification

### Advanced Features

1. **Moderation System**
   - Content reporting
   - Admin approval workflow
   - Automatic content filtering
   - Hidden content management

2. **SEO Optimization**
   - Custom meta titles and descriptions
   - Open Graph image support
   - Keyword optimization
   - URL slug customization

3. **User Experience**
   - Reading time estimation
   - Progressive loading
   - Mobile-responsive design
   - Dark/light theme support

4. **Performance**
   - Optimized database queries
   - Image optimization
   - Caching strategies
   - Lazy loading

## Authentication & Authorization

The blog system uses Clerk for authentication and implements role-based authorization:

### User Roles
- **Reader**: Can view public blogs, like, comment, bookmark
- **Author**: Can create, edit, delete own blogs
- **Moderator**: Can approve/reject reported content
- **Admin**: Full system access

### Protected Routes
- Blog creation/editing: Requires authentication
- Comments: Requires authentication
- Likes/bookmarks: Requires authentication
- Admin functions: Requires admin role

### Security Measures
- Input sanitization
- XSS protection
- CSRF protection
- Rate limiting on API endpoints

## Content Management

### Blog Lifecycle

1. **Draft Creation**
   - Author creates blog in draft status
   - Content can be saved and edited
   - Not visible to public

2. **Publishing**
   - Author publishes blog
   - Becomes visible based on privacy settings
   - Analytics tracking begins

3. **Moderation** (if enabled)
   - Automatic content screening
   - Manual review for reported content
   - Approval/rejection workflow

4. **Archiving**
   - Authors can archive old content
   - Removes from public discovery
   - Preserves content and analytics

### Content Types

1. **Standard Posts**
   - Individual blog posts
   - Full rich text content
   - Complete feature set

2. **Series Posts**
   - Part of a blog series
   - Sequential navigation
   - Series-wide analytics

3. **Featured Posts**
   - Highlighted content
   - Premium placement
   - Enhanced visibility

## Social Features

### Engagement System

1. **Likes**
   - One-click appreciation
   - Real-time counter updates
   - User like history

2. **Comments**
   - Threaded conversations
   - Reply system
   - Comment moderation

3. **Bookmarks**
   - Personal reading lists
   - Easy content saving
   - Bookmark management

4. **Ratings**
   - 5-star rating system
   - Written reviews
   - Average rating calculation

### Community Features

1. **Author Profiles**
   - Author information display
   - Author's blog listing
   - Follower system (future)

2. **Content Discovery**
   - Related posts suggestions
   - Popular content highlighting
   - Category-based browsing

## Analytics & Tracking

### Blog Analytics

1. **View Metrics**
   - Total view count
   - Unique reader count
   - Reading completion rate

2. **Engagement Metrics**
   - Like count
   - Comment count
   - Share count
   - Bookmark count

3. **Performance Metrics**
   - Average rating
   - Reading time
   - User retention

### User Analytics

1. **Reading History**
   - Posts read
   - Reading progress
   - Time spent reading

2. **Engagement History**
   - Liked posts
   - Comments made
   - Bookmarked content

## Search & Discovery

### Search Features

1. **Full-Text Search**
   - Title, content, and tag search
   - Relevance-based ranking
   - Search result highlighting

2. **Advanced Filtering**
   - Category filtering
   - Tag-based filtering
   - Date range filtering
   - Author filtering

3. **Sorting Options**
   - Newest first
   - Most popular
   - Highest rated
   - Trending content

### Discovery Features

1. **Recommendations**
   - Related posts
   - Popular in category
   - Trending topics

2. **Curation**
   - Featured posts
   - Editor's picks
   - Category highlights

## Moderation System

### Content Moderation

1. **Automatic Screening**
   - Profanity filtering
   - Spam detection
   - Content quality checks

2. **User Reporting**
   - Report inappropriate content
   - Multiple report categories
   - Report status tracking

3. **Admin Tools**
   - Content approval queue
   - Bulk moderation actions
   - User management

### Moderation Workflow

1. **Content Submission**
   - Automatic initial screening
   - Queue for review if needed

2. **Review Process**
   - Moderator review
   - Approval/rejection decision
   - Feedback to author

3. **Action Implementation**
   - Content publication
   - Content hiding/removal
   - User notifications

## SEO & Performance

### SEO Features

1. **Meta Information**
   - Custom titles and descriptions
   - Open Graph support
   - Twitter Card support

2. **URL Structure**
   - SEO-friendly slugs
   - Canonical URLs
   - Sitemap generation

3. **Content Optimization**
   - Keyword optimization
   - Image alt tags
   - Schema markup

### Performance Optimizations

1. **Database**
   - Optimized indexes
   - Query optimization
   - Connection pooling

2. **Caching**
   - API response caching
   - Static content caching
   - CDN integration

3. **Frontend**
   - Image optimization
   - Lazy loading
   - Code splitting

## Installation & Setup

### Prerequisites
- Node.js 18+
- MongoDB 5.0+
- Clerk account for authentication

### Environment Variables
```env
# Database
MONGODB_URI=mongodb://localhost:27017/codehunt

# Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...

# App URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

### Database Setup

1. **Install MongoDB**
2. **Create Database**: `codehunt`
3. **Seed Categories**:
   ```bash
   npm run seed:blog-categories
   ```

### Application Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Setup Environment**:
   - Copy `.env.example` to `.env.local`
   - Configure environment variables

3. **Start Development Server**:
   ```bash
   npm run dev
   ```

## Usage Examples

### Creating a Blog Post

```javascript
// API call to create a blog
const response = await fetch('/api/blogs', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: 'My First Blog Post',
    excerpt: 'This is a brief description of my blog post.',
    content: 'Full content of the blog post...',
    category: 'technology',
    tags: ['react', 'nextjs', 'javascript'],
    status: 'published',
    isPublic: true
  })
});

const blog = await response.json();
```

### Fetching Blogs with Filters

```javascript
// Fetch technology blogs, sorted by popularity
const params = new URLSearchParams({
  category: 'technology',
  sort: 'popular',
  page: '1',
  limit: '10'
});

const response = await fetch(`/api/blogs/public?${params}`);
const data = await response.json();
```

### Adding a Comment

```javascript
// Add a comment to a blog post
const response = await fetch(`/api/blogs/${blogId}/comments`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    content: 'Great blog post! Very informative.',
    parentComment: null // or parent comment ID for replies
  })
});
```

### Bookmarking a Post

```javascript
// Bookmark/unbookmark a blog post
const response = await fetch(`/api/blogs/${blogId}/bookmark`, {
  method: 'POST'
});

const result = await response.json();
console.log(result.bookmarked ? 'Bookmarked' : 'Unbookmarked');
```

## API Reference

### Response Format

All API responses follow a consistent format:

```javascript
// Success Response
{
  success: true,
  data: {...}, // or array
  message: "Operation completed successfully", // optional
  pagination: {...} // for paginated responses
}

// Error Response
{
  success: false,
  error: "Error message",
  details: {...} // optional error details
}
```

### Error Codes

- `400`: Bad Request - Invalid input data
- `401`: Unauthorized - Authentication required
- `403`: Forbidden - Insufficient permissions
- `404`: Not Found - Resource not found
- `409`: Conflict - Resource already exists
- `422`: Unprocessable Entity - Validation failed
- `500`: Internal Server Error - Server error

### Rate Limiting

API endpoints are rate-limited to prevent abuse:

- **Blog Creation**: 10 requests per hour per user
- **Comments**: 30 requests per hour per user
- **Likes/Bookmarks**: 100 requests per hour per user
- **Search**: 60 requests per minute per IP

## Troubleshooting

### Common Issues

1. **Mongoose Duplicate Index Warning**
   ```
   Warning: Duplicate schema index on {"slug":1} found
   ```
   **Solution**: Remove either `unique: true` from schema or explicit `.index()` call

2. **Authentication Errors**
   ```
   Error: User not authenticated
   ```
   **Solution**: Ensure Clerk is properly configured and user is signed in

3. **Database Connection Issues**
   ```
   Error: MongoDB connection failed
   ```
   **Solution**: Check MongoDB URI and ensure database is running

4. **Image Upload Failures**
   ```
   Error: Failed to upload cover image
   ```
   **Solution**: Configure image upload service (Cloudinary, AWS S3, etc.)

### Performance Issues

1. **Slow Blog Loading**
   - Check database indexes
   - Optimize image sizes
   - Implement caching

2. **High Memory Usage**
   - Limit query results
   - Implement pagination
   - Clear unused connections

### Debug Mode

Enable debug mode for detailed logging:

```env
DEBUG=blog:*
NODE_ENV=development
```

### Monitoring

Monitor system health with:

- Database query performance
- API response times
- Error rates
- User engagement metrics

## Future Enhancements

### Planned Features

1. **Advanced Editor**
   - Block-based editor
   - Collaborative editing
   - Version history

2. **Enhanced Social Features**
   - User following system
   - Blog subscriptions
   - Social sharing

3. **Analytics Dashboard**
   - Detailed analytics
   - Performance insights
   - Growth metrics

4. **Mobile App**
   - React Native app
   - Offline reading
   - Push notifications

5. **AI Features**
   - Content suggestions
   - Auto-tagging
   - Writing assistance

### Contributing

To contribute to the blog system:

1. Fork the repository
2. Create a feature branch
3. Implement changes with tests
4. Submit a pull request
5. Follow code review process

### License

This blog system is part of the CodeHunt application and follows the project's licensing terms.

---

*This documentation is maintained by the development team. For questions or updates, please contact the project maintainers.*

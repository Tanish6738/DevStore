# DevStore - Developer Tool Organizer

## Project Overview

DevStore is a developer-friendly web application that allows users to bookmark, organize, and share their favorite development tools, APIs, SaaS products, and resources. Think of it as a "Pocket" or "Raindrop.io" specifically designed for developers.

## Current Implementation Status

### ✅ Completed Features
- **Authentication Setup**: Clerk authentication integrated with custom theming
- **UI Foundation**: Landing page with hero section, features, testimonials, contact, and footer
- **Theme System**: Comprehensive theme provider with multiple predefined themes (dark, light, blue, green, etc.)
- **Accessibility**: Theme accessibility settings with font size, contrast, and motion controls
- **Responsive Design**: Tailwind CSS for responsive layouts
- **Component Library**: Custom UI components (Button, Card, Input) without external dependencies
- **Navigation**: Floating navbar and header components
- **Project Structure**: Organized file structure following Next.js best practices

### 🚧 Missing Implementation
- **Database Integration**: MongoDB connection and models
- **API Routes**: Backend functionality for CRUD operations
- **User Management**: Automatic user creation on Clerk login
- **Core Features**: Product bookmarking, collections, search, etc.

## Technology Stack

- **Framework**: Next.js 15.3.4 with App Router
- **Authentication**: Clerk (configured with custom theming)
- **Database**: MongoDB (to be implemented)
- **Styling**: Tailwind CSS 4.x + Custom CSS variables for theming
- **UI Components**: Custom components (no Shadcn/UI)
- **Icons**: Lucide React & Heroicons
- **Animations**: Framer Motion
- **Language**: JavaScript (no TypeScript)

## Project Idea Overview

A developer-friendly web app where users can:

- Upload or bookmark their favorite product URLs (developer tools, APIs, apps, etc.)
- Browse predefined (curated) product links
- Create a personal space or dashboard of starred products they use regularly
- Add tags, notes, or categorize tools
- Share collections publicly or keep them private

## 🧱 Key Features

### 1. User Authentication ✅ (Implemented)
- **Clerk Integration**: Email/Password, GitHub/Google OAuth
- **Custom Theming**: Clerk components styled to match app theme
- **Auto User Creation**: When user logs in via Clerk, automatically create user record in MongoDB
- **User Profiles**: Store user preferences and settings

### 2. Product URL Upload/Bookmarking 🚧 (To Implement)
- Add a URL (auto-fetch metadata like title, description, favicon)
- Optional: Add tags, category, personal notes
- Favorite/Star URLs
- **API Route**: `/api/products` for CRUD operations
- **Metadata Fetching**: Implement URL scraping for title, description, favicon

### 3. Predefined (Built-in) Product URLs 🚧 (To Implement)
- Curated list of developer tools (e.g. Postman, GitHub, Netlify, etc.)
- Filterable by category: DevOps, API Tools, Design, etc.
- Searchable with autocomplete
- **Database Seeding**: Pre-populate MongoDB with curated tools

### 4. Personal Dashboard 🚧 (To Implement)
- View starred/favorite tools
- Organize via categories or drag-and-drop sections
- Add/delete from dashboard
- **Protected Route**: `/dashboard` for authenticated users

### 5. Collections 🚧 (To Implement)
- Create custom "Collections" of tools
- Public or Private sharing
- Like GitHub stars but grouped thematically
- **API Routes**: `/api/collections` for collection management

### 6. Search & Filter System 🚧 (To Implement)
- Full-text search over titles, tags, URLs
- Filter by popularity, category, recently added
- **Search API**: `/api/search` with MongoDB text search

## 🎨 UI/UX Features

### Theme System ✅ (Implemented)
- **Multiple Themes**: Dark, Light, Blue, Green, Purple, Orange, Red, Sunset
- **Accessibility**: Font size controls, contrast adjustments, motion preferences
- **CSS Variables**: Theme colors stored in CSS custom properties
- **Theme Persistence**: User preferences saved in localStorage
- **Settings Page**: `/theme-settings` for theme customization

### Responsive Design ✅ (Implemented)
- **Mobile-First**: Tailwind CSS responsive design
- **Component Library**: Custom Button, Card, Input components
- **Landing Page**: Hero, Features, Testimonials, Contact sections

## 🚀 Advanced Features (Future Implementation)

### Tagging & Categorization
- Allow users to add custom tags (e.g., frontend, api, testing)
- Auto-tagging using metadata or AI
- Group tools by category, stack, or purpose

### Search Autocomplete & Filters
- Smart suggestions while typing
- Filters by:
  - Popularity
  - Recently added
  - Type (SaaS, CLI tool, IDE plugin, etc.)
  - Tech stack

### Bookmarklet or Chrome Extension
- Save URLs to your collection instantly
- Auto-capture page metadata and screenshot

### Collection Sharing
- Publicly share or embed a collection (great for blog posts or portfolios)
- Generate a unique URL for each shared collection

### Clone/Import a Collection
- Users can clone someone else's public collection and modify it
- Useful for onboarding new team members

### Admin & Community Features
- Admin Panel: Manage curated products, tags, flag abuse
- Moderation Tools: Review user-submitted tools
- Community Voting/Rating: Like, star, comment on public tools
- Featured Collections: Curated by admins or community upvotes

### Project-Based Collections
- Create a "workspace" per project
- Add tools specific to that project
- Share with collaborators/team members

## 📊 Database Schema (MongoDB)

### Collections Structure

```javascript
// users collection
users {
  _id: ObjectId,
  clerkId: String, // Clerk user ID for authentication
  displayName: String,
  email: String,
  avatarUrl: String,
  preferences: {
    theme: String,
    fontSize: String,
    contrast: String,
    motionEnabled: Boolean
  },
  createdAt: Date,
  updatedAt: Date
}

// teams collection
teams {
  _id: ObjectId,
  name: String,
  createdAt: Date,
  members: [ObjectId] // references to users
}

// collections collection
collections {
  _id: ObjectId,
  name: String,
  description: String,
  isPublic: Boolean,
  userId: ObjectId, // reference to users
  teamId: ObjectId, // reference to teams (optional)
  createdAt: Date,
  updatedAt: Date
}

// products collection
products {
  _id: ObjectId,
  title: String,
  url: String,
  description: String,
  faviconUrl: String,
  category: String,
  isPredefined: Boolean, // true for curated tools
  addedBy: ObjectId, // reference to users
  metadata: {
    ogImage: String,
    ogDescription: String,
    tags: [String]
  },
  createdAt: Date,
  updatedAt: Date
}

// collection_items collection (join table)
collection_items {
  _id: ObjectId,
  collectionId: ObjectId, // reference to collections
  productId: ObjectId, // reference to products
  addedBy: ObjectId, // reference to users
  notes: String,
  order: Number, // for drag-and-drop ordering
  createdAt: Date
}

// tags collection
tags {
  _id: ObjectId,
  name: String,
  color: String,
  category: String
}

// product_tags collection (many-to-many)
product_tags {
  _id: ObjectId,
  productId: ObjectId, // reference to products
  tagId: ObjectId // reference to tags
}

// reviews collection
reviews {
  _id: ObjectId,
  productId: ObjectId, // reference to products
  userId: ObjectId, // reference to users
  content: String,
  rating: Number, // 1-5 stars
  createdAt: Date
}

// activities collection (for tracking user actions)
activities {
  _id: ObjectId,
  userId: ObjectId, // reference to users
  action: String, // 'bookmark_added', 'collection_created', etc.
  targetType: String, // 'product', 'collection', etc.
  targetId: ObjectId,
  metadata: Object, // additional action data
  createdAt: Date
}
```

## 🔧 Implementation Roadmap

### Phase 1: Core Backend Setup
1. **MongoDB Connection**
   - Set up MongoDB Atlas or local MongoDB
   - Create connection utility (`/lib/mongodb.js`)
   - Environment variables configuration

2. **User Management**
   - Implement Clerk webhook for user creation
   - API route: `/api/auth/webhook` (Clerk webhook handler)
   - Auto-create user in MongoDB when Clerk user signs up

3. **Basic API Routes**
   - `/api/users/[id]` - User CRUD operations
   - `/api/products` - Product CRUD operations
   - `/api/collections` - Collection CRUD operations

### Phase 2: Core Features
1. **Product Bookmarking**
   - URL metadata fetching service
   - Product creation and management
   - User's personal product list

2. **Collections System**
   - Create/edit/delete collections
   - Add/remove products from collections
   - Public/private collection settings

3. **Dashboard**
   - Protected `/dashboard` route
   - Display user's collections and bookmarks
   - Basic search and filtering

### Phase 3: Enhanced Features
1. **Search & Filtering**
   - MongoDB text search implementation
   - Advanced filtering options
   - Autocomplete functionality

2. **Tagging System**
   - Tag creation and management
   - Product tagging
   - Tag-based filtering

3. **Social Features**
   - Public collection sharing
   - Collection cloning
   - User reviews and ratings

## 🔐 API Routes Structure

```
/api/
├── auth/
│   └── webhook.js          # Clerk webhook handler
├── users/
│   ├── [id].js            # Get/Update user
│   └── me.js              # Current user info
├── products/
│   ├── index.js           # GET all, POST new
│   ├── [id].js            # GET/PUT/DELETE product
│   ├── metadata.js        # Fetch URL metadata
│   └── predefined.js      # Get curated products
├── collections/
│   ├── index.js           # GET user collections, POST new
│   ├── [id].js            # GET/PUT/DELETE collection
│   ├── [id]/items.js      # Manage collection items
│   └── public/[id].js     # Public collection view
├── search/
│   ├── products.js        # Search products
│   ├── collections.js     # Search collections
│   └── suggestions.js     # Autocomplete
└── tags/
    ├── index.js           # GET all tags, POST new
    └── [id].js            # GET/PUT/DELETE tag
```

## 🎯 Environment Variables Required

```env
# Database
MONGODB_URI=mongodb+srv://...

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
CLERK_WEBHOOK_SECRET=whsec_...

# Optional: External APIs
LINK_PREVIEW_API_KEY=...
```

## 🚦 Getting Started - Next Steps

1. **Set up MongoDB**
   - Create MongoDB Atlas account or install locally
   - Create database and collections
   - Add connection string to environment variables

2. **Implement User Creation Webhook**
   - Create `/api/auth/webhook.js` for Clerk webhook
   - Configure Clerk dashboard to send webhooks
   - Test user creation flow

3. **Create Basic API Routes**
   - Start with `/api/products` CRUD operations
   - Add MongoDB models/schemas
   - Test with Postman or frontend

4. **Build Dashboard UI**
   - Create protected `/dashboard` route
   - Add authentication middleware
   - Build product listing and collection management UI

This roadmap prioritizes getting the core functionality working first, then building out the advanced features iteratively.

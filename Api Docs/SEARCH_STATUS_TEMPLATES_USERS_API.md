# Search, Status, Templates, and Users API Documentation

## Overview
This document covers the Search, Status, Templates, and Users APIs that provide essential functionality for content discovery, system monitoring, template management, and user profile operations.

---

# Search API Documentation

## Overview
The Search API provides comprehensive search functionality across products and collections with intelligent suggestions and filtering capabilities. It leverages MongoDB's full-text search capabilities for relevant results.

## Authentication
Search endpoints are public and do not require authentication.

## Base URL
All endpoints are prefixed with `/api/search`

---

## Search Operations

### 🌐 GET `/api/search/products`
**Description**: Search products with full-text search and filtering
**Authentication**: Not required

**Parameters**:
- `q` (query, required): Search query string
- `category` (query, optional): Filter by product category
- `page` (query, optional): Page number (default: 1)
- `limit` (query, optional): Items per page (default: 20)

**Response**:
```json
{
  "products": [
    {
      "_id": "string",
      "title": "string",
      "url": "string",
      "description": "string",
      "faviconUrl": "string",
      "category": "string",
      "isPredefined": boolean,
      "addedBy": {
        "_id": "string",
        "displayName": "string",
        "avatarUrl": "string"
      },
      "metadata": {
        "ogImage": "string",
        "ogDescription": "string",
        "tags": ["string"]
      },
      "createdAt": "ISO date",
      "updatedAt": "ISO date"
    }
  ],
  "pagination": {
    "page": number,
    "limit": number,
    "total": number,
    "pages": number
  }
}
```

**Features**:
- Full-text search across title, description, URL, and tags
- Results ordered by relevance score
- Category filtering
- Pagination support
- Returns empty results for queries less than 1 character

### 🌐 GET `/api/search/collections`
**Description**: Search public collections with full-text search
**Authentication**: Not required

**Parameters**:
- `q` (query, required): Search query string
- `page` (query, optional): Page number (default: 1)
- `limit` (query, optional): Items per page (default: 20)

**Response**:
```json
{
  "collections": [
    {
      "_id": "string",
      "name": "string",
      "description": "string",
      "isPublic": true,
      "userId": {
        "_id": "string",
        "displayName": "string",
        "avatarUrl": "string"
      },
      "createdAt": "ISO date",
      "updatedAt": "ISO date"
    }
  ],
  "pagination": {
    "page": number,
    "limit": number,
    "total": number,
    "pages": number
  }
}
```

**Features**:
- Searches only public collections
- Full-text search across name and description
- Results ordered by relevance score
- Populated user information
- Returns empty results for queries less than 1 character

### 🌐 GET `/api/search/suggestions`
**Description**: Get intelligent search suggestions for autocomplete
**Authentication**: Not required

**Parameters**:
- `q` (query, required): Search query string (minimum 2 characters)
- `type` (query, optional): Suggestion type filter ('products', 'collections', 'all') (default: 'all')

**Response**:
```json
{
  "suggestions": [
    {
      "type": "product | collection | category | tag",
      "text": "string",
      "category": "string" // only for product suggestions
    }
  ]
}
```

**Suggestion Types**:
- **Product**: Based on product titles and categories
- **Collection**: Based on public collection names (public only)
- **Category**: Product categories matching the query
- **Tag**: Product tags matching the query

**Features**:
- Intelligent autocomplete suggestions
- Multiple suggestion types in one response
- Duplicate removal
- Limited to 10 suggestions maximum
- Case-insensitive matching
- Minimum 2 characters required

**Algorithm**:
1. Product title and category matches (up to 5)
2. Public collection name and description matches (up to 5)
3. Category suggestions (up to 3)
4. Tag suggestions (up to 3)
5. Deduplication and relevance ranking

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Query parameter 'q' is required"
}
```

### 500 Internal Server Error
```json
{
  "error": "Error searching products" // or collections/suggestions
}
```

---

# Status API Documentation

## Overview
The Status API provides system health monitoring and database statistics for operational insight and monitoring.

## Authentication
Status endpoints are public for monitoring purposes.

## Base URL
All endpoints are prefixed with `/api/status`

---

## System Status

### 🌐 GET `/api/status`
**Description**: Get system status and database statistics
**Authentication**: Not required

**Response**:
```json
{
  "status": "connected | error",
  "database": "MongoDB",
  "stats": {
    "users": number,
    "products": number,
    "predefinedProducts": number,
    "userProducts": number,
    "collections": number,
    "publicCollections": number
  },
  "timestamp": "ISO date"
}
```

**Features**:
- Real-time database connectivity check
- Comprehensive system statistics
- User and content metrics
- Timestamp for monitoring logs

**Use Cases**:
- Health checks for monitoring systems
- Dashboard statistics
- System administration
- API status verification

### Error Response
```json
{
  "status": "error",
  "error": "Database connection failed",
  "timestamp": "ISO date"
}
```

---

# Templates API Documentation

## Overview
The Templates API manages collection templates, allowing users to create reusable collection structures and save their collections as templates for future use.

## Authentication
All template endpoints require authentication.

## Base URL
All endpoints are prefixed with `/api/templates`

---

## User Templates

### 🔒 GET `/api/templates/user`
**Description**: Get user's custom templates
**Authentication**: Required

**Response**:
```json
{
  "templates": [
    {
      "_id": "string",
      "name": "string",
      "description": "string",
      "isTemplate": true,
      "createdBy": "string",
      "items": [], // template structure
      "templateSource": "string", // original collection ID
      "createdAt": "ISO date",
      "updatedAt": "ISO date"
    }
  ]
}
```

**Features**:
- User-specific template listing
- Sorted by creation date (newest first)
- Includes template structure and metadata

### 🔒 POST `/api/templates/user`
**Description**: Save a collection as a template
**Authentication**: Required

**Body**:
```json
{
  "collectionId": "string (required)",
  "name": "string (optional)",
  "description": "string (optional)"
}
```

**Response**:
```json
{
  "template": {
    "_id": "string",
    "name": "string",
    "description": "string",
    "isTemplate": true,
    "createdBy": "string",
    "items": [], // copied from original collection
    "templateSource": "string",
    "createdAt": "ISO date",
    "updatedAt": "ISO date"
  }
}
```

**Features**:
- Creates template from existing collection
- Only collection owner can create template
- Copies collection structure and items
- Auto-generates template name if not provided
- Maintains reference to original collection

**Authorization**:
- User must own the source collection
- Templates are private to the creating user

---

## Error Responses

### 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```

### 404 Not Found
```json
{
  "error": "Collection not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Failed to fetch templates" // or "Failed to save template"
}
```

---

# Users API Documentation

## Overview
The Users API manages user profiles, preferences, and user-specific data including favorites and account synchronization with Clerk authentication.

## Authentication
All user endpoints require authentication except public profile views.

## Base URL
All endpoints are prefixed with `/api/users`

---

## Current User Operations

### 🔒 GET `/api/users/me`
**Description**: Get current user's profile and preferences
**Authentication**: Required

**Response**:
```json
{
  "id": "string",
  "clerkId": "string",
  "displayName": "string",
  "email": "string",
  "avatarUrl": "string",
  "preferences": {
    "theme": "dark | light",
    "fontSize": "small | base | large",
    "contrast": "normal | high",
    "motionEnabled": boolean
  },
  "createdAt": "ISO date",
  "updatedAt": "ISO date"
}
```

**Used in**:
- User profile components
- Settings pages
- Theme initialization

### 🔒 PUT `/api/users/me`
**Description**: Update current user's profile and preferences
**Authentication**: Required

**Body**:
```json
{
  "displayName": "string (optional)",
  "preferences": {
    "theme": "dark | light (optional)",
    "fontSize": "small | base | large (optional)",
    "contrast": "normal | high (optional)",
    "motionEnabled": boolean // optional
  }
}
```

**Response**: Updated user profile object

**Features**:
- Partial updates supported
- Only allowed fields can be updated
- Preferences are merged, not replaced

---

## User Favorites

### 🔒 GET `/api/users/me/favorites`
**Description**: Get user's favorite products
**Authentication**: Required

**Response**:
```json
{
  "favorites": [
    {
      "_id": "string",
      "productId": {
        "_id": "string",
        "title": "string",
        "description": "string",
        "url": "string",
        "faviconUrl": "string",
        "category": "string",
        "addedBy": {
          "_id": "string",
          "displayName": "string",
          "avatarUrl": "string"
        },
        "createdAt": "ISO date"
      },
      "createdAt": "ISO date" // when favorited
    }
  ]
}
```

**Features**:
- Fully populated product information
- Sorted by favorite date (newest first)
- Filters out deleted products automatically
- Includes product creator information

**Used in**:
- `src/app/favorites/page.js` - Favorites management page

---

## User Profile Operations

### 🌐 GET `/api/users/[id]`
**Description**: Get public user profile by ID
**Authentication**: Not required

**Parameters**:
- `id` (path): User ID

**Response**:
```json
{
  "id": "string",
  "displayName": "string",
  "avatarUrl": "string",
  "createdAt": "ISO date"
}
```

**Features**:
- Public profile information only
- No sensitive data exposed
- Used for user references in collections and products

### 🔒 PUT `/api/users/[id]`
**Description**: Update user profile by ID (self only)
**Authentication**: Required

**Parameters**:
- `id` (path): User ID

**Body**:
```json
{
  "displayName": "string (optional)",
  "preferences": {
    "theme": "string (optional)",
    "fontSize": "string (optional)",
    "contrast": "string (optional)",
    "motionEnabled": boolean // optional
  }
}
```

**Response**: Updated user profile object

**Authorization**:
- Users can only update their own profile
- Returns 403 Forbidden for other users

---

## User Synchronization

### 🔒 POST `/api/users/sync`
**Description**: Manually sync user data from Clerk (fallback for webhook issues)
**Authentication**: Required

**Response**:
```json
{
  "message": "User created successfully | User already exists",
  "user": {
    "_id": "string",
    "clerkId": "string",
    "displayName": "string",
    "email": "string",
    "avatarUrl": "string",
    "preferences": {
      "theme": "dark",
      "fontSize": "base",
      "contrast": "normal",
      "motionEnabled": true
    },
    "createdAt": "ISO date",
    "updatedAt": "ISO date"
  }
}
```

**Features**:
- Creates user record if doesn't exist
- Fetches data from Clerk API
- Sets default preferences
- Handles Clerk API failures gracefully
- Returns existing user if already synced

**Used in**:
- `src/components/UserSync.js` - Manual user synchronization component

**Use Cases**:
- Initial user setup
- Webhook failure recovery
- Manual user migration
- Development environment setup

---

## Error Responses

### 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden"
}
```

### 404 Not Found
```json
{
  "error": "User not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Error fetching user data" // or operation-specific message
}
```

---

# Tools API (Deprecated)

## Overview
The Tools API is deprecated and redirects to the Products API for backward compatibility.

### 🌐 GET `/api/tools/[id]`
**Description**: Deprecated endpoint that redirects to products API
**Authentication**: Not required

**Parameters**:
- `id` (path): Tool/Product ID

**Response**: Transformed product response with legacy format

**Features**:
- Automatic redirection to `/api/products/[id]`
- Response transformation for backward compatibility
- Maintains same functionality as products API
- Preserves authorization headers

**Note**: This endpoint should not be used for new development. Use `/api/products/[id]` instead.

---

# Data Models

## User Schema
```javascript
{
  "_id": "ObjectId",
  "clerkId": "String (required, unique)",
  "displayName": "String (required)",
  "email": "String (required, unique)",
  "avatarUrl": "String (default: '')",
  "preferences": {
    "theme": "String (default: 'dark')",
    "fontSize": "String (default: 'base')",
    "contrast": "String (default: 'normal')",
    "motionEnabled": "Boolean (default: true)"
  },
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

## User Favorite Schema
```javascript
{
  "_id": "ObjectId",
  "productId": "ObjectId (ref: Product, required)",
  "userId": "String (Clerk user ID, required)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

## Template Collection Schema
```javascript
{
  "_id": "ObjectId",
  "name": "String (required)",
  "description": "String",
  "isTemplate": "Boolean (true for templates)",
  "createdBy": "String (Clerk user ID)",
  "items": ["Mixed"], // Template structure
  "templateSource": "ObjectId (ref: Collection)", // Original collection
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

---

# Frontend Integration

## Search Components
- **Global search bars** - Use suggestions API for autocomplete
- **Product browsing** - Use products search for filtering
- **Collection discovery** - Use collections search for public content

## Status Monitoring
- **Admin dashboards** - Use status API for system metrics
- **Health checks** - Monitor API availability

## Template Management
- **Template gallery** - Browse and create templates
- **Collection creation** - Use templates as starting points

## User Management
- **`src/components/UserSync.js`** - User synchronization
- **`src/app/favorites/page.js`** - Favorites management
- **Profile settings** - User preference management

---

# Search Optimization

## MongoDB Text Indexes
```javascript
// Products search index
productSchema.index({ 
  title: 'text', 
  description: 'text', 
  url: 'text',
  'metadata.tags': 'text' 
});

// Collections search index
collectionSchema.index({ 
  name: 'text', 
  description: 'text' 
});
```

## Search Features
- **Relevance Scoring**: Results ordered by MongoDB text score
- **Multi-field Search**: Searches across multiple content fields
- **Category Filtering**: Additional filtering options
- **Fuzzy Matching**: Handles typos and partial matches

---

# Performance Considerations

## Search Performance
- Text indexes for fast full-text search
- Pagination to handle large result sets
- Relevance scoring for quality results
- Caching opportunities for popular queries

## User Data Performance
- Lean queries for public profiles
- Efficient favorites querying with population
- Preference updates use partial updates
- User sync fallback with error handling

## Template Performance
- Template storage optimized for quick access
- Efficient copying of collection structures
- User-scoped template queries

---

# Security Features

## Search Security
- Public endpoints with no sensitive data exposure
- Input validation for search queries
- Rate limiting through infrastructure

## User Security
- Clerk integration for authentication
- User isolation (users only access own data)
- Public profile data filtering
- Preference validation

## Template Security
- User ownership validation
- Template privacy controls
- Source collection authorization

---

# Integration Points

## Search Integration
- **Global Search**: Unified search across content types
- **Autocomplete**: Real-time suggestions
- **Filtering**: Category and tag-based refinement

## User Integration
- **Authentication**: Clerk user management
- **Profile Management**: Settings and preferences
- **Content Ownership**: User-created content tracking

## Template Integration
- **Collection System**: Template creation from collections
- **Reusability**: Template-based collection creation
- **Organization**: User-specific template management

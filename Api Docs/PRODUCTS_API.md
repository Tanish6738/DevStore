# Products API Documentation

## Overview
The Products API manages products/tools in the system, providing comprehensive functionality for CRUD operations, analytics, ratings, favorites, and tracking. Products represent web tools, applications, or resources that can be added to collections and shared with others.

## Authentication
Most endpoints require authentication using Clerk. Public endpoints are marked with 🌐. Authenticated endpoints are marked with 🔒.

## Base URL
All endpoints are prefixed with `/api/products`

---

## Product Management

### 🌐 GET `/api/products`
**Description**: Retrieve products with pagination, filtering, and search
**Authentication**: Not required

**Parameters**:
- `page` (query, optional): Page number (default: 1)
- `limit` (query, optional): Items per page (default: 20)
- `category` (query, optional): Filter by product category
- `search` (query, optional): Full-text search across title, description, URL, and tags
- `predefined` (query, optional): Filter predefined products (true/false)

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
- Full-text search with relevance scoring
- Category-based filtering
- Predefined vs user-created product filtering
- Populated user information for product creators
- Automatic metadata extraction

**Used in**:
- `src/app/products/page.js` - Main products browsing page

### 🔒 POST `/api/products`
**Description**: Create a new product
**Authentication**: Required

**Body**:
```json
{
  "url": "string (required)",
  "title": "string (optional)",
  "description": "string (optional)",
  "category": "string (optional, default: 'general')",
  "tags": ["string"] // optional array of tags
}
```

**Response**:
```json
{
  "_id": "string",
  "title": "string",
  "url": "string",
  "description": "string",
  "faviconUrl": "string",
  "category": "string",
  "isPredefined": false,
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
```

**Features**:
- Automatic URL validation and normalization
- Duplicate URL detection
- Automatic metadata fetching if title/description not provided
- Favicon extraction
- Tag integration
- Open Graph metadata extraction

**Used in**:
- `src/components/CreateProductModal.js` - Product creation form

---

## Individual Product Operations

### 🌐 GET `/api/products/[id]`
**Description**: Get a specific product by ID
**Authentication**: Not required

**Parameters**:
- `id` (path): Product ID
- `analytics` (query, optional): Include usage analytics (true/false)

**Response**:
```json
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
  "analytics": { // if analytics=true
    "totalUsage": number,
    "totalAccess": number,
    "favoriteCount": number
  },
  "createdAt": "ISO date",
  "updatedAt": "ISO date"
}
```

**Used in**:
- `src/app/products/[id]/page.js` - Product detail page
- `src/app/products/page.js` - Quick analytics view

### 🔒 PUT `/api/products/[id]`
**Description**: Update a product (owner only, or predefined products allow suggestions)
**Authentication**: Required

**Parameters**:
- `id` (path): Product ID

**Body**:
```json
{
  "title": "string (optional)",
  "description": "string (optional)",
  "category": "string (optional)",
  "tags": ["string"] // optional array of tags
}
```

**Response**: Updated product object

**Authorization**:
- User-created products: Only the creator can update
- Predefined products: Any user can suggest updates

**Used in**:
- `src/components/EditProductModal.js` - Product editing form

### 🔒 DELETE `/api/products/[id]`
**Description**: Delete a product (owner only, predefined products cannot be deleted)
**Authentication**: Required

**Parameters**:
- `id` (path): Product ID

**Response**:
```json
{
  "message": "Product deleted successfully"
}
```

**Authorization**:
- Only the product creator can delete their product
- Predefined products cannot be deleted

**Used in**:
- `src/components/DeleteProductModal.js` - Product deletion confirmation

---

## Predefined Products

### 🌐 GET `/api/products/predefined`
**Description**: Get predefined products with category filtering
**Authentication**: Not required

**Parameters**:
- `page` (query, optional): Page number (default: 1)
- `limit` (query, optional): Items per page (default: 20)
- `category` (query, optional): Filter by category

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
      "isPredefined": true,
      "createdAt": "ISO date"
    }
  ],
  "categories": ["string"], // unique categories for predefined products
  "pagination": {
    "page": number,
    "limit": number,
    "total": number,
    "pages": number
  }
}
```

**Features**:
- Only returns predefined products
- Includes list of available categories
- Optimized for browsing curated tools

---

## Product Analytics

### 🌐 GET `/api/products/[id]/analytics`
**Description**: Get detailed analytics for a product
**Authentication**: Not required

**Parameters**:
- `id` (path): Product ID
- `timeRange` (query, optional): Analytics time range

**Response**:
```json
{
  "overview": {
    "totalUsage": number,
    "publicUsage": number,
    "recentUsage": number,
    "totalAccess": number,
    "favoriteCount": number
  },
  "publicCollections": [
    {
      "_id": "string",
      "name": "string",
      "description": "string",
      "userId": {
        "_id": "string",
        "displayName": "string",
        "avatarUrl": "string"
      },
      "analytics": {
        "viewCount": number
      }
    }
  ],
  "weeklyTrend": [
    {
      "week": "string",
      "count": number
    }
  ],
  "categoryBreakdown": [
    {
      "category": "string",
      "count": number
    }
  ],
  "topCollaborators": [
    {
      "user": {
        "_id": "string",
        "displayName": "string",
        "avatarUrl": "string"
      },
      "usageCount": number
    }
  ]
}
```

**Features**:
- Comprehensive usage statistics
- Public collection listings
- Weekly usage trends
- Category breakdown analysis
- Top collaborator identification

**Used in**:
- `src/components/ProductAnalyticsModal.js` - Analytics dashboard
- `src/app/products/[id]/page.js` - Product analytics view

### 🔒 GET `/api/products/[id]/analytics/export`
**Description**: Export product analytics data
**Authentication**: Required

**Parameters**:
- `id` (path): Product ID
- `timeRange` (query, optional): Export time range
- `format` (query): Export format (csv, json)

**Response**: File download with analytics data

**Used in**:
- `src/components/ProductAnalyticsModal.js` - Analytics export functionality

---

## Product Rating System

### 🌐 GET `/api/products/[id]/rating`
**Description**: Get product rating statistics and user's rating
**Authentication**: Not required (user rating requires auth)

**Parameters**:
- `id` (path): Product ID

**Response**:
```json
{
  "averageRating": number,
  "totalRatings": number,
  "userRating": number // 0 if not authenticated or not rated
}
```

**Used in**:
- `src/components/ProductRating.js` - Rating display component

### 🔒 POST `/api/products/[id]/rating`
**Description**: Rate a product (1-5 stars)
**Authentication**: Required

**Parameters**:
- `id` (path): Product ID

**Body**:
```json
{
  "rating": number // 1-5
}
```

**Response**:
```json
{
  "averageRating": number,
  "totalRatings": number,
  "userRating": number
}
```

**Features**:
- Upsert functionality (updates existing rating)
- Real-time average calculation
- Validation for rating range (1-5)

**Used in**:
- `src/components/ProductRating.js` - Rating submission

---

## Product Favorites

### 🌐 GET `/api/products/[id]/favorite`
**Description**: Check if product is favorited by current user
**Authentication**: Not required (returns false if not authenticated)

**Parameters**:
- `id` (path): Product ID

**Response**:
```json
{
  "isFavorite": boolean
}
```

**Used in**:
- `src/components/ProductFavorite.js` - Favorite status display

### 🔒 POST `/api/products/[id]/favorite`
**Description**: Toggle product favorite status
**Authentication**: Required

**Parameters**:
- `id` (path): Product ID

**Body**:
```json
{
  "isFavorite": boolean
}
```

**Response**:
```json
{
  "isFavorite": boolean
}
```

**Features**:
- Toggle functionality (add/remove favorites)
- Upsert for adding, delete for removing
- User-specific favorites

**Used in**:
- `src/components/ProductFavorite.js` - Favorite toggle button
- `src/app/products/[id]/page.js` - Product page favorite action
- `src/app/favorites/page.js` - Favorites management

---

## Product Tracking

### 🔒 POST `/api/products/[id]/track`
**Description**: Track product access for analytics
**Authentication**: Not required (but enhanced with auth)

**Parameters**:
- `id` (path): Product ID

**Body**:
```json
{
  "collectionItemId": "string (optional)", // If accessed from a collection
  "source": "string (optional, default: 'direct')" // Access source tracking
}
```

**Response**:
```json
{
  "success": true,
  "message": "Access tracked",
  "productUrl": "string"
}
```

**Features**:
- Increments collection item access count
- Updates last accessed timestamp
- Tracks access source for analytics
- Returns actual product URL for redirection

**Used in**:
- `src/app/products/[id]/page.js` - Product click tracking

---

## Product Metadata

### 🌐 POST `/api/products/metadata`
**Description**: Fetch metadata for a URL (shared with main metadata API)
**Authentication**: Not required

**Body**:
```json
{
  "url": "string (required)"
}
```

**Response**:
```json
{
  "title": "string",
  "description": "string",
  "faviconUrl": "string",
  "ogImage": "string",
  "ogDescription": "string"
}
```

**Used internally during product creation for metadata extraction**

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "URL is required" // or "Invalid URL", "Rating must be between 1 and 5"
}
```

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
  "error": "Product not found"
}
```

### 409 Conflict
```json
{
  "error": "Product with this URL already exists"
}
```

### 500 Internal Server Error
```json
{
  "error": "Error fetching products" // or operation-specific messages
}
```

---

## Data Models

### Product Schema
```javascript
{
  "_id": "ObjectId",
  "title": "String (required)",
  "url": "String (required)", // Normalized URL
  "description": "String (default: '')",
  "faviconUrl": "String (default: '')",
  "category": "String (default: 'general')",
  "isPredefined": "Boolean (default: false)",
  "addedBy": "ObjectId (ref: User)",
  "metadata": {
    "ogImage": "String",
    "ogDescription": "String",
    "tags": ["String"]
  },
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Product Rating Schema
```javascript
{
  "_id": "ObjectId",
  "productId": "ObjectId (ref: Product, required)",
  "userId": "String (Clerk user ID, required)",
  "rating": "Number (required, min: 1, max: 5)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### User Favorite Schema
```javascript
{
  "_id": "ObjectId",
  "productId": "ObjectId (ref: Product, required)",
  "userId": "String (Clerk user ID, required)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Collection Item Schema (Related)
```javascript
{
  "_id": "ObjectId",
  "collectionId": "ObjectId (ref: Collection, required)",
  "productId": "ObjectId (ref: Product, required)",
  "addedBy": "ObjectId (ref: User, required)",
  "notes": "String (default: '')",
  "order": "Number (default: 0)",
  "isFavorite": "Boolean (default: false)",
  "lastAccessed": "Date (default: Date.now)",
  "accessCount": "Number (default: 0)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

---

## Frontend Components Using Products APIs

### Core Product Components
- **`src/app/products/page.js`** - Main products browsing and search page
- **`src/app/products/[id]/page.js`** - Individual product detail page
- **`src/components/CreateProductModal.js`** - Product creation form
- **`src/components/EditProductModal.js`** - Product editing form
- **`src/components/DeleteProductModal.js`** - Product deletion confirmation

### Feature Components
- **`src/components/ProductRating.js`** - Product rating display and submission
- **`src/components/ProductFavorite.js`** - Favorite toggle functionality
- **`src/components/ProductAnalyticsModal.js`** - Analytics dashboard for products

### Integration Components
- **`src/app/favorites/page.js`** - User favorites management
- **`src/components/AddToCollectionModal.js`** - Adding products to collections

---

## Search & Indexing

### Text Search Capabilities
Products support full-text search across:
- Title
- Description  
- URL
- Metadata tags

**Search Features**:
- Relevance scoring
- Case-insensitive matching
- Partial word matching
- Tag-based search

### Database Indexes
```javascript
// Text search index
productSchema.index({ 
  title: 'text', 
  description: 'text', 
  url: 'text',
  'metadata.tags': 'text' 
});

// Performance indexes
productRatingSchema.index({ productId: 1, userId: 1 }, { unique: true });
userFavoriteSchema.index({ productId: 1, userId: 1 }, { unique: true });
userFavoriteSchema.index({ userId: 1, createdAt: -1 });
```

---

## Categories & Tags

### Product Categories
Common categories include:
- `general` - General tools
- `development` - Development tools
- `design` - Design tools
- `productivity` - Productivity tools
- `marketing` - Marketing tools
- `analytics` - Analytics tools
- `ai` - AI/ML tools

### Tag System
- Products can have multiple tags via metadata.tags
- Tags support search and filtering
- Automatic tag extraction from metadata
- Manual tag assignment during creation/editing

---

## URL Handling & Validation

### URL Normalization
- Automatic protocol addition (https://)
- Trailing slash removal
- Query parameter normalization
- Subdomain handling

### Duplicate Detection
- Normalized URL comparison
- Prevents duplicate products with same URL
- Case-insensitive URL matching

---

## Analytics & Tracking

### Usage Analytics
- **Total Usage**: Count across all collections
- **Public Usage**: Usage in public collections only
- **Recent Usage**: Usage in last 30 days
- **Access Tracking**: Individual click/access tracking
- **Favorite Metrics**: Favorite count across users

### Performance Metrics
- **Weekly Trends**: 8-week usage patterns
- **Category Analysis**: Usage by category
- **Collection Distribution**: Which collections use the product
- **User Engagement**: Top users and collaborators

---

## Security Features

- **URL Validation**: Comprehensive URL format validation
- **Authorization**: Creator-only editing and deletion
- **Input Sanitization**: All user inputs sanitized
- **Rate Limiting**: Implicit through authentication requirements
- **Data Integrity**: Referential integrity with foreign keys
- **Audit Trail**: Creation and modification timestamps

---

## Performance Considerations

- **Pagination**: All list endpoints support pagination
- **Indexing**: Optimized database indexes for search and filtering
- **Metadata Caching**: Extracted metadata stored for performance
- **Aggregation Pipelines**: Efficient analytics calculations
- **Lean Queries**: Minimal data transfer where appropriate
- **Population Control**: Strategic population of related data

---

## Integration Points

### Collection System
- Products are added to collections via CollectionItem
- Tracking integrates with collection item access counts
- Analytics aggregate across collection usage

### User System
- Products linked to creators via addedBy field
- Favorites and ratings are user-specific
- User profiles show created products

### Search System
- Full-text search integration
- Category-based filtering
- Tag-based organization

### Metadata System
- Automatic metadata extraction
- Open Graph data integration
- Favicon collection and storage

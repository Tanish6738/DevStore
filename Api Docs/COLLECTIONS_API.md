# Collections API Documentation

## Overview
The Collections API provides comprehensive functionality for managing collections, including CRUD operations, collaboration features, analytics, and public access. Collections are user-created groups of products/tools with support for organization, sharing, and collaboration.

## Authentication
Most endpoints require authentication using Clerk. Authenticated endpoints are marked with 🔒. Public endpoints are marked with 🌐.

## Base URL
All endpoints are prefixed with `/api/collections`

---

## Collections Management

### 🔒 GET `/api/collections`
**Description**: Retrieve user's collections with pagination
**Authentication**: Required
**Parameters**:
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
      "isPublic": boolean,
      "userId": "string",
      "itemCount": number,
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

**Used in**:
- `src/app/dashboard/page.js` - Dashboard collections display
- `src/components/AddToCollectionModal.js` - Collection selection dropdown

### 🔒 POST `/api/collections`
**Description**: Create a new collection
**Authentication**: Required
**Body**:
```json
{
  "name": "string (required)",
  "description": "string (optional)",
  "isPublic": boolean (optional, default: false)
}
```

**Response**:
```json
{
  "_id": "string",
  "name": "string",
  "description": "string",
  "isPublic": boolean,
  "userId": "string",
  "itemCount": 0,
  "createdAt": "ISO date",
  "updatedAt": "ISO date"
}
```

**Used in**:
- `src/app/create-collection/page.js` - Collection creation form
- `src/components/AddToCollectionModal.js` - Quick collection creation
- `src/components/CollectionTemplateModal.js` - Template-based collection creation

---

## Individual Collection Operations

### 🌐 GET `/api/collections/[id]`
**Description**: Get a specific collection by ID
**Authentication**: Not required for public collections
**Parameters**:
- `id` (path): Collection ID
- `includeItems` (query, optional): Include collection items in response

**Response**:
```json
{
  "_id": "string",
  "name": "string",
  "description": "string",
  "isPublic": boolean,
  "userId": {
    "_id": "string",
    "displayName": "string",
    "avatarUrl": "string"
  },
  "itemCount": number,
  "items": [], // if includeItems=true
  "createdAt": "ISO date",
  "updatedAt": "ISO date"
}
```

**Used in**:
- `src/app/collections/[id]/page.js` - Collection detail page

### 🔒 PUT `/api/collections/[id]`
**Description**: Update a collection (owner only)
**Authentication**: Required
**Parameters**:
- `id` (path): Collection ID

**Body**:
```json
{
  "name": "string (optional)",
  "description": "string (optional)",
  "isPublic": boolean (optional)
}
```

**Response**: Updated collection object

**Used in**:
- `src/components/EditCollectionModal.js` - Collection editing form

### 🔒 DELETE `/api/collections/[id]`
**Description**: Delete a collection and all its items (owner only)
**Authentication**: Required
**Parameters**:
- `id` (path): Collection ID

**Response**:
```json
{
  "message": "Collection deleted successfully"
}
```

---

## Collection Items Management

### 🌐 GET `/api/collections/[id]/items`
**Description**: Get items in a collection with pagination
**Authentication**: Not required for public collections
**Parameters**:
- `id` (path): Collection ID
- `page` (query, optional): Page number (default: 1)
- `limit` (query, optional): Items per page (default: 20)

**Response**:
```json
{
  "items": [
    {
      "_id": "string",
      "collectionId": "string",
      "productId": {
        "_id": "string",
        "title": "string",
        "url": "string",
        "description": "string",
        "faviconUrl": "string",
        "category": "string"
      },
      "addedBy": {
        "_id": "string",
        "displayName": "string",
        "avatarUrl": "string"
      },
      "notes": "string",
      "order": number,
      "isFavorite": boolean,
      "createdAt": "ISO date"
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

**Used in**:
- `src/app/collections/[id]/page.js` - Collection items display

### 🔒 POST `/api/collections/[id]/items`
**Description**: Add an item to a collection (owner only)
**Authentication**: Required
**Parameters**:
- `id` (path): Collection ID

**Body**:
```json
{
  "productId": "string (required)",
  "notes": "string (optional)",
  "order": number (optional)
}
```

**Response**: Created collection item object

**Used in**:
- `src/components/AddToCollectionModal.js` - Adding products to collections

### 🔒 PUT `/api/collections/[id]/items`
**Description**: Update item notes or order (owner only)
**Authentication**: Required
**Parameters**:
- `id` (path): Collection ID

**Body**:
```json
{
  "itemId": "string (required)",
  "notes": "string (optional)",
  "order": number (optional)
}
```

**Response**: Updated collection item object

### 🔒 DELETE `/api/collections/[id]/items`
**Description**: Remove an item from collection (owner only)
**Authentication**: Required
**Parameters**:
- `id` (path): Collection ID
- `itemId` (query): Collection item ID to remove

**Response**:
```json
{
  "message": "Item removed from collection successfully"
}
```

---

## Public Collections

### 🌐 GET `/api/collections/public`
**Description**: Get all public collections with filtering and pagination
**Authentication**: Not required
**Parameters**:
- `page` (query, optional): Page number (default: 1)
- `limit` (query, optional): Items per page (default: 50)
- `category` (query, optional): Filter by category
- `search` (query, optional): Text search
- `sortBy` (query, optional): Sort field (createdAt, name, updatedAt, viewCount)
- `sortOrder` (query, optional): Sort direction (asc, desc)

**Response**:
```json
{
  "collections": [
    {
      "_id": "string",
      "name": "string",
      "description": "string",
      "owner": {
        "_id": "string",
        "displayName": "string",
        "avatarUrl": "string"
      },
      "itemCount": number,
      "analytics": {
        "viewCount": number
      },
      "createdAt": "ISO date"
    }
  ],
  "pagination": {
    "page": number,
    "limit": number,
    "totalCount": number,
    "totalPages": number,
    "hasNextPage": boolean,
    "hasPrevPage": boolean
  }
}
```

### 🌐 GET `/api/collections/public/[id]`
**Description**: Get a specific public collection
**Authentication**: Not required
**Parameters**:
- `id` (path): Collection ID

**Response**: Collection object with public visibility

### 🌐 GET `/api/collections/public/featured`
**Description**: Get featured public collections
**Authentication**: Not required

**Response**: Array of featured collections

---

## Collection Forking

### 🔒 POST `/api/collections/[id]/fork`
**Description**: Fork a public collection or accessible collection
**Authentication**: Required
**Parameters**:
- `id` (path): Collection ID to fork

**Response**:
```json
{
  "_id": "string",
  "name": "string (Copy)",
  "description": "string",
  "isPublic": false,
  "userId": "string",
  "originalCollectionId": "string",
  "itemCount": number,
  "createdAt": "ISO date"
}
```

**Features**:
- Creates a complete copy of the collection and its items
- Generates unique name with "(Copy)" suffix
- Preserves item order and notes
- Validates collection size limits
- Records fork relationship
- Creates activity log entry

---

## Collection Analytics

### 🔒 GET `/api/collections/[id]/analytics`
**Description**: Get detailed analytics for a collection (owner only)
**Authentication**: Required
**Parameters**:
- `id` (path): Collection ID
- `range` (query, optional): Time range (7d, 30d, 90d, 1y)

**Response**:
```json
{
  "overview": {
    "totalViews": number,
    "viewsGrowth": "string",
    "uniqueVisitors": number,
    "visitorsGrowth": "string",
    "itemClicks": number,
    "clicksGrowth": "string",
    "avgTimeSpent": "string"
  },
  "viewsOverTime": [
    {
      "date": "string",
      "views": number
    }
  ],
  "popularItems": [
    {
      "label": "string",
      "value": number
    }
  ],
  "trafficSources": [
    {
      "label": "string",
      "value": number
    }
  ],
  "categoryPerformance": {},
  "recommendations": []
}
```

**Used in**:
- `src/components/AnalyticsModal.js` - Collection analytics dashboard

---

## Collection Collaboration

### 🔒 GET `/api/collections/[id]/collaborators`
**Description**: Get collection collaborators (owner/collaborators only)
**Authentication**: Required
**Parameters**:
- `id` (path): Collection ID

**Response**:
```json
{
  "collaborators": [
    {
      "_id": "string",
      "userId": {
        "_id": "string",
        "displayName": "string",
        "email": "string",
        "avatarUrl": "string"
      },
      "role": "string",
      "addedAt": "ISO date"
    }
  ]
}
```

**Used in**:
- `src/components/CollaborationModal.js` - Collaboration management

### 🔒 POST `/api/collections/[id]/invite`
**Description**: Invite a user to collaborate on collection
**Authentication**: Required
**Parameters**:
- `id` (path): Collection ID

**Body**:
```json
{
  "email": "string (required)",
  "role": "string (required)" // "view", "edit", "admin"
}
```

**Used in**:
- `src/components/CollaborationModal.js` - Sending collaboration invites

### 🔒 PUT `/api/collections/[id]/collaborators/[collaboratorId]`
**Description**: Update collaborator role
**Authentication**: Required
**Parameters**:
- `id` (path): Collection ID
- `collaboratorId` (path): Collaborator ID

**Body**:
```json
{
  "role": "string (required)"
}
```

### 🔒 DELETE `/api/collections/[id]/collaborators/[collaboratorId]`
**Description**: Remove collaborator
**Authentication**: Required
**Parameters**:
- `id` (path): Collection ID
- `collaboratorId` (path): Collaborator ID

**Used in**:
- `src/components/CollaborationModal.js` - Managing collaborator permissions

---

## Collection Views

### 🌐 POST `/api/collections/[id]/view`
**Description**: Record a view for analytics (increments view count)
**Authentication**: Not required
**Parameters**:
- `id` (path): Collection ID

**Response**:
```json
{
  "success": true
}
```

---

## Item Favorites

### 🔒 POST `/api/collections/[id]/items/[itemId]/favorite`
**Description**: Toggle favorite status of a collection item
**Authentication**: Required
**Parameters**:
- `id` (path): Collection ID
- `itemId` (path): Collection item ID

**Response**:
```json
{
  "isFavorite": boolean
}
```

---

## Import/Export (Referenced but not fully implemented)

### 🔒 GET `/api/collections/[id]/export`
**Description**: Export collection data
**Authentication**: Required
**Parameters**:
- `id` (path): Collection ID
- `format` (query): Export format

**Used in**:
- `src/components/ImportExportModal.js` - Collection export functionality

### 🔒 POST `/api/collections/[id]/import`
**Description**: Import collection data
**Authentication**: Required
**Parameters**:
- `id` (path): Collection ID

**Used in**:
- `src/components/ImportExportModal.js` - Collection import functionality

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "Error message describing the validation issue"
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
  "error": "Forbidden" // or "Access denied"
}
```

### 404 Not Found
```json
{
  "error": "Collection not found" // or "Collection item not found"
}
```

### 409 Conflict
```json
{
  "error": "Product already exists in this collection"
}
```

### 500 Internal Server Error
```json
{
  "error": "Error message describing the server issue"
}
```

---

## Data Models

### Collection Schema
```javascript
{
  "_id": "ObjectId",
  "name": "String (required)",
  "description": "String",
  "isPublic": "Boolean (default: false)",
  "userId": "ObjectId (ref: User, required)",
  "teamId": "ObjectId (ref: Team)",
  "analytics": {
    "viewCount": "Number (default: 0)",
    "uniqueVisitors": "Number (default: 0)",
    "lastViewed": "Date",
    "clickCount": "Number (default: 0)"
  },
  "templateData": {
    "isTemplate": "Boolean (default: false)",
    "templateCategory": "String",
    "templateDescription": "String",
    "templateTags": ["String"],
    "isPublicTemplate": "Boolean (default: false)"
  },
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Collection Item Schema
```javascript
{
  "_id": "ObjectId",
  "collectionId": "ObjectId (ref: Collection, required)",
  "productId": "ObjectId (ref: Product, required)",
  "addedBy": "ObjectId (ref: User, required)",
  "notes": "String",
  "order": "Number (default: 0)",
  "isFavorite": "Boolean (default: false)",
  "lastAccessed": "Date",
  "accessCount": "Number (default: 0)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Product Schema (Referenced)
```javascript
{
  "_id": "ObjectId",
  "title": "String (required)",
  "url": "String (required)",
  "description": "String",
  "faviconUrl": "String",
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

---

## Frontend Components Using Collections APIs

### Core Collection Components
- **`src/app/dashboard/page.js`** - Main dashboard displaying user collections
- **`src/app/collections/[id]/page.js`** - Individual collection view page
- **`src/app/create-collection/page.js`** - Collection creation form
- **`src/components/EditCollectionModal.js`** - Collection editing modal
- **`src/components/AddToCollectionModal.js`** - Add products to collections modal

### Advanced Features
- **`src/components/AnalyticsModal.js`** - Collection analytics dashboard
- **`src/components/CollaborationModal.js`** - Collaboration management
- **`src/components/ImportExportModal.js`** - Import/export functionality
- **`src/components/CollectionTemplateModal.js`** - Template-based collection creation

### Supporting Components
- **`src/components/ShareCollectionModal.js`** - Collection sharing features
- **`src/components/ProductFavorite.js`** - Item favoriting functionality

---

## Rate Limiting & Performance Considerations

- Collections have size limits enforced during forking operations
- Pagination is implemented on all list endpoints to handle large datasets
- Database queries use lean() for better performance where appropriate
- Batch operations are used for collection forking to handle large collections efficiently
- Analytics data may be cached or computed asynchronously for better performance

---

## Security Features

- **Authentication**: All modification endpoints require user authentication
- **Authorization**: Users can only modify collections they own
- **Validation**: Input validation on all endpoints
- **Data Protection**: Personal information is filtered in public responses
- **Access Control**: Public collections are accessible without authentication, private collections require ownership or collaboration access

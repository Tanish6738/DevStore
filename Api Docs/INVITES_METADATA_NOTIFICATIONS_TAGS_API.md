# Invites API Documentation

## Overview
The Invites API manages collaboration invitations for collections. It provides functionality for sending, receiving, accepting, declining, and managing collection collaboration invites with secure token-based access.

## Authentication
All endpoints require authentication using Clerk. Authenticated endpoints are marked with 🔒.

## Base URL
All endpoints are prefixed with `/api/invites`

---

## Invite Management

### 🔒 GET `/api/invites`
**Description**: Get all invites for the current user (both pending and recent)
**Authentication**: Required

**Response**:
```json
{
  "pendingInvites": [
    {
      "_id": "string",
      "collectionId": {
        "_id": "string",
        "name": "string",
        "description": "string",
        "isPublic": boolean
      },
      "invitedBy": {
        "_id": "string",
        "displayName": "string",
        "email": "string",
        "avatarUrl": "string"
      },
      "role": "string",
      "message": "string",
      "createdAt": "ISO date",
      "expiresAt": "ISO date",
      "status": "pending",
      "invitedEmail": "string"
    }
  ],
  "recentInvites": [
    {
      "_id": "string",
      "collectionId": {
        "_id": "string",
        "name": "string",
        "description": "string",
        "isPublic": boolean
      },
      "invitedBy": {
        "_id": "string",
        "displayName": "string",
        "email": "string",
        "avatarUrl": "string"
      },
      "role": "string",
      "status": "accepted | declined",
      "updatedAt": "ISO date"
    }
  ],
  "counts": {
    "pending": number,
    "recent": number
  }
}
```

**Features**:
- Returns pending invites that haven't expired
- Includes recent processed invites from the last 30 days
- Filters by user's email address
- Populates collection and inviter details

**Used in**:
- `src/app/invites/page.js` - Main invites dashboard

### 🔒 DELETE `/api/invites/[inviteId]`
**Description**: Cancel/delete a pending invite (for invite sender only)
**Authentication**: Required
**Parameters**:
- `inviteId` (path): Invite ID (not token)

**Response**:
```json
{
  "success": true,
  "message": "Invite cancelled successfully"
}
```

**Authorization**: Only the person who sent the invite can cancel it
**Constraints**: Can only cancel pending invites

---

## Individual Invite Operations

### 🌐 GET `/api/invites/[inviteId]`
**Description**: Get invite details by token or ID
**Authentication**: Not required for token-based access
**Parameters**:
- `inviteId` (path): Invite token (32-char hex) or Invite ID (24-char ObjectId)

**Response**:
```json
{
  "invite": {
    "id": "string",
    "collection": {
      "_id": "string",
      "name": "string",
      "description": "string",
      "isPublic": boolean
    },
    "invitedBy": {
      "_id": "string",
      "displayName": "string",
      "email": "string",
      "avatarUrl": "string"
    },
    "role": "string",
    "message": "string",
    "createdAt": "ISO date",
    "expiresAt": "ISO date",
    "status": "string",
    "invitedEmail": "string"
  }
}
```

**Features**:
- Supports both token-based (public) and ID-based (authenticated) access
- Automatically expires invites past their expiration date
- Returns detailed invite information with populated references

**Used in**:
- `src/app/invites/[inviteId]/page.js` - Invite acceptance page

### 🔒 POST `/api/invites/[inviteId]`
**Description**: Accept or decline an invite (token-based only)
**Authentication**: Required
**Parameters**:
- `inviteId` (path): Invite token (32-char hex string)

**Body**:
```json
{
  "action": "accept | decline"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Invite accepted successfully",
  "collectionId": "string" // only for accepted invites
}
```

**Features**:
- Validates invite token and expiration
- Checks email match with current user
- Creates collaborator record for accepted invites
- Updates invite status
- Creates notifications for invite sender
- Handles already-existing collaborators gracefully

**Used in**:
- `src/app/invites/[inviteId]/page.js` - Accept/decline invite actions
- `src/app/invites/page.js` - Quick accept/decline from list

### 🔒 DELETE `/api/invites/[inviteId]`
**Description**: Cancel/delete a pending invite (ID-based only)
**Authentication**: Required
**Parameters**:
- `inviteId` (path): Invite ID (24-char ObjectId)

**Response**:
```json
{
  "success": true,
  "message": "Invite cancelled successfully"
}
```

**Authorization**: Only the invite sender can cancel
**Constraints**: Only pending invites can be cancelled

---

## Additional Invite Endpoints

### 🔒 POST `/api/invites/[inviteId]/resend`
**Description**: Resend an invite email
**Authentication**: Required
**Parameters**:
- `inviteId` (path): Invite ID

**Response**:
```json
{
  "success": true,
  "message": "Invite resent successfully"
}
```

### 🔒 POST `/api/invites/cleanup`
**Description**: Cleanup expired invites (for cron jobs)
**Authentication**: Required (admin/system)

**Response**:
```json
{
  "success": true,
  "deletedCount": number
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Invalid action" // or "Invalid invite identifier"
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
  "error": "Access denied" // or "This invite is not for your email address"
}
```

### 404 Not Found
```json
{
  "error": "Invalid or expired invite"
}
```

### 410 Gone
```json
{
  "error": "Invite has expired"
}
```

### 500 Internal Server Error
```json
{
  "error": "Failed to fetch invites" // or other operation-specific messages
}
```

---

## Data Model

### Collection Invite Schema
```javascript
{
  "_id": "ObjectId",
  "collectionId": "ObjectId (ref: Collection, required)",
  "invitedBy": "ObjectId (ref: User, required)",
  "invitedEmail": "String (required)",
  "invitedUserId": "ObjectId (ref: User)", // Set when processed
  "role": "String (enum: ['view', 'edit', 'admin'], default: 'view')",
  "status": "String (enum: ['pending', 'accepted', 'declined', 'expired'], default: 'pending')",
  "inviteToken": "String (required, unique)", // 32-char hex string
  "expiresAt": "Date (required, default: 7 days from creation)",
  "message": "String (default: '')",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

---

## Frontend Components Using Invites APIs

### Core Components
- **`src/app/invites/page.js`** - Main invites dashboard showing pending and recent invites
- **`src/app/invites/[inviteId]/page.js`** - Individual invite acceptance/decline page

### Supporting Components
- **`src/components/CollaborationModal.js`** - Sending and managing invites (references invite functionality)

---

## Security Features

- **Token-based Access**: Secure 32-character hex tokens for public invite access
- **Email Validation**: Invites are tied to specific email addresses
- **Expiration**: Automatic 7-day expiration for security
- **Authorization**: Only invite senders can cancel invites
- **Status Tracking**: Comprehensive status management (pending, accepted, declined, expired)
- **Notification System**: Automatic notifications for invite responses

---

# Metadata API Documentation

## Overview
The Metadata API provides functionality for fetching website metadata including title, description, favicon, and Open Graph data. This is used when adding new products/tools to collections.

## Authentication
This endpoint does not require authentication.

## Base URL
All endpoints are prefixed with `/api/metadata`

---

## Metadata Fetching

### 🌐 POST `/api/metadata`
**Description**: Fetch metadata for a given URL
**Authentication**: Not required

**Body**:
```json
{
  "url": "string (required)" // The URL to fetch metadata for
}
```

**Response**:
```json
{
  "title": "string", // Page title
  "description": "string", // Meta description
  "faviconUrl": "string", // Favicon URL
  "ogImage": "string", // Open Graph image URL
  "ogDescription": "string" // Open Graph description
}
```

**Features**:
- Extracts page title from HTML
- Retrieves meta description
- Finds favicon URL
- Extracts Open Graph metadata
- Handles various URL formats and edge cases

**Used in**:
- `src/components/CreateProductModal.js` - Auto-populating product information when adding new tools

**Error Responses**:

### 400 Bad Request
```json
{
  "error": "URL is required"
}
```

### 500 Internal Server Error
```json
{
  "error": "Failed to fetch metadata"
}
```

---

# Notifications API Documentation

## Overview
The Notifications API manages user notifications for various system events like collaboration invites, collection sharing, and other activities. It provides functionality for retrieving, marking as read, and deleting notifications.

## Authentication
All endpoints require authentication using Clerk.

## Base URL
All endpoints are prefixed with `/api/notifications`

---

## Notification Management

### 🔒 GET `/api/notifications`
**Description**: Get user notifications with filtering options
**Authentication**: Required
**Parameters**:
- `limit` (query, optional): Number of notifications to retrieve (default: 20)
- `unreadOnly` (query, optional): Only return unread notifications (default: false)

**Response**:
```json
{
  "notifications": [
    {
      "_id": "string",
      "userId": "string",
      "type": "string",
      "title": "string",
      "message": "string",
      "relatedId": "string",
      "relatedType": "string",
      "isRead": boolean,
      "actionUrl": "string",
      "metadata": {},
      "createdAt": "ISO date",
      "updatedAt": "ISO date"
    }
  ],
  "unreadCount": number,
  "totalCount": number
}
```

**Notification Types**:
- `collaboration_invite` - Collaboration invitation responses
- `collection_shared` - Collection sharing notifications
- `item_added` - New items added to collections
- `template_used` - Template usage notifications
- `analytics_milestone` - Analytics milestone achievements

### 🔒 PUT `/api/notifications`
**Description**: Mark notifications as read
**Authentication**: Required

**Body**:
```json
{
  "notificationIds": ["string"], // Array of notification IDs to mark as read
  "markAllAsRead": boolean // Mark all user notifications as read
}
```

**Response**:
```json
{
  "success": true
}
```

**Features**:
- Can mark specific notifications as read
- Can mark all user notifications as read
- Sets `readAt` timestamp when marking as read

### 🔒 DELETE `/api/notifications/[id]`
**Description**: Delete a specific notification
**Authentication**: Required
**Parameters**:
- `id` (path): Notification ID

**Response**:
```json
{
  "success": true
}
```

**Authorization**: Users can only delete their own notifications

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Invalid request"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```

### 404 Not Found
```json
{
  "error": "Notification not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Failed to fetch notifications" // or operation-specific message
}
```

---

## Data Model

### Notification Schema
```javascript
{
  "_id": "ObjectId",
  "userId": "ObjectId (ref: User, required)",
  "type": "String (enum: ['collaboration_invite', 'collection_shared', 'item_added', 'template_used', 'analytics_milestone'], required)",
  "title": "String (required)",
  "message": "String (required)",
  "relatedId": "ObjectId", // ID of related entity
  "relatedType": "String (enum: ['Collection', 'CollectionCollaborator', 'CollectionTemplate'])",
  "isRead": "Boolean (default: false)",
  "readAt": "Date", // Set when marked as read
  "actionUrl": "String", // URL for notification action
  "metadata": "Mixed (default: {})", // Additional notification data
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

---

## Usage Examples

### Creating Notifications (Server-side)
```javascript
// Example from invite acceptance
await Notification.create({
  userId: invite.invitedBy,
  type: 'collaboration_invite',
  title: 'Collaboration Invite Accepted',
  message: `${user.firstName} accepted your collaboration invite for "${collection.name}"`,
  relatedId: collection._id,
  relatedType: 'Collection',
  actionUrl: `/collections/${collection._id}`
});
```

---

# Tags API Documentation

## Overview
The Tags API manages product tags for categorization and organization. It provides functionality for creating, reading, updating, and deleting tags, as well as managing tag usage across products.

## Authentication
Most endpoints require authentication using Clerk. Read operations are public.

## Base URL
All endpoints are prefixed with `/api/tags`

---

## Tag Management

### 🌐 GET `/api/tags`
**Description**: Get all tags with usage counts and filtering
**Authentication**: Not required
**Parameters**:
- `category` (query, optional): Filter by tag category
- `search` (query, optional): Search tags by name (case-insensitive)

**Response**:
```json
{
  "tags": [
    {
      "_id": "string",
      "name": "string",
      "color": "string",
      "category": "string",
      "usageCount": number,
      "createdAt": "ISO date",
      "updatedAt": "ISO date"
    }
  ]
}
```

**Features**:
- Returns all tags sorted alphabetically
- Includes usage count for each tag
- Supports category filtering
- Supports name-based search

### 🔒 POST `/api/tags`
**Description**: Create a new tag
**Authentication**: Required

**Body**:
```json
{
  "name": "string (required)",
  "color": "string (optional, default: '#3B82F6')",
  "category": "string (optional, default: 'general')"
}
```

**Response**:
```json
{
  "_id": "string",
  "name": "string",
  "color": "string",
  "category": "string",
  "usageCount": 0,
  "createdAt": "ISO date",
  "updatedAt": "ISO date"
}
```

**Features**:
- Converts tag names to lowercase for consistency
- Checks for existing tags (case-insensitive)
- Returns 409 conflict if tag already exists

---

## Individual Tag Operations

### 🌐 GET `/api/tags/[id]`
**Description**: Get a specific tag by ID
**Authentication**: Not required
**Parameters**:
- `id` (path): Tag ID

**Response**:
```json
{
  "_id": "string",
  "name": "string",
  "color": "string",
  "category": "string",
  "usageCount": number,
  "createdAt": "ISO date",
  "updatedAt": "ISO date"
}
```

### 🔒 PUT `/api/tags/[id]`
**Description**: Update a tag
**Authentication**: Required
**Parameters**:
- `id` (path): Tag ID

**Body**:
```json
{
  "name": "string (optional)",
  "color": "string (optional)",
  "category": "string (optional)"
}
```

**Response**: Updated tag object with usage count

**Features**:
- Updates only provided fields
- Converts name to lowercase if provided
- Returns updated tag with current usage count

### 🔒 DELETE `/api/tags/[id]`
**Description**: Delete a tag and all its associations
**Authentication**: Required
**Parameters**:
- `id` (path): Tag ID

**Response**:
```json
{
  "message": "Tag deleted successfully"
}
```

**Features**:
- Removes all product-tag associations
- Completely deletes the tag from the system
- Cascading delete for related ProductTag records

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Tag name is required"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```

### 404 Not Found
```json
{
  "error": "Tag not found"
}
```

### 409 Conflict
```json
{
  "error": "Tag already exists"
}
```

### 500 Internal Server Error
```json
{
  "error": "Error fetching tags" // or operation-specific message
}
```

---

## Data Models

### Tag Schema
```javascript
{
  "_id": "ObjectId",
  "name": "String (required, unique)",
  "color": "String (default: '#3B82F6')", // Hex color code
  "category": "String (default: 'general')",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Product Tag Schema (Many-to-Many Relationship)
```javascript
{
  "_id": "ObjectId",
  "productId": "ObjectId (ref: Product, required)",
  "tagId": "ObjectId (ref: Tag, required)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

---

## Usage Patterns

### Tag Categories
Common tag categories include:
- `general` - General purpose tags
- `technology` - Technology-specific tags
- `industry` - Industry or domain tags
- `feature` - Feature-based tags
- `skill` - Skill requirement tags

### Color Coding
Tags support hex color codes for visual organization:
- Default: `#3B82F6` (blue)
- Custom colors can be set for better categorization

---

## Frontend Integration

### Potential Usage (Components not yet implemented)
- Product creation/editing forms
- Tag management dashboard
- Filter components for product browsing
- Tag suggestion systems
- Category-based organization

---

## Performance Considerations

- **Usage Counts**: Calculated in real-time for accuracy
- **Indexing**: Optimized for name-based searches
- **Cascading Deletes**: Efficient cleanup of tag associations
- **Case Sensitivity**: Normalized to lowercase for consistency

---

## Security Features

- **Input Validation**: Name requirements and format validation
- **Duplicate Prevention**: Case-insensitive duplicate checking
- **Authorization**: Only authenticated users can modify tags
- **Data Consistency**: Atomic operations for tag-product associations

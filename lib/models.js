import mongoose from 'mongoose';

// User Schema
const userSchema = new mongoose.Schema({
  clerkId: {
    type: String,
    required: true,
    unique: true,
  },
  displayName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  avatarUrl: {
    type: String,
    default: '',
  },
  preferences: {
    theme: {
      type: String,
      default: 'dark',
    },
    fontSize: {
      type: String,
      default: 'base',
    },
    contrast: {
      type: String,
      default: 'normal',
    },
    motionEnabled: {
      type: Boolean,
      default: true,
    },
  },
}, {
  timestamps: true,
});

// Team Schema
const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
}, {
  timestamps: true,
});

// Collection Schema
const collectionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  isPublic: {
    type: Boolean,
    default: false,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdBy: {
    type: String, // Clerk user ID
    required: true,
  },
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
  },
  analytics: {
    viewCount: {
      type: Number,
      default: 0,
    },
    uniqueVisitors: {
      type: Number,
      default: 0,
    },
    lastViewed: {
      type: Date,
      default: Date.now,
    },
    clickCount: {
      type: Number,
      default: 0,
    },
  },
  templateData: {
    isTemplate: {
      type: Boolean,
      default: false,
    },
    templateCategory: {
      type: String,
      default: '',
    },
    templateDescription: {
      type: String,
      default: '',
    },
    templateTags: [String],
    isPublicTemplate: {
      type: Boolean,
      default: false,
    },
    usageCount: {
      type: Number,
      default: 0,
    },
    templateSource: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Collection',
    },
  },
  // Template-related fields for compatibility
  isTemplate: {
    type: Boolean,
    default: false,
  },
  usageCount: {
    type: Number,
    default: 0,
  },
  fromTemplate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Collection',
  },
  itemCount: {
    type: Number,
    default: 0,
  },
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      default: '',
    },
  }],
  category: {
    type: String,
    default: 'general',
  },
}, {
  timestamps: true,
});

// Product Schema
const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  faviconUrl: {
    type: String,
    default: '',
  },
  category: {
    type: String,
    default: 'general',
  },
  isPredefined: {
    type: Boolean,
    default: false,
  },
  isPublic: {
    type: Boolean,
    default: false, // Users can choose to make their tools public
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  metadata: {
    ogImage: String,
    ogDescription: String,
    tags: [String],
  },
  // Community features
  communityData: {
    isApproved: {
      type: Boolean,
      default: true, // Auto-approve for now (no moderation queue)
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedAt: {
      type: Date,
    },
    reportCount: {
      type: Number,
      default: 0,
    },
    isHidden: {
      type: Boolean,
      default: false,
    },
    hiddenReason: {
      type: String,
    },
    submissionNotes: {
      type: String, // Notes from user when submitting for public
    },
  },
  // Analytics for public tools
  publicAnalytics: {
    viewCount: {
      type: Number,
      default: 0,
    },
    clickCount: {
      type: Number,
      default: 0,
    },
    addedToCollectionsCount: {
      type: Number,
      default: 0,
    },
    uniqueUsers: {
      type: Number,
      default: 0,
    },
  },
}, {
  timestamps: true,
});

// Collection Items Schema (join table)
const collectionItemSchema = new mongoose.Schema({
  collectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Collection',
    required: true,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  notes: {
    type: String,
    default: '',
  },
  order: {
    type: Number,
    default: 0,
  },
  isFavorite: {
    type: Boolean,
    default: false,
  },
  lastAccessed: {
    type: Date,
    default: Date.now,
  },
  accessCount: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Tag Schema
const tagSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  color: {
    type: String,
    default: '#3B82F6',
  },
  category: {
    type: String,
    default: 'general',
  },
}, {
  timestamps: true,
});

// Product Tags Schema (many-to-many)
const productTagSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  tagId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tag',
    required: true,
  },
}, {
  timestamps: true,
});

// Review Schema
const reviewSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true,
  },
}, {
  timestamps: true,
});

// Activity Schema
const activitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  action: {
    type: String,
    required: true,
  },
  targetType: {
    type: String,
    required: true,
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
}, {
  timestamps: true,
});

// Collection Collaborator Schema
const collectionCollaboratorSchema = new mongoose.Schema({
  collectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Collection',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  invitedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  role: {
    type: String,
    enum: ['view', 'edit', 'admin'],
    default: 'view',
  },
  status: {
    type: String,
    enum: ['accepted'],
    default: 'accepted',
  },
}, {
  timestamps: true,
});

// Collection Invite Schema (separate from collaborators for pending invites)
const collectionInviteSchema = new mongoose.Schema({
  collectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Collection',
    required: true,
  },
  invitedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  invitedEmail: {
    type: String,
    required: true,
  },
  invitedUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  role: {
    type: String,
    enum: ['view', 'edit', 'admin'],
    default: 'view',
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined', 'expired'],
    default: 'pending',
  },
  inviteToken: {
    type: String,
    required: true,
    unique: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
  },
  message: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

// Collection Analytics Schema
const collectionAnalyticsSchema = new mongoose.Schema({
  collectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Collection',
    required: true,
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  views: {
    type: Number,
    default: 0,
  },
  uniqueVisitors: {
    type: Number,
    default: 0,
  },
  clicks: {
    type: Number,
    default: 0,
  },
  itemInteractions: [{
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CollectionItem',
    },
    clicks: {
      type: Number,
      default: 0,
    },
    notes: {
      type: Number,
      default: 0,
    },
    favorites: {
      type: Number,
      default: 0,
    },
  }],
  visitorData: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    sessionId: String,
    visitTime: {
      type: Date,
      default: Date.now,
    },
    duration: Number,
    actionsCount: Number,
  }],
}, {
  timestamps: true,
});

// Collection Template Schema
const collectionTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  tags: [String],
  items: [{
    title: String,
    url: String,
    description: String,
    category: String,
    faviconUrl: String,
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  isPublic: {
    type: Boolean,
    default: false,
  },
  usageCount: {
    type: Number,
    default: 0,
  },
  rating: {
    average: {
      type: Number,
      default: 0,
    },
    count: {
      type: Number,
      default: 0,
    },
  },
}, {
  timestamps: true,
});

// User Collection Template Schema (for saved templates)
const userCollectionTemplateSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  collectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Collection',
    required: true,
  },
  templateName: {
    type: String,
    required: true,
  },
  templateDescription: {
    type: String,
    default: '',
  },
  templateCategory: {
    type: String,
    required: true,
  },
  isPublic: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Share Link Schema
const shareLinkSchema = new mongoose.Schema({
  collectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Collection',
    required: true,
  },
  shareId: {
    type: String,
    required: true,
    unique: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  accessCount: {
    type: Number,
    default: 0,
  },
  lastAccessed: {
    type: Date,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  expiresAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Import/Export Log Schema
const importExportLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  collectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Collection',
  },
  operation: {
    type: String,
    enum: ['import', 'export'],
    required: true,
  },
  format: {
    type: String,
    enum: ['json', 'csv', 'html', 'text'],
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'success', 'failed'],
    default: 'pending',
  },
  itemsCount: {
    type: Number,
    default: 0,
  },
  errorMessage: {
    type: String,
  },
  fileSize: {
    type: Number,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
}, {
  timestamps: true,
});

// Notification Schema
const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['collaboration_invite', 'collection_shared', 'item_added', 'template_used', 'analytics_milestone'],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  relatedType: {
    type: String,
    enum: ['Collection', 'CollectionCollaborator', 'CollectionTemplate'],
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  actionUrl: {
    type: String,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
}, {
  timestamps: true,
});

// Product Rating Schema
const productRatingSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  userId: {
    type: String, // Clerk user ID
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
}, {
  timestamps: true,
});

// Product Report Schema (for community moderation)
const productReportSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  reportedBy: {
    type: String, // Clerk user ID
    required: true,
  },
  reason: {
    type: String,
    enum: ['inappropriate', 'broken_link', 'spam', 'duplicate', 'wrong_category', 'other'],
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
    default: 'pending',
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  reviewedAt: {
    type: Date,
  },
  action: {
    type: String,
    enum: ['none', 'hide', 'remove', 'edit', 'warn_user'],
  },
  actionNotes: {
    type: String,
  },
}, {
  timestamps: true,
});

// User Favorite Schema
const userFavoriteSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  userId: {
    type: String, // Clerk user ID
    required: true,
  },
}, {
  timestamps: true,
});

// Add text indexes for search
productSchema.index({ 
  title: 'text', 
  description: 'text', 
  url: 'text',
  'metadata.tags': 'text' 
});

collectionSchema.index({ 
  name: 'text', 
  description: 'text' 
});

collectionTemplateSchema.index({
  name: 'text',
  description: 'text',
  category: 'text',
  tags: 'text'
});

// Add compound indexes for performance
collectionItemSchema.index({ collectionId: 1, order: 1 }); // For ordered retrieval
collectionItemSchema.index({ collectionId: 1, addedBy: 1 }); // For user-specific queries
collectionItemSchema.index({ productId: 1, collectionId: 1 }, { unique: true }); // Prevent duplicates
collectionCollaboratorSchema.index({ collectionId: 1, userId: 1 }, { unique: true });
collectionInviteSchema.index({ collectionId: 1, invitedEmail: 1 });
// inviteToken already has unique index from schema definition
collectionInviteSchema.index({ expiresAt: 1 }); // For cleanup of expired invites
collectionAnalyticsSchema.index({ collectionId: 1, date: 1 });
// shareId already has unique index from schema definition
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
importExportLogSchema.index({ userId: 1, createdAt: -1 });
userCollectionTemplateSchema.index({ userId: 1, collectionId: 1 }, { unique: true });
productRatingSchema.index({ productId: 1, userId: 1 }, { unique: true }); // One rating per user per product
userFavoriteSchema.index({ productId: 1, userId: 1 }, { unique: true }); // One favorite per user per product
userFavoriteSchema.index({ userId: 1, createdAt: -1 }); // For user's favorites list
productReportSchema.index({ productId: 1, reportedBy: 1 }, { unique: true }); // One report per user per product
productReportSchema.index({ status: 1, createdAt: -1 }); // For moderation queue

// Additional indexes for public products
productSchema.index({ isPublic: 1, 'communityData.isApproved': 1, 'communityData.isHidden': 1 }); // For public product discovery
productSchema.index({ addedBy: 1, isPublic: 1 }); // For user's public tools

// Create models
const User = mongoose.models.User || mongoose.model('User', userSchema);
const Team = mongoose.models.Team || mongoose.model('Team', teamSchema);
const Collection = mongoose.models.Collection || mongoose.model('Collection', collectionSchema);
const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
const CollectionItem = mongoose.models.CollectionItem || mongoose.model('CollectionItem', collectionItemSchema);
const Tag = mongoose.models.Tag || mongoose.model('Tag', tagSchema);
const ProductTag = mongoose.models.ProductTag || mongoose.model('ProductTag', productTagSchema);
const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema);
const Activity = mongoose.models.Activity || mongoose.model('Activity', activitySchema);
const CollectionCollaborator = mongoose.models.CollectionCollaborator || mongoose.model('CollectionCollaborator', collectionCollaboratorSchema);
const CollectionInvite = mongoose.models.CollectionInvite || mongoose.model('CollectionInvite', collectionInviteSchema);
const CollectionAnalytics = mongoose.models.CollectionAnalytics || mongoose.model('CollectionAnalytics', collectionAnalyticsSchema);
const CollectionTemplate = mongoose.models.CollectionTemplate || mongoose.model('CollectionTemplate', collectionTemplateSchema);
const UserCollectionTemplate = mongoose.models.UserCollectionTemplate || mongoose.model('UserCollectionTemplate', userCollectionTemplateSchema);
const ShareLink = mongoose.models.ShareLink || mongoose.model('ShareLink', shareLinkSchema);
const ImportExportLog = mongoose.models.ImportExportLog || mongoose.model('ImportExportLog', importExportLogSchema);
const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
const ProductRating = mongoose.models.ProductRating || mongoose.model('ProductRating', productRatingSchema);
const UserFavorite = mongoose.models.UserFavorite || mongoose.model('UserFavorite', userFavoriteSchema);
const ProductReport = mongoose.models.ProductReport || mongoose.model('ProductReport', productReportSchema);

export {
  User,
  Team,
  Collection,
  Product,
  ProductRating,
  UserFavorite,
  ProductReport,
  CollectionItem,
  Tag,
  ProductTag,
  Review,
  Activity,
  CollectionCollaborator,
  CollectionInvite,
  CollectionAnalytics,
  CollectionTemplate,
  UserCollectionTemplate,
  ShareLink,
  ImportExportLog,
  Notification,
};

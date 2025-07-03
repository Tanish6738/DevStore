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

// Blog Schema
const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    lowercase: true,
  },
  excerpt: {
    type: String,
    required: true,
    maxlength: 300,
  },
  content: {
    type: String,
    required: true,
  },
  coverImage: {
    type: String,
    default: '',
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  category: {
    type: String,
    required: true,
    default: 'general',
  },
  tags: [{
    type: String,
    trim: true,
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft',
  },
  isPublic: {
    type: Boolean,
    default: false,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  publishedAt: {
    type: Date,
  },
  readTime: {
    type: Number, // in minutes
    default: 1,
  },
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String],
    ogImage: String,
  },
  analytics: {
    readCount: {
      type: Number,
      default: 0,
    },
    likeCount: {
      type: Number,
      default: 0,
    },
    commentCount: {
      type: Number,
      default: 0,
    },
    shareCount: {
      type: Number,
      default: 0,
    },
    uniqueReaders: {
      type: Number,
      default: 0,
    },
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  ratingCount: {
    type: Number,
    default: 0,
  },
  moderation: {
    isApproved: {
      type: Boolean,
      default: true,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
    },
    reportCount: {
      type: Number,
      default: 0,
    },
    isHidden: {
      type: Boolean,
      default: false,
    },
  },
  relatedPosts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Blog',
  }],
  series: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BlogSeries',
  },
  seriesOrder: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Blog Comment Schema
const blogCommentSchema = new mongoose.Schema({
  blogId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Blog',
    required: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: true,
    maxlength: 1000,
  },
  parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BlogComment',
  },
  isEdited: {
    type: Boolean,
    default: false,
  },
  editedAt: {
    type: Date,
  },
  likeCount: {
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
  replies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BlogComment',
  }],
}, {
  timestamps: true,
});

// Blog Like Schema
const blogLikeSchema = new mongoose.Schema({
  blogId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Blog',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

// Blog Comment Like Schema
const blogCommentLikeSchema = new mongoose.Schema({
  commentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BlogComment',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

// Blog Rating Schema
const blogRatingSchema = new mongoose.Schema({
  blogId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Blog',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  review: {
    type: String,
    maxlength: 500,
  },
}, {
  timestamps: true,
});

// Blog Bookmark Schema
const blogBookmarkSchema = new mongoose.Schema({
  blogId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Blog',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

// Blog Report Schema
const blogReportSchema = new mongoose.Schema({
  blogId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Blog',
    required: true,
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  reason: {
    type: String,
    enum: ['spam', 'inappropriate', 'copyright', 'misinformation', 'harassment', 'other'],
    required: true,
  },
  description: {
    type: String,
    maxlength: 500,
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
  resolution: {
    type: String,
  },
}, {
  timestamps: true,
});

// Blog Category Schema
const blogCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    lowercase: true,
  },
  description: {
    type: String,
    default: '',
  },
  color: {
    type: String,
    default: '#3B82F6',
  },
  icon: {
    type: String,
    default: '',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  order: {
    type: Number,
    default: 0,
  },
  postCount: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Blog Series Schema
const blogSeriesSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
    lowercase: true,
  },
  description: {
    type: String,
    required: true,
  },
  coverImage: {
    type: String,
    default: '',
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  posts: [{
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Blog',
    },
    order: {
      type: Number,
      default: 0,
    },
  }],
  isComplete: {
    type: Boolean,
    default: false,
  },
  isPublic: {
    type: Boolean,
    default: false,
  },
  viewCount: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Blog Reading Progress Schema
const blogReadingProgressSchema = new mongoose.Schema({
  blogId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Blog',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  completedAt: {
    type: Date,
  },
  timeSpent: {
    type: Number, // in seconds
    default: 0,
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

blogSchema.index({
  title: 'text',
  excerpt: 'text',
  content: 'text',
  'tags': 'text'
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

// Blog-specific indexes
blogSchema.index({ slug: 1 }, { unique: true });
blogSchema.index({ status: 1, isPublic: 1, publishedAt: -1 });
blogSchema.index({ author: 1, status: 1, createdAt: -1 });
blogSchema.index({ category: 1, publishedAt: -1 });
blogSchema.index({ tags: 1, publishedAt: -1 });
blogSchema.index({ isFeatured: 1, publishedAt: -1 });
blogSchema.index({ 'analytics.readCount': -1, publishedAt: -1 });
blogSchema.index({ averageRating: -1, ratingCount: -1 });
blogCommentSchema.index({ blogId: 1, createdAt: -1 });
blogCommentSchema.index({ author: 1, createdAt: -1 });
blogCommentSchema.index({ parentComment: 1, createdAt: 1 });
blogLikeSchema.index({ blogId: 1, userId: 1 }, { unique: true });
blogCommentLikeSchema.index({ commentId: 1, userId: 1 }, { unique: true });
blogRatingSchema.index({ blogId: 1, userId: 1 }, { unique: true });
blogBookmarkSchema.index({ blogId: 1, userId: 1 }, { unique: true });
blogBookmarkSchema.index({ userId: 1, createdAt: -1 });
blogReportSchema.index({ blogId: 1, reportedBy: 1 }, { unique: true });
blogReportSchema.index({ status: 1, createdAt: -1 });
blogCategorySchema.index({ slug: 1 }, { unique: true });
blogCategorySchema.index({ order: 1, name: 1 });
blogSeriesSchema.index({ slug: 1 }, { unique: true });
blogSeriesSchema.index({ author: 1, createdAt: -1 });
blogReadingProgressSchema.index({ blogId: 1, userId: 1 }, { unique: true });
blogReadingProgressSchema.index({ userId: 1, updatedAt: -1 });

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

// Blog models
const Blog = mongoose.models.Blog || mongoose.model('Blog', blogSchema);
const BlogComment = mongoose.models.BlogComment || mongoose.model('BlogComment', blogCommentSchema);
const BlogLike = mongoose.models.BlogLike || mongoose.model('BlogLike', blogLikeSchema);
const BlogCommentLike = mongoose.models.BlogCommentLike || mongoose.model('BlogCommentLike', blogCommentLikeSchema);
const BlogRating = mongoose.models.BlogRating || mongoose.model('BlogRating', blogRatingSchema);
const BlogBookmark = mongoose.models.BlogBookmark || mongoose.model('BlogBookmark', blogBookmarkSchema);
const BlogReport = mongoose.models.BlogReport || mongoose.model('BlogReport', blogReportSchema);
const BlogCategory = mongoose.models.BlogCategory || mongoose.model('BlogCategory', blogCategorySchema);
const BlogSeries = mongoose.models.BlogSeries || mongoose.model('BlogSeries', blogSeriesSchema);
const BlogReadingProgress = mongoose.models.BlogReadingProgress || mongoose.model('BlogReadingProgress', blogReadingProgressSchema);

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
  Blog,
  BlogComment,
  BlogLike,
  BlogCommentLike,
  BlogRating,
  BlogBookmark,
  BlogReport,
  BlogCategory,
  BlogSeries,
  BlogReadingProgress,
};

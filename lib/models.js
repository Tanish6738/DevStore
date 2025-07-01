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
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
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
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  metadata: {
    ogImage: String,
    ogDescription: String,
    tags: [String],
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

export {
  User,
  Team,
  Collection,
  Product,
  CollectionItem,
  Tag,
  ProductTag,
  Review,
  Activity,
};

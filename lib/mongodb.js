import { MongoClient, ObjectId } from 'mongodb';
import mongoose from 'mongoose';

// Utility function to check if a string is a valid MongoDB ObjectId
export function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id) && /^[0-9a-fA-F]{24}$/.test(id);
}

// Utility function to build query for finding by ID or slug
export function buildIdOrSlugQuery(identifier) {
  if (isValidObjectId(identifier)) {
    return {
      $or: [
        { _id: identifier },
        { slug: identifier }
      ]
    };
  } else {
    return { slug: identifier };
  }
}

const uri = process.env.MONGODB_URI;
const options = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

let client;
let clientPromise;

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise;

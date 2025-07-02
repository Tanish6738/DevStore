import { CollectionItem } from './models.js';

/**
 * Utility functions for optimized collection forking
 */

/**
 * Fork collection items in batches for better performance with large collections
 * @param {string} originalCollectionId - ID of the original collection
 * @param {string} forkedCollectionId - ID of the forked collection
 * @param {string} userId - ID of the user forking the collection
 * @param {object} session - MongoDB session for transaction
 * @param {number} batchSize - Number of items to process per batch (default: 100)
 * @returns {Promise<number>} - Total number of items forked
 */
export async function forkCollectionItemsBatch(
  originalCollectionId, 
  forkedCollectionId, 
  userId, 
  session, 
  batchSize = 100
) {
  const totalItems = await CollectionItem.countDocuments({
    collectionId: originalCollectionId
  }).session(session);

  if (totalItems === 0) {
    return 0;
  }

  let totalForkedItems = 0;
  let skip = 0;

  // Process items in batches to avoid memory issues with large collections
  while (skip < totalItems) {
    const itemsBatch = await CollectionItem.find({
      collectionId: originalCollectionId
    })
    .populate('productId', '_id title url description faviconUrl category metadata')
    .lean()
    .skip(skip)
    .limit(batchSize)
    .session(session);

    if (itemsBatch.length === 0) {
      break;
    }

    // Prepare batch data for insertion
    const forkedItemsData = itemsBatch.map((item, index) => ({
      collectionId: forkedCollectionId,
      productId: item.productId._id,
      addedBy: userId,
      notes: item.notes,
      order: item.order,
      isFavorite: false, // Reset favorites for forked collection
      lastAccessed: new Date(),
      accessCount: 0
    }));

    // Insert batch
    await CollectionItem.insertMany(forkedItemsData, { 
      session,
      ordered: false // Allow partial success if some items fail
    });

    totalForkedItems += itemsBatch.length;
    skip += batchSize;

    // Add a small delay to prevent overwhelming the database
    if (skip < totalItems) {
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  }

  return totalForkedItems;
}

/**
 * Validate collection size before forking
 * @param {string} collectionId - ID of the collection to validate
 * @param {object} session - MongoDB session
 * @param {number} maxItems - Maximum allowed items (default: 10000)
 * @returns {Promise<{valid: boolean, itemCount: number, message?: string}>}
 */
export async function validateCollectionSize(collectionId, session, maxItems = 10000) {
  const itemCount = await CollectionItem.countDocuments({
    collectionId: collectionId
  }).session(session);

  if (itemCount > maxItems) {
    return {
      valid: false,
      itemCount,
      message: `Collection is too large to fork (${itemCount} items). Maximum allowed: ${maxItems} items.`
    };
  }

  return {
    valid: true,
    itemCount
  };
}

/**
 * Generate optimized aggregation pipeline for collection analytics
 * @param {string} collectionId - ID of the collection
 * @returns {Array} - MongoDB aggregation pipeline
 */
export function getCollectionStatsPipeline(collectionId) {
  return [
    {
      $match: { collectionId: collectionId }
    },
    {
      $group: {
        _id: null,
        totalItems: { $sum: 1 },
        totalAccessCount: { $sum: '$accessCount' },
        favoriteCount: { $sum: { $cond: ['$isFavorite', 1, 0] } },
        lastActivity: { $max: '$lastAccessed' },
        avgOrder: { $avg: '$order' }
      }
    }
  ];
}

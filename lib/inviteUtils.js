import { CollectionInvite } from './models.js';
import connectDB from './connectDB.js';

/**
 * Cleanup expired invites
 * This function should be called periodically (e.g., via a cron job)
 */
export async function cleanupExpiredInvites() {
  try {
    await connectDB();
    
    const result = await CollectionInvite.updateMany(
      {
        status: 'pending',
        expiresAt: { $lt: new Date() }
      },
      {
        status: 'expired'
      }
    );

    console.log(`Cleaned up ${result.modifiedCount} expired invites`);
    return result.modifiedCount;
  } catch (error) {
    console.error('Error cleaning up expired invites:', error);
    throw error;
  }
}

/**
 * Generate a unique invite token
 */
export function generateInviteToken() {
  return `invite_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Calculate invite expiry date (default 7 days)
 */
export function getInviteExpiryDate(days = 7) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

/**
 * Validate invite token format
 */
export function isValidInviteToken(token) {
  return /^invite_\d+_[a-z0-9]+$/i.test(token);
}

const inviteUtils = {
  cleanupExpiredInvites,
  generateInviteToken,
  getInviteExpiryDate,
  isValidInviteToken
};

export default inviteUtils;


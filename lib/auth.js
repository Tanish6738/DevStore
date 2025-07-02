import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import connectDB from './connectDB';
import { User } from './models';

/**
 * Middleware to authenticate API requests and get user data
 * @param {Request} request - The incoming request
 * @returns {Promise<Object>} - Object containing user data or error response
 */
export async function authenticateUser(request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return {
        error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
        user: null,
      };
    }

    await connectDB();
    let user = await User.findOne({ clerkId: userId });

    // If user doesn't exist, try to create one automatically
    if (!user) {
      try {
        const { createClerkClient } = await import('@clerk/nextjs/server');
        const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
        
        let clerkUser;
        try {
          clerkUser = await clerkClient.users.getUser(userId);
        } catch (clerkError) {
          console.error('Clerk client error:', clerkError);
          return {
            error: NextResponse.json({ error: 'User not found and could not fetch from Clerk' }, { status: 404 }),
            user: null,
          };
        }

        // Create user automatically
        user = new User({
          clerkId: userId,
          displayName: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'User',
          email: clerkUser.emailAddresses[0]?.emailAddress || `user_${userId}@temp.com`,
          avatarUrl: clerkUser.imageUrl || '',
          preferences: {
            theme: 'dark',
            fontSize: 'base',
            contrast: 'normal',
            motionEnabled: true,
          },
        });

        try {
          await user.save();
        } catch (saveError) {
          // Handle duplicate email gracefully
          if (saveError.code === 11000 && saveError.keyPattern?.email) {
            // Find existing user by email and update with clerkId
            const existingUser = await User.findOne({ 
              email: clerkUser.emailAddresses[0]?.emailAddress 
            });
            if (existingUser && !existingUser.clerkId) {
              existingUser.clerkId = userId;
              await existingUser.save();
              user = existingUser;
            } else {
              // Create with unique email
              user.email = `user_${userId}_${Date.now()}@temp.com`;
              await user.save();
            }
          } else {
            throw saveError;
          }
        }
      } catch (autoCreateError) {
        console.error('Auto-create user error:', autoCreateError);
        return {
          error: NextResponse.json({ error: 'User not found' }, { status: 404 }),
          user: null,
        };
      }
    }

    return {
      error: null,
      user,
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return {
      error: NextResponse.json({ error: 'Internal server error' }, { status: 500 }),
      user: null,
    };
  }
}

/**
 * Higher-order function to protect API routes
 * @param {Function} handler - The API route handler
 * @returns {Function} - Protected API route handler
 */
export function withAuth(handler) {
  return async (request, context) => {
    const { error, user } = await authenticateUser(request);
    
    if (error) {
      return error;
    }

    // Add user to the request context
    request.user = user;
    
    return handler(request, context);
  };
}

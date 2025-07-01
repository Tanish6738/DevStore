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
    const user = await User.findOne({ clerkId: userId });

    if (!user) {
      return {
        error: NextResponse.json({ error: 'User not found' }, { status: 404 }),
        user: null,
      };
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

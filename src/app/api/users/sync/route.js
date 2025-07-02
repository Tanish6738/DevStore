import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClerkClient } from '@clerk/nextjs/server';
import connectDB from '../../../../../lib/connectDB';
import { User } from '../../../../../lib/models';

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });


// This is a temporary route to manually create a user record if webhook isn't set up yet
export async function POST(request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({ clerkId: userId });
    
    if (existingUser) {
      return NextResponse.json({ 
        message: 'User already exists',
        user: existingUser 
      });
    }

    // Get user data from Clerk
    let clerkUser;
    try {
      clerkUser = await clerkClient.users.getUser(userId);
    } catch (clerkError) {
      console.error('Clerk client error:', clerkError);
      // Fallback: create user with minimal data
      clerkUser = {
        firstName: 'User',
        lastName: '',
        emailAddresses: [{ emailAddress: 'user@example.com' }],
        imageUrl: ''
      };
    }
    
    // Create user in MongoDB
    const user = new User({
      clerkId: userId,
      displayName: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'User',
      email: clerkUser.emailAddresses[0]?.emailAddress || '',
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
      // Handle duplicate key error for email
      if (saveError.code === 11000) {
        if (saveError.keyPattern?.email) {
          // Try to find and update the existing user with the same email
          const existingUserByEmail = await User.findOne({ 
            email: clerkUser.emailAddresses[0]?.emailAddress 
          });
          
          if (existingUserByEmail && !existingUserByEmail.clerkId) {
            // Update existing user with clerkId
            existingUserByEmail.clerkId = userId;
            existingUserByEmail.displayName = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'User';
            existingUserByEmail.avatarUrl = clerkUser.imageUrl || '';
            await existingUserByEmail.save();
            
            return NextResponse.json({ 
              message: 'User updated successfully',
              user: existingUserByEmail 
            });
          }
        }
        
        // If we can't resolve the conflict, return error
        return NextResponse.json(
          { error: 'User with this email already exists' },
          { status: 409 }
        );
      }
      throw saveError; // Re-throw if not a duplicate key error
    }

    return NextResponse.json({ 
      message: 'User created successfully',
      user 
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Error creating user' },
      { status: 500 }
    );
  }
}

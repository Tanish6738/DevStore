import { NextResponse } from 'next/server';
import connectDB from '../../../../../lib/connectDB';
import { User } from '../../../../../lib/models';

// POST /api/users/sync
// Expects JSON body: { clerkId, firstName, lastName, email, imageUrl }
export async function POST(request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { clerkId, firstName, lastName, email, imageUrl } = body;

    if (!clerkId || !email) {
      return NextResponse.json({ error: 'clerkId and email are required' }, { status: 400 });
    }

    await connectDB();

    // Try find by clerkId first
    let existingUser = await User.findOne({ clerkId });
    if (existingUser) {
      return NextResponse.json({ message: 'User already exists', user: existingUser });
    }

    // Try by email for legacy/manual imports
    existingUser = await User.findOne({ email });
    if (existingUser) {
      if (!existingUser.clerkId) {
        existingUser.clerkId = clerkId;
        existingUser.displayName = `${firstName || ''} ${lastName || ''}`.trim() || existingUser.displayName || 'User';
        if (imageUrl) existingUser.avatarUrl = imageUrl;
        await existingUser.save();
        return NextResponse.json({ message: 'User updated successfully', user: existingUser });
      }
      return NextResponse.json({ message: 'User already exists (email match)', user: existingUser });
    }

    // Create new
    const user = new User({
      clerkId,
      displayName: `${firstName || ''} ${lastName || ''}`.trim() || 'User',
      email,
      avatarUrl: imageUrl || '',
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
      if (saveError.code === 11000 && saveError.keyPattern?.email) {
        return NextResponse.json({ error: 'User with this email already exists (race condition)' }, { status: 409 });
      }
      throw saveError;
    }

    return NextResponse.json({ message: 'User created successfully', user });
  } catch (error) {
    console.error('Error syncing user:', error);
    return NextResponse.json({ error: 'Error creating user' }, { status: 500 });
  }
}

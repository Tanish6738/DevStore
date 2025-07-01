import { NextResponse } from 'next/server';
import { withAuth } from '../../../../../lib/auth';


export const GET = withAuth(async (request) => {
  try {
    const user = request.user;

    return NextResponse.json({
      id: user._id,
      clerkId: user.clerkId,
      displayName: user.displayName,
      email: user.email,
      avatarUrl: user.avatarUrl,
      preferences: user.preferences,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Error fetching user data' },
      { status: 500 }
    );
  }
});

export const PUT = withAuth(async (request) => {
  try {
    const user = request.user;
    const data = await request.json();

    // Only allow updating certain fields
    const allowedFields = ['displayName', 'preferences'];
    const updateData = {};

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updateData[field] = data[field];
      }
    }

    // Update user
    Object.assign(user, updateData);
    await user.save();

    return NextResponse.json({
      id: user._id,
      clerkId: user.clerkId,
      displayName: user.displayName,
      email: user.email,
      avatarUrl: user.avatarUrl,
      preferences: user.preferences,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Error updating user data' },
      { status: 500 }
    );
  }
});

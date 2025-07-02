import { NextResponse } from 'next/server';
import connectDB from '../../../../../lib/connectDB';
import { User } from '../../../../../lib/models';
import { withAuth } from '../../../../../lib/auth';


export async function GET(request, { params }) {
  try {
    await connectDB();
    
    const { id } = await params;
    const user = await User.findById(id).select('-clerkId');

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: user._id,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Error fetching user' },
      { status: 500 }
    );
  }
}

export const PUT = withAuth(async (request, { params }) => {
  try {
    const currentUser = request.user;
    const { id } = await params;
    
    // Users can only update their own profile
    if (currentUser._id.toString() !== id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const data = await request.json();

    // Only allow updating certain fields
    const allowedFields = ['displayName', 'preferences'];
    const updateData = {};

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updateData[field] = data[field];
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: updatedUser._id,
      clerkId: updatedUser.clerkId,
      displayName: updatedUser.displayName,
      email: updatedUser.email,
      avatarUrl: updatedUser.avatarUrl,
      preferences: updatedUser.preferences,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Error updating user' },
      { status: 500 }
    );
  }
});

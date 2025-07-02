import { NextResponse } from 'next/server';
import connectDB from '../../../../../../lib/connectDB';
import { CollectionInvite, Collection, CollectionCollaborator } from '../../../../../../lib/models';
import { currentUser } from '@clerk/nextjs/server';

// POST /api/invites/[inviteId]/resend - Resend an invite
export async function POST(request, { params }) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const invite = await CollectionInvite.findById((await params).inviteId)
      .populate('collectionId', 'name userId');

    if (!invite) {
      return NextResponse.json({ error: 'Invite not found' }, { status: 404 });
    }

    // Check if user has permission to resend (collection owner or admin collaborator)
    const hasPermission = invite.collectionId.userId.toString() === user.id || 
      await CollectionCollaborator.findOne({
        collectionId: invite.collectionId._id,
        userId: user.id,
        role: 'admin'
      });

    if (!hasPermission) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Can only resend pending or expired invites
    if (!['pending', 'expired'].includes(invite.status)) {
      return NextResponse.json({ error: 'Cannot resend processed invite' }, { status: 400 });
    }

    // Generate new token and extend expiry
    const newToken = `invite_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newExpiryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

    // Update invite with new token and reset status to pending
    await CollectionInvite.findByIdAndUpdate((await params).inviteId, {
      inviteToken: newToken,
      expiresAt: newExpiryDate,
      status: 'pending',
      updatedAt: new Date()
    });

    // TODO: Send email notification here with new token

    return NextResponse.json({
      success: true,
      message: 'Invite resent successfully',
      newToken,
      expiresAt: newExpiryDate
    });
  } catch (error) {
    console.error('Error resending invite:', error);
    return NextResponse.json(
      { error: 'Failed to resend invite' }, 
      { status: 500 }
    );
  }
}

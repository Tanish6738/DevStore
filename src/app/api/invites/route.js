import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import connectDB from '../../../../lib/connectDB';
import { CollectionInvite, User } from '../../../../lib/models';




// GET /api/invites - Get all invites for current user
export async function GET(request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const userEmail = user.emailAddresses[0]?.emailAddress;
    if (!userEmail) {
      return NextResponse.json({ error: 'No email found for user' }, { status: 400 });
    }

    // Get all pending invites for the user's email
    const invites = await CollectionInvite.find({
      invitedEmail: userEmail,
      status: 'pending',
      expiresAt: { $gt: new Date() } // Only non-expired invites
    })
    .populate('collectionId', 'name description isPublic')
    .populate('invitedBy', 'displayName email avatarUrl')
    .sort({ createdAt: -1 });

    // Also get recent processed invites (accepted/declined) for history
    const processedInvites = await CollectionInvite.find({
      invitedEmail: userEmail,
      status: { $in: ['accepted', 'declined'] },
      updatedAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
    })
    .populate('collectionId', 'name description isPublic')
    .populate('invitedBy', 'displayName email avatarUrl')
    .sort({ updatedAt: -1 })
    .limit(10);

    return NextResponse.json({
      pendingInvites: invites,
      recentInvites: processedInvites,
      counts: {
        pending: invites.length,
        recent: processedInvites.length
      }
    });
  } catch (error) {
    console.error('Error fetching user invites:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invites' }, 
      { status: 500 }
    );
  }
}

// DELETE /api/invites/[inviteId] - Cancel/delete a pending invite (for invite sender)
export async function DELETE(request, { params }) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const invite = await CollectionInvite.findById(params.inviteId);
    if (!invite) {
      return NextResponse.json({ error: 'Invite not found' }, { status: 404 });
    }

    // Only the person who sent the invite can cancel it
    if (invite.invitedBy.toString() !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Can only cancel pending invites
    if (invite.status !== 'pending') {
      return NextResponse.json({ error: 'Cannot cancel processed invite' }, { status: 400 });
    }

    await CollectionInvite.findByIdAndUpdate(params.inviteId, { status: 'expired' });

    return NextResponse.json({ success: true, message: 'Invite cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling invite:', error);
    return NextResponse.json(
      { error: 'Failed to cancel invite' }, 
      { status: 500 }
    );
  }
}

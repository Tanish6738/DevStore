import { NextResponse } from 'next/server';
import connectDB from '../../../../../lib/connectDB';
import { CollectionInvite, CollectionCollaborator, User, Collection, Notification } from '../../../../../lib/models';
import { isValidObjectId } from 'mongoose';
import { currentUser } from '@clerk/nextjs/server';

// Helper function to determine if parameter is a token or ID
function isToken(param) {
  // Tokens are 32 character hex strings, ObjectIds are 24 character hex strings
  return param.length === 32 && /^[a-f0-9]+$/i.test(param);
}

// GET /api/invites/[inviteId] - Get invite details by token or ID
export async function GET(request, { params }) {
  try {
    await connectDB();

    let invite;
    const param = (await params).inviteId;

    if (isToken(param)) {
      // Parameter is a token
      invite = await CollectionInvite.findOne({
        inviteToken: param,
        status: 'pending'
      })
      .populate('collectionId', 'name description isPublic')
      .populate('invitedBy', 'displayName email avatarUrl');
    } else if (isValidObjectId(param)) {
      // Parameter is an ObjectId
      invite = await CollectionInvite.findById(param)
        .populate('collectionId', 'name description isPublic')
        .populate('invitedBy', 'displayName email avatarUrl');
    } else {
      return NextResponse.json({ error: 'Invalid invite identifier' }, { status: 400 });
    }

    if (!invite) {
      return NextResponse.json({ error: 'Invalid or expired invite' }, { status: 404 });
    }

    // Check if invite has expired (only for token-based requests)
    if (isToken(param) && invite.expiresAt < new Date()) {
      await CollectionInvite.findByIdAndUpdate(invite._id, { status: 'expired' });
      return NextResponse.json({ error: 'Invite has expired' }, { status: 410 });
    }

    return NextResponse.json({
      invite: {
        id: invite._id,
        collection: invite.collectionId,
        invitedBy: invite.invitedBy,
        role: invite.role,
        message: invite.message,
        createdAt: invite.createdAt,
        expiresAt: invite.expiresAt,
        status: invite.status,
        invitedEmail: invite.invitedEmail
      }
    });
  } catch (error) {
    console.error('Error fetching invite:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invite' }, 
      { status: 500 }
    );
  }
}

// POST /api/invites/[inviteId] - Accept or decline invite (only works with tokens)
export async function POST(request, { params }) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const param = (await params).inviteId;
    
    // Only allow token-based acceptance/decline
    if (!isToken(param)) {
      return NextResponse.json({ error: 'Invalid invite token' }, { status: 400 });
    }

    const { action } = await request.json(); // 'accept' or 'decline'

    if (!['accept', 'decline'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const invite = await CollectionInvite.findOne({
      inviteToken: param,
      status: 'pending'
    }).populate('collectionId');

    if (!invite) {
      return NextResponse.json({ error: 'Invalid or expired invite' }, { status: 404 });
    }

    // Check if invite has expired
    if (invite.expiresAt < new Date()) {
      await CollectionInvite.findByIdAndUpdate(invite._id, { status: 'expired' });
      return NextResponse.json({ error: 'Invite has expired' }, { status: 410 });
    }

    // Check if the invite is for the current user's email
    if (invite.invitedEmail !== user.emailAddresses[0]?.emailAddress) {
      return NextResponse.json({ error: 'This invite is not for your email address' }, { status: 403 });
    }

    if (action === 'accept') {
      // Check if user is already a collaborator
      const existingCollaborator = await CollectionCollaborator.findOne({
        collectionId: invite.collectionId._id,
        userId: user.id
      });

      if (existingCollaborator) {
        // Update invite status and return success
        await CollectionInvite.findByIdAndUpdate(invite._id, { 
          status: 'accepted',
          invitedUserId: user.id 
        });
        return NextResponse.json({ 
          success: true, 
          message: 'You are already a collaborator on this collection' 
        });
      }

      // Create collaborator record
      await CollectionCollaborator.create({
        collectionId: invite.collectionId._id,
        userId: user.id,
        invitedBy: invite.invitedBy,
        role: invite.role
      });

      // Update invite status
      await CollectionInvite.findByIdAndUpdate(invite._id, { 
        status: 'accepted',
        invitedUserId: user.id 
      });

      // Create notification for the person who sent the invite
      await Notification.create({
        userId: invite.invitedBy,
        type: 'collaboration_invite',
        title: 'Collaboration Invite Accepted',
        message: `${user.firstName || user.emailAddresses[0]?.emailAddress} accepted your collaboration invite for "${invite.collectionId.name}"`,
        relatedId: invite.collectionId._id,
        relatedType: 'Collection',
        actionUrl: `/collections/${invite.collectionId._id}`
      });

      return NextResponse.json({ 
        success: true, 
        message: 'Invite accepted successfully',
        collectionId: invite.collectionId._id 
      });

    } else if (action === 'decline') {
      // Update invite status
      await CollectionInvite.findByIdAndUpdate(invite._id, { 
        status: 'declined',
        invitedUserId: user.id 
      });

      // Create notification for the person who sent the invite
      await Notification.create({
        userId: invite.invitedBy,
        type: 'collaboration_invite',
        title: 'Collaboration Invite Declined',
        message: `${user.firstName || user.emailAddresses[0]?.emailAddress} declined your collaboration invite for "${invite.collectionId.name}"`,
        relatedId: invite.collectionId._id,
        relatedType: 'Collection'
      });

      return NextResponse.json({ 
        success: true, 
        message: 'Invite declined successfully' 
      });
    }

  } catch (error) {
    console.error('Error processing invite:', error);
    return NextResponse.json(
      { error: 'Failed to process invite' }, 
      { status: 500 }
    );
  }
}

// DELETE /api/invites/[inviteId] - Cancel/delete a pending invite (for invite sender, only works with IDs)
export async function DELETE(request, { params }) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const param = (await params).inviteId;
    
    // Only allow ID-based deletion
    if (!isValidObjectId(param)) {
      return NextResponse.json({ error: 'Invalid invite ID' }, { status: 400 });
    }

    const invite = await CollectionInvite.findById(param);
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

    await CollectionInvite.findByIdAndUpdate(param, { status: 'expired' });

    return NextResponse.json({ success: true, message: 'Invite cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling invite:', error);
    return NextResponse.json(
      { error: 'Failed to cancel invite' }, 
      { status: 500 }
    );
  }
}

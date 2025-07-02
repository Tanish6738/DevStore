import { NextResponse } from 'next/server';
import connectDB from '../../../../../../lib/connectDB';
import { Collection, CollectionCollaborator, CollectionInvite, User, Notification } from '../../../../../../lib/models';
import { generateInviteToken, getInviteExpiryDate } from '../../../../../../lib/inviteUtils';
import { currentUser } from '@clerk/nextjs/server';

// GET /api/collections/[id]/collaborators - Get collection collaborators
export async function GET(request, { params }) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const resolvedParams = await params;
    const collection = await Collection.findById(resolvedParams.id);
    if (!collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }

    // Check if user has access to view collaborators
    const hasAccess = collection.userId.toString() === user.id || 
      await CollectionCollaborator.findOne({
        collectionId: resolvedParams.id,
        userId: user.id,
        role: { $in: ['admin', 'edit', 'view'] }
      });

    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get collaborators
    const collaborators = await CollectionCollaborator.find({
      collectionId: resolvedParams.id
    }).populate('userId', 'email displayName avatarUrl');

    // Get pending invites
    const pendingInvites = await CollectionInvite.find({
      collectionId: resolvedParams.id,
      status: 'pending'
    });

    return NextResponse.json({
      collaborators,
      pendingInvites
    });
  } catch (error) {
    console.error('Error fetching collaborators:', error);
    return NextResponse.json(
      { error: 'Failed to fetch collaborators' }, 
      { status: 500 }
    );
  }
}

// DELETE /api/collections/[id]/collaborators/[collaboratorId] - Remove collaborator
export async function DELETE(request, { params }) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const resolvedParams = await params;
    const collection = await Collection.findById(resolvedParams.id);
    if (!collection || collection.userId.toString() !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    await CollectionCollaborator.findByIdAndDelete(resolvedParams.collaboratorId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing collaborator:', error);
    return NextResponse.json(
      { error: 'Failed to remove collaborator' }, 
      { status: 500 }
    );
  }
}

// POST /api/collections/[id]/collaborators - Invite collaborator
export async function POST(request, { params }) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const resolvedParams = await params;
    const collection = await Collection.findById(resolvedParams.id);
    if (!collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }

    // Check if user has permission to invite collaborators
    const hasPermission = collection.userId.toString() === user.id || 
      await CollectionCollaborator.findOne({
        collectionId: resolvedParams.id,
        userId: user.id,
        role: { $in: ['admin'] }
      });

    if (!hasPermission) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { email, role = 'view', message = '' } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Check if user is already a collaborator
    // Also check if user exists in the system
    const invitedUser = await User.findOne({ email });

    if (invitedUser) {
      const existingCollaborator = await CollectionCollaborator.findOne({
        collectionId: resolvedParams.id,
        userId: invitedUser._id
      });

      if (existingCollaborator) {
        return NextResponse.json({ error: 'User is already a collaborator' }, { status: 400 });
      }
    }

    // Check if there's already a pending invite
    const existingInvite = await CollectionInvite.findOne({
      collectionId: resolvedParams.id,
      invitedEmail: email,
      status: 'pending',
      expiresAt: { $gt: new Date() }
    });

    if (existingInvite) {
      return NextResponse.json({ error: 'Invite already sent to this email' }, { status: 400 });
    }

    // Generate unique invite token
    const inviteToken = generateInviteToken();

    // Create invite
    const invite = await CollectionInvite.create({
      collectionId: resolvedParams.id,
      invitedBy: user.id,
      invitedEmail: email,
      invitedUserId: invitedUser?._id,
      role,
      inviteToken,
      expiresAt: getInviteExpiryDate(),
      message
    });

    // Create notification for the invited user (if they exist in the system)
    if (invitedUser) {
      await Notification.create({
        userId: invitedUser._id,
        type: 'collaboration_invite',
        title: 'New Collaboration Invite',
        message: `${user.firstName || user.emailAddresses[0]?.emailAddress} invited you to collaborate on "${collection.name}"`,
        relatedId: collection._id,
        relatedType: 'Collection',
        actionUrl: `/invites/${inviteToken}`,
        metadata: {
          inviteToken,
          role,
          collectionName: collection.name
        }
      });
    }

    // TODO: Send email notification here

    return NextResponse.json({
      success: true,
      invite: {
        id: invite._id,
        email: invite.invitedEmail,
        role: invite.role,
        status: invite.status,
        createdAt: invite.createdAt
      }
    });
  } catch (error) {
    console.error('Error inviting collaborator:', error);
    return NextResponse.json(
      { error: 'Failed to invite collaborator' }, 
      { status: 500 }
    );
  }
}

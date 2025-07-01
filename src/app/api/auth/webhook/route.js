import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { User } from '../../../../../lib/models';
import connectDB from '../../../../../lib/connectDB';


export async function POST(req) {
  // You can find this in the Clerk Dashboard -> Webhooks -> choose the webhook
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local');
  }

  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    });
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', {
      status: 400,
    });
  }

  // Handle the webhook
  const { id } = evt.data;
  const eventType = evt.type;

  console.log(`Webhook with an ID of ${id} and type of ${eventType}`);

  try {
    await connectDB();

    switch (eventType) {
      case 'user.created':
        await handleUserCreated(evt.data);
        break;
      case 'user.updated':
        await handleUserUpdated(evt.data);
        break;
      case 'user.deleted':
        await handleUserDeleted(evt.data);
        break;
      default:
        console.log(`Unhandled event type: ${eventType}`);
    }

    return NextResponse.json({ message: 'Webhook processed successfully' });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Error processing webhook' },
      { status: 500 }
    );
  }
}

async function handleUserCreated(userData) {
  try {
    const user = new User({
      clerkId: userData.id,
      displayName: `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || 'User',
      email: userData.email_addresses[0]?.email_address || '',
      avatarUrl: userData.image_url || '',
      preferences: {
        theme: 'dark',
        fontSize: 'base',
        contrast: 'normal',
        motionEnabled: true,
      },
    });

    await user.save();
    console.log('User created in database:', user.displayName);
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

async function handleUserUpdated(userData) {
  try {
    const updateData = {
      displayName: `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || 'User',
      email: userData.email_addresses[0]?.email_address || '',
      avatarUrl: userData.image_url || '',
    };

    const user = await User.findOneAndUpdate(
      { clerkId: userData.id },
      updateData,
      { new: true }
    );

    if (user) {
      console.log('User updated in database:', user.displayName);
    }
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

async function handleUserDeleted(userData) {
  try {
    const user = await User.findOneAndDelete({ clerkId: userData.id });
    
    if (user) {
      console.log('User deleted from database:', user.displayName);
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}

import { NextResponse } from 'next/server';
import { cleanupExpiredInvites } from '../../../../../lib/inviteUtils';
// POST /api/invites/cleanup - Cleanup expired invites (for cron jobs)
export async function POST(request) {
  try {
    // Verify the request is from a trusted source (add authentication as needed)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || 'default-secret';
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const cleanedCount = await cleanupExpiredInvites();

    return NextResponse.json({
      success: true,
      message: `Cleaned up ${cleanedCount} expired invites`,
      cleanedCount
    });
  } catch (error) {
    console.error('Error in cleanup job:', error);
    return NextResponse.json(
      { error: 'Cleanup failed' }, 
      { status: 500 }
    );
  }
}

// GET /api/invites/cleanup - Manual cleanup trigger (admin only)
export async function GET(request) {
  try {
    // Add admin authentication here
    const cleanedCount = await cleanupExpiredInvites();

    return NextResponse.json({
      success: true,
      message: `Manually cleaned up ${cleanedCount} expired invites`,
      cleanedCount
    });
  } catch (error) {
    console.error('Error in manual cleanup:', error);
    return NextResponse.json(
      { error: 'Cleanup failed' }, 
      { status: 500 }
    );
  }
}

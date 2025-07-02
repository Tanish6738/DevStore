'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import Image from 'next/image';
import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function InviteAcceptPage() {
  const { inviteId } = useParams(); // Changed from token to inviteId
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [invite, setInvite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const fetchInviteDetails = useCallback(async () => {
    try {
      const response = await fetch(`/api/invites/${inviteId}`); // Changed from token to inviteId
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to fetch invite details');
        return;
      }

      setInvite(data.invite);
    } catch (err) {
      setError('Failed to load invite details');
    } finally {
      setLoading(false);
    }
  }, [inviteId]);

  useEffect(() => {
    if (inviteId) { // Changed from token to inviteId
      fetchInviteDetails();
    }
  }, [inviteId, fetchInviteDetails]); // Changed from token to inviteId

  const handleInviteAction = async (action) => {
    if (!user) {
      // Redirect to sign in
      router.push(`/sign-in?redirect_url=${window.location.pathname}`);
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const response = await fetch(`/api/invites/${inviteId}`, { // Changed from token to inviteId
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || `Failed to ${action} invite`);
        return;
      }

      setSuccess(data.message);

      if (action === 'accept' && data.collectionId) {
        // Redirect to the collection after a short delay
        setTimeout(() => {
          router.push(`/collections/${data.collectionId}`);
        }, 2000);
      } else {
        // Redirect to dashboard after decline
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      }
    } catch (err) {
      setError(`Failed to ${action} invite`);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-theme-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-theme-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-theme-background flex items-center justify-center">
        <div className="max-w-md w-full mx-auto p-6">
          <div className="bg-theme-surface rounded-lg shadow-lg p-8 text-center">
            <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-theme-foreground mb-4">
              Invalid Invite
            </h1>
            <p className="text-theme-muted mb-6">{error}</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-theme-primary text-white px-6 py-2 rounded-lg hover:bg-theme-primary/90 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-theme-background flex items-center justify-center">
        <div className="max-w-md w-full mx-auto p-6">
          <div className="bg-theme-surface rounded-lg shadow-lg p-8 text-center">
            <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-theme-foreground mb-4">
              Success!
            </h1>
            <p className="text-theme-muted mb-6">{success}</p>
            <div className="text-sm text-theme-muted">
              Redirecting you now...
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!invite) {
    return (
      <div className="min-h-screen bg-theme-background flex items-center justify-center">
        <div className="max-w-md w-full mx-auto p-6">
          <div className="bg-theme-surface rounded-lg shadow-lg p-8 text-center">
            <ExclamationTriangleIcon className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-theme-foreground mb-4">
              No Invite Found
            </h1>
            <p className="text-theme-muted mb-6">
              This invite link appears to be invalid or has expired.
            </p>
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-theme-primary text-white px-6 py-2 rounded-lg hover:bg-theme-primary/90 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-theme-background flex items-center justify-center">
      <div className="max-w-md w-full mx-auto p-6">
        <div className="bg-theme-surface rounded-lg shadow-lg p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-theme-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-white">
                {invite.collection.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-theme-foreground mb-2">
              Collaboration Invite
            </h1>
            <p className="text-theme-muted">
              You&apos;ve been invited to collaborate
            </p>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <h3 className="font-semibold text-theme-foreground">Collection:</h3>
              <p className="text-theme-muted">{invite.collection.name}</p>
            </div>

            {invite.collection.description && (
              <div>
                <h3 className="font-semibold text-theme-foreground">Description:</h3>
                <p className="text-theme-muted">{invite.collection.description}</p>
              </div>
            )}

            <div>
              <h3 className="font-semibold text-theme-foreground">Invited by:</h3>
              <div className="flex items-center space-x-2">
                {invite.invitedBy.avatarUrl && (
                  <Image
                    src={invite.invitedBy.avatarUrl}
                    alt={invite.invitedBy.displayName}
                    width={24}
                    height={24}
                    className="w-6 h-6 rounded-full"
                  />
                )}
                <span className="text-theme-muted">{invite.invitedBy.displayName || invite.invitedBy.email}</span>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-theme-foreground">Role:</h3>
              <p className="text-theme-muted capitalize">{invite.role}</p>
            </div>

            {invite.message && (
              <div>
                <h3 className="font-semibold text-theme-foreground">Message:</h3>
                <p className="text-theme-muted italic">&quot;{invite.message}&quot;</p>
              </div>
            )}

            <div className="text-sm text-theme-muted">
              Expires: {new Date(invite.expiresAt).toLocaleDateString()}
            </div>
          </div>

          {!isLoaded ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-theme-primary mx-auto"></div>
            </div>
          ) : !user ? (
            <div className="space-y-3">
              <p className="text-sm text-theme-muted text-center">
                Please sign in to accept this invitation
              </p>
              <button
                onClick={() => router.push(`/sign-in?redirect_url=${window.location.pathname}`)}
                className="w-full bg-theme-primary text-white py-2 px-4 rounded-lg hover:bg-theme-primary/90 transition-colors"
              >
                Sign In to Accept
              </button>
            </div>
          ) : (
            <div className="flex space-x-3">
              <button
                onClick={() => handleInviteAction('accept')}
                disabled={processing}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {processing ? 'Processing...' : 'Accept'}
              </button>
              <button
                onClick={() => handleInviteAction('decline')}
                disabled={processing}
                className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {processing ? 'Processing...' : 'Decline'}
              </button>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

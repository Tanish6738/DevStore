'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { 
  EnvelopeIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ClockIcon,
  EyeIcon,
  PencilIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

export default function UserInvitesPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [invites, setInvites] = useState({ pendingInvites: [], recentInvites: [] });
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);

  useEffect(() => {
    if (isLoaded && user) {
      fetchInvites();
    }
  }, [isLoaded, user]);

  const fetchInvites = async () => {
    try {
      const response = await fetch('/api/invites');
      const data = await response.json();

      if (response.ok) {
        setInvites(data);
      }
    } catch (error) {
      console.error('Error fetching invites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInviteAction = async (token, action) => {
    setProcessing(token);

    try {
      const response = await fetch(`/api/invites/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        // Refresh invites list
        fetchInvites();
        
        if (action === 'accept') {
          const data = await response.json();
          if (data.collectionId) {
            router.push(`/collections/${data.collectionId}`);
          }
        }
      }
    } catch (error) {
      console.error(`Error ${action}ing invite:`, error);
    } finally {
      setProcessing(null);
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <UserGroupIcon className="w-4 h-4" />;
      case 'edit':
        return <PencilIcon className="w-4 h-4" />;
      case 'view':
        return <EyeIcon className="w-4 h-4" />;
      default:
        return <EyeIcon className="w-4 h-4" />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'text-red-600 bg-red-100';
      case 'edit':
        return 'text-yellow-600 bg-yellow-100';
      case 'view':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'accepted':
        return <CheckCircleIcon className="w-4 h-4 text-green-500" />;
      case 'declined':
        return <XCircleIcon className="w-4 h-4 text-red-500" />;
      case 'pending':
        return <ClockIcon className="w-4 h-4 text-yellow-500" />;
      default:
        return <ClockIcon className="w-4 h-4 text-gray-500" />;
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-theme-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-theme-primary"></div>
      </div>
    );
  }

  if (!user) {
    router.push('/sign-in');
    return null;
  }

  return (
    <div className="min-h-screen bg-theme-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-theme-foreground mb-2">
            Collaboration Invites
          </h1>
          <p className="text-theme-muted">
            Manage your collection collaboration invitations
          </p>
        </div>

        {/* Pending Invites */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <EnvelopeIcon className="w-5 h-5 text-theme-primary" />
            <h2 className="text-xl font-semibold text-theme-foreground">
              Pending Invites
            </h2>
            {invites.counts?.pending > 0 && (
              <span className="bg-theme-primary text-white text-xs px-2 py-1 rounded-full">
                {invites.counts.pending}
              </span>
            )}
          </div>

          {invites.pendingInvites?.length === 0 ? (
            <div className="bg-theme-surface rounded-lg p-8 text-center">
              <EnvelopeIcon className="w-12 h-12 text-theme-muted mx-auto mb-4" />
              <h3 className="text-lg font-medium text-theme-foreground mb-2">
                No pending invites
              </h3>
              <p className="text-theme-muted">
                You don&apos;t have any pending collaboration invitations.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {invites.pendingInvites?.map((invite) => (
                <div
                  key={invite._id}
                  className="bg-theme-surface rounded-lg p-6 border border-theme-border shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-10 h-10 bg-theme-primary rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold">
                            {invite.collectionId.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-theme-foreground">
                            {invite.collectionId.name}
                          </h3>
                          <p className="text-sm text-theme-muted">
                            Invited by {invite.invitedBy.displayName || invite.invitedBy.email}
                          </p>
                        </div>
                      </div>

                      {invite.collectionId.description && (
                        <p className="text-theme-muted mb-3">
                          {invite.collectionId.description}
                        </p>
                      )}

                      <div className="flex items-center space-x-4 mb-3">
                        <div className="flex items-center space-x-1">
                          {getRoleIcon(invite.role)}
                          <span className={`text-xs px-2 py-1 rounded-full ${getRoleColor(invite.role)}`}>
                            {invite.role}
                          </span>
                        </div>
                        <div className="text-sm text-theme-muted">
                          Expires: {new Date(invite.expiresAt).toLocaleDateString()}
                        </div>
                      </div>

                      {invite.message && (
                        <div className="bg-theme-background p-3 rounded border-l-4 border-theme-primary">
                          <p className="text-sm text-theme-muted italic">
                            &quot;{invite.message}&quot;
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => handleInviteAction(invite.inviteToken, 'accept')}
                        disabled={processing === invite.inviteToken}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                      >
                        {processing === invite.inviteToken ? 'Processing...' : 'Accept'}
                      </button>
                      <button
                        onClick={() => handleInviteAction(invite.inviteToken, 'decline')}
                        disabled={processing === invite.inviteToken}
                        className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
                      >
                        {processing === invite.inviteToken ? 'Processing...' : 'Decline'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        {invites.recentInvites?.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-theme-foreground mb-4">
              Recent Activity
            </h2>
            <div className="space-y-3">
              {invites.recentInvites.map((invite) => (
                <div
                  key={invite._id}
                  className="bg-theme-surface rounded-lg p-4 border border-theme-border"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-theme-muted rounded-full flex items-center justify-center">
                        <span className="text-theme-foreground text-sm font-semibold">
                          {invite.collectionId.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium text-theme-foreground">
                          {invite.collectionId.name}
                        </h4>
                        <p className="text-sm text-theme-muted">
                          From {invite.invitedBy.displayName || invite.invitedBy.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(invite.status)}
                      <span className="text-sm text-theme-muted capitalize">
                        {invite.status}
                      </span>
                      <span className="text-xs text-theme-muted">
                        {new Date(invite.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

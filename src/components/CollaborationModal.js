'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  XMarkIcon,
  UserPlusIcon,
  PaperAirplaneIcon,
  CheckIcon,
  ClockIcon,
  UserIcon,
  TrashIcon,
  CogIcon
} from '@heroicons/react/24/outline';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';

const PERMISSION_LEVELS = {
  VIEW: { value: 'view', label: 'View Only', description: 'Can view the collection but not make changes' },
  EDIT: { value: 'edit', label: 'Can Edit', description: 'Can add, remove, and modify items' },
  ADMIN: { value: 'admin', label: 'Admin', description: 'Full access including collaboration management' }
};

export default function CollaborationModal({ 
  isOpen, 
  onClose, 
  collection, 
  currentUserId 
}) {
  const [activeTab, setActiveTab] = useState('invite'); // 'invite' or 'manage'
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePermission, setInvitePermission] = useState('edit');
  const [inviteMessage, setInviteMessage] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [collaborators, setCollaborators] = useState([]);
  const [pendingInvites, setPendingInvites] = useState([]);
  const [activityFeed, setActivityFeed] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCollaborationData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch collaborators
      const collabResponse = await fetch(`/api/collections/${collection._id}/collaborators`);
      if (collabResponse.ok) {
        const collabData = await collabResponse.json();
        setCollaborators(collabData.collaborators || []);
        setPendingInvites(collabData.pendingInvites || []);
      }

      // Fetch activity feed
      const activityResponse = await fetch(`/api/collections/${collection._id}/activity`);
      if (activityResponse.ok) {
        const activityData = await activityResponse.json();
        setActivityFeed(activityData.activities || []);
      }
    } catch (error) {
      console.error('Error fetching collaboration data:', error);
    } finally {
      setLoading(false);
    }
  }, [collection?._id]);

  useEffect(() => {
    if (isOpen && collection?._id) {
      fetchCollaborationData();
    }
  }, [isOpen, collection?._id, fetchCollaborationData]);

  const handleSendInvite = async () => {
    if (!inviteEmail.trim()) return;

    setIsInviting(true);
    try {
      const response = await fetch(`/api/collections/${collection._id}/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: inviteEmail.trim(),
          permission: invitePermission,
          message: inviteMessage.trim()
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setPendingInvites([...pendingInvites, result.invite]);
        setInviteEmail('');
        setInviteMessage('');
        // Show success message
      } else {
        const error = await response.json();
        // Show error message
        console.error('Invite error:', error.message);
      }
    } catch (error) {
      console.error('Error sending invite:', error);
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemoveCollaborator = async (collaboratorId) => {
    try {
      const response = await fetch(`/api/collections/${collection._id}/collaborators/${collaboratorId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setCollaborators(collaborators.filter(c => c._id !== collaboratorId));
      }
    } catch (error) {
      console.error('Error removing collaborator:', error);
    }
  };

  const handleUpdatePermission = async (collaboratorId, newPermission) => {
    try {
      const response = await fetch(`/api/collections/${collection._id}/collaborators/${collaboratorId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ permission: newPermission }),
      });

      if (response.ok) {
        setCollaborators(collaborators.map(c => 
          c._id === collaboratorId 
            ? { ...c, permission: newPermission }
            : c
        ));
      }
    } catch (error) {
      console.error('Error updating permission:', error);
    }
  };

  const handleCancelInvite = async (inviteId) => {
    try {
      const response = await fetch(`/api/collections/${collection._id}/invites/${inviteId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setPendingInvites(pendingInvites.filter(invite => invite._id !== inviteId));
      }
    } catch (error) {
      console.error('Error canceling invite:', error);
    }
  };

  const formatActivityTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  if (!isOpen) return null;

  const isOwner = collection?.createdBy === currentUserId;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-theme-background rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-theme-border">
        <div className="flex items-center justify-between p-6 border-b border-theme-border">
          <h2 className="text-xl font-semibold text-theme-text">
            Collaboration - {collection?.name}
          </h2>
          <button
            onClick={onClose}
            className="text-theme-text-secondary hover:text-theme-text transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-theme-border">
          <button
            onClick={() => setActiveTab('invite')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'invite'
                ? 'border-b-2 border-theme-primary text-theme-primary'
                : 'text-theme-text-secondary hover:text-theme-text'
            }`}
          >
            <UserPlusIcon className="h-4 w-4 inline mr-2" />
            Invite People
          </button>
          <button
            onClick={() => setActiveTab('manage')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'manage'
                ? 'border-b-2 border-theme-primary text-theme-primary'
                : 'text-theme-text-secondary hover:text-theme-text'
            }`}
          >
            <CogIcon className="h-4 w-4 inline mr-2" />
            Manage Access
          </button>
        </div>

        <div className="p-6 max-h-96 overflow-y-auto">
          {/* Invite Tab */}
          {activeTab === 'invite' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-theme-text mb-4">
                  Invite Collaborators
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-theme-text mb-1">
                      Email Address
                    </label>
                    <Input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="Enter email address"
                      onKeyDown={(e) => e.key === 'Enter' && handleSendInvite()}
                      className="input-theme"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-theme-text mb-1">
                      Permission Level
                    </label>
                    <select
                      value={invitePermission}
                      onChange={(e) => setInvitePermission(e.target.value)}
                      className="w-full px-3 py-2 border border-theme-border rounded-md focus:outline-none focus:ring-2 focus:ring-theme-primary bg-theme-secondary text-theme-text"
                    >
                      {Object.values(PERMISSION_LEVELS).map(level => (
                        <option key={level.value} value={level.value}>
                          {level.label} - {level.description}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-theme-text mb-1">
                      Personal Message (Optional)
                    </label>
                    <textarea
                      value={inviteMessage}
                      onChange={(e) => setInviteMessage(e.target.value)}
                      placeholder="Add a personal message to your invitation..."
                      rows={3}
                      className="w-full px-3 py-2 border border-theme-border rounded-md focus:outline-none focus:ring-2 focus:ring-theme-primary bg-theme-secondary text-theme-text placeholder-theme-text-secondary"
                    />
                  </div>

                  <Button
                    onClick={handleSendInvite}
                    disabled={!inviteEmail.trim() || isInviting}
                    className="w-full"
                  >
                    {isInviting ? (
                      'Sending...'
                    ) : (
                      <>
                        <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                        Send Invitation
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Pending Invites */}
              {pendingInvites.length > 0 && (
                <div>
                  <h4 className="text-md font-medium text-theme-text mb-3">
                    Pending Invitations ({pendingInvites.length})
                  </h4>
                  <div className="space-y-2">
                    {pendingInvites.map((invite) => (
                      <Card key={invite._id} className="p-3 card-theme">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <ClockIcon className="h-4 w-4 text-theme-warning" />
                            <div>
                              <p className="text-sm font-medium text-theme-text">
                                {invite.email}
                              </p>
                              <p className="text-xs text-theme-text-secondary">
                                {PERMISSION_LEVELS[invite.permission.toUpperCase()].label}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleCancelInvite(invite._id)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Manage Tab */}
          {activeTab === 'manage' && (
            <div className="space-y-6">
              {/* Current Collaborators */}
              <div>
                <h3 className="text-lg font-medium text-theme-text mb-4">
                  Current Collaborators ({collaborators.length + 1})
                </h3>
                
                <div className="space-y-3">
                  {/* Owner */}
                  <Card className="p-4 card-theme">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-theme-primary rounded-full">
                          <UserIcon className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-theme-text">
                            {collection?.createdBy === currentUserId ? 'You' : 'Owner'}
                          </p>
                          <p className="text-xs text-theme-text-secondary">Collection Owner</p>
                        </div>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-theme-success text-white">
                        Owner
                      </span>
                    </div>
                  </Card>

                  {/* Collaborators */}
                  {collaborators.map((collaborator) => (
                    <Card key={collaborator._id} className="p-4 card-theme">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-theme-secondary rounded-full">
                            <UserIcon className="h-4 w-4 text-theme-text-secondary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-theme-text">
                              {collaborator.user?.email || collaborator.email}
                            </p>
                            <p className="text-xs text-theme-text-secondary">
                              Joined {new Date(collaborator.joinedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {isOwner && (
                            <select
                              value={collaborator.permission}
                              onChange={(e) => handleUpdatePermission(collaborator._id, e.target.value)}
                              className="text-xs px-2 py-1 border border-theme-border rounded bg-theme-secondary text-theme-text"
                            >
                              {Object.values(PERMISSION_LEVELS).map(level => (
                                <option key={level.value} value={level.value}>
                                  {level.label}
                                </option>
                              ))}
                            </select>
                          )}
                          
                          {!isOwner && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-theme-secondary text-theme-text border border-theme-border">
                              {PERMISSION_LEVELS[collaborator.permission.toUpperCase()].label}
                            </span>
                          )}
                          
                          {isOwner && (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleRemoveCollaborator(collaborator._id)}
                              className="text-theme-error hover:text-theme-error"
                            >
                              <TrashIcon className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Activity Feed */}
              <div>
                <h4 className="text-md font-medium text-theme-text mb-3">
                  Recent Activity
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {activityFeed.length === 0 ? (
                    <p className="text-sm text-theme-text-secondary text-center py-4">
                      No recent activity
                    </p>
                   ) : (
                    activityFeed.map((activity) => (
                      <div key={activity._id} className="flex items-start space-x-3 py-2">
                        <div className="p-1 bg-theme-secondary rounded-full">
                          <UserIcon className="h-3 w-3 text-theme-text-secondary" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-theme-text">
                            {activity.user?.email || 'Someone'} {activity.action}
                          </p>
                          <p className="text-xs text-theme-text-secondary">
                            {formatActivityTime(activity.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end p-6 border-t border-theme-border bg-theme-secondary">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

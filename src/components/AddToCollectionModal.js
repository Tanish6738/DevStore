'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon, FolderIcon, PlusIcon, CheckIcon } from '@heroicons/react/24/outline';
import Button from './ui/Button';
// import Button from '../ui/Button';
import Input from './ui/Input';
import Card from './ui/Card';

export default function AddToCollectionModal({ 
  isOpen, 
  onClose, 
  productId, 
  productTitle = 'this item',
  onSuccess 
}) {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedCollections, setSelectedCollections] = useState(new Set());
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchCollections();
    }
  }, [isOpen]);

  const fetchCollections = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/collections');
      if (response.ok) {
        const data = await response.json();
        setCollections(data.collections || []);
      }
    } catch (error) {
      console.error('Error fetching collections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCollection = async (e) => {
    e.preventDefault();
    if (!newCollectionName.trim()) return;

    try {
      setCreating(true);
      const response = await fetch('/api/collections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newCollectionName.trim(),
          description: '',
          isPublic: false,
        }),
      });

      if (response.ok) {
        const newCollection = await response.json();
        setCollections([newCollection, ...collections]);
        setSelectedCollections(new Set([newCollection._id]));
        setNewCollectionName('');
        setShowCreateForm(false);
      }
    } catch (error) {
      console.error('Error creating collection:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleToggleCollection = (collectionId) => {
    const newSelected = new Set(selectedCollections);
    if (newSelected.has(collectionId)) {
      newSelected.delete(collectionId);
    } else {
      newSelected.add(collectionId);
    }
    setSelectedCollections(newSelected);
  };

  const handleSubmit = async () => {
    if (selectedCollections.size === 0) return;

    try {
      setSubmitting(true);
      
      // Add product to selected collections
      const promises = Array.from(selectedCollections).map(collectionId =>
        fetch(`/api/collections/${collectionId}/items`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            productId,
            type: 'product',
          }),
        })
      );

      await Promise.all(promises);
      
      if (onSuccess) {
        onSuccess(selectedCollections.size);
      }
      
      handleClose();
    } catch (error) {
      console.error('Error adding to collections:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedCollections(new Set());
    setNewCollectionName('');
    setShowCreateForm(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md transform transition-all">
          <Card className="p-6 card-theme">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-theme-text">
                Add to Collection
              </h3>
              <button
                onClick={handleClose}
                className="text-theme-text-secondary hover:text-theme-text transition-colors"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Product info */}
            <div className="mb-6 p-3 bg-theme-secondary/30 rounded-lg">
              <p className="text-sm text-theme-text-secondary">
                Adding <span className="font-medium text-theme-text">{productTitle}</span> to collection(s)
              </p>
            </div>

            {/* Collections list */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-theme-text">Your Collections</h4>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowCreateForm(!showCreateForm)}
                  className="btn-outline-primary"
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  New
                </Button>
              </div>

              {/* Create new collection form */}
              {showCreateForm && (
                <form onSubmit={handleCreateCollection} className="mb-4 p-3 bg-theme-secondary/20 rounded-lg">
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Collection name"
                      value={newCollectionName}
                      onChange={(e) => setNewCollectionName(e.target.value)}
                      className="flex-1 input-theme"
                      disabled={creating}
                    />
                    <Button
                      type="submit"
                      size="sm"
                      disabled={!newCollectionName.trim() || creating}
                      className="btn-primary"
                    >
                      {creating ? 'Creating...' : 'Create'}
                    </Button>
                  </div>
                </form>
              )}

              {/* Collections list */}
              {loading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-12 bg-theme-secondary/20 rounded animate-pulse" />
                  ))}
                </div>
              ) : collections.length === 0 ? (
                <div className="text-center py-8">
                  <FolderIcon className="h-12 w-12 text-theme-text-secondary mx-auto mb-2" />
                  <p className="text-sm text-theme-text-secondary">
                    No collections yet. Create your first one!
                  </p>
                </div>
              ) : (
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {collections.map((collection) => (
                    <div
                      key={collection._id}
                      onClick={() => handleToggleCollection(collection._id)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedCollections.has(collection._id)
                          ? 'border-theme-primary bg-theme-primary/10'
                          : 'border-theme-border hover:border-theme-primary/50 bg-theme-secondary/10'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-1 rounded ${
                            selectedCollections.has(collection._id)
                              ? 'bg-theme-primary/20'
                              : 'bg-theme-secondary/50'
                          }`}>
                            <FolderIcon className="h-4 w-4 text-theme-primary" />
                          </div>
                          <div>
                            <h5 className="font-medium text-theme-text text-sm">
                              {collection.name}
                            </h5>
                            <p className="text-xs text-theme-text-secondary">
                              {collection.itemCount || 0} items
                            </p>
                          </div>
                        </div>
                        {selectedCollections.has(collection._id) && (
                          <CheckIcon className="h-5 w-5 text-theme-primary" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleClose}
                className="flex-1 btn-outline-primary"
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                className="flex-1 btn-primary"
                disabled={selectedCollections.size === 0 || submitting}
              >
                {submitting ? 'Adding...' : `Add to ${selectedCollections.size} collection${selectedCollections.size !== 1 ? 's' : ''}`}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

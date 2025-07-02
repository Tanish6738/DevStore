'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon, FolderIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import Button from './ui/Button';
import Input from './ui/Input';
import Card from './ui/Card';

export default function EditCollectionModal({ 
  isOpen, 
  onClose, 
  collection,
  onSuccess 
}) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPublic: false
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen && collection) {
      setFormData({
        name: collection.name || '',
        description: collection.description || '',
        isPublic: collection.isPublic || false
      });
      setErrors({});
    }
  }, [isOpen, collection]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Collection name is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      setErrors({});

      const response = await fetch(`/api/collections/${collection._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim(),
          isPublic: formData.isPublic,
        }),
      });

      if (response.ok) {
        const updatedCollection = await response.json();
        if (onSuccess) {
          onSuccess(updatedCollection);
        }
        handleClose();
      } else {
        const errorData = await response.json();
        setErrors({ submit: errorData.message || 'Failed to update collection' });
      }
    } catch (error) {
      console.error('Error updating collection:', error);
      setErrors({ submit: 'Failed to update collection' });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      isPublic: false
    });
    setErrors({});
    onClose();
  };

  if (!isOpen || !collection) return null;

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
              <div className="flex items-center gap-3">
                <div className="p-2 bg-theme-primary/10 rounded-lg">
                  <FolderIcon className="h-5 w-5 text-theme-primary" />
                </div>
                <h3 className="text-lg font-semibold text-theme-text">
                  Edit Collection
                </h3>
              </div>
              <button
                onClick={handleClose}
                className="text-theme-text-secondary hover:text-theme-text transition-colors"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Collection Name */}
              <div>
                <label className="block text-sm font-medium text-theme-text mb-2">
                  Collection Name
                </label>
                <Input
                  type="text"
                  placeholder="Enter collection name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full input-theme"
                  disabled={loading}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-theme-text mb-2">
                  Description
                </label>
                <textarea
                  placeholder="Describe your collection (optional)"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-theme-border rounded-lg bg-theme-secondary/10 text-theme-text placeholder-theme-text-secondary focus:outline-none focus:ring-2 focus:ring-theme-primary focus:border-transparent resize-none"
                  disabled={loading}
                />
              </div>

              {/* Privacy Setting */}
              <div>
                <label className="block text-sm font-medium text-theme-text mb-2">
                  Privacy
                </label>
                <div className="space-y-3">
                  <div
                    onClick={() => !loading && setFormData({ ...formData, isPublic: false })}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      !formData.isPublic
                        ? 'border-theme-primary bg-theme-primary/10'
                        : 'border-theme-border hover:border-theme-primary/50 bg-theme-secondary/10'
                    } ${loading ? 'cursor-not-allowed opacity-50' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <EyeSlashIcon className="h-5 w-5 text-theme-text-secondary" />
                      <div>
                        <h4 className="font-medium text-theme-text">Private</h4>
                        <p className="text-sm text-theme-text-secondary">
                          Only you can view this collection
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div
                    onClick={() => !loading && setFormData({ ...formData, isPublic: true })}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      formData.isPublic
                        ? 'border-theme-primary bg-theme-primary/10'
                        : 'border-theme-border hover:border-theme-primary/50 bg-theme-secondary/10'
                    } ${loading ? 'cursor-not-allowed opacity-50' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <EyeIcon className="h-5 w-5 text-theme-text-secondary" />
                      <div>
                        <h4 className="font-medium text-theme-text">Public</h4>
                        <p className="text-sm text-theme-text-secondary">
                          Anyone can view this collection
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {errors.submit && (
                <div className="p-3 bg-red-100 border border-red-300 rounded-lg">
                  <p className="text-sm text-red-700">{errors.submit}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1 btn-outline-primary"
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Updating...' : 'Update Collection'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}

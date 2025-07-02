'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  XMarkIcon,
  DocumentDuplicateIcon,
  SparklesIcon,
  GlobeAltIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function SaveAsTemplateModal({ isOpen, onClose, collection, onSaveAsTemplate }) {
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!templateName.trim()) {
      setError('Template name is required');
      return;
    }

    try {
      setIsSaving(true);
      setError('');

      const response = await fetch('/api/templates/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          collectionId: collection._id,
          name: templateName,
          description: templateDescription,
          isPublic
        }),
      });

      if (response.ok) {
        const data = await response.json();
        onSaveAsTemplate?.(data.template);
        onClose();
        resetForm();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to save template');
      }
    } catch (error) {
      console.error('Error saving template:', error);
      setError('Failed to save template');
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setTemplateName('');
    setTemplateDescription('');
    setIsPublic(true);
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen || !collection) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-theme-background rounded-lg shadow-xl max-w-md w-full"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-theme-border">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-theme-primary/10 rounded-lg">
              <SparklesIcon className="w-6 h-6 text-theme-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-theme-text">
                Save as Template
              </h2>
              <p className="text-sm text-theme-text-secondary">
                Share your collection as a reusable template
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="text-theme-text-secondary hover:text-theme-text"
          >
            <XMarkIcon className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Collection Info */}
          <div className="p-4 bg-theme-secondary/30 rounded-lg">
            <h3 className="font-medium text-theme-text mb-1">{collection.name}</h3>
            <p className="text-sm text-theme-text-secondary mb-2">
              {collection.description || 'No description'}
            </p>
            <div className="text-xs text-theme-text-secondary">
              {collection.itemCount || 0} tools • Created {new Date(collection.createdAt).toLocaleDateString()}
            </div>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-theme-text mb-2">
                Template Name *
              </label>
              <Input
                type="text"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Enter template name"
                className={error && !templateName.trim() ? 'border-red-500' : ''}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-theme-text mb-2">
                Description
              </label>
              <textarea
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
                placeholder="Describe what this template is for..."
                rows={3}
                className="w-full px-3 py-2 border border-theme-border rounded-lg bg-theme-background text-theme-text focus:ring-2 focus:ring-theme-primary focus:border-transparent resize-none"
              />
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-theme-text">
                Visibility
              </label>
              
              <div className="space-y-2">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="visibility"
                    checked={isPublic}
                    onChange={() => setIsPublic(true)}
                    className="text-theme-primary"
                  />
                  <div className="flex items-center space-x-2">
                    <GlobeAltIcon className="w-4 h-4 text-theme-text-secondary" />
                    <div>
                      <div className="text-sm font-medium text-theme-text">Public Template</div>
                      <div className="text-xs text-theme-text-secondary">
                        Anyone can discover and use this template
                      </div>
                    </div>
                  </div>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="visibility"
                    checked={!isPublic}
                    onChange={() => setIsPublic(false)}
                    className="text-theme-primary"
                  />
                  <div className="flex items-center space-x-2">
                    <LockClosedIcon className="w-4 h-4 text-theme-text-secondary" />
                    <div>
                      <div className="text-sm font-medium text-theme-text">Private Template</div>
                      <div className="text-xs text-theme-text-secondary">
                        Only you can use this template
                      </div>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!templateName.trim() || isSaving}
              className="flex-1 btn-primary"
            >
              {isSaving ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <DocumentDuplicateIcon className="w-4 h-4" />
                  <span>Save Template</span>
                </div>
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

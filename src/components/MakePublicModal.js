'use client';

import { useState } from 'react';
import { XMarkIcon, GlobeAltIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import Button from './ui/Button';
import Input from './ui/Input';

export default function MakePublicModal({ isOpen, onClose, product, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/products/${product._id}/toggle-public`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isPublic: !product.isPublic,
          submissionNotes: submissionNotes.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update product visibility');
      }

      onSuccess(data.product);
      onClose();
      setSubmissionNotes('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSubmissionNotes('');
    setError('');
    onClose();
  };

  if (!isOpen || !product) return null;

  const isCurrentlyPublic = product.isPublic;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-theme-surface rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-theme-border">
          <h2 className="text-xl font-semibold text-theme-foreground flex items-center">
            {isCurrentlyPublic ? (
              <>
                <LockClosedIcon className="w-5 h-5 mr-2" />
                Make Private
              </>
            ) : (
              <>
                <GlobeAltIcon className="w-5 h-5 mr-2" />
                Make Public
              </>
            )}
          </h2>
          <button
            onClick={handleClose}
            className="text-theme-text-secondary hover:text-theme-foreground"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <h3 className="font-medium text-theme-foreground mb-2">{product.title}</h3>
            <p className="text-sm text-theme-text-secondary mb-4">{product.url}</p>
            
            {isCurrentlyPublic ? (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>Making this tool private will:</strong>
                </p>
                <ul className="text-sm text-yellow-700 dark:text-yellow-300 mt-2 space-y-1">
                  <li>• Remove it from public discovery</li>
                  <li>• Make it visible only to you</li>
                  <li>• Remove it from community collections</li>
                </ul>
              </div>
            ) : (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Making this tool public will:</strong>
                </p>
                <ul className="text-sm text-blue-700 dark:text-blue-300 mt-2 space-y-1">
                  <li>• Make it immediately available to the community</li>
                  <li>• Make it discoverable by other users</li>
                  <li>• Allow others to add it to their collections</li>
                  <li>• Enable community ratings and feedback</li>
                </ul>
              </div>
            )}
          </div>

          {!isCurrentlyPublic && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-theme-foreground mb-2">
                Additional Notes (Optional)
              </label>
              <textarea
                value={submissionNotes}
                onChange={(e) => setSubmissionNotes(e.target.value)}
                placeholder="Add any additional notes about this tool for the community..."
                className="w-full px-3 py-2 border border-theme-border rounded-lg bg-theme-background text-theme-foreground placeholder-theme-text-secondary focus:outline-none focus:ring-2 focus:ring-theme-primary focus:border-transparent resize-none"
                rows={3}
                maxLength={500}
              />
              <p className="text-xs text-theme-text-secondary mt-1">
                {submissionNotes.length}/500 characters
              </p>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant={isCurrentlyPublic ? "danger" : "primary"}
              className="flex-1"
              disabled={loading}
            >
              {loading ? 'Updating...' : (isCurrentlyPublic ? 'Make Private' : 'Make Public')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

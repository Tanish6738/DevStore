'use client';

import { useState } from 'react';
import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import Button from './ui/Button';

export default function ReportProductModal({ isOpen, onClose, product, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const reportReasons = [
    { value: 'inappropriate', label: 'Inappropriate Content' },
    { value: 'broken_link', label: 'Broken or Invalid Link' },
    { value: 'spam', label: 'Spam or Low Quality' },
    { value: 'duplicate', label: 'Duplicate Tool' },
    { value: 'wrong_category', label: 'Wrong Category' },
    { value: 'other', label: 'Other' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!reason || !description.trim()) {
      setError('Please select a reason and provide a description.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/products/${product._id}/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason,
          description: description.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to report product');
      }

      onSuccess();
      handleClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setReason('');
    setDescription('');
    setError('');
    onClose();
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-theme-background rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-theme-border">
        <div className="flex items-center justify-between p-6 border-b border-theme-border">
          <h2 className="text-xl font-semibold text-theme-text flex items-center">
            <ExclamationTriangleIcon className="w-5 h-5 mr-2 text-theme-error" />
            Report Tool
          </h2>
          <button
            onClick={handleClose}
            className="text-theme-text-secondary hover:text-theme-text transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <h3 className="font-medium text-theme-text mb-2">{product.title}</h3>
            <p className="text-sm text-theme-text-secondary mb-4">{product.url}</p>
            
            <div className="bg-theme-secondary border border-theme-warning rounded-lg p-4 mb-4">
              <p className="text-sm text-theme-warning">
                Please only report tools that violate our community guidelines. False reports may result in restrictions on your account.
              </p>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-theme-text mb-2">
              Reason for Report *
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border border-theme-border rounded-lg bg-theme-secondary text-theme-text focus:outline-none focus:ring-2 focus:ring-theme-primary focus:border-transparent"
              required
            >
              <option value="">Select a reason...</option>
              {reportReasons.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-theme-text mb-2">
              Description *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please provide details about the issue..."
              className="w-full px-3 py-2 border border-theme-border rounded-lg bg-theme-secondary text-theme-text placeholder:text-theme-text-secondary focus:outline-none focus:ring-2 focus:ring-theme-primary focus:border-transparent resize-none"
              rows={4}
              maxLength={1000}
              required
            />
            <p className="text-xs text-theme-text-secondary mt-1">
              {description.length}/1000 characters
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-theme-secondary border border-theme-error rounded-lg">
              <p className="text-sm text-theme-error">{error}</p>
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
              variant="danger"
              className="flex-1 bg-theme-error hover:bg-theme-error/90 text-white"
              disabled={loading || !reason || !description.trim()}
            >
              {loading ? 'Reporting...' : 'Submit Report'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { XMarkIcon, LinkIcon } from '@heroicons/react/24/outline';

export default function CreateProductModal({ isOpen, onClose, onCreate }) {
  const [formData, setFormData] = useState({
    url: '',
    title: '',
    description: '',
    category: '',
    tags: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [fetchingMetadata, setFetchingMetadata] = useState(false);

  const categories = [
    'Frontend',
    'Backend',
    'DevOps',
    'Design',
    'Testing',
    'Mobile',
    'Database',
    'API',
    'Security',
    'Productivity',
    'Analytics',
    'Other'
  ];

  const resetForm = () => {
    setFormData({
      url: '',
      title: '',
      description: '',
      category: '',
      tags: []
    });
    setTagInput('');
    setError('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUrlBlur = async () => {
    if (formData.url && !formData.title && !formData.description) {
      setFetchingMetadata(true);
      try {
        // Try to fetch metadata to pre-fill title and description
        const response = await fetch('/api/metadata', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url: formData.url }),
        });

        if (response.ok) {
          const metadata = await response.json();
          setFormData(prev => ({
            ...prev,
            title: metadata.title || '',
            description: metadata.description || '',
          }));
        }
      } catch (err) {
        console.log('Could not fetch metadata:', err);
      } finally {
        setFetchingMetadata(false);
      }
    }
  };

  const handleAddTag = (e) => {
    e.preventDefault();
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create product');
      }

      onCreate(data);
      resetForm();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-theme-secondary rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-theme-border">
        <div className="flex items-center justify-between p-6 border-b border-theme-border">
          <h3 className="text-lg font-semibold text-theme-text">Add New Product</h3>
          <button
            onClick={handleClose}
            className="text-theme-text-secondary hover:text-theme-text transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-theme-error/10 border border-theme-error rounded-md text-theme-error text-sm">
              {error}
            </div>
          )}

          {/* URL */}
          <div>
            <label htmlFor="url" className="block text-sm font-medium text-theme-text mb-2">
              URL *
            </label>
            <div className="relative">
              <input
                type="url"
                id="url"
                name="url"
                value={formData.url}
                onChange={handleInputChange}
                onBlur={handleUrlBlur}
                required
                className="input-theme w-full pl-10 pr-3 py-2"
                placeholder="https://example.com"
              />
              <LinkIcon className="h-5 w-5 text-theme-text-secondary absolute left-3 top-2.5" />
            </div>
            {fetchingMetadata && (
              <p className="text-xs text-theme-primary mt-1">Fetching metadata...</p>
            )}
          </div>

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-theme-text mb-2">
              Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="input-theme w-full px-3 py-2"
              placeholder="Enter product title"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-theme-text mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="input-theme w-full px-3 py-2 resize-none"
              placeholder="Enter product description"
            />
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-theme-text mb-2">
              Category
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="input-theme w-full px-3 py-2"
            >
              <option value="">Select a category</option>
              {categories.map(category => (
                <option key={category} value={category.toLowerCase()}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-theme-text mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-theme-primary/20 text-theme-primary border border-theme-primary/30"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-2 text-theme-primary hover:text-theme-accent transition-colors"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add a tag"
                className="input-theme flex-1 px-3 py-2"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddTag(e);
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2 bg-theme-secondary border border-theme-border text-theme-text rounded-md hover:bg-theme-primary/10 hover:border-theme-primary transition-colors"
              >
                Add
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-theme-border">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-theme-text bg-theme-secondary border border-theme-border hover:bg-theme-primary/10 hover:border-theme-primary rounded-md transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.url.trim() || !formData.title.trim()}
              className="btn-primary px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

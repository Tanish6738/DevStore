'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { DocumentDuplicateIcon, FolderIcon, TagIcon } from '@heroicons/react/24/outline';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import TemplateExplorerModal from '@/components/TemplateExplorerModal';



export default function CreateCollectionPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPublic: false,
    // Template-specific fields
    isTemplate: false,
    templateCategory: '',
    templateDescription: '',
    templateTags: [],
    isPublicTemplate: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [currentTag, setCurrentTag] = useState('');

  // Redirect if not authenticated
  if (isLoaded && !user) {
    router.push('/');
    return null;
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleTagAdd = (e) => {
    e.preventDefault();
    if (currentTag.trim() && !formData.templateTags.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        templateTags: [...prev.templateTags, currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };

  const handleTagRemove = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      templateTags: prev.templateTags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Prepare the data based on whether it's a template or regular collection
      const collectionData = {
        name: formData.name,
        description: formData.description,
        isPublic: formData.isPublic,
      };

      // Add template-specific data if creating as template
      if (formData.isTemplate) {
        collectionData.isTemplate = true;
        collectionData.templateData = {
          isTemplate: true,
          templateCategory: formData.templateCategory,
          templateDescription: formData.templateDescription || formData.description,
          templateTags: formData.templateTags,
          isPublicTemplate: formData.isPublicTemplate,
          usageCount: 0,
        };
        collectionData.category = formData.templateCategory;
      }

      const response = await fetch('/api/collections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(collectionData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create collection');
      }

      const collection = await response.json();
      
      // Redirect to the new collection or dashboard
      router.push(`/collections/${collection._id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/dashboard');
  };

  const handleCreateFromTemplate = async (templateData) => {
    try {
      setIsLoading(true);
      setError('');

      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(templateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create collection from template');
      }

      const { collection } = await response.json();
      router.push(`/collections/${collection._id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
      setShowTemplateModal(false);
    }
  };

  // Template categories for the dropdown
  const TEMPLATE_CATEGORIES = [
    { value: '', label: 'Select Category' },
    { value: 'frontend', label: 'Frontend' },
    { value: 'backend', label: 'Backend' },
    { value: 'devops', label: 'DevOps' },
    { value: 'design', label: 'Design' },
    { value: 'ai-ml', label: 'AI/ML' },
    { value: 'analytics', label: 'Analytics' },
    { value: 'general', label: 'General' },
  ];

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-theme-background flex items-center justify-center">
        <div className="text-lg text-theme-text">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-theme-background py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-theme-text mb-2">
                Create New Collection
              </h1>
              <p className="text-theme-text-secondary">
                Organize your favorite tools and resources into custom collections.
              </p>
            </div>
            <Button
              onClick={() => setShowTemplateModal(true)}
              variant="outline"
              className="btn-outline-primary flex items-center gap-2"
            >
              <DocumentDuplicateIcon className="w-4 h-4" />
              Use Template
            </Button>
          </div>
        </div>

        <Card className="p-6 card-theme">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-theme-error/10 border border-theme-error/30 text-theme-error px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-theme-text mb-2">
                Collection Name *
              </label>
              <Input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter collection name"
                className="w-full input-theme"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-theme-text mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your collection (optional)"
                className="w-full input-theme resize-none"
              />
            </div>

            <div className="flex items-center">
              <input
                id="isPublic"
                name="isPublic"
                type="checkbox"
                checked={formData.isPublic}
                onChange={handleChange}
                className="h-4 w-4 text-theme-primary focus:ring-theme-primary border-theme-border rounded"
              />
              <label htmlFor="isPublic" className="ml-2 block text-sm text-theme-text">
                Make this collection public
              </label>
            </div>
            <p className="text-sm text-theme-text-secondary ml-6">
              Public collections can be discovered and viewed by other users.
            </p>

            {/* Template Section */}
            <div className="border-t border-theme-border pt-6">
              <div className="flex items-center mb-4">
                <input
                  id="isTemplate"
                  name="isTemplate"
                  type="checkbox"
                  checked={formData.isTemplate}
                  onChange={handleChange}
                  className="h-4 w-4 text-theme-primary focus:ring-theme-primary border-theme-border rounded"
                />
                <label htmlFor="isTemplate" className="ml-2 block text-sm font-medium text-theme-text">
                  Save as Template
                </label>
              </div>
              <p className="text-sm text-theme-text-secondary mb-4">
                Templates can be reused to quickly create new collections with the same structure.
              </p>

              {formData.isTemplate && (
                <div className="space-y-4 pl-6 border-l-2 border-theme-primary/30">
                  <div>
                    <label htmlFor="templateCategory" className="block text-sm font-medium text-theme-text mb-2">
                      Template Category *
                    </label>
                    <select
                      id="templateCategory"
                      name="templateCategory"
                      value={formData.templateCategory}
                      onChange={handleChange}
                      required={formData.isTemplate}
                      className="w-full input-theme"
                    >
                      {TEMPLATE_CATEGORIES.map((category) => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="templateDescription" className="block text-sm font-medium text-theme-text mb-2">
                      Template Description
                    </label>
                    <textarea
                      id="templateDescription"
                      name="templateDescription"
                      rows={3}
                      value={formData.templateDescription}
                      onChange={handleChange}
                      placeholder="Describe what this template is for and how to use it..."
                      className="w-full input-theme resize-none"
                    />
                    <p className="text-xs text-theme-text-secondary mt-1">
                      If left empty, the collection description will be used.
                    </p>
                  </div>

                  <div>
                    <label htmlFor="templateTags" className="block text-sm font-medium text-theme-text mb-2">
                      Template Tags
                    </label>
                    <div className="flex gap-2 mb-2">
                      <Input
                        type="text"
                        value={currentTag}
                        onChange={(e) => setCurrentTag(e.target.value)}
                        placeholder="Add a tag..."
                        className="flex-1 input-theme"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleTagAdd(e);
                          }
                        }}
                      />
                      <Button
                        type="button"
                        onClick={handleTagAdd}
                        variant="outline"
                        size="sm"
                        className="btn-outline-primary"
                      >
                        Add
                      </Button>
                    </div>
                    {formData.templateTags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.templateTags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-theme-secondary text-theme-text border border-theme-border"
                          >
                            <TagIcon className="h-3 w-3 mr-1" />
                            {tag}
                            <button
                              type="button"
                              onClick={() => handleTagRemove(tag)}
                              className="ml-1 text-theme-text-secondary hover:text-theme-error"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center">
                    <input
                      id="isPublicTemplate"
                      name="isPublicTemplate"
                      type="checkbox"
                      checked={formData.isPublicTemplate}
                      onChange={handleChange}
                      className="h-4 w-4 text-theme-primary focus:ring-theme-primary border-theme-border rounded"
                    />
                    <label htmlFor="isPublicTemplate" className="ml-2 block text-sm text-theme-text">
                      Make template public
                    </label>
                  </div>
                  <p className="text-sm text-theme-text-secondary ml-6">
                    Public templates can be discovered and used by other users to create collections.
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-4 pt-4">
              <Button 
                type="submit" 
                disabled={isLoading || !formData.name.trim() || (formData.isTemplate && !formData.templateCategory)}
                className="flex-1 btn-primary"
              >
                {isLoading ? 'Creating...' : formData.isTemplate ? 'Create Template' : 'Create Collection'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleCancel}
                className="flex-1 btn-outline-primary"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>

        <div className="mt-8 bg-theme-primary/10 border border-theme-primary/30 rounded-md p-4">
          <h3 className="text-sm font-medium text-theme-primary mb-2">💡 Tips for Creating Collections</h3>
          <ul className="text-sm text-theme-text-secondary space-y-1">
            <li>• Use descriptive names that clearly indicate the collection&apos;s purpose</li>
            <li>• Add detailed descriptions to help others understand your collection</li>
            <li>• Consider making useful collections public to share with the community</li>
            <li>• You can always edit or delete collections later from your dashboard</li>
            {formData.isTemplate && (
              <>
                <li>• Choose appropriate categories and tags for better template discoverability</li>
                <li>• Template descriptions help others understand when to use your template</li>
                <li>• Public templates can be used by the entire community</li>
              </>
            )}
          </ul>
        </div>

        {/* Template Explorer Modal */}
        <TemplateExplorerModal
          isOpen={showTemplateModal}
          onClose={() => setShowTemplateModal(false)}
          onCreateFromTemplate={handleCreateFromTemplate}
        />
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon,
  DocumentDuplicateIcon,
  TagIcon,
  FolderIcon,
  GlobeAltIcon,
  CodeBracketIcon,
  WrenchScrewdriverIcon,
  CloudIcon,
  CpuChipIcon,
  ChartBarIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
  UserIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';

const TEMPLATE_CATEGORIES = [
  { value: 'all', label: 'All Templates', icon: FolderIcon },
  { value: 'frontend', label: 'Frontend', icon: CodeBracketIcon },
  { value: 'backend', label: 'Backend', icon: WrenchScrewdriverIcon },
  { value: 'devops', label: 'DevOps', icon: CloudIcon },
  { value: 'design', label: 'Design', icon: GlobeAltIcon },
  { value: 'ai-ml', label: 'AI/ML', icon: CpuChipIcon },
  { value: 'analytics', label: 'Analytics', icon: ChartBarIcon }
];

export default function TemplateExplorerModal({ isOpen, onClose, onCreateFromTemplate }) {
  const [publicTemplates, setPublicTemplates] = useState([]);
  const [userTemplates, setUserTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('public'); // 'public' or 'my-templates'
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);

  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch public templates
      const publicResponse = await fetch(`/api/templates?category=${selectedCategory}&limit=50`);
      if (publicResponse.ok) {
        const publicData = await publicResponse.json();
        setPublicTemplates(publicData.templates || []);
      }

      // Fetch user templates
      const userResponse = await fetch('/api/templates/user');
      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUserTemplates(userData.templates || []);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    if (isOpen) {
      fetchTemplates();
      setSearchQuery('');
      setSelectedCategory('all');
      setSelectedTemplate(null);
    }
  }, [isOpen, fetchTemplates]);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    fetchTemplates();
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setCustomName(template.name);
    setCustomDescription(template.description);
  };

  const handleCreateCollection = async () => {
    if (!selectedTemplate) return;

    try {
      setIsCreating(true);
      
      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateId: selectedTemplate._id,
          name: customName,
          description: customDescription,
          isPrivate
        }),
      });

      if (response.ok) {
        const data = await response.json();
        onCreateFromTemplate?.(data.collection);
        onClose();
      } else {
        console.error('Failed to create collection from template');
      }
    } catch (error) {
      console.error('Error creating collection from template:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const filteredTemplates = (activeTab === 'public' ? publicTemplates : userTemplates).filter(template =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (template.description && template.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-theme-background rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-theme-border">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-theme-primary/10 rounded-lg">
              <SparklesIcon className="w-6 h-6 text-theme-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-theme-text">
                Browse Templates
              </h2>
              <p className="text-sm text-theme-text-secondary">
                Create collections from pre-built templates
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-theme-text-secondary hover:text-theme-text"
          >
            <XMarkIcon className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex h-[600px]">
          {/* Left Sidebar */}
          <div className="w-80 border-r border-theme-border p-6 overflow-y-auto">
            {/* Tabs */}
            <div className="flex space-x-1 p-1 bg-theme-secondary rounded-lg mb-6">
              <button
                onClick={() => setActiveTab('public')}
                className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'public'
                    ? 'bg-theme-background text-theme-primary shadow-sm'
                    : 'text-theme-text-secondary hover:text-theme-text'
                }`}
              >
                <GlobeAltIcon className="w-4 h-4 inline mr-2" />
                Public
              </button>
              <button
                onClick={() => setActiveTab('my-templates')}
                className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'my-templates'
                    ? 'bg-theme-background text-theme-primary shadow-sm'
                    : 'text-theme-text-secondary hover:text-theme-text'
                }`}
              >
                <UserIcon className="w-4 h-4 inline mr-2" />
                My Templates
              </button>
            </div>

            {/* Search */}
            <div className="relative mb-6">
              <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-theme-text-secondary" />
              <Input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Categories */}
            {activeTab === 'public' && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-theme-text mb-3">Categories</h3>
                {TEMPLATE_CATEGORIES.map((category) => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.value}
                      onClick={() => handleCategoryChange(category.value)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        selectedCategory === category.value
                          ? 'bg-theme-primary/10 text-theme-primary'
                          : 'text-theme-text-secondary hover:bg-theme-secondary hover:text-theme-text'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm">{category.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="flex-1 flex">
            {/* Templates List */}
            <div className="w-1/2 p-6 overflow-y-auto border-r border-theme-border">
              <h3 className="text-lg font-medium text-theme-text mb-4">
                {activeTab === 'public' ? 'Community Templates' : 'Your Templates'}
              </h3>
              
              {loading ? (
                <div className="space-y-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-24 bg-theme-secondary rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : filteredTemplates.length === 0 ? (
                <div className="text-center py-8">
                  <FolderIcon className="w-12 h-12 text-theme-text-secondary mx-auto mb-3" />
                  <p className="text-theme-text-secondary">
                    {activeTab === 'public' ? 'No public templates found' : 'No templates created yet'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredTemplates.map((template) => (
                    <Card
                      key={template._id}
                      className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                        selectedTemplate?._id === template._id
                          ? 'ring-2 ring-theme-primary bg-theme-primary/5'
                          : 'hover:bg-theme-secondary/50'
                      }`}
                      onClick={() => handleTemplateSelect(template)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-theme-text line-clamp-1">
                          {template.name}
                        </h4>
                        <div className="flex items-center space-x-1 text-xs text-theme-text-secondary">
                          {template.usageCount && (
                            <>
                              <HeartIcon className="w-3 h-3" />
                              <span>{template.usageCount}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-theme-text-secondary line-clamp-2 mb-3">
                        {template.description}
                      </p>
                      <div className="flex items-center justify-between text-xs text-theme-text-secondary">
                        <span className="bg-theme-secondary px-2 py-1 rounded">
                          {template.itemCount || 0} items
                        </span>
                        {template.category && (
                          <span className="capitalize">{template.category}</span>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Template Preview & Creation */}
            <div className="w-1/2 p-6 overflow-y-auto">
              {selectedTemplate ? (
                <div>
                  <h3 className="text-lg font-medium text-theme-text mb-4">Create Collection</h3>
                  
                  {/* Template Info */}
                  <Card className="p-4 mb-6 bg-theme-secondary/30">
                    <h4 className="font-medium text-theme-text mb-2">{selectedTemplate.name}</h4>
                    <p className="text-sm text-theme-text-secondary mb-3">
                      {selectedTemplate.description}
                    </p>
                    <div className="flex items-center justify-between text-xs text-theme-text-secondary">
                      <span>{selectedTemplate.itemCount || 0} tools included</span>
                      {selectedTemplate.createdBy && (
                        <span>by {selectedTemplate.createdBy.firstName || 'User'}</span>
                      )}
                    </div>
                  </Card>

                  {/* Customization Form */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-theme-text mb-2">
                        Collection Name
                      </label>
                      <Input
                        type="text"
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        placeholder="Enter collection name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-theme-text mb-2">
                        Description
                      </label>
                      <textarea
                        value={customDescription}
                        onChange={(e) => setCustomDescription(e.target.value)}
                        placeholder="Enter collection description"
                        rows={3}
                        className="w-full px-3 py-2 border border-theme-border rounded-lg bg-theme-background text-theme-text focus:ring-2 focus:ring-theme-primary focus:border-transparent resize-none"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="isPrivate"
                        checked={isPrivate}
                        onChange={(e) => setIsPrivate(e.target.checked)}
                        className="rounded border-theme-border"
                      />
                      <label htmlFor="isPrivate" className="text-sm text-theme-text">
                        Make collection private
                      </label>
                    </div>

                    <Button
                      onClick={handleCreateCollection}
                      disabled={!customName.trim() || isCreating}
                      className="w-full btn-primary"
                    >
                      {isCreating ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Creating...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <DocumentDuplicateIcon className="w-4 h-4" />
                          <span>Create Collection</span>
                        </div>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <SparklesIcon className="w-12 h-12 text-theme-text-secondary mx-auto mb-3" />
                    <p className="text-theme-text-secondary">
                      Select a template to get started
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

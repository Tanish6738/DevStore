'use client';

import { useState, useEffect } from 'react';
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
  ChartBarIcon
} from '@heroicons/react/24/outline';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';

const PREDEFINED_TEMPLATES = [
  {
    id: 'frontend-toolkit',
    name: 'Frontend Development Toolkit',
    description: 'Essential products for modern frontend development',
    category: 'Development',
    icon: CodeBracketIcon,
    tools: [
      { name: 'React', url: 'https://reactjs.org', category: 'Framework' },
      { name: 'Next.js', url: 'https://nextjs.org', category: 'Framework' },
      { name: 'Tailwind CSS', url: 'https://tailwindcss.com', category: 'Styling' },
      { name: 'Vite', url: 'https://vitejs.dev', category: 'Build Tool' },
      { name: 'ESLint', url: 'https://eslint.org', category: 'Linting' },
      { name: 'Prettier', url: 'https://prettier.io', category: 'Formatting' }
    ]
  },
  {
    id: 'backend-essentials',
    name: 'Backend Development Essentials',
    description: 'Server-side development products and frameworks',
    category: 'Development',
    icon: WrenchScrewdriverIcon,
    tools: [
      { name: 'Node.js', url: 'https://nodejs.org', category: 'Runtime' },
      { name: 'Express.js', url: 'https://expressjs.com', category: 'Framework' },
      { name: 'MongoDB', url: 'https://mongodb.com', category: 'Database' },
      { name: 'PostgreSQL', url: 'https://postgresql.org', category: 'Database' },
      { name: 'Redis', url: 'https://redis.io', category: 'Cache' },
      { name: 'Docker', url: 'https://docker.com', category: 'Container' }
    ]
  },
  {
    id: 'devops-stack',
    name: 'DevOps & Deployment Stack',
    description: 'Products for CI/CD, monitoring, and infrastructure',
    category: 'DevOps',
    icon: CloudIcon,
    tools: [
      { name: 'GitHub Actions', url: 'https://github.com/features/actions', category: 'CI/CD' },
      { name: 'Vercel', url: 'https://vercel.com', category: 'Hosting' },
      { name: 'AWS', url: 'https://aws.amazon.com', category: 'Cloud' },
      { name: 'Kubernetes', url: 'https://kubernetes.io', category: 'Orchestration' },
      { name: 'Terraform', url: 'https://terraform.io', category: 'Infrastructure' },
      { name: 'Grafana', url: 'https://grafana.com', category: 'Monitoring' }
    ]
  },
  {
    id: 'ui-ux-tools',
    name: 'UI/UX Design Products',
    description: 'Design and prototyping products for user interfaces',
    category: 'Design',
    icon: GlobeAltIcon,
    tools: [
      { name: 'Figma', url: 'https://figma.com', category: 'Design' },
      { name: 'Sketch', url: 'https://sketch.com', category: 'Design' },
      { name: 'Adobe XD', url: 'https://adobe.com/products/xd', category: 'Design' },
      { name: 'InVision', url: 'https://invisionapp.com', category: 'Prototyping' },
      { name: 'Miro', url: 'https://miro.com', category: 'Collaboration' },
      { name: 'ColorHunt', url: 'https://colorhunt.co', category: 'Colors' }
    ]
  },
  {
    id: 'performance-monitoring',
    name: 'Performance & Analytics',
    description: 'Products for monitoring, analytics, and performance optimization',
    category: 'Analytics',
    icon: ChartBarIcon,
    tools: [
      { name: 'Google Analytics', url: 'https://analytics.google.com', category: 'Analytics' },
      { name: 'Lighthouse', url: 'https://developers.google.com/web/tools/lighthouse', category: 'Performance' },
      { name: 'WebPageTest', url: 'https://webpagetest.org', category: 'Performance' },
      { name: 'Sentry', url: 'https://sentry.io', category: 'Error Tracking' },
      { name: 'New Relic', url: 'https://newrelic.com', category: 'Monitoring' },
      { name: 'Hotjar', url: 'https://hotjar.com', category: 'User Behavior' }
    ]
  },
  {
    id: 'ai-ml-toolkit',
    name: 'AI & Machine Learning Toolkit',
    description: 'Essential products for AI and machine learning development',
    category: 'AI/ML',
    icon: CpuChipIcon,
    tools: [
      { name: 'TensorFlow', url: 'https://tensorflow.org', category: 'Framework' },
      { name: 'PyTorch', url: 'https://pytorch.org', category: 'Framework' },
      { name: 'OpenAI API', url: 'https://openai.com/api', category: 'API' },
      { name: 'Hugging Face', url: 'https://huggingface.co', category: 'Models' },
      { name: 'Jupyter', url: 'https://jupyter.org', category: 'Notebook' },
      { name: 'Google Colab', url: 'https://colab.research.google.com', category: 'Platform' }
    ]
  }
];

export default function CollectionTemplateModal({ isOpen, onClose, onCreateFromTemplate, userId }) {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [customName, setCustomName] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [userTemplates, setUserTemplates] = useState([]);
  const [activeTab, setActiveTab] = useState('predefined'); // 'predefined' or 'custom'

  // Validate required props
  if (!onCreateFromTemplate || typeof onCreateFromTemplate !== 'function') {
    console.error('CollectionTemplateModal: onCreateFromTemplate prop is required and must be a function');
  }

  useEffect(() => {
    if (isOpen && userId) {
      fetchUserTemplates();
    }
  }, [isOpen, userId]);

  const fetchUserTemplates = async () => {
    try {
      const response = await fetch('/api/templates/user');
      if (response.ok) {
        const data = await response.json();
        setUserTemplates(data.templates || []);
      }
    } catch (error) {
      console.error('Error fetching user templates:', error);
    }
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setCustomName(template.name);
    setCustomDescription(template.description);
  };

  const handleCreateCollection = async () => {
    if (!selectedTemplate || !customName.trim()) return;

    // Check if onCreateFromTemplate function is available
    if (!onCreateFromTemplate || typeof onCreateFromTemplate !== 'function') {
      console.error('onCreateFromTemplate is not a function');
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch('/api/collections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: customName.trim(),
          description: customDescription.trim(),
          isPrivate,
          templateId: selectedTemplate.id,
          items: selectedTemplate.tools || selectedTemplate.items || []
        }),
      });

      if (response.ok) {
        const newCollection = await response.json();
        onCreateFromTemplate(newCollection);
        onClose();
        resetForm();
      }
    } catch (error) {
      console.error('Error creating collection from template:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const resetForm = () => {
    setSelectedTemplate(null);
    setCustomName('');
    setCustomDescription('');
    setIsPrivate(false);
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-theme-background rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-theme-border">
        <div className="flex items-center justify-between p-6 border-b border-theme-border">
          <h2 className="text-xl font-semibold text-theme-text">Create from Template</h2>
          <button
            onClick={handleClose}
            className="text-theme-text-secondary hover:text-theme-text transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-6">
            <button
              onClick={() => setActiveTab('predefined')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'predefined'
                  ? 'bg-theme-primary text-white'
                  : 'text-theme-text-secondary hover:text-theme-text hover:bg-theme-secondary'
              }`}
            >
              Predefined Templates
            </button>
            <button
              onClick={() => setActiveTab('custom')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'custom'
                  ? 'bg-theme-primary text-white'
                  : 'text-theme-text-secondary hover:text-theme-text hover:bg-theme-secondary'
              }`}
            >
              My Templates ({userTemplates.length})
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {/* Predefined Templates */}
            {activeTab === 'predefined' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {PREDEFINED_TEMPLATES.map((template) => {
                  const IconComponent = template.icon;
                  return (
                    <Card
                      key={template.id}
                      className={`p-4 cursor-pointer transition-all card-theme ${
                        selectedTemplate?.id === template.id
                          ? 'ring-2 ring-theme-primary bg-theme-secondary'
                          : 'hover:shadow-md'
                      }`}
                      onClick={() => handleTemplateSelect(template)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-theme-secondary rounded-lg">
                          <IconComponent className="h-6 w-6 text-theme-text-secondary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-theme-text">{template.name}</h3>
                          <p className="text-sm text-theme-text-secondary mt-1">{template.description}</p>
                          <div className="flex items-center justify-between mt-3">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-theme-secondary text-theme-text border border-theme-border">
                              <TagIcon className="h-3 w-3 mr-1" />
                              {template.category}
                            </span>
                            <span className="text-xs text-theme-text-secondary">
                              {template.tools.length} products
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* User Templates */}
            {activeTab === 'custom' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userTemplates.length === 0 ? (
                  <div className="col-span-2 text-center py-8">
                    <FolderIcon className="h-12 w-12 text-theme-text-secondary mx-auto mb-4" />
                    <p className="text-theme-text-secondary">No custom templates yet</p>
                    <p className="text-sm text-theme-text-secondary mt-1">
                      Save a collection as a template to see it here
                    </p>
                  </div>
                ) : (
                  userTemplates.map((template) => (
                    <Card
                      key={template._id}
                      className={`p-4 cursor-pointer transition-all card-theme ${
                        selectedTemplate?._id === template._id
                          ? 'ring-2 ring-theme-primary bg-theme-secondary'
                          : 'hover:shadow-md'
                      }`}
                      onClick={() => handleTemplateSelect(template)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-theme-secondary rounded-lg">
                          <DocumentDuplicateIcon className="h-6 w-6 text-theme-text-secondary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-theme-text">{template.name}</h3>
                          <p className="text-sm text-theme-text-secondary mt-1">{template.description}</p>
                          <div className="flex items-center justify-between mt-3">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-theme-secondary text-theme-text border border-theme-border">
                              <TagIcon className="h-3 w-3 mr-1" />
                              Custom
                            </span>
                            <span className="text-xs text-theme-text-secondary">
                              {template.items?.length || 0} items
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Collection Customization */}
          {selectedTemplate && (
            <div className="mt-6 pt-6 border-t border-theme-border space-y-4">
              <h3 className="font-medium text-theme-text">Customize Your Collection</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-theme-text mb-1">
                    Collection Name *
                  </label>
                  <Input
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="Enter collection name"
                    required
                    className="input-theme"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-theme-text mb-1">
                    Description
                  </label>
                  <Input
                    value={customDescription}
                    onChange={(e) => setCustomDescription(e.target.value)}
                    placeholder="Optional description"
                    className="input-theme"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPrivate"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  className="h-4 w-4 text-theme-primary focus:ring-theme-primary border-theme-border rounded"
                />
                <label htmlFor="isPrivate" className="ml-2 text-sm text-theme-text">
                  Make this collection private
                </label>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between p-6 border-t border-theme-border bg-theme-secondary">
          <div className="text-sm text-theme-text-secondary">
            {selectedTemplate && (
              <>
                Creating: <span className="font-medium text-theme-text">{selectedTemplate.name}</span>
                {selectedTemplate.tools && (
                  <> with {selectedTemplate.tools.length} products</>
                )}
              </>
            )}
          </div>
          <div className="flex space-x-3">
            <Button variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateCollection}
              disabled={!selectedTemplate || !customName.trim() || isCreating}
              className="min-w-[120px]"
            >
              {isCreating ? 'Creating...' : 'Create Collection'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Header from '@/components/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import AddToCollectionModal from '@/components/AddToCollectionModal';
import ReportProductModal from '@/components/ReportProductModal';
import { useDebounce } from '@/hooks/useDebounce';
import { 
  MagnifyingGlassIcon, 
  TagIcon, 
  FunnelIcon, 
  GlobeAltIcon,
  HeartIcon,
  StarIcon,
  EyeIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  RectangleStackIcon,
  DocumentTextIcon,
  CodeBracketIcon,
  NewspaperIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

// Define tabs outside component to avoid dependency issues
const tabs = [
  { id: 'products', label: 'Products', icon: GlobeAltIcon, endpoint: '/api/products/public' },
  { id: 'collections', label: 'Collections', icon: RectangleStackIcon, endpoint: '/api/collections/public' },
  { id: 'templates', label: 'Templates', icon: CodeBracketIcon, endpoint: '/api/templates/public' },
  { id: 'blogs', label: 'Blog Posts', icon: NewspaperIcon, endpoint: '/api/blogs/public' }
];

export default function CommunityPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'products');
  const [data, setData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [imageStatuses, setImageStatuses] = useState({}); // Track loading states: 'loading', 'loaded', 'error'
  
  // Modal states
  const [addToCollectionModal, setAddToCollectionModal] = useState({ open: false, product: null });
  const [reportModal, setReportModal] = useState({ open: false, product: null });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
        sort: sortBy,
      });

      if (selectedCategory) {
        params.append('category', selectedCategory);
      }

      if (debouncedSearchQuery.trim()) {
        params.append('search', debouncedSearchQuery.trim());
      }

      const currentTab = tabs.find(tab => tab.id === activeTab);
      const response = await fetch(`${currentTab.endpoint}?${params}`);
      const result = await response.json();

      if (response.ok) {
        // Handle different response structures for different content types
        let items = [];
        let responseData = {};
        
        if (activeTab === 'products') {
          items = result.products || [];
        } else if (activeTab === 'collections') {
          items = result.collections || [];
        } else if (activeTab === 'templates') {
          items = result.templates || [];
        } else if (activeTab === 'blogs') {
          items = result.blogs || [];
        }
        
        setData(items);
        setCategories(result.categories || []);
        setTotalPages(result.pagination?.pages || 1);
      } else {
        console.error(`Error fetching ${activeTab}:`, result.error);
      }
    } catch (error) {
      console.error(`Error fetching ${activeTab}:`, error);
    } finally {
      setLoading(false);
    }
  }, [activeTab, selectedCategory, currentPage, sortBy, debouncedSearchQuery]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setCurrentPage(1);
    const params = new URLSearchParams(searchParams);
    params.set('tab', tabId);
    params.delete('page');
    router.push(`/community?${params.toString()}`);
  };

  const handleSearch = useCallback(() => {
    setCurrentPage(1);
    // Trigger fetchData with reset page
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleProductClick = (product) => {
    // Track view
    fetch(`/api/products/${product._id}/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source: 'community' })
    }).catch(console.error);

    // Open in new tab
    window.open(product.url, '_blank', 'noopener,noreferrer');
  };

  const handleAddToCollection = (product) => {
    setAddToCollectionModal({ open: true, product });
  };

  const handleItemClick = (item) => {
    // Handle clicks for non-product items
    if (activeTab === 'collections') {
      router.push(`/collections/${item._id}`);
    } else if (activeTab === 'templates') {
      router.push(`/tools/${item._id}`);
    } else if (activeTab === 'blogs') {
      window.open(item.url || `/blog/${item._id}`, '_blank', 'noopener,noreferrer');
    }
  };

  const handleReport = (product, e) => {
    e.stopPropagation();
    setReportModal({ open: true, product });
  };

  const handleCategoryFilter = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const shouldShowImage = (faviconUrl) => {
    if (!faviconUrl) return false;
    const status = imageStatuses[faviconUrl];
    return status !== 'error';
  };

  // Preload and validate favicon URLs
  const preloadFavicon = useCallback((faviconUrl) => {
    if (!faviconUrl || imageStatuses[faviconUrl]) return;
    
    setImageStatuses(prev => ({
      ...prev,
      [faviconUrl]: 'loading'
    }));

    const img = new Image();
    img.onload = () => {
      setImageStatuses(prev => ({
        ...prev,
        [faviconUrl]: 'loaded'
      }));
    };
    img.onerror = () => {
      setImageStatuses(prev => ({
        ...prev,
        [faviconUrl]: 'error'
      }));
    };
    img.src = faviconUrl;
  }, [imageStatuses]);

  // Preload favicons when data is loaded
  useEffect(() => {
    data.forEach(item => {
      if (item.faviconUrl) {
        preloadFavicon(item.faviconUrl);
      }
    });
  }, [data, preloadFavicon]);

  const sortOptions = [
    { value: 'newest', label: 'Newest' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'rating', label: 'Highest Rated' },
  ];

  return (
    <div className="min-h-screen bg-theme-background">
      <Header title="Community" />
      
      <div className="container mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <GlobeAltIcon className="w-8 h-8 text-theme-primary mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-theme-foreground">Community</h1>
              <p className="text-theme-text-secondary mt-1">
                Discover content shared by the developer community
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-theme-border">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`
                      whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2
                      ${activeTab === tab.id
                        ? 'border-theme-primary text-theme-primary'
                        : 'border-transparent text-theme-text-secondary hover:text-theme-foreground hover:border-theme-border'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-theme-surface rounded-lg shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-theme-text-secondary" />
                <Input
                  type="text"
                  placeholder={`Search community ${activeTab}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
            </div>

            {/* Sort and Filter Controls */}
            <div className="flex items-center space-x-4">
              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="px-3 py-2 border border-theme-border rounded-lg bg-theme-background text-theme-foreground focus:outline-none focus:ring-2 focus:ring-theme-primary"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <Button 
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('');
                  setCurrentPage(1);
                }} 
                variant="outline" 
                size="sm"
              >
                Clear Filters
              </Button>
            </div>
          </div>

          {/* Category Filter */}
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === '' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => handleCategoryFilter('')}
            >
              All Categories
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'primary' : 'outline'}
                size="sm"
                onClick={() => handleCategoryFilter(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Content Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-theme-border rounded-lg"></div>
              </Card>
            ))}
          </div>
        ) : data.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {data.map((item) => (
                <Card
                  key={item._id}
                  className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
                  onClick={() => activeTab === 'products' ? handleProductClick(item) : handleItemClick(item)}
                >
                  <div className="p-4">
                    {activeTab === 'products' && (
                      <>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            {imageStatuses[item.faviconUrl] === 'loaded' && (
                              <Image
                                src={item.faviconUrl}
                                alt={`${item.title} favicon`}
                                width={24}
                                height={24}
                                className="w-6 h-6 rounded flex-shrink-0"
                                loading="lazy"
                              />
                            )}
                            <div className="min-w-0 flex-1">
                              <h3 className="font-semibold text-theme-foreground truncate">
                                {item.title}
                              </h3>
                              <p className="text-xs text-theme-text-secondary truncate">
                                {new URL(item.url).hostname}
                              </p>
                            </div>
                          </div>
                          
                          <button
                            onClick={(e) => handleReport(item, e)}
                            className="text-theme-text-secondary hover:text-red-500 transition-colors p-1"
                            title="Report this tool"
                          >
                            <ExclamationTriangleIcon className="w-4 h-4" />
                          </button>
                        </div>

                        <p className="text-sm text-theme-text-secondary mb-3 line-clamp-2">
                          {item.description || 'No description available'}
                        </p>

                        <div className="flex items-center justify-between mb-3">
                          <span className="inline-block px-2 py-1 text-xs font-medium bg-theme-primary/10 text-theme-primary rounded-full">
                            {item.category}
                          </span>
                          
                          <div className="flex items-center space-x-2 text-xs text-theme-text-secondary">
                            <EyeIcon className="w-3 h-3" />
                            <span>{item.publicAnalytics?.viewCount || 0}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1 text-xs text-theme-text-secondary">
                            <span>by</span>
                            <span className="font-medium">
                              {item.addedBy?.displayName || 'Anonymous'}
                            </span>
                          </div>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddToCollection(item);
                            }}
                            className="text-xs"
                          >
                            <PlusIcon className="w-3 h-3 mr-1" />
                            Add
                          </Button>
                        </div>
                      </>
                    )}

                    {activeTab === 'collections' && (
                      <>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <RectangleStackIcon className="w-6 h-6 text-theme-primary flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <h3 className="font-semibold text-theme-foreground truncate">
                                {item.title}
                              </h3>
                              <p className="text-xs text-theme-text-secondary">
                                {item.products?.length || 0} items
                              </p>
                            </div>
                          </div>
                        </div>

                        <p className="text-sm text-theme-text-secondary mb-3 line-clamp-2">
                          {item.description || 'No description available'}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1 text-xs text-theme-text-secondary">
                            <span>by</span>
                            <span className="font-medium">
                              {item.createdBy?.displayName || 'Anonymous'}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 text-xs text-theme-text-secondary">
                            <EyeIcon className="w-3 h-3" />
                            <span>{item.viewCount || 0}</span>
                          </div>
                        </div>
                      </>
                    )}

                    {activeTab === 'templates' && (
                      <>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <CodeBracketIcon className="w-6 h-6 text-theme-primary flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <h3 className="font-semibold text-theme-foreground truncate">
                                {item.title}
                              </h3>
                              <p className="text-xs text-theme-text-secondary">
                                {item.language || 'Template'}
                              </p>
                            </div>
                          </div>
                        </div>

                        <p className="text-sm text-theme-text-secondary mb-3 line-clamp-2">
                          {item.description || 'No description available'}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1 text-xs text-theme-text-secondary">
                            <span>by</span>
                            <span className="font-medium">
                              {item.createdBy?.displayName || 'Anonymous'}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 text-xs text-theme-text-secondary">
                            <StarIcon className="w-3 h-3" />
                            <span>{item.rating || 0}</span>
                          </div>
                        </div>
                      </>
                    )}

                    {activeTab === 'blogs' && (
                      <>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <NewspaperIcon className="w-6 h-6 text-theme-primary flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <h3 className="font-semibold text-theme-foreground truncate">
                                {item.title}
                              </h3>
                              <p className="text-xs text-theme-text-secondary">
                                {new Date(item.publishedAt || item.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>

                        <p className="text-sm text-theme-text-secondary mb-3 line-clamp-2">
                          {item.excerpt || item.description || 'No excerpt available'}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1 text-xs text-theme-text-secondary">
                            <span>by</span>
                            <span className="font-medium">
                              {item.author?.displayName || 'Anonymous'}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 text-xs text-theme-text-secondary">
                            <EyeIcon className="w-3 h-3" />
                            <span>{item.readCount || 0}</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2">
                <Button
                  variant="outline"
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  Previous
                </Button>
                
                <div className="flex space-x-1">
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    const page = i + 1;
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <GlobeAltIcon className="w-16 h-16 text-theme-text-secondary mx-auto mb-4" />
            <h3 className="text-lg font-medium text-theme-foreground mb-2">
              No community {activeTab} found
            </h3>
            <p className="text-theme-text-secondary">
              {searchQuery || selectedCategory
                ? 'Try adjusting your search or filters'
                : `Be the first to share ${activeTab === 'products' ? 'a tool' : activeTab === 'collections' ? 'a collection' : activeTab === 'templates' ? 'a template' : 'a blog post'} with the community!`}
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      <AddToCollectionModal
        isOpen={addToCollectionModal.open}
        onClose={() => setAddToCollectionModal({ open: false, product: null })}
        product={addToCollectionModal.product}
        onSuccess={() => setAddToCollectionModal({ open: false, product: null })}
      />

      <ReportProductModal
        isOpen={reportModal.open}
        onClose={() => setReportModal({ open: false, product: null })}
        product={reportModal.product}
        onSuccess={() => {
          setReportModal({ open: false, product: null });
          // You could show a success message here
        }}
      />
    </div>
  );
}

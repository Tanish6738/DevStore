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
  PlusIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

export default function CommunityPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState([]);
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

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        public: 'true',
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

      const response = await fetch(`/api/products/public?${params}`);
      const data = await response.json();

      if (response.ok) {
        setProducts(data.products);
        setCategories(data.categories);
        setTotalPages(data.pagination.pages);
      } else {
        console.error('Error fetching products:', data.error);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, currentPage, sortBy, debouncedSearchQuery]);

  const handleSearch = useCallback(() => {
    setCurrentPage(1);
    // Trigger fetchProducts with reset page
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

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

  // Preload favicons when products are loaded
  useEffect(() => {
    products.forEach(product => {
      if (product.faviconUrl) {
        preloadFavicon(product.faviconUrl);
      }
    });
  }, [products, preloadFavicon]);

  const sortOptions = [
    { value: 'newest', label: 'Newest' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'rating', label: 'Highest Rated' },
  ];

  return (
    <div className="min-h-screen bg-theme-background">
      <Header title="Community Tools" />
      
      <div className="container mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <GlobeAltIcon className="w-8 h-8 text-theme-primary mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-theme-foreground">Community Tools</h1>
              <p className="text-theme-text-secondary mt-1">
                Discover tools shared by the developer community
              </p>
            </div>
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
                  placeholder="Search community tools..."
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

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-theme-border rounded-lg"></div>
              </Card>
            ))}
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {products.map((product) => (
                <Card
                  key={product._id}
                  className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
                  onClick={() => handleProductClick(product)}
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        {imageStatuses[product.faviconUrl] === 'loaded' && (
                          <Image
                            src={product.faviconUrl}
                            alt={`${product.title} favicon`}
                            width={24}
                            height={24}
                            className="w-6 h-6 rounded flex-shrink-0"
                            loading="lazy"
                          />
                        )}
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-theme-foreground truncate">
                            {product.title}
                          </h3>
                          <p className="text-xs text-theme-text-secondary truncate">
                            {new URL(product.url).hostname}
                          </p>
                        </div>
                      </div>
                      
                      <button
                        onClick={(e) => handleReport(product, e)}
                        className="text-theme-text-secondary hover:text-red-500 transition-colors p-1"
                        title="Report this tool"
                      >
                        <ExclamationTriangleIcon className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-sm text-theme-text-secondary mb-3 line-clamp-2">
                      {product.description || 'No description available'}
                    </p>

                    <div className="flex items-center justify-between mb-3">
                      <span className="inline-block px-2 py-1 text-xs font-medium bg-theme-primary/10 text-theme-primary rounded-full">
                        {product.category}
                      </span>
                      
                      <div className="flex items-center space-x-2 text-xs text-theme-text-secondary">
                        <EyeIcon className="w-3 h-3" />
                        <span>{product.publicAnalytics?.viewCount || 0}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1 text-xs text-theme-text-secondary">
                        <span>by</span>
                        <span className="font-medium">
                          {product.addedBy?.displayName || 'Anonymous'}
                        </span>
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCollection(product);
                        }}
                        className="text-xs"
                      >
                        <PlusIcon className="w-3 h-3 mr-1" />
                        Add
                      </Button>
                    </div>
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
              No community tools found
            </h3>
            <p className="text-theme-text-secondary">
              {searchQuery || selectedCategory
                ? 'Try adjusting your search or filters'
                : 'Be the first to share a tool with the community!'}
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

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import { MagnifyingGlassIcon, TagIcon, FunnelIcon } from '@heroicons/react/24/outline';
import Header from '@/components/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import AddToCollectionModal from '@/components/AddToCollectionModal';
import { useDebounce } from '@/hooks/useDebounce';


export default function Explore() {
  const { user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [imageStatuses, setImageStatuses] = useState({}); // Track loading states: 'loading', 'loaded', 'error'

  const fetchProducts = useCallback(async (isSearch = false) => {
    try {
      if (isSearch) {
        setSearchLoading(true);
      } else {
        setLoading(true);
      }
      setError(''); // Reset error state
      
      // Fetch both predefined and public community products for explore page
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
        // Don't specify predefined=true to get both predefined and public products
      });

      if (selectedCategory) {
        params.append('category', selectedCategory);
      }

      if (debouncedSearchQuery.trim()) {
        params.append('search', debouncedSearchQuery.trim());
      }

      console.log('Fetching products with params:', params.toString());

      // Use the main products API
      const response = await fetch(`/api/products?${params}`);
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('API Error:', response.status, errorData);
        throw new Error(`API Error: ${response.status} - ${errorData}`);
      }
      
      const data = await response.json();
      console.log('API Response:', data);
      
      setProducts(data.products || []);
      
      // Extract categories from products only on initial load
      if (!isSearch && categories.length === 0) {
        const uniqueCategories = [...new Set(
          (data.products || []).map(product => product.category).filter(Boolean)
        )];
        setCategories(uniqueCategories);
      }
      
      setTotalPages(data.pagination?.pages || 1);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError(error.message || 'Failed to load products');
    } finally {
      setLoading(false);
      setSearchLoading(false);
    }
  }, [selectedCategory, currentPage, debouncedSearchQuery, categories.length]);

  // Separate effect for initial load
  useEffect(() => {
    fetchProducts(false);
  }, [selectedCategory, currentPage]); // Remove debouncedSearchQuery from here

  // Separate effect for search
  useEffect(() => {
    if (debouncedSearchQuery !== (searchParams.get('q') || '')) {
      setCurrentPage(1); // Reset page on search
      fetchProducts(true);
    }
  }, [debouncedSearchQuery, fetchProducts, searchParams]);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handleAddToCollection = (product) => {
    if (!user) {
      router.push('/sign-in'); // Redirect to sign-in if not authenticated
      return;
    }
    setSelectedProduct(product);
    setModalOpen(true);
  };

  const handleModalSuccess = (collectionsCount) => {
    // You can show a success message here
    console.log(`Added to ${collectionsCount} collection(s)`);
  };

  // Preload and validate favicon URLs
  const preloadFavicon = useCallback((faviconUrl) => {
    if (!faviconUrl) return;
    
    // Avoid re-processing the same URL
    if (imageStatuses[faviconUrl]) return;
    
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
  }, []); // Remove imageStatuses dependency to prevent recreation

  // Preload favicons when products are loaded
  useEffect(() => {
    products.forEach(product => {
      if (product.faviconUrl) {
        preloadFavicon(product.faviconUrl);
      }
    });
  }, [products, preloadFavicon]);

  if (error) {
    return (
      <div className="min-h-screen bg-theme-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-theme-error mb-4">{error}</p>
            <Button
              onClick={() => {
                setError('');
                fetchProducts();
              }}
              className="btn-primary"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (loading && !searchLoading) {
    return (
      <div className="min-h-screen bg-theme-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-theme-secondary rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="h-64 bg-theme-secondary rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-theme-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-theme-text mb-2">
            Explore Developer Tools
          </h1>
          <p className="text-theme-text-secondary">
            Discover curated developer tools, APIs, and resources from our community
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="p-6 mb-8 card-theme">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-theme-text-secondary" />
              {searchLoading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-theme-primary"></div>
                </div>
              )}
              <Input
                type="text"
                placeholder="Search for tools, APIs, frameworks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10 input-theme"
                disabled={searchLoading}
              />
            </div>
            
            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="px-4 py-2 border border-theme-border rounded-md bg-theme-secondary text-theme-text input-theme"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
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
                className="btn-outline-primary"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </Card>

        {/* Results */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <p className="text-theme-text-secondary">
              {searchLoading ? 'Searching...' : `${products.length} ${products.length === 1 ? 'tool' : 'tools'} found`}
            </p>
            {(searchQuery || selectedCategory) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('');
                  setCurrentPage(1);
                }}
                className="btn-outline-primary"
                disabled={searchLoading}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Products Grid */}
        {products.length === 0 && !searchLoading ? (
          <Card className="p-8 text-center card-theme">
            <MagnifyingGlassIcon className="h-16 w-16 text-theme-text-secondary mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-theme-text mb-2">No tools found</h3>
            <p className="text-theme-text-secondary mb-4">
              Try adjusting your search criteria or browse all tools
            </p>
            <Button onClick={() => {
              setSearchQuery('');
              setSelectedCategory('');
              setCurrentPage(1);
            }} className="btn-primary">
              Show All Tools
            </Button>
          </Card>
        ) : (
          <>
            {searchLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="bg-theme-surface rounded-lg p-4 shadow-lg">
                  <div className="flex items-center space-x-3">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-theme-primary"></div>
                    <span className="text-theme-text">Searching...</span>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                  {products.map((product) => (
                    <Card 
                      key={product._id} 
                      className="p-6 hover:shadow-lg transition-shadow cursor-pointer card-theme"
                      onClick={() => router.push(`/products/${product._id}`)}
                    >
                      <div className="flex items-start gap-4 mb-4">
                        {product.faviconUrl && imageStatuses[product.faviconUrl] === 'loaded' && (
                          <img
                            src={product.faviconUrl}
                            alt={`${product.title} favicon`}
                            width={48}
                            height={48}
                            className="w-12 h-12 rounded flex-shrink-0"
                            loading="lazy"
                          />
                        )}
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-theme-text line-clamp-1 mb-1">
                            {product.title}
                          </h3>
                          <p className="text-sm text-theme-text-secondary">
                            {product.category}
                          </p>
                        </div>
                      </div>
                      
                      {product.description && (
                        <p className="text-sm text-theme-text-secondary line-clamp-3 mb-4">
                          {product.description}
                        </p>
                      )}

                      {product.metadata?.tags && product.metadata.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {product.metadata.tags.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-theme-secondary text-theme-text-secondary"
                            >
                              <TagIcon className="h-3 w-3 mr-1" />
                              {tag}
                            </span>
                          ))}
                          {product.metadata.tags.length > 3 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-theme-secondary text-theme-text-secondary">
                              +{product.metadata.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(product.url, '_blank', 'noopener,noreferrer');
                          }}
                          className="btn-outline-primary"
                        >
                          Visit Site
                        </Button>
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCollection(product);
                          }}
                          className="btn-primary"
                        >
                          Add to Collection
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2">
                    <Button
                      variant="outline"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      className="btn-outline-primary"
                    >
                      Previous
                    </Button>
                    
                    <span className="flex items-center px-4 py-2 text-sm text-theme-text-secondary">
                      Page {currentPage} of {totalPages}
                    </span>
                    
                    <Button
                      variant="outline"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      className="btn-outline-primary"
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* Add to Collection Modal */}
        <AddToCollectionModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          productId={selectedProduct?._id}
          productTitle={selectedProduct?.title}
          onSuccess={handleModalSuccess}
        />
      </div>
    </div>
  );
}

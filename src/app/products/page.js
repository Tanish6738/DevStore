'use client';

import { useState, useEffect, useMemo } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ViewColumnsIcon,
  Squares2X2Icon,
  PlusIcon,
  StarIcon,
  EyeIcon,
  HeartIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  GlobeAltIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import CreateProductModal from '../../components/CreateProductModal';
import ProductRating from '../../components/ProductRating';
import MakePublicModal from '../../components/MakePublicModal';
import Header from '@/components/Header';

export default function ProductsPage() {
  const { user } = useUser();
  const router = useRouter();
  
  // State management
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('created');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState('grid');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [makePublicModal, setMakePublicModal] = useState({ open: false, product: null });
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'frontend', label: 'Frontend' },
    { value: 'backend', label: 'Backend' },
    { value: 'devops', label: 'DevOps' },
    { value: 'design', label: 'Design' },
    { value: 'testing', label: 'Testing' },
    { value: 'mobile', label: 'Mobile' },
    { value: 'database', label: 'Database' },
    { value: 'api', label: 'API' },
    { value: 'security', label: 'Security' },
    { value: 'productivity', label: 'Productivity' },
    { value: 'analytics', label: 'Analytics' },
    { value: 'other', label: 'Other' }
  ];

  const sortOptions = [
    { value: 'created', label: 'Date Added' },
    { value: 'title', label: 'Name' },
    { value: 'category', label: 'Category' },
    { value: 'popularity', label: 'Popularity' }
  ];

  useEffect(() => {
    fetchProducts();
  }, [searchQuery, selectedCategory, sortBy, sortOrder, page]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        userProducts: 'true', // Show user's own products
        ...(searchQuery && { search: searchQuery }),
        ...(selectedCategory !== 'all' && { category: selectedCategory }),
        sortBy,
        sortOrder
      });

      const response = await fetch(`/api/products?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch products');
      }

      if (page === 1) {
        setProducts(data.products);
      } else {
        setProducts(prev => [...prev, ...data.products]);
      }

      setHasMore(data.pagination.page < data.pagination.pages);
      setTotalProducts(data.pagination.total);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearchQuery(value);
    setPage(1);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setPage(1);
  };

  const handleSortChange = (newSortBy) => {
    if (newSortBy === sortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
    setPage(1);
  };

  const handleCreateProduct = (newProduct) => {
    setProducts(prev => [newProduct, ...prev]);
    setTotalProducts(prev => prev + 1);
  };

  const handleMakePublic = (product) => {
    setMakePublicModal({ open: true, product });
  };

  const handleMakePublicSuccess = (updatedProduct) => {
    setProducts(prev => 
      prev.map(p => p._id === updatedProduct._id ? updatedProduct : p)
    );
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      setPage(prev => prev + 1);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = !searchQuery || 
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen bg-theme-background">
      <Header title="Products" />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-theme-text">Products</h1>
            <p className="text-theme-text-secondary mt-1">
              Discover and explore {totalProducts} developer tools and products
            </p>
          </div>
          
          {user && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 btn-primary px-2 py-1 rounded-md "
            >
              <PlusIcon className="h-5 w-5" />
              <span>Add Product</span>
            </button>
          )}
        </div>

        {/* Filters and Search */}
        <div className="card-theme p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-theme-text-secondary h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="input-theme w-full pl-10 pr-4 py-2"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="sm:w-48">
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="input-theme w-full px-3 py-2"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Options */}
            <div className="flex items-center space-x-2">
              <FunnelIcon className="h-5 w-5 text-theme-text-secondary" />
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="input-theme px-3 py-2"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-2 border border-theme-border rounded-lg hover:bg-theme-secondary transition-colors"
              >
                {sortOrder === 'asc' ? <ArrowUpIcon className="h-4 w-4" /> : <ArrowDownIcon className="h-4 w-4" />}
              </button>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center border border-theme-border rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 transition-colors ${
                  viewMode === 'grid' ? 'bg-theme-primary text-white' : 'bg-theme-background text-theme-text hover:bg-theme-secondary'
                }`}
              >
                <Squares2X2Icon className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 transition-colors ${
                  viewMode === 'list' ? 'bg-theme-primary text-white' : 'bg-theme-background text-theme-text hover:bg-theme-secondary'
                }`}
              >
                <ViewColumnsIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-theme-text-secondary">
            Showing {filteredProducts.length} of {totalProducts} products
          </p>
        </div>

        {/* Products Grid/List */}
        {loading && page === 1 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="card-theme p-6 animate-pulse">
                <div className="h-8 bg-theme-secondary rounded mb-4"></div>
                <div className="h-4 bg-theme-secondary rounded mb-2"></div>
                <div className="h-4 bg-theme-secondary rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-theme-error mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              Try Again
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-theme-text-secondary mb-4">No products found</p>
            {user && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary px-2 py-1 rounded-md cursor-pointer"
              >
                Add the first product
              </button>
            )}
          </div>
        ) : (
          <>
            <div className={
              viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "space-y-4"
            }>
              {filteredProducts.map((product) => (
                <ProductCard 
                  key={product._id} 
                  product={product} 
                  viewMode={viewMode}
                  user={user}
                  onClick={() => router.push(`/products/${product._id}`)}
                  onMakePublic={handleMakePublic}
                />
              ))}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="text-center mt-8">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="btn-primary disabled:opacity-50"
                >
                  {loading ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </>
        )}

        {/* Create Product Modal */}
        <CreateProductModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateProduct}
        />

        {/* Make Public Modal */}
        <MakePublicModal
          isOpen={makePublicModal.open}
          onClose={() => setMakePublicModal({ open: false, product: null })}
          product={makePublicModal.product}
          onSuccess={handleMakePublicSuccess}
        />
      </div>
    </div>
  );
}

// Product Card Component
function ProductCard({ product, viewMode, user, onClick, onMakePublic }) {
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    // Fetch basic analytics for the product
    const fetchAnalytics = async () => {
      try {
        const response = await fetch(`/api/products/${product._id}?analytics=true`);
        if (response.ok) {
          const data = await response.json();
          setAnalytics(data.analytics);
        }
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
      }
    };

    fetchAnalytics();
  }, [product._id]);

  if (viewMode === 'list') {
    return (
      <div 
        className="bg-theme-surface rounded-lg shadow-sm border border-theme-border p-6 hover:shadow-md transition-shadow cursor-pointer"
        onClick={onClick}
      >
        <div className="flex items-center space-x-4">
          {product.faviconUrl && (
            <Image
              src={product.faviconUrl}
              alt={`${product.title} favicon`}
              width={32}
              height={32}
              className="w-8 h-8 rounded flex-shrink-0"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          )}
          
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-theme-foreground truncate">
              {product.title}
            </h3>
            {product.description && (
              <p className="text-theme-muted text-sm mt-1 line-clamp-2">
                {product.description}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-4 flex-shrink-0">
            {/* Public/Private Status */}
            <div className="flex items-center space-x-2">
              {product.isPublic ? (
                <div className="flex items-center space-x-1 text-theme-success">
                  <GlobeAltIcon className="w-4 h-4" />
                  <span className="text-xs">Public</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1 text-theme-text-secondary">
                  <LockClosedIcon className="w-4 h-4" />
                  <span className="text-xs">Private</span>
                </div>
              )}
            </div>

            <ProductRating product={product} user={user} compact />
            
            {analytics && (
              <div className="flex items-center space-x-4 text-sm text-theme-text-secondary">
                <div className="flex items-center space-x-1">
                  <EyeIcon className="h-4 w-4" />
                  <span>{analytics.totalAccess || 0}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <HeartIcon className="h-4 w-4" />
                  <span>{analytics.favoriteCount || 0}</span>
                </div>
              </div>
            )}

            {product.category && (
              <span className="px-2 py-1 bg-theme-secondary text-theme-text-secondary text-xs rounded-full">
                {product.category}
              </span>
            )}

            {/* Make Public Button */}
            {!product.isPredefined && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMakePublic(product);
                }}
                className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                  product.isPublic 
                    ? 'bg-theme-warning text-white hover:opacity-80' 
                    : 'bg-theme-primary text-white hover:opacity-80'
                }`}
                title={product.isPublic ? 'Make Private' : 'Make Public'}
              >
                {product.isPublic ? 'Make Private' : 'Make Public'}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="bg-theme-surface rounded-lg shadow-sm border border-theme-border p-6 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start space-x-3 mb-4">
        {product.faviconUrl && (
          <Image
            src={product.faviconUrl}
            alt={`${product.title} favicon`}
            width={32}
            height={32}
            className="w-8 h-8 rounded flex-shrink-0"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        )}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <h3 className="text-lg font-semibold text-theme-text line-clamp-2 flex-1">
              {product.title}
            </h3>
            
            {/* Public/Private Status */}
            <div className="ml-2 flex-shrink-0">
              {product.isPublic ? (
                <div className="flex items-center space-x-1 text-theme-success">
                  <GlobeAltIcon className="w-4 h-4" />
                  <span className="text-xs">Public</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1 text-theme-text-secondary">
                  <LockClosedIcon className="w-4 h-4" />
                  <span className="text-xs">Private</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {product.description && (
        <p className="text-theme-muted text-sm mb-4 line-clamp-3">
          {product.description}
        </p>
      )}

      <div className="space-y-3">
        <ProductRating product={product} user={user} compact />
        
        {analytics && (
          <div className="flex items-center justify-between text-sm text-theme-muted">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <EyeIcon className="h-4 w-4" />
                <span>{analytics.totalAccess || 0}</span>
              </div>
              <div className="flex items-center space-x-1">
                <HeartIcon className="h-4 w-4" />
                <span>{analytics.favoriteCount || 0}</span>
              </div>
            </div>
            
            {product.category && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                {product.category}
              </span>
            )}
          </div>
        )}
        
        {/* Make Public Button - only show for non-predefined products */}
        {!product.isPredefined && (
          <div className="mt-3 pt-3 border-t border-theme-border">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMakePublic(product);
              }}
              className={`w-full px-3 py-2 text-sm rounded-lg transition-colors ${
                product.isPublic 
                  ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' 
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
            >
              {product.isPublic ? (
                <>
                  <LockClosedIcon className="w-4 h-4 inline mr-2" />
                  Make Private
                </>
              ) : (
                <>
                  <GlobeAltIcon className="w-4 h-4 inline mr-2" />
                  Make Public
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

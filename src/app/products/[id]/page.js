'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import Image from 'next/image';
import { 
  LinkIcon, 
  TagIcon, 
  CalendarIcon, 
  UserIcon,
  HeartIcon,
  ShareIcon,
  ArrowLeftIcon,
  ChartBarIcon,
  EyeIcon,
  UsersIcon,
  StarIcon,
  ArrowTopRightOnSquareIcon as ExternalLinkIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

// Import new components
import EditProductModal from '../../../components/EditProductModal';
import DeleteProductModal from '../../../components/DeleteProductModal';
import CreateProductModal from '../../../components/CreateProductModal';
import ProductAnalyticsModal from '../../../components/ProductAnalyticsModal';
import ProductRating from '../../../components/ProductRating';
import ProductFavorite from '../../../components/ProductFavorite';
import AddToCollectionModal from '../../../components/AddToCollectionModal';

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useUser();
  const [product, setProduct] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [publicCollections, setPublicCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  
  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [showAddToCollectionModal, setShowAddToCollectionModal] = useState(false);

  const fetchDetailedAnalytics = useCallback(async () => {
    try {
      const response = await fetch(`/api/products/${id}/analytics`);
      const data = await response.json();

      if (response.ok) {
        setAnalytics(data.statistics);
        setPublicCollections(data.publicCollections || []);
      }
    } catch (err) {
      console.error('Failed to load analytics:', err);
    }
  }, [id]);

  const fetchProduct = useCallback(async () => {
    try {
      // Fetch basic product details
      const response = await fetch(`/api/products/${id}?analytics=true`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to fetch product');
        return;
      }

      setProduct(data);
      
      // Fetch detailed analytics if available
      if (data.analytics) {
        setShowAnalytics(true);
        fetchDetailedAnalytics();
      }
      
    } catch (err) {
      setError('Failed to load product details');
    } finally {
      setLoading(false);
    }
  }, [id, fetchDetailedAnalytics]);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id, fetchProduct]);

  const handleProductAccess = async () => {
    try {
      await fetch(`/api/products/${id}/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ source: 'product_page' })
      });
      
      // Open product in new tab
      window.open(product.url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      console.error('Failed to track access:', err);
      // Still open the link even if tracking fails
      window.open(product.url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled sharing
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      // You could show a toast notification here
    }
  };

  // New handler functions
  const handleEditProduct = (updatedProduct) => {
    setProduct(updatedProduct);
  };

  const handleDeleteProduct = (deletedId) => {
    router.push('/dashboard');
  };

  const handleCreateProduct = (newProduct) => {
    router.push(`/products/${newProduct._id}`);
  };

  const handleFavoriteChange = (newFavoriteStatus) => {
    setIsFavorite(newFavoriteStatus);
  };

  const handleAddToCollection = () => {
    setShowAddToCollectionModal(true);
  };

  const handleAddToCollectionSuccess = (collectionsCount) => {
    // You can add a success message or notification here
    console.log(`Product added to ${collectionsCount} collection(s)`);
    setShowAddToCollectionModal(false);
  };

  const canEditProduct = user && product && (
    product.addedBy?._id === user.id || 
    product.addedBy?.clerkId === user.id
  );

  const handleOpenEditModal = () => {
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
  };

  const handleOpenDeleteModal = () => {
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
  };

  const handleOpenCreateModal = () => {
    setShowCreateModal(true);
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
  };

  const handleOpenAnalyticsModal = () => {
    setShowAnalyticsModal(true);
  };

  const handleCloseAnalyticsModal = () => {
    setShowAnalyticsModal(false);
  };

  const handleFavoriteToggle = async () => {
    try {
      const response = await fetch(`/api/products/${id}/favorite`, {
        method: isFavorite ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to update favorite status');
      }
      
      setIsFavorite(!isFavorite);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-theme-background">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-gray-300 rounded mb-6"></div>
            <div className="space-y-4">
              <div className="h-6 bg-gray-300 rounded w-3/4"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              <div className="h-4 bg-gray-300 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-theme-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-theme-foreground mb-4">
              Product Not Found
            </h1>
            <p className="text-theme-muted mb-6">{error}</p>
            <button
              onClick={() => router.back()}
              className="bg-theme-primary text-white px-6 py-2 rounded-lg hover:bg-theme-primary/90 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div className="min-h-screen bg-theme-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header with back button */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center space-x-2 text-theme-muted hover:text-theme-foreground transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span>Back</span>
          </button>
          
          <div className="flex items-center space-x-3">
            {/* Add Product Button */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <PlusIcon className="w-4 h-4" />
              <span>Add Product</span>
            </button>

            {/* Analytics Button */}
            {showAnalytics && (
              <button
                onClick={() => setShowAnalyticsModal(true)}
                className="flex items-center space-x-2 px-3 py-2 border border-theme-border rounded-lg hover:bg-theme-surface transition-colors"
              >
                <ChartBarIcon className="w-4 h-4" />
                <span>Analytics</span>
              </button>
            )}

            {/* Edit Button - Only for product owner */}
            {canEditProduct && (
              <button
                onClick={() => setShowEditModal(true)}
                className="flex items-center space-x-2 px-3 py-2 border border-theme-border rounded-lg hover:bg-theme-surface transition-colors"
              >
                <PencilIcon className="w-4 h-4" />
                <span>Edit</span>
              </button>
            )}

            {/* Delete Button - Only for product owner */}
            {canEditProduct && !product.isPredefined && (
              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center space-x-2 px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              >
                <TrashIcon className="w-4 h-4" />
                <span>Delete</span>
              </button>
            )}
            
            <button
              onClick={handleShare}
              className="flex items-center space-x-2 px-3 py-2 border border-theme-border rounded-lg hover:bg-theme-surface transition-colors"
            >
              <ShareIcon className="w-4 h-4" />
              <span>Share</span>
            </button>
            
            {user && (
              <button
                onClick={handleAddToCollection}
                className="bg-theme-primary text-white px-4 py-2 rounded-lg hover:bg-theme-primary/90 transition-colors"
              >
                Add to Collection
              </button>
            )}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Product Details */}
          <div className="lg:col-span-2">
            <div className="bg-theme-surface rounded-lg shadow-lg overflow-hidden">
              {/* Product header */}
              <div className="p-6 border-b border-theme-border">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      {product.faviconUrl && (
                        <Image
                          src={product.faviconUrl}
                          alt={`${product.title} favicon`}
                          width={32}
                          height={32}
                          className="w-8 h-8 rounded"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      )}
                      <h1 className="text-3xl font-bold text-theme-foreground">
                        {product.title}
                      </h1>
                    </div>
                    
                    {product.description && (
                      <p className="text-theme-muted text-lg mb-4">
                        {product.description}
                      </p>
                    )}

                    {/* Product URL */}
                    <div className="mb-4">
                      <button
                        onClick={handleProductAccess}
                        className="inline-flex items-center space-x-2 text-theme-primary hover:text-theme-primary/80 hover:underline transition-colors"
                      >
                        <LinkIcon className="w-4 h-4" />
                        <span>{product.url}</span>
                        <ExternalLinkIcon className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Metadata */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-theme-muted mb-4">
                      {product.addedBy && (
                        <div className="flex items-center space-x-2">
                          <UserIcon className="w-4 h-4" />
                          <span>Added by {product.addedBy.displayName || 'Anonymous'}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-2">
                        <CalendarIcon className="w-4 h-4" />
                        <span>Added {new Date(product.createdAt).toLocaleDateString()}</span>
                      </div>

                      {product.category && (
                        <div className="flex items-center space-x-2">
                          <TagIcon className="w-4 h-4" />
                          <span>{product.category}</span>
                        </div>
                      )}
                    </div>

                    {/* Rating and Favorite */}
                    <div className="flex items-center space-x-6">
                      <ProductRating product={product} user={user} />
                      <ProductFavorite 
                        product={product} 
                        user={user} 
                        onFavoriteChange={handleFavoriteChange} 
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Product detailed info */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left column */}
                  <div className="space-y-6">
                    {/* Categories */}
                    {product.categories && product.categories.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-theme-foreground mb-2">
                          Categories
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {product.categories.map((category, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center space-x-1 px-3 py-1 bg-theme-primary/10 text-theme-primary rounded-full text-sm"
                            >
                              <TagIcon className="w-3 h-3" />
                              <span>{category}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tags */}
                    {product.tags && product.tags.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-theme-foreground mb-2">
                          Tags
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {product.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-theme-muted/10 text-theme-muted rounded text-sm"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right column */}
                  <div className="space-y-6">
                    {/* Pricing */}
                    {product.pricing && (
                      <div>
                        <h3 className="text-lg font-semibold text-theme-foreground mb-2">
                          Pricing
                        </h3>
                        <div className="space-y-2">
                          <p className="text-theme-muted">
                            <span className="font-medium">Type:</span> {product.pricing.type}
                          </p>
                          {product.pricing.price && (
                            <p className="text-theme-muted">
                              <span className="font-medium">Price:</span> {product.pricing.price}
                            </p>
                          )}
                          {product.pricing.details && (
                            <p className="text-theme-muted text-sm">
                              {product.pricing.details}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Features */}
                    {product.features && product.features.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-theme-foreground mb-2">
                          Key Features
                        </h3>
                        <ul className="space-y-1">
                          {product.features.map((feature, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <span className="text-theme-primary mt-1">•</span>
                              <span className="text-theme-muted">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional details */}
                {(product.useCases || product.integrations) && (
                  <div className="mt-6 pt-6 border-t border-theme-border">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Use cases */}
                      {product.useCases && product.useCases.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-theme-foreground mb-2">
                            Use Cases
                          </h3>
                          <ul className="space-y-1">
                            {product.useCases.map((useCase, index) => (
                              <li key={index} className="flex items-start space-x-2">
                                <span className="text-theme-primary mt-1">•</span>
                                <span className="text-theme-muted">{useCase}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Integrations */}
                      {product.integrations && product.integrations.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-theme-foreground mb-2">
                            Integrations
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {product.integrations.map((integration, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm"
                              >
                                {integration}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Analytics & Community */}
          <div className="space-y-6">
            {/* Analytics Card */}
            {showAnalytics && analytics && (
              <div className="bg-theme-surface rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold text-theme-foreground mb-4 flex items-center space-x-2">
                  <ChartBarIcon className="w-5 h-5" />
                  <span>Usage Analytics</span>
                </h2>
                
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-theme-muted">Total Usage</span>
                    <span className="font-medium text-theme-foreground">{analytics.totalUsage}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-theme-muted">In Public Collections</span>
                    <span className="font-medium text-theme-foreground">{analytics.publicUsage}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-theme-muted">Recent (30d)</span>
                    <span className="font-medium text-theme-foreground">{analytics.recentUsage}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-theme-muted">Total Clicks</span>
                    <span className="font-medium text-theme-foreground">{analytics.totalAccess}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-theme-muted">Favorites</span>
                    <span className="font-medium text-theme-foreground">{analytics.favoriteCount}</span>
                  </div>
                </div>

                {analytics.categoryRank && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <div className="text-lg font-medium text-blue-900">
                      #{analytics.categoryRank.rank} in {product.category}
                    </div>
                    <div className="text-sm text-blue-600">
                      Out of {analytics.categoryRank.totalInCategory} products
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Public Collections */}
            {showAnalytics && publicCollections.length > 0 && (
              <div className="bg-theme-surface rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold text-theme-foreground mb-4 flex items-center space-x-2">
                  <UsersIcon className="w-5 h-5" />
                  <span>Featured In Collections</span>
                </h2>
                
                <div className="space-y-3">
                  {publicCollections.slice(0, 5).map((collection) => (
                    <div key={collection.id} className="p-3 border border-theme-border rounded-lg hover:bg-theme-background/50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-theme-foreground">{collection.name}</h4>
                          {collection.description && (
                            <p className="text-sm text-theme-muted mt-1 line-clamp-2">{collection.description}</p>
                          )}
                          <div className="flex items-center space-x-2 mt-2 text-xs text-theme-muted">
                            {collection.creator?.displayName && (
                              <span>by {collection.creator.displayName}</span>
                            )}
                            <span>•</span>
                            <span className="flex items-center space-x-1">
                              <EyeIcon className="w-3 h-3" />
                              <span>{collection.viewCount || 0} views</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {publicCollections.length > 5 && (
                  <div className="mt-4 text-center">
                    <button className="text-theme-primary hover:underline text-sm">
                      View all {publicCollections.length} collections
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Access Button */}
            <div className="bg-theme-surface rounded-lg shadow-lg p-6">
              <button
                onClick={handleProductAccess}
                className="w-full bg-theme-primary text-white py-3 px-4 rounded-lg hover:bg-theme-primary/90 transition-colors font-medium flex items-center justify-center space-x-2"
              >
                <span>Visit {product.title}</span>
                <ExternalLinkIcon className="w-4 h-4" />
              </button>
              
              {user && (
                <button
                  onClick={handleAddToCollection}
                  className="w-full mt-3 border border-theme-border text-theme-foreground py-2 px-4 rounded-lg hover:bg-theme-background transition-colors"
                >
                  Add to Collection
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Modals */}
        <EditProductModal 
          product={product}
          isOpen={showEditModal} 
          onClose={() => setShowEditModal(false)} 
          onSave={handleEditProduct}
        />

        <DeleteProductModal 
          product={product}
          isOpen={showDeleteModal} 
          onClose={() => setShowDeleteModal(false)} 
          onDelete={handleDeleteProduct}
        />

        <CreateProductModal 
          isOpen={showCreateModal} 
          onClose={() => setShowCreateModal(false)} 
          onCreate={handleCreateProduct}
        />

        <ProductAnalyticsModal 
          product={product}
          isOpen={showAnalyticsModal} 
          onClose={() => setShowAnalyticsModal(false)} 
        />

        <AddToCollectionModal
          productId={product?._id}
          productTitle={product?.title}
          isOpen={showAddToCollectionModal}
          onClose={() => setShowAddToCollectionModal(false)}
          onSuccess={handleAddToCollectionSuccess}
        />
      </div>
    </div>
  );
}

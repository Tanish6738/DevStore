'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import Image from 'next/image';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  DocumentDuplicateIcon,
  HeartIcon,
  ClockIcon,
  UserIcon,
  GlobeAltIcon,
  TagIcon,
  ChevronDownIcon,
  PlusIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { useDebounce } from '../../hooks/useDebounce';
import SuccessMessage from '../../components/SuccessMessage';
import TemplateExplorerModal from '../../components/TemplateExplorerModal';
import Header from '@/components/Header';

export default function CollectionsPage() {
  const router = useRouter();
  const { user } = useUser();
  
  // State management
  const [collections, setCollections] = useState([]);
  const [featuredCollections, setFeaturedCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState(new Set());
  const [forking, setForking] = useState(null);
  const [selectedFeaturedType, setSelectedFeaturedType] = useState('trending');
  const [successMessage, setSuccessMessage] = useState({ show: false, title: '', message: '' });
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [activeTab, setActiveTab] = useState('public'); // 'public' | 'mine'
  const [myCollections, setMyCollections] = useState([]);
  const [myLoading, setMyLoading] = useState(false);
  const [myFetched, setMyFetched] = useState(false);

  // Debounced search
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Categories for filtering
  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'frontend', label: 'Frontend' },
    { value: 'backend', label: 'Backend' },
    { value: 'devops', label: 'DevOps' },
    { value: 'design', label: 'Design' },
    { value: 'ai-ml', label: 'AI/ML' },
    { value: 'mobile', label: 'Mobile' },
    { value: 'data', label: 'Data' },
    { value: 'security', label: 'Security' },
    { value: 'general', label: 'General' }
  ];

  // Sort options
  const sortOptions = [
    { value: 'createdAt', label: 'Recently Created' },
    { value: 'updatedAt', label: 'Recently Updated' },
    { value: 'name', label: 'Name A-Z' },
    { value: 'itemCount', label: 'Most Items' },
    { value: 'viewCount', label: 'Most Popular' }
  ];

  const fetchCollections = async () => {
    try {
      const response = await fetch('/api/collections/public');
      const data = await response.json();

      if (response.ok) {
        setCollections(data.collections || []);
      }
    } catch (error) {
      console.error('Error fetching collections:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeaturedCollections = useCallback(async () => {
    try {
      const response = await fetch(`/api/collections/public/featured?type=${selectedFeaturedType}&limit=6`);
      const data = await response.json();

      if (response.ok) {
        setFeaturedCollections(data.collections || []);
      }
    } catch (error) {
      console.error('Error fetching featured collections:', error);
    } finally {
      setFeaturedLoading(false);
    }
  }, [selectedFeaturedType]);

  const fetchMyCollections = useCallback(async () => {
    if (!user) return; // Guard
    setMyLoading(true);
    try {
      const response = await fetch('/api/collections');
      const data = await response.json();
      if (response.ok) {
        setMyCollections(data.collections || []);
        setMyFetched(true);
      }
    } catch (error) {
      console.error('Error fetching my collections:', error);
    } finally {
      setMyLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCollections();
    fetchFeaturedCollections();
  }, [fetchFeaturedCollections]);

  useEffect(() => {
    fetchFeaturedCollections();
  }, [selectedFeaturedType, fetchFeaturedCollections]);

  // Fetch user's collections when switching to My Collections tab (lazy load)
  useEffect(() => {
    if (activeTab === 'mine' && user && !myFetched) {
      fetchMyCollections();
    }
  }, [activeTab, user, myFetched, fetchMyCollections]);

  const handleForkCollection = async (collectionId) => {
    if (!user) {
      router.push('/sign-in');
      return;
    }

    setForking(collectionId);

    try {
      const response = await fetch(`/api/collections/${collectionId}/fork`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage({
          show: true,
          title: 'Collection Forked!',
          message: `"${data.collection.name}" has been added to your collections.`
        });
        // Don't redirect immediately, let user see the success message
        setTimeout(() => {
          router.push(`/collections/${data.collectionId}`);
        }, 2000);
      } else {
        alert(data.error || 'Failed to fork collection');
      }
    } catch (error) {
      console.error('Error forking collection:', error);
      alert('Failed to fork collection');
    } finally {
      setForking(null);
    }
  };

  const toggleFavorite = (collectionId) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(collectionId)) {
        newFavorites.delete(collectionId);
      } else {
        newFavorites.add(collectionId);
      }
      return newFavorites;
    });
  };

  const handleCreateFromTemplate = (newCollection) => {
    // Refresh collections to show the new one
    fetchCollections();
    setShowTemplateModal(false);
    setSuccessMessage({
      show: true,
      title: 'Collection Created!',
      message: `Successfully created "${newCollection.name}" from template.`
    });
  };

  const handleTabChange = (tab) => {
    if (tab === 'mine' && !user) {
      router.push('/sign-in');
      return;
    }
    setActiveTab(tab);
  };

  // Filter and sort collections
  const filteredAndSortedCollections = useMemo(() => {
    const sourceCollections = activeTab === 'public' ? collections : myCollections;
    let filtered = sourceCollections.filter(collection => {
      // Search filter
      const matchesSearch = !debouncedSearchQuery || 
        collection.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        collection.description.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        collection.owner?.displayName?.toLowerCase().includes(debouncedSearchQuery.toLowerCase());

      // Category filter
      const matchesCategory = filterCategory === 'all' || 
        collection.category === filterCategory ||
        collection.templateData?.templateCategory === filterCategory;

      return matchesSearch && matchesCategory;
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'itemCount':
          aValue = a.itemCount || 0;
          bValue = b.itemCount || 0;
          break;
        case 'viewCount':
          aValue = a.analytics?.viewCount || 0;
          bValue = b.analytics?.viewCount || 0;
          break;
        case 'updatedAt':
          aValue = new Date(a.updatedAt);
          bValue = new Date(b.updatedAt);
          break;
        case 'createdAt':
        default:
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
      }

      if (sortOrder === 'desc') {
        return bValue > aValue ? 1 : bValue < aValue ? -1 : 0;
      } else {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      }
    });

    return filtered;
  }, [activeTab, collections, myCollections, debouncedSearchQuery, filterCategory, sortBy, sortOrder]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return formatDate(dateString);
  };

  const headerTitle = activeTab === 'public' ? 'Public Collections' : 'My Collections';

  return (
    <div className="min-h-screen bg-theme-background">
      <SuccessMessage
        show={successMessage.show}
        title={successMessage.title}
        message={successMessage.message}
        onHide={() => setSuccessMessage({ show: false, title: '', message: '' })}
      />
      <Header title="Collections" />
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-theme-foreground flex items-center space-x-2">
                <GlobeAltIcon className="w-8 h-8 text-theme-primary" />
                <span>{headerTitle}</span>
              </h1>
              <p className="text-theme-muted mt-2">
                {activeTab === 'public' ? 'Discover and fork amazing developer tool collections from the community' : 'Manage and explore the collections you have created or forked'}
              </p>
            </div>
            {user && (
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowTemplateModal(true)}
                  className="bg-theme-accent text-white px-4 py-2 rounded-lg hover:bg-theme-accent/90 transition-colors flex items-center space-x-2"
                >
                  <SparklesIcon className="w-4 h-4" />
                  <span>Use Template</span>
                </button>
                <button
                  onClick={() => router.push('/create-collection')}
                  className="bg-theme-primary text-white px-4 py-2 rounded-lg hover:bg-theme-primary/90 transition-colors flex items-center space-x-2"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>Create Collection</span>
                </button>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="flex space-x-2 mt-6">
            {[
              { value: 'public', label: 'Public Collections' },
              { value: 'mine', label: 'My Collections' }
            ].map(tab => (
              <button
                key={tab.value}
                onClick={() => handleTabChange(tab.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.value ? 'bg-theme-primary text-white' : 'bg-theme-surface text-theme-muted hover:bg-theme-background'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-theme-muted" />
              <input
                type="text"
                placeholder="Search collections, descriptions, or creators..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-theme-border rounded-lg bg-theme-surface text-theme-foreground placeholder-theme-muted focus:ring-2 focus:ring-theme-primary focus:border-transparent"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 border border-theme-border rounded-lg bg-theme-surface text-theme-foreground hover:bg-theme-background transition-colors"
            >
              <FunnelIcon className="w-4 h-4" />
              <span>Filters</span>
              <ChevronDownIcon className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 p-4 bg-theme-surface rounded-lg border border-theme-border">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-theme-foreground mb-2">
                    Category
                  </label>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-theme-border rounded-lg bg-theme-background text-theme-foreground focus:ring-2 focus:ring-theme-primary focus:border-transparent"
                  >
                    {categories.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-sm font-medium text-theme-foreground mb-2">
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 border border-theme-border rounded-lg bg-theme-background text-theme-foreground focus:ring-2 focus:ring-theme-primary focus:border-transparent"
                  >
                    {sortOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort Order */}
                <div>
                  <label className="block text-sm font-medium text-theme-foreground mb-2">
                    Order
                  </label>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="w-full px-3 py-2 border border-theme-border rounded-lg bg-theme-background text-theme-foreground focus:ring-2 focus:ring-theme-primary focus:border-transparent"
                  >
                    <option value="desc">Descending</option>
                    <option value="asc">Ascending</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Featured Collections (only for public) */}
        {activeTab === 'public' && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-theme-foreground">Featured Collections</h2>
            <div className="flex space-x-2">
              {[
                { value: 'trending', label: 'Trending' },
                { value: 'popular', label: 'Popular' },
                { value: 'recent', label: 'Recent' }
              ].map((type) => (
                <button
                  key={type.value}
                  onClick={() => setSelectedFeaturedType(type.value)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    selectedFeaturedType === type.value
                      ? 'bg-theme-primary text-white'
                      : 'bg-theme-surface text-theme-muted hover:bg-theme-background'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {featuredLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-theme-surface rounded-lg p-4 animate-pulse">
                  <div className="h-4 bg-theme-background rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-theme-background rounded w-full mb-2"></div>
                  <div className="h-3 bg-theme-background rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : featuredCollections.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {featuredCollections.map((collection) => (
                <div
                  key={collection._id}
                  className="bg-theme-surface rounded-lg border border-theme-border hover:border-theme-primary/50 transition-all duration-200 p-4 cursor-pointer"
                  onClick={() => router.push(`/collections/${collection._id}`)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-medium text-theme-foreground line-clamp-1">
                      {collection.name}
                    </h3>
                    <div className="flex items-center space-x-1 text-xs text-theme-muted">
                      <EyeIcon className="w-3 h-3" />
                      <span>{collection.analytics?.viewCount || 0}</span>
                    </div>
                  </div>
                  <p className="text-sm text-theme-muted line-clamp-2 mb-3">
                    {collection.description || 'No description available'}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {collection.owner?.avatarUrl ? (
                        <Image
                          src={collection.owner.avatarUrl}
                          alt={collection.owner.displayName}
                          width={20}
                          height={20}
                          className="w-5 h-5 rounded-full"
                        />
                      ) : (
                        <div className="w-5 h-5 bg-theme-primary rounded-full flex items-center justify-center">
                          <UserIcon className="w-3 h-3 text-white" />
                        </div>
                      )}
                      <span className="text-xs text-theme-muted">
                        {collection.owner?.displayName || 'Anonymous'}
                      </span>
                    </div>
                    <span className="text-xs text-theme-muted">
                      {collection.itemCount || 0} items
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-theme-muted">No featured collections available</p>
            </div>
          )}
  </div>
  )}

        {/* All Collections Section */}
        <div className="border-t border-theme-border pt-8">
          <h2 className="text-2xl font-bold text-theme-foreground mb-6">{activeTab === 'public' ? 'All Public Collections' : 'All My Collections'}</h2>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-theme-muted">
            {activeTab === 'public' ? (
              <>Showing {filteredAndSortedCollections.length} of {collections.length} collections</>
            ) : myLoading ? (
              'Loading your collections...'
            ) : (
              <>Showing {filteredAndSortedCollections.length} of {myCollections.length} collections</>
            )}
          </p>
        </div>

        {/* Collections Grid */}
        {(activeTab === 'public' && loading) || (activeTab === 'mine' && myLoading) ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-theme-surface rounded-lg p-6 space-y-4">
                <div className="h-4 bg-theme-background rounded w-3/4"></div>
                <div className="h-3 bg-theme-background rounded w-full"></div>
                <div className="h-3 bg-theme-background rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : filteredAndSortedCollections.length === 0 ? (
          <div className="text-center py-12">
            <SparklesIcon className="w-16 h-16 text-theme-muted mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-theme-foreground mb-2">
              No collections found
            </h3>
            <p className="text-theme-muted mb-6">
              Try adjusting your search or filters to find what you&apos;re looking for.
            </p>
            {user && (
              <button
                onClick={() => router.push('/create-collection')}
                className="bg-theme-primary text-white px-6 py-3 rounded-lg hover:bg-theme-primary/90 transition-colors"
              >
                Create the First Collection
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedCollections.map((collection) => (
              <div
                key={collection._id}
                className="bg-theme-surface rounded-lg border border-theme-border hover:border-theme-primary/50 transition-all duration-200 group overflow-hidden"
              >
                {/* Collection Header */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-theme-foreground group-hover:text-theme-primary transition-colors line-clamp-2">
                        {collection.name}
                      </h3>
                      {collection.description && (
                        <p className="text-theme-muted text-sm mt-1 line-clamp-2">
                          {collection.description}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => toggleFavorite(collection._id)}
                      className="ml-2 p-1 hover:bg-theme-background rounded transition-colors"
                    >
                      {favorites.has(collection._id) ? (
                        <HeartIconSolid className="w-5 h-5 text-red-500" />
                      ) : (
                        <HeartIcon className="w-5 h-5 text-theme-muted hover:text-red-500" />
                      )}
                    </button>
                  </div>

                  {/* Collection Stats */}
                  <div className="flex items-center space-x-4 text-sm text-theme-muted mb-4">
                    <div className="flex items-center space-x-1">
                      <TagIcon className="w-4 h-4" />
                      <span>{collection.itemCount || 0} items</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <EyeIcon className="w-4 h-4" />
                      <span>{collection.analytics?.viewCount || 0} views</span>
                    </div>
                  </div>

                  {/* Creator Info */}
                  <div className="flex items-center space-x-2 mb-4">
                    {collection.owner?.avatarUrl ? (
                      <Image
                        src={collection.owner.avatarUrl}
                        alt={collection.owner.displayName}
                        width={24}
                        height={24}
                        className="w-6 h-6 rounded-full"
                      />
                    ) : (
                      <div className="w-6 h-6 bg-theme-primary rounded-full flex items-center justify-center">
                        <UserIcon className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <span className="text-sm text-theme-muted">
                      by {collection.owner?.displayName || 'Anonymous'}
                    </span>
                    <span className="text-sm text-theme-muted">•</span>
                    <div className="flex items-center space-x-1">
                      <ClockIcon className="w-4 h-4" />
                      <span className="text-sm text-theme-muted">
                        {getTimeAgo(collection.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Category Tag */}
                  {collection.templateData?.templateCategory && (
                    <div className="mb-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-theme-primary/10 text-theme-primary">
                        {collection.templateData.templateCategory}
                      </span>
                    </div>
                  )}
                </div>

                {/* Collection Actions */}
                <div className="px-6 py-4 bg-theme-background border-t border-theme-border">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => router.push(`/collections/${collection._id}`)}
                      className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 border border-theme-border rounded-lg hover:bg-theme-surface transition-colors"
                    >
                      <EyeIcon className="w-4 h-4" />
                      <span>View</span>
                    </button>
                    {activeTab === 'public' && (
                      <button
                        onClick={() => handleForkCollection(collection._id)}
                        disabled={forking === collection._id}
                        className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-theme-primary text-white rounded-lg hover:bg-theme-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <DocumentDuplicateIcon className="w-4 h-4" />
                        <span>{forking === collection._id ? 'Forking...' : 'Fork'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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

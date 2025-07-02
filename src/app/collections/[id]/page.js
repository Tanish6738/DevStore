'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import Image from 'next/image';
import { 
  FolderIcon, 
  PlusIcon, 
  MagnifyingGlassIcon,
  LinkIcon,
  TagIcon,
  PencilIcon,
  TrashIcon,
  ShareIcon,
  Squares2X2Icon,
  ListBulletIcon,
  FunnelIcon,
  ArrowsUpDownIcon,
  CheckIcon,
  DocumentArrowDownIcon,
  DocumentArrowUpIcon,
  DocumentDuplicateIcon,
  StarIcon,
  ChatBubbleLeftIcon,
  EllipsisVerticalIcon,
  UserGroupIcon,
  ChartBarIcon,
  Bars3Icon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import Header from '@/components/Header';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import EditCollectionModal from '@/components/EditCollectionModal';
import ShareCollectionModal from '@/components/ShareCollectionModal';
import ImportExportModal from '@/components/ImportExportModal';
import MobileDropdownMenu from '@/components/MobileDropdownMenu';
import CollaborationModal from '@/components/CollaborationModal';
import AnalyticsModal from '@/components/AnalyticsModal';
import CollectionTemplateModal from '@/components/CollectionTemplateModal';
import SaveAsTemplateModal from '@/components/SaveAsTemplateModal';
import DragDropContainer, { SortableItem } from '@/components/DragDropContainer';
import ErrorBoundary from '@/components/ErrorBoundary';
import { useDebounce } from '@/hooks/useDebounce';
import { useLazyImage } from '@/hooks/useLazyLoading';

export default function CollectionDetailPage() {
  return (
    <ErrorBoundary>
      <CollectionDetailPageContent />
    </ErrorBoundary>
  );
}

function CollectionDetailPageContent() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const params = useParams();
  const [collection, setCollection] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  
  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showImportExportModal, setShowImportExportModal] = useState(false);
  const [showCollaborationModal, setShowCollaborationModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showSaveAsTemplateModal, setShowSaveAsTemplateModal] = useState(false);
  
  // Feature states
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('dateAdded'); // 'dateAdded', 'name', 'category'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'
  const [filterCategory, setFilterCategory] = useState('all');
  const [favoritedItems, setFavoritedItems] = useState(new Set());
  const [itemNotes, setItemNotes] = useState({});
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [categories, setCategories] = useState([]);
  const [dragEnabled, setDragEnabled] = useState(false);
  
  // Performance optimizations
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const fetchCollection = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch collection details
      const collectionResponse = await fetch(`/api/collections/${params.id}`);
      if (!collectionResponse.ok) {
        if (collectionResponse.status === 404) {
          setError('Collection not found');
          return;
        }
        throw new Error('Failed to fetch collection');
      }

      const collectionData = await collectionResponse.json();
      setCollection(collectionData);

      // Fetch collection items
      const itemsResponse = await fetch(`/api/collections/${params.id}/items`);
      if (itemsResponse.ok) {
        const itemsData = await itemsResponse.json();
        setItems(itemsData.items || []);
        
        // Extract categories for filtering
        const allCategories = [...new Set(
          itemsData.items
            .map(item => item.productId?.category)
            .filter(Boolean)
        )];
        setCategories(allCategories);
      }
    } catch (error) {
      console.error('Error fetching collection:', error);
      setError('Failed to load collection');
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/');
      return;
    }

    if (user && params.id) {
      fetchCollection();
    }
  }, [user, isLoaded, params.id, router, fetchCollection]);

  const handleRemoveItem = async (itemId) => {
    try {
      const response = await fetch(`/api/collections/${params.id}/items`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ itemId }),
      });

      if (response.ok) {
        setItems(items.filter(item => item._id !== itemId));
        setSelectedItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(itemId);
          return newSet;
        });
      }
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  // New functionality handlers
  const handleEditCollection = (updatedCollection) => {
    setCollection(updatedCollection);
  };

  const handleToggleItemSelection = (itemId) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedItems.size === filteredAndSortedItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredAndSortedItems.map(item => item._id)));
    }
  };

  const handleBulkRemove = async () => {
    try {
      const promises = Array.from(selectedItems).map(itemId =>
        fetch(`/api/collections/${params.id}/items`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ itemId }),
        })
      );

      await Promise.all(promises);
      setItems(items.filter(item => !selectedItems.has(item._id)));
      setSelectedItems(new Set());
      setShowBulkActions(false);
    } catch (error) {
      console.error('Error removing items:', error);
    }
  };

  const handleToggleFavorite = async (itemId) => {
    try {
      const response = await fetch(`/api/collections/${params.id}/items/${itemId}/favorite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setFavoritedItems(prev => {
          const newSet = new Set(prev);
          if (newSet.has(itemId)) {
            newSet.delete(itemId);
          } else {
            newSet.add(itemId);
          }
          return newSet;
        });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleAddNote = async (itemId, note) => {
    try {
      const response = await fetch(`/api/collections/${params.id}/items/${itemId}/note`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ note }),
      });

      if (response.ok) {
        setItemNotes(prev => ({
          ...prev,
          [itemId]: note
        }));
      }
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  const handleImportSuccess = (importedCount) => {
    fetchCollection(); // Refresh the collection
    alert(`Successfully imported ${importedCount} items!`);
  };

  // New functionality handlers
  const handleReorderItems = async (reorderedItems) => {
    try {
      // Update local state immediately for smooth UX
      setItems(reorderedItems);
      
      // Send update to server
      const itemIds = reorderedItems.map(item => item._id);
      await fetch(`/api/collections/${collection._id}/reorder`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ itemIds }),
      });
    } catch (error) {
      console.error('Error reordering items:', error);
      // Revert on error
      fetchCollection();
    }
  };

  const checkForDuplicates = (newUrl) => {
    return items.some(item => item.productId?.url === newUrl);
  };

  const handleSaveAsTemplate = (template) => {
    // Show success message or handle success state
    console.log('Template saved successfully:', template);
    setShowSaveAsTemplateModal(false);
  };

  // Filtering and sorting logic with performance optimizations
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = 
        item.productId?.title?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        item.productId?.description?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        item.productId?.category?.toLowerCase().includes(debouncedSearchQuery.toLowerCase());
      
      const matchesCategory = filterCategory === 'all' || item.productId?.category === filterCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [items, debouncedSearchQuery, filterCategory]);

  const filteredAndSortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.productId?.title?.toLowerCase() || '';
          bValue = b.productId?.title?.toLowerCase() || '';
          break;
        case 'category':
          aValue = a.productId?.category?.toLowerCase() || '';
          bValue = b.productId?.category?.toLowerCase() || '';
          break;
        case 'dateAdded':
        default:
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  }, [filteredItems, sortBy, sortOrder]);

  // Update bulk actions visibility
  useEffect(() => {
    setShowBulkActions(selectedItems.size > 0);
  }, [selectedItems]);

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-theme-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-theme-secondary rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-theme-secondary rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-theme-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card className="p-8 text-center card-theme">
            <FolderIcon className="h-16 w-16 text-theme-text-secondary mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-theme-text mb-2">{error}</h3>
            <p className="text-theme-text-secondary mb-4">
              The collection you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.
            </p>
            <Button onClick={() => router.push('/dashboard')} className="btn-primary">
              Back to Dashboard
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-theme-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Collection Header */}
        {collection && (
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-theme-primary/10 rounded-lg">
                  <FolderIcon className="h-8 w-8 text-theme-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-2xl sm:text-3xl font-bold text-theme-text mb-2 line-clamp-2">
                    {collection.name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm sm:text-base text-theme-text-secondary">
                    <span>{items.length} {items.length === 1 ? 'item' : 'items'}</span>
                    {collection.isPublic && (
                      <div className="flex items-center gap-1">
                        <ShareIcon className="h-4 w-4" />
                        <span>Public</span>
                      </div>
                    )}
                    <span className="hidden sm:inline">
                      Updated {new Date(collection.updatedAt).toLocaleDateString()}
                    </span>
                    <span className="sm:hidden">
                      {new Date(collection.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Desktop Actions */}
              <div className="hidden sm:flex flex-col sm:flex-row gap-2">
                <Button 
                  variant="outline" 
                  className="btn-outline-primary"
                  onClick={() => setShowEditModal(true)}
                >
                  <PencilIcon className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button 
                  variant="outline" 
                  className="btn-outline-primary"
                  onClick={() => setShowShareModal(true)}
                >
                  <ShareIcon className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <Button 
                  variant="outline" 
                  className="btn-outline-primary"
                  onClick={() => setShowCollaborationModal(true)}
                >
                  <UserGroupIcon className="h-4 w-4 mr-2" />
                  Collaborate
                </Button>
                <Button 
                  variant="outline" 
                  className="btn-outline-primary"
                  onClick={() => setShowAnalyticsModal(true)}
                >
                  <ChartBarIcon className="h-4 w-4 mr-2" />
                  Analytics
                </Button>
                <Button 
                  variant="outline" 
                  className="btn-outline-primary"
                  onClick={() => setShowImportExportModal(true)}
                >
                  <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                  Import/Export
                </Button>
                <Button 
                  variant="outline" 
                  className="btn-outline-primary"
                  onClick={() => setShowTemplateModal(true)}
                >
                  <DocumentDuplicateIcon className="h-4 w-4 mr-2" />
                  Templates
                </Button>
                <Button 
                  variant="outline" 
                  className="btn-outline-primary"
                  onClick={() => setShowSaveAsTemplateModal(true)}
                >
                  <DocumentDuplicateIcon className="h-4 w-4 mr-2" />
                  Save as Template
                </Button>
              </div>

              {/* Mobile Actions */}
              <div className="sm:hidden">
                <MobileDropdownMenu>
                  <button
                    onClick={() => {
                      setShowEditModal(true);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-theme-text hover:bg-theme-secondary/20 flex items-center gap-2"
                  >
                    <PencilIcon className="h-4 w-4" />
                    Edit Collection
                  </button>
                  <button
                    onClick={() => {
                      setShowShareModal(true);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-theme-text hover:bg-theme-secondary/20 flex items-center gap-2"
                  >
                    <ShareIcon className="h-4 w-4" />
                    Share Collection
                  </button>
                  <button
                    onClick={() => {
                      setShowCollaborationModal(true);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-theme-text hover:bg-theme-secondary/20 flex items-center gap-2"
                  >
                    <UserGroupIcon className="h-4 w-4" />
                    Collaborate
                  </button>
                  <button
                    onClick={() => {
                      setShowAnalyticsModal(true);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-theme-text hover:bg-theme-secondary/20 flex items-center gap-2"
                  >
                    <ChartBarIcon className="h-4 w-4" />
                    Analytics
                  </button>
                  <button
                    onClick={() => {
                      setShowImportExportModal(true);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-theme-text hover:bg-theme-secondary/20 flex items-center gap-2"
                  >
                    <DocumentArrowDownIcon className="h-4 w-4" />
                    Import/Export
                  </button>
                  <button
                    onClick={() => {
                      setShowTemplateModal(true);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-theme-text hover:bg-theme-secondary/20 flex items-center gap-2"
                  >
                    <DocumentDuplicateIcon className="h-4 w-4" />
                    Templates
                  </button>
                  <hr className="my-2 border-theme-border" />
                  <button
                    onClick={() => setShowSaveAsTemplateModal(true)}
                    className="w-full text-left px-4 py-2 text-sm text-theme-text hover:bg-theme-secondary/20 flex items-center gap-2"
                  >
                    <DocumentDuplicateIcon className="h-4 w-4" />
                    Save as Template
                  </button>
                  <button
                    onClick={() => setDragEnabled(!dragEnabled)}
                    className="w-full text-left px-4 py-2 text-sm text-theme-text hover:bg-theme-secondary/20 flex items-center gap-2"
                  >
                    <Bars3Icon className="h-4 w-4" />
                    {dragEnabled ? 'Disable' : 'Enable'} Reordering
                  </button>
                </MobileDropdownMenu>
              </div>
            </div>

            {collection.description && (
              <p className="text-theme-text-secondary max-w-3xl text-sm sm:text-base">
                {collection.description}
              </p>
            )}
          </div>
        )}

        {/* Search and Controls */}
        <Card className="p-6 mb-8 card-theme">
          <div className="space-y-4">
            {/* Search and Add Items */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-theme-text-secondary" />
                <Input
                  type="text"
                  placeholder="Search items in this collection..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 input-theme"
                />
              </div>
              <Button onClick={() => router.push('/explore')} className="btn-primary">
                <PlusIcon className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Add Items</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </div>

            {/* Filters and Controls */}
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              {/* View Mode and Category Filter - Mobile: Stack, Desktop: Inline */}
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                {/* View Mode */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-theme-text mr-2 sm:hidden">View:</span>
                  <Button
                    variant={viewMode === 'grid' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className={viewMode === 'grid' ? 'btn-primary' : 'btn-outline-primary'}
                  >
                    <Squares2X2Icon className="h-4 w-4" />
                    <span className="ml-1 sm:hidden">Grid</span>
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className={viewMode === 'list' ? 'btn-primary' : 'btn-outline-primary'}
                  >
                    <ListBulletIcon className="h-4 w-4" />
                    <span className="ml-1 sm:hidden">List</span>
                  </Button>
                  <Button
                    variant={dragEnabled ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setDragEnabled(!dragEnabled)}
                    className={dragEnabled ? 'btn-primary' : 'btn-outline-primary'}
                    title={dragEnabled ? 'Disable Reordering' : 'Enable Reordering'}
                  >
                    <Bars3Icon className="h-4 w-4" />
                    <span className="ml-1 hidden lg:inline">{dragEnabled ? 'Reorder On' : 'Reorder'}</span>
                  </Button>
                </div>

                {/* Category Filter */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <FunnelIcon className="h-4 w-4 text-theme-text-secondary" />
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="flex-1 sm:flex-initial px-3 py-1 text-sm border border-theme-border rounded-md bg-theme-secondary/10 text-theme-text focus:outline-none focus:ring-2 focus:ring-theme-primary"
                  >
                    <option value="all">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort Options */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <ArrowsUpDownIcon className="h-4 w-4 text-theme-text-secondary" />
                  <select
                    value={`${sortBy}-${sortOrder}`}
                    onChange={(e) => {
                      const [newSortBy, newSortOrder] = e.target.value.split('-');
                      setSortBy(newSortBy);
                      setSortOrder(newSortOrder);
                    }}
                    className="flex-1 sm:flex-initial px-3 py-1 text-sm border border-theme-border rounded-md bg-theme-secondary/10 text-theme-text focus:outline-none focus:ring-2 focus:ring-theme-primary"
                  >
                    <option value="dateAdded-desc">Newest First</option>
                    <option value="dateAdded-asc">Oldest First</option>
                    <option value="name-asc">Name A-Z</option>
                    <option value="name-desc">Name Z-A</option>
                    <option value="category-asc">Category A-Z</option>
                    <option value="category-desc">Category Z-A</option>
                  </select>
                </div>
              </div>

              {/* Bulk Actions */}
              {items.length > 0 && (
                <div className="flex items-center gap-2 w-full sm:w-auto sm:ml-auto">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleSelectAll}
                    className="btn-outline-primary flex-1 sm:flex-initial"
                  >
                    <CheckIcon className="h-4 w-4 mr-1" />
                    {selectedItems.size === filteredAndSortedItems.length ? 'Deselect All' : 'Select All'}
                  </Button>
                </div>
              )}
            </div>

            {/* Bulk Actions Bar */}
            {showBulkActions && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-theme-primary/10 rounded-lg">
                <span className="text-sm text-theme-text">
                  {selectedItems.size} item{selectedItems.size !== 1 ? 's' : ''} selected
                </span>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleBulkRemove}
                    className="btn-outline-primary text-red-600 border-red-300 hover:bg-red-50 flex-1 sm:flex-initial"
                  >
                    <TrashIcon className="h-4 w-4 mr-1" />
                    Remove Selected
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedItems(new Set())}
                    className="btn-outline-primary flex-1 sm:flex-initial"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Collection Items */}
        {filteredAndSortedItems.length === 0 ? (
          <Card className="p-8 text-center card-theme">
            <LinkIcon className="h-16 w-16 text-theme-text-secondary mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-theme-text mb-2">
              {debouncedSearchQuery ? 'No matching items' : 'No items in this collection yet'}
            </h3>
            <p className="text-theme-text-secondary mb-4">
              {debouncedSearchQuery 
                ? 'Try adjusting your search terms' 
                : 'Start by adding some developer tools to this collection'
              }
            </p>
            <Button onClick={() => router.push('/explore')} className="btn-primary">
              <PlusIcon className="h-4 w-4 mr-2" />
              Browse Tools
            </Button>
          </Card>
        ) : (
          <DragDropContainer
            items={filteredAndSortedItems}
            onReorder={handleReorderItems}
            strategy={viewMode === 'grid' ? 'grid' : 'vertical'}
            disabled={!dragEnabled}
            className={`grid gap-4 sm:gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                : 'grid-cols-1'
            }`}
          >
            {filteredAndSortedItems.map((item) => (
              <SortableItem
                key={item._id}
                id={item._id}
                disabled={!dragEnabled}
                handle={dragEnabled}
              >
                <Card 
                  className={`hover:shadow-lg transition-all duration-300 cursor-pointer card-theme group ${
                    selectedItems.has(item._id) ? 'ring-2 ring-theme-primary bg-theme-primary/5' : ''
                  } ${
                    viewMode === 'list' ? 'p-4' : 'p-4 sm:p-6'
                  }`}
                  onClick={() => !dragEnabled && router.push(`/products/${item.productId?._id}`)}
                >
                  <div className={`${viewMode === 'list' ? 'flex items-center gap-4' : ''}`}>
                    {/* Selection Checkbox and Favorite - Mobile: Always visible, Desktop: Hover */}
                    <div className="flex items-start justify-between mb-4">
                      <div 
                        className="flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={selectedItems.has(item._id)}
                          onChange={() => handleToggleItemSelection(item._id)}
                          className="w-4 h-4 text-theme-primary border-theme-border rounded focus:ring-theme-primary"
                        />
                      </div>
                      
                      {/* Favorite Button */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleFavorite(item._id);
                        }}
                        className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity btn-outline-primary"
                      >
                        {favoritedItems.has(item._id) ? (
                          <StarIconSolid className="h-4 w-4 text-yellow-500" />
                        ) : (
                          <StarIcon className="h-4 w-4" />
                        )}
                      </Button>
                    </div>

                    {/* Item Content */}
                    <div className={`${viewMode === 'list' ? 'flex-1' : ''}`}>
                    <div className="flex items-start gap-3 mb-4">
                      {item.productId?.faviconUrl && (
                        <Image
                          src={item.productId.faviconUrl}
                          alt={`${item.productId.title} favicon`}
                          width={viewMode === 'list' ? 32 : 40}
                          height={viewMode === 'list' ? 32 : 40}
                          className={`rounded flex-shrink-0 ${
                            viewMode === 'list' ? 'w-8 h-8' : 'w-8 h-8 sm:w-10 sm:h-10'
                          }`}
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <h3 className={`font-semibold text-theme-text line-clamp-2 mb-1 ${
                          viewMode === 'list' ? 'text-base' : 'text-base sm:text-lg'
                        }`}>
                          {item.productId?.title}
                        </h3>
                        <p className="text-sm text-theme-text-secondary">
                          {item.productId?.category}
                        </p>
                      </div>
                    </div>

                    {item.productId?.description && viewMode === 'grid' && (
                      <p className="text-sm text-theme-text-secondary line-clamp-2 mb-4">
                        {item.productId.description}
                      </p>
                    )}

                    {/* Tags */}
                    {item.productId?.metadata?.tags && item.productId.metadata.tags.length > 0 && (
                      <div className={`flex flex-wrap gap-1 mb-4 ${
                        viewMode === 'list' ? 'max-w-xs' : ''
                      }`}>
                        {item.productId.metadata.tags.slice(0, viewMode === 'list' ? 1 : 2).map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-theme-secondary text-theme-text-secondary"
                          >
                            <TagIcon className="h-3 w-3 mr-1" />
                            {tag}
                          </span>
                        ))}
                        {item.productId.metadata.tags.length > (viewMode === 'list' ? 1 : 2) && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-theme-secondary text-theme-text-secondary">
                            +{item.productId.metadata.tags.length - (viewMode === 'list' ? 1 : 2)}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Item Notes */}
                    {itemNotes[item._id] && (
                      <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
                        <div className="flex items-start gap-2">
                          <ChatBubbleLeftIcon className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                          <p className="text-yellow-800 text-xs line-clamp-2">{itemNotes[item._id]}</p>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className={`flex items-center justify-between gap-2 ${
                      viewMode === 'list' ? 'gap-4' : ''
                    }`}>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(item.productId?.url, '_blank', 'noopener,noreferrer');
                          }}
                          className="btn-outline-primary text-xs sm:text-sm"
                        >
                          <span className="hidden sm:inline">Visit Site</span>
                          <span className="sm:hidden">Visit</span>
                        </Button>
                        
                        {viewMode === 'grid' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              const note = prompt('Add a note:', itemNotes[item._id] || '');
                              if (note !== null) {
                                handleAddNote(item._id, note);
                              }
                            }}
                            className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity btn-outline-primary"
                          >
                            <ChatBubbleLeftIcon className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-theme-text-secondary hidden sm:inline">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                        <span className="text-xs text-theme-text-secondary sm:hidden">
                          {new Date(item.createdAt).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                        </span>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm('Remove this item from the collection?')) {
                              handleRemoveItem(item._id);
                            }
                          }}
                          className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity btn-outline-primary text-red-600 hover:bg-red-50"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                </Card>
              </SortableItem>
            ))}
          </DragDropContainer>
        )}

        {/* Modals */}
        <EditCollectionModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          collection={collection}
          onSuccess={handleEditCollection}
        />
        
        <ShareCollectionModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          collection={collection}
        />
        
        <CollaborationModal
          isOpen={showCollaborationModal}
          onClose={() => setShowCollaborationModal(false)}
          collection={collection}
          currentUserId={user?.id}
        />
        
        <AnalyticsModal
          isOpen={showAnalyticsModal}
          onClose={() => setShowAnalyticsModal(false)}
          collection={collection}
        />
        
        <ImportExportModal
          isOpen={showImportExportModal}
          onClose={() => setShowImportExportModal(false)}
          collection={collection}
          onImportSuccess={handleImportSuccess}
        />
        
        <CollectionTemplateModal
          isOpen={showTemplateModal}
          onClose={() => setShowTemplateModal(false)}
          onCreateFromTemplate={(newCollection) => {
            fetchCollection(); // Refresh collection after template is applied
            setShowTemplateModal(false);
          }}
          userId={user?.id}
        />
        
        <SaveAsTemplateModal
          isOpen={showSaveAsTemplateModal}
          onClose={() => setShowSaveAsTemplateModal(false)}
          collection={collection}
          onSaveAsTemplate={handleSaveAsTemplate}
        />
      </div>
    </div>
  );
}

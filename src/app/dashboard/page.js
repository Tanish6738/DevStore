"use client";

import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from 'next/image';
import Header from "../../components/Header";

import {
  PlusIcon,
  MagnifyingGlassIcon,
  FolderIcon,
  LinkIcon,
  TagIcon,
  DocumentDuplicateIcon,
} from "@heroicons/react/24/outline";
import {
  HeartIcon,
  ShareIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";
import UserSync from '../../components/UserSync';
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import AddToCollectionModal from "@/components/AddToCollectionModal";
import CreateProductModal from "@/components/CreateProductModal";
import TemplateExplorerModal from "@/components/TemplateExplorerModal";

export default function Dashboard() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [collections, setCollections] = useState([]);
  const [recentProducts, setRecentProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCollections: 0,
    publicCollections: 0,
  });

  useEffect(() => {
    if (isLoaded && !user) {
      router.push("/");
      return;
    }

    if (user) {
      fetchDashboardData();
    }
  }, [user, isLoaded, router]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch user's collections
      const collectionsResponse = await fetch("/api/collections/public");
      if (collectionsResponse.ok) {
        const collectionsData = await collectionsResponse.json();
        const userCollections = collectionsData.collections || [];
        setCollections(userCollections);
        
        // Update stats
        setStats(prev => ({
          ...prev,
          totalCollections: userCollections.length,
          publicCollections: userCollections.filter(c => c.isPublic).length,
        }));
      }

      // Fetch recent products (user's bookmarks)
      const productsResponse = await fetch("/api/products?limit=8");
      if (productsResponse.ok) {
        const productsData = await productsResponse.json();
        const userProducts = productsData.products || [];
        setRecentProducts(userProducts);
        
        // Update stats
        setStats(prev => ({
          ...prev,
          totalProducts: productsData.pagination?.total || userProducts.length,
        }));
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async (productData) => {
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      if (response.ok) {
        // Refresh the dashboard data to show the new product
        fetchDashboardData();
        setShowCreateModal(false);
      } else {
        console.error('Failed to create product');
      }
    } catch (error) {
      console.error('Error creating product:', error);
    }
  };

  const handleCreateFromTemplate = (newCollection) => {
    // Refresh dashboard data to show the new collection
    fetchDashboardData();
    setShowTemplateModal(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  if (!isLoaded || loading) {
    return (
      <UserSync>
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
      </UserSync>
    );
  }

  return (
    <UserSync>
      <div className="min-h-screen bg-theme-background">
        <Header />

        <div className="container mx-auto px-4 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-theme-text mb-2">
              Welcome back, {user?.firstName || "Developer"}!
            </h1>
            <p className="text-theme-text-secondary">
              Manage your developer tools and collections
            </p>
          </div>

          {/* Search Bar */}
          <Card className="p-6 mb-8 card-theme">
            <form onSubmit={handleSearch} className="flex gap-4">
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-theme-text-secondary" />
                <Input
                  type="text"
                  placeholder="Search for developer tools, APIs, or collections..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 input-theme"
                />
              </div>
              <Button type="submit" className="btn-primary">Search</Button>
            </form>
          </Card>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="p-6 card-theme">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <LinkIcon className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-theme-text">{stats.totalProducts}</p>
                  <p className="text-sm text-theme-text-secondary">Tools Bookmarked</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 card-theme">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <FolderIcon className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-theme-text">{stats.totalCollections}</p>
                  <p className="text-sm text-theme-text-secondary">Collections Created</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 card-theme">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-500/10 rounded-lg">
                  <ShareIcon className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-theme-text">{stats.publicCollections}</p>
                  <p className="text-sm text-theme-text-secondary">Public Collections</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card
              className="p-6 hover:shadow-lg transition-shadow cursor-pointer card-theme"
              onClick={() => setShowCreateModal(true)}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-theme-primary/10 rounded-lg">
                  <PlusIcon className="h-6 w-6 text-theme-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-theme-text">Quick Add Tool</h3>
                  <p className="text-sm text-theme-text-secondary">
                    Quickly bookmark a new developer tool
                  </p>
                </div>
              </div>
            </Card>

            <Card
              className="p-6 hover:shadow-lg transition-shadow cursor-pointer card-theme"
              onClick={() => router.push("/create-collection")}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-theme-primary/10 rounded-lg">
                  <FolderIcon className="h-6 w-6 text-theme-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-theme-text">
                    New Collection
                  </h3>
                  <p className="text-sm text-theme-text-secondary">
                    Create a collection of tools
                  </p>
                </div>
              </div>
            </Card>

            <Card
              className="p-6 hover:shadow-lg transition-shadow cursor-pointer card-theme"
              onClick={() => router.push("/explore")}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-theme-accent/10 rounded-lg">
                  <LinkIcon className="h-6 w-6 text-theme-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-theme-text">
                      Explore Tools
                  </h3>
                  <p className="text-sm text-theme-text-secondary">
                    Discover curated developer tools
                  </p>
                </div>
              </div>
            </Card>

            <Card
              className="p-6 hover:shadow-lg transition-shadow cursor-pointer card-theme"
              onClick={() => router.push("/create-collection")}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-theme-primary/10 rounded-lg">
                  <PlusIcon className="h-6 w-6 text-theme-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-theme-text">
                    Create Collection
                  </h3>
                  <p className="text-sm text-theme-text-secondary">
                    Start a new collection from scratch
                  </p>
                </div>
              </div>
            </Card>

            <Card
              className="p-6 hover:shadow-lg transition-shadow cursor-pointer card-theme"
              onClick={() => setShowTemplateModal(true)}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-theme-accent/10 rounded-lg">
                  <DocumentDuplicateIcon className="h-6 w-6 text-theme-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-theme-text">
                    Use Template
                  </h3>
                  <p className="text-sm text-theme-text-secondary">
                    Create from pre-built templates
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Collections Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-theme-text">
                Your Collections
              </h2>
              <Button
                variant="outline"
                onClick={() => router.push("/create-collection")}
                className="btn-outline-primary"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                New Collection
              </Button>
            </div>

            {collections.length === 0 ? (
              <Card className="p-8 text-center card-theme">
                <FolderIcon className="h-16 w-16 text-theme-text-secondary mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-theme-text mb-2">
                  No collections yet
                </h3>
                <p className="text-theme-text-secondary mb-4">
                  Create your first collection to organize your favorite developer
                  tools
                </p>
                <Button onClick={() => router.push("/create-collection")} className="btn-primary">
                  Create Collection
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {collections.map((collection) => (
                  <Card
                    key={collection._id}
                    className="p-6 hover:shadow-lg transition-shadow cursor-pointer card-theme"
                    onClick={() => router.push(`/collections/${collection._id}`)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-theme-primary/10 rounded-lg">
                          <FolderIcon className="h-5 w-5 text-theme-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-theme-text">
                            {collection.name}
                          </h3>
                          <p className="text-sm text-theme-text-secondary">
                            {collection.itemCount}{" "}
                            {collection.itemCount === 1 ? "item" : "items"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {collection.isPublic && (
                          <ShareIcon className="h-4 w-4 text-theme-text-secondary" />
                        )}
                      </div>
                    </div>

                    {collection.description && (
                      <p className="text-sm text-theme-text-secondary mb-4 line-clamp-2">
                        {collection.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-sm text-theme-text-secondary">
                      <span>
                        Updated{" "}
                        {new Date(collection.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Recent Tools Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-theme-text">Recent Tools</h2>
              <Button variant="outline" onClick={() => router.push("/products")} className="btn-outline-primary">
                View All
              </Button>
            </div>

            {recentProducts.length === 0 ? (
              <Card className="p-8 text-center card-theme">
                <LinkIcon className="h-16 w-16 text-theme-text-secondary mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-theme-text mb-2">
                  No tools yet
                </h3>
                <p className="text-theme-text-secondary mb-4">
                  Start by adding your first developer tool or explore our curated
                  collection
                </p>
                <div className="flex gap-3 justify-center">
                  <Button onClick={() => router.push("/products")} className="btn-primary">
                    Add Tool
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push("/explore")}
                    className="btn-outline-primary"
                  >
                    Explore Tools
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {recentProducts.slice(0, 8).map((product) => (
                  <Card
                    key={product._id}
                    className="p-4 hover:shadow-lg transition-shadow cursor-pointer card-theme"
                    onClick={() => router.push(`/products/${product._id}`)}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      {product.faviconUrl && (
                        <Image
                          src={product.faviconUrl}
                          alt={`${product.title} favicon`}
                          width={32}
                          height={32}
                          className="w-8 h-8 rounded flex-shrink-0"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-theme-text text-sm line-clamp-1">
                          {product.title}
                        </h3>
                        <p className="text-xs text-theme-text-secondary line-clamp-1">
                          {product.category}
                        </p>
                      </div>
                    </div>

                    {product.description && (
                      <p className="text-sm text-theme-text-secondary line-clamp-2 mb-3">
                        {product.description}
                      </p>
                    )}

                    {product.metadata?.tags &&
                      product.metadata.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
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

                    <div className="flex items-center justify-between text-xs text-theme-text-secondary">
                      <span>
                        {new Date(product.createdAt).toLocaleDateString()}
                      </span>
                      <div className="flex items-center gap-1">
                        <HeartIcon className="h-3 w-3" />
                        <span>0</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Create Product Modal */}
        <CreateProductModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateProduct}
        />

        {/* Template Explorer Modal */}
        <TemplateExplorerModal
          isOpen={showTemplateModal}
          onClose={() => setShowTemplateModal(false)}
          onCreateFromTemplate={handleCreateFromTemplate}
        />
      </div>
    </UserSync>
  );
}

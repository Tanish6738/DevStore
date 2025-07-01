"use client";

import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "../../components/Header";

import {
  PlusIcon,
  MagnifyingGlassIcon,
  FolderIcon,
  LinkIcon,
  TagIcon,
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

export default function Dashboard() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [collections, setCollections] = useState([]);
  const [recentProducts, setRecentProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

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
      const collectionsResponse = await fetch("/api/collections");
      if (collectionsResponse.ok) {
        const collectionsData = await collectionsResponse.json();
        setCollections(collectionsData.collections || []);
      }

      // Fetch recent products (user's bookmarks)
      const productsResponse = await fetch("/api/products?limit=8");
      if (productsResponse.ok) {
        const productsData = await productsResponse.json();
        setRecentProducts(productsData.products || []);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  if (!isLoaded || loading) {
    return (
      <UserSync>
        <div className="min-h-screen bg-background">
          <Header />
          <div className="container mx-auto px-4 py-8">
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded w-1/4 mb-8"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-48 bg-muted rounded-lg"></div>
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
      <div className="min-h-screen bg-background">
        <Header />

        <div className="container mx-auto px-4 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Welcome back, {user?.firstName || "Developer"}!
            </h1>
            <p className="text-muted-foreground">
              Manage your developer tools and collections
            </p>
          </div>

          {/* Search Bar */}
          <Card className="p-6 mb-8">
            <form onSubmit={handleSearch} className="flex gap-4">
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search for developer tools, APIs, or collections..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit">Search</Button>
            </form>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card
              className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => router.push("/add-product")}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <PlusIcon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Add Tool</h3>
                  <p className="text-sm text-muted-foreground">
                    Bookmark a new developer tool
                  </p>
                </div>
              </div>
            </Card>

            <Card
              className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => router.push("/create-collection")}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-secondary/10 rounded-lg">
                  <FolderIcon className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">
                    New Collection
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Create a collection of tools
                  </p>
                </div>
              </div>
            </Card>

            <Card
              className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => router.push("/explore")}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-accent/10 rounded-lg">
                  <LinkIcon className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">
                      Explore Tools
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Discover curated developer tools
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Collections Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">
                Your Collections
              </h2>
              <Button
                variant="outline"
                onClick={() => router.push("/create-collection")}
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                New Collection
              </Button>
            </div>

            {collections.length === 0 ? (
              <Card className="p-8 text-center">
                <FolderIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No collections yet
                </h3>
                <p className="text-muted-foreground mb-4">
                  Create your first collection to organize your favorite developer
                  tools
                </p>
                <Button onClick={() => router.push("/create-collection")}>
                  Create Collection
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {collections.map((collection) => (
                  <Card
                    key={collection._id}
                    className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => router.push(`/collections/${collection._id}`)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <FolderIcon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">
                            {collection.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {collection.itemCount}{" "}
                            {collection.itemCount === 1 ? "item" : "items"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {collection.isPublic && (
                          <ShareIcon className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>

                    {collection.description && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {collection.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-sm text-muted-foreground">
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
              <h2 className="text-2xl font-bold text-foreground">Recent Tools</h2>
              <Button variant="outline" onClick={() => router.push("/explore")}>
                View All
              </Button>
            </div>

            {recentProducts.length === 0 ? (
              <Card className="p-8 text-center">
                <LinkIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No tools yet
                </h3>
                <p className="text-muted-foreground mb-4">
                  Start by adding your first developer tool or explore our curated
                  collection
                </p>
                <div className="flex gap-3 justify-center">
                  <Button onClick={() => router.push("/add-product")}>
                    Add Tool
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push("/explore")}
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
                    className="p-4 hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => router.push(`/products/${product._id}`)}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      {product.faviconUrl && (
                        <img
                          src={product.faviconUrl}
                          alt={`${product.title} favicon`}
                          className="w-8 h-8 rounded flex-shrink-0"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-foreground text-sm line-clamp-1">
                          {product.title}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {product.category}
                        </p>
                      </div>
                    </div>

                    {product.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {product.description}
                      </p>
                    )}

                    {product.metadata?.tags &&
                      product.metadata.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {product.metadata.tags.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-muted text-muted-foreground"
                            >
                              <TagIcon className="h-3 w-3 mr-1" />
                              {tag}
                            </span>
                          ))}
                          {product.metadata.tags.length > 3 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-muted text-muted-foreground">
                              +{product.metadata.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
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
      </div>
    </UserSync>
  );
}

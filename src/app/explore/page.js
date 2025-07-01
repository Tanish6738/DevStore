'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
// import Header from '../../components/Header';
// import { Card } from '../../components/ui/Card';
// import { Button } from '../../components/ui/Button';
// import { Input } from '../../components/ui/Input';
import { MagnifyingGlassIcon, TagIcon, FunnelIcon } from '@heroicons/react/24/outline';
import Header from '@/components/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';


export default function Explore() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, currentPage]);

  useEffect(() => {
    if (searchParams.get('q')) {
      handleSearch();
    }
  }, [searchParams]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        predefined: 'true',
        page: currentPage.toString(),
        limit: '12',
      });

      if (selectedCategory) {
        params.append('category', selectedCategory);
      }

      const response = await fetch(`/api/products/predefined?${params}`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
        setCategories(data.categories || []);
        setTotalPages(data.pagination?.pages || 1);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchProducts();
      return;
    }

    try {
      setLoading(true);
      const params = new URLSearchParams({
        q: searchQuery.trim(),
        page: '1',
        limit: '12',
      });

      if (selectedCategory) {
        params.append('category', selectedCategory);
      }

      const response = await fetch(`/api/search/products?${params}`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
        setCurrentPage(1);
        setTotalPages(data.pagination?.pages || 1);
      }
    } catch (error) {
      console.error('Error searching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
    
    // Update URL
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (searchQuery) params.append('q', searchQuery);
    
    router.push(`/explore?${params.toString()}`);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    handleSearch();
    
    // Update URL
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.append('q', searchQuery.trim());
    if (selectedCategory) params.append('category', selectedCategory);
    
    router.push(`/explore?${params.toString()}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="h-64 bg-muted rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Explore Developer Tools
          </h1>
          <p className="text-muted-foreground">
            Discover curated developer tools, APIs, and resources
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="p-6 mb-8">
          <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for tools, APIs, frameworks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="px-4 py-2 border border-border rounded-md bg-background text-foreground"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              
              <Button type="submit">
                <MagnifyingGlassIcon className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </form>
        </Card>

        {/* Results */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">
              {products.length} {products.length === 1 ? 'tool' : 'tools'} found
            </p>
            {(searchQuery || selectedCategory) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('');
                  setCurrentPage(1);
                  router.push('/explore');
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <Card className="p-8 text-center">
            <MagnifyingGlassIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No tools found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search criteria or browse all tools
            </p>
            <Button onClick={() => {
              setSearchQuery('');
              setSelectedCategory('');
              setCurrentPage(1);
              router.push('/explore');
            }}>
              Show All Tools
            </Button>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {products.map((product) => (
                <Card 
                  key={product._id} 
                  className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => router.push(`/products/${product._id}`)}
                >
                  <div className="flex items-start gap-4 mb-4">
                    {product.faviconUrl && (
                      <img
                        src={product.faviconUrl}
                        alt={`${product.title} favicon`}
                        className="w-12 h-12 rounded flex-shrink-0"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-foreground line-clamp-1 mb-1">
                        {product.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {product.category}
                      </p>
                    </div>
                  </div>
                  
                  {product.description && (
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                      {product.description}
                    </p>
                  )}

                  {product.metadata?.tags && product.metadata.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
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

                  <div className="flex items-center justify-between">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(product.url, '_blank', 'noopener,noreferrer');
                      }}
                    >
                      Visit Site
                    </Button>
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        // TODO: Add to collection functionality
                        console.log('Add to collection:', product._id);
                      }}
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
                >
                  Previous
                </Button>
                
                <span className="flex items-center px-4 py-2 text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                
                <Button
                  variant="outline"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

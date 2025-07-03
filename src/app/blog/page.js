'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import Image from 'next/image';
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  BookOpenIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  BookmarkIcon,
  StarIcon,
  EyeIcon,
  ClockIcon,
  TagIcon,
  UserIcon,
  FunnelIcon as FilterIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid, BookmarkIcon as BookmarkIconSolid } from '@heroicons/react/24/solid';
import Header from '../../components/Header';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';

export default function BlogPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1);
  const [totalPages, setTotalPages] = useState(1);
  const [userBlogs, setUserBlogs] = useState([]);
  const [showUserBlogs, setShowUserBlogs] = useState(false);

  const fetchPublicBlogs = useCallback(async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12'
      });
      
      if (searchQuery) params.append('search', searchQuery);
      if (selectedCategory) params.append('category', selectedCategory);
      if (sortBy) params.append('sort', sortBy);

      const response = await fetch(`/api/blogs/public?${params}`);
      const data = await response.json();

      if (response.ok) {
        setBlogs(data.blogs || []);
        setCategories(data.categories || []);
        setTotalPages(data.pagination?.totalPages || 1);
      } else {
        console.error('Error fetching blogs:', data.error);
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, selectedCategory, sortBy]);

  const fetchUserBlogs = useCallback(async () => {
    if (!user) return;

    try {
      const params = new URLSearchParams({
        page: '1',
        limit: '50'
      });

      const response = await fetch(`/api/blogs?${params}`);
      const data = await response.json();

      if (response.ok) {
        setUserBlogs(data.blogs || []);
      }
    } catch (error) {
      console.error('Error fetching user blogs:', error);
    }
  }, [user]);

  useEffect(() => {
    fetchPublicBlogs();
    if (user) {
      fetchUserBlogs();
    }
  }, [fetchPublicBlogs, fetchUserBlogs, user]);

  const handleSearch = () => {
    setCurrentPage(1);
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (selectedCategory) params.set('category', selectedCategory);
    if (sortBy !== 'newest') params.set('sort', sortBy);
    if (currentPage !== 1) params.set('page', currentPage.toString());
    
    router.push(`/blog?${params.toString()}`);
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

  const handleBlogAction = async (blogId, action) => {
    if (!user) {
      router.push('/sign-in');
      return;
    }

    try {
      const response = await fetch(`/api/blogs/${blogId}/${action}`, {
        method: 'POST'
      });

      if (response.ok) {
        // Refresh blogs to show updated interaction state
        fetchPublicBlogs();
      }
    } catch (error) {
      console.error(`Error ${action}ing blog:`, error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const sortOptions = [
    { value: 'newest', label: 'Newest' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'trending', label: 'Trending' },
  ];

  return (
    <div className="min-h-screen bg-theme-background">
      <Header title="Blog" />
      
      <div className="container mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <BookOpenIcon className="w-8 h-8 text-theme-primary mr-3" />
              <div>
                <h1 className="text-3xl font-bold text-theme-foreground">Community Blog</h1>
                <p className="text-theme-text-secondary mt-1">
                  Discover insights, tutorials, and stories from the developer community
                </p>
              </div>
            </div>
            
            {user && (
              <div className="flex items-center space-x-4">
                <Button
                  variant={showUserBlogs ? 'primary' : 'outline'}
                  onClick={() => setShowUserBlogs(!showUserBlogs)}
                  size="sm"
                >
                  <UserIcon className="w-4 h-4 mr-2" />
                  My Blogs
                </Button>
                
                <Button
                  onClick={() => router.push('/blog/create')}
                  className="bg-theme-primary hover:bg-theme-primary/90"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Write Blog
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* User Blogs Section */}
        {showUserBlogs && user && (
          <div className="bg-theme-surface rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-theme-foreground mb-4">My Blog Posts</h2>
            
            {userBlogs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userBlogs.map((blog) => (
                  <Card key={blog._id} className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-theme-foreground truncate">
                        {blog.title}
                      </h3>
                      <div className="flex items-center space-x-1 ml-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => router.push(`/blog/edit/${blog._id}`)}
                        >
                          <PencilIcon className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <p className="text-sm text-theme-text-secondary mb-2 line-clamp-2">
                      {blog.excerpt}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-theme-text-secondary">
                      <span className={`px-2 py-1 rounded-full ${
                        blog.status === 'published' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                          : blog.status === 'draft'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
                      }`}>
                        {blog.status}
                      </span>
                      <span>{formatDate(blog.createdAt)}</span>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpenIcon className="w-12 h-12 text-theme-text-secondary mx-auto mb-4" />
                <p className="text-theme-text-secondary">
                  You haven&apos;t written any blog posts yet. Start sharing your thoughts!
                </p>
              </div>
            )}
          </div>
        )}

        {/* Filters Section */}
        <div className="bg-theme-surface rounded-lg shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-theme-text-secondary" />
                <Input
                  type="text"
                  placeholder="Search blog posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10 w-full"
                />
              </div>
            </div>

            {/* Sort and Filters */}
            <div className="flex items-center space-x-4">
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

              <Button onClick={handleSearch} variant="outline" size="sm">
                <FilterIcon className="w-4 h-4 mr-2" />
                Apply Filters
              </Button>
            </div>
          </div>

          {/* Categories */}
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
                key={category._id}
                variant={selectedCategory === category.slug ? 'primary' : 'outline'}
                size="sm"
                onClick={() => handleCategoryFilter(category.slug)}
                style={{
                  backgroundColor: selectedCategory === category.slug ? category.color : undefined,
                  borderColor: category.color
                }}
              >
                {category.name} ({category.postCount})
              </Button>
            ))}
          </div>
        </div>

        {/* Blog Posts Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-theme-border rounded-t-lg"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-theme-border rounded w-3/4"></div>
                  <div className="h-3 bg-theme-border rounded w-full"></div>
                  <div className="h-3 bg-theme-border rounded w-2/3"></div>
                </div>
              </Card>
            ))}
          </div>
        ) : blogs.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {blogs.map((blog) => (
                <Card
                  key={blog._id}
                  className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 overflow-hidden"
                  onClick={() => router.push(`/blog/${blog.slug}`)}
                >
                  {/* Cover Image */}
                  {blog.coverImage && (
                    <div className="relative h-48 bg-gray-200">
                      <Image
                        src={blog.coverImage}
                        alt={blog.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                        className="object-cover"
                      />
                      {blog.isFeatured && (
                        <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                          Featured
                        </div>
                      )}
                    </div>
                  )}

                  <div className="p-4">
                    {/* Title and Meta */}
                    <div className="mb-3">
                      <h3 className="font-semibold text-theme-foreground line-clamp-2 mb-2">
                        {blog.title}
                      </h3>
                      <p className="text-sm text-theme-text-secondary line-clamp-2">
                        {blog.excerpt}
                      </p>
                    </div>

                    {/* Tags */}
                    {blog.tags && blog.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {blog.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="inline-block px-2 py-1 text-xs bg-theme-primary/10 text-theme-primary rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                        {blog.tags.length > 3 && (
                          <span className="text-xs text-theme-text-secondary">
                            +{blog.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Stats */}
                    <div className="flex items-center justify-between text-xs text-theme-text-secondary mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-1">
                          <EyeIcon className="w-3 h-3" />
                          <span>{blog.analytics?.readCount || 0}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <HeartIcon className="w-3 h-3" />
                          <span>{blog.analytics?.likeCount || 0}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <ClockIcon className="w-3 h-3" />
                          <span>{blog.readTime}m read</span>
                        </div>
                      </div>
                      
                      {blog.averageRating > 0 && (
                        <div className="flex items-center space-x-1">
                          <StarIcon className="w-3 h-3 text-yellow-500" />
                          <span>{blog.averageRating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>

                    {/* Author and Date */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {blog.author?.avatarUrl && (
                          <Image
                            src={blog.author.avatarUrl}
                            alt={blog.author.displayName}
                            width={20}
                            height={20}
                            className="rounded-full"
                          />
                        )}
                        <span className="text-xs text-theme-text-secondary">
                          {blog.author?.displayName || 'Anonymous'}
                        </span>
                      </div>
                      
                      <span className="text-xs text-theme-text-secondary">
                        {formatDate(blog.publishedAt)}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-theme-border">
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBlogAction(blog._id, 'like');
                          }}
                          className="p-1"
                        >
                          <HeartIcon className="w-4 h-4" />
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBlogAction(blog._id, 'bookmark');
                          }}
                          className="p-1"
                        >
                          <BookmarkIcon className="w-4 h-4" />
                        </Button>
                      </div>

                      <span className="inline-block px-2 py-1 text-xs font-medium bg-theme-primary/10 text-theme-primary rounded-full">
                        {blog.category}
                      </span>
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
                    const pageNumber = Math.max(1, currentPage - 2) + i;
                    if (pageNumber > totalPages) return null;
                    
                    return (
                      <Button
                        key={pageNumber}
                        variant={currentPage === pageNumber ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => handlePageChange(pageNumber)}
                      >
                        {pageNumber}
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
            <BookOpenIcon className="w-16 h-16 text-theme-text-secondary mx-auto mb-4" />
            <h3 className="text-lg font-medium text-theme-foreground mb-2">
              No blog posts found
            </h3>
            <p className="text-theme-text-secondary mb-4">
              {searchQuery || selectedCategory
                ? 'Try adjusting your search or filters'
                : 'Be the first to share your insights with the community!'}
            </p>
            {user && (
              <Button
                onClick={() => router.push('/blog/create')}
                className="bg-theme-primary hover:bg-theme-primary/90"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Write First Blog Post
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

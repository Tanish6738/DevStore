'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import Image from 'next/image';
import { 
  ArrowTopRightOnSquareIcon as ExternalLinkIcon, 
  HeartIcon, 
  EyeIcon, 
  ChartBarIcon,
  CalendarIcon,
  TagIcon,
  UsersIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';

export default function ToolDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useUser();
  const [tool, setTool] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [publicCollections, setPublicCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchToolDetails = useCallback(async () => {
    try {
      const response = await fetch(`/api/tools/${id}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to fetch tool details');
        return;
      }

      setTool(data.tool);
      setStatistics(data.statistics);
      setPublicCollections(data.publicCollections);
    } catch (err) {
      setError('Failed to load tool details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchToolDetails();
    }
  }, [id, fetchToolDetails]);

  const handleToolAccess = async () => {
    try {
      await fetch(`/api/tools/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
      });
      
      // Open tool in new tab
      window.open(tool.url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      console.error('Failed to track access:', err);
      // Still open the tool even if tracking fails
      window.open(tool.url, '_blank', 'noopener,noreferrer');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-theme-background">
        <div className="max-w-4xl mx-auto p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-theme-surface rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-theme-surface rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <div className="h-64 bg-theme-surface rounded"></div>
              </div>
              <div className="h-64 bg-theme-surface rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-theme-background flex items-center justify-center">
        <div className="max-w-md w-full mx-auto p-6">
          <div className="bg-theme-surface rounded-lg shadow-lg p-8 text-center">
            <h1 className="text-2xl font-bold text-theme-foreground mb-4">Tool Not Found</h1>
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

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDomainFromUrl = (url) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  return (
    <div className="min-h-screen bg-theme-background">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start space-x-4">
              {tool.faviconUrl && (
                <Image
                  src={tool.faviconUrl}
                  alt={`${tool.title} favicon`}
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-lg shadow-sm"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              )}
              <div>
                <h1 className="text-3xl font-bold text-theme-foreground mb-2">
                  {tool.title}
                </h1>
                <div className="flex items-center space-x-4 text-sm text-theme-muted">
                  <span className="flex items-center space-x-1">
                    <ExternalLinkIcon className="w-4 h-4" />
                    <span>{getDomainFromUrl(tool.url)}</span>
                  </span>
                  {tool.category && (
                    <span className="flex items-center space-x-1">
                      <TagIcon className="w-4 h-4" />
                      <span className="capitalize">{tool.category}</span>
                    </span>
                  )}
                  <span className="flex items-center space-x-1">
                    <CalendarIcon className="w-4 h-4" />
                    <span>Added {formatDate(tool.createdAt)}</span>
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleToolAccess}
              className="bg-theme-primary text-white px-6 py-3 rounded-lg hover:bg-theme-primary/90 transition-colors flex items-center space-x-2"
            >
              <ExternalLinkIcon className="w-5 h-5" />
              <span>Visit Tool</span>
            </button>
          </div>

          {tool.description && (
            <p className="text-theme-muted text-lg leading-relaxed">
              {tool.description}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Statistics */}
            <div className="bg-theme-surface rounded-lg p-6">
              <h2 className="text-xl font-semibold text-theme-foreground mb-4 flex items-center space-x-2">
                <ChartBarIcon className="w-5 h-5" />
                <span>Usage Statistics</span>
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-theme-background rounded-lg">
                  <div className="text-2xl font-bold text-theme-primary">
                    {statistics.totalUsage}
                  </div>
                  <div className="text-sm text-theme-muted">Collections</div>
                </div>
                
                <div className="text-center p-4 bg-theme-background rounded-lg">
                  <div className="text-2xl font-bold text-theme-primary">
                    {statistics.publicUsage}
                  </div>
                  <div className="text-sm text-theme-muted">Public</div>
                </div>
                
                <div className="text-center p-4 bg-theme-background rounded-lg">
                  <div className="text-2xl font-bold text-theme-primary">
                    {statistics.totalAccess}
                  </div>
                  <div className="text-sm text-theme-muted">Clicks</div>
                </div>
                
                <div className="text-center p-4 bg-theme-background rounded-lg">
                  <div className="text-2xl font-bold text-theme-primary">
                    {statistics.favoriteCount}
                  </div>
                  <div className="text-sm text-theme-muted">Favorites</div>
                </div>
              </div>
            </div>

            {/* Public Collections */}
            {publicCollections.length > 0 && (
              <div className="bg-theme-surface rounded-lg p-6">
                <h2 className="text-xl font-semibold text-theme-foreground mb-4 flex items-center space-x-2">
                  <UsersIcon className="w-5 h-5" />
                  <span>Featured in Public Collections</span>
                </h2>
                
                <div className="space-y-4">
                  {publicCollections.map((collection) => (
                    <div 
                      key={collection.id}
                      className="border border-theme-border rounded-lg p-4 hover:bg-theme-background/50 transition-colors cursor-pointer"
                      onClick={() => router.push(`/collections/${collection.id}`)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-theme-foreground mb-1">
                            {collection.name}
                          </h3>
                          {collection.description && (
                            <p className="text-theme-muted text-sm mb-2 line-clamp-2">
                              {collection.description}
                            </p>
                          )}
                          <div className="flex items-center space-x-4 text-xs text-theme-muted">
                            <span className="flex items-center space-x-1">
                              <EyeIcon className="w-3 h-3" />
                              <span>{collection.viewCount} views</span>
                            </span>
                            <span>by {collection.creator.displayName}</span>
                          </div>
                        </div>
                        {collection.creator.avatarUrl && (
                          <Image
                            src={collection.creator.avatarUrl}
                            alt={collection.creator.displayName}
                            width={32}
                            height={32}
                            className="w-8 h-8 rounded-full ml-4"
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Metadata */}
            {tool.metadata && Object.keys(tool.metadata).length > 0 && (
              <div className="bg-theme-surface rounded-lg p-6">
                <h2 className="text-xl font-semibold text-theme-foreground mb-4">
                  Additional Information
                </h2>
                
                <div className="space-y-3">
                  {tool.metadata.ogDescription && (
                    <div>
                      <span className="font-medium text-theme-foreground">Description: </span>
                      <span className="text-theme-muted">{tool.metadata.ogDescription}</span>
                    </div>
                  )}
                  
                  {tool.metadata.tags && tool.metadata.tags.length > 0 && (
                    <div>
                      <span className="font-medium text-theme-foreground">Tags: </span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {tool.metadata.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-theme-background text-theme-muted text-sm rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-theme-surface rounded-lg p-6">
              <h3 className="font-semibold text-theme-foreground mb-4">Quick Actions</h3>
              
              <div className="space-y-3">
                <button
                  onClick={handleToolAccess}
                  className="w-full bg-theme-primary text-white px-4 py-2 rounded-lg hover:bg-theme-primary/90 transition-colors flex items-center justify-center space-x-2"
                >
                  <ExternalLinkIcon className="w-4 h-4" />
                  <span>Visit Website</span>
                </button>
                
                {user && (
                  <button
                    onClick={() => router.push(`/create-collection?tool=${id}`)}
                    className="w-full bg-theme-background text-theme-foreground border border-theme-border px-4 py-2 rounded-lg hover:bg-theme-background/80 transition-colors"
                  >
                    Add to Collection
                  </button>
                )}
              </div>
            </div>

            {/* Tool Info */}
            <div className="bg-theme-surface rounded-lg p-6">
              <h3 className="font-semibold text-theme-foreground mb-4">Tool Information</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-theme-muted">Category:</span>
                  <span className="text-theme-foreground capitalize">{tool.category}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-theme-muted">Added:</span>
                  <span className="text-theme-foreground">{formatDate(tool.createdAt)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-theme-muted">Last Updated:</span>
                  <span className="text-theme-foreground">{formatDate(tool.updatedAt)}</span>
                </div>
                
                {tool.isPredefined && (
                  <div className="flex justify-between">
                    <span className="text-theme-muted">Type:</span>
                    <span className="text-theme-foreground">Verified Tool</span>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-theme-surface rounded-lg p-6">
              <h3 className="font-semibold text-theme-foreground mb-4">Recent Activity</h3>
              
              <div className="text-sm text-theme-muted">
                <div className="flex items-center space-x-2 mb-2">
                  <StarIcon className="w-4 h-4" />
                  <span>{statistics.recentUsage} new additions this month</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

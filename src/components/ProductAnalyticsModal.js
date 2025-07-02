'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon, ChartBarIcon, EyeIcon, HeartIcon, UsersIcon, ArrowTrendingUpIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

export default function ProductAnalyticsModal({ product, isOpen, onClose }) {
  const [analytics, setAnalytics] = useState(null);
  const [publicCollections, setPublicCollections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    if (isOpen && product) {
      fetchAnalytics();
    }
  }, [isOpen, product, timeRange]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchAnalytics = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/products/${product._id}/analytics?timeRange=${timeRange}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch analytics');
      }

      setAnalytics(data.statistics);
      setPublicCollections(data.publicCollections || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const exportAnalytics = async () => {
    try {
      const response = await fetch(`/api/products/${product._id}/analytics/export?timeRange=${timeRange}&format=csv`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `${product.title}-analytics-${timeRange}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Failed to export analytics:', err);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const getGrowthIndicator = (current, previous) => {
    if (!previous || previous === 0) return null;
    const growth = ((current - previous) / previous) * 100;
    return growth > 0 ? `+${growth.toFixed(1)}%` : `${growth.toFixed(1)}%`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-theme-background rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-theme-border">
        <div className="flex items-center justify-between p-6 border-b border-theme-border">
          <div className="flex items-center space-x-3">
            <ChartBarIcon className="h-6 w-6 text-theme-primary" />
            <h3 className="text-lg font-semibold text-theme-text">Product Analytics</h3>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-1 border border-theme-border rounded-md text-sm focus:ring-2 focus:ring-theme-primary focus:border-theme-primary bg-theme-secondary text-theme-text"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 3 months</option>
              <option value="1y">Last year</option>
            </select>
            <button
              onClick={exportAnalytics}
              className="flex items-center space-x-2 px-3 py-1 bg-theme-secondary hover:bg-theme-secondary/80 rounded-md text-sm text-theme-text transition-colors"
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
              <span>Export</span>
            </button>
            <button
              onClick={onClose}
              className="text-theme-text-secondary hover:text-theme-text transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-theme-primary"></div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-theme-secondary border border-theme-error rounded-md text-theme-error text-sm mb-6">
              {error}
            </div>
          )}

          {!loading && !error && analytics && (
            <div className="space-y-6">
              {/* Overview Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-theme-secondary p-4 rounded-lg border border-theme-border">
                  <div className="flex items-center space-x-2">
                    <EyeIcon className="h-5 w-5 text-theme-primary" />
                    <span className="text-sm font-medium text-theme-text">Total Views</span>
                  </div>
                  <div className="mt-2">
                    <div className="text-2xl font-bold text-theme-text">
                      {formatNumber(analytics.totalAccess || 0)}
                    </div>
                    {analytics.previousAccess && (
                      <div className="text-sm text-theme-primary">
                        {getGrowthIndicator(analytics.totalAccess, analytics.previousAccess)}
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-theme-secondary p-4 rounded-lg border border-theme-border">
                  <div className="flex items-center space-x-2">
                    <UsersIcon className="h-5 w-5 text-theme-success" />
                    <span className="text-sm font-medium text-theme-text">Collections</span>
                  </div>
                  <div className="mt-2">
                    <div className="text-2xl font-bold text-theme-text">
                      {formatNumber(analytics.totalUsage || 0)}
                    </div>
                    <div className="text-sm text-theme-success">
                      {analytics.publicUsage || 0} public
                    </div>
                  </div>
                </div>

                <div className="bg-theme-secondary p-4 rounded-lg border border-theme-border">
                  <div className="flex items-center space-x-2">
                    <HeartIcon className="h-5 w-5 text-theme-accent" />
                    <span className="text-sm font-medium text-theme-text">Favorites</span>
                  </div>
                  <div className="mt-2">
                    <div className="text-2xl font-bold text-theme-text">
                      {formatNumber(analytics.favoriteCount || 0)}
                    </div>
                  </div>
                </div>

                <div className="bg-theme-secondary p-4 rounded-lg border border-theme-border">
                  <div className="flex items-center space-x-2">
                    <ArrowTrendingUpIcon className="h-5 w-5 text-theme-warning" />
                    <span className="text-sm font-medium text-theme-text">Recent Activity</span>
                  </div>
                  <div className="mt-2">
                    <div className="text-2xl font-bold text-theme-text">
                      {formatNumber(analytics.recentUsage || 0)}
                    </div>
                    <div className="text-sm text-theme-warning">
                      Last {timeRange === '7d' ? '7 days' : timeRange === '30d' ? '30 days' : timeRange === '90d' ? '3 months' : 'year'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Category Ranking */}
              {analytics.categoryRank && (
                <div className="bg-theme-secondary p-4 rounded-lg border border-theme-border">
                  <h4 className="text-sm font-medium text-theme-text mb-2">Category Ranking</h4>
                  <div className="text-lg font-semibold text-theme-text">
                    #{analytics.categoryRank.rank} of {analytics.categoryRank.totalInCategory}
                  </div>
                  <div className="text-sm text-theme-text-secondary">
                    in {product.category} category
                  </div>
                </div>
              )}

              {/* Public Collections */}
              {publicCollections.length > 0 && (
                <div>
                  <h4 className="text-lg font-medium text-theme-text mb-4">Public Collections Using This Product</h4>
                  <div className="space-y-3">
                    {publicCollections.slice(0, 5).map((collection) => (
                      <div key={collection.id} className="flex items-center justify-between p-3 bg-theme-secondary rounded-lg border border-theme-border">
                        <div className="flex-1">
                          <h5 className="font-medium text-theme-text">{collection.name}</h5>
                          <p className="text-sm text-theme-text-secondary mt-1">
                            {collection.description}
                          </p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-theme-text-secondary">
                            <span>By {collection.creator?.displayName || 'Anonymous'}</span>
                            <span>{collection.viewCount || 0} views</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {publicCollections.length > 5 && (
                      <div className="text-center">
                        <span className="text-sm text-theme-text-secondary">
                          And {publicCollections.length - 5} more collections...
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Trends Chart Placeholder */}
              {analytics.trends && analytics.trends.weekly && analytics.trends.weekly.length > 0 && (
                <div>
                  <h4 className="text-lg font-medium text-theme-text mb-4">Usage Trends</h4>
                  <div className="bg-theme-secondary p-6 rounded-lg border border-theme-border">
                    <div className="text-center text-theme-text-secondary">
                      <ChartBarIcon className="h-12 w-12 mx-auto mb-2" />
                      <p>Weekly usage trend chart would be displayed here</p>
                      <p className="text-sm mt-1">
                        {analytics.trends.weekly.length} data points available
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Product Details */}
              <div className="border-t border-theme-border pt-6">
                <h4 className="text-lg font-medium text-theme-text mb-4">Product Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-theme-text">Title:</span>
                    <span className="ml-2 text-theme-text-secondary">{product.title}</span>
                  </div>
                  <div>
                    <span className="font-medium text-theme-text">Category:</span>
                    <span className="ml-2 text-theme-text-secondary">{product.category || 'Uncategorized'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-theme-text">Added by:</span>
                    <span className="ml-2 text-theme-text-secondary">{product.addedBy?.displayName || 'Unknown'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-theme-text">Date added:</span>
                    <span className="ml-2 text-theme-text-secondary">
                      {new Date(product.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  XMarkIcon,
  ChartBarIcon,
  EyeIcon,
  ClockIcon,
  StarIcon,
  ArrowTrendingUpIcon,
  UsersIcon,
  LinkIcon,
  TagIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

// Simple Chart Component (since we don't want heavy dependencies)
function SimpleBarChart({ data, className = '' }) {
  const maxValue = Math.max(...data.map(d => d.value));
  
  return (
    <div className={`space-y-2 ${className}`}>
      {data.map((item, index) => (
        <div key={index} className="flex items-center space-x-3">
          <div className="w-20 text-xs text-theme-text-secondary truncate">
            {item.label}
          </div>
          <div className="flex-1 bg-theme-secondary rounded-full h-2">
            <div
              className="bg-theme-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${(item.value / maxValue) * 100}%` }}
            />
          </div>
          <div className="w-8 text-xs text-theme-text-secondary text-right">
            {item.value}
          </div>
        </div>
      ))}
    </div>
  );
}

function SimpleLineChart({ data, className = '' }) {
  const maxValue = Math.max(...data.map(d => d.value));
  const points = data.map((item, index) => {
    const x = (index / (data.length - 1)) * 200;
    const y = 60 - ((item.value / maxValue) * 50);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className={className}>
      <svg width="100%" height="80" viewBox="0 0 200 60" className="overflow-visible">
        <polyline
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth="2"
          points={points}
        />
        {data.map((item, index) => {
          const x = (index / (data.length - 1)) * 200;
          const y = 60 - ((item.value / maxValue) * 50);
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="3"
              fill="var(--color-primary)"
            />
          );
        })}
      </svg>
      <div className="flex justify-between text-xs text-theme-text-secondary mt-2">
        {data.map((item, index) => (
          <span key={index}>{item.label}</span>
        ))}
      </div>
    </div>
  );
}

export default function AnalyticsModal({ 
  isOpen, 
  onClose, 
  collection 
}) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState('30d'); // '7d', '30d', '90d', '1y'

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/collections/${collection._id}/analytics?range=${timeRange}`);
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  }, [collection?._id, timeRange]);

  useEffect(() => {
    if (isOpen && collection?._id) {
      fetchAnalytics();
    }
  }, [isOpen, collection?._id, timeRange, fetchAnalytics]);

  if (!isOpen) return null;

  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  const getGrowthPercentage = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-theme-background rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-theme-border">
        <div className="flex items-center justify-between p-6 border-b border-theme-border">
          <div>
            <h2 className="text-xl font-semibold text-theme-text">
              Analytics - {collection?.name}
            </h2>
            <p className="text-sm text-theme-text-secondary mt-1">
              Usage insights and statistics
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-theme-text-secondary hover:text-theme-text transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Time Range Selector */}
        <div className="p-6 border-b border-theme-border">
          <div className="flex space-x-2">
            {[
              { value: '7d', label: '7 days' },
              { value: '30d', label: '30 days' },
              { value: '90d', label: '90 days' },
              { value: '1y', label: '1 year' }
            ].map((range) => (
              <button
                key={range.value}
                onClick={() => setTimeRange(range.value)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  timeRange === range.value
                    ? 'bg-theme-primary text-white'
                    : 'text-theme-text-secondary hover:text-theme-text hover:bg-theme-secondary'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-theme-primary mx-auto"></div>
              <p className="text-theme-text-secondary mt-2">Loading analytics...</p>
            </div>
          ) : analytics ? (
            <div className="space-y-6">
              {/* Overview Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4 card-theme">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-theme-text">
                        {formatNumber(analytics.overview.totalViews)}
                      </p>
                      <p className="text-sm text-theme-text-secondary">Total Views</p>
                    </div>
                    <EyeIcon className="h-8 w-8 text-theme-primary" />
                  </div>
                  <div className="mt-2 flex items-center">
                    <span className={`text-xs ${
                      analytics.overview.viewsGrowth >= 0 ? 'text-theme-success' : 'text-theme-error'
                    }`}>
                      {analytics.overview.viewsGrowth >= 0 ? '+' : ''}
                      {analytics.overview.viewsGrowth}%
                    </span>
                    <span className="text-xs text-theme-text-secondary ml-1">vs previous period</span>
                  </div>
                </Card>

                <Card className="p-4 card-theme">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-theme-text">
                        {formatNumber(analytics.overview.uniqueVisitors)}
                      </p>
                      <p className="text-sm text-theme-text-secondary">Unique Visitors</p>
                    </div>
                    <UsersIcon className="h-8 w-8 text-theme-success" />
                  </div>
                  <div className="mt-2 flex items-center">
                    <span className={`text-xs ${
                      analytics.overview.visitorsGrowth >= 0 ? 'text-theme-success' : 'text-theme-error'
                    }`}>
                      {analytics.overview.visitorsGrowth >= 0 ? '+' : ''}
                      {analytics.overview.visitorsGrowth}%
                    </span>
                    <span className="text-xs text-theme-text-secondary ml-1">vs previous period</span>
                  </div>
                </Card>

                <Card className="p-4 card-theme">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-theme-text">
                        {formatNumber(analytics.overview.itemClicks)}
                      </p>
                      <p className="text-sm text-theme-text-secondary">Item Clicks</p>
                    </div>
                    <LinkIcon className="h-8 w-8 text-theme-accent" />
                  </div>
                  <div className="mt-2 flex items-center">
                    <span className={`text-xs ${
                      analytics.overview.clicksGrowth >= 0 ? 'text-theme-success' : 'text-theme-error'
                    }`}>
                      {analytics.overview.clicksGrowth >= 0 ? '+' : ''}
                      {analytics.overview.clicksGrowth}%
                    </span>
                    <span className="text-xs text-theme-text-secondary ml-1">vs previous period</span>
                  </div>
                </Card>

                <Card className="p-4 card-theme">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-theme-text">
                        {analytics.overview.avgTimeSpent}
                      </p>
                      <p className="text-sm text-theme-text-secondary">Avg. Time</p>
                    </div>
                    <ClockIcon className="h-8 w-8 text-theme-warning" />
                  </div>
                  <div className="mt-2 flex items-center">
                    <span className="text-xs text-theme-text-secondary">
                      minutes per visit
                    </span>
                  </div>
                </Card>
              </div>

              {/* Views Over Time */}
              <Card className="p-6 card-theme">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-theme-text">Views Over Time</h3>
                  <ArrowTrendingUpIcon className="h-5 w-5 text-theme-text-secondary" />
                </div>
                <SimpleLineChart data={analytics.viewsOverTime} />
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Most Popular Items */}
                <Card className="p-6 card-theme">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-theme-text">Most Popular Items</h3>
                    <StarIcon className="h-5 w-5 text-theme-text-secondary" />
                  </div>
                  <SimpleBarChart data={analytics.popularItems} />
                </Card>

                {/* Traffic Sources */}
                <Card className="p-6 card-theme">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-theme-text">Traffic Sources</h3>
                    <ChartBarIcon className="h-5 w-5 text-theme-text-secondary" />
                  </div>
                  <SimpleBarChart data={analytics.trafficSources} />
                </Card>
              </div>

              {/* Category Performance */}
              <Card className="p-6 card-theme">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-theme-text">Category Performance</h3>
                  <TagIcon className="h-5 w-5 text-theme-text-secondary" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {analytics.categoryPerformance.map((category, index) => (
                    <div key={index} className="text-center p-4 bg-theme-secondary rounded-lg border border-theme-border">
                      <p className="text-lg font-semibold text-theme-text">
                        {category.clicks}
                      </p>
                      <p className="text-sm text-theme-text-secondary">{category.name}</p>
                      <p className="text-xs text-theme-text-secondary">
                        {category.percentage}% of total clicks
                      </p>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Recommendations */}
              <Card className="p-6 bg-theme-secondary border-theme-primary border">
                <h3 className="text-lg font-medium text-theme-text mb-3">
                  💡 Insights & Recommendations
                </h3>
                <div className="space-y-2">
                  {analytics.recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-theme-primary rounded-full mt-2 flex-shrink-0" />
                      <p className="text-sm text-theme-text">{rec}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          ) : (
            <div className="text-center py-8">
              <ChartBarIcon className="h-12 w-12 text-theme-text-secondary mx-auto mb-4" />
              <p className="text-theme-text-secondary">No analytics data available</p>
              <p className="text-sm text-theme-text-secondary mt-1">
                Data will appear once your collection gets some activity
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end p-6 border-t border-theme-border bg-theme-secondary">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { HeartIcon, EyeIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import ProductRating from '../../components/ProductRating';
import Header from '@/components/Header';

export default function FavoritesPage() {
  const { user } = useUser();
  const router = useRouter();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user) {
      fetchFavorites();
    }
  }, [user]);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/users/me/favorites');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch favorites');
      }

      setFavorites(data.favorites || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (productId) => {
    try {
      const response = await fetch(`/api/products/${productId}/favorite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isFavorite: false }),
      });

      if (response.ok) {
        setFavorites(prev => prev.filter(fav => fav.productId._id !== productId));
      }
    } catch (err) {
      console.error('Failed to remove favorite:', err);
    }
  };

  const filteredFavorites = favorites.filter(favorite => {
    if (!searchQuery) return true;
    const product = favorite.productId;
    return (
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-theme-background flex items-center justify-center">
        <div className="text-center">
          <HeartIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-theme-foreground mb-2">Sign in required</h1>
          <p className="text-theme-muted">Please sign in to view your favorites</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-theme-background">
      <Header title="My Favorites" />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-theme-foreground flex items-center space-x-3">
            <HeartIcon className="h-8 w-8 text-red-500" />
            <span>My Favorites</span>
          </h1>
          <p className="text-theme-muted mt-2">
            Products you&apos;ve marked as favorites
          </p>
        </div>

        {/* Search */}
        {favorites.length > 0 && (
          <div className="mb-6">
            <div className="relative max-w-md">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search favorites..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-theme-surface rounded-lg shadow-sm border border-theme-border p-6 animate-pulse">
                <div className="h-8 bg-gray-300 rounded mb-4"></div>
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchFavorites}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-12">
            <HeartIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-theme-foreground mb-2">No favorites yet</h3>
            <p className="text-theme-muted mb-6">
              Start exploring products and mark your favorites to see them here
            </p>
            <button
              onClick={() => router.push('/products')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Explore Products
            </button>
          </div>
        ) : filteredFavorites.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-theme-muted">No favorites match your search</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFavorites.map((favorite) => (
              <FavoriteCard
                key={favorite._id}
                favorite={favorite}
                onRemove={removeFavorite}
                onClick={() => router.push(`/products/${favorite.productId._id}`)}
                user={user}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Favorite Card Component
function FavoriteCard({ favorite, onRemove, onClick, user }) {
  const product = favorite.productId;

  return (
    <div className="bg-theme-surface rounded-lg shadow-sm border border-theme-border overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-6 cursor-pointer" onClick={onClick}>
        <div className="flex items-start space-x-3 mb-4">
          {product.faviconUrl && (
            <Image
              src={product.faviconUrl}
              alt={`${product.title} favicon`}
              width={32}
              height={32}
              className="w-8 h-8 rounded flex-shrink-0"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          )}
          
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-theme-foreground line-clamp-2">
              {product.title}
            </h3>
          </div>
        </div>

        {product.description && (
          <p className="text-theme-muted text-sm mb-4 line-clamp-3">
            {product.description}
          </p>
        )}

        <div className="space-y-3">
          <ProductRating product={product} user={user} compact />
          
          <div className="flex items-center justify-between">
            <div className="text-xs text-theme-muted">
              Favorited {new Date(favorite.createdAt).toLocaleDateString()}
            </div>
            
            {product.category && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                {product.category}
              </span>
            )}
          </div>
        </div>
      </div>
      
      <div className="px-6 py-3 bg-gray-50 border-t border-theme-border">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(product._id);
          }}
          className="flex items-center space-x-2 text-red-600 hover:text-red-800 transition-colors text-sm"
        >
          <HeartIcon className="h-4 w-4" />
          <span>Remove from favorites</span>
        </button>
      </div>
    </div>
  );
}

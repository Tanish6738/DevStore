'use client';

import { useState, useEffect } from 'react';
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

export default function ProductFavorite({ product, user, onFavoriteChange }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && product) {
      checkFavoriteStatus();
    }
  }, [user, product]); // eslint-disable-line react-hooks/exhaustive-deps

  const checkFavoriteStatus = async () => {
    try {
      const response = await fetch(`/api/products/${product._id}/favorite`);
      if (response.ok) {
        const data = await response.json();
        setIsFavorite(data.isFavorite);
      }
    } catch (err) {
      console.error('Failed to check favorite status:', err);
    }
  };

  const toggleFavorite = async () => {
    if (!user || loading) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/products/${product._id}/favorite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isFavorite: !isFavorite }),
      });

      if (response.ok) {
        const data = await response.json();
        setIsFavorite(data.isFavorite);
        if (onFavoriteChange) {
          onFavoriteChange(data.isFavorite);
        }
      }
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <button
      onClick={toggleFavorite}
      disabled={loading}
      className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
        isFavorite
          ? 'bg-theme-secondary text-theme-error hover:bg-theme-secondary/80'
          : 'bg-theme-secondary text-theme-text-secondary hover:bg-theme-secondary/80'
      } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      {isFavorite ? (
        <HeartSolidIcon className="h-5 w-5 text-theme-error" />
      ) : (
        <HeartIcon className="h-5 w-5" />
      )}
      <span className="text-sm">
        {isFavorite ? 'Favorited' : 'Favorite'}
      </span>
    </button>
  );
}

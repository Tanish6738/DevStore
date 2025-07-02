'use client';

import { useState, useEffect } from 'react';
import { StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

export default function ProductRating({ product, user, compact = false }) {
  const [rating, setRating] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (product) {
      fetchRating();
    }
  }, [product]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchRating = async () => {
    try {
      const response = await fetch(`/api/products/${product._id}/rating`);
      if (response.ok) {
        const data = await response.json();
        setRating(data.averageRating || 0);
        setTotalRatings(data.totalRatings || 0);
        setUserRating(data.userRating || 0);
      }
    } catch (err) {
      console.error('Failed to fetch rating:', err);
    }
  };

  const submitRating = async (newRating) => {
    if (!user) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/products/${product._id}/rating`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rating: newRating }),
      });

      if (response.ok) {
        const data = await response.json();
        setRating(data.averageRating);
        setTotalRatings(data.totalRatings);
        setUserRating(newRating);
      }
    } catch (err) {
      console.error('Failed to submit rating:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRatingClick = (newRating) => {
    if (user && !loading) {
      submitRating(newRating);
    }
  };

  const displayRating = hoverRating || userRating || rating;

  if (compact) {
    return (
      <div className="flex items-center space-x-1">
        <div className="flex items-center">
          {[1, 2, 3, 4, 5].map((star) => (
            <StarIcon
              key={star}
              className={`h-4 w-4 ${
                star <= Math.round(rating) 
                  ? 'text-theme-warning fill-current' 
                  : 'text-theme-text-secondary'
              }`}
            />
          ))}
        </div>
        <span className="text-sm text-theme-text-secondary">
          {rating.toFixed(1)} ({totalRatings})
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-3">
        <div className="flex items-center">
          {[1, 2, 3, 4, 5].map((star) => {
            const isActive = star <= displayRating;
            const isHovered = star <= hoverRating;
            
            return (
              <button
                key={star}
                type="button"
                onClick={() => handleRatingClick(star)}
                onMouseEnter={() => user && setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                disabled={!user || loading}
                className={`p-1 transition-colors ${
                  user ? 'hover:scale-110' : 'cursor-default'
                } ${loading ? 'opacity-50' : ''}`}
              >
                {isActive ? (
                  <StarSolidIcon 
                    className={`h-6 w-6 ${
                      isHovered ? 'text-theme-warning' : 'text-theme-warning'
                    }`}
                  />
                ) : (
                  <StarIcon 
                    className={`h-6 w-6 ${
                      isHovered ? 'text-theme-warning' : 'text-theme-text-secondary'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
        
        <div className="text-sm text-theme-text-secondary">
          <span className="font-medium text-theme-text">{rating.toFixed(1)}</span>
          {totalRatings > 0 && (
            <span> ({totalRatings} rating{totalRatings !== 1 ? 's' : ''})</span>
          )}
        </div>
      </div>
      
      {user ? (
        <div className="text-xs text-theme-text-secondary">
          {userRating > 0 
            ? `You rated this ${userRating} star${userRating !== 1 ? 's' : ''}`
            : 'Click to rate this product'
          }
        </div>
      ) : (
        <div className="text-xs text-theme-text-secondary">
          Sign in to rate this product
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import { CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function SuccessMessage({ 
  show, 
  onHide, 
  title = 'Success!', 
  message, 
  autoHideDuration = 5000 
}) {
  const [isVisible, setIsVisible] = useState(false);

  const handleHide = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      onHide();
    }, 300); // Match the transition duration
  }, [onHide]);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      if (autoHideDuration > 0) {
        const timer = setTimeout(() => {
          handleHide();
        }, autoHideDuration);
        return () => clearTimeout(timer);
      }
    }
  }, [show, autoHideDuration, handleHide]);

  if (!show) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 transform transition-all duration-300 ${
      isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`}>
      <div className="bg-theme-background border border-theme-success rounded-lg shadow-lg p-4 max-w-sm">
        <div className="flex items-start space-x-3">
          <CheckCircleIcon className="w-6 h-6 text-theme-success flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-theme-text">{title}</h4>
            {message && (
              <p className="text-sm text-theme-text-secondary mt-1">{message}</p>
            )}
          </div>
          <button
            onClick={handleHide}
            className="p-1 hover:bg-theme-secondary rounded transition-colors"
          >
            <XMarkIcon className="w-4 h-4 text-theme-text-secondary" />
          </button>
        </div>
      </div>
    </div>
  );
}

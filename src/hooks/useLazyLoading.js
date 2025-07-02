import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook for intersection observer to detect when element is in viewport
 * @param {Object} options - Intersection observer options
 * @returns {Array} [setRef, isIntersecting, entry]
 */
export function useIntersectionObserver(options = {}) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [entry, setEntry] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
      setEntry(entry);
    }, {
      threshold: 0.1,
      rootMargin: '50px',
      ...options
    });

    observer.observe(element);

    return () => observer.disconnect();
  }, [options]);

  return [ref, isIntersecting, entry];
}

/**
 * Custom hook for lazy loading images
 * @param {string} src - Image source URL
 * @param {Object} options - Intersection observer options
 * @returns {Object} { ref, src: actualSrc, isLoaded, isInView }
 */
export function useLazyImage(src, options = {}) {
  const [imageSrc, setImageSrc] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [ref, isInView] = useIntersectionObserver(options);

  useEffect(() => {
    if (isInView && src && !imageSrc) {
      setImageSrc(src);
    }
  }, [isInView, src, imageSrc]);

  useEffect(() => {
    if (imageSrc) {
      const img = new Image();
      img.onload = () => setIsLoaded(true);
      img.src = imageSrc;
    }
  }, [imageSrc]);

  return {
    ref,
    src: imageSrc,
    isLoaded,
    isInView
  };
}

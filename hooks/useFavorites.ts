'use client';

import { useState, useEffect, useRef } from 'react';
import { STORAGE_KEYS } from '@/config/constants';

export function useFavorites() {
  const [favorites, setFavorites] = useState<number[]>([]);
  const processingProductsRef = useRef<Set<number>>(new Set());
  const debounceTimersRef = useRef<Map<number, NodeJS.Timeout>>(new Map());

  useEffect(() => {
    // Load favorites from localStorage on mount
    const loadFavorites = () => {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(STORAGE_KEYS.FAVORITES);
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            // Use setTimeout to defer state update and avoid updating during render
            setTimeout(() => {
              setFavorites(Array.isArray(parsed) ? parsed : []);
            }, 0);
          } catch (e) {
            console.error('Error loading favorites:', e);
            setTimeout(() => {
              setFavorites([]);
            }, 0);
          }
        } else {
          setTimeout(() => {
            setFavorites([]);
          }, 0);
        }
      }
    };

    // Initial load with timeout to defer to next event loop
    setTimeout(() => {
      loadFavorites();
    }, 0);

    // Listen for favorites updates (same tab)
    const handleFavoritesUpdate = () => {
      // Use setTimeout to defer state update
      setTimeout(() => {
        loadFavorites();
      }, 0);
    };

    window.addEventListener('favoritesUpdated', handleFavoritesUpdate);
    
    return () => {
      window.removeEventListener('favoritesUpdated', handleFavoritesUpdate);
    };
  }, []);

  const addFavorite = (productId: number) => {
    // Prevent spam: check if already processing this product
    if (processingProductsRef.current.has(productId)) {
      return;
    }

    // Clear any existing debounce timer for this product
    const existingTimer = debounceTimersRef.current.get(productId);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Add to processing set
    processingProductsRef.current.add(productId);

    if (typeof window !== 'undefined') {
      // First update localStorage directly to ensure it's saved
      const stored = localStorage.getItem(STORAGE_KEYS.FAVORITES);
      let currentFavorites: number[] = [];
      if (stored) {
        try {
          currentFavorites = JSON.parse(stored);
        } catch (e) {
          currentFavorites = [];
        }
      }
      
      // Only add if not already present
      if (!currentFavorites.includes(productId)) {
        const newFavorites = [...currentFavorites, productId];
        localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(newFavorites));
        
        // Update state
        setFavorites(newFavorites);
        
        // Dispatch event asynchronously to avoid updating state during render
        setTimeout(() => {
          window.dispatchEvent(new Event('favoritesUpdated'));
        }, 0);
      }

      // Remove from processing set after delay to prevent spam
      const timer = setTimeout(() => {
        processingProductsRef.current.delete(productId);
        debounceTimersRef.current.delete(productId);
      }, 300);
      debounceTimersRef.current.set(productId, timer);
    } else {
      // Fallback for SSR
      setFavorites((currentFavorites) => {
        if (currentFavorites.includes(productId)) {
          return currentFavorites;
        }
        return [...currentFavorites, productId];
      });
      
      // Remove from processing set after delay
      setTimeout(() => {
        processingProductsRef.current.delete(productId);
      }, 300);
    }
  };

  const removeFavorite = (productId: number) => {
    // Prevent spam: check if already processing this product
    if (processingProductsRef.current.has(productId)) {
      return;
    }

    // Clear any existing debounce timer for this product
    const existingTimer = debounceTimersRef.current.get(productId);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Add to processing set
    processingProductsRef.current.add(productId);

    if (typeof window !== 'undefined') {
      // First update localStorage directly to ensure it's saved
      const stored = localStorage.getItem(STORAGE_KEYS.FAVORITES);
      let currentFavorites: number[] = [];
      if (stored) {
        try {
          currentFavorites = JSON.parse(stored);
        } catch (e) {
          currentFavorites = [];
        }
      }
      
      const newFavorites = currentFavorites.filter((id) => id !== productId);
      
      if (newFavorites.length === 0) {
        localStorage.removeItem(STORAGE_KEYS.FAVORITES);
      } else {
        localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(newFavorites));
      }
      
      // Update state
      setFavorites(newFavorites);
      
      // Dispatch event asynchronously to avoid updating state during render
      setTimeout(() => {
        window.dispatchEvent(new Event('favoritesUpdated'));
      }, 0);

      // Remove from processing set after delay to prevent spam
      const timer = setTimeout(() => {
        processingProductsRef.current.delete(productId);
        debounceTimersRef.current.delete(productId);
      }, 300);
      debounceTimersRef.current.set(productId, timer);
    } else {
      // Fallback for SSR
      setFavorites((currentFavorites) => {
        return currentFavorites.filter((id) => id !== productId);
      });
      
      // Remove from processing set after delay
      setTimeout(() => {
        processingProductsRef.current.delete(productId);
      }, 300);
    }
  };

  const toggleFavorite = (productId: number) => {
    // Prevent spam: check if already processing this product
    if (processingProductsRef.current.has(productId)) {
      return;
    }

    // Clear any existing debounce timer for this product
    const existingTimer = debounceTimersRef.current.get(productId);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Add to processing set
    processingProductsRef.current.add(productId);

    setFavorites((currentFavorites) => {
      const isCurrentlyFavorite = currentFavorites.includes(productId);
      let newFavorites: number[];
      
      if (isCurrentlyFavorite) {
        newFavorites = currentFavorites.filter((id) => id !== productId);
      } else {
        newFavorites = [...currentFavorites, productId];
      }
      
      if (typeof window !== 'undefined') {
        if (newFavorites.length === 0) {
          localStorage.removeItem(STORAGE_KEYS.FAVORITES);
        } else {
          localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(newFavorites));
        }
        window.dispatchEvent(new Event('favoritesUpdated'));
      }

      // Remove from processing set after delay to prevent spam
      const timer = setTimeout(() => {
        processingProductsRef.current.delete(productId);
        debounceTimersRef.current.delete(productId);
      }, 300);
      debounceTimersRef.current.set(productId, timer);
      
      return newFavorites;
    });
  };

  const isFavorite = (productId: number) => {
    return favorites.includes(productId);
  };

  const getFavoriteCount = () => {
    return favorites.length;
  };

  const clearAllFavorites = () => {
    setFavorites([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.FAVORITES);
      // Dispatch event asynchronously to avoid updating state during render
      setTimeout(() => {
        window.dispatchEvent(new Event('favoritesUpdated'));
      }, 0);
    }
  };

  return {
    favorites,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    getFavoriteCount,
    clearAllFavorites,
  };
}

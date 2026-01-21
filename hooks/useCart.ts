'use client';

import { useState, useEffect, useRef } from 'react';
import { STORAGE_KEYS } from '@/config/constants';

export type CartItem = {
  productId: number;
  quantity: number;
  weight: string;
};

export function useCart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const isProcessingRef = useRef(false);
  const processingProductsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Load cart from localStorage on mount
    const loadCart = () => {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(STORAGE_KEYS.CART);
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            setCartItems(Array.isArray(parsed) ? parsed : []);
          } catch (e) {
            console.error('Error loading cart:', e);
            setCartItems([]);
          }
        } else {
          setCartItems([]);
        }
      }
    };

    // Load cart immediately on mount
    loadCart();

    // Listen for cart updates (same tab)
    const handleCartUpdate = () => {
      // Defer cart loading to avoid updating state during render of other components
      // This ensures the state update happens after the current render cycle
      setTimeout(() => {
        loadCart();
      }, 0);
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, []);

  const saveCart = (items: CartItem[]) => {
    setCartItems(items);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(items));
      // Dispatch custom event asynchronously to avoid updating state during render
      setTimeout(() => {
        window.dispatchEvent(new Event('cartUpdated'));
      }, 0);
    }
  };

  const addToCart = (productId: number, quantity: number = 1, weight: string) => {
    // Create unique key for this product/weight combination
    const productKey = `${productId}-${weight}`;
    
    // Prevent concurrent calls for the same product
    if (processingProductsRef.current.has(productKey)) {
      return;
    }

    // Prevent global concurrent calls
    if (isProcessingRef.current) {
      return;
    }

    isProcessingRef.current = true;
    processingProductsRef.current.add(productKey);

    setCartItems((currentItems) => {
      const existingItemIndex = currentItems.findIndex(
        (item) => item.productId === productId && item.weight === weight
      );

      let newItems: CartItem[];
      if (existingItemIndex >= 0) {
        newItems = [...currentItems];
        newItems[existingItemIndex].quantity += quantity;
      } else {
        newItems = [...currentItems, { productId, quantity, weight }];
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(newItems));
        // Dispatch event asynchronously to avoid updating state during render
        setTimeout(() => {
          window.dispatchEvent(new Event('cartUpdated'));
        }, 0);
      }

      // Reset processing flags after state update with longer delay to prevent spam
      setTimeout(() => {
        isProcessingRef.current = false;
        processingProductsRef.current.delete(productKey);
      }, 300);

      return newItems;
    });
  };

  const removeFromCart = (productId: number, weight: string) => {
    setCartItems((currentItems) => {
      const newItems = currentItems.filter(
        (item) => !(item.productId === productId && item.weight === weight)
      );

      if (typeof window !== 'undefined') {
        if (newItems.length === 0) {
          localStorage.removeItem(STORAGE_KEYS.CART);
        } else {
          localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(newItems));
        }
        // Dispatch event asynchronously to avoid updating state during render
        setTimeout(() => {
          window.dispatchEvent(new Event('cartUpdated'));
        }, 0);
      }

      return newItems;
    });
  };

  const updateQuantity = (productId: number, weight: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, weight);
      return;
    }

    setCartItems((currentItems) => {
      const newItems = currentItems.map((item) => {
        if (item.productId === productId && item.weight === weight) {
          return { ...item, quantity };
        }
        return item;
      });

      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(newItems));
        // Dispatch event asynchronously to avoid updating state during render
        setTimeout(() => {
          window.dispatchEvent(new Event('cartUpdated'));
        }, 0);
      }

      return newItems;
    });
  };

  const clearCart = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.CART);
    }
    setCartItems([]);
    // Dispatch event asynchronously to avoid updating state during render
    setTimeout(() => {
      window.dispatchEvent(new Event('cartUpdated'));
    }, 0);
  };

  const getCartCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getCartItem = (productId: number, weight: string): CartItem | undefined => {
    return cartItems.find((item) => item.productId === productId && item.weight === weight);
  };

  return {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartCount,
    getCartItem,
  };
}

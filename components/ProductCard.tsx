'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product, calculatePriceByWeight, createSellerSlug, isFeaturedOffer, getDiscountedPrice } from '@/lib/data';
import { ROUTES } from '@/config/constants';
import { useFavorites } from '@/hooks/useFavorites';
import { useCart } from '@/hooks/useCart';
import { useToastContext } from '@/components/ToastProvider';

type ProductCardProps = {
  product: Product;
  selectedWeight?: string;
  hideSellerAvatar?: boolean; // Hide seller avatar image (show only icon with name)
  priority?: boolean; // Set to true for above-the-fold images
};

export default function ProductCard({ product, selectedWeight, hideSellerAvatar = false, priority = false }: ProductCardProps) {
  const { toggleFavorite, isFavorite, favorites, addFavorite, removeFavorite } = useFavorites();
  const { addToCart, getCartItem, removeFromCart, updateQuantity } = useCart();
  const { showToast } = useToastContext();
  const [isLiked, setIsLiked] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  useEffect(() => {
    setIsLiked(isFavorite(product.id));
  }, [favorites, product.id, isFavorite]);

  // Determine display weight: default to 450g, or use selected weight if product has it
  const getDisplayWeight = (): string => {
    const defaultWeight = '450g';
    const targetWeight = selectedWeight || defaultWeight;
    
    // If product has the selected/default weight, use it
    if (product.availableWeights.includes(targetWeight)) {
      return targetWeight;
    }
    
    // Otherwise, try 450g if available
    if (product.availableWeights.includes(defaultWeight)) {
      return defaultWeight;
    }
    
    // Fallback to product's default weight
    return product.weight;
  };

  const displayWeight = getDisplayWeight();
  const basePrice = displayWeight !== product.weight
    ? calculatePriceByWeight(product, displayWeight)
    : product.price;
  
  const isFeatured = isFeaturedOffer(product);
  const displayPrice = getDiscountedPrice(basePrice, isFeatured);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Prevent double-click or multiple rapid clicks
    if (isAdding) return;
    
    // Check if product is in stock
    if (!product.inStock) {
      showToast('Proizvod nije na stanju', 'error');
      return;
    }
    
    setIsAdding(true);
    
    // Store previous state for undo BEFORE adding
    const previousCartItem = getCartItem(product.id, displayWeight);
    const previousQuantity = previousCartItem ? previousCartItem.quantity : 0;
    
    addToCart(product.id, 1, displayWeight);
    
    showToast(
      `${product.name} (${displayWeight}) je dodan u korpu!`, 
      'success',
      4000,
      () => {
        // Undo: restore previous quantity
        if (previousQuantity <= 0) {
          removeFromCart(product.id, displayWeight);
        } else {
          updateQuantity(product.id, displayWeight, previousQuantity);
        }
      }
    );
    
    // Reset after a longer delay to prevent spam
    setTimeout(() => {
      setIsAdding(false);
    }, 800);
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Prevent double-click or multiple rapid clicks
    if (isToggling) return;
    
    setIsToggling(true);
    const wasLiked = isFavorite(product.id);
    
    if (wasLiked) {
      // Store product ID in closure for undo
      const productId = product.id;
      
      // Remove from favorites
      removeFavorite(productId);
      
      // Undo: add back to favorites - no delay needed since we update localStorage directly
      showToast(
        `${product.name} je uklonjen iz omiljenih`, 
        'info',
        4000,
        () => {
          // Directly call addFavorite - it will handle localStorage correctly
          addFavorite(productId);
        }
      );
    } else {
      // Store product ID in closure for undo
      const productId = product.id;
      
      // Add to favorites
      addFavorite(productId);
      
      // Undo: remove from favorites with small delay to ensure state is updated
      showToast(
        `${product.name} je dodan u omiljene`, 
        'success',
        4000,
        () => {
          // Use setTimeout to ensure state is updated before undo
          setTimeout(() => {
            removeFavorite(productId);
          }, 100);
        }
      );
    }
    
    // Reset after a longer delay to prevent spam
    setTimeout(() => {
      setIsToggling(false);
    }, 800);
  };

  return (
    <Link
      href={`${ROUTES.PRODUCTS}/${product.slug}`}
      className="block bg-white rounded-lg overflow-hidden shadow-sm h-full flex flex-col group transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
      style={{
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        border: '1px solid transparent',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--honey-gold)';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(212, 167, 44, 0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'transparent';
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
      }}
    >
      {/* Image Section */}
      <div className="relative w-full h-64 max-md:h-56 max-sm:h-48 overflow-hidden bg-gray-100">
        <Image
          src={encodeURI(product.image)}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={priority}
          loading={priority ? undefined : 'lazy'}
          onError={(e) => {
            // Try to use first image from images array if available
            const target = e.target as HTMLImageElement;
            if (product.images && product.images.length > 0 && product.images[0] !== product.image) {
              target.src = encodeURI(product.images[0]);
            } else {
              // Hide image if no fallback available
              target.style.display = 'none';
            }
          }}
        />
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Badge */}
        {product.badge && product.badgeText && (
          <div
            className="absolute top-3 right-3 px-3 py-1 rounded-md text-xs font-bold text-white"
            style={{
              backgroundColor:
                product.badge === 'najprodavanije'
                  ? 'var(--honey-gold)'
                  : product.badge === 'novo-u-ponudi'
                  ? 'var(--green-primary)' // Sage green for "novo u ponudi" - harmonizes with site palette
                  : '#dc2626',
            }}
          >
            {product.badgeText}
          </div>
        )}
        
        {/* Discount Badge */}
        {isFeatured && (
          <div
            className="absolute top-3 left-3 px-3 py-1 rounded-md text-xs font-bold text-white"
            style={{
              backgroundColor: '#dc2626',
            }}
          >
            -15%
          </div>
        )}

      </div>

      {/* Content Section */}
      <div className="p-5 max-md:p-4 max-sm:p-3 flex-1 flex flex-col min-h-0">
        {/* Title and Seller */}
        <div className="flex items-start justify-between mb-2">
          <h3
            className="text-xl max-md:text-lg max-sm:text-base font-bold flex-1 line-clamp-2 min-h-[3rem] max-sm:min-h-[2.5rem]"
            style={{
              color: 'var(--dark-text)',
              fontFamily: 'var(--font-serif)',
            }}
          >
            {product.name}
          </h3>
          <div
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              window.location.href = `/pcelari/${createSellerSlug(product.seller.name)}`;
            }}
            className="flex items-center gap-1.5 ml-2 transition-all duration-200 hover:opacity-80 hover:translate-x-1 cursor-pointer"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              style={{ color: 'var(--body-text)' }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <span
              className="text-sm"
              style={{
                color: 'var(--body-text)',
                fontFamily: 'var(--font-inter)',
              }}
            >
              {product.seller.name}
            </span>
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-baseline gap-2 mb-3">
          <div className="flex items-center gap-0.5 flex-shrink-0">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className="w-4 h-4 flex-shrink-0"
                fill={i < Math.floor(product.rating) ? 'var(--honey-gold)' : 'none'}
                stroke={i < Math.floor(product.rating) ? 'var(--honey-gold)' : 'var(--border-light)'}
                viewBox="0 0 24 24"
                style={{ display: 'block' }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
            ))}
          </div>
          <span
            className="text-sm leading-none"
            style={{
              color: 'var(--body-text)',
              fontFamily: 'var(--font-inter)',
            }}
          >
            ({product.reviews})
          </span>
        </div>

        {/* Description */}
        <p
          className="text-sm mb-3 line-clamp-2 min-h-[2.5rem]"
          style={{
            color: 'var(--body-text)',
            fontFamily: 'var(--font-inter)',
          }}
        >
          {product.description}
        </p>

        {/* Learn More - already inside Link, so use span */}
        <span
          className="inline-block text-sm font-medium mb-4 transition-all duration-300 min-h-[1.5rem] group-hover:translate-x-1 cursor-pointer"
          style={{
            color: 'var(--blue-primary)',
            fontFamily: 'var(--font-inter)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.textDecoration = 'underline';
            e.currentTarget.style.textDecorationColor = 'var(--blue-primary)';
            e.currentTarget.style.textUnderlineOffset = '4px';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.textDecoration = 'none';
          }}
        >
          Saznaj više →
        </span>

        {/* Price and Weight */}
        <div className="space-y-1 mb-3">
          <div className="flex items-center gap-2">
            {isFeatured && (
              <span
                className="text-lg line-through"
                style={{
                  color: '#9ca3af',
                  fontFamily: 'var(--font-inter)',
                }}
              >
                {basePrice} {product.currency}
              </span>
            )}
            <span
              className="text-2xl font-bold"
              style={{
                color: 'var(--price-color)',
                fontFamily: 'var(--font-inter)',
              }}
            >
              {displayPrice} {product.currency}
            </span>
          </div>
          <span
            className="text-sm"
            style={{
              color: 'var(--body-text)',
              fontFamily: 'var(--font-inter)',
            }}
          >
            / {displayWeight}
          </span>
        </div>

        {/* Location */}
        <div className="flex items-center gap-1.5 mb-4">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            style={{ color: 'var(--body-text)' }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span
            className="text-sm"
            style={{
              color: 'var(--body-text)',
              fontFamily: 'var(--font-inter)',
            }}
          >
            {product.seller.location}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 mt-auto">
          {/* Favorite Button */}
          <button
            onClick={handleFavorite}
            className="w-10 h-10 rounded-lg border-2 flex items-center justify-center transition-all duration-200 hover:scale-110"
            style={{
              borderColor: isLiked ? '#dc2626' : 'var(--border-light)',
              backgroundColor: isLiked ? '#fef2f2' : 'white',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#dc2626';
              e.currentTarget.style.backgroundColor = '#fef2f2';
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = isLiked ? '#dc2626' : 'var(--border-light)';
              e.currentTarget.style.backgroundColor = isLiked ? '#fef2f2' : 'white';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <svg
              className="w-5 h-5"
              fill={isLiked ? '#dc2626' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
              style={{ color: '#dc2626' }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>

          {/* Stock Status */}
          {!product.inStock && (
            <div className="mb-2">
              <span
                className="text-xs font-medium px-2 py-1 rounded"
                style={{
                  color: '#dc2626',
                  backgroundColor: '#fef2f2',
                  fontFamily: 'var(--font-inter)',
                }}
              >
                Nema na stanju
              </span>
            </div>
          )}

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={!product.inStock || isAdding}
            className="flex-1 h-10 rounded-lg flex items-center justify-center gap-2 font-medium text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02]"
            style={{
              backgroundColor: product.inStock ? 'var(--honey-gold)' : 'var(--border-light)',
              color: product.inStock ? 'white' : 'var(--body-text)',
              fontFamily: 'var(--font-inter)',
            }}
            onMouseEnter={(e) => {
              if (product.inStock) {
                e.currentTarget.style.backgroundColor = 'var(--honey-light)';
                e.currentTarget.style.transform = 'scale(1.02)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(212, 167, 44, 0.3)';
              }
            }}
            onMouseLeave={(e) => {
              if (product.inStock) {
                e.currentTarget.style.backgroundColor = 'var(--honey-gold)';
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = 'none';
              }
            }}
            aria-label={product.inStock ? 'Dodaj u korpu' : 'Proizvod nije na stanju'}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            Dodaj u korpu
          </button>
        </div>
      </div>
    </Link>
  );
}

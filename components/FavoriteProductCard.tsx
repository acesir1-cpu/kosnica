'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product, isFeaturedOffer, getDiscountedPrice } from '@/lib/data';
import { ROUTES } from '@/config/constants';
import { useFavorites } from '@/hooks/useFavorites';
import { useCart } from '@/hooks/useCart';
import { useToastContext } from '@/components/ToastProvider';

type FavoriteProductCardProps = {
  product: Product;
};

export default function FavoriteProductCard({ product }: FavoriteProductCardProps) {
  const { removeFavorite, addFavorite, isFavorite } = useFavorites();
  const { addToCart, getCartItem, removeFromCart, updateQuantity } = useCart();
  const { showToast } = useToastContext();
  const [isLiked, setIsLiked] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    setIsLiked(isFavorite(product.id));
  }, [isFavorite, product.id]);

  const isFeatured = isFeaturedOffer(product);
  const basePrice = product.price;
  const displayPrice = getDiscountedPrice(basePrice, isFeatured);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isAdding) return;
    
    setIsAdding(true);
    
    // Store previous state for undo BEFORE adding
    const previousCartItem = getCartItem(product.id, product.weight);
    const previousQuantity = previousCartItem ? previousCartItem.quantity : 0;
    
    addToCart(product.id, 1, product.weight);
    showToast(
      `${product.name} je dodan u korpu!`, 
      'success',
      4000,
      () => {
        // Undo: restore previous quantity
        if (previousQuantity <= 0) {
          removeFromCart(product.id, product.weight);
        } else {
          updateQuantity(product.id, product.weight, previousQuantity);
        }
      }
    );
    
    setTimeout(() => {
      setIsAdding(false);
    }, 800);
  };

  const handleRemoveFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
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
  };

  return (
    <div className="relative group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col" style={{ boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
      {/* Remove Button - Visible on hover */}
      <button
        onClick={handleRemoveFavorite}
        className="absolute top-2 right-2 z-20 w-8 h-8 rounded-full bg-white border-2 border-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-50"
        aria-label="Ukloni iz omiljenih"
      >
        <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      <Link
        href={`${ROUTES.PRODUCTS}/${product.slug}`}
        className="block flex-1 flex flex-col"
        onClick={(e) => {
          // Allow navigation on card click but prevent it when clicking buttons
          if ((e.target as HTMLElement).closest('button')) {
            e.preventDefault();
          }
        }}
      >
        {/* Image Section */}
        <div className="relative w-full h-48 overflow-hidden bg-gray-100">
          <Image
            src={product.image}
            loading="lazy"
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          
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
              className="absolute top-3 left-3 px-3 py-1 rounded-md text-xs font-bold text-white shadow-md"
              style={{
                backgroundColor: '#dc2626',
              }}
            >
              -15%
            </div>
          )}

        </div>

        {/* Content Section */}
        <div className="p-4 flex-1 flex flex-col">
          {/* Title */}
          <h3
            className="text-base font-bold mb-2 line-clamp-2 min-h-[3rem]"
            style={{
              color: 'var(--dark-text)',
              fontFamily: 'var(--font-serif)',
            }}
          >
            {product.name}
          </h3>

          {/* Seller */}
          <div className="flex items-center gap-1.5 mb-2">
            <svg
              className="w-3 h-3"
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
              className="text-xs font-medium"
              style={{
                color: 'var(--body-text)',
                fontFamily: 'var(--font-inter)',
              }}
            >
              {product.seller.name}
            </span>
          </div>

          {/* Rating */}
          <div className="flex items-baseline gap-2 mb-2">
            <div className="flex items-center gap-0.5 flex-shrink-0">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className="w-3 h-3 flex-shrink-0"
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
              className="text-xs leading-none"
              style={{
                color: 'var(--body-text)',
                fontFamily: 'var(--font-inter)',
              }}
            >
              ({product.reviews})
            </span>
          </div>

          {/* Price and Weight */}
          <div className="space-y-1 mb-3">
            <div className="flex items-center gap-2">
              {isFeatured && (
                <span
                  className="text-sm line-through"
                  style={{
                    color: '#9ca3af',
                    fontFamily: 'var(--font-inter)',
                  }}
                >
                  {basePrice} {product.currency}
                </span>
              )}
              <span
                className="text-lg font-bold"
                style={{
                  color: 'var(--price-color)',
                  fontFamily: 'var(--font-inter)',
                }}
              >
                {displayPrice} {product.currency}
              </span>
            </div>
            <span
              className="text-xs"
              style={{
                color: 'var(--body-text)',
                fontFamily: 'var(--font-inter)',
              }}
            >
              / {product.weight}
            </span>
          </div>

          {/* Location */}
          <div className="flex items-center gap-1.5 mb-3">
            <svg
              className="w-3 h-3"
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
              className="text-xs"
              style={{
                color: 'var(--body-text)',
                fontFamily: 'var(--font-inter)',
              }}
            >
              {product.seller.location}
            </span>
          </div>

        </div>
      </Link>

      {/* Action Buttons - Outside Link to prevent navigation issues */}
      <div className="px-4 pb-4 mt-auto">
        <div className="flex items-center gap-2">
          {/* Favorite Button - Always filled on favorites page */}
          <button
            onClick={handleRemoveFavorite}
            className="w-9 h-9 rounded-lg border-2 flex items-center justify-center transition-all duration-200 flex-shrink-0"
            style={{
              borderColor: '#dc2626',
              backgroundColor: '#fef2f2',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#b91c1c';
              e.currentTarget.style.backgroundColor = '#fee2e2';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#dc2626';
              e.currentTarget.style.backgroundColor = '#fef2f2';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <svg
              className="w-4 h-4"
              fill="#dc2626"
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

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={isAdding}
            className="flex-1 h-9 rounded-lg flex items-center justify-center gap-1.5 font-medium text-xs transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: 'var(--honey-gold)',
              color: 'white',
              fontFamily: 'var(--font-inter)',
            }}
            onMouseEnter={(e) => {
              if (!isAdding) {
                e.currentTarget.style.backgroundColor = 'var(--honey-light)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--honey-gold)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {isAdding ? (
              <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            ) : (
              <>
                <svg
                  className="w-4 h-4"
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
                Dodaj
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

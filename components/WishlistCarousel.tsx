'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getAllProducts, isFeaturedOffer, getDiscountedPrice, type Product } from '@/lib/data';
import { ROUTES } from '@/config/constants';
import { useCart } from '@/hooks/useCart';
import { useFavorites } from '@/hooks/useFavorites';
import { useToastContext } from '@/components/ToastProvider';

export default function WishlistCarousel() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { favorites, removeFavorite } = useFavorites();
  const { addToCart } = useCart();
  const { showToast } = useToastContext();
  const [addingProducts, setAddingProducts] = useState<Set<number>>(new Set());
  const [canScrollRight, setCanScrollRight] = useState(true);

  const allProducts = getAllProducts();
  const favoriteProducts = allProducts.filter((product) => favorites.includes(product.id));

  const checkScrollability = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScrollability();
    window.addEventListener('resize', checkScrollability);
    return () => window.removeEventListener('resize', checkScrollability);
  }, [favoriteProducts]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400;
      const newScrollLeft =
        direction === 'left'
          ? scrollContainerRef.current.scrollLeft - scrollAmount
          : scrollContainerRef.current.scrollLeft + scrollAmount;

      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth',
      });

      setTimeout(checkScrollability, 300);
    }
  };

  const handleMoveToCart = (e: React.MouseEvent, productId: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (addingProducts.has(productId)) return;
    
    const product = favoriteProducts.find((p) => p.id === productId);
    if (product) {
      // Check if product is in stock
      if (!product.inStock) {
        showToast('Proizvod nije na stanju', 'error');
        return;
      }
      
      setAddingProducts((prev) => new Set(prev).add(productId));
      addToCart(productId, 1, product.weight);
      showToast(`${product.name} je dodan u korpu!`, 'success');
      
      setTimeout(() => {
        setAddingProducts((prev) => {
          const next = new Set(prev);
          next.delete(productId);
          return next;
        });
      }, 800);
    }
  };

  const handleRemoveFromWishlist = (e: React.MouseEvent, productId: number) => {
    e.preventDefault();
    e.stopPropagation();
    const product = favoriteProducts.find((p) => p.id === productId);
    if (product) {
      removeFavorite(productId);
      showToast(`${product.name} je uklonjen iz omiljenih`, 'info');
    }
  };

  if (favoriteProducts.length === 0) {
    return null;
  }

  return (
    <section className="py-12" style={{ backgroundColor: 'var(--cream)' }}>
      <div className="container mx-auto px-8 max-lg:px-6 max-md:px-4 max-w-7xl relative">
        <div className="flex items-center justify-between mb-8">
          <h2
            className="text-3xl font-bold"
            style={{
              fontFamily: 'var(--font-serif)',
              color: 'var(--dark-text)',
            }}
          >
            Vaša lista želja ({favoriteProducts.length})
          </h2>
          
          {/* Scroll Arrow */}
          {canScrollRight && (
            <button
              onClick={() => scroll('right')}
              className="w-10 h-10 rounded-full bg-white border-2 flex items-center justify-center transition-colors shadow-md hover:shadow-lg"
              style={{
                borderColor: 'var(--border-light)',
                color: 'var(--dark-text)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--honey-gold)';
                e.currentTarget.style.backgroundColor = 'var(--honey-gold)';
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-light)';
                e.currentTarget.style.backgroundColor = 'white';
                e.currentTarget.style.color = 'var(--dark-text)';
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          )}
        </div>

        <div
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide pb-4"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
          onScroll={checkScrollability}
        >
          {favoriteProducts.map((product) => {
            const isFeatured = isFeaturedOffer(product);
            const basePrice = product.price;
            const displayPrice = getDiscountedPrice(basePrice, isFeatured);
            return (
            <div
              key={product.id}
              className="block bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all flex-shrink-0 w-80 max-md:w-72"
              style={{
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              }}
            >
              {/* Image Section */}
              <div className="relative w-full h-48 overflow-hidden bg-gray-100">
                <Link href={`${ROUTES.PRODUCTS}/${product.slug}`}>
                  <Image
                    src={product.image}
                    loading="lazy"
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="320px"
                  />
                </Link>

                {/* Discount Badge */}
                {isFeatured && (
                  <div
                    className="absolute top-3 left-3 px-2 py-1 rounded-md text-xs font-bold text-white shadow-md"
                    style={{
                      backgroundColor: '#dc2626',
                    }}
                  >
                    -15%
                  </div>
                )}

              </div>

              {/* Content Section */}
              <div className="p-4">
                <Link href={`${ROUTES.PRODUCTS}/${product.slug}`}>
                  <h3
                    className="text-base font-bold mb-2 line-clamp-2"
                    style={{
                      color: 'var(--dark-text)',
                      fontFamily: 'var(--font-inter)',
                    }}
                  >
                    {product.name}
                  </h3>
                </Link>

                {/* Seller Info */}
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

                {/* Location */}
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

                {/* Price and Weight */}
                <div className="space-y-1 mb-2">
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

                {/* Stock Status */}
                <div className="mb-3">
                  <span
                    className="text-xs"
                    style={{
                      color: product.inStock ? 'var(--green-primary)' : '#dc2626',
                      fontFamily: 'var(--font-inter)',
                    }}
                  >
                    {product.inStock ? 'Na stanju' : 'Nema na stanju'}
                  </span>
                </div>

                {/* Action Buttons - In one row */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => handleMoveToCart(e, product.id)}
                    disabled={!product.inStock}
                    className="flex-1 h-10 rounded-lg flex items-center justify-center gap-2 font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: product.inStock ? 'var(--honey-gold)' : 'var(--border-light)',
                      color: product.inStock ? 'white' : 'var(--body-text)',
                      fontFamily: 'var(--font-inter)',
                    }}
                    onMouseEnter={(e) => {
                      if (product.inStock) {
                        e.currentTarget.style.backgroundColor = 'var(--honey-light)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (product.inStock) {
                        e.currentTarget.style.backgroundColor = 'var(--honey-gold)';
                      }
                    }}
                    aria-label={product.inStock ? 'Premjesti u korpu' : 'Proizvod nije na stanju'}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    Premjesti u korpu
                  </button>
                  
                  <button
                    onClick={(e) => handleRemoveFromWishlist(e, product.id)}
                    className="px-4 h-10 rounded-lg flex items-center justify-center font-medium text-sm transition-colors"
                    style={{
                      backgroundColor: 'white',
                      color: 'var(--body-text)',
                      border: '2px solid var(--border-light)',
                      fontFamily: 'var(--font-inter)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#dc2626';
                      e.currentTarget.style.color = '#dc2626';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-light)';
                      e.currentTarget.style.color = 'var(--body-text)';
                    }}
                  >
                    Ukloni
                  </button>
                </div>
              </div>
            </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

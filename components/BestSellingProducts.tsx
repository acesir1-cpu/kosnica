'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { calculatePriceByWeight, createSellerSlug, getAllProducts, isFeaturedOffer, getDiscountedPrice, type Product } from '@/lib/data';
import { ROUTES } from '@/config/constants';
import { useFavorites } from '@/hooks/useFavorites';
import { useCart } from '@/hooks/useCart';
import { useToastContext } from '@/components/ToastProvider';

export default function BestSellingProducts() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const defaultWeight = '450g';

  // Get products with "najprodavanije" badge
  const bestSellingProducts = getAllProducts()
    .filter((product) => product.badge === 'najprodavanije')
    .slice(0, 8); // Show up to 8 products

  const checkScrollability = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScrollability();
    window.addEventListener('resize', checkScrollability);
    return () => window.removeEventListener('resize', checkScrollability);
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400; // Scroll by card width + gap
      const newScrollLeft =
        direction === 'left'
          ? scrollContainerRef.current.scrollLeft - scrollAmount
          : scrollContainerRef.current.scrollLeft + scrollAmount;

      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth',
      });

      // Check scrollability after a short delay
      setTimeout(checkScrollability, 300);
    }
  };

  const { addToCart } = useCart();
  const { showToast } = useToastContext();
  const [addingProducts, setAddingProducts] = useState<Set<number>>(new Set());

  const handleAddToCart = (e: React.MouseEvent, productId: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Prevent double-click or multiple rapid clicks
    if (addingProducts.has(productId)) return;
    
    const product = bestSellingProducts.find((p) => p.id === productId);
    if (product) {
      // Check if product is in stock
      if (!product.inStock) {
        showToast('Proizvod nije na stanju', 'error');
        return;
      }
      
      setAddingProducts((prev) => new Set(prev).add(productId));
      const targetWeight = getDefaultWeight(product, defaultWeight);
      addToCart(productId, 1, targetWeight);
      showToast(`${product.name} je dodan u korpu!`, 'success');
      
      // Reset after a longer delay to prevent spam
      setTimeout(() => {
        setAddingProducts((prev) => {
          const next = new Set(prev);
          next.delete(productId);
          return next;
        });
      }, 800);
    }
  };

  if (bestSellingProducts.length === 0) {
    return null;
  }

  return (
    <section className="relative py-24" style={{ backgroundColor: 'var(--cream)' }}>
      <div className="container mx-auto px-8 max-lg:px-6 max-md:px-4 max-w-7xl relative z-10">
        {/* Header */}
        <div className="mb-12 max-md:mb-8">
          <h2
            className="text-5xl max-md:text-3xl font-bold"
            style={{
              fontFamily: 'var(--font-serif)',
              color: 'var(--dark-text)',
              letterSpacing: '0.02em',
            }}
          >
            Naši najprodavaniji proizvodi
          </h2>
        </div>

        {/* Products Carousel - Modern Scroll with Side Arrows */}
        <div className="relative">
          {/* Left Arrow - Modern Style, izvan scroll container-a */}
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-20 z-30 w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 disabled:opacity-0 disabled:cursor-not-allowed disabled:pointer-events-none shadow-xl backdrop-blur-sm"
            style={{
              backgroundColor: canScrollLeft ? 'rgba(255, 255, 255, 0.95)' : 'transparent',
              border: '2px solid var(--honey-gold)',
              color: 'var(--honey-gold)',
            }}
            onMouseEnter={(e) => {
              if (canScrollLeft && scrollContainerRef.current) {
                e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1.15)';
                e.currentTarget.style.backgroundColor = 'var(--honey-gold)';
                e.currentTarget.style.color = 'white';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(212, 167, 44, 0.5)';
                // "Trznuti" artikle u lijevo
                scrollContainerRef.current.style.transform = 'translateX(-10px)';
              }
            }}
            onMouseLeave={(e) => {
              if (canScrollLeft && scrollContainerRef.current) {
                e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1)';
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
                e.currentTarget.style.color = 'var(--honey-gold)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                scrollContainerRef.current.style.transform = 'translateX(0)';
              }
            }}
            aria-label="Prethodni proizvodi"
          >
            <svg
              className="w-7 h-7"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              style={{ strokeWidth: 2.5 }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          {/* Right Arrow - Modern Style, izvan scroll container-a */}
          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-20 z-30 w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 disabled:opacity-0 disabled:cursor-not-allowed disabled:pointer-events-none shadow-xl backdrop-blur-sm"
            style={{
              backgroundColor: canScrollRight ? 'rgba(255, 255, 255, 0.95)' : 'transparent',
              border: '2px solid var(--honey-gold)',
              color: 'var(--honey-gold)',
            }}
            onMouseEnter={(e) => {
              if (canScrollRight && scrollContainerRef.current) {
                e.currentTarget.style.transform = 'translate(50%, -50%) scale(1.15)';
                e.currentTarget.style.backgroundColor = 'var(--honey-gold)';
                e.currentTarget.style.color = 'white';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(212, 167, 44, 0.5)';
                // "Trznuti" artikle u desno
                scrollContainerRef.current.style.transform = 'translateX(10px)';
              }
            }}
            onMouseLeave={(e) => {
              if (canScrollRight && scrollContainerRef.current) {
                e.currentTarget.style.transform = 'translate(50%, -50%) scale(1)';
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
                e.currentTarget.style.color = 'var(--honey-gold)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                scrollContainerRef.current.style.transform = 'translateX(0)';
              }
            }}
            aria-label="Sljedeći proizvodi"
          >
            <svg
              className="w-7 h-7"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              style={{ strokeWidth: 2.5 }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          {/* Scroll Container */}
          <div
            ref={scrollContainerRef}
            className="flex gap-4 max-md:gap-3 overflow-x-auto scrollbar-hide pb-6 scroll-smooth transition-transform duration-300"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              scrollBehavior: 'smooth',
            }}
            onScroll={checkScrollability}
          >
            {bestSellingProducts.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
                priority={index < 3} // Priority for first 3 products
              />
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}

const getDefaultWeight = (product: Product, preferredWeight = '450g'): string => {
  if (product.availableWeights.includes(preferredWeight)) {
    return preferredWeight;
  }

  if (product.availableWeights.includes(product.weight)) {
    return product.weight;
  }

  return product.availableWeights[0] ?? product.weight;
};

// Product Card Component
type ProductCardProps = {
  product: Product;
  onAddToCart: (e: React.MouseEvent, productId: number) => void;
};

function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const { toggleFavorite, isFavorite, favorites } = useFavorites();
  const [isLiked, setIsLiked] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  useEffect(() => {
    setIsLiked(isFavorite(product.id));
  }, [favorites, product.id, isFavorite]);

  const displayWeight = getDefaultWeight(product);
  const basePrice =
    displayWeight !== product.weight
      ? calculatePriceByWeight(product, displayWeight)
      : product.price;
  
  const isFeatured = isFeaturedOffer(product);
  const displayPrice = getDiscountedPrice(basePrice, isFeatured);

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Prevent double-click or multiple rapid clicks
    if (isToggling) return;
    
    setIsToggling(true);
    toggleFavorite(product.id);
    
    // Reset after a short delay
    setTimeout(() => {
      setIsToggling(false);
    }, 300);
  };

  return (
    <Link
      href={`${ROUTES.PRODUCTS}/${product.slug}`}
      className="block bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 flex-shrink-0 w-80 max-md:w-[calc(100vw-3rem)] max-sm:w-[calc(100vw-2rem)] group"
      style={{
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        border: '1px solid transparent',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-6px)';
        e.currentTarget.style.boxShadow = '0 12px 28px rgba(0, 0, 0, 0.15)';
        e.currentTarget.style.borderColor = 'var(--honey-gold)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
        e.currentTarget.style.borderColor = 'transparent';
      }}
    >
      {/* Image Section */}
      <div className="relative w-full h-72 overflow-hidden bg-gradient-to-b from-amber-50 to-amber-100">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
          sizes="320px"
          loading="lazy"
        />

        {/* Heart Icon - Top Right */}
        <button
          onClick={handleFavorite}
          className="absolute top-4 right-4 w-10 h-10 rounded-lg border-2 flex items-center justify-center transition-colors shadow-md"
          style={{
            borderColor: isLiked ? '#dc2626' : 'var(--border-light)',
            backgroundColor: isLiked ? '#fef2f2' : 'white',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#dc2626';
            e.currentTarget.style.backgroundColor = '#fef2f2';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = isLiked ? '#dc2626' : 'var(--border-light)';
            e.currentTarget.style.backgroundColor = isLiked ? '#fef2f2' : 'white';
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

        {/* Discount Badge */}
        {isFeatured && (
          <div
            className="absolute top-4 left-4 px-3 py-1 rounded-md text-xs font-bold text-white shadow-md"
            style={{
              backgroundColor: '#dc2626',
            }}
          >
            -15%
          </div>
        )}

        {/* Seller Avatar - Bottom Left */}
        <div
          className="absolute bottom-4 left-4 flex items-center gap-2 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-full shadow-md cursor-pointer transition-opacity hover:opacity-85"
          role="button"
          tabIndex={0}
          aria-label={`Profil pčelara ${product.seller.name}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            window.location.href = `/pcelari/${createSellerSlug(product.seller.name)}`;
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              e.stopPropagation();
              window.location.href = `/pcelari/${createSellerSlug(product.seller.name)}`;
            }
          }}
        >
          <div className="relative w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-white">
            <Image
              src={product.seller.avatar}
              alt={product.seller.name}
              fill
              className="object-cover"
              sizes="32px"
              quality={100}
            />
          </div>
          <span
            className="text-xs font-semibold"
            style={{
              color: 'var(--dark-text)',
              fontFamily: 'var(--font-inter)',
            }}
          >
            {product.seller.name}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6">
        {/* Title */}
        <h3
          className="text-xl font-bold mb-3 line-clamp-2 min-h-[3rem]"
          style={{
            color: 'var(--dark-text)',
            fontFamily: 'var(--font-serif)',
          }}
        >
          {product.name}
        </h3>

        {/* Rating and Reviews */}
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
            className="text-sm font-medium leading-none"
            style={{
              color: 'var(--body-text)',
              fontFamily: 'var(--font-inter)',
            }}
          >
            {product.rating.toFixed(1)} ({product.reviews})
          </span>
        </div>

        {/* Location */}
        <div className="flex items-center gap-2 mb-2">
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

        {/* Stock Status */}
        <div className="mb-4">
          {product.inStock ? (
            <span
              className="text-sm font-medium"
              style={{
                color: 'var(--price-color)',
                fontFamily: 'var(--font-inter)',
              }}
            >
              Na stanju ({product.stock} komada)
            </span>
          ) : (
            <span
              className="text-sm font-medium px-2 py-1 rounded"
              style={{
                color: '#dc2626',
                backgroundColor: '#fef2f2',
                fontFamily: 'var(--font-inter)',
              }}
            >
              Nema na stanju
            </span>
          )}
        </div>

        {/* Price and Weight */}
        <div className="flex items-baseline justify-between mb-4 pb-4 border-b" style={{ borderColor: 'var(--border-light)' }}>
          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
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
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {/* Add to Cart Button */}
          <button
            onClick={(e) => onAddToCart(e, product.id)}
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
            aria-label={product.inStock ? 'Dodaj u korpu' : 'Proizvod nije na stanju'}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

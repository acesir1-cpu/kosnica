'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getAllProducts, createSellerSlug, calculatePriceByWeight, type Product } from '@/lib/data';
import { ROUTES } from '@/config/constants';
import { useCart } from '@/hooks/useCart';
import { useFavorites } from '@/hooks/useFavorites';
import { useToastContext } from '@/components/ToastProvider';

export default function FeaturedBeekeeper() {
  const { addToCart } = useCart();
  const { toggleFavorite, isFavorite, addFavorite, removeFavorite } = useFavorites();
  const { showToast } = useToastContext();
  const [isAdding, setIsAdding] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  // Get featured product - prioritize "sumski-med" from Tuzla
  const featuredProduct = useMemo(() => {
    const allProducts = getAllProducts();
    // First priority: "sumski-med" from Tuzla
    let product = allProducts.find(
      (p) => p.categorySlug === 'sumski-med' && p.seller.location === 'Tuzla' && p.inStock
    );
    
    // Second priority: any "sumski-med" product
    if (!product) {
      product = allProducts.find((p) => p.categorySlug === 'sumski-med' && p.inStock);
    }
    
    // Third priority: product from Tuzla with good rating
    if (!product) {
      product = allProducts.find(
        (p) => p.seller.location === 'Tuzla' && p.rating >= 4.0 && p.inStock
      );
    }
    
    // Fallback: any product with good rating
    if (!product) {
      product = allProducts.find((p) => p.rating >= 4.5 && p.inStock);
    }
    
    // Final fallback: any in-stock product
    if (!product) {
      product = allProducts.find((p) => p.inStock);
    }
    
    return product;
  }, []);

  if (!featuredProduct) {
    return null;
  }

  const isLiked = isFavorite(featuredProduct.id);
  
  // Determine display weight: default to 450g, or use product's default weight
  const defaultWeight = '450g';
  const displayWeight = featuredProduct.availableWeights.includes(defaultWeight)
    ? defaultWeight
    : featuredProduct.weight;
  
  // Calculate base price for selected weight
  const basePrice = displayWeight !== featuredProduct.weight
    ? calculatePriceByWeight(featuredProduct, displayWeight)
    : featuredProduct.price;
  
  // Calculate discount price (15% off)
  const originalPrice = basePrice;
  const discountedPrice = Math.round(originalPrice * 0.85);

  const handleAddToCart = () => {
    if (isAdding) return;
    
    if (!featuredProduct.inStock) {
      showToast('Proizvod nije na stanju', 'error');
      return;
    }
    
    setIsAdding(true);
    addToCart(featuredProduct.id, 1, displayWeight);
    showToast(`${featuredProduct.name} (${displayWeight}) je dodan u korpu!`, 'success');
    
    setTimeout(() => {
      setIsAdding(false);
    }, 800);
  };

  const handleFavorite = () => {
    if (isToggling) return;
    
    setIsToggling(true);
    const wasLiked = isFavorite(featuredProduct.id);
    
    // Store product ID in closure for undo
    const productId = featuredProduct.id;
    
    if (wasLiked) {
      // Remove from favorites
      removeFavorite(productId);
      // Undo: add back to favorites - no delay needed since we update localStorage directly
      showToast(
        `${featuredProduct.name} je uklonjen iz omiljenih`, 
        'info',
        4000,
        () => {
          // Directly call addFavorite - it will handle localStorage correctly
          addFavorite(productId);
        }
      );
    } else {
      // Add to favorites
      addFavorite(productId);
      // Undo: remove from favorites with small delay to ensure state is updated
      showToast(
        `${featuredProduct.name} je dodan u omiljene`, 
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
    
    setTimeout(() => {
      setIsToggling(false);
    }, 800);
  };

  // Get beekeeper quote (mock data - in real app this would come from database)
  const beekeeperQuote = `"Ovaj med je u košnicama bio do jučer, svježije od ovoga ne može." - ${featuredProduct.seller.name}`;

  return (
    <section className="py-24" style={{ backgroundColor: 'var(--cream)' }}>
      <div className="container mx-auto px-8 max-lg:px-6 max-md:px-4 max-w-7xl">
        {/* Section Title */}
        <h2
          className="text-4xl max-md:text-3xl font-bold mb-12"
          style={{
            fontFamily: 'var(--font-serif)',
            color: 'var(--dark-text)',
            letterSpacing: '0.02em',
          }}
        >
          Izdvojene ponude
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Left Section - Images */}
          <div className="relative">
            {/* Main Product Image */}
            <div className="relative w-full h-96 max-md:h-64 rounded-2xl overflow-hidden mb-6 shadow-lg">
              <div className="relative w-full h-full rounded-2xl overflow-hidden">
                <Image
                  src={featuredProduct.image}
                  alt={featuredProduct.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              </div>
              
              {/* Limited Offer Badge */}
              <div className="absolute top-4 right-4 z-20">
                <div
                  className="px-3 py-1.5 rounded-full shadow-md"
                  style={{
                    backgroundColor: '#dc2626',
                  }}
                >
                  <span
                    className="text-xs font-semibold text-white uppercase tracking-wide"
                    style={{ fontFamily: 'var(--font-inter)' }}
                  >
                    24h ponuda
                  </span>
                </div>
              </div>
            </div>

            {/* Circular Beekeeper Image */}
            <div className="relative flex justify-center">
              <div className="relative w-48 h-48 max-md:w-40 max-md:h-40 rounded-full overflow-hidden border-4 border-white shadow-xl" style={{ marginTop: '-80px' }}>
                <Image
                  src={featuredProduct.seller.avatar}
                  alt={featuredProduct.seller.name}
                  fill
                  className="object-cover"
                  sizes="192px"
                  quality={100}
                />
              </div>
            </div>

            {/* Meet Beekeeper Link */}
            <div className="mt-6 text-center">
              <Link
                href={`/pcelari/${createSellerSlug(featuredProduct.seller.name)}`}
                className="text-base font-medium hover:underline transition-colors"
                style={{
                  color: 'var(--honey-gold)',
                  fontFamily: 'var(--font-inter)',
                }}
              >
                Upoznaj pčelara →
              </Link>
            </div>
          </div>

          {/* Right Section - Product Details */}
            <div className="space-y-6">
            {/* Header */}
              <div className="flex items-center gap-3 mb-4 flex-wrap">
              <span
                  className="text-sm font-semibold px-3 py-1 rounded-full"
                style={{
                    color: 'var(--dark-text)',
                    backgroundColor: 'rgba(212, 167, 44, 0.15)',
                  fontFamily: 'var(--font-inter)',
                }}
              >
                  Dnevna ponuda
              </span>
              <div className="flex items-center gap-1.5">
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
                  className="text-base"
                  style={{
                    color: 'var(--dark-text)',
                    fontFamily: 'var(--font-inter)',
                  }}
                >
                  {featuredProduct.seller.location}
                </span>
              </div>
            </div>

            {/* Product Title */}
            <Link href={`${ROUTES.PRODUCTS}/${featuredProduct.slug}`}>
              <h3
                className="text-3xl max-md:text-2xl font-bold hover:opacity-80 transition-opacity cursor-pointer"
                style={{
                  fontFamily: 'var(--font-serif)',
                  color: 'var(--dark-text)',
                  letterSpacing: '0.02em',
                }}
              >
                {featuredProduct.name} porodice {featuredProduct.seller.name.split(' ')[1] || featuredProduct.seller.name}
              </h3>
            </Link>

            {/* Slogan */}
            <p
              className="text-base mt-4"
              style={{
                color: 'var(--body-text)',
                fontFamily: 'var(--font-inter)',
              }}
            >
              Svaki dan biramo jednog partnera čiji nas rad inspiriše.
            </p>

            {/* Offer Text */}
            <div
              className="text-base leading-relaxed"
              style={{
                color: 'var(--body-text)',
                fontFamily: 'var(--font-inter)',
              }}
            >
              <p>
                Danas je to {featuredProduct.seller.name.split(' ')[0]}.{' '}
                <span style={{ color: 'var(--honey-gold)', fontWeight: '600' }}>
                  Samo u naredna 24 sata
                </span>
                , {featuredProduct.seller.name.split(' ')[0]} je za vas izdvojio svoj nagrađivani{' '}
                {featuredProduct.name.toLowerCase()} po posebnoj cijeni.
              </p>
            </div>

            {/* Quote */}
            <div
              className="text-base italic border-l-4 pl-4"
              style={{
                color: 'var(--body-text)',
                fontFamily: 'var(--font-inter)',
                borderColor: 'rgba(212, 167, 44, 0.35)',
              }}
            >
              {beekeeperQuote}
            </div>

            {/* Pricing */}
            <div className="space-y-2">
              <div className="flex items-baseline gap-4">
                <span
                  className="text-xl line-through"
                  style={{
                    color: '#9ca3af',
                    fontFamily: 'var(--font-inter)',
                  }}
                >
                  {originalPrice} {featuredProduct.currency}
                </span>
                <span
                  className="text-4xl max-md:text-3xl font-bold"
                  style={{
                    color: 'var(--price-color)',
                    fontFamily: 'var(--font-inter)',
                  }}
                >
                  {discountedPrice} {featuredProduct.currency}
                </span>
              </div>
              <p
                className="text-sm"
                style={{
                  color: 'var(--body-text)',
                  fontFamily: 'var(--font-inter)',
                  opacity: 0.8,
                }}
              >
                / {displayWeight}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch gap-3 pt-4">
              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={!featuredProduct.inStock || isAdding}
                className="flex-1 h-12 rounded-lg flex items-center justify-center gap-3 font-semibold text-base transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: featuredProduct.inStock ? 'var(--honey-gold)' : 'var(--border-light)',
                  color: featuredProduct.inStock ? 'white' : 'var(--body-text)',
                  fontFamily: 'var(--font-inter)',
                }}
                onMouseEnter={(e) => {
                  if (featuredProduct.inStock && !e.currentTarget.disabled) {
                    e.currentTarget.style.backgroundColor = 'var(--honey-light)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (featuredProduct.inStock) {
                    e.currentTarget.style.backgroundColor = 'var(--honey-gold)';
                  }
                }}
                aria-label={featuredProduct.inStock ? 'Dodaj u korpu' : 'Proizvod nije na stanju'}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                Dodaj u korpu
              </button>

              {/* View Product Button */}
              <Link
                href={`${ROUTES.PRODUCTS}/${featuredProduct.slug}`}
                className="px-6 py-3 rounded-lg border-2 font-medium text-base transition-colors flex items-center justify-center gap-2"
                style={{
                  borderColor: 'var(--blue-primary)',
                  color: 'var(--blue-primary)',
                  backgroundColor: 'white',
                  fontFamily: 'var(--font-inter)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--blue-primary)';
                  e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.color = 'var(--blue-primary)';
                }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
                Pogledaj proizvod
              </Link>

              {/* Favorite Button */}
              <button
                onClick={handleFavorite}
                className="w-12 h-12 rounded-lg border-2 flex items-center justify-center transition-colors"
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
                aria-label={isLiked ? 'Ukloni iz omiljenih' : 'Dodaj u omiljene'}
              >
                <svg
                  className="w-6 h-6"
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
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

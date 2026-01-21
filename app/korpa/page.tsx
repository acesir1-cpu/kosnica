'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';
import { ROUTES } from '@/config/constants';
import { getProductById, type Product, calculatePriceByWeight, calculateDeliveryCost, isFeaturedOffer, getDiscountedPrice } from '@/lib/data';
import { useCart } from '@/hooks/useCart';
import { useFavorites } from '@/hooks/useFavorites';
import { useAuth } from '@/hooks/useAuth';
import { useToastContext } from '@/components/ToastProvider';
import CustomerAlsoBought from '@/components/CustomerAlsoBought';
import WishlistCarousel from '@/components/WishlistCarousel';
import Footer from '@/components/Footer';
import Pagination from '@/components/Pagination';

const ITEMS_PER_PAGE = 8;

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart, clearCart, addToCart } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToastContext();
  const [promocode, setPromocode] = useState('');
  const [appliedPromocode, setAppliedPromocode] = useState<string | null>(null);
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Get full product data for cart items
  const cartProducts = useMemo(() => {
    return cartItems
      .map((item) => {
        const product = getProductById(item.productId);
        if (!product) return null;
        return {
          ...item,
          product,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }, [cartItems]);

  // Pagination
  const totalPages = Math.ceil(cartProducts.length / ITEMS_PER_PAGE);
  const paginatedCartProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return cartProducts.slice(startIndex, endIndex);
  }, [cartProducts, currentPage]);

  // Reset to page 1 when cart changes
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [cartProducts.length, currentPage, totalPages]);

  // Calculate totals
  const totals = useMemo(() => {
    const itemsTotal = cartProducts.reduce((sum, item) => {
      const basePrice = calculatePriceByWeight(item.product, item.weight);
      const isFeatured = isFeaturedOffer(item.product);
      const itemPrice = getDiscountedPrice(basePrice, isFeatured);
      return sum + itemPrice * item.quantity;
    }, 0);

    // Calculate delivery cost based on order total (free for orders over 50 KM)
    const deliveryCost = itemsTotal > 0 ? calculateDeliveryCost(itemsTotal) : 0;
    const tax = itemsTotal * 0.17; // 17% tax
    const discount = appliedPromocode ? itemsTotal * 0.1 : 0; // 10% discount if promocode applied

    const total = itemsTotal + deliveryCost + tax - discount;

    return {
      itemsTotal,
      deliveryCost,
      tax,
      discount,
      total,
    };
  }, [cartProducts, appliedPromocode]);

  // Intersection Observer for scroll animations - only animate once
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !entry.target.classList.contains('animate-fade-in')) {
            entry.target.classList.add('animate-fade-in');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    const sections = document.querySelectorAll('[data-animate-section]');
    sections.forEach((section) => observer.observe(section));

    return () => {
      sections.forEach((section) => observer.unobserve(section));
    };
  }, [cartProducts]);

  const handleApplyPromocode = () => {
    if (promocode.trim()) {
      // Simple promocode validation - in real app, check against database
      const validPromocodes = ['kosnica10', 'med10', 'promo'];
      if (validPromocodes.includes(promocode.toLowerCase())) {
        setAppliedPromocode(promocode);
        // Save to localStorage so it persists across pages
        localStorage.setItem('kosnica_applied_promocode', promocode);
        showToast('Promocode je uspješno primijenjen!', 'success');
      } else {
        showToast('Nevažeći promocode', 'error');
      }
    }
  };

  // Load applied promocode from localStorage on mount
  useEffect(() => {
    const savedPromocode = localStorage.getItem('kosnica_applied_promocode');
    if (savedPromocode) {
      // Validate that the saved promocode is still valid
      const validPromocodes = ['kosnica10', 'med10', 'promo'];
      if (validPromocodes.includes(savedPromocode.toLowerCase())) {
        setAppliedPromocode(savedPromocode);
      } else {
        localStorage.removeItem('kosnica_applied_promocode');
      }
    }
  }, []);

  const handleMoveToWishlist = (productId: number) => {
    toggleFavorite(productId);
  };

  if (cartProducts.length === 0) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--cream)' }}>
        <div className="container mx-auto px-8 max-lg:px-6 max-md:px-4 py-12 max-w-7xl">
          <Breadcrumbs
            items={[
              { label: 'Početna', href: ROUTES.HOME },
              { label: 'Korpa', href: undefined },
            ]}
          />
          <div className="text-center py-20">
            <svg
              className="w-24 h-24 mx-auto mb-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              style={{ color: 'var(--border-light)' }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <h2
              className="text-3xl font-bold mb-4"
              style={{
                fontFamily: 'var(--font-serif)',
                color: 'var(--dark-text)',
              }}
            >
              Vaša korpa je prazna
            </h2>
            <p
              className="text-lg mb-8"
              style={{
                color: 'var(--body-text)',
                fontFamily: 'var(--font-inter)',
              }}
            >
              Dodajte proizvode u korpu da nastavite sa kupovinom
            </p>
            <Link
              href={ROUTES.PRODUCTS}
              className="inline-block px-8 py-4 rounded-lg font-semibold transition-all"
              style={{
                backgroundColor: 'var(--honey-gold)',
                color: 'white',
                fontFamily: 'var(--font-inter)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--honey-light)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--honey-gold)';
              }}
            >
              Pregledaj proizvode
            </Link>
          </div>

          {/* Customer Also Bought Section - Show even when cart is empty */}
          <CustomerAlsoBought currentCartProductIds={[]} />

          {/* Wishlist Section - Show even when cart is empty */}
          <WishlistCarousel />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <>
    <div className="min-h-screen" style={{ backgroundColor: 'var(--cream)' }}>
      <div className="container mx-auto px-8 max-lg:px-6 max-md:px-4 max-sm:px-3 py-12 max-md:py-8 max-sm:py-6 max-w-7xl">
        <Breadcrumbs
          items={[
            { label: 'Početna', href: ROUTES.HOME },
            { label: 'Korpa', href: undefined },
          ]}
        />

        <div className="flex flex-col lg:flex-row gap-8 mt-8 items-start" style={{ alignItems: 'flex-start' }}>
          {/* Left Section - Cart Items */}
          <div className="flex-1 w-full lg:max-w-none" style={{ minWidth: 0 }}>
            <div className="mb-6">
              <h1
                className="text-4xl max-md:text-3xl max-sm:text-2xl font-bold mb-2"
                style={{
                  fontFamily: 'var(--font-serif)',
                  color: 'var(--dark-text)',
                }}
              >
                Vaša korpa
              </h1>
              <p
                className="text-lg max-md:text-base"
                style={{
                  color: 'var(--body-text)',
                  fontFamily: 'var(--font-inter)',
                }}
              >
                {cartProducts.length} {cartProducts.length === 1 ? 'proizvod' : 'proizvoda'} u vašoj korpi
              </p>
            </div>

            {/* Cart Items List */}
            <div data-animate-section className="space-y-4 mb-6">
              {paginatedCartProducts.length > 0 ? (
                <>
                  {paginatedCartProducts.map((item) => {
                const isLiked = isFavorite(item.product.id);
                const basePrice = calculatePriceByWeight(item.product, item.weight);
                const isFeatured = isFeaturedOffer(item.product);
                const displayPrice = getDiscountedPrice(basePrice, isFeatured);
                return (
                  <div
                    key={`${item.productId}-${item.weight}`}
                    className="bg-white rounded-lg p-5 max-md:p-4 max-sm:p-3 border relative group transition-all duration-300 hover:shadow-lg"
                    style={{
                      borderColor: 'var(--border-light)',
                    }}
                  >
                    {/* Remove Button - Visible on hover */}
                    <button
                      onClick={() => {
                        // Store previous quantity for undo
                        const previousQuantity = item.quantity;
                        removeFromCart(item.productId, item.weight);
                        showToast(
                          `${item.product.name} je uklonjen iz korpe`, 
                          'info',
                          4000,
                          () => {
                            // Undo: add back to cart with previous quantity
                            addToCart(item.productId, previousQuantity, item.weight);
                          }
                        );
                      }}
                      className="absolute -top-2 -right-2 z-20 w-8 h-8 rounded-full bg-white border-2 border-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-50"
                      aria-label="Ukloni iz korpe"
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
                    {/* Seller Info - Bottom Right Corner */}
                    <div className="absolute bottom-5 right-5 flex items-center gap-2 max-md:relative max-md:bottom-0 max-md:right-0 max-md:mt-3 max-md:justify-start">
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
                        className="text-sm font-medium"
                        style={{
                          color: 'var(--dark-text)',
                          fontFamily: 'var(--font-inter)',
                        }}
                      >
                        {item.product.seller.name}
                      </span>
                    </div>

                    <div className="flex gap-6 max-md:flex-col">
                      {/* Product Image */}
                      <Link 
                        href={`${ROUTES.PRODUCTS}/${item.product.slug}`}
                        className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 hover:opacity-90 transition-opacity"
                      >
                        <Image
                          src={item.product.image}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                          sizes="96px"
                        />
                      </Link>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`${ROUTES.PRODUCTS}/${item.product.slug}`}
                          className="block hover:opacity-80 transition-opacity"
                        >
                          <h3
                            className="text-lg font-bold mb-3"
                            style={{
                              fontFamily: 'var(--font-serif)',
                              color: 'var(--dark-text)',
                            }}
                          >
                            {item.product.name}
                          </h3>
                        </Link>
                        <div className="space-y-1 mb-4">
                          <p
                            className="text-sm"
                            style={{
                              color: 'var(--body-text)',
                              fontFamily: 'var(--font-inter)',
                            }}
                          >
                            Težina: {item.weight}
                          </p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <p
                              className="text-sm"
                              style={{
                                color: 'var(--body-text)',
                                fontFamily: 'var(--font-inter)',
                              }}
                            >
                              Cijena:{' '}
                            </p>
                            {isFeatured && (
                              <span
                                className="text-sm line-through"
                                style={{
                                  color: '#9ca3af',
                                  fontFamily: 'var(--font-inter)',
                                }}
                              >
                                {basePrice} {item.product.currency}
                              </span>
                            )}
                            <span
                              className="text-sm font-semibold"
                              style={{
                                color: isFeatured ? 'var(--price-color)' : 'var(--body-text)',
                                fontFamily: 'var(--font-inter)',
                              }}
                            >
                              {displayPrice} {item.product.currency}
                            </span>
                            <span
                              className="text-sm"
                              style={{
                                color: 'var(--body-text)',
                                fontFamily: 'var(--font-inter)',
                              }}
                            >
                              / po komadu
                            </span>
                            {isFeatured && (
                              <span
                                className="px-2 py-0.5 rounded text-xs font-semibold text-white"
                                style={{
                                  backgroundColor: '#dc2626',
                                  fontFamily: 'var(--font-inter)',
                                }}
                              >
                                -15%
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Quantity Selector and Actions */}
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <label
                              className="text-sm font-medium"
                              style={{
                                color: 'var(--dark-text)',
                                fontFamily: 'var(--font-inter)',
                              }}
                            >
                              Količina:
                            </label>
                            <select
                              value={item.quantity}
                              onChange={(e) => {
                                const newQuantity = Number(e.target.value);
                                const maxQuantity = Math.min(item.product.stock, 10);
                                if (newQuantity <= maxQuantity) {
                                  updateQuantity(item.productId, item.weight, newQuantity);
                                  showToast('Količina je ažurirana', 'success');
                                } else {
                                  showToast(`Maksimalna dostupna količina je ${maxQuantity}`, 'error');
                                }
                              }}
                              className="px-3 py-1.5 rounded-lg border-2 focus:outline-none text-sm"
                              style={{
                                borderColor: 'var(--border-light)',
                                fontFamily: 'var(--font-inter)',
                                color: 'var(--dark-text)',
                                backgroundColor: 'white',
                              }}
                              onFocus={(e) => {
                                e.currentTarget.style.borderColor = 'var(--honey-gold)';
                              }}
                              onBlur={(e) => {
                                e.currentTarget.style.borderColor = 'var(--border-light)';
                              }}
                              aria-label="Odaberi količinu"
                            >
                              {[...Array(Math.min(item.product.stock, 10))].map((_, i) => (
                                <option key={i + 1} value={i + 1}>
                                  {i + 1}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleMoveToWishlist(item.product.id)}
                              className="w-9 h-9 rounded-lg border-2 flex items-center justify-center transition-colors"
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
                                className="w-4 h-4"
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
                            <button
                              onClick={() => {
                                // Store previous quantity for undo
                                const previousQuantity = item.quantity;
                                removeFromCart(item.productId, item.weight);
                                showToast(
                                  `${item.product.name} je uklonjen iz korpe`, 
                                  'info',
                                  4000,
                                  () => {
                                    // Undo: add back to cart with previous quantity
                                    addToCart(item.productId, previousQuantity, item.weight);
                                  }
                                );
                              }}
                              className="w-9 h-9 rounded-lg border-2 flex items-center justify-center transition-colors"
                              style={{
                                borderColor: 'var(--border-light)',
                                color: 'var(--body-text)',
                                backgroundColor: 'white',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = '#dc2626';
                                e.currentTarget.style.backgroundColor = '#fef2f2';
                                e.currentTarget.style.color = '#dc2626';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = 'var(--border-light)';
                                e.currentTarget.style.backgroundColor = 'white';
                                e.currentTarget.style.color = 'var(--body-text)';
                              }}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Total Price */}
                      <div className="text-right max-md:text-left max-md:mt-4 flex-shrink-0">
                        <div className="flex flex-col items-end max-md:items-start">
                          {isFeatured && (
                            <span
                              className="text-sm line-through mb-0.5"
                              style={{
                                color: '#9ca3af',
                                fontFamily: 'var(--font-inter)',
                              }}
                            >
                              {basePrice * item.quantity} {item.product.currency}
                            </span>
                          )}
                          <p
                            className="text-xl font-bold"
                            style={{
                              color: 'var(--price-color)',
                              fontFamily: 'var(--font-inter)',
                            }}
                          >
                            {displayPrice * item.quantity} {item.product.currency}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
                  })}
                  
                  {/* Pagination for Cart Items */}
                  {totalPages > 1 && (
                    <div className="mt-6 pt-6 border-t" style={{ borderColor: 'var(--border-light)' }}>
                      <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={(page) => {
                          setCurrentPage(page);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                      />
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <p
                    className="text-base"
                    style={{
                      color: 'var(--body-text)',
                      fontFamily: 'var(--font-inter)',
                    }}
                  >
                    Nema proizvoda na ovoj stranici
                  </p>
                </div>
              )}
              </div>

            {/* Remove All Button */}
            {cartProducts.length > 0 && (
              <div className="relative">
                {showConfirmClear ? (
                  <div className="flex items-center gap-2 bg-white rounded-lg p-2 border-2 shadow-md" style={{ borderColor: 'var(--border-light)' }}>
                    <span className="text-sm font-medium px-2" style={{ color: 'var(--dark-text)', fontFamily: 'var(--font-inter)' }}>
                      Obrisati sve?
                    </span>
                    <button
                      onClick={() => {
                        clearCart();
                        setAppliedPromocode(null);
                        localStorage.removeItem('kosnica_applied_promocode');
                        showToast('Svi proizvodi su uklonjeni iz korpe', 'info');
                        setShowConfirmClear(false);
                      }}
                      className="px-3 py-1.5 rounded text-sm font-medium transition-colors"
                      style={{
                        backgroundColor: '#dc2626',
                        color: 'white',
                        fontFamily: 'var(--font-inter)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#b91c1c';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#dc2626';
                      }}
                    >
                      Da
                    </button>
                    <button
                      onClick={() => setShowConfirmClear(false)}
                      className="px-3 py-1.5 rounded text-sm font-medium transition-colors"
                      style={{
                        backgroundColor: 'var(--border-light)',
                        color: 'var(--dark-text)',
                        fontFamily: 'var(--font-inter)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#e5e5e5';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--border-light)';
                      }}
                    >
                      Ne
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowConfirmClear(true)}
                    className="text-base font-medium transition-colors hover:underline"
                    style={{
                      color: '#dc2626',
                      fontFamily: 'var(--font-inter)',
                    }}
                  >
                    Ukloni sve iz korpe
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Right Section - Order Summary */}
          <aside className="w-full lg:w-96 lg:flex-shrink-0 lg:sticky lg:top-24 lg:self-start">
            <div 
              data-animate-section 
              className="bg-white rounded-xl p-6 shadow-sm border transition-all duration-300 hover:shadow-lg" 
              style={{ 
                borderColor: 'var(--border-light)',
                maxHeight: 'calc(100vh - 8rem)',
                overflowY: 'auto',
                overflowX: 'hidden',
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(0, 0, 0, 0.2) transparent',
                WebkitOverflowScrolling: 'touch',
              }}
            >
              <h2
                className="text-2xl font-bold mb-6"
                style={{
                  fontFamily: 'var(--font-serif)',
                  color: 'var(--dark-text)',
                }}
              >
                Sažetak narudžbe
              </h2>

              {/* Promocode */}
              <div className="mb-6">
                <label
                  className="block text-sm font-medium mb-2"
                  style={{
                    color: 'var(--dark-text)',
                    fontFamily: 'var(--font-inter)',
                  }}
                >
                  Promocode
                </label>
                <div className="flex gap-2 w-full">
                  <input
                    type="text"
                    value={promocode}
                    onChange={(e) => setPromocode(e.target.value)}
                    placeholder="Unesite kod"
                    className="flex-1 min-w-0 px-4 py-2 rounded-lg border-2 focus:outline-none focus:ring-2"
                    style={{
                      borderColor: 'var(--border-light)',
                      fontFamily: 'var(--font-inter)',
                      color: 'var(--dark-text)',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'var(--honey-gold)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-light)';
                    }}
                  />
                  <button
                    onClick={handleApplyPromocode}
                    className="px-4 py-2 rounded-lg font-medium transition-all duration-200 flex-shrink-0 whitespace-nowrap"
                    style={{
                      background: 'linear-gradient(135deg, #f5c852 0%, #f0c855 100%)',
                      color: 'var(--dark-text)',
                      fontFamily: 'var(--font-inter)',
                      boxShadow: '0 2px 6px rgba(212, 167, 44, 0.25)',
                      border: '1px solid rgba(212, 167, 44, 0.2)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #f8d275 0%, #f5c852 100%)';
                      e.currentTarget.style.boxShadow = '0 4px 10px rgba(212, 167, 44, 0.35)';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #f5c852 0%, #f0c855 100%)';
                      e.currentTarget.style.boxShadow = '0 2px 6px rgba(212, 167, 44, 0.25)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    Primijeni
                  </button>
                </div>
                {appliedPromocode && (
                  <p
                    className="text-sm mt-2"
                    style={{
                      color: '#16a34a',
                      fontFamily: 'var(--font-inter)',
                    }}
                  >
                    Promocode primijenjen!
                  </p>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6 pb-6 border-b" style={{ borderColor: 'var(--border-light)' }}>
                <div className="flex justify-between">
                  <span
                    className="text-base"
                    style={{
                      color: 'var(--body-text)',
                      fontFamily: 'var(--font-inter)',
                    }}
                  >
                    {cartProducts.length} {cartProducts.length === 1 ? 'proizvod' : 'proizvoda'}:
                  </span>
                  <span
                    className="text-base font-semibold"
                    style={{
                      color: 'var(--dark-text)',
                      fontFamily: 'var(--font-inter)',
                    }}
                  >
                    {totals.itemsTotal} KM
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between">
                    <span
                      className="text-base"
                      style={{
                        color: 'var(--body-text)',
                        fontFamily: 'var(--font-inter)',
                      }}
                    >
                      Troškovi dostave:
                    </span>
                    <span
                      className="text-base font-semibold"
                      style={{
                        color: totals.deliveryCost === 0 ? '#16a34a' : 'var(--dark-text)',
                        fontFamily: 'var(--font-inter)',
                      }}
                    >
                      {totals.deliveryCost} KM
                    </span>
                  </div>
                  {totals.deliveryCost === 0 && totals.itemsTotal > 50 && (
                    <div className="flex items-center gap-1.5 text-xs" style={{ color: '#16a34a', fontFamily: 'var(--font-inter)' }}>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Besplatna dostava za narudžbe preko 50 KM</span>
                    </div>
                  )}
                </div>
                <div className="flex justify-between">
                  <span
                    className="text-base"
                    style={{
                      color: 'var(--body-text)',
                      fontFamily: 'var(--font-inter)',
                    }}
                  >
                    Porez:
                  </span>
                  <span
                    className="text-base font-semibold"
                    style={{
                      color: 'var(--dark-text)',
                      fontFamily: 'var(--font-inter)',
                    }}
                  >
                    {Math.round(totals.tax)} KM
                  </span>
                </div>
                {totals.discount > 0 && (
                  <div className="flex justify-between">
                    <span
                      className="text-base"
                      style={{
                        color: 'var(--body-text)',
                        fontFamily: 'var(--font-inter)',
                      }}
                    >
                      Popust:
                    </span>
                    <span
                      className="text-base font-semibold"
                      style={{
                        color: '#16a34a',
                        fontFamily: 'var(--font-inter)',
                      }}
                    >
                      - {Math.round(totals.discount)} KM
                    </span>
                  </div>
                )}
              </div>

              {/* Total */}
              <div className="flex justify-between items-center mb-6">
                <span
                  className="text-xl font-bold"
                  style={{
                    color: 'var(--dark-text)',
                    fontFamily: 'var(--font-inter)',
                  }}
                >
                  Ukupno:
                </span>
                <span
                  className="text-2xl font-bold"
                  style={{
                    color: '#16a34a',
                    fontFamily: 'var(--font-inter)',
                  }}
                >
                  {Math.round(totals.total)} KM
                </span>
              </div>

              {/* Checkout Button */}
              <Link
                href={isAuthenticated ? ROUTES.CHECKOUT : ROUTES.LOGIN}
                className="w-full h-12 rounded-lg flex items-center justify-center gap-2 font-semibold text-base transition-all duration-200 mb-4"
                style={{
                  background: 'linear-gradient(135deg, #f5c852 0%, #f0c855 100%)',
                  color: 'var(--dark-text)',
                  fontFamily: 'var(--font-inter)',
                  boxShadow: '0 2px 8px rgba(212, 167, 44, 0.25)',
                  border: '1px solid rgba(212, 167, 44, 0.2)',
                }}
                onClick={(e) => {
                  if (!isAuthenticated) {
                    e.preventDefault();
                    showToast('Morate biti prijavljeni da biste nastavili na plaćanje', 'info');
                    // Navigate to login with return URL
                    window.location.href = `${ROUTES.LOGIN}?returnUrl=${encodeURIComponent(ROUTES.CHECKOUT)}`;
                  }
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #f8d275 0%, #f5c852 100%)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(212, 167, 44, 0.35)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #f5c852 0%, #f0c855 100%)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(212, 167, 44, 0.25)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <span>Nastavi na plaćanje</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </Link>

              {/* Delivery Information */}
              <div className="flex items-center gap-3 pt-4 border-t" style={{ borderColor: 'var(--border-light)' }}>
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  style={{ color: 'var(--honey-gold)' }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                  />
                </svg>
                <span
                  className="text-sm"
                  style={{
                    color: 'var(--body-text)',
                    fontFamily: 'var(--font-inter)',
                  }}
                >
                  Brza dostava
                </span>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Customer Also Bought Section */}
      <CustomerAlsoBought 
        currentCartProductIds={cartProducts.map(item => item.product.id)}
      />

      {/* Wishlist Section */}
      <WishlistCarousel />
    </div>
    <Footer />
    </>
  );
}

'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';
import FavoriteProductCard from '@/components/FavoriteProductCard';
import Footer from '@/components/Footer';
import Pagination from '@/components/Pagination';
import { ROUTES } from '@/config/constants';
import { getAllProducts } from '@/lib/data';
import { useFavorites } from '@/hooks/useFavorites';
import { useToastContext } from '@/components/ToastProvider';

const ITEMS_PER_PAGE = 12;

export default function FavoritesPage() {
  const { favorites, clearAllFavorites } = useFavorites();
  const { showToast } = useToastContext();
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const allProducts = getAllProducts();

  const favoriteProducts = useMemo(() => {
    return allProducts.filter((product) => favorites.includes(product.id));
  }, [favorites, allProducts]);

  // Pagination
  const totalPages = Math.ceil(favoriteProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return favoriteProducts.slice(startIndex, endIndex);
  }, [favoriteProducts, currentPage]);

  // Reset to page 1 when favorites change
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [favoriteProducts.length, currentPage, totalPages]);

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
  }, [favoriteProducts]);

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#ffffff' }}>
      {/* Breadcrumbs */}
      <div className="container mx-auto px-8 max-lg:px-6 max-md:px-4 max-w-7xl pt-8">
        <Breadcrumbs
          items={[
            { label: 'Početna', href: ROUTES.HOME },
            { label: 'Omiljeno' },
          ]}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <div className="container mx-auto px-8 max-lg:px-6 max-md:px-4 max-w-7xl py-8">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-start justify-between max-md:flex-col max-md:gap-4 mb-6">
              <div>
                <h1
                  className="text-4xl max-md:text-3xl font-bold mb-2"
                  style={{
                    fontFamily: 'var(--font-serif)',
                    color: 'var(--dark-text)',
                    letterSpacing: '0.02em',
                  }}
                >
                  Omiljeni proizvodi
                </h1>
                <p
                  className="text-base"
                  style={{
                    fontFamily: 'var(--font-inter)',
                    color: 'var(--body-text)',
                  }}
                >
                  {favoriteProducts.length > 0
                    ? `Sačuvali ste ${favoriteProducts.length} ${favoriteProducts.length === 1 ? 'proizvod' : 'proizvoda'}`
                    : 'Vaša lista omiljenih proizvoda je prazna'}
                </p>
              </div>
              
              {/* Actions */}
              {favoriteProducts.length > 0 && (
                <div className="flex items-center gap-3 max-md:w-full max-md:justify-between">
                  {totalPages > 1 && (
                    <span
                      className="text-sm"
                      style={{
                        fontFamily: 'var(--font-inter)',
                        color: 'var(--body-text)',
                      }}
                    >
                      Stranica {currentPage} od {totalPages}
                    </span>
                  )}
                  <div className="relative">
                    {showConfirmClear ? (
                      <div className="flex items-center gap-2 bg-white rounded-lg p-2 border-2 shadow-md" style={{ borderColor: 'var(--border-light)' }}>
                        <span className="text-sm font-medium px-2" style={{ color: 'var(--dark-text)', fontFamily: 'var(--font-inter)' }}>
                          Obrisati sve?
                        </span>
                        <button
                          onClick={() => {
                            clearAllFavorites();
                            showToast('Svi omiljeni proizvodi su uklonjeni', 'info');
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
                        className="px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 border"
                        style={{
                          backgroundColor: 'white',
                          color: 'var(--body-text)',
                          borderColor: 'var(--border-light)',
                          fontFamily: 'var(--font-inter)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = '#dc2626';
                          e.currentTarget.style.color = '#dc2626';
                          e.currentTarget.style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = 'var(--border-light)';
                          e.currentTarget.style.color = 'var(--body-text)';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                        Obriši sve
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Products Grid */}
          {favoriteProducts.length > 0 ? (
            <>
              <div 
                data-animate-section
                className="grid grid-cols-2 max-sm:grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mb-8"
              >
                {paginatedProducts.map((product) => (
                  <FavoriteProductCard key={product.id} product={product} />
                ))}
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8">
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
            <div className="text-center py-20 max-md:py-16">
              <div className="max-w-md mx-auto">
                <div className="w-32 h-32 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--cream)' }}>
                  <svg
                    className="w-16 h-16"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    style={{ color: 'var(--body-text)', opacity: 0.4 }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </div>
                <h2
                  className="text-2xl font-bold mb-3"
                  style={{
                    fontFamily: 'var(--font-serif)',
                    color: 'var(--dark-text)',
                  }}
                >
                  Vaša lista omiljenih proizvoda je prazna
                </h2>
                <p
                  className="text-base mb-6"
                  style={{
                    fontFamily: 'var(--font-inter)',
                    color: 'var(--body-text)',
                  }}
                >
                  Počnite da dodajete proizvode koje želite sačuvati za kasnije
                </p>
                <Link
                  href={ROUTES.PRODUCTS}
                  className="inline-block px-8 py-3 rounded-lg font-medium transition-all duration-200"
                  style={{
                    backgroundColor: 'var(--honey-gold)',
                    color: 'var(--dark-text)',
                    fontFamily: 'var(--font-inter)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--honey-light)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(212, 167, 44, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--honey-gold)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  Pregledaj proizvode
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

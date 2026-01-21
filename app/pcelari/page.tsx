'use client';

import { useMemo, useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';
import Footer from '@/components/Footer';
import { ROUTES } from '@/config/constants';
import {
  getAllBeekeepers,
  getProductsByBeekeeperSlug,
  getAllLocations,
  type Beekeeper,
} from '@/lib/data';

type BeekeeperWithStats = Beekeeper & {
  productCount: number;
  inStockCount: number;
  averageRating: number;
  totalReviews: number;
};

export default function BeekeepersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const allBeekeepers = getAllBeekeepers();
  const allLocations = getAllLocations();

  // Calculate stats for each beekeeper and filter
  const beekeepersWithStats: BeekeeperWithStats[] = useMemo(() => {
    return allBeekeepers
      .map((beekeeper) => {
        const products = getProductsByBeekeeperSlug(beekeeper.slug);
        const productCount = products.length;
        const inStockCount = products.filter((p) => p.inStock).length;
        const averageRating =
          products.length > 0
            ? products.reduce((sum, p) => sum + p.rating, 0) / products.length
            : 0;
        const totalReviews = products.reduce((sum, p) => sum + p.reviews, 0);

        return {
          ...beekeeper,
          productCount,
          inStockCount,
          averageRating: parseFloat(averageRating.toFixed(1)),
          totalReviews,
        };
      })
      .filter((beekeeper) => {
        // Filter by search query (name or location)
        const matchesSearch =
          searchQuery === '' ||
          beekeeper.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          beekeeper.location.toLowerCase().includes(searchQuery.toLowerCase());
        
        // Filter by location
        const matchesLocation =
          selectedLocation === '' || beekeeper.location === selectedLocation;

        return matchesSearch && matchesLocation;
      });
      }, [allBeekeepers, searchQuery, selectedLocation]);

  const totalBeekeepers = allBeekeepers.length;
  const displayedBeekeepers = beekeepersWithStats.length;

  const handleOpenMessageModal = (e: React.MouseEvent, beekeeper: BeekeeperWithStats) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Dispatch custom event to open chat with beekeeper
    const event = new CustomEvent('kosnica:openChat', {
      detail: {
        id: beekeeper.id,
        slug: beekeeper.slug,
        name: beekeeper.name,
      },
    });
    window.dispatchEvent(event);
  };

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
  }, [beekeepersWithStats]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--cream)' }}>
      {/* Breadcrumbs */}
      <div className="container mx-auto px-8 max-lg:px-6 max-md:px-4 pt-8 relative z-10">
        <Breadcrumbs
          items={[
            { label: 'Početna', href: ROUTES.HOME },
            { label: 'Naši pčelari', href: undefined },
          ]}
        />
      </div>

      {/* Hero Section */}
      <section data-animate-section className="relative py-20 overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 opacity-5 pointer-events-none">
          <svg viewBox="0 0 200 200" fill="none" className="w-full h-full" style={{ color: 'var(--honey-gold)' }}>
            <path
              d="M50 50 L70 50 L80 65 L70 80 L50 80 L40 65 Z"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="none"
            />
            <path
              d="M90 50 L110 50 L120 65 L110 80 L90 80 L80 65 Z"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="none"
            />
            <path
              d="M130 50 L150 50 L160 65 L150 80 L130 80 L120 65 Z"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="none"
            />
            <path
              d="M50 90 L70 90 L80 105 L70 120 L50 120 L40 105 Z"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="none"
            />
            <path
              d="M90 90 L110 90 L120 105 L110 120 L90 120 L80 105 Z"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="none"
            />
          </svg>
        </div>

        <div className="container mx-auto px-8 max-lg:px-6 max-md:px-4 max-w-7xl relative z-10">
          <div className="text-center max-w-4xl mx-auto mb-12">
            <h1
              className="text-6xl max-md:text-4xl max-sm:text-3xl font-bold mb-6"
              style={{
                fontFamily: 'var(--font-serif)',
                color: 'var(--dark-text)',
                letterSpacing: '0.05em',
              }}
            >
              Naši pčelari
            </h1>
            <p
              className="text-xl max-md:text-lg leading-relaxed"
              style={{
                fontFamily: 'var(--font-inter)',
                color: 'var(--body-text)',
                lineHeight: '1.7',
              }}
            >
              Upoznajte naše partnere koji sa ljubavlju i predanošću proizvode prirodan med
              najvišeg kvaliteta. Svaki pčelar u našoj zajednici je pažljivo odabran.
            </p>
          </div>

          {/* Search and Filter Section */}
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {/* Search Input */}
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    style={{ color: 'var(--body-text)' }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Pretraži pčelare po imenu ili lokaciji..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all"
                  style={{
                    borderColor: 'var(--border-light)',
                    backgroundColor: 'white',
                    fontFamily: 'var(--font-inter)',
                    color: 'var(--dark-text)',
                    paddingRight: searchQuery ? '2.75rem' : '1rem',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--honey-gold)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(212, 167, 44, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--border-light)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 rounded-full transition-colors hover:bg-gray-100"
                    style={{ color: 'var(--body-text)' }}
                    aria-label="Obriši pretragu"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Location Filter */}
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg
                    className="w-5 h-5"
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
                </div>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all appearance-none bg-white cursor-pointer"
                  style={{
                    borderColor: 'var(--border-light)',
                    fontFamily: 'var(--font-inter)',
                    color: selectedLocation ? 'var(--dark-text)' : 'var(--body-text)',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--honey-gold)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(212, 167, 44, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--border-light)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <option value="">Sve lokacije</option>
                  {allLocations.sort().map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
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
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Results Count */}
            <div className="text-center mb-8">
              <p
                className="text-base"
                style={{
                  fontFamily: 'var(--font-inter)',
                  color: 'var(--body-text)',
                }}
              >
                Prikazano <strong>{displayedBeekeepers}</strong> od <strong>{totalBeekeepers}</strong> pčelara
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Beekeepers Grid */}
      <section data-animate-section className="relative py-12 overflow-hidden" style={{ backgroundColor: '#ffffff' }}>
        <div className="container mx-auto px-8 max-lg:px-6 max-md:px-4 max-w-7xl relative z-10">
          {beekeepersWithStats.length === 0 ? (
            <div className="text-center py-20">
              <svg
                className="w-24 h-24 mx-auto mb-4 opacity-50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                style={{ color: 'var(--body-text)' }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <p
                className="text-xl font-medium"
                style={{
                  fontFamily: 'var(--font-inter)',
                  color: 'var(--body-text)',
                }}
              >
                Nema rezultata za vašu pretragu
              </p>
              <p
                className="text-base mt-2"
                style={{
                  fontFamily: 'var(--font-inter)',
                  color: 'var(--body-text)',
                }}
              >
                Pokušajte promijeniti kriterije pretrage
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {beekeepersWithStats.map((beekeeper) => (
                <div
                  key={beekeeper.id}
                  className="group bg-white rounded-lg overflow-hidden shadow-sm h-full flex flex-col transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1"
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
                  <Link
                    href={`/pcelari/${beekeeper.slug}`}
                    className="flex-1 flex flex-col"
                  >
                  {/* Beekeeper Image - Use profile avatar from sellers folder */}
                  <div className="relative w-full h-64 overflow-hidden bg-gray-100">
                    {beekeeper.avatar ? (
                      <Image
                        src={beekeeper.avatar}
                        alt={beekeeper.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: 'var(--cream)' }}>
                        <svg
                          className="w-24 h-24 opacity-30"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          style={{ color: 'var(--honey-gold)' }}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  {/* Beekeeper Info */}
                  <div className="p-5 flex-1 flex flex-col">
                    {/* Name and Location */}
                    <div className="mb-3">
                      <h3
                        className="text-xl font-bold mb-2 group-hover:opacity-80 transition-opacity"
                        style={{
                          fontFamily: 'var(--font-serif)',
                          color: 'var(--dark-text)',
                        }}
                      >
                        {beekeeper.name}
                      </h3>
                      <div className="flex items-center gap-1.5">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          style={{ color: 'var(--honey-gold)' }}
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
                            fontFamily: 'var(--font-inter)',
                            color: 'var(--body-text)',
                          }}
                        >
                          {beekeeper.location}
                        </span>
                      </div>
                    </div>

                    {/* Story Preview */}
                    {beekeeper.story && (
                      <p
                        className="text-sm mb-3 line-clamp-2 min-h-[2.5rem]"
                        style={{
                          fontFamily: 'var(--font-inter)',
                          color: 'var(--body-text)',
                        }}
                      >
                        {beekeeper.story.substring(0, 150)}
                        {beekeeper.story.length > 150 ? '...' : ''}
                      </p>
                    )}

                    {/* Statistics */}
                    <div className="grid grid-cols-2 gap-4 mt-auto pt-3 border-t" style={{ borderColor: 'var(--border-light)' }}>
                      <div>
                        <div
                          className="text-2xl font-bold mb-1"
                          style={{
                            fontFamily: 'var(--font-serif)',
                            color: 'var(--honey-gold)',
                          }}
                        >
                          {beekeeper.productCount}
                        </div>
                        <p
                          className="text-xs"
                          style={{
                            fontFamily: 'var(--font-inter)',
                            color: 'var(--body-text)',
                          }}
                        >
                          {beekeeper.productCount === 1 ? 'Proizvod' : beekeeper.productCount < 5 ? 'Proizvoda' : 'Proizvoda'}
                        </p>
                      </div>
                      <div>
                        <div
                          className="text-2xl font-bold mb-1 flex items-baseline gap-1"
                          style={{
                            fontFamily: 'var(--font-serif)',
                            color: 'var(--honey-gold)',
                          }}
                        >
                          {beekeeper.averageRating > 0 ? (
                            <>
                              <span className="leading-tight">{beekeeper.averageRating}</span>
                              <svg
                                className="w-4 h-4 flex-shrink-0 self-center"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                                style={{ 
                                  color: 'var(--honey-gold)',
                                  marginTop: '0.125rem',
                                }}
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            </>
                          ) : (
                            <span className="text-base">-</span>
                          )}
                        </div>
                        <p
                          className="text-xs"
                          style={{
                            fontFamily: 'var(--font-inter)',
                            color: 'var(--body-text)',
                          }}
                        >
                          {beekeeper.totalReviews > 0 ? `${beekeeper.totalReviews} ${beekeeper.totalReviews === 1 ? 'recenzija' : beekeeper.totalReviews < 5 ? 'recenzije' : 'recenzija'}` : 'Nema recenzija'}
                        </p>
                      </div>
                    </div>

                    {/* View Profile Link */}
                    <div className="mt-4 pt-3 border-t" style={{ borderColor: 'var(--border-light)' }}>
                      <span
                        className="inline-block text-sm font-medium transition-all duration-300 group-hover:translate-x-1 cursor-pointer"
                        style={{
                          fontFamily: 'var(--font-inter)',
                          color: 'var(--honey-gold)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.textDecoration = 'underline';
                          e.currentTarget.style.textDecorationColor = 'var(--honey-gold)';
                          e.currentTarget.style.textUnderlineOffset = '4px';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.textDecoration = 'none';
                        }}
                      >
                        Pogledaj profil →
                      </span>
                    </div>
                  </div>
                  </Link>

                  {/* Quick Message Button */}
                  <div className="p-5 pt-0 border-t" style={{ borderColor: 'var(--border-light)' }}>
                    <button
                      onClick={(e) => handleOpenMessageModal(e, beekeeper)}
                      className="w-full py-2.5 px-4 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2"
                      style={{
                        backgroundColor: 'var(--honey-gold)',
                        color: 'white',
                        fontFamily: 'var(--font-inter)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--honey-light)';
                        e.currentTarget.style.transform = 'scale(1.02)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--honey-gold)';
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
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
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                      Pošalji poruku
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section data-animate-section className="relative py-20 overflow-hidden" style={{ backgroundColor: 'var(--cream)' }}>
        <div className="container mx-auto px-8 max-lg:px-6 max-md:px-4 max-w-4xl relative z-10">
          <div className="text-center bg-white rounded-2xl p-12 shadow-sm border" style={{ borderColor: 'var(--border-light)' }}>
            <h2
              className="text-4xl max-md:text-3xl font-bold mb-6"
              style={{
                fontFamily: 'var(--font-serif)',
                color: 'var(--dark-text)',
              }}
            >
              Želite postati naš partner?
            </h2>
            <p
              className="text-lg mb-8 leading-relaxed"
              style={{
                fontFamily: 'var(--font-inter)',
                color: 'var(--body-text)',
                lineHeight: '1.7',
              }}
            >
              Pridružite se našoj zajednici pčelara i podijelite svoj prirodan med sa ljubiteljima kvaliteta.
              Javite nam se i saznajte kako možete postati dio naše priče.
            </p>
            <Link
              href={ROUTES.BECOME_BEEKEEPER}
              className="inline-block px-8 py-4 rounded-lg font-semibold text-base transition-all duration-200"
              style={{
                backgroundColor: 'var(--honey-gold)',
                color: 'white',
                fontFamily: 'var(--font-inter)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--honey-light)';
                e.currentTarget.style.transform = 'scale(1.02)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(212, 167, 44, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--honey-gold)';
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              Postanite pčelar
            </Link>
          </div>
        </div>
      </section>


      <Footer />
    </div>
  );
}

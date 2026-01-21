'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';
import ProductCard from '@/components/ProductCard';
import SmallFooter from '@/components/SmallFooter';
import { ROUTES } from '@/config/constants';
import {
  getBeekeeperBySlug,
  getProductsByBeekeeperSlug,
  type Beekeeper,
  type Product,
} from '@/lib/data';


export default function BeekeeperPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [beekeeper, setBeekeeper] = useState<Beekeeper | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (slug) {
      const foundBeekeeper = getBeekeeperBySlug(slug);
      if (foundBeekeeper) {
        setBeekeeper(foundBeekeeper);
        const beekeeperProducts = getProductsByBeekeeperSlug(slug);
        // Ensure we have all products for this beekeeper
        setProducts(beekeeperProducts);
      }
    }
  }, [slug]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (products.length === 0) {
      return {
        totalProducts: 0,
        averageRating: 0,
        totalReviews: 0,
        inStockCount: 0,
      };
    }

    const totalProducts = products.length;
    const averageRating = products.reduce((sum, p) => sum + p.rating, 0) / totalProducts;
    const totalReviews = products.reduce((sum, p) => sum + p.reviews, 0);
    const inStockCount = products.filter((p) => p.inStock).length;

    return {
      totalProducts,
      averageRating: parseFloat(averageRating.toFixed(1)),
      totalReviews,
      inStockCount,
    };
  }, [products]);

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
  }, [beekeeper]);

  if (!beekeeper) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--cream)' }}>
        <div className="text-center">
          <h1
            className="text-2xl font-bold mb-4"
            style={{
              fontFamily: 'var(--font-serif)',
              color: 'var(--dark-text)',
            }}
          >
            Pčelar nije pronađen
          </h1>
          <Link
            href={ROUTES.PRODUCTS}
            className="inline-block px-6 py-3 rounded-lg font-medium transition-colors"
            style={{
              backgroundColor: 'var(--honey-gold)',
              color: 'white',
              fontFamily: 'var(--font-inter)',
            }}
          >
            Povratak na proizvode
          </Link>
        </div>
      </div>
    );
  }

  // Get story and gallery images from beekeeper data
  const extendedStory = beekeeper.story || '';
  const galleryImages = beekeeper.galleryImages || [];

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--cream)' }}>
      <div className="container mx-auto px-8 max-lg:px-6 max-md:px-4 py-12 max-w-7xl">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: 'Početna', href: ROUTES.HOME },
            { label: 'Pčelari', href: '/pcelari' },
            { label: beekeeper.name, href: undefined },
          ]}
        />

        {/* Hero Section - Beekeeper Profile */}
        <div data-animate-section className="mt-8 mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Image */}
            <div className="relative">
              <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-white border-2 shadow-lg" style={{ borderColor: 'var(--border-light)' }}>
                <Image
                  src={beekeeper.avatar}
                  alt={beekeeper.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              </div>
              {/* Decorative elements */}
              <div className="absolute -bottom-4 -right-4 w-32 h-32 opacity-20 pointer-events-none">
                <svg viewBox="0 0 200 200" fill="none" className="w-full h-full" style={{ color: 'var(--honey-gold)' }}>
                  <path
                    d="M50 150 Q30 120 40 90 Q50 60 80 50 Q110 40 140 50 Q170 60 180 90 Q190 120 170 150"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                  />
                </svg>
              </div>
            </div>

            {/* Right Side - Info */}
            <div className="space-y-6">
              <div>
                <h1
                  className="text-5xl max-md:text-4xl font-bold mb-4"
                  style={{
                    fontFamily: 'var(--font-serif)',
                    color: 'var(--dark-text)',
                    letterSpacing: '0.02em',
                  }}
                >
                  {beekeeper.name}
                </h1>
                <div className="flex items-center gap-2 mb-6">
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
                    className="text-xl"
                    style={{
                      color: 'var(--body-text)',
                      fontFamily: 'var(--font-inter)',
                    }}
                  >
                    {beekeeper.location}
                  </span>
                </div>
              </div>

              {/* Description */}
              <p
                className="text-lg leading-relaxed"
                style={{
                  color: 'var(--body-text)',
                  fontFamily: 'var(--font-inter)',
                }}
              >
                {extendedStory.split('\n\n')[0] || 'Iskusan pčelar sa dugogodišnjim iskustvom u proizvodnji prirodnog meda.'}
              </p>
              <button
                type="button"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-colors"
                style={{
                  backgroundColor: 'var(--honey-gold)',
                  color: 'white',
                  fontFamily: 'var(--font-inter)',
                }}
                onClick={() => {
                  window.dispatchEvent(
                    new CustomEvent('kosnica:openChat', {
                      detail: { slug: beekeeper.slug },
                    })
                  );
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--honey-light)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--honey-gold)';
                }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.77 9.77 0 01-4-.84L3 20l1.06-3.18A7.82 7.82 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                Pošalji poruku
              </button>

              {/* Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t" style={{ borderColor: 'var(--border-light)' }}>
                <div className="text-center">
                  <div
                    className="text-3xl font-bold mb-1"
                    style={{
                      color: 'var(--honey-gold)',
                      fontFamily: 'var(--font-inter)',
                    }}
                  >
                    {stats.totalProducts}
                  </div>
                  <div
                    className="text-sm"
                    style={{
                      color: 'var(--body-text)',
                      fontFamily: 'var(--font-inter)',
                    }}
                  >
                    Proizvoda
                  </div>
                </div>
                <div className="text-center">
                  <div
                    className="text-3xl font-bold mb-1"
                    style={{
                      color: 'var(--honey-gold)',
                      fontFamily: 'var(--font-inter)',
                    }}
                  >
                    {stats.averageRating}
                  </div>
                  <div
                    className="text-sm"
                    style={{
                      color: 'var(--body-text)',
                      fontFamily: 'var(--font-inter)',
                    }}
                  >
                    Prosječna ocjena
                  </div>
                </div>
                <div className="text-center">
                  <div
                    className="text-3xl font-bold mb-1"
                    style={{
                      color: 'var(--honey-gold)',
                      fontFamily: 'var(--font-inter)',
                    }}
                  >
                    {stats.totalReviews}
                  </div>
                  <div
                    className="text-sm"
                    style={{
                      color: 'var(--body-text)',
                      fontFamily: 'var(--font-inter)',
                    }}
                  >
                    Recenzija
                  </div>
                </div>
                <div className="text-center">
                  <div
                    className="text-3xl font-bold mb-1"
                    style={{
                      color: 'var(--green-primary)',
                      fontFamily: 'var(--font-inter)',
                    }}
                  >
                    {stats.inStockCount}
                  </div>
                  <div
                    className="text-sm"
                    style={{
                      color: 'var(--body-text)',
                      fontFamily: 'var(--font-inter)',
                    }}
                  >
                    Na stanju
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Our Story Section */}
        <div data-animate-section className="mt-16 mb-16">
          <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm border transition-all duration-300 hover:shadow-lg" style={{ borderColor: 'var(--border-light)' }}>
            <h2
              className="text-4xl max-md:text-3xl font-bold mb-6"
              style={{
                fontFamily: 'var(--font-serif)',
                color: 'var(--dark-text)',
                letterSpacing: '0.02em',
              }}
            >
              Naša priča
            </h2>
            <div
              className="text-lg leading-relaxed whitespace-pre-line"
              style={{
                color: 'var(--body-text)',
                fontFamily: 'var(--font-inter)',
              }}
            >
              {extendedStory}
            </div>
          </div>
        </div>

        {/* Gallery Section - Where We Work */}
        {galleryImages.length > 0 && (
          <div data-animate-section className="mt-16 mb-16">
            <h2
              className="text-4xl max-md:text-3xl font-bold mb-8"
              style={{
                fontFamily: 'var(--font-serif)',
                color: 'var(--dark-text)',
                letterSpacing: '0.02em',
              }}
            >
              Gdje radimo
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {galleryImages.slice(0, 3).map((image, index) => (
                <div
                  key={`${image}-${index}`}
                  className="relative w-full aspect-[4/3] rounded-xl overflow-hidden border-2 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group"
                  style={{ 
                    borderColor: 'var(--border-light)',
                    backgroundColor: 'var(--cream)'
                  }}
                >
                  <Image
                    src={image}
                    alt={`${beekeeper.name} - Rad ${index + 1}`}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                    loading="lazy"
                    onError={(e) => {
                      console.error('Error loading gallery image:', image, e);
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contact Section */}
        <div data-animate-section className="mt-16 mb-16">
          <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm border transition-all duration-300 hover:shadow-lg" style={{ borderColor: 'var(--border-light)' }}>
            <h2
              className="text-4xl max-md:text-3xl font-bold mb-8"
              style={{
                fontFamily: 'var(--font-serif)',
                color: 'var(--dark-text)',
                letterSpacing: '0.02em',
              }}
            >
              Kontaktirajte {beekeeper.name.split(' ')[0]}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Email */}
              {beekeeper.email && (
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(212, 167, 44, 0.2)' }}>
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
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3
                      className="text-lg font-semibold mb-2"
                      style={{
                        color: 'var(--dark-text)',
                        fontFamily: 'var(--font-inter)',
                      }}
                    >
                      Email
                    </h3>
                    <a
                      href={`mailto:${beekeeper.email}?subject=Upit za ${beekeeper.name}`}
                      className="text-base transition-colors hover:opacity-80"
                      style={{
                        color: 'var(--honey-gold)',
                        fontFamily: 'var(--font-inter)',
                      }}
                    >
                      {beekeeper.email}
                    </a>
                    <p
                      className="text-sm mt-2"
                      style={{
                        color: 'var(--body-text)',
                        fontFamily: 'var(--font-inter)',
                      }}
                    >
                      Pošaljite nam poruku i odgovorimo u najkraćem roku
                    </p>
                  </div>
                </div>
              )}

              {/* Phone */}
              {beekeeper.phone && (
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(212, 167, 44, 0.2)' }}>
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
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3
                      className="text-lg font-semibold mb-2"
                      style={{
                        color: 'var(--dark-text)',
                        fontFamily: 'var(--font-inter)',
                      }}
                    >
                      Telefon
                    </h3>
                    <a
                      href={`tel:${beekeeper.phone.replace(/\s/g, '')}`}
                      className="text-base transition-colors hover:opacity-80"
                      style={{
                        color: 'var(--honey-gold)',
                        fontFamily: 'var(--font-inter)',
                      }}
                    >
                      {beekeeper.phone}
                    </a>
                    <p
                      className="text-sm mt-2"
                      style={{
                        color: 'var(--body-text)',
                        fontFamily: 'var(--font-inter)',
                      }}
                    >
                      Pozovite nas radnim danima od 8:00 do 18:00
                    </p>
                  </div>
                </div>
              )}

              {/* Location */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(212, 167, 44, 0.15)' }}>
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
                <div className="flex-1">
                  <h3
                    className="text-lg font-semibold mb-2"
                    style={{
                      color: 'var(--dark-text)',
                      fontFamily: 'var(--font-inter)',
                    }}
                  >
                    Lokacija
                  </h3>
                  <p
                    className="text-base"
                    style={{
                      color: 'var(--body-text)',
                      fontFamily: 'var(--font-inter)',
                    }}
                  >
                    {beekeeper.location}
                  </p>
                  <p
                    className="text-sm mt-2"
                    style={{
                      color: 'var(--body-text)',
                      fontFamily: 'var(--font-inter)',
                    }}
                  >
                    Naša košnica se nalazi u {beekeeper.location}
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Products Section */}
        {products.length > 0 && (
          <div data-animate-section className="mt-16 mb-8">
            <div className="mb-8">
              <h2
                className="text-4xl max-md:text-3xl font-bold mb-4"
                style={{
                  fontFamily: 'var(--font-serif)',
                  color: 'var(--dark-text)',
                  letterSpacing: '0.02em',
                }}
              >
                Proizvodi od {beekeeper.name}
              </h2>
              <p
                className="text-lg"
                style={{
                  color: 'var(--body-text)',
                  fontFamily: 'var(--font-inter)',
                }}
              >
                Pronađeno {products.length} {products.length === 1 ? 'proizvod' : 'proizvoda'}
              </p>
            </div>

            <div 
              data-animate-section
              className="grid grid-cols-1 max-sm:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {products.map((product) => (
                <ProductCard key={product.id} product={product} hideSellerAvatar={true} />
              ))}
            </div>
          </div>
        )}

        {/* No Products Message */}
        {products.length === 0 && (
          <div className="mt-16 mb-8">
            <div className="text-center py-16">
              <svg
                className="w-24 h-24 mx-auto mb-4 opacity-30"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                style={{ color: 'var(--body-text)' }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
              <p
                className="text-xl mb-4"
                style={{
                  color: 'var(--body-text)',
                  fontFamily: 'var(--font-inter)',
                }}
              >
                Trenutno nema proizvoda u ponudi
              </p>
              <Link
                href={ROUTES.PRODUCTS}
                className="inline-block px-6 py-3 rounded-lg font-medium transition-colors"
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
                Pregledaj sve proizvode
              </Link>
            </div>
          </div>
        )}
      </div>
      <SmallFooter />
    </div>
  );
}

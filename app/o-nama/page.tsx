'use client';

import { useMemo, useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';
import Footer from '@/components/Footer';
import { ROUTES } from '@/config/constants';
import { getAllBeekeepers, getAllProducts } from '@/lib/data';

export default function AboutPage() {
  // Calculate statistics
  const stats = useMemo(() => {
    const beekeepers = getAllBeekeepers();
    const products = getAllProducts();
    const locations = new Set(products.map(p => p.seller.location));
    
    return {
      beekeeperCount: beekeepers.length,
      productCount: products.length,
      locationCount: locations.size,
      inStockCount: products.filter(p => p.inStock).length,
    };
  }, []);

  // Animated counter for statistics
  const [animatedStats, setAnimatedStats] = useState({
    beekeeperCount: 0,
    productCount: 0,
    locationCount: 0,
    inStockCount: 0,
  });

  const statsSectionRef = useRef<HTMLDivElement>(null);
  const [isStatsVisible, setIsStatsVisible] = useState(false);

  // Intersection Observer for scroll animations - only animate once
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !entry.target.classList.contains('animate-fade-in')) {
            entry.target.classList.add('animate-fade-in');
            if (entry.target === statsSectionRef.current) {
              setIsStatsVisible(true);
            }
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -100px 0px' }
    );

    const sections = document.querySelectorAll('[data-animate-section]');
    sections.forEach((section) => observer.observe(section));

    return () => {
      sections.forEach((section) => observer.unobserve(section));
    };
  }, []);

  // Animate statistics counter
  useEffect(() => {
    if (!isStatsVisible) return;

    const duration = 2000; // 2 seconds
    const steps = 60;
    const stepDuration = duration / steps;

    const animateValue = (
      start: number,
      end: number,
      callback: (value: number) => void
    ) => {
      let current = start;
      const increment = (end - start) / steps;
      const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
          current = end;
          clearInterval(timer);
        }
        callback(Math.floor(current));
      }, stepDuration);
    };

    animateValue(0, stats.beekeeperCount, (value) => {
      setAnimatedStats((prev) => ({ ...prev, beekeeperCount: value }));
    });
    animateValue(0, stats.productCount, (value) => {
      setAnimatedStats((prev) => ({ ...prev, productCount: value }));
    });
    animateValue(0, stats.locationCount, (value) => {
      setAnimatedStats((prev) => ({ ...prev, locationCount: value }));
    });
    animateValue(0, stats.inStockCount, (value) => {
      setAnimatedStats((prev) => ({ ...prev, inStockCount: value }));
    });
  }, [isStatsVisible, stats]);

  // Gallery images
  const galleryImages = [
    '/images/gallery/image-onama (1).jpg',
    '/images/gallery/image-onama (2).jpg',
    '/images/gallery/image-onama (3).jpg',
    '/images/gallery/image-onama (4).jpg',
    '/images/gallery/image-onama (5).jpg',
    '/images/gallery/image-onama (6).jpg',
    '/images/gallery/image-onama (7).jpg',
    '/images/gallery/image-onama (8).jpg',
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--cream)' }}>
      {/* Breadcrumbs */}
      <div className="container mx-auto px-8 max-lg:px-6 max-md:px-4 pt-8 relative z-10">
        <Breadcrumbs
          items={[
            { label: 'Početna', href: ROUTES.HOME },
            { label: 'O nama', href: undefined },
          ]}
        />
      </div>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-96 h-96 opacity-5 pointer-events-none">
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
          <div className="text-center max-w-4xl mx-auto">
            <h1
              className="text-6xl max-md:text-4xl max-sm:text-3xl font-bold mb-6"
              style={{
                fontFamily: 'var(--font-serif)',
                color: 'var(--dark-text)',
                letterSpacing: '0.05em',
              }}
            >
              Naša priča
            </h1>
            <p
              className="text-xl max-md:text-lg leading-relaxed"
              style={{
                fontFamily: 'var(--font-inter)',
                color: 'var(--body-text)',
                lineHeight: '1.7',
              }}
            >
              Povezujemo ljubitelje prirodnog meda sa najboljim pčelarima iz Bosne i Hercegovine.
              Svaki proizvod je pažljivo odabran i direktno dolazi od provjerenih majstora svoje profesije.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section 
        data-animate-section
        className="relative py-20 overflow-hidden"
        style={{ backgroundColor: '#ffffff' }}
      >
        <div className="container mx-auto px-8 max-lg:px-6 max-md:px-4 max-w-7xl relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-md:gap-8">
            {/* Mission */}
            <div 
              className="bg-white rounded-2xl p-8 shadow-sm border transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              style={{ borderColor: 'var(--border-light)' }}
            >
              <div className="mb-6">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: 'rgba(212, 167, 44, 0.1)' }}>
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    style={{ color: 'var(--honey-gold)' }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h2
                  className="text-3xl max-md:text-2xl font-bold mb-4"
                  style={{
                    fontFamily: 'var(--font-serif)',
                    color: 'var(--dark-text)',
                  }}
                >
                  Naša misija
                </h2>
              </div>
              <p
                className="text-lg leading-relaxed"
                style={{
                  fontFamily: 'var(--font-inter)',
                  color: 'var(--body-text)',
                  lineHeight: '1.7',
                }}
              >
                Naša misija je povezati ljubitelje prirodnog meda sa lokalnim pčelarima koji proizvode med
                najvišeg kvaliteta. Vjerujemo da svaki med treba da sačuva autentičnost i prirodnost,
                bez dodataka i tretmana. Podržavamo održivost, kvalitet i rast lokalne zajednice.
              </p>
            </div>

            {/* Vision */}
            <div 
              className="bg-white rounded-2xl p-8 shadow-sm border transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              style={{ borderColor: 'var(--border-light)' }}
            >
              <div className="mb-6">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: 'rgba(212, 167, 44, 0.1)' }}>
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    style={{ color: 'var(--honey-gold)' }}
                  >
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
                </div>
                <h2
                  className="text-3xl max-md:text-2xl font-bold mb-4"
                  style={{
                    fontFamily: 'var(--font-serif)',
                    color: 'var(--dark-text)',
                  }}
                >
                  Naša vizija
                </h2>
              </div>
              <p
                className="text-lg leading-relaxed"
                style={{
                  fontFamily: 'var(--font-inter)',
                  color: 'var(--body-text)',
                  lineHeight: '1.7',
                }}
              >
                Vizija nam je postati glavna platforma za prirodan med u Bosni i Hercegovini,
                povezujući pčelare sa zajednicom koja cijeni kvalitet i autentičnost.
                Želimo da sačuvamo tradiciju pčelarstva i prenesemo znanje novim generacijama.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section 
        ref={statsSectionRef}
        data-animate-section
        className="relative py-20 overflow-hidden"
        style={{ backgroundColor: 'var(--cream)' }}
      >
        <div className="container mx-auto px-8 max-lg:px-6 max-md:px-4 max-w-7xl relative z-10">
          <div className="text-center mb-12">
            <h2
              className="text-4xl max-md:text-3xl font-bold mb-4"
              style={{
                fontFamily: 'var(--font-serif)',
                color: 'var(--dark-text)',
              }}
            >
              U brojkama
            </h2>
            <p
              className="text-lg"
              style={{
                fontFamily: 'var(--font-inter)',
                color: 'var(--body-text)',
              }}
            >
              Naša zajednica raste svakim danom
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-md:gap-6">
            {/* Beekeepers Count */}
            <div className="text-center transition-all duration-300 hover:scale-105">
              <div
                className="text-5xl max-md:text-4xl font-bold mb-2 transition-all duration-500"
                style={{
                  fontFamily: 'var(--font-serif)',
                  color: 'var(--honey-gold)',
                }}
              >
                {animatedStats.beekeeperCount}+
              </div>
              <p
                className="text-base font-medium"
                style={{
                  fontFamily: 'var(--font-inter)',
                  color: 'var(--body-text)',
                }}
              >
                Pčelara
              </p>
            </div>

            {/* Products Count */}
            <div className="text-center transition-all duration-300 hover:scale-105">
              <div
                className="text-5xl max-md:text-4xl font-bold mb-2 transition-all duration-500"
                style={{
                  fontFamily: 'var(--font-serif)',
                  color: 'var(--honey-gold)',
                }}
              >
                {animatedStats.productCount}+
              </div>
              <p
                className="text-base font-medium"
                style={{
                  fontFamily: 'var(--font-inter)',
                  color: 'var(--body-text)',
                }}
              >
                Proizvoda
              </p>
            </div>

            {/* Locations Count */}
            <div className="text-center transition-all duration-300 hover:scale-105">
              <div
                className="text-5xl max-md:text-4xl font-bold mb-2 transition-all duration-500"
                style={{
                  fontFamily: 'var(--font-serif)',
                  color: 'var(--honey-gold)',
                }}
              >
                {animatedStats.locationCount}+
              </div>
              <p
                className="text-base font-medium"
                style={{
                  fontFamily: 'var(--font-inter)',
                  color: 'var(--body-text)',
                }}
              >
                Lokacija
              </p>
            </div>

            {/* In Stock Count */}
            <div className="text-center transition-all duration-300 hover:scale-105">
              <div
                className="text-5xl max-md:text-4xl font-bold mb-2 transition-all duration-500"
                style={{
                  fontFamily: 'var(--font-serif)',
                  color: 'var(--honey-gold)',
                }}
              >
                {animatedStats.inStockCount}+
              </div>
              <p
                className="text-base font-medium"
                style={{
                  fontFamily: 'var(--font-inter)',
                  color: 'var(--body-text)',
                }}
              >
                Na stanju
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section 
        data-animate-section
        className="relative py-20 overflow-hidden"
        style={{ backgroundColor: '#ffffff' }}
      >
        <div className="container mx-auto px-8 max-lg:px-6 max-md:px-4 max-w-7xl relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Image */}
            <div className="relative group">
              <div className="relative w-full h-96 rounded-2xl overflow-hidden shadow-xl transition-all duration-500 group-hover:shadow-2xl group-hover:scale-[1.02]">
                <Image
                  src="/images/gallery/o-nama.jpg"
                  alt="Pčelarstvo u Bosni i Hercegovini"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              </div>
            </div>

            {/* Right Side - Content */}
            <div>
              <h2
                className="text-4xl max-md:text-3xl font-bold mb-6"
                style={{
                  fontFamily: 'var(--font-serif)',
                  color: 'var(--dark-text)',
                }}
              >
                Kako smo počeli
              </h2>
              <div
                className="text-lg leading-relaxed space-y-4"
                style={{
                  fontFamily: 'var(--font-inter)',
                  color: 'var(--body-text)',
                  lineHeight: '1.7',
                }}
              >
                <p>
                  Košnica.ba je nastala iz ljubavi prema prirodi i tradiciji pčelarstva u Bosni i Hercegovini.
                  Uvidjeli smo da mnogi pčelari imaju izvanredan med, ali nemaju pristup tržištu i kupcima
                  koji bi cijenili njihov rad.
                </p>
                <p>
                  Odlučili smo napraviti most između pčelara i ljubitelja prirodnog meda.
                  Naša platforma omogućava direktnu vezu, eliminirajući posrednike i osiguravajući
                  da svaki med sačuva svoju autentičnost i prirodnost.
                </p>
                <p>
                  Danas radimo sa preko {stats.beekeeperCount} pčelara iz cijele Bosne i Hercegovine,
                  svaki od njih pažljivo odabran jer znamo da kvalitet dolazi od ljudi koji vole
                  ono što rade.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values Section */}
      <section 
        data-animate-section
        className="relative py-20 overflow-hidden"
        style={{ backgroundColor: 'var(--cream)' }}
      >
        <div className="container mx-auto px-8 max-lg:px-6 max-md:px-4 max-w-7xl relative z-10">
          <div className="text-center mb-12">
            <h2
              className="text-4xl max-md:text-3xl font-bold mb-4"
              style={{
                fontFamily: 'var(--font-serif)',
                color: 'var(--dark-text)',
              }}
            >
              Naše vrijednosti
            </h2>
            <p
              className="text-lg max-w-2xl mx-auto"
              style={{
                fontFamily: 'var(--font-inter)',
                color: 'var(--body-text)',
              }}
            >
              Osnovni principi koji nas vode svakim danom
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Quality */}
            <div className="bg-white rounded-xl p-6 shadow-sm border text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-2" style={{ borderColor: 'var(--border-light)' }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--blue-primary)'; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-light)'; }}>
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'var(--blue-light)' }}>
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  style={{ color: 'var(--blue-primary)' }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                  />
                </svg>
              </div>
              <h3
                className="text-xl font-bold mb-3"
                style={{
                  fontFamily: 'var(--font-serif)',
                  color: 'var(--dark-text)',
                }}
              >
                Kvalitet
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{
                  fontFamily: 'var(--font-inter)',
                  color: 'var(--body-text)',
                }}
              >
                100% prirodan med, bez dodataka i tretmana. Svaki proizvod je provjeren i odobren.
              </p>
            </div>

            {/* Sustainability */}
            <div className="bg-white rounded-xl p-6 shadow-sm border text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-2" style={{ borderColor: 'var(--border-light)' }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--blue-primary)'; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-light)'; }}>
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'var(--blue-light)' }}>
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  style={{ color: 'var(--blue-primary)' }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3
                className="text-xl font-bold mb-3"
                style={{
                  fontFamily: 'var(--font-serif)',
                  color: 'var(--dark-text)',
                }}
              >
                Održivost
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{
                  fontFamily: 'var(--font-inter)',
                  color: 'var(--body-text)',
                }}
              >
                Podržavamo lokalnu zajednicu i održive načine proizvodnje koji poštuju prirodu.
              </p>
            </div>

            {/* Direct Connection */}
            <div className="bg-white rounded-xl p-6 shadow-sm border text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-2" style={{ borderColor: 'var(--border-light)' }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--blue-primary)'; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-light)'; }}>
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'var(--blue-light)' }}>
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  style={{ color: 'var(--blue-primary)' }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3
                className="text-xl font-bold mb-3"
                style={{
                  fontFamily: 'var(--font-serif)',
                  color: 'var(--dark-text)',
                }}
              >
                Direktna veza
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{
                  fontFamily: 'var(--font-inter)',
                  color: 'var(--body-text)',
                }}
              >
                Povezujemo vas direktno sa pčelarom, bez posrednika. Znate tačno odakle dolazi vaš med.
              </p>
            </div>

            {/* Tradition */}
            <div className="bg-white rounded-xl p-6 shadow-sm border text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-2" style={{ borderColor: 'var(--border-light)' }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--blue-primary)'; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-light)'; }}>
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'var(--blue-light)' }}>
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  style={{ color: 'var(--blue-primary)' }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <h3
                className="text-xl font-bold mb-3"
                style={{
                  fontFamily: 'var(--font-serif)',
                  color: 'var(--dark-text)',
                }}
              >
                Tradicija
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{
                  fontFamily: 'var(--font-inter)',
                  color: 'var(--body-text)',
                }}
              >
                Čuvamo i prenosimo znanje o pčelarstvu kroz generacije, poštujući stare načine rada.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section 
        data-animate-section
        className="relative py-20 overflow-hidden"
        style={{ backgroundColor: '#ffffff' }}
      >
        <div className="container mx-auto px-8 max-lg:px-6 max-md:px-4 max-w-7xl relative z-10">
          <div className="text-center mb-12">
            <h2
              className="text-4xl max-md:text-3xl font-bold mb-4"
              style={{
                fontFamily: 'var(--font-serif)',
                color: 'var(--dark-text)',
              }}
            >
              Naš svijet
            </h2>
            <p
              className="text-lg max-w-2xl mx-auto"
              style={{
                fontFamily: 'var(--font-inter)',
                color: 'var(--body-text)',
              }}
            >
              Pregledajte rad naših pčelara i prirodnog okruženja u kojem proizvode med
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {galleryImages.map((image, index) => (
              <div
                key={index}
                className="relative w-full aspect-square rounded-lg overflow-hidden group cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105"
              >
                <Image
                  src={image}
                  alt={`Pčelarstvo ${index + 1}`}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section 
        data-animate-section
        className="relative py-20 overflow-hidden"
        style={{ backgroundColor: 'var(--cream)' }}
      >
        <div className="container mx-auto px-8 max-lg:px-6 max-md:px-4 max-w-4xl relative z-10">
          <div className="text-center bg-white rounded-2xl p-12 shadow-sm border transition-all duration-300 hover:shadow-lg" style={{ borderColor: 'var(--border-light)' }}>
            <h2
              className="text-4xl max-md:text-3xl font-bold mb-6"
              style={{
                fontFamily: 'var(--font-serif)',
                color: 'var(--dark-text)',
              }}
            >
              Pridružite se našoj zajednici
            </h2>
            <p
              className="text-lg mb-8 leading-relaxed"
              style={{
                fontFamily: 'var(--font-inter)',
                color: 'var(--body-text)',
                lineHeight: '1.7',
              }}
            >
              Istražite našu kolekciju prirodnog meda ili se pridružite kao pčelar
              i podijelite svoj med sa zajednicom koja cijeni kvalitet.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href={ROUTES.PRODUCTS}
                className="px-8 py-4 rounded-lg font-semibold text-base transition-all duration-200"
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
                Pregledajte proizvode
              </Link>
              <Link
                href={ROUTES.BECOME_BEEKEEPER}
                className="px-8 py-4 rounded-lg font-semibold text-base border-2 transition-all duration-200"
                style={{
                  borderColor: 'var(--honey-gold)',
                  color: 'var(--honey-gold)',
                  backgroundColor: 'white',
                  fontFamily: 'var(--font-inter)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--honey-gold)';
                  e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.color = 'var(--honey-gold)';
                }}
              >
                Postanite pčelar
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

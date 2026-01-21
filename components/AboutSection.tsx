'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ROUTES } from '@/config/constants';

export default function AboutSection() {
  return (
    <section className="relative py-24 overflow-hidden" style={{ backgroundColor: '#ffffff' }}>
      {/* Decorative Background Elements */}
      {/* Honeycomb pattern - top left */}
      <div className="absolute top-0 left-0 w-64 h-64 opacity-10 pointer-events-none">
        <svg viewBox="0 0 200 200" fill="none" className="w-full h-full" style={{ color: 'var(--border-light)' }}>
          <path
            d="M50 50 L70 50 L80 65 L70 80 L50 80 L40 65 Z"
            stroke="currentColor"
            strokeWidth="1"
            fill="none"
          />
          <path
            d="M90 50 L110 50 L120 65 L110 80 L90 80 L80 65 Z"
            stroke="currentColor"
            strokeWidth="1"
            fill="none"
          />
          <path
            d="M130 50 L150 50 L160 65 L150 80 L130 80 L120 65 Z"
            stroke="currentColor"
            strokeWidth="1"
            fill="none"
          />
        </svg>
      </div>

      {/* Leaf illustration - top right */}
      <div className="absolute top-0 right-0 w-48 h-48 opacity-10 pointer-events-none">
        <svg viewBox="0 0 200 200" fill="none" className="w-full h-full" style={{ color: 'var(--border-light)' }}>
          <path
            d="M150 50 Q130 70 140 90 Q150 110 170 100 Q160 80 150 50"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M140 60 Q125 75 130 85 Q135 95 150 90"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
          />
        </svg>
      </div>

      {/* Honey jar - bottom right */}
      <div className="absolute bottom-0 right-0 w-40 h-48 opacity-10 pointer-events-none">
        <svg viewBox="0 0 200 200" fill="none" className="w-full h-full" style={{ color: 'var(--border-light)' }}>
          <rect x="80" y="60" width="40" height="80" rx="5" stroke="currentColor" strokeWidth="2" fill="none" />
          <path
            d="M75 60 Q100 50 125 60"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M85 70 L85 100 M95 70 L95 100 M105 70 L105 100 M115 70 L115 100"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
      </div>

      <div className="container mx-auto px-8 max-lg:px-6 max-md:px-4 max-w-7xl relative z-10">
        <div className="flex items-center gap-12 max-lg:flex-col max-lg:gap-8">
          {/* Left Side - Circular Image */}
          <div className="flex-shrink-0 relative max-lg:w-full max-lg:flex max-lg:justify-center group">
            {/* Large Circular Image */}
            <div className="relative w-96 h-96 max-lg:w-80 max-lg:h-80 max-md:w-64 max-md:h-64 mx-auto transition-transform duration-500 group-hover:scale-105">
              <div
                className="absolute inset-0 rounded-full border-4 overflow-hidden transition-all duration-500 group-hover:shadow-2xl"
                style={{
                  borderColor: 'var(--honey-gold)',
                  boxShadow: '0 10px 40px rgba(212, 167, 44, 0.2)',
                }}
              >
                <div className="relative w-full h-full">
                  <Image
                    src="/images/hero-second-pic.webp"
                    alt="Pčelarstvo"
                    fill
                    className="object-cover"
                    style={{ objectPosition: 'center center' }}
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Content */}
          <div className="flex-1 max-lg:text-center">
            {/* "O nama" Heading */}
            <div className="flex items-center gap-3 mb-4 max-lg:justify-center">
              <h3
                className="text-lg font-semibold"
                style={{
                  fontFamily: 'var(--font-serif)',
                  color: 'var(--brown-600)',
                  letterSpacing: '0.05em',
                }}
              >
                O nama
              </h3>
              <div
                className="flex-1 h-px max-lg:hidden"
                style={{ backgroundColor: 'var(--brown-300)' }}
              />
            </div>

            {/* Main Heading */}
            <h2
              className="text-5xl max-lg:text-4xl max-md:text-3xl font-bold mb-6 leading-tight"
              style={{
                fontFamily: 'var(--font-serif)',
                color: 'var(--dark-text)',
                letterSpacing: '0.02em',
              }}
            >
              Divno je vrijeme biti pčelar u Bosni i Hercegovini
            </h2>

            {/* Description */}
            <p
              className="text-lg max-md:text-base mb-8 leading-relaxed"
              style={{
                fontFamily: 'var(--font-inter)',
                color: 'var(--body-text)',
                lineHeight: '1.7',
              }}
            >
              Naša misija je povezati ljubitelje prirodnog meda sa lokalnim pčelarima koji
              proizvode med najvišeg kvaliteta. Svaki proizvod u našoj ponudi je pažljivo
              odabran i direktno dolazi od provjerenih pčelara iz cijele Bosne i Hercegovine.
              Verujemo u održivost, kvalitet i podršku lokalnoj zajednici.
            </p>

            {/* Feature Blocks */}
            <div className="flex gap-6 mb-8 max-md:flex-col max-md:gap-4">
              {/* Natural Honey */}
              <div className="flex items-center gap-3 flex-1 max-md:justify-center group cursor-default">
                <div className="transition-all duration-300 group-hover:scale-110 group-hover:rotate-3" style={{ color: 'var(--honey-gold)' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                </div>
                <span
                  className="text-sm font-medium transition-colors duration-300 group-hover:text-[var(--honey-gold)]"
                  style={{
                    fontFamily: 'var(--font-inter)',
                    color: 'var(--body-text)',
                  }}
                >
                  Prirodni med
                </span>
              </div>

              {/* Organic Honey */}
              <div className="flex items-center gap-3 flex-1 max-md:justify-center group cursor-default">
                <div className="transition-all duration-300 group-hover:scale-110 group-hover:rotate-3" style={{ color: 'var(--honey-gold)' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                    <line x1="12" y1="22.08" x2="12" y2="12" />
                  </svg>
                </div>
                <span
                  className="text-sm font-medium transition-colors duration-300 group-hover:text-[var(--honey-gold)]"
                  style={{
                    fontFamily: 'var(--font-inter)',
                    color: 'var(--body-text)',
                  }}
                >
                  Organski med
                </span>
              </div>

              {/* Professional Beekeepers */}
              <div className="flex items-center gap-3 flex-1 max-md:justify-center group cursor-default">
                <div className="transition-all duration-300 group-hover:scale-110 group-hover:rotate-3" style={{ color: 'var(--honey-gold)' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <span
                  className="text-sm font-medium transition-colors duration-300 group-hover:text-[var(--honey-gold)]"
                  style={{
                    fontFamily: 'var(--font-inter)',
                    color: 'var(--body-text)',
                  }}
                >
                  Profesionalni pčelari
                </span>
              </div>
            </div>

            {/* CTA Link */}
            <Link
              href={ROUTES.ABOUT}
              className="group inline-flex items-center gap-2"
              style={{
                color: 'var(--blue-primary)',
                fontFamily: 'var(--font-inter)',
                fontSize: '1rem',
                fontWeight: 500,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--blue-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--blue-primary)';
              }}
            >
              <span>Saznaj više</span>
              <svg
                className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

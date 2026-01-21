'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ROUTES } from '@/config/constants';

export default function Footer() {
  return (
    <footer className="relative" style={{ backgroundColor: '#2d2d2d' }}>
      <div className="container mx-auto px-8 max-lg:px-6 max-md:px-4 max-w-7xl py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Leftmost Section - Logo and Tagline */}
          <div className="flex flex-col">
            {/* Logo */}
            <div className="mb-4">
              <Image
                src="/Kosnica_logo.svg"
                alt="Košnica.ba Logo"
                width={300}
                height={90}
                className="h-20 w-auto object-contain"
                style={{ filter: 'brightness(0) invert(1)' }}
              />
            </div>

            {/* Tagline */}
            <p
              className="text-base"
              style={{
                color: 'rgba(255, 255, 255, 0.9)',
                fontFamily: 'var(--font-inter)',
                lineHeight: '1.6',
              }}
            >
              Kvalitet koji možete osjetiti.
            </p>
          </div>

          {/* Second Section - O nama */}
          <div className="flex flex-col">
            <h4
              className="text-base font-bold mb-4"
              style={{
                color: 'white',
                fontFamily: 'var(--font-inter)',
              }}
            >
              O nama
            </h4>
            <nav className="flex flex-col gap-3">
              <Link
                href={ROUTES.ABOUT}
                className="text-sm transition-colors"
                style={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontFamily: 'var(--font-inter)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--honey-gold)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
                }}
              >
                Naša priča
              </Link>
              <Link
                href="/pcelari"
                className="text-sm transition-colors"
                style={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontFamily: 'var(--font-inter)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--honey-gold)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
                }}
              >
                Pčelari
              </Link>
              <Link
                href="/blog"
                className="text-sm transition-colors"
                style={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontFamily: 'var(--font-inter)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--honey-gold)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
                }}
              >
                Blog
              </Link>
            </nav>
          </div>

          {/* Third Section - Pomoć */}
          <div className="flex flex-col">
            <h4
              className="text-base font-bold mb-4"
              style={{
                color: 'white',
                fontFamily: 'var(--font-inter)',
              }}
            >
              Pomoć
            </h4>
            <nav className="flex flex-col gap-3">
              <Link
                href={ROUTES.CONTACT}
                className="text-sm transition-colors"
                style={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontFamily: 'var(--font-inter)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--honey-gold)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
                }}
              >
                Kontaktirajte nas
              </Link>
              <Link
                href="/dostava-i-povrati"
                className="text-sm transition-colors"
                style={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontFamily: 'var(--font-inter)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--honey-gold)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
                }}
              >
                Dostava i povrati
              </Link>
              <Link
                href="/uslovi-koristenja"
                className="text-sm transition-colors"
                style={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontFamily: 'var(--font-inter)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--honey-gold)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
                }}
              >
                Uslovi korištenja
              </Link>
              <Link
                href="/cesta-pitanja"
                className="text-sm transition-colors"
                style={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontFamily: 'var(--font-inter)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--honey-gold)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
                }}
              >
                Česta pitanja
              </Link>
              <Link
                href="/politika-privatnosti"
                className="text-sm transition-colors"
                style={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontFamily: 'var(--font-inter)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--honey-gold)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
                }}
              >
                Politika privatnosti
              </Link>
            </nav>
          </div>

          {/* Rightmost Section - Kontaktirajte Nas */}
          <div className="flex flex-col">
            <h4
              className="text-base font-bold mb-4"
              style={{
                color: 'white',
                fontFamily: 'var(--font-inter)',
              }}
            >
              Kontaktirajte Nas
            </h4>
            <div className="flex flex-col gap-4">
              {/* Location */}
              <div className="flex items-start gap-2.5">
                <svg
                  className="w-5 h-5 mt-0.5 flex-shrink-0"
                  fill="none"
                  stroke="white"
                  viewBox="0 0 24 24"
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
                <div className="flex flex-col gap-0.5">
                  <span
                    className="text-sm"
                    style={{
                      color: 'rgba(255, 255, 255, 0.8)',
                      fontFamily: 'var(--font-inter)',
                    }}
                  >
                    Ulica Pčelara 123
                  </span>
                  <span
                    className="text-sm"
                    style={{
                      color: 'rgba(255, 255, 255, 0.8)',
                      fontFamily: 'var(--font-inter)',
                    }}
                  >
                    71000 Sarajevo, BiH
                  </span>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-center gap-2.5">
                <svg
                  className="w-5 h-5 flex-shrink-0"
                  fill="none"
                  stroke="white"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <a
                  href="tel:+38733123456"
                  className="text-sm transition-colors"
                  style={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontFamily: 'var(--font-inter)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--honey-gold)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
                  }}
                >
                  +387 33 123 456
                </a>
              </div>

              {/* Email */}
              <div className="flex items-center gap-2.5">
                <svg
                  className="w-5 h-5 flex-shrink-0"
                  fill="none"
                  stroke="white"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <a
                  href="mailto:info@kosnica.ba"
                  className="text-sm transition-colors"
                  style={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontFamily: 'var(--font-inter)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--honey-gold)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
                  }}
                >
                  info@kosnica.ba
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

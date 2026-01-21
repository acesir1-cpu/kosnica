'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ROUTES } from '@/config/constants';

export default function SmallFooter() {
  return (
    <footer className="relative" style={{ backgroundColor: '#2d2d2d' }}>
      <div className="container mx-auto px-8 max-lg:px-6 max-md:px-4 max-w-7xl py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left Section - Logo and Copyright */}
          <div className="flex flex-col md:flex-row items-center gap-4">
            {/* Logo */}
            <div className="flex items-center">
              <Image
                src="/Kosnica_logo.svg"
                alt="Košnica.ba Logo"
                width={260}
                height={75}
                className="h-16 w-auto object-contain"
                style={{ filter: 'brightness(0) invert(1)' }}
              />
            </div>
            <span
              className="text-sm"
              style={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontFamily: 'var(--font-inter)',
              }}
            >
              © {new Date().getFullYear()} Košnica.ba. Sva prava zadržana.
            </span>
          </div>

          {/* Right Section - Quick Links */}
          <nav className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
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
              Kontakt
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
          </nav>
        </div>
      </div>
    </footer>
  );
}

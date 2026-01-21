'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ROUTES } from '@/config/constants';

export default function CookiesBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already accepted cookies
    const cookiesAccepted = localStorage.getItem('kosnica_cookies_accepted');
    if (!cookiesAccepted) {
      // Show banner after a short delay for better UX
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('kosnica_cookies_accepted', 'true');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('kosnica_cookies_accepted', 'false');
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
      }`}
      style={{
        fontFamily: 'var(--font-inter)',
      }}
    >
      <div
        className="bg-white border-t-2 shadow-2xl"
        style={{
          borderColor: 'var(--honey-gold)',
          boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.1)',
        }}
      >
        <div className="container mx-auto px-8 max-lg:px-6 max-md:px-4 py-6 max-w-7xl">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
            {/* Cookie Icon */}
            <div className="flex-shrink-0">
              <svg
                className="w-10 h-10"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                style={{ color: 'var(--honey-gold)' }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                />
              </svg>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3
                className="text-lg font-bold mb-2"
                style={{
                  fontFamily: 'var(--font-serif)',
                  color: 'var(--dark-text)',
                }}
              >
                Koristimo kolačiće (cookies)
              </h3>
              <p
                className="text-sm leading-relaxed mb-2"
                style={{
                  color: 'var(--body-text)',
                }}
              >
                Koristimo kolačiće da bismo poboljšali vaše iskustvo na našoj stranici, analizirali promet i personalizovali sadržaj. 
                Više informacija možete pronaći u našoj{' '}
                <Link
                  href={ROUTES.PRIVACY || '/politika-privatnosti'}
                  className="underline font-medium hover:opacity-80 transition-opacity"
                  style={{ color: 'var(--honey-gold)' }}
                >
                  politici privatnosti
                </Link>
                {' '}i{' '}
                <Link
                  href={ROUTES.TERMS || '/uslovi-koristenja'}
                  className="underline font-medium hover:opacity-80 transition-opacity"
                  style={{ color: 'var(--honey-gold)' }}
                >
                  uslovima korištenja
                </Link>
                .
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0 w-full md:w-auto">
              <button
                onClick={handleDecline}
                className="px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 border-2"
                style={{
                  borderColor: 'var(--border-light)',
                  color: 'var(--body-text)',
                  backgroundColor: 'white',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--body-text)';
                  e.currentTarget.style.backgroundColor = 'var(--cream)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-light)';
                  e.currentTarget.style.backgroundColor = 'white';
                }}
              >
                Odbij
              </button>
              <button
                onClick={handleAccept}
                className="px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200"
                style={{
                  background: 'linear-gradient(135deg, #f5c852 0%, #f0c855 100%)',
                  color: 'var(--dark-text)',
                  boxShadow: '0 2px 8px rgba(212, 167, 44, 0.25)',
                  border: '1px solid rgba(212, 167, 44, 0.2)',
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
                Prihvati sve
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

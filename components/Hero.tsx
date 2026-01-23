'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ROUTES } from '@/config/constants';
import { useEffect, useRef, useState } from 'react';

export default function Hero() {
  const imageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [shouldJump, setShouldJump] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const parallaxSpeed = 0.5; // Background moves slower
      
      if (imageRef.current) {
        imageRef.current.style.transform = `translateY(${scrolled * parallaxSpeed}px)`;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Jump animation to suggest scrolling
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    // Only trigger if user hasn't scrolled yet (at top of page)
    const checkScrollPosition = () => {
      return window.scrollY === 0;
    };

    const triggerJump = () => {
      if (checkScrollPosition()) {
        setShouldJump(true);
        // Remove animation class after animation completes
        setTimeout(() => {
          setShouldJump(false);
        }, 2000); // Animation duration: 2 seconds
      }
    };

    // First jump after 3 seconds
    const initialTimeout = setTimeout(() => {
      triggerJump();
      // Set interval for subsequent jumps (every 10 seconds) if user continues watching
      // This will keep triggering as long as user is at the top of the page
      intervalId = setInterval(() => {
        triggerJump();
      }, 10000); // 10 seconds = 10000ms - normal interval after first jump
    }, 3000); // 3 seconds initial delay

    return () => {
      clearTimeout(initialTimeout);
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, []);

  return (
    <section 
      ref={sectionRef}
      className={`relative h-[90vh] flex items-center overflow-hidden transition-transform duration-2000 ease-out ${shouldJump ? 'hero-jump-animation' : ''}`}
    >
      {/* Background Image with Parallax */}
      <div ref={imageRef} className="absolute inset-0 z-0 will-change-transform">
        <Image
          src="/images/hero/hero-beekeeper6.jpg"
          alt="Pčelar drži saće sa medom"
          fill
          className="object-cover"
          priority
          sizes="100vw"
          unoptimized
          onError={(e) => {
            console.error('Error loading image:', e);
          }}
        />
        {/* Gradient overlay - dark on left (text area), transparent on right */}
        <div className="absolute inset-0" style={{ 
          background: 'linear-gradient(to right, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 40%, transparent 100%)' 
        }}></div>
      </div>

      {/* Content - Rule of thirds alignment */}
      <div ref={contentRef} className="container mx-auto px-8 max-lg:px-6 max-md:px-4 relative z-10 w-full h-full">
        <div className="h-full flex items-center">
          <div className="text-left max-md:text-center flex flex-col justify-center max-w-2xl max-md:max-w-full max-md:mx-auto pl-[8%] pr-[8%] max-md:pl-4 max-md:pr-4">
            <h1 className="font-serif font-bold mb-8 max-lg:mb-6 text-7xl max-md:text-5xl max-sm:text-4xl" style={{ 
              fontFamily: 'var(--font-serif)', 
              lineHeight: '1.4', 
              color: '#ffffff',
              letterSpacing: '0.08em',
              textShadow: '0 2px 8px rgba(0,0,0,0.3), 0 1px 3px rgba(0,0,0,0.2)'
            }}>
              <div style={{ whiteSpace: 'nowrap' }}>MED ZA ONE KOJI</div>
              <div style={{ whiteSpace: 'nowrap' }}>ZNAJU <span style={{ color: 'var(--gold-400)' }}>RAZLIKU</span></div>
            </h1>
            <p className="text-xl max-md:text-lg max-sm:text-base font-sans whitespace-nowrap mb-16 max-md:mb-12 max-sm:mb-8" style={{ color: '#ffffff', fontWeight: '400', letterSpacing: '0.05em', opacity: '0.95', textShadow: '0 1px 4px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2)' }}>Prirodno proizveden, bez dodataka, direktno od pčelara.</p>
            <div className="flex flex-row max-sm:flex-col gap-4 max-md:justify-center">
              <Link
                href={ROUTES.PRODUCTS}
                className="hero-button hero-button-primary"
                style={{ 
                  backgroundColor: 'var(--honey-gold)',
                  color: 'var(--dark-text)',
                  minWidth: '160px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--honey-light)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--honey-gold)';
                }}
              >
                Kupi Med
              </Link>
              <Link
                href={ROUTES.ABOUT}
                className="hero-button hero-button-secondary"
                style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  color: '#ffffff',
                  borderWidth: '2px',
                  borderStyle: 'solid',
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  minWidth: '160px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                }}
              >
                Saznaj Više
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator Arrow */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 animate-scroll-bounce">
        <button
          onClick={() => {
            window.scrollTo({ top: window.innerHeight * 0.9, behavior: 'smooth' });
          }}
          className="flex flex-col items-center gap-2 text-white hover:text-[var(--honey-gold)] transition-colors"
          aria-label="Scroll down"
        >
          <span className="text-sm font-sans font-medium opacity-80"></span>
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </button>
      </div>
    </section>
  );
}

'use client';

import { useState } from 'react';

export default function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    setIsSubmitted(true);
    setEmail('');

    // Reset success message after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false);
    }, 3000);
  };

  return (
    <section 
      className="relative py-24 overflow-hidden"
      style={{ 
        backgroundColor: '#1e3a2e', // Dark teal/green
      }}
    >
      <div className="container mx-auto px-8 max-lg:px-6 max-md:px-4 max-w-4xl relative z-10">
        <div className="flex flex-col items-center text-center">
          {/* Email Icon */}
          <div className="mb-6 transition-transform duration-300 hover:scale-110">
            <svg
              className="w-16 h-16"
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
          </div>

          {/* Main Heading */}
          <h2
            className="text-4xl max-md:text-3xl max-sm:text-2xl font-bold mb-4"
            style={{
              fontFamily: 'var(--font-serif)',
              color: 'white',
              letterSpacing: '0.02em',
            }}
          >
            Pridružite Se Našoj Zajednici
          </h2>

          {/* Description */}
          <p
            className="text-lg max-md:text-base mb-8 max-w-2xl"
            style={{
              fontFamily: 'var(--font-inter)',
              color: 'rgba(255, 255, 255, 0.9)',
              lineHeight: '1.6',
            }}
          >
            Dobijajte posebne ponude, savjete o medu i recepte direktno u inbox.
          </p>

          {/* Newsletter Form */}
          <form onSubmit={handleSubmit} className="w-full max-w-lg">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Vaša email adresa"
                required
                className="flex-1 px-6 py-4 rounded-lg text-base focus:outline-none focus:ring-2 transition-all"
                style={{
                  backgroundColor: 'white',
                  color: 'var(--dark-text)',
                  fontFamily: 'var(--font-inter)',
                  border: 'none',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(212, 167, 44, 0.3)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                }}
                disabled={isSubmitting || isSubmitted}
              />
              <button
                type="submit"
                disabled={isSubmitting || isSubmitted}
                className="px-8 py-4 rounded-lg font-semibold text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap"
                style={{
                  backgroundColor: 'var(--honey-gold)',
                  color: 'white',
                  fontFamily: 'var(--font-inter)',
                  minWidth: '160px',
                }}
                onMouseEnter={(e) => {
                  if (!e.currentTarget.disabled) {
                    e.currentTarget.style.backgroundColor = 'var(--honey-light)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!e.currentTarget.disabled) {
                    e.currentTarget.style.backgroundColor = 'var(--honey-gold)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }
                }}
              >
                {isSubmitting ? (
                  'Šalje se...'
                ) : isSubmitted ? (
                  'Poslano!'
                ) : (
                  <>
                    Prijavi se
                    <svg
                      className="w-5 h-5"
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
                  </>
                )}
              </button>
            </div>

            {/* Success Message */}
            {isSubmitted && (
              <p
                className="mt-4 text-sm"
                style={{
                  color: 'var(--honey-gold)',
                  fontFamily: 'var(--font-inter)',
                }}
              >
                Hvala vam! Provjerite vaš inbox.
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}

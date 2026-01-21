'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';

type Testimonial = {
  id: number;
  quote: string;
  name: string;
  location: string;
  image: string;
  rating: number;
};

const testimonials: Testimonial[] = [
  {
    id: 1,
    quote: 'Med je izuzetno aromatičan i osjeti se da je stvarno domaći. Kupujemo redovno i svaki put smo zadovoljni.',
    name: 'Emir K.',
    location: 'Sarajevo',
    image: '/images/reviewers/recenzija (1).jpg',
    rating: 5,
  },
  {
    id: 2,
    quote: 'Najbolji med koji sam ikada probao! Kvalitet je izuzetan, a cijena je pristupačna. Preporučujem svima.',
    name: 'Safet H.',
    location: 'Tuzla',
    image: '/images/reviewers/recenzija (2).jpg',
    rating: 5,
  },
  {
    id: 3,
    quote: 'Kupujem med već godinama i ovo je definitivno najkvalitetniji. Osjeti se razlika u okusu i teksturi.',
    name: 'Amir K.',
    location: 'Zenica',
    image: '/images/reviewers/recenzija (3).jpg',
    rating: 5,
  },
  {
    id: 4,
    quote: 'Brza dostava, sigurno pakovanje i odličan med. Svaki put kada naručim, dobijem najbolji proizvod.',
    name: 'Luka S.',
    location: 'Mostar',
    image: '/images/reviewers/recenzija (4).jpg',
    rating: 5,
  },
  {
    id: 5,
    quote: 'Fantastičan med direktno od pčelara. Osjeti se prirodnost i kvalitet. Definitivno ću naručiti ponovo.',
    name: 'Dino M.',
    location: 'Banja Luka',
    image: '/images/reviewers/recenzija (5).jpg',
    rating: 5,
  },
];

export default function CustomerTestimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
    }, 5000); // Promijeni svakih 5 sekundi

    return () => clearInterval(interval);
  }, []);

  const currentTestimonial = testimonials[currentIndex];

  return (
    <section className="relative py-24 overflow-hidden" style={{ backgroundColor: '#fafaf9' }}>
      {/* Honeycomb pattern - top right */}
      <div className="absolute top-0 right-0 w-64 h-64 opacity-5 pointer-events-none">
        <svg viewBox="0 0 200 200" fill="none" className="w-full h-full" style={{ color: 'var(--brown-600)' }}>
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
          <path
            d="M70 80 L90 80 L100 95 L90 110 L70 110 L60 95 Z"
            stroke="currentColor"
            strokeWidth="1"
            fill="none"
          />
          <path
            d="M110 80 L130 80 L140 95 L130 110 L110 110 L100 95 Z"
            stroke="currentColor"
            strokeWidth="1"
            fill="none"
          />
        </svg>
      </div>

      <div className="container mx-auto px-8 max-lg:px-6 max-md:px-4 max-w-7xl relative z-10">
        <div className="flex items-center gap-12 max-lg:flex-col max-lg:gap-8">
          {/* Left Side - Text Content */}
          <div className="flex-1 max-lg:text-center">
            {/* Main Title */}
            <h2
              className="text-5xl max-lg:text-4xl max-md:text-3xl font-bold mb-6 leading-tight"
              style={{
                fontFamily: 'var(--font-serif)',
                color: 'var(--dark-text)',
                letterSpacing: '0.02em',
              }}
            >
              Šta kažu naši kupci
            </h2>

            {/* Subtitle */}
            <h3
              className="text-2xl max-lg:text-xl max-md:text-lg font-semibold mb-10"
              style={{
                fontFamily: 'var(--font-serif)',
                color: 'var(--dark-text)',
                letterSpacing: '0.01em',
              }}
            >
              Ljudi koji su probali, vraćaju se ponovo!
            </h3>

            {/* Body Text */}
            <div className="space-y-2 mb-8">
              <p
                className="text-lg max-md:text-base leading-relaxed"
                style={{
                  fontFamily: 'var(--font-serif)',
                  color: 'var(--dark-text)',
                  lineHeight: '1.7',
                }}
              >
                Naš med nastaje uz mnogo pažnje, strpljenja i poštovanja prema prirodi.
              </p>
              <p
                className="text-lg max-md:text-base leading-relaxed"
                style={{
                  fontFamily: 'var(--font-serif)',
                  color: 'var(--dark-text)',
                  lineHeight: '1.7',
                }}
              >
                Svaka tegla dolazi direktno od domaćih pčelara koji rade bez prečica i kompromisa.
              </p>
              <p
                className="text-lg max-md:text-base leading-relaxed"
                style={{
                  fontFamily: 'var(--font-serif)',
                  color: 'var(--dark-text)',
                  lineHeight: '1.7',
                }}
              >
                Upravo zato su iskustva naših kupaca naša najveća preporuka.
              </p>
            </div>
          </div>

          {/* Right Side - Testimonial Card */}
          <div className="flex-1 max-lg:w-full">
            <div 
              className="relative rounded-3xl overflow-hidden shadow-lg transition-all duration-500 hover:shadow-2xl hover:scale-[1.02]"
              style={{ 
                minHeight: '450px',
                backgroundColor: 'white',
                border: '1px solid var(--border-light)',
                boxShadow: '0 10px 40px rgba(74, 61, 43, 0.08)',
              }}
            >
              {/* Subtle Background Gradient */}
              <div 
                className="absolute inset-0 opacity-5"
                style={{
                  background: 'linear-gradient(135deg, var(--honey-gold) 0%, var(--gold-400) 50%, var(--honey-light) 100%)',
                }}
              />

              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
                <svg viewBox="0 0 200 200" fill="none" className="w-full h-full" style={{ color: 'var(--honey-gold)' }}>
                  <path
                    d="M50 50 L70 50 L80 65 L70 80 L50 80 L40 65 Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                  />
                  <path
                    d="M90 50 L110 50 L120 65 L110 80 L90 80 L80 65 Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                  />
                </svg>
              </div>

              {/* Testimonial Content */}
              <div className="relative z-10 p-10 max-md:p-8 h-full flex flex-col justify-center items-center text-center">
                {/* Quote Icon */}
                <div className="mb-6 opacity-20">
                  <svg
                    className="w-12 h-12"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    style={{ color: 'var(--honey-gold)' }}
                  >
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.996 2.151c-2.481.967-4.996 2.848-4.996 6.497 0 3.39 1.481 4.988 3.017 5.815v4.537h-7.999zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.481.967-5.996 2.848-5.996 6.497 0 3.39 1.481 4.988 3.017 5.815v4.537h-8.013z" />
                  </svg>
                </div>

                {/* Quote */}
                <blockquote
                  key={currentTestimonial.id}
                  className="text-xl max-md:text-lg italic mb-10 leading-relaxed transition-opacity duration-500 max-w-2xl"
                  style={{
                    fontFamily: 'var(--font-serif)',
                    color: 'var(--dark-text)',
                    lineHeight: '1.7',
                  }}
                >
                  "{currentTestimonial.quote}"
                </blockquote>

                {/* Customer Info */}
                <div className="flex flex-col items-center gap-4">
                  {/* Profile Picture */}
                  <div 
                    className="relative w-20 h-20 rounded-full overflow-hidden flex-shrink-0 border-3 transition-opacity duration-500 shadow-md"
                    style={{ 
                      borderColor: 'var(--honey-gold)',
                      borderWidth: '3px',
                    }}
                  >
                    <Image
                      key={currentTestimonial.id}
                      src={currentTestimonial.image}
                      alt={currentTestimonial.name}
                      fill
                      className="object-cover"
                      loading="lazy"
                      sizes="(max-width: 768px) 100vw, 400px"
                    />
                  </div>

                  {/* Rating and Name */}
                  <div className="flex flex-col items-center">
                    {/* Stars */}
                    <div className="flex gap-1 mb-3">
                      {[...Array(currentTestimonial.rating)].map((_, i) => (
                        <svg
                          key={i}
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          style={{ color: 'var(--honey-gold)' }}
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>

                    {/* Name and Location */}
                    <p
                      key={currentTestimonial.id}
                      className="text-base font-semibold transition-opacity duration-500"
                      style={{
                        fontFamily: 'var(--font-serif)',
                        color: 'var(--dark-text)',
                      }}
                    >
                      {currentTestimonial.name}, {currentTestimonial.location}
                    </p>
                  </div>
                </div>

                {/* Navigation Dots */}
                <div className="flex gap-2 mt-8 justify-center">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className="w-2.5 h-2.5 rounded-full transition-all duration-300"
                      style={{
                        backgroundColor: index === currentIndex ? 'var(--honey-gold)' : 'var(--border-light)',
                        opacity: index === currentIndex ? 1 : 0.4,
                        transform: index === currentIndex ? 'scale(1.2)' : 'scale(1)',
                      }}
                      aria-label={`Prikaži testimonial ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

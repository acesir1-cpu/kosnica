'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';
import Footer from '@/components/Footer';
import { ROUTES } from '@/config/constants';

export default function DeliveryAndReturnsPage() {
  // Intersection Observer for scroll animations
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
      { threshold: 0.1, rootMargin: '0px 0px -100px 0px' }
    );

    const sections = document.querySelectorAll('[data-animate-section]');
    sections.forEach((section) => observer.observe(section));

    return () => {
      sections.forEach((section) => observer.unobserve(section));
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#ffffff' }}>
      {/* Breadcrumbs */}
      <div className="container mx-auto px-8 max-lg:px-6 max-md:px-4 max-w-7xl pt-8">
        <Breadcrumbs
          items={[
            { label: 'Početna', href: ROUTES.HOME },
            { label: 'Dostava i povrati' },
          ]}
        />
      </div>

      {/* Hero Section */}
      <section 
        data-animate-section
        className="relative py-16 mb-20"
        style={{ backgroundColor: '#ffffff' }}
      >
        <div className="container mx-auto px-8 max-lg:px-6 max-md:px-4 max-w-7xl">
          <div className="text-center max-w-4xl mx-auto">
            <h1
              className="text-5xl max-md:text-4xl max-sm:text-3xl font-bold mb-6"
              style={{
                fontFamily: 'var(--font-serif)',
                color: 'var(--dark-text)',
              }}
            >
              Dostava i povrati
            </h1>
            <p
              className="text-xl max-md:text-lg mb-8 leading-relaxed"
              style={{
                fontFamily: 'var(--font-inter)',
                color: 'var(--body-text)',
              }}
            >
              Sve informacije o našoj politici dostave i povrata proizvoda. 
              Naš cilj je da vaša narudžba stigne brzo i sigurno.
            </p>
          </div>
        </div>
      </section>

      {/* Delivery Section */}
      <section 
        data-animate-section
        className="relative py-20 mb-20"
        style={{ backgroundColor: 'var(--cream)' }}
      >
        <div className="container mx-auto px-8 max-lg:px-6 max-md:px-4 max-w-7xl">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: 'var(--blue-light)' }}>
                <svg
                  className="w-10 h-10"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  style={{ color: 'var(--blue-primary)' }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                  />
                </svg>
              </div>
              <h2
                className="text-4xl max-md:text-3xl font-bold mb-4"
                style={{
                  fontFamily: 'var(--font-serif)',
                  color: 'var(--dark-text)',
                }}
              >
                Informacije o dostavi
              </h2>
              <p
                className="text-lg max-w-2xl mx-auto"
                style={{
                  fontFamily: 'var(--font-inter)',
                  color: 'var(--body-text)',
                }}
              >
                Naš tim radi na tome da vaša narudžba stigne na vrijeme i u savršenom stanju
              </p>
            </div>

            {/* Delivery Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              {/* Standard Delivery */}
              <div className="bg-white rounded-xl p-8 shadow-sm border transition-all duration-300 hover:shadow-lg hover:-translate-y-2" style={{ borderColor: 'var(--border-light)' }}>
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: 'var(--blue-light)' }}>
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
                      d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                    />
                  </svg>
                </div>
                <h3
                  className="text-2xl font-bold mb-4"
                  style={{
                    fontFamily: 'var(--font-serif)',
                    color: 'var(--dark-text)',
                  }}
                >
                  Standardna dostava
                </h3>
                <ul className="space-y-3 mb-6">
                  {[
                    'Dostava na teritoriji cijele Bosne i Hercegovine',
                    'Vrijeme dostave: 2-5 radnih dana',
                    'Troškovi se izračunavaju na osnovu težine i udaljenosti',
                    'Praćenje narudžbe dostupno tokom cijelog procesa',
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <svg
                        className="w-5 h-5 flex-shrink-0 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        style={{ color: 'var(--green-primary)' }}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span
                        className="text-sm leading-relaxed"
                        style={{
                          fontFamily: 'var(--font-inter)',
                          color: 'var(--body-text)',
                        }}
                      >
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Express Delivery */}
              <div className="bg-white rounded-xl p-8 shadow-sm border transition-all duration-300 hover:shadow-lg hover:-translate-y-2" style={{ borderColor: 'var(--border-light)' }}>
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: 'var(--blue-light)' }}>
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
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h3
                  className="text-2xl font-bold mb-4"
                  style={{
                    fontFamily: 'var(--font-serif)',
                    color: 'var(--dark-text)',
                  }}
                >
                  Brza dostava
                </h3>
                <ul className="space-y-3 mb-6">
                  {[
                    'Dostupna za veće gradove',
                    'Vrijeme dostave: 1-2 radna dana',
                    'Idealna za hitne narudžbe',
                    'Dodatni troškovi dostave primjenjuju se',
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <svg
                        className="w-5 h-5 flex-shrink-0 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        style={{ color: 'var(--green-primary)' }}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span
                        className="text-sm leading-relaxed"
                        style={{
                          fontFamily: 'var(--font-inter)',
                          color: 'var(--body-text)',
                        }}
                      >
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Free Delivery Info */}
            <div className="bg-white rounded-xl p-8 shadow-sm border mb-8" style={{ borderColor: 'var(--border-light)' }}>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    style={{ color: 'var(--green-primary)' }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div>
                  <h3
                    className="text-xl font-bold mb-2"
                    style={{
                      fontFamily: 'var(--font-serif)',
                      color: 'var(--dark-text)',
                    }}
                  >
                    Besplatna dostava
                  </h3>
                  <p
                    className="text-sm leading-relaxed"
                    style={{
                      fontFamily: 'var(--font-inter)',
                      color: 'var(--body-text)',
                    }}
                  >
                    Dostava je besplatna za sve narudžbe preko 50 KM. Ovo se automatski primjenjuje prilikom naplate.
                  </p>
                </div>
              </div>
            </div>

            {/* Delivery Process */}
            <div className="bg-white rounded-xl p-8 shadow-sm border" style={{ borderColor: 'var(--border-light)' }}>
              <h3
                className="text-2xl font-bold mb-6"
                style={{
                  fontFamily: 'var(--font-serif)',
                  color: 'var(--dark-text)',
                }}
              >
                Proces dostave
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  {
                    step: '1',
                    title: 'Naručivanje',
                    description: 'Vaša narudžba je primljena i potvrđena',
                  },
                  {
                    step: '2',
                    title: 'Priprema',
                    description: 'Vašu narudžbu pažljivo pripremamo za slanje',
                  },
                  {
                    step: '3',
                    title: 'Otprema',
                    description: 'Naručba je otpremljena i dostupna je informacija o praćenju',
                  },
                  {
                    step: '4',
                    title: 'Dostava',
                    description: 'Vaša narudžba stiže na vašu adresu',
                  },
                ].map((item, index) => (
                  <div key={index} className="text-center">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'var(--blue-light)' }}>
                      <span
                        className="text-2xl font-bold"
                        style={{
                          color: 'var(--blue-primary)',
                          fontFamily: 'var(--font-inter)',
                        }}
                      >
                        {item.step}
                      </span>
                    </div>
                    <h4
                      className="text-base font-bold mb-2"
                      style={{
                        fontFamily: 'var(--font-inter)',
                        color: 'var(--dark-text)',
                      }}
                    >
                      {item.title}
                    </h4>
                    <p
                      className="text-xs leading-relaxed"
                      style={{
                        fontFamily: 'var(--font-inter)',
                        color: 'var(--body-text)',
                      }}
                    >
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Returns Section */}
      <section 
        data-animate-section
        className="relative py-20 mb-20"
        style={{ backgroundColor: '#ffffff' }}
      >
        <div className="container mx-auto px-8 max-lg:px-6 max-md:px-4 max-w-7xl">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: 'var(--blue-light)' }}>
                <svg
                  className="w-10 h-10"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  style={{ color: 'var(--blue-primary)' }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </div>
              <h2
                className="text-4xl max-md:text-3xl font-bold mb-4"
                style={{
                  fontFamily: 'var(--font-serif)',
                  color: 'var(--dark-text)',
                }}
              >
                Politika povrata
              </h2>
              <p
                className="text-lg max-w-2xl mx-auto"
                style={{
                  fontFamily: 'var(--font-inter)',
                  color: 'var(--body-text)',
                }}
              >
                Uvijek možete vratiti proizvod ako niste zadovoljni, u skladu sa našim uslovima
              </p>
            </div>

            {/* Returns Info */}
            <div className="bg-white rounded-xl p-8 shadow-sm border mb-8" style={{ borderColor: 'var(--border-light)' }}>
              <h3
                className="text-2xl font-bold mb-6"
                style={{
                  fontFamily: 'var(--font-serif)',
                  color: 'var(--dark-text)',
                }}
              >
                Uslovi povrata
              </h3>
              <ul className="space-y-4">
                {[
                  {
                    title: 'Rok za povrat',
                    description: 'Povrat proizvoda je moguć u roku od 14 dana od datuma isporuke. Rok počinje od dana kada primite proizvod.',
                  },
                  {
                    title: 'Stanje proizvoda',
                    description: 'Proizvod mora biti netaknut, u originalnom pakovanju, sa svim priloženim dokumentima i originalnom fakturom. Proizvod ne smije biti korišten.',
                  },
                  {
                    title: 'Troškovi povrata',
                    description: 'Troškovi povrata snosi kupac, osim u slučaju greške na našoj strani (pogrešan proizvod, oštećen tokom transporta, itd.).',
                  },
                  {
                    title: 'Povrat novca',
                    description: 'Povrat novca se vrši na isti način kako je plaćanje izvršeno. Proces povrata novca traje 5-7 radnih dana nakon što primimo i provjerimo vraćeni proizvod.',
                  },
                ].map((item, index) => (
                  <li key={index} className="pb-4 border-b last:border-b-0 last:pb-0" style={{ borderColor: 'var(--border-light)' }}>
                    <h4
                      className="text-lg font-bold mb-2"
                      style={{
                        fontFamily: 'var(--font-inter)',
                        color: 'var(--dark-text)',
                      }}
                    >
                      {item.title}
                    </h4>
                    <p
                      className="text-sm leading-relaxed"
                      style={{
                        fontFamily: 'var(--font-inter)',
                        color: 'var(--body-text)',
                      }}
                    >
                      {item.description}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            {/* Returns Process */}
            <div className="bg-white rounded-xl p-8 shadow-sm border" style={{ borderColor: 'var(--border-light)' }}>
              <h3
                className="text-2xl font-bold mb-6"
                style={{
                  fontFamily: 'var(--font-serif)',
                  color: 'var(--dark-text)',
                }}
              >
                Kako vratiti proizvod
              </h3>
              <div className="space-y-6">
                {[
                  {
                    step: '1',
                    title: 'Kontaktirajte nas',
                    description: 'Pošaljite nam email na info@kosnica.ba ili nas pozovite na +387 33 123 456 da obavijestite o povratu. Navedite broj narudžbe i razlog povrata.',
                  },
                  {
                    step: '2',
                    title: 'Priprema za povrat',
                    description: 'Uputstvo za povrat će vam biti poslano. Proizvod pakujte u originalno pakovanje sa svim priloženim dokumentima i fakturom.',
                  },
                  {
                    step: '3',
                    title: 'Slanje proizvoda',
                    description: 'Pošaljite proizvod na našu adresu preporučenom pošiljkom ili kurirskom službom. Troškove dostave snosite vi, osim ako nije greška na našoj strani.',
                  },
                  {
                    step: '4',
                    title: 'Provjera i povrat novca',
                    description: 'Nakon primitka i provjere proizvoda, kontaktiraćemo vas i izvršiti povrat novca u roku od 5-7 radnih dana.',
                  },
                ].map((item, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--blue-light)' }}>
                      <span
                        className="text-xl font-bold"
                        style={{
                          color: 'var(--blue-primary)',
                          fontFamily: 'var(--font-inter)',
                        }}
                      >
                        {item.step}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h4
                        className="text-lg font-bold mb-2"
                        style={{
                          fontFamily: 'var(--font-inter)',
                          color: 'var(--dark-text)',
                        }}
                      >
                        {item.title}
                      </h4>
                      <p
                        className="text-sm leading-relaxed"
                        style={{
                          fontFamily: 'var(--font-inter)',
                          color: 'var(--body-text)',
                        }}
                      >
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Info Section */}
      <section 
        data-animate-section
        className="relative py-20 mb-20"
        style={{ backgroundColor: 'var(--cream)' }}
      >
        <div className="container mx-auto px-8 max-lg:px-6 max-md:px-4 max-w-7xl">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Packaging */}
              <div className="bg-white rounded-xl p-8 shadow-sm border" style={{ borderColor: 'var(--border-light)' }}>
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: 'var(--blue-light)' }}>
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
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                </div>
                <h3
                  className="text-2xl font-bold mb-4"
                  style={{
                    fontFamily: 'var(--font-serif)',
                    color: 'var(--dark-text)',
                  }}
                >
                  Pakovanje
                </h3>
                <p
                  className="text-sm leading-relaxed mb-4"
                  style={{
                    fontFamily: 'var(--font-inter)',
                    color: 'var(--body-text)',
                  }}
                >
                  Svi proizvodi se pažljivo pakuju kako bismo osigurali da vaš med stigne u savršenom stanju. Koristimo kvalitetne materijale za pakovanje koji štite proizvode tokom transporta.
                </p>
                <ul className="space-y-2">
                  {[
                    'Sigurno pakovanje za zaštitu meda',
                    'Zaštitni materijali protiv oštećenja',
                    'Ekološki prihvatljivi materijali',
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <svg
                        className="w-4 h-4 flex-shrink-0 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        style={{ color: 'var(--green-primary)' }}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span
                        className="text-xs leading-relaxed"
                        style={{
                          fontFamily: 'var(--font-inter)',
                          color: 'var(--body-text)',
                        }}
                      >
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tracking */}
              <div className="bg-white rounded-xl p-8 shadow-sm border" style={{ borderColor: 'var(--border-light)' }}>
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: 'var(--blue-light)' }}>
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
                      d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                    />
                  </svg>
                </div>
                <h3
                  className="text-2xl font-bold mb-4"
                  style={{
                    fontFamily: 'var(--font-serif)',
                    color: 'var(--dark-text)',
                  }}
                >
                  Praćenje narudžbe
                </h3>
                <p
                  className="text-sm leading-relaxed mb-4"
                  style={{
                    fontFamily: 'var(--font-inter)',
                    color: 'var(--body-text)',
                  }}
                >
                  Nakon što vaša narudžba bude otpremljena, dobićete email sa brojem za praćenje. Možete pratiti status svoje narudžbe tokom cijelog procesa dostave.
                </p>
                <ul className="space-y-2">
                  {[
                    'Email obavještenje o otpremi',
                    'Broj za praćenje pošiljke',
                    'Ažuriranja o statusu u realnom vremenu',
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <svg
                        className="w-4 h-4 flex-shrink-0 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        style={{ color: 'var(--green-primary)' }}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span
                        className="text-xs leading-relaxed"
                        style={{
                          fontFamily: 'var(--font-inter)',
                          color: 'var(--body-text)',
                        }}
                      >
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA Section */}
      <section 
        data-animate-section
        className="relative py-20 mb-20"
        style={{ backgroundColor: '#ffffff' }}
      >
        <div className="container mx-auto px-8 max-lg:px-6 max-md:px-4 max-w-4xl text-center">
          <h2
            className="text-3xl max-md:text-2xl font-bold mb-4"
            style={{
              fontFamily: 'var(--font-serif)',
              color: 'var(--dark-text)',
            }}
          >
            Imate dodatna pitanja o dostavi ili povratu?
          </h2>
          <p
            className="text-lg mb-8"
            style={{
              fontFamily: 'var(--font-inter)',
              color: 'var(--body-text)',
            }}
          >
            Naš tim je tu da vam pomogne sa svim pitanjima
          </p>
          <Link
            href={ROUTES.CONTACT}
            className="inline-block px-8 py-4 rounded-lg font-semibold text-base transition-all"
            style={{
              backgroundColor: 'var(--honey-gold)',
              color: 'white',
              fontFamily: 'var(--font-inter)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--honey-light)';
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(212, 167, 44, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--honey-gold)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Kontaktirajte nas
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}

'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';
import Footer from '@/components/Footer';
import { ROUTES } from '@/config/constants';
import { useToastContext } from '@/components/ToastProvider';

export default function BecomeBeekeeperPage() {
  const { showToast } = useToastContext();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    apiaryCount: '',
    experience: '',
    description: '',
    acceptTerms: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsSubmitting(false);
    showToast('Vaša prijava je uspješno poslata! Kontaktiraćemo vas uskoro.', 'success');
    
    // Reset form
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      location: '',
      apiaryCount: '',
      experience: '',
      description: '',
      acceptTerms: false,
    });
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#ffffff' }}>
      {/* Breadcrumbs */}
      <div className="container mx-auto px-8 max-lg:px-6 max-md:px-4 max-w-7xl pt-8">
        <Breadcrumbs
          items={[
            { label: 'Početna', href: ROUTES.HOME },
            { label: 'Postani pčelar' },
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
              Postanite dio našeg tima
            </h1>
            <p
              className="text-xl max-md:text-lg mb-8 leading-relaxed"
              style={{
                fontFamily: 'var(--font-inter)',
                color: 'var(--body-text)',
              }}
            >
              Pridružite se našoj zajednici pčelara i prodajte svoj prirodni med direktno kupcima
              širom Bosne i Hercegovine. Mi vam pružamo platformu, a vi se fokusirajte na ono što
              najbolje znate - proizvodnju kvalitetnog meda.
            </p>
          </div>
        </div>
      </section>

      {/* Application Form Section */}
      <section 
        data-animate-section
        className="relative py-20 mb-20"
        style={{ backgroundColor: 'var(--cream)' }}
      >
        <div className="container mx-auto px-8 max-lg:px-6 max-md:px-4 max-w-4xl">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-md:p-6 border" style={{ borderColor: 'var(--border-light)' }}>
            <h2
              className="text-3xl max-md:text-2xl font-bold mb-8 text-center"
              style={{
                fontFamily: 'var(--font-serif)',
                color: 'var(--dark-text)',
              }}
            >
              Prijava za pčelare
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Fields */}
              <div className="grid grid-cols-2 max-md:grid-cols-1 gap-6">
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-semibold mb-2"
                    style={{
                      fontFamily: 'var(--font-inter)',
                      color: 'var(--dark-text)',
                    }}
                  >
                    Ime <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                    style={{
                      backgroundColor: '#ffffff',
                      borderColor: 'var(--border-light)',
                      color: 'var(--dark-text)',
                      fontFamily: 'var(--font-inter)',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'var(--blue-primary)';
                      e.currentTarget.style.boxShadow = '0 0 0 3px var(--blue-light)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-light)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>

                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-semibold mb-2"
                    style={{
                      fontFamily: 'var(--font-inter)',
                      color: 'var(--dark-text)',
                    }}
                  >
                    Prezime <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    required
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                    style={{
                      backgroundColor: '#ffffff',
                      borderColor: 'var(--border-light)',
                      color: 'var(--dark-text)',
                      fontFamily: 'var(--font-inter)',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'var(--blue-primary)';
                      e.currentTarget.style.boxShadow = '0 0 0 3px var(--blue-light)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-light)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>

              {/* Contact Fields */}
              <div className="grid grid-cols-2 max-md:grid-cols-1 gap-6">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold mb-2"
                    style={{
                      fontFamily: 'var(--font-inter)',
                      color: 'var(--dark-text)',
                    }}
                  >
                    Email <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                    style={{
                      backgroundColor: '#ffffff',
                      borderColor: 'var(--border-light)',
                      color: 'var(--dark-text)',
                      fontFamily: 'var(--font-inter)',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'var(--blue-primary)';
                      e.currentTarget.style.boxShadow = '0 0 0 3px var(--blue-light)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-light)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-semibold mb-2"
                    style={{
                      fontFamily: 'var(--font-inter)',
                      color: 'var(--dark-text)',
                    }}
                  >
                    Telefon <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                    style={{
                      backgroundColor: '#ffffff',
                      borderColor: 'var(--border-light)',
                      color: 'var(--dark-text)',
                      fontFamily: 'var(--font-inter)',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'var(--blue-primary)';
                      e.currentTarget.style.boxShadow = '0 0 0 3px var(--blue-light)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-light)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label
                  htmlFor="location"
                  className="block text-sm font-semibold mb-2"
                  style={{
                    fontFamily: 'var(--font-inter)',
                    color: 'var(--dark-text)',
                  }}
                >
                  Lokacija (Grad/Općina) <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  required
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="npr. Sarajevo, Banja Luka, Mostar..."
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                  style={{
                    backgroundColor: '#ffffff',
                    borderColor: 'var(--border-light)',
                    color: 'var(--dark-text)',
                    fontFamily: 'var(--font-inter)',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--blue-primary)';
                    e.currentTarget.style.boxShadow = '0 0 0 3px var(--blue-light)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-light)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>

              {/* Apiary Count and Experience */}
              <div className="grid grid-cols-2 max-md:grid-cols-1 gap-6">
                <div>
                  <label
                    htmlFor="apiaryCount"
                    className="block text-sm font-semibold mb-2"
                    style={{
                      fontFamily: 'var(--font-inter)',
                      color: 'var(--dark-text)',
                    }}
                  >
                    Broj košnica (približno)
                  </label>
                  <input
                    type="number"
                    id="apiaryCount"
                    name="apiaryCount"
                    min="1"
                    value={formData.apiaryCount}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                    style={{
                      backgroundColor: '#ffffff',
                      borderColor: 'var(--border-light)',
                      color: 'var(--dark-text)',
                      fontFamily: 'var(--font-inter)',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'var(--blue-primary)';
                      e.currentTarget.style.boxShadow = '0 0 0 3px var(--blue-light)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-light)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>

                <div>
                  <label
                    htmlFor="experience"
                    className="block text-sm font-semibold mb-2"
                    style={{
                      fontFamily: 'var(--font-inter)',
                      color: 'var(--dark-text)',
                    }}
                  >
                    Iskustvo u pčelarstvu
                  </label>
                  <select
                    id="experience"
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                    style={{
                      backgroundColor: '#ffffff',
                      borderColor: 'var(--border-light)',
                      color: 'var(--dark-text)',
                      fontFamily: 'var(--font-inter)',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'var(--blue-primary)';
                      e.currentTarget.style.boxShadow = '0 0 0 3px var(--blue-light)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-light)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <option value="">Odaberite...</option>
                    <option value="0-1">0-1 godina (Početnik)</option>
                    <option value="2-5">2-5 godina</option>
                    <option value="6-10">6-10 godina</option>
                    <option value="10+">Više od 10 godina</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-semibold mb-2"
                  style={{
                    fontFamily: 'var(--font-inter)',
                    color: 'var(--dark-text)',
                  }}
                >
                  Opis vašeg pčelarstva (opcionalno)
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={5}
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Kratko opišite vašu proizvodnju, vrste meda koje proizvodite, lokaciju vaših košnica..."
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-all resize-none"
                  style={{
                    backgroundColor: '#ffffff',
                    borderColor: 'var(--border-light)',
                    color: 'var(--dark-text)',
                    fontFamily: 'var(--font-inter)',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--blue-primary)';
                    e.currentTarget.style.boxShadow = '0 0 0 3px var(--blue-light)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-light)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="acceptTerms"
                  name="acceptTerms"
                  required
                  checked={formData.acceptTerms}
                  onChange={handleInputChange}
                  className="w-5 h-5 rounded border focus:ring-2 focus:ring-offset-2 cursor-pointer flex-shrink-0"
                  style={{
                    borderColor: 'var(--border-light)',
                    accentColor: 'var(--blue-primary)',
                  }}
                />
                <label
                  htmlFor="acceptTerms"
                  className="text-sm leading-relaxed"
                  style={{
                    fontFamily: 'var(--font-inter)',
                    color: 'var(--body-text)',
                  }}
                >
                  Prihvatam <Link href="/uslovi-koristenja" className="underline hover:no-underline" style={{ color: 'var(--blue-primary)' }}>uslove korištenja</Link> i{' '}
                  <Link href="/politika-privatnosti" className="underline hover:no-underline" style={{ color: 'var(--blue-primary)' }}>politiku privatnosti</Link> <span style={{ color: '#dc2626' }}>*</span>
                </label>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-lg font-semibold text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: 'var(--honey-gold)',
                    color: 'white',
                    fontFamily: 'var(--font-inter)',
                  }}
                  onMouseEnter={(e) => {
                    if (!e.currentTarget.disabled) {
                      e.currentTarget.style.backgroundColor = 'var(--honey-light)';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(212, 167, 44, 0.3)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!e.currentTarget.disabled) {
                      e.currentTarget.style.backgroundColor = 'var(--honey-gold)';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }
                  }}
                >
                  {isSubmitting ? 'Šalje se...' : 'Pošaljite prijavu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Cooperation Info Section */}
      <section 
        id="saradnja"
        data-animate-section
        className="relative py-20 mb-20"
        style={{ backgroundColor: '#ffffff' }}
      >
        <div className="container mx-auto px-8 max-lg:px-6 max-md:px-4 max-w-7xl">
          <div className="text-center mb-12">
            <h2
              className="text-4xl max-md:text-3xl font-bold mb-4"
              style={{
                fontFamily: 'var(--font-serif)',
                color: 'var(--dark-text)',
              }}
            >
              Informacije o saradnji
            </h2>
            <p
              className="text-lg max-w-2xl mx-auto"
              style={{
                fontFamily: 'var(--font-inter)',
                color: 'var(--body-text)',
              }}
            >
              Kako funkcioniše saradnja sa nama
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-white rounded-xl p-6 shadow-sm border text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-2" style={{ borderColor: 'var(--border-light)' }}>
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'var(--blue-light)' }}>
                <span
                  className="text-2xl font-bold"
                  style={{
                    color: 'var(--blue-primary)',
                    fontFamily: 'var(--font-inter)',
                  }}
                >
                  1
                </span>
              </div>
              <h3
                className="text-xl font-bold mb-3"
                style={{
                  fontFamily: 'var(--font-serif)',
                  color: 'var(--dark-text)',
                }}
              >
                Pošaljite prijavu
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{
                  fontFamily: 'var(--font-inter)',
                  color: 'var(--body-text)',
                }}
              >
                Popunite formu sa osnovnim informacijama o vama i vašem pčelarstvu. Kontaktiraćemo vas u najkraćem roku.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-xl p-6 shadow-sm border text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-2" style={{ borderColor: 'var(--border-light)' }}>
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'var(--blue-light)' }}>
                <span
                  className="text-2xl font-bold"
                  style={{
                    color: 'var(--blue-primary)',
                    fontFamily: 'var(--font-inter)',
                  }}
                >
                  2
                </span>
              </div>
              <h3
                className="text-xl font-bold mb-3"
                style={{
                  fontFamily: 'var(--font-serif)',
                  color: 'var(--dark-text)',
                }}
              >
                Pregled i odobrenje
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{
                  fontFamily: 'var(--font-inter)',
                  color: 'var(--body-text)',
                }}
              >
                Naš tim će pregledati vašu prijavu i proizvode. Ukoliko sve ispunjava naše kriterije kvaliteta, odobrit ćemo vašu prijavu.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-xl p-6 shadow-sm border text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-2" style={{ borderColor: 'var(--border-light)' }}>
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'var(--blue-light)' }}>
                <span
                  className="text-2xl font-bold"
                  style={{
                    color: 'var(--blue-primary)',
                    fontFamily: 'var(--font-inter)',
                  }}
                >
                  3
                </span>
              </div>
              <h3
                className="text-xl font-bold mb-3"
                style={{
                  fontFamily: 'var(--font-serif)',
                  color: 'var(--dark-text)',
                }}
              >
                Počnite prodavati
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{
                  fontFamily: 'var(--font-inter)',
                  color: 'var(--body-text)',
                }}
              >
                Nakon odobrenja, vaši proizvodi će biti vidljivi na platformi i možete početi sa prodajom direktno kupcima.
              </p>
            </div>
          </div>

          {/* Benefits */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-sm border" style={{ borderColor: 'var(--border-light)' }}>
              <h3
                className="text-2xl font-bold mb-4"
                style={{
                  fontFamily: 'var(--font-serif)',
                  color: 'var(--dark-text)',
                }}
              >
                Prednosti saradnje
              </h3>
              <ul className="space-y-3">
                {[
                  'Direktna prodaja bez posrednika',
                  'Brza i sigurna dostava',
                  'Profesionalna prezentacija proizvoda',
                  'Podrška i marketing',
                  'Sigurna naplata',
                ].map((benefit, index) => (
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
                      className="text-sm"
                      style={{
                        fontFamily: 'var(--font-inter)',
                        color: 'var(--body-text)',
                      }}
                    >
                      {benefit}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-sm border" style={{ borderColor: 'var(--border-light)' }}>
              <h3
                className="text-2xl font-bold mb-4"
                style={{
                  fontFamily: 'var(--font-serif)',
                  color: 'var(--dark-text)',
                }}
              >
                Naš pristup
              </h3>
              <p
                className="text-sm leading-relaxed mb-4"
                style={{
                  fontFamily: 'var(--font-inter)',
                  color: 'var(--body-text)',
                }}
              >
                Vjerujemo u podršku lokalnih pčelara i promociju prirodnog meda. Naš cilj je povezati
                pčelare sa kupcima koji cijene kvalitet i autentičnost. Saradnja je jednostavna i
                transparentna - vi proizvodite kvalitetan med, a mi vam pružamo platformu za prodaju.
              </p>
              <p
                className="text-sm leading-relaxed"
                style={{
                  fontFamily: 'var(--font-inter)',
                  color: 'var(--body-text)',
                }}
              >
                Nema skrivenih troškova ili komplikacija. Naš tim je uvijek tu da vam pomogne sa svim
                pitanjima i obezbijedi najbolje iskustvo za vas i vaše kupce.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section 
        id="faq"
        data-animate-section
        className="relative py-20 mb-20"
        style={{ backgroundColor: 'var(--cream)' }}
      >
        <div className="container mx-auto px-8 max-lg:px-6 max-md:px-4 max-w-4xl">
          <div className="text-center mb-12">
            <h2
              className="text-4xl max-md:text-3xl font-bold mb-4"
              style={{
                fontFamily: 'var(--font-serif)',
                color: 'var(--dark-text)',
              }}
            >
              Česta pitanja
            </h2>
            <p
              className="text-lg max-w-2xl mx-auto"
              style={{
                fontFamily: 'var(--font-inter)',
                color: 'var(--body-text)',
              }}
            >
              Odgovori na najčešća pitanja o saradnji
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                question: 'Koji su uslovi za saradnju?',
                answer: 'Tražimo pčelare koji proizvode prirodan, sirovi med visokog kvaliteta. Važno je da imate dozvole za proizvodnju i da vaši proizvodi ispunjavaju sve zdravstvene standarde. Broj košnica nije presudan - radimo i sa manjim i većim pčelarima.',
              },
              {
                question: 'Koliko traje proces odobrenja?',
                answer: 'Nakon što pošaljete prijavu, kontaktiraćemo vas u roku od 3-5 radnih dana. Ukoliko je sve u redu sa dokumentacijom i proizvodima, proces odobrenja može biti završen u roku od 2 nedelje.',
              },
              {
                question: 'Kakve su provizije?',
                answer: 'Provizije su transparentne i konkurentne. Detalje o provizijama i uslovima saradnje ćemo vam objasniti nakon što prođe vaša prijava i u razgovoru sa našim timom.',
              },
              {
                question: 'Kako funkcioniše dostava?',
                answer: 'Mi organizujemo dostavu za vaše proizvode. Naša logistička mreža pokriva cijelu Bosnu i Hercegovinu i osigurava brzu i sigurnu dostavu do kupaca.',
              },
              {
                question: 'Mogu li postaviti svoje cijene?',
                answer: 'Da, vi određujete cijene za vaše proizvode. Naš tim može vam dati preporuke na osnovu tržišnih cijena, ali konačna odluka je na vama.',
              },
              {
                question: 'Šta ako imam dodatna pitanja?',
                answer: 'Naš tim je uvijek tu da vam pomogne. Možete nas kontaktirati putem emaila ili telefona, i rado ćemo odgovoriti na sva vaša pitanja.',
              },
            ].map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-sm border"
                style={{ borderColor: 'var(--border-light)' }}
              >
                <h3
                  className="text-lg font-bold mb-3"
                  style={{
                    fontFamily: 'var(--font-serif)',
                    color: 'var(--dark-text)',
                  }}
                >
                  {faq.question}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{
                    fontFamily: 'var(--font-inter)',
                    color: 'var(--body-text)',
                  }}
                >
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
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
            Imate dodatna pitanja?
          </h2>
          <p
            className="text-lg mb-8"
            style={{
              fontFamily: 'var(--font-inter)',
              color: 'var(--body-text)',
            }}
          >
            Kontaktirajte nas i rado ćemo vam pomoći
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

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';
import Footer from '@/components/Footer';
import { ROUTES } from '@/config/constants';
import { useToastContext } from '@/components/ToastProvider';

export default function ContactPage() {
  const { showToast } = useToastContext();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
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
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsSubmitting(false);
    showToast('Vaša poruka je uspješno poslata! Kontaktiraćemo vas uskoro.', 'success');
    
    // Reset form
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
    });
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#ffffff' }}>
      {/* Breadcrumbs */}
      <div className="container mx-auto px-8 max-lg:px-6 max-md:px-4 max-w-7xl pt-8">
        <Breadcrumbs
          items={[
            { label: 'Početna', href: ROUTES.HOME },
            { label: 'Kontaktirajte nas' },
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
              Kontaktirajte nas
            </h1>
            <p
              className="text-xl max-md:text-lg mb-8 leading-relaxed"
              style={{
                fontFamily: 'var(--font-inter)',
                color: 'var(--body-text)',
              }}
            >
              Imate pitanje ili trebate pomoć? Rado ćemo odgovoriti na sve vaše upite.
              Kontaktirajte nas putem forme, telefona ili emaila.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form and Info Section */}
      <section 
        data-animate-section
        className="relative py-20 mb-20"
        style={{ backgroundColor: 'var(--cream)' }}
      >
        <div className="container mx-auto px-8 max-lg:px-6 max-md:px-4 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-white rounded-2xl shadow-lg p-8 max-md:p-6 border" style={{ borderColor: 'var(--border-light)' }}>
              <h2
                className="text-3xl max-md:text-2xl font-bold mb-8"
                style={{
                  fontFamily: 'var(--font-serif)',
                  color: 'var(--dark-text)',
                }}
              >
                Pošaljite nam poruku
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name */}
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-semibold mb-2"
                    style={{
                      fontFamily: 'var(--font-inter)',
                      color: 'var(--dark-text)',
                    }}
                  >
                    Ime i prezime <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
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

                {/* Email and Phone */}
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
                      Telefon
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
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

                {/* Subject */}
                <div>
                  <label
                    htmlFor="subject"
                    className="block text-sm font-semibold mb-2"
                    style={{
                      fontFamily: 'var(--font-inter)',
                      color: 'var(--dark-text)',
                    }}
                  >
                    Tema <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    required
                    value={formData.subject}
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
                    <option value="">Odaberite temu...</option>
                    <option value="proizvod">Pitanje o proizvodu</option>
                    <option value="dostava">Dostava i povrati</option>
                    <option value="narudzba">Naručivanje</option>
                    <option value="saradnja">Saradnja</option>
                    <option value="ostalo">Ostalo</option>
                  </select>
                </div>

                {/* Message */}
                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-semibold mb-2"
                    style={{
                      fontFamily: 'var(--font-inter)',
                      color: 'var(--dark-text)',
                    }}
                  >
                    Poruka <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    required
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Opišite vaše pitanje ili problem..."
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
                    {isSubmitting ? 'Šalje se...' : 'Pošaljite poruku'}
                  </button>
                </div>
              </form>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              {/* Contact Cards */}
              <div className="bg-white rounded-2xl shadow-lg p-8 max-md:p-6 border" style={{ borderColor: 'var(--border-light)' }}>
                <h2
                  className="text-3xl max-md:text-2xl font-bold mb-8"
                  style={{
                    fontFamily: 'var(--font-serif)',
                    color: 'var(--dark-text)',
                  }}
                >
                  Kontakt informacije
                </h2>

                <div className="space-y-6">
                  {/* Location */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--blue-light)' }}>
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        style={{ color: 'var(--blue-primary)' }}
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
                    </div>
                    <div>
                      <h3
                        className="text-lg font-bold mb-2"
                        style={{
                          fontFamily: 'var(--font-inter)',
                          color: 'var(--dark-text)',
                        }}
                      >
                        Adresa
                      </h3>
                      <p
                        className="text-sm leading-relaxed"
                        style={{
                          fontFamily: 'var(--font-inter)',
                          color: 'var(--body-text)',
                        }}
                      >
                        Ulica Pčelara 123<br />
                        71000 Sarajevo, BiH
                      </p>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--blue-light)' }}>
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        style={{ color: 'var(--blue-primary)' }}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3
                        className="text-lg font-bold mb-1"
                        style={{
                          fontFamily: 'var(--font-inter)',
                          color: 'var(--dark-text)',
                        }}
                      >
                        Telefon
                      </h3>
                      <a
                        href="tel:+38733123456"
                        className="text-sm transition-colors inline-block"
                        style={{
                          fontFamily: 'var(--font-inter)',
                          color: 'var(--blue-primary)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = 'var(--blue-hover)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = 'var(--blue-primary)';
                        }}
                      >
                        +387 33 123 456
                      </a>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--blue-light)' }}>
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        style={{ color: 'var(--blue-primary)' }}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3
                        className="text-lg font-bold mb-1"
                        style={{
                          fontFamily: 'var(--font-inter)',
                          color: 'var(--dark-text)',
                        }}
                      >
                        Email
                      </h3>
                      <a
                        href="mailto:info@kosnica.ba"
                        className="text-sm transition-colors inline-block"
                        style={{
                          fontFamily: 'var(--font-inter)',
                          color: 'var(--blue-primary)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = 'var(--blue-hover)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = 'var(--blue-primary)';
                        }}
                      >
                        info@kosnica.ba
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Working Hours */}
              <div className="bg-white rounded-2xl shadow-lg p-8 max-md:p-6 border" style={{ borderColor: 'var(--border-light)' }}>
                <h2
                  className="text-3xl max-md:text-2xl font-bold mb-8"
                  style={{
                    fontFamily: 'var(--font-serif)',
                    color: 'var(--dark-text)',
                  }}
                >
                  Radno vrijeme
                </h2>

                <div className="space-y-4">
                  {[
                    { day: 'Ponedjeljak - Petak', time: '09:00 - 17:00' },
                    { day: 'Subota', time: '09:00 - 14:00' },
                    { day: 'Nedjelja', time: 'Zatvoreno' },
                  ].map((schedule, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b" style={{ borderColor: 'var(--border-light)' }}>
                      <span
                        className="text-sm font-medium"
                        style={{
                          fontFamily: 'var(--font-inter)',
                          color: 'var(--dark-text)',
                        }}
                      >
                        {schedule.day}
                      </span>
                      <span
                        className="text-sm"
                        style={{
                          fontFamily: 'var(--font-inter)',
                          color: 'var(--body-text)',
                        }}
                      >
                        {schedule.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links Section */}
      <section 
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
              Brzi linkovi
            </h2>
            <p
              className="text-lg max-w-2xl mx-auto"
              style={{
                fontFamily: 'var(--font-inter)',
                color: 'var(--body-text)',
              }}
            >
              Pronađite brze odgovore na česta pitanja
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: 'Dostava i povrati',
                description: 'Informacije o dostavi i povratu proizvoda',
                href: `${ROUTES.CONTACT}#dostava`,
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 17h8m-8 0a2 2 0 01-2-2V9a2 2 0 012-2h8a2 2 0 012 2v6a2 2 0 01-2 2m-8 0a2 2 0 002 2h4a2 2 0 002-2M8 17V9m0 0h8" />
                  </svg>
                ),
              },
              {
                title: 'Česta pitanja',
                description: 'Odgovori na najčešća pitanja',
                href: `${ROUTES.CONTACT}#faq`,
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
              },
              {
                title: 'Uslovi korištenja',
                description: 'Pročitajte naše uslove korištenja',
                href: '/uslovi-koristenja',
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                ),
              },
              {
                title: 'Politika privatnosti',
                description: 'Kako koristimo vaše podatke',
                href: '/politika-privatnosti',
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                ),
              },
            ].map((link, index) => (
              <Link
                key={index}
                href={link.href}
                className="bg-white rounded-xl p-6 shadow-sm border transition-all duration-300 hover:shadow-lg hover:-translate-y-2 block"
                style={{ borderColor: 'var(--border-light)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--blue-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-light)';
                }}
              >
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: 'var(--blue-light)' }}>
                  <div style={{ color: 'var(--blue-primary)' }}>
                    {link.icon}
                  </div>
                </div>
                <h3
                  className="text-lg font-bold mb-2"
                  style={{
                    fontFamily: 'var(--font-serif)',
                    color: 'var(--dark-text)',
                  }}
                >
                  {link.title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{
                    fontFamily: 'var(--font-inter)',
                    color: 'var(--body-text)',
                  }}
                >
                  {link.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Delivery and Returns Section */}
      <section 
        id="dostava"
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
              Dostava i povrati
            </h2>
            <p
              className="text-lg max-w-2xl mx-auto"
              style={{
                fontFamily: 'var(--font-inter)',
                color: 'var(--body-text)',
              }}
            >
              Informacije o našoj politici dostave i povrata
            </p>
          </div>

          <div className="space-y-6">
            {[
              {
                title: 'Dostava',
                content: [
                  'Dostava se vrši na teritoriji cijele Bosne i Hercegovine.',
                  'Standardna dostava traje 2-5 radnih dana.',
                  'Brza dostava (1-2 radna dana) dostupna je za veće gradove.',
                  'Troškovi dostave se izračunavaju na osnovu težine i udaljenosti.',
                  'Dostava je besplatna za narudžbe preko 50 KM.',
                ],
              },
              {
                title: 'Povrati',
                content: [
                  'Povrat proizvoda je moguć u roku od 14 dana od datuma isporuke.',
                  'Proizvod mora biti netaknut, u originalnom pakovanju i sa originalnom fakturom.',
                  'Troškovi povrata snosi kupac, osim u slučaju greške na našoj strani.',
                  'Povrat novca se vrši u roku od 5-7 radnih dana nakon primitka povrata.',
                  'Za više informacija kontaktirajte nas na info@kosnica.ba.',
                ],
              },
            ].map((section, index) => (
              <div key={index} className="bg-white rounded-xl p-8 shadow-sm border" style={{ borderColor: 'var(--border-light)' }}>
                <h3
                  className="text-2xl font-bold mb-4"
                  style={{
                    fontFamily: 'var(--font-serif)',
                    color: 'var(--dark-text)',
                  }}
                >
                  {section.title}
                </h3>
                <ul className="space-y-2">
                  {section.content.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start gap-3">
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
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section 
        id="faq"
        data-animate-section
        className="relative py-20 mb-20"
        style={{ backgroundColor: '#ffffff' }}
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
              Odgovori na najčešća pitanja
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                question: 'Kako mogu naručiti proizvode?',
                answer: 'Možete naručiti proizvode direktno sa naše web stranice dodavanjem proizvoda u korpu i slanjem narudžbe. Također možete nas kontaktirati putem telefona ili emaila za pomoć pri naručivanju.',
              },
              {
                question: 'Koje metode plaćanja prihvatate?',
                answer: 'Prihvatamo gotovinsko plaćanje preuzećem, bankovni transfer i kartično plaćanje. Sve metode plaćanja su sigurne i zaštićene.',
              },
              {
                question: 'Kako čuvate proizvode tokom transporta?',
                answer: 'Naši proizvodi se pakuju pažljivo u sigurno pakovanje koje štiti med tokom transporta. Koristimo kvalitetne materijale za pakovanje kako bismo osigurali da vaš med stigne u savršenom stanju.',
              },
              {
                question: 'Da li je med sertifikovan?',
                answer: 'Svi naši proizvodi dolaze direktno od provjerenih pčelara i ispunjavaju sve zdravstvene standarde. Naš tim provjerava kvalitet svakog proizvoda prije nego što bude dostupan za prodaju.',
              },
              {
                question: 'Možete li poslati med van Bosne i Hercegovine?',
                answer: 'Trenutno isporučujemo samo na teritoriju Bosne i Hercegovine. Za međunarodne isporuke, molimo kontaktirajte nas za više informacija.',
              },
              {
                question: 'Kako mogu pratiti status svoje narudžbe?',
                answer: 'Nakon što pošaljete narudžbu, dobićete email potvrdu sa detaljima. Također ćemo vas kontaktirati kada narudžba bude otpremljena sa brojem za praćenje.',
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

      <Footer />
    </div>
  );
}

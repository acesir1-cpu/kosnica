'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';
import Footer from '@/components/Footer';
import { useAuth } from '@/hooks/useAuth';
import { useToastContext } from '@/components/ToastProvider';
import { ROUTES } from '@/config/constants';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isAuthenticated } = useAuth();
  const { showToast } = useToastContext();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    agreeToTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push(ROUTES.ACCOUNT);
    }
  }, [isAuthenticated, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Ime je obavezno';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Prezime je obavezno';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email adresa je obavezna';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Unesite važeću email adresu';
    }

    if (!formData.password) {
      newErrors.password = 'Lozinka je obavezna';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Lozinka mora imati najmanje 8 karaktera';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Lozinke se ne poklapaju';
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'Morate prihvatiti uslove korištenja';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    if (!validateForm()) {
      showToast('Molimo popunite sva polja ispravno', 'error');
      return;
    }

    setIsSubmitting(true);
    
    const result = await register({
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim(),
      password: formData.password,
      phone: formData.phone.trim() || undefined,
    });

    if (result.success) {
      showToast('Uspješno ste se registrirali!', 'success');
      router.push(ROUTES.ACCOUNT);
    } else {
      showToast(result.error || 'Greška pri registraciji', 'error');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#ffffff' }}>
      {/* Breadcrumbs */}
      <div className="container mx-auto px-8 max-lg:px-6 max-md:px-4 max-w-7xl pt-8">
        <Breadcrumbs
          items={[
            { label: 'Početna', href: ROUTES.HOME },
            { label: 'Registracija' },
          ]}
        />
      </div>

      {/* Hero Section */}
      <section className="relative py-16 mb-20" style={{ backgroundColor: '#ffffff' }}>
        <div className="container mx-auto px-8 max-lg:px-6 max-md:px-4 max-w-7xl">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h1
              className="text-5xl max-md:text-4xl max-sm:text-3xl font-bold mb-6"
              style={{
                fontFamily: 'var(--font-serif)',
                color: 'var(--dark-text)',
              }}
            >
              Registracija
            </h1>
            <p
              className="text-xl max-md:text-lg leading-relaxed"
              style={{
                fontFamily: 'var(--font-inter)',
                color: 'var(--body-text)',
              }}
            >
              Kreirajte novi nalog i postanite dio naše zajednice
            </p>
          </div>

          {/* Register Form */}
          <div className="max-w-2xl mx-auto">
            <div
              className="bg-white rounded-xl shadow-lg p-8 border"
              style={{
                borderColor: 'var(--border-light)',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
              }}
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* First Name */}
                  <div>
                    <label
                      htmlFor="firstName"
                      className="block text-sm font-medium mb-2"
                      style={{
                        fontFamily: 'var(--font-inter)',
                        color: 'var(--dark-text)',
                      }}
                    >
                      Ime <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2"
                      style={{
                        borderColor: errors.firstName ? '#dc2626' : 'var(--border-light)',
                        backgroundColor: '#ffffff',
                        color: 'var(--dark-text)',
                        fontFamily: 'var(--font-inter)',
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = 'var(--honey-gold)';
                        e.target.style.boxShadow = '0 0 0 3px rgba(212, 167, 44, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = errors.firstName ? '#dc2626' : 'var(--border-light)';
                        e.target.style.boxShadow = 'none';
                      }}
                      placeholder="Vaše ime"
                    />
                    {errors.firstName && (
                      <p className="text-sm mt-1" style={{ color: '#dc2626', fontFamily: 'var(--font-inter)' }}>
                        {errors.firstName}
                      </p>
                    )}
                  </div>

                  {/* Last Name */}
                  <div>
                    <label
                      htmlFor="lastName"
                      className="block text-sm font-medium mb-2"
                      style={{
                        fontFamily: 'var(--font-inter)',
                        color: 'var(--dark-text)',
                      }}
                    >
                      Prezime <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2"
                      style={{
                        borderColor: errors.lastName ? '#dc2626' : 'var(--border-light)',
                        backgroundColor: '#ffffff',
                        color: 'var(--dark-text)',
                        fontFamily: 'var(--font-inter)',
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = 'var(--honey-gold)';
                        e.target.style.boxShadow = '0 0 0 3px rgba(212, 167, 44, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = errors.lastName ? '#dc2626' : 'var(--border-light)';
                        e.target.style.boxShadow = 'none';
                      }}
                      placeholder="Vaše prezime"
                    />
                    {errors.lastName && (
                      <p className="text-sm mt-1" style={{ color: '#dc2626', fontFamily: 'var(--font-inter)' }}>
                        {errors.lastName}
                      </p>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium mb-2"
                    style={{
                      fontFamily: 'var(--font-inter)',
                      color: 'var(--dark-text)',
                    }}
                  >
                    Email adresa <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2"
                    style={{
                      borderColor: errors.email ? '#dc2626' : 'var(--border-light)',
                      backgroundColor: '#ffffff',
                      color: 'var(--dark-text)',
                      fontFamily: 'var(--font-inter)',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--honey-gold)';
                      e.target.style.boxShadow = '0 0 0 3px rgba(212, 167, 44, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = errors.email ? '#dc2626' : 'var(--border-light)';
                      e.target.style.boxShadow = 'none';
                    }}
                    placeholder="vas@email.com"
                  />
                  {errors.email && (
                    <p className="text-sm mt-1" style={{ color: '#dc2626', fontFamily: 'var(--font-inter)' }}>
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium mb-2"
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
                    className="w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2"
                    style={{
                      borderColor: 'var(--border-light)',
                      backgroundColor: '#ffffff',
                      color: 'var(--dark-text)',
                      fontFamily: 'var(--font-inter)',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--honey-gold)';
                      e.target.style.boxShadow = '0 0 0 3px rgba(212, 167, 44, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'var(--border-light)';
                      e.target.style.boxShadow = 'none';
                    }}
                    placeholder="+387 XX XXX XXX"
                  />
                </div>

                {/* Password Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Password */}
                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium mb-2"
                      style={{
                        fontFamily: 'var(--font-inter)',
                        color: 'var(--dark-text)',
                      }}
                    >
                      Lozinka <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        minLength={8}
                        className="w-full px-4 py-3 pr-12 rounded-lg border transition-colors focus:outline-none focus:ring-2"
                        style={{
                          borderColor: errors.password ? '#dc2626' : 'var(--border-light)',
                          backgroundColor: '#ffffff',
                          color: 'var(--dark-text)',
                          fontFamily: 'var(--font-inter)',
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = 'var(--honey-gold)';
                          e.target.style.boxShadow = '0 0 0 3px rgba(212, 167, 44, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = errors.password ? '#dc2626' : 'var(--border-light)';
                          e.target.style.boxShadow = 'none';
                        }}
                        placeholder="Min. 8 karaktera"
                      />
                      {errors.password && (
                        <p className="text-sm mt-1" style={{ color: '#dc2626', fontFamily: 'var(--font-inter)' }}>
                          {errors.password}
                        </p>
                      )}
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 transition-colors"
                        style={{ color: 'var(--body-text)' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = 'var(--honey-gold)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = 'var(--body-text)';
                        }}
                        aria-label={showPassword ? 'Sakrij lozinku' : 'Prikaži lozinku'}
                      >
                        {showPassword ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                            />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="block text-sm font-medium mb-2"
                      style={{
                        fontFamily: 'var(--font-inter)',
                        color: 'var(--dark-text)',
                      }}
                    >
                      Potvrdite lozinku <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        required
                        minLength={8}
                        className="w-full px-4 py-3 pr-12 rounded-lg border transition-colors focus:outline-none focus:ring-2"
                        style={{
                          borderColor: errors.confirmPassword ? '#dc2626' : 'var(--border-light)',
                          backgroundColor: '#ffffff',
                          color: 'var(--dark-text)',
                          fontFamily: 'var(--font-inter)',
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = 'var(--honey-gold)';
                          e.target.style.boxShadow = '0 0 0 3px rgba(212, 167, 44, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = errors.confirmPassword ? '#dc2626' : 'var(--border-light)';
                          e.target.style.boxShadow = 'none';
                        }}
                        placeholder="Ponovite lozinku"
                      />
                      {errors.confirmPassword && (
                        <p className="text-sm mt-1" style={{ color: '#dc2626', fontFamily: 'var(--font-inter)' }}>
                          {errors.confirmPassword}
                        </p>
                      )}
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 transition-colors"
                        style={{ color: 'var(--body-text)' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = 'var(--honey-gold)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = 'var(--body-text)';
                        }}
                        aria-label={showConfirmPassword ? 'Sakrij lozinku' : 'Prikaži lozinku'}
                      >
                        {showConfirmPassword ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                            />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onChange={handleInputChange}
                      required
                      className="w-4 h-4 mt-1 rounded border transition-colors flex-shrink-0"
                      style={{
                        borderColor: 'var(--border-light)',
                        accentColor: 'var(--honey-gold)',
                      }}
                    />
                    <span
                      className="text-sm leading-relaxed"
                      style={{
                        fontFamily: 'var(--font-inter)',
                        color: 'var(--body-text)',
                      }}
                    >
                      Prihvatam{' '}
                      <Link
                        href={ROUTES.TERMS || '/uslovi-koristenja'}
                        className="font-medium underline transition-colors"
                        style={{
                          color: 'var(--blue-primary)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = 'var(--blue-hover)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = 'var(--blue-primary)';
                        }}
                      >
                        uslove korištenja
                      </Link>
                      {' '}i{' '}
                      <Link
                        href={ROUTES.PRIVACY || '/politika-privatnosti'}
                        className="font-medium underline transition-colors"
                        style={{
                          color: 'var(--blue-primary)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = 'var(--blue-hover)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = 'var(--blue-primary)';
                        }}
                      >
                        politiku privatnosti
                      </Link>
                      <span className="text-red-500"> *</span>
                    </span>
                  </label>
                  {errors.agreeToTerms && (
                    <p className="text-sm mt-1 ml-7" style={{ color: '#dc2626', fontFamily: 'var(--font-inter)' }}>
                      {errors.agreeToTerms}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-lg font-medium text-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: 'var(--honey-gold)',
                    color: 'var(--dark-text)',
                    fontFamily: 'var(--font-inter)',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSubmitting) {
                      e.currentTarget.style.backgroundColor = 'var(--honey-light)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(212, 167, 44, 0.3)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--honey-gold)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {isSubmitting ? 'Registriranje...' : 'Registrujte se'}
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div
                    className="w-full border-t"
                    style={{ borderColor: 'var(--border-light)' }}
                  ></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span
                    className="px-4 bg-white"
                    style={{
                      fontFamily: 'var(--font-inter)',
                      color: 'var(--body-text)',
                    }}
                  >
                    ili
                  </span>
                </div>
              </div>

              {/* Login Link */}
              <div className="text-center">
                <p
                  className="text-sm mb-4"
                  style={{
                    fontFamily: 'var(--font-inter)',
                    color: 'var(--body-text)',
                  }}
                >
                  Već imate nalog?{' '}
                  <Link
                    href={ROUTES.LOGIN}
                    className="font-medium transition-colors hover:underline"
                    style={{
                      color: 'var(--blue-primary)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = 'var(--blue-hover)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'var(--blue-primary)';
                    }}
                  >
                    Prijavite se
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

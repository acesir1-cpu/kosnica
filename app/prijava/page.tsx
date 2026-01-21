'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';
import Footer from '@/components/Footer';
import { useAuth } from '@/hooks/useAuth';
import { useToastContext } from '@/components/ToastProvider';
import { ROUTES } from '@/config/constants';

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated } = useAuth();
  const { showToast } = useToastContext();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Get return URL from query params
  const returnUrl = searchParams?.get('returnUrl') || ROUTES.ACCOUNT;

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push(returnUrl);
    }
  }, [isAuthenticated, returnUrl, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    const result = await login({
      email: formData.email,
      password: formData.password,
    });

    if (result.success) {
      showToast('Uspješno ste se prijavili!', 'success');
      router.push(returnUrl);
    } else {
      showToast(result.error || 'Greška pri prijavljivanju', 'error');
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
            { label: 'Prijava' },
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
              Prijava
            </h1>
            <p
              className="text-xl max-md:text-lg leading-relaxed"
              style={{
                fontFamily: 'var(--font-inter)',
                color: 'var(--body-text)',
              }}
            >
              Prijavite se na vaš nalog da biste pristupili svim funkcionalnostima
            </p>
          </div>

          {/* Login Form */}
          <div className="max-w-md mx-auto">
            <div
              className="bg-white rounded-xl shadow-lg p-8 border"
              style={{
                borderColor: 'var(--border-light)',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
              }}
            >
              <form onSubmit={handleSubmit} className="space-y-6">
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
                    Email adresa
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
                    placeholder="vas@email.com"
                  />
                </div>

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
                    Lozinka
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 pr-12 rounded-lg border transition-colors focus:outline-none focus:ring-2"
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
                      placeholder="Vaša lozinka"
                    />
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

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border transition-colors"
                      style={{
                        borderColor: 'var(--border-light)',
                        accentColor: 'var(--honey-gold)',
                      }}
                    />
                    <span
                      className="text-sm"
                      style={{
                        fontFamily: 'var(--font-inter)',
                        color: 'var(--body-text)',
                      }}
                    >
                      Zapamti me
                    </span>
                  </label>
                  <Link
                    href="#"
                    className="text-sm font-medium transition-colors hover:underline"
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
                    Zaboravili ste lozinku?
                  </Link>
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
                  {isSubmitting ? 'Prijavljivanje...' : 'Prijavi se'}
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

              {/* Register Link */}
              <div className="text-center">
                <p
                  className="text-sm mb-4"
                  style={{
                    fontFamily: 'var(--font-inter)',
                    color: 'var(--body-text)',
                  }}
                >
                  Nemate nalog?{' '}
                  <Link
                    href={ROUTES.REGISTER}
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
                    Registrujte se
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

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--honey-gold)] mx-auto mb-4"></div>
          <p style={{ color: 'var(--body-text)', fontFamily: 'var(--font-inter)' }}>Učitavanje...</p>
        </div>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}

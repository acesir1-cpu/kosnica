'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Breadcrumbs from '@/components/Breadcrumbs';
import Footer from '@/components/Footer';
import { ROUTES } from '@/config/constants';
import { useAuth } from '@/hooks/useAuth';
import { useToastContext } from '@/components/ToastProvider';
import { getProductById } from '@/lib/data';

type OrderItem = {
  productId: number;
  quantity: number;
  weight: string;
  price: number;
};

type Order = {
  id: string;
  orderNumber: string;
  items: OrderItem[];
  total: number;
  currency: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  shippingAddress?: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  paymentMethod?: 'card' | 'cash' | 'transfer';
  paymentCardId?: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  promocode?: string;
  discount?: number;
};

export default function OrderConfirmationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { showToast } = useToastContext();
  const [order, setOrder] = useState<Order | null>(null);

  const orderNumber = searchParams.get('orderNumber');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(ROUTES.LOGIN);
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (!user || !orderNumber) return;

    // Load order from localStorage
    const savedOrders = localStorage.getItem(`kosnica_orders_${user.id}`);
    if (savedOrders) {
      try {
        const orders: Order[] = JSON.parse(savedOrders);
        const foundOrder = orders.find((o) => o.orderNumber === orderNumber);
        if (foundOrder) {
          setOrder(foundOrder);
        } else {
          router.push(ROUTES.HOME);
        }
      } catch (e) {
        console.error('Error loading order:', e);
        router.push(ROUTES.HOME);
      }
    } else {
      router.push(ROUTES.HOME);
    }
  }, [user, orderNumber, router]);

  // Show loading state
  if (isLoading || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#ffffff' }}>
        <div className="text-center">
          <p
            style={{
              fontFamily: 'var(--font-inter)',
              color: 'var(--body-text)',
            }}
          >
            Učitavanje...
          </p>
        </div>
      </div>
    );
  }

  const orderDate = new Date(order.createdAt);
  const formattedDate = (() => {
    const day = orderDate.getDate().toString().padStart(2, '0');
    const month = (orderDate.getMonth() + 1).toString().padStart(2, '0');
    const year = orderDate.getFullYear();
    const hours = orderDate.getHours().toString().padStart(2, '0');
    const minutes = orderDate.getMinutes().toString().padStart(2, '0');
    return `${day}.${month}.${year}. u ${hours}:${minutes}`;
  })();

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--cream)' }}>
      <div className="container mx-auto px-8 max-lg:px-6 max-md:px-4 py-12 max-w-7xl">
        <Breadcrumbs
          items={[
            { label: 'Početna', href: ROUTES.HOME },
            { label: 'Potvrda narudžbe' },
          ]}
        />

        <div className="max-w-3xl mx-auto mt-8">
          {/* Success Icon */}
          <div className="text-center mb-8">
            <div
              className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #f5c852 0%, #f0c855 100%)',
                boxShadow: '0 4px 16px rgba(212, 167, 44, 0.3)',
              }}
            >
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1
              className="text-4xl font-bold mb-4"
              style={{
                fontFamily: 'var(--font-serif)',
                color: 'var(--dark-text)',
              }}
            >
              Narudžba je uspješno kreirana!
            </h1>
            <p
              className="text-lg mb-2"
              style={{
                fontFamily: 'var(--font-inter)',
                color: 'var(--body-text)',
              }}
            >
              Hvala vam na vašoj narudžbi
            </p>
            <p
              className="text-base"
              style={{
                fontFamily: 'var(--font-inter)',
                color: 'var(--body-text)',
                opacity: 0.8,
              }}
            >
              Sve informacije o narudžbi su dostupne u nastavku. Detalje možete pregledati i u sekciji{' '}
              <Link
                href={ROUTES.ACCOUNT}
                className="font-semibold hover:underline"
                style={{
                  color: 'var(--honey-gold)',
                }}
              >
                Moje narudžbe
              </Link>{' '}
              u vašem profilu.
            </p>
          </div>

          {/* Order Details Card */}
          <div
            className="bg-white rounded-2xl p-8 shadow-lg border mb-6"
            style={{
              borderColor: 'var(--border-light)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
            }}
          >
            <div className="mb-6 pb-6 border-b" style={{ borderColor: 'var(--border-light)' }}>
              <h2
                className="text-2xl font-bold mb-4"
                style={{
                  fontFamily: 'var(--font-serif)',
                  color: 'var(--dark-text)',
                }}
              >
                Detalji narudžbe
              </h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span
                    className="text-base"
                    style={{
                      fontFamily: 'var(--font-inter)',
                      color: 'var(--body-text)',
                    }}
                  >
                    Broj narudžbe:
                  </span>
                  <span
                    className="text-base font-semibold"
                    style={{
                      fontFamily: 'var(--font-inter)',
                      color: 'var(--dark-text)',
                    }}
                  >
                    {order.orderNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span
                    className="text-base"
                    style={{
                      fontFamily: 'var(--font-inter)',
                      color: 'var(--body-text)',
                    }}
                  >
                    Datum:
                  </span>
                  <span
                    className="text-base font-semibold"
                    style={{
                      fontFamily: 'var(--font-inter)',
                      color: 'var(--dark-text)',
                    }}
                  >
                    {formattedDate}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span
                    className="text-base"
                    style={{
                      fontFamily: 'var(--font-inter)',
                      color: 'var(--body-text)',
                    }}
                  >
                    Status:
                  </span>
                  <span
                    className="px-3 py-1 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: '#f59e0b15',
                      color: '#f59e0b',
                      fontFamily: 'var(--font-inter)',
                    }}
                  >
                    Na čekanju
                  </span>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="mb-6">
              <h3
                className="text-lg font-semibold mb-4"
                style={{
                  fontFamily: 'var(--font-serif)',
                  color: 'var(--dark-text)',
                }}
              >
                Proizvodi
              </h3>
              <div className="space-y-4">
                {order.items.map((item, idx) => {
                  const product = getProductById(item.productId);
                  if (!product) return null;
                  return (
                    <div key={idx} className="flex gap-4">
                      {product.image && (
                        <Link
                          href={`${ROUTES.PRODUCTS}/${product.slug}`}
                          className="relative w-20 h-20 rounded-lg overflow-hidden border flex-shrink-0"
                          style={{ borderColor: 'var(--border-light)' }}
                        >
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        </Link>
                      )}
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`${ROUTES.PRODUCTS}/${product.slug}`}
                          className="block hover:underline"
                        >
                          <p
                            className="font-semibold text-base mb-1"
                            style={{
                              fontFamily: 'var(--font-inter)',
                              color: 'var(--dark-text)',
                            }}
                          >
                            {product.name}
                          </p>
                        </Link>
                        <p
                          className="text-sm"
                          style={{
                            fontFamily: 'var(--font-inter)',
                            color: 'var(--body-text)',
                          }}
                        >
                          {item.weight} × {item.quantity}
                        </p>
                      </div>
                      <p
                        className="text-base font-semibold flex-shrink-0"
                        style={{
                          fontFamily: 'var(--font-inter)',
                          color: 'var(--dark-text)',
                        }}
                      >
                        {item.price * item.quantity} {order.currency}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Shipping Address */}
            {order.shippingAddress && (
              <div className="mb-6">
                <h3
                  className="text-lg font-semibold mb-4"
                  style={{
                    fontFamily: 'var(--font-serif)',
                    color: 'var(--dark-text)',
                  }}
                >
                  Adresa dostave
                </h3>
                <p
                  className="text-base"
                  style={{
                    fontFamily: 'var(--font-inter)',
                    color: 'var(--body-text)',
                  }}
                >
                  {order.shippingAddress.street}<br />
                  {order.shippingAddress.postalCode} {order.shippingAddress.city}<br />
                  {order.shippingAddress.country}
                </p>
              </div>
            )}

            {/* Payment Method */}
            <div className="mb-6 pb-6 border-b" style={{ borderColor: 'var(--border-light)' }}>
              <h3
                className="text-lg font-semibold mb-4"
                style={{
                  fontFamily: 'var(--font-serif)',
                  color: 'var(--dark-text)',
                }}
              >
                Način plaćanja
              </h3>
              <div className="flex items-center gap-3">
                {order.paymentMethod === 'cash' && (
                  <>
                    <svg
                      className="w-6 h-6 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      style={{ color: 'var(--honey-gold)' }}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    <p
                      className="text-base font-medium"
                      style={{
                        fontFamily: 'var(--font-inter)',
                        color: 'var(--dark-text)',
                      }}
                    >
                      Gotovinsko plaćanje preuzećem
                    </p>
                  </>
                )}
                {order.paymentMethod === 'transfer' && (
                  <>
                    <svg
                      className="w-6 h-6 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      style={{ color: 'var(--honey-gold)' }}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"
                      />
                    </svg>
                    <div>
                      <p
                        className="text-base font-medium"
                        style={{
                          fontFamily: 'var(--font-inter)',
                          color: 'var(--dark-text)',
                        }}
                      >
                        Bankovni transfer
                      </p>
                      <p
                        className="text-sm mt-1"
                        style={{
                          fontFamily: 'var(--font-inter)',
                          color: 'var(--body-text)',
                          opacity: 0.8,
                        }}
                      >
                        Detalje za uplatu su poslani na vašu email adresu
                      </p>
                    </div>
                  </>
                )}
                {order.paymentMethod === 'card' && (
                  <p
                    className="text-base font-medium"
                    style={{
                      fontFamily: 'var(--font-inter)',
                      color: 'var(--dark-text)',
                    }}
                  >
                    Kartično plaćanje
                  </p>
                )}
                {!order.paymentMethod && (
                  <p
                    className="text-base"
                    style={{
                      fontFamily: 'var(--font-inter)',
                      color: 'var(--body-text)',
                    }}
                  >
                    Nije naveden način plaćanja
                  </p>
                )}
              </div>
            </div>

            {/* Promocode Info */}
            {order.promocode && order.discount && order.discount > 0 && (
              <div className="mb-6 pb-6 border-b" style={{ borderColor: 'var(--border-light)' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      style={{ color: '#16a34a' }}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v13m0-13V6a2 2 0 112 2h-2m0 0V5.5A2.5 2.5 0 109.5 8H12m-2.5 0a2.5 2.5 0 105 0m-5 0V11m5-3v3m0 0v2.5A2.5 2.5 0 1114.5 13H12m-2.5 0a2.5 2.5 0 105 0m-5 0V8"
                      />
                    </svg>
                    <span
                      className="text-base font-medium"
                      style={{
                        fontFamily: 'var(--font-inter)',
                        color: '#16a34a',
                      }}
                    >
                      Promo kod ({order.promocode.toUpperCase()}): Popust -{Math.round(order.discount)} {order.currency}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Total */}
            <div className="pt-6 border-t" style={{ borderColor: 'var(--border-light)' }}>
              <div className="flex justify-between items-center">
                <span
                  className="text-xl font-bold"
                  style={{
                    fontFamily: 'var(--font-inter)',
                    color: 'var(--dark-text)',
                  }}
                >
                  Ukupno:
                </span>
                <span
                  className="text-2xl font-bold"
                  style={{
                    color: '#16a34a',
                    fontFamily: 'var(--font-inter)',
                  }}
                >
                  {order.total} {order.currency}
                </span>
              </div>
            </div>
          </div>

          {/* Info Messages */}
          <div className="space-y-4 mb-6">
            {/* Email Confirmation */}
            <div
              className="bg-white rounded-2xl p-6 border"
              style={{
                borderColor: 'rgba(212, 167, 44, 0.3)',
                backgroundColor: 'rgba(245, 200, 82, 0.05)',
              }}
            >
              <div className="flex gap-4">
                <svg
                  className="w-6 h-6 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  style={{ color: 'var(--honey-gold)' }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <div>
                  <p
                    className="text-base font-semibold mb-2"
                    style={{
                      fontFamily: 'var(--font-inter)',
                      color: 'var(--dark-text)',
                    }}
                  >
                    Email potvrda poslana
                  </p>
                  <p
                    className="text-sm"
                    style={{
                      fontFamily: 'var(--font-inter)',
                      color: 'var(--body-text)',
                    }}
                  >
                    Poslali smo vam email potvrdu na <strong>{user?.email}</strong> sa svim detaljima narudžbe.
                  </p>
                </div>
              </div>
            </div>

            {/* Tracking Info */}
            {order.trackingNumber && (
              <div
                className="bg-white rounded-2xl p-6 border"
                style={{
                  borderColor: 'rgba(132, 168, 122, 0.3)',
                  backgroundColor: 'rgba(132, 168, 122, 0.05)',
                }}
              >
                <div className="flex gap-4">
                  <svg
                    className="w-6 h-6 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    style={{ color: '#84a87a' }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div className="flex-1">
                    <p
                      className="text-base font-semibold mb-2"
                      style={{
                        fontFamily: 'var(--font-inter)',
                        color: 'var(--dark-text)',
                      }}
                    >
                      Praćenje narudžbe
                    </p>
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div>
                        <p
                          className="text-xs mb-1"
                          style={{
                            fontFamily: 'var(--font-inter)',
                            color: 'var(--body-text)',
                            opacity: 0.7,
                          }}
                        >
                          Broj za praćenje:
                        </p>
                        <p
                          className="font-mono font-semibold text-base"
                          style={{
                            fontFamily: 'var(--font-inter)',
                            color: 'var(--dark-text)',
                          }}
                        >
                          {order.trackingNumber}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          if (order.trackingNumber) {
                            navigator.clipboard.writeText(order.trackingNumber);
                            showToast('Broj za praćenje je kopiran', 'success');
                          }
                        }}
                        className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2"
                        style={{
                          backgroundColor: 'white',
                          border: '1px solid rgba(132, 168, 122, 0.3)',
                          color: '#84a87a',
                          fontFamily: 'var(--font-inter)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(132, 168, 122, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'white';
                        }}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Kopiraj
                      </button>
                    </div>
                    {order.estimatedDelivery && order.status !== 'delivered' && order.status !== 'cancelled' && (
                      <p
                        className="text-sm mt-3"
                        style={{
                          fontFamily: 'var(--font-inter)',
                          color: 'var(--body-text)',
                          opacity: 0.8,
                        }}
                      >
                        <strong>Procijenjena dostava:</strong>{' '}
                        {(() => {
                          const deliveryDate = new Date(order.estimatedDelivery);
                          const day = deliveryDate.getDate().toString().padStart(2, '0');
                          const month = (deliveryDate.getMonth() + 1).toString().padStart(2, '0');
                          const year = deliveryDate.getFullYear();
                          return `${day}.${month}.${year}.`;
                        })()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Next Steps */}
            <div
              className="bg-white rounded-2xl p-6 border"
              style={{
                borderColor: 'var(--border-light)',
                backgroundColor: 'var(--cream)',
              }}
            >
              <div className="flex gap-4">
                <svg
                  className="w-6 h-6 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  style={{ color: 'var(--honey-gold)' }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <p
                    className="text-base font-semibold mb-2"
                    style={{
                      fontFamily: 'var(--font-inter)',
                      color: 'var(--dark-text)',
                    }}
                  >
                    Šta sljedeće?
                  </p>
                  <ul
                    className="text-sm space-y-2 list-disc list-inside"
                    style={{
                      fontFamily: 'var(--font-inter)',
                      color: 'var(--body-text)',
                    }}
                  >
                    <li>Pratite status vaše narudžbe u sekciji{' '}
                      <Link
                        href={ROUTES.ACCOUNT}
                        className="font-semibold hover:underline"
                        style={{
                          color: 'var(--honey-gold)',
                        }}
                      >
                        Moje narudžbe
                      </Link>{' '}
                      u vašem profilu
                    </li>
                    <li>Koristite broj za praćenje iznad da pratite vaš paket</li>
                    <li>Očekujte email obavještenja o promjenama statusa narudžbe</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href={ROUTES.ACCOUNT}
              className="flex-1 px-6 py-3 rounded-lg font-medium text-center transition-all duration-200"
              style={{
                background: 'linear-gradient(135deg, #f5c852 0%, #f0c855 100%)',
                color: 'var(--dark-text)',
                fontFamily: 'var(--font-inter)',
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
              Pregledaj moje narudžbe
            </Link>
            <Link
              href={ROUTES.PRODUCTS}
              className="flex-1 px-6 py-3 rounded-lg font-medium text-center transition-all duration-200 border-2"
              style={{
                backgroundColor: 'white',
                color: 'var(--dark-text)',
                borderColor: 'var(--border-light)',
                fontFamily: 'var(--font-inter)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--honey-gold)';
                e.currentTarget.style.backgroundColor = 'rgba(245, 200, 82, 0.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-light)';
                e.currentTarget.style.backgroundColor = 'white';
              }}
            >
              Nastavi kupovinu
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

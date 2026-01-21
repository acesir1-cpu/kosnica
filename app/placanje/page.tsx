'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Breadcrumbs from '@/components/Breadcrumbs';
import Footer from '@/components/Footer';
import { ROUTES } from '@/config/constants';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { useToastContext } from '@/components/ToastProvider';
import { getProductById, calculatePriceByWeight, calculateDeliveryCost, isFeaturedOffer, getDiscountedPrice } from '@/lib/data';

type AddressData = {
  street: string;
  city: string;
  postalCode: string;
  country: string;
};

type PaymentCard = {
  id: string;
  last4: string;
  brand: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
};

type PaymentMethod = 'card' | 'cash' | 'transfer';

export default function CheckoutPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { cartItems, clearCart } = useCart();
  const { showToast } = useToastContext();

  const [shippingAddress, setShippingAddress] = useState<AddressData>({
    street: '',
    city: '',
    postalCode: '',
    country: 'Bosna i Hercegovina',
  });

  const [paymentCards, setPaymentCards] = useState<PaymentCard[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [selectedPaymentCardId, setSelectedPaymentCardId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [appliedPromocode, setAppliedPromocode] = useState<string | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(`${ROUTES.LOGIN}?returnUrl=${encodeURIComponent(ROUTES.CHECKOUT)}`);
    }
  }, [isAuthenticated, isLoading, router]);

  // Redirect to cart if cart is empty
  useEffect(() => {
    if (!isLoading && isAuthenticated && cartItems.length === 0) {
      router.push(ROUTES.CART);
    }
  }, [cartItems.length, isAuthenticated, isLoading, router]);

  // Load user data
  useEffect(() => {
    if (user) {
      // Load address from localStorage
      const savedAddress = localStorage.getItem(`kosnica_address_${user.id}`);
      if (savedAddress) {
        try {
          setShippingAddress(JSON.parse(savedAddress));
        } catch (e) {
          console.error('Error loading address:', e);
        }
      }

      // Load payment cards from localStorage
      const savedCards = localStorage.getItem(`kosnica_cards_${user.id}`);
      if (savedCards) {
        try {
          const cards = JSON.parse(savedCards);
          setPaymentCards(cards);
          // Select default card
          const defaultCard = cards.find((c: PaymentCard) => c.isDefault);
          if (defaultCard) {
            setSelectedPaymentCardId(defaultCard.id);
          }
        } catch (e) {
          console.error('Error loading cards:', e);
        }
      }

      // Load applied promocode from localStorage
      const savedPromocode = localStorage.getItem('kosnica_applied_promocode');
      if (savedPromocode) {
        // Validate that the saved promocode is still valid
        const validPromocodes = ['kosnica10', 'med10', 'promo'];
        if (validPromocodes.includes(savedPromocode.toLowerCase())) {
          setAppliedPromocode(savedPromocode);
        } else {
          localStorage.removeItem('kosnica_applied_promocode');
        }
      }
    }
  }, [user]);


  // Get full product data for cart items
  const cartProducts = useMemo(() => {
    return cartItems
      .map((item) => {
        const product = getProductById(item.productId);
        if (!product) return null;
        return {
          ...item,
          product,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }, [cartItems]);

  // Calculate totals
  const totals = useMemo(() => {
    const itemsTotal = cartProducts.reduce((sum, item) => {
      const basePrice = calculatePriceByWeight(item.product, item.weight);
      const isFeatured = isFeaturedOffer(item.product);
      const itemPrice = getDiscountedPrice(basePrice, isFeatured);
      return sum + itemPrice * item.quantity;
    }, 0);

    // Calculate delivery cost based on order total (free for orders over 50 KM)
    const deliveryCost = itemsTotal > 0 ? calculateDeliveryCost(itemsTotal) : 0;
    const tax = itemsTotal * 0.17;
    const discount = appliedPromocode ? itemsTotal * 0.1 : 0; // 10% discount if promocode applied
    const total = itemsTotal + deliveryCost + tax - discount;

    return {
      itemsTotal,
      deliveryCost,
      tax,
      discount,
      total,
    };
  }, [cartProducts, appliedPromocode]);

  const handleSubmitOrder = async () => {
    if (!user) return;

    // Validate address
    if (!shippingAddress.street.trim() || !shippingAddress.city.trim() || !shippingAddress.postalCode.trim()) {
      showToast('Molimo popunite sva obavezna polja adrese', 'error');
      return;
    }

    // Validate payment method
    if (paymentMethod === 'card' && !selectedPaymentCardId) {
      showToast('Molimo izaberite karticu za plaćanje', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create order
      const orderNumber = `ORD-${Date.now()}`;
      const orderItems = cartProducts.map((item) => {
        const basePrice = calculatePriceByWeight(item.product, item.weight);
        const isFeatured = isFeaturedOffer(item.product);
        const finalPrice = getDiscountedPrice(basePrice, isFeatured);
        return {
          productId: item.product.id,
          quantity: item.quantity,
          weight: item.weight,
          price: finalPrice,
        };
      });

      // Generate tracking number
      const trackingNumber = `TRK-${Date.now().toString().slice(-8).toUpperCase()}`;
      
      // Estimate delivery date (5-7 business days)
      const estimatedDeliveryDate = new Date();
      estimatedDeliveryDate.setDate(estimatedDeliveryDate.getDate() + 7);
      
      const order = {
        id: `order_${Date.now()}`,
        orderNumber,
        items: orderItems,
        total: Math.round(totals.total),
        currency: 'KM',
        status: 'pending' as const,
        createdAt: new Date().toISOString(),
        shippingAddress,
        paymentMethod,
        paymentCardId: paymentMethod === 'card' ? selectedPaymentCardId : undefined,
        trackingNumber,
        estimatedDelivery: estimatedDeliveryDate.toISOString(),
        promocode: appliedPromocode || undefined,
        discount: totals.discount,
      };

      // Clear promocode from localStorage after order is created
      if (appliedPromocode) {
        localStorage.removeItem('kosnica_applied_promocode');
      }

      // Save order to localStorage
      const savedOrders = localStorage.getItem(`kosnica_orders_${user.id}`);
      const orders = savedOrders ? JSON.parse(savedOrders) : [];
      orders.unshift(order); // Add to beginning
      localStorage.setItem(`kosnica_orders_${user.id}`, JSON.stringify(orders));

      // Clear cart
      clearCart();

      // Show success message
      showToast(`Narudžba #${orderNumber} je uspješno kreirana!`, 'success', 3000);

      // Small delay before redirect to show the toast
      setTimeout(() => {
        router.push(`${ROUTES.CHECKOUT}/potvrda?orderNumber=${orderNumber}`);
      }, 500);
    } catch (error) {
      console.error('Error creating order:', error);
      showToast('Greška pri kreiranju narudžbe. Molimo pokušajte ponovo.', 'error');
      setIsSubmitting(false);
    }
  };

  // Show loading state
  if (isLoading) {
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

  // Don't render checkout if not authenticated or cart is empty
  if (!isAuthenticated || cartItems.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--cream)' }}>
      <div className="container mx-auto px-8 max-lg:px-6 max-md:px-4 max-sm:px-3 py-12 max-md:py-8 max-sm:py-6 max-w-7xl">
        <Breadcrumbs
          items={[
            { label: 'Početna', href: ROUTES.HOME },
            { label: 'Korpa', href: ROUTES.CART },
            { label: 'Plaćanje' },
          ]}
        />

        <div className="mb-8 mt-8">
          <h1
            className="text-5xl max-md:text-3xl max-sm:text-2xl font-bold mb-4"
            style={{
              fontFamily: 'var(--font-serif)',
              color: 'var(--dark-text)',
            }}
          >
            Plaćanje
          </h1>
          <p
            className="text-lg max-md:text-base"
            style={{
              fontFamily: 'var(--font-inter)',
              color: 'var(--body-text)',
            }}
          >
            Završite svoju narudžbu
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <div
              className="bg-white rounded-2xl p-8 max-md:p-6 max-sm:p-4 shadow-lg border transition-all duration-300"
              style={{
                borderColor: 'var(--border-light)',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
              }}
            >
              <h2
                className="text-2xl max-md:text-xl font-bold mb-6 max-md:mb-4"
                style={{
                  fontFamily: 'var(--font-serif)',
                  color: 'var(--dark-text)',
                }}
              >
                Adresa dostave
              </h2>

              <div className="space-y-4">
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{
                      fontFamily: 'var(--font-inter)',
                      color: 'var(--dark-text)',
                    }}
                  >
                    Ulica i broj *
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.street}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                    className="w-full px-4 py-3.5 rounded-xl border-2 transition-all focus:outline-none focus:ring-2"
                    style={{
                      borderColor: 'var(--border-light)',
                      fontFamily: 'var(--font-inter)',
                      color: 'var(--dark-text)',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--honey-gold)';
                      e.target.style.boxShadow = '0 0 0 3px rgba(212, 167, 44, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'var(--border-light)';
                      e.target.style.boxShadow = 'none';
                    }}
                    placeholder="Ulica i broj"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{
                        fontFamily: 'var(--font-inter)',
                        color: 'var(--dark-text)',
                      }}
                    >
                      Grad *
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.city}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                      className="w-full px-4 py-3.5 rounded-xl border-2 transition-all focus:outline-none focus:ring-2"
                      style={{
                        borderColor: 'var(--border-light)',
                        fontFamily: 'var(--font-inter)',
                        color: 'var(--dark-text)',
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = 'var(--honey-gold)';
                        e.target.style.boxShadow = '0 0 0 3px rgba(212, 167, 44, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'var(--border-light)';
                        e.target.style.boxShadow = 'none';
                      }}
                      placeholder="Grad"
                    />
                  </div>

                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{
                        fontFamily: 'var(--font-inter)',
                        color: 'var(--dark-text)',
                      }}
                    >
                      Poštanski broj *
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.postalCode}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
                      className="w-full px-4 py-3.5 rounded-xl border-2 transition-all focus:outline-none focus:ring-2"
                      style={{
                        borderColor: 'var(--border-light)',
                        fontFamily: 'var(--font-inter)',
                        color: 'var(--dark-text)',
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = 'var(--honey-gold)';
                        e.target.style.boxShadow = '0 0 0 3px rgba(212, 167, 44, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'var(--border-light)';
                        e.target.style.boxShadow = 'none';
                      }}
                      placeholder="Poštanski broj"
                    />
                  </div>
                </div>

                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{
                      fontFamily: 'var(--font-inter)',
                      color: 'var(--dark-text)',
                    }}
                  >
                    Država *
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.country}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                    className="w-full px-4 py-3.5 rounded-xl border-2 transition-all focus:outline-none focus:ring-2"
                    style={{
                      borderColor: 'var(--border-light)',
                      fontFamily: 'var(--font-inter)',
                      color: 'var(--dark-text)',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--honey-gold)';
                      e.target.style.boxShadow = '0 0 0 3px rgba(212, 167, 44, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'var(--border-light)';
                      e.target.style.boxShadow = 'none';
                    }}
                    placeholder="Država"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div
              className="bg-white rounded-2xl p-8 max-md:p-6 max-sm:p-4 shadow-lg border transition-all duration-300"
              style={{
                borderColor: 'var(--border-light)',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
              }}
            >
              <h2
                className="text-2xl max-md:text-xl font-bold mb-6 max-md:mb-4"
                style={{
                  fontFamily: 'var(--font-serif)',
                  color: 'var(--dark-text)',
                }}
              >
                Način plaćanja
              </h2>

              <div className="space-y-4">
                {/* Cash on Delivery */}
                <label
                  className={`block p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                    paymentMethod === 'cash' ? 'border-amber-400' : ''
                  }`}
                  style={{
                    borderColor: paymentMethod === 'cash' ? 'var(--honey-gold)' : 'var(--border-light)',
                    backgroundColor: paymentMethod === 'cash' ? 'rgba(245, 200, 82, 0.08)' : 'white',
                  }}
                  onMouseEnter={(e) => {
                    if (paymentMethod !== 'cash') {
                      e.currentTarget.style.borderColor = 'rgba(212, 167, 44, 0.5)';
                      e.currentTarget.style.backgroundColor = 'rgba(245, 200, 82, 0.05)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (paymentMethod !== 'cash') {
                      e.currentTarget.style.borderColor = 'var(--border-light)';
                      e.currentTarget.style.backgroundColor = 'white';
                    }
                  }}
                >
                  <div className="flex items-center gap-4">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cash"
                      checked={paymentMethod === 'cash'}
                      onChange={(e) => {
                        setPaymentMethod('cash');
                        setSelectedPaymentCardId(null);
                      }}
                      className="w-5 h-5"
                      style={{ accentColor: 'var(--honey-gold)' }}
                    />
                    <svg
                      className="w-8 h-8 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      style={{ color: paymentMethod === 'cash' ? 'var(--honey-gold)' : 'var(--body-text)' }}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    <div className="flex-1">
                      <p
                        className="font-bold text-lg"
                        style={{
                          fontFamily: 'var(--font-inter)',
                          color: 'var(--dark-text)',
                        }}
                      >
                        Gotovinsko plaćanje preuzećem
                      </p>
                      <p
                        className="text-sm"
                        style={{
                          fontFamily: 'var(--font-inter)',
                          color: 'var(--body-text)',
                        }}
                      >
                        Plaćanje prilikom preuzimanja paketa
                      </p>
                    </div>
                  </div>
                </label>

                {/* Bank Transfer */}
                <label
                  className={`block p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                    paymentMethod === 'transfer' ? 'border-amber-400' : ''
                  }`}
                  style={{
                    borderColor: paymentMethod === 'transfer' ? 'var(--honey-gold)' : 'var(--border-light)',
                    backgroundColor: paymentMethod === 'transfer' ? 'rgba(245, 200, 82, 0.08)' : 'white',
                  }}
                  onMouseEnter={(e) => {
                    if (paymentMethod !== 'transfer') {
                      e.currentTarget.style.borderColor = 'rgba(212, 167, 44, 0.5)';
                      e.currentTarget.style.backgroundColor = 'rgba(245, 200, 82, 0.05)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (paymentMethod !== 'transfer') {
                      e.currentTarget.style.borderColor = 'var(--border-light)';
                      e.currentTarget.style.backgroundColor = 'white';
                    }
                  }}
                >
                  <div className="flex items-center gap-4">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="transfer"
                      checked={paymentMethod === 'transfer'}
                      onChange={(e) => {
                        setPaymentMethod('transfer');
                        setSelectedPaymentCardId(null);
                      }}
                      className="w-5 h-5"
                      style={{ accentColor: 'var(--honey-gold)' }}
                    />
                    <svg
                      className="w-8 h-8 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      style={{ color: paymentMethod === 'transfer' ? 'var(--honey-gold)' : 'var(--body-text)' }}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"
                      />
                    </svg>
                    <div className="flex-1">
                      <p
                        className="font-bold text-lg"
                        style={{
                          fontFamily: 'var(--font-inter)',
                          color: 'var(--dark-text)',
                        }}
                      >
                        Bankovni transfer
                      </p>
                      <p
                        className="text-sm"
                        style={{
                          fontFamily: 'var(--font-inter)',
                          color: 'var(--body-text)',
                        }}
                      >
                        Detalje za uplatu dobijate nakon potvrde narudžbe
                      </p>
                    </div>
                  </div>
                </label>

                {/* Card Payment */}
                <label
                  className={`block p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                    paymentMethod === 'card' ? 'border-amber-400' : ''
                  }`}
                  style={{
                    borderColor: paymentMethod === 'card' ? 'var(--honey-gold)' : 'var(--border-light)',
                    backgroundColor: paymentMethod === 'card' ? 'rgba(245, 200, 82, 0.08)' : 'white',
                  }}
                  onMouseEnter={(e) => {
                    if (paymentMethod !== 'card') {
                      e.currentTarget.style.borderColor = 'rgba(212, 167, 44, 0.5)';
                      e.currentTarget.style.backgroundColor = 'rgba(245, 200, 82, 0.05)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (paymentMethod !== 'card') {
                      e.currentTarget.style.borderColor = 'var(--border-light)';
                      e.currentTarget.style.backgroundColor = 'white';
                    }
                  }}
                >
                  <div className="flex items-center gap-4">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={(e) => {
                        setPaymentMethod('card');
                        if (paymentCards.length > 0) {
                          const defaultCard = paymentCards.find(c => c.isDefault) || paymentCards[0];
                          setSelectedPaymentCardId(defaultCard.id);
                        }
                      }}
                      className="w-5 h-5"
                      style={{ accentColor: 'var(--honey-gold)' }}
                    />
                    <svg
                      className="w-8 h-8 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      style={{ color: paymentMethod === 'card' ? 'var(--honey-gold)' : 'var(--body-text)' }}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                      />
                    </svg>
                    <div className="flex-1">
                      <p
                        className="font-bold text-lg"
                        style={{
                          fontFamily: 'var(--font-inter)',
                          color: 'var(--dark-text)',
                        }}
                      >
                        Kartično plaćanje
                      </p>
                      <p
                        className="text-sm"
                        style={{
                          fontFamily: 'var(--font-inter)',
                          color: 'var(--body-text)',
                        }}
                      >
                        Bezbedno plaćanje karticom
                      </p>
                    </div>
                  </div>
                </label>

                {/* Card Selection (shown only if card payment is selected) */}
                {paymentMethod === 'card' && (
                  <div className="ml-12 mt-4 space-y-3">
                    {paymentCards.length === 0 ? (
                      <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                        <p
                          className="text-sm mb-3"
                          style={{
                            fontFamily: 'var(--font-inter)',
                            color: 'var(--body-text)',
                          }}
                        >
                          Nemate sačuvanih kartica. Dodajte karticu u vašem profilu da biste nastavili sa plaćanjem karticom.
                        </p>
                        <Link
                          href={ROUTES.ACCOUNT}
                          className="inline-block px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
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
                          Dodaj karticu
                        </Link>
                      </div>
                    ) : (
                      <>
                        {paymentCards.map((card) => (
                          <label
                            key={card.id}
                            className={`block p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                              selectedPaymentCardId === card.id ? 'border-amber-400' : ''
                            }`}
                            style={{
                              borderColor: selectedPaymentCardId === card.id ? 'var(--honey-gold)' : 'var(--border-light)',
                              backgroundColor: selectedPaymentCardId === card.id ? 'rgba(245, 200, 82, 0.08)' : 'white',
                            }}
                            onMouseEnter={(e) => {
                              if (selectedPaymentCardId !== card.id) {
                                e.currentTarget.style.borderColor = 'rgba(212, 167, 44, 0.5)';
                                e.currentTarget.style.backgroundColor = 'rgba(245, 200, 82, 0.05)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (selectedPaymentCardId !== card.id) {
                                e.currentTarget.style.borderColor = 'var(--border-light)';
                                e.currentTarget.style.backgroundColor = 'white';
                              }
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <input
                                type="radio"
                                name="paymentCard"
                                value={card.id}
                                checked={selectedPaymentCardId === card.id}
                                onChange={(e) => setSelectedPaymentCardId(e.target.value)}
                                className="w-4 h-4"
                                style={{ accentColor: 'var(--honey-gold)' }}
                              />
                              <div
                                className="w-10 h-6 rounded flex items-center justify-center flex-shrink-0"
                                style={{
                                  background: 'linear-gradient(135deg, #f5c852 0%, #f0c855 100%)',
                                }}
                              >
                                <span
                                  className="text-xs font-bold"
                                  style={{
                                    color: 'var(--dark-text)',
                                  }}
                                >
                                  {card.brand === 'Visa' ? 'VISA' : card.brand === 'Mastercard' ? 'MC' : 'CARD'}
                                </span>
                              </div>
                              <div className="flex-1">
                                <p
                                  className="font-semibold text-base"
                                  style={{
                                    fontFamily: 'var(--font-inter)',
                                    color: 'var(--dark-text)',
                                  }}
                                >
                                  •••• •••• •••• {card.last4}
                                </p>
                                <p
                                  className="text-xs"
                                  style={{
                                    fontFamily: 'var(--font-inter)',
                                    color: 'var(--body-text)',
                                  }}
                                >
                                  {card.expiryMonth.toString().padStart(2, '0')}/{card.expiryYear.toString().slice(-2)}
                                  {card.isDefault && (
                                    <span
                                      className="ml-2 text-xs font-medium"
                                      style={{
                                        color: 'var(--honey-gold)',
                                      }}
                                    >
                                      (Zadana)
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>
                          </label>
                        ))}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div
              className="bg-white rounded-2xl p-6 max-md:p-4 shadow-lg border lg:sticky lg:top-24 transition-all duration-300 flex flex-col"
              style={{
                borderColor: 'var(--border-light)',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
                maxHeight: 'calc(100vh - 8rem)',
              }}
            >
              <h2
                className="text-2xl max-md:text-xl font-bold mb-4 max-md:mb-3 flex-shrink-0"
                style={{
                  fontFamily: 'var(--font-serif)',
                  color: 'var(--dark-text)',
                }}
              >
                Sažetak narudžbe
              </h2>

              {/* Order Items - Scrollable */}
              <div 
                className="flex-1 overflow-y-auto mb-4 pb-4 border-b flex-shrink-0 min-h-0"
                style={{ 
                  borderColor: 'var(--border-light)',
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'rgba(0, 0, 0, 0.2) transparent',
                  WebkitOverflowScrolling: 'touch',
                  maxHeight: '400px',
                }}
              >
                <div className="space-y-3 pr-2">
                  {cartProducts.length > 5 && (
                    <div
                      className="text-xs mb-2 pb-2 border-b"
                      style={{
                        color: 'var(--body-text)',
                        fontFamily: 'var(--font-inter)',
                        borderColor: 'var(--border-light)',
                        opacity: 0.7,
                      }}
                    >
                      {cartProducts.length} {cartProducts.length === 1 ? 'proizvod' : 'proizvoda'}
                    </div>
                  )}
                  {cartProducts.map((item) => {
                    const basePrice = calculatePriceByWeight(item.product, item.weight);
                    const isFeatured = isFeaturedOffer(item.product);
                    const displayPrice = getDiscountedPrice(basePrice, isFeatured);
                    return (
                    <div key={`${item.productId}-${item.weight}`} className="flex gap-3">
                      {item.product.image && (
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden border flex-shrink-0" style={{ borderColor: 'var(--border-light)' }}>
                          <Image
                            src={item.product.image}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p
                          className="font-medium text-sm truncate"
                          style={{
                            fontFamily: 'var(--font-inter)',
                            color: 'var(--dark-text)',
                          }}
                        >
                          {item.product.name}
                        </p>
                        <p
                          className="text-xs"
                          style={{
                            fontFamily: 'var(--font-inter)',
                            color: 'var(--body-text)',
                          }}
                        >
                          {item.weight} × {item.quantity}
                        </p>
                      </div>
                      <div className="flex flex-col items-end flex-shrink-0">
                        {isFeatured && (
                          <span
                            className="text-xs line-through mb-0.5"
                            style={{
                              color: '#9ca3af',
                              fontFamily: 'var(--font-inter)',
                            }}
                          >
                            {basePrice * item.quantity} KM
                          </span>
                        )}
                        <p
                          className="text-sm font-semibold"
                          style={{
                            fontFamily: 'var(--font-inter)',
                            color: isFeatured ? 'var(--price-color)' : 'var(--dark-text)',
                          }}
                        >
                          {displayPrice * item.quantity} KM
                        </p>
                        {isFeatured && (
                          <span
                            className="text-xs mt-0.5 px-1.5 py-0.5 rounded"
                            style={{
                              backgroundColor: '#dc2626',
                              color: 'white',
                              fontFamily: 'var(--font-inter)',
                            }}
                          >
                            -15%
                          </span>
                        )}
                      </div>
                    </div>
                    );
                  })}
                </div>
              </div>

              {/* Price Breakdown - Fixed */}
              <div className="space-y-3 mb-4 pb-4 border-b flex-shrink-0" style={{ borderColor: 'var(--border-light)' }}>
                <div className="flex justify-between">
                  <span
                    className="text-base"
                    style={{
                      color: 'var(--body-text)',
                      fontFamily: 'var(--font-inter)',
                    }}
                  >
                    {cartProducts.length} {cartProducts.length === 1 ? 'proizvod' : 'proizvoda'}:
                  </span>
                  <span
                    className="text-base font-semibold"
                    style={{
                      color: 'var(--dark-text)',
                      fontFamily: 'var(--font-inter)',
                    }}
                  >
                    {totals.itemsTotal} KM
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between">
                    <span
                      className="text-base"
                      style={{
                        color: 'var(--body-text)',
                        fontFamily: 'var(--font-inter)',
                      }}
                    >
                      Troškovi dostave:
                    </span>
                    <span
                      className="text-base font-semibold"
                      style={{
                        color: totals.deliveryCost === 0 ? '#16a34a' : 'var(--dark-text)',
                        fontFamily: 'var(--font-inter)',
                      }}
                    >
                      {totals.deliveryCost} KM
                    </span>
                  </div>
                  {totals.deliveryCost === 0 && totals.itemsTotal > 50 && (
                    <div className="flex items-center gap-1.5 text-xs" style={{ color: '#16a34a', fontFamily: 'var(--font-inter)' }}>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Besplatna dostava za narudžbe preko 50 KM</span>
                    </div>
                  )}
                </div>
                <div className="flex justify-between">
                  <span
                    className="text-base"
                    style={{
                      color: 'var(--body-text)',
                      fontFamily: 'var(--font-inter)',
                    }}
                  >
                    Porez:
                  </span>
                  <span
                    className="text-base font-semibold"
                    style={{
                      color: 'var(--dark-text)',
                      fontFamily: 'var(--font-inter)',
                    }}
                  >
                    {Math.round(totals.tax)} KM
                  </span>
                </div>
                {totals.discount > 0 && (
                  <div className="flex justify-between">
                    <span
                      className="text-base"
                      style={{
                        color: '#16a34a',
                        fontFamily: 'var(--font-inter)',
                      }}
                    >
                      Popust ({appliedPromocode?.toUpperCase()}):
                    </span>
                    <span
                      className="text-base font-semibold"
                      style={{
                        color: '#16a34a',
                        fontFamily: 'var(--font-inter)',
                      }}
                    >
                      -{Math.round(totals.discount)} KM
                    </span>
                  </div>
                )}
              </div>

              {/* Total - Fixed */}
              <div className="flex justify-between items-center mb-4 flex-shrink-0">
                <span
                  className="text-xl font-bold"
                  style={{
                    color: 'var(--dark-text)',
                    fontFamily: 'var(--font-inter)',
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
                  {Math.round(totals.total)} KM
                </span>
              </div>

              {/* Submit Button - Fixed */}
              <div className="flex-shrink-0">
                <button
                  onClick={handleSubmitOrder}
                  disabled={isSubmitting || (paymentMethod === 'card' && (!selectedPaymentCardId || paymentCards.length === 0))}
                  className="w-full h-12 rounded-lg flex items-center justify-center gap-2 font-semibold text-base transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: 'linear-gradient(135deg, #f5c852 0%, #f0c855 100%)',
                  color: 'var(--dark-text)',
                  fontFamily: 'var(--font-inter)',
                  boxShadow: '0 2px 8px rgba(212, 167, 44, 0.25)',
                  border: '1px solid rgba(212, 167, 44, 0.2)',
                }}
                onMouseEnter={(e) => {
                  const isDisabled = isSubmitting || (paymentMethod === 'card' && (!selectedPaymentCardId || paymentCards.length === 0));
                  if (!isDisabled) {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #f8d275 0%, #f5c852 100%)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(212, 167, 44, 0.35)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #f5c852 0%, #f0c855 100%)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(212, 167, 44, 0.25)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {isSubmitting ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Obrada narudžbe...
                  </>
                ) : (
                  <>
                    Potvrdi i naruči
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </>
                )}
              </button>

                {paymentMethod === 'card' && paymentCards.length === 0 && (
                  <p
                    className="text-sm text-center mt-4"
                    style={{
                      color: '#dc2626',
                      fontFamily: 'var(--font-inter)',
                    }}
                  >
                    Molimo dodajte karticu u profilu
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

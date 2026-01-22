'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';
import { ROUTES } from '@/config/constants';
import { getProductBySlug, type Product, calculatePriceByWeight, createSellerSlug } from '@/lib/data';
import { useFavorites } from '@/hooks/useFavorites';
import { useCart } from '@/hooks/useCart';
import { useToastContext } from '@/components/ToastProvider';
import ProductReviews from '@/components/ProductReviews';
import SmallFooter from '@/components/SmallFooter';

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedWeight, setSelectedWeight] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const { toggleFavorite, isFavorite, favorites, addFavorite, removeFavorite } = useFavorites();
  const { addToCart } = useCart();
  const { showToast } = useToastContext();
  const [isLiked, setIsLiked] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [activeTab, setActiveTab] = useState<'product' | 'beekeeper'>('product');
  const defaultWeight = '450g';

  const getDefaultWeight = (targetProduct: Product): string => {
    if (targetProduct.availableWeights.includes(defaultWeight)) {
      return defaultWeight;
    }

    if (targetProduct.availableWeights.includes(targetProduct.weight)) {
      return targetProduct.weight;
    }

    return targetProduct.availableWeights[0] ?? targetProduct.weight;
  };

  useEffect(() => {
    if (slug) {
      const foundProduct = getProductBySlug(slug);
      if (foundProduct) {
        setProduct(foundProduct);
        setSelectedWeight(getDefaultWeight(foundProduct));
        setSelectedImageIndex(0); // Reset to first image
      }
    }
  }, [slug]);

  useEffect(() => {
    if (product) {
      setIsLiked(isFavorite(product.id));
    }
  }, [favorites, product, isFavorite]);

  // Intersection Observer for scroll animations - only animate once
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
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    const sections = document.querySelectorAll('[data-animate-section]');
    sections.forEach((section) => observer.observe(section));

    return () => {
      sections.forEach((section) => observer.unobserve(section));
    };
  }, [product]);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--cream)' }}>
        <div className="text-center">
          <h1
            className="text-2xl font-bold mb-4"
            style={{
              fontFamily: 'var(--font-serif)',
              color: 'var(--dark-text)',
            }}
          >
            Proizvod nije pronađen
          </h1>
          <Link
            href={ROUTES.PRODUCTS}
            className="inline-block px-6 py-3 rounded-lg font-medium transition-colors"
            style={{
              backgroundColor: 'var(--honey-gold)',
              color: 'white',
              fontFamily: 'var(--font-inter)',
            }}
          >
            Povratak na proizvode
          </Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    // Prevent double-click or multiple rapid clicks
    if (isAdding) return;
    
    // Check if product is in stock
    if (!product.inStock) {
      showToast('Proizvod nije na stanju', 'error');
      return;
    }
    
    // Check if quantity exceeds stock
    if (quantity > product.stock) {
      showToast(`Dostupno je samo ${product.stock} komada`, 'error');
      return;
    }
    
    setIsAdding(true);
    addToCart(product.id, quantity, selectedWeight);
    showToast(`${product.name} (${selectedWeight}) je dodan u korpu!`, 'success');
    
    // Reset after a short delay
    setTimeout(() => {
      setIsAdding(false);
    }, 800);
  };

  const handleFavorite = () => {
    // Prevent double-click or multiple rapid clicks
    if (isToggling) return;
    
    setIsToggling(true);
    const wasLiked = isFavorite(product.id);
    
    // Store product ID in closure for undo
    const productId = product.id;
    
    if (wasLiked) {
      // Remove from favorites
      removeFavorite(productId);
      // Undo: add back to favorites - no delay needed since we update localStorage directly
      showToast(
        `${product.name} je uklonjen iz omiljenih`, 
        'info',
        4000,
        () => {
          // Directly call addFavorite - it will handle localStorage correctly
          addFavorite(productId);
        }
      );
    } else {
      // Add to favorites
      addFavorite(productId);
      // Undo: remove from favorites with small delay to ensure state is updated
      showToast(
        `${product.name} je dodan u omiljene`, 
        'success',
        4000,
        () => {
          // Use setTimeout to ensure state is updated before undo
          setTimeout(() => {
            removeFavorite(productId);
          }, 100);
        }
      );
    }
    
    // Reset after a longer delay to prevent spam
    setTimeout(() => {
      setIsToggling(false);
    }, 800);
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const increaseQuantity = () => {
    if (product && quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const currentPrice = calculatePriceByWeight(product, selectedWeight);
  
  // Check if product is in featured offers (same logic as FeaturedBeekeeper)
  const isFeaturedOffer = product && (
    (product.categorySlug === 'sumski-med' && product.seller.location === 'Tuzla' && product.inStock) ||
    (product.categorySlug === 'sumski-med' && product.inStock) ||
    (product.seller.location === 'Tuzla' && product.rating >= 4.0 && product.inStock) ||
    (product.rating >= 4.5 && product.inStock)
  );
  
  // Calculate discount price (15% off) if featured
  const originalPrice = currentPrice;
  const discountedPrice = isFeaturedOffer ? Math.round(originalPrice * 0.85) : originalPrice;

  // Get beekeeper description based on seller name
  const getBeekeeperDescription = (sellerName: string): string => {
    const descriptions: Record<string, string> = {
      'Alen Mešić': 'Alen Mešić je strastveni pčelar sa preko 15 godina iskustva u proizvodnji prirodnog meda. Njegov pristup karakteriše pažljiv odnos prema svakoj košnici i posvećenost tradicionalnim metodama pčelarenja. Svaki med je ručno sakupljen i sačuvan kako bi zadržao svoju prirodnu čistoću i autentičan ukus.',
      'Emir Hodžić': 'Emir Hodžić je poznat po svojoj predanosti ekološkoj proizvodnji meda. Sa više od 20 godina iskustva, on koristi samo prirodne metode bez upotrebe kemikalija. Njegov med je prepoznatljiv po izuzetnoj kvaliteti i bogatom ukusu koji odražava prirodnu raznolikost lokalne flore.',
      'Tarik Begović': 'Tarik Begović je mladi pčelar koji kombinira tradicionalne metode sa modernim pristupom. Njegov entuzijazam i inovativnost rezultiraju medom izuzetne kvalitete. Svaki proizvod je pažljivo pripremljen kako bi zadržao sve prirodne benefite.',
      'Amir Hasanović': 'Amir Hasanović je pčelar sa dugogodišnjom tradicijom u porodici. Naslijedio je znanje od svojih predaka i nastavlja sa proizvodnjom autentičnog meda. Njegov med je poznat po konzistentnoj kvaliteti i tradicionalnom ukusu.',
      'Dženan Kovačević': 'Dženan Kovačević je stručnjak za različite vrste meda. Sa više od 12 godina iskustva, on pažljivo bira lokacije za svoje košnice kako bi osigurao najbolji kvalitet. Njegov med je prepoznatljiv po svojoj čistoći i prirodnom okusu.',
      'Haris Dervišević': 'Haris Dervišević je poznat po svojoj pažljivosti i strpljenju u radu sa pčelama. Njegov pristup karakteriše duboko razumijevanje pčelinjeg ponašanja i ekosistema. Svaki med je rezultat dugogodišnjeg iskustva i posvećenosti kvalitetu.',
      'Kenan Smajlović': 'Kenan Smajlović je pčelar koji se fokusira na proizvodnju organskog meda. Njegov rad karakteriše poštovanje prema prirodi i održivim praksama. Svaki proizvod je pažljivo sakupljen i sačuvan kako bi zadržao sve prirodne benefite.',
      'Mirza Čaušević': 'Mirza Čaušević je iskusan pčelar sa preko 18 godina iskustva. Njegov med je poznat po izuzetnoj kvaliteti i bogatom ukusu. Koristi tradicionalne metode proizvodnje koje osiguravaju autentičnost i prirodnu čistoću svakog proizvoda.',
      'Nedim Hadžić': 'Nedim Hadžić je mladi pčelar koji donosi svježinu i inovativnost u tradicionalno pčelarenje. Njegov entuzijazam i posvećenost kvalitetu rezultiraju medom izuzetnog okusa. Svaki proizvod je pažljivo pripremljen sa pažnjom na detalje.',
      'Omer Mujić': 'Omer Mujić je pčelar sa dugogodišnjom tradicijom i iskustvom. Njegov rad karakteriše pažljiv pristup svakoj košnici i posvećenost kvalitetu proizvoda. Svaki med je ručno sakupljen i sačuvan kako bi zadržao svoju prirodnu čistoću i ukus.',
      'Adnan Karić': 'Adnan Karić je poznat po svojoj strasti prema pčelarenju i prirodi. Sa više od 10 godina iskustva, on koristi samo prirodne metode proizvodnje. Njegov med je prepoznatljiv po svojoj čistoći i autentičnom ukusu koji odražava lokalnu floru.',
      'Benjamin Jusić': 'Benjamin Jusić je pčelar koji se fokusira na proizvodnju visokokvalitetnog meda. Njegov pristup karakteriše pažljiv odnos prema pčelama i ekosistemu. Svaki proizvod je rezultat dugogodišnjeg iskustva i posvećenosti kvalitetu.',
      'Dino Mulić': 'Dino Mulić je mladi pčelar koji kombinira tradicionalne metode sa modernim znanjem. Njegov entuzijazam i inovativnost rezultiraju medom izuzetne kvalitete. Svaki med je pažljivo sakupljen i sačuvan kako bi zadržao sve prirodne benefite.',
      'Emin Suljić': 'Emin Suljić je iskusan pčelar sa preko 14 godina iskustva u proizvodnji prirodnog meda. Njegov rad karakteriše pažljiv pristup svakoj košnici i posvećenost kvalitetu proizvoda. Svaki med je ručno sakupljen i sačuvan kako bi zadržao svoju prirodnu čistoću.',
      'Faruk Avdić': 'Faruk Avdić je pčelar poznat po svojoj predanosti ekološkoj proizvodnji. Sa više od 16 godina iskustva, on koristi samo prirodne metode bez upotrebe kemikalija. Njegov med je prepoznatljiv po izuzetnoj kvaliteti i bogatom ukusu.',
    };

    return descriptions[sellerName] || `${sellerName} je iskusan pčelar sa dugogodišnjim iskustvom u proizvodnji prirodnog meda. Njegov rad karakteriše pažljiv pristup svakoj košnici i posvećenost kvalitetu proizvoda. Svaki med je pažljivo sakupljen i sačuvan kako bi zadržao svoju prirodnu čistoću i ukus.`;
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--cream)' }}>
      <div className="container mx-auto px-8 max-lg:px-6 max-md:px-4 max-sm:px-3 py-8 max-md:py-6 max-sm:py-4 max-w-7xl">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: 'Početna', href: ROUTES.HOME },
            { label: 'Proizvodi', href: ROUTES.PRODUCTS },
            { label: 'Proizvod detalji', href: undefined },
          ]}
        />

        <div data-animate-section className="grid grid-cols-2 max-lg:grid-cols-1 gap-12 mt-8">
          {/* Left Side - Product Images */}
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
            {/* Thumbnail Images - Vertical on desktop, horizontal on mobile */}
            {product.images.length > 1 && (
              <div className="flex lg:flex-col flex-row gap-3 lg:order-first order-last justify-center lg:justify-start">
                {product.images.slice(0, 2).map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative w-14 h-14 lg:w-16 lg:h-16 flex-shrink-0 rounded-md overflow-hidden border-2 transition-all cursor-pointer ${
                      selectedImageIndex === index 
                        ? 'ring-2 ring-offset-2 scale-105' 
                        : 'hover:border-opacity-60 hover:opacity-90'
                    }`}
                    style={{
                      borderColor: selectedImageIndex === index ? 'var(--honey-gold)' : 'var(--border-light)',
                      backgroundColor: 'white',
                    }}
                    aria-label={`Prikaži sliku ${index + 1}`}
                  >
                    <Image
                      src={encodeURI(image)}
                      alt={`${product.name} ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="64px"
                      loading="lazy"
                      quality={75}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        // Try main product image as fallback
                        if (product.image && encodeURI(product.image) !== target.src) {
                          target.src = encodeURI(product.image);
                        } else {
                          target.style.display = 'none';
                        }
                      }}
                    />
                    {selectedImageIndex === index && (
                      <div className="absolute inset-0 border-2 rounded-md" style={{ borderColor: 'var(--honey-gold)' }} />
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Main Image */}
            <div className="relative flex-1 aspect-square rounded-xl overflow-hidden bg-white border-2 shadow-sm group" style={{ borderColor: 'var(--border-light)' }}>
              <Image
                src={encodeURI(product.images && product.images.length > selectedImageIndex ? product.images[selectedImageIndex] : product.image)}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
                quality={80}
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  // Always try main product image first as fallback
                  if (product.image && encodeURI(product.image) !== target.src) {
                    target.src = encodeURI(product.image);
                  } else if (product.images && product.images.length > 0) {
                    // Try first image from array
                    const fallback = product.images.find(img => encodeURI(img) !== target.src);
                    if (fallback) {
                      target.src = encodeURI(fallback);
                    } else {
                      target.style.display = 'none';
                    }
                  } else {
                    target.style.display = 'none';
                  }
                }}
              />
            </div>
          </div>

          {/* Right Side - Product Details */}
          <div className="space-y-6">
            {/* Rating */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-5 h-5"
                    fill={i < Math.floor(product.rating) ? 'var(--honey-gold)' : 'none'}
                    stroke={i < Math.floor(product.rating) ? 'var(--honey-gold)' : 'var(--border-light)'}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    />
                  </svg>
                ))}
              </div>
              <span
                className="text-base font-medium"
                style={{
                  color: 'var(--body-text)',
                  fontFamily: 'var(--font-inter)',
                }}
              >
                {product.rating.toFixed(1)}/5 {product.reviews} Recenzija
              </span>
            </div>

            {/* Product Name */}
            <h1
              className="text-4xl max-md:text-3xl max-sm:text-2xl font-bold"
              style={{
                fontFamily: 'var(--font-serif)',
                color: 'var(--dark-text)',
                letterSpacing: '0.02em',
              }}
            >
              {product.name}
            </h1>

            {/* Product Description */}
            <p
              className="text-lg max-md:text-base leading-relaxed"
              style={{
                color: 'var(--body-text)',
                fontFamily: 'var(--font-inter)',
              }}
            >
              {product.longDescription || product.description}
            </p>

            {/* Price and Stock Status */}
            <div className="space-y-2">
              <div className="flex items-baseline gap-4">
                {isFeaturedOffer && (
                  <span
                    className="text-xl line-through"
                    style={{
                      color: '#9ca3af',
                      fontFamily: 'var(--font-inter)',
                    }}
                  >
                    {originalPrice} {product.currency}
                  </span>
                )}
                <span
                  className="text-4xl max-md:text-3xl max-sm:text-2xl font-bold"
                  style={{
                    color: 'var(--price-color)',
                    fontFamily: 'var(--font-inter)',
                  }}
                >
                  {discountedPrice} {product.currency}
                </span>
              </div>
              {isFeaturedOffer && (
                <div className="flex items-center gap-2">
                  <span
                    className="px-2 py-1 rounded text-xs font-semibold"
                    style={{
                      backgroundColor: '#dc2626',
                      color: 'white',
                      fontFamily: 'var(--font-inter)',
                    }}
                  >
                    -15%
                  </span>
                  <span
                    className="text-sm"
                    style={{
                      color: 'var(--body-text)',
                      fontFamily: 'var(--font-inter)',
                      opacity: 0.8,
                    }}
                  >
                    Izdvojena ponuda
                  </span>
                </div>
              )}
              {product.inStock ? (
                <div className="flex items-center gap-2">
                  <span
                    className="text-sm font-medium"
                    style={{
                      color: 'var(--green-primary)',
                      fontFamily: 'var(--font-inter)',
                    }}
                  >
                    Na stanju ({product.stock} komada)
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span
                    className="text-sm font-medium px-3 py-1 rounded"
                    style={{
                      color: '#dc2626',
                      backgroundColor: '#fef2f2',
                      fontFamily: 'var(--font-inter)',
                    }}
                  >
                    Nema na stanju
                  </span>
                </div>
              )}
            </div>

            {/* Weight Options */}
            <div className="space-y-3">
              <label
                className="text-base font-semibold block"
                style={{
                  color: 'var(--dark-text)',
                  fontFamily: 'var(--font-inter)',
                }}
              >
                Težina
              </label>
              <div className="flex gap-3">
                {product.availableWeights.map((weight) => (
                  <button
                    key={weight}
                    onClick={() => setSelectedWeight(weight)}
                    className="px-6 py-3 rounded-lg font-medium transition-all"
                    style={{
                      backgroundColor: selectedWeight === weight ? 'var(--price-color)' : 'white',
                      color: selectedWeight === weight ? 'white' : 'var(--body-text)',
                      border: `2px solid ${selectedWeight === weight ? 'var(--price-color)' : 'var(--border-light)'}`,
                      fontFamily: 'var(--font-inter)',
                    }}
                  >
                    {weight}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="space-y-3">
              <label
                className="text-base font-semibold block"
                style={{
                  color: 'var(--dark-text)',
                  fontFamily: 'var(--font-inter)',
                }}
              >
                Količina
              </label>
              <div className="flex items-center gap-4">
                <button
                  onClick={decreaseQuantity}
                  disabled={quantity <= 1}
                  className="w-10 h-10 rounded-lg border-2 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    borderColor: 'var(--border-light)',
                    color: 'var(--body-text)',
                  }}
                  onMouseEnter={(e) => {
                    if (!e.currentTarget.disabled) {
                      e.currentTarget.style.borderColor = 'var(--honey-gold)';
                      e.currentTarget.style.backgroundColor = 'var(--honey-gold)';
                      e.currentTarget.style.color = 'white';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!e.currentTarget.disabled) {
                      e.currentTarget.style.borderColor = 'var(--border-light)';
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'var(--body-text)';
                    }
                  }}
                  aria-label="Smanji količinu"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
                <span
                  className="text-xl font-semibold w-12 text-center"
                  style={{
                    color: 'var(--dark-text)',
                    fontFamily: 'var(--font-inter)',
                  }}
                >
                  {quantity}
                </span>
                <button
                  onClick={increaseQuantity}
                  disabled={!product.inStock || quantity >= product.stock}
                  className="w-10 h-10 rounded-lg border-2 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    borderColor: 'var(--border-light)',
                    color: 'var(--body-text)',
                  }}
                  onMouseEnter={(e) => {
                    if (!e.currentTarget.disabled) {
                      e.currentTarget.style.borderColor = 'var(--honey-gold)';
                      e.currentTarget.style.backgroundColor = 'var(--honey-gold)';
                      e.currentTarget.style.color = 'white';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!e.currentTarget.disabled) {
                      e.currentTarget.style.borderColor = 'var(--border-light)';
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'var(--body-text)';
                    }
                  }}
                  aria-label="Povećaj količinu"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-4">
              <button
                onClick={handleAddToCart}
                disabled={!product.inStock || isAdding}
                className="flex-1 h-12 rounded-lg flex items-center justify-center gap-3 font-semibold text-base transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: product.inStock ? 'var(--honey-gold)' : 'var(--border-light)',
                  color: product.inStock ? 'white' : 'var(--body-text)',
                  fontFamily: 'var(--font-inter)',
                }}
                onMouseEnter={(e) => {
                  if (product.inStock && !e.currentTarget.disabled) {
                    e.currentTarget.style.backgroundColor = 'var(--honey-light)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (product.inStock) {
                    e.currentTarget.style.backgroundColor = 'var(--honey-gold)';
                  } else {
                    e.currentTarget.style.backgroundColor = 'var(--border-light)';
                  }
                }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                Dodaj u korpu
              </button>
              <button
                onClick={handleFavorite}
                aria-label={isLiked ? 'Ukloni iz omiljenih' : 'Dodaj u omiljene'}
                className="w-12 h-12 rounded-lg border-2 flex items-center justify-center transition-colors"
                style={{
                  borderColor: isLiked ? '#dc2626' : 'var(--border-light)',
                  backgroundColor: isLiked ? '#fef2f2' : 'white',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#dc2626';
                  e.currentTarget.style.backgroundColor = '#fef2f2';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = isLiked ? '#dc2626' : 'var(--border-light)';
                  e.currentTarget.style.backgroundColor = isLiked ? '#fef2f2' : 'white';
                }}
              >
                <svg
                  className="w-6 h-6"
                  fill={isLiked ? '#dc2626' : 'none'}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  style={{ color: '#dc2626' }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </button>
            </div>

            {/* Delivery Information */}
            <div className="flex items-center gap-3 pt-4 border-t" style={{ borderColor: 'var(--border-light)' }}>
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                style={{ color: 'var(--honey-gold)' }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                />
              </svg>
              <span
                className="text-base font-medium"
                style={{
                  color: 'var(--body-text)',
                  fontFamily: 'var(--font-inter)',
                }}
              >
                Brza dostava
              </span>
            </div>
          </div>
        </div>

        {/* Product Details Section with Tabs */}
        <div data-animate-section className="mt-24">
          {/* Tabs */}
          <div className="flex gap-2 mb-8">
            <button
              onClick={() => setActiveTab('product')}
              className="px-6 py-3 rounded-lg font-medium text-base transition-colors"
              style={{
                backgroundColor: activeTab === 'product' ? 'white' : 'var(--border-light)',
                color: activeTab === 'product' ? 'var(--dark-text)' : 'var(--body-text)',
                fontFamily: 'var(--font-inter)',
              }}
              onMouseEnter={(e) => {
                if (activeTab !== 'product') {
                  e.currentTarget.style.backgroundColor = '#e5e5e5';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'product') {
                  e.currentTarget.style.backgroundColor = 'var(--border-light)';
                }
              }}
            >
              Detalji o proizvodu
            </button>
            <button
              onClick={() => setActiveTab('beekeeper')}
              className="px-6 py-3 rounded-lg font-medium text-base transition-colors"
              style={{
                backgroundColor: activeTab === 'beekeeper' ? 'white' : 'var(--border-light)',
                color: activeTab === 'beekeeper' ? 'var(--dark-text)' : 'var(--body-text)',
                fontFamily: 'var(--font-inter)',
              }}
              onMouseEnter={(e) => {
                if (activeTab !== 'beekeeper') {
                  e.currentTarget.style.backgroundColor = '#e5e5e5';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'beekeeper') {
                  e.currentTarget.style.backgroundColor = 'var(--border-light)';
                }
              }}
            >
              Detalji o pčelaru
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'product' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Left Section - Text Content */}
              <div className="space-y-8">
                {/* Product Overview */}
                <div>
                  <h3
                    className="text-2xl font-bold mb-4"
                    style={{
                      fontFamily: 'var(--font-serif)',
                      color: 'var(--dark-text)',
                      letterSpacing: '0.02em',
                    }}
                  >
                    Pregled proizvoda
                  </h3>
                  <p
                    className="text-base leading-relaxed"
                    style={{
                      color: 'var(--body-text)',
                      fontFamily: 'var(--font-inter)',
                    }}
                  >
                    {product.longDescription || product.description}
                  </p>
                </div>

                {/* Key Characteristics */}
                <div>
                  <h3
                    className="text-2xl font-bold mb-4"
                    style={{
                      fontFamily: 'var(--font-serif)',
                      color: 'var(--dark-text)',
                      letterSpacing: '0.02em',
                    }}
                  >
                    Ključne karakteristike
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <span
                        className="font-semibold"
                        style={{
                          color: 'var(--dark-text)',
                          fontFamily: 'var(--font-inter)',
                        }}
                      >
                        Vrsta meda:{' '}
                      </span>
                      <span
                        style={{
                          color: 'var(--body-text)',
                          fontFamily: 'var(--font-inter)',
                        }}
                      >
                        {product.keyCharacteristics.vrstaMeda}
                      </span>
                    </div>
                    <div>
                      <span
                        className="font-semibold"
                        style={{
                          color: 'var(--dark-text)',
                          fontFamily: 'var(--font-inter)',
                        }}
                      >
                        Dostupna pakovanja:{' '}
                      </span>
                      <span
                        style={{
                          color: 'var(--body-text)',
                          fontFamily: 'var(--font-inter)',
                        }}
                      >
                        {product.keyCharacteristics.dostupnaPakovanja}
                      </span>
                    </div>
                    <div>
                      <span
                        className="font-semibold"
                        style={{
                          color: 'var(--dark-text)',
                          fontFamily: 'var(--font-inter)',
                        }}
                      >
                        Boja i tekstura:{' '}
                      </span>
                      <span
                        style={{
                          color: 'var(--body-text)',
                          fontFamily: 'var(--font-inter)',
                        }}
                      >
                        {product.keyCharacteristics.bojaITekstura}
                      </span>
                    </div>
                    <div>
                      <span
                        className="font-semibold"
                        style={{
                          color: 'var(--dark-text)',
                          fontFamily: 'var(--font-inter)',
                        }}
                      >
                        Ukus:{' '}
                      </span>
                      <span
                        style={{
                          color: 'var(--body-text)',
                          fontFamily: 'var(--font-inter)',
                        }}
                      >
                        {product.keyCharacteristics.ukus}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Section - Images */}
              <div className="relative">
                {/* Main Apiary/Workspace Image */}
                <div className="relative w-full h-[600px] rounded-2xl overflow-hidden" style={{ borderRadius: '1rem 0 1rem 1rem' }}>
                  <Image
                    src={encodeURI(product.image)}
                    alt={`Košnice - ${product.seller.name}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      // Try first image from images array if available
                      if (product.images && product.images.length > 0) {
                        target.src = encodeURI(product.images[0]);
                      } else {
                        target.style.display = 'none';
                      }
                    }}
                  />
                </div>

                {/* Circular Beekeeper Portrait Overlay */}
                <div className="absolute bottom-0 left-0">
                  <div className="relative w-48 h-48 max-md:w-40 max-md:h-40 rounded-full overflow-hidden border-4 border-white shadow-xl">
                    <Image
                      src={product.seller.avatar}
                      alt={product.seller.name}
                      fill
                      className="object-cover"
                      sizes="192px"
                      quality={100}
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Left Section - Beekeeper Info */}
              <div className="space-y-6">
                <div>
                  <h3
                    className="text-2xl font-bold mb-4"
                    style={{
                      fontFamily: 'var(--font-serif)',
                      color: 'var(--dark-text)',
                      letterSpacing: '0.02em',
                    }}
                  >
                    {product.seller.name}
                  </h3>
                  <div className="flex items-center gap-2 mb-4">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      style={{ color: 'var(--body-text)' }}
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
                    <span
                      className="text-base"
                      style={{
                        color: 'var(--body-text)',
                        fontFamily: 'var(--font-inter)',
                      }}
                    >
                      {product.seller.location}
                    </span>
                  </div>
                  <p
                    className="text-base leading-relaxed mb-6"
                    style={{
                      color: 'var(--body-text)',
                      fontFamily: 'var(--font-inter)',
                    }}
                  >
                    {getBeekeeperDescription(product.seller.name)}
                  </p>
                  
                  {/* Learn More Button */}
                  <Link
                    href={`/pcelari/${createSellerSlug(product.seller.name)}`}
                    className="inline-block px-6 py-3 rounded-lg font-medium text-base transition-colors"
                    style={{
                      backgroundColor: 'var(--honey-gold)',
                      color: 'white',
                      fontFamily: 'var(--font-inter)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--honey-light)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--honey-gold)';
                    }}
                  >
                    Saznaj više o pčelaru
                  </Link>
                </div>
              </div>

              {/* Right Section - Beekeeper Image Only */}
              <div className="relative">
                <div className="relative w-full h-[600px] rounded-2xl overflow-hidden">
                  <Image
                    src={product.seller.avatar}
                    alt={product.seller.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Product Reviews Section */}
        <div data-animate-section>
          <ProductReviews productId={product.id} />
        </div>
      </div>
      <SmallFooter />
    </div>
  );
}

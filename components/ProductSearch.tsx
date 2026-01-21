'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { getAllProducts, isFeaturedOffer, getDiscountedPrice, type Product } from '@/lib/data';
import Link from 'next/link';
import Image from 'next/image';

type PopularSuggestion = {
  label: string;
  value: string;
};

const POPULAR_SUGGESTIONS: PopularSuggestion[] = [
  { label: 'Bagremov', value: 'bagremov' },
  { label: 'Livadski', value: 'livadski' },
  { label: 'Planinski', value: 'planinski' },
];

type ProductSearchProps = {
  onSearch?: (query: string) => void;
};

export default function ProductSearch({ onSearch }: ProductSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get product suggestions based on search query
  const suggestions = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      return [];
    }

    const query = searchQuery.toLowerCase();
    const allProducts = getAllProducts();
    
    // Filter products that match the query
    const matchedProducts = allProducts.filter(
      (product) =>
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.seller.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query)
    );

    // Return max 5 suggestions
    return matchedProducts.slice(0, 5);
  }, [searchQuery]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowSuggestions(value.length >= 2);
    setSelectedIndex(-1);
  };

  // Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIndex >= 0 && suggestions[selectedIndex]) {
      const product = suggestions[selectedIndex];
      setSearchQuery(product.name);
      onSearch?.(product.name);
    } else {
      onSearch?.(searchQuery);
    }
    setShowSuggestions(false);
  };

  // Handle suggestion click
  const handleSuggestionClick = (product: Product) => {
    setSearchQuery(product.name);
    onSearch?.(product.name);
    setShowSuggestions(false);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => 
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      handleSuggestionClick(suggestions[selectedIndex]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handlePopularSuggestionClick = (value: string) => {
    setSearchQuery(value);
    onSearch?.(value);
    setShowSuggestions(false);
  };

  // Update dropdown border color when input is focused
  useEffect(() => {
    if (showSuggestions && suggestions.length > 0 && suggestionsRef.current) {
      const input = inputRef.current;
      if (input) {
        const updateBorderColor = () => {
          if (suggestionsRef.current) {
            suggestionsRef.current.style.borderColor = 
              document.activeElement === input ? 'var(--honey-gold)' : 'var(--border-light)';
          }
        };
        
        input.addEventListener('focus', updateBorderColor);
        input.addEventListener('blur', updateBorderColor);
        
        return () => {
          input.removeEventListener('focus', updateBorderColor);
          input.removeEventListener('blur', updateBorderColor);
        };
      }
    }
  }, [showSuggestions, suggestions.length]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Search Bar */}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Pretraži proizvode..."
            className={`w-full px-6 py-4 border-2 focus:outline-none focus:ring-2 transition-all shadow-sm ${
              showSuggestions && suggestions.length > 0 ? 'rounded-t-lg rounded-b-none' : 'rounded-lg'
            }`}
            style={{
              backgroundColor: '#ffffff',
              borderColor: 'var(--border-light)',
              color: 'var(--dark-text)',
              fontFamily: 'var(--font-inter)',
              fontSize: '1rem',
              paddingRight: searchQuery ? '4.5rem' : '3.5rem',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--honey-gold)';
              if (searchQuery.length >= 2) {
                setShowSuggestions(true);
              }
              if (showSuggestions && suggestions.length > 0 && suggestionsRef.current) {
                suggestionsRef.current.style.borderColor = 'var(--honey-gold)';
              }
            }}
            onBlur={(e) => {
              // Don't change border color if suggestions are still visible
              if (!showSuggestions) {
                e.currentTarget.style.borderColor = 'var(--border-light)';
              }
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setShowSuggestions(false);
                if (inputRef.current) {
                  inputRef.current.focus();
                }
              }}
              className="absolute right-12 top-1/2 transform -translate-y-1/2 p-1.5 rounded-full transition-colors hover:bg-gray-100 z-20"
              style={{ color: 'var(--body-text)' }}
              aria-label="Obriši pretragu"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          <button
            type="submit"
            className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 transition-colors z-20"
            style={{ color: 'var(--honey-gold)' }}
            aria-label="Pretraži"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>

          {/* Autocomplete Suggestions - inside the relative container */}
          {showSuggestions && suggestions.length > 0 && (
            <div
              ref={suggestionsRef}
              className="absolute left-0 right-0 z-50 bg-white rounded-b-lg border-2 border-t-0 max-h-80 overflow-y-auto"
              style={{
                borderColor: inputRef.current === document.activeElement ? 'var(--honey-gold)' : 'var(--border-light)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.12)',
                top: 'calc(100% - 2px)', // Overlap the border by 2px
              }}
            >
          {suggestions.map((product, index) => {
            const isFeatured = isFeaturedOffer(product);
            const basePrice = product.price;
            const displayPrice = getDiscountedPrice(basePrice, isFeatured);
            return (
            <Link
              key={product.id}
              href={`/proizvodi/${product.slug}`}
              onClick={() => handleSuggestionClick(product)}
              className={`block px-5 py-3.5 transition-all border-b last:border-b-0 ${
                index === selectedIndex 
                  ? 'bg-opacity-10' 
                  : 'hover:bg-opacity-5'
              }`}
              style={{
                borderColor: 'var(--border-light)',
                backgroundColor: index === selectedIndex 
                  ? 'var(--honey-gold)' 
                  : 'transparent',
              }}
              onMouseEnter={(e) => {
                if (index !== selectedIndex) {
                  e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (index !== selectedIndex) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <div className="flex items-center gap-4">
                {/* Product Image */}
                <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 border" style={{ borderColor: 'var(--border-light)' }}>
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="56px"
                    loading="lazy"
                  />
                </div>
                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <div
                    className="font-semibold text-base mb-1.5 truncate"
                    style={{
                      color: 'var(--dark-text)',
                      fontFamily: 'var(--font-inter)',
                    }}
                  >
                    {product.name}
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className="text-sm truncate flex items-center gap-1.5"
                      style={{
                        color: 'var(--body-text)',
                        fontFamily: 'var(--font-inter)',
                      }}
                    >
                      <svg
                        className="w-3.5 h-3.5 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      <span className="truncate">{product.seller.name}</span>
                    </div>
                    <span style={{ color: 'var(--border-light)' }}>•</span>
                    <div
                      className="text-sm truncate"
                      style={{
                        color: 'var(--body-text)',
                        fontFamily: 'var(--font-inter)',
                      }}
                    >
                      {product.category}
                    </div>
                  </div>
                </div>
                {/* Price */}
                <div className="flex flex-col items-end flex-shrink-0">
                  {isFeatured && (
                    <div
                      className="text-xs line-through mb-0.5"
                      style={{
                        color: '#9ca3af',
                        fontFamily: 'var(--font-inter)',
                      }}
                    >
                      {basePrice} {product.currency}
                    </div>
                  )}
                  <div
                    className="font-bold text-lg"
                    style={{
                      color: 'var(--honey-gold)',
                      fontFamily: 'var(--font-inter)',
                    }}
                  >
                    {displayPrice} {product.currency}
                  </div>
                  {isFeatured && (
                    <div
                      className="text-xs mt-0.5 px-1.5 py-0.5 rounded"
                      style={{
                        backgroundColor: '#dc2626',
                        color: 'white',
                        fontFamily: 'var(--font-inter)',
                      }}
                    >
                      -15%
                    </div>
                  )}
                  {product.rating > 0 && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <svg
                        className="w-3.5 h-3.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        style={{ color: 'var(--honey-gold)' }}
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span
                        className="text-xs font-medium"
                        style={{
                          color: 'var(--body-text)',
                          fontFamily: 'var(--font-inter)',
                        }}
                      >
                        {product.rating.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
            );
          })}
            </div>
          )}
        </div>
      </form>

      {/* Popular Suggestions */}
      <div className="flex items-center justify-center gap-4 flex-wrap">
        <span
          className="text-sm font-medium"
          style={{ color: 'var(--body-text)', fontFamily: 'var(--font-inter)' }}
        >
          Popularno:
        </span>
        {POPULAR_SUGGESTIONS.map((suggestion, index) => (
          <div key={suggestion.value} className="flex items-center gap-4">
            <button
              onClick={() => handlePopularSuggestionClick(suggestion.value)}
              className="text-sm font-medium transition-colors hover:underline"
              style={{
                color: 'var(--honey-gold)',
                fontFamily: 'var(--font-inter)',
              }}
            >
              {suggestion.label}
            </button>
            {index < POPULAR_SUGGESTIONS.length - 1 && (
              <span
                className="text-xs"
                style={{ color: 'var(--border-light)' }}
              >
                |
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

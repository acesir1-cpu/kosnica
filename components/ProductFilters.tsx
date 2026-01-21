'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import categoriesData from '@/data/categories.json';
import { getAllLocations, getAllBadges } from '@/lib/data';

type FilterState = {
  categories: string[];
  additives: string[];
  seasons: string[];
  weights: string[];
  minPrice: number;
  maxPrice: number;
  minRating: number | null;
  locations: string[];
  badges: string[];
};

type ProductFiltersProps = {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
};

export default function ProductFilters({ filters, onFilterChange }: ProductFiltersProps) {
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);
  const [displayMinPrice, setDisplayMinPrice] = useState(filters.minPrice || 0);
  const [displayMaxPrice, setDisplayMaxPrice] = useState(filters.maxPrice || 30);
  const priceUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync localFilters with filters prop when it changes (e.g., when clear all is clicked)
  useEffect(() => {
    setLocalFilters(filters);
    setDisplayMinPrice(filters.minPrice || 0);
    setDisplayMaxPrice(filters.maxPrice || 30);
  }, [filters]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (priceUpdateTimeoutRef.current) {
        clearTimeout(priceUpdateTimeoutRef.current);
      }
    };
  }, []);

  const updateFilter = useCallback((updates: Partial<FilterState>) => {
    const newFilters = { ...localFilters, ...updates };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  }, [localFilters, onFilterChange]);

  // Debounced price update - only update parent after user stops dragging
  const updatePriceFilter = useCallback((min: number, max: number, immediate = false) => {
    setDisplayMinPrice(min);
    setDisplayMaxPrice(max);
    
    // Clear existing timeout
    if (priceUpdateTimeoutRef.current) {
      clearTimeout(priceUpdateTimeoutRef.current);
    }

    if (immediate) {
      updateFilter({ minPrice: min, maxPrice: max });
    } else {
      // Debounce the update - wait 150ms after user stops dragging
      priceUpdateTimeoutRef.current = setTimeout(() => {
        updateFilter({ minPrice: min, maxPrice: max });
      }, 150);
    }
  }, [updateFilter]);

  const toggleCategory = (slug: string) => {
    const categories = localFilters.categories.includes(slug)
      ? localFilters.categories.filter((c) => c !== slug)
      : [...localFilters.categories, slug];
    updateFilter({ categories });
  };

  const toggleAdditive = (slug: string) => {
    const additives = localFilters.additives.includes(slug)
      ? localFilters.additives.filter((a) => a !== slug)
      : [...localFilters.additives, slug];
    updateFilter({ additives });
  };

  const toggleSeason = (slug: string) => {
    const seasons = localFilters.seasons.includes(slug)
      ? localFilters.seasons.filter((s) => s !== slug)
      : [...localFilters.seasons, slug];
    updateFilter({ seasons });
  };

  const toggleWeight = (weight: string) => {
    const weights = localFilters.weights.includes(weight)
      ? localFilters.weights.filter((w) => w !== weight)
      : [...localFilters.weights, weight];
    updateFilter({ weights });
  };

  const handleRatingChange = (rating: number) => {
    const minRating = localFilters.minRating === rating ? null : rating;
    updateFilter({ minRating });
  };

  const handlePriceChange = useCallback((min: number, max: number, immediate = false) => {
    updatePriceFilter(min, max, immediate);
  }, [updatePriceFilter]);

  const toggleLocation = (location: string) => {
    const locations = localFilters.locations.includes(location)
      ? localFilters.locations.filter((l) => l !== location)
      : [...localFilters.locations, location];
    updateFilter({ locations });
  };

  const toggleBadge = (badge: string) => {
    const badges = localFilters.badges.includes(badge)
      ? localFilters.badges.filter((b) => b !== badge)
      : [...localFilters.badges, badge];
    updateFilter({ badges });
  };

  const handleDiscountToggle = () => {
    const newDiscount = localFilters.onDiscount === true ? null : true;
    updateFilter({ onDiscount: newDiscount });
  };

  const FilterSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="mb-6 pb-6 border-b" style={{ borderColor: 'var(--border-light)' }}>
      <h3
        className="text-base font-bold mb-4"
        style={{
          color: 'var(--dark-text)',
          fontFamily: 'var(--font-inter)',
          textDecoration: 'underline',
          textUnderlineOffset: '4px',
        }}
      >
        {title}
      </h3>
      {children}
    </div>
  );

  const CheckboxItem = ({
    id,
    label,
    checked,
    onChange,
    isSquare = false,
  }: {
    id: string;
    label: string;
    checked: boolean;
    onChange: () => void;
    isSquare?: boolean;
  }) => (
    <label
      className="flex items-center gap-3 mb-3 cursor-pointer group transition-all duration-200 hover:translate-x-1"
      style={{ fontFamily: 'var(--font-inter)' }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="hidden"
      />
      <div
        className={`flex items-center justify-center border-2 transition-all duration-200 group-hover:scale-110 ${
          isSquare ? 'w-5 h-5 rounded' : 'w-5 h-5 rounded-full'
        }`}
        style={{
          borderColor: checked ? 'var(--honey-gold)' : 'var(--border-light)',
          backgroundColor: checked ? 'var(--honey-gold)' : 'transparent',
        }}
        onMouseEnter={(e) => {
          if (!checked) {
            e.currentTarget.style.borderColor = 'var(--honey-gold)';
            e.currentTarget.style.backgroundColor = 'rgba(212, 167, 44, 0.1)';
          }
        }}
        onMouseLeave={(e) => {
          if (!checked) {
            e.currentTarget.style.borderColor = 'var(--border-light)';
            e.currentTarget.style.backgroundColor = 'transparent';
          }
        }}
      >
        {checked && (
          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </div>
      <span
        className="text-sm transition-colors duration-200 group-hover:text-[var(--honey-gold)]"
        style={{
          color: checked ? 'var(--dark-text)' : 'var(--body-text)',
        }}
      >
        {label}
      </span>
    </label>
  );

  return (
    <div
      className="bg-white rounded-xl p-6 shadow-md transition-shadow duration-300 hover:shadow-lg"
      style={{
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        border: '1px solid var(--border-light)',
      }}
    >
      {/* Kategorije */}
      <FilterSection title="Kategorije">
        <CheckboxItem
          id="all"
          label="Svi proizvodi"
          checked={localFilters.categories.length === 0}
          onChange={() => updateFilter({ categories: [] })}
        />
        {categoriesData.categories.map((category) => (
          <CheckboxItem
            key={category.id}
            id={category.slug}
            label={category.name}
            checked={localFilters.categories.includes(category.slug)}
            onChange={() => toggleCategory(category.slug)}
          />
        ))}
      </FilterSection>

      {/* Med s dodacima */}
      <FilterSection title="Med s dodacima">
        {categoriesData.additives.map((additive) => (
          <CheckboxItem
            key={additive.id}
            id={additive.slug}
            label={additive.name}
            checked={localFilters.additives.includes(additive.slug)}
            onChange={() => toggleAdditive(additive.slug)}
          />
        ))}
      </FilterSection>

      {/* Med po sezoni */}
      <FilterSection title="Med po sezoni">
        {categoriesData.seasons.map((season) => (
          <CheckboxItem
            key={season.id}
            id={season.slug}
            label={`${season.name} (${season.period})`}
            checked={localFilters.seasons.includes(season.slug)}
            onChange={() => toggleSeason(season.slug)}
          />
        ))}
      </FilterSection>

      {/* Težina */}
      <FilterSection title="Težina">
        {categoriesData.weights.map((weight) => (
          <CheckboxItem
            key={weight.id}
            id={weight.value}
            label={weight.label}
            checked={localFilters.weights.includes(weight.value)}
            onChange={() => toggleWeight(weight.value)}
            isSquare={true}
          />
        ))}
      </FilterSection>

      {/* Mjesto */}
      <FilterSection title="Mjesto">
        {getAllLocations().map((location) => (
          <CheckboxItem
            key={location}
            id={`location-${location}`}
            label={location}
            checked={localFilters.locations.includes(location)}
            onChange={() => toggleLocation(location)}
          />
        ))}
      </FilterSection>

      {/* Na popustu */}
      <FilterSection title="Specijalne ponude">
        <CheckboxItem
          id="on-discount"
          label="Na popustu (-15%)"
          checked={localFilters.onDiscount === true}
          onChange={handleDiscountToggle}
        />
      </FilterSection>

      {/* Tagovi */}
      <FilterSection title="Tagovi">
        <div className="space-y-2">
          {getAllBadges().map((badge) => (
            <CheckboxItem
              key={badge.value}
              id={`badge-${badge.value}`}
              label={badge.label}
              checked={localFilters.badges.includes(badge.value)}
              onChange={() => toggleBadge(badge.value)}
            />
          ))}
        </div>
      </FilterSection>

      {/* Cijena */}
      <FilterSection title="Cijena">
        <div className="space-y-4">
          {/* Price Input Fields */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 flex-1">
              <label className="text-xs font-medium" style={{ color: 'var(--body-text)', fontFamily: 'var(--font-inter)' }}>
                Min:
              </label>
              <div className="relative flex-1 max-w-24">
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={displayMinPrice}
                  onChange={(e) => {
                    const newMin = Math.max(0, Math.min(Number(e.target.value) || 0, displayMaxPrice));
                    setDisplayMinPrice(newMin);
                    handlePriceChange(newMin, displayMaxPrice, true);
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-light)';
                    e.currentTarget.style.boxShadow = 'none';
                    const newMin = Math.max(0, Math.min(Number(e.target.value) || 0, displayMaxPrice));
                    setDisplayMinPrice(newMin);
                    handlePriceChange(newMin, displayMaxPrice, true);
                  }}
                  className="w-full px-3 py-2 border rounded-lg text-sm transition-all focus:outline-none focus:ring-2"
                  style={{
                    borderColor: 'var(--border-light)',
                    fontFamily: 'var(--font-inter)',
                    color: 'var(--dark-text)',
                    backgroundColor: 'var(--warm-white)',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--honey-gold)';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(212, 167, 44, 0.1)';
                  }}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs pointer-events-none" style={{ color: 'var(--body-text)' }}>
                  KM
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 flex-1">
              <label className="text-xs font-medium" style={{ color: 'var(--body-text)', fontFamily: 'var(--font-inter)' }}>
                Max:
              </label>
              <div className="relative flex-1 max-w-24">
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={displayMaxPrice}
                  onChange={(e) => {
                    const newMax = Math.min(30, Math.max(Number(e.target.value) || 30, displayMinPrice));
                    setDisplayMaxPrice(newMax);
                    handlePriceChange(displayMinPrice, newMax, true);
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-light)';
                    e.currentTarget.style.boxShadow = 'none';
                    const newMax = Math.min(30, Math.max(Number(e.target.value) || 30, displayMinPrice));
                    setDisplayMaxPrice(newMax);
                    handlePriceChange(displayMinPrice, newMax, true);
                  }}
                  className="w-full px-3 py-2 border rounded-lg text-sm transition-all focus:outline-none focus:ring-2"
                  style={{
                    borderColor: 'var(--border-light)',
                    fontFamily: 'var(--font-inter)',
                    color: 'var(--dark-text)',
                    backgroundColor: 'var(--warm-white)',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--honey-gold)';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(212, 167, 44, 0.1)';
                  }}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs pointer-events-none" style={{ color: 'var(--body-text)' }}>
                  KM
                </span>
              </div>
            </div>
          </div>

          {/* Quick Price Filters */}
          <div className="mt-4">
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Do 5 KM', min: 0, max: 5 },
                { label: '5-10 KM', min: 5, max: 10 },
                { label: '10-15 KM', min: 10, max: 15 },
                { label: '15-20 KM', min: 15, max: 20 },
                { label: '20+ KM', min: 20, max: 30 },
              ].map((range) => {
                const isActive = displayMinPrice === range.min && displayMaxPrice === range.max;
                return (
                  <button
                    key={range.label}
                    onClick={() => {
                      setDisplayMinPrice(range.min);
                      setDisplayMaxPrice(range.max);
                      handlePriceChange(range.min, range.max, true);
                    }}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200"
                    style={{
                      backgroundColor: isActive ? 'var(--honey-gold)' : 'var(--warm-white)',
                      color: isActive ? 'white' : 'var(--body-text)',
                      border: `1px solid ${isActive ? 'var(--honey-gold)' : 'var(--border-light)'}`,
                      fontFamily: 'var(--font-inter)',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.borderColor = 'var(--honey-gold)';
                        e.currentTarget.style.backgroundColor = 'rgba(212, 167, 44, 0.1)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.borderColor = 'var(--border-light)';
                        e.currentTarget.style.backgroundColor = 'var(--warm-white)';
                      }
                    }}
                  >
                    {range.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </FilterSection>

      {/* Ocjene kupaca */}
      <FilterSection title="Ocjene kupaca">
        {[5, 4, 3].map((rating) => (
          <label
            key={rating}
            className="flex items-center gap-3 mb-3 cursor-pointer"
            style={{ fontFamily: 'var(--font-inter)' }}
          >
            <input
              type="checkbox"
              checked={localFilters.minRating === rating}
              onChange={() => handleRatingChange(rating)}
              className="hidden"
            />
            <div
              className="w-5 h-5 rounded border-2 flex items-center justify-center transition-colors"
              style={{
                borderColor:
                  localFilters.minRating === rating
                    ? 'var(--honey-gold)'
                    : 'var(--border-light)',
                backgroundColor:
                  localFilters.minRating === rating ? 'var(--honey-gold)' : 'transparent',
              }}
            >
              {localFilters.minRating === rating && (
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className="w-4 h-4"
                  fill={i < rating ? 'var(--honey-gold)' : 'none'}
                  stroke={i < rating ? 'var(--honey-gold)' : 'var(--border-light)'}
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
          </label>
        ))}
      </FilterSection>
    </div>
  );
}

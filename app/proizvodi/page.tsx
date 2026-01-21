'use client';

import { useState, useMemo, useEffect, useCallback, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Breadcrumbs from '@/components/Breadcrumbs';
import ProductSearch from '@/components/ProductSearch';
import ProductFilters from '@/components/ProductFilters';
import ActiveFilters from '@/components/ActiveFilters';
import ProductCard from '@/components/ProductCard';
import Pagination from '@/components/Pagination';
import ProductSort, { type SortOption } from '@/components/ProductSort';
import Footer from '@/components/Footer';
import { ROUTES, PAGINATION } from '@/config/constants';
import { getAllProducts, filterProducts, sortProducts, type Product } from '@/lib/data';
import categoriesData from '@/data/categories.json';

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
  onDiscount: boolean | null;
};

function ProductsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Calculate initial max price from products
  const initialMaxPrice = useMemo(() => {
    const products = getAllProducts();
    const prices = products.map(p => p.price);
    return prices.length > 0 ? Math.ceil(Math.max(...prices)) : 30;
  }, []);

  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    additives: [],
    seasons: [],
    weights: [],
    minPrice: 0,
    maxPrice: initialMaxPrice,
    minRating: null,
    locations: [],
    badges: [],
    onDiscount: null,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  // Products per page: 3 rows × 3 columns = 9 products (desktop)
  // On mobile/tablet it will show fewer per row but same total
  const PRODUCTS_PER_PAGE = 9; // 3 rows × 3 columns

  // Get stable string representation of search params for dependency tracking
  const searchParamsString = useMemo(() => {
    const category = searchParams.get('category') || '';
    const season = searchParams.get('season') || '';
    const location = searchParams.get('location') || '';
    const search = searchParams.get('search') || '';
    return `${category}|${season}|${location}|${search}`;
  }, [searchParams]);

  // Parse URL query parameters and update filters when URL changes
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    const seasonParam = searchParams.get('season');
    const locationParam = searchParams.get('location');
    const searchParam = searchParams.get('search');

    const newFilters: FilterState = {
      categories: categoryParam ? [categoryParam] : [],
      additives: [],
      seasons: seasonParam ? [seasonParam] : [],
      weights: [],
      minPrice: 0,
      maxPrice: initialMaxPrice,
      minRating: null,
      locations: locationParam ? [locationParam] : [],
      badges: [],
      onDiscount: null,
    };

    setFilters(newFilters);
    setCurrentPage(1); // Reset to page 1 when filters change from URL
    
    if (searchParam) {
      setSearchQuery(searchParam);
    } else {
      setSearchQuery('');
    }
  }, [searchParamsString, searchParams, initialMaxPrice]);

  // Filter and search products
  const filteredProducts = useMemo(() => {
    let products = getAllProducts();

    // Check if any filters are active
    const hasActiveFilters = 
      filters.categories.length > 0 ||
      filters.additives.length > 0 ||
      filters.seasons.length > 0 ||
      filters.weights.length > 0 ||
      filters.minPrice > 0 ||
      filters.maxPrice < initialMaxPrice ||
      filters.minRating !== null ||
      filters.locations.length > 0 ||
      filters.badges.length > 0 ||
      filters.onDiscount !== null;

    // Apply filters
    if (hasActiveFilters) {
      products = filterProducts({
        category: filters.categories.length === 1 ? filters.categories[0] : undefined,
        additives: filters.additives.length > 0 ? filters.additives : undefined,
        season: filters.seasons.length === 1 ? filters.seasons[0] : undefined,
        weight: filters.weights.length === 1 ? filters.weights[0] : undefined,
        minPrice: filters.minPrice > 0 ? filters.minPrice : undefined,
        maxPrice: filters.maxPrice < initialMaxPrice ? filters.maxPrice : undefined,
        minRating: filters.minRating !== null ? filters.minRating : undefined,
        locations: filters.locations.length > 0 ? filters.locations : undefined,
        badges: filters.badges.length > 0 ? filters.badges : undefined,
        onDiscount: filters.onDiscount !== null ? filters.onDiscount : undefined,
      });
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      products = products.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query) ||
          product.seller.name.toLowerCase().includes(query) ||
          product.seller.location.toLowerCase().includes(query)
      );
    }

    return products;
  }, [filters, searchQuery]);

  // Sort products
  const sortedProducts = useMemo(() => {
    if (sortBy === 'default') {
      return filteredProducts;
    }
    return sortProducts(filteredProducts, sortBy);
  }, [filteredProducts, sortBy]);

  // Pagination
  const totalPages = Math.ceil(sortedProducts.length / PRODUCTS_PER_PAGE);
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const endIndex = startIndex + PRODUCTS_PER_PAGE;
  const paginatedProducts = sortedProducts.slice(startIndex, endIndex);

  // Reset to page 1 when filters or search change
  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleSortChange = (newSort: SortOption) => {
    setSortBy(newSort);
    setCurrentPage(1);
  };


  const getActiveFilters = () => {
    const active: Array<{ id: string; label: string; type: 'category' | 'additive' | 'season' | 'location' | 'weight' | 'discount' | 'rating' | 'price' | 'badge' }> = [];
    
    // Get category and season names from data
    const categoryMap = new Map(categoriesData.categories.map(cat => [cat.slug, cat.name]));
    const seasonMap = new Map(categoriesData.seasons.map(season => [season.slug, season.name]));
    
    filters.categories.forEach((cat) => {
      const categoryName = categoryMap.get(cat) || cat;
      active.push({ id: `cat-${cat}`, label: categoryName, type: 'category' });
    });
    filters.additives.forEach((add) => {
      active.push({ id: `add-${add}`, label: add, type: 'additive' });
    });
    filters.seasons.forEach((season) => {
      const seasonName = seasonMap.get(season) || season;
      active.push({ id: `season-${season}`, label: seasonName, type: 'season' });
    });
    filters.weights.forEach((weight) => {
      active.push({ id: `weight-${weight}`, label: weight, type: 'weight' });
    });
    if (filters.minRating) {
      active.push({
        id: 'rating',
        label: `${filters.minRating}+ zvjezdica`,
        type: 'rating',
      });
    }
    filters.locations.forEach((location) => {
      active.push({ id: `location-${location}`, label: location, type: 'location' });
    });
    filters.badges.forEach((badge) => {
      const badgeLabels: Record<string, string> = {
        'najprodavanije': 'Najprodavanije',
        'novo-u-ponudi': 'Novo u ponudi',
      };
      active.push({ 
        id: `badge-${badge}`, 
        label: badgeLabels[badge] || badge, 
        type: 'badge' 
      });
    });

    if (filters.onDiscount === true) {
      active.push({ 
        id: 'discount-on-discount', 
        label: 'Na popustu (-15%)', 
        type: 'discount' 
      });
    }

    return active;
  };

  const handleRemoveFilter = (id: string) => {
    const [type, ...rest] = id.split('-');
    const value = rest.join('-');
    const newFilters = { ...filters };

    if (type === 'cat') {
      newFilters.categories = newFilters.categories.filter((c) => c !== value);
    } else if (type === 'add') {
      newFilters.additives = newFilters.additives.filter((a) => a !== value);
    } else if (type === 'season') {
      newFilters.seasons = newFilters.seasons.filter((s) => s !== value);
    } else if (type === 'weight') {
      newFilters.weights = newFilters.weights.filter((w) => w !== value);
    } else if (type === 'rating') {
      newFilters.minRating = null;
    } else if (type === 'location') {
      newFilters.locations = newFilters.locations.filter((l) => l !== value);
    } else if (type === 'badge') {
      newFilters.badges = newFilters.badges.filter((b) => b !== value);
    } else if (type === 'discount') {
      newFilters.onDiscount = null;
    }

    setFilters(newFilters);
  };

  const handleClearAll = () => {
    setFilters({
      categories: [],
      additives: [],
      seasons: [],
      weights: [],
      minPrice: 0,
      maxPrice: initialMaxPrice,
      minRating: null,
      locations: [],
      badges: [],
      onDiscount: null,
    });
  };

  // Intersection Observer for scroll animations - only animate once
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !entry.target.classList.contains('animate-fade-in')) {
            entry.target.classList.add('animate-fade-in');
            // Unobserve after animation to prevent re-triggering
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
  }, [paginatedProducts]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--cream)' }}>
      {/* Decorative Leaf Illustrations */}
      <div className="absolute bottom-0 left-0 w-64 h-64 opacity-20 pointer-events-none">
        <svg
          viewBox="0 0 200 200"
          fill="none"
          className="w-full h-full"
          style={{ color: 'var(--border-light)' }}
        >
          <path
            d="M50 150 Q30 120 40 90 Q50 60 80 50 Q110 40 140 50 Q170 60 180 90 Q190 120 170 150"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M60 140 Q50 110 55 85 Q60 60 75 55 Q90 50 105 55 Q120 60 125 85 Q130 110 120 140"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
          />
        </svg>
      </div>
      <div className="absolute bottom-0 right-0 w-64 h-64 opacity-20 pointer-events-none">
        <svg
          viewBox="0 0 200 200"
          fill="none"
          className="w-full h-full"
          style={{ color: 'var(--border-light)' }}
        >
          <path
            d="M150 150 Q170 120 160 90 Q150 60 120 50 Q90 40 60 50 Q30 60 20 90 Q10 120 30 150"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M140 140 Q150 110 145 85 Q140 60 125 55 Q110 50 95 55 Q80 60 75 85 Q70 110 80 140"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
          />
        </svg>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-8 max-lg:px-6 max-md:px-4 max-sm:px-3 py-16 max-md:py-12 max-sm:py-8 relative z-10">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: 'Početna', href: ROUTES.HOME },
            { label: 'Proizvodi', href: undefined },
          ]}
        />

        {/* Main Heading */}
        <div className="text-center mb-12 max-md:mb-8 mt-8 max-md:mt-4">
          <h1
            className="text-6xl max-md:text-4xl max-sm:text-3xl font-bold mb-6 max-md:mb-4"
            style={{
              fontFamily: 'var(--font-serif)',
              color: 'var(--dark-text)',
              letterSpacing: '0.05em',
            }}
          >
            Naši proizvodi
          </h1>
          <p
            className="text-xl max-md:text-lg max-sm:text-base max-w-2xl mx-auto px-4"
            style={{
              fontFamily: 'var(--font-inter)',
              color: 'var(--body-text)',
              lineHeight: '1.6',
            }}
          >
            Prirodno proizveden med direktno od pčelara
          </p>
        </div>

        {/* Search Bar and Popular Suggestions */}
        <div className="mb-6 max-md:mb-4">
          <ProductSearch onSearch={handleSearch} />
        </div>

        {/* Active Filters */}
        <div className="mb-6 max-md:mb-4">
          <ActiveFilters
            filters={getActiveFilters()}
            onRemove={handleRemoveFilter}
            onClearAll={handleClearAll}
          />
        </div>

        {/* Mobile Filter Button */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setShowMobileFilters(true)}
            className="w-full px-4 py-3 rounded-lg border-2 flex items-center justify-center gap-2 transition-colors"
            style={{
              backgroundColor: '#ffffff',
              borderColor: 'var(--honey-gold)',
              color: 'var(--dark-text)',
              fontFamily: 'var(--font-inter)',
              fontWeight: 600,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--honey-gold)';
              e.currentTarget.style.color = '#ffffff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#ffffff';
              e.currentTarget.style.color = 'var(--dark-text)';
            }}
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
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            Filtriraj
          </button>
        </div>

        {/* Main Content with Filters and Products */}
        <div className="flex gap-8 mt-12">
          {/* Left Sidebar - Filters (Desktop) */}
          <aside className="w-80 max-lg:hidden flex-shrink-0">
            <ProductFilters filters={filters} onFilterChange={handleFilterChange} />
          </aside>

          {/* Mobile Filter Modal/Drawer */}
          {showMobileFilters && (
            <>
              {/* Overlay */}
              <div
                className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
                onClick={() => setShowMobileFilters(false)}
              />
              {/* Filter Drawer */}
              <div
                className="lg:hidden fixed left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white z-50 overflow-y-auto shadow-xl"
                style={{ fontFamily: 'var(--font-inter)' }}
              >
                <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between z-10" style={{ borderColor: 'var(--border-light)' }}>
                  <h2
                    className="text-xl font-bold"
                    style={{ color: 'var(--dark-text)' }}
                  >
                    Filtriraj
                  </h2>
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                    aria-label="Zatvori filtere"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      style={{ color: 'var(--dark-text)' }}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                <div className="p-4 pb-20">
                  <ProductFilters filters={filters} onFilterChange={handleFilterChange} />
                </div>
                {/* Apply Button */}
                <div className="sticky bottom-0 bg-white border-t p-4 z-10" style={{ borderColor: 'var(--border-light)' }}>
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="w-full px-4 py-3 rounded-lg transition-colors font-semibold"
                    style={{
                      backgroundColor: 'var(--honey-gold)',
                      color: 'var(--dark-text)',
                      fontFamily: 'var(--font-inter)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = '0.9';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = '1';
                    }}
                  >
                    Primijeni filtere
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Right Side - Products Grid */}
          <div className="flex-1">
            {sortedProducts.length > 0 ? (
              <>
                <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
                  <p
                    className="text-base font-medium"
                    style={{
                      color: 'var(--dark-text)',
                      fontFamily: 'var(--font-inter)',
                    }}
                  >
                    Pronađeno <span style={{ color: 'var(--honey-gold)' }}>{sortedProducts.length}</span> proizvoda
                  </p>
                  <div className="flex items-center gap-4">
                    {totalPages > 1 && (
                      <p
                        className="text-sm"
                        style={{
                          color: 'var(--body-text)',
                          fontFamily: 'var(--font-inter)',
                        }}
                      >
                        Stranica {currentPage} od {totalPages}
                      </p>
                    )}
                    <ProductSort value={sortBy} onChange={handleSortChange} />
                  </div>
                </div>
                <div 
                  data-animate-section
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-md:gap-4 items-stretch"
                >
                  {paginatedProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      selectedWeight={filters.weights.length === 1 ? filters.weights[0] : undefined}
                    />
                  ))}
                </div>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </>
            ) : (
              <div className="text-center py-20">
                <div className="mb-6 opacity-30">
                  <svg
                    className="w-24 h-24 mx-auto"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    style={{ color: 'var(--body-text)' }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                </div>
                <p 
                  className="text-xl mb-2 font-semibold"
                  style={{ 
                    color: 'var(--dark-text)', 
                    fontFamily: 'var(--font-inter)' 
                  }}
                >
                  Nema proizvoda koji odgovaraju vašim filterima
                </p>
                <p 
                  className="text-base"
                  style={{ 
                    color: 'var(--body-text)', 
                    fontFamily: 'var(--font-inter)' 
                  }}
                >
                  Pokušajte promijeniti filtere ili pretražiti druge proizvode
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--honey-gold)] mx-auto mb-4"></div>
          <p style={{ color: 'var(--body-text)', fontFamily: 'var(--font-inter)' }}>Učitavanje...</p>
        </div>
      </div>
    }>
      <ProductsPageContent />
    </Suspense>
  );
}

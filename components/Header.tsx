'use client';

import Link from 'next/link';
import { NAVIGATION_ITEMS, ROUTES } from '@/config/constants';
import { usePathname, useRouter } from 'next/navigation';
import { useFavorites } from '@/hooks/useFavorites';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState, useRef, useMemo } from 'react';
import categoriesData from '@/data/categories.json';
import { getAllBeekeepers, getAllProducts, type Product } from '@/lib/data';
import blogData from '@/data/blog.json';
import Image from 'next/image';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { getFavoriteCount } = useFavorites();
  const { cartItems } = useCart();
  const { isAuthenticated, user, logout } = useAuth();
  const favoriteCount = getFavoriteCount();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [closeTimeout, setCloseTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const searchRef = useRef<HTMLDivElement | null>(null);

  // Calculate cart count directly from cartItems
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  // Get categories and seasons
  const categories = categoriesData.categories;
  const seasons = categoriesData.seasons;
  const beekeepers = getAllBeekeepers();

  // Search result types
  type SearchSuggestion = {
    type: 'product' | 'beekeeper' | 'blog';
    id: number;
    title: string;
    slug: string;
    description?: string;
    image?: string;
    href: string;
    score: number; // Relevance score for sorting
    matchedField?: string; // Field that matched for highlighting
  };

  // Helper function to calculate relevance score
  const calculateScore = (text: string, query: string, fieldWeight: number = 1): number => {
    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    
    // Exact match gets highest score
    if (lowerText === lowerQuery) return 100 * fieldWeight;
    
    // Starts with query gets high score
    if (lowerText.startsWith(lowerQuery)) return 80 * fieldWeight;
    
    // Contains query gets medium score
    if (lowerText.includes(lowerQuery)) {
      // Closer to start = higher score
      const index = lowerText.indexOf(lowerQuery);
      return (70 - index * 0.1) * fieldWeight;
    }
    
    // Word boundary match
    const words = lowerText.split(/\s+/);
    const queryWords = lowerQuery.split(/\s+/);
    let wordMatchScore = 0;
    
    queryWords.forEach(qWord => {
      words.forEach(word => {
        if (word.startsWith(qWord)) wordMatchScore += 50;
        if (word.includes(qWord)) wordMatchScore += 30;
      });
    });
    
    return wordMatchScore * fieldWeight;
  };

  // Helper function to highlight matching text
  const highlightText = (text: string, query: string): string => {
    if (!query.trim()) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<strong>$1</strong>');
  };

  // Get search suggestions for products, beekeepers, and blog posts with relevance scoring
  const searchSuggestions = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      return [];
    }

    const query = searchQuery.toLowerCase().trim();
    const suggestions: SearchSuggestion[] = [];

    // Search products (med) with scoring
    const allProducts = getAllProducts();
    const productMatches = allProducts
      .map((product) => {
        let score = 0;
        let matchedField = '';
        
        // Name match gets highest weight
        const nameScore = calculateScore(product.name, query, 10);
        if (nameScore > score) {
          score = nameScore;
          matchedField = 'name';
        }
        
        // Category match
        const categoryScore = calculateScore(product.category, query, 5);
        if (categoryScore > score) {
          score = categoryScore;
          matchedField = 'category';
        }
        
        // Seller name match
        const sellerScore = calculateScore(product.seller.name, query, 4);
        if (sellerScore > score) {
          score = sellerScore;
          matchedField = 'seller';
        }
        
        // Description match (lower weight)
        const descScore = calculateScore(product.description || '', query, 2);
        if (descScore > score && !matchedField) {
          score = descScore;
          matchedField = 'description';
        }
        
        // Location match
        const locationScore = calculateScore(product.seller.location, query, 3);
        if (locationScore > score && !matchedField) {
          score = locationScore;
          matchedField = 'location';
        }
        
        return {
          type: 'product' as const,
          id: product.id,
          title: product.name,
          slug: product.slug,
          description: product.description,
          image: product.image,
          href: `${ROUTES.PRODUCTS}/${product.slug}`,
          score,
          matchedField,
        };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 4);

    suggestions.push(...productMatches);

    // Search beekeepers with scoring
    const beekeeperMatches = beekeepers
      .map((beekeeper) => {
        let score = 0;
        let matchedField = '';
        
        const nameScore = calculateScore(beekeeper.name, query, 10);
        if (nameScore > score) {
          score = nameScore;
          matchedField = 'name';
        }
        
        const locationScore = calculateScore(beekeeper.location, query, 6);
        if (locationScore > score) {
          score = locationScore;
          matchedField = 'location';
        }
        
        return {
          type: 'beekeeper' as const,
          id: beekeeper.id,
          title: beekeeper.name,
          slug: beekeeper.slug,
          description: `Pčelar iz ${beekeeper.location}`,
          image: beekeeper.avatar,
          href: `/pcelari/${beekeeper.slug}`,
          score,
          matchedField,
        };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    suggestions.push(...beekeeperMatches);

    // Search blog posts with scoring
    const blogMatches = (blogData as Array<{
      id: number;
      slug: string;
      title: string;
      excerpt: string;
      featuredImage?: string;
    }>)
      .map((post) => {
        let score = 0;
        let matchedField = '';
        
        const titleScore = calculateScore(post.title, query, 10);
        if (titleScore > score) {
          score = titleScore;
          matchedField = 'title';
        }
        
        const excerptScore = calculateScore(post.excerpt, query, 3);
        if (excerptScore > score && !matchedField) {
          score = excerptScore;
          matchedField = 'excerpt';
        }
        
        return {
          type: 'blog' as const,
          id: post.id,
          title: post.title,
          slug: post.slug,
          description: post.excerpt,
          image: post.featuredImage,
          href: `/blog/${post.slug}`,
          score,
          matchedField,
        };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    suggestions.push(...blogMatches);

    // Sort all suggestions by score and return top results
    return suggestions.sort((a, b) => b.score - a.score).slice(0, 8);
  }, [searchQuery, beekeepers]);

  // Handle search button click
  const handleSearchClick = () => {
    setIsSearchOpen(true);
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);
  };

  // Handle search input change with debounce
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setSelectedIndex(-1);
    setShowSuggestions(value.length >= 2);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || searchSuggestions.length === 0) {
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
        setSearchQuery('');
        setShowSuggestions(false);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => 
        prev < searchSuggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      handleSuggestionClick(searchSuggestions[selectedIndex]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };

  // Handle search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Always redirect to products page with search query to show all results
      router.push(`${ROUTES.PRODUCTS}?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
      setShowSuggestions(false);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    router.push(suggestion.href);
    setIsSearchOpen(false);
    setSearchQuery('');
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };

  // Update showSuggestions when searchQuery changes
  useEffect(() => {
    if (searchQuery.length >= 2 && searchSuggestions.length > 0) {
      setShowSuggestions(true);
    } else if (searchQuery.length < 2) {
      setShowSuggestions(false);
    }
  }, [searchQuery, searchSuggestions.length]);

  // Scroll selected suggestion into view
  useEffect(() => {
    if (selectedIndex >= 0 && searchRef.current) {
      const selectedElement = searchRef.current.querySelector(`[data-suggestion-index="${selectedIndex}"]`) as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [selectedIndex]);

  // Close search on Escape key or click outside
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
        setSearchQuery('');
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (isSearchOpen && searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
        setSearchQuery('');
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    if (isSearchOpen) {
      window.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      window.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSearchOpen]);

  const handleDropdownEnter = (label: string) => {
    // Clear any pending close timeout
    if (closeTimeout) {
      clearTimeout(closeTimeout);
      setCloseTimeout(null);
    }
    setOpenDropdown(label);
  };

  const handleDropdownLeave = () => {
    // Add delay before closing dropdown to allow user to move mouse to dropdown
    const timeout = setTimeout(() => {
      setOpenDropdown(null);
    }, 300); // 300ms delay - enough time to move mouse to dropdown
    setCloseTimeout(timeout);
  };

  const handleLinkClick = (href: string) => {
    // Close dropdown immediately when link is clicked
    if (closeTimeout) {
      clearTimeout(closeTimeout);
      setCloseTimeout(null);
    }
    setOpenDropdown(null);
    // Navigate to the link
    router.push(href);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (closeTimeout) {
        clearTimeout(closeTimeout);
      }
    };
  }, [closeTimeout]);

  // Listen for storage changes (e.g., when cart is updated in another tab)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'kosnica_cart') {
        // Force re-render by reloading cart from storage
        window.dispatchEvent(new Event('cartUpdated'));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('cartUpdated', handleStorageChange as EventListener);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cartUpdated', handleStorageChange as EventListener);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b backdrop-blur-md" style={{ 
      backgroundColor: 'rgba(255, 255, 255, 0.85)',
      borderColor: 'var(--border-light)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)'
    }}>
      <nav className="w-full">
        <div className="max-w-7xl mx-auto px-8 max-lg:px-6 max-md:px-4 flex items-center relative" style={{ paddingTop: '28px', paddingBottom: '28px' }}>
          {/* Logo */}
          <Link href={ROUTES.HOME} className="flex items-center group">
            <Image
              src="/Kosnica_logo.svg"
              alt="Košnica.ba Logo"
              width={300}
              height={90}
              className="h-20 w-auto object-contain"
              priority
            />
          </Link>

          {/* Desktop Navigation - centered */}
          <div className="flex items-center gap-6 max-md:hidden absolute left-1/2 transform -translate-x-1/2">
            {NAVIGATION_ITEMS.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              const hasDropdown = item.label === 'PROIZVODI' || item.label === 'O NAMA' || item.label === 'POMOĆ' || item.label === 'POSTANI PČELAR';
              
              return (
                <div
                  key={item.href}
                  className="relative"
                  onMouseEnter={() => hasDropdown && handleDropdownEnter(item.label)}
                  onMouseLeave={() => hasDropdown && handleDropdownLeave()}
                >
                  <Link
                    href={item.href}
                    className="text-sm font-medium transition-colors relative inline-flex items-center pb-3"
                    style={{ 
                      fontFamily: 'var(--font-inter)',
                      color: isActive ? 'var(--honey-gold)' : 'var(--dark-text)'
                    }}
                    onMouseEnter={(e) => !isActive && (e.currentTarget.style.color = 'var(--honey-gold)')}
                    onMouseLeave={(e) => !isActive && (e.currentTarget.style.color = 'var(--dark-text)')}
                  >
                    {item.label}
                    {hasDropdown && (
                      <svg
                        className="w-3 h-3 ml-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    )}
                    {isActive && !hasDropdown && (
                      <span 
                        className="absolute left-0 right-0 border-b-2"
                        style={{ 
                          borderColor: 'var(--honey-gold)',
                          bottom: '0'
                        }}
                      ></span>
                    )}
                  </Link>

                  {/* Products Dropdown */}
                  {item.label === 'PROIZVODI' && openDropdown === 'PROIZVODI' && (
                    <div
                      className="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50"
                      style={{ 
                        fontFamily: 'var(--font-inter)',
                        pointerEvents: 'auto'
                      }}
                      onMouseEnter={() => handleDropdownEnter(item.label)}
                      onMouseLeave={() => handleDropdownLeave()}
                    >
                      <a
                        href={ROUTES.PRODUCTS}
                        onClick={(e) => {
                          e.preventDefault();
                          handleLinkClick(ROUTES.PRODUCTS);
                        }}
                        className="block px-4 py-2 text-sm font-semibold hover:bg-gray-50 transition-colors cursor-pointer"
                        style={{ color: 'var(--dark-text)' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--honey-gold)';
                          e.currentTarget.style.color = 'white';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = 'var(--dark-text)';
                        }}
                      >
                        Svi proizvodi
                      </a>
                      <div className="border-t my-2" style={{ borderColor: 'var(--border-light)' }}></div>
                      <div className="px-2 py-1">
                        <div className="px-2 py-1 text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--body-text)' }}>
                          Kategorije
                        </div>
                        {categories.map((category) => {
                          const href = `${ROUTES.PRODUCTS}?category=${category.slug}`;
                          return (
                            <a
                              key={category.slug}
                              href={href}
                              onClick={(e) => {
                                e.preventDefault();
                                handleLinkClick(href);
                              }}
                              className="block px-4 py-2 text-sm hover:bg-gray-50 transition-colors cursor-pointer"
                              style={{ color: 'var(--dark-text)' }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'rgba(212, 167, 44, 0.1)';
                                e.currentTarget.style.color = 'var(--honey-gold)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                                e.currentTarget.style.color = 'var(--dark-text)';
                              }}
                            >
                              {category.name}
                            </a>
                          );
                        })}
                      </div>
                      <div className="border-t my-2" style={{ borderColor: 'var(--border-light)' }}></div>
                      <div className="px-2 py-1">
                        <div className="px-2 py-1 text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--body-text)' }}>
                          Po sezoni
                        </div>
                        {seasons.map((season) => {
                          const href = `${ROUTES.PRODUCTS}?season=${season.slug}`;
                          return (
                            <a
                              key={season.slug}
                              href={href}
                              onClick={(e) => {
                                e.preventDefault();
                                handleLinkClick(href);
                              }}
                              className="block px-4 py-2 text-sm hover:bg-gray-50 transition-colors cursor-pointer"
                              style={{ color: 'var(--dark-text)' }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'rgba(212, 167, 44, 0.1)';
                                e.currentTarget.style.color = 'var(--honey-gold)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                                e.currentTarget.style.color = 'var(--dark-text)';
                              }}
                            >
                              {season.name}
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* About Dropdown */}
                  {item.label === 'O NAMA' && openDropdown === 'O NAMA' && (
                    <div
                      className="absolute top-full left-0 mt-1 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50"
                      style={{ 
                        fontFamily: 'var(--font-inter)',
                        pointerEvents: 'auto'
                      }}
                      onMouseEnter={() => handleDropdownEnter(item.label)}
                      onMouseLeave={() => handleDropdownLeave()}
                    >
                      <Link
                        href={ROUTES.ABOUT}
                        className="block px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                        style={{ color: 'var(--dark-text)' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(212, 167, 44, 0.1)';
                          e.currentTarget.style.color = 'var(--honey-gold)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = 'var(--dark-text)';
                        }}
                      >
                        Naša priča
                      </Link>
                      <Link
                        href="/pcelari"
                        className="block px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                        style={{ color: 'var(--dark-text)' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(212, 167, 44, 0.1)';
                          e.currentTarget.style.color = 'var(--honey-gold)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = 'var(--dark-text)';
                        }}
                      >
                        Naši pčelari
                      </Link>
                      <Link
                        href="/blog"
                        className="block px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                        style={{ color: 'var(--dark-text)' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(212, 167, 44, 0.1)';
                          e.currentTarget.style.color = 'var(--honey-gold)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = 'var(--dark-text)';
                        }}
                      >
                        Blog
                      </Link>
                    </div>
                  )}

                  {/* Help Dropdown */}
                  {item.label === 'POMOĆ' && openDropdown === 'POMOĆ' && (
                    <div
                      className="absolute top-full left-0 mt-1 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50"
                      style={{ 
                        fontFamily: 'var(--font-inter)',
                        pointerEvents: 'auto'
                      }}
                      onMouseEnter={() => handleDropdownEnter(item.label)}
                      onMouseLeave={() => handleDropdownLeave()}
                    >
                      <Link
                        href={ROUTES.CONTACT}
                        className="block px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                        style={{ color: 'var(--dark-text)' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(212, 167, 44, 0.1)';
                          e.currentTarget.style.color = 'var(--honey-gold)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = 'var(--dark-text)';
                        }}
                      >
                        Kontaktirajte nas
                      </Link>
                      <Link
                        href="/dostava-i-povrati"
                        className="block px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                        style={{ color: 'var(--dark-text)' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(212, 167, 44, 0.1)';
                          e.currentTarget.style.color = 'var(--honey-gold)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = 'var(--dark-text)';
                        }}
                      >
                        Dostava i povrati
                      </Link>
                      <Link
                        href="/uslovi-koristenja"
                        className="block px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                        style={{ color: 'var(--dark-text)' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(212, 167, 44, 0.1)';
                          e.currentTarget.style.color = 'var(--honey-gold)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = 'var(--dark-text)';
                        }}
                      >
                        Uslovi korištenja
                      </Link>
                      <Link
                        href="/cesta-pitanja"
                        className="block px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                        style={{ color: 'var(--dark-text)' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(212, 167, 44, 0.1)';
                          e.currentTarget.style.color = 'var(--honey-gold)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = 'var(--dark-text)';
                        }}
                      >
                        Česta pitanja
                      </Link>
                      <Link
                        href="/politika-privatnosti"
                        className="block px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                        style={{ color: 'var(--dark-text)' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(212, 167, 44, 0.1)';
                          e.currentTarget.style.color = 'var(--honey-gold)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = 'var(--dark-text)';
                        }}
                      >
                        Politika privatnosti
                      </Link>
                    </div>
                  )}

                  {/* Become Beekeeper Dropdown */}
                  {item.label === 'POSTANI PČELAR' && openDropdown === 'POSTANI PČELAR' && (
                    <div
                      className="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50"
                      style={{ 
                        fontFamily: 'var(--font-inter)',
                        pointerEvents: 'auto'
                      }}
                      onMouseEnter={() => handleDropdownEnter(item.label)}
                      onMouseLeave={() => handleDropdownLeave()}
                    >
                      <Link
                        href={ROUTES.BECOME_BEEKEEPER}
                        className="block px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                        style={{ color: 'var(--dark-text)' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(212, 167, 44, 0.1)';
                          e.currentTarget.style.color = 'var(--honey-gold)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = 'var(--dark-text)';
                        }}
                      >
                        Prijava za pčelare
                      </Link>
                      <Link
                        href={`${ROUTES.BECOME_BEEKEEPER}#saradnja`}
                        className="block px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                        style={{ color: 'var(--dark-text)' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(212, 167, 44, 0.1)';
                          e.currentTarget.style.color = 'var(--honey-gold)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = 'var(--dark-text)';
                        }}
                      >
                        Informacije o saradnji
                      </Link>
                      <div className="border-t my-2" style={{ borderColor: 'var(--border-light)' }}></div>
                      <Link
                        href={`${ROUTES.BECOME_BEEKEEPER}#faq`}
                        className="block px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                        style={{ color: 'var(--dark-text)' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(212, 167, 44, 0.1)';
                          e.currentTarget.style.color = 'var(--honey-gold)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = 'var(--dark-text)';
                        }}
                      >
                        Često postavljana pitanja
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right side icons */}
          <div className="flex items-center gap-4 ml-auto">
            {/* Search */}
            <div className="relative" ref={searchRef}>
              <button
                onClick={handleSearchClick}
                className="p-2 transition-colors"
                style={{ color: 'var(--dark-text)' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--honey-gold)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--dark-text)'}
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

              {/* Search Bar */}
              {isSearchOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 max-md:w-[calc(100vw-2rem)] z-50">
                  <form onSubmit={handleSearchSubmit} className="relative">
                    <div className="bg-white rounded-lg shadow-xl border-2 overflow-hidden" style={{ borderColor: 'var(--honey-gold)' }}>
                      <div className="flex items-center relative">
                        <input
                          ref={searchInputRef}
                          type="text"
                          value={searchQuery}
                          onChange={handleSearchChange}
                          onKeyDown={handleKeyDown}
                          placeholder="Pretraži cijelu stranicu..."
                          className="flex-1 px-4 py-3 border-0 focus:outline-none"
                          style={{
                            color: 'var(--dark-text)',
                            fontFamily: 'var(--font-inter)',
                            fontSize: '0.9375rem',
                            paddingRight: searchQuery ? '5rem' : '3rem',
                          }}
                          onFocus={() => {
                            if (searchQuery.length >= 2) {
                              setShowSuggestions(true);
                            }
                          }}
                        />
                        {searchQuery && (
                          <button
                            type="button"
                            onClick={() => {
                              setSearchQuery('');
                              setShowSuggestions(false);
                              if (searchInputRef.current) {
                                searchInputRef.current.focus();
                              }
                            }}
                            className="absolute right-12 p-1.5 rounded-full transition-colors hover:bg-gray-100 z-10"
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
                          className="absolute right-0 p-3 transition-colors flex-shrink-0 z-10"
                          style={{ color: 'var(--honey-gold)' }}
                          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--honey-light)'}
                          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--honey-gold)'}
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
                      </div>

                      {/* Search Suggestions */}
                      {showSuggestions && (() => {
                        if (searchSuggestions.length === 0) {
                          return (
                            <div className="border-t px-4 py-6 text-center" style={{ borderColor: 'var(--border-light)' }}>
                              <p
                                style={{
                                  color: 'var(--body-text)',
                                  fontFamily: 'var(--font-inter)',
                                  fontSize: '0.875rem',
                                }}
                              >
                                Nema rezultata za "{searchQuery}"
                              </p>
                            </div>
                          );
                        }

                        // Group suggestions by type
                        const grouped = searchSuggestions.reduce((acc, suggestion) => {
                          if (!acc[suggestion.type]) {
                            acc[suggestion.type] = [];
                          }
                          acc[suggestion.type].push(suggestion);
                          return acc;
                        }, {} as Record<string, SearchSuggestion[]>);

                        const typeOrder: Array<'product' | 'beekeeper' | 'blog'> = ['product', 'beekeeper', 'blog'];
                        const typeLabels = {
                          product: 'Proizvodi',
                          beekeeper: 'Pčelari',
                          blog: 'Blog',
                        };

                        return (
                          <div className="border-t max-h-96 overflow-y-auto" style={{ borderColor: 'var(--border-light)' }}>
                            {typeOrder.map((type, typeIndex) => {
                              const typeSuggestions = grouped[type] || [];
                              if (typeSuggestions.length === 0) return null;

                              return (
                                <div key={type}>
                                  {/* Type Header */}
                                  <div
                                    className="px-4 py-2 sticky top-0"
                                    style={{
                                      backgroundColor: '#ffffff',
                                      borderBottom: '1px solid var(--border-light)',
                                      fontFamily: 'var(--font-inter)',
                                    }}
                                  >
                                    <div className="flex items-center justify-between">
                                      <span
                                        className="text-xs font-semibold uppercase tracking-wide"
                                        style={{
                                          color: 'var(--blue-primary)',
                                        }}
                                      >
                                        {typeLabels[type]}
                                      </span>
                                      <span
                                        className="text-xs"
                                        style={{
                                          color: 'var(--body-text)',
                                        }}
                                      >
                                        {typeSuggestions.length}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Type Suggestions */}
                                  {typeSuggestions.map((suggestion, index) => {
                                    const globalIndex = searchSuggestions.indexOf(suggestion);
                                    const isSelected = selectedIndex === globalIndex;

                                    const getIcon = () => {
                                      switch (suggestion.type) {
                                        case 'product':
                                          return (
                                            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                            </svg>
                                          );
                                        case 'beekeeper':
                                          return (
                                            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                          );
                                        case 'blog':
                                          return (
                                            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                                            </svg>
                                          );
                                      }
                                    };

                                    return (
                                      <Link
                                        key={`${suggestion.type}-${suggestion.id}`}
                                        href={suggestion.href}
                                        data-suggestion-index={globalIndex}
                                        onClick={(e) => {
                                          e.preventDefault();
                                          handleSuggestionClick(suggestion);
                                        }}
                                        className="w-full px-4 py-3 text-left transition-colors flex items-start gap-3 border-b last:border-b-0"
                                        style={{
                                          borderColor: 'var(--border-light)',
                                          color: 'var(--dark-text)',
                                          fontFamily: 'var(--font-inter)',
                                          backgroundColor: isSelected ? 'var(--blue-light)' : 'transparent',
                                        }}
                                        onMouseEnter={() => {
                                          setSelectedIndex(globalIndex);
                                        }}
                                      >
                                        {/* Thumbnail or Icon */}
                                        {suggestion.image ? (
                                          <div className="relative w-12 h-12 rounded overflow-hidden flex-shrink-0 border" style={{ borderColor: 'var(--border-light)' }}>
                                            <Image
                                              src={suggestion.image}
                                              alt={suggestion.title}
                                              fill
                                              className="object-cover"
                                            />
                                          </div>
                                        ) : (
                                          <div
                                            className="w-10 h-10 rounded flex items-center justify-center flex-shrink-0"
                                            style={{
                                              backgroundColor: 'var(--blue-light)',
                                              color: 'var(--blue-primary)',
                                            }}
                                          >
                                            {getIcon()}
                                          </div>
                                        )}

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                          <div
                                            className="font-semibold mb-1 line-clamp-1"
                                            style={{
                                              color: 'var(--dark-text)',
                                              fontFamily: 'var(--font-inter)',
                                              fontSize: '0.875rem',
                                            }}
                                            dangerouslySetInnerHTML={{
                                              __html: highlightText(suggestion.title, searchQuery).replace(
                                                /<strong>/g,
                                                '<strong style="color: var(--honey-gold); font-weight: 700;">'
                                              ),
                                            }}
                                          />
                                          {suggestion.description && (
                                            <div
                                              className="text-xs line-clamp-2"
                                              style={{
                                                color: 'var(--body-text)',
                                                fontFamily: 'var(--font-inter)',
                                              }}
                                              dangerouslySetInnerHTML={{
                                                __html: highlightText(suggestion.description.substring(0, 80), searchQuery).replace(
                                                  /<strong>/g,
                                                  '<strong style="color: var(--honey-gold); font-weight: 600;">'
                                                ),
                                              }}
                                            />
                                          )}
                                        </div>
                                      </Link>
                                    );
                                  })}
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>
                  </form>
                </div>
              )}
            </div>

            {/* User Account */}
            {isAuthenticated && user ? (
              <div
                className="relative"
                onMouseEnter={() => handleDropdownEnter('USER_MENU')}
                onMouseLeave={() => handleDropdownLeave()}
              >
                <Link
                  href={ROUTES.ACCOUNT}
                  className="flex items-center gap-2 p-2 transition-colors relative rounded-lg"
                  style={{ color: 'var(--dark-text)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(245, 200, 82, 0.1)';
                    e.currentTarget.style.color = 'var(--honey-gold)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--dark-text)';
                  }}
                  aria-label="Profil"
                >
                  {user?.avatar ? (
                    <div className="w-5 h-5 rounded-full overflow-hidden border border-current flex items-center justify-center flex-shrink-0">
                      <Image
                        src={user.avatar}
                        alt={`${user.firstName} ${user.lastName}`}
                        width={20}
                        height={20}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  ) : (
                    <svg
                      className="w-5 h-5 flex-shrink-0"
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
                  )}
                  <span className="text-sm font-medium max-md:hidden" style={{ fontFamily: 'var(--font-inter)' }}>
                    {user.firstName}
                  </span>
                  <svg
                    className="w-3 h-3 max-md:hidden"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </Link>

                {/* User Menu Dropdown */}
                {openDropdown === 'USER_MENU' && (
                  <div
                    className="absolute top-full right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50"
                    style={{ 
                      fontFamily: 'var(--font-inter)',
                      pointerEvents: 'auto'
                    }}
                    onMouseEnter={() => handleDropdownEnter('USER_MENU')}
                    onMouseLeave={() => handleDropdownLeave()}
                  >
                    <div className="px-4 py-2 border-b" style={{ borderColor: 'var(--border-light)' }}>
                      <p
                        className="text-sm font-semibold truncate"
                        style={{ color: 'var(--dark-text)' }}
                      >
                        {user.firstName} {user.lastName}
                      </p>
                      <p
                        className="text-xs truncate"
                        style={{ color: 'var(--body-text)', opacity: 0.7 }}
                      >
                        {user.email}
                      </p>
                    </div>
                    <Link
                      href={ROUTES.ACCOUNT}
                      onClick={() => setOpenDropdown(null)}
                      className="block px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                      style={{ color: 'var(--dark-text)' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(212, 167, 44, 0.1)';
                        e.currentTarget.style.color = 'var(--honey-gold)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = 'var(--dark-text)';
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Lični podaci
                      </div>
                    </Link>
                    <Link
                      href={`${ROUTES.ACCOUNT}?tab=orders`}
                      onClick={() => setOpenDropdown(null)}
                      className="block px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                      style={{ color: 'var(--dark-text)' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(212, 167, 44, 0.1)';
                        e.currentTarget.style.color = 'var(--honey-gold)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = 'var(--dark-text)';
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        Moje narudžbe
                      </div>
                    </Link>
                    <Link
                      href={`${ROUTES.ACCOUNT}?tab=address`}
                      onClick={() => setOpenDropdown(null)}
                      className="block px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                      style={{ color: 'var(--dark-text)' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(212, 167, 44, 0.1)';
                        e.currentTarget.style.color = 'var(--honey-gold)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = 'var(--dark-text)';
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Adresa
                      </div>
                    </Link>
                    <Link
                      href={`${ROUTES.ACCOUNT}?tab=payment`}
                      onClick={() => setOpenDropdown(null)}
                      className="block px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                      style={{ color: 'var(--dark-text)' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(212, 167, 44, 0.1)';
                        e.currentTarget.style.color = 'var(--honey-gold)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = 'var(--dark-text)';
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        Načini plaćanja
                      </div>
                    </Link>
                    <Link
                      href={`${ROUTES.ACCOUNT}?tab=notifications`}
                      onClick={() => setOpenDropdown(null)}
                      className="block px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                      style={{ color: 'var(--dark-text)' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(212, 167, 44, 0.1)';
                        e.currentTarget.style.color = 'var(--honey-gold)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = 'var(--dark-text)';
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        Notifikacije
                      </div>
                    </Link>
                    <Link
                      href={`${ROUTES.ACCOUNT}?tab=comments`}
                      onClick={() => setOpenDropdown(null)}
                      className="block px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                      style={{ 
                        color: 'var(--dark-text)',
                        fontFamily: 'var(--font-inter)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(212, 167, 44, 0.1)';
                        e.currentTarget.style.color = 'var(--honey-gold)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = 'var(--dark-text)';
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <svg 
                          className="w-4 h-4 flex-shrink-0" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
                          />
                        </svg>
                        <span className="truncate">Moji komentari</span>
                      </div>
                    </Link>
                    <Link
                      href={`${ROUTES.ACCOUNT}?tab=security`}
                      onClick={() => setOpenDropdown(null)}
                      className="block px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                      style={{ color: 'var(--dark-text)' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(212, 167, 44, 0.1)';
                        e.currentTarget.style.color = 'var(--honey-gold)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = 'var(--dark-text)';
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Sigurnost
                      </div>
                    </Link>
                    <div className="border-t my-1" style={{ borderColor: 'var(--border-light)' }}></div>
                    <button
                      onClick={() => {
                        logout();
                        setOpenDropdown(null);
                        router.push(ROUTES.HOME);
                      }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                      style={{ color: 'var(--dark-text)' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(220, 38, 38, 0.1)';
                        e.currentTarget.style.color = '#dc2626';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = 'var(--dark-text)';
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Odjavi se
                      </div>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href={ROUTES.LOGIN}
                className="p-2 transition-colors relative"
                style={{ color: 'var(--dark-text)' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--honey-gold)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--dark-text)'}
                aria-label="Nalog"
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
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </Link>
            )}

            {/* Favorites */}
            <Link
              href={ROUTES.FAVORITES}
              className="p-2 transition-colors relative"
              style={{ color: 'var(--dark-text)' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#dc2626'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--dark-text)'}
              aria-label="Omiljeno"
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
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              {favoriteCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ backgroundColor: '#dc2626' }}
                >
                  {favoriteCount > 9 ? '9+' : favoriteCount}
                </span>
              )}
            </Link>

            {/* Shopping Cart */}
            <Link
              href={ROUTES.CART}
              className="p-2 transition-colors relative"
              style={{ color: 'var(--dark-text)' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--honey-gold)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--dark-text)'}
              aria-label="Korpa"
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
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              {cartCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ backgroundColor: 'var(--honey-gold)' }}
                >
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="hidden max-md:block p-2 transition-colors"
              style={{ color: 'var(--dark-text)' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--honey-gold)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--dark-text)'}
              aria-label="Meni"
            >
              {isMobileMenuOpen ? (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="max-md:block hidden border-t" style={{ borderColor: 'var(--border-light)', backgroundColor: 'white' }}>
            <div className="max-w-7xl mx-auto px-4 py-4">
              <nav className="flex flex-col gap-1">
                {NAVIGATION_ITEMS.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                  const hasDropdown = item.label === 'PROIZVODI' || item.label === 'O NAMA' || item.label === 'POMOĆ' || item.label === 'POSTANI PČELAR';
                  const isMobileDropdownOpen = mobileDropdownOpen === item.label;

                  return (
                    <div key={item.href}>
                      <div className="flex items-center justify-between">
                        <Link
                          href={item.href}
                          onClick={() => {
                            if (!hasDropdown) {
                              setIsMobileMenuOpen(false);
                            }
                          }}
                          className="flex-1 py-3 px-2 text-base font-medium transition-colors"
                          style={{
                            fontFamily: 'var(--font-inter)',
                            color: isActive ? 'var(--honey-gold)' : 'var(--dark-text)',
                          }}
                        >
                          {item.label}
                        </Link>
                        {hasDropdown && (
                          <button
                            onClick={() => setMobileDropdownOpen(isMobileDropdownOpen ? null : item.label)}
                            className="p-2"
                            style={{ color: 'var(--dark-text)' }}
                          >
                            <svg
                              className={`w-5 h-5 transition-transform ${isMobileDropdownOpen ? 'rotate-180' : ''}`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </button>
                        )}
                      </div>

                      {/* Mobile Dropdown Content */}
                      {hasDropdown && isMobileDropdownOpen && (
                        <div className="pl-4 pb-2 space-y-1">
                          {item.label === 'PROIZVODI' && (
                            <>
                              <Link
                                href={ROUTES.PRODUCTS}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="block py-2 px-2 text-sm"
                                style={{ color: 'var(--body-text)', fontFamily: 'var(--font-inter)' }}
                              >
                                Svi proizvodi
                              </Link>
                              <div className="px-2 py-1 text-xs font-bold uppercase" style={{ color: 'var(--body-text)' }}>
                                Kategorije
                              </div>
                              {categories.map((category) => (
                                <Link
                                  key={category.slug}
                                  href={`${ROUTES.PRODUCTS}?category=${category.slug}`}
                                  onClick={() => setIsMobileMenuOpen(false)}
                                  className="block py-2 px-2 text-sm"
                                  style={{ color: 'var(--body-text)', fontFamily: 'var(--font-inter)' }}
                                >
                                  {category.name}
                                </Link>
                              ))}
                              <div className="px-2 py-1 text-xs font-bold uppercase mt-2" style={{ color: 'var(--body-text)' }}>
                                Po sezoni
                              </div>
                              {seasons.map((season) => (
                                <Link
                                  key={season.slug}
                                  href={`${ROUTES.PRODUCTS}?season=${season.slug}`}
                                  onClick={() => setIsMobileMenuOpen(false)}
                                  className="block py-2 px-2 text-sm"
                                  style={{ color: 'var(--body-text)', fontFamily: 'var(--font-inter)' }}
                                >
                                  {season.name}
                                </Link>
                              ))}
                            </>
                          )}
                          {item.label === 'O NAMA' && (
                            <>
                              <Link
                                href={ROUTES.ABOUT}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="block py-2 px-2 text-sm"
                                style={{ color: 'var(--body-text)', fontFamily: 'var(--font-inter)' }}
                              >
                                Naša priča
                              </Link>
                              <Link
                                href="/pcelari"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="block py-2 px-2 text-sm"
                                style={{ color: 'var(--body-text)', fontFamily: 'var(--font-inter)' }}
                              >
                                Pčelari
                              </Link>
                            </>
                          )}
                          {item.label === 'POMOĆ' && (
                            <>
                              <Link
                                href={ROUTES.CONTACT}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="block py-2 px-2 text-sm"
                                style={{ color: 'var(--body-text)', fontFamily: 'var(--font-inter)' }}
                              >
                                Kontakt
                              </Link>
                              <Link
                                href="/cesta-pitanja"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="block py-2 px-2 text-sm"
                                style={{ color: 'var(--body-text)', fontFamily: 'var(--font-inter)' }}
                              >
                                Česta pitanja
                              </Link>
                              <Link
                                href="/dostava-i-povrati"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="block py-2 px-2 text-sm"
                                style={{ color: 'var(--body-text)', fontFamily: 'var(--font-inter)' }}
                              >
                                Dostava i povrati
                              </Link>
                            </>
                          )}
                          {item.label === 'POSTANI PČELAR' && (
                            <>
                              <Link
                                href={ROUTES.BECOME_BEEKEEPER}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="block py-2 px-2 text-sm"
                                style={{ color: 'var(--body-text)', fontFamily: 'var(--font-inter)' }}
                              >
                                Prijava za pčelare
                              </Link>
                              <Link
                                href={`${ROUTES.BECOME_BEEKEEPER}#saradnja`}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="block py-2 px-2 text-sm"
                                style={{ color: 'var(--body-text)', fontFamily: 'var(--font-inter)' }}
                              >
                                Informacije o saradnji
                              </Link>
                              <Link
                                href={`${ROUTES.BECOME_BEEKEEPER}#faq`}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="block py-2 px-2 text-sm"
                                style={{ color: 'var(--body-text)', fontFamily: 'var(--font-inter)' }}
                              >
                                Često postavljana pitanja
                              </Link>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </nav>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

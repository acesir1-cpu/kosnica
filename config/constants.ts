/**
 * Application constants
 * Static values used throughout the application
 */

export const ROUTES = {
  HOME: '/',
  PRODUCTS: '/proizvodi',
  ABOUT: '/o-nama',
  BECOME_BEEKEEPER: '/postani-pcelar',
  CONTACT: '/kontakt',
  CART: '/korpa',
  FAVORITES: '/omiljeno',
  CHECKOUT: '/placanje',
  ACCOUNT: '/nalog',
  BLOG: '/blog',
  LOGIN: '/prijava',
  REGISTER: '/registracija',
  TERMS: '/uslovi-koristenja',
  PRIVACY: '/politika-privatnosti',
} as const;

export const NAVIGATION_ITEMS = [
  { label: 'POČETNA', href: ROUTES.HOME },
  { label: 'PROIZVODI', href: ROUTES.PRODUCTS },
  { label: 'O NAMA', href: ROUTES.ABOUT },
  { label: 'POMOĆ', href: ROUTES.CONTACT },
  { label: 'POSTANI PČELAR', href: ROUTES.BECOME_BEEKEEPER },
] as const;

export const API_ENDPOINTS = {
  PRODUCTS: '/api/products',
  CATEGORIES: '/api/categories',
  CONTACT: '/api/contact',
  ORDERS: '/api/orders',
  AUTH: '/api/auth',
} as const;

export const STORAGE_KEYS = {
  CART: 'kosnica_cart',
  FAVORITES: 'kosnica_favorites',
  USER_PREFERENCES: 'kosnica_user_preferences',
  AUTH_TOKEN: 'kosnica_auth_token',
} as const;

export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/,
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128,
} as const;

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 12,
  MAX_PAGE_SIZE: 100,
} as const;

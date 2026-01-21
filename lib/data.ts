/**
 * Utility funkcije za rad sa JSON podacima
 * Simulacija baze podataka
 */

import productsData from '@/data/products.json';
import categoriesData from '@/data/categories.json';
import galleryAssignmentsData from '@/data/gallery-assignments.json';

// Types
export type Product = {
  id: number;
  name: string;
  slug: string;
  seller: {
    id: number;
    name: string;
    location: string;
    avatar: string;
  };
  description: string;
  longDescription: string;
  price: number;
  currency: string;
  weight: string;
  availableWeights: string[];
  image: string;
  images: string[];
  category: string;
  categorySlug: string;
  additives: string[];
  season: string;
  seasonSlug: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  stock: number;
  badge: string | null;
  badgeText: string | null;
  keyCharacteristics: {
    vrstaMeda: string;
    dostupnaPakovanja: string;
    bojaITekstura: string;
    ukus: string;
  };
};

export type Category = {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string;
  type: string;
};

export type Additive = {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string;
  type: string;
};

export type Season = {
  id: number;
  name: string;
  slug: string;
  description: string;
  period: string;
  type: string;
};

export type FilterOptions = {
  category?: string;
  additives?: string[];
  season?: string;
  weight?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  locations?: string[];
  badges?: string[];
  onDiscount?: boolean;
};

// Data getters
export function getAllProducts(): Product[] {
  return productsData.products;
}

export function getProductBySlug(slug: string): Product | undefined {
  return productsData.products.find((product) => product.slug === slug);
}

export function getProductById(id: number): Product | undefined {
  return productsData.products.find((product) => product.id === id);
}

export function getProductsByCategory(categorySlug: string): Product[] {
  return productsData.products.filter((product) => product.categorySlug === categorySlug);
}

export function getProductsByAdditive(additiveSlug: string): Product[] {
  return productsData.products.filter((product) => 
    product.additives.includes(additiveSlug)
  );
}

export function getProductsBySeason(seasonSlug: string): Product[] {
  return productsData.products.filter((product) => product.seasonSlug === seasonSlug);
}

export function getProductsByWeight(weight: string): Product[] {
  return productsData.products.filter((product) => 
    product.availableWeights.includes(weight)
  );
}

export function getAllCategories(): Category[] {
  return categoriesData.categories;
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return categoriesData.categories.find((category) => category.slug === slug);
}

export function getAllAdditives(): Additive[] {
  return categoriesData.additives;
}

export function getAdditiveBySlug(slug: string): Additive | undefined {
  return categoriesData.additives.find((additive) => additive.slug === slug);
}

export function getAllSeasons(): Season[] {
  return categoriesData.seasons;
}

export function getSeasonBySlug(slug: string): Season | undefined {
  return categoriesData.seasons.find((season) => season.slug === slug);
}

// Helper function to create slug from seller name
export function createSellerSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/ć/g, 'c')
    .replace(/š/g, 's')
    .replace(/đ/g, 'd')
    .replace(/č/g, 'c')
    .replace(/ž/g, 'z');
}

// Get all unique sellers/beekeepers
export type Beekeeper = {
  id: number;
  name: string;
  location: string;
  avatar: string;
  slug: string;
  story?: string; // Extended story/description
  galleryImages?: string[]; // Images of where they work
  email?: string; // Contact email
  phone?: string; // Contact phone
};

// Helper function to get beekeeper story
function getBeekeeperStory(name: string, location: string, description: string): string {
  return `${description}\n\nNaša priča počinje sa ljubavlju prema prirodi i pčelama. Svaki dan provodimo u blizini naših košnica, pažljivo prateći rad pčela i osiguravajući da svaki proizvod zadrži svoju prirodnu čistoću i autentičnost. Naša lokacija u ${location} pruža idealne uslove za proizvodnju visokokvalitetnog meda, obogaćenog raznolikošću lokalne flore.\n\nVerujemo u tradicionalne metode pčelarenja koje su se prenosile kroz generacije, ali i u kontinuirano učenje i poboljšanje. Svaki med koji proizvodimo je rezultat pažljivog rada, strpljenja i posvećenosti kvalitetu.`;
}

// Helper function to get gallery images for beekeeper
// IMPORTANT: These should NOT be product images - they should be separate gallery images
// showing where the beekeeper works (apiaries, hives, etc.)
// Product images are ONLY used for product listings and product detail pages
// Returns 3 gallery images per beekeeper following pattern: {slug}-gallery-1.jpg, {slug}-gallery-2.jpg, {slug}-gallery-3.jpg
function getBeekeeperGalleryImages(beekeeperId: number): string[] {
  // Get beekeeper name to create slug
  const beekeeperProducts = productsData.products.filter(
    (product) => product.seller.id === beekeeperId
  );
  
  if (beekeeperProducts.length === 0) {
    return [];
  }
  
  const beekeeperName = beekeeperProducts[0].seller.name;
  const beekeeperSlug = createSellerSlug(beekeeperName);
  
  // Get all product images for this beekeeper to EXCLUDE them from gallery
  const productImages = new Set(
    beekeeperProducts.flatMap(p => [p.image, ...p.images])
  );
  
  const galleryImages: string[] = [];
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.avif'];
  
  // FIRST: Get assigned image from gallery-assignments.json (this is the primary/first image)
  const assignedImage = (galleryAssignmentsData.assignments as Record<string, string>)[beekeeperSlug];
  if (assignedImage && !productImages.has(assignedImage)) {
    galleryImages.push(assignedImage);
  }
  
  // SECOND: Get image from gallery2 folder (2nd slot)
  // Use numbered pattern: gallery2 (1).jpg, gallery2 (2).jpg, etc.
  // Use beekeeperId to determine which gallery2 image to use (cycle through 1-12)
  let gallery2Image: string | null = null;
  const gallery2Number = ((beekeeperId - 1) % 12) + 1;
  
  // Try jpg first, then other extensions
  for (const ext of imageExtensions) {
    const gallery2Path = `/images/gallery2/gallery2 (${gallery2Number})${ext}`;
    if (!productImages.has(gallery2Path)) {
      gallery2Image = gallery2Path;
      break; // Found valid extension, use it
    }
  }
  
  if (gallery2Image && !galleryImages.includes(gallery2Image)) {
    galleryImages.push(gallery2Image);
  } else if (galleryImages.length === 1) {
    // Fallback: If gallery2 image doesn't exist, try gallery-2.jpg from gallery folder
    for (const ext of imageExtensions) {
      const imagePath = `/images/gallery/${beekeeperSlug}-gallery-2${ext}`;
      if (!productImages.has(imagePath) && !galleryImages.includes(imagePath)) {
        galleryImages.push(imagePath);
        break;
      }
    }
  }
  
  // THIRD: Get image from gallery3 folder (3rd slot)
  // Use numbered pattern: gallery3 (1).jpg, gallery3 (2).jpg, etc.
  // Use beekeeperId to determine which gallery3 image to use (cycle through 1-8)
  let gallery3Image: string | null = null;
  const gallery3Number = ((beekeeperId - 1) % 8) + 1;
  
  // Try jpg first, then other extensions
  for (const ext of imageExtensions) {
    const gallery3Path = `/images/gallery3/gallery3 (${gallery3Number})${ext}`;
    if (!productImages.has(gallery3Path)) {
      gallery3Image = gallery3Path;
      break; // Found valid extension, use it
    }
  }
  
  if (gallery3Image && !galleryImages.includes(gallery3Image)) {
    galleryImages.push(gallery3Image);
  } else if (galleryImages.length === 2) {
    // Fallback: If gallery3 image doesn't exist, try gallery-3.jpg from gallery folder
    for (const ext of imageExtensions) {
      const imagePath = `/images/gallery/${beekeeperSlug}-gallery-3${ext}`;
      if (!productImages.has(imagePath) && !galleryImages.includes(imagePath)) {
        galleryImages.push(imagePath);
        break;
      }
    }
  }
  
  // FALLBACK: If we don't have assigned image, try to get all 3 images using standard naming convention
  if (galleryImages.length === 0) {
    for (let i = 1; i <= 3; i++) {
      for (const ext of imageExtensions) {
        const imagePath = `/images/gallery/${beekeeperSlug}-gallery-${i}${ext}`;
        if (!productImages.has(imagePath) && !galleryImages.includes(imagePath)) {
          galleryImages.push(imagePath);
          break;
        }
      }
    }
  }
  
  // If we still don't have 3 images and we have assigned image, try to use gallery-1.jpg as additional image
  if (galleryImages.length > 0 && galleryImages.length < 3) {
    for (const ext of imageExtensions) {
      const imagePath = `/images/gallery/${beekeeperSlug}-gallery-1${ext}`;
      if (!productImages.has(imagePath) && !galleryImages.includes(imagePath)) {
        galleryImages.push(imagePath);
        break;
      }
    }
  }
  
  // Return up to 3 images
  return galleryImages.slice(0, 3);
}

// Helper function to generate contact email from beekeeper name
function getBeekeeperEmail(name: string): string {
  const slug = createSellerSlug(name);
  return `${slug}@kosnica.ba`;
}

// Helper function to generate contact phone (mock data)
function getBeekeeperPhone(beekeeperId: number): string {
  // Generate a phone number based on beekeeper ID
  // Format: +387 61 XXX XXX
  const lastDigits = String(beekeeperId * 123).padStart(6, '0').slice(-6);
  const formatted = `${lastDigits.slice(0, 3)} ${lastDigits.slice(3)}`;
  return `+387 61 ${formatted}`;
}

export function getAllBeekeepers(): Beekeeper[] {
  // Use name as key to avoid duplicates (same beekeeper can have different seller IDs)
  const beekeepersMap = new Map<string, Beekeeper>();
  
  productsData.products.forEach((product) => {
    const beekeeperName = product.seller.name;
    // Use name as key to ensure unique beekeepers
    if (!beekeepersMap.has(beekeeperName)) {
      // Find first product from this beekeeper to get their info
      const firstProduct = productsData.products.find(p => p.seller.name === beekeeperName);
      if (firstProduct) {
        const description = getBeekeeperDescription(beekeeperName);
        const slug = createSellerSlug(beekeeperName);
        // Get ID from first product, but we'll use name for uniqueness
        beekeepersMap.set(beekeeperName, {
          id: firstProduct.seller.id,
          name: beekeeperName,
          location: firstProduct.seller.location,
          avatar: firstProduct.seller.avatar,
          slug: slug,
          story: getBeekeeperStory(beekeeperName, firstProduct.seller.location, description),
          galleryImages: getBeekeeperGalleryImages(firstProduct.seller.id),
          email: getBeekeeperEmail(beekeeperName),
          phone: getBeekeeperPhone(firstProduct.seller.id),
        });
      }
    }
  });
  
  return Array.from(beekeepersMap.values()).sort((a, b) => 
    a.name.localeCompare(b.name)
  );
}

// Helper function for beekeeper description (moved from page component)
function getBeekeeperDescription(sellerName: string): string {
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
}

// Get beekeeper by slug
export function getBeekeeperBySlug(slug: string): Beekeeper | undefined {
  const allBeekeepers = getAllBeekeepers();
  return allBeekeepers.find((beekeeper) => beekeeper.slug === slug);
}

// Get beekeeper by name
export function getBeekeeperByName(name: string): Beekeeper | undefined {
  const allBeekeepers = getAllBeekeepers();
  return allBeekeepers.find((beekeeper) => beekeeper.name === name);
}

// Get products by beekeeper/seller ID
export function getProductsByBeekeeper(beekeeperId: number): Product[] {
  // Filter all products where seller ID matches beekeeper ID
  const filtered = productsData.products.filter((product) => product.seller.id === beekeeperId);
  return filtered;
}

// Get products by beekeeper name (handles cases where same beekeeper has different IDs)
export function getProductsByBeekeeperName(beekeeperName: string): Product[] {
  // Filter all products where seller name matches beekeeper name
  // This ensures we get ALL products from a beekeeper, even if they have different seller IDs
  const filtered = productsData.products.filter((product) => product.seller.name === beekeeperName);
  return filtered;
}

// Get products by beekeeper slug
export function getProductsByBeekeeperSlug(slug: string): Product[] {
  const beekeeper = getBeekeeperBySlug(slug);
  if (!beekeeper) {
    return [];
  }
  // IMPORTANT: Filter by name, not ID, because same beekeeper can have different seller IDs
  // This ensures we get ALL products from this beekeeper
  const products = getProductsByBeekeeperName(beekeeper.name);
  return products;
}

// Get all unique locations
export function getAllLocations(): string[] {
  const locationsSet = new Set<string>();
  productsData.products.forEach((product) => {
    locationsSet.add(product.seller.location);
  });
  return Array.from(locationsSet).sort();
}

// Get all unique badges
export function getAllBadges(): Array<{ value: string; label: string }> {
  const badgesSet = new Set<string>();
  productsData.products.forEach((product) => {
    if (product.badge) {
      badgesSet.add(product.badge);
    }
  });
  
  const badgeLabels: Record<string, string> = {
    'najprodavanije': 'Najprodavanije',
    'novo-u-ponudi': 'Novo u ponudi',
  };
  
  return Array.from(badgesSet)
    .map((badge) => ({
      value: badge,
      label: badgeLabels[badge] || badge,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

// Filter products
export function filterProducts(filters: FilterOptions): Product[] {
  let filtered = [...productsData.products];

  if (filters.category) {
    filtered = filtered.filter((product) => product.categorySlug === filters.category);
  }

  if (filters.additives && filters.additives.length > 0) {
    filtered = filtered.filter((product) =>
      filters.additives!.some((additive) => product.additives.includes(additive))
    );
  }

  if (filters.season) {
    filtered = filtered.filter((product) => product.seasonSlug === filters.season);
  }

  if (filters.weight) {
    filtered = filtered.filter((product) =>
      product.availableWeights.includes(filters.weight!)
    );
  }

  if (filters.minPrice !== undefined) {
    filtered = filtered.filter((product) => product.price >= filters.minPrice!);
  }

  if (filters.maxPrice !== undefined) {
    filtered = filtered.filter((product) => product.price <= filters.maxPrice!);
  }

  if (filters.minRating !== undefined) {
    filtered = filtered.filter((product) => product.rating >= filters.minRating!);
  }

  if (filters.locations && filters.locations.length > 0) {
    filtered = filtered.filter((product) => filters.locations!.includes(product.seller.location));
  }

  if (filters.badges && filters.badges.length > 0) {
    filtered = filtered.filter((product) =>
      product.badge && filters.badges!.includes(product.badge)
    );
  }

  if (filters.onDiscount !== undefined) {
    filtered = filtered.filter((product) => isFeaturedOffer(product) === filters.onDiscount);
  }

  return filtered;
}

// Check if product is in featured offers (same logic as FeaturedBeekeeper)
export function isFeaturedOffer(product: Product): boolean {
  if (!product || !product.inStock) return false;
  
  // First priority: "sumski-med" from Tuzla
  if (product.categorySlug === 'sumski-med' && product.seller.location === 'Tuzla') {
    return true;
  }
  
  // Second priority: any "sumski-med" product
  if (product.categorySlug === 'sumski-med') {
    return true;
  }
  
  // Third priority: product from Tuzla with good rating
  if (product.seller.location === 'Tuzla' && product.rating >= 4.0) {
    return true;
  }
  
  // Fallback: any product with good rating
  if (product.rating >= 4.5) {
    return true;
  }
  
  return false;
}

// Calculate discount price (15% off) for featured offers
export function getDiscountedPrice(originalPrice: number, isFeatured: boolean): number {
  return isFeatured ? Math.round(originalPrice * 0.85) : originalPrice;
}

// Calculate price based on weight
export function calculatePriceByWeight(product: Product, selectedWeight: string): number {
  if (!selectedWeight || selectedWeight === product.weight) {
    return product.price;
  }

  // Extract numeric values from weight strings (e.g., "250g" -> 250)
  const parseWeight = (weight: string): number => {
    return parseInt(weight.replace('g', ''), 10);
  };

  const baseWeight = parseWeight(product.weight);
  const targetWeight = parseWeight(selectedWeight);

  if (baseWeight === 0 || targetWeight === 0) {
    return product.price;
  }

  // Calculate proportional price
  const pricePerGram = product.price / baseWeight;
  return Math.round(pricePerGram * targetWeight);
}

// Search
export function searchProducts(query: string): Product[] {
  const lowerQuery = query.toLowerCase();
  return productsData.products.filter(
    (product) =>
      product.name.toLowerCase().includes(lowerQuery) ||
      product.description.toLowerCase().includes(lowerQuery) ||
      product.longDescription.toLowerCase().includes(lowerQuery) ||
      product.seller.name.toLowerCase().includes(lowerQuery) ||
      product.seller.location.toLowerCase().includes(lowerQuery)
  );
}

// Calculate delivery cost based on order total
// Returns 0 if order total > 50 KM (free delivery), otherwise 5 KM
export function calculateDeliveryCost(orderTotal: number): number {
  // Free delivery for orders over 50 KM
  if (orderTotal > 50) {
    return 0;
  }
  
  // Standard delivery cost for orders 50 KM or less
  return 5;
}

// Simple distance estimation helper (can be extended with geocoding API)
// This estimates distance from a central location (Sarajevo) to the delivery city
// In production, use a geocoding service to calculate real distance based on exact addresses
export function estimateDeliveryDistance(city: string): number | undefined {
  if (!city) return undefined;
  
  const cityLower = city.toLowerCase().trim();
  
  // Approximate distances from Sarajevo (central location) in km
  // These are rough estimates - in production, use geocoding API for accurate distances
  const cityDistances: Record<string, number> = {
    'sarajevo': 0,
    'ilidža': 10,
    'vogošća': 15,
    'visoko': 30,
    'zenica': 70,
    'tuzla': 120,
    'banja luka': 200,
    'mostar': 130,
    'bihać': 250,
    'prijedor': 180,
    'doboj': 100,
    'živinice': 110,
    'brčko': 140,
    'bijeljina': 200,
    'trebinje': 150,
    'konjic': 50,
    'foča': 70,
    'goražde': 60,
    'srebrenica': 120,
    'zvornik': 100,
  };
  
  // Try exact match first
  if (cityDistances[cityLower]) {
    return cityDistances[cityLower];
  }
  
  // Try partial match for cities with additional text
  for (const [key, distance] of Object.entries(cityDistances)) {
    if (cityLower.includes(key) || key.includes(cityLower)) {
      return distance;
    }
  }
  
  // If city not found, return undefined to use default cost
  // In production, you would geocode the city here
  return undefined;
}

// Sort products
export function sortProducts(
  products: Product[],
  sortBy: 'price-asc' | 'price-desc' | 'rating-desc' | 'reviews-desc' | 'name-asc' | 'seller-asc' | 'location-asc'
): Product[] {
  const sorted = [...products];

  switch (sortBy) {
    case 'price-asc':
      return sorted.sort((a, b) => a.price - b.price);
    case 'price-desc':
      return sorted.sort((a, b) => b.price - a.price);
    case 'rating-desc':
      return sorted.sort((a, b) => b.rating - a.rating);
    case 'reviews-desc':
      return sorted.sort((a, b) => b.reviews - a.reviews);
    case 'name-asc':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case 'seller-asc':
      return sorted.sort((a, b) => a.seller.name.localeCompare(b.seller.name));
    case 'location-asc':
      return sorted.sort((a, b) => a.seller.location.localeCompare(b.seller.location));
    default:
      return sorted;
  }
}

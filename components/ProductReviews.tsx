'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getProductById } from '@/lib/data';
import { useAuth } from '@/hooks/useAuth';
import { useToastContext } from '@/components/ToastProvider';
import { ROUTES } from '@/config/constants';

type Review = {
  id: number;
  author: string;
  authorId?: number; // User ID of the comment author
  avatar: string;
  timeAgo: string;
  comment: string;
  likes: number;
  dislikes: number;
  hasLiked?: boolean;
  hasDisliked?: boolean;
  replies?: Reply[];
  createdAt?: string; // ISO timestamp for sorting and editing
};

type Reply = {
  id: number;
  author: string;
  authorId?: number; // User ID of the reply author
  avatar: string;
  timeAgo: string;
  comment: string;
  likes: number;
  dislikes: number;
  hasLiked?: boolean;
  hasDisliked?: boolean;
  createdAt?: string;
};

type ProductReviewsProps = {
  productId: number;
};

// Helper function to format time ago
const formatTimeAgo = (daysAgo: number): string => {
  if (daysAgo === 0) return 'sada';
  if (daysAgo === 1) return 'prije 1 dan';
  if (daysAgo < 7) return `prije ${daysAgo} dana`;
  if (daysAgo < 30) {
    const weeks = Math.floor(daysAgo / 7);
    return weeks === 1 ? 'prije 1 tjedan' : `prije ${weeks} tjedna`;
  }
  const months = Math.floor(daysAgo / 30);
  return months === 1 ? 'prije 1 mjesec' : `prije ${months} mjeseca`;
};

// Helper function to create timestamp
const createTimestamp = (daysAgo: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
};

// Mock reviews database - different reviews for different products
const getProductReviews = (productId: number, reviewCount: number): Review[] => {
  // Base reviews for specific products
  const baseReviews: Record<number, Review[]> = {
    1: [
      {
        id: 1,
        author: 'Mak Dizdar',
        avatar: '/images/reviewers/recenzija (1).jpg',
        timeAgo: 'prije 1hr',
        comment: 'Med je stigao u Tuzlu za manje od 24 sata. Bio sam malo skeptičan oko slanja staklene tegle poštom, ali pakovanje je bilo vrhunsko i veoma sigurno. Sve pohvale za Omera i ekipu!',
        likes: 12,
        dislikes: 0,
        hasLiked: false,
        hasDisliked: false,
        createdAt: createTimestamp(0),
      },
      {
        id: 2,
        author: 'Safet Hadžić',
        avatar: '/images/reviewers/recenzija (2).jpg',
        timeAgo: 'prije 3 dana',
        comment: 'Odličan kvalitet! Med je prirodan i ukusan. Preporučujem svima.',
        likes: 8,
        dislikes: 0,
        hasLiked: false,
        hasDisliked: false,
        createdAt: createTimestamp(3),
      },
    ],
    2: [
      {
        id: 1,
        author: 'Amir Kovačević',
        avatar: '/images/reviewers/recenzija (3).jpg',
        timeAgo: 'prije 2 dana',
        comment: 'Fantastičan med sa lješnacima! Kombinacija je savršena, a pakovanje je bilo odlično.',
        likes: 15,
        dislikes: 1,
        hasLiked: false,
        hasDisliked: false,
        createdAt: createTimestamp(2),
      },
    ],
    3: [
      {
        id: 1,
        author: 'Luka Smajlović',
        avatar: '/images/reviewers/recenzija (4).jpg',
        timeAgo: 'prije 5 dana',
        comment: 'Planinski med je izuzetan! Prirodan okus i kvalitet. Definitivno ću naručiti ponovo.',
        likes: 20,
        dislikes: 0,
        hasLiked: false,
        hasDisliked: false,
        createdAt: createTimestamp(5),
      },
      {
        id: 2,
        author: 'Dino Mulić',
        avatar: '/images/reviewers/recenzija (5).jpg',
        timeAgo: 'prije 1 tjedan',
        comment: 'Odličan proizvod, brza dostava. Sve pohvale!',
        likes: 10,
        dislikes: 0,
        hasLiked: false,
        hasDisliked: false,
        createdAt: createTimestamp(7),
      },
      {
        id: 3,
        author: 'Emin Suljić',
        avatar: '/images/reviewers/recenzija (6).jpg',
        timeAgo: 'prije 2 tjedna',
        comment: 'Med je stigao u savršenom stanju. Kvalitet je vrhunski, a cijena je pristupačna.',
        likes: 18,
        dislikes: 0,
        hasLiked: false,
        hasDisliked: false,
        createdAt: createTimestamp(14),
      },
    ],
  };

  // Get base reviews for this product
  const productReviews = baseReviews[productId] || [];
  
  // Additional reviews for products with many reviews
  const additionalReviews: Review[] = [
    {
      id: 100,
      author: 'Hasan Dervišević',
      avatar: '/images/reviewers/recenzija (7).jpg',
      timeAgo: 'prije 3 dana',
      comment: 'Najbolji med koji sam ikada probao! Preporučujem svima koji cijene kvalitet.',
      likes: 25,
      dislikes: 0,
      hasLiked: false,
      hasDisliked: false,
      createdAt: createTimestamp(3),
    },
    {
      id: 101,
      author: 'Marko Begović',
      avatar: '/images/reviewers/recenzija (8).jpg',
      timeAgo: 'prije 1 tjedan',
      comment: 'Odličan proizvod, brza dostava i sigurno pakovanje. Sve pohvale!',
      likes: 14,
      dislikes: 0,
      hasLiked: false,
      hasDisliked: false,
      createdAt: createTimestamp(7),
    },
    {
      id: 102,
      author: 'Nedim Hadžić',
      avatar: '/images/reviewers/recenzija (9).jpg',
      timeAgo: 'prije 2 tjedna',
      comment: 'Kvalitet je izuzetan, a cijena je pristupačna. Definitivno ću naručiti ponovo.',
      likes: 16,
      dislikes: 1,
      hasLiked: false,
      hasDisliked: false,
      createdAt: createTimestamp(14),
    },
    {
      id: 103,
      author: 'Adnan Karić',
      avatar: '/images/reviewers/recenzija (10).jpg',
      timeAgo: 'prije 3 tjedna',
      comment: 'Med je fantastičan! Prirodan okus i kvalitet. Brza dostava i sigurno pakovanje.',
      likes: 22,
      dislikes: 0,
      hasLiked: false,
      hasDisliked: false,
      createdAt: createTimestamp(21),
    },
    {
      id: 104,
      author: 'Benjamin Jusić',
      avatar: '/images/reviewers/recenzija (11).jpg',
      timeAgo: 'prije 1 mjesec',
      comment: 'Odličan proizvod! Kvalitet je vrhunski, a cijena je pristupačna. Preporučujem svima.',
      likes: 19,
      dislikes: 0,
      hasLiked: false,
      hasDisliked: false,
      createdAt: createTimestamp(30),
    },
    {
      id: 105,
      author: 'Mirza Čaušević',
      avatar: '/images/reviewers/recenzija (12).jpg',
      timeAgo: 'prije 5 dana',
      comment: 'Fantastičan med! Prirodan okus i izuzetan kvalitet. Brza dostava i sigurno pakovanje.',
      likes: 21,
      dislikes: 0,
      hasLiked: false,
      hasDisliked: false,
      createdAt: createTimestamp(5),
    },
    {
      id: 106,
      author: 'Alen Kovačević',
      avatar: '/images/reviewers/recenzija (13).jpg',
      timeAgo: 'prije 1 tjedan',
      comment: 'Odličan proizvod! Med je prirodan i ukusan. Preporučujem svima.',
      likes: 17,
      dislikes: 0,
      hasLiked: false,
      hasDisliked: false,
      createdAt: createTimestamp(7),
    },
    {
      id: 107,
      author: 'Faruk Avdić',
      avatar: '/images/reviewers/recenzija (14).jpg',
      timeAgo: 'prije 2 tjedna',
      comment: 'Kvalitet je vrhunski! Med je stigao u savršenom stanju. Sve pohvale!',
      likes: 23,
      dislikes: 0,
      hasLiked: false,
      hasDisliked: false,
      createdAt: createTimestamp(14),
    },
    {
      id: 108,
      author: 'Emin Suljić',
      avatar: '/images/reviewers/recenzija (15).jpg',
      timeAgo: 'prije 3 tjedna',
      comment: 'Najbolji med koji sam ikada probao! Definitivno ću naručiti ponovo.',
      likes: 20,
      dislikes: 1,
      hasLiked: false,
      hasDisliked: false,
      createdAt: createTimestamp(21),
    },
    {
      id: 109,
      author: 'Tarik Begović',
      avatar: '/images/reviewers/recenzija (16).jpg',
      timeAgo: 'prije 1 mjesec',
      comment: 'Odličan proizvod, brza dostava i sigurno pakovanje. Kvalitet je izuzetan!',
      likes: 18,
      dislikes: 0,
      hasLiked: false,
      hasDisliked: false,
      createdAt: createTimestamp(30),
    },
    {
      id: 110,
      author: 'Dženan Kovačević',
      avatar: '/images/reviewers/recenzija (17).jpg',
      timeAgo: 'prije 1 mjesec',
      comment: 'Med je fantastičan! Prirodan okus i kvalitet. Preporučujem svima koji cijene kvalitet.',
      likes: 24,
      dislikes: 0,
      hasLiked: false,
      hasDisliked: false,
      createdAt: createTimestamp(30),
    },
  ];

  // If product has many reviews (reviews > 30), show 5+ comments
  if (reviewCount > 30) {
    return [...productReviews, ...additionalReviews.slice(0, 3)];
  }

  // If product has many reviews (reviews > 20), show 3-4 comments
  if (reviewCount > 20) {
    return [...productReviews, ...additionalReviews.slice(0, 2)];
  }

  // If product has moderate reviews (10-20), show 2-3 comments
  if (reviewCount >= 10 && reviewCount <= 20) {
      return productReviews.length >= 2 ? productReviews : [
        ...productReviews,
        {
          id: productReviews.length + 1,
          author: 'Kenan Smajlović',
          avatar: '/images/reviewers/recenzija (12).jpg',
          timeAgo: 'prije 4 dana',
          comment: 'Odličan med, preporučujem!',
          likes: 9,
          dislikes: 0,
          hasLiked: false,
          hasDisliked: false,
          createdAt: createTimestamp(4),
        },
      ];
  }

  // If product has few reviews (5-9), show 1 comment
  if (reviewCount >= 5 && reviewCount < 10) {
    return productReviews.slice(0, 1);
  }

  // If product has very few reviews (< 5), show 0 comments
  return [];
};

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const [comment, setComment] = useState('');
  const { isAuthenticated, isLoading, user } = useAuth();
  const { showToast } = useToastContext();
  const product = getProductById(productId);
  const searchParams = useSearchParams();
  
  // States for replies, editing, etc.
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');
  const [editingReplyId, setEditingReplyId] = useState<{ reviewId: number; replyId: number } | null>(null);
  const [editingReplyText, setEditingReplyText] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const [showDeleteReplyConfirm, setShowDeleteReplyConfirm] = useState<{ reviewId: number; replyId: number } | null>(null);
  const [showOptionsMenu, setShowOptionsMenu] = useState<number | null>(null);
  const [showReplyOptionsMenu, setShowReplyOptionsMenu] = useState<{ reviewId: number; replyId: number } | null>(null);
  
  // Get initial reviews based on product ID and review count
  const initialReviews = useMemo(() => {
    if (!product) return [];
    return getProductReviews(productId, product.reviews);
  }, [productId, product]);

  // Load saved reviews from localStorage and merge with initial
  useEffect(() => {
    console.log('[useEffect] Loading reviews', { productId, initialReviewsCount: initialReviews.length, user });
    if (typeof window !== 'undefined' && initialReviews.length > 0) {
      const savedData = localStorage.getItem(`kosnica_reviews_${productId}`);
      console.log('[useEffect] Saved data from localStorage', { savedData: savedData ? 'exists' : 'null' });
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          let savedReviews: Review[] = parsed.reviews || (Array.isArray(parsed) ? parsed : []);
          const interactions: Record<number, { hasLiked?: boolean; hasDisliked?: boolean }> = parsed.interactions || {};
          
          // CRITICAL: Clean Base64 avatars from loaded data and re-save immediately
          let needsResave = false;
          savedReviews = savedReviews.map(review => {
            const cleaned = { ...review };
            if (cleaned.avatar && cleaned.avatar.startsWith('data:')) {
              cleaned.avatar = '/images/reviewers/recenzija (1).jpg';
              needsResave = true;
            }
            if (cleaned.replies) {
              cleaned.replies = cleaned.replies.map(reply => {
                if (reply.avatar && reply.avatar.startsWith('data:')) {
                  return { ...reply, avatar: '/images/reviewers/recenzija (1).jpg' };
                }
                return reply;
              });
            }
            return cleaned;
          });
          
          // If we cleaned Base64 avatars, re-save cleaned data
          if (needsResave) {
            console.log('[useEffect] 🔧 Found Base64 avatars in saved data, cleaning and re-saving');
            try {
              const cleanedData = {
                reviews: savedReviews,
                interactions,
                timestamp: parsed.timestamp || Date.now()
              };
              localStorage.setItem(`kosnica_reviews_${productId}`, JSON.stringify(cleanedData));
              console.log('[useEffect] ✅ Re-saved cleaned data to localStorage');
            } catch (e) {
              console.warn('[useEffect] ⚠️ Could not re-save cleaned data:', e);
            }
          }
          
          console.log('[useEffect] Parsed data', { 
            savedReviewsCount: savedReviews.length,
            interactionsCount: Object.keys(interactions).length,
            hadBase64Avatars: needsResave
          });
          
          // Merge with initial reviews, prioritizing saved ones
          const merged = [...initialReviews];
          
          // Apply user interactions to initial reviews (likes/dislikes only, don't overwrite authorId)
          merged.forEach((review, index) => {
            if (interactions[review.id]) {
              merged[index] = {
                ...review,
                hasLiked: interactions[review.id].hasLiked,
                hasDisliked: interactions[review.id].hasDisliked,
              };
            }
          });
          
          // CRITICAL: First, update saved reviews to ensure they have authorId if they match current user
          if (user) {
            savedReviews.forEach((saved: Review) => {
              // If saved review has no authorId but author name matches current user, set authorId
              if (!saved.authorId && saved.author === `${user.firstName} ${user.lastName}`) {
                saved.authorId = user.id;
                console.log('[useEffect] 🔧 Setting missing authorId on saved review', {
                  id: saved.id,
                  author: saved.author,
                  authorId: saved.authorId
                });
              }
            });
          }
          
          // Add or update user-created reviews
          savedReviews.forEach((saved: Review) => {
            // CRITICAL: If saved review has no authorId but matches current user by name, set it NOW
            if (user && !saved.authorId && saved.author === `${user.firstName} ${user.lastName}`) {
              saved.authorId = user.id;
              console.log('[useEffect] 🔧 Setting missing authorId on saved review BEFORE merge', {
                id: saved.id,
                author: saved.author,
                newAuthorId: user.id
              });
            }
            
            const existingIndex = merged.findIndex(r => r.id === saved.id);
            if (existingIndex >= 0) {
              // CRITICAL: Determine authorId - saved review takes priority
              let finalAuthorId = saved.authorId;
              // If saved has no authorId but matches user by name, set it
              if (!finalAuthorId && user && saved.author === `${user.firstName} ${user.lastName}`) {
                finalAuthorId = user.id;
              }
              // If still no authorId, keep the one from merged (might be undefined for mock reviews)
              if (finalAuthorId === undefined) {
                finalAuthorId = merged[existingIndex].authorId;
              }
              
              // Update existing review with saved data (user edits, likes, etc.)
              // CRITICAL: saved review ALWAYS takes precedence for comment, author, and authorId
              merged[existingIndex] = { 
                ...merged[existingIndex], 
                // Overwrite comment with saved (user's edit)
                comment: saved.comment,
                // Overwrite author with saved (user's name)
                author: saved.author || merged[existingIndex].author,
                // CRITICAL: Use determined authorId
                authorId: finalAuthorId,
                // Preserve other saved fields if they exist
                avatar: saved.avatar || merged[existingIndex].avatar,
                timeAgo: saved.timeAgo || merged[existingIndex].timeAgo,
                likes: saved.likes !== undefined ? saved.likes : merged[existingIndex].likes,
                dislikes: saved.dislikes !== undefined ? saved.dislikes : merged[existingIndex].dislikes,
                // Preserve interactions from saved
                hasLiked: saved.hasLiked !== undefined ? saved.hasLiked : merged[existingIndex].hasLiked,
                hasDisliked: saved.hasDisliked !== undefined ? saved.hasDisliked : merged[existingIndex].hasDisliked,
                // Preserve replies from saved (they may have been added)
                replies: saved.replies || merged[existingIndex].replies,
                // Preserve createdAt from saved (or keep original)
                createdAt: saved.createdAt || merged[existingIndex].createdAt,
              };
              console.log('[useEffect] ✅ Updated existing review', { 
                id: saved.id, 
                finalAuthorId: merged[existingIndex].authorId,
                finalAuthor: merged[existingIndex].author,
                commentPreview: merged[existingIndex].comment.substring(0, 50),
                savedHadAuthorId: saved.authorId !== undefined,
                savedAuthorId: saved.authorId,
                determinedAuthorId: finalAuthorId
              });
            } else {
              // Add new user-created reviews
              merged.push(saved);
              console.log('[useEffect] ✅ Added new review', { 
                id: saved.id, 
                authorId: saved.authorId,
                author: saved.author 
              });
            }
          });
          
          const sorted = merged.sort((a, b) => {
            const aTime = new Date(a.createdAt || 0).getTime();
            const bTime = new Date(b.createdAt || 0).getTime();
            return bTime - aTime;
          });
          
          console.log('[useEffect] Final sorted reviews', { sortedCount: sorted.length });
          setReviews(sorted);
        } catch (e) {
          console.error('[useEffect] Error loading reviews:', e);
          setReviews(initialReviews);
        }
      } else {
        console.log('[useEffect] No saved reviews, using initial', { initialReviews });
        setReviews(initialReviews);
      }
    } else if (initialReviews.length > 0) {
      console.log('[useEffect] Setting initial reviews', { initialReviews });
      setReviews(initialReviews);
    }
  }, [productId, initialReviews]);

  const [reviews, setReviews] = useState<Review[]>(initialReviews);

  // Scroll to comment when reviewId query parameter is present
  useEffect(() => {
    const reviewId = searchParams.get('reviewId');
    const replyId = searchParams.get('replyId');
    
    if (reviewId && typeof window !== 'undefined' && reviews.length > 0) {
      // Wait for reviews to be loaded and rendered
      setTimeout(() => {
        if (replyId) {
          // Scroll to reply
          const replyElement = document.getElementById(`reply-${replyId}`);
          if (replyElement) {
            replyElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Highlight the element temporarily
            replyElement.style.backgroundColor = 'rgba(212, 167, 44, 0.1)';
            setTimeout(() => {
              replyElement.style.backgroundColor = '';
            }, 2000);
          }
        } else {
          // Scroll to review
          const reviewElement = document.getElementById(`review-${reviewId}`);
          if (reviewElement) {
            reviewElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Highlight the element temporarily
            reviewElement.style.backgroundColor = 'rgba(212, 167, 44, 0.1)';
            setTimeout(() => {
              reviewElement.style.backgroundColor = '';
            }, 2000);
          }
        }
      }, 500);
    }
  }, [searchParams, reviews]);

  // Save only user-generated reviews to localStorage (not mock reviews)
  const saveReviews = (updatedReviews: Review[]) => {
    console.log('[saveReviews] Saving to localStorage', { 
      productId, 
      reviewsCount: updatedReviews.length,
      reviews: updatedReviews.map(r => ({ id: r.id, authorId: r.authorId, author: r.author, comment: r.comment.substring(0, 50) }))
    });
    if (typeof window !== 'undefined') {
      try {
        // Only save user-generated reviews (those with authorId matching current user or any user ID)
        // Filter out mock reviews (those without authorId or with predefined IDs)
        const userReviews = updatedReviews
          .map(review => {
            // CRITICAL: If review matches current user by name but has no authorId, set it
            if (user && !review.authorId && review.author === `${user.firstName} ${user.lastName}`) {
              console.log('[saveReviews] 🔧 Setting missing authorId before saving', {
                reviewId: review.id,
                author: review.author,
                newAuthorId: user.id
              });
              return { ...review, authorId: user.id };
            }
            return review;
          })
          .map(review => {
            // CRITICAL: Remove Base64 avatar data to save space - only keep path
            const cleanedReview = { ...review };
            if (cleanedReview.avatar && cleanedReview.avatar.startsWith('data:')) {
              // Replace Base64 with a placeholder or remove it
              cleanedReview.avatar = '/images/reviewers/recenzija (1).jpg';
            }
            // Also clean replies
            if (cleanedReview.replies) {
              cleanedReview.replies = cleanedReview.replies.map(reply => {
                if (reply.avatar && reply.avatar.startsWith('data:')) {
                  return { ...reply, avatar: '/images/reviewers/recenzija (1).jpg' };
                }
                return reply;
              });
            }
            return cleanedReview;
          })
          .filter(review => {
            // Keep reviews with authorId (user-generated) - check if it matches current user
            if (review.authorId !== undefined) {
              // If user exists and authorId matches, definitely keep it
              if (user && review.authorId === user.id) {
                return true;
              }
              // Also keep if authorId > 1000 (likely user-generated)
              if (review.authorId > 1000) {
                return true;
              }
            }
            // Keep reviews that were edited or created by users (have createdAt and id > 1000 or match user name)
            if (review.createdAt) {
              if (review.id > 1000) {
                return true;
              }
              // Check if author name matches current user (for fallback matching)
              if (user && review.author === `${user.firstName} ${user.lastName}`) {
                return true;
              }
            }
            return false;
          });

        // Also save likes/dislikes state for all reviews by user
        const userInteractions: Record<number, { hasLiked?: boolean; hasDisliked?: boolean }> = {};
        updatedReviews.forEach(review => {
          if (review.hasLiked || review.hasDisliked) {
            userInteractions[review.id] = {
              hasLiked: review.hasLiked,
              hasDisliked: review.hasDisliked,
            };
          }
        });

        const dataToSave = {
          reviews: userReviews,
          interactions: userInteractions,
          timestamp: Date.now(),
        };

        const dataString = JSON.stringify(dataToSave);
        
        // Check size before saving
        const sizeInMB = new Blob([dataString]).size / (1024 * 1024);
        if (sizeInMB > 4) {
          console.warn('[saveReviews] Data size exceeds 4MB:', sizeInMB);
          // Keep only most recent reviews
          const recentReviews = userReviews
            .sort((a, b) => {
              const aTime = new Date(a.createdAt || 0).getTime();
              const bTime = new Date(b.createdAt || 0).getTime();
              return bTime - aTime;
            })
            .slice(0, 50); // Keep only 50 most recent
          
          const limitedData = {
            reviews: recentReviews,
            interactions: userInteractions,
            timestamp: Date.now(),
          };
          
          localStorage.setItem(`kosnica_reviews_${productId}`, JSON.stringify(limitedData));
        } else {
          localStorage.setItem(`kosnica_reviews_${productId}`, dataString);
        }
        
        console.log('[saveReviews] ✅ Saved to localStorage', { 
          key: `kosnica_reviews_${productId}`,
          userReviewsCount: userReviews.length,
          interactionsCount: Object.keys(userInteractions).length,
          userReviews: userReviews.map(r => ({ 
            id: r.id, 
            authorId: r.authorId, 
            author: r.author,
            hasAuthorId: r.authorId !== undefined
          }))
        });
      } catch (error: any) {
        if (error.name === 'QuotaExceededError' || error.code === 22) {
          console.error('[saveReviews] localStorage quota exceeded, clearing old data');
          // Try to clear old reviews for other products
          try {
            const keys = Object.keys(localStorage);
            const reviewKeys = keys.filter(key => key.startsWith('kosnica_reviews_') && key !== `kosnica_reviews_${productId}`);
            reviewKeys.forEach(key => localStorage.removeItem(key));
            // Try again with reduced data - CRITICAL: Remove Base64 avatars
            const userReviews = updatedReviews
              .filter(r => r.authorId !== undefined && r.authorId > 1000)
              .slice(0, 20)
              .map(review => {
                const cleaned = { ...review };
                // Remove Base64 avatar
                if (cleaned.avatar && cleaned.avatar.startsWith('data:')) {
                  cleaned.avatar = '/images/reviewers/recenzija (1).jpg';
                }
                // Clean replies
                if (cleaned.replies) {
                  cleaned.replies = cleaned.replies.map(reply => {
                    if (reply.avatar && reply.avatar.startsWith('data:')) {
                      return { ...reply, avatar: '/images/reviewers/recenzija (1).jpg' };
                    }
                    return reply;
                  });
                }
                return cleaned;
              });
            const reducedData = {
              reviews: userReviews,
              interactions: {},
              timestamp: Date.now()
            };
            const reducedSize = new Blob([JSON.stringify(reducedData)]).size / (1024 * 1024);
            console.log('[saveReviews] Trying to save reduced data', { sizeInMB: reducedSize, reviewsCount: userReviews.length });
            localStorage.setItem(`kosnica_reviews_${productId}`, JSON.stringify(reducedData));
            console.log('[saveReviews] ✅ Successfully saved reduced data');
          } catch (e) {
            console.error('[saveReviews] Failed to save even after clearing:', e);
            // Last resort: try to save just IDs and essential data
            try {
              const minimalData = {
                reviews: updatedReviews
                  .filter(r => r.authorId !== undefined && r.authorId > 1000)
                  .slice(0, 10)
                  .map(r => ({
                    id: r.id,
                    authorId: r.authorId,
                    author: r.author,
                    comment: r.comment,
                    createdAt: r.createdAt,
                    avatar: '/images/reviewers/recenzija (1).jpg', // Always use placeholder
                    replies: r.replies?.map(rep => ({
                      ...rep,
                      avatar: '/images/reviewers/recenzija (1).jpg'
                    })) || []
                  })),
                interactions: {},
                timestamp: Date.now()
              };
              localStorage.setItem(`kosnica_reviews_${productId}`, JSON.stringify(minimalData));
              console.log('[saveReviews] ✅ Saved minimal data as fallback');
            } catch (e2) {
              console.error('[saveReviews] ❌ Complete failure, cannot save:', e2);
            }
          }
        } else {
          console.error('[saveReviews] Error saving:', error);
        }
      }
    }
    setReviews(updatedReviews);
  };

  // Close options menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // Check if click was inside options menu or button
      const isClickInsideOptionsMenu = target.closest('[data-options-menu]');
      const isClickOnOptionsButton = target.closest('[data-options-button]');
      
      console.log('[handleClickOutside] Click detected', {
        target: target.tagName,
        isClickInsideOptionsMenu: !!isClickInsideOptionsMenu,
        isClickOnOptionsButton: !!isClickOnOptionsButton,
        showOptionsMenu,
        showReplyOptionsMenu
      });
      
      // If click was inside menu or on button, don't close
      if (isClickInsideOptionsMenu || isClickOnOptionsButton) {
        console.log('[handleClickOutside] Click was inside menu/button, not closing');
        return;
      }
      
      // Close menus if click was outside
      if (showOptionsMenu !== null) {
        console.log('[handleClickOutside] Closing options menu', { showOptionsMenu });
        setShowOptionsMenu(null);
      }
      if (showReplyOptionsMenu !== null) {
        console.log('[handleClickOutside] Closing reply options menu', { showReplyOptionsMenu });
        setShowReplyOptionsMenu(null);
      }
    };

    if (showOptionsMenu !== null || showReplyOptionsMenu !== null) {
      // Use setTimeout with small delay to allow click event on button to complete first
      const timeoutId = setTimeout(() => {
        console.log('[handleClickOutside] Adding click listener', { showOptionsMenu, showReplyOptionsMenu });
        document.addEventListener('click', handleClickOutside, true);
      }, 100);
      
      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener('click', handleClickOutside, true);
      };
    }
  }, [showOptionsMenu, showReplyOptionsMenu]);

  // Use refs to track current state values for ESC handler
  const showDeleteConfirmRef = useRef(showDeleteConfirm);
  const showDeleteReplyConfirmRef = useRef(showDeleteReplyConfirm);
  const editingReviewIdRef = useRef(editingReviewId);
  const editingReplyIdRef = useRef(editingReplyId);
  const replyingToRef = useRef(replyingTo);

  // Update refs when state changes
  useEffect(() => {
    showDeleteConfirmRef.current = showDeleteConfirm;
    showDeleteReplyConfirmRef.current = showDeleteReplyConfirm;
    editingReviewIdRef.current = editingReviewId;
    editingReplyIdRef.current = editingReplyId;
    replyingToRef.current = replyingTo;
  }, [showDeleteConfirm, showDeleteReplyConfirm, editingReviewId, editingReplyId, replyingTo]);

  // Close delete modal on ESC key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showDeleteConfirmRef.current !== null) {
          setShowDeleteConfirm(null);
        }
        if (showDeleteReplyConfirmRef.current !== null) {
          setShowDeleteReplyConfirm(null);
        }
        if (editingReviewIdRef.current !== null) {
          setEditingReviewId(null);
          setEditingText('');
        }
        if (editingReplyIdRef.current !== null) {
          setEditingReplyId(null);
          setEditingReplyText('');
        }
        if (replyingToRef.current !== null) {
          setReplyingTo(null);
          setReplyText('');
        }
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, []); // Empty dependency array since we use refs

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if user is authenticated
    if (!isAuthenticated || !user) {
      console.log('[handleSubmit] User not authenticated', { isAuthenticated, user });
      showToast('Morate biti prijavljeni da biste ostavili komentar', 'info');
      return;
    }
    
    if (!comment.trim()) {
      console.log('[handleSubmit] Empty comment');
      return;
    }

    const now = new Date().toISOString();
    // CRITICAL: Use a large unique ID to distinguish from mock reviews (which have small IDs like 1, 2, 101, 102)
    const reviewId = Date.now();
    
    const newReview: Review = {
      id: reviewId,
      author: `${user.firstName} ${user.lastName}`,
      authorId: user.id, // CRITICAL: Must set authorId to user.id
      avatar: user.avatar || '/images/reviewers/recenzija (1).jpg',
      timeAgo: 'sada',
      comment: comment.trim(),
      likes: 0,
      dislikes: 0,
      hasLiked: false,
      hasDisliked: false,
      replies: [],
      createdAt: now,
    };

    // DOUBLE CHECK: Ensure authorId is set (shouldn't be needed but just in case)
    if (!newReview.authorId && user && user.id) {
      newReview.authorId = user.id;
      console.log('[handleSubmit] ⚠️ Setting authorId on new review (fallback)', { authorId: user.id });
    }
    
    // Verify authorId is set
    if (newReview.authorId !== user.id) {
      console.error('[handleSubmit] ❌ AUTHOR ID MISMATCH!', {
        newReviewAuthorId: newReview.authorId,
        userId: user.id,
        match: newReview.authorId === user.id
      });
      newReview.authorId = user.id; // Force set it
    }
    
    console.log('[handleSubmit] ✅ Creating new review', { 
      newReview: {
        id: newReview.id,
        authorId: newReview.authorId,
        author: newReview.author,
        comment: newReview.comment.substring(0, 50)
      }, 
      user: {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`
      },
      authorIdMatches: newReview.authorId === user.id,
      reviewId: newReview.id
    });
    
    const updatedReviews = [newReview, ...reviews];
    
    console.log('[handleSubmit] ✅ About to save', { 
      updatedReviewsCount: updatedReviews.length,
      newReviewInArray: {
        id: updatedReviews[0]?.id,
        authorId: updatedReviews[0]?.authorId,
        author: updatedReviews[0]?.author,
        hasAuthorId: updatedReviews[0]?.authorId !== undefined,
        matchesUser: updatedReviews[0]?.authorId === user.id
      }
    });
    
    // Update state immediately so review shows with edit/delete options
    setReviews(updatedReviews);
    saveReviews(updatedReviews);
    setComment('');
    showToast('Komentar je uspješno dodat', 'success');
  };

  const handleLike = (reviewId: number) => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      showToast('Morate biti prijavljeni da biste lajkovali komentar', 'info');
      return;
    }
    
    const updatedReviews = reviews.map((review) => {
      if (review.id === reviewId) {
        const wasLiked = review.hasLiked;
        const wasDisliked = review.hasDisliked;
        return {
          ...review,
          hasLiked: !wasLiked,
          hasDisliked: false,
          likes: wasLiked ? review.likes - 1 : review.likes + 1,
          dislikes: wasDisliked ? review.dislikes - 1 : review.dislikes,
        };
      }
      return review;
    });
    saveReviews(updatedReviews);
  };

  const handleDislike = (reviewId: number) => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      showToast('Morate biti prijavljeni da biste dislajkovali komentar', 'info');
      return;
    }
    
    const updatedReviews = reviews.map((review) => {
      if (review.id === reviewId) {
        const wasDisliked = review.hasDisliked;
        const wasLiked = review.hasLiked;
        return {
          ...review,
          hasDisliked: !wasDisliked,
          hasLiked: false,
          likes: wasLiked ? review.likes - 1 : review.likes,
          dislikes: wasDisliked ? review.dislikes - 1 : review.dislikes + 1,
        };
      }
      return review;
    });
    saveReviews(updatedReviews);
  };

  const handleLikeReply = (reviewId: number, replyId: number) => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      showToast('Morate biti prijavljeni da biste lajkovali odgovor', 'info');
      return;
    }
    
    const updatedReviews = reviews.map((review) => {
      if (review.id === reviewId && review.replies) {
        return {
          ...review,
          replies: review.replies.map((reply) => {
            if (reply.id === replyId) {
              const wasLiked = reply.hasLiked;
              const wasDisliked = reply.hasDisliked;
              return {
                ...reply,
                hasLiked: !wasLiked,
                hasDisliked: false,
                likes: wasLiked ? reply.likes - 1 : reply.likes + 1,
                dislikes: wasDisliked ? reply.dislikes - 1 : reply.dislikes,
              };
            }
            return reply;
          }),
        };
      }
      return review;
    });
    saveReviews(updatedReviews);
  };

  const handleDislikeReply = (reviewId: number, replyId: number) => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      showToast('Morate biti prijavljeni da biste dislajkovali odgovor', 'info');
      return;
    }
    
    const updatedReviews = reviews.map((review) => {
      if (review.id === reviewId && review.replies) {
        return {
          ...review,
          replies: review.replies.map((reply) => {
            if (reply.id === replyId) {
              const wasDisliked = reply.hasDisliked;
              const wasLiked = reply.hasLiked;
              return {
                ...reply,
                hasDisliked: !wasDisliked,
                hasLiked: false,
                likes: wasLiked ? reply.likes - 1 : reply.likes,
                dislikes: wasDisliked ? reply.dislikes - 1 : reply.dislikes + 1,
              };
            }
            return reply;
          }),
        };
      }
      return review;
    });
    saveReviews(updatedReviews);
  };

  const handleReply = (reviewId: number) => {
    if (!isAuthenticated || !user) {
      showToast('Morate biti prijavljeni da biste odgovorili', 'info');
      return;
    }
    setReplyingTo(reviewId);
    setReplyText('');
  };

  const handleSubmitReply = (reviewId: number) => {
    if (!isAuthenticated || !user || !replyText.trim()) return;

    const now = new Date().toISOString();
    const newReply: Reply = {
      id: Date.now(),
      author: `${user.firstName} ${user.lastName}`,
      authorId: user.id,
      avatar: user.avatar || '/images/reviewers/recenzija (1).jpg',
      timeAgo: 'sada',
      comment: replyText.trim(),
      likes: 0,
      dislikes: 0,
      hasLiked: false,
      hasDisliked: false,
      createdAt: now,
    };

    const updatedReviews = reviews.map((review) => {
      if (review.id === reviewId) {
        return {
          ...review,
          replies: [...(review.replies || []), newReply],
        };
      }
      return review;
    });

    saveReviews(updatedReviews);
    setReplyingTo(null);
    setReplyText('');
    showToast('Odgovor je uspješno dodat', 'success');
  };

  const handleEdit = (reviewId: number) => {
    console.log('[handleEdit] Called', { reviewId, reviews: reviews.map(r => ({ id: r.id, authorId: r.authorId, author: r.author })) });
    const review = reviews.find(r => r.id === reviewId);
    if (!review) {
      console.log('[handleEdit] Review not found', { reviewId });
      return;
    }
    console.log('[handleEdit] Review found', { review, user });
    setEditingReviewId(reviewId);
    setEditingText(review.comment);
    setShowOptionsMenu(null);
  };

  const handleSaveEdit = (reviewId: number) => {
    console.log('[handleSaveEdit] Called', { reviewId, editingText, currentUser: user });
    if (!editingText.trim()) {
      showToast('Komentar ne može biti prazan', 'error');
      return;
    }

    const updatedReviews = reviews.map((review) => {
      if (review.id === reviewId) {
        console.log('[handleSaveEdit] 🔧 Updating review', { 
          before: { ...review }, 
          newComment: editingText.trim(),
          hasAuthorId: review.authorId !== undefined,
          authorId: review.authorId,
          userId: user?.id,
          authorName: review.author,
          userFullName: user ? `${user.firstName} ${user.lastName}` : null
        });
        
        // Ensure authorId is preserved when editing
        let finalAuthorId = review.authorId;
        
        // If review doesn't have authorId but user is logged in and author name matches, set it
        if (user && !finalAuthorId) {
          const userFullName = `${user.firstName} ${user.lastName}`;
          if (review.author === userFullName) {
            finalAuthorId = user.id;
            console.log('[handleSaveEdit] ✅ Setting authorId on edited review (matched by name)', { 
              authorId: user.id,
              author: review.author,
              userFullName
            });
          }
        }
        
        // If still no authorId and user is logged in, set it (user is editing, so they must own it)
        if (user && !finalAuthorId) {
          finalAuthorId = user.id;
          console.log('[handleSaveEdit] ✅ Setting authorId on edited review (user is editing)', { 
            authorId: user.id
          });
        }
        
        const updatedReview = {
          ...review,
          comment: editingText.trim(),
          authorId: finalAuthorId,
        };
        
        console.log('[handleSaveEdit] ✅ Review updated', {
          id: updatedReview.id,
          authorId: updatedReview.authorId,
          author: updatedReview.author,
          commentPreview: updatedReview.comment.substring(0, 50)
        });
        
        return updatedReview;
      }
      return review;
    });

    console.log('[handleSaveEdit] Saving reviews', { 
      updatedReviews: updatedReviews.map(r => ({ id: r.id, authorId: r.authorId, author: r.author }))
    });
    saveReviews(updatedReviews);
    setEditingReviewId(null);
    setEditingText('');
    showToast('Komentar je uspješno izmijenjen', 'success');
  };

  const handleEditReply = (reviewId: number, replyId: number) => {
    const review = reviews.find(r => r.id === reviewId);
    if (!review || !review.replies) return;
    
    const reply = review.replies.find(rep => rep.id === replyId);
    if (!reply) return;
    
    setEditingReplyId({ reviewId, replyId });
    setEditingReplyText(reply.comment);
    setShowReplyOptionsMenu(null);
  };

  const handleSaveReplyEdit = (reviewId: number, replyId: number) => {
    if (!editingReplyText.trim()) {
      showToast('Odgovor ne može biti prazan', 'error');
      return;
    }

    const updatedReviews = reviews.map((review) => {
      if (review.id === reviewId && review.replies) {
        return {
          ...review,
          replies: review.replies.map((reply) => {
            if (reply.id === replyId) {
              return {
                ...reply,
                comment: editingReplyText.trim(),
              };
            }
            return reply;
          }),
        };
      }
      return review;
    });

    saveReviews(updatedReviews);
    setEditingReplyId(null);
    setEditingReplyText('');
    showToast('Odgovor je uspješno izmijenjen', 'success');
  };

  const handleDeleteReply = (reviewId: number, replyId: number) => {
    const updatedReviews = reviews.map((r) => {
      if (r.id === reviewId) {
        return {
          ...r,
          replies: r.replies?.filter(rep => rep.id !== replyId) || [],
        };
      }
      return r;
    });
    saveReviews(updatedReviews);
    // Close modal immediately
    setShowDeleteReplyConfirm(null);
    // Close options menu if open
    setShowReplyOptionsMenu(null);
    showToast('Odgovor je obrisan', 'success');
  };

  const handleDelete = (reviewId: number) => {
    console.log('[handleDelete] Called', { reviewId, reviews: reviews.map(r => ({ id: r.id, authorId: r.authorId, author: r.author })) });
    const updatedReviews = reviews.filter(review => review.id !== reviewId);
    console.log('[handleDelete] Filtered reviews', { updatedReviews: updatedReviews.map(r => ({ id: r.id })) });
    saveReviews(updatedReviews);
    setShowDeleteConfirm(null);
    showToast('Komentar je uspješno obrisan', 'success');
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
    setReplyText('');
  };

  const handleCancelEdit = () => {
    setEditingReviewId(null);
    setEditingText('');
  };

  const isOwnComment = (review: Review) => {
    if (!user || !user.id) {
      return false;
    }
    
    const userFullName = `${user.firstName} ${user.lastName}`;
    
    // Priority 1: Check by authorId (most reliable)
    if (review.authorId !== undefined) {
      const authorIdMatch = review.authorId === user.id;
      if (authorIdMatch) {
        console.log('[isOwnComment] ✅ Match by authorId', { 
          reviewId: review.id, 
          authorId: review.authorId, 
          userId: user.id 
        });
        return true;
      }
    }
    
    // Priority 2: Check by exact author name match
    const nameMatch = review.author === userFullName;
    if (nameMatch) {
      console.log('[isOwnComment] ✅ Match by name', { 
        reviewId: review.id, 
        author: review.author, 
        userFullName 
      });
      // Also ensure authorId is set if it wasn't before
      if (review.authorId === undefined) {
        console.log('[isOwnComment] ⚠️ Setting missing authorId', { reviewId: review.id, userId: user.id });
        // Update the review in state to include authorId
        const updatedReviews = reviews.map(r => 
          r.id === review.id ? { ...r, authorId: user.id } : r
        );
        setReviews(updatedReviews);
      }
      return true;
    }
    
    console.log('[isOwnComment] ❌ No match', { 
      reviewId: review.id, 
      authorId: review.authorId, 
      userId: user.id, 
      author: review.author, 
      userFullName,
      typeCheck: {
        authorIdType: typeof review.authorId,
        userIdType: typeof user.id,
        strictEqual: review.authorId === user.id,
        looseEqual: review.authorId == user.id
      }
    });
    return false;
  };

  const isOwnReply = (reply: Reply) => {
    if (!user || !user.id) {
      console.log('[isOwnReply] No user or user.id', { user, replyId: reply.id });
      return false;
    }
    // Check if reply has authorId and it matches user id
    if (reply.authorId !== undefined && reply.authorId === user.id) {
      console.log('[isOwnReply] Match by authorId', { replyId: reply.id, authorId: reply.authorId, userId: user.id });
      return true;
    }
    // Fallback: check if author name matches current user name
    const userFullName = `${user.firstName} ${user.lastName}`;
    if (reply.author === userFullName) {
      console.log('[isOwnReply] Match by name', { replyId: reply.id, author: reply.author, userFullName });
      return true;
    }
    console.log('[isOwnReply] No match', { 
      replyId: reply.id, 
      authorId: reply.authorId, 
      userId: user.id, 
      author: reply.author, 
      userFullName 
    });
    return false;
  };

  // Fix: Set missing authorId for reviews and replies that match current user by name
  useEffect(() => {
    if (!user || !user.id) return;
    
    const userFullName = `${user.firstName} ${user.lastName}`;
    let needsUpdate = false;
    
    const updatedReviews = reviews.map(review => {
      let reviewNeedsUpdate = false;
      let updatedReview = { ...review };
      
      // If author name matches but authorId is missing, set it
      if (review.author === userFullName && !review.authorId) {
        console.log('[useEffect-authorId] 🔧 Setting missing authorId', {
          reviewId: review.id,
          author: review.author,
          newAuthorId: user.id,
          userId: user.id
        });
        reviewNeedsUpdate = true;
        updatedReview = { ...updatedReview, authorId: user.id };
      }
      // Also check if review was just created and has no authorId but ID is large (user-created)
      if (!updatedReview.authorId && updatedReview.id > 1000000000000 && updatedReview.createdAt) {
        // Large ID suggests it was created with Date.now(), likely user-created
        console.log('[useEffect-authorId] 🔧 Setting missing authorId for recent review', {
          reviewId: updatedReview.id,
          author: updatedReview.author,
          newAuthorId: user.id
        });
        reviewNeedsUpdate = true;
        updatedReview = { ...updatedReview, authorId: user.id };
      }
      
      // Also check replies for missing authorId
      if (updatedReview.replies && updatedReview.replies.length > 0) {
        const updatedReplies = updatedReview.replies.map(reply => {
          // If reply author name matches but authorId is missing, set it
          if (reply.author === userFullName && !reply.authorId) {
            console.log('[useEffect-authorId] 🔧 Setting missing authorId for reply', {
              replyId: reply.id,
              reviewId: updatedReview.id,
              author: reply.author,
              newAuthorId: user.id
            });
            reviewNeedsUpdate = true;
            needsUpdate = true;
            return { ...reply, authorId: user.id };
          }
          // Also check if reply was just created and has no authorId but ID is large (user-created)
          if (!reply.authorId && reply.id > 1000000000000 && reply.createdAt) {
            console.log('[useEffect-authorId] 🔧 Setting missing authorId for recent reply', {
              replyId: reply.id,
              reviewId: updatedReview.id,
              author: reply.author,
              newAuthorId: user.id
            });
            reviewNeedsUpdate = true;
            needsUpdate = true;
            return { ...reply, authorId: user.id };
          }
          return reply;
        });
        
        if (reviewNeedsUpdate) {
          updatedReview = { ...updatedReview, replies: updatedReplies };
        }
      }
      
      if (reviewNeedsUpdate) {
        needsUpdate = true;
      }
      
      return updatedReview;
    });
    
    if (needsUpdate) {
      console.log('[useEffect-authorId] ✅ Updating reviews and replies with missing authorId', {
        updatedCount: updatedReviews.filter(r => r.authorId === user.id).length
      });
      // Don't call saveReviews here to avoid infinite loop, just update state
      setReviews(updatedReviews);
    }
  }, [user, reviews.length]); // Only run when reviews count changes, not on every review change

  // Debug: log current state
  useEffect(() => {
    console.log('[ProductReviews] Component state', {
      user,
      isAuthenticated,
      reviewsCount: reviews.length,
      reviews: reviews.map(r => ({ 
        id: r.id, 
        authorId: r.authorId, 
        author: r.author 
      })),
    });
  }, [user, isAuthenticated, reviews]);

  return (
    <div className="mt-32 pt-16 border-t-2" style={{ borderColor: 'var(--border-light)' }}>
      {/* Comment Input */}
      <div className="mb-8">
        {isAuthenticated ? (
          <form onSubmit={handleSubmit} className="flex gap-3 relative">
            <div className="flex-1 relative">
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Napiši komentar ..."
                className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none text-base"
                style={{
                  borderColor: 'var(--border-light)',
                  backgroundColor: 'white',
                  color: 'var(--dark-text)',
                  fontFamily: 'var(--font-inter)',
                  paddingRight: comment ? '3rem' : '1rem',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--honey-gold)';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(212, 167, 44, 0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-light)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
              {comment && (
                <button
                  type="button"
                  onClick={() => setComment('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full transition-colors hover:bg-gray-100"
                  style={{ color: 'var(--body-text)' }}
                  aria-label="Obriši"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <button
              type="submit"
              disabled={!comment.trim()}
              className="px-6 py-3 rounded-lg font-medium text-base transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: comment.trim() ? 'var(--green-primary)' : 'var(--border-light)',
                color: comment.trim() ? 'white' : 'var(--body-text)',
                fontFamily: 'var(--font-inter)',
              }}
              onMouseEnter={(e) => {
                if (comment.trim()) {
                  e.currentTarget.style.backgroundColor = '#15803d';
                }
              }}
              onMouseLeave={(e) => {
                if (comment.trim()) {
                  e.currentTarget.style.backgroundColor = '#16a34a';
                }
              }}
            >
              Pošalji
            </button>
          </form>
        ) : (
          <div className="bg-white rounded-lg border-2 p-6 text-center" style={{ borderColor: 'var(--border-light)' }}>
            <p
              className="text-base mb-4"
              style={{
                color: 'var(--body-text)',
                fontFamily: 'var(--font-inter)',
              }}
            >
              Morate biti prijavljeni da biste ostavili komentar.
            </p>
            <Link
              href={ROUTES.LOGIN}
              className="inline-block px-6 py-3 rounded-lg font-medium text-base transition-all"
              style={{
                backgroundColor: 'var(--honey-gold)',
                color: 'var(--dark-text)',
                fontFamily: 'var(--font-inter)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--honey-light)';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(212, 167, 44, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--honey-gold)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              Prijavite se
            </Link>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="h-px bg-gray-300 mb-6" />

      {/* Comments Header */}
      <div className="flex items-center justify-between mb-6">
        <h3
          className="text-2xl font-bold"
          style={{
            fontFamily: 'var(--font-serif)',
            color: 'var(--dark-text)',
            letterSpacing: '0.02em',
          }}
        >
          Komentari
        </h3>
        <button
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Sortiraj komentare"
        >
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
              d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
            />
          </svg>
        </button>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.length === 0 ? (
          <div className="text-center py-12">
            <p
              className="text-base"
              style={{
                color: 'var(--body-text)',
                fontFamily: 'var(--font-inter)',
              }}
            >
              Još nema komentara. Budite prvi koji će ostaviti komentar!
            </p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} id={`review-${review.id}`} className="flex gap-4 scroll-mt-4">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                <Image
                  src={review.avatar}
                  alt={review.author}
                  fill
                  className="object-cover"
                  sizes="48px"
                  onError={(e) => {
                    // Fallback to default avatar if image doesn't exist
                    e.currentTarget.src = '/images/reviewers/default.jpg';
                  }}
                />
              </div>
            </div>

            {/* Comment Content */}
            <div className="flex-1">
              {/* Author and Time */}
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="font-bold text-base"
                  style={{
                    color: 'var(--dark-text)',
                    fontFamily: 'var(--font-inter)',
                  }}
                >
                  {review.author}
                </span>
                <span
                  className="text-sm"
                  style={{
                    color: '#9ca3af',
                    fontFamily: 'var(--font-inter)',
                  }}
                >
                  {review.timeAgo}
                </span>
              </div>

              {/* Comment Text */}
              {editingReviewId === review.id ? (
                <div className="mb-3 space-y-2">
                  <textarea
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border-2 text-base focus:outline-none resize-none"
                    style={{
                      borderColor: 'var(--honey-gold)',
                      fontFamily: 'var(--font-inter)',
                      color: 'var(--dark-text)',
                      minHeight: '80px',
                    }}
                    rows={3}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSaveEdit(review.id)}
                      disabled={!editingText.trim()}
                      className="px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        backgroundColor: editingText.trim() ? 'var(--honey-gold)' : 'var(--border-light)',
                        color: 'var(--dark-text)',
                        fontFamily: 'var(--font-inter)',
                      }}
                    >
                      Sačuvaj
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      style={{
                        backgroundColor: 'var(--border-light)',
                        color: 'var(--dark-text)',
                        fontFamily: 'var(--font-inter)',
                      }}
                    >
                      Otkaži
                    </button>
                  </div>
                </div>
              ) : (
                <p
                  className="text-base leading-relaxed mb-3"
                  style={{
                    color: 'var(--body-text)',
                    fontFamily: 'var(--font-inter)',
                  }}
                >
                  {review.comment}
                </p>
              )}

              {/* Actions */}
              <div className="flex items-center gap-3">
                {/* Like */}
                <button
                  onClick={() => handleLike(review.id)}
                  className="flex items-center gap-1.5 text-sm transition-colors"
                  style={{
                    color: review.hasLiked ? 'var(--green-primary)' : 'var(--body-text)',
                    fontFamily: 'var(--font-inter)',
                  }}
                  onMouseEnter={(e) => {
                    if (!review.hasLiked) {
                      e.currentTarget.style.color = 'var(--green-primary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!review.hasLiked) {
                      e.currentTarget.style.color = 'var(--body-text)';
                    }
                  }}
                >
                  <svg
                    className="w-5 h-5"
                    fill={review.hasLiked ? 'currentColor' : 'none'}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                    />
                  </svg>
                  <span>{review.likes}</span>
                </button>

                {/* Dislike */}
                <button
                  onClick={() => handleDislike(review.id)}
                  className="flex items-center gap-1.5 text-sm transition-colors"
                  style={{
                    color: review.hasDisliked ? '#dc2626' : 'var(--body-text)',
                    fontFamily: 'var(--font-inter)',
                  }}
                  onMouseEnter={(e) => {
                    if (!review.hasDisliked) {
                      e.currentTarget.style.color = '#dc2626';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!review.hasDisliked) {
                      e.currentTarget.style.color = 'var(--body-text)';
                    }
                  }}
                >
                  <svg
                    className="w-5 h-5"
                    fill={review.hasDisliked ? 'currentColor' : 'none'}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5"
                    />
                  </svg>
                  <span>{review.dislikes}</span>
                </button>

                {/* Reply */}
                {isAuthenticated && (
                  <button
                    onClick={() => handleReply(review.id)}
                    className="flex items-center gap-1.5 text-sm transition-colors"
                    style={{
                      color: replyingTo === review.id ? 'var(--honey-gold)' : 'var(--body-text)',
                      fontFamily: 'var(--font-inter)',
                    }}
                    onMouseEnter={(e) => {
                      if (replyingTo !== review.id) {
                        e.currentTarget.style.color = 'var(--honey-gold)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (replyingTo !== review.id) {
                        e.currentTarget.style.color = 'var(--body-text)';
                      }
                    }}
                  >
                    <svg
                      className="w-4 h-4"
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
                    Odgovori
                  </button>
                )}

                {/* More Options - Only show for own comments */}
                {(() => {
                  // Early exit if no user
                  if (!user || !user.id) {
                    console.log('[Render] Options check: No user', { hasUser: !!user, hasUserId: !!user?.id });
                    return false;
                  }
                  
                  const userFullName = `${user.firstName} ${user.lastName}`;
                  
                  // Check if author name matches (case-insensitive to be safe)
                  const authorMatches = review.author?.trim().toLowerCase() === userFullName?.trim().toLowerCase();
                  
                  // Check if authorId matches - try both strict and loose equality
                  const authorIdMatchesStrict = review.authorId === user.id;
                  const authorIdMatchesLoose = review.authorId == user.id;
                  const authorIdMatches = authorIdMatchesStrict || authorIdMatchesLoose;
                  
                  // Final result - show if EITHER matches
                  const finalResult = Boolean(authorMatches || authorIdMatches);
                  
                  // Debug logging
                  if (review.id > 1000000000000 || authorMatches || authorIdMatches) {
                    console.log('[Render] Options visibility check', { 
                      reviewId: review.id, 
                      authorId: review.authorId,
                      authorIdType: typeof review.authorId,
                      userId: user.id,
                      userIdType: typeof user.id,
                      author: review.author,
                      userFullName,
                      authorIdMatchesStrict: `${review.authorId} === ${user.id} = ${authorIdMatchesStrict}`,
                      authorIdMatchesLoose: `${review.authorId} == ${user.id} = ${authorIdMatchesLoose}`,
                      authorIdMatches,
                      authorMatches: `${review.author?.trim().toLowerCase()} === ${userFullName?.trim().toLowerCase()} = ${authorMatches}`,
                      finalResult,
                      willShow: finalResult,
                      reviewStringified: JSON.stringify({ id: review.id, authorId: review.authorId, author: review.author })
                    });
                  }
                  
                  const shouldRender = Boolean(finalResult);
                  if (shouldRender) {
                    console.log('[Render] ✅ WILL RENDER options for review', { reviewId: review.id });
                  } else {
                    console.log('[Render] ❌ WILL NOT RENDER options for review', { reviewId: review.id });
                  }
                  return shouldRender;
                })() ? (
                  <div className="relative ml-auto">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const newMenuState = showOptionsMenu === review.id ? null : review.id;
                        console.log('[Render] Options menu clicked', { 
                          reviewId: review.id, 
                          currentMenu: showOptionsMenu,
                          newMenuState,
                          willShowMenu: newMenuState === review.id
                        });
                        setShowOptionsMenu(newMenuState);
                      }}
                      className="p-1 rounded hover:bg-gray-100 transition-colors"
                      aria-label="Više opcija"
                      style={{ display: 'block', visibility: 'visible', opacity: 1 }}
                      data-options-button={`${review.id}`}
                    >
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
                          d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                        />
                      </svg>
                    </button>
                    {(() => {
                      const shouldShowMenu = showOptionsMenu === review.id;
                      if (shouldShowMenu) {
                        console.log('[Render] ✅ WILL SHOW menu dropdown', { reviewId: review.id, showOptionsMenu });
                      }
                      return shouldShowMenu;
                    })() && (
                      <div
                        className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 min-w-[120px]"
                        style={{ 
                          fontFamily: 'var(--font-inter)',
                          display: 'block',
                          visibility: 'visible',
                          opacity: 1,
                          zIndex: 9999
                        }}
                        data-options-menu={`${review.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('[Render] Edit button clicked', { reviewId: review.id });
                            handleEdit(review.id);
                          }}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors flex items-center gap-2"
                          style={{ color: 'var(--dark-text)' }}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Uredi
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('[Render] Delete button clicked', { reviewId: review.id });
                            setShowOptionsMenu(null);
                            setShowDeleteConfirm(review.id);
                          }}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 transition-colors flex items-center gap-2"
                          style={{ color: '#dc2626' }}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Obriši
                        </button>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>

              {/* Reply Input */}
              {replyingTo === review.id && (
                <div className="mt-4 ml-4 pl-4 border-l-2" style={{ borderColor: 'var(--honey-gold)' }}>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Napiši odgovor..."
                      className="flex-1 px-3 py-2 rounded-lg border-2 text-sm focus:outline-none"
                      style={{
                        borderColor: 'var(--border-light)',
                        fontFamily: 'var(--font-inter)',
                        color: 'var(--dark-text)',
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = 'var(--honey-gold)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'var(--border-light)';
                      }}
                      autoFocus
                    />
                    <button
                      onClick={() => handleSubmitReply(review.id)}
                      disabled={!replyText.trim()}
                      className="px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        backgroundColor: replyText.trim() ? 'var(--honey-gold)' : 'var(--border-light)',
                        color: 'var(--dark-text)',
                        fontFamily: 'var(--font-inter)',
                      }}
                    >
                      Pošalji
                    </button>
                    <button
                      onClick={handleCancelReply}
                      className="px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                      style={{
                        backgroundColor: 'var(--border-light)',
                        color: 'var(--dark-text)',
                        fontFamily: 'var(--font-inter)',
                      }}
                    >
                      Otkaži
                    </button>
                  </div>
                </div>
              )}

              {/* Replies List */}
              {review.replies && review.replies.length > 0 && (
                <div className="mt-4 ml-4 pl-4 space-y-4 border-l-2" style={{ borderColor: 'rgba(212, 167, 44, 0.2)' }}>
                  {review.replies.map((reply) => (
                    <div key={reply.id} id={`reply-${reply.id}`} className="flex gap-3 scroll-mt-4">
                      <div className="flex-shrink-0">
                        <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                          <Image
                            src={reply.avatar}
                            alt={reply.author}
                            fill
                            className="object-cover"
                            sizes="48px"
                            onError={(e) => {
                              e.currentTarget.src = '/images/reviewers/default.jpg';
                            }}
                          />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <span
                              className="font-semibold text-base"
                              style={{
                                color: 'var(--dark-text)',
                                fontFamily: 'var(--font-inter)',
                              }}
                            >
                              {reply.author}
                            </span>
                            <span
                              className="text-sm"
                              style={{
                                color: '#9ca3af',
                                fontFamily: 'var(--font-inter)',
                              }}
                            >
                              {reply.timeAgo}
                            </span>
                          </div>
                          {isOwnReply(reply) && (
                            <div className="relative">
                              <button
                                data-options-button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setShowReplyOptionsMenu(
                                    showReplyOptionsMenu?.reviewId === review.id && showReplyOptionsMenu?.replyId === reply.id
                                      ? null
                                      : { reviewId: review.id, replyId: reply.id }
                                  );
                                }}
                                className="p-0.5 rounded hover:bg-gray-100 transition-colors"
                                aria-label="Više opcija"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                  style={{ color: 'var(--body-text)' }}
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                                  />
                                </svg>
                              </button>
                              {showReplyOptionsMenu?.reviewId === review.id && showReplyOptionsMenu?.replyId === reply.id && (
                                <div
                                  data-options-menu
                                  className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 min-w-[120px]"
                                  style={{ fontFamily: 'var(--font-inter)' }}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleEditReply(review.id, reply.id);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors flex items-center gap-2"
                                    style={{ color: 'var(--dark-text)' }}
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    Uredi
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      setShowReplyOptionsMenu(null);
                                      setShowDeleteReplyConfirm({ reviewId: review.id, replyId: reply.id });
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 transition-colors flex items-center gap-2"
                                    style={{ color: '#dc2626' }}
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Obriši
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        {editingReplyId?.reviewId === review.id && editingReplyId?.replyId === reply.id ? (
                          <div className="mt-2 space-y-2">
                            <textarea
                              value={editingReplyText}
                              onChange={(e) => setEditingReplyText(e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border-2 text-base focus:outline-none resize-none"
                              style={{
                                borderColor: 'var(--honey-gold)',
                                fontFamily: 'var(--font-inter)',
                                color: 'var(--dark-text)',
                                minHeight: '80px',
                              }}
                              rows={3}
                              autoFocus
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleSaveReplyEdit(review.id, reply.id)}
                                disabled={!editingReplyText.trim()}
                                className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{
                                  backgroundColor: editingReplyText.trim() ? 'var(--honey-gold)' : 'var(--border-light)',
                                  color: 'var(--dark-text)',
                                  fontFamily: 'var(--font-inter)',
                                }}
                              >
                                Sačuvaj
                              </button>
                              <button
                                onClick={() => {
                                  setEditingReplyId(null);
                                  setEditingReplyText('');
                                }}
                                className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                                style={{
                                  backgroundColor: 'var(--border-light)',
                                  color: 'var(--dark-text)',
                                  fontFamily: 'var(--font-inter)',
                                }}
                              >
                                Otkaži
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p
                            className="text-base leading-relaxed mb-3"
                            style={{
                              color: 'var(--body-text)',
                              fontFamily: 'var(--font-inter)',
                            }}
                          >
                            {reply.comment}
                          </p>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-3">
                          {/* Like */}
                          <button
                            onClick={() => handleLikeReply(review.id, reply.id)}
                            className="flex items-center gap-1.5 text-sm transition-colors"
                            style={{
                              color: reply.hasLiked ? 'var(--green-primary)' : 'var(--body-text)',
                              fontFamily: 'var(--font-inter)',
                            }}
                            onMouseEnter={(e) => {
                              if (!reply.hasLiked) {
                                e.currentTarget.style.color = 'var(--green-primary)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!reply.hasLiked) {
                                e.currentTarget.style.color = 'var(--body-text)';
                              }
                            }}
                          >
                            <svg
                              className="w-5 h-5"
                              fill={reply.hasLiked ? 'currentColor' : 'none'}
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                              />
                            </svg>
                            <span>{reply.likes}</span>
                          </button>

                          {/* Dislike */}
                          <button
                            onClick={() => handleDislikeReply(review.id, reply.id)}
                            className="flex items-center gap-1.5 text-sm transition-colors"
                            style={{
                              color: reply.hasDisliked ? '#dc2626' : 'var(--body-text)',
                              fontFamily: 'var(--font-inter)',
                            }}
                            onMouseEnter={(e) => {
                              if (!reply.hasDisliked) {
                                e.currentTarget.style.color = '#dc2626';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!reply.hasDisliked) {
                                e.currentTarget.style.color = 'var(--body-text)';
                              }
                            }}
                          >
                            <svg
                              className="w-5 h-5"
                              fill={reply.hasDisliked ? 'currentColor' : 'none'}
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5"
                              />
                            </svg>
                            <span>{reply.dislikes}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal for Review */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowDeleteConfirm(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-md w-[90%] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            style={{ fontFamily: 'var(--font-inter)' }}
          >
            <h3
              className="text-lg font-bold mb-4"
              style={{ color: 'var(--dark-text)', fontFamily: 'var(--font-serif)' }}
            >
              Obriši komentar
            </h3>
            <p
              className="text-base mb-6"
              style={{ color: 'var(--body-text)' }}
            >
              Da li ste sigurni da želite obrisati ovaj komentar? Ova akcija se ne može poništiti.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{
                  backgroundColor: 'var(--border-light)',
                  color: 'var(--dark-text)',
                }}
              >
                Otkaži
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('[Modal] Delete confirm button clicked', { reviewId: showDeleteConfirm });
                  handleDelete(showDeleteConfirm);
                }}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors text-white"
                style={{
                  backgroundColor: '#dc2626',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#b91c1c';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#dc2626';
                }}
              >
                Obriši
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal for Reply */}
      {showDeleteReplyConfirm && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]"
          onClick={() => setShowDeleteReplyConfirm(null)}
          style={{ zIndex: 9999 }}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-md w-[90%] shadow-2xl relative z-[10000]"
            onClick={(e) => e.stopPropagation()}
            style={{ fontFamily: 'var(--font-inter)', zIndex: 10000 }}
          >
            <h3
              className="text-lg font-bold mb-4"
              style={{ color: 'var(--dark-text)', fontFamily: 'var(--font-serif)' }}
            >
              Obriši odgovor
            </h3>
            <p
              className="text-base mb-6"
              style={{ color: 'var(--body-text)' }}
            >
              Da li ste sigurni da želite obrisati ovaj odgovor? Ova akcija se ne može poništiti.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowDeleteReplyConfirm(null);
                }}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{
                  backgroundColor: 'var(--border-light)',
                  color: 'var(--dark-text)',
                }}
              >
                Otkaži
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (showDeleteReplyConfirm) {
                    handleDeleteReply(showDeleteReplyConfirm.reviewId, showDeleteReplyConfirm.replyId);
                  }
                }}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors text-white"
                style={{
                  backgroundColor: '#dc2626',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#b91c1c';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#dc2626';
                }}
              >
                Obriši
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

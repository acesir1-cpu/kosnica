'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Breadcrumbs from '@/components/Breadcrumbs';
import Footer from '@/components/Footer';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { useToastContext } from '@/components/ToastProvider';
import { ROUTES } from '@/config/constants';
import { getProductById, type Product } from '@/lib/data';
import Pagination from '@/components/Pagination';

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
  shippingAddress?: AddressData;
  paymentMethod?: 'card' | 'cash' | 'transfer';
  paymentCardId?: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
};

type UserReply = {
  id: number;
  author: string;
  authorId?: number;
  avatar: string;
  timeAgo: string;
  comment: string;
  likes: number;
  dislikes: number;
  hasLiked?: boolean;
  hasDisliked?: boolean;
  createdAt?: string;
};

type UserReview = {
  id: number;
  author: string;
  authorId?: number;
  avatar: string;
  timeAgo: string;
  comment: string;
  likes: number;
  dislikes: number;
  hasLiked?: boolean;
  hasDisliked?: boolean;
  replies?: UserReply[];
  createdAt?: string;
  productId: number;
  productName?: string;
  isReply?: boolean; // If this is a reply to another comment
  parentReviewId?: number; // ID of parent comment if this is a reply
  parentComment?: string; // Preview of parent comment
};

export default function ProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, isLoading, logout, updateUser } = useAuth();
  const { addToCart } = useCart();
  const { showToast } = useToastContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [activeTab, setActiveTab] = useState<'personal' | 'orders' | 'address' | 'payment' | 'notifications' | 'security' | 'comments'>('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [isSavingNotifications, setIsSavingNotifications] = useState(false);
  const [isAddingCard, setIsAddingCard] = useState(false);
  
  const [personalData, setPersonalData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [addressData, setAddressData] = useState<AddressData>({
    street: '',
    city: '',
    postalCode: '',
    country: 'Bosna i Hercegovina',
  });

  const [paymentCards, setPaymentCards] = useState<PaymentCard[]>([]);
  const [showAddCard, setShowAddCard] = useState(false);
  const [newCard, setNewCard] = useState({
    cardNumber: '',
    cardholderName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
  });

  const [orders, setOrders] = useState<Order[]>([]);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<string | null>(null);
  const [ordersPage, setOrdersPage] = useState(1);
  const ORDERS_PER_PAGE = 3;
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    orderUpdates: true,
    promotions: false,
    newsletter: true,
    productRecommendations: true,
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showDeleteAccountConfirm, setShowDeleteAccountConfirm] = useState(false);
  
  // Comments state
  const [userReviews, setUserReviews] = useState<UserReview[]>([]);
  const [editingReviewId, setEditingReviewId] = useState<{ reviewId: number; productId: number } | null>(null);
  const [editingReviewText, setEditingReviewText] = useState('');
  const [showDeleteReviewConfirm, setShowDeleteReviewConfirm] = useState<{ reviewId: number; productId: number } | null>(null);
  const [commentsPage, setCommentsPage] = useState(1);
  const COMMENTS_PER_PAGE = 4; // Grupe proizvoda po stranici
  const COMMENTS_PER_GROUP = 10; // Maksimalno komentara po proizvodu prikazano
  const [hoveredProductId, setHoveredProductId] = useState<number | null>(null);
  const [commentFilter, setCommentFilter] = useState<'all' | 'comments' | 'replies'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingComments, setIsLoadingComments] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(`${ROUTES.LOGIN}?returnUrl=${encodeURIComponent(ROUTES.ACCOUNT)}`);
    }
  }, [isAuthenticated, isLoading, router]);

  // Load tab from URL parameter
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['personal', 'orders', 'address', 'payment', 'notifications', 'security', 'comments'].includes(tabParam)) {
      setActiveTab(tabParam as typeof activeTab);
      // Smooth scroll to content after a short delay
      setTimeout(() => {
        const contentElement = document.querySelector('[data-tab-content]');
        if (contentElement) {
          contentElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 200);
    }
  }, [searchParams]);

  // Load user data
  useEffect(() => {
    if (user) {
      setPersonalData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
      });

      // Load address from localStorage
      const savedAddress = localStorage.getItem(`kosnica_address_${user.id}`);
      if (savedAddress) {
        try {
          setAddressData(JSON.parse(savedAddress));
        } catch (e) {
          console.error('Error loading address:', e);
        }
      }

      // Load payment cards from localStorage
      const savedCards = localStorage.getItem(`kosnica_cards_${user.id}`);
      if (savedCards) {
        try {
          setPaymentCards(JSON.parse(savedCards));
        } catch (e) {
          console.error('Error loading cards:', e);
        }
      }

      // Load orders from localStorage
      const savedOrders = localStorage.getItem(`kosnica_orders_${user.id}`);
      if (savedOrders) {
        try {
          setOrders(JSON.parse(savedOrders));
          // Reset to first page when orders are loaded
          setOrdersPage(1);
        } catch (e) {
          console.error('Error loading orders:', e);
          setOrders([]);
          setOrdersPage(1);
        }
      } else {
        setOrders([]);
        setOrdersPage(1);
      }

      // Load notification settings from localStorage
      const savedNotifications = localStorage.getItem(`kosnica_notifications_${user.id}`);
      if (savedNotifications) {
        try {
          setNotificationSettings(JSON.parse(savedNotifications));
        } catch (e) {
          console.error('Error loading notifications:', e);
        }
      }
    }
  }, [user]);

  const handleSavePersonalData = async () => {
    if (!user) return;

    setIsSubmitting(true);
    
    // Clear previous errors
    const errors: Record<string, string> = {};

    // Validate
    if (!personalData.firstName.trim()) {
      errors.firstName = 'Ime je obavezno';
    } else if (personalData.firstName.trim().length < 2) {
      errors.firstName = 'Ime mora imati najmanje 2 karaktera';
    }

    if (!personalData.lastName.trim()) {
      errors.lastName = 'Prezime je obavezno';
    } else if (personalData.lastName.trim().length < 2) {
      errors.lastName = 'Prezime mora imati najmanje 2 karaktera';
    }

    if (!personalData.email.trim()) {
      errors.email = 'Email je obavezan';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personalData.email.trim())) {
      errors.email = 'Unesite važeću email adresu';
    }

    // Validate phone format if provided
    if (personalData.phone.trim() && !/^[\d\s\+\-\(\)]+$/.test(personalData.phone.trim())) {
      errors.phone = 'Unesite važeći format telefona';
    }

    // Set errors and stop if there are any
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      showToast('Molimo popravite greške u formi', 'error');
      setIsSubmitting(false);
      return;
    }

    // Clear errors
    setFieldErrors({});

    // Update user
    updateUser({
      firstName: personalData.firstName.trim(),
      lastName: personalData.lastName.trim(),
      email: personalData.email.trim(),
      phone: personalData.phone.trim() || undefined,
    });

    showToast('Podaci su uspješno ažurirani', 'success');
    setIsEditing(false);
    setIsSubmitting(false);
  };

  const handleSaveAddress = () => {
    if (!user) return;

    setIsSavingAddress(true);

    // Validate
    if (!addressData.street.trim() || !addressData.city.trim() || !addressData.postalCode.trim()) {
      showToast('Molimo popunite sva obavezna polja', 'error');
      setIsSavingAddress(false);
      return;
    }

    // Validate postal code format (should be numeric)
    if (!/^\d+$/.test(addressData.postalCode.trim())) {
      showToast('Poštanski broj mora sadržavati samo brojeve', 'error');
      setIsSavingAddress(false);
      return;
    }

    // Simulate save delay for better UX
    setTimeout(() => {
      // Save address
      localStorage.setItem(`kosnica_address_${user.id}`, JSON.stringify(addressData));
      showToast('Adresa je uspješno ažurirana', 'success');
      setIsSavingAddress(false);
    }, 300);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !e.target.files || !e.target.files[0]) return;

    const file = e.target.files[0];
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      showToast('Molimo izaberite sliku', 'error');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      showToast('Slika mora biti manja od 2MB', 'error');
      return;
    }

    setIsUploadingAvatar(true);

    // Create a local URL for the image (in real app, this would upload to server)
    const reader = new FileReader();
    reader.onloadend = () => {
      const avatarUrl = reader.result as string;
      updateUser({ avatar: avatarUrl });
      showToast('Profilna slika je uspješno ažurirana', 'success');
      setIsUploadingAvatar(false);
    };
    reader.onerror = () => {
      showToast('Greška pri učitavanju slike', 'error');
      setIsUploadingAvatar(false);
    };
    reader.readAsDataURL(file);
  };

  const handleAddCard = () => {
    if (!user) return;

    setIsAddingCard(true);

    // Validate
    if (!newCard.cardNumber.trim() || !newCard.cardholderName.trim() || 
        !newCard.expiryMonth || !newCard.expiryYear || !newCard.cvv.trim()) {
      showToast('Molimo popunite sva polja', 'error');
      setIsAddingCard(false);
      return;
    }

    // Validate cardholder name (should have at least 2 words for first and last name)
    const cardholderNameParts = newCard.cardholderName.trim().split(/\s+/);
    if (cardholderNameParts.length < 2 || cardholderNameParts.some(part => part.length < 2)) {
      showToast('Unesite puno ime i prezime vlasnika kartice', 'error');
      setIsAddingCard(false);
      return;
    }

    // Simple validation for card number (should be 16 digits)
    const cardNumber = newCard.cardNumber.replace(/\s/g, '');
    if (cardNumber.length !== 16 || !/^\d+$/.test(cardNumber)) {
      showToast('Unesite važeći broj kartice (16 cifara)', 'error');
      setIsAddingCard(false);
      return;
    }

    // Validate CVV (3-4 digits)
    const cvv = newCard.cvv.trim();
    if (!/^\d{3,4}$/.test(cvv)) {
      showToast('CVV mora imati 3 ili 4 cifre', 'error');
      setIsAddingCard(false);
      return;
    }

    // Validate expiry date
    const expiryMonth = parseInt(newCard.expiryMonth);
    const expiryYear = parseInt(newCard.expiryYear);
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    if (expiryMonth < 1 || expiryMonth > 12) {
      showToast('Unesite važeći mjesec (01-12)', 'error');
      setIsAddingCard(false);
      return;
    }

    if (expiryYear < currentYear || (expiryYear === currentYear && expiryMonth < currentMonth)) {
      showToast('Datum isteka ne može biti u prošlosti', 'error');
      setIsAddingCard(false);
      return;
    }

    if (expiryYear > currentYear + 20) {
      showToast('Datum isteka je previše daleko u budućnosti', 'error');
      setIsAddingCard(false);
      return;
    }

    // Create new card
    const card: PaymentCard = {
      id: `card_${Date.now()}`,
      last4: cardNumber.slice(-4),
      brand: cardNumber.startsWith('4') ? 'Visa' : cardNumber.startsWith('5') ? 'Mastercard' : 'Other',
      expiryMonth: parseInt(newCard.expiryMonth),
      expiryYear: parseInt(newCard.expiryYear),
      isDefault: paymentCards.length === 0,
    };

    const updatedCards = [...paymentCards, card];
    setPaymentCards(updatedCards);
    localStorage.setItem(`kosnica_cards_${user.id}`, JSON.stringify(updatedCards));

    // Reset form
    setNewCard({
      cardNumber: '',
      cardholderName: '',
      expiryMonth: '',
      expiryYear: '',
      cvv: '',
    });
    setShowAddCard(false);
    setIsAddingCard(false);
    showToast('Kartica je uspješno dodana', 'success');
  };

  const handleRemoveCard = (cardId: string) => {
    if (!user) return;

    const cardToRemove = paymentCards.find(c => c.id === cardId);
    const updatedCards = paymentCards.filter(c => c.id !== cardId);
    
    // If the removed card was default and there are other cards, set the first one as default
    if (cardToRemove?.isDefault && updatedCards.length > 0) {
      updatedCards[0].isDefault = true;
    }
    
    setPaymentCards(updatedCards);
    localStorage.setItem(`kosnica_cards_${user.id}`, JSON.stringify(updatedCards));
    showToast('Kartica je uspješno uklonjena', 'success');
  };

  const handleSetDefaultCard = (cardId: string) => {
    if (!user) return;

    const updatedCards = paymentCards.map(c => ({
      ...c,
      isDefault: c.id === cardId,
    }));
    setPaymentCards(updatedCards);
    localStorage.setItem(`kosnica_cards_${user.id}`, JSON.stringify(updatedCards));
    showToast('Zadana kartica je promijenjena', 'success');
  };

  const handleLogout = () => {
    logout();
    showToast('Uspješno ste se odjavili', 'info');
    router.push(ROUTES.HOME);
  };

  const handleSaveNotificationSettings = () => {
    if (!user) return;
    setIsSavingNotifications(true);
    // Simulate save delay for better UX
    setTimeout(() => {
      localStorage.setItem(`kosnica_notifications_${user.id}`, JSON.stringify(notificationSettings));
      showToast('Postavke notifikacija su uspješno sačuvane', 'success');
      setIsSavingNotifications(false);
    }, 300);
  };

  const handleChangePassword = () => {
    if (!user) return;

    setIsChangingPassword(true);

    // Validate
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      showToast('Molimo popunite sva polja', 'error');
      setIsChangingPassword(false);
      return;
    }

    // Check current password
    const passwords = JSON.parse(localStorage.getItem('kosnica_passwords') || '{}');
    const savedPassword = passwords[user.email.toLowerCase()];
    
    if (savedPassword !== passwordData.currentPassword) {
      showToast('Trenutna lozinka nije tačna', 'error');
      setIsChangingPassword(false);
      return;
    }

    // Validate new password length
    if (passwordData.newPassword.length < 6) {
      showToast('Nova lozinka mora imati najmanje 6 karaktera', 'error');
      setIsChangingPassword(false);
      return;
    }

    // Check if passwords match
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast('Nove lozinke se ne poklapaju', 'error');
      setIsChangingPassword(false);
      return;
    }

    // Check if new password is different from current
    if (passwordData.currentPassword === passwordData.newPassword) {
      showToast('Nova lozinka mora biti različita od trenutne', 'error');
      setIsChangingPassword(false);
      return;
    }

    // Update password
    passwords[user.email.toLowerCase()] = passwordData.newPassword;
    localStorage.setItem('kosnica_passwords', JSON.stringify(passwords));

    // Reset form
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });

    setIsChangingPassword(false);
    showToast('Lozinka je uspješno promijenjena', 'success');
  };

  const handleRequestAccountDeletionClick = () => {
    setShowDeleteAccountConfirm(true);
    document.body.style.overflow = 'hidden';
  };

  const handleConfirmAccountDeletion = () => {
    if (!user) return;

    // In a real app, this would send a request to the server
    // For now, we'll just show a message
    showToast('Zahtjev za brisanje naloga je poslan. Biće obrađen u roku od 30 dana.', 'info');
    
    // Optionally, we could mark the account for deletion
    const deletionRequest = {
      userId: user.id,
      requestedAt: new Date().toISOString(),
      status: 'pending',
    };
    localStorage.setItem(`kosnica_deletion_request_${user.id}`, JSON.stringify(deletionRequest));
    
    setShowDeleteAccountConfirm(false);
    document.body.style.overflow = 'unset';
  };

  const handleCancelAccountDeletion = () => {
    setShowDeleteAccountConfirm(false);
    document.body.style.overflow = 'unset';
  };

  const handleOpenOrderModal = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
  };

  const handleCloseOrderModal = () => {
    setShowOrderModal(false);
    setSelectedOrder(null);
    document.body.style.overflow = 'unset';
  };

  const handleCancelOrderClick = (orderId: string) => {
    setOrderToCancel(orderId);
    setShowCancelConfirm(true);
    // Don't close order modal, but ensure cancel modal is on top
    document.body.style.overflow = 'hidden';
  };

  const handleConfirmCancel = () => {
    if (!user || !orderToCancel) return;

    const updatedOrders = orders.map((o) =>
      o.id === orderToCancel ? { ...o, status: 'cancelled' as const } : o
    );
    setOrders(updatedOrders);
    localStorage.setItem(`kosnica_orders_${user.id}`, JSON.stringify(updatedOrders));
    // Reset to first page if current page would be empty
    const totalPages = Math.ceil(updatedOrders.length / ORDERS_PER_PAGE);
    if (ordersPage > totalPages && totalPages > 0) {
      setOrdersPage(totalPages);
    }
    showToast('Narudžba je otkazana', 'info');
    if (selectedOrder?.id === orderToCancel) {
      setSelectedOrder({ ...selectedOrder, status: 'cancelled' });
    }
    setShowCancelConfirm(false);
    setOrderToCancel(null);
    document.body.style.overflow = 'unset';
  };

  const handleCancelConfirmClose = () => {
    setShowCancelConfirm(false);
    setOrderToCancel(null);
    document.body.style.overflow = 'unset';
  };

  const handleReorderItems = () => {
    if (!selectedOrder) return;
    
    // Add all items from the order to cart
    let addedCount = 0;
    selectedOrder.items.forEach((item) => {
      addToCart(item.productId, item.quantity, item.weight);
      addedCount += item.quantity;
    });
    
    showToast(`${addedCount} ${addedCount === 1 ? 'proizvod je' : 'proizvoda su'} dodati u korpu`, 'success');
    
    // Close modal and navigate to cart after a short delay
    setTimeout(() => {
      handleCloseOrderModal();
      router.push(ROUTES.CART);
    }, 500);
  };

  const handlePrintOrder = () => {
    if (!selectedOrder) return;
    window.print();
  };

  // Load user reviews from localStorage
  useEffect(() => {
    if (!user || !user.id) return;

    const loadUserReviews = () => {
      if (activeTab !== 'comments') return;
      
      setIsLoadingComments(true);
      // Small delay for better UX feedback
      setTimeout(() => {
        const allReviews: UserReview[] = [];
        
        if (typeof window !== 'undefined') {
          // Get all localStorage keys that start with kosnica_reviews_
          const keys = Object.keys(localStorage).filter(key => key.startsWith('kosnica_reviews_'));
          
          keys.forEach(key => {
            try {
              const savedData = localStorage.getItem(key);
              if (savedData) {
                const parsed = JSON.parse(savedData);
                const reviews: any[] = parsed.reviews || (Array.isArray(parsed) ? parsed : []);
                const productId = parseInt(key.replace('kosnica_reviews_', ''));
                const product = getProductById(productId);
                
                // Filter reviews that belong to current user
                reviews.forEach((review: any) => {
                  const userFullName = `${user.firstName} ${user.lastName}`;
                  const isUserReview = review.authorId === user.id || 
                                     (review.authorId === undefined && review.author === userFullName);
                  
                  if (isUserReview) {
                    allReviews.push({
                      ...review,
                      productId,
                      productName: product?.name,
                      timeAgo: formatTimeAgo(review.createdAt || review.timeAgo), // Format time from createdAt
                    });
                  }
                  
                  // Also check replies for user's replies
                  if (review.replies && Array.isArray(review.replies)) {
                    review.replies.forEach((reply: any) => {
                      const isUserReply = reply.authorId === user.id || 
                                         (reply.authorId === undefined && reply.author === userFullName);
                      
                      if (isUserReply) {
                        // Add reply as a separate review entry with parent info
                        allReviews.push({
                          ...reply,
                          productId,
                          productName: product?.name,
                          timeAgo: formatTimeAgo(reply.createdAt || reply.timeAgo),
                          isReply: true,
                          parentReviewId: review.id,
                          parentComment: review.comment.substring(0, 100), // First 100 chars of parent comment
                        });
                      }
                    });
                  }
                });
              }
            } catch (error) {
              console.error(`Error loading reviews from ${key}:`, error);
            }
          });
          
          // Sort by creation date (newest first)
          allReviews.sort((a, b) => {
            const aTime = new Date(a.createdAt || 0).getTime();
            const bTime = new Date(b.createdAt || 0).getTime();
            return bTime - aTime;
          });
          
          setUserReviews(allReviews);
          setIsLoadingComments(false);
        }
      }, 200);
    };

    loadUserReviews();
  }, [user, activeTab]); // Reload when switching to comments tab

  // Close modals on ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showDeleteAccountConfirm) {
          handleCancelAccountDeletion();
        } else if (showCancelConfirm) {
          handleCancelConfirmClose();
        } else if (showOrderModal) {
          handleCloseOrderModal();
        } else if (showDeleteReviewConfirm) {
          setShowDeleteReviewConfirm(null);
        } else if (editingReviewId) {
          setEditingReviewId(null);
          setEditingReviewText('');
        }
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [showDeleteAccountConfirm, showCancelConfirm, showOrderModal, showDeleteReviewConfirm, editingReviewId]);

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return '#f59e0b';
      case 'processing':
        return '#3b82f6';
      case 'shipped':
        return '#8b5cf6';
      case 'delivered':
        return '#10b981';
      case 'cancelled':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getStatusLabel = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'Na čekanju';
      case 'processing':
        return 'U obradi';
      case 'shipped':
        return 'Poslato';
      case 'delivered':
        return 'Dostavljeno';
      case 'cancelled':
        return 'Otkazano';
      default:
        return status;
    }
  };

  // Format time ago from ISO timestamp or existing timeAgo string
  const formatTimeAgo = (createdAtOrTimeAgo?: string): string => {
    if (!createdAtOrTimeAgo) return 'nepoznato vrijeme';
    
    // If it's already formatted (contains "prije" or "sada"), return as is
    if (createdAtOrTimeAgo.includes('prije') || createdAtOrTimeAgo === 'sada') {
      return createdAtOrTimeAgo;
    }
    
    try {
      const now = new Date();
      const created = new Date(createdAtOrTimeAgo);
      
      // Check if date is valid
      if (isNaN(created.getTime())) {
        return createdAtOrTimeAgo; // Return original if invalid
      }
      
      const diffInMs = now.getTime() - created.getTime();
      const diffInSeconds = Math.floor(diffInMs / 1000);
      const diffInMinutes = Math.floor(diffInSeconds / 60);
      const diffInHours = Math.floor(diffInMinutes / 60);
      const diffInDays = Math.floor(diffInHours / 24);
      
      if (diffInSeconds < 60) return 'sada';
      if (diffInMinutes < 60) {
        if (diffInMinutes === 1) return 'prije 1 minutu';
        return `prije ${diffInMinutes} minuta`;
      }
      if (diffInHours < 24) {
        if (diffInHours === 1) return 'prije 1 sat';
        if (diffInHours < 5) return `prije ${diffInHours} sata`;
        return `prije ${diffInHours} sati`;
      }
      if (diffInDays < 7) {
        if (diffInDays === 1) return 'prije 1 dan';
        return `prije ${diffInDays} dana`;
      }
      if (diffInDays < 30) {
        const weeks = Math.floor(diffInDays / 7);
        if (weeks === 1) return 'prije 1 tjedan';
        return `prije ${weeks} tjedna`;
      }
      if (diffInDays < 365) {
        const months = Math.floor(diffInDays / 30);
        if (months === 1) return 'prije 1 mjesec';
        return `prije ${months} mjeseca`;
      }
      const years = Math.floor(diffInDays / 365);
      if (years === 1) return 'prije 1 godinu';
      return `prije ${years} godina`;
    } catch (error) {
      return createdAtOrTimeAgo; // Return original on error
    }
  };

  // Handle edit review
  const handleEditReview = (reviewId: number, productId: number) => {
    const review = userReviews.find(r => r.id === reviewId && r.productId === productId);
    if (review) {
      setEditingReviewId({ reviewId, productId });
      setEditingReviewText(review.comment);
      // Scroll to editing comment
      setTimeout(() => {
        const element = document.querySelector(`[data-review-id="${reviewId}-${productId}"]`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  };

  // Handle save review edit
  const handleSaveReviewEdit = () => {
    if (!editingReviewId || !editingReviewText.trim()) {
      showToast('Komentar ne može biti prazan', 'error');
      return;
    }

    const { reviewId, productId } = editingReviewId;
    const storageKey = `kosnica_reviews_${productId}`;
    
    // Check if this is a reply or a main review
    const currentReview = userReviews.find(r => r.id === reviewId && r.productId === productId);
    const isReply = currentReview?.isReply === true;
    const parentReviewId = currentReview?.parentReviewId;
    
    try {
      const savedData = localStorage.getItem(storageKey);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        const reviews: any[] = parsed.reviews || [];
        
        let updatedReviews;
        
        if (isReply && parentReviewId) {
          // Update reply in parent review's replies array
          updatedReviews = reviews.map((review: any) => {
            if (review.id === parentReviewId && review.replies) {
              return {
                ...review,
                replies: review.replies.map((reply: any) => {
                  if (reply.id === reviewId) {
                    return {
                      ...reply,
                      comment: editingReviewText.trim(),
                    };
                  }
                  return reply;
                }),
              };
            }
            return review;
          });
        } else {
          // Update main review
          updatedReviews = reviews.map((review: any) => {
            if (review.id === reviewId) {
              return {
                ...review,
                comment: editingReviewText.trim(),
              };
            }
            return review;
          });
        }
        
        // Save back to localStorage
        const updatedData = {
          ...parsed,
          reviews: updatedReviews,
        };
        localStorage.setItem(storageKey, JSON.stringify(updatedData));
        
        // Update local state
        setUserReviews(userReviews.map(review => {
          if (review.id === reviewId && review.productId === productId) {
            return {
              ...review,
              comment: editingReviewText.trim(),
            };
          }
          return review;
        }));
        
        showToast(isReply ? 'Odgovor je uspješno izmijenjen' : 'Komentar je uspješno izmijenjen', 'success');
        setEditingReviewId(null);
        setEditingReviewText('');
      }
    } catch (error) {
      console.error('Error updating review:', error);
      showToast('Greška pri ažuriranju komentara', 'error');
    }
  };

  // Handle delete review
  const handleDeleteReview = () => {
    if (!showDeleteReviewConfirm) return;

    const { reviewId, productId } = showDeleteReviewConfirm;
    const storageKey = `kosnica_reviews_${productId}`;
    
    // Check if this is a reply or a main review
    const currentReview = userReviews.find(r => r.id === reviewId && r.productId === productId);
    const isReply = currentReview?.isReply === true;
    const parentReviewId = currentReview?.parentReviewId;
    
    try {
      const savedData = localStorage.getItem(storageKey);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        const reviews: any[] = parsed.reviews || [];
        
        let updatedReviews;
        
        if (isReply && parentReviewId) {
          // Remove reply from parent review's replies array
          updatedReviews = reviews.map((review: any) => {
            if (review.id === parentReviewId && review.replies) {
              return {
                ...review,
                replies: review.replies.filter((reply: any) => reply.id !== reviewId),
              };
            }
            return review;
          });
        } else {
          // Remove main review
          updatedReviews = reviews.filter((review: any) => review.id !== reviewId);
        }
        
        // Save back to localStorage
        const updatedData = {
          ...parsed,
          reviews: updatedReviews,
        };
        localStorage.setItem(storageKey, JSON.stringify(updatedData));
        
        // Update local state
        setUserReviews(userReviews.filter(review => 
          !(review.id === reviewId && review.productId === productId)
        ));
        
        showToast(isReply ? 'Odgovor je uspješno obrisan' : 'Komentar je uspješno obrisan', 'success');
        setShowDeleteReviewConfirm(null);
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      showToast('Greška pri brisanju komentara', 'error');
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--cream)' }}>
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4">
            <svg className="w-16 h-16 animate-spin text-amber-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p
            className="text-lg font-medium"
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

  // Don't render if not authenticated
  if (!isAuthenticated || !user) {
    return null;
  }

  const fullName = `${user.firstName} ${user.lastName}`;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#ffffff' }}>
      <div className="container mx-auto px-8 max-lg:px-6 max-md:px-4 py-12 max-w-7xl">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: 'Početna', href: ROUTES.HOME },
            { label: 'Moj nalog' },
          ]}
        />

        {/* Header */}
        <div className="mb-8 mt-8">
          <h1
            className="text-5xl max-md:text-4xl max-sm:text-3xl font-bold mb-4"
            style={{
              fontFamily: 'var(--font-serif)',
              color: 'var(--dark-text)',
            }}
          >
            Moj nalog
          </h1>
          <p
            className="text-lg"
            style={{
              fontFamily: 'var(--font-inter)',
              color: 'var(--body-text)',
            }}
          >
            Upravljajte svojim podacima i postavkama
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-8">
          {/* Left Sidebar - Profile Summary */}
          <aside className="lg:col-span-1">
            <div
              className="bg-white rounded-2xl p-6 shadow-sm border sticky top-8 transition-all duration-200"
              style={{ 
                borderColor: 'var(--border-light)',
              }}
            >
              {/* Profile Picture */}
              <div className="text-center mb-8">
                <div className="relative inline-block mb-5">
                  <div
                    className="w-28 h-28 rounded-full overflow-hidden border-4 mx-auto bg-gradient-to-br from-amber-50 to-amber-100 transition-all duration-200"
                    style={{ 
                      borderColor: 'rgba(212, 167, 44, 0.4)',
                      boxShadow: '0 2px 8px rgba(212, 167, 44, 0.15)',
                    }}
                  >
                    {user.avatar ? (
                      <Image
                        src={user.avatar}
                        alt={fullName}
                        width={96}
                        height={96}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center text-3xl font-bold"
                        style={{
                          background: 'linear-gradient(135deg, #f5c852 0%, #f0c855 100%)',
                          color: 'var(--dark-text)',
                        }}
                      >
                        {user.firstName.charAt(0).toUpperCase()}
                        {user.lastName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingAvatar}
                    className="absolute bottom-0 right-0 w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-200 disabled:opacity-50"
                    style={{
                      background: 'linear-gradient(135deg, #f5c852 0%, #f0c855 100%)',
                      borderColor: 'white',
                      color: 'var(--dark-text)',
                      boxShadow: '0 2px 8px rgba(212, 167, 44, 0.3)',
                    }}
                    onMouseEnter={(e) => {
                      if (!isUploadingAvatar) {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #f8d275 0%, #f5c852 100%)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(212, 167, 44, 0.4)';
                        e.currentTarget.style.transform = 'scale(1.05)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #f5c852 0%, #d4a72c 100%)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(212, 167, 44, 0.3)';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                    aria-label="Promijeni profilnu sliku"
                  >
                    {isUploadingAvatar ? (
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </div>
                <h2
                  className="text-xl font-bold mb-2"
                  style={{
                    fontFamily: 'var(--font-serif)',
                    color: 'var(--dark-text)',
                  }}
                >
                  {fullName}
                </h2>
                <p
                  className="text-sm mb-1"
                  style={{
                    fontFamily: 'var(--font-inter)',
                    color: 'var(--body-text)',
                  }}
                >
                  {user.email}
                </p>
                {user.createdAt && (
                  <p
                    className="text-xs"
                    style={{
                      fontFamily: 'var(--font-inter)',
                      color: 'var(--body-text)',
                      opacity: 0.7,
                    }}
                  >
                    Član od {(() => {
                      const date = new Date(user.createdAt);
                      const day = date.getDate().toString().padStart(2, '0');
                      const month = (date.getMonth() + 1).toString().padStart(2, '0');
                      const year = date.getFullYear();
                      return `${day}.${month}.${year}.`;
                    })()}
                  </p>
                )}
              </div>

              {/* Navigation Tabs */}
              <nav className="space-y-2 mb-6">
                {[
                  { 
                    id: 'personal', 
                    label: 'Lični podaci', 
                    icon: (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    )
                  },
                  { 
                    id: 'orders', 
                    label: 'Moje narudžbe', 
                    icon: (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                    )
                  },
                  { 
                    id: 'address', 
                    label: 'Adresa', 
                    icon: (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )
                  },
                  { 
                    id: 'payment', 
                    label: 'Načini plaćanja', 
                    icon: (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    )
                  },
                  { 
                    id: 'notifications', 
                    label: 'Notifikacije', 
                    icon: (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                    )
                  },
                  { 
                    id: 'comments', 
                    label: 'Moji komentari', 
                    icon: (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    )
                  },
                  { 
                    id: 'security', 
                    label: 'Sigurnost', 
                    icon: (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    )
                  },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id as typeof activeTab);
                      // Reset orders page when switching to orders tab
                      if (tab.id === 'orders') {
                        setOrdersPage(1);
                      }
                      // Reset comments page when switching to comments tab
                      if (tab.id === 'comments') {
                        setCommentsPage(1);
                      }
                      // Smooth scroll to content
                      setTimeout(() => {
                        const contentElement = document.querySelector('[data-tab-content]');
                        if (contentElement) {
                          contentElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      }, 100);
                    }}
                    className={`w-full px-4 py-3 rounded-xl text-left transition-all duration-200 flex items-center gap-3 ${
                      activeTab === tab.id ? 'font-semibold' : 'font-medium'
                    }`}
                    style={{
                      background: activeTab === tab.id 
                        ? 'linear-gradient(135deg, rgba(245, 200, 82, 0.15) 0%, rgba(212, 167, 44, 0.2) 100%)' 
                        : 'transparent',
                      color: activeTab === tab.id ? 'var(--dark-text)' : 'var(--body-text)',
                      fontFamily: 'var(--font-inter)',
                      border: 'none',
                      outline: 'none',
                      boxShadow: 'none',
                      borderRight: activeTab === tab.id ? '3px solid var(--honey-gold)' : 'none',
                    }}
                    onMouseEnter={(e) => {
                      if (activeTab !== tab.id) {
                        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(245, 200, 82, 0.08) 0%, rgba(212, 167, 44, 0.12) 100%)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (activeTab !== tab.id) {
                        e.currentTarget.style.background = 'transparent';
                      }
                    }}
                  >
                    <span className={activeTab === tab.id ? 'text-var(--dark-text)' : ''}>
                      {tab.icon}
                    </span>
                    {tab.label}
                  </button>
                ))}
              </nav>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="w-full mt-6 px-4 py-3 rounded-xl text-left transition-colors duration-200 font-medium flex items-center gap-2"
                style={{
                  backgroundColor: 'transparent',
                  color: '#dc2626',
                  border: '1px solid #dc2626',
                  fontFamily: 'var(--font-inter)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#fee2e2';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Odjavi se
              </button>
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3" data-tab-content>
            {/* Personal Information Tab */}
            {activeTab === 'personal' && (
              <div
                className="bg-white rounded-2xl p-8 shadow-lg border transition-all duration-300 animate-fade-in"
                style={{ 
                  borderColor: 'var(--border-light)',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
                }}
              >
                <div className="flex items-center justify-between mb-8 pb-6 border-b" style={{ borderColor: 'var(--border-light)' }}>
                  <div>
                    <h2
                      className="text-3xl font-bold mb-2"
                      style={{
                        fontFamily: 'var(--font-serif)',
                        color: 'var(--dark-text)',
                      }}
                    >
                      Lični podaci
                    </h2>
                    <p
                      className="text-sm"
                      style={{
                        fontFamily: 'var(--font-inter)',
                        color: 'var(--body-text)',
                        opacity: 0.8,
                      }}
                    >
                      Upravljajte svojim osnovnim informacijama
                    </p>
                  </div>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-5 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
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
                        e.currentTarget.style.background = 'linear-gradient(135deg, #f5c852 0%, #d4a72c 100%)';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(212, 167, 44, 0.25)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Uredi podatke
                    </button>
                  ) : (
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          // Reset to original values
                          if (user) {
                            setPersonalData({
                              firstName: user.firstName || '',
                              lastName: user.lastName || '',
                              email: user.email || '',
                              phone: user.phone || '',
                            });
                          }
                        }}
                        className="px-5 py-2.5 rounded-lg font-medium transition-colors duration-200"
                        style={{
                          backgroundColor: 'var(--border-light)',
                          color: 'var(--dark-text)',
                          fontFamily: 'var(--font-inter)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#e5e5e5';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--border-light)';
                        }}
                      >
                        Otkaži
                      </button>
                      <button
                        onClick={handleSavePersonalData}
                        disabled={isSubmitting}
                        className="px-5 py-2.5 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
                        style={{
                          background: 'linear-gradient(135deg, #f5c852 0%, #f0c855 100%)',
                          color: 'var(--dark-text)',
                          fontFamily: 'var(--font-inter)',
                          boxShadow: '0 2px 8px rgba(212, 167, 44, 0.25)',
                          border: '1px solid rgba(212, 167, 44, 0.2)',
                        }}
                        onMouseEnter={(e) => {
                          if (!isSubmitting) {
                            e.currentTarget.style.background = 'linear-gradient(135deg, #f8d275 0%, #f5c852 100%)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(212, 167, 44, 0.35)';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'linear-gradient(135deg, #f5c852 0%, #d4a72c 100%)';
                          e.currentTarget.style.boxShadow = '0 2px 8px rgba(212, 167, 44, 0.25)';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        {isSubmitting ? (
                          <>
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Čuvanje...
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Sačuvaj promjene
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* First Name */}
                  <div>
                    <label
                      className="block text-sm font-semibold mb-3"
                      style={{
                        fontFamily: 'var(--font-inter)',
                        color: 'var(--dark-text)',
                      }}
                    >
                      Ime <span className="text-red-500">*</span>
                    </label>
                    {isEditing ? (
                      <div className="relative">
                        <input
                          type="text"
                          value={personalData.firstName}
                          onChange={(e) => {
                            const value = e.target.value;
                            setPersonalData({ ...personalData, firstName: value });
                            // Real-time validation
                            if (value.trim() && value.trim().length < 2) {
                              setFieldErrors({ ...fieldErrors, firstName: 'Ime mora imati najmanje 2 karaktera' });
                            } else {
                              const newErrors = { ...fieldErrors };
                              delete newErrors.firstName;
                              setFieldErrors(newErrors);
                            }
                          }}
                          className="w-full px-4 py-3.5 pr-10 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2"
                          style={{
                            borderColor: fieldErrors.firstName ? '#ef4444' : 'var(--border-light)',
                            fontFamily: 'var(--font-inter)',
                            color: 'var(--dark-text)',
                            backgroundColor: '#ffffff',
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = fieldErrors.firstName ? '#ef4444' : 'var(--honey-gold)';
                            e.target.style.boxShadow = fieldErrors.firstName 
                              ? '0 0 0 4px rgba(239, 68, 68, 0.1)'
                              : '0 0 0 4px rgba(212, 167, 44, 0.1)';
                            e.target.style.backgroundColor = 'var(--warm-white)';
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = fieldErrors.firstName ? '#ef4444' : 'var(--border-light)';
                            e.target.style.boxShadow = 'none';
                            e.target.style.backgroundColor = '#ffffff';
                          }}
                          aria-invalid={!!fieldErrors.firstName}
                          aria-describedby={fieldErrors.firstName ? 'firstName-error' : undefined}
                        />
                        {personalData.firstName && !fieldErrors.firstName && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                        {fieldErrors.firstName && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </div>
                        )}
                        {fieldErrors.firstName && (
                          <p id="firstName-error" className="text-xs text-red-500 mt-1.5" style={{ fontFamily: 'var(--font-inter)' }}>
                            {fieldErrors.firstName}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p
                        className="px-4 py-3.5 rounded-xl border-2 transition-all duration-300"
                        style={{
                          backgroundColor: 'var(--cream)',
                          borderColor: 'var(--border-light)',
                          fontFamily: 'var(--font-inter)',
                          color: 'var(--dark-text)',
                        }}
                      >
                        {personalData.firstName || '-'}
                      </p>
                    )}
                  </div>

                  {/* Last Name */}
                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{
                        fontFamily: 'var(--font-inter)',
                        color: 'var(--dark-text)',
                      }}
                    >
                      Prezime <span className="text-red-500">*</span>
                    </label>
                    {isEditing ? (
                      <div className="relative">
                        <input
                          type="text"
                          value={personalData.lastName}
                          onChange={(e) => {
                            const value = e.target.value;
                            setPersonalData({ ...personalData, lastName: value });
                            if (value.trim() && value.trim().length < 2) {
                              setFieldErrors({ ...fieldErrors, lastName: 'Prezime mora imati najmanje 2 karaktera' });
                            } else {
                              const newErrors = { ...fieldErrors };
                              delete newErrors.lastName;
                              setFieldErrors(newErrors);
                            }
                          }}
                          className="w-full px-4 py-3.5 pr-10 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2"
                          style={{
                            borderColor: fieldErrors.lastName ? '#ef4444' : 'var(--border-light)',
                            fontFamily: 'var(--font-inter)',
                            color: 'var(--dark-text)',
                            backgroundColor: '#ffffff',
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = fieldErrors.lastName ? '#ef4444' : 'var(--honey-gold)';
                            e.target.style.boxShadow = fieldErrors.lastName 
                              ? '0 0 0 4px rgba(239, 68, 68, 0.1)'
                              : '0 0 0 4px rgba(212, 167, 44, 0.1)';
                            e.target.style.backgroundColor = 'var(--warm-white)';
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = fieldErrors.lastName ? '#ef4444' : 'var(--border-light)';
                            e.target.style.boxShadow = 'none';
                            e.target.style.backgroundColor = '#ffffff';
                          }}
                          aria-invalid={!!fieldErrors.lastName}
                        />
                        {personalData.lastName && !fieldErrors.lastName && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                        {fieldErrors.lastName && (
                          <>
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </div>
                            <p className="text-xs text-red-500 mt-1.5" style={{ fontFamily: 'var(--font-inter)' }}>
                              {fieldErrors.lastName}
                            </p>
                          </>
                        )}
                      </div>
                    ) : (
                      <p
                        className="px-4 py-3 rounded-lg"
                        style={{
                          backgroundColor: 'var(--cream)',
                          fontFamily: 'var(--font-inter)',
                          color: 'var(--dark-text)',
                        }}
                      >
                        {personalData.lastName || '-'}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{
                        fontFamily: 'var(--font-inter)',
                        color: 'var(--dark-text)',
                      }}
                    >
                      Email adresa <span className="text-red-500">*</span>
                    </label>
                    {isEditing ? (
                      <div className="relative">
                        <input
                          type="email"
                          value={personalData.email}
                          onChange={(e) => {
                            const value = e.target.value;
                            setPersonalData({ ...personalData, email: value });
                            if (value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
                              setFieldErrors({ ...fieldErrors, email: 'Unesite važeću email adresu' });
                            } else {
                              const newErrors = { ...fieldErrors };
                              delete newErrors.email;
                              setFieldErrors(newErrors);
                            }
                          }}
                          className="w-full px-4 py-3.5 pr-10 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2"
                          style={{
                            borderColor: fieldErrors.email ? '#ef4444' : 'var(--border-light)',
                            fontFamily: 'var(--font-inter)',
                            color: 'var(--dark-text)',
                            backgroundColor: '#ffffff',
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = fieldErrors.email ? '#ef4444' : 'var(--honey-gold)';
                            e.target.style.boxShadow = fieldErrors.email 
                              ? '0 0 0 4px rgba(239, 68, 68, 0.1)'
                              : '0 0 0 4px rgba(212, 167, 44, 0.1)';
                            e.target.style.backgroundColor = 'var(--warm-white)';
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = fieldErrors.email ? '#ef4444' : 'var(--border-light)';
                            e.target.style.boxShadow = 'none';
                            e.target.style.backgroundColor = '#ffffff';
                          }}
                          aria-invalid={!!fieldErrors.email}
                        />
                        {personalData.email && !fieldErrors.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personalData.email.trim()) && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                        {fieldErrors.email && (
                          <>
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </div>
                            <p className="text-xs text-red-500 mt-1.5" style={{ fontFamily: 'var(--font-inter)' }}>
                              {fieldErrors.email}
                            </p>
                          </>
                        )}
                      </div>
                    ) : (
                      <p
                        className="px-4 py-3 rounded-lg"
                        style={{
                          backgroundColor: 'var(--cream)',
                          fontFamily: 'var(--font-inter)',
                          color: 'var(--dark-text)',
                        }}
                      >
                        {personalData.email || '-'}
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{
                        fontFamily: 'var(--font-inter)',
                        color: 'var(--dark-text)',
                      }}
                    >
                      Telefon
                    </label>
                    {isEditing ? (
                      <div className="relative">
                        <input
                          type="tel"
                          value={personalData.phone}
                          onChange={(e) => {
                            const value = e.target.value;
                            setPersonalData({ ...personalData, phone: value });
                            if (value.trim() && !/^[\d\s\+\-\(\)]+$/.test(value.trim())) {
                              setFieldErrors({ ...fieldErrors, phone: 'Unesite važeći format telefona' });
                            } else {
                              const newErrors = { ...fieldErrors };
                              delete newErrors.phone;
                              setFieldErrors(newErrors);
                            }
                          }}
                          className="w-full px-4 py-3.5 pr-10 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2"
                          style={{
                            borderColor: fieldErrors.phone ? '#ef4444' : 'var(--border-light)',
                            fontFamily: 'var(--font-inter)',
                            color: 'var(--dark-text)',
                            backgroundColor: '#ffffff',
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = fieldErrors.phone ? '#ef4444' : 'var(--honey-gold)';
                            e.target.style.boxShadow = fieldErrors.phone 
                              ? '0 0 0 4px rgba(239, 68, 68, 0.1)'
                              : '0 0 0 4px rgba(212, 167, 44, 0.1)';
                            e.target.style.backgroundColor = 'var(--warm-white)';
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = fieldErrors.phone ? '#ef4444' : 'var(--border-light)';
                            e.target.style.boxShadow = 'none';
                            e.target.style.backgroundColor = '#ffffff';
                          }}
                          placeholder="+387 61 123 456"
                          aria-invalid={!!fieldErrors.phone}
                        />
                        {personalData.phone && !fieldErrors.phone && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                        {fieldErrors.phone && (
                          <>
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </div>
                            <p className="text-xs text-red-500 mt-1.5" style={{ fontFamily: 'var(--font-inter)' }}>
                              {fieldErrors.phone}
                            </p>
                          </>
                        )}
                      </div>
                    ) : (
                      <p
                        className="px-4 py-3 rounded-lg"
                        style={{
                          backgroundColor: 'var(--cream)',
                          fontFamily: 'var(--font-inter)',
                          color: 'var(--dark-text)',
                        }}
                      >
                        {personalData.phone || '-'}
                      </p>
                    )}
                  </div>
                </div>

                {/* Info Message */}
                <div
                  className="mt-8 p-5 rounded-xl border-2 transition-all duration-300"
                  style={{
                    backgroundColor: 'rgba(212, 167, 44, 0.08)',
                    borderColor: 'rgba(212, 167, 44, 0.3)',
                  }}
                >
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--honey-gold)' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p
                      className="text-sm leading-relaxed"
                      style={{
                        fontFamily: 'var(--font-inter)',
                        color: 'var(--body-text)',
                      }}
                    >
                      <strong>Napomena:</strong> Promjena email adrese zahtijeva verifikaciju. Novi email će biti poslat na novu adresu za potvrdu.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Address Tab */}
            {activeTab === 'address' && (
              <div
                className="bg-white rounded-2xl p-8 shadow-lg border transition-all duration-300 animate-fade-in"
                style={{ 
                  borderColor: 'var(--border-light)',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
                }}
              >
                <div className="mb-8 pb-6 border-b" style={{ borderColor: 'var(--border-light)' }}>
                  <h2
                    className="text-3xl font-bold mb-2"
                    style={{
                      fontFamily: 'var(--font-serif)',
                      color: 'var(--dark-text)',
                    }}
                  >
                    Adresa za dostavu
                  </h2>
                  <p
                    className="text-sm"
                    style={{
                      fontFamily: 'var(--font-inter)',
                      color: 'var(--body-text)',
                      opacity: 0.8,
                    }}
                  >
                    Upravljajte adresom za dostavu vaših narudžbi
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Street */}
                  <div>
                    <label
                      className="block text-sm font-semibold mb-3"
                      style={{
                        fontFamily: 'var(--font-inter)',
                        color: 'var(--dark-text)',
                      }}
                    >
                      Ulica i broj <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={addressData.street}
                      onChange={(e) => setAddressData({ ...addressData, street: e.target.value })}
                      className="w-full px-4 py-3.5 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2"
                      style={{
                        borderColor: 'var(--border-light)',
                        fontFamily: 'var(--font-inter)',
                        color: 'var(--dark-text)',
                        backgroundColor: '#ffffff',
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = 'var(--honey-gold)';
                        e.target.style.boxShadow = '0 0 0 4px rgba(212, 167, 44, 0.1)';
                        e.target.style.backgroundColor = 'var(--warm-white)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'var(--border-light)';
                        e.target.style.boxShadow = 'none';
                        e.target.style.backgroundColor = '#ffffff';
                      }}
                      placeholder="Naziv ulice i broj"
                      aria-label="Ulica i broj"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* City */}
                    <div>
                      <label
                        className="block text-sm font-medium mb-2"
                        style={{
                          fontFamily: 'var(--font-inter)',
                          color: 'var(--dark-text)',
                        }}
                      >
                        Grad <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={addressData.city}
                        onChange={(e) => setAddressData({ ...addressData, city: e.target.value })}
                        className="w-full px-4 py-3.5 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2"
                        style={{
                          borderColor: 'var(--border-light)',
                          fontFamily: 'var(--font-inter)',
                          color: 'var(--dark-text)',
                          backgroundColor: '#ffffff',
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = 'var(--honey-gold)';
                          e.target.style.boxShadow = '0 0 0 4px rgba(212, 167, 44, 0.1)';
                          e.target.style.backgroundColor = 'var(--warm-white)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = 'var(--border-light)';
                          e.target.style.boxShadow = 'none';
                          e.target.style.backgroundColor = '#ffffff';
                        }}
                        placeholder="Naziv grada"
                      />
                    </div>

                    {/* Postal Code */}
                    <div>
                      <label
                        className="block text-sm font-medium mb-2"
                        style={{
                          fontFamily: 'var(--font-inter)',
                          color: 'var(--dark-text)',
                        }}
                      >
                        Poštanski broj <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={addressData.postalCode}
                        onChange={(e) => setAddressData({ ...addressData, postalCode: e.target.value })}
                        className="w-full px-4 py-3.5 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2"
                        style={{
                          borderColor: 'var(--border-light)',
                          fontFamily: 'var(--font-inter)',
                          color: 'var(--dark-text)',
                          backgroundColor: '#ffffff',
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = 'var(--honey-gold)';
                          e.target.style.boxShadow = '0 0 0 4px rgba(212, 167, 44, 0.1)';
                          e.target.style.backgroundColor = 'var(--warm-white)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = 'var(--border-light)';
                          e.target.style.boxShadow = 'none';
                          e.target.style.backgroundColor = '#ffffff';
                        }}
                        placeholder="71000"
                      />
                    </div>
                  </div>

                  {/* Country */}
                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{
                        fontFamily: 'var(--font-inter)',
                        color: 'var(--dark-text)',
                      }}
                    >
                      Država <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={addressData.country}
                      onChange={(e) => setAddressData({ ...addressData, country: e.target.value })}
                      className="w-full px-4 py-3.5 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2"
                      style={{
                        borderColor: 'var(--border-light)',
                        fontFamily: 'var(--font-inter)',
                        color: 'var(--dark-text)',
                        backgroundColor: 'white',
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = 'var(--honey-gold)';
                        e.target.style.boxShadow = '0 0 0 4px rgba(212, 167, 44, 0.1)';
                        e.target.style.backgroundColor = 'var(--warm-white)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'var(--border-light)';
                        e.target.style.boxShadow = 'none';
                        e.target.style.backgroundColor = '#ffffff';
                      }}
                    >
                      <option value="Bosna i Hercegovina">Bosna i Hercegovina</option>
                      <option value="Hrvatska">Hrvatska</option>
                      <option value="Srbija">Srbija</option>
                      <option value="Crna Gora">Crna Gora</option>
                    </select>
                  </div>

                  {/* Save Button */}
                  <button
                    onClick={handleSaveAddress}
                    disabled={isSavingAddress}
                    className="px-6 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: 'linear-gradient(135deg, #f5c852 0%, #f0c855 100%)',
                      color: 'var(--dark-text)',
                      fontFamily: 'var(--font-inter)',
                      boxShadow: '0 2px 8px rgba(212, 167, 44, 0.25)',
                      border: '1px solid rgba(212, 167, 44, 0.2)',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSavingAddress) {
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
                    {isSavingAddress ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Čuvanje...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Sačuvaj adresu
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Payment Cards Tab */}
            {activeTab === 'payment' && (
              <div
                className="bg-white rounded-2xl p-8 shadow-lg border transition-all duration-300"
                style={{ 
                  borderColor: 'var(--border-light)',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
                }}
              >
                <div className="mb-8 pb-6 border-b" style={{ borderColor: 'var(--border-light)' }}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2
                        className="text-3xl font-bold mb-2"
                        style={{
                          fontFamily: 'var(--font-serif)',
                          color: 'var(--dark-text)',
                        }}
                      >
                        Načini plaćanja
                      </h2>
                      <p
                        className="text-sm"
                        style={{
                          fontFamily: 'var(--font-inter)',
                          color: 'var(--body-text)',
                          opacity: 0.8,
                        }}
                      >
                        Upravljajte svojim karticama za plaćanje
                      </p>
                    </div>
                    {!showAddCard && (
                      <button
                        onClick={() => setShowAddCard(true)}
                        className="px-5 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
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
                          e.currentTarget.style.background = 'linear-gradient(135deg, #f5c852 0%, #d4a72c 100%)';
                          e.currentTarget.style.boxShadow = '0 2px 8px rgba(212, 167, 44, 0.25)';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Dodaj karticu
                      </button>
                    )}
                  </div>
                </div>

                {/* Add Card Form */}
                {showAddCard && (
                  <div
                    className="mb-8 p-6 rounded-xl border-2"
                    style={{
                      borderColor: 'var(--border-light)',
                      backgroundColor: 'var(--cream)',
                    }}
                  >
                    <h3
                      className="text-lg font-bold mb-4"
                      style={{
                        fontFamily: 'var(--font-serif)',
                        color: 'var(--dark-text)',
                      }}
                    >
                      Dodaj novu karticu
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label
                          className="block text-sm font-medium mb-2"
                          style={{
                            fontFamily: 'var(--font-inter)',
                            color: 'var(--dark-text)',
                          }}
                        >
                          Broj kartice <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={newCard.cardNumber}
                          onChange={(e) => {
                            let value = e.target.value.replace(/\s/g, '');
                            if (value.length <= 16 && /^\d*$/.test(value)) {
                              // Format with spaces every 4 digits
                              value = value.match(/.{1,4}/g)?.join(' ') || value;
                              setNewCard({ ...newCard, cardNumber: value });
                            }
                          }}
                          maxLength={19}
                          placeholder="1234 5678 9012 3456"
                          className="w-full px-4 py-3.5 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2"
                          style={{
                            borderColor: 'var(--border-light)',
                            fontFamily: 'var(--font-inter)',
                            color: 'var(--dark-text)',
                            backgroundColor: '#ffffff',
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = 'var(--honey-gold)';
                            e.target.style.boxShadow = '0 0 0 4px rgba(212, 167, 44, 0.1)';
                            e.target.style.backgroundColor = 'var(--warm-white)';
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = 'var(--border-light)';
                            e.target.style.boxShadow = 'none';
                            e.target.style.backgroundColor = '#ffffff';
                          }}
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
                          Ime na kartici <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={newCard.cardholderName}
                          onChange={(e) => setNewCard({ ...newCard, cardholderName: e.target.value })}
                          placeholder="IME PREZIME"
                          className="w-full px-4 py-3.5 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2"
                          style={{
                            borderColor: 'var(--border-light)',
                            fontFamily: 'var(--font-inter)',
                            color: 'var(--dark-text)',
                            backgroundColor: '#ffffff',
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = 'var(--honey-gold)';
                            e.target.style.boxShadow = '0 0 0 4px rgba(212, 167, 44, 0.1)';
                            e.target.style.backgroundColor = 'var(--warm-white)';
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = 'var(--border-light)';
                            e.target.style.boxShadow = 'none';
                            e.target.style.backgroundColor = '#ffffff';
                          }}
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-1">
                          <label
                            className="block text-sm font-medium mb-2"
                            style={{
                              fontFamily: 'var(--font-inter)',
                              color: 'var(--dark-text)',
                            }}
                          >
                            Mjesec <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={newCard.expiryMonth}
                            onChange={(e) => setNewCard({ ...newCard, expiryMonth: e.target.value })}
                            className="w-full px-4 py-3.5 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2"
                            style={{
                              borderColor: 'var(--border-light)',
                              fontFamily: 'var(--font-inter)',
                              color: 'var(--dark-text)',
                              backgroundColor: 'white',
                            }}
                            onFocus={(e) => {
                              e.target.style.borderColor = 'var(--honey-gold)';
                              e.target.style.boxShadow = '0 0 0 4px rgba(212, 167, 44, 0.1)';
                              e.target.style.backgroundColor = 'var(--warm-white)';
                            }}
                            onBlur={(e) => {
                              e.target.style.borderColor = 'var(--border-light)';
                              e.target.style.boxShadow = 'none';
                              e.target.style.backgroundColor = 'white';
                            }}
                          >
                            <option value="">MM</option>
                            {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                              <option key={month} value={month.toString().padStart(2, '0')}>
                                {month.toString().padStart(2, '0')}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="col-span-1">
                          <label
                            className="block text-sm font-medium mb-2"
                            style={{
                              fontFamily: 'var(--font-inter)',
                              color: 'var(--dark-text)',
                            }}
                          >
                            Godina <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={newCard.expiryYear}
                            onChange={(e) => setNewCard({ ...newCard, expiryYear: e.target.value })}
                            className="w-full px-4 py-3.5 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2"
                            style={{
                              borderColor: 'var(--border-light)',
                              fontFamily: 'var(--font-inter)',
                              color: 'var(--dark-text)',
                              backgroundColor: 'white',
                            }}
                            onFocus={(e) => {
                              e.target.style.borderColor = 'var(--honey-gold)';
                              e.target.style.boxShadow = '0 0 0 4px rgba(212, 167, 44, 0.1)';
                              e.target.style.backgroundColor = 'var(--warm-white)';
                            }}
                            onBlur={(e) => {
                              e.target.style.borderColor = 'var(--border-light)';
                              e.target.style.boxShadow = 'none';
                              e.target.style.backgroundColor = 'white';
                            }}
                          >
                            <option value="">YYYY</option>
                            {Array.from({ length: 20 }, (_, i) => new Date().getFullYear() + i).map((year) => (
                              <option key={year} value={year.toString()}>
                                {year}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="col-span-1">
                          <label
                            className="block text-sm font-medium mb-2"
                            style={{
                              fontFamily: 'var(--font-inter)',
                              color: 'var(--dark-text)',
                            }}
                          >
                            CVV <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={newCard.cvv}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, '');
                              if (value.length <= 3) {
                                setNewCard({ ...newCard, cvv: value });
                              }
                            }}
                            maxLength={3}
                            placeholder="123"
                            className="w-full px-4 py-3.5 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2"
                            style={{
                              borderColor: 'var(--border-light)',
                              fontFamily: 'var(--font-inter)',
                              color: 'var(--dark-text)',
                              backgroundColor: '#ffffff',
                            }}
                            onFocus={(e) => {
                              e.target.style.borderColor = 'var(--honey-gold)';
                              e.target.style.boxShadow = '0 0 0 4px rgba(212, 167, 44, 0.1)';
                              e.target.style.backgroundColor = 'var(--warm-white)';
                            }}
                            onBlur={(e) => {
                              e.target.style.borderColor = 'var(--border-light)';
                              e.target.style.boxShadow = 'none';
                              e.target.style.backgroundColor = '#ffffff';
                            }}
                          />
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            setShowAddCard(false);
                            setNewCard({
                              cardNumber: '',
                              cardholderName: '',
                              expiryMonth: '',
                              expiryYear: '',
                              cvv: '',
                            });
                          }}
                          className="px-4 py-2 rounded-lg font-medium transition-colors"
                          style={{
                            backgroundColor: 'var(--border-light)',
                            color: 'var(--dark-text)',
                            fontFamily: 'var(--font-inter)',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#e5e5e5';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--border-light)';
                          }}
                        >
                          Otkaži
                        </button>
                        <button
                          onClick={handleAddCard}
                          disabled={isAddingCard}
                          className="px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{
                            background: 'linear-gradient(135deg, #f5c852 0%, #f0c855 100%)',
                            color: 'var(--dark-text)',
                            fontFamily: 'var(--font-inter)',
                            boxShadow: '0 2px 6px rgba(212, 167, 44, 0.25)',
                            border: '1px solid rgba(212, 167, 44, 0.2)',
                          }}
                          onMouseEnter={(e) => {
                            if (!isAddingCard) {
                              e.currentTarget.style.background = 'linear-gradient(135deg, #f8d275 0%, #f5c852 100%)';
                              e.currentTarget.style.boxShadow = '0 4px 10px rgba(212, 167, 44, 0.35)';
                              e.currentTarget.style.transform = 'translateY(-1px)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'linear-gradient(135deg, #f5c852 0%, #f0c855 100%)';
                            e.currentTarget.style.boxShadow = '0 2px 6px rgba(212, 167, 44, 0.25)';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }}
                        >
                          {isAddingCard ? (
                            <>
                              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Dodavanje...
                            </>
                          ) : (
                            'Dodaj karticu'
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Saved Cards */}
                {paymentCards.length === 0 && !showAddCard ? (
                  <div className="text-center py-16">
                    <div
                      className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center"
                      style={{
                        backgroundColor: 'rgba(212, 167, 44, 0.1)',
                        color: 'var(--honey-gold)',
                      }}
                    >
                      <svg
                        className="w-10 h-10"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                        />
                      </svg>
                    </div>
                    <p
                      className="text-xl font-semibold mb-2"
                      style={{
                        fontFamily: 'var(--font-inter)',
                        color: 'var(--dark-text)',
                      }}
                    >
                      Nemate dodanih kartica
                    </p>
                    <p
                      className="text-sm mb-6 opacity-70"
                      style={{
                        fontFamily: 'var(--font-inter)',
                        color: 'var(--body-text)',
                      }}
                    >
                      Dodajte karticu za brže i sigurnije plaćanje
                    </p>
                    <button
                      onClick={() => setShowAddCard(true)}
                      className="px-6 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 mx-auto"
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
                        e.currentTarget.style.background = 'linear-gradient(135deg, #f5c852 0%, #d4a72c 100%)';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(212, 167, 44, 0.25)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Dodaj karticu
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {paymentCards.map((card) => (
                      <div
                        key={card.id}
                        className={`p-6 rounded-xl border-2 relative transition-all duration-200 cursor-pointer ${!card.isDefault ? 'hover:border-amber-300' : ''}`}
                        style={{
                          borderColor: card.isDefault ? 'var(--honey-gold)' : 'var(--border-light)',
                          backgroundColor: card.isDefault ? 'rgba(245, 200, 82, 0.08)' : 'white',
                          borderWidth: card.isDefault ? '2px' : '1px',
                        }}
                        onClick={() => !card.isDefault && handleSetDefaultCard(card.id)}
                        onMouseEnter={(e) => {
                          if (!card.isDefault) {
                            e.currentTarget.style.borderColor = 'rgba(212, 167, 44, 0.5)';
                            e.currentTarget.style.backgroundColor = 'rgba(245, 200, 82, 0.05)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!card.isDefault) {
                            e.currentTarget.style.borderColor = 'var(--border-light)';
                            e.currentTarget.style.backgroundColor = 'white';
                          }
                        }}
                      >
                        {/* Default Card Indicator - Checkmark in top-left */}
                        <div className="absolute top-4 left-4">
                          {card.isDefault ? (
                            <div
                              className="w-7 h-7 rounded-full flex items-center justify-center"
                              style={{
                                background: 'linear-gradient(135deg, #f5c852 0%, #f0c855 100%)',
                                boxShadow: '0 2px 6px rgba(212, 167, 44, 0.3)',
                              }}
                            >
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          ) : (
                            <div
                              className="w-7 h-7 rounded-full border-2 flex items-center justify-center"
                              style={{
                                borderColor: 'var(--border-light)',
                                backgroundColor: 'white',
                              }}
                            >
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{
                                  backgroundColor: 'transparent',
                                }}
                              />
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between pl-10">
                          <div className="flex items-center gap-4">
                            <div
                              className="w-12 h-8 rounded flex items-center justify-center"
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
                            <div>
                              <p
                                className="font-bold text-lg"
                                style={{
                                  fontFamily: 'var(--font-inter)',
                                  color: 'var(--dark-text)',
                                }}
                              >
                                •••• •••• •••• {card.last4}
                              </p>
                              <p
                                className="text-sm"
                                style={{
                                  fontFamily: 'var(--font-inter)',
                                  color: 'var(--body-text)',
                                }}
                              >
                                {card.expiryMonth.toString().padStart(2, '0')}/{card.expiryYear.toString().slice(-2)}
                              </p>
                              {card.isDefault && (
                                <p
                                  className="text-xs mt-1 font-medium"
                                  style={{
                                    fontFamily: 'var(--font-inter)',
                                    color: 'var(--honey-gold)',
                                  }}
                                >
                                  Zadana kartica
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveCard(card.id);
                              }}
                              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                              style={{
                                backgroundColor: 'transparent',
                                color: '#dc2626',
                                border: '1px solid #dc2626',
                                fontFamily: 'var(--font-inter)',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#fee2e2';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                              }}
                            >
                              Ukloni
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div
                className="bg-white rounded-2xl p-8 shadow-lg border transition-all duration-300 animate-fade-in"
                style={{ 
                  borderColor: 'var(--border-light)',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
                }}
                data-orders-section
              >
                <div className="mb-8 pb-6 border-b" style={{ borderColor: 'var(--border-light)' }}>
                  <h2
                    className="text-3xl font-bold mb-2"
                    style={{
                      fontFamily: 'var(--font-serif)',
                      color: 'var(--dark-text)',
                    }}
                  >
                    Moje narudžbe
                  </h2>
                  <p
                    className="text-sm"
                    style={{
                      fontFamily: 'var(--font-inter)',
                      color: 'var(--body-text)',
                      opacity: 0.8,
                    }}
                  >
                    Pregled svih vaših narudžbi i njihovog statusa
                  </p>
                </div>

                {orders.length === 0 ? (
                  <div className="text-center py-16">
                    <div
                      className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center"
                      style={{
                        backgroundColor: 'rgba(212, 167, 44, 0.1)',
                        color: 'var(--honey-gold)',
                      }}
                    >
                      <svg
                        className="w-10 h-10"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                        />
                      </svg>
                    </div>
                    <p
                      className="text-xl font-semibold mb-2"
                      style={{
                        fontFamily: 'var(--font-inter)',
                        color: 'var(--dark-text)',
                      }}
                    >
                      Nemate narudžbi
                    </p>
                    <p
                      className="text-sm mb-6 opacity-70"
                      style={{
                        fontFamily: 'var(--font-inter)',
                        color: 'var(--body-text)',
                      }}
                    >
                      Vaše narudžbe će se ovdje prikazati nakon što ih napravite
                    </p>
                    <Link
                      href={ROUTES.PRODUCTS}
                      className="px-6 py-2.5 rounded-lg font-medium transition-all duration-200 inline-flex items-center gap-2"
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
                        e.currentTarget.style.background = 'linear-gradient(135deg, #f5c852 0%, #d4a72c 100%)';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(212, 167, 44, 0.25)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      Pregled proizvoda
                    </Link>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      {(() => {
                        const startIndex = (ordersPage - 1) * ORDERS_PER_PAGE;
                        const endIndex = startIndex + ORDERS_PER_PAGE;
                        const paginatedOrders = orders.slice(startIndex, endIndex);
                        return paginatedOrders.map((order) => {
                      const orderDate = new Date(order.createdAt);
                      return (
                        <div
                          key={order.id}
                          className="p-6 rounded-xl border-2 transition-all duration-200 cursor-pointer"
                          style={{
                            borderColor: 'var(--border-light)',
                            backgroundColor: 'white',
                          }}
                          onClick={() => handleOpenOrderModal(order)}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = 'rgba(212, 167, 44, 0.5)';
                            e.currentTarget.style.backgroundColor = 'var(--cream)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'var(--border-light)';
                            e.currentTarget.style.backgroundColor = 'white';
                            e.currentTarget.style.boxShadow = 'none';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }}
                        >
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                            <div>
                              <div className="flex items-center gap-3 mb-2">
                                <h3
                                  className="text-lg font-semibold"
                                  style={{
                                    fontFamily: 'var(--font-inter)',
                                    color: 'var(--dark-text)',
                                  }}
                                >
                                  Narudžba #{order.orderNumber}
                                </h3>
                                <span
                                  className="px-3 py-1 rounded-full text-xs font-medium"
                                  style={{
                                    backgroundColor: `${getStatusColor(order.status)}15`,
                                    color: getStatusColor(order.status),
                                    fontFamily: 'var(--font-inter)',
                                  }}
                                >
                                  {getStatusLabel(order.status)}
                                </span>
                              </div>
                              <p
                                className="text-sm"
                                style={{
                                  fontFamily: 'var(--font-inter)',
                                  color: 'var(--body-text)',
                                }}
                              >
                                {(() => {
                                  const day = orderDate.getDate().toString().padStart(2, '0');
                                  const month = (orderDate.getMonth() + 1).toString().padStart(2, '0');
                                  const year = orderDate.getFullYear();
                                  const hours = orderDate.getHours().toString().padStart(2, '0');
                                  const minutes = orderDate.getMinutes().toString().padStart(2, '0');
                                  return `${day}.${month}.${year}. u ${hours}:${minutes}`;
                                })()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p
                                className="text-xl font-bold"
                                style={{
                                  fontFamily: 'var(--font-inter)',
                                  color: 'var(--dark-text)',
                                }}
                              >
                                {order.total.toFixed(2)} {order.currency}
                              </p>
                              <p
                                className="text-sm"
                                style={{
                                  fontFamily: 'var(--font-inter)',
                                  color: 'var(--body-text)',
                                }}
                              >
                                {order.items.length} {order.items.length === 1 ? 'proizvod' : 'proizvoda'}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-3 mt-4 pt-4 border-t" style={{ borderColor: 'var(--border-light)' }}>
                            {order.items.slice(0, 3).map((item, idx) => {
                              const product = getProductById(item.productId);
                              if (!product) return null;
                              return (
                                <div key={idx} className="flex items-center gap-4">
                                  {product.image && (
                                    <div className="flex-shrink-0">
                                      <div className="w-16 h-16 rounded-lg overflow-hidden border" style={{ borderColor: 'var(--border-light)' }}>
                                        <Image
                                          src={product.image}
                                          alt={product.name}
                                          width={64}
                                          height={64}
                                          className="object-cover w-full h-full"
                                        />
                                      </div>
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <p
                                      className="font-medium block truncate"
                                      style={{
                                        fontFamily: 'var(--font-inter)',
                                        color: 'var(--dark-text)',
                                      }}
                                    >
                                      {product.name}
                                    </p>
                                    <p
                                      className="text-sm"
                                      style={{
                                        fontFamily: 'var(--font-inter)',
                                        color: 'var(--body-text)',
                                      }}
                                    >
                                      {item.quantity}x {item.weight}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p
                                      className="font-semibold"
                                      style={{
                                        fontFamily: 'var(--font-inter)',
                                        color: 'var(--dark-text)',
                                      }}
                                    >
                                      {(item.price * item.quantity).toFixed(2)} {order.currency}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                            {order.items.length > 3 && (
                              <p
                                className="text-sm text-center pt-2"
                                style={{
                                  fontFamily: 'var(--font-inter)',
                                  color: 'var(--body-text)',
                                  opacity: 0.7,
                                }}
                              >
                                +{order.items.length - 3} {order.items.length - 3 === 1 ? 'proizvod više' : 'proizvoda više'} (kliknite za detalje)
                              </p>
                            )}
                          </div>
                          
                          {/* Quick Action Button */}
                          <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border-light)' }}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenOrderModal(order);
                              }}
                              className="w-full px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                              style={{
                                backgroundColor: 'transparent',
                                border: '1px solid var(--honey-gold)',
                                color: 'var(--honey-gold)',
                                fontFamily: 'var(--font-inter)',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'rgba(245, 200, 82, 0.1)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                              }}
                            >
                              Pregledaj detalje narudžbe
                            </button>
                          </div>
                        </div>
                      );
                        });
                      })()}
                    </div>
                    {(() => {
                      const totalPages = Math.ceil(orders.length / ORDERS_PER_PAGE);
                      return totalPages > 1 && (
                        <div className="mt-6">
                          <Pagination
                            currentPage={ordersPage}
                            totalPages={totalPages}
                            onPageChange={(page) => {
                              setOrdersPage(page);
                              // Smooth scroll to top of orders list
                              setTimeout(() => {
                                const ordersSection = document.querySelector('[data-orders-section]');
                                if (ordersSection) {
                                  ordersSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                }
                              }, 100);
                            }}
                          />
                        </div>
                      );
                    })()}
                  </>
                )}
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div
                className="bg-white rounded-2xl p-8 shadow-lg border transition-all duration-300"
                style={{ 
                  borderColor: 'var(--border-light)',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
                }}
              >
                <div className="mb-8 pb-6 border-b" style={{ borderColor: 'var(--border-light)' }}>
                  <h2
                    className="text-3xl font-bold mb-2"
                    style={{
                      fontFamily: 'var(--font-serif)',
                      color: 'var(--dark-text)',
                    }}
                  >
                    Notifikacije
                  </h2>
                  <p
                    className="text-sm"
                    style={{
                      fontFamily: 'var(--font-inter)',
                      color: 'var(--body-text)',
                      opacity: 0.8,
                    }}
                  >
                    Upravljajte kako i kada želite primati obavještenja
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Email Notifications */}
                  <div className="p-5 rounded-xl border-2" style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--cream)' }}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3
                          className="font-semibold mb-1"
                          style={{
                            fontFamily: 'var(--font-inter)',
                            color: 'var(--dark-text)',
                          }}
                        >
                          Email notifikacije
                        </h3>
                        <p
                          className="text-sm"
                          style={{
                            fontFamily: 'var(--font-inter)',
                            color: 'var(--body-text)',
                          }}
                        >
                          Primajte obavještenja na email adresu
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationSettings.emailNotifications}
                          onChange={(e) => setNotificationSettings({ ...notificationSettings, emailNotifications: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 rounded-full peer peer-focus:ring-2 transition-all duration-200" style={{ 
                          background: notificationSettings.emailNotifications ? 'linear-gradient(135deg, #f5c852 0%, #d4a72c 100%)' : '#cbd5e1',
                          boxShadow: notificationSettings.emailNotifications ? '0 2px 6px rgba(212, 167, 44, 0.3)' : 'none',
                        }}></div>
                        <div className={`absolute left-1 top-1 bg-white border-2 rounded-full h-4 w-4 transition-transform duration-200 ${
                          notificationSettings.emailNotifications ? 'translate-x-5' : 'translate-x-0'
                        }`} style={{ 
                          borderColor: notificationSettings.emailNotifications ? 'var(--honey-gold)' : '#cbd5e1',
                          boxShadow: notificationSettings.emailNotifications ? '0 2px 4px rgba(212, 167, 44, 0.2)' : 'none',
                        }}></div>
                      </label>
                    </div>
                  </div>

                  {/* Order Updates */}
                  <div className="p-5 rounded-xl border-2" style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--cream)' }}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3
                          className="font-semibold mb-1"
                          style={{
                            fontFamily: 'var(--font-inter)',
                            color: 'var(--dark-text)',
                          }}
                        >
                          Ažuriranja narudžbi
                        </h3>
                        <p
                          className="text-sm"
                          style={{
                            fontFamily: 'var(--font-inter)',
                            color: 'var(--body-text)',
                          }}
                        >
                          Obavještavanje o statusu vaših narudžbi
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationSettings.orderUpdates}
                          onChange={(e) => setNotificationSettings({ ...notificationSettings, orderUpdates: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 rounded-full peer peer-focus:ring-2 transition-colors duration-200" style={{ 
                          backgroundColor: notificationSettings.orderUpdates ? 'var(--honey-gold)' : '#cbd5e1',
                        }}></div>
                        <div className={`absolute left-1 top-1 bg-white border-2 rounded-full h-4 w-4 transition-transform duration-200 ${
                          notificationSettings.orderUpdates ? 'translate-x-5' : 'translate-x-0'
                        }`} style={{ borderColor: notificationSettings.orderUpdates ? 'var(--honey-gold)' : '#cbd5e1' }}></div>
                      </label>
                    </div>
                  </div>

                  {/* Promotions */}
                  <div className="p-5 rounded-xl border-2" style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--cream)' }}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3
                          className="font-semibold mb-1"
                          style={{
                            fontFamily: 'var(--font-inter)',
                            color: 'var(--dark-text)',
                          }}
                        >
                          Promocije i akcije
                        </h3>
                        <p
                          className="text-sm"
                          style={{
                            fontFamily: 'var(--font-inter)',
                            color: 'var(--body-text)',
                          }}
                        >
                          Primajte obavještenja o posebnim ponudama
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationSettings.promotions}
                          onChange={(e) => setNotificationSettings({ ...notificationSettings, promotions: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 rounded-full peer peer-focus:ring-2 transition-all duration-200" style={{
                          background: notificationSettings.promotions ? 'linear-gradient(135deg, #f5c852 0%, #d4a72c 100%)' : '#cbd5e1',
                          boxShadow: notificationSettings.promotions ? '0 2px 6px rgba(212, 167, 44, 0.3)' : 'none',
                        }}></div>
                        <div className={`absolute left-1 top-1 bg-white border-2 rounded-full h-4 w-4 transition-transform duration-200 ${
                          notificationSettings.promotions ? 'translate-x-5' : 'translate-x-0'
                        }`} style={{ 
                          borderColor: notificationSettings.promotions ? 'var(--honey-gold)' : '#cbd5e1',
                          boxShadow: notificationSettings.promotions ? '0 2px 4px rgba(212, 167, 44, 0.2)' : 'none',
                        }}></div>
                      </label>
                    </div>
                  </div>

                  {/* Newsletter */}
                  <div className="p-5 rounded-xl border-2" style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--cream)' }}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3
                          className="font-semibold mb-1"
                          style={{
                            fontFamily: 'var(--font-inter)',
                            color: 'var(--dark-text)',
                          }}
                        >
                          Newsletter
                        </h3>
                        <p
                          className="text-sm"
                          style={{
                            fontFamily: 'var(--font-inter)',
                            color: 'var(--body-text)',
                          }}
                        >
                          Mjesečni pregled novosti i savjeta
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationSettings.newsletter}
                          onChange={(e) => setNotificationSettings({ ...notificationSettings, newsletter: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 rounded-full peer peer-focus:ring-2 transition-all duration-200" style={{
                          background: notificationSettings.newsletter ? 'linear-gradient(135deg, #f5c852 0%, #d4a72c 100%)' : '#cbd5e1',
                          boxShadow: notificationSettings.newsletter ? '0 2px 6px rgba(212, 167, 44, 0.3)' : 'none',
                        }}></div>
                        <div className={`absolute left-1 top-1 bg-white border-2 rounded-full h-4 w-4 transition-transform duration-200 ${
                          notificationSettings.newsletter ? 'translate-x-5' : 'translate-x-0'
                        }`} style={{ 
                          borderColor: notificationSettings.newsletter ? 'var(--honey-gold)' : '#cbd5e1',
                          boxShadow: notificationSettings.newsletter ? '0 2px 4px rgba(212, 167, 44, 0.2)' : 'none',
                        }}></div>
                      </label>
                    </div>
                  </div>

                  {/* Product Recommendations */}
                  <div className="p-5 rounded-xl border-2" style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--cream)' }}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3
                          className="font-semibold mb-1"
                          style={{
                            fontFamily: 'var(--font-inter)',
                            color: 'var(--dark-text)',
                          }}
                        >
                          Preporuke proizvoda
                        </h3>
                        <p
                          className="text-sm"
                          style={{
                            fontFamily: 'var(--font-inter)',
                            color: 'var(--body-text)',
                          }}
                        >
                          Personalizovane preporuke na osnovu vaših interesa
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationSettings.productRecommendations}
                          onChange={(e) => setNotificationSettings({ ...notificationSettings, productRecommendations: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 rounded-full peer peer-focus:ring-2 transition-all duration-200" style={{
                          background: notificationSettings.productRecommendations ? 'linear-gradient(135deg, #f5c852 0%, #d4a72c 100%)' : '#cbd5e1',
                          boxShadow: notificationSettings.productRecommendations ? '0 2px 6px rgba(212, 167, 44, 0.3)' : 'none',
                        }}></div>
                        <div className={`absolute left-1 top-1 bg-white border-2 rounded-full h-4 w-4 transition-transform duration-200 ${
                          notificationSettings.productRecommendations ? 'translate-x-5' : 'translate-x-0'
                        }`} style={{ 
                          borderColor: notificationSettings.productRecommendations ? 'var(--honey-gold)' : '#cbd5e1',
                          boxShadow: notificationSettings.productRecommendations ? '0 2px 4px rgba(212, 167, 44, 0.2)' : 'none',
                        }}></div>
                      </label>
                    </div>
                  </div>

                  {/* Save Button */}
                  <button
                    onClick={handleSaveNotificationSettings}
                    disabled={isSavingNotifications}
                    className="px-6 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: 'linear-gradient(135deg, #f5c852 0%, #f0c855 100%)',
                      color: 'var(--dark-text)',
                      fontFamily: 'var(--font-inter)',
                      boxShadow: '0 2px 8px rgba(212, 167, 44, 0.25)',
                      border: '1px solid rgba(212, 167, 44, 0.2)',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSavingNotifications) {
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
                    {isSavingNotifications ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Čuvanje...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Sačuvaj postavke
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Comments Tab */}
            {activeTab === 'comments' && (
              <div
                className="bg-white rounded-2xl p-8 shadow-lg border transition-all duration-300 animate-fade-in"
                style={{ 
                  borderColor: 'var(--border-light)',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
                }}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-8 pb-6 border-b" style={{ borderColor: 'var(--border-light)' }}>
                  <div>
                    <h2
                      className="text-3xl font-bold mb-2"
                      style={{
                        fontFamily: 'var(--font-serif)',
                        color: 'var(--dark-text)',
                      }}
                    >
                      Moji komentari
                    </h2>
                    <p
                      className="text-sm"
                      style={{
                        fontFamily: 'var(--font-inter)',
                        color: 'var(--body-text)',
                        opacity: 0.8,
                      }}
                    >
                      Pregledajte i upravljajte svim svojim komentarima
                    </p>
                  </div>
                </div>

                {/* Statistics */}
                {userReviews.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="p-4 rounded-xl border-2" style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--cream)' }}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(212, 167, 44, 0.1)' }}>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--honey-gold)' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xl font-bold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--dark-text)' }}>
                            {userReviews.length}
                          </p>
                          <p className="text-xs" style={{ fontFamily: 'var(--font-inter)', color: 'var(--body-text)', opacity: 0.7 }}>
                            Ukupno komentara
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl border-2" style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--cream)' }}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(212, 167, 44, 0.1)' }}>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--honey-gold)' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xl font-bold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--dark-text)' }}>
                            {new Set(userReviews.map(r => r.productId)).size}
                          </p>
                          <p className="text-xs" style={{ fontFamily: 'var(--font-inter)', color: 'var(--body-text)', opacity: 0.7 }}>
                            Različitih proizvoda
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl border-2" style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--cream)' }}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(212, 167, 44, 0.1)' }}>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--honey-gold)' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-xl font-bold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--dark-text)' }}>
                            {userReviews.reduce((sum, r) => sum + r.likes, 0)}
                          </p>
                          <p className="text-xs" style={{ fontFamily: 'var(--font-inter)', color: 'var(--body-text)', opacity: 0.7 }}>
                            Ukupno lajkova
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Search and Filter */}
                {userReviews.length > 0 && (
                  <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    {/* Search */}
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Pretraži komentare..."
                        className="w-full px-4 py-3.5 pl-10 pr-10 rounded-xl border-2 text-sm focus:outline-none transition-all"
                        style={{
                          borderColor: searchQuery ? 'var(--honey-gold)' : 'var(--border-light)',
                          fontFamily: 'var(--font-inter)',
                          color: 'var(--dark-text)',
                          backgroundColor: 'white',
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = 'var(--honey-gold)';
                          e.currentTarget.style.boxShadow = '0 0 0 4px rgba(212, 167, 44, 0.1)';
                        }}
                        onBlur={(e) => {
                          if (!searchQuery) {
                            e.currentTarget.style.borderColor = 'var(--border-light)';
                            e.currentTarget.style.boxShadow = 'none';
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Escape') {
                            setSearchQuery('');
                          }
                        }}
                      />
                      <svg
                        className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        style={{ color: 'var(--body-text)', opacity: 0.5 }}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery('')}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 transition-colors"
                          style={{ color: 'var(--body-text)' }}
                          aria-label="Obriši pretragu"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>

                    {/* Filter Buttons */}
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => setCommentFilter('all')}
                        className="px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200"
                        style={{
                          backgroundColor: commentFilter === 'all' ? 'var(--honey-gold)' : 'var(--border-light)',
                          color: commentFilter === 'all' ? 'var(--dark-text)' : 'var(--body-text)',
                          fontFamily: 'var(--font-inter)',
                        }}
                        onMouseEnter={(e) => {
                          if (commentFilter !== 'all') {
                            e.currentTarget.style.backgroundColor = 'rgba(212, 167, 44, 0.1)';
                            e.currentTarget.style.color = 'var(--honey-gold)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (commentFilter !== 'all') {
                            e.currentTarget.style.backgroundColor = 'var(--border-light)';
                            e.currentTarget.style.color = 'var(--body-text)';
                          }
                        }}
                      >
                        Svi
                      </button>
                      <button
                        onClick={() => setCommentFilter('comments')}
                        className="px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200"
                        style={{
                          backgroundColor: commentFilter === 'comments' ? 'var(--honey-gold)' : 'var(--border-light)',
                          color: commentFilter === 'comments' ? 'var(--dark-text)' : 'var(--body-text)',
                          fontFamily: 'var(--font-inter)',
                        }}
                        onMouseEnter={(e) => {
                          if (commentFilter !== 'comments') {
                            e.currentTarget.style.backgroundColor = 'rgba(212, 167, 44, 0.1)';
                            e.currentTarget.style.color = 'var(--honey-gold)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (commentFilter !== 'comments') {
                            e.currentTarget.style.backgroundColor = 'var(--border-light)';
                            e.currentTarget.style.color = 'var(--body-text)';
                          }
                        }}
                      >
                        Komentari
                      </button>
                      <button
                        onClick={() => setCommentFilter('replies')}
                        className="px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200"
                        style={{
                          backgroundColor: commentFilter === 'replies' ? 'var(--honey-gold)' : 'var(--border-light)',
                          color: commentFilter === 'replies' ? 'var(--dark-text)' : 'var(--body-text)',
                          fontFamily: 'var(--font-inter)',
                        }}
                        onMouseEnter={(e) => {
                          if (commentFilter !== 'replies') {
                            e.currentTarget.style.backgroundColor = 'rgba(212, 167, 44, 0.1)';
                            e.currentTarget.style.color = 'var(--honey-gold)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (commentFilter !== 'replies') {
                            e.currentTarget.style.backgroundColor = 'var(--border-light)';
                            e.currentTarget.style.color = 'var(--body-text)';
                          }
                        }}
                      >
                        Odgovori
                      </button>
                    </div>
                  </div>
                )}

                {/* Loading State */}
                {isLoadingComments && (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 mx-auto mb-4">
                      <svg className="w-16 h-16 animate-spin text-amber-500" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                    <p className="text-sm" style={{ fontFamily: 'var(--font-inter)', color: 'var(--body-text)', opacity: 0.7 }}>
                      Učitavanje komentara...
                    </p>
                  </div>
                )}

                {/* Empty State */}
                {!isLoadingComments && userReviews.length === 0 ? (
                  <div className="text-center py-16">
                    <div
                      className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center"
                      style={{
                        backgroundColor: 'rgba(212, 167, 44, 0.1)',
                      }}
                    >
                      <svg
                        className="w-12 h-12"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        style={{ color: 'var(--honey-gold)' }}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                    </div>
                    <h3
                      className="text-2xl font-bold mb-3"
                      style={{
                        fontFamily: 'var(--font-serif)',
                        color: 'var(--dark-text)',
                      }}
                    >
                      Još niste ostavili nijedan komentar
                    </h3>
                    <p
                      className="text-base mb-6 max-w-md mx-auto"
                      style={{
                        fontFamily: 'var(--font-inter)',
                        color: 'var(--body-text)',
                        opacity: 0.7,
                      }}
                    >
                      Počnite da dijelite svoje mišljenje o proizvodima i pomozite drugim korisnicima u odlučivanju
                    </p>
                    <Link
                      href={ROUTES.PRODUCTS}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-base transition-all"
                      style={{
                        backgroundColor: 'var(--honey-gold)',
                        color: 'var(--dark-text)',
                        fontFamily: 'var(--font-inter)',
                        boxShadow: '0 4px 12px rgba(212, 167, 44, 0.3)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--honey-light)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 6px 16px rgba(212, 167, 44, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--honey-gold)';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(212, 167, 44, 0.3)';
                      }}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Pregledajte proizvode
                    </Link>
                  </div>
                ) : (() => {
                  // Filter reviews based on filter and search
                  let filteredReviews = userReviews;
                  
                  // Apply filter
                  if (commentFilter === 'comments') {
                    filteredReviews = filteredReviews.filter(r => !r.isReply);
                  } else if (commentFilter === 'replies') {
                    filteredReviews = filteredReviews.filter(r => r.isReply);
                  }
                  
                  // Apply search
                  if (searchQuery.trim()) {
                    const query = searchQuery.toLowerCase().trim();
                    filteredReviews = filteredReviews.filter(r => 
                      r.comment.toLowerCase().includes(query) ||
                      r.productName?.toLowerCase().includes(query) ||
                      (r.parentComment && r.parentComment.toLowerCase().includes(query))
                    );
                  }

                  // Check if no results
                  if (filteredReviews.length === 0) {
                    return (
                      <div className="text-center py-12">
                        <div
                          className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center"
                          style={{
                            backgroundColor: 'rgba(212, 167, 44, 0.1)',
                          }}
                        >
                          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--honey-gold)' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                        <p className="text-base font-medium mb-2" style={{ fontFamily: 'var(--font-inter)', color: 'var(--dark-text)' }}>
                          Nema rezultata
                        </p>
                        <p className="text-sm mb-4" style={{ fontFamily: 'var(--font-inter)', color: 'var(--body-text)', opacity: 0.7 }}>
                          {searchQuery ? `Nema komentara koji odgovaraju pretrazi "${searchQuery}"` : 'Pokušajte promijeniti filter ili pretragu'}
                        </p>
                        {(searchQuery || commentFilter !== 'all') && (
                          <button
                            onClick={() => {
                              setSearchQuery('');
                              setCommentFilter('all');
                              setCommentsPage(1);
                            }}
                            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            style={{
                              backgroundColor: 'var(--honey-gold)',
                              color: 'var(--dark-text)',
                              fontFamily: 'var(--font-inter)',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = 'var(--honey-light)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'var(--honey-gold)';
                            }}
                          >
                            Obriši filtere
                          </button>
                        )}
                      </div>
                    );
                  }

                  // Group reviews by productId
                  const groupedByProduct = filteredReviews.reduce((acc, review) => {
                    if (!acc[review.productId]) {
                      const product = getProductById(review.productId);
                      acc[review.productId] = {
                        productId: review.productId,
                        productName: review.productName,
                        productSlug: product?.slug,
                        reviews: [],
                      };
                    }
                    acc[review.productId].reviews.push(review);
                    return acc;
                  }, {} as Record<number, { productId: number; productName?: string; productSlug?: string; reviews: UserReview[] }>);

                  // Convert to array and sort by most recent review in each group
                  const groupedArray = Object.values(groupedByProduct).sort((a, b) => {
                    const aLatest = Math.max(...a.reviews.map(r => new Date(r.createdAt || 0).getTime()));
                    const bLatest = Math.max(...b.reviews.map(r => new Date(r.createdAt || 0).getTime()));
                    return bLatest - aLatest;
                  });

                  // Calculate pagination for groups
                  const totalGroups = groupedArray.length;
                  const totalPages = Math.ceil(totalGroups / COMMENTS_PER_PAGE);
                  const startIndex = (commentsPage - 1) * COMMENTS_PER_PAGE;
                  const endIndex = startIndex + COMMENTS_PER_PAGE;
                  const paginatedGroups = groupedArray.slice(startIndex, endIndex);

                  return (
                    <>
                      {paginatedGroups.map((group) => (
                        <div key={group.productId} className="mb-8">
                              {/* Product Group Header */}
                              <div className="mb-6 p-5 rounded-xl border-2 sticky top-4 z-10" style={{ borderColor: 'var(--honey-gold)', backgroundColor: 'var(--cream)', boxShadow: '0 2px 8px rgba(212, 167, 44, 0.15)' }}>
                                <div className="flex items-center justify-between flex-wrap gap-3">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(212, 167, 44, 0.2)' }}>
                                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--honey-gold)' }}>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                      </svg>
                                    </div>
                                    <div>
                                      <Link
                                        href={group.productSlug ? `${ROUTES.PRODUCTS}/${group.productSlug}` : `${ROUTES.PRODUCTS}`}
                                        className="text-lg font-bold hover:underline transition-colors block"
                                        style={{
                                          fontFamily: 'var(--font-serif)',
                                          color: 'var(--honey-gold)',
                                        }}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                        }}
                                      >
                                        {group.productName || `Proizvod #${group.productId}`}
                                      </Link>
                                      <p className="text-xs mt-1" style={{ fontFamily: 'var(--font-inter)', color: 'var(--body-text)', opacity: 0.7 }}>
                                        {group.reviews.length} {group.reviews.length === 1 ? 'komentar' : 'komentara'} • Stranica {commentsPage} od {totalPages}
                                      </p>
                                    </div>
                                  </div>
                                  <Link
                                    href={group.productSlug ? `${ROUTES.PRODUCTS}/${group.productSlug}` : `${ROUTES.PRODUCTS}`}
                                    className="px-4 py-2 rounded-xl text-sm font-medium transition-all relative z-20"
                                    style={{
                                      backgroundColor: 'var(--honey-gold)',
                                      color: 'var(--dark-text)',
                                      fontFamily: 'var(--font-inter)',
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.backgroundColor = 'var(--honey-light)';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.backgroundColor = 'var(--honey-gold)';
                                    }}
                                  >
                                    Vidi proizvod →
                                  </Link>
                                </div>
                              </div>

                              {/* Comments for this product */}
                              <div className="space-y-4 mb-8">
                                {group.reviews.slice(0, COMMENTS_PER_GROUP).map((review, reviewIndex) => (
                                  <div
                                    key={`${review.id}-${review.productId}`}
                                    data-review-id={`${review.id}-${review.productId}`}
                                    className="p-5 rounded-xl border-2 transition-all duration-200 relative"
                                    style={{
                                      borderColor: review.isReply ? 'rgba(212, 167, 44, 0.3)' : 'var(--border-light)',
                                      backgroundColor: review.isReply ? 'var(--cream)' : 'white',
                                      borderLeftWidth: '4px',
                                      borderLeftColor: review.isReply ? 'var(--honey-gold)' : 'rgba(212, 167, 44, 0.5)',
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.borderColor = review.isReply ? 'var(--honey-gold)' : 'rgba(212, 167, 44, 0.5)';
                                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.borderColor = review.isReply ? 'rgba(212, 167, 44, 0.3)' : 'var(--border-light)';
                                      e.currentTarget.style.boxShadow = 'none';
                                    }}
                                  >
                                    {/* Comment number indicator */}
                                    <div className="absolute -left-2 top-4 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: 'var(--honey-gold)', color: 'var(--dark-text)' }}>
                                      {reviewIndex + 1}
                                    </div>
                                    
                                    {/* Product breadcrumb */}
                                    <div className="mb-3 flex items-center gap-2 text-xs" style={{ fontFamily: 'var(--font-inter)', color: 'var(--body-text)', opacity: 0.6 }}>
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                      </svg>
                                      <Link
                                        href={group.productSlug ? `${ROUTES.PRODUCTS}/${group.productSlug}` : `${ROUTES.PRODUCTS}`}
                                        className="hover:underline"
                                        style={{ color: 'var(--honey-gold)' }}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                        }}
                                      >
                                        {group.productName || `Proizvod #${group.productId}`}
                                      </Link>
                                      {review.isReply && (
                                        <>
                                          <span>•</span>
                                          <span className="px-2 py-0.5 rounded" style={{ backgroundColor: 'rgba(212, 167, 44, 0.1)', color: 'var(--honey-gold)' }}>
                                            Odgovor
                                          </span>
                                        </>
                                      )}
                                    </div>
                                    {/* Reply indicator */}
                                    {review.isReply && (
                                      <div className="mb-3 p-2 rounded-lg border" style={{ borderColor: 'rgba(212, 167, 44, 0.2)', backgroundColor: 'rgba(212, 167, 44, 0.05)' }}>
                                        <div className="flex items-center gap-1.5 text-xs mb-1" style={{ fontFamily: 'var(--font-inter)', color: 'var(--honey-gold)' }}>
                                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                          </svg>
                                          <span className="font-semibold">Odgovor na komentar:</span>
                                        </div>
                                        {review.parentComment && (
                                          <p className="text-xs italic" style={{ fontFamily: 'var(--font-inter)', color: 'var(--body-text)', opacity: 0.7 }}>
                                            "{review.parentComment.substring(0, 80)}{review.parentComment.length > 80 ? '...' : ''}"
                                          </p>
                                        )}
                                      </div>
                                    )}

                                    {/* Comment Info */}
                                    <div className="mb-3 pb-3 border-b" style={{ borderColor: 'var(--border-light)' }}>
                                      <div className="flex items-center justify-between flex-wrap gap-2">
                                        <div className="flex items-center gap-3">
                                          <p
                                            className="text-xs"
                                            style={{
                                              fontFamily: 'var(--font-inter)',
                                              color: 'var(--body-text)',
                                              opacity: 0.7,
                                            }}
                                          >
                                            {review.timeAgo}
                                          </p>
                                          <span className="text-xs" style={{ fontFamily: 'var(--font-inter)', color: 'var(--body-text)', opacity: 0.5 }}>
                                            •
                                          </span>
                                          <span className="text-xs" style={{ fontFamily: 'var(--font-inter)', color: 'var(--body-text)', opacity: 0.7 }}>
                                            ID: {review.id}
                                          </span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Comment Text */}
                                    {editingReviewId?.reviewId === review.id && editingReviewId?.productId === review.productId ? (
                                      <div className="space-y-3 mb-3">
                                        <textarea
                                          value={editingReviewText}
                                          onChange={(e) => setEditingReviewText(e.target.value)}
                                          onKeyDown={(e) => {
                                            if (e.key === 'Escape') {
                                              setEditingReviewId(null);
                                              setEditingReviewText('');
                                            }
                                            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                                              e.preventDefault();
                                              handleSaveReviewEdit();
                                            }
                                          }}
                                          className="w-full px-4 py-3 rounded-xl border-2 text-sm focus:outline-none resize-none transition-all"
                                          style={{
                                            borderColor: 'var(--honey-gold)',
                                            fontFamily: 'var(--font-inter)',
                                            color: 'var(--dark-text)',
                                            minHeight: '100px',
                                          }}
                                          rows={4}
                                          autoFocus
                                          placeholder="Unesite vaš komentar..."
                                        />
                                        <div className="flex gap-2 items-center">
                                          <button
                                            onClick={handleSaveReviewEdit}
                                            disabled={!editingReviewText.trim()}
                                            className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                            style={{
                                              backgroundColor: editingReviewText.trim() ? 'var(--honey-gold)' : 'var(--border-light)',
                                              color: 'var(--dark-text)',
                                              fontFamily: 'var(--font-inter)',
                                            }}
                                          >
                                            Sačuvaj
                                          </button>
                                          <button
                                            onClick={() => {
                                              setEditingReviewId(null);
                                              setEditingReviewText('');
                                            }}
                                            className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
                                            style={{
                                              backgroundColor: 'var(--border-light)',
                                              color: 'var(--dark-text)',
                                              fontFamily: 'var(--font-inter)',
                                            }}
                                            onMouseEnter={(e) => {
                                              e.currentTarget.style.backgroundColor = '#e5e5e5';
                                            }}
                                            onMouseLeave={(e) => {
                                              e.currentTarget.style.backgroundColor = 'var(--border-light)';
                                            }}
                                          >
                                            Otkaži
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      <Link
                                        href={group.productSlug ? `${ROUTES.PRODUCTS}/${group.productSlug}?reviewId=${review.id}${review.isReply ? `&replyId=${review.id}&parentReviewId=${review.parentReviewId}` : ''}` : `${ROUTES.PRODUCTS}`}
                                        className="block"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                        }}
                                      >
                                        <p
                                          className="text-sm leading-relaxed mb-3 hover:opacity-80 transition-opacity cursor-pointer"
                                          style={{
                                            fontFamily: 'var(--font-inter)',
                                            color: 'var(--body-text)',
                                          }}
                                        >
                                          {review.comment}
                                        </p>
                                      </Link>
                                    )}

                                    {/* Stats and Actions */}
                                    <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: 'var(--border-light)' }}>
                                      <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--green-primary)', fontFamily: 'var(--font-inter)' }}>
                                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                                          </svg>
                                          <span>{review.likes}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-xs" style={{ color: '#dc2626', fontFamily: 'var(--font-inter)' }}>
                                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                                          </svg>
                                          <span>{review.dislikes}</span>
                                        </div>
                                      </div>

                                      {!editingReviewId || editingReviewId.reviewId !== review.id || editingReviewId.productId !== review.productId ? (
                                        <div className="flex gap-2">
                                          <button
                                            onClick={() => handleEditReview(review.id, review.productId)}
                                            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                                            style={{
                                              backgroundColor: 'var(--border-light)',
                                              color: 'var(--dark-text)',
                                              fontFamily: 'var(--font-inter)',
                                            }}
                                            onMouseEnter={(e) => {
                                              e.currentTarget.style.backgroundColor = '#e5e5e5';
                                            }}
                                            onMouseLeave={(e) => {
                                              e.currentTarget.style.backgroundColor = 'var(--border-light)';
                                            }}
                                          >
                                            Uredi
                                          </button>
                                          <button
                                            onClick={() => setShowDeleteReviewConfirm({ reviewId: review.id, productId: review.productId })}
                                            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                                            style={{
                                              backgroundColor: 'transparent',
                                              color: '#dc2626',
                                              border: '1px solid #dc2626',
                                              fontFamily: 'var(--font-inter)',
                                            }}
                                            onMouseEnter={(e) => {
                                              e.currentTarget.style.backgroundColor = '#fee2e2';
                                            }}
                                            onMouseLeave={(e) => {
                                              e.currentTarget.style.backgroundColor = 'transparent';
                                            }}
                                          >
                                            Obriši
                                          </button>
                                        </div>
                                      ) : null}
                                    </div>
                                  </div>
                                ))}
                                {group.reviews.length > COMMENTS_PER_GROUP && (
                                  <div className="mt-4 p-4 rounded-xl border-2 text-center" style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--cream)' }}>
                                    <p className="text-sm" style={{ fontFamily: 'var(--font-inter)', color: 'var(--body-text)', opacity: 0.7 }}>
                                      +{group.reviews.length - COMMENTS_PER_GROUP} {group.reviews.length - COMMENTS_PER_GROUP === 1 ? 'komentar' : 'komentara'} više na ovom proizvodu
                                    </p>
                                    <Link
                                      href={group.productSlug ? `${ROUTES.PRODUCTS}/${group.productSlug}` : `${ROUTES.PRODUCTS}`}
                                      className="inline-block mt-2 px-4 py-2 rounded-xl text-sm font-medium transition-all relative z-20"
                                      style={{
                                        backgroundColor: 'var(--honey-gold)',
                                        color: 'var(--dark-text)',
                                        fontFamily: 'var(--font-inter)',
                                      }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                      }}
                                      onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = 'var(--honey-light)';
                                      }}
                                      onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = 'var(--honey-gold)';
                                      }}
                                    >
                                      Vidi sve komentare →
                                    </Link>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}

                          {/* Pagination */}
                          {totalPages > 1 && (
                            <div className="mt-8 flex flex-col items-center gap-4">
                              <div className="flex items-center justify-center gap-2 flex-wrap">
                                <button
                                  onClick={() => {
                                    setCommentsPage(1);
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                  }}
                                  disabled={commentsPage === 1}
                                  className="px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                  style={{
                                    backgroundColor: commentsPage === 1 ? 'var(--border-light)' : 'var(--honey-gold)',
                                    color: 'var(--dark-text)',
                                    fontFamily: 'var(--font-inter)',
                                  }}
                                  onMouseEnter={(e) => {
                                    if (commentsPage !== 1) {
                                      e.currentTarget.style.transform = 'translateY(-1px)';
                                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(212, 167, 44, 0.3)';
                                    }
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                  }}
                                >
                                  Prva
                                </button>
                                <button
                                  onClick={() => {
                                    setCommentsPage(prev => Math.max(1, prev - 1));
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                  }}
                                  disabled={commentsPage === 1}
                                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                  style={{
                                    backgroundColor: commentsPage === 1 ? 'var(--border-light)' : 'var(--honey-gold)',
                                    color: 'var(--dark-text)',
                                    fontFamily: 'var(--font-inter)',
                                  }}
                                  onMouseEnter={(e) => {
                                    if (commentsPage !== 1) {
                                      e.currentTarget.style.transform = 'translateY(-1px)';
                                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(212, 167, 44, 0.3)';
                                    }
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                  }}
                                >
                                  Prethodna
                                </button>
                                
                                {/* Page Numbers */}
                                <div className="flex items-center gap-1">
                                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let pageNum;
                                    if (totalPages <= 5) {
                                      pageNum = i + 1;
                                    } else if (commentsPage <= 3) {
                                      pageNum = i + 1;
                                    } else if (commentsPage >= totalPages - 2) {
                                      pageNum = totalPages - 4 + i;
                                    } else {
                                      pageNum = commentsPage - 2 + i;
                                    }
                                    
                                    return (
                                      <button
                                        key={pageNum}
                                        onClick={() => {
                                          setCommentsPage(pageNum);
                                          window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }}
                                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                          commentsPage === pageNum ? '' : 'hover:bg-gray-100'
                                        }`}
                                        style={{
                                          backgroundColor: commentsPage === pageNum ? 'var(--honey-gold)' : 'transparent',
                                          color: commentsPage === pageNum ? 'var(--dark-text)' : 'var(--body-text)',
                                          fontFamily: 'var(--font-inter)',
                                          boxShadow: commentsPage === pageNum ? '0 2px 8px rgba(212, 167, 44, 0.3)' : 'none',
                                        }}
                                        onMouseEnter={(e) => {
                                          if (commentsPage !== pageNum) {
                                            e.currentTarget.style.backgroundColor = 'rgba(212, 167, 44, 0.1)';
                                            e.currentTarget.style.color = 'var(--honey-gold)';
                                          }
                                        }}
                                        onMouseLeave={(e) => {
                                          if (commentsPage !== pageNum) {
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                            e.currentTarget.style.color = 'var(--body-text)';
                                          }
                                        }}
                                      >
                                        {pageNum}
                                      </button>
                                    );
                                  })}
                                </div>
                                
                                <button
                                  onClick={() => {
                                    setCommentsPage(prev => Math.min(totalPages, prev + 1));
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                  }}
                                  disabled={commentsPage === totalPages}
                                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                  style={{
                                    backgroundColor: commentsPage === totalPages ? 'var(--border-light)' : 'var(--honey-gold)',
                                    color: 'var(--dark-text)',
                                    fontFamily: 'var(--font-inter)',
                                  }}
                                  onMouseEnter={(e) => {
                                    if (commentsPage !== totalPages) {
                                      e.currentTarget.style.transform = 'translateY(-1px)';
                                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(212, 167, 44, 0.3)';
                                    }
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                  }}
                                >
                                  Sljedeća
                                </button>
                                <button
                                  onClick={() => {
                                    setCommentsPage(totalPages);
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                  }}
                                  disabled={commentsPage === totalPages}
                                  className="px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                  style={{
                                    backgroundColor: commentsPage === totalPages ? 'var(--border-light)' : 'var(--honey-gold)',
                                    color: 'var(--dark-text)',
                                    fontFamily: 'var(--font-inter)',
                                  }}
                                  onMouseEnter={(e) => {
                                    if (commentsPage !== totalPages) {
                                      e.currentTarget.style.transform = 'translateY(-1px)';
                                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(212, 167, 44, 0.3)';
                                    }
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                  }}
                                >
                                  Zadnja
                                </button>
                              </div>
                              <div className="text-center space-y-1">
                                <p
                                  className="text-sm font-medium"
                                  style={{
                                    fontFamily: 'var(--font-inter)',
                                    color: 'var(--dark-text)',
                                  }}
                                >
                                  Stranica {commentsPage} od {totalPages}
                                </p>
                                <p
                                  className="text-xs"
                                  style={{
                                    fontFamily: 'var(--font-inter)',
                                    color: 'var(--body-text)',
                                    opacity: 0.6,
                                  }}
                                >
                                  Prikazano {Math.min((commentsPage - 1) * COMMENTS_PER_PAGE + 1, totalGroups)}-{Math.min(commentsPage * COMMENTS_PER_PAGE, totalGroups)} od {totalGroups} grupa proizvoda
                                </p>
                                <p
                                  className="text-xs"
                                  style={{
                                    fontFamily: 'var(--font-inter)',
                                    color: 'var(--body-text)',
                                    opacity: 0.5,
                                  }}
                                >
                                  Ukupno {filteredReviews.length} komentara
                                </p>
                              </div>
                            </div>
                          )}
                        </>
                      );
                    })()}
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div
                className="bg-white rounded-2xl p-8 shadow-lg border transition-all duration-300 animate-fade-in"
                style={{ 
                  borderColor: 'var(--border-light)',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
                }}
              >
                <div className="mb-8 pb-6 border-b" style={{ borderColor: 'var(--border-light)' }}>
                  <h2
                    className="text-3xl font-bold mb-2"
                    style={{
                      fontFamily: 'var(--font-serif)',
                      color: 'var(--dark-text)',
                    }}
                  >
                    Sigurnost
                  </h2>
                  <p
                    className="text-sm"
                    style={{
                      fontFamily: 'var(--font-inter)',
                      color: 'var(--body-text)',
                      opacity: 0.8,
                    }}
                  >
                    Upravljajte sigurnošću vašeg naloga
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Change Password */}
                  <div
                    className="p-6 rounded-xl border-2 transition-all duration-300"
                    style={{
                      borderColor: 'var(--border-light)',
                      backgroundColor: 'var(--cream)',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                    }}
                  >
                    <h3
                      className="text-xl font-bold mb-5"
                      style={{
                        fontFamily: 'var(--font-serif)',
                        color: 'var(--dark-text)',
                      }}
                    >
                      Promijeni lozinku
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label
                          className="block text-sm font-medium mb-2"
                          style={{
                            fontFamily: 'var(--font-inter)',
                            color: 'var(--dark-text)',
                          }}
                        >
                          Trenutna lozinka
                        </label>
                        <input
                          type="password"
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                          className="w-full px-4 py-3.5 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2"
                          style={{
                            borderColor: 'var(--border-light)',
                            fontFamily: 'var(--font-inter)',
                            color: 'var(--dark-text)',
                            backgroundColor: '#ffffff',
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = 'var(--honey-gold)';
                            e.target.style.boxShadow = '0 0 0 4px rgba(212, 167, 44, 0.1)';
                            e.target.style.backgroundColor = 'var(--warm-white)';
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = 'var(--border-light)';
                            e.target.style.boxShadow = 'none';
                            e.target.style.backgroundColor = '#ffffff';
                          }}
                          placeholder="Unesite trenutnu lozinku"
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
                          Nova lozinka
                        </label>
                        <input
                          type="password"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          className="w-full px-4 py-3.5 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2"
                          style={{
                            borderColor: 'var(--border-light)',
                            fontFamily: 'var(--font-inter)',
                            color: 'var(--dark-text)',
                            backgroundColor: '#ffffff',
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = 'var(--honey-gold)';
                            e.target.style.boxShadow = '0 0 0 4px rgba(212, 167, 44, 0.1)';
                            e.target.style.backgroundColor = 'var(--warm-white)';
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = 'var(--border-light)';
                            e.target.style.boxShadow = 'none';
                            e.target.style.backgroundColor = '#ffffff';
                          }}
                          placeholder="Minimum 6 karaktera"
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
                          Potvrdi novu lozinku
                        </label>
                        <input
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                          className="w-full px-4 py-3.5 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2"
                          style={{
                            borderColor: 'var(--border-light)',
                            fontFamily: 'var(--font-inter)',
                            color: 'var(--dark-text)',
                            backgroundColor: '#ffffff',
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = 'var(--honey-gold)';
                            e.target.style.boxShadow = '0 0 0 4px rgba(212, 167, 44, 0.1)';
                            e.target.style.backgroundColor = 'var(--warm-white)';
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = 'var(--border-light)';
                            e.target.style.boxShadow = 'none';
                            e.target.style.backgroundColor = '#ffffff';
                          }}
                          placeholder="Ponovite novu lozinku"
                        />
                      </div>

                      <button
                        onClick={handleChangePassword}
                        disabled={isChangingPassword}
                        className="px-6 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                          background: 'linear-gradient(135deg, #f5c852 0%, #f0c855 100%)',
                          color: 'var(--dark-text)',
                          fontFamily: 'var(--font-inter)',
                          boxShadow: '0 2px 8px rgba(212, 167, 44, 0.25)',
                          border: '1px solid rgba(212, 167, 44, 0.2)',
                        }}
                        onMouseEnter={(e) => {
                          if (!isChangingPassword) {
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
                        {isChangingPassword ? (
                          <>
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Čuvanje...
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Sačuvaj promjenu lozinke
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Account Actions */}
                  <div
                    className="p-6 rounded-xl border-2 transition-all duration-300"
                    style={{
                      backgroundColor: '#fef2f2',
                      borderColor: '#fecaca',
                      boxShadow: '0 2px 8px rgba(220, 38, 38, 0.1)',
                    }}
                  >
                    <h3
                      className="text-xl font-bold mb-5"
                      style={{
                        fontFamily: 'var(--font-serif)',
                        color: '#dc2626',
                      }}
                    >
                      Akcije naloga
                    </h3>

                    <div className="space-y-4">
                      <button
                        onClick={handleRequestAccountDeletionClick}
                        className="w-full px-6 py-2.5 rounded-lg font-medium transition-all duration-200 text-left"
                        style={{
                          backgroundColor: 'transparent',
                          color: '#dc2626',
                          border: '1px solid #dc2626',
                          fontFamily: 'var(--font-inter)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#fee2e2';
                          e.currentTarget.style.boxShadow = '0 2px 8px rgba(220, 38, 38, 0.15)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        Zatraži brisanje naloga
                      </button>

                      <p
                        className="text-sm"
                        style={{
                          fontFamily: 'var(--font-inter)',
                          color: 'var(--body-text)',
                        }}
                      >
                        Možete zatražiti brisanje vašeg naloga. Zahtjev će biti obrađen u roku od 30 dana.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Order Detail Modal */}
      {showOrderModal && selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
          }}
          onClick={handleCloseOrderModal}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
            style={{
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            }}
          >
            {/* Modal Header */}
            <div className="p-6 border-b flex items-center justify-between flex-shrink-0" style={{ borderColor: 'var(--border-light)' }}>
              <div>
                <h2
                  className="text-2xl font-bold mb-1"
                  style={{
                    fontFamily: 'var(--font-serif)',
                    color: 'var(--dark-text)',
                  }}
                >
                  Narudžba #{selectedOrder.orderNumber}
                </h2>
                <p
                  className="text-sm"
                  style={{
                    fontFamily: 'var(--font-inter)',
                    color: 'var(--body-text)',
                    opacity: 0.7,
                  }}
                >
                  {(() => {
                    const orderDate = new Date(selectedOrder.createdAt);
                    const day = orderDate.getDate().toString().padStart(2, '0');
                    const month = (orderDate.getMonth() + 1).toString().padStart(2, '0');
                    const year = orderDate.getFullYear();
                    const hours = orderDate.getHours().toString().padStart(2, '0');
                    const minutes = orderDate.getMinutes().toString().padStart(2, '0');
                    return `${day}.${month}.${year}. u ${hours}:${minutes}`;
                  })()}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className="px-4 py-2 rounded-full text-sm font-medium"
                  style={{
                    backgroundColor: `${getStatusColor(selectedOrder.status)}15`,
                    color: getStatusColor(selectedOrder.status),
                    fontFamily: 'var(--font-inter)',
                  }}
                >
                  {getStatusLabel(selectedOrder.status)}
                </span>
                <button
                  onClick={handleCloseOrderModal}
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200"
                  style={{
                    backgroundColor: 'var(--border-light)',
                    color: 'var(--dark-text)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#e5e5e5';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--border-light)';
                  }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6" style={{ scrollbarWidth: 'thin' }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Shipping Address */}
                {selectedOrder.shippingAddress && (
                  <div className="bg-white rounded-xl p-5 border-2" style={{ borderColor: 'var(--border-light)' }}>
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
                      className="text-base leading-relaxed"
                      style={{
                        fontFamily: 'var(--font-inter)',
                        color: 'var(--body-text)',
                      }}
                    >
                      {selectedOrder.shippingAddress.street}<br />
                      {selectedOrder.shippingAddress.postalCode} {selectedOrder.shippingAddress.city}<br />
                      {selectedOrder.shippingAddress.country}
                    </p>
                  </div>
                )}

                {/* Tracking Info */}
                <div className="bg-white rounded-xl p-5 border-2" style={{ borderColor: 'var(--border-light)' }}>
                  <h3
                    className="text-lg font-semibold mb-4"
                    style={{
                      fontFamily: 'var(--font-serif)',
                      color: 'var(--dark-text)',
                    }}
                  >
                    Praćenje narudžbe
                  </h3>
                  {selectedOrder.trackingNumber && (
                    <div className="mb-4 p-3 rounded-lg flex items-center justify-between" style={{ backgroundColor: 'rgba(245, 200, 82, 0.1)', border: '1px solid rgba(212, 167, 44, 0.2)' }}>
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
                          className="font-mono font-semibold text-sm"
                          style={{
                            fontFamily: 'var(--font-inter)',
                            color: 'var(--dark-text)',
                          }}
                        >
                          {selectedOrder.trackingNumber}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(selectedOrder.trackingNumber || '');
                          showToast('Broj za praćenje je kopiran', 'success');
                        }}
                        className="p-2 rounded-lg transition-all duration-200"
                        style={{
                          backgroundColor: 'rgba(212, 167, 44, 0.2)',
                          color: 'var(--honey-gold)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(212, 167, 44, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(212, 167, 44, 0.2)';
                        }}
                        title="Kopiraj broj za praćenje"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                  )}
                  {selectedOrder.estimatedDelivery && selectedOrder.status !== 'delivered' && selectedOrder.status !== 'cancelled' && (
                    <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: 'rgba(132, 168, 122, 0.1)', border: '1px solid rgba(132, 168, 122, 0.2)' }}>
                      <p
                        className="text-xs mb-1"
                        style={{
                          fontFamily: 'var(--font-inter)',
                          color: 'var(--body-text)',
                          opacity: 0.7,
                        }}
                      >
                        Procijenjena dostava:
                      </p>
                      <p
                        className="font-semibold text-sm"
                        style={{
                          fontFamily: 'var(--font-inter)',
                          color: 'var(--dark-text)',
                        }}
                      >
                        {(() => {
                          const deliveryDate = new Date(selectedOrder.estimatedDelivery!);
                          const day = deliveryDate.getDate().toString().padStart(2, '0');
                          const month = (deliveryDate.getMonth() + 1).toString().padStart(2, '0');
                          const year = deliveryDate.getFullYear();
                          return `${day}.${month}.${year}.`;
                        })()}
                      </p>
                    </div>
                  )}
                  <div className="space-y-3">
                    <div className="relative">
                      {/* Progress Line */}
                      <div
                        className="absolute left-1.5 top-3 bottom-3 w-0.5"
                        style={{
                          backgroundColor: selectedOrder.status !== 'pending' && selectedOrder.status !== 'cancelled' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(0, 0, 0, 0.1)',
                        }}
                      />
                      
                      <div className="space-y-4 relative">
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 relative z-10 ${
                              ['pending', 'processing', 'shipped', 'delivered'].includes(selectedOrder.status) ? 'bg-green-500' : 'bg-gray-300'
                            }`}
                            style={{
                              boxShadow: ['pending', 'processing', 'shipped', 'delivered'].includes(selectedOrder.status) ? '0 0 0 3px rgba(34, 197, 94, 0.2)' : 'none',
                            }}
                          />
                          <div>
                            <p
                              className="font-medium text-sm"
                              style={{
                                fontFamily: 'var(--font-inter)',
                                color: 'var(--dark-text)',
                              }}
                            >
                              Narudžba kreirana
                            </p>
                            <p
                              className="text-xs"
                              style={{
                                fontFamily: 'var(--font-inter)',
                                color: 'var(--body-text)',
                                opacity: 0.7,
                              }}
                            >
                              {(() => {
                                const orderDate = new Date(selectedOrder.createdAt);
                                const day = orderDate.getDate().toString().padStart(2, '0');
                                const month = (orderDate.getMonth() + 1).toString().padStart(2, '0');
                                const year = orderDate.getFullYear();
                                const hours = orderDate.getHours().toString().padStart(2, '0');
                                const minutes = orderDate.getMinutes().toString().padStart(2, '0');
                                return `${day}.${month}.${year}. u ${hours}:${minutes}`;
                              })()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 relative z-10 ${
                              ['processing', 'shipped', 'delivered'].includes(selectedOrder.status) ? 'bg-green-500' : 'bg-gray-300'
                            }`}
                            style={{
                              boxShadow: ['processing', 'shipped', 'delivered'].includes(selectedOrder.status) ? '0 0 0 3px rgba(34, 197, 94, 0.2)' : 'none',
                            }}
                          />
                          <div>
                            <p
                              className="font-medium text-sm"
                              style={{
                                fontFamily: 'var(--font-inter)',
                                color: 'var(--dark-text)',
                              }}
                            >
                              U obradi
                            </p>
                            {['processing', 'shipped', 'delivered'].includes(selectedOrder.status) && (
                              <p
                                className="text-xs"
                                style={{
                                  fontFamily: 'var(--font-inter)',
                                  color: 'var(--body-text)',
                                  opacity: 0.7,
                                }}
                              >
                                Vaša narudžba se priprema
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 relative z-10 ${
                              ['shipped', 'delivered'].includes(selectedOrder.status) ? 'bg-green-500' : 'bg-gray-300'
                            }`}
                            style={{
                              boxShadow: ['shipped', 'delivered'].includes(selectedOrder.status) ? '0 0 0 3px rgba(34, 197, 94, 0.2)' : 'none',
                            }}
                          />
                          <div>
                            <p
                              className="font-medium text-sm"
                              style={{
                                fontFamily: 'var(--font-inter)',
                                color: 'var(--dark-text)',
                              }}
                            >
                              Poslato
                            </p>
                            {['shipped', 'delivered'].includes(selectedOrder.status) && selectedOrder.trackingNumber && (
                              <p
                                className="text-xs font-mono"
                                style={{
                                  fontFamily: 'var(--font-inter)',
                                  color: 'var(--body-text)',
                                  opacity: 0.7,
                                }}
                              >
                                Praćenje: {selectedOrder.trackingNumber}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 relative z-10 ${
                              selectedOrder.status === 'delivered' ? 'bg-green-500' : selectedOrder.status === 'cancelled' ? 'bg-red-500' : 'bg-gray-300'
                            }`}
                            style={{
                              boxShadow: selectedOrder.status === 'delivered' ? '0 0 0 3px rgba(34, 197, 94, 0.2)' : selectedOrder.status === 'cancelled' ? '0 0 0 3px rgba(239, 68, 68, 0.2)' : 'none',
                            }}
                          />
                          <div>
                            <p
                              className="font-medium text-sm"
                              style={{
                                fontFamily: 'var(--font-inter)',
                                color: 'var(--dark-text)',
                              }}
                            >
                              {selectedOrder.status === 'cancelled' ? 'Otkazano' : 'Dostavljeno'}
                            </p>
                            {selectedOrder.status === 'delivered' && selectedOrder.estimatedDelivery && (
                              <p
                                className="text-xs"
                                style={{
                                  fontFamily: 'var(--font-inter)',
                                  color: 'var(--body-text)',
                                  opacity: 0.7,
                                }}
                              >
                                Dostavljeno: {(() => {
                                  const deliveryDate = new Date(selectedOrder.estimatedDelivery);
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
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-white rounded-xl p-5 border-2 mb-6" style={{ borderColor: 'var(--border-light)' }}>
                <h3
                  className="text-lg font-semibold mb-4"
                  style={{
                    fontFamily: 'var(--font-serif)',
                    color: 'var(--dark-text)',
                  }}
                >
                  Proizvodi ({selectedOrder.items.length})
                </h3>
                <div className="space-y-4">
                  {selectedOrder.items.map((item, idx) => {
                    const product = getProductById(item.productId);
                    if (!product) return null;
                    
                    const itemsSubtotal = item.price * item.quantity;
                    const itemsTax = itemsSubtotal * 0.17;
                    const itemsTotal = itemsSubtotal + itemsTax;

                    return (
                      <div key={idx} className="flex gap-4 pb-4 border-b last:border-b-0 last:pb-0" style={{ borderColor: 'var(--border-light)' }}>
                        {product.image && (
                          <Link href={`${ROUTES.PRODUCTS}/${product.slug}`} className="flex-shrink-0">
                            <div className="w-20 h-20 rounded-lg overflow-hidden border" style={{ borderColor: 'var(--border-light)' }}>
                              <Image
                                src={product.image}
                                alt={product.name}
                                width={80}
                                height={80}
                                className="object-cover w-full h-full"
                              />
                            </div>
                          </Link>
                        )}
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`${ROUTES.PRODUCTS}/${product.slug}`}
                            className="font-semibold text-base hover:underline block mb-2"
                            style={{
                              fontFamily: 'var(--font-inter)',
                              color: 'var(--dark-text)',
                            }}
                          >
                            {product.name}
                          </Link>
                          <div className="space-y-1">
                            <p
                              className="text-sm"
                              style={{
                                fontFamily: 'var(--font-inter)',
                                color: 'var(--body-text)',
                              }}
                            >
                              Težina: {item.weight}
                            </p>
                            <p
                              className="text-sm"
                              style={{
                                fontFamily: 'var(--font-inter)',
                                color: 'var(--body-text)',
                              }}
                            >
                              Količina: {item.quantity}
                            </p>
                            <p
                              className="text-sm"
                              style={{
                                fontFamily: 'var(--font-inter)',
                                color: 'var(--body-text)',
                              }}
                            >
                              Cijena po komadu: {item.price.toFixed(2)} {selectedOrder.currency}
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p
                            className="font-bold text-lg"
                            style={{
                              fontFamily: 'var(--font-inter)',
                              color: 'var(--dark-text)',
                            }}
                          >
                            {itemsTotal.toFixed(2)} {selectedOrder.currency}
                          </p>
                          <p
                            className="text-xs mt-1"
                            style={{
                              fontFamily: 'var(--font-inter)',
                              color: 'var(--body-text)',
                              opacity: 0.7,
                            }}
                          >
                            {itemsSubtotal.toFixed(2)} + {itemsTax.toFixed(2)} PDV
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Invoice Summary */}
              <div className="bg-white rounded-xl p-5 border-2" style={{ borderColor: 'var(--border-light)' }}>
                <h3
                  className="text-lg font-semibold mb-4"
                  style={{
                    fontFamily: 'var(--font-serif)',
                    color: 'var(--dark-text)',
                  }}
                >
                  Sažetak računa
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span
                      className="text-base"
                      style={{
                        fontFamily: 'var(--font-inter)',
                        color: 'var(--body-text)',
                      }}
                    >
                      Ukupno proizvoda:
                    </span>
                    <span
                      className="text-base font-semibold"
                      style={{
                        fontFamily: 'var(--font-inter)',
                        color: 'var(--dark-text)',
                      }}
                    >
                      {selectedOrder.items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)} {selectedOrder.currency}
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
                      PDV (17%):
                    </span>
                    <span
                      className="text-base font-semibold"
                      style={{
                        fontFamily: 'var(--font-inter)',
                        color: 'var(--dark-text)',
                      }}
                    >
                      {(selectedOrder.items.reduce((sum, item) => sum + item.price * item.quantity, 0) * 0.17).toFixed(2)} {selectedOrder.currency}
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
                      Troškovi dostave:
                    </span>
                    <span
                      className="text-base font-semibold"
                      style={{
                        fontFamily: 'var(--font-inter)',
                        color: 'var(--dark-text)',
                      }}
                    >
                      5.00 {selectedOrder.currency}
                    </span>
                  </div>
                  <div className="pt-3 mt-3 border-t" style={{ borderColor: 'var(--border-light)' }}>
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
                        {selectedOrder.total.toFixed(2)} {selectedOrder.currency}
                      </span>
                    </div>
                  </div>
                  
                  {/* Payment Method Info */}
                  {selectedOrder.paymentMethod && (
                    <div className="pt-4 mt-4 border-t" style={{ borderColor: 'var(--border-light)' }}>
                      <p
                        className="text-xs mb-2"
                        style={{
                          fontFamily: 'var(--font-inter)',
                          color: 'var(--body-text)',
                          opacity: 0.7,
                        }}
                      >
                        Način plaćanja:
                      </p>
                      {selectedOrder.paymentMethod === 'cash' && (
                        <div className="flex items-center gap-2">
                          <svg
                            className="w-5 h-5 flex-shrink-0"
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
                          <span
                            className="text-sm font-medium"
                            style={{
                              fontFamily: 'var(--font-inter)',
                              color: 'var(--dark-text)',
                            }}
                          >
                            Gotovinsko plaćanje preuzećem
                          </span>
                        </div>
                      )}
                      {selectedOrder.paymentMethod === 'transfer' && (
                        <div className="flex items-center gap-2">
                          <svg
                            className="w-5 h-5 flex-shrink-0"
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
                          <span
                            className="text-sm font-medium"
                            style={{
                              fontFamily: 'var(--font-inter)',
                              color: 'var(--dark-text)',
                            }}
                          >
                            Bankovni transfer
                          </span>
                        </div>
                      )}
                      {selectedOrder.paymentMethod === 'card' && selectedOrder.paymentCardId && paymentCards.length > 0 && (() => {
                        const card = paymentCards.find(c => c.id === selectedOrder.paymentCardId);
                        if (!card) return null;
                        return (
                          <div className="flex items-center gap-2">
                            <div
                              className="w-8 h-5 rounded flex items-center justify-center"
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
                            <span
                              className="text-sm font-medium"
                              style={{
                                fontFamily: 'var(--font-inter)',
                                color: 'var(--dark-text)',
                              }}
                            >
                              •••• •••• •••• {card.last4}
                            </span>
                          </div>
                        );
                      })()}
                      {selectedOrder.paymentMethod === 'card' && !selectedOrder.paymentCardId && (
                        <span
                          className="text-sm font-medium"
                          style={{
                            fontFamily: 'var(--font-inter)',
                            color: 'var(--dark-text)',
                          }}
                        >
                          Kartično plaćanje
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Contact Support */}
              <div className="bg-white rounded-xl p-5 border-2 mt-8" style={{ borderColor: 'rgba(212, 167, 44, 0.3)', backgroundColor: 'rgba(245, 200, 82, 0.05)' }}>
                <div className="flex items-start gap-4">
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
                      d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                  <div>
                    <p
                      className="font-semibold text-sm mb-2"
                      style={{
                        fontFamily: 'var(--font-inter)',
                        color: 'var(--dark-text)',
                      }}
                    >
                      Trebate pomoć?
                    </p>
                    <p
                      className="text-sm mb-3"
                      style={{
                        fontFamily: 'var(--font-inter)',
                        color: 'var(--body-text)',
                      }}
                    >
                      Ako imate pitanja o vašoj narudžbi, kontaktirajte našu podršku.
                    </p>
                    <Link
                      href={ROUTES.CONTACT}
                      className="text-sm font-medium hover:underline inline-flex items-center gap-1"
                      style={{
                        color: 'var(--honey-gold)',
                        fontFamily: 'var(--font-inter)',
                      }}
                    >
                      Kontaktirajte nas
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer - Actions */}
            <div className="p-6 border-t flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 flex-shrink-0" style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--cream)' }}>
              <div className="flex flex-col sm:flex-row gap-3 flex-1">
                <button
                  onClick={handleReorderItems}
                  className="px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 flex-1 sm:flex-initial"
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
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Dodaj u korpu
                </button>
                <button
                  onClick={handlePrintOrder}
                  className="px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 flex-1 sm:flex-initial"
                  style={{
                    backgroundColor: 'white',
                    border: '1px solid var(--border-light)',
                    color: 'var(--dark-text)',
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
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Štampaj
                </button>
              </div>
              <div className="flex gap-3">
                {selectedOrder.status !== 'cancelled' && selectedOrder.status !== 'delivered' && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleCancelOrderClick(selectedOrder.id);
                    }}
                    className="px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2"
                    style={{
                      backgroundColor: 'transparent',
                      border: '1px solid #dc2626',
                      color: '#dc2626',
                      fontFamily: 'var(--font-inter)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#fee2e2';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Otkaži narudžbu
                  </button>
                )}
                <button
                  onClick={handleCloseOrderModal}
                  className="px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: 'white',
                    border: '1px solid var(--border-light)',
                    color: 'var(--dark-text)',
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
                  Zatvori
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Order Confirmation Modal */}
      {showCancelConfirm && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{
            zIndex: 60,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
          }}
          onClick={handleCancelConfirmClose}
        >
          <div
            className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 relative"
            style={{
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={handleCancelConfirmClose}
              className="absolute top-4 right-4 p-1 rounded-lg transition-colors"
              style={{
                color: 'var(--body-text)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--border-light)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Warning Icon */}
            <div className="flex justify-center mb-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                }}
              >
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  style={{ color: '#dc2626' }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
            </div>

            {/* Title */}
            <h3
              className="text-2xl font-bold text-center mb-3"
              style={{
                fontFamily: 'var(--font-serif)',
                color: 'var(--dark-text)',
              }}
            >
              Otkazati narudžbu?
            </h3>

            {/* Message */}
            <p
              className="text-center mb-6"
              style={{
                fontFamily: 'var(--font-inter)',
                color: 'var(--body-text)',
                lineHeight: '1.6',
              }}
            >
              Da li ste sigurni da želite otkazati ovu narudžbu? Ova akcija se ne može poništiti.
            </p>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleCancelConfirmClose}
                className="flex-1 px-4 py-3 rounded-lg font-medium transition-all duration-200"
                style={{
                  backgroundColor: 'white',
                  border: '1px solid var(--border-light)',
                  color: 'var(--dark-text)',
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
                Odustani
              </button>
              <button
                onClick={handleConfirmCancel}
                className="flex-1 px-4 py-3 rounded-lg font-medium transition-all duration-200"
                style={{
                  backgroundColor: '#dc2626',
                  border: '1px solid #dc2626',
                  color: 'white',
                  fontFamily: 'var(--font-inter)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#b91c1c';
                  e.currentTarget.style.borderColor = '#b91c1c';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#dc2626';
                  e.currentTarget.style.borderColor = '#dc2626';
                }}
              >
                Otkaži narudžbu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Review Confirmation Modal */}
      {showDeleteReviewConfirm && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{
            zIndex: 60,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
          }}
          onClick={() => setShowDeleteReviewConfirm(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 relative"
            style={{
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowDeleteReviewConfirm(null)}
              className="absolute top-4 right-4 p-1 rounded-lg transition-colors"
              style={{
                color: 'var(--body-text)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--border-light)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Warning Icon */}
            <div className="flex justify-center mb-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                }}
              >
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  style={{ color: '#dc2626' }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
            </div>

            {/* Title */}
            <h3
              className="text-2xl font-bold text-center mb-3"
              style={{
                fontFamily: 'var(--font-serif)',
                color: 'var(--dark-text)',
              }}
            >
              Obrisati komentar?
            </h3>

            {/* Message */}
            <p
              className="text-center mb-6"
              style={{
                fontFamily: 'var(--font-inter)',
                color: 'var(--body-text)',
                lineHeight: '1.6',
              }}
            >
              Da li ste sigurni da želite obrisati ovaj komentar? Ova akcija se ne može poništiti.
            </p>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteReviewConfirm(null)}
                className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
                style={{
                  backgroundColor: 'var(--border-light)',
                  color: 'var(--dark-text)',
                  fontFamily: 'var(--font-inter)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#e5e5e5';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--border-light)';
                }}
              >
                Otkaži
              </button>
              <button
                onClick={handleDeleteReview}
                className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors text-white"
                style={{
                  backgroundColor: '#dc2626',
                  fontFamily: 'var(--font-inter)',
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

      {/* Delete Account Confirmation Modal */}
      {showDeleteAccountConfirm && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{
            zIndex: 60,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
          }}
          onClick={handleCancelAccountDeletion}
        >
          <div
            className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 relative"
            style={{
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={handleCancelAccountDeletion}
              className="absolute top-4 right-4 p-1 rounded-lg transition-colors"
              style={{
                color: 'var(--body-text)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--border-light)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Warning Icon */}
            <div className="flex justify-center mb-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                }}
              >
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  style={{ color: '#dc2626' }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
            </div>

            {/* Title */}
            <h3
              className="text-2xl font-bold text-center mb-3"
              style={{
                fontFamily: 'var(--font-serif)',
                color: 'var(--dark-text)',
              }}
            >
              Zatražiti brisanje naloga?
            </h3>

            {/* Message */}
            <p
              className="text-center mb-6"
              style={{
                fontFamily: 'var(--font-inter)',
                color: 'var(--body-text)',
                lineHeight: '1.6',
              }}
            >
              Da li ste sigurni da želite zatražiti brisanje vašeg naloga? Zahtjev će biti obrađen u roku od 30 dana. Ova akcija se ne može poništiti.
            </p>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleCancelAccountDeletion}
                className="flex-1 px-4 py-3 rounded-lg font-medium transition-all duration-200"
                style={{
                  backgroundColor: 'white',
                  border: '1px solid var(--border-light)',
                  color: 'var(--dark-text)',
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
                Odustani
              </button>
              <button
                onClick={handleConfirmAccountDeletion}
                className="flex-1 px-4 py-3 rounded-lg font-medium transition-all duration-200"
                style={{
                  backgroundColor: '#dc2626',
                  border: '1px solid #dc2626',
                  color: 'white',
                  fontFamily: 'var(--font-inter)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#b91c1c';
                  e.currentTarget.style.borderColor = '#b91c1c';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#dc2626';
                  e.currentTarget.style.borderColor = '#dc2626';
                }}
              >
                Zatraži brisanje
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { getAllBeekeepers, type Beekeeper } from '@/lib/data';
import { ROUTES } from '@/config/constants';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type Message = {
  id: string;
  text: string;
  senderId: string;
  senderType: 'user' | 'beekeeper';
  timestamp: string;
  read: boolean;
};

type Chat = {
  id: string;
  beekeeperId: number;
  beekeeperName: string;
  beekeeperAvatar: string;
  beekeeperSlug: string;
  lastMessage?: Message;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
};

export default function ChatWidget() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showChatList, setShowChatList] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [beekeepers, setBeekeepers] = useState<Beekeeper[]>([]);
  const [mounted, setMounted] = useState(false);
  const [showNewChatSection, setShowNewChatSection] = useState(true);
  const [newMessageAnimation, setNewMessageAnimation] = useState(false);

  // Load beekeepers only on client side
  useEffect(() => {
    setMounted(true);
    try {
      const beekeepersData = getAllBeekeepers();
      setBeekeepers(beekeepersData);
    } catch (error) {
      console.error('Error loading beekeepers:', error);
      setBeekeepers([]);
    }
  }, []);

  // Load chats from localStorage
  useEffect(() => {
    if (user) {
      const savedChats = localStorage.getItem(`kosnica_chats_${user.id}`);
      if (savedChats) {
        try {
          const parsedChats = JSON.parse(savedChats);
          setChats(parsedChats);
        } catch (e) {
          console.error('Error loading chats:', e);
        }
      }
    }
  }, [user]);

  // Auto-show new chat section when user starts typing in search
  useEffect(() => {
    if (searchQuery.trim() && !showNewChatSection) {
      setShowNewChatSection(true);
    }
  }, [searchQuery, showNewChatSection]);

  // Auto-scroll to bottom when new message arrives
  useEffect(() => {
    if (activeChatId && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chats, activeChatId]);

  // Close chat when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isOpen && !target.closest('[data-chat-widget]')) {
        setIsOpen(false);
        setActiveChatId(null);
        setShowChatList(true);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Prevent body scroll when chat is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleOpenChat = (event: Event) => {
      const customEvent = event as CustomEvent<{
        slug?: string;
        id?: number;
        name?: string;
      }>;
      const detail = customEvent.detail;

      setIsOpen(true);
      setActiveChatId(null);
      setShowChatList(true);

      if (!user || !detail) return;

      const targetBeekeeper = beekeepers.find((beekeeper) => {
        if (detail.id && beekeeper.id === detail.id) return true;
        if (detail.slug && beekeeper.slug === detail.slug) return true;
        if (detail.name && beekeeper.name === detail.name) return true;
        return false;
      });

      if (targetBeekeeper) {
        handleStartNewChat(targetBeekeeper);
      }
    };

    window.addEventListener('kosnica:openChat', handleOpenChat as EventListener);
    return () => {
      window.removeEventListener('kosnica:openChat', handleOpenChat as EventListener);
    };
  }, [beekeepers, user, chats]);

  const saveChats = (updatedChats: Chat[]) => {
    if (user) {
      localStorage.setItem(`kosnica_chats_${user.id}`, JSON.stringify(updatedChats));
      setChats(updatedChats);
    }
  };

  const getActiveChat = () => {
    return chats.find(chat => chat.id === activeChatId);
  };

  const handleStartNewChat = (beekeeper: Beekeeper) => {
    if (!user) return;

    // Check if chat already exists
    const existingChat = chats.find(chat => chat.beekeeperId === beekeeper.id);
    
    if (existingChat) {
      setActiveChatId(existingChat.id);
      setShowChatList(false);
      // Mark messages as read
      const updatedChats = chats.map(chat => {
        if (chat.id === existingChat.id) {
          return {
            ...chat,
            messages: chat.messages.map(msg => ({ ...msg, read: true })),
            unreadCount: 0,
          };
        }
        return chat;
      });
      saveChats(updatedChats);
    } else {
      // Create new chat
      const newChat: Chat = {
        id: `chat_${user.id}_${beekeeper.id}_${Date.now()}`,
        beekeeperId: beekeeper.id,
        beekeeperName: beekeeper.name,
        beekeeperAvatar: beekeeper.avatar,
        beekeeperSlug: beekeeper.slug,
        unreadCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [],
      };
      const updatedChats = [newChat, ...chats];
      saveChats(updatedChats);
      setActiveChatId(newChat.id);
      setShowChatList(false);
    }
  };

  const handleSendMessage = async () => {
    if (!user || !activeChatId || !newMessage.trim() || isSending) return;

    const activeChat = getActiveChat();
    if (!activeChat) return;

    setIsSending(true);

    const message: Message = {
      id: `msg_${Date.now()}_${Math.random()}`,
      text: newMessage.trim(),
      senderId: user.id.toString(),
      senderType: 'user',
      timestamp: new Date().toISOString(),
      read: false,
    };

    // Add user message
    const updatedChats = chats.map(chat => {
      if (chat.id === activeChatId) {
        const updatedMessages = [...chat.messages, message];
        return {
          ...chat,
          messages: updatedMessages,
          lastMessage: message,
          updatedAt: new Date().toISOString(),
        };
      }
      return chat;
    });
    saveChats(updatedChats);
    setNewMessage('');

    // Simulate beekeeper response after 3-6 seconds (longer delay for more realistic response time)
    const timeoutId = setTimeout(() => {
      // Capture current state values at the time of response
      const currentActiveChatId = activeChatId;
      const currentIsOpen = isOpen;
      const currentShowChatList = showChatList;
      
      const beekeeperResponse: Message = {
        id: `msg_${Date.now()}_${Math.random()}`,
        text: `Hvala vam na poruci! Odgovorit ću vam u najkraćem mogućem roku.`,
        senderId: activeChat.beekeeperId.toString(),
        senderType: 'beekeeper',
        timestamp: new Date().toISOString(),
        read: false,
      };

      setChats((currentChats) => {
        const finalChats = currentChats.map(chat => {
          if (chat.id === currentActiveChatId) {
            // Don't add message again - it's already in chat.messages from previous saveChats call
            const updatedMessages = [...chat.messages, beekeeperResponse];
            
            // Always increment unread count when beekeeper responds
            const currentUnread = chat.unreadCount || 0;
            const newUnreadCount = currentUnread + 1;
            
            // Trigger animation on chat button when new message arrives
            setNewMessageAnimation(true);
            setTimeout(() => {
              setNewMessageAnimation(false);
            }, 1000);
            
            return {
              ...chat,
              messages: updatedMessages,
              lastMessage: beekeeperResponse,
              unreadCount: newUnreadCount,
              updatedAt: new Date().toISOString(),
            };
          }
          return chat;
        });
        if (user) {
          localStorage.setItem(`kosnica_chats_${user.id}`, JSON.stringify(finalChats));
        }
        return finalChats;
      });
      setIsSending(false);
    }, 3000 + Math.random() * 3000); // 3-6 seconds delay

    // Cleanup timeout on unmount
    return () => clearTimeout(timeoutId);

    setTimeout(() => setIsSending(false), 100);
  };

  const getTotalUnreadCount = () => {
    return chats.reduce((total, chat) => total + chat.unreadCount, 0);
  };

  // Sort chats first
  const sortedChats = [...chats].sort((a, b) => {
    const aTime = a.updatedAt || a.createdAt;
    const bTime = b.updatedAt || b.createdAt;
    return new Date(bTime).getTime() - new Date(aTime).getTime();
  });

  // Filter out beekeepers who already have a chat (for new chat section)
  const availableBeekeepers = beekeepers.filter(beekeeper => 
    !chats.some(chat => chat.beekeeperId === beekeeper.id)
  );

  // Filter beekeepers based on search query
  const filteredBeekeepers = searchQuery.trim()
    ? availableBeekeepers.filter(beekeeper => {
        const searchLower = searchQuery.toLowerCase();
        return (
          beekeeper.name.toLowerCase().includes(searchLower) ||
          beekeeper.location.toLowerCase().includes(searchLower)
        );
      })
    : availableBeekeepers;

  // Filter chats based on search query (for active chats section)
  const filteredChats = searchQuery.trim()
    ? sortedChats.filter(chat => {
        const searchLower = searchQuery.toLowerCase();
        return (
          chat.beekeeperName.toLowerCase().includes(searchLower) ||
          beekeepers.find(b => b.id === chat.beekeeperId)?.location.toLowerCase().includes(searchLower)
        );
      })
    : sortedChats;

  const handleChatClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!mounted) {
      return;
    }
    
    if (!isAuthenticated) {
      router.push('/prijava');
      return;
    }
    
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Chat Button - Cloud Shape */}
      <button
        onClick={handleChatClick}
        className="fixed z-[9999] transition-all duration-300 max-md:w-14 max-md:h-14"
        style={{
          background: 'linear-gradient(135deg, #f5c852 0%, #f0c855 100%)',
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          boxShadow: newMessageAnimation 
            ? '0 12px 40px rgba(212, 167, 44, 0.6), 0 0 0 8px rgba(212, 167, 44, 0.1)' 
            : '0 8px 24px rgba(212, 167, 44, 0.4)',
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: 'none',
          cursor: 'pointer',
          transform: newMessageAnimation ? 'scale(1.1)' : isOpen ? 'scale(0.95)' : 'scale(1)',
          animation: newMessageAnimation ? 'gentle-pulse 1s ease-out' : 'none',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        }}
        data-chat-widget
        aria-label="Otvori chat"
        onMouseEnter={(e) => {
          if (!newMessageAnimation && !isOpen) {
            e.currentTarget.style.boxShadow = '0 12px 32px rgba(212, 167, 44, 0.5)';
            e.currentTarget.style.transform = 'scale(1.05)';
          }
        }}
        onMouseLeave={(e) => {
          if (!newMessageAnimation) {
            e.currentTarget.style.boxShadow = isOpen 
              ? '0 8px 24px rgba(212, 167, 44, 0.4)' 
              : (newMessageAnimation 
                ? '0 12px 40px rgba(212, 167, 44, 0.6), 0 0 0 8px rgba(212, 167, 44, 0.1)' 
                : '0 8px 24px rgba(212, 167, 44, 0.4)');
            e.currentTarget.style.transform = isOpen ? 'scale(0.95)' : 'scale(1)';
          }
        }}
      >
        {/* Cloud decoration circles */}
        <div
          className="absolute"
          style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.3)',
            top: '12px',
            left: '16px',
            pointerEvents: 'none',
          }}
        />
        <div
          className="absolute"
          style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.35)',
            top: '18px',
            left: '26px',
            pointerEvents: 'none',
          }}
        />
        <div
          className="absolute"
          style={{
            width: '18px',
            height: '18px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.3)',
            top: '22px',
            right: '18px',
            pointerEvents: 'none',
          }}
        />
        <svg
          className="w-7 h-7 relative z-10"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          style={{ color: 'var(--dark-text)' }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
        {getTotalUnreadCount() > 0 && (
          <span
            className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white z-20"
            style={{ backgroundColor: '#dc2626' }}
          >
            {getTotalUnreadCount() > 9 ? '9+' : getTotalUnreadCount()}
          </span>
        )}
      </button>

      {/* Chat Window */}
      {mounted && isOpen && (
        <div
          className="fixed z-[9998] max-md:w-[calc(100vw-1rem)] max-md:right-2 max-md:bottom-20 max-md:max-h-[calc(100vh-6rem)] bg-white rounded-2xl shadow-2xl flex flex-col border-2 overflow-hidden"
          style={{
            position: 'fixed',
            bottom: '96px',
            right: '24px',
            width: '380px',
            height: sortedChats.length === 0 ? '720px' : 'auto',
            maxHeight: '720px',
            borderColor: 'var(--honey-gold)',
            boxShadow: '0 12px 48px rgba(0, 0, 0, 0.15)',
            opacity: isOpen ? 1 : 0,
            transform: isOpen ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
            transition: 'opacity 0.3s ease, transform 0.3s ease',
            transformOrigin: 'bottom right',
          }}
          data-chat-widget
        >
          {/* Header */}
          <div
            className="px-6 py-4 border-b flex items-center justify-between flex-shrink-0 backdrop-blur-sm"
            style={{
              borderColor: 'rgba(212, 167, 44, 0.2)',
              background: 'linear-gradient(135deg, rgba(245, 200, 82, 0.12) 0%, rgba(255, 253, 247, 0.95) 100%)',
            }}
          >
            {showChatList ? (
              <>
                <h3
                  className="text-lg font-bold"
                  style={{
                    fontFamily: 'var(--font-serif)',
                    color: 'var(--dark-text)',
                  }}
                >
                  Poruke
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg transition-colors"
                  style={{ color: 'var(--body-text)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
                    e.currentTarget.style.color = 'var(--dark-text)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--body-text)';
                  }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <button
                    onClick={() => {
                      setActiveChatId(null);
                      setShowChatList(true);
                    }}
                    className="p-1.5 rounded-lg transition-colors flex-shrink-0"
                    style={{ color: 'var(--body-text)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  {(() => {
                    const activeChat = getActiveChat();
                    if (!activeChat) return null;
                    return (
                      <>
                        <div className="w-10 h-10 rounded-full overflow-hidden border-2 flex-shrink-0" style={{ borderColor: 'var(--honey-gold)' }}>
                          <Image
                            src={activeChat.beekeeperAvatar}
                            alt={activeChat.beekeeperName}
                            width={40}
                            height={40}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className="font-semibold text-base truncate"
                            style={{
                              fontFamily: 'var(--font-inter)',
                              color: 'var(--dark-text)',
                            }}
                          >
                            {activeChat.beekeeperName}
                          </p>
                          <p
                            className="text-xs truncate"
                            style={{
                              fontFamily: 'var(--font-inter)',
                              color: 'var(--body-text)',
                              opacity: 0.7,
                            }}
                          >
                            {beekeepers.find(b => b.id === activeChat.beekeeperId)?.location || ''}
                          </p>
                        </div>
                      </>
                    );
                  })()}
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg transition-colors flex-shrink-0"
                  style={{ color: 'var(--body-text)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
                    e.currentTarget.style.color = 'var(--dark-text)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--body-text)';
                  }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </>
            )}
          </div>

          {/* Content */}
          {!isAuthenticated ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <p
                className="text-base font-semibold mb-2"
                style={{
                  fontFamily: 'var(--font-inter)',
                  color: 'var(--dark-text)',
                }}
              >
                Prijavite se da biste koristili chat
              </p>
              <p
                className="text-sm mb-4"
                style={{
                  fontFamily: 'var(--font-inter)',
                  color: 'var(--body-text)',
                  opacity: 0.7,
                }}
              >
                Prijavite se ili registrujte da biste mogli razgovarati sa pčelarima
              </p>
              <Link
                href="/prijava"
                className="px-6 py-2.5 rounded-xl font-medium transition-all duration-200"
                style={{
                  background: 'linear-gradient(135deg, #f5c852 0%, #f0c855 100%)',
                  color: 'var(--dark-text)',
                  fontFamily: 'var(--font-inter)',
                }}
              >
                Prijavi se
              </Link>
            </div>
          ) : (
          <div className="flex-1 overflow-hidden flex flex-col">
            {showChatList ? (
              <>
                {/* Search */}
                <div className="p-4 border-b relative" style={{ borderColor: 'var(--border-light)' }}>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Pretraži pčelare..."
                    className="w-full px-4 py-2 rounded-xl border-2 text-sm focus:outline-none focus:ring-2 focus:ring-offset-0"
                    style={{
                      borderColor: 'var(--border-light)',
                      fontFamily: 'var(--font-inter)',
                      color: 'var(--dark-text)',
                      paddingRight: searchQuery ? '2.75rem' : '1rem',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--honey-gold)';
                      e.target.style.boxShadow = '0 0 0 3px rgba(212, 167, 44, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'var(--border-light)';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        if (document.activeElement instanceof HTMLElement) {
                          document.activeElement.blur();
                        }
                      }}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 rounded-full transition-colors hover:bg-gray-100 z-10"
                      style={{ color: 'var(--body-text)' }}
                      aria-label="Obriši pretragu"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Chat List */}
                <div className="flex-1 overflow-y-auto">
                  {(filteredChats.length > 0 || sortedChats.length > 0) && (
                    <div className="p-2">
                      <p
                        className="px-3 py-2 mb-4 text-xs font-semibold uppercase tracking-wide"
                        style={{
                          fontFamily: 'var(--font-inter)',
                          color: 'var(--body-text)',
                          opacity: 0.7,
                        }}
                      >
                        Aktivni chatovi
                      </p>
                      {(searchQuery.trim() ? filteredChats : sortedChats).map((chat) => (
                        <button
                          key={chat.id}
                          onClick={() => {
                            setActiveChatId(chat.id);
                            setShowChatList(false);
                            // Mark as read
                            const updatedChats = chats.map(c => {
                              if (c.id === chat.id) {
                                return {
                                  ...c,
                                  messages: c.messages.map(msg => ({ ...msg, read: true })),
                                  unreadCount: 0,
                                };
                              }
                              return c;
                            });
                            saveChats(updatedChats);
                          }}
                          className="w-full p-3 rounded-xl transition-all duration-200 text-left flex items-center gap-3 hover:bg-gray-50"
                          style={{
                            fontFamily: 'var(--font-inter)',
                          }}
                        >
                          <div className="relative flex-shrink-0">
                            <div className="w-12 h-12 rounded-full overflow-hidden border-2" style={{ borderColor: 'var(--honey-gold)' }}>
                              <Image
                                src={chat.beekeeperAvatar}
                                alt={chat.beekeeperName}
                                width={48}
                                height={48}
                                className="object-cover w-full h-full"
                              />
                            </div>
                            {chat.unreadCount > 0 && (
                              <span
                                className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
                                style={{ backgroundColor: '#dc2626' }}
                              >
                                {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p
                                className="font-semibold text-sm truncate"
                                style={{ color: 'var(--dark-text)' }}
                              >
                                {chat.beekeeperName}
                              </p>
                              {chat.lastMessage && (
                                <p
                                  className="text-xs flex-shrink-0 ml-2"
                                  style={{
                                    color: 'var(--body-text)',
                                    opacity: 0.6,
                                  }}
                                >
                                  {(() => {
                                    const date = new Date(chat.lastMessage.timestamp);
                                    const now = new Date();
                                    const diffMs = now.getTime() - date.getTime();
                                    const diffMins = Math.floor(diffMs / 60000);
                                    const diffHours = Math.floor(diffMs / 3600000);
                                    const diffDays = Math.floor(diffMs / 86400000);

                                    if (diffMins < 1) return 'Sada';
                                    if (diffMins < 60) return `${diffMins}m`;
                                    if (diffHours < 24) return `${diffHours}h`;
                                    if (diffDays < 7) return `${diffDays}d`;
                                    const day = date.getDate();
                                    const month = date.getMonth() + 1;
                                    return `${day}.${month}.`;
                                  })()}
                                </p>
                              )}
                            </div>
                            {chat.lastMessage && (
                              <p
                                className="text-xs truncate"
                                style={{
                                  color: 'var(--body-text)',
                                  opacity: 0.7,
                                }}
                              >
                                {chat.lastMessage.text}
                              </p>
                            )}
                          </div>
                        </button>
                      ))}
                      {searchQuery.trim() && filteredChats.length === 0 && sortedChats.length > 0 && (
                        <p
                          className="px-3 py-4 text-sm text-center"
                          style={{
                            fontFamily: 'var(--font-inter)',
                            color: 'var(--body-text)',
                            opacity: 0.7,
                          }}
                        >
                          Nema rezultata za "{searchQuery}"
                        </p>
                      )}
                    </div>
                  )}

                  {/* Available Beekeepers */}
                  {((showNewChatSection && filteredBeekeepers.length > 0) || (searchQuery.trim() && filteredBeekeepers.length > 0)) && (
                  <div className="p-2 border-t" style={{ borderColor: 'var(--border-light)' }}>
                    <div className="flex items-center justify-between px-3 py-2">
                      <p
                        className="text-xs font-semibold uppercase tracking-wide"
                        style={{
                          fontFamily: 'var(--font-inter)',
                          color: 'var(--body-text)',
                          opacity: 0.7,
                        }}
                      >
                        {searchQuery.trim() ? 'Pronađeni pčelari' : 'Započni novi chat'}
                      </p>
                      {showNewChatSection && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setShowNewChatSection(false);
                        }}
                        className="p-1 rounded-lg transition-colors hover:bg-gray-100 flex-shrink-0"
                        style={{ color: 'var(--body-text)' }}
                        aria-label="Sakrij sekciju"
                        type="button"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      )}
                    </div>
                    <div className="space-y-1 max-h-64 overflow-y-auto">
                      {filteredBeekeepers.map((beekeeper) => (
                        <button
                          key={beekeeper.id}
                          onClick={() => handleStartNewChat(beekeeper)}
                          className="w-full p-3 rounded-xl transition-all duration-200 text-left flex items-center gap-3 hover:bg-gray-50"
                          style={{
                            fontFamily: 'var(--font-inter)',
                          }}
                        >
                          <div className="w-12 h-12 rounded-full overflow-hidden border-2 flex-shrink-0" style={{ borderColor: 'var(--honey-gold)' }}>
                            <Image
                              src={beekeeper.avatar}
                              alt={beekeeper.name}
                              width={48}
                              height={48}
                              className="object-cover w-full h-full"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p
                              className="font-semibold text-sm truncate"
                              style={{ color: 'var(--dark-text)' }}
                            >
                              {beekeeper.name}
                            </p>
                            <p
                              className="text-xs truncate"
                              style={{
                                color: 'var(--body-text)',
                                opacity: 0.7,
                              }}
                            >
                              {beekeeper.location}
                            </p>
                          </div>
                          <Link
                            href={`/pcelari/${beekeeper.slug}`}
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 rounded-lg transition-colors flex-shrink-0"
                            style={{ color: 'var(--honey-gold)' }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = 'rgba(245, 200, 82, 0.1)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                          </Link>
                        </button>
                      ))}
                      {searchQuery.trim() && filteredBeekeepers.length === 0 && (
                        <p
                          className="px-3 py-4 text-sm text-center"
                          style={{
                            fontFamily: 'var(--font-inter)',
                            color: 'var(--body-text)',
                            opacity: 0.7,
                          }}
                        >
                          Nema rezultata za "{searchQuery}"
                        </p>
                      )}
                    </div>
                  </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Messages */}
                <div 
                  className="flex-1 overflow-y-auto p-6 space-y-3" 
                  style={{ 
                    backgroundColor: 'var(--cream)',
                    scrollBehavior: 'smooth',
                  }}
                >
                  {(() => {
                    const activeChat = getActiveChat();
                    if (!activeChat || activeChat.messages.length === 0) {
                      return (
                        <div className="flex flex-col items-center justify-center h-full text-center py-12 px-4">
                          <div 
                            className="w-20 h-20 rounded-full overflow-hidden border-3 mb-4 shadow-lg animate-fade-in"
                            style={{ 
                              borderColor: 'var(--honey-gold)',
                              borderWidth: '3px',
                            }}
                          >
                            <Image
                              src={activeChat?.beekeeperAvatar || ''}
                              alt={activeChat?.beekeeperName || ''}
                              width={80}
                              height={80}
                              className="object-cover w-full h-full"
                            />
                          </div>
                          <p
                            className="font-semibold text-lg mb-2"
                            style={{
                              fontFamily: 'var(--font-serif)',
                              color: 'var(--dark-text)',
                            }}
                          >
                            {activeChat?.beekeeperName}
                          </p>
                          <p
                            className="text-sm max-w-xs leading-relaxed"
                            style={{
                              fontFamily: 'var(--font-inter)',
                              color: 'var(--body-text)',
                              opacity: 0.8,
                            }}
                          >
                            Započnite razgovor sa pčelarom i postavite pitanja o proizvodima
                          </p>
                        </div>
                      );
                    }

                    return activeChat.messages.map((message, index) => {
                      const isUser = message.senderType === 'user';
                      return (
                        <div
                          key={message.id}
                          className={`flex items-end gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'} animate-fade-in`}
                          style={{
                            animationDelay: `${index * 0.05}s`,
                          }}
                        >
                          {/* Avatar for beekeeper messages */}
                          {!isUser && (
                            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border-2" style={{ borderColor: 'var(--honey-gold)' }}>
                              <Image
                                src={activeChat.beekeeperAvatar}
                                alt={activeChat.beekeeperName}
                                width={32}
                                height={32}
                                className="object-cover w-full h-full"
                              />
                            </div>
                          )}
                          <div
                            className={`max-w-[78%] rounded-2xl px-4 py-2.5 transition-all duration-200 ${
                              isUser ? 'rounded-br-md' : 'rounded-bl-md'
                            }`}
                            style={{
                              background: isUser
                                ? 'linear-gradient(135deg, #f5c852 0%, #f0c855 100%)'
                                : 'white',
                              border: !isUser ? '1px solid rgba(139, 115, 85, 0.15)' : 'none',
                              fontFamily: 'var(--font-inter)',
                              color: 'var(--dark-text)',
                              boxShadow: isUser 
                                ? '0 4px 12px rgba(212, 167, 44, 0.25)' 
                                : '0 2px 8px rgba(0, 0, 0, 0.08)',
                            }}
                          >
                            <p 
                              className="text-sm leading-relaxed whitespace-pre-wrap break-words"
                              style={{
                                color: isUser ? 'var(--dark-text)' : 'var(--dark-text)',
                                lineHeight: '1.5',
                              }}
                            >
                              {message.text}
                            </p>
                            <p
                              className="text-xs mt-1.5 flex items-center gap-1"
                              style={{
                                color: isUser ? 'rgba(26, 26, 26, 0.6)' : 'var(--body-text)',
                                opacity: 0.65,
                              }}
                            >
                              {(() => {
                                const date = new Date(message.timestamp);
                                const hours = date.getHours().toString().padStart(2, '0');
                                const minutes = date.getMinutes().toString().padStart(2, '0');
                                return `${hours}:${minutes}`;
                              })()}
                              {isUser && message.read && (
                                <svg className="w-3 h-3 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </p>
                          </div>
                        </div>
                      );
                    });
                  })()}
                  {isSending && (
                    <div className="flex justify-start items-end gap-2 animate-fade-in">
                      <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border-2" style={{ borderColor: 'var(--honey-gold)' }}>
                        <Image
                          src={getActiveChat()?.beekeeperAvatar || ''}
                          alt={getActiveChat()?.beekeeperName || ''}
                          width={32}
                          height={32}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <div
                        className="rounded-2xl rounded-bl-md px-5 py-3"
                        style={{
                          backgroundColor: 'white',
                          border: '1px solid rgba(139, 115, 85, 0.15)',
                          fontFamily: 'var(--font-inter)',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                        }}
                      >
                        <div className="flex gap-1.5 items-center">
                          <div 
                            className="w-2 h-2 rounded-full animate-bounce" 
                            style={{ 
                              backgroundColor: 'var(--honey-gold)',
                              animationDelay: '0ms',
                              animationDuration: '1.4s',
                            }}
                          />
                          <div 
                            className="w-2 h-2 rounded-full animate-bounce" 
                            style={{ 
                              backgroundColor: 'var(--honey-gold)',
                              animationDelay: '200ms',
                              animationDuration: '1.4s',
                            }}
                          />
                          <div 
                            className="w-2 h-2 rounded-full animate-bounce" 
                            style={{ 
                              backgroundColor: 'var(--honey-gold)',
                              animationDelay: '400ms',
                              animationDuration: '1.4s',
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div 
                  className="p-4 border-t flex-shrink-0 backdrop-blur-sm" 
                  style={{ 
                    borderColor: 'rgba(139, 115, 85, 0.1)', 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  }}
                >
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendMessage();
                    }}
                    className="flex gap-3 items-end"
                  >
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Unesite poruku..."
                        className="w-full px-4 py-3 pr-12 rounded-2xl border-2 text-sm transition-all duration-300 focus:outline-none"
                        style={{
                          borderColor: newMessage.trim() ? 'rgba(212, 167, 44, 0.3)' : 'rgba(139, 115, 85, 0.15)',
                          fontFamily: 'var(--font-inter)',
                          color: 'var(--dark-text)',
                          backgroundColor: 'white',
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = 'var(--honey-gold)';
                          e.target.style.boxShadow = '0 0 0 4px rgba(212, 167, 44, 0.1)';
                          e.target.style.transform = 'translateY(-1px)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = newMessage.trim() ? 'rgba(212, 167, 44, 0.3)' : 'rgba(139, 115, 85, 0.15)';
                          e.target.style.boxShadow = 'none';
                          e.target.style.transform = 'translateY(0)';
                        }}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={!newMessage.trim() || isSending}
                      className="p-3 rounded-2xl font-medium transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center flex-shrink-0 group"
                      style={{
                        background: newMessage.trim() && !isSending
                          ? 'linear-gradient(135deg, #f5c852 0%, #f0c855 100%)'
                          : 'rgba(139, 115, 85, 0.1)',
                        color: 'var(--dark-text)',
                        fontFamily: 'var(--font-inter)',
                        boxShadow: newMessage.trim() && !isSending
                          ? '0 4px 12px rgba(212, 167, 44, 0.3)'
                          : 'none',
                        width: '48px',
                        height: '48px',
                      }}
                      onMouseEnter={(e) => {
                        if (newMessage.trim() && !isSending) {
                          e.currentTarget.style.background = 'linear-gradient(135deg, #f8d275 0%, #f5c852 100%)';
                          e.currentTarget.style.boxShadow = '0 6px 16px rgba(212, 167, 44, 0.4)';
                          e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (newMessage.trim() && !isSending) {
                          e.currentTarget.style.background = 'linear-gradient(135deg, #f5c852 0%, #f0c855 100%)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(212, 167, 44, 0.3)';
                          e.currentTarget.style.transform = 'translateY(0) scale(1)';
                        }
                      }}
                    >
                      <svg 
                        className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>
          )}
        </div>
      )}
    </>
  );
}

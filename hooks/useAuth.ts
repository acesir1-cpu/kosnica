import { useState, useEffect } from 'react';
import { STORAGE_KEYS } from '@/config/constants';

export type User = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  createdAt: string;
};

export type RegisterData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
};

export type LoginData = {
  email: string;
  password: string;
};

export type UserProfile = User & {
  address?: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  paymentCards?: Array<{
    id: string;
    last4: string;
    brand: string;
    expiryMonth: number;
    expiryYear: number;
    isDefault: boolean;
  }>;
};

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = () => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        const userData = localStorage.getItem('kosnica_user');
        
        if (token && userData) {
          try {
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);
          } catch (e) {
            if (process.env.NODE_ENV === 'development') {
              console.error('Error parsing user data:', e);
            }
            setUser(null);
          }
        } else {
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    checkAuth();

    // Listen for auth changes
    const handleAuthChange = () => {
      checkAuth();
    };

    window.addEventListener('authChanged', handleAuthChange);
    
    return () => {
      window.removeEventListener('authChanged', handleAuthChange);
    };
  }, []);

  const isAuthenticated = !!user;

  // Register function
  const register = async (data: RegisterData): Promise<{ success: boolean; error?: string }> => {
    if (typeof window === 'undefined') {
      return { success: false, error: 'Client side only' };
    }

    try {
      // Try API first
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success && result.user && result.token) {
        // Save token and user data locally
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, result.token);
        localStorage.setItem('kosnica_user', JSON.stringify(result.user));
        setUser(result.user);
        window.dispatchEvent(new Event('authChanged'));
        return { success: true };
      }

      return { success: false, error: result.error || 'Greška pri registraciji' };
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Registration error:', error);
      }
      // Fallback to localStorage if API fails
      try {
        const existingUsers = localStorage.getItem('kosnica_users');
        const users: User[] = existingUsers ? JSON.parse(existingUsers) : [];
        
        if (users.find(u => u.email.toLowerCase() === data.email.toLowerCase())) {
          return { success: false, error: 'Korisnik sa ovom email adresom već postoji' };
        }

        const newUser: User = {
          id: Date.now(),
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          createdAt: new Date().toISOString(),
        };

        users.push(newUser);
        localStorage.setItem('kosnica_users', JSON.stringify(users));

        const passwords = JSON.parse(localStorage.getItem('kosnica_passwords') || '{}');
        passwords[data.email.toLowerCase()] = data.password;
        localStorage.setItem('kosnica_passwords', JSON.stringify(passwords));

        const token = `token_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
        localStorage.setItem('kosnica_user', JSON.stringify(newUser));
        
        setUser(newUser);
        window.dispatchEvent(new Event('authChanged'));
        
        return { success: true };
      } catch (fallbackError) {
        return { success: false, error: 'Greška pri registraciji' };
      }
    }
  };

  // Login function
  const login = async (data: LoginData): Promise<{ success: boolean; error?: string }> => {
    if (typeof window === 'undefined') {
      return { success: false, error: 'Client side only' };
    }

    try {
      // Try API first
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success && result.user && result.token) {
        // Save token and user data locally
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, result.token);
        localStorage.setItem('kosnica_user', JSON.stringify(result.user));
        setUser(result.user);
        window.dispatchEvent(new Event('authChanged'));
        return { success: true };
      }

      return { success: false, error: result.error || 'Pogrešna email adresa ili lozinka' };
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Login error:', error);
      }
      // Don't fallback to localStorage for security reasons
      try {
        const existingUsers = localStorage.getItem('kosnica_users');
        const users: User[] = existingUsers ? JSON.parse(existingUsers) : [];
        const passwords = JSON.parse(localStorage.getItem('kosnica_passwords') || '{}');

        const user = users.find(u => u.email.toLowerCase() === data.email.toLowerCase());
        
        if (!user) {
          return { success: false, error: 'Pogrešna email adresa ili lozinka' };
        }

        const savedPassword = passwords[data.email.toLowerCase()];
        if (savedPassword !== data.password) {
          return { success: false, error: 'Pogrešna email adresa ili lozinka' };
        }

        const token = `token_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
        localStorage.setItem('kosnica_user', JSON.stringify(user));
        
        setUser(user);
        window.dispatchEvent(new Event('authChanged'));
        
        return { success: true };
      } catch (fallbackError) {
        return { success: false, error: 'Greška pri prijavljivanju' };
      }
    }
  };

  // Logout function
  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem('kosnica_user');
      setUser(null);
      window.dispatchEvent(new Event('authChanged'));
    }
  };

  // Update user function
  const updateUser = async (updates: Partial<User>) => {
    if (!user) return;
    
    try {
      const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      
      // Try API first
      const response = await fetch('/api/auth/user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(updates),
      });

      const result = await response.json();

      if (result.success && result.user) {
        localStorage.setItem('kosnica_user', JSON.stringify(result.user));
        setUser(result.user);
        window.dispatchEvent(new Event('authChanged'));
        return;
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Update user error:', error);
      }
    }

    // Fallback to localStorage
    const updatedUser = { ...user, ...updates };
    localStorage.setItem('kosnica_user', JSON.stringify(updatedUser));
    
    const existingUsers = localStorage.getItem('kosnica_users');
    if (existingUsers) {
      const users: User[] = JSON.parse(existingUsers);
      const index = users.findIndex(u => u.id === user.id);
      if (index !== -1) {
        users[index] = updatedUser;
        localStorage.setItem('kosnica_users', JSON.stringify(users));
      }
    }
    
    setUser(updatedUser);
    window.dispatchEvent(new Event('authChanged'));
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    register,
    login,
    logout,
    updateUser,
  };
}

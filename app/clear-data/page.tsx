'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ClearDataPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'idle' | 'clearing' | 'success' | 'error'>('idle');
  const [deletedItems, setDeletedItems] = useState<string[]>([]);

  useEffect(() => {
    if (status === 'idle' && typeof window !== 'undefined') {
      setStatus('clearing');
      
      try {
        // Get all localStorage keys that start with 'kosnica_'
        const allKeys = Object.keys(localStorage);
        const kosnicaKeys = allKeys.filter(key => key.toLowerCase().startsWith('kosnica_'));

        setDeletedItems(kosnicaKeys);

        // Delete all kosnica-related items
        kosnicaKeys.forEach(key => {
          localStorage.removeItem(key);
        });

        // Dispatch events to update app state
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('authChanged'));
          window.dispatchEvent(new Event('cartUpdated'));
          window.dispatchEvent(new Event('favoritesUpdated'));
        }

        setStatus('success');
      } catch (error) {
        console.error('Error clearing data:', error);
        setStatus('error');
      }
    }
  }, [status]);

  const handleReload = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#ffffff' }}>
      <div className="max-w-md w-full mx-4">
        <div
          className="bg-white rounded-lg shadow-lg p-8"
          style={{
            fontFamily: 'var(--font-inter)',
            border: '2px solid var(--honey-gold)',
          }}
        >
          <h1
            className="text-2xl font-bold mb-6 text-center"
            style={{
              fontFamily: 'var(--font-serif)',
              color: 'var(--dark-text)',
            }}
          >
            🗑️ Brisanje svih podataka
          </h1>

          {status === 'clearing' && (
            <div className="text-center">
              <div className="mb-4">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: 'var(--honey-gold)' }}></div>
              </div>
              <p style={{ color: 'var(--body-text)' }}>Brišem sve podatke...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center">
              <div className="mb-4 text-4xl">✅</div>
              <h2
                className="text-xl font-semibold mb-4"
                style={{
                  fontFamily: 'var(--font-serif)',
                  color: 'var(--dark-text)',
                }}
              >
                Svi podaci su obrisani!
              </h2>
              
              {deletedItems.length > 0 && (
                <div className="mb-6">
                  <p className="text-sm mb-2" style={{ color: 'var(--body-text)' }}>
                    Obrisano {deletedItems.length} stavki:
                  </p>
                  <div
                    className="max-h-48 overflow-y-auto text-left p-4 rounded"
                    style={{
                      backgroundColor: 'var(--cream)',
                      fontSize: '0.875rem',
                    }}
                  >
                    {deletedItems.map((key, index) => (
                      <div key={index} className="py-1 truncate" style={{ color: 'var(--body-text)' }}>
                        • {key}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <p className="mb-6 text-sm" style={{ color: 'var(--body-text)' }}>
                Svi sačuvani podaci su obrisani iz localStorage:
                <br />
                • Korisnički računi
                <br />
                • Korpa i omiljeno
                <br />
                • Narudžbe i adrese
                <br />
                • Komentari i recenzije
                <br />
                • Svi ostali podaci
              </p>

              <button
                onClick={handleReload}
                className="w-full py-3 px-6 rounded-lg font-medium transition-all duration-200"
                style={{
                  background: 'linear-gradient(135deg, #f5c852 0%, #f0c855 100%)',
                  color: 'var(--dark-text)',
                  boxShadow: '0 2px 8px rgba(212, 167, 44, 0.25)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #f8d275 0%, #f5c852 100%)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(212, 167, 44, 0.35)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #f5c852 0%, #f0c855 100%)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(212, 167, 44, 0.25)';
                }}
              >
                Vrati se na početnu stranicu
              </button>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center">
              <div className="mb-4 text-4xl">❌</div>
              <h2
                className="text-xl font-semibold mb-4"
                style={{
                  fontFamily: 'var(--font-serif)',
                  color: 'var(--dark-text)',
                }}
              >
                Greška pri brisanju podataka
              </h2>
              <p className="mb-6" style={{ color: 'var(--body-text)' }}>
                Došlo je do greške pri pokušaju brisanja podataka.
                <br />
                Molimo pokušajte ponovo ili proverite konzolu za više detalja.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="w-full py-3 px-6 rounded-lg font-medium transition-all duration-200 border-2"
                style={{
                  borderColor: 'var(--honey-gold)',
                  color: 'var(--body-text)',
                  backgroundColor: 'white',
                }}
              >
                Pokušaj ponovo
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

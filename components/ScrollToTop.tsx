'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    // Check if there's a hash in the URL
    const hash = window.location.hash;
    
    if (hash) {
      // If there's a hash, scroll to that element after a delay to ensure DOM is ready
      const scrollToHash = () => {
        const element = document.querySelector(hash);
        if (element) {
          // Calculate offset for sticky header (approximately 100px)
          const headerOffset = 100;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth',
          });
        } else {
          // If element not found yet, try again after a short delay
          setTimeout(() => {
            const retryElement = document.querySelector(hash);
            if (retryElement) {
              const headerOffset = 100;
              const elementPosition = retryElement.getBoundingClientRect().top;
              const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

              window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth',
              });
            }
          }, 500);
        }
      };

      // Wait for DOM to be ready
      setTimeout(scrollToHash, 100);
    } else {
      // No hash, scroll to top
      requestAnimationFrame(() => {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: 'instant',
        });
        
        if (document.documentElement) {
          document.documentElement.scrollTop = 0;
        }
        if (document.body) {
          document.body.scrollTop = 0;
        }
      });
    }
  }, [pathname]);

  return null;
}

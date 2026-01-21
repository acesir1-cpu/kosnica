/**
 * Script to clear all saved data from localStorage
 * This will delete:
 * - All user accounts
 * - All user data (addresses, cards, orders, notifications, chats)
 * - Cart items
 * - Favorites
 * - Product reviews
 * - All other kosnica-related data
 * 
 * To use in browser console:
 * 1. Open your browser's developer console (F12)
 * 2. Copy and paste this entire script
 * 3. Press Enter to execute
 */

(function clearAllKosnicaData() {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    console.error('This script must be run in a browser environment');
    return;
  }

  console.log('🗑️  Starting to clear all Kosnica data...');

  // Get all localStorage keys that start with 'kosnica_'
  const allKeys = Object.keys(localStorage);
  const kosnicaKeys = allKeys.filter(key => key.toLowerCase().startsWith('kosnica_'));

  if (kosnicaKeys.length === 0) {
    console.log('✅ No Kosnica data found in localStorage');
    return;
  }

  console.log(`Found ${kosnicaKeys.length} items to delete:`);
  kosnicaKeys.forEach(key => {
    console.log(`  - ${key}`);
    localStorage.removeItem(key);
  });

  // Clear all events and reset state
  window.dispatchEvent(new Event('authChanged'));
  window.dispatchEvent(new Event('cartUpdated'));
  window.dispatchEvent(new Event('favoritesUpdated'));

  console.log('✅ All Kosnica data has been deleted from localStorage');
  console.log('🔄 Please refresh the page to see the changes');

  // Optional: Reload the page automatically
  // window.location.reload();
})();

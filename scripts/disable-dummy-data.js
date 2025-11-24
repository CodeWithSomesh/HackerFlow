/**
 * Script to disable dummy data across all dashboards
 *
 * This script sets the localStorage flag to disable dummy data
 * and enable real data fetching from the database.
 *
 * Usage:
 * 1. Open your browser's developer console (F12)
 * 2. Paste this code and press Enter:
 *    localStorage.setItem('useDummyData', 'false')
 * 3. Refresh the page
 *
 * To re-enable dummy data:
 *    localStorage.removeItem('useDummyData')
 * OR
 *    localStorage.setItem('useDummyData', 'true')
 */

if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
  localStorage.setItem('useDummyData', 'false')
  console.log('✅ Dummy data has been DISABLED')
  console.log('✅ Real data from database will now be displayed')
  console.log('🔄 Please refresh the page to see changes')
} else {
  console.error('❌ localStorage is not available in this environment')
}

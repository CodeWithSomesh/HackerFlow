"use client"

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { showCustomToast } from '@/components/toast-notification';

export function AuthToastHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const toastType = searchParams.get('toast');
    
    if (toastType) {
      switch (toastType) {
        case 'login_success':
          showCustomToast('success', 'Welcome back! Successfully logged in.');
          break;
        case 'already_registered':
          showCustomToast('info', 'You already have an account. Redirecting user to Hackathons Page.');
          break;
        case 'profile_complete':
          showCustomToast('success', 'Profile setup complete! Welcome to HackerFlow.');
          break;
        default:
          break;
      }
      
      // Clean up URL by removing toast parameter
      const url = new URL(window.location.href);
      url.searchParams.delete('toast');
      router.replace(url.pathname + url.search, { scroll: false });
    }
  }, [searchParams, router]);

  return null;
}

// Add this component to your hackathons page layout:
// import { HackathonsToastHandler } from '@/components/hackathons-toast-handler'
// 
// Inside your page component:
// <HackathonsToastHandler />
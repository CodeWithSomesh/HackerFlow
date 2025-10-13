"use client"

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { showCustomToast } from '@/components/toast-notification';

export function ProfileSetupToastHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const toastType = searchParams.get('toast');
    
    if (toastType) {
      switch (toastType) {
        case 'welcome':
          showCustomToast('success', 'Account created successfully! Please complete your profile.');
          break;
        case 'complete_profile':
          showCustomToast('info', 'Please complete your profile to continue.');
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

// Add this component to your profile setup pages:
// import { ProfileSetupToastHandler } from '@/components/profile-setup-toast-handler'
// 
// Inside your page component:
// <ProfileSetupToastHandler />
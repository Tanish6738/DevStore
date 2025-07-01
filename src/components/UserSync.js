'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

export default function UserSync({ children }) {
  const { user, isLoaded } = useUser();
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    const syncUser = async () => {
      if (isLoaded && user && !synced) {
        try {
          const response = await fetch('/api/users/sync', {
            method: 'POST',
          });
          
          if (response.ok) {
            console.log('User synced successfully');
          } else {
            console.log('User already exists or sync failed');
          }
        } catch (error) {
          console.error('Error syncing user:', error);
        } finally {
          setSynced(true);
        }
      }
    };

    syncUser();
  }, [user, isLoaded, synced]);

  return children;
}

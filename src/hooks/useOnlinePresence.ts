import { useEffect } from 'react';
import { doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

export function useOnlinePresence() {
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) return;

    const userDocRef = doc(db, 'users', currentUser.uid);

    const updateOnlineStatus = async (status: 'online' | 'offline') => {
      try {
        await updateDoc(userDocRef, {
          status,
          lastSeen: serverTimestamp()
        });
      } catch (error) {
        console.error('Error updating online status:', error);
      }
    };

    // Gestisci solo la visibilità della pagina (app in background)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        updateOnlineStatus('offline');
      } else if (document.visibilityState === 'visible') {
        updateOnlineStatus('online');
      }
    };

    // Imposta lo stato iniziale come online
    updateOnlineStatus('online');

    // Aggiungi solo l'evento di visibilitychange
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [currentUser]);
} 
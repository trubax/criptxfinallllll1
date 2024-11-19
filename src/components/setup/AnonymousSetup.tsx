import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { db } from '../../firebase';
import { useAuth } from '../../hooks/useAuth';
import { AnonymousTerms } from './AnonymousTerms';

export default function AnonymousSetup() {
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleTermsAccept = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);

      const guestNumber = Math.floor(1000 + Math.random() * 9000);
      const displayName = `Guest${guestNumber}`;
      const photoURL = `https://ui-avatars.com/api/?name=G${guestNumber}&background=random`;

      await setDoc(doc(db, 'users', currentUser.uid), {
        displayName,
        photoURL,
        isAnonymous: true,
        createdAt: serverTimestamp(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        status: 'online',
        lastSeen: serverTimestamp(),
        settings: {
          theme: 'system',
          notifications: false,
          sound: true
        },
        setupCompleted: true
      });

      await updateProfile(currentUser, {
        displayName,
        photoURL
      });

      // Salva il timestamp di login per l'account anonimo
      localStorage.setItem('anonymousLoginTime', new Date().toISOString());
      localStorage.setItem('anonymousUserId', currentUser.uid);

      navigate('/chat', { replace: true });
    } catch (error) {
      console.error('Errore durante il setup anonimo:', error);
      throw new Error('Impossibile completare il setup. Riprova.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen theme-bg flex items-center justify-center p-4">
      <div className="max-w-2xl w-full theme-bg-primary rounded-xl shadow-lg p-6">
        <AnonymousTerms onAccept={handleTermsAccept} />
      </div>
    </div>
  );
} 
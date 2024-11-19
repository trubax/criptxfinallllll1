import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, storage } from '../../firebase';
import { useAuth } from '../../hooks/useAuth';
import { Terms } from './Terms';
import { ProfileSetup } from './ProfileSetup';
import { PrivacySetup } from './PrivacySetup';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { updateProfile } from 'firebase/auth';
import { Service } from '../../profileConfig';
import { PhoneSetup } from './PhoneSetup';

interface SetupStep {
  title: string;
  description: string;
}

export default function SetupWizard() {
  const { currentUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [profileData, setProfileData] = useState({
    displayName: currentUser?.displayName || '',
    photoURL: currentUser?.photoURL || '',
    bio: '',
    phoneNumber: currentUser?.phoneNumber || ''
  });
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'public',
    showLastSeen: true,
    showStatus: true,
    showBio: true,
    showPosts: true,
    showServices: true
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      setProfileData(prev => ({
        ...prev,
        displayName: currentUser.displayName || '',
        photoURL: currentUser.photoURL || '',
        phoneNumber: currentUser.phoneNumber || ''
      }));
    }
  }, [currentUser]);

  const handleComplete = async () => {
    if (!currentUser) return;

    try {
      let finalPhotoURL = profileData.photoURL;
      
      if (profileData.photoURL && profileData.photoURL.startsWith('data:')) {
        try {
          const timestamp = Date.now();
          const storageRef = ref(storage, `profile_photos/${currentUser.uid}_${timestamp}.jpg`);
          
          const metadata = {
            contentType: 'image/jpeg',
            customMetadata: {
              userId: currentUser.uid,
              uploadedAt: new Date().toISOString()
            }
          };
          
          const uploadResult = await uploadString(storageRef, profileData.photoURL, 'data_url', metadata);
          finalPhotoURL = await getDownloadURL(uploadResult.ref);

          await updateProfile(currentUser, {
            displayName: profileData.displayName,
            photoURL: finalPhotoURL
          });

          await profileConfig.updateProfileRefs(currentUser.uid, {
            photoURL: finalPhotoURL,
            displayName: profileData.displayName
          });

        } catch (error) {
          console.error('Errore durante il caricamento della foto:', error);
          finalPhotoURL = currentUser.photoURL || '';
        }
      }

      const userData = {
        displayName: profileData.displayName,
        photoURL: finalPhotoURL,
        bio: profileData.bio,
        phoneNumber: profileData.phoneNumber,
        privacy: {
          profileVisibility: 'public',
          showLastSeen: true,
          showBio: true,
          showPhone: false,
          ...privacySettings
        },
        setupCompleted: true,
        termsAccepted: {
          timestamp: serverTimestamp(),
          version: '1.0'
        }
      };

      await setDoc(doc(db, 'users', currentUser.uid), userData);
      await updateProfile(currentUser, {
        displayName: profileData.displayName,
        photoURL: finalPhotoURL
      });

      navigate('/chat', { replace: true });
    } catch (error) {
      console.error('Errore durante il setup:', error);
      throw new Error('Impossibile completare il setup. Riprova.');
    }
  };

  const steps: SetupStep[] = [
    {
      title: 'Termini di Servizio',
      description: 'Leggi e accetta i termini di utilizzo'
    },
    {
      title: 'Profilo',
      description: 'Personalizza il tuo profilo'
    },
    {
      title: 'Numero di Telefono',
      description: 'Aggiungi un numero di contatto'
    },
    {
      title: 'Privacy',
      description: 'Imposta le tue preferenze di privacy'
    }
  ];

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <Terms onAccept={() => setCurrentStep(1)} />;
      case 1:
        return (
          <ProfileSetup
            initialData={profileData}
            onUpdate={setProfileData}
            onNext={() => setCurrentStep(2)}
            onBack={() => setCurrentStep(0)}
            showBack={true}
          />
        );
      case 2:
        return (
          <PhoneSetup
            initialPhone={profileData.phoneNumber}
            onUpdate={(data) => setProfileData(prev => ({ ...prev, ...data }))}
            onNext={() => setCurrentStep(3)}
            onBack={() => setCurrentStep(1)}
            showBack={true}
          />
        );
      case 3:
        return (
          <PrivacySetup
            settings={privacySettings}
            onUpdate={setPrivacySettings}
            onComplete={handleComplete}
            onBack={() => setCurrentStep(2)}
            showBack={true}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen theme-bg-base">
      <div className="max-w-2xl mx-auto pt-8 px-4">
        <div className="flex justify-between mb-8">
          {steps.map((step, index) => (
            <div 
              key={step.title}
              className={`flex-1 text-center ${
                index === currentStep 
                  ? 'theme-text' 
                  : 'theme-text-secondary'
              }`}
            >
              <div className="mb-2">
                <span className="w-8 h-8 inline-flex items-center justify-center rounded-full border-2 theme-border">
                  {index + 1}
                </span>
              </div>
              <h3 className="text-sm font-medium">{step.title}</h3>
              <p className="text-xs mt-1">{step.description}</p>
            </div>
          ))}
        </div>

        {renderStep()}
      </div>
    </div>
  );
} 
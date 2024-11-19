import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Phone } from 'lucide-react';

interface PhoneSetupProps {
  initialPhone: string;
  onUpdate: (data: { phoneNumber: string }) => void;
  onNext: () => void;
  onBack: () => void;
  showBack: boolean;
}

export function PhoneSetup({ initialPhone, onUpdate, onNext, onBack, showBack }: PhoneSetupProps) {
  const [phoneNumber, setPhoneNumber] = useState(initialPhone || '');
  const { currentUser } = useAuth();
  const isGoogleUser = currentUser?.providerData[0]?.providerId === 'google.com';

  const handleSubmit = () => {
    onUpdate({ phoneNumber });
    onNext();
  };

  if (!isGoogleUser || currentUser?.phoneNumber) {
    // Salta questo step se l'utente ha già un numero di telefono associato
    onNext();
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold theme-text mb-2">Numero di Telefono</h2>
        <p className="theme-text-secondary">
          Aggiungi un numero di telefono per permettere ai tuoi contatti di trovarti più facilmente
        </p>
      </div>

      <div className="w-full max-w-md mx-auto space-y-4">
        <div className="bg-opacity-20 theme-bg-secondary p-6 rounded-lg">
          <div className="flex items-center gap-3 mb-4">
            <Phone className="w-6 h-6 theme-text-secondary" />
            <p className="text-sm theme-text-secondary">
              Il numero di telefono è facoltativo ma aiuta i tuoi contatti a trovarti
            </p>
          </div>
          
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full px-4 py-2 rounded-lg theme-border theme-bg-primary theme-text"
            placeholder="+39 123 456 7890"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 w-full max-w-md mx-auto">
        {showBack && (
          <button
            onClick={onBack}
            className="px-4 py-2 rounded-lg theme-bg-secondary theme-text"
          >
            Indietro
          </button>
        )}
        <button
          onClick={handleSubmit}
          className="px-4 py-2 rounded-lg theme-bg-accent theme-text"
        >
          Continua
        </button>
      </div>
    </div>
  );
} 
import { useState } from 'react';

interface PrivacySetupProps {
  settings: any;
  onUpdate: (settings: any) => void;
  onComplete: () => void;
  onBack?: () => void;
  showBack?: boolean;
}

export function PrivacySetup({ settings, onUpdate, onComplete, onBack, showBack }: PrivacySetupProps) {
  const [localSettings, setLocalSettings] = useState(settings);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (key: string, value: any) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      // Aggiorna le impostazioni nel componente padre
      onUpdate(localSettings);
      
      // Completa il setup
      await onComplete();
      
    } catch (error: any) {
      console.error('Errore durante il salvataggio delle impostazioni:', error);
      alert(error.message || 'Si è verificato un errore durante il salvataggio delle impostazioni. Riprova.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold theme-text mb-2">Impostazioni Privacy</h2>
        <p className="theme-text-secondary">
          Controlla chi può vedere le tue informazioni
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="theme-text">Visibilità profilo</label>
          <select
            value={localSettings.profileVisibility}
            onChange={(e) => handleChange('profileVisibility', e.target.value)}
            className="p-2 rounded-lg theme-bg-secondary theme-text"
          >
            <option value="public">Pubblico</option>
            <option value="private">Privato</option>
          </select>
        </div>

        <div className="space-y-3">
          {Object.entries(localSettings)
            .filter(([key]) => key !== 'profileVisibility')
            .map(([key, value]) => (
              <label key={key} className="flex items-center justify-between">
                <span className="theme-text">
                  {key === 'showLastSeen' && 'Mostra ultimo accesso'}
                  {key === 'showStatus' && 'Mostra stato online'}
                  {key === 'showBio' && 'Mostra biografia'}
                  {key === 'showPosts' && 'Mostra post'}
                  {key === 'showServices' && 'Mostra servizi'}
                </span>
                <input
                  type="checkbox"
                  checked={value as boolean}
                  onChange={(e) => handleChange(key, e.target.checked)}
                  className="w-5 h-5 rounded theme-border"
                />
              </label>
            ))}
        </div>
      </div>

      <div className="mt-4 flex gap-4">
        {showBack && (
          <button
            onClick={onBack}
            disabled={isSubmitting}
            className="flex-1 border border-gray-300 theme-border theme-text py-2 px-4 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            Indietro
          </button>
        )}
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center justify-center"
        >
          {isSubmitting ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
          ) : null}
          Completa Setup
        </button>
      </div>
    </div>
  );
} 
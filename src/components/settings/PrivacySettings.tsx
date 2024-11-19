import React from 'react';
import { Shield, Globe, Users, Lock } from 'lucide-react';
import { Switch } from '../ui/Switch';

interface PrivacySettingsProps {
  privacy: {
    profileVisibility: 'public' | 'contacts' | 'private';
    showLastSeen: boolean;
    showStatus: boolean;
    showBio: boolean;
    showPosts: boolean;
    showServices: boolean;
  };
  onUpdate: (privacy: Partial<PrivacySettingsProps['privacy']>) => Promise<void>;
}

export default function PrivacySettings({ privacy, onUpdate }: PrivacySettingsProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium theme-text mb-4">Visibilità Profilo</h3>
        <div className="space-y-3">
          {/* Bottoni visibilità profilo simili a EditProfileForm */}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium theme-text">Impostazioni Privacy</h3>
        <div className="space-y-4">
          {Object.entries(privacy)
            .filter(([key]) => key !== 'profileVisibility')
            .map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="theme-text">
                  Mostra {key.replace('show', '').toLowerCase()}
                </span>
                <Switch
                  checked={value as boolean}
                  onCheckedChange={(checked) => onUpdate({ [key]: checked })}
                />
              </div>
            ))}
        </div>
      </div>
    </div>
  );
} 
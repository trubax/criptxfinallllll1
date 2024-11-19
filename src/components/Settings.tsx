import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import Header from './chat/Header';
import NotificationSettings from './settings/NotificationSettings';
import { DeleteAccountDialog } from './settings/DeleteAccountDialog';
import {
  Shield,
  Lock,
  Smartphone,
  HardDrive,
  Trash2,
  LogOut,
  Palette
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

export default function Settings() {
  const navigate = useNavigate();
  const { logout, currentUser, deleteUserAccount } = useAuth();
  const { theme, setTheme, themeColors } = useTheme();
  const [showThemes, setShowThemes] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    if (currentUser?.isAnonymous) {
      try {
        setLoading(true);
        await deleteUserAccount();
      } catch (error) {
        console.error('Errore durante l\'eliminazione dell\'account:', error);
      } finally {
        setLoading(false);
      }
    } else {
      try {
        await logout();
      } catch (error) {
        console.error('Errore durante il logout:', error);
      }
    }
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const handleDeleteAccountClick = () => {
    setShowDeleteDialog(true);
  };

  const SettingItem = ({ icon: Icon, title, description, onClick, value, expandable, expanded }: any) => (
    <div
      onClick={onClick}
      className={`flex items-center justify-between p-4 cursor-pointer transition-colors theme-bg-primary hover:theme-bg-secondary`}
    >
      <div className="flex items-center space-x-4">
        <Icon className="w-5 h-5 theme-text" />
        <div>
          <h3 className="theme-text">{title}</h3>
          {description && (
            <p className="text-sm theme-text opacity-70">
              {description}
            </p>
          )}
        </div>
      </div>
      {typeof value !== 'undefined' && (
        <span className="theme-text opacity-70">
          {value}
        </span>
      )}
    </div>
  );

  return (
    <div className="theme-bg">
      <Header />
      <div className="settings-container overflow-y-auto h-[calc(100vh-64px)] pt-16">
        <div className="max-w-2xl mx-auto px-4 pb-4">
          {/* Profilo */}
          <div className="p-6 theme-bg-primary rounded-lg mb-4 mt-4 shadow-sm backdrop-blur-sm">
            <div 
              onClick={handleProfileClick}
              className="flex items-center space-x-4 cursor-pointer hover:theme-bg-secondary p-2 rounded-lg"
            >
              <img
                src={currentUser?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.displayName || 'User')}`}
                alt={currentUser?.displayName}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div>
                <h2 className="text-lg font-semibold theme-text">{currentUser?.displayName}</h2>
                <p className="theme-text opacity-70">Tocca per vedere il tuo profilo</p>
              </div>
            </div>
          </div>

          {/* Tema */}
          <div className="mb-4 rounded-lg overflow-hidden theme-bg-primary shadow-sm backdrop-blur-sm">
            <SettingItem
              icon={Palette}
              title="Tema"
              description="Personalizza l'aspetto dell'app"
              onClick={() => setShowThemes(!showThemes)}
              expandable={true}
              expanded={showThemes}
            />
            {showThemes && (
              <div className="grid grid-cols-2 gap-4 p-4">
                {Object.entries(themeColors).map(([themeKey, themeData]) => (
                  <button
                    key={themeKey}
                    onClick={() => setTheme(themeKey as keyof typeof themeColors)}
                    className={`p-4 rounded-lg flex flex-col items-center space-y-2 transition-all hover:scale-105 ${
                      theme === themeKey ? 'ring-2 ring-offset-2 ring-current' : ''
                    }`}
                    style={{
                      backgroundColor: themeData.primary,
                      color: themeData.text,
                      borderColor: themeData.accent,
                      boxShadow: theme === themeKey ? `0 0 20px ${themeData.accent}` : 'none'
                    }}
                  >
                    <div 
                      className="w-8 h-8 rounded-full"
                      style={{ 
                        backgroundColor: themeData.accent,
                        boxShadow: `0 0 10px ${themeData.accent}`
                      }}
                    />
                    <span className="text-sm font-medium">{themeData.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notifiche */}
          <div className="mb-4 rounded-lg overflow-hidden theme-bg-primary shadow-sm backdrop-blur-sm">
            <NotificationSettings
              expanded={showNotifications}
              onToggle={() => setShowNotifications(!showNotifications)}
            />
          </div>

          {/* Privacy e Sicurezza */}
          <div className="mb-4 rounded-lg overflow-hidden theme-bg-primary shadow-sm backdrop-blur-sm">
            <SettingItem
              icon={Shield}
              title="Privacy"
              description="Chi può vedere le tue informazioni"
            />
            <SettingItem
              icon={Lock}
              title="Sicurezza"
              description="Verifica in due passaggi"
            />
          </div>

          {/* Dati e Archiviazione */}
          <div className="mb-4 rounded-lg overflow-hidden theme-bg-primary shadow-sm backdrop-blur-sm">
            <SettingItem
              icon={Smartphone}
              title="Utilizzo dati"
              description="Gestisci l'utilizzo dei dati"
            />
            <SettingItem
              icon={HardDrive}
              title="Spazio di archiviazione"
              description="Gestisci lo spazio utilizzato"
              value="2.4 GB"
            />
          </div>

          {/* Account */}
          <div className="mb-4 rounded-lg overflow-hidden theme-bg-primary shadow-sm backdrop-blur-sm">
            {!currentUser?.isAnonymous && (
              <SettingItem
                icon={Trash2}
                title="Elimina account"
                description="Elimina permanentemente il tuo account"
                onClick={handleDeleteAccountClick}
              />
            )}
            <div
              onClick={handleLogout}
              className="flex items-center space-x-4 p-4 cursor-pointer text-red-500 hover:theme-bg-secondary"
            >
              <LogOut className="w-5 h-5" />
              <span>{loading ? 'Uscita in corso...' : currentUser?.isAnonymous ? 'Esci ed elimina' : 'Logout'}</span>
            </div>
          </div>

          <div className="text-center p-4 theme-text opacity-70">
            <p className="text-sm">CriptX v1.0.0</p>
            <p className="text-xs mt-1">© 2024 CriptX. Tutti i diritti riservati.</p>
          </div>
        </div>
      </div>

      {!currentUser?.isAnonymous && (
        <DeleteAccountDialog 
          isOpen={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
        />
      )}
    </div>
  );
}
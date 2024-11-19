import React from 'react';
import Header from '../Header';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ProfileLayoutProps {
  children: React.ReactNode;
}

export default function ProfileLayout({ children }: ProfileLayoutProps) {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  return (
    <div className="min-h-screen theme-bg">
      <Header />
      <div className="max-w-4xl mx-auto">
        <div className="p-4 flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:theme-bg-secondary transition-colors"
          >
            <ArrowLeft className="w-5 h-5 theme-text" />
          </button>
          <h1 className="text-xl font-semibold theme-text">Profilo</h1>
        </div>
        
        <div 
          className="settings-container overflow-y-auto" 
          id="profile-scroll-container"
        >
          <div className="pb-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
} 
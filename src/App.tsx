import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Login from './components/Login';
import Chat from './components/Chat';
import Settings from './components/Settings';
import RegularUsers from './components/RegularUsers';
import ContactsPage from './pages/ContactsPage';
import GroupChatPage from './pages/GroupChatPage';
import PrivateRoute from './components/PrivateRoute';
import BottomNavigation from './components/navigation/BottomNavigation';
import OfflineAlert from './components/OfflineAlert';
import { useNetworkStatus } from './hooks/useNetworkStatus';
import { useOnlinePresence } from './hooks/useOnlinePresence';
import ProfilePage from './pages/ProfilePage';
import { useEffect } from 'react';
import { doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { useAuth } from './contexts/AuthContext';
import PullToRefresh from './components/PullToRefresh';
import { useSetupCheck } from './hooks/useSetupCheck';
import SetupWizard from './components/setup/SetupWizard';
import AnonymousSetup from './components/setup/AnonymousSetup';

function AuthenticatedApp() {
  const { isOnline, isFirestoreAvailable } = useNetworkStatus();
  const { currentUser } = useAuth();
  const { loading, needsSetup } = useSetupCheck();
  useOnlinePresence();

  const handleRefresh = async () => {
    window.location.reload();
  };

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

    const handleVisibilityChange = () => {
      const status = document.visibilityState === 'visible' ? 'online' : 'offline';
      updateOnlineStatus(status);
    };

    const handleOnline = () => updateOnlineStatus('online');
    const handleOffline = () => updateOnlineStatus('offline');

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('beforeunload', () => updateOnlineStatus('offline'));

    updateOnlineStatus('online');

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeunload', () => updateOnlineStatus('offline'));
      updateOnlineStatus('offline');
    };
  }, [currentUser]);

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="min-h-screen theme-bg theme-text pb-16 scroll-container">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/chat" element={<PrivateRoute><Chat /></PrivateRoute>} />
          <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
          <Route path="/users" element={<PrivateRoute><RegularUsers /></PrivateRoute>} />
          <Route path="/contacts" element={<PrivateRoute><ContactsPage /></PrivateRoute>} />
          <Route path="/group" element={<PrivateRoute><GroupChatPage /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
          <Route path="/profile/:userId" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
          <Route path="/" element={<Navigate to="/chat" replace />} />
          <Route path="/setup" element={<SetupWizard />} />
          <Route path="/setup/anonymous" element={<AnonymousSetup />} />
        </Routes>
        {!needsSetup && <BottomNavigation />}
        {(!isOnline || !isFirestoreAvailable) && <OfflineAlert />}
      </div>
    </PullToRefresh>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();
  const { loading } = useSetupCheck();

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  if (loading) {
    return (
      <div className="min-h-screen theme-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
          <AuthenticatedApp />
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}
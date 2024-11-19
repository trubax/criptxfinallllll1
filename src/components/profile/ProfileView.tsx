import { Globe, Users, Lock, Plus, Search, Briefcase, HandHeart, Grid, Play, Bookmark, Heart, MessageCircle, Layers, Trash2 } from 'lucide-react';
import { PrivacySettings } from '../../pages/ProfilePage';
import { useNavigate } from 'react-router-dom';
import ProfilePhotoUpload from './ProfilePhotoUpload';
import ProfileLayout from './ProfileLayout';
import { useTheme } from '../../contexts/ThemeContext';
import { useState } from 'react';
import { Dialog } from '../ui/Dialog';
import { useAuth } from '../../contexts/AuthContext';
import { ServiceModal } from './ServiceModal';
import { PostGrid } from './PostGrid';
import { VideoGrid } from './VideoGrid';
import { CollectionGrid } from './CollectionGrid';
import { ServiceDetailDialog } from '../ui/ServiceDetailDialog';

interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  rate?: string;
  availability?: string;
}

interface ProfileData {
  displayName: string;
  photoURL: string;
  bio: string;
  stats: {
    posts: number;
    followers: number;
    following: number;
  };
  posts?: {
    imageUrl: string;
    caption: string;
    likes: number;
    comments: number;
  }[];
  videos?: {
    url: string;
    views: number;
  }[];
  collections?: {
    coverUrl: string;
    name: string;
    itemCount: number;
  }[];
  servicesOffered: Service[];
  servicesRequested: Service[];
}

interface ProfileViewProps {
  profileData: ProfileData;
  isOwnProfile: boolean;
  privacy: PrivacySettings;
  onPhotoChange: (file: File) => Promise<void>;
  onAddService: (type: 'offered' | 'requested', service: Service) => Promise<void>;
  onDeleteService: (serviceId: string) => Promise<void>;
}

export default function ProfileView({ 
  profileData, 
  isOwnProfile, 
  privacy, 
  onPhotoChange,
  onAddService,
  onDeleteService 
}: ProfileViewProps) {
  const { isAnonymous, currentUser } = useAuth();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [serviceType, setServiceType] = useState<'offered' | 'requested'>('offered');
  const [newService, setNewService] = useState<Partial<Service>>({});
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'videos' | 'collections'>('posts');
  const [showAddPostModal, setShowAddPostModal] = useState(false);
  const [showAddVideoModal, setShowAddVideoModal] = useState(false);
  const [showAddCollectionModal, setShowAddCollectionModal] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  
  // Nascondi completamente il contenuto per utenti anonimi
  if (isAnonymous) {
    return (
      <div className="p-6 text-center theme-text">
        <h2 className="text-xl font-semibold mb-4">Accesso Limitato</h2>
        <p className="mb-4">Per visualizzare i profili degli utenti devi effettuare l'accesso.</p>
        <button
          onClick={() => navigate('/login')}
          className="px-4 py-2 rounded-lg theme-bg-secondary theme-text"
        >
          Accedi
        </button>
      </div>
    );
  }

  const handleAddServiceClick = (type: 'offered' | 'requested') => {
    setServiceType(type);
    setShowServiceModal(true);
  };

  const handleServiceNavigate = (direction: 'prev' | 'next') => {
    if (!selectedService) return;
    
    const allServices = [...profileData.servicesOffered, ...profileData.servicesRequested];
    const currentIndex = allServices.findIndex(s => s.id === selectedService.id);
    
    if (currentIndex === -1) return;
    
    let newIndex;
    if (direction === 'prev') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : allServices.length - 1;
    } else {
      newIndex = currentIndex < allServices.length - 1 ? currentIndex + 1 : 0;
    }
    
    setSelectedService(allServices[newIndex]);
  };

  const handleServiceClick = (service: Service) => {
    setSelectedService(service);
  };

  const handleDeleteService = async (serviceId: string) => {
    try {
      await onDeleteService(serviceId);
      if (selectedService?.id === serviceId) {
        setSelectedService(null);
      }
    } catch (error) {
      console.error('Errore durante l\'eliminazione del servizio:', error);
    }
  };

  return (
    <ProfileLayout>
      <div className="flex flex-col md:flex-row items-start md:items-center gap-8 p-6">
        <div className="flex-shrink-0">
          <img
            src={isOwnProfile ? currentUser?.photoURL || profileData.photoURL : profileData.photoURL}
            alt={profileData.displayName}
            className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-2 theme-border"
          />
        </div>

        <div className="flex-grow">
          <div className="flex items-center gap-4 mb-4">
            <h1 className="text-xl font-semibold theme-text">{profileData.displayName}</h1>
            {isOwnProfile && (
              <button 
                onClick={() => setShowEditModal(true)}
                className="px-4 py-1.5 rounded-lg theme-bg-secondary theme-text text-sm font-medium"
              >
                Modifica profilo
              </button>
            )}
          </div>

          <div className="flex gap-8 mb-4">
            <div className="text-center">
              <span className="font-semibold theme-text block">{profileData.stats?.posts || 0}</span>
              <span className="text-sm theme-text opacity-70">post</span>
            </div>
            <div className="text-center">
              <span className="font-semibold theme-text block">{profileData.stats?.followers || 0}</span>
              <span className="text-sm theme-text opacity-70">follower</span>
            </div>
            <div className="text-center">
              <span className="font-semibold theme-text block">{profileData.stats?.following || 0}</span>
              <span className="text-sm theme-text opacity-70">seguiti</span>
            </div>
          </div>

          {profileData.bio && (
            <p className="theme-text whitespace-pre-wrap">{profileData.bio}</p>
          )}
        </div>
      </div>

      {/* Sezione Servizi */}
      {(privacy.showServices || isOwnProfile) && (
        <div className="grid md:grid-cols-2 gap-4 p-6">
          {/* Servizi Offerti */}
          <div className="theme-bg-primary rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold theme-text flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Servizi Offerti
              </h3>
              {isOwnProfile && (
                <button
                  onClick={() => handleAddServiceClick('offered')}
                  className="p-2 rounded-full hover:theme-bg-secondary transition-colors"
                >
                  <Plus className="w-5 h-5 theme-text" />
                </button>
              )}
            </div>
            <div className="space-y-2">
              {profileData.servicesOffered.map((service) => (
                <div key={service.id} className="flex items-center justify-between w-full">
                  <button
                    onClick={() => setSelectedService(service)}
                    className="flex-1 p-3 text-left rounded-lg hover:theme-bg-secondary transition-colors theme-text"
                  >
                    {service.name}
                  </button>
                  {isOwnProfile && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteService(service.id);
                      }}
                      className="p-2 rounded-full hover:theme-bg-secondary transition-colors ml-2"
                    >
                      <Trash2 className="w-4 h-4 theme-text" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Servizi Richiesti */}
          <div className="theme-bg-primary rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold theme-text flex items-center gap-2">
                <HandHeart className="w-5 h-5" />
                Servizi Richiesti
              </h3>
              {isOwnProfile && (
                <button
                  onClick={() => handleAddServiceClick('requested')}
                  className="p-2 rounded-full hover:theme-bg-secondary transition-colors"
                >
                  <Plus className="w-5 h-5 theme-text" />
                </button>
              )}
            </div>
            <div className="space-y-2">
              {profileData.servicesRequested.map((service) => (
                <div key={service.id} className="flex items-center justify-between w-full">
                  <button
                    onClick={() => setSelectedService(service)}
                    className="flex-1 p-3 text-left rounded-lg hover:theme-bg-secondary transition-colors theme-text"
                  >
                    {service.name}
                  </button>
                  {isOwnProfile && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteService(service.id);
                      }}
                      className="p-2 rounded-full hover:theme-bg-secondary transition-colors ml-2"
                    >
                      <Trash2 className="w-4 h-4 theme-text" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedService && (
        <ServiceDetailDialog
          open={!!selectedService}
          onOpenChange={(open) => !open && setSelectedService(null)}
          service={selectedService}
          onNavigate={handleServiceNavigate}
          onDelete={isOwnProfile ? () => handleDeleteService(selectedService.id) : undefined}
        />
      )}

      {/* Tabs per post, video e raccolte */}
      <div className="border-t theme-border mt-8">
        <div className="flex justify-center">
          <button 
            className={`flex items-center gap-2 px-6 py-4 border-t-2 ${
              activeTab === 'posts' ? 'theme-border-accent theme-text' : 'border-transparent theme-text-secondary'
            }`}
            onClick={() => setActiveTab('posts')}
          >
            <Grid className="w-5 h-5" />
            <span className="text-sm font-medium">Post</span>
          </button>
          <button 
            className={`flex items-center gap-2 px-6 py-4 border-t-2 ${
              activeTab === 'videos' ? 'theme-border-accent theme-text' : 'border-transparent theme-text-secondary'
            }`}
            onClick={() => setActiveTab('videos')}
          >
            <Play className="w-5 h-5" />
            <span className="text-sm font-medium">Video</span>
          </button>
          <button 
            className={`flex items-center gap-2 px-6 py-4 border-t-2 ${
              activeTab === 'collections' ? 'theme-border-accent theme-text' : 'border-transparent theme-text-secondary'
            }`}
            onClick={() => setActiveTab('collections')}
          >
            <Bookmark className="w-5 h-5" />
            <span className="text-sm font-medium">Raccolte</span>
          </button>
        </div>

        {/* Griglia dei contenuti */}
        <div className="p-4">
          {activeTab === 'posts' && (
            <div className="p-4">
              <PostGrid />
            </div>
          )}

          {activeTab === 'videos' && (
            <div className="p-4">
              <VideoGrid />
            </div>
          )}

          {activeTab === 'collections' && (
            <div className="p-4">
              <CollectionGrid />
            </div>
          )}
        </div>
      </div>

      {/* Modal per aggiunta servizio */}
      <ServiceModal
        open={showServiceModal}
        onOpenChange={setShowServiceModal}
        type={serviceType}
        onSubmit={async (service) => {
          await onAddService(serviceType, service);
          setShowServiceModal(false);
        }}
      />
    </ProfileLayout>
  );
} 
import React, { useState } from 'react';
import { Camera } from 'lucide-react';
import { Dialog } from '../ui/Dialog';
import { PhotoCropper } from './PhotoCropper';
import { PhotoService } from '../../services/PhotoService';
import { useAuth } from '../../contexts/AuthContext';

interface ProfilePhotoUploadProps {
  currentPhotoURL: string;
  onPhotoChange: (photoURL: string) => Promise<void>;
}

export default function ProfilePhotoUpload({ currentPhotoURL, onPhotoChange }: ProfilePhotoUploadProps) {
  const { currentUser } = useAuth();
  const [showCropper, setShowCropper] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [cropArea, setCropArea] = useState<Area | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setShowCropper(true);
    }
  };

  const handleCropChange = (newCropArea: Area) => {
    setCropArea(newCropArea);
  };

  const handleSave = async () => {
    if (!selectedFile || !currentUser || !cropArea) return;
    
    setLoading(true);
    try {
      const photoURL = await PhotoService.uploadProfilePhoto(
        currentUser.uid,
        selectedFile,
        cropArea
      );
      
      await onPhotoChange(photoURL);
      setShowCropper(false);
      setSelectedFile(null);
    } catch (error) {
      console.error('Error updating profile photo:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="relative">
        <img
          src={currentPhotoURL}
          alt="Profile"
          className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-2 theme-border"
        />
        <label className="absolute bottom-0 right-0 p-2 rounded-full theme-bg-secondary cursor-pointer hover:opacity-90 transition-opacity">
          <Camera className="w-5 h-5 theme-text" />
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </label>
      </div>

      <Dialog open={showCropper} onOpenChange={setShowCropper}>
        <div className="p-6 space-y-4">
          <h3 className="text-xl font-semibold theme-text">
            Modifica foto profilo
          </h3>
          
          {selectedFile && (
            <PhotoCropper
              photoURL={URL.createObjectURL(selectedFile)}
              onCropComplete={handleCropChange}
            />
          )}
          
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowCropper(false)}
              className="px-4 py-2 rounded-lg theme-bg-secondary theme-text"
              disabled={loading}
            >
              Annulla
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-lg theme-bg-accent theme-text-accent"
              disabled={loading}
            >
              {loading ? 'Salvataggio...' : 'Salva'}
            </button>
          </div>
        </div>
      </Dialog>
    </>
  );
} 
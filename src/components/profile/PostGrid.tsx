import { Plus, Heart, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { ContentCreationDialog } from '../ui/ContentCreationDialog';
import { ContentDetailDialog } from '../ui/ContentDetailDialog';

interface Post {
  id: string;
  imageUrl: string;
  caption: string;
  likes: number;
  comments: number;
}

export function PostGrid() {
  const [isCreating, setIsCreating] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState<{
    image: File | null;
    caption: string;
  }>({
    image: null,
    caption: ''
  });
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const handleCreatePost = async () => {
    if (!newPost.image) return;

    try {
      // Qui andrà la logica per caricare l'immagine su storage
      const imageUrl = URL.createObjectURL(newPost.image); // Temporaneo, usa Firebase Storage in produzione
      
      const post: Post = {
        id: crypto.randomUUID(),
        imageUrl,
        caption: newPost.caption,
        likes: 0,
        comments: 0
      };

      setPosts([post, ...posts]);
      setIsCreating(false);
      setNewPost({ image: null, caption: '' });
    } catch (error) {
      console.error('Errore durante la creazione del post:', error);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (confirm('Sei sicuro di voler eliminare questo post?')) {
      setPosts(posts.filter(post => post.id !== postId));
      setSelectedPost(null);
    }
  };

  const handleUpdatePost = async (postId: string, data: { caption?: string }) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, ...data }
        : post
    ));
  };

  const handleNavigate = (direction: 'prev' | 'next') => {
    if (!selectedPost) return;
    
    const currentIndex = posts.findIndex(post => post.id === selectedPost.id);
    let newIndex;
    
    if (direction === 'prev') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : posts.length - 1;
    } else {
      newIndex = currentIndex < posts.length - 1 ? currentIndex + 1 : 0;
    }
    
    setSelectedPost(posts[newIndex]);
  };

  return (
    <>
      <div className="grid grid-cols-3 gap-1">
        <button
          onClick={() => setIsCreating(true)}
          className="aspect-square theme-bg-secondary hover:opacity-80 transition-opacity flex items-center justify-center"
        >
          <Plus className="w-8 h-8 theme-text" />
        </button>

        {posts.map((post) => (
          <div 
            key={post.id} 
            className="aspect-square group relative cursor-pointer"
            onClick={() => setSelectedPost(post)}
          >
            <img
              src={post.imageUrl}
              alt={post.caption}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200">
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="flex items-center gap-6 text-white">
                  <div className="flex items-center gap-2">
                    <Heart className="w-5 h-5" />
                    <span>{post.likes}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    <span>{post.comments}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <ContentCreationDialog
        open={isCreating}
        onOpenChange={setIsCreating}
        title="Crea nuovo post"
        onSubmit={handleCreatePost}
        submitLabel="Pubblica"
        isSubmitDisabled={!newPost.image}
      >
        <div className="space-y-4">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setNewPost(prev => ({ ...prev, image: file }));
              }
            }}
            className="w-full p-2 rounded-lg theme-bg-secondary theme-text file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:theme-bg-accent file:theme-text-accent hover:file:opacity-80"
          />
          
          <textarea
            value={newPost.caption}
            onChange={(e) => setNewPost(prev => ({ ...prev, caption: e.target.value }))}
            placeholder="Scrivi una didascalia..."
            className="w-full p-2 rounded-lg theme-bg-secondary theme-text resize-none"
            rows={3}
          />
        </div>
      </ContentCreationDialog>

      {selectedPost && (
        <ContentDetailDialog
          open={!!selectedPost}
          onOpenChange={(open) => !open && setSelectedPost(null)}
          type="post"
          content={{
            id: selectedPost.id,
            mediaUrl: selectedPost.imageUrl,
            caption: selectedPost.caption,
            comments: []
          }}
          onDelete={() => handleDeletePost(selectedPost.id)}
          onUpdate={(data) => handleUpdatePost(selectedPost.id, data)}
          onNavigate={handleNavigate}
        />
      )}
    </>
  );
} 
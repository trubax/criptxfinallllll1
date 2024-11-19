import { useEffect, useState } from 'react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
}

export default function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const [startY, setStartY] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const threshold = 150; // Soglia di trascinamento per attivare il refresh

  useEffect(() => {
    let touchStartY = 0;
    let touchMoveY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      const scrollTop = document.documentElement.scrollTop;
      if (scrollTop <= 0) {
        touchStartY = e.touches[0].clientY;
        setStartY(touchStartY);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      touchMoveY = e.touches[0].clientY;
      const scrollTop = document.documentElement.scrollTop;
      
      if (scrollTop <= 0 && touchMoveY > touchStartY) {
        e.preventDefault();
        const distance = touchMoveY - touchStartY;
        if (distance > 0 && distance < threshold) {
          document.body.style.transform = `translateY(${distance}px)`;
        }
      }
    };

    const handleTouchEnd = async () => {
      const distance = touchMoveY - touchStartY;
      document.body.style.transform = '';

      if (distance > threshold && !refreshing) {
        setRefreshing(true);
        try {
          await onRefresh();
        } finally {
          setRefreshing(false);
        }
      }
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onRefresh, refreshing]);

  return (
    <>
      {refreshing && (
        <div className="fixed top-0 left-0 right-0 z-50 flex justify-center p-2 theme-bg-primary">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent"></div>
        </div>
      )}
      {children}
    </>
  );
} 
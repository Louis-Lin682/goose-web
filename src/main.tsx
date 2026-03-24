import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { AdminNotificationsProvider } from './context/AdminNotificationsProvider'
import { CartProvider } from './context/CartProvider'
import { AuthProvider } from './context/AuthProvider'

const preventGestureZoom = () => {
  if (typeof document === "undefined" || typeof window === "undefined") {
    return;
  }

  const preventDefault = (event: Event) => {
    event.preventDefault();
  };

  let lastTouchEnd = 0;

  const handleTouchMove = (event: TouchEvent) => {
    if (event.touches.length > 1) {
      event.preventDefault();
    }
  };

  const handleTouchEnd = (event: TouchEvent) => {
    const now = Date.now();

    if (now - lastTouchEnd <= 300) {
      event.preventDefault();
    }

    lastTouchEnd = now;
  };

  document.addEventListener('gesturestart', preventDefault, { passive: false });
  document.addEventListener('gesturechange', preventDefault, { passive: false });
  document.addEventListener('gestureend', preventDefault, { passive: false });
  document.addEventListener('touchmove', handleTouchMove, { passive: false });
  document.addEventListener('touchend', handleTouchEnd, { passive: false });
};

preventGestureZoom();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <AdminNotificationsProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </AdminNotificationsProvider>
    </AuthProvider>
  </StrictMode>,
)

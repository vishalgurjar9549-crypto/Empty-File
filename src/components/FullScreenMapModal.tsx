import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface FullScreenMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  latitude: number;
  longitude: number;
  title: string;
  location: string;
}

export const FullScreenMapModal: React.FC<FullScreenMapModalProps> = ({
  isOpen,
  onClose,
  latitude,
  longitude,
  title,
  location,
}) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const token = import.meta.env.VITE_MAPBOX_TOKEN;

  // Initialize full-screen map
  useEffect(() => {
    if (!isOpen || !mapContainer.current || !token) return;

    try {
      mapboxgl.accessToken = token;

      // Create map with all interactions enabled
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [longitude, latitude],
        zoom: 16,
        // Enable all interactions for full-screen exploration
        interactive: true,
        dragPan: true,
        doubleClickZoom: true,
        touchZoomRotate: true,
        scrollZoom: true, // Enabled in modal for unrestricted exploration
        boxZoom: true,
        keyboard: true,
        pitchWithRotate: true,
        // Set zoom limits
        minZoom: 10,
        maxZoom: 18,
      });

      // Add navigation controls (top-right corner)
      const nav = new mapboxgl.NavigationControl({
        showCompass: true,
        showZoom: true,
      });
      map.current.addControl(nav, 'top-right');

      // Add fullscreen control
      map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');

      // Add scale control
      map.current.addControl(new mapboxgl.ScaleControl({ maxWidth: 80, unit: 'metric' }), 'bottom-right');

      // Add marker at exact location
      const el = document.createElement('div');
      el.className = 'w-10 h-10 bg-gold rounded-full border-2 border-white shadow-xl flex items-center justify-center';
      el.innerHTML = '<svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C7.04 0 3 4.04 3 9c0 5.25 9 15 9 15s9-9.75 9-15c0-4.96-4.04-9-9-9zm0 12c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"/></svg>';

      new mapboxgl.Marker({ element: el })
        .setLngLat([longitude, latitude])
        .addTo(map.current);

      // Create popup
      const popup = new mapboxgl.Popup({ offset: 25, maxWidth: '300px' })
        .setHTML(`
          <div class="p-3">
            <div class="text-sm font-bold text-navy">${title}</div>
            <div class="text-xs text-slate-600 mt-2">${location}</div>
            <div class="text-xs text-slate-500 mt-3 font-mono">
              ${latitude.toFixed(4)}, ${longitude.toFixed(4)}
            </div>
          </div>
        `);

      new mapboxgl.Marker({ element: el })
        .setLngLat([longitude, latitude])
        .setPopup(popup)
        .addTo(map.current);

      popup.addTo(map.current);
    } catch (err) {
      console.error('Full-screen map initialization error:', err);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [isOpen, latitude, longitude, title, location, token]);

  // Handle keyboard ESC key to close modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="map-title"
      >
        <div className="relative w-full h-full max-w-5xl max-h-screen bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
            <div className="flex-1">
              <h2 id="map-title" className="text-xl font-bold text-navy dark:text-white">{title}</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{location}</p>
            </div>
            <button
              onClick={onClose}
              className="ml-4 p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
              aria-label="Close map"
            >
              <X className="w-6 h-6 text-slate-600 dark:text-slate-400" />
            </button>
          </div>

          {/* Map container */}
          <div ref={mapContainer} className="flex-1 bg-slate-100 dark:bg-slate-700" />

          {/* Footer info */}
          <div className="p-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-600 dark:text-slate-400">
            <span className="font-medium">Coordinates:</span> {latitude.toFixed(4)}, {longitude.toFixed(4)}
            <span className="mx-2">•</span>
            <span>Use scroll wheel or two-finger pinch to zoom | Drag to pan | Press ESC to close</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default FullScreenMapModal;

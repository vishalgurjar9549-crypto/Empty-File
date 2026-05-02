import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MapPin, Maximize2 } from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { FullScreenMapModal } from './FullScreenMapModal';

interface DynamicMapProps {
  latitude?: number | null;
  longitude?: number | null;
  title: string;
  location: string;
  city: string;
  isUnlocked: boolean;
}

export const DynamicMap: React.FC<DynamicMapProps> = ({
  latitude,
  longitude,
  title,
  location,
  city,
  isUnlocked,
}) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isFullScreenOpen, setIsFullScreenOpen] = useState(false);

  const token = import.meta.env.VITE_MAPBOX_TOKEN;

  // Default city coordinates (fallback if no coordinates)
  const DEFAULT_COORDS: Record<string, [number, number]> = {
    bangalore: [77.6412, 12.9716],
    mumbai: [72.8777, 19.0760],
    delhi: [77.1025, 28.7041],
    hyderabad: [78.4867, 17.3850],
    pune: [73.8479, 18.5204],
    chennai: [80.2707, 13.0827],
  };

  const hasCoordinates = latitude !== null && latitude !== undefined && longitude !== null && longitude !== undefined;
  const [centerLng, centerLat] = hasCoordinates
    ? [longitude!, latitude!]
    : DEFAULT_COORDS[city.toLowerCase()] || [77.6412, 12.9716];

  const initializeMap = useCallback(() => {
    if (!mapContainer.current || !token || !isUnlocked) return;

    try {
      mapboxgl.accessToken = token;

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [centerLng, centerLat],
        zoom: hasCoordinates ? 16 : 13,
        // Enhanced interactions optimized for embedded context
        interactive: true,
        dragPan: true, // Enable smooth drag panning
        doubleClickZoom: true, // Double-click to zoom in
        touchZoomRotate: true, // Mobile pinch-to-zoom and rotate
        scrollZoom: false, // Disabled to prevent page scroll conflicts
        boxZoom: true, // Draw box to zoom
        keyboard: true, // Keyboard navigation
        pitchWithRotate: true, // Allow pitch with rotate
        // Zoom constraints for optimal exploration
        minZoom: 10, // Minimum (city view)
        maxZoom: 18, // Maximum (building detail)
      });

      // Add navigation controls for embedded map
      const nav = new mapboxgl.NavigationControl({ showCompass: true, showZoom: true });
      map.current.addControl(nav, 'top-right');

      // Add scale control
      map.current.addControl(new mapboxgl.ScaleControl({ maxWidth: 80, unit: 'metric' }), 'bottom-right');

      // Add marker at exact location (if coordinates exist)
      if (hasCoordinates) {
        const el = document.createElement('div');
        el.className = 'w-8 h-8 bg-gold rounded-full border-2 border-white shadow-lg flex items-center justify-center';
        el.innerHTML = '<svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C7.04 0 3 4.04 3 9c0 5.25 9 15 9 15s9-9.75 9-15c0-4.96-4.04-9-9-9zm0 12c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"/></svg>';

        const popup = new mapboxgl.Popup({ offset: 25 })
          .setHTML(`
            <div class="text-sm font-semibold text-navy">${title}</div>
            <div class="text-xs text-slate-600 mt-1">${location}</div>
          `);

        new mapboxgl.Marker({ element: el })
          .setLngLat([centerLng, centerLat])
          .setPopup(popup)
          .addTo(map.current);

        popup.addTo(map.current);
      }
    } catch (err) {
      console.error('Map initialization error:', err);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [latitude, longitude, title, location, city, token, isUnlocked, hasCoordinates, centerLng, centerLat]);

  useEffect(() => {
    if (!mapContainer.current || !token || !isUnlocked) return;

    const cleanup = initializeMap();
    return cleanup;
  }, [initializeMap, token, isUnlocked]);

  // If not unlocked, show placeholder
  if (!isUnlocked) {
    return (
      <div className="w-full h-80 md:h-96 bg-slate-100 dark:bg-slate-700/50 rounded-2xl flex flex-col items-center justify-center border border-slate-200 dark:border-slate-600 relative overflow-hidden">
        <div className="relative z-10 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-lg flex flex-col items-center">
          <MapPin className="w-8 h-8 text-slate-400 mb-2" />
          <p className="text-navy dark:text-white font-bold text-center">
            Exact Location Unlocked
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 text-center">
            Available after unlock
          </p>
        </div>
      </div>
    );
  }

  // If unlocked but no coordinates, show city map
  if (!latitude || !longitude) {
    return (
      <div className="w-full h-80 md:h-96 bg-slate-100 dark:bg-slate-700/50 rounded-2xl flex flex-col items-center justify-center border border-slate-200 dark:border-slate-600 relative overflow-hidden">
        <div className="relative z-10 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-lg flex flex-col items-center">
          <MapPin className="w-8 h-8 text-gold mb-2" />
          <p className="text-navy dark:text-white font-bold text-center">
            {city} Location
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 text-center">
            Approx location shown
          </p>
        </div>
      </div>
    );
  }

  // If unlocked and has coordinates, show interactive map with full-screen option
  return (
    <div className="w-full space-y-3">
      <div className="relative group">
        <div
          ref={mapContainer}
          className="w-full h-80 md:h-96 rounded-2xl border border-slate-200 dark:border-slate-600 overflow-hidden bg-slate-100 dark:bg-slate-700"
        />

        {/* Full-screen button overlay */}
        <button
          onClick={() => setIsFullScreenOpen(true)}
          className="absolute top-4 right-4 z-10 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 p-2.5 rounded-lg shadow-lg border border-slate-200 dark:border-slate-600 transition-all duration-200 transform hover:scale-110"
          title="View full screen"
          aria-label="Open full screen map"
        >
          <Maximize2 className="w-5 h-5 text-slate-700 dark:text-slate-300" />
        </button>
      </div>

      {/* Location info card */}
      <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
        <MapPin className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="font-bold text-green-700 dark:text-green-300">Exact Location Unlocked</p>
          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
            {latitude?.toFixed(4)}, {longitude?.toFixed(4)}
          </p>
          <p className="text-xs text-green-600 dark:text-green-400 mt-2">
            💡 <span className="font-medium">Tip:</span> Click the expand button to explore the full map interactively
          </p>
        </div>
        {/* Get Directions Button */}
        {latitude && longitude && (
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <span>📍</span>
            <span>Get Directions</span>
          </a>
        )}
      </div>

      {/* Full-screen modal */}
      <FullScreenMapModal
        isOpen={isFullScreenOpen}
        onClose={() => setIsFullScreenOpen(false)}
        latitude={latitude}
        longitude={longitude}
        title={title}
        location={location}
      />
    </div>
  );
};

export default DynamicMap;

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MapPin, Loader2, AlertCircle } from 'lucide-react';
import mapboxgl, { Map } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Button } from './ui/Button';

interface MapLocationPickerProps {
  latitude?: number | null;
  longitude?: number | null;
  onChange: (latitude: number | null, longitude: number | null) => void;
  defaultCity?: string;
  showLabel?: boolean;
}

const DEFAULT_COORDS: Record<string, [number, number]> = {
  bangalore: [77.6412, 12.9716],
  mumbai: [72.8777, 19.0760],
  delhi: [77.1025, 28.7041],
  hyderabad: [78.4867, 17.3850],
  pune: [73.8479, 18.5204],
  chennai: [80.2707, 13.0827],
  Bangalore: [77.6412, 12.9716],
  Mumbai: [72.8777, 19.0760],
  Delhi: [77.1025, 28.7041],
  Hyderabad: [78.4867, 17.3850],
  Pune: [73.8479, 18.5204],
  Chennai: [80.2707, 13.0827],
};

interface Marker {
  lngLat: {
    lng: number;
    lat: number;
  };
  remove: () => void;
}

export const MapLocationPicker: React.FC<MapLocationPickerProps> = ({
  latitude,
  longitude,
  onChange,
  defaultCity = 'bangalore',
  showLabel = true,
}) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<Map | null>(null);
  const marker = useRef<Marker | null>(null);
  const [isGeoLocating, setIsGeoLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token = import.meta.env.VITE_MAPBOX_TOKEN;

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !token) return;

    try {
      mapboxgl.accessToken = token;

      // Determine initial center
      const initialLng = longitude ?? DEFAULT_COORDS[defaultCity]?.[0] ?? 77.6412;
      const initialLat = latitude ?? DEFAULT_COORDS[defaultCity]?.[1] ?? 12.9716;

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [initialLng, initialLat],
        zoom: 13,
        // Enhanced interactions for smooth UX
        interactive: true,
        dragPan: true, // Enable drag panning
        doubleClickZoom: true, // Double-click to zoom in
        touchZoomRotate: true, // Mobile pinch-to-zoom and rotate
        scrollZoom: false, // Disabled to prevent page scroll conflicts
        boxZoom: true, // Draw box to zoom
        keyboard: true, // Keyboard navigation
        pitchWithRotate: true, // Allow pitch with rotate
        // Zoom constraints
        minZoom: 10, // Minimum zoom level (city view)
        maxZoom: 18, // Maximum zoom level (building detail)
      });

      // Add marker if coordinates exist
      if (latitude && longitude) {
        addMarker(longitude, latitude);
      }

      // Handle map click to place marker
      map.current.on('click', (e: mapboxgl.MapMouseEvent) => {
        const { lng, lat } = e.lngLat;
        addMarker(lng, lat);
        onChange(lat, lng);
      });

      // Add click instruction
      const canvasContainer = map.current.getCanvasContainer();
      canvasContainer.style.cursor = 'crosshair';

      // Add navigation controls for better UX
      const nav = new mapboxgl.NavigationControl({ showCompass: true, showZoom: true });
      map.current.addControl(nav, 'top-right');

      // Add scale control
      map.current.addControl(new mapboxgl.ScaleControl({ maxWidth: 80, unit: 'metric' }), 'bottom-right');

      setError(null);
    } catch (err) {
      console.error('Map initialization error:', err);
      setError('Failed to initialize map');
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [token, defaultCity]);

  const addMarker = useCallback((lng: number, lat: number) => {
    if (!map.current) return;

    // Remove existing marker
    if (marker.current) {
      marker.current.remove();
    }

    // Add new marker
    const el = document.createElement('div');
    el.className = 'w-8 h-8 bg-gold rounded-full border-2 border-white shadow-lg flex items-center justify-center';
    el.innerHTML = '<svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C7.04 0 3 4.04 3 9c0 5.25 9 15 9 15s9-9.75 9-15c0-4.96-4.04-9-9-9zm0 12c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"/></svg>';

    const newMarker = new mapboxgl.Marker({ element: el })
      .setLngLat([lng, lat])
      .addTo(map.current);

    marker.current = newMarker as unknown as Marker;

    // Smooth animation to marker location with optimal zoom
    map.current.flyTo({
      center: [lng, lat],
      zoom: 16, // Optimal zoom for property detail
      duration: 1200, // Smooth animation
      essential: false, // Allow animation to be preempted by user interaction
      pitch: 0, // Keep flat view
    });
  }, []);

  const handleUseCurrentLocation = async () => {
    setIsGeoLocating(true);
    setError(null);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 10000,
          enableHighAccuracy: false,
        });
      });

      const { latitude: lat, longitude: lng } = position.coords;
      addMarker(lng, lat);
      onChange(lat, lng);
      setIsGeoLocating(false);
    } catch (err) {
      console.error('Geolocation error:', err);
      setError('Unable to get your location. Please enable location permission.');
      setIsGeoLocating(false);
    }
  };

  const clearLocation = () => {
    if (marker.current) {
      marker.current.remove();
      marker.current = null;
    }
    onChange(null, null);
  };

  return (
    <div className="space-y-3">
      {showLabel && (
        <label className="block text-sm font-bold text-navy dark:text-white">
          <MapPin className="w-4 h-4 inline mr-2 text-gold" />
          Property Location (Optional)
        </label>
      )}

      {error && (
        <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      <div className="relative z-0 isolate">
        
        <div
          ref={mapContainer}
          className="w-full h-64 md:h-80 rounded-lg border border-slate-300 dark:border-slate-600 overflow-hidden bg-slate-100 dark:bg-slate-700"
        />

        {isGeoLocating ? (
          <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center">
            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg flex items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-gold" />
              <span className="text-sm font-medium text-navy dark:text-white">
                Getting your location...
              </span>
            </div>
          </div>
        ) : null}
      </div>

      <div className="space-y-2">
        {/* Coordinates display */}
        {latitude && longitude && (
          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Location</p>
            <p className="text-sm font-mono text-navy dark:text-white">
              {latitude.toFixed(6)}, {longitude.toFixed(6)}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Click on map to change location
            </p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleUseCurrentLocation}
            disabled={isGeoLocating}
            className="flex-1"
          >
            <MapPin className="w-4 h-4 mr-2" />
            {isGeoLocating ? 'Locating...' : 'Use Current Location'}
          </Button>

          {latitude && longitude && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={clearLocation}
              className="flex-1"
            >
              Clear Location
            </Button>
          )}
        </div>
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400">
        💡 <span className="font-medium">Tip:</span> Click anywhere on the map to set your property location, or use your current location.
      </p>
    </div>
  );
};

export default MapLocationPicker;

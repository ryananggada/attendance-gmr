import { useState, useCallback } from 'react';

export function useGeolocation() {
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = () => {
    setLocation(null);
    setError(null);
  };

  const getLocation = useCallback(() => {
    return new Promise<{ latitude: number; longitude: number }>(
      (resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('Geolocation not supported'));
          return;
        }

        setLoading(true);

        const watchId = navigator.geolocation.watchPosition(
          (position) => {
            const { latitude, longitude, accuracy } = position.coords;

            if (accuracy <= 50) {
              navigator.geolocation.clearWatch(watchId);
              setLoading(false);

              const coords = { latitude, longitude };
              setLocation(coords);
              resolve(coords);
            }
          },
          (err) => {
            navigator.geolocation.clearWatch(watchId);
            setLoading(false);
            reject(err);
          },
          {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 15000,
          },
        );
      },
    );
  }, []);

  return { location, error, loading, refresh, getLocation };
}

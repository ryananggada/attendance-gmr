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
          const msg = 'Geolocation is not supported by this browser.';
          setError(msg);
          reject(new Error(msg));
          return;
        }

        setLoading(true);
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const coords = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            };
            setLocation(coords);
            setLoading(false);
            resolve(coords);
          },
          (err) => {
            setError(err.message);
            setLoading(false);
            reject(err);
          },
          {
            enableHighAccuracy: true,
          },
        );
      },
    );
  }, []);

  return { location, error, loading, refresh, getLocation };
}

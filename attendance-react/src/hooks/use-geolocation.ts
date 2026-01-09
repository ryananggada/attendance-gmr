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

        let bestPosition: GeolocationPosition | null = null;

        const watchId = navigator.geolocation.watchPosition(
          (position) => {
            bestPosition = position;

            if (position.coords.accuracy <= 50) {
              navigator.geolocation.clearWatch(watchId);
              setLoading(false);
              resolve({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              });
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
          },
        );

        setTimeout(() => {
          navigator.geolocation.clearWatch(watchId);
          setLoading(false);

          if (bestPosition) {
            resolve({
              latitude: bestPosition.coords.latitude,
              longitude: bestPosition.coords.longitude,
            });
          } else {
            reject(new Error('Unable to get location'));
          }
        }, 2500);
      },
    );
  }, []);

  return { location, error, loading, refresh, getLocation };
}

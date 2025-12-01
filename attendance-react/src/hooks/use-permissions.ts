import { useCallback, useEffect, useState } from 'react';

type PermissionStatus = 'loading' | 'granted' | 'denied' | 'prompt' | 'error';

export function usePermissions() {
  const [cameraStatus, setCameraStatus] = useState<PermissionStatus>('loading');
  const [locationStatus, setLocationStatus] =
    useState<PermissionStatus>('loading');

  const requestCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraStatus('granted');
      stream.getTracks().forEach((track) => track.stop());
    } catch {
      setCameraStatus('denied');
    }
  }, []);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationStatus('error');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      () => setLocationStatus('granted'),
      () => setLocationStatus('denied'),
    );
  }, []);

  useEffect(() => {
    async function check() {
      if (!navigator.permissions) {
        setCameraStatus('prompt');
        setLocationStatus('prompt');
        return;
      }

      try {
        const cam = await navigator.permissions.query({
          name: 'camera' as PermissionName,
        });
        setCameraStatus(cam.state as PermissionState);
        cam.onchange = () => setCameraStatus(cam.state as PermissionState);

        const loc = await navigator.permissions.query({ name: 'geolocation' });
        setLocationStatus(loc.state as PermissionState);
        loc.onchange = () => setLocationStatus(loc.state as PermissionState);
      } catch {
        setCameraStatus('error');
        setLocationStatus('error');
      }
    }

    check();
  }, []);

  const isLoading = cameraStatus === 'loading' || locationStatus === 'loading';
  const isGranted = cameraStatus === 'granted' && locationStatus === 'granted';

  return {
    cameraStatus,
    locationStatus,
    isLoading,
    isGranted,
    requestCamera,
    requestLocation,
  };
}

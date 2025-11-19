import { useCallback, useEffect, useState } from 'react';

type PermissionStatus = 'idle' | 'granted' | 'denied' | 'prompt' | 'error';

export function usePermissions() {
  const [cameraStatus, setCameraStatus] = useState<PermissionStatus>('idle');
  const [locationStatus, setLocationStatus] =
    useState<PermissionStatus>('idle');

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
    if (navigator.permissions) {
      navigator.permissions
        .query({ name: 'camera' as PermissionName })
        .then((status) => {
          setCameraStatus(status.state as PermissionStatus);
          status.onchange = () =>
            setCameraStatus(status.state as PermissionStatus);
        })
        .catch(() => setCameraStatus('error'));

      navigator.permissions
        .query({ name: 'geolocation' })
        .then((status) => {
          setLocationStatus(status.state as PermissionStatus);
          status.onchange = () =>
            setLocationStatus(status.state as PermissionStatus);
        })
        .catch(() => setLocationStatus('error'));
    }
  }, []);

  return {
    cameraStatus,
    locationStatus,
    requestCamera,
    requestLocation,
  };
}

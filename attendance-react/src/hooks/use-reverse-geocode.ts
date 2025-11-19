import { useQuery } from '@tanstack/react-query';

export function useReverseGeocode(lat: number | null, lon: number | null) {
  return useQuery({
    queryKey: ['reverseGeocode', lat, lon],
    queryFn: async () => {
      if (lat === null || lon === null) return null;

      const res = await fetch(
        `https://us1.locationiq.com/v1/reverse?key=${
          import.meta.env.VITE_GEOLOCATION_API_TOKEN
        }&lat=${lat}&lon=${lon}&format=json`,
      );

      if (!res.ok) throw new Error('Failed to fetch address');

      const data = await res.json();
      return data.display_name as string;
    },
    enabled: lat !== null && lon !== null,
    staleTime: 1000 * 60 * 10,
  });
}

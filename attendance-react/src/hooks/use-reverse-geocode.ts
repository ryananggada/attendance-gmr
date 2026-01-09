import { reverseGeocode } from '@/services/geolocation-service';
import { useQuery } from '@tanstack/react-query';

export function useReverseGeocode(lat: number | null, long: number | null) {
  return useQuery({
    queryKey: ['reverseGeocode', lat, long],
    queryFn: async () => reverseGeocode(lat!, long!),
    enabled: lat !== null && long !== null,
    staleTime: Infinity,
  });
}

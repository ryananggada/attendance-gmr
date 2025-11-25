export function haversineDistance(lat: number, long: number) {
  const R = 6371e3;
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const latEnv = Number(import.meta.env.VITE_LAT);
  const longEnv = Number(import.meta.env.VITE_LONG);

  const φ1 = toRad(latEnv);
  const φ2 = toRad(lat);
  const Δφ = toRad(lat - latEnv);
  const Δλ = toRad(long - longEnv);

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

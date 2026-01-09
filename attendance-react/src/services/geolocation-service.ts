export const reverseGeocode = async (lat: number, long: number) => {
  if (lat === null || long === null) return null;

  const res = await fetch(
    `https://us1.locationiq.com/v1/reverse?key=${
      import.meta.env.VITE_GEOLOCATION_API_TOKEN
    }&lat=${lat}&lon=${long}&zoom=16&format=json`,
  );

  if (!res.ok) throw new Error('Failed to fetch address');

  const data = await res.json();
  return data.display_name as string;
};

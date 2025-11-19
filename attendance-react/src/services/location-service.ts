export const getLocationName = async (lat: number, lon: number) => {
  const response = await fetch(
    `https://us1.locationiq.com/v1/reverse?key=${
      import.meta.env.VITE_GEOLOCATION_API_TOKEN
    }&lat=${lat}&lon=${lon}&format=json`,
  );

  return response.json();
};

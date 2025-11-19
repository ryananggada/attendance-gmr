export const createFieldAttendance = async ({
  userId,
  date,
  customer,
  personInCharge,
  remarks,
  image,
  time,
  location,
}: {
  userId: number;
  date: Date;
  customer: string;
  personInCharge: string;
  remarks: string | null;
  image: File;
  time: string;
  location: { latitude: number; longitude: number };
}) => {
  const formData = new FormData();
  formData.append('userId', String(userId));
  formData.append(
    'date',
    date instanceof Date ? date.toISOString() : String(date),
  );
  formData.append('customer', customer);
  formData.append('personInCharge', personInCharge);
  if (remarks) {
    formData.append('remarks', remarks);
  }
  formData.append('image', image);
  formData.append('time', time);
  formData.append(
    'location',
    JSON.stringify([location.latitude, location.longitude]),
  );

  const response = await fetch(
    `${import.meta.env.VITE_NODE_URL}/field-attendances`,
    {
      method: 'POST',
      credentials: 'include',
      body: formData,
    },
  );

  return response.json();
};

export const getFieldAttendances = async (userId: number, date: string) => {
  const response = await fetch(
    `${
      import.meta.env.VITE_NODE_URL
    }/field-attendances?userId=${userId}&date=${date}`,
    {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );

  return response.json();
};

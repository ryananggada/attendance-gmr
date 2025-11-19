type CreateAttendanceType = {
  userId: number;
  date: Date;
  time: string;
  location: { latitude: number; longitude: number };
  image: File;
};

type LeaveType = {
  userId: number;
  date: Date;
  type: string;
  time: string;
  remarks?: string;
};

const baseUrl = `${import.meta.env.VITE_NODE_URL}/attendances`;

export const checkIn = async ({
  userId,
  date,
  time,
  location,
  image,
}: CreateAttendanceType) => {
  const formData = new FormData();
  formData.append('userId', String(userId));
  formData.append(
    'date',
    date instanceof Date ? date.toISOString() : String(date),
  );
  formData.append('time', time!);
  formData.append(
    'location',
    JSON.stringify([location!.latitude, location!.longitude]),
  );
  formData.append('image', image!);

  const response = await fetch(`${baseUrl}/check-in`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  return response.json();
};

export const fieldCheckIn = async ({
  userId,
  date,
  time,
  location,
  image,
}: CreateAttendanceType) => {
  const formData = new FormData();
  formData.append('userId', String(userId));
  formData.append(
    'date',
    date instanceof Date ? date.toISOString() : String(date),
  );
  formData.append('time', time!);
  formData.append(
    'location',
    JSON.stringify([location!.latitude, location!.longitude]),
  );
  formData.append('image', image!);

  const response = await fetch(`${baseUrl}/field-check-in`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  return response.json();
};

export const fieldCheckOut = async ({
  userId,
  date,
  time,
  location,
  image,
}: CreateAttendanceType) => {
  const formData = new FormData();
  formData.append('userId', String(userId));
  formData.append(
    'date',
    date instanceof Date ? date.toISOString() : String(date),
  );
  formData.append('time', time!);
  formData.append(
    'location',
    JSON.stringify([location!.latitude, location!.longitude]),
  );
  formData.append('image', image!);

  const response = await fetch(`${baseUrl}/field-check-out`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  return response.json();
};

export const checkOut = async ({
  userId,
  date,
  time,
  location,
  image,
}: CreateAttendanceType) => {
  const formData = new FormData();
  formData.append('userId', String(userId));
  formData.append(
    'date',
    date instanceof Date ? date.toISOString() : String(date),
  );
  formData.append('time', time);
  formData.append(
    'location',
    JSON.stringify([location.latitude, location.longitude]),
  );
  formData.append('image', image);

  const response = await fetch(`${baseUrl}/check-out`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  return response.json();
};

export const submitLeave = async ({
  userId,
  date,
  type,
  time,
  remarks,
}: LeaveType) => {
  const response = await fetch(`${baseUrl}/leave`, {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify({
      userId,
      date: date instanceof Date ? date.toISOString() : String(date),
      type,
      time,
      remarks,
    }),
  });

  return response.json();
};

export const submitEarlyLeave = async ({
  userId,
  date,
  type,
  time,
  remarks,
}: LeaveType) => {
  const response = await fetch(`${baseUrl}/leave`, {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify({
      userId,
      date: date instanceof Date ? date.toISOString() : String(date),
      type,
      time,
      remarks,
    }),
  });

  return response.json();
};

export const getSingleAttendance = async (userId: number, date: string) => {
  const response = await fetch(
    `${import.meta.env.VITE_NODE_URL}/attendances/user/${userId}?date=${date}`,
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

export const getAttendances = async (
  type: 'day' | 'month',
  inputDate: string,
) => {
  const response = await fetch(
    `${import.meta.env.VITE_NODE_URL}/attendances?${type}=${inputDate}`,
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

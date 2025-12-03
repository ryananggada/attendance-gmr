export const createUser = async ({
  fullName,
  username,
  password,
  confirmPassword,
  departmentId,
  role,
}: {
  fullName: string;
  username: string;
  password: string;
  confirmPassword: string;
  departmentId: number;
  role: 'User' | 'Admin';
}) => {
  const response = await fetch(`${import.meta.env.VITE_NODE_URL}/users`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fullName,
      username,
      password,
      confirmPassword,
      departmentId,
      role,
    }),
  });

  return response.json();
};

export const getUsers = async () => {
  const response = await fetch(`${import.meta.env.VITE_NODE_URL}/users`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return response.json();
};

export const getUserById = async (id: number) => {
  const response = await fetch(`${import.meta.env.VITE_NODE_URL}/users/${id}`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return response.json();
};

export const updateUser = async ({
  id,
  fullName,
  departmentId,
  role,
}: {
  id: number;
  fullName: string;
  departmentId: number;
  role: 'Admin' | 'User';
}) => {
  const response = await fetch(`${import.meta.env.VITE_NODE_URL}/users/${id}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fullName, departmentId, role }),
  });

  return response.json();
};

export const updatePassword = async ({
  id,
  password,
  confirmPassword,
}: {
  id: number;
  password: string;
  confirmPassword: string;
}) => {
  const response = await fetch(`${import.meta.env.VITE_NODE_URL}/users/${id}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ password, confirmPassword }),
  });

  return response.json();
};

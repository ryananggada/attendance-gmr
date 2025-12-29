export const createUser = async ({
  fullName,
  username,
  password,
  departmentId,
  role,
}: {
  fullName: string;
  username: string;
  password: string;
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
      departmentId,
      role,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.json();
    throw new Error(errorBody.message);
  }

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

  if (!response.ok) {
    const errorBody = await response.json();
    throw new Error(errorBody.message);
  }

  return response.json();
};

export const updatePassword = async ({
  id,
  password,
}: {
  id: number;
  password: string;
}) => {
  const response = await fetch(`${import.meta.env.VITE_NODE_URL}/users/${id}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ password }),
  });

  if (!response.ok) {
    const errorBody = await response.json();
    throw new Error(errorBody.message);
  }

  return response.json();
};

export const deleteUser = async (id: number) => {
  const response = await fetch(`${import.meta.env.VITE_NODE_URL}/users/${id}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorBody = await response.json();
    throw new Error(errorBody.message);
  }

  return response.json();
};

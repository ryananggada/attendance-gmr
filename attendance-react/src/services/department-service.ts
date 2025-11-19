export const createDepartment = async ({
  name,
  isField,
}: {
  name: string;
  isField: boolean;
}) => {
  const response = await fetch(`${import.meta.env.VITE_NODE_URL}/departments`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name,
      isField,
    }),
  });

  return response.json();
};

export const getDepartments = async () => {
  const response = await fetch(`${import.meta.env.VITE_NODE_URL}/departments`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return response.json();
};

export const getDepartmentById = async (id: number) => {
  const response = await fetch(
    `${import.meta.env.VITE_NODE_URL}/departments/${id}`,
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

export const updateDepartment = async ({
  id,
  name,
  isField,
}: {
  id: number;
  name: string;
  isField: boolean;
}) => {
  const response = await fetch(
    `${import.meta.env.VITE_NODE_URL}/departments/${id}`,
    {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, isField }),
    },
  );

  return response.json();
};

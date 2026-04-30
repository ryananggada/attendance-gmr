export async function deleteUploads() {
  const response = await fetch(
    `${import.meta.env.VITE_NODE_URL}/settings/uploads`,
    {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );

  if (!response.ok) {
    const errorBody = await response.json();
    throw new Error(errorBody.message);
  }

  return response.json();
}

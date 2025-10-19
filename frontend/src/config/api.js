const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const api = {
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${API_URL}/api/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Upload failed');
    }

    return response.json();
  },

  getOutfits: async () => {
    const response = await fetch(`${API_URL}/api/outfits`);
    if (!response.ok) throw new Error('Failed to fetch outfits');
    return response.json();
  },

  getOutfit: async (id) => {
    const response = await fetch(`${API_URL}/api/outfits/${id}`);
    if (!response.ok) throw new Error('Failed to fetch outfit');
    return response.json();
  },

  createOutfit: async (outfitData) => {
    const response = await fetch(`${API_URL}/api/outfits`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(outfitData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create outfit');
    }

    return response.json();
  },

  updateOutfit: async (id, outfitData) => {
    const response = await fetch(`${API_URL}/api/outfits/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(outfitData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update outfit');
    }

    return response.json();
  },

  deleteOutfit: async (id) => {
    const response = await fetch(`${API_URL}/api/outfits/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete outfit');
    }

    return response.json();
  },

  togglePublish: async (id, isPublished) => {
    const response = await fetch(`${API_URL}/api/outfits/${id}/publish`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ is_published: isPublished }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to toggle publish status');
    }

    return response.json();
  },
};

export default api;

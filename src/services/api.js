import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth API
export const authAPI = {
  getEntitlements: (accessToken) =>
    api.post('/auth/entitlements', { accessToken }),

  getUserId: (accessToken) =>
    api.get('/auth/user-id', { params: { accessToken } }),

  getUsername: (accessToken, entitlementsToken, userId, region) =>
    api.get('/auth/username', {
      params: { accessToken, entitlementsToken, userId, region },
    }),
};

// Valorant API
export const valorantAPI = {
  getShop: (data) => api.post('/valorant/shop', data),

  getBalances: (data) => api.post('/valorant/balances', data),

  getLoadout: (data) => api.post('/valorant/loadout', data),

  getProgress: (data) => api.post('/valorant/progress', data),

  getOwnedItems: (data) => api.post('/valorant/owned-items', data),
};

// User API
export const userAPI = {
  getUser: (riotId) => api.get(`/user/${riotId}`),
};

export default api;

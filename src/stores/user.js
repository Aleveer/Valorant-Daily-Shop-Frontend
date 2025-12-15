import { defineStore } from 'pinia';
import { defaultUser } from '../utils/valorant-api';

export const useUserStore = defineStore('user', {
  state: () => ({
    user: { ...defaultUser },
  }),
  persist: {
    key: 'user',
    storage: localStorage,
  },
  actions: {
    setUser(user) {
      this.user = user;
    },
  },
  getters: {
    defaultUser: () => defaultUser,
  },
});


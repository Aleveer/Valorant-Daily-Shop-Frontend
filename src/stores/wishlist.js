import { defineStore } from 'pinia';

export const useWishlistStore = defineStore('wishlist', {
  state: () => ({
    notificationEnabled: false,
    skinIds: [],
  }),
  persist: {
    key: 'wishlist',
    storage: localStorage,
  },
  actions: {
    setNotificationEnabled(value) {
      this.notificationEnabled = value;
    },
    toggleSkin(uuid) {
      if (this.skinIds.includes(uuid)) {
        this.skinIds = this.skinIds.filter((id) => id !== uuid);
      } else {
        this.skinIds.push(uuid);
      }
    },
  },
});


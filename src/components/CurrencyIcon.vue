<template>
  <span class="currency-icon">
    <img v-if="iconUrl" :src="iconUrl" :alt="icon" class="icon-img" />
    <span v-else class="icon-text">{{ iconText }}</span>
  </span>
</template>

<script>
export default {
  name: 'CurrencyIcon',
  props: {
    icon: {
      type: String,
      required: true,
    },
  },
  computed: {
    iconUrl() {
      const icons = {
        vp: 'https://media.valorant-api.com/currencies/85ad13f7-3d1b-5128-9eb2-7cd8ee0b5741/displayicon.png',
        rad: 'https://media.valorant-api.com/currencies/e59aa87c-4cbf-517a-5983-6e81511be9b7/displayicon.png',
        fag: 'https://media.valorant-api.com/currencies/f08d4ae3-939c-4576-ab26-09ce1f23bb37/displayicon.png',
        kc: 'https://media.valorant-api.com/currencies/85ca954a-41f2-ce94-9b45-8ca3dd39a00d/displayicon.png',
      };
      return icons[this.icon.toLowerCase()] || null;
    },
    iconText() {
      return this.icon.toUpperCase();
    },
  },
};
</script>

<style scoped>
.currency-icon {
  display: inline-flex;
  align-items: center;
  margin-left: 4px;
}

.icon-img {
  width: 16px;
  height: 16px;
  vertical-align: middle;
}

.icon-text {
  font-size: 0.875rem;
  font-weight: bold;
}

/* Responsive adjustments for mobile */
@media (max-width: 767px) {
  .icon-img {
    width: 20px;
    height: 20px;
  }

  .icon-text {
    font-size: 1rem;
  }
}
</style>


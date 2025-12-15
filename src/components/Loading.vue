<template>
  <div class="loading-container">
    <div class="spinner"></div>
    <p v-if="msg" class="loading-message">{{ msg }}</p>
  </div>
</template>

<script>
export default {
  name: 'Loading',
  props: {
    msg: {
      type: String,
      default: '',
    },
  },
};
</script>

<style scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  gap: 1rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fa4454;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-message {
  color: #ffffff;
  font-size: 1rem;
}
</style>


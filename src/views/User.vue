<template>
  <div class="user-page">
    <h1>User API Tester</h1>

    <div class="form-section">
      <h2>Get User</h2>
      <div class="form-group">
        <label>Riot ID:</label>
        <input
          v-model="userForm.riotId"
          type="text"
          placeholder="Nhập Riot ID"
        />
      </div>
      <button @click="getUser" :disabled="loading">
        {{ loading ? 'Đang xử lý...' : 'Get User' }}
      </button>
      <div v-if="userResult" class="result">
        <pre>{{ JSON.stringify(userResult, null, 2) }}</pre>
      </div>
    </div>

    <div v-if="error" class="error">{{ error }}</div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { userAPI } from '../services/api';

export default {
  name: 'User',
  setup() {
    const loading = ref(false);
    const error = ref('');
    const userResult = ref(null);

    const userForm = ref({
      riotId: '',
    });

    const getUser = async () => {
      loading.value = true;
      error.value = '';
      try {
        const response = await userAPI.getUser(userForm.value.riotId);
        userResult.value = response.data;
      } catch (err) {
        error.value = err.response?.data?.message || err.message;
        userResult.value = null;
      } finally {
        loading.value = false;
      }
    };

    return {
      loading,
      error,
      userForm,
      userResult,
      getUser,
    };
  },
};
</script>

<style scoped>
.user-page {
  padding: 2rem 0;
}

.user-page h1 {
  font-size: 2rem;
  margin-bottom: 2rem;
  color: #fa4454;
}

.form-section {
  background-color: #2a2a2a;
  border-radius: 8px;
  padding: 2rem;
  margin-bottom: 2rem;
  border: 1px solid #3a3a3a;
}

.form-section h2 {
  color: #fa4454;
  margin-bottom: 1.5rem;
  font-size: 1.3rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #cccccc;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  background-color: #1a1a1a;
  border: 1px solid #3a3a3a;
  border-radius: 4px;
  color: #ffffff;
  font-family: inherit;
  font-size: 1rem;
}

.form-group input:focus {
  outline: none;
  border-color: #fa4454;
}

button {
  background-color: #fa4454;
  color: #ffffff;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s;
}

button:hover:not(:disabled) {
  background-color: #d93a4a;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.result {
  margin-top: 1.5rem;
  padding: 1rem;
  background-color: #1a1a1a;
  border-radius: 4px;
  border: 1px solid #3a3a3a;
}

.result pre {
  color: #00ff00;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  overflow-x: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.error {
  background-color: #d32f2f;
  color: #ffffff;
  padding: 1rem;
  border-radius: 4px;
  margin-top: 1rem;
}
</style>

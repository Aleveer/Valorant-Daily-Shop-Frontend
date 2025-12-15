<template>
  <div class="valorant-page">
    <h1>Valorant API Tester</h1>

    <div class="form-section">
      <h2>Get Shop</h2>
      <div class="form-row">
        <div class="form-group">
          <label>Access Token:</label>
          <textarea
            v-model="shopForm.accessToken"
            placeholder="Nhập access token"
            rows="2"
          ></textarea>
        </div>
        <div class="form-group">
          <label>Entitlements Token:</label>
          <textarea
            v-model="shopForm.entitlementsToken"
            placeholder="Nhập entitlements token"
            rows="2"
          ></textarea>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>User ID:</label>
          <input
            v-model="shopForm.userId"
            type="text"
            placeholder="Nhập user ID"
          />
        </div>
        <div class="form-group">
          <label>Region:</label>
          <select v-model="shopForm.region">
            <option value="eu">EU</option>
            <option value="na">NA</option>
            <option value="ap">AP</option>
            <option value="kr">KR</option>
          </select>
        </div>
      </div>
      <button @click="getShop" :disabled="loading">
        {{ loading ? 'Đang xử lý...' : 'Get Shop' }}
      </button>
      <div v-if="shopResult" class="result">
        <pre>{{ JSON.stringify(shopResult, null, 2) }}</pre>
      </div>
    </div>

    <div class="form-section">
      <h2>Get Balances</h2>
      <div class="form-row">
        <div class="form-group">
          <label>Access Token:</label>
          <textarea
            v-model="balancesForm.accessToken"
            placeholder="Nhập access token"
            rows="2"
          ></textarea>
        </div>
        <div class="form-group">
          <label>Entitlements Token:</label>
          <textarea
            v-model="balancesForm.entitlementsToken"
            placeholder="Nhập entitlements token"
            rows="2"
          ></textarea>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>User ID:</label>
          <input
            v-model="balancesForm.userId"
            type="text"
            placeholder="Nhập user ID"
          />
        </div>
        <div class="form-group">
          <label>Region:</label>
          <select v-model="balancesForm.region">
            <option value="eu">EU</option>
            <option value="na">NA</option>
            <option value="ap">AP</option>
            <option value="kr">KR</option>
          </select>
        </div>
      </div>
      <button @click="getBalances" :disabled="loading">
        {{ loading ? 'Đang xử lý...' : 'Get Balances' }}
      </button>
      <div v-if="balancesResult" class="result">
        <pre>{{ JSON.stringify(balancesResult, null, 2) }}</pre>
      </div>
    </div>

    <div class="form-section">
      <h2>Get Loadout</h2>
      <div class="form-row">
        <div class="form-group">
          <label>Access Token:</label>
          <textarea
            v-model="loadoutForm.accessToken"
            placeholder="Nhập access token"
            rows="2"
          ></textarea>
        </div>
        <div class="form-group">
          <label>Entitlements Token:</label>
          <textarea
            v-model="loadoutForm.entitlementsToken"
            placeholder="Nhập entitlements token"
            rows="2"
          ></textarea>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>User ID:</label>
          <input
            v-model="loadoutForm.userId"
            type="text"
            placeholder="Nhập user ID"
          />
        </div>
        <div class="form-group">
          <label>Region:</label>
          <select v-model="loadoutForm.region">
            <option value="eu">EU</option>
            <option value="na">NA</option>
            <option value="ap">AP</option>
            <option value="kr">KR</option>
          </select>
        </div>
      </div>
      <button @click="getLoadout" :disabled="loading">
        {{ loading ? 'Đang xử lý...' : 'Get Loadout' }}
      </button>
      <div v-if="loadoutResult" class="result">
        <pre>{{ JSON.stringify(loadoutResult, null, 2) }}</pre>
      </div>
    </div>

    <div class="form-section">
      <h2>Get Progress</h2>
      <div class="form-row">
        <div class="form-group">
          <label>Access Token:</label>
          <textarea
            v-model="progressForm.accessToken"
            placeholder="Nhập access token"
            rows="2"
          ></textarea>
        </div>
        <div class="form-group">
          <label>Entitlements Token:</label>
          <textarea
            v-model="progressForm.entitlementsToken"
            placeholder="Nhập entitlements token"
            rows="2"
          ></textarea>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>User ID:</label>
          <input
            v-model="progressForm.userId"
            type="text"
            placeholder="Nhập user ID"
          />
        </div>
        <div class="form-group">
          <label>Region:</label>
          <select v-model="progressForm.region">
            <option value="eu">EU</option>
            <option value="na">NA</option>
            <option value="ap">AP</option>
            <option value="kr">KR</option>
          </select>
        </div>
      </div>
      <button @click="getProgress" :disabled="loading">
        {{ loading ? 'Đang xử lý...' : 'Get Progress' }}
      </button>
      <div v-if="progressResult" class="result">
        <pre>{{ JSON.stringify(progressResult, null, 2) }}</pre>
      </div>
    </div>

    <div class="form-section">
      <h2>Get Owned Items</h2>
      <div class="form-row">
        <div class="form-group">
          <label>Access Token:</label>
          <textarea
            v-model="ownedItemsForm.accessToken"
            placeholder="Nhập access token"
            rows="2"
          ></textarea>
        </div>
        <div class="form-group">
          <label>Entitlements Token:</label>
          <textarea
            v-model="ownedItemsForm.entitlementsToken"
            placeholder="Nhập entitlements token"
            rows="2"
          ></textarea>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>User ID:</label>
          <input
            v-model="ownedItemsForm.userId"
            type="text"
            placeholder="Nhập user ID"
          />
        </div>
        <div class="form-group">
          <label>Region:</label>
          <select v-model="ownedItemsForm.region">
            <option value="eu">EU</option>
            <option value="na">NA</option>
            <option value="ap">AP</option>
            <option value="kr">KR</option>
          </select>
        </div>
        <div class="form-group">
          <label>Item Type:</label>
          <input
            v-model="ownedItemsForm.itemType"
            type="text"
            placeholder="e7c63390-eda7-46e0-bb7a-a6abdacd2433"
          />
        </div>
      </div>
      <button @click="getOwnedItems" :disabled="loading">
        {{ loading ? 'Đang xử lý...' : 'Get Owned Items' }}
      </button>
      <div v-if="ownedItemsResult" class="result">
        <pre>{{ JSON.stringify(ownedItemsResult, null, 2) }}</pre>
      </div>
    </div>

    <div v-if="error" class="error">{{ error }}</div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { valorantAPI } from '../services/api';

export default {
  name: 'Valorant',
  setup() {
    const loading = ref(false);
    const error = ref('');
    const shopResult = ref(null);
    const balancesResult = ref(null);
    const loadoutResult = ref(null);
    const progressResult = ref(null);
    const ownedItemsResult = ref(null);

    const shopForm = ref({
      accessToken: '',
      entitlementsToken: '',
      userId: '',
      region: 'eu',
    });

    const balancesForm = ref({
      accessToken: '',
      entitlementsToken: '',
      userId: '',
      region: 'eu',
    });

    const loadoutForm = ref({
      accessToken: '',
      entitlementsToken: '',
      userId: '',
      region: 'eu',
    });

    const progressForm = ref({
      accessToken: '',
      entitlementsToken: '',
      userId: '',
      region: 'eu',
    });

    const ownedItemsForm = ref({
      accessToken: '',
      entitlementsToken: '',
      userId: '',
      region: 'eu',
      itemType: 'e7c63390-eda7-46e0-bb7a-a6abdacd2433',
    });

    const makeRequest = async (apiCall, resultRef) => {
      loading.value = true;
      error.value = '';
      try {
        const response = await apiCall();
        resultRef.value = response.data;
      } catch (err) {
        error.value = err.response?.data?.message || err.message;
        resultRef.value = null;
      } finally {
        loading.value = false;
      }
    };

    const getShop = () =>
      makeRequest(
        () => valorantAPI.getShop(shopForm.value),
        shopResult,
      );

    const getBalances = () =>
      makeRequest(
        () => valorantAPI.getBalances(balancesForm.value),
        balancesResult,
      );

    const getLoadout = () =>
      makeRequest(
        () => valorantAPI.getLoadout(loadoutForm.value),
        loadoutResult,
      );

    const getProgress = () =>
      makeRequest(
        () => valorantAPI.getProgress(progressForm.value),
        progressResult,
      );

    const getOwnedItems = () =>
      makeRequest(
        () => valorantAPI.getOwnedItems(ownedItemsForm.value),
        ownedItemsResult,
      );

    return {
      loading,
      error,
      shopForm,
      balancesForm,
      loadoutForm,
      progressForm,
      ownedItemsForm,
      shopResult,
      balancesResult,
      loadoutResult,
      progressResult,
      ownedItemsResult,
      getShop,
      getBalances,
      getLoadout,
      getProgress,
      getOwnedItems,
    };
  },
};
</script>

<style scoped>
.valorant-page {
  padding: 2rem 0;
}

.valorant-page h1 {
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

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
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

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  background-color: #1a1a1a;
  border: 1px solid #3a3a3a;
  border-radius: 4px;
  color: #ffffff;
  font-family: inherit;
  font-size: 1rem;
}

.form-group textarea {
  resize: vertical;
  font-family: 'Courier New', monospace;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
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
  margin-top: 0.5rem;
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
  max-height: 500px;
  overflow-y: auto;
}

.result pre {
  color: #00ff00;
  font-family: 'Courier New', monospace;
  font-size: 0.85rem;
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

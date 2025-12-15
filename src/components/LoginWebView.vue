<template>
  <div class="login-container">
    <Loading v-if="loading" :msg="loading" />
    <div v-else class="login-content">
      <div class="region-selector">
        <label for="region-select" class="region-label">
          {{ currentLang && ($t('select_region') || 'Select your region:') }}
        </label>
        <select
          id="region-select"
          v-model="selectedRegion"
          class="region-select"
          @change="saveRegion"
        >
          <option value="na">North America (NA)</option>
          <option value="eu">Europe (EU)</option>
          <option value="ap">Asia Pacific (AP)</option>
          <option value="kr">Korea (KR)</option>
        </select>
      </div>

      <button @click="redirectToLogin" class="login-btn">
        {{ currentLang && ($t('login_with_riot') || 'Login with Riot Games') }}
      </button>

      <div class="manual-token-section">
        <p class="manual-token-label">
          {{ currentLang && ($t('manual_token_label') || 'Or paste the URL from the redirect page:') }}
        </p>
        <input
          v-model="tokenUrl"
          type="text"
          :placeholder="currentLang && ($t('manual_token_placeholder') || 'Paste URL with access_token here...')"
          class="token-input"
          @keyup.enter="handleManualToken"
        />
        <button @click="handleManualToken" class="token-submit-btn">
          {{ currentLang && ($t('submit') || 'Submit') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/user';
import { getAccessTokenFromUri } from '../utils/misc';
import {
  defaultUser,
  getEntitlementsToken,
  getUserId,
  getUsername,
  getShop,
  getProgress,
  getBalances,
  getLoadout,
  getOwnedItemsForTypes,
} from '../utils/valorant-api';
import { loadAssets } from '../utils/valorant-assets';
import Loading from './Loading.vue';
import i18n from '../utils/localization';

// Riot Games only allows redirect to playvalorant.com/opt_in
const LOGIN_URL =
  'https://auth.riotgames.com/authorize?redirect_uri=https%3A%2F%2Fplayvalorant.com%2Fopt_in&client_id=play-valorant-web-prod&response_type=token%20id_token&nonce=1&scope=account%20openid';

export default {
  name: 'LoginWebView',
  components: {
    Loading,
  },
  setup() {
    const router = useRouter();
    const userStore = useUserStore();
    const loading = ref(null);
    const tokenUrl = ref('');
    const selectedRegion = ref(localStorage.getItem('region') || 'na');
    const currentLang = ref(i18n.language || 'en');

    const saveRegion = () => {
      localStorage.setItem('region', selectedRegion.value);
    };

    const redirectToLogin = () => {
      // Save region before redirecting
      saveRegion();
      // Redirect directly to Riot login - they will redirect to playvalorant.com/opt_in
      // User needs to copy the URL from that page and paste it here
      window.location.href = LOGIN_URL;
    };

    const handleManualToken = () => {
      if (!tokenUrl.value) return;
      if (tokenUrl.value.includes('access_token=')) {
        loading.value = i18n.t('fetching.assets');
        handleLoginWithUrl(tokenUrl.value);
      } else {
        alert('URL does not contain access_token. Please check the URL and try again.');
      }
    };

    const handleLoginWithUrl = async (url) => {
      if (!url.includes('access_token=')) return;
      
      try {
        const accessToken = getAccessTokenFromUri(url);
        await processLogin(accessToken);
      } catch (e) {
        console.error(e);
        loading.value = null;
      }
    };

    const processLogin = async (accessToken) => {
      try {
        // Get region from localStorage or use selected region
        let region = localStorage.getItem('region') || selectedRegion.value || 'na';
        
        // Validate region
        const validRegions = ['na', 'eu', 'ap', 'kr'];
        if (!validRegions.includes(region)) {
          region = 'na'; // Default to NA if invalid
        }

        loading.value = i18n.t('fetching.assets');
        await loadAssets();

        loading.value = i18n.t('fetching.entitlements_token');
        const entitlementsToken = await getEntitlementsToken(accessToken);

        loading.value = i18n.t('fetching.user_id');
        const userId = getUserId(accessToken);

        loading.value = i18n.t('fetching.username');
        const username = await getUsername(accessToken, entitlementsToken, userId, region);

          loading.value = i18n.t('fetching.storefront');
          const shops = await getShop(accessToken, entitlementsToken, region, userId);

          loading.value = i18n.t('fetching.progress');
          const progress = await getProgress(accessToken, entitlementsToken, region, userId);

          loading.value = i18n.t('fetching.balances');
          const balances = await getBalances(accessToken, entitlementsToken, region, userId);

          loading.value = i18n.t('fetching.loadout');
          const loadout = await getLoadout(accessToken, entitlementsToken, region, userId);

          loading.value = i18n.t('fetching.owned_items');
          const ownedItems = await getOwnedItemsForTypes(
            accessToken,
            entitlementsToken,
            region,
            userId,
            ['SkinLevel', 'Spray', 'Buddy', 'PlayerCard', 'PlayerTitle']
          );

          userStore.setUser({
            id: userId,
            name: username,
            region,
            shops,
            progress,
            balances,
            loadout,
            ownedItems,
          });

          // Store access token and entitlements token for future use
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('entitlementsToken', entitlementsToken);

        router.replace('/shop');
      } catch (e) {
        console.error(e);
        loading.value = null;
        router.replace('/auth');
      }
    };

    // Check if we're coming back from Riot login (if redirected back to this page)
    onMounted(() => {
      // react to language changes so template re-renders
      i18n.on('languageChanged', (lng) => {
        currentLang.value = lng;
      });

      // Check URL hash first (OAuth tokens are usually in hash)
      const hash = window.location.hash;
      const url = window.location.href;
      
      // Try hash first, then full URL
      const tokenUrl = hash || url;
      
      if (tokenUrl.includes('access_token=')) {
        loading.value = i18n.t('fetching.assets');
        handleLoginWithUrl(tokenUrl);
      }
    });

    onUnmounted(() => {
      i18n.off('languageChanged');
    });

    return {
      loading,
      tokenUrl,
      selectedRegion,
      saveRegion,
      redirectToLogin,
      handleManualToken,
      currentLang,
    };
  },
};
</script>

<style scoped>
.login-container {
  width: 100%;
  min-height: 60vh;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-content {
  text-align: center;
  padding: 1.4rem 1.6rem 1.6rem;
  max-width: 520px;
  width: 100%;
}

.login-content h2 {
  color: #fff;
  margin-bottom: 1rem;
  font-size: 2rem;
}

.login-content p {
  margin-bottom: 2rem;
  color: #ccc;
  font-size: 1.1rem;
}

.region-selector {
  margin-bottom: 1.4rem;
  text-align: left;
}

.region-label {
  display: block;
  color: #ccc;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  text-align: left;
}

.region-select {
  width: 100%;
  max-width: 300px;
  padding: 0.75rem;
  background-color: #2a2a2a;
  border: 1px solid #444;
  border-radius: 4px;
  color: #fff;
  font-size: 1rem;
  cursor: pointer;
  transition: border-color 0.2s;
}

.region-select:focus {
  outline: none;
  border-color: #fa4454;
}

.region-select option {
  background-color: #2a2a2a;
  color: #fff;
}

.manual-token-section {
  margin-top: 2rem;
  padding-top: 1.4rem;
  border-top: 1px solid #444;
}

.manual-token-label {
  color: #aaa;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.token-input {
  width: 100%;
  max-width: 600px;
  padding: 0.75rem;
  background-color: #2a2a2a;
  border: 1px solid #444;
  border-radius: 4px;
  color: #fff;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.token-input:focus {
  outline: none;
  border-color: #fa4454;
}

.token-submit-btn {
  padding: 0.75rem 1.5rem;
  background-color: #444;
  color: #ffffff;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.token-submit-btn:hover {
  background-color: #555;
}

.login-btn {
  padding: 1rem 2rem;
  background-color: #fa4454;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
}

.login-btn:hover {
  background-color: #d93a4a;
}
</style>


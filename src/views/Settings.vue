<template>
  <div class="settings-view">
    <header class="settings-header">
      <div>
        <p class="eyebrow">{{ $t('settings') || 'Settings' }}</p>
        <h2 class="title">{{ $t('account') || 'Account' }}</h2>
        <p class="subtitle">
          {{ $t('settings_description') || 'Manage your language and session for this device.' }}
        </p>
      </div>
    </header>

    <section class="settings-grid">
      <div class="settings-card">
        <div class="card-header">
          <div class="card-icon">🌐</div>
          <div class="card-text">
            <h3>{{ $t('language') || 'Language' }}</h3>
            <p class="card-subtext">
              {{ $t('language_hint') || 'Change the display language for the entire website.' }}
            </p>
          </div>
        </div>
        <div class="card-body">
          <select v-model="language" @change="changeLanguage" class="lang-select">
            <option value="en">{{ $t('language_en') || 'English' }}</option>
            <option value="vi">{{ $t('language_vi') || 'Vietnamese' }}</option>
          </select>
        </div>
      </div>

      <div class="settings-card">
        <div class="card-header">
          <div class="card-icon danger">🔒</div>
          <div class="card-text">
            <h3>{{ $t('account') || 'Account' }}</h3>
            <p class="card-subtext">
              {{ $t('logout_hint') || 'Clear local tokens and sign in with another Riot account.' }}
            </p>
          </div>
        </div>
        <div class="card-body">
          <button @click="logout" class="logout-btn">
            {{ $t('logout') || 'Logout' }}
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/user';
import { defaultUser } from '../utils/valorant-api';
import i18n from '../utils/localization';
import { ref } from 'vue';

export default {
  name: 'Settings',
  setup() {
    const router = useRouter();
    const userStore = useUserStore();

    const language = ref(localStorage.getItem('lang') || i18n.language || 'en');

    const changeLanguage = () => {
      const lang = language.value;
      i18n.changeLanguage(lang);
      localStorage.setItem('lang', lang);
      localStorage.removeItem('valorant_assets');
      window.location.reload();
    };

    const logout = () => {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('entitlementsToken');
      userStore.setUser({ ...defaultUser });
      router.push('/auth');
    };

    return {
      language,
      changeLanguage,
      logout,
    };
  },
};
</script>

<style scoped>
.settings-view {
  padding: 1.25rem 0.75rem 2rem;
  max-width: 900px;
  margin: 0 auto;
}

.settings-header {
  margin-bottom: 1.25rem;
}

.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 0.78rem;
  color: #fa4454;
  font-weight: 700;
  margin: 0 0 0.2rem;
}

.title {
  margin: 0.1rem 0 0.4rem;
  font-size: 1.5rem;
  color: #ffffff;
}

.subtitle {
  margin: 0;
  color: #b0b6c3;
  font-size: 0.9rem;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1rem;
}

.settings-card {
  background: linear-gradient(145deg, #2a2a2a 0%, #1b1b1b 100%);
  border-radius: 12px;
  padding: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.35);
}

.card-header {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.card-icon {
  width: 32px;
  height: 32px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.06);
  font-size: 1.1rem;
}

.card-icon.danger {
  background: rgba(250, 68, 84, 0.18);
}

.card-text h3 {
  margin: 0;
  color: #ffffff;
  font-size: 1rem;
}

.card-subtext {
  margin: 0.15rem 0 0;
  color: #a0a6b4;
  font-size: 0.85rem;
}

.card-body {
  margin-top: 0.25rem;
}

.settings-card label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #fff;
  cursor: pointer;
}

.lang-select {
  width: 100%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  padding: 0.55rem 0.75rem;
  color: #fff;
  outline: none;
  font-size: 0.9rem;
}

.logout-btn {
  padding: 0.5rem 1rem;
  background-color: #fa4454;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.logout-btn:hover {
  background-color: #d93a4a;
}

@media (max-width: 640px) {
  .settings-view {
    padding: 1rem 0.75rem 1.75rem;
  }

  .settings-grid {
    grid-template-columns: 1fr;
  }
}
</style>


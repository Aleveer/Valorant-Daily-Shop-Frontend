<template>
  <div class="auth-view">
    <div class="auth-lang-switch">
      <select v-model="selectedLanguage" @change="changeLanguage" class="lang-select">
        <option value="en">{{ $t('language_en') || 'English' }}</option>
        <option value="vi">{{ $t('language_vi') || 'Vietnamese' }}</option>
      </select>
    </div>

    <div class="auth-hero">
      <div class="hero-content">
        <p class="eyebrow">VShop</p>
        <h1 class="title">{{ $t('welcome_back') }}</h1>
        <p class="subtitle">
          {{ $t('welcome_back_info') }}
        </p>
      </div>
      <div class="hero-accent">
        <div class="accent-orb orb-1"></div>
        <div class="accent-orb orb-2"></div>
      </div>
    </div>

    <div class="auth-card">
      <LoginWebView />
    </div>
  </div>
</template>

<script>
import LoginWebView from '../components/LoginWebView.vue';
import i18n from '../utils/localization';

export default {
  name: 'Auth',
  components: {
    LoginWebView,
  },
  data() {
    return {
      selectedLanguage: localStorage.getItem('lang') || i18n.language || 'en',
    };
  },
  methods: {
    changeLanguage() {
      const lang = this.selectedLanguage;
      localStorage.setItem('lang', lang);
      i18n.changeLanguage(lang);
    },
  },
};
</script>

<style scoped>
.auth-view {
  min-height: 100vh;
  padding: 1.5rem 0.75rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.auth-lang-switch {
  position: fixed;
  top: 0.75rem;
  right: 0.75rem;
  z-index: 1000;
}

.auth-lang-switch .lang-select {
  padding: 0.4rem 0.8rem;
  border-radius: 999px;
  background: rgba(10, 10, 10, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.16);
  color: #ffffff;
  font-size: 0.85rem;
  outline: none;
  cursor: pointer;
  backdrop-filter: blur(8px);
}

.auth-lang-switch .lang-select:focus {
  border-color: #fa4454;
}

.auth-hero {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem 1.75rem;
  border-radius: 16px;
  background: linear-gradient(135deg, #1f1f1f 0%, #0f0f0f 100%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.45);
  overflow: hidden;
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 560px;
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
  font-size: 2rem;
  margin: 0.1rem 0 0.5rem;
  color: #ffffff;
  font-weight: 700;
  text-shadow: 0 3px 10px rgba(0, 0, 0, 0.6);
}

.subtitle {
  margin: 0;
  color: #c7c7c7;
  line-height: 1.6;
  max-width: 520px;
}

.hero-accent {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.accent-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(18px);
  opacity: 0.65;
}

.orb-1 {
  width: 220px;
  height: 220px;
  right: -40px;
  top: -40px;
  background: radial-gradient(circle, rgba(250, 68, 84, 0.55), transparent 70%);
}

.orb-2 {
  width: 260px;
  height: 260px;
  left: -60px;
  bottom: -60px;
  background: radial-gradient(circle, rgba(123, 215, 255, 0.45), transparent 70%);
}

.auth-card {
  border-radius: 16px;
  background: radial-gradient(circle at top left, rgba(250, 68, 84, 0.09), transparent 55%),
    radial-gradient(circle at bottom right, rgba(123, 215, 255, 0.08), transparent 55%),
    rgba(10, 10, 10, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow:
    0 12px 30px rgba(0, 0, 0, 0.45),
    inset 0 1px 0 rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(18px);
  padding: 1.5rem 1.75rem;
}

@media (max-width: 768px) {
  .auth-view {
    padding: 1.25rem 0.75rem 1.75rem;
  }

  .auth-hero {
    padding: 1.1rem 1.25rem;
  }

  .title {
    font-size: 1.6rem;
  }

  .subtitle {
    font-size: 0.95rem;
  }

  .auth-card {
    padding: 1.25rem 1.25rem;
  }
}
</style>

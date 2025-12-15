<template>
  <div id="app">
    <nav v-if="isAuthenticated" class="navbar">
      <div class="nav-container">
        <h1 class="nav-logo">VShop</h1>
        <div class="nav-links">
          <router-link to="/shop" class="nav-link">{{ $t('shop') }}</router-link>
          <router-link to="/bundles" class="nav-link">{{ $t('bundles') }}</router-link>
          <router-link to="/accessories" class="nav-link">{{ $t('accessories') }}</router-link>
          <router-link to="/night-market" class="nav-link">{{ $t('nightmarket') }}</router-link>
          <router-link to="/loadout" class="nav-link">{{ $t('loadout') }}</router-link>
          <router-link to="/owned-items" class="nav-link">{{ $t('owned_items') }}</router-link>
          <router-link to="/settings" class="nav-link">{{ $t('settings') }}</router-link>
        </div>
      </div>
    </nav>
    <main class="main-content">
      <router-view />
    </main>
    <MediaPopup />
  </div>
</template>

<script>
import { computed } from 'vue';
import { useUserStore } from './stores/user';
import MediaPopup from './components/MediaPopup.vue';

export default {
  name: 'App',
  components: {
    MediaPopup,
  },
  setup() {
    const userStore = useUserStore();
    const isAuthenticated = computed(() => !!userStore.user.id);

    return {
      isAuthenticated,
    };
  },
};
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell,
    sans-serif;
  background-color: #1a1a1a;
  color: #ffffff;
  min-height: 100vh;
}

#app {
  min-height: 100vh;
}

.navbar {
  position: sticky;
  top: 0;
  z-index: 20;
  margin-bottom: 1.25rem;
  background:
    linear-gradient(90deg, #fa4454 0%, #ff6b7a 30%, #22252f 100%);
  box-shadow:
    0 8px 22px rgba(0, 0, 0, 0.6),
    0 0 0 1px rgba(255, 255, 255, 0.04);
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0.35rem 0.9rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem;
}

@media (min-width: 768px) {
  .nav-container {
    max-width: 1100px;
  }
}

@media (min-width: 1024px) {
  .nav-container {
    max-width: 1200px;
  }
}

.nav-logo {
  position: relative;
  font-size: 1.2rem;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding-right: 0.5rem;
}

.nav-logo::after {
  content: '';
  position: absolute;
  right: -0.1rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1px;
  height: 18px;
  background: rgba(255, 255, 255, 0.35);
}

.nav-links {
  display: flex;
  gap: 0.25rem;
  flex-wrap: wrap;
}

.nav-link {
  color: #ffffff;
  text-decoration: none;
  padding: 0.35rem 0.85rem;
  border-radius: 999px;
  font-size: 0.85rem;
  position: relative;
  overflow: hidden;
  transition:
    color 0.18s ease-out,
    background-color 0.18s ease-out,
    transform 0.18s ease-out,
    box-shadow 0.18s ease-out;
}

@media (min-width: 768px) {
  .navbar {
    padding: 0.5rem 0;
    margin-bottom: 1.5rem;
  }

  .nav-container {
    padding: 0.4rem 1.1rem;
  }

  .nav-logo {
    font-size: 1.3rem;
  }

  .nav-links {
    gap: 0.5rem;
  }

  .nav-link {
    padding: 0.4rem 1rem;
    font-size: 0.9rem;
  }
}

@media (min-width: 1024px) {
  .navbar {
    padding: 0.75rem 0;
    margin-bottom: 2rem;
  }

  .nav-logo {
    font-size: 1.5rem;
  }

  .nav-link {
    font-size: 1rem;
  }
}

.nav-link:hover {
  background-color: rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.4);
}

.nav-link.router-link-active {
  background: rgba(0, 0, 0, 0.2);
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.22),
    0 8px 20px rgba(0, 0, 0, 0.55);
}

.main-content {
  width: 100%;
  padding: 0 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>

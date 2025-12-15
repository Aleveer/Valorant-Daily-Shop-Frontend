<template>
  <div class="bundles-view">
    <!-- Bundles Header -->
    <div class="bundles-header">
      <div class="bundles-header-content">
        <h1 class="bundles-title">{{ $t('bundles') || 'BUNDLES' }}</h1>
      </div>
    </div>

    <!-- Bundle Navigation Tabs -->
    <div v-if="localizedBundles.length > 1" class="bundles-nav">
      <div 
        class="bundles-nav-content"
        :style="{ gridTemplateColumns: `repeat(${Math.min(localizedBundles.length, 4)}, 1fr)` }"
      >
        <button
          v-for="(bundle, index) in localizedBundles"
          :key="`nav-${bundle.uuid}`"
          @click="switchBundle(index)"
          :class="['nav-tab', { active: activeBundleIndex === index }]"
        >
          <span class="nav-tab-text">{{ bundle.displayName }}</span>
          <span class="nav-tab-price">{{ bundle.price }} <CurrencyIcon icon="vp" /></span>
        </button>
      </div>
    </div>

    <!-- Bundles Content -->
    <div v-if="localizedBundles.length > 0" class="bundles-content">
      <transition name="bundle-fade" mode="out-in">
        <div
          v-if="currentBundle"
          :key="currentBundle.uuid"
          class="bundle-item-wrapper"
        >
          <div class="bundle-item">
            <div class="bundle-header">
              <h3 class="bundle-title">{{ currentBundle.displayName }}</h3>
              <div class="bundle-header-right">
                <p class="bundle-price">{{ currentBundle.price }} <CurrencyIcon icon="vp" /></p>
                <div class="bundle-countdown">
                  <Countdown :timestamp="getBundleTimestamp(activeBundleIndex)" />
                </div>
              </div>
            </div>
            <div class="bundle-banner">
              <img
                v-if="currentBundle.displayIcon"
                :src="currentBundle.displayIcon"
                :alt="currentBundle.displayName"
                class="banner-image"
              />
              <div v-else class="banner-placeholder">
                <span class="placeholder-icon">📦</span>
              </div>
            </div>
            <div class="bundle-items">
              <div
                v-for="(item, itemIndex) in currentBundle.items"
                :key="item.levels?.[0]?.uuid || item.uuid"
                class="bundle-skin-wrapper"
                :style="{ animationDelay: `${itemIndex * 0.1}s` }"
              >
                <div class="bundle-skin">
                  <div class="bundle-skin-header">
                    <p class="bundle-skin-name">{{ item.displayName }}</p>
                    <p v-if="item.price" class="bundle-skin-price">{{ item.price }} <CurrencyIcon icon="vp" /></p>
                  </div>
                  <div class="bundle-skin-image">
                    <img
                      v-if="getItemDisplayIcon(item)"
                      :src="getItemDisplayIcon(item)"
                      :alt="item.displayName"
                      class="skin-image"
                    />
                    <div v-else class="no-image">No Image</div>
                  </div>
                  <div v-if="hasLevelsOrChromas(item)" class="bundle-skin-actions">
                    <button @click="showLevels(item)" class="action-btn">{{ $t('levels') }}</button>
                    <button @click="showChromas(item)" class="action-btn">{{ $t('chromas') }}</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </div>

    <!-- Empty State -->
    <div v-else class="bundles-empty">
      <div class="empty-state-content">
        <h2 class="empty-state-title">{{ $t('noBundles') || 'No Bundles Available' }}</h2>
        <p class="empty-state-message">
          {{ $t('noBundlesMessage') || 'There are no bundles in the shop at the moment. Please check back later.' }}
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, ref, onMounted } from 'vue';
import { useUserStore } from '../stores/user';
import { useFeatureStore } from '../stores/feature';
import { useMediaPopupStore } from '../stores/mediaPopup';
import { getDisplayIcon } from '../utils/misc';
import CurrencyIcon from '../components/CurrencyIcon.vue';
import Countdown from '../components/Countdown.vue';
import { getAssets, loadAssets } from '../utils/valorant-assets';

export default {
  name: 'Bundles',
  components: {
    CurrencyIcon,
    Countdown,
  },
  setup() {
    const userStore = useUserStore();
    const featureStore = useFeatureStore();
    const mediaPopupStore = useMediaPopupStore();
    const activeBundleIndex = ref(0);
    const assetsTick = ref(0);

    const localizedBundles = computed(() => {
      assetsTick.value; // re-run after assets load

      const assets = getAssets();
      const skins = assets.skins || [];
      const bundles = userStore.user?.shops?.bundles || [];

      const resolveName = (item) => {
        const levelId = item?.levels?.[0]?.uuid || item?.uuid;
        if (!levelId) return item.displayName;
        const skin = skins.find((s) => s.levels?.some((l) => l.uuid === levelId));
        return skin?.displayName || item.displayName;
      };

      const resolveBundleItem = (item) => ({
        ...item,
        displayName: resolveName(item),
      });

      return bundles.map((bundle) => ({
        ...bundle,
        items: (bundle.items || []).map(resolveBundleItem),
      }));
    });

    const currentBundle = computed(() => {
      if (!localizedBundles.value || localizedBundles.value.length === 0) return null;
      return localizedBundles.value[activeBundleIndex.value] || localizedBundles.value[0];
    });

    const getBundleTimestamp = (index) => {
      const remainingSecs = userStore.user.shops.remainingSecs.bundles[index] || 0;
      return new Date().getTime() + remainingSecs * 1000;
    };

    const getItemDisplayIcon = (item) => {
      return getDisplayIcon(item, featureStore.screenshotModeEnabled);
    };

    const hasLevelsOrChromas = (item) => {
      return (
        item.levels &&
        (item.levels.length > 0 || (item.chromas && item.chromas.length > 0))
      );
    };

    const showLevels = (item) => {
      // Get all levels (up to 5 levels for guns/knives)
      if (!item.levels) return;
      
      const levels = item.levels
        .slice(0, 5)
        .map((level) => level.streamedVideo || level.displayIcon || '')
        .filter((url) => url && url.trim() !== '');

      if (levels.length > 0) {
        mediaPopupStore.showMediaPopup(levels, 'Levels');
      }
    };

    const showChromas = (item) => {
      // Get all chromas (dynamic, can be 0-4 or more)
      if (!item.chromas) return;
      
      const chromas = item.chromas
        .map((chroma) => chroma.streamedVideo || chroma.fullRender || '')
        .filter((url) => url && url.trim() !== '');

      if (chromas.length > 0) {
        mediaPopupStore.showMediaPopup(chromas, 'Chromas');
      }
    };

    const switchBundle = (index) => {
      if (index >= 0 && index < localizedBundles.value.length) {
        activeBundleIndex.value = index;
        const bundlesContent = document.querySelector('.bundles-content');
        if (bundlesContent) {
          bundlesContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    };

    onMounted(async () => {
      await loadAssets();
      assetsTick.value += 1;
    });

    return {
      user: userStore.user,
      localizedBundles,
      activeBundleIndex,
      currentBundle,
      getBundleTimestamp,
      getItemDisplayIcon,
      hasLevelsOrChromas,
      showLevels,
      showChromas,
      switchBundle,
    };
  },
};
</script>

<style scoped>
.bundles-view {
  min-height: 100vh;
  padding: 0.75rem 0.5rem;
  max-width: 100%;
  width: 100%;
  margin: 0 auto;
  background: transparent;
  box-sizing: border-box;
  overflow-x: hidden;
}

/* Bundles Header */
.bundles-header {
  margin-bottom: 1rem;
  animation: fadeIn 0.5s ease-in;
}

.bundles-header-content {
  background: linear-gradient(145deg, rgba(42, 42, 42, 0.95) 0%, rgba(31, 31, 31, 0.95) 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 0.6rem 0.8rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.2rem;
  flex-wrap: wrap;
}

.bundles-title {
  color: #ffffff;
  font-size: 1rem;
  font-weight: bold;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
}

/* Bundle Navigation */
.bundles-nav {
  position: sticky;
  top: 0;
  z-index: 100;
  margin-bottom: 1.5rem;
  animation: fadeIn 0.5s ease-in;
}

.bundles-nav-content {
  background: linear-gradient(145deg, rgba(42, 42, 42, 0.98) 0%, rgba(31, 31, 31, 0.98) 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 0.5rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(12px);
  display: grid;
  gap: 0.5rem;
  width: 100%;
  box-sizing: border-box;
}

.nav-tab {
  width: 100%;
  min-width: 0;
  padding: 0.75rem 1rem;
  background: linear-gradient(135deg, rgba(26, 26, 26, 0.8) 0%, rgba(15, 15, 15, 0.8) 100%);
  border: 1.5px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.25rem;
  position: relative;
  overflow: hidden;
  white-space: nowrap;
}

.nav-tab::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(250, 68, 84, 0.1), transparent);
  transition: left 0.5s ease;
}

.nav-tab:hover::before {
  left: 100%;
}

.nav-tab:hover {
  background: linear-gradient(135deg, rgba(42, 42, 42, 0.9) 0%, rgba(31, 31, 31, 0.9) 100%);
  border-color: rgba(250, 68, 84, 0.4);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(250, 68, 84, 0.2);
}

.nav-tab.active {
  background: linear-gradient(135deg, rgba(250, 68, 84, 0.15) 0%, rgba(217, 58, 74, 0.15) 100%);
  border-color: rgba(250, 68, 84, 0.6);
  box-shadow: 
    0 0 15px rgba(250, 68, 84, 0.3),
    inset 0 0 20px rgba(250, 68, 84, 0.05);
}

.nav-tab.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, transparent, #fa4454, transparent);
}

.nav-tab-text {
  color: #ffffff;
  font-size: 0.9rem;
  font-weight: 600;
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}

.nav-tab-price {
  color: #fa4454;
  font-size: 0.75rem;
  font-weight: bold;
  text-shadow: 0 0 8px rgba(250, 68, 84, 0.5);
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

/* Bundles Content */
.bundles-content {
  animation: fadeIn 0.5s ease-in;
}

.bundle-item-wrapper {
  margin-bottom: 2rem;
}

/* Bundle Transition Animation */
.bundle-fade-enter-active {
  transition: opacity 0.4s ease-in, transform 0.4s ease-in;
}

.bundle-fade-leave-active {
  transition: opacity 0.3s ease-out, transform 0.3s ease-out;
}

.bundle-fade-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.bundle-fade-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.bundle-item {
  background: linear-gradient(145deg, rgba(42, 42, 42, 0.95) 0%, rgba(31, 31, 31, 0.95) 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(8px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.bundle-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, transparent, #fa4454, transparent);
  opacity: 0;
  transition: opacity 0.3s;
}

.bundle-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 32px rgba(250, 68, 84, 0.3);
  border-color: rgba(250, 68, 84, 0.3);
}

.bundle-item:hover::before {
  opacity: 1;
}

.bundle-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.25rem;
  gap: 1rem;
  flex-wrap: wrap;
}

.bundle-header-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.75rem;
}

.bundle-title {
  color: #ffffff;
  font-size: 1.5rem;
  margin: 0;
  flex: 1;
  font-weight: 700;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
}

.bundle-price {
  color: #fa4454;
  font-weight: bold;
  font-size: 1.25rem;
  margin: 0;
  white-space: nowrap;
  text-shadow: 0 0 10px rgba(250, 68, 84, 0.5);
}

.bundle-countdown {
  display: flex;
  align-items: center;
}

.bundle-banner {
  width: 100%;
  max-height: 350px;
  overflow: hidden;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  background: linear-gradient(180deg, rgba(26, 26, 26, 0.9) 0%, rgba(15, 15, 15, 0.9) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.banner-image {
  width: 100%;
  height: auto;
  max-height: 350px;
  object-fit: contain;
  display: block;
  filter: drop-shadow(0 0 20px rgba(250, 68, 84, 0.2));
  transition: transform 0.3s;
}

.bundle-item:hover .banner-image {
  transform: scale(1.02);
}

.banner-placeholder {
  width: 100%;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.3);
}

.placeholder-icon {
  font-size: 3rem;
}

.bundle-items {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0.5rem;
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
}

.bundle-skin-wrapper {
  animation: slideIn 0.5s ease-out;
  animation-fill-mode: both;
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
}

.bundle-skin {
  background: linear-gradient(145deg, rgba(26, 26, 26, 0.8) 0%, rgba(15, 15, 15, 0.8) 100%);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  width: 100%;
  min-width: 0;
  max-width: 100%;
  box-sizing: border-box;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  height: 100%;
  overflow: hidden;
}

.bundle-skin:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(250, 68, 84, 0.2);
  border-color: rgba(250, 68, 84, 0.3);
}

.bundle-skin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  gap: 0.5rem;
}

.bundle-skin-name {
  color: #ffffff;
  font-size: 0.9rem;
  margin: 0;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
  text-align: left;
}

.bundle-skin-price {
  color: #fa4454;
  font-weight: bold;
  font-size: 0.85rem;
  margin: 0;
  white-space: nowrap;
  text-align: right;
}

.bundle-skin-image {
  width: 100%;
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, rgba(15, 15, 15, 0.9) 0%, rgba(10, 10, 10, 0.9) 100%);
  border-radius: 6px;
  margin-bottom: 0.75rem;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.05);
  flex-shrink: 0;
}

.skin-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  transition: transform 0.3s;
}

.bundle-skin:hover .skin-image {
  transform: scale(1.05);
}

.no-image {
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.875rem;
}

.bundle-skin-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: auto;
}

.action-btn {
  flex: 1;
  padding: 0.4rem 0.6rem;
  background: linear-gradient(135deg, rgba(250, 68, 84, 0.15) 0%, rgba(217, 58, 74, 0.15) 100%);
  color: #ffffff;
  border: 1.5px solid rgba(250, 68, 84, 0.3);
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 
    0 0 10px rgba(250, 68, 84, 0.2),
    inset 0 0 20px rgba(250, 68, 84, 0.05);
  backdrop-filter: blur(10px);
  z-index: 1;
}

.action-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s ease;
  z-index: -1;
}

.action-btn::after {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: 6px;
  background: linear-gradient(135deg, #fa4454, #ff6b7a, #fa4454);
  opacity: 0;
  transition: opacity 0.3s;
  z-index: -2;
  filter: blur(4px);
}

.action-btn:hover {
  background: linear-gradient(135deg, rgba(250, 68, 84, 0.3) 0%, rgba(255, 107, 122, 0.3) 100%);
  border-color: rgba(250, 68, 84, 0.8);
  box-shadow: 
    0 0 25px rgba(250, 68, 84, 0.6),
    0 4px 20px rgba(250, 68, 84, 0.4),
    inset 0 0 30px rgba(250, 68, 84, 0.15);
  transform: translateY(-2px);
}

.action-btn:hover::before {
  left: 100%;
}

.action-btn:hover::after {
  opacity: 0.6;
}

.action-btn:active {
  transform: translateY(0) scale(0.98);
  box-shadow: 
    0 0 15px rgba(250, 68, 84, 0.5),
    inset 0 2px 10px rgba(0, 0, 0, 0.3);
}

/* Empty State */
.bundles-empty {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  padding: 2rem;
  animation: fadeIn 0.5s ease-in;
}

.empty-state-content {
  text-align: center;
  max-width: 500px;
}

.empty-state-title {
  color: #ffffff;
  font-size: 1.75rem;
  font-weight: bold;
  margin-bottom: 1rem;
}

.empty-state-message {
  color: rgba(255, 255, 255, 0.7);
  font-size: 1rem;
  line-height: 1.6;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive adjustments */
@media (min-width: 768px) {
  .bundles-view {
    padding: 1rem 0.75rem;
  }

  .bundles-header-content {
    padding: 0.85rem 1.25rem;
  }

  .bundles-title {
    font-size: 1.35rem;
  }

  .bundles-nav-content {
    padding: 0.6rem;
    gap: 0.6rem;
  }

  .nav-tab {
    padding: 0.85rem 1.25rem;
  }

  .nav-tab-text {
    font-size: 1rem;
  }

  .nav-tab-price {
    font-size: 0.85rem;
  }

  .bundle-item {
    padding: 1.5rem;
  }

  .bundle-title {
    font-size: 1.75rem;
  }

  .bundle-price {
    font-size: 1.5rem;
  }

  .bundle-items {
    grid-template-columns: repeat(5, 1fr);
    gap: 0.6rem;
  }

  .bundle-skin-image {
    height: 220px;
  }

  .bundle-skin-name {
    font-size: 1rem;
  }

  .action-btn {
    font-size: 0.75rem;
    padding: 0.5rem 0.75rem;
  }
}

@media (min-width: 1024px) {
  .bundles-view {
    max-width: 95%;
    width: 95%;
    margin: 0 auto;
  }

  .bundle-items {
    grid-template-columns: repeat(5, 1fr);
  }

  .bundle-skin-image {
    height: 250px;
  }

  .bundle-banner {
    max-height: 400px;
  }

  .banner-image {
    max-height: 400px;
  }
}

@media (max-width: 767px) {
  .bundles-view {
    padding: 1rem 0.5rem;
  }

  .bundles-header {
    margin-bottom: 1.5rem;
  }

  .bundles-header-content {
    flex-direction: column;
    align-items: flex-start;
    padding: 1rem 1.25rem;
    gap: 1rem;
  }

  .bundles-title {
    font-size: 1.5rem;
    letter-spacing: 1px;
  }

  .bundles-nav {
    margin-bottom: 1rem;
  }

  .bundles-nav-content {
    padding: 0.4rem;
    gap: 0.4rem;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)) !important;
    max-width: 100%;
    overflow-x: auto;
  }

  .nav-tab {
    min-width: 150px;
    padding: 0.6rem 0.8rem;
  }

  .nav-tab-text {
    font-size: 0.85rem;
  }

  .nav-tab-price {
    font-size: 0.7rem;
  }

  .bundle-item {
    padding: 1rem;
    overflow: hidden;
  }

  .bundle-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .bundle-header-right {
    align-items: flex-start;
    width: 100%;
  }

  .bundle-title {
    font-size: 1.25rem;
  }

  .bundle-price {
    font-size: 1.1rem;
  }

  .bundle-items {
    grid-template-columns: repeat(3, 1fr);
    gap: 0.4rem;
  }

  .bundle-skin {
    padding: 0.5rem;
  }

  .bundle-skin-image {
    height: 120px;
  }

  .bundle-skin-name {
    font-size: 0.75rem;
  }

  .bundle-skin-price {
    font-size: 0.7rem;
  }

  .action-btn {
    font-size: 0.6rem;
    padding: 0.35rem 0.4rem;
    min-height: 2rem;
  }
}

@media (max-width: 640px) {
  .bundle-items {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.4rem;
  }

  .bundle-skin {
    padding: 0.5rem;
  }

  .bundle-skin-image {
    height: 120px;
  }

  .bundle-skin-name {
    font-size: 0.7rem;
  }

  .bundle-skin-price {
    font-size: 0.65rem;
  }

  .action-btn {
    font-size: 0.55rem;
    padding: 0.3rem 0.35rem;
    min-height: 1.75rem;
  }
}

@media (max-width: 480px) {
  .bundle-items {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.3rem;
  }

  .bundle-skin {
    padding: 0.4rem;
  }

  .bundle-skin-image {
    height: 100px;
  }

  .bundle-skin-header {
    margin-bottom: 0.5rem;
    gap: 0.3rem;
  }

  .bundle-skin-name {
    font-size: 0.65rem;
  }

  .bundle-skin-price {
    font-size: 0.6rem;
  }

  .bundle-skin-actions {
    gap: 0.3rem;
  }

  .action-btn {
    font-size: 0.5rem;
    padding: 0.25rem 0.3rem;
    min-height: 1.5rem;
  }
}
</style>


<template>
  <div class="night-market-view" ref="containerRef" :style="{ transform: `scale(${scaleValue})` }">
    <!-- Night Market Header -->
    <div class="night-market-header">
      <div class="night-market-header-content">
        <h1 class="night-market-title">{{ $t('nightMarket') || 'NIGHT MARKET' }}</h1>
        <div class="night-market-header-right">
          <button 
            v-if="!allRevealed"
            @click="revealAllItems" 
            class="reveal-all-btn"
          >
            {{ $t('revealAll') || 'REVEAL ALL' }}
          </button>
          <div class="night-market-countdown">
            <Countdown :timestamp="timestamp" />
          </div>
        </div>
      </div>
    </div>

    <!-- Night Market Content -->
    <div
      v-if="localizedNightMarket.length > 0"
      class="night-market-content"
    >
      <div class="night-market-items">
        <div
          v-for="(item, index) in localizedNightMarket"
          :key="item.uuid"
          class="night-market-item-wrapper"
          :style="{ animationDelay: `${index * 0.1}s` }"
        >
          <div class="night-market-item" :class="{ revealed: isRevealed(item.uuid) }">
            <!-- Reveal Overlay -->
            <transition name="reveal-fade">
              <div 
                v-if="!isRevealed(item.uuid)"
                @click="revealItem(item.uuid)"
                class="reveal-overlay"
              >
                <div class="reveal-icon-wrapper">
                  <span class="reveal-icon">?</span>
                </div>
              </div>
            </transition>

            <!-- Item Content -->
            <transition name="item-reveal">
              <div v-if="isRevealed(item.uuid)" class="item-content">
                <div class="item-header">
                  <h3 class="item-title">{{ item.displayName }}</h3>
                  <div class="discount-badge">-{{ item.discountPercent }}%</div>
                </div>
                
                <div class="item-image-container">
                  <img
                    v-if="getItemDisplayIcon(item)"
                    :src="getItemDisplayIcon(item)"
                    :alt="item.displayName"
                    class="item-image"
                    loading="lazy"
                  />
                  <div v-else class="no-image">
                    <span class="placeholder-icon">🔫</span>
                  </div>
                </div>

                <div class="item-footer">
                  <div class="prices">
                    <div class="price-group">
                      <span class="original-price">{{ item.price }} <CurrencyIcon icon="vp" /></span>
                      <span class="discounted-price">
                        {{ item.discountedPrice }} <CurrencyIcon icon="vp" />
                      </span>
                    </div>
                  </div>
                  
                  <div v-if="hasLevelsOrChromas(item)" class="item-actions">
                    <button @click="showLevels(item)" class="action-btn">{{ $t('levels') }}</button>
                    <button @click="showChromas(item)" class="action-btn">{{ $t('chromas') }}</button>
                  </div>
                </div>
              </div>
            </transition>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="night-market-empty">
      <div class="empty-state-content">
        <h2 class="empty-state-title">{{ $t('noNightMarket') || 'Night Market Not Available' }}</h2>
        <p class="empty-state-message">
          {{ $t('noNightMarketMessage') || 'The Night Market is not available at the moment. Please check back later.' }}
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useUserStore } from '../stores/user';
import { useFeatureStore } from '../stores/feature';
import { useMediaPopupStore } from '../stores/mediaPopup';
import { getDisplayIcon } from '../utils/misc';
import CurrencyIcon from '../components/CurrencyIcon.vue';
import Countdown from '../components/Countdown.vue';
import { getAssets, loadAssets } from '../utils/valorant-assets';

const STORAGE_KEY = 'night_market_revealed_items';

export default {
  name: 'NightMarket',
  components: {
    CurrencyIcon,
    Countdown,
  },
  setup() {
    const userStore = useUserStore();
    const featureStore = useFeatureStore();
    const mediaPopupStore = useMediaPopupStore();
    const revealedItems = ref(new Set());
    const scaleValue = ref(1);
    const containerRef = ref(null);
    const assetsTick = ref(0);

    // Load revealed items from localStorage on mount
    const loadRevealedItems = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const storedArray = JSON.parse(stored);
          if (Array.isArray(storedArray)) {
            revealedItems.value = new Set(storedArray);
          }
        }
      } catch (error) {
        console.error('Error loading revealed items from localStorage:', error);
      }
    };

    // Save revealed items to localStorage
    const saveRevealedItems = () => {
      try {
        const itemsArray = Array.from(revealedItems.value);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(itemsArray));
      } catch (error) {
        console.error('Error saving revealed items to localStorage:', error);
      }
    };

    // Scale giống loadout (không thu nhỏ), giữ 3 items mỗi hàng
    const calculateScale = () => {
      scaleValue.value = 1;
    };

    // Localized Night Market items based on current assets language
    const localizedNightMarket = computed(() => {
      assetsTick.value; // ensure recompute after assets load

      const assets = getAssets();
      const skins = assets.skins || [];
      const list = userStore.user?.shops?.nightMarket || [];

      const findSkinName = (item) => {
        const levelId = item?.levels?.[0]?.uuid || item?.uuid;
        if (!levelId) return item.displayName;
        const skin = skins.find((s) => s.levels?.some((l) => l.uuid === levelId));
        return skin?.displayName || item.displayName;
      };

      return list.map((item) => ({
        ...item,
        displayName: findSkinName(item),
      }));
    });

    // Load on mount
    onMounted(async () => {
      loadRevealedItems();
      calculateScale();

      await loadAssets();
      assetsTick.value += 1;
      
      // Recalculate on resize
      window.addEventListener('resize', calculateScale);
    });

    onUnmounted(() => {
      window.removeEventListener('resize', calculateScale);
    });

    const timestamp = computed(() => {
      return new Date().getTime() + userStore.user.shops.remainingSecs.nightMarket * 1000;
    });

    const isRevealed = (uuid) => {
      return revealedItems.value.has(uuid);
    };

    const allRevealed = computed(() => {
      const list = localizedNightMarket.value;
      if (!list || list.length === 0) return false;
      return list.every((item) => revealedItems.value.has(item.uuid));
    });

    const getItemDisplayIcon = (item) => {
      if (!item) return null;
      try {
        return getDisplayIcon(item, featureStore.screenshotModeEnabled);
      } catch (error) {
        console.error('Error getting display icon for item:', item, error);
        return null;
      }
    };

    const hasLevelsOrChromas = (item) => {
      return (
        item.levels &&
        (item.levels.length > 0 || (item.chromas && item.chromas.length > 0))
      );
    };

    const showLevels = (item) => {
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
      if (!item.chromas) return;
      
      const chromas = item.chromas
        .map((chroma) => chroma.streamedVideo || chroma.fullRender || '')
        .filter((url) => url && url.trim() !== '');

      if (chromas.length > 0) {
        mediaPopupStore.showMediaPopup(chromas, 'Chromas');
      }
    };

    const revealItem = (uuid) => {
      revealedItems.value.add(uuid);
      saveRevealedItems();
    };

    const revealAllItems = () => {
      const list = localizedNightMarket.value;
      if (list && list.length) {
        list.forEach((item) => {
          revealedItems.value.add(item.uuid);
        });
        saveRevealedItems();
      }
    };

    return {
      user: userStore.user,
      timestamp,
      revealedItems,
      isRevealed,
      allRevealed,
      localizedNightMarket,
      getItemDisplayIcon,
      hasLevelsOrChromas,
      showLevels,
      showChromas,
      revealItem,
      revealAllItems,
      scaleValue,
      containerRef,
    };
  },
};
</script>

<style scoped>
.night-market-view {
  min-height: 100vh;
  padding: 0.75rem 0.5rem;
  max-width: 100%;
  width: 100%;
  margin: 0 auto;
  background: transparent;
  box-sizing: border-box;
  overflow-x: hidden;
  transform-origin: top center;
}

/* Night Market Header */
.night-market-header {
  margin-bottom: 1rem;
  animation: fadeIn 0.5s ease-in;
}

.night-market-header-content {
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

.night-market-title {
  color: #ffffff;
  font-size: 1rem;
  font-weight: bold;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
}

.night-market-header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.night-market-countdown {
  display: flex;
  align-items: center;
}

.reveal-all-btn {
  padding: 0.5rem 1.25rem;
  background: linear-gradient(135deg, rgba(250, 68, 84, 0.2) 0%, rgba(217, 58, 74, 0.2) 100%);
  color: #ffffff;
  border: 1.5px solid rgba(250, 68, 84, 0.5);
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 
    0 0 10px rgba(250, 68, 84, 0.2),
    inset 0 0 20px rgba(250, 68, 84, 0.05);
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
}

.reveal-all-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s ease;
}

.reveal-all-btn:hover {
  background: linear-gradient(135deg, rgba(250, 68, 84, 0.3) 0%, rgba(255, 107, 122, 0.3) 100%);
  border-color: rgba(250, 68, 84, 0.8);
  box-shadow: 
    0 0 25px rgba(250, 68, 84, 0.6),
    0 4px 20px rgba(250, 68, 84, 0.4),
    inset 0 0 30px rgba(250, 68, 84, 0.15);
  transform: translateY(-2px);
}

.reveal-all-btn:hover::before {
  left: 100%;
}

.reveal-all-btn:active {
  transform: translateY(0) scale(0.98);
}

/* Night Market Content */
.night-market-content {
  animation: fadeIn 0.5s ease-in;
}

/* Night Market Items */
.night-market-items {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  width: 100%;
  box-sizing: border-box;
}

.night-market-item-wrapper {
  animation: slideIn 0.6s ease-out;
  animation-fill-mode: both;
}

.night-market-item {
  background: linear-gradient(145deg, rgba(42, 42, 42, 0.95) 0%, rgba(31, 31, 31, 0.95) 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(8px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 360px;
}

/* Reveal Overlay */
.reveal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(145deg, rgba(26, 26, 26, 0.98) 0%, rgba(15, 15, 15, 0.98) 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  backdrop-filter: blur(8px);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.reveal-overlay:hover {
  background: linear-gradient(145deg, rgba(42, 42, 42, 0.98) 0%, rgba(31, 31, 31, 0.98) 100%);
  box-shadow: inset 0 0 60px rgba(250, 68, 84, 0.2);
}

.reveal-icon-wrapper {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(250, 68, 84, 0.2) 0%, rgba(217, 58, 74, 0.2) 100%);
  border: 3px solid rgba(250, 68, 84, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  animation: rotate 3s linear infinite;
  box-shadow: 
    0 0 30px rgba(250, 68, 84, 0.4),
    inset 0 0 30px rgba(250, 68, 84, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.reveal-overlay:hover .reveal-icon-wrapper {
  transform: scale(1.1);
  box-shadow: 
    0 0 40px rgba(250, 68, 84, 0.6),
    inset 0 0 40px rgba(250, 68, 84, 0.2);
}

.reveal-icon {
  font-size: 4.8rem;
  font-weight: bold;
  color: #fa4454;
  text-shadow: 
    0 0 20px rgba(250, 68, 84, 0.8),
    0 0 40px rgba(250, 68, 84, 0.6);
  animation: pulse-icon 1.5s ease-in-out infinite;
  position: relative;
  z-index: 1;
}

.item-content {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.night-market-item::before {
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

.night-market-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 32px rgba(250, 68, 84, 0.3);
  border-color: rgba(250, 68, 84, 0.3);
}

.night-market-item:hover::before {
  opacity: 1;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
  gap: 0.5rem;
}

.item-title {
  color: #ffffff;
  font-size: 1.05rem;
  font-weight: 600;
  margin: 0;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.4;
}

.discount-badge {
  background: linear-gradient(135deg, #fa4454 0%, #d93a4a 100%);
  color: #ffffff;
  padding: 0.3rem 0.6rem;
  border-radius: 6px;
  font-weight: bold;
  font-size: 0.85rem;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(250, 68, 84, 0.4);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.item-image-container {
  width: 100%;
  flex: 1;
  min-height: 240px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, rgba(26, 26, 26, 0.9) 0%, rgba(15, 15, 15, 0.9) 100%);
  border-radius: 8px;
  margin-bottom: 0.75rem;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.05);
  position: relative;
}

.item-image {
  max-width: 90%;
  max-height: 90%;
  object-fit: contain;
  transition: transform 0.3s;
}

.night-market-item:hover .item-image {
  transform: scale(1.05);
}

.no-image {
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.placeholder-icon {
  font-size: 3rem;
}

.item-footer {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.prices {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.price-group {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.45rem;
}

.original-price {
  text-decoration: line-through;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.9rem;
}

.discounted-price {
  color: #fa4454;
  font-weight: bold;
  font-size: 1.2rem;
  text-shadow: 0 0 10px rgba(250, 68, 84, 0.5);
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.item-actions {
  display: flex;
  gap: 0.4rem;
}

.action-btn {
  flex: 1;
  padding: 0.55rem 0.8rem;
  background: linear-gradient(135deg, rgba(250, 68, 84, 0.15) 0%, rgba(217, 58, 74, 0.15) 100%);
  color: #ffffff;
  border: 1.5px solid rgba(250, 68, 84, 0.3);
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
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

.action-btn:active {
  transform: translateY(0) scale(0.98);
}

/* Empty State */
.night-market-empty {
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

/* Animations */
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
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.3;
  }
  50% {
    opacity: 0.6;
  }
}

@keyframes pulse-icon {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.reveal-fade-leave-active {
  transition: opacity 0.4s ease-out, transform 0.4s ease-out;
}

.reveal-fade-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

.item-reveal-enter-active {
  transition: opacity 0.5s ease-in, transform 0.5s ease-in;
  transition-delay: 0.2s;
}

.item-reveal-enter-from {
  opacity: 0;
  transform: scale(0.95) translateY(10px);
}

.item-reveal-enter-to {
  opacity: 1;
  transform: scale(1) translateY(0);
}

/* Responsive adjustments */
@media (min-width: 768px) {
  .night-market-view {
    padding: 1rem 0.75rem;
  }

  .night-market-header-content {
    padding: 0.85rem 1.25rem;
  }

  .night-market-title {
    font-size: 1.35rem;
  }

  .night-market-items {
    grid-template-columns: repeat(3, 1fr);
    gap: 1.25rem;
  }

  .night-market-item {
    padding: 1rem;
  }

  .item-image-container {
    min-height: 220px;
  }

  .item-title {
    font-size: 1rem;
  }

  .discounted-price {
    font-size: 1.25rem;
  }

  .action-btn {
    font-size: 0.75rem;
    padding: 0.5rem 0.75rem;
  }
}

@media (min-width: 1024px) {
  .night-market-view {
    max-width: 95%;
    width: 95%;
    margin: 0 auto;
  }

  .night-market-items {
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
  }

  .item-image-container {
    min-height: 240px;
  }
}

@media (min-width: 1920px) {
  .night-market-items {
    grid-template-columns: repeat(6, 1fr);
    gap: 1rem;
  }
}

@media (max-width: 767px) {
  .night-market-view {
    padding: 1rem 0.5rem;
  }

  .night-market-header {
    margin-bottom: 1.5rem;
  }

  .night-market-header-content {
    flex-direction: column;
    align-items: flex-start;
    padding: 1rem 1.25rem;
    gap: 1rem;
  }

  .night-market-title {
    font-size: 1.5rem;
    letter-spacing: 1px;
  }

  .reveal-button {
    padding: 2rem 2.5rem;
  }

  .reveal-icon-wrapper {
    width: 100px;
    height: 100px;
  }

  .reveal-icon {
    font-size: 4rem;
  }

  .reveal-text {
    font-size: 1.25rem;
  }

  .night-market-items {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }

  .night-market-item {
    padding: 0.75rem;
  }

  .item-image-container {
    min-height: 150px;
  }

  .item-title {
    font-size: 0.85rem;
  }

  .discounted-price {
    font-size: 1rem;
  }

  .action-btn {
    font-size: 0.65rem;
    padding: 0.4rem 0.5rem;
  }
}

@media (max-width: 640px) {
  .night-market-items {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  .item-image-container {
    min-height: 180px;
  }
}
</style>

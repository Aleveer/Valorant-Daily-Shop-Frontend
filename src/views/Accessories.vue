<template>
  <div class="accessories-view">
    <!-- Accessories Header -->
    <div class="accessories-header">
      <div class="accessories-header-content">
        <h1 class="accessories-title">{{ $t('accessories') || 'ACCESSORIES' }}</h1>
        <div class="accessories-countdown">
          <Countdown :timestamp="timestamp" />
        </div>
      </div>
    </div>

    <!-- Accessories Content -->
    <div v-if="localizedAccessories.length > 0" class="accessories-content">
      <div class="accessories-items">
        <div
          v-for="(item, index) in localizedAccessories"
          :key="item.uuid"
          class="accessory-item-wrapper"
          :style="{ animationDelay: `${index * 0.1}s` }"
        >
          <div class="accessory-item">
            <div class="accessory-image-container">
              <img
                v-if="item.displayIcon"
                :src="item.displayIcon"
                :alt="item.displayName"
                class="accessory-image"
                loading="lazy"
              />
              <div v-else class="accessory-placeholder">
                <span class="placeholder-icon">🎨</span>
              </div>
            </div>
            <div class="accessory-info">
              <h3 class="accessory-name">{{ item.displayName }}</h3>
              <p class="accessory-price">{{ item.price }} <CurrencyIcon icon="kc" /></p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="accessories-empty">
      <div class="empty-state-content">
        <h2 class="empty-state-title">{{ $t('noAccessories') || 'No Accessories Available' }}</h2>
        <p class="empty-state-message">
          {{ $t('noAccessoriesMessage') || 'There are no accessories in the shop at the moment. Please check back later.' }}
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, onMounted, ref } from 'vue';
import { useUserStore } from '../stores/user';
import CurrencyIcon from '../components/CurrencyIcon.vue';
import Countdown from '../components/Countdown.vue';
import { getAssets, loadAssets } from '../utils/valorant-assets';

export default {
  name: 'Accessories',
  components: {
    CurrencyIcon,
    Countdown,
  },
  setup() {
    const userStore = useUserStore();
    const assetsReady = ref(false);
    const assetsTick = ref(0);

    const timestamp = computed(() => {
      return new Date().getTime() + userStore.user.shops.remainingSecs.accessory * 1000;
    });

    const localizedAccessories = computed(() => {
      // re-compute when assets loaded
      assetsTick.value;

      const assets = getAssets();
      const buddies = assets.buddies || [];
      const cards = assets.cards || [];
      const titles = assets.titles || [];
      const sprays = assets.sprays || [];
      const accessories = userStore.user?.shops?.accessory || [];

      const resolveName = (item) => {
        const id = item.uuid || item.displayName;
        const buddy = buddies.find((b) => b.levels?.[0]?.uuid === id);
        if (buddy) return buddy.displayName || item.displayName;
        const card = cards.find((c) => c.uuid === id);
        if (card) return card.displayName || item.displayName;
        const title = titles.find((t) => t.uuid === id);
        if (title) return title.titleText || item.displayName;
        const spray = sprays.find((s) => s.uuid === id);
        if (spray) return spray.displayName || item.displayName;
        return item.displayName;
      };

      const resolveIcon = (item) => {
        const id = item.uuid || item.displayName;
        const buddy = buddies.find((b) => b.levels?.[0]?.uuid === id);
        if (buddy) return buddy.levels?.[0]?.displayIcon || buddy.displayIcon;
        const card = cards.find((c) => c.uuid === id);
        if (card) return card.largeArt || card.displayIcon;
        const title = titles.find((t) => t.uuid === id);
        if (title) return null;
        const spray = sprays.find((s) => s.uuid === id);
        if (spray) return spray.fullTransparentIcon || spray.displayIcon;
        return item.displayIcon;
      };

      return accessories.map((item) => ({
        ...item,
        displayName: resolveName(item),
        displayIcon: resolveIcon(item),
      }));
    });

    onMounted(async () => {
      try {
        await loadAssets();
        assetsTick.value += 1;
      } finally {
        assetsReady.value = true;
      }
    });

    return {
      user: userStore.user,
      assetsReady,
      timestamp,
      localizedAccessories,
    };
  },
};
</script>

<style scoped>
.accessories-view {
  min-height: 100vh;
  padding: 0.75rem 0.5rem;
  max-width: 100%;
  width: 100%;
  margin: 0 auto;
  background: transparent;
  box-sizing: border-box;
  overflow-x: hidden;
}

/* Accessories Header */
.accessories-header {
  margin-bottom: 1rem;
  animation: fadeIn 0.5s ease-in;
}

.accessories-header-content {
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

.accessories-title {
  color: #ffffff;
  font-size: 1rem;
  font-weight: bold;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
}

.accessories-countdown {
  display: flex;
  align-items: center;
}

/* Accessories Content */
.accessories-content {
  animation: fadeIn 0.5s ease-in;
}

.accessories-items {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  width: 100%;
  box-sizing: border-box;
}

.accessory-item-wrapper {
  animation: slideIn 0.5s ease-out;
  animation-fill-mode: both;
}

.accessory-item {
  background: linear-gradient(145deg, rgba(42, 42, 42, 0.95) 0%, rgba(31, 31, 31, 0.95) 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(8px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.accessory-item::before {
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

.accessory-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 32px rgba(250, 68, 84, 0.3);
  border-color: rgba(250, 68, 84, 0.3);
}

.accessory-item:hover::before {
  opacity: 1;
}

.accessory-image-container {
  width: 100%;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, rgba(26, 26, 26, 0.9) 0%, rgba(15, 15, 15, 0.9) 100%);
  border-radius: 8px;
  margin-bottom: 1rem;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.05);
  position: relative;
}

.accessory-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  transition: transform 0.3s;
}

.accessory-item:hover .accessory-image {
  transform: scale(1.05);
}

.accessory-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.3);
  font-size: 3rem;
}

.placeholder-icon {
  font-size: 3rem;
}

.accessory-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
}

.accessory-name {
  color: #ffffff;
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.4;
  min-height: 2.8em;
}

.accessory-price {
  color: #fa4454;
  font-weight: bold;
  font-size: 1.1rem;
  margin: 0;
  text-align: center;
  text-shadow: 0 0 10px rgba(250, 68, 84, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
}

/* Empty State */
.accessories-empty {
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
  .accessories-view {
    padding: 1rem 0.75rem;
  }

  .accessories-header-content {
    padding: 0.85rem 1.25rem;
  }

  .accessories-title {
    font-size: 1.35rem;
  }

  .accessories-items {
    grid-template-columns: repeat(4, 1fr);
    gap: 1.25rem;
  }

  .accessory-item {
    padding: 1.25rem;
  }

  .accessory-image-container {
    height: 220px;
  }

  .accessory-name {
    font-size: 1.1rem;
  }

  .accessory-price {
    font-size: 1.25rem;
  }
}

@media (min-width: 1024px) {
  .accessories-view {
    max-width: 95%;
    width: 95%;
    margin: 0 auto;
  }

  .accessories-items {
    grid-template-columns: repeat(4, 1fr);
    gap: 1.5rem;
  }

  .accessory-image-container {
    height: 240px;
  }
}

@media (max-width: 767px) {
  .accessories-view {
    padding: 1rem 0.5rem;
  }

  .accessories-header {
    margin-bottom: 1.5rem;
  }

  .accessories-header-content {
    flex-direction: column;
    align-items: flex-start;
    padding: 1rem 1.25rem;
    gap: 1rem;
  }

  .accessories-title {
    font-size: 1.5rem;
    letter-spacing: 1px;
  }

  .accessories-items {
    grid-template-columns: repeat(4, 1fr);
    gap: 0.75rem;
  }

  .accessory-item {
    padding: 0.75rem;
  }

  .accessory-image-container {
    height: 150px;
  }

  .accessory-name {
    font-size: 0.9rem;
  }

  .accessory-price {
    font-size: 1rem;
  }
}

@media (max-width: 640px) {
  .accessories-items {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
  }

  .accessory-image-container {
    height: 120px;
  }

  .accessory-name {
    font-size: 0.85rem;
  }

  .accessory-price {
    font-size: 0.9rem;
  }
}
</style>

<template>
  <div class="shop-view">
    <!-- Shop Header -->
    <div class="shop-header">
      <div class="shop-header-content">
        <h1 class="shop-title">{{ $t('shop') || 'SHOP' }}</h1>
        <div class="shop-countdown">
          <Countdown :timestamp="timestamp" />
        </div>
      </div>
    </div>

    <!-- Shop Items -->
    <div
      v-if="user.shops && user.shops.main && user.shops.main.length > 0"
      class="shop-content"
    >
      <div class="shop-items">
        <div
          v-for="(item, index) in localizedMain"
          :key="item.uuid"
          class="shop-item-wrapper"
          :style="{ animationDelay: `${index * 0.1}s` }"
        >
          <ShopItem :item="item" />
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="shop-empty">
      <div class="empty-state-content">
        <h2 class="empty-state-title">{{ $t('noItems') || 'No Items Available' }}</h2>
        <p class="empty-state-message">
          {{ $t('noItemsMessage') || 'There are no items in the shop at the moment. Please check back later.' }}
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, onMounted, ref } from 'vue';
import { useUserStore } from '../stores/user';
import ShopItem from '../components/ShopItem.vue';
import Countdown from '../components/Countdown.vue';
import { getAssets, loadAssets } from '../utils/valorant-assets';

export default {
  name: 'Shop',
  components: {
    ShopItem,
    Countdown,
  },
  setup() {
    const userStore = useUserStore();
    const assetsReady = ref(false);
    const assetsTick = ref(0);

    const timestamp = computed(() => {
      return new Date().getTime() + userStore.user.shops.remainingSecs.main * 1000;
    });

    const localizedMain = computed(() => {
      assetsTick.value; // re-run after assets load

      const assets = getAssets();
      const skins = assets.skins || [];
      if (!userStore.user?.shops?.main) return [];

      const findSkinName = (item) => {
        const levelId = item?.levels?.[0]?.uuid || item?.uuid;
        if (!levelId) return item.displayName;
        const skin = skins.find((s) => s.levels?.some((l) => l.uuid === levelId));
        return skin?.displayName || item.displayName;
      };

      return userStore.user.shops.main.map((item) => ({
        ...item,
        displayName: findSkinName(item),
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
      localizedMain,
    };
  },
};
</script>

<style scoped>
.shop-view {
  min-height: 100vh;
  padding: 0.75rem 0.5rem;
  max-width: 100%;
  width: 100%;
  margin: 0 auto;
  background: transparent;
  box-sizing: border-box;
  overflow-x: hidden;
}

/* Shop Header */
.shop-header {
  margin-bottom: 0.8rem;
  animation: fadeIn 0.5s ease-in;
}

.shop-header-content {
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

.shop-title {
  color: #ffffff;
  font-size: 1rem;
  font-weight: bold;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
}

.shop-countdown {
  display: flex;
  align-items: center;
}

/* Shop Content */
.shop-content {
  animation: fadeIn 0.5s ease-in;
}

.shop-items {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.52rem;
  max-width: 100%;
  box-sizing: border-box;
}

.shop-item-wrapper {
  animation: slideIn 0.6s ease-out;
  animation-fill-mode: both;
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

/* Empty State */
.shop-empty {
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

/* Responsive Design - Optimized for different screen sizes */
@media (min-width: 1920px) {
  .shop-view {
    max-width: 80%;
    width: 80%;
    padding: 0.6rem 0.6rem;
  }

  .shop-header {
    margin-bottom: 0.8rem;
  }

  .shop-header-content {
    padding: 0.68rem 1rem;
  }

  .shop-title {
    font-size: 1.08rem;
  }

  .shop-items {
    grid-template-columns: repeat(4, 1fr);
    gap: 0.56rem;
  }
}

@media (min-width: 1600px) and (max-width: 1919px) {
  .shop-view {
    max-width: 85%;
    width: 85%;
  }

  .shop-items {
    grid-template-columns: repeat(4, 1fr);
    gap: 0.65rem;
  }
}

@media (min-width: 1400px) and (max-width: 1599px) {
  .shop-view {
    max-width: 90%;
    width: 90%;
  }

  .shop-items {
    grid-template-columns: repeat(4, 1fr);
    gap: 0.65rem;
  }
}

@media (min-width: 1024px) and (max-width: 1399px) {
  .shop-view {
    max-width: 95%;
    width: 95%;
    padding: 1rem 0.75rem;
  }

  .shop-header-content {
    padding: 0.85rem 1.25rem;
  }

  .shop-title {
    font-size: 1.35rem;
  }

  .shop-items {
    grid-template-columns: repeat(4, 1fr);
    gap: 0.7rem;
  }
}

@media (max-width: 1023px) {
  .shop-view {
    max-width: 100%;
    width: 100%;
    padding: 1rem 0.75rem;
  }

  .shop-header-content {
    padding: 1.25rem 1.5rem;
  }

  .shop-title {
    font-size: 1.75rem;
  }

  .shop-items {
    gap: 0.75rem;
  }
}

@media (max-width: 768px) {
  .shop-view {
    padding: 1rem 0.5rem;
  }

  .shop-header {
    margin-bottom: 1.5rem;
  }

  .shop-header-content {
    flex-direction: column;
    align-items: flex-start;
    padding: 1rem 1.25rem;
    gap: 1rem;
  }

  .shop-title {
    font-size: 1.5rem;
    letter-spacing: 1px;
  }

  .shop-items {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }
}

@media (max-width: 640px) {
  .shop-view {
    padding: 1rem 0.5rem;
  }

  .shop-items {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .shop-title {
    font-size: 1.25rem;
  }

  .empty-state-title {
    font-size: 1.5rem;
  }

  .empty-state-message {
    font-size: 0.9rem;
  }
}
</style>

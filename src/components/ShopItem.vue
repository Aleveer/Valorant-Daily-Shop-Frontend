<template>
  <div class="shop-item">
    <div class="shop-item-header">
      <h3 class="shop-item-title">
        {{ isOnWishlist ? `⭐ ${item.displayName}` : item.displayName }}
      </h3>
      <div class="shop-item-price">
        {{ item.price }} <CurrencyIcon icon="vp" />
      </div>
    </div>
    <div class="shop-item-image">
      <img
        v-if="displayIcon"
        :src="displayIcon"
        :alt="item.displayName"
        class="item-image"
      />
      <div v-else class="no-image">No Image</div>
    </div>
    <div class="shop-item-actions">
      <button @click="showLevels" class="action-btn">{{ $t('levels') }}</button>
      <button @click="showChromas" class="action-btn">{{ $t('chromas') }}</button>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';
import { useWishlistStore } from '../stores/wishlist';
import { useFeatureStore } from '../stores/feature';
import { useMediaPopupStore } from '../stores/mediaPopup';
import { getDisplayIcon } from '../utils/misc';
import CurrencyIcon from './CurrencyIcon.vue';

export default {
  name: 'ShopItem',
  components: {
    CurrencyIcon,
  },
  props: {
    item: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const wishlistStore = useWishlistStore();
    const featureStore = useFeatureStore();
    const mediaPopupStore = useMediaPopupStore();

    const isOnWishlist = computed(() => {
      return wishlistStore.skinIds.includes(props.item.levels[0].uuid);
    });

    const displayIcon = computed(() => {
      return getDisplayIcon(props.item, featureStore.screenshotModeEnabled);
    });

    const showLevels = () => {
      // Get all levels (up to 5 levels for guns/knives)
      const levels = props.item.levels
        .slice(0, 5)
        .map((level) => level.streamedVideo || level.displayIcon || '')
        .filter((url) => url && url.trim() !== '');
      
      if (levels.length > 0) {
        mediaPopupStore.showMediaPopup(levels, 'Levels');
      }
    };

    const showChromas = () => {
      // Get all chromas (dynamic, can be 0-4 or more)
      const chromas = props.item.chromas
        .map((chroma) => chroma.streamedVideo || chroma.fullRender || '')
        .filter((url) => url && url.trim() !== '');
      
      if (chromas.length > 0) {
        mediaPopupStore.showMediaPopup(chromas, 'Chromas');
      }
    };

    return {
      isOnWishlist,
      displayIcon,
      showLevels,
      showChromas,
    };
  },
};
</script>

<style scoped>
.shop-item {
  background: linear-gradient(145deg, rgba(42, 42, 42, 0.95) 0%, rgba(31, 31, 31, 0.95) 100%);
  border-radius: 6.4px;
  padding: 0.4rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
  aspect-ratio: 16 / 9;
  width: 100%;
  box-sizing: border-box;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.shop-item::before {
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

.shop-item:hover {
  transform: translateY(-8px);
  box-shadow: 0 8px 24px rgba(250, 68, 84, 0.3);
  border-color: rgba(250, 68, 84, 0.3);
}

.shop-item:hover::before {
  opacity: 1;
}

.shop-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.32rem;
  gap: 0.28rem;
}

.shop-item-title {
  color: #ffffff;
  font-size: 0.56rem;
  margin: 0;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
}

.shop-item-price {
  color: #fa4454;
  font-weight: bold;
  font-size: 0.52rem;
  white-space: nowrap;
}

.shop-item-image {
  width: 100%;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, rgba(26, 26, 26, 0.8) 0%, rgba(15, 15, 15, 0.8) 100%);
  border-radius: 4px;
  margin-bottom: 0.32rem;
  flex-shrink: 0;
  min-height: 0;
  padding: 0.24rem;
  box-sizing: border-box;
  overflow: hidden;
  position: relative;
}

.item-image {
  max-width: 90%;
  max-height: 90%;
  object-fit: contain;
  transition: transform 0.3s;
  position: relative;
  z-index: 1;
}

.shop-item:hover .item-image {
  transform: scale(1.05);
}

.no-image {
  color: #666;
  font-size: 0.7rem;
}

.shop-item-actions {
  display: flex;
  gap: 0.24rem;
  margin-top: auto;
}

.action-btn {
  flex: 1;
  padding: 0.24rem 0.36rem;
  background: linear-gradient(135deg, rgba(250, 68, 84, 0.15) 0%, rgba(217, 58, 74, 0.15) 100%);
  color: #ffffff;
  border: 1.5px solid rgba(250, 68, 84, 0.3);
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.44rem;
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

/* Responsive adjustments */
@media (max-width: 767px) {
  .shop-item-title {
    font-size: 0.85rem;
  }

  .shop-item-price {
    font-size: 0.8rem;
  }

  .action-btn {
    font-size: 0.65rem;
    padding: 0.5rem 0.6rem;
    min-height: 2.5rem;
    border-radius: 8px;
    border-width: 2px;
  }

  .action-btn::after {
    border-radius: 8px;
    padding: 2px;
  }

  .shop-item-actions {
    gap: 0.4rem;
  }

  /* Increase currency icon size on mobile */
  .shop-item-price :deep(.currency-icon) {
    display: inline-flex;
    align-items: center;
  }

  .shop-item-price :deep(.icon-img) {
    width: 20px;
    height: 20px;
  }
}

@media (min-width: 768px) {
  .shop-item {
    padding: 0.8rem;
  }
  
  .shop-item-title {
    font-size: 0.88rem;
  }
  
  .shop-item-price {
    font-size: 0.8rem;
  }
  
  .action-btn {
    font-size: 0.7rem;
    padding: 0.4rem 0.8rem;
    border-radius: 8px;
  }

  .action-btn::after {
    border-radius: 8px;
  }
}
</style>


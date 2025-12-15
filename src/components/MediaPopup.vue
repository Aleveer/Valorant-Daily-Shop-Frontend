<template>
  <div v-if="visible" class="media-popup-overlay" @click="closePopup">
    <div class="media-popup-content" @click.stop>
      <div class="media-popup-header">
        <h3 class="media-popup-title">{{ text }}</h3>
        <button class="close-btn" @click="closePopup">&times;</button>
      </div>
      
      <div class="media-container">
        <transition name="media-fade" mode="out-in">
          <div v-if="currentMedia" :key="selectedIndex" class="media-wrapper">
            <!-- Video -->
            <video
              v-if="isVideo(currentMedia)"
              :src="currentMedia"
              class="media-element"
              controls
              autoplay
              loop
              muted
              @loadeddata="onMediaLoad"
              @canplay="onMediaLoad"
              @error="onMediaError"
            ></video>
            <!-- Image -->
            <img
              v-else
              :src="currentMedia"
              :alt="`${text} ${selectedIndex + 1}`"
              class="media-element"
              @load="onMediaLoad"
              @error="onMediaError"
            />
          </div>
        </transition>
        <transition name="fade">
          <div v-if="loading" class="loading-overlay">
            <div class="spinner"></div>
            <p class="loading-text">Loading...</p>
          </div>
        </transition>
      </div>

      <div class="media-popup-footer">
        <div class="media-nav">
          <button
            class="nav-btn"
            :disabled="selectedIndex === 0"
            @click="previous"
          >
            ‹
          </button>
          <div class="media-indicators">
            <button
              v-for="(uri, index) in uris"
              :key="index"
              class="indicator-btn"
              :class="{ active: index === selectedIndex }"
              @click="setSelectedIndex(index)"
            >
              {{ index + 1 }}
            </button>
          </div>
          <button
            class="nav-btn"
            :disabled="selectedIndex === uris.length - 1"
            @click="next"
          >
            ›
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, watch, ref, onMounted, onUnmounted } from 'vue';
import { useMediaPopupStore } from '../stores/mediaPopup';

export default {
  name: 'MediaPopup',
  setup() {
    const store = useMediaPopupStore();
    const loading = ref(false);

    const visible = computed(() => store.visible);
    const uris = computed(() => store.uris);
    const text = computed(() => store.text);
    const selectedIndex = computed(() => store.selectedIndex);
    const currentMedia = computed(() => {
      if (uris.value.length > 0 && selectedIndex.value < uris.value.length) {
        return uris.value[selectedIndex.value];
      }
      return null;
    });

    const isVideo = (url) => {
      if (!url) return false;
      return url.includes('.mp4') || url.includes('video') || url.includes('streamedVideo');
    };

    const closePopup = () => {
      store.hideMediaPopup();
    };

    const setSelectedIndex = (index) => {
      if (index !== selectedIndex.value) {
        loading.value = true;
        store.setSelectedIndex(index);
      }
    };

    const next = () => {
      if (selectedIndex.value < uris.value.length - 1) {
        loading.value = true;
        store.next();
      }
    };

    const previous = () => {
      if (selectedIndex.value > 0) {
        loading.value = true;
        store.previous();
      }
    };

    const onMediaLoad = () => {
      loading.value = false;
    };

    const onMediaError = () => {
      loading.value = false;
      console.error('Failed to load media:', currentMedia.value);
    };

    const handleKeyPress = (e) => {
      if (!visible.value) return;
      
      if (e.key === 'Escape') {
        closePopup();
      } else if (e.key === 'ArrowLeft') {
        previous();
      } else if (e.key === 'ArrowRight') {
        next();
      }
    };

    // Watch for media changes to reset loading
    watch(currentMedia, () => {
      loading.value = true;
    });

    // Watch for popup visibility to reset loading when opened
    watch(visible, (newVal) => {
      if (newVal) {
        loading.value = true;
      }
    });

    onMounted(() => {
      window.addEventListener('keydown', handleKeyPress);
    });

    onUnmounted(() => {
      window.removeEventListener('keydown', handleKeyPress);
    });

    return {
      visible,
      uris,
      text,
      selectedIndex,
      currentMedia,
      loading,
      isVideo,
      closePopup,
      setSelectedIndex,
      next,
      previous,
      onMediaLoad,
      onMediaError,
    };
  },
};
</script>

<style scoped>
.media-popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.95) 0%, rgba(26, 26, 26, 0.95) 100%);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.media-popup-content {
  background: linear-gradient(145deg, rgba(26, 26, 26, 0.98) 0%, rgba(20, 20, 20, 0.98) 100%);
  border: 1px solid rgba(250, 68, 84, 0.2);
  border-radius: 16px;
  width: 100%;
  max-width: 600px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.6),
    0 0 40px rgba(250, 68, 84, 0.1);
  backdrop-filter: blur(20px);
  animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@media (min-width: 768px) {
  .media-popup-content {
    max-width: 700px;
  }
}

@media (min-width: 1024px) {
  .media-popup-content {
    max-width: 800px;
  }
}

@media (max-width: 767px) {
  .media-popup-overlay {
    padding: 0.5rem;
  }
  
  .media-popup-content {
    max-width: 100%;
    max-height: 95vh;
  }
}

.media-popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid rgba(250, 68, 84, 0.2);
  background: linear-gradient(180deg, rgba(250, 68, 84, 0.05) 0%, transparent 100%);
}

.media-popup-title {
  color: #fff;
  font-size: 1rem;
  margin: 0;
  text-transform: uppercase;
  color: #fa4454;
  font-weight: 700;
  letter-spacing: 1px;
  text-shadow: 0 0 10px rgba(250, 68, 84, 0.5);
}

@media (min-width: 768px) {
  .media-popup-header {
    padding: 1rem 1.5rem;
  }
  
  .media-popup-title {
    font-size: 1.25rem;
  }
}

.close-btn {
  background: rgba(250, 68, 84, 0.1);
  border: 1px solid rgba(250, 68, 84, 0.3);
  color: #fff;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  line-height: 1;
}

@media (min-width: 768px) {
  .close-btn {
    font-size: 2rem;
    width: 36px;
    height: 36px;
  }
}

.close-btn:hover {
  background: rgba(250, 68, 84, 0.2);
  border-color: rgba(250, 68, 84, 0.6);
  box-shadow: 0 0 15px rgba(250, 68, 84, 0.4);
  transform: rotate(90deg) scale(1.1);
}

.media-container {
  position: relative;
  width: 100%;
  min-height: 300px;
  max-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
  overflow: hidden;
}

.media-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.media-element {
  max-width: 100%;
  max-height: 60vh;
  width: auto;
  height: auto;
  object-fit: contain;
  filter: drop-shadow(0 0 20px rgba(250, 68, 84, 0.2));
}

/* Media Fade Transition */
.media-fade-enter-active,
.media-fade-leave-active {
  transition: opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1), transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.media-fade-enter-from {
  opacity: 0;
  transform: scale(0.95) translateY(10px);
}

.media-fade-leave-to {
  opacity: 0;
  transform: scale(1.05) translateY(-10px);
}

@media (max-width: 767px) {
  .media-container {
    min-height: 250px;
    max-height: 50vh;
  }
  
  .media-element {
    max-height: 50vh;
  }
}

@media (min-width: 1024px) {
  .media-container {
    min-height: 350px;
    max-height: 65vh;
  }
  
  .media-element {
    max-height: 65vh;
  }
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  pointer-events: none;
  z-index: 10;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(250, 68, 84, 0.2);
  border-top-color: #fa4454;
  border-right-color: #fa4454;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  box-shadow: 0 0 20px rgba(250, 68, 84, 0.5);
}

.loading-text {
  margin-top: 1rem;
  color: #fa4454;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.media-popup-footer {
  padding: 1rem 1.25rem;
  border-top: 1px solid rgba(250, 68, 84, 0.2);
  background: linear-gradient(180deg, transparent 0%, rgba(250, 68, 84, 0.05) 100%);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

@media (min-width: 768px) {
  .media-popup-footer {
    padding: 1rem 1.5rem;
    gap: 1rem;
  }
}

.media-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.nav-btn {
  background: linear-gradient(135deg, rgba(250, 68, 84, 0.1) 0%, rgba(217, 58, 74, 0.1) 100%);
  border: 1.5px solid rgba(250, 68, 84, 0.3);
  color: #fff;
  font-size: 1.25rem;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
  font-weight: bold;
  position: relative;
  overflow: hidden;
}

.nav-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(250, 68, 84, 0.2) 0%, rgba(255, 107, 122, 0.2) 100%);
  opacity: 0;
  transition: opacity 0.3s;
}

@media (min-width: 768px) {
  .nav-btn {
    font-size: 1.5rem;
    width: 44px;
    height: 44px;
  }
}

.nav-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, rgba(250, 68, 84, 0.25) 0%, rgba(255, 107, 122, 0.25) 100%);
  border-color: rgba(250, 68, 84, 0.8);
  box-shadow: 
    0 0 20px rgba(250, 68, 84, 0.4),
    inset 0 0 20px rgba(250, 68, 84, 0.1);
  transform: scale(1.1);
}

.nav-btn:hover:not(:disabled)::before {
  opacity: 1;
}

.nav-btn:active:not(:disabled) {
  transform: scale(0.95);
}

.nav-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
  background: rgba(42, 42, 42, 0.3);
  border-color: rgba(68, 68, 68, 0.3);
}

.media-indicators {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
}

.indicator-btn {
  background: linear-gradient(135deg, rgba(42, 42, 42, 0.8) 0%, rgba(31, 31, 31, 0.8) 100%);
  border: 1.5px solid rgba(68, 68, 68, 0.5);
  color: #fff;
  font-size: 0.75rem;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
  font-weight: 600;
  position: relative;
  overflow: hidden;
}

.indicator-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(250, 68, 84, 0.2) 0%, rgba(255, 107, 122, 0.2) 100%);
  opacity: 0;
  transition: opacity 0.3s;
}

@media (min-width: 768px) {
  .indicator-btn {
    font-size: 0.875rem;
    width: 40px;
    height: 40px;
  }
}

.indicator-btn:hover {
  background: linear-gradient(135deg, rgba(250, 68, 84, 0.15) 0%, rgba(255, 107, 122, 0.15) 100%);
  border-color: rgba(250, 68, 84, 0.6);
  box-shadow: 0 0 15px rgba(250, 68, 84, 0.3);
  transform: translateY(-2px);
}

.indicator-btn:hover::before {
  opacity: 1;
}

.indicator-btn.active {
  background: linear-gradient(135deg, #fa4454 0%, #ff6b7a 100%);
  border-color: #fa4454;
  font-weight: bold;
  box-shadow: 
    0 0 20px rgba(250, 68, 84, 0.6),
    inset 0 0 20px rgba(255, 255, 255, 0.1);
  transform: scale(1.1);
}


.thumbnail-item {
  position: relative;
  aspect-ratio: 16 / 9;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  background: rgba(42, 42, 42, 0.5);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 0;
}

.thumbnail-item:hover {
  border-color: rgba(250, 68, 84, 0.6);
  transform: translateY(-4px) scale(1.05);
  box-shadow: 0 4px 15px rgba(250, 68, 84, 0.4);
}

.thumbnail-item.active {
  border-color: #fa4454;
  box-shadow: 
    0 0 20px rgba(250, 68, 84, 0.6),
    inset 0 0 20px rgba(250, 68, 84, 0.2);
  transform: scale(1.08);
}

.thumbnail-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.thumbnail-video {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(26, 26, 26, 0.8) 0%, rgba(15, 15, 15, 0.8) 100%);
}

.play-icon {
  width: 24px;
  height: 24px;
  color: #fa4454;
  opacity: 0.8;
}

.thumbnail-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.7) 100%);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 0.5rem;
  opacity: 0;
  transition: opacity 0.3s;
}

.thumbnail-item:hover .thumbnail-overlay,
.thumbnail-item.active .thumbnail-overlay {
  opacity: 1;
}

.thumbnail-number {
  color: #fff;
  font-size: 0.75rem;
  font-weight: bold;
  background: rgba(250, 68, 84, 0.8);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  backdrop-filter: blur(4px);
}

@media (max-width: 767px) {
  .thumbnail-grid {
    grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    max-height: 150px;
  }
}
</style>


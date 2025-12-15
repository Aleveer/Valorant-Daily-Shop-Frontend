<template>
  <div class="countdown">
    {{ formattedTime }}
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';

export default {
  name: 'Countdown',
  props: {
    timestamp: {
      type: Number,
      required: true,
    },
  },
  setup(props) {
    const formattedTime = ref('');
    let interval = null;

    const updateTime = () => {
      const now = Date.now();
      const diff = props.timestamp - now;

      if (diff <= 0) {
        formattedTime.value = '00:00:00';
        return;
      }

      const totalSeconds = Math.floor(diff / 1000);
      const days = Math.floor(totalSeconds / (24 * 60 * 60));
      const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));
      const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
      const seconds = totalSeconds % 60;

      if (days > 0) {
        // Hiển thị ngày + giờ:phút:giây
        formattedTime.value = `${days}d ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      } else {
        // Hiển thị giờ:phút:giây như cũ
        formattedTime.value = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      }
    };

    onMounted(() => {
      updateTime();
      interval = setInterval(updateTime, 1000);
    });

    onUnmounted(() => {
      if (interval) {
        clearInterval(interval);
      }
    });

    return {
      formattedTime,
    };
  },
};
</script>

<style scoped>
.countdown {
  color: #fa4454;
  font-weight: bold;
  font-size: 1rem;
}
</style>


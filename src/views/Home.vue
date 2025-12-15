<template>
  <div class="home-view">
    <Loading />
  </div>
</template>

<script>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/user';
import Loading from '../components/Loading.vue';

export default {
  name: 'Home',
  components: {
    Loading,
  },
  setup() {
    const router = useRouter();
    const userStore = useUserStore();

    onMounted(() => {
      if (userStore.user.id) {
        router.push('/shop');
      } else {
        router.push('/auth');
      }
    });
  },
};
</script>

<style scoped>
.home-view {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}
</style>

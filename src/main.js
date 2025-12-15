import { createApp } from 'vue';
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import App from './App.vue';
import router from './router';
import i18n from './utils/localization';

const app = createApp(App);
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

app.use(pinia);
app.use(router);

// Simple i18n plugin for Vue
app.config.globalProperties.$t = (key) => {
  return i18n.t(key);
};

app.mount('#app');

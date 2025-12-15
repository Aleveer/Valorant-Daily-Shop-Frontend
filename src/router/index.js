import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '../stores/user';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
  },
  {
    path: '/auth',
    name: 'Auth',
    component: () => import('../views/Auth.vue'),
  },
  {
    path: '/shop',
    name: 'Shop',
    component: () => import('../views/Shop.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/bundles',
    name: 'Bundles',
    component: () => import('../views/Bundles.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/night-market',
    name: 'NightMarket',
    component: () => import('../views/NightMarket.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/accessories',
    name: 'Accessories',
    component: () => import('../views/Accessories.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/loadout',
    name: 'Loadout',
    component: () => import('../views/Loadout.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/owned-items',
    name: 'OwnedItems',
    component: () => import('../views/OwnedItems.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../views/Settings.vue'),
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const userStore = useUserStore();
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);

  if (requiresAuth && !userStore.user.id) {
    next('/auth');
  } else {
    next();
  }
});

export default router;

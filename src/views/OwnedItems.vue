<template>
  <div class="owned-view">
    <section class="page-hero">
      <div class="hero-left">
        <p class="eyebrow">{{ $t('inventory') || 'Inventory' }}</p>
        <p class="subtitle">
          {{ $t('inventory_description') || 'All owned items (skins, buddies, sprays, cards, titles) grouped with visuals from Valorant API.' }}
        </p>
        <div class="hero-actions">
          <button class="pill-btn" :class="{ ghost: true }" @click="openProfile">
            <span class="dot"></span>
            {{ getRiotId() }}
          </button>
          <button class="pill-btn" :disabled="refreshing" @click="refreshOwned">
            <span v-if="refreshing" class="loader"></span>
            <span v-else class="icon">⟳</span>
            {{ $t('refresh') || 'Refresh' }}
          </button>
        </div>
      </div>
      <div class="hero-right">
        <div class="metric-card">
          <p class="metric-label">{{ $t('categories') || 'Categories' }}</p>
          <h3 class="metric-value">{{ typeOptions.length }}</h3>
          <p class="metric-sub">{{ $t('supported_item_types') || 'item types supported' }}</p>
        </div>
        <div class="metric-card">
          <p class="metric-label">{{ $t('total_items') || 'Total items' }}</p>
          <h3 class="metric-value">{{ items.length }}</h3>
          <p class="metric-sub">{{ $t('received_from_riot') || 'fetched from Riot' }}</p>
        </div>
      </div>
    </section>

    <section class="toolbar">
      <div class="chip-group">
        <button
          v-for="type in typeOptions"
          :key="type.key"
          class="chip"
          :class="{ active: selectedType === type.key }"
          @click="selectedType = type.key"
        >
          <span class="chip-dot" :style="{ background: type.color }"></span>
          {{ type.label }}
          <span class="chip-count">{{ countByType[type.key] || 0 }}</span>
        </button>
      </div>

      <div class="search-row">
        <div class="search-box">
          <span class="icon">🔍</span>
          <input
            v-model="search"
            type="text"
            :placeholder="$t('search_placeholder') || 'Search by name or description...'"
          />
        </div>

        <button
          v-if="selectedType === 'SkinLevel'"
          class="filter-toggle"
          @click="showWeaponFilters = !showWeaponFilters"
        >
          <span class="filter-toggle-label">Vũ khí</span>
          <span class="filter-toggle-icon">{{ showWeaponFilters ? '▴' : '▾' }}</span>
        </button>
      </div>

      <transition name="fade-slide">
        <div
          v-if="selectedType === 'SkinLevel' && showWeaponFilters"
          class="weapon-filter-row"
        >
          <div class="pill-scroll two-rows">
            <button
              class="pill-filter"
              :class="{ active: weaponFilter === 'all' }"
              @click="weaponFilter = 'all'"
            >
              {{ $t('all') || 'All' }}
            </button>
            <button
              v-for="w in weaponOptions"
              :key="w"
              class="pill-filter"
              :class="{ active: weaponFilter === w }"
              @click="weaponFilter = w"
            >
              {{ w }}
            </button>
          </div>
          <button class="collapse-toggle" @click="toggleAllWeapons">
            {{ collapsedAll ? ($t('show_all') || 'Show all') : ($t('collapse_all') || 'Collapse all') }}
          </button>
        </div>
      </transition>
    </section>

    <section v-if="errorMsg" class="state-box empty">
      <div class="empty-icon">⚠️</div>
      <h3>Lỗi tải owned items</h3>
      <p>{{ errorMsg }}</p>
    </section>

    <section v-else-if="loading" class="state-box">
      <Loading :msg="$t('loading') || 'Đang tải assets và quyền sở hữu...'" />
    </section>

    <section v-else>
      <template v-if="selectedType === 'SkinLevel'">
        <div v-if="weaponGroups.length === 0" class="state-box empty">
          <div class="empty-icon">📦</div>
          <h3>{{ $t('no_skins') || 'No skins available' }}</h3>
        </div>
        <div v-else class="weapon-section">
          <div v-for="group in weaponGroups" :key="group.weapon" class="weapon-block">
            <div class="category-header">
              <div class="category-title-row">
                <h2 class="category-title">{{ group.weapon }}</h2>
                  <span class="category-count">{{ group.items.length }} {{ $t('skins') || 'skins' }}</span>
              </div>
              <button class="collapse-btn" @click="toggleWeapon(group.weapon)">
                  {{ isCollapsed(group.weapon) ? ($t('show') || 'Show') : ($t('collapse') || 'Collapse') }}
              </button>
            </div>
            <div class="skin-grid" v-if="!isCollapsed(group.weapon)">
              <div v-for="skin in group.items" :key="skin.id" class="weapon-card has-actions">
                <div class="weapon-card-inner">
                  <div class="weapon-header">
                    <h3 class="weapon-skin-name">{{ skin.name }}</h3>
                    <div class="weapon-border-accent"></div>
                  </div>
                  <div class="weapon-image-container">
                    <img
                      v-if="skin.icon"
                      :src="skin.icon"
                      :alt="skin.name"
                      class="weapon-image"
                      loading="lazy"
                    />
                    <div v-else class="weapon-image-placeholder">
                      <span class="placeholder-icon">🔫</span>
                      <span class="placeholder-text">{{ $t('noImage') || 'No Image' }}</span>
                    </div>
                  </div>
                  <div class="weapon-footer">
                    <div class="weapon-actions">
                      <button
                        class="action-btn action-btn-levels"
                        @click="showLevels(skin)"
                        :disabled="!hasVariantType(skin, 'LEVEL')"
                      >
                        {{ $t('levels') || 'Levels' }}
                      </button>
                      <button
                        class="action-btn action-btn-chromas"
                        @click="showChromas(skin)"
                        :disabled="!hasVariantType(skin, 'CHROMA')"
                      >
                        {{ $t('chromas') || 'Chromas' }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <template v-else>
        <div v-if="filteredItems.length === 0" class="state-box empty">
          <div class="empty-icon">📦</div>
          <h3>{{ $t('no_items_here') || 'No items in this category' }}</h3>
          <p>{{ $t('choose_other_category') || 'Choose another category or refresh data.' }}</p>
        </div>
        <div v-else>
          <div class="item-grid">
            <article v-for="item in pagedItems" :key="item.id" class="item-card">
              <div class="item-media" :class="`type-${item.typeKey}`">
                <img v-if="item.icon" :src="item.icon" :alt="item.name" loading="lazy" />
                <div v-else class="placeholder">No Art</div>
              </div>
              <div class="item-body center-text">
                <div class="item-headline">
                  <h4>{{ item.name }}</h4>
                </div>
                <!-- <div class="tags">
                  <span class="tag" v-if="item.typeKey === 'SkinLevel' && item.variants?.length">
                    {{ item.variants.length }} variants
                  </span>
                  <span class="tag" v-if="item.extra">{{ item.extra }}</span>
                </div> -->
              </div>
            </article>
          </div>
          <div class="pager" v-if="totalPages > 1">
            <button class="pager-btn" :disabled="page <= 1" @click="page--">{{ $t('prev') || 'Prev' }}</button>
            <span class="pager-text">{{ $t('page') || 'Page' }} {{ page }} / {{ totalPages }}</span>
            <button class="pager-btn" :disabled="page >= totalPages" @click="page++">{{ $t('next') || 'Next' }}</button>
          </div>
        </div>
      </template>
    </section>
  </div>
</template>

<script>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/user';
import { getAssets, loadAssets } from '../utils/valorant-assets';
import { getOwnedItemsForTypes } from '../utils/valorant-api';
import { VItemTypes } from '../utils/misc';
import Loading from '../components/Loading.vue';
import { useMediaPopupStore } from '../stores/mediaPopup';
import { watch } from 'vue';

const TYPE_OPTIONS = [
  { key: 'SkinLevel', label: 'Skins', color: '#fa4454' },
  { key: 'Buddy', label: 'Gun Buddies', color: '#ffb547' },
  { key: 'Spray', label: 'Sprays', color: '#7bd7ff' },
  { key: 'PlayerCard', label: 'Cards', color: '#9b8cff' },
  { key: 'PlayerTitle', label: 'Titles', color: '#63e6be' },
];

const WEAPON_ORDER = [
  // Hàng 1
  'Classic',
  'Shorty',
  'Frenzy',
  'Ghost',
  'Sheriff',
  'Stinger',
  'Spectre',
  'Bucky',
  'Judge',
  'Bulldog',
  // Hàng 2
  'Guardian',
  'Phantom',
  'Vandal',
  'Marshal',
  'Outlaw',
  'Operator',
  'Ares',
  'Odin',
  'Melee',
  'Knife',
];

export default {
  name: 'OwnedItems',
  components: { Loading },
  setup() {
    const router = useRouter();
    const userStore = useUserStore();
    const mediaPopupStore = useMediaPopupStore();

    const loading = ref(true);
    const refreshing = ref(false);
    const errorMsg = ref('');
    const selectedType = ref(TYPE_OPTIONS[0].key);
    const search = ref('');
    const items = ref([]);
    const page = ref(1);
    const pageSize = 20;
    const collapsedWeapons = ref(new Set());
    const weaponFilter = ref('all');
    const collapsedAll = ref(false);
    const showWeaponFilters = ref(false);

    const typeOptions = TYPE_OPTIONS;

    const countByType = computed(() => {
      return items.value.reduce((acc, cur) => {
        acc[cur.typeKey] = (acc[cur.typeKey] || 0) + 1;
        return acc;
      }, {});
    });

    const weaponGroups = computed(() => {
      const skins = filteredItems.value.filter((it) => it.typeKey === 'SkinLevel');
      const filteredByWeapon =
        weaponFilter.value === 'all'
          ? skins
          : skins.filter((s) => (s.weaponName || '').toLowerCase() === weaponFilter.value.toLowerCase());
      const map = new Map();
      filteredByWeapon.forEach((skin) => {
        const weapon = skin.weaponName || 'Misc';
        if (!map.has(weapon)) map.set(weapon, []);
        map.get(weapon).push(skin);
      });
      const orderIndex = (w) => {
        const idx = WEAPON_ORDER.findIndex((x) => x.toLowerCase() === w.toLowerCase());
        return idx === -1 ? 999 : idx;
      };
      return Array.from(map.entries())
        .sort((a, b) => orderIndex(a[0]) - orderIndex(b[0]) || a[0].localeCompare(b[0]))
        .map(([weapon, list]) => ({
          weapon,
          items: list.sort((a, b) => a.name.localeCompare(b.name)),
        }));
    });

    const weaponOptions = computed(() => {
      const unique = new Set(
        items.value.filter((it) => it.typeKey === 'SkinLevel').map((it) => it.weaponName || 'Misc'),
      );
      const ordered = WEAPON_ORDER.filter((w) => unique.has(w));
      if (unique.has('Misc')) ordered.push('Misc');
      return ordered;
    });

    const filteredItems = computed(() => {
      const keyword = search.value.toLowerCase();
      return items.value
        .filter((item) => item.typeKey === selectedType.value)
        .filter(
          (item) =>
            item.name.toLowerCase().includes(keyword) ||
            (item.detail && item.detail.toLowerCase().includes(keyword)) ||
            (item.weaponName && item.weaponName.toLowerCase().includes(keyword)),
        );
    });

    const pagedItems = computed(() => {
      if (selectedType.value === 'SkinLevel') {
        return filteredItems.value;
      }
      const start = (page.value - 1) * pageSize;
      return filteredItems.value.slice(start, start + pageSize);
    });

    const totalPages = computed(() =>
      selectedType.value === 'SkinLevel'
        ? 1
        : Math.max(1, Math.ceil(filteredItems.value.length / pageSize)),
    );

    watch(
      () => selectedType.value,
      () => {
        page.value = 1;
      },
    );

    const shortId = (id) => `${id?.slice(0, 6)}...${id?.slice(-4)}`;

    const typeLabel = (key) => TYPE_OPTIONS.find((t) => t.key === key)?.label || key;
    const typeColor = (key) => TYPE_OPTIONS.find((t) => t.key === key)?.color || '#666';

    const getRiotId = () => {
      const name = userStore.user?.name || '';
      if (name.includes('#')) return name;
      if (userStore.user?.gameName && userStore.user?.tagLine) {
        return `${userStore.user.gameName}#${userStore.user.tagLine}`;
      }
      return name || 'Unknown';
    };

    const openProfile = () => {
      router.push('/loadout');
    };

    const getWeaponNameFromSkin = (skin, assets) => {
      if (!skin || !assets.weapons) return null;
      const weapon = assets.weapons.find((w) =>
        (w.skins || []).some((s) => s.uuid === skin.uuid),
      );
      if (weapon?.displayName) {
        const name = weapon.displayName.replace(/^Standard\s+/i, '').trim();
        return name === 'Knife' ? 'Melee' : name;
      }
      return null;
    };

    const mapOwnedItems = () => {
      const assets = getAssets();
      const entitlements = userStore.user?.ownedItems?.entitlementsByTypes || [];
      const mapped = [];
      const skinMap = new Map(); // gộp skin + chroma theo skin base
      const buddyMap = new Map(); // gộp buddies theo itemID

      if (!entitlements.length) {
        console.warn('OwnedItems: no entitlements data');
      }

      const ensureSkinEntry = (skin, icon, variant) => {
        const skinId = skin?.uuid || variant?.uuid || 'unknown-skin';
        if (!skinMap.has(skinId)) {
          const weaponName = getWeaponNameFromSkin(skin, assets);
          skinMap.set(skinId, {
            id: `Skin-${skinId}`,
            rawId: skinId,
            typeKey: 'SkinLevel',
            name: skin?.displayName || 'Skin',
            detail: '',
            icon: icon || skin?.displayIcon || null,
            extra: null,
            variants: [],
            weaponName: weaponName || 'Misc',
          });
        }
        const entry = skinMap.get(skinId);
        if (variant) {
          entry.variants.push(variant);
          // Ưu tiên icon có ảnh hơn
          if (!entry.icon && (variant.icon || variant.fullRender)) {
            entry.icon = variant.icon || variant.fullRender;
          }
        }
      };

      entitlements.forEach((group) => {
        const typeKey = Object.entries(VItemTypes).find(
          ([, value]) => value === group.itemTypeID,
        )?.[0];

        if (!typeKey) return;

        group.entitlements.forEach((entry) => {
          // Xử lý skin/chroma gộp chung
          if (typeKey === 'SkinLevel' || typeKey === 'SkinChroma') {
            const skin = assets.skins.find(
              (s) =>
                (s.levels || []).some((l) => l.uuid === entry.itemID) ||
                (s.chromas || []).some((c) => c.uuid === entry.itemID),
            );

            if (!skin) return;

            if (typeKey === 'SkinLevel') {
              const level =
                skin.levels?.find((l) => l.uuid === entry.itemID) ||
                skin.levels?.find((l) => l.displayIcon);
              ensureSkinEntry(skin, level?.displayIcon || skin.displayIcon, {
                uuid: level?.uuid || entry.itemID,
                name: level?.displayName || '',
                type: 'LEVEL',
                icon: level?.displayIcon || null,
                fullRender: level?.streamedVideo || null, // store video if any
              });
            } else {
              const chroma =
                skin.chromas?.find((c) => c.uuid === entry.itemID) ||
                skin.chromas?.[0];
              ensureSkinEntry(skin, chroma?.fullRender || chroma?.displayIcon, {
                uuid: chroma?.uuid || entry.itemID,
                name: chroma?.displayName || '',
                type: 'CHROMA',
                icon: chroma?.displayIcon || null,
                fullRender: chroma?.fullRender || chroma?.streamedVideo || null,
              });
            }
            return;
          }

          const base = {
            id: `${typeKey}-${entry.itemID}`,
            rawId: entry.itemID,
            typeKey,
            name: 'Unknown Item',
            detail: '',
            icon: null,
            extra: null,
          };

          let skipPush = false;

          switch (typeKey) {
            case 'Buddy': {
              const buddy = assets.buddies.find((b) =>
                (b.levels || []).some((l) => l.uuid === entry.itemID || l.levelItemID === entry.itemID),
              );
              const lvl =
                buddy?.levels?.find((l) => l.uuid === entry.itemID || l.levelItemID === entry.itemID) ||
                buddy?.levels?.[0];
              const key = buddy?.uuid || entry.itemID;
              if (!buddyMap.has(key)) {
                buddyMap.set(key, {
                  ...base,
                  id: `Buddy-${key}`,
                  rawId: key,
                  name: buddy?.displayName || 'Gun Buddy',
                  detail: lvl?.displayName || '',
                  icon: lvl?.displayIcon || buddy?.displayIcon || null,
                  extra: null,
                  count: 0,
                });
              }
              const item = buddyMap.get(key);
              item.count += 1;
              item.extra = `Owned: ${item.count}`;
              skipPush = true;
              break;
            }
            case 'Spray': {
              const spray = assets.sprays.find((s) => s.uuid === entry.itemID);
              base.name = spray?.displayName || 'Spray';
              base.icon = spray?.fullTransparentIcon || spray?.displayIcon || null;
              base.extra = spray?.category || 'Spray';
              break;
            }
            case 'PlayerCard': {
              const card = assets.cards.find((c) => c.uuid === entry.itemID);
              base.name = card?.displayName || 'Player Card';
              base.detail = card?.themeUuid ? 'Themed' : '';
              base.icon = card?.largeArt || card?.displayIcon || null;
              base.extra = 'Card';
              break;
            }
            case 'PlayerTitle': {
              const title = assets.titles.find((t) => t.uuid === entry.itemID);
              base.name = title?.titleText || 'Player Title';
              base.detail = title?.displayName || '';
              base.icon = null; // Titles chỉ text, không hiển thị ảnh
              base.extra = 'Title';
              break;
            }
            default:
              break;
          }

          if (!skipPush) {
            mapped.push(base);
          }
        });
      });

      // Đưa các skin đã gộp vào danh sách cuối cùng
      skinMap.forEach((skinEntry) => {
        skinEntry.extra =
          skinEntry.variants && skinEntry.variants.length > 0
            ? `${skinEntry.variants.length} variants`
            : 'Skin';
        mapped.push(skinEntry);
      });

      // Đưa buddies đã gộp vào danh sách
      buddyMap.forEach((buddyEntry) => {
        mapped.push({ ...buddyEntry, id: `Buddy-${buddyEntry.rawId}-${buddyEntry.count}` });
      });

      items.value = mapped.sort((a, b) => a.name.localeCompare(b.name));

      // Nếu danh mục hiện tại trống nhưng danh mục khác có item thì auto chuyển
      const hasCurrent =
        items.value.filter((it) => it.typeKey === selectedType.value).length > 0;
      if (!hasCurrent && items.value.length > 0) {
        const firstType = items.value[0].typeKey;
        selectedType.value = firstType;
      }

      // reset pagination when data changes
      page.value = 1;

      console.info('OwnedItems mapped', {
        total: items.value.length,
        byType: items.value.reduce((acc, cur) => {
          acc[cur.typeKey] = (acc[cur.typeKey] || 0) + 1;
          return acc;
        }, {}),
      });
    };

    const hasVariantType = (skin, type) => {
      const assets = getAssets();
      const asset = assets.skins.find((s) => s.uuid === skin.rawId);
      if (!asset) return false;
      if (type === 'CHROMA') {
        return (asset.chromas || []).some((c) => c.fullRender || c.displayIcon || c.streamedVideo);
      }
      if (type === 'LEVEL') {
        return (asset.levels || []).some((l) => l.streamedVideo || l.displayIcon);
      }
      return false;
    };

    // Copy logic từ Loadout.vue
    const showLevels = (skin) => {
      const assets = getAssets();
      const skinAsset = assets.skins.find((s) => s.uuid === skin.rawId);
      if (!skinAsset || !skinAsset.levels) {
        alert('Không có level media cho skin này.');
        return;
      }

      const levels = skinAsset.levels
        .slice(0, 5)
        .map((level) => level.streamedVideo || level.displayIcon || '')
        .filter((url) => url && url.trim() !== '');

      if (levels.length > 0) {
        mediaPopupStore.showMediaPopup(levels, 'Levels');
      } else {
        alert('Không có level media cho skin này.');
      }
    };

    const showChromas = (skin) => {
      const assets = getAssets();
      const skinAsset = assets.skins.find((s) => s.uuid === skin.rawId);
      if (!skinAsset || !skinAsset.chromas) {
        alert('Không có chroma media cho skin này.');
        return;
      }

      const chromas = skinAsset.chromas
        .map((chroma) => chroma.streamedVideo || chroma.fullRender || '')
        .filter((url) => url && url.trim() !== '');

      if (chromas.length > 0) {
        mediaPopupStore.showMediaPopup(chromas, 'Chromas');
      } else {
        alert('Không có chroma media cho skin này.');
      }
    };

    const ensureAssets = async () => {
      await loadAssets();
    };

    const toggleWeapon = (weapon) => {
      const set = new Set(collapsedWeapons.value);
      if (set.has(weapon)) {
        set.delete(weapon);
      } else {
        set.add(weapon);
      }
      collapsedWeapons.value = set;
    };

    const isCollapsed = (weapon) => collapsedWeapons.value.has(weapon);

    const toggleAllWeapons = () => {
      if (collapsedAll.value) {
        collapsedWeapons.value = new Set();
        collapsedAll.value = false;
      } else {
        const all = new Set(weaponGroups.value.map((g) => g.weapon));
        collapsedWeapons.value = all;
        collapsedAll.value = true;
      }
    };

    const refreshOwned = async (silent = false) => {
      if (!userStore.user?.id) return;
      errorMsg.value = '';
      const accessToken = localStorage.getItem('accessToken');
      const entitlementsToken = localStorage.getItem('entitlementsToken');
      const region = userStore.user?.region || 'na';

      if (!accessToken || !entitlementsToken) {
        alert('Thiếu access token hoặc entitlements token. Vui lòng đăng nhập lại.');
        router.push('/auth');
        return;
      }

      try {
        if (!silent) refreshing.value = true;
        const latestOwned = await getOwnedItemsForTypes(
          accessToken,
          entitlementsToken,
          region,
          userStore.user.id,
          [
            'SkinLevel',
            'SkinChroma',
            'Spray',
            'Buddy',
            'PlayerCard',
            'PlayerTitle',
          ],
        );
        userStore.setUser({
          ...userStore.user,
          ownedItems: latestOwned,
        });
        mapOwnedItems();
        if (latestOwned.errors?.length) {
          const first = latestOwned.errors[0];
          const msg = `Lỗi lấy ${first.type}: ${first.message}`;
          errorMsg.value = msg;
          if (!silent) alert(msg);
        }
      } catch (error) {
        console.error('Refresh owned items failed', error);
        const msg =
          error?.response?.data?.message ||
          error?.response?.data ||
          error?.message ||
          'Không thể làm mới owned items. Thử lại sau.';
        errorMsg.value = msg;
        if (!silent) alert(msg);
      } finally {
        refreshing.value = false;
      }
    };

    onMounted(async () => {
      try {
        await ensureAssets();
        if (userStore.user?.ownedItems?.entitlementsByTypes?.length) {
          mapOwnedItems();
        } else {
          // Auto load owned items nếu chưa có dữ liệu
          await refreshOwned(true);
        }
      } finally {
        loading.value = false;
      }
    });

    return {
      items,
      loading,
      refreshing,
      selectedType,
      search,
      filteredItems,
      typeOptions,
      countByType,
      typeLabel,
      typeColor,
      getRiotId,
      shortId,
      refreshOwned,
      openProfile,
      errorMsg,
      weaponGroups,
      showLevels,
      showChromas,
      hasVariantType,
      page,
      totalPages,
      pagedItems,
      toggleWeapon,
      isCollapsed,
      toggleAllWeapons,
      weaponOptions,
      weaponFilter,
      collapsedAll,
      showWeaponFilters,
    };
  },
};
</script>

<style scoped>
.owned-view {
  width: 100%;
  max-width: 1200px;
  padding: 1.25rem 0.75rem 2rem;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.page-hero {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1rem;
  background: linear-gradient(135deg, #1f1f1f 0%, #0f0f0f 100%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 1.25rem 1.5rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
}

.hero-left h1 {
  font-size: 1.75rem;
  margin: 0.2rem 0 0.4rem;
}

.subtitle {
  color: #c7c7c7;
  line-height: 1.5;
  max-width: 620px;
}

.eyebrow {
  text-transform: uppercase;
  letter-spacing: 1px;
  font-size: 0.75rem;
  color: #fa4454;
  font-weight: 700;
  margin: 0;
}

.hero-actions {
  margin-top: 0.75rem;
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.pill-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 1rem;
  background: #fa4454;
  color: #fff;
  border: none;
  border-radius: 999px;
  cursor: pointer;
  font-weight: 600;
  transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;
}

.pill-btn .icon {
  font-size: 1rem;
}

.pill-btn .dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #30e0a1;
  box-shadow: 0 0 0 4px rgba(48, 224, 161, 0.15);
}

.pill-btn.ghost {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}

.pill-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.pill-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(250, 68, 84, 0.35);
}

.loader {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.hero-right {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  align-items: stretch;
}

.metric-card {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 0.85rem;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.metric-label {
  margin: 0;
  color: #9da4b3;
  font-size: 0.8rem;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.metric-value {
  margin: 0.2rem 0 0.15rem;
  font-size: 1.6rem;
}

.metric-sub {
  margin: 0;
  color: #80889a;
  font-size: 0.85rem;
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.9rem;
  align-items: stretch;
  justify-content: space-between;
  padding: 0.75rem 0.85rem;
  border-radius: 14px;
  background: radial-gradient(circle at top left, rgba(250, 68, 84, 0.09), transparent 55%),
    radial-gradient(circle at bottom right, rgba(123, 215, 255, 0.08), transparent 55%),
    rgba(10, 10, 10, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow:
    0 12px 30px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(12px);
}

.chip-group {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
  max-width: 100%;
}

.chip {
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: radial-gradient(circle at top left, rgba(255, 255, 255, 0.08), transparent 60%);
  color: #fff;
  padding: 0.45rem 0.85rem;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  cursor: pointer;
  transition: all 0.18s ease-out;
  font-size: 0.86rem;
  white-space: nowrap;
}

.chip:hover {
  border-color: rgba(250, 68, 84, 0.7);
  transform: translateY(-1px);
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.45);
}

.chip.active {
  border-color: #fa4454;
  box-shadow:
    0 8px 22px rgba(250, 68, 84, 0.35),
    0 0 0 1px rgba(250, 68, 84, 0.35);
  background: linear-gradient(135deg, rgba(250, 68, 84, 0.25), rgba(255, 107, 122, 0.15));
}

.chip-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.45);
}

.chip-count {
  background: rgba(0, 0, 0, 0.45);
  padding: 0.15rem 0.55rem;
  border-radius: 999px;
  font-size: 0.78rem;
  color: #e2e6f3;
}

.search-row {
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  width: 100%;
}

.search-box {
  flex: 1 1 220px;
  display: flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.55rem 0.8rem;
  background: rgba(5, 5, 5, 0.7);
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  min-width: 200px;
}

.search-box .icon {
  opacity: 0.7;
}

.search-box input {
  background: transparent;
  border: none;
  outline: none;
  color: #fff;
  width: 100%;
  font-size: 0.9rem;
}

.filter-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.5rem 0.9rem;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.55);
  color: #e2e6f3;
  cursor: pointer;
  font-size: 0.8rem;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.filter-toggle:hover {
  border-color: #fa4454;
  color: #fa4454;
}

.filter-toggle-icon {
  font-size: 0.7rem;
}

.skin-actions {
  display: flex;
  flex: 1 1 auto;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
  justify-content: flex-end;
  min-width: 260px;
}

.weapon-filter-row {
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 0.6rem;
  flex-wrap: wrap;
  margin-top: 0.6rem;
  width: 100%;
}

.pill-scroll {
  display: inline-flex;
  gap: 0.4rem;
  max-width: 100%;
  overflow-x: auto;
  flex-wrap: wrap;
  padding: 0.25rem 0.25rem 0.15rem;
  flex: 1 1 200px;
}

.pill-scroll.two-rows {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  column-gap: 0.45rem;
  row-gap: 0.35rem;
  padding-right: 0.35rem;
  flex: 1 1 240px;
  min-width: 0;
  max-width: 100%;
}

.pill-filter {
  padding: 0.4rem 0.85rem;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.04);
  color: #fff;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.pill-filter.active {
  border-color: #fa4454;
  box-shadow: 0 6px 14px rgba(250, 68, 84, 0.25);
  background: rgba(250, 68, 84, 0.18);
}

.collapse-toggle {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #fff;
  padding: 0.45rem 0.9rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.collapse-toggle:hover {
  border-color: #fa4454;
  color: #fa4454;
}

.item-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 0.9rem;
}

.item-card {
  background: linear-gradient(150deg, #232323 0%, #151515 100%);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.35);
  transition: transform 0.2s, border-color 0.2s;
}

.item-card:hover {
  transform: translateY(-4px);
  border-color: rgba(250, 68, 84, 0.3);
}

.item-media {
  position: relative;
  background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.08), transparent 55%),
    radial-gradient(circle at 70% 40%, rgba(250, 68, 84, 0.16), transparent 60%);
  min-height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.item-media img {
  max-width: 100%;
  max-height: 140px;
  object-fit: contain;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.4));
}

.item-media .placeholder {
  color: #777;
  font-size: 0.9rem;
  padding: 1rem;
}
.item-body {
  padding: 0.85rem 0.95rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.item-body.center-text {
  align-items: center;
  text-align: center;
}

.item-headline h4 {
  margin: 0;
  font-size: 1rem;
}

/* .tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-top: 0.35rem;
}

.tag {
  background: rgba(255, 255, 255, 0.06);
  color: #d8d8d8;
  padding: 0.35rem 0.55rem;
  border-radius: 8px;
  font-size: 0.8rem;
} */

.state-box {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 320px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
}

.state-box.empty {
  flex-direction: column;
  gap: 0.4rem;
  text-align: center;
}

.empty-icon {
  font-size: 2.4rem;
}

/* Skins layout */
.weapon-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.weapon-block {
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  padding: 0.75rem 0.85rem 0.9rem;
  background: linear-gradient(145deg, #1f1f1f 0%, #141414 100%);
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  padding-bottom: 0.35rem;
  border-bottom: 2px solid #fa4454;
}

.category-title-row {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}

.category-title {
  color: #ffffff;
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  margin: 0;
}

.category-count {
  color: #9aa1af;
  font-size: 0.85rem;
}

.collapse-btn {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #fff;
  padding: 0.35rem 0.6rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.2s;
}

.collapse-btn:hover {
  border-color: #fa4454;
  color: #fa4454;
}

.skin-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 0.75rem;
}

.weapon-card {
  background: linear-gradient(145deg, #2a2a2a 0%, #1f1f1f 100%);
  border-radius: 8px;
  padding: 0.75rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  position: relative;
  border: 1px solid rgba(255, 255, 255, 0.05);
  overflow: hidden;
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
}

.weapon-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, transparent, #fa4454, transparent);
  opacity: 0;
  transition: opacity 0.25s ease;
}

.weapon-card:hover {
  transform: translateY(-6px) scale(1.01);
  box-shadow: 0 10px 26px rgba(250, 68, 84, 0.32);
  border-color: rgba(250, 68, 84, 0.35);
}

.weapon-card:hover::before {
  opacity: 1;
}

.weapon-card-inner {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.weapon-header {
  margin-bottom: 0.25rem;
}

.weapon-name {
  color: #ffffff;
  font-size: 0.9rem;
  font-weight: 700;
  letter-spacing: 0.8px;
  margin: 0 0 0.3rem;
  text-transform: uppercase;
}

.weapon-border-accent {
  width: 40px;
  height: 2px;
  background: linear-gradient(90deg, #fa4454, transparent);
  border-radius: 2px;
}

.weapon-image-container {
  width: 100%;
  height: 170px;
  background: linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.weapon-image {
  max-width: 90%;
  max-height: 100%;
  object-fit: contain;
  transition: transform 0.25s ease;
}

.weapon-card:hover .weapon-image {
  transform: scale(1.04);
}

.skin-card {
  background: linear-gradient(150deg, #232323 0%, #151515 100%);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.35);
  transition: transform 0.2s, border-color 0.2s;
}

.skin-card:hover {
  transform: translateY(-4px);
  border-color: rgba(250, 68, 84, 0.3);
}

.weapon-actions.compact {
  display: flex;
  gap: 0.4rem;
  justify-content: center;
  width: 100%;
}

.action-btn {
  padding: 0.6rem 0.9rem;
  font-size: 0.7rem;
  border-radius: 8px;
  border-width: 1.5px;
}

.action-btn:hover:not(:disabled) {
  transform: translateY(-2px);
}

.pager {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.6rem;
  margin-top: 1rem;
}

.pager-btn {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #fff;
  padding: 0.45rem 0.9rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.pager-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.pager-btn:hover:not(:disabled) {
  border-color: #fa4454;
  color: #fa4454;
}

.pager-text {
  color: #9aa1af;
  font-size: 0.9rem;
}

.weapon-footer {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.weapon-skin-name {
  color: #ddd;
  font-size: 0.9rem;
  font-weight: 600;
}

.weapon-actions {
  display: flex;
  gap: 0.4rem;
}

.action-btn {
  flex: 1;
  padding: 0.7rem 1rem;
  background: linear-gradient(135deg, rgba(250, 68, 84, 0.15) 0%, rgba(217, 58, 74, 0.15) 100%);
  color: #ffffff;
  border: 1.5px solid rgba(250, 68, 84, 0.3);
  border-radius: 10px;
  cursor: pointer;
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow:
    0 0 10px rgba(250, 68, 84, 0.2),
    inset 0 0 20px rgba(250, 68, 84, 0.05);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
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
}

.action-btn:hover:not(:disabled) {
  color: #ffffff;
  border-color: rgba(250, 68, 84, 0.6);
  box-shadow:
    0 0 14px rgba(250, 68, 84, 0.35),
    inset 0 0 24px rgba(250, 68, 84, 0.1);
  transform: translateY(-2px);
}

.action-btn:hover::before {
  left: 100%;
}

.action-btn:hover::after {
  opacity: 0.15;
}

.action-btn:active {
  transform: translateY(0);
  box-shadow: 0 4px 10px rgba(250, 68, 84, 0.2);
}

.action-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.badge {
  position: absolute;
  top: 10px;
  left: 10px;
  padding: 0.35rem 0.55rem;
  border-radius: 10px;
  font-size: 0.75rem;
  font-weight: 700;
  color: #0f0f10;
}

@media (max-width: 992px) {
  .page-hero {
    grid-template-columns: 1fr;
  }

  .hero-right {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .toolbar {
    flex-direction: column;
    align-items: stretch;
    padding: 0.75rem 0.7rem;
  }

  .chip-group {
    order: 2;
  }

  .search-row {
    order: 1;
    justify-content: stretch;
  }

  .search-box {
    width: 100%;
  }

  .pill-scroll.two-rows {
    display: inline-flex;
    flex-wrap: wrap;
    overflow: hidden;
    width: 100%;
    column-gap: 0.35rem;
    row-gap: 0.3rem;
  }

  .weapon-filter-row {
    flex-direction: column;
    align-items: stretch;
    width: 100%;
    gap: 0.5rem;
  }

  .collapse-toggle {
    width: 100%;
    text-align: center;
  }

  .item-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }

  .action-btn {
    padding: 0.6rem 0.8rem;
    font-size: 0.72rem;
    border-radius: 9px;
  }
}
</style>


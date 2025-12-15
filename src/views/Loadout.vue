<template>
  <div class="loadout-view">
    <!-- Profile Header (Top Horizontal) -->
    <div class="profile-header-container">
      <div class="profile-header">
        <div class="profile-header-info">
          <h3 class="profile-name">{{ getRiotId() }}</h3>
          <p class="profile-level">Level {{ user.progress?.level || 0 }}</p>
          <div class="profile-info">
            <span class="profile-region">
              <span class="profile-label">{{ $t('region') || 'Region' }}:</span> {{ getFullRegionName(user.region) }}
            </span>
          </div>
        </div>
        <div class="profile-right-section">
          <div class="profile-balances">
            <div class="balance-item">
              <CurrencyIcon icon="vp" />
              <span>{{ user.balances?.vp || 0 }}</span>
            </div>
            <div class="balance-item">
              <CurrencyIcon icon="rad" />
              <span>{{ user.balances?.rad || 0 }}</span>
            </div>
            <div class="balance-item">
              <CurrencyIcon icon="kc" />
              <span>{{ user.balances?.kc || 0 }}</span>
            </div>
          </div>
          <div class="profile-xp-container">
            <span class="profile-xp">{{ getXpDisplay() }}</span>
            <div class="xp-progress-bar">
              <div class="xp-progress-fill" :style="{ width: getXpProgressPercentage() + '%' }"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="!assetsLoaded" class="loading-wrapper">
      <Loading :msg="$t('loading') || 'Loading...'" />
    </div>

    <!-- Empty State -->
    <div v-else-if="!user.loadout || !user.loadout.guns || user.loadout.guns.length === 0" class="empty-state">
      <div class="empty-state-content">
        <h2 class="empty-state-title">{{ $t('noLoadout') || 'No Loadout Available' }}</h2>
        <p class="empty-state-message">
          {{ $t('noLoadoutMessage') || 'Your loadout data is not available. Please check your connection or try again later.' }}
        </p>
      </div>
    </div>

    <!-- Loadout Content -->
    <div v-else class="loadout-content">
      <div class="weapon-columns">
        <div
          v-for="column in weaponColumns"
          :key="column.id"
          class="weapon-column"
        >
          <!-- Identity Column (Column 5) -->
          <template v-if="column.isIdentity">
            <!-- Player Card -->
            <div class="identity-category">
              <div class="category-header">
                <h2 class="category-title">PLAYER CARDS</h2>
              </div>
              <div class="identity-item">
                <div class="invItem invItemCard">
                  <div class="insideCard">
                    <div class="playerName">{{ user.loadout?.identity?.playerCardID ? getPlayerCardName() : 'ValorantBuilder.com' }}</div>
                    <div class="playerTitle">{{ getPlayerTitleName() || '' }}</div>
                  </div>
                  <img
                    v-if="getPlayerCardImage()"
                    :src="getPlayerCardImage()"
                    :alt="getPlayerCardName()"
                    class="cardImage"
                    loading="lazy"
                  />
                  <div v-else class="identity-placeholder">
                    <span class="placeholder-icon">🃏</span>
                  </div>
                  <div class="cardFrame">
                    <img class="cardFrameLeft" src="https://www.valorantbuilder.com/assets/playercard_frame-P7bb2eob.png" alt="Frame Left">
                    <img class="cardFrameRight" src="https://www.valorantbuilder.com/assets/playercard_frame-P7bb2eob.png" alt="Frame Right">
                  </div>
                </div>
              </div>
            </div>

            <!-- Expressions (Sprays) -->
            <div class="identity-category">
              <div class="category-header">
                <h2 class="category-title">EXPRESSIONS</h2>
              </div>
              <div class="expressions-container">
                <div class="invItem invItemSpray">
                  <img
                    class="sprayWheel"
                    src="https://www.valorantbuilder.com/assets/spray_wheel-6jxut7Wa.png"
                    alt="Spray Wheel"
                  />
                  
                  <!-- Top Spray -->
                  <div
                    v-if="user.loadout?.sprays && user.loadout.sprays[0]"
                    class="invItem sprayDirectionTopButton sprayItem"
                  >
                    <img
                      v-if="getSprayImage(user.loadout.sprays[0])"
                      :src="getSprayImage(user.loadout.sprays[0])"
                      :alt="getSprayName(user.loadout.sprays[0])"
                      class="sprayImage"
                      loading="lazy"
                    />
                    <div v-else class="spray-placeholder-small">
                      <span class="placeholder-icon">🎨</span>
                    </div>
                    <div class="spray-tooltip">{{ getSprayName(user.loadout.sprays[0]) }}</div>
                  </div>
                  <img
                    v-if="user.loadout?.sprays && user.loadout.sprays[0]"
                    class="sprayDirectionTop"
                    src="https://www.valorantbuilder.com/assets/spray_direction-GOdUHaHR.png"
                    alt="Top"
                  />
                  
                  <!-- Right Spray -->
                  <div
                    v-if="user.loadout?.sprays && user.loadout.sprays[1]"
                    class="invItem sprayDirectionRightButton sprayItem"
                  >
                    <img
                      v-if="getSprayImage(user.loadout.sprays[1])"
                      :src="getSprayImage(user.loadout.sprays[1])"
                      :alt="getSprayName(user.loadout.sprays[1])"
                      class="sprayImage"
                      loading="lazy"
                    />
                    <div v-else class="spray-placeholder-small">
                      <span class="placeholder-icon">🎨</span>
                    </div>
                    <div class="spray-tooltip">{{ getSprayName(user.loadout.sprays[1]) }}</div>
                  </div>
                  <img
                    v-if="user.loadout?.sprays && user.loadout.sprays[1]"
                    class="sprayDirectionRight"
                    src="https://www.valorantbuilder.com/assets/spray_direction-GOdUHaHR.png"
                    alt="Right"
                  />
                  
                  <!-- Bottom Spray -->
                  <div
                    v-if="user.loadout?.sprays && user.loadout.sprays[2]"
                    class="invItem sprayDirectionBottomButton sprayItem"
                  >
                    <img
                      v-if="getSprayImage(user.loadout.sprays[2])"
                      :src="getSprayImage(user.loadout.sprays[2])"
                      :alt="getSprayName(user.loadout.sprays[2])"
                      class="sprayImage"
                      loading="lazy"
                    />
                    <div v-else class="spray-placeholder-small">
                      <span class="placeholder-icon">🎨</span>
                    </div>
                    <div class="spray-tooltip">{{ getSprayName(user.loadout.sprays[2]) }}</div>
                  </div>
                  <img
                    v-if="user.loadout?.sprays && user.loadout.sprays[2]"
                    class="sprayDirectionBottom"
                    src="https://www.valorantbuilder.com/assets/spray_direction-GOdUHaHR.png"
                    alt="Bottom"
                  />
                  
                  <!-- Left Spray -->
                  <div
                    v-if="user.loadout?.sprays && user.loadout.sprays[3]"
                    class="invItem sprayDirectionLeftButton sprayItem"
                  >
                    <img
                      v-if="getSprayImage(user.loadout.sprays[3])"
                      :src="getSprayImage(user.loadout.sprays[3])"
                      :alt="getSprayName(user.loadout.sprays[3])"
                      class="sprayImage"
                      loading="lazy"
                    />
                    <div v-else class="spray-placeholder-small">
                      <span class="placeholder-icon">🎨</span>
                    </div>
                    <div class="spray-tooltip">{{ getSprayName(user.loadout.sprays[3]) }}</div>
                  </div>
                  <img
                    v-if="user.loadout?.sprays && user.loadout.sprays[3]"
                    class="sprayDirectionLeft"
                    src="https://www.valorantbuilder.com/assets/spray_direction-GOdUHaHR.png"
                    alt="Left"
                  />
                </div>
                <div v-if="!user.loadout?.sprays || user.loadout.sprays.length === 0" class="category-empty">
                  <p class="category-empty-text">{{ $t('noSprays') || 'No sprays' }}</p>
                </div>
              </div>
            </div>
          </template>

          <!-- Weapon Categories -->
          <template v-else>
            <div
              v-for="category in column.categories"
              :key="category.name"
              class="weapon-category"
            >
              <div class="category-header">
                <h2 class="category-title">{{ category.name }}</h2>
              </div>

              <div class="weapon-list">
                <div
                  v-for="gun in getGunsByCategory(category.weapons)"
                  :key="gun.id"
                  class="weapon-card"
                  :class="{ 'has-actions': hasLevelsOrChromas(gun) }"
                >
                  <div class="weapon-card-inner">
                    <div class="weapon-header">
                      <h3 class="weapon-name">{{ getWeaponName(gun) }}</h3>
                      <div class="weapon-border-accent"></div>
                    </div>

                  <div class="weapon-image-container">
                    <img
                      v-if="getGunImage(gun)"
                      :src="getGunImage(gun)"
                      :alt="getGunName(gun)"
                      class="weapon-image"
                      loading="lazy"
                    />
                    <div v-else class="weapon-image-placeholder">
                      <span class="placeholder-icon">🔫</span>
                      <span class="placeholder-text">{{ $t('noImage') || 'No Image' }}</span>
                    </div>
                    <!-- Charm (Gun Buddy) -->
                    <div v-if="getCharmImage(gun)" class="weapon-charm">
                      <img
                        :src="getCharmImage(gun)"
                        :alt="getCharmName(gun)"
                        class="charm-icon"
                        loading="lazy"
                      />
                      <div class="charm-tooltip">{{ getCharmName(gun) }}</div>
                    </div>
                  </div>

                    <div class="weapon-footer">
                      <div class="weapon-skin-name">{{ getGunSkinName(gun) }}</div>
                      <div v-if="hasLevelsOrChromas(gun)" class="weapon-actions">
                        <button
                          @click="showLevels(gun)"
                          class="action-btn action-btn-levels"
                          :title="$t('levels') || 'Levels'"
                        >
                          <span class="btn-text">{{ $t('levels') || 'Levels' }}</span>
                        </button>
                        <button
                          @click="showChromas(gun)"
                          class="action-btn action-btn-chromas"
                          :title="$t('chromas') || 'Chromas'"
                        >
                          <span class="btn-text">{{ $t('chromas') || 'Chromas' }}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Empty category message -->
                <div v-if="getGunsByCategory(category.weapons).length === 0" class="category-empty">
                  <p class="category-empty-text">{{ $t('noWeaponsInCategory') || 'No weapons in this category' }}</p>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, ref, onMounted } from 'vue';
import { useUserStore } from '../stores/user';
import { useMediaPopupStore } from '../stores/mediaPopup';
import { getAssets, loadAssets } from '../utils/valorant-assets';
import Loading from '../components/Loading.vue';
import CurrencyIcon from '../components/CurrencyIcon.vue';

// Weapon UUID to name mapping
const WEAPON_MAP = {
  '29a0cfab-485b-f5d3-5a93-78af2d4b1b6e': 'Classic',
  '42da8ccc-40c5-01ff-0152-d89d1b5e4a4b': 'Shorty',
  '44d4e95c-4137-a7b2-d3ec-39b1f5d0066b': 'Frenzy',
  '1baa85b4-4c70-1284-64bb-6481dfc3d4ed': 'Ghost',
  'e336c6b8-418d-9340-d77f-7a9e4cfe0702': 'Sheriff',
  'f7e1b454-4ad4-1063-9d81-3e94f1bf87d7': 'Stinger',
  '462080d1-4035-2937-7c09-27aa2a5c27a7': 'Spectre',
  '910be174-449b-c412-ab22-d0670e37f209': 'Bucky',
  'ec845bf4-4f79-fdaa-3bad-8db61bb59cd8': 'Judge',
  'ae3de142-4d85-254d-dd26-4e90bedd6729': 'Bulldog',
  '4ade7faa-4cf1-8376-95ef-398844da59b8': 'Guardian',
  'ee8e8d15-496b-07ac-e5f6-45fbe7496031': 'Phantom',
  '9c82e19d-457c-4880-1617-048bce63e607': 'Vandal',
  '2f591ba2-4bee-86b3-b9c1-798b0d9b7c75': 'Marshal',
  'a03b24d3-4319-996d-0f1c-94bcaaa7ace4': 'Operator',
  '63e6c2b6-4a8e-674c-831f-d585be620503': 'Odin',
  '55d8a0f4-427c-c397-8655-26898e99944b': 'Ares',
  'a03b24d3-4319-996d-0f1c-94bcaaa7ace46': 'Outlaw'
};

// Weapon categories
const WEAPON_CATEGORIES = [
  {
    name: 'SIDEARMS',
    weapons: ['Classic', 'Shorty', 'Frenzy', 'Ghost', 'Sheriff'],
  },
  {
    name: 'SMGS',
    weapons: ['Stinger', 'Spectre'],
  },
  {
    name: 'SHOTGUNS',
    weapons: ['Bucky', 'Judge'],
  },
  {
    name: 'RIFLES',
    weapons: ['Bulldog', 'Guardian', 'Phantom', 'Vandal'],
  },
  {
    name: 'SNIPER RIFLES',
    weapons: ['Marshal', 'Outlaw', 'Operator'],
  },
  {
    name: 'MACHINE GUNS',
    weapons: ['Ares', 'Odin'],
  },
  {
    name: 'MELEE',
    weapons: ['Melee'],
  },
];

export default {
  name: 'Loadout',
  components: {
    Loading,
    CurrencyIcon,
  },
  setup() {
    const userStore = useUserStore();
    const mediaPopupStore = useMediaPopupStore();
    const assetsLoaded = ref(false);
    const weaponCategories = ref(WEAPON_CATEGORIES);
    
    // Cache for skin UUID to weapon UUID mapping
    const skinToWeaponCache = ref(new Map());

    // Ensure assets are loaded
    onMounted(async () => {
      try {
        await loadAssets();
        const assets = getAssets();
        assetsLoaded.value = true;
      } catch (error) {
        console.error('Failed to load assets:', error);
        assetsLoaded.value = true;
      }
    });

    const getAssetsData = () => {
      return getAssets();
    };

    const getWeaponUUIDFromSkin = (skin, assets) => {
      // Check cache first
      if (skinToWeaponCache.value.has(skin.uuid)) {
        return skinToWeaponCache.value.get(skin.uuid);
      }

      let weaponUUID = null;
      
      // Method 1: Direct from skin.weapon.uuid
      if (skin.weapon && skin.weapon.uuid) {
        weaponUUID = skin.weapon.uuid;
      }
      // Method 2: Use themeUuid (in valorant-api.com, themeUuid is often the weapon UUID)
      else if (skin.themeUuid) {
        // Check if themeUuid is actually a weapon UUID
        if (assets.weapons && assets.weapons.length > 0) {
          const weapon = assets.weapons.find((w) => w.uuid === skin.themeUuid);
          if (weapon) {
            weaponUUID = skin.themeUuid;
          }
        }
        // If not found, still try themeUuid as it might be correct
        if (!weaponUUID) {
          weaponUUID = skin.themeUuid;
        }
      }
      // Method 3: Find weapon by matching skin in weapon's skins array
      if (!weaponUUID && assets.weapons && assets.weapons.length > 0) {
        for (const weapon of assets.weapons) {
          if (weapon.skins && weapon.skins.some((s) => s.uuid === skin.uuid)) {
            weaponUUID = weapon.uuid;
            break;
          }
        }
      }

      // Cache the result
      if (weaponUUID) {
        skinToWeaponCache.value.set(skin.uuid, weaponUUID);
      }

      return weaponUUID;
    };

    const getWeaponNameFromGun = (gun) => {
      const assets = getAssetsData();
      if (!assets || !assets.skins || assets.skins.length === 0) {
        return 'Unknown';
      }

      // Try to find skin by skinID or skinLevelID
      let skin = null;
      if (gun.skinLevelID) {
        for (const s of assets.skins) {
          if (s.levels && s.levels.some((l) => l.uuid === gun.skinLevelID)) {
            skin = s;
            break;
          }
        }
      }
      if (!skin && gun.skinID) {
        skin = assets.skins.find((s) => s.uuid === gun.skinID);
      }

      if (!skin) {
        return 'Unknown';
      }

      // Get weapon UUID using improved function
      const weaponUUID = getWeaponUUIDFromSkin(skin, assets);

      // If we have weaponUUID, try to get weapon name
      if (weaponUUID) {
        // Try to get weapon name from weapon UUID mapping
        if (WEAPON_MAP[weaponUUID]) {
          return WEAPON_MAP[weaponUUID];
        }
        
        // Try to get from weapons data
        if (assets.weapons && assets.weapons.length > 0) {
          const weapon = assets.weapons.find((w) => w.uuid === weaponUUID);
          if (weapon && weapon.displayName) {
            return weapon.displayName.replace(/^Standard\s+/i, '').trim();
          }
        }
      }
      
      // Fall back to skin.weapon.displayName if available
      if (skin.weapon && skin.weapon.displayName) {
        const weaponName = skin.weapon.displayName.replace(/^Standard\s+/i, '').trim();
        // Extract weapon name from skin name (e.g., "Prime Vandal" -> "Vandal")
        const parts = weaponName.split(' ');
        if (parts.length > 1) {
          // Try to find a known weapon name in the parts
          const knownWeapons = ['Classic', 'Shorty', 'Frenzy', 'Ghost', 'Sheriff', 'Stinger', 'Spectre', 
                               'Bucky', 'Judge', 'Bulldog', 'Guardian', 'Phantom', 'Vandal', 
                               'Marshal', 'Operator', 'Odin', 'Ares', 'Outlaw', 'Melee'];
          for (const part of parts) {
            if (knownWeapons.includes(part)) {
              return part;
            }
          }
          // Return last part as it's usually the weapon name
          return parts[parts.length - 1];
        }
        return weaponName;
      }

      // Last resort: try to extract from skin displayName
      if (skin.displayName) {
        const parts = skin.displayName.split(' ');
        if (parts.length > 1) {
          const knownWeapons = ['Classic', 'Shorty', 'Frenzy', 'Ghost', 'Sheriff', 'Stinger', 'Spectre', 
                               'Bucky', 'Judge', 'Bulldog', 'Guardian', 'Phantom', 'Vandal', 
                               'Marshal', 'Operator', 'Odin', 'Ares', 'Outlaw', 'Melee', 'Knife'];
          for (const part of parts) {
            if (knownWeapons.includes(part)) {
              // Special handling for Melee/Knife
              if (part === 'Knife') {
                return 'Melee';
              }
              return part;
            }
          }
          // Check if it's a melee weapon by checking for common melee keywords
          const displayNameLower = skin.displayName.toLowerCase();
          if (displayNameLower.includes('knife') || displayNameLower.includes('melee') || 
              displayNameLower.includes('blade') || displayNameLower.includes('sword')) {
            return 'Melee';
          }
          return parts[parts.length - 1];
        }
        // Check single word for melee
        const displayNameLower = skin.displayName.toLowerCase();
        if (displayNameLower.includes('knife') || displayNameLower.includes('melee') || 
            displayNameLower.includes('blade') || displayNameLower.includes('sword')) {
          return 'Melee';
        }
      }

      return 'Unknown';
    };

    const getWeaponName = (gun) => {
      // gun can be either a gun object or a weaponId string
      if (typeof gun === 'string') {
        // Legacy support for weaponId string
        return (WEAPON_MAP[gun] || 'Unknown').toUpperCase();
      }
      const weaponName = getWeaponNameFromGun(gun);
      return weaponName.toUpperCase();
    };

    const getWeaponNameFromGunID = (gunID) => {
      // gun.id is the weapon UUID, try to get name directly from WEAPON_MAP
      if (WEAPON_MAP[gunID]) {
        return WEAPON_MAP[gunID];
      }
      
      // Try to get from assets weapons data
      const assets = getAssetsData();
      if (assets && assets.weapons && assets.weapons.length > 0) {
        const weapon = assets.weapons.find((w) => w.uuid === gunID);
        if (weapon && weapon.displayName) {
          return weapon.displayName.replace(/^Standard\s+/i, '').trim();
        }
      }
      
      return null;
    };

    const getGunsByCategory = (categoryWeapons) => {
      if (!userStore.user.loadout?.guns) {
        return [];
      }

      const filteredGuns = userStore.user.loadout.guns.filter((gun) => {
        // Try to get weapon name from gun.id first (weapon UUID from loadout)
        let weaponName = getWeaponNameFromGunID(gun.id);
        
        // Fallback to getting from skin data if gun.id doesn't work
        if (!weaponName) {
          weaponName = getWeaponNameFromGun(gun);
        }
        
        // If still no weapon name, skip this gun
        if (!weaponName || weaponName === 'Unknown') {
          return false;
        }

        // Normalize weapon name for comparison (case-insensitive)
        const normalizedWeaponName = weaponName.toLowerCase();
        const normalizedCategoryWeapons = categoryWeapons.map((w) => w.toLowerCase());

        // Special handling for Melee category - match localized names
        if (categoryWeapons.includes('Melee')) {
          if (normalizedWeaponName === 'melee' || normalizedWeaponName === 'knife') {
            return true;
          }
          const meleeKeywords = ['cận chiến', 'dao', 'dao găm', 'kiếm', 'blade', 'sword'];
          if (meleeKeywords.some((kw) => normalizedWeaponName.includes(kw))) {
            return true;
          }
        }

        const isInCategory = normalizedCategoryWeapons.includes(normalizedWeaponName);
        return isInCategory;
      });

      // Sort guns according to the order in categoryWeapons array
      const sortedGuns = filteredGuns.sort((a, b) => {
        // Try to get weapon name from gun.id first
        let weaponNameA = getWeaponNameFromGunID(a.id);
        let weaponNameB = getWeaponNameFromGunID(b.id);
        
        // Fallback to getting from skin data
        if (!weaponNameA) {
          weaponNameA = getWeaponNameFromGun(a);
        }
        if (!weaponNameB) {
          weaponNameB = getWeaponNameFromGun(b);
        }
        
        const normalizedA = weaponNameA ? weaponNameA.toLowerCase() : '';
        const normalizedB = weaponNameB ? weaponNameB.toLowerCase() : '';
        
        const indexA = categoryWeapons.findIndex(w => w.toLowerCase() === normalizedA);
        const indexB = categoryWeapons.findIndex(w => w.toLowerCase() === normalizedB);
        
        // If weapon not found in order array, put it at the end
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        
        return indexA - indexB;
      });
      return sortedGuns;
    };

    const getGunImage = (gun) => {
      const assets = getAssetsData();
      if (!assets || !assets.skins || assets.skins.length === 0) return null;

      // Find skin first
      let skin = null;
      if (gun.skinID) {
        skin = assets.skins.find((s) => s.uuid === gun.skinID);
      }
      
      // If we have chromaID, try to get chroma image first (equipped variant)
      if (gun.chromaID && skin && skin.chromas && skin.chromas.length > 0) {
        const chroma = skin.chromas.find((c) => c.uuid === gun.chromaID);
        if (chroma) {
          // Prefer fullRender for chroma as it shows the variant better
          if (chroma.fullRender) return chroma.fullRender;
          if (chroma.displayIcon) return chroma.displayIcon;
          if (chroma.streamedVideo) return chroma.streamedVideo;
        }
      }

      // Fall back to level image if skinLevelID is provided
      if (gun.skinLevelID) {
        if (!skin) {
          for (const s of assets.skins) {
            if (!s.levels || s.levels.length === 0) continue;
            const level = s.levels.find((l) => l.uuid === gun.skinLevelID);
            if (level) {
              skin = s;
              break;
            }
          }
        }
        
        if (skin && skin.levels) {
          const level = skin.levels.find((l) => l.uuid === gun.skinLevelID);
          if (level) {
            if (level.displayIcon) return level.displayIcon;
            // Try to find any level with icon
            const levelWithIcon = skin.levels.find((l) => l.displayIcon);
            if (levelWithIcon && levelWithIcon.displayIcon) return levelWithIcon.displayIcon;
          }
        }
      }

      // Fall back to skin level image
      if (skin) {
        if (skin.levels && skin.levels.length > 0) {
          const levelWithIcon = skin.levels.find((l) => l.displayIcon);
          if (levelWithIcon && levelWithIcon.displayIcon) return levelWithIcon.displayIcon;
        }
        if (skin.displayIcon) return skin.displayIcon;
      }

      return null;
    };

    const cleanSkinName = (name) => {
      if (!name) return name;
      
      // Remove patterns like "Level X", "Level X (Variant X ...)", etc.
      // Pattern: "Reaver Operator Level 4 (Variant 3 White)" -> "Reaver Operator"
      // Pattern: "Skin Name // Level 1" -> "Skin Name"
      // Pattern: "Skin Name (Variant X)" -> "Skin Name"
      
      let cleaned = name.trim();
      
      // Remove "//" and everything after it
      if (cleaned.includes('//')) {
        cleaned = cleaned.split('//')[0].trim();
      }
      
      // Remove Level X patterns (case-insensitive)
      cleaned = cleaned.replace(/\s*Level\s+\d+/gi, '');
      
      // Remove (Variant X ...) patterns - match both "Variant 3 White" and "Variant X Color"
      cleaned = cleaned.replace(/\s*\(Variant\s+\d+\s*[^)]*\)/gi, '');
      
      // Remove any remaining parentheses with content
      cleaned = cleaned.replace(/\s*\([^)]*\)/g, '');
      
      // Clean up multiple spaces
      cleaned = cleaned.replace(/\s+/g, ' ').trim();
      
      return cleaned;
    };

    const getGunName = (gun) => {
      const assets = getAssetsData();
      if (!assets || !assets.skins || assets.skins.length === 0) {
        return getWeaponName(gun);
      }

      // Find skin
      let skin = null;
      if (gun.skinID) {
        skin = assets.skins.find((s) => s.uuid === gun.skinID);
      }
      
      if (!skin && gun.skinLevelID) {
        for (const s of assets.skins) {
          if (!s.levels || s.levels.length === 0) continue;
          const level = s.levels.find((l) => l.uuid === gun.skinLevelID);
          if (level) {
            skin = s;
            break;
          }
        }
      }

      if (!skin) {
        return getWeaponName(gun);
      }

      // Always use base skin displayName, not chroma name
      // Chroma names often contain "Level X (Variant X ...)" which we don't want
      if (skin.displayName) {
        return cleanSkinName(skin.displayName);
      }

      return getWeaponName(gun);
    };

    const getGunSkinName = (gun) => {
      const assets = getAssetsData();
      const skinName = getGunName(gun);
      const weaponName = getWeaponName(gun);
      
      // Clean the skin name to remove Level/Variant info
      let cleanedSkinName = cleanSkinName(skinName);
      
      // If we have chroma, use base skin name instead of chroma name
      if (gun.chromaID && gun.skinID && assets && assets.skins) {
        const skin = assets.skins.find((s) => s.uuid === gun.skinID);
        if (skin && skin.displayName) {
          // Use base skin name instead of chroma name
          cleanedSkinName = cleanSkinName(skin.displayName);
        }
      }
      
      return cleanedSkinName !== weaponName ? cleanedSkinName : `Standard ${weaponName}`;
    };

    const hasLevelsOrChromas = (gun) => {
      if (!gun.skinID) return false;
      const assets = getAssetsData();
      if (!assets || !assets.skins || assets.skins.length === 0) return false;

      // Find skin by skinID or skinLevelID
      let skin = null;
      if (gun.skinLevelID) {
        for (const s of assets.skins) {
          if (s.levels && s.levels.some((l) => l.uuid === gun.skinLevelID)) {
            skin = s;
            break;
          }
        }
      }
      if (!skin && gun.skinID) {
        skin = assets.skins.find((s) => s.uuid === gun.skinID);
      }

      if (!skin) return false;
      return (
        (skin.levels && skin.levels.length > 0) ||
        (skin.chromas && skin.chromas.length > 0)
      );
    };

    const showLevels = (gun) => {
      if (!gun.skinID) return;
      const assets = getAssetsData();
      if (!assets || !assets.skins || assets.skins.length === 0) return;

      // Find skin
      let skin = null;
      if (gun.skinLevelID) {
        for (const s of assets.skins) {
          if (s.levels && s.levels.some((l) => l.uuid === gun.skinLevelID)) {
            skin = s;
            break;
          }
        }
      }
      if (!skin && gun.skinID) {
        skin = assets.skins.find((s) => s.uuid === gun.skinID);
      }

      if (!skin || !skin.levels) return;

      const levels = skin.levels
        .slice(0, 5)
        .map((level) => level.streamedVideo || level.displayIcon || '')
        .filter((url) => url && url.trim() !== '');

      if (levels.length > 0) {
        mediaPopupStore.showMediaPopup(levels, 'Levels');
      }
    };

    const showChromas = (gun) => {
      if (!gun.skinID) return;
      const assets = getAssetsData();
      if (!assets || !assets.skins || assets.skins.length === 0) return;

      // Find skin
      let skin = null;
      if (gun.skinLevelID) {
        for (const s of assets.skins) {
          if (s.levels && s.levels.some((l) => l.uuid === gun.skinLevelID)) {
            skin = s;
            break;
          }
        }
      }
      if (!skin && gun.skinID) {
        skin = assets.skins.find((s) => s.uuid === gun.skinID);
      }

      if (!skin || !skin.chromas) return;

      const chromas = skin.chromas
        .map((chroma) => chroma.streamedVideo || chroma.fullRender || '')
        .filter((url) => url && url.trim() !== '');

      if (chromas.length > 0) {
        mediaPopupStore.showMediaPopup(chromas, 'Chromas');
      }
    };

    // Helper functions for identity items
    const getPlayerCardImage = () => {
      if (!userStore.user.loadout?.identity?.playerCardID) return null;
      const assets = getAssetsData();
      if (!assets || !assets.cards || assets.cards.length === 0) return null;
      const card = assets.cards.find((c) => c.uuid === userStore.user.loadout.identity.playerCardID);
      if (!card) return null;
      if (card.largeArt) return card.largeArt;
      if (card.wideArt) return card.wideArt;
      if (card.smallArt) return card.smallArt;
      if (card.displayIcon) return card.displayIcon;
      return null;
    };

    const getPlayerCardName = () => {
      if (!userStore.user.loadout?.identity?.playerCardID) return 'VALORANT Card';
      const assets = getAssetsData();
      if (!assets || !assets.cards || assets.cards.length === 0) return 'VALORANT Card';
      const card = assets.cards.find((c) => c.uuid === userStore.user.loadout.identity.playerCardID);
      return card && card.displayName ? card.displayName : 'VALORANT Card';
    };

    const getPlayerTitleName = () => {
      if (!userStore.user.loadout?.identity?.playerTitleID) return '';
      const assets = getAssetsData();
      if (!assets || !assets.titles || assets.titles.length === 0) return '';
      const title = assets.titles.find((t) => t.uuid === userStore.user.loadout.identity.playerTitleID);
      return title && title.titleText ? title.titleText : '';
    };

    const getLevelBorderImage = () => {
      if (!userStore.user.loadout?.identity?.preferredLevelBorderID) return null;
      // Level border images from valorant-api
      return `https://media.valorant-api.com/levelborders/${userStore.user.loadout.identity.preferredLevelBorderID}/level.png`;
    };


    const getSprayImage = (spray) => {
      if (!spray.sprayID) return null;
      const assets = getAssetsData();
      if (!assets || !assets.sprays || assets.sprays.length === 0) return null;
      const sprayAsset = assets.sprays.find((s) => s.uuid === spray.sprayID);
      if (!sprayAsset) return null;
      if (sprayAsset.fullTransparentIcon) return sprayAsset.fullTransparentIcon;
      if (sprayAsset.displayIcon) return sprayAsset.displayIcon;
      return null;
    };

    const getSprayName = (spray) => {
      if (!spray.sprayID) return 'VALORANT Spray';
      const assets = getAssetsData();
      if (!assets || !assets.sprays || assets.sprays.length === 0) return 'VALORANT Spray';
      const sprayAsset = assets.sprays.find((s) => s.uuid === spray.sprayID);
      return sprayAsset && sprayAsset.displayName ? sprayAsset.displayName : 'VALORANT Spray';
    };

    const getSprayDirection = (index) => {
      const directions = ['Top', 'Right', 'Bottom', 'Left'];
      return directions[index] || 'Top';
    };

    const getCharmImage = (gun) => {
      if (!gun.charmID && !gun.charmLevelID) return null;
      const assets = getAssetsData();
      if (!assets || !assets.buddies || assets.buddies.length === 0) return null;

      // Try to find buddy by charmID
      let buddy = null;
      if (gun.charmID) {
        buddy = assets.buddies.find((b) => b.uuid === gun.charmID);
      }

      // If not found and we have charmLevelID, try to find by level
      if (!buddy && gun.charmLevelID) {
        for (const b of assets.buddies) {
          if (b.levels && b.levels.some((l) => l.uuid === gun.charmLevelID)) {
            buddy = b;
            break;
          }
        }
      }

      if (!buddy) return null;

      // Try to get image from level if charmLevelID is provided
      if (gun.charmLevelID && buddy.levels) {
        const level = buddy.levels.find((l) => l.uuid === gun.charmLevelID);
        if (level && level.displayIcon) {
          return level.displayIcon;
        }
        // Fallback to first level with icon
        const levelWithIcon = buddy.levels.find((l) => l.displayIcon);
        if (levelWithIcon && levelWithIcon.displayIcon) {
          return levelWithIcon.displayIcon;
        }
      }

      // Fallback to buddy displayIcon
      if (buddy.displayIcon) {
        return buddy.displayIcon;
      }

      return null;
    };

    const getCharmName = (gun) => {
      if (!gun.charmID && !gun.charmLevelID) return '';
      const assets = getAssetsData();
      if (!assets || !assets.buddies || assets.buddies.length === 0) return '';

      // Try to find buddy by charmID
      let buddy = null;
      if (gun.charmID) {
        buddy = assets.buddies.find((b) => b.uuid === gun.charmID);
      }

      // If not found and we have charmLevelID, try to find by level
      if (!buddy && gun.charmLevelID) {
        for (const b of assets.buddies) {
          if (b.levels && b.levels.some((l) => l.uuid === gun.charmLevelID)) {
            buddy = b;
            break;
          }
        }
      }

      if (!buddy) return '';

      // Try to get name from level if charmLevelID is provided
      if (gun.charmLevelID && buddy.levels) {
        const level = buddy.levels.find((l) => l.uuid === gun.charmLevelID);
        if (level && level.displayName) {
          return level.displayName;
        }
      }

      // Fallback to buddy displayName
      if (buddy.displayName) {
        return buddy.displayName;
      }

      return '';
    };

    // Helper function to get Riot ID (gameName#tagLine format)
    const getRiotId = () => {
      const name = userStore.user?.name || '';
      // If name already contains #, return as is
      if (name.includes('#')) {
        return name;
      }
      // If we have gameName and tagLine separately, combine them
      if (userStore.user?.gameName && userStore.user?.tagLine) {
        return `${userStore.user.gameName}#${userStore.user.tagLine}`;
      }
      // Fallback to name if available
      return name || 'Unknown';
    };

    // Helper function to get full region name
    const getFullRegionName = (regionCode) => {
      const regionMap = {
        'ap': 'APAC',
        'na': 'North America',
        'eu': 'Europe',
        'kr': 'Korea',
        'latam': 'LATAM',
        'br': 'Brazil',
        'pbe': 'PBE',
      };
      return regionMap[regionCode?.toLowerCase()] || regionCode || 'N/A';
    };

    // Helper function to get XP display (current/max)
    const getXpDisplay = () => {
      const currentXp = userStore.user?.progress?.xp || 0;
      const maxXp = 5000; // Standard XP per level in Valorant
      return `${currentXp} / ${maxXp}`;
    };

    // Helper function to get XP progress percentage
    const getXpProgressPercentage = () => {
      const currentXp = userStore.user?.progress?.xp || 0;
      const maxXp = 5000;
      return Math.min((currentXp / maxXp) * 100, 100);
    };

    // Create 5 columns layout
    const weaponColumns = computed(() => {
      const sidearms = weaponCategories.value.find(c => c.name === 'SIDEARMS');
      const smgs = weaponCategories.value.find(c => c.name === 'SMGS');
      const shotguns = weaponCategories.value.find(c => c.name === 'SHOTGUNS');
      const rifles = weaponCategories.value.find(c => c.name === 'RIFLES');
      const sniperRifles = weaponCategories.value.find(c => c.name === 'SNIPER RIFLES');
      const machineGuns = weaponCategories.value.find(c => c.name === 'MACHINE GUNS');
      const melee = weaponCategories.value.find(c => c.name === 'MELEE');

      return [
        {
          id: 1,
          categories: sidearms ? [sidearms] : [],
        },
        {
          id: 2,
          categories: [smgs, shotguns].filter(Boolean),
        },
        {
          id: 3,
          categories: [rifles, melee].filter(Boolean),
        },
        {
          id: 4,
          categories: [sniperRifles, machineGuns].filter(Boolean),
        },
        {
          id: 5,
          isIdentity: true, // Special flag for identity column
        },
      ];
    });

    return {
      user: userStore.user,
      assetsLoaded,
      weaponCategories,
      weaponColumns,
      getGunsByCategory,
      getWeaponName,
      getGunImage,
      getGunName,
      getGunSkinName,
      hasLevelsOrChromas,
      showLevels,
      showChromas,
      getPlayerCardImage,
      getPlayerCardName,
      getPlayerTitleName,
      getLevelBorderImage,
      getSprayImage,
      getSprayName,
      getSprayDirection,
      getCharmImage,
      getCharmName,
      getRiotId,
      getFullRegionName,
      getXpDisplay,
      getXpProgressPercentage,
    };
  },
};
</script>

<style scoped>
.loadout-view {
  min-height: 100vh;
  padding: 1rem 0.75rem;
  max-width: 100%;
  width: 100%;
  margin: 0 auto;
  background: linear-gradient(180deg, #1a1a1a 0%, #0f0f0f 100%);
  box-sizing: border-box;
  overflow-x: hidden;
  position: relative;
}

/* Profile Header Container (Top Horizontal) */
.profile-header-container {
  width: 100%;
  margin-bottom: 1.5rem;
}

.profile-header {
  background: linear-gradient(145deg, rgba(42, 42, 42, 0.95) 0%, rgba(31, 31, 31, 0.95) 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1rem 1.5rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 2rem;
  flex-wrap: wrap;
}

.profile-header-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 200px;
}

.profile-name {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #ffffff;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}

.profile-level {
  margin: 0;
  font-size: 0.875rem;
  color: #fa4454;
  font-weight: 500;
}

.profile-info {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 0.25rem;
}

.profile-region {
  font-weight: 500;
}

.profile-label {
  color: rgba(255, 255, 255, 0.5);
  margin-right: 0.25rem;
}

.profile-xp-container {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
  width: 100%;
}

.profile-xp {
  font-weight: 500;
}

.xp-progress-bar {
  width: 100%;
  min-width: 120px;
  max-width: 200px;
  height: 6px;
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 3px;
  overflow: hidden;
  position: relative;
}

.xp-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #fa4454 0%, #ff6b7a 100%);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.profile-right-section {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.75rem;
  min-width: fit-content;
}

.profile-balances {
  display: flex;
  align-items: center;
  gap: 0.1rem;
  justify-content: flex-end;
  min-width: fit-content;
}

.balance-item {
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 6px;
  padding: 0.5rem 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #ffffff;
  transition: background-color 0.2s;
  white-space: nowrap;
}

.balance-item:hover {
  background-color: rgba(0, 0, 0, 0.5);
}

.balance-item span {
  font-weight: 500;
}

/* Loading State */
.loading-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}

/* Empty State */
.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  padding: 2rem;
}

.empty-state-content {
  text-align: center;
  max-width: 500px;
}

.empty-state-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.empty-state-title {
  color: #ffffff;
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.empty-state-message {
  color: #999;
  font-size: 1rem;
  line-height: 1.6;
}

/* Loadout Content */
.loadout-content {
  animation: fadeIn 0.5s ease-in;
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

.loadout-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.loadout-title {
  color: #ffffff;
  font-size: 1.75rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.loadout-subtitle {
  color: #999;
  font-size: 1rem;
}

/* Weapon Columns Layout */
.weapon-columns {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0.75rem;
  width: 100%;
  box-sizing: border-box;
}

.weapon-column {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  min-width: 0; /* Prevent overflow */
}

.weapon-category {
  animation: slideIn 0.6s ease-out;
  animation-fill-mode: both;
}

.weapon-category:nth-child(1) { animation-delay: 0.1s; }
.weapon-category:nth-child(2) { animation-delay: 0.2s; }

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

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #fa4454;
  gap: 0.5rem;
  min-width: 0;
}

.weapon-category:not(:first-child) .category-header {
  margin-top: 1.25rem;
}

.category-title {
  color: #ffffff;
  font-size: 0.9rem;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  min-width: 0;
}

/* Weapon List (vertical list in each column) */
.weapon-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.category-empty {
  grid-column: 1 / -1;
  text-align: center;
  padding: 3rem 1rem;
  color: #666;
  font-size: 0.9rem;
}

/* Weapon Card */
.weapon-card {
  background: linear-gradient(145deg, #2a2a2a 0%, #1f1f1f 100%);
  border-radius: 8px;
  padding: 0.75rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.05);
  width: 100%;
  box-sizing: border-box;
  min-width: 0;
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
  transition: opacity 0.3s;
}

.weapon-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 8px 24px rgba(250, 68, 84, 0.3);
  border-color: rgba(250, 68, 84, 0.3);
}

.weapon-card:hover::before {
  opacity: 1;
}

.weapon-card.has-actions:hover {
  transform: translateY(-8px) scale(1.02);
}

.weapon-card-inner {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.weapon-header {
  margin-bottom: 0.75rem;
}

.weapon-name {
  color: #ffffff;
  font-size: 0.875rem;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 0 0 0.375rem 0;
}

.weapon-border-accent {
  width: 40px;
  height: 2px;
  background: linear-gradient(90deg, #fa4454, transparent);
  border-radius: 2px;
}

/* Weapon Image */
.weapon-image-container {
  width: 100%;
  height: 120px;
  background: linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.5rem;
  overflow: visible;
  position: relative;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.weapon-image {
  max-width: 90%;
  max-height: 90%;
  object-fit: contain;
  transition: transform 0.3s;
  position: relative;
  z-index: 1;
}

.weapon-card:hover .weapon-image {
  transform: scale(1.05);
}

/* Charm (Gun Buddy) */
.weapon-charm {
  position: absolute;
  bottom: 0.25rem;
  right: 0.25rem;
  z-index: 100;
  width: 32px;
  height: 32px;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(250, 68, 84, 0.5);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  transition: all 0.2s;
  pointer-events: auto;
}

.weapon-card:hover .weapon-charm {
  transform: scale(1.1);
  border-color: rgba(250, 68, 84, 0.8);
  box-shadow: 0 4px 12px rgba(250, 68, 84, 0.4);
}

.charm-icon {
  width: 24px;
  height: 24px;
  object-fit: contain;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.8));
}

/* Charm Tooltip */
.charm-tooltip {
  position: absolute;
  bottom: calc(100% + 0.5rem);
  right: 0;
  background: rgba(0, 0, 0, 0.9);
  color: #ffffff;
  padding: 0.375rem 0.625rem;
  border-radius: 4px;
  font-size: 0.75rem;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transform: translateY(4px);
  transition: all 0.2s ease;
  pointer-events: none;
  z-index: 101;
  border: 1px solid rgba(250, 68, 84, 0.3);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
}

.charm-tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  right: 0.75rem;
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 5px solid rgba(0, 0, 0, 0.9);
}

.weapon-charm:hover .charm-tooltip {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.weapon-image-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: #666;
}

.placeholder-icon {
  font-size: 2rem;
  opacity: 0.5;
}

.placeholder-text {
  font-size: 0.875rem;
}

/* Weapon Footer */
.weapon-footer {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.weapon-skin-name {
  position: relative;
  color: #e4e7f5;
  font-size: 0.78rem;
  text-align: center;
  font-weight: 500;
  line-height: 1.3;
  word-wrap: break-word;
  letter-spacing: 0.03em;
  text-transform: none;
}

.weapon-skin-name span {
  background: linear-gradient(135deg, #ffffff, #ffb3bf);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  filter: drop-shadow(0 0 6px rgba(0, 0, 0, 0.5));
}

.weapon-actions {
  display: flex;
  gap: 0.375rem;
  margin-top: 0.5rem;
}

                .action-btn {
                  flex: 1;
                  padding: 0.4rem 0.5rem;
                  background: linear-gradient(135deg, rgba(250, 68, 84, 0.15) 0%, rgba(217, 58, 74, 0.15) 100%);
                  color: #ffffff;
                  border: 1.5px solid rgba(250, 68, 84, 0.3);
                  border-radius: 8px;
                  cursor: pointer;
                  font-size: 0.6rem;
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

                .action-btn:hover {
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

.btn-icon {
  font-size: 1rem;
}

.btn-text {
  font-size: 0.75rem;
}

/* Identity Items Styles */
.identity-category {
  margin-bottom: 1.5rem;
}

.identity-item {
  margin-top: 0.75rem;
}

/* Player Card Styles */
.invItemCard {
  position: relative;
  background: linear-gradient(145deg, #2a2a2a 0%, #1f1f1f 100%);
  border-radius: 8px;
  padding: 0.75rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.05);
  overflow: hidden;
}

.insideCard {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  padding: 0.75rem;
  padding-bottom: 1rem;
  pointer-events: none;
}

.playerName {
  color: #ffffff;
  font-size: 0.875rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  text-align: center;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
}

.playerTitle {
  color: #fa4454;
  font-size: 0.875rem;
  font-weight: 600;
  text-align: center;
  padding: 0.5rem 1rem;
  background: rgba(0, 0, 0, 0.75);
  border-radius: 6px;
  backdrop-filter: blur(4px);
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
  border: 1px solid rgba(250, 68, 84, 0.3);
  min-width: fit-content;
  max-width: 90%;
  word-wrap: break-word;
}

.cardImage {
  width: 100%;
  height: auto;
  display: block;
  border-radius: 4px;
  object-fit: cover;
}

.cardFrame {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 3;
  pointer-events: none;
  display: flex;
  justify-content: space-between;
  align-items: stretch;
}

.cardFrameLeft,
.cardFrameRight {
  height: 100%;
  width: auto;
  object-fit: cover;
}

.identity-placeholder {
  width: 100%;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%);
  border-radius: 6px;
  color: #666;
}

.identity-placeholder .placeholder-icon {
  font-size: 2rem;
  opacity: 0.5;
}

/* Expressions Styles */
.expressions-container {
  margin-top: 0.75rem;
  display: flex;
  justify-content: center;
  align-items: center;
}

.invItemSpray {
  position: relative;
  width: 280px;
  height: 280px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: visible;
}

.sprayWheel {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  object-fit: contain;
  z-index: 1;
}

/* Spray Items */
.sprayItem {
  position: absolute;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(145deg, #2a2a2a 0%, #1f1f1f 100%);
  border: 2px solid rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: visible;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
  z-index: 3;
  cursor: pointer;
  transition: all 0.2s;
}

.sprayItem:hover {
  border-color: #fa4454;
  box-shadow: 0 4px 12px rgba(250, 68, 84, 0.4);
}

.sprayImage {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 8px;
  border-radius: 50%;
  overflow: hidden;
}

.spray-placeholder-small {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  border-radius: 50%;
  overflow: hidden;
}

.spray-placeholder-small .placeholder-icon {
  font-size: 1.25rem;
  opacity: 0.5;
}

/* Spray Tooltip */
.spray-tooltip {
  position: absolute;
  bottom: calc(100% + 0.5rem);
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.9);
  color: #ffffff;
  padding: 0.375rem 0.625rem;
  border-radius: 4px;
  font-size: 0.75rem;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transform: translateX(-50%) translateY(4px);
  transition: all 0.2s ease;
  pointer-events: none;
  z-index: 101;
  border: 1px solid rgba(250, 68, 84, 0.3);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
}

.spray-tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 5px solid rgba(0, 0, 0, 0.9);
}

.sprayItem:hover .spray-tooltip {
  opacity: 1;
  visibility: visible;
  transform: translateX(-50%) translateY(0);
}

/* Spray Positions */
.sprayDirectionTopButton {
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
}

.sprayDirectionRightButton {
  top: 50%;
  right: 20px;
  transform: translateY(-50%);
}

.sprayDirectionBottomButton {
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
}

.sprayDirectionLeftButton {
  top: 50%;
  left: 20px;
  transform: translateY(-50%);
}

/* Direction Indicators */
.sprayDirectionTop,
.sprayDirectionRight,
.sprayDirectionBottom,
.sprayDirectionLeft {
  position: absolute;
  z-index: 2;
  width: 24px;
  height: 24px;
  object-fit: contain;
}

.sprayDirectionTop {
  top: 50px;
  left: 50%;
  transform: translateX(-50%);
}

.sprayDirectionRight {
  top: 50%;
  right: 50px;
  transform: translateY(-50%);
}

.sprayDirectionBottom {
  bottom: 50px;
  left: 50%;
  transform: translateX(-50%);
}

.sprayDirectionLeft {
  top: 50%;
  left: 50px;
  transform: translateY(-50%);
}

/* Responsive Design - Optimized for 1920x1080 */
@media (max-width: 1920px) {
  .loadout-view {
    padding: 1rem 0.75rem;
  }
  
  .weapon-columns {
    gap: 0.65rem;
  }
  
  .weapon-column {
    gap: 1.25rem;
  }
  
  .weapon-card {
    padding: 0.65rem;
  }
  
  .weapon-image-container {
    height: 110px;
  }
}

@media (max-width: 1600px) {
  .weapon-columns {
    gap: 0.75rem;
  }
  
  .weapon-image-container {
    height: 110px;
  }
}

@media (max-width: 1400px) {
  .weapon-columns {
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
  }
}

@media (max-width: 1024px) {
  .weapon-columns {
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
  }

  .loadout-title {
    font-size: 2rem;
  }

  .category-title {
    font-size: 1.25rem;
  }
}

@media (max-width: 768px) {
  .loadout-view {
    padding: 1.5rem 1rem;
  }

  .profile-header {
    padding: 0.75rem 1rem;
    gap: 1rem;
  }

  .profile-header-info {
    min-width: 120px;
  }

  .profile-name {
    font-size: 1rem;
  }

  .profile-info {
    min-width: auto;
    gap: 0.75rem;
    font-size: 0.75rem;
  }

  .weapon-columns {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .loadout-title {
    font-size: 1.75rem;
  }

  .weapon-column {
    gap: 1.5rem;
  }

  .category-title {
    font-size: 1.1rem;
  }

  .weapon-image-container {
    height: 120px;
  }
}

@media (max-width: 640px) {
  .loadout-view {
    padding: 1rem 0.75rem;
  }

  .profile-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
    padding: 1rem;
  }

  .profile-header-info {
    width: 100%;
  }

  .profile-info {
    width: 100%;
  }

  .loadout-header {
    margin-bottom: 2rem;
  }

  .loadout-title {
    font-size: 1.5rem;
  }

  .loadout-subtitle {
    font-size: 0.875rem;
  }

  .weapon-columns {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .category-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .weapon-card {
    padding: 0.875rem;
  }

  .weapon-image-container {
    height: 140px;
  }

  .action-btn {
    padding: 0.55rem 0.9rem;
    font-size: 0.75rem;
    border-radius: 10px;
  }

  .btn-text {
    font-size: 0.7rem;
  }
}

@media (max-width: 480px) {
  .empty-state-icon {
    font-size: 3rem;
  }

  .empty-state-title {
    font-size: 1.25rem;
  }

  .empty-state-message {
    font-size: 0.875rem;
  }
}
</style>

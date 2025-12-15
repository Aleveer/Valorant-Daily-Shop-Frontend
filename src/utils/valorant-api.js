import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { VItemTypes } from './misc';
import { getAssets } from './valorant-assets';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

axios.interceptors.request.use(
  function (config) {
    if (import.meta.env.DEV) console.log(`${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

export const defaultUser = {
  id: '',
  name: '',
  region: 'na', // Default to NA region
  loadout: null,
  ownedItems: null,
  shops: {
    main: [],
    bundles: [],
    nightMarket: [],
    accessory: [],
    remainingSecs: {
      main: 0,
      bundles: [0],
      nightMarket: 0,
      accessory: 0,
    },
  },
  balances: {
    vp: 0,
    rad: 0,
    fag: 0,
    kc: 0,
  },
  progress: {
    level: 0,
    xp: 0,
  },
};

const extraHeaders = () => ({
  'X-Riot-ClientVersion': getAssets().riotClientVersion || '43.0.1.4195386.4190634',
  'X-Riot-ClientPlatform':
    'eyJwbGF0Zm9ybVR5cGUiOiJQQyIsInBsYXRmb3JtT1MiOiJXaW5kb3dzIiwicGxhdGZvcm1PU1ZlcnNpb24iOiIxMC4wLjE5MDQyLjEuMjU2LjY0Yml0IiwicGxhdGZvcm1DaGlwc2V0IjoiVW5rbm93biJ9',
});

export async function getEntitlementsToken(accessToken) {
  const res = await axios.post(`${API_BASE_URL}/auth/entitlements`, {
    accessToken,
  });
  return res.data.entitlements_token;
}

export function getUserId(accessToken) {
  const data = jwtDecode(accessToken);
  return data.sub;
}

export async function getUsername(accessToken, entitlementsToken, userId, region) {
  const res = await axios.get(`${API_BASE_URL}/auth/username`, {
    params: {
      accessToken,
      entitlementsToken,
      userId,
      region,
    },
  });
  return res.data.username || '?';
}

export async function getShop(accessToken, entitlementsToken, region, userId) {
  const res = await axios.post(`${API_BASE_URL}/valorant/shop`, {
    accessToken,
    entitlementsToken,
    region,
    userId,
  });
  return res.data;
}

export async function getBalances(accessToken, entitlementsToken, region, userId) {
  const res = await axios.post(`${API_BASE_URL}/valorant/balances`, {
    accessToken,
    entitlementsToken,
    region,
    userId,
  });
  return res.data;
}

export async function getLoadout(accessToken, entitlementsToken, region, userId) {
  const res = await axios.post(`${API_BASE_URL}/valorant/loadout`, {
    accessToken,
    entitlementsToken,
    region,
    userId,
  });
  return res.data;
}

export async function getOwnedItems(accessToken, entitlementsToken, region, userId, itemType) {
  const itemTypeId = VItemTypes[itemType];
  const res = await axios.post(`${API_BASE_URL}/valorant/owned-items`, {
    accessToken,
    entitlementsToken,
    region,
    userId,
    itemType: itemTypeId,
  });
  return res.data;
}

export async function getOwnedItemsForTypes(accessToken, entitlementsToken, region, userId, itemTypes) {
  const results = [];
  const errors = [];

  for (const type of itemTypes) {
    try {
      const apiResponse = await getOwnedItems(accessToken, entitlementsToken, region, userId, type);
      // Riot may return either EntitlementsByTypes or flat Entitlements for a specific itemType
      const entitlementsFromGrouped =
        apiResponse.EntitlementsByTypes?.flatMap((ent) =>
          ent.Entitlements.map((e) => ({
            typeID: e.TypeID,
            itemID: e.ItemID,
            instanceID: e.InstanceID,
          }))
        ) ?? [];

      const entitlementsFromFlat =
        apiResponse.Entitlements?.map((e) => ({
          typeID: e.TypeID,
          itemID: e.ItemID,
          instanceID: e.InstanceID,
        })) ?? [];

      const mapped = {
        itemTypeID: VItemTypes[type],
        entitlements: [...entitlementsFromGrouped, ...entitlementsFromFlat],
      };
      results.push(mapped);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data ||
        err?.message ||
        'Unknown error';
      errors.push({ type, message: msg });
      console.error('getOwnedItemsForTypes error', type, msg);
    }
  }
  return {
    entitlementsByTypes: results,
    errors,
  };
}

export async function getProgress(accessToken, entitlementsToken, region, userId) {
  const res = await axios.post(`${API_BASE_URL}/valorant/progress`, {
    accessToken,
    entitlementsToken,
    region,
    userId,
  });
  return res.data;
}

// Helper to proxy URLs in development to avoid CORS
const proxyUrl = (url) => {
  if (import.meta.env.DEV) {
    // Use Vite proxy for development
    if (url.includes('entitlements.auth.riotgames.com')) {
      return url.replace('https://entitlements.auth.riotgames.com', '/riot-proxy');
    }
    if (url.includes('pd.') && url.includes('.a.pvp.net')) {
      // Extract region from URL
      const regionMatch = url.match(/pd\.([^.]+)\.a\.pvp\.net/);
      if (regionMatch) {
        const region = regionMatch[1];
        const path = url.split('.a.pvp.net')[1];
        return `/riot-pd-proxy/${region}${path}`;
      }
    }
  }
  return url;
};

function getUrl(name, region, userId, itemTypeId) {
  const URLS = {
    auth: 'https://auth.riotgames.com/api/v1/authorization/',
    entitlements: 'https://entitlements.auth.riotgames.com/api/token/v1/',
    storefront: `https://pd.${region}.a.pvp.net/store/v3/storefront/${userId}`,
    wallet: `https://pd.${region}.a.pvp.net/store/v1/wallet/${userId}`,
    playerxp: `https://pd.${region}.a.pvp.net/account-xp/v1/players/${userId}`,
    weapons: 'https://valorant-api.com/v1/weapons/',
    offers: `https://pd.${region}.a.pvp.net/store/v1/offers/`,
    name: `https://pd.${region}.a.pvp.net/name-service/v2/players`,
    loadout: `https://pd.${region}.a.pvp.net/personalization/v2/players/${userId}/playerloadout`,
    owned_items: `https://pd.${region}.a.pvp.net/store/v1/entitlements/${userId}/${itemTypeId}`,
  };
  const url = URLS[name];
  return proxyUrl(url);
}


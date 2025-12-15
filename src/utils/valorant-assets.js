import axios from 'axios';
import { getVAPILang } from './localization';
import { getItem, setItem, isAvailable } from './indexeddb-storage';

let assets = {
  riotClientVersion: null,
  language: null,
  skins: [],
  weapons: [],
  buddies: [],
  sprays: [],
  cards: [],
  titles: [],
  contracts: [],
};

const STORAGE_KEY = 'valorant_assets';

export function getAssets() {
  return assets;
}

export async function loadAssets() {
  try {
    // Thử lấy từ IndexedDB hoặc localStorage (fallback)
    let storedAssets = null;
    try {
      storedAssets = await getItem(STORAGE_KEY);
    } catch (getError) {
      console.warn('Failed to get assets from storage, will fetch fresh:', getError);
      // Thử lấy từ localStorage cũ (migration)
      try {
        const oldStorage = localStorage.getItem(STORAGE_KEY);
        if (oldStorage) {
          storedAssets = JSON.parse(oldStorage);
          // Xóa cache cũ từ localStorage để giải phóng dung lượng
          localStorage.removeItem(STORAGE_KEY);
          console.log('Migrated assets from localStorage to IndexedDB');
        }
      } catch (parseError) {
        console.warn('Failed to parse old localStorage cache:', parseError);
      }
    }

    const version = await fetchVersion();
    const language = getVAPILang();

    if (storedAssets) {
      if (
        storedAssets.riotClientVersion === version &&
        storedAssets.language === language
      ) {
        assets = {
          ...storedAssets,
          contracts: storedAssets.contracts || [],
        };
        console.log('Assets loaded from cache');
        return;
      } else {
        console.log('Cache outdated, fetching new assets...');
      }
    }

    console.log('Fetching assets from API...');
    assets.riotClientVersion = version;
    assets.language = language;
    assets.skins = await fetchSkins(language);
    assets.weapons = await fetchWeapons(language);
    assets.buddies = await fetchBuddies(language);
    assets.sprays = await fetchSprays(language);
    assets.cards = await fetchPlayerCards(language);
    assets.titles = await fetchPlayerTitles(language);
    assets.contracts = await fetchContracts(language);

    // Lưu vào IndexedDB (hoặc localStorage nếu IndexedDB không khả dụng)
    try {
      await setItem(STORAGE_KEY, assets);
      console.log('Assets saved to storage');
    } catch (storageError) {
      console.error('Failed to save assets to storage:', storageError);
      // Tiếp tục dù không lưu được, vì assets đã được load vào memory
      // Ứng dụng vẫn hoạt động bình thường, chỉ không có cache cho lần sau
    }
  } catch (error) {
    console.error('Error loading assets:', error);
    throw error;
  }
}

export async function fetchVersion() {
  const res = await axios.request({
    url: 'https://valorant-api.com/v1/version',
    method: 'GET',
  });
  return res.data.data.riotClientVersion;
}

export async function fetchSkins(language) {
  const res = await axios.request({
    url: `https://valorant-api.com/v1/weapons/skins?language=${language ?? getVAPILang()}`,
    method: 'GET',
  });
  return res.data.data;
}

export async function fetchWeapons(language) {
  const res = await axios.request({
    url: `https://valorant-api.com/v1/weapons?language=${language ?? getVAPILang()}`,
    method: 'GET',
  });
  return res.data.data;
}

export async function fetchBuddies(language) {
  const res = await axios.request({
    url: `https://valorant-api.com/v1/buddies?language=${language ?? getVAPILang()}`,
    method: 'GET',
  });
  return res.data.data;
}

export async function fetchSprays(language) {
  const res = await axios.request({
    url: `https://valorant-api.com/v1/sprays?language=${language ?? getVAPILang()}`,
    method: 'GET',
  });
  return res.data.data;
}

export async function fetchPlayerCards(language) {
  const res = await axios.request({
    url: `https://valorant-api.com/v1/playercards?language=${language ?? getVAPILang()}`,
    method: 'GET',
  });
  return res.data.data;
}

export async function fetchPlayerTitles(language) {
  const res = await axios.request({
    url: `https://valorant-api.com/v1/playertitles?language=${language ?? getVAPILang()}`,
    method: 'GET',
  });
  return res.data.data;
}

export async function fetchBundle(bundleId, language) {
  const res = await axios.request({
    url: `https://valorant-api.com/v1/bundles/${bundleId}?language=${language ?? getVAPILang()}`,
    method: 'GET',
    validateStatus: () => true,
  });
  return res.status === 200 ? res.data.data : null;
}

export async function fetchContracts(language) {
  const res = await axios.request({
    url: `https://valorant-api.com/v1/contracts?language=${language ?? getVAPILang()}`,
    method: 'GET',
  });
  return res.data.data;
}


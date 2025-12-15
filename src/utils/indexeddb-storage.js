/**
 * IndexedDB Storage Utility
 * Sử dụng IndexedDB để lưu trữ dữ liệu lớn thay vì localStorage
 */

const DB_NAME = 'vshop_db';
const DB_VERSION = 1;
const STORE_NAME = 'assets';

let db = null;

/**
 * Mở kết nối IndexedDB
 */
function openDB() {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error('Failed to open IndexedDB'));
    };

    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = event.target.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME);
      }
    };
  });
}

/**
 * Lưu dữ liệu vào IndexedDB
 */
export async function setItem(key, value) {
  try {
    const database = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(value, key);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(new Error('Failed to save to IndexedDB'));
      };
    });
  } catch (error) {
    console.error('IndexedDB setItem error:', error);
    // Fallback to localStorage nếu IndexedDB không khả dụng
    try {
      const serialized = JSON.stringify(value);
      if (serialized.length < 5 * 1024 * 1024) { // Chỉ fallback nếu < 5MB
        localStorage.setItem(key, serialized);
      } else {
        throw new Error('Data too large for localStorage fallback');
      }
    } catch (fallbackError) {
      console.error('Fallback to localStorage also failed:', fallbackError);
      throw error;
    }
  }
}

/**
 * Lấy dữ liệu từ IndexedDB
 */
export async function getItem(key) {
  try {
    const database = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(key);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = () => {
        reject(new Error('Failed to read from IndexedDB'));
      };
    });
  } catch (error) {
    console.error('IndexedDB getItem error:', error);
    // Fallback to localStorage
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (fallbackError) {
      console.error('Fallback to localStorage also failed:', fallbackError);
      return null;
    }
  }
}

/**
 * Xóa dữ liệu từ IndexedDB
 */
export async function removeItem(key) {
  try {
    const database = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(key);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(new Error('Failed to delete from IndexedDB'));
      };
    });
  } catch (error) {
    console.error('IndexedDB removeItem error:', error);
    // Fallback to localStorage
    try {
      localStorage.removeItem(key);
    } catch (fallbackError) {
      console.error('Fallback to localStorage also failed:', fallbackError);
    }
  }
}

/**
 * Kiểm tra xem IndexedDB có khả dụng không
 */
export function isAvailable() {
  return typeof indexedDB !== 'undefined' && indexedDB !== null;
}

/**
 * Xóa toàn bộ dữ liệu trong store (dùng cho clear cache)
 */
export async function clear() {
  try {
    const database = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(new Error('Failed to clear IndexedDB'));
      };
    });
  } catch (error) {
    console.error('IndexedDB clear error:', error);
    throw error;
  }
}

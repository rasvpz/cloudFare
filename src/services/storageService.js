// IndexedDB abstraction. Can later be swapped for a backend API.
const DB_NAME = 'cloudflare-rewards';
const DB_VERSION = 1;

let _dbPromise = null;

function openDB() {
  if (_dbPromise) return _dbPromise;
  _dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains('users')) db.createObjectStore('users', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('sessions')) db.createObjectStore('sessions', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('transactions')) {
        const txs = db.createObjectStore('transactions', { keyPath: 'id' });
        txs.createIndex('userId', 'userId', { unique: false });
      }
      if (!db.objectStoreNames.contains('redemptions')) {
        const r = db.createObjectStore('redemptions', { keyPath: 'id' });
        r.createIndex('userId', 'userId', { unique: false });
      }
      if (!db.objectStoreNames.contains('usedCodes')) {
        const u = db.createObjectStore('usedCodes', { keyPath: 'code' });
        u.createIndex('userId', 'userId', { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return _dbPromise;
}

async function tx(storeName, mode, fn) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const t = db.transaction(storeName, mode);
    const store = t.objectStore(storeName);
    let value;
    try {
      const request = fn(store);
      if (request && typeof request === 'object' && 'onsuccess' in request) {
        request.onsuccess = () => { value = request.result; };
        request.onerror = () => reject(request.error);
      } else {
        value = request;
      }
    } catch (e) { reject(e); return; }
    t.oncomplete = () => resolve(value);
    t.onerror = () => reject(t.error);
    t.onabort = () => reject(t.error || new Error('aborted'));
  });
}

export const storage = {
  async put(storeName, value) {
    return tx(storeName, 'readwrite', (s) => s.put(value));
  },
  async get(storeName, key) {
    return tx(storeName, 'readonly', (s) => s.get(key));
  },
  async getAll(storeName) {
    return tx(storeName, 'readonly', (s) => s.getAll());
  },
  async delete(storeName, key) {
    return tx(storeName, 'readwrite', (s) => s.delete(key));
  },
  async getAllByIndex(storeName, indexName, key) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const t = db.transaction(storeName, 'readonly');
      const idx = t.objectStore(storeName).index(indexName);
      const req = idx.getAll(key);
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }
};
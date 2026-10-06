import type { Verse } from "@/lib/bible";

const DB_NAME = "os-mamutes-offline";
const DB_VERSION = 2;
const CHAPTER_STORE = "bible-chapters";
const MAX_CACHED_CHAPTERS = 180;

type CachedChapter = {
  key: string;
  version: string;
  verses: Verse[];
  cachedAt: number;
  lastAccessedAt: number;
  preserveOffline?: boolean;
};

function openOfflineDatabase(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === "undefined") return Promise.resolve(null);

  return new Promise((resolve) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(CHAPTER_STORE)) {
        const store = db.createObjectStore(CHAPTER_STORE, { keyPath: "key" });
        store.createIndex("lastAccessedAt", "lastAccessedAt");
        store.createIndex("version", "version");
      } else {
        const store = request.transaction!.objectStore(CHAPTER_STORE);
        if (!store.indexNames.contains("lastAccessedAt")) store.createIndex("lastAccessedAt", "lastAccessedAt");
        if (!store.indexNames.contains("version")) store.createIndex("version", "version");
      }
    };
    request.onsuccess = () => {
      request.result.onversionchange = () => request.result.close();
      resolve(request.result);
    };
    request.onerror = () => resolve(null);
    request.onblocked = () => resolve(null);
  });
}

export async function getOfflineBibleChapter(key: string): Promise<Verse[] | null> {
  const db = await openOfflineDatabase();
  if (!db) return null;

  return new Promise((resolve) => {
    let result: Verse[] | null = null;
    const transaction = db.transaction(CHAPTER_STORE, "readwrite");
    const store = transaction.objectStore(CHAPTER_STORE);
    const request = store.get(key);
    request.onsuccess = () => {
      const record = request.result as CachedChapter | undefined;
      if (!record) return;
      result = record.verses;
      store.put({ ...record, lastAccessedAt: Date.now() });
    };
    transaction.oncomplete = () => { db.close(); resolve(result); };
    transaction.onerror = transaction.onabort = () => { db.close(); resolve(result); };
  });
}

export async function listPreparedOfflineChapterKeys(version: string): Promise<Set<string>> {
  const db = await openOfflineDatabase();
  if (!db) return new Set();

  return new Promise((resolve) => {
    const transaction = db.transaction(CHAPTER_STORE, "readonly");
    const request = transaction.objectStore(CHAPTER_STORE).index("version").getAll(version);
    request.onsuccess = () => {
      const records = request.result as CachedChapter[];
      resolve(new Set(records.filter((record) => record.preserveOffline).map((record) => record.key)));
    };
    request.onerror = () => resolve(new Set());
    transaction.oncomplete = () => db.close();
    transaction.onerror = transaction.onabort = () => { db.close(); resolve(new Set()); };
  });
}

export async function saveOfflineBibleChapter(
  key: string,
  version: string,
  verses: Verse[],
  preserveOffline = false,
): Promise<boolean> {
  const db = await openOfflineDatabase();
  if (!db) return false;

  return new Promise<boolean>((resolve) => {
    const transaction = db.transaction(CHAPTER_STORE, "readwrite");
    const store = transaction.objectStore(CHAPTER_STORE);
    let stored = false;
    const existingRequest = store.get(key);
    existingRequest.onsuccess = () => {
      const existing = existingRequest.result as CachedChapter | undefined;
      const now = Date.now();
      const putRequest = store.put({
        key,
        version,
        verses,
        cachedAt: now,
        lastAccessedAt: now,
        preserveOffline: preserveOffline || existing?.preserveOffline === true,
      } satisfies CachedChapter);
      putRequest.onsuccess = () => { stored = true; };

      const countRequest = store.count();
      countRequest.onsuccess = () => {
        let excess = countRequest.result - MAX_CACHED_CHAPTERS;
        if (excess <= 0) return;
        const cursorRequest = store.index("lastAccessedAt").openCursor();
        cursorRequest.onsuccess = () => {
          const cursor = cursorRequest.result;
          if (!cursor || excess <= 0) return;
          const record = cursor.value as CachedChapter;
          if (cursor.primaryKey !== key && !record.preserveOffline) {
            cursor.delete();
            excess -= 1;
          }
          cursor.continue();
        };
      };
    };
    transaction.oncomplete = () => { db.close(); resolve(stored); };
    transaction.onerror = transaction.onabort = () => { db.close(); resolve(false); };
  });
}

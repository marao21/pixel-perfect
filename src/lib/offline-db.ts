import type { Verse } from "@/lib/bible";

const DB_NAME = "os-mamutes-offline";
const DB_VERSION = 1;
const CHAPTER_STORE = "bible-chapters";
const MAX_CACHED_CHAPTERS = 180;

type CachedChapter = {
  key: string;
  verses: Verse[];
  cachedAt: number;
  lastAccessedAt: number;
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

export async function saveOfflineBibleChapter(key: string, verses: Verse[]): Promise<void> {
  const db = await openOfflineDatabase();
  if (!db) return;

  await new Promise<void>((resolve) => {
    const transaction = db.transaction(CHAPTER_STORE, "readwrite");
    const store = transaction.objectStore(CHAPTER_STORE);
    const now = Date.now();
    store.put({ key, verses, cachedAt: now, lastAccessedAt: now } satisfies CachedChapter);

    const countRequest = store.count();
    countRequest.onsuccess = () => {
      let excess = countRequest.result - MAX_CACHED_CHAPTERS;
      if (excess <= 0) return;
      const cursorRequest = store.index("lastAccessedAt").openCursor();
      cursorRequest.onsuccess = () => {
        const cursor = cursorRequest.result;
        if (!cursor || excess <= 0) return;
        if (cursor.primaryKey !== key) {
          cursor.delete();
          excess -= 1;
        }
        cursor.continue();
      };
    };
    transaction.oncomplete = () => { db.close(); resolve(); };
    transaction.onerror = transaction.onabort = () => { db.close(); resolve(); };
  });
}

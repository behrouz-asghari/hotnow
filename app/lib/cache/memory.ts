import { CONFIG } from "../config";

type Entry<T> = { value: T; expiresAt: number; accessCount: number };

const store = new Map<string, Entry<unknown>>();

export function memGet<T>(key: string): T | null {
  const hit = store.get(key);
  if (!hit) return null;

  if (Date.now() > hit.expiresAt) {
    store.delete(key);
    return null;
  }

  hit.accessCount++;
  return hit.value as T;
}

export function memSet<T>(key: string, value: T, ttlSec: number) {
  if (store.size >= CONFIG.cacheMaxSize) {
    evictLeastAccessed();
  }

  store.set(key, {
    value,
    expiresAt: Date.now() + ttlSec * 1000,
    accessCount: 0,
  });
}

export function memDelete(key: string): boolean {
  return store.delete(key);
}

export function memClear(): void {
  store.clear();
}

export function memSize(): number {
  return store.size;
}

function evictLeastAccessed() {
  let oldestKey: string | null = null;
  let oldestAccess = Infinity;

  for (const [key, entry] of store) {
    if (entry.accessCount < oldestAccess) {
      oldestAccess = entry.accessCount;
      oldestKey = key;
    }
  }

  if (oldestKey) store.delete(oldestKey);
}

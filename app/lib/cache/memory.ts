type Entry<T> = { value: T; expiresAt: number };
const store = new Map<string, Entry<unknown>>();

export function memGet<T>(key: string): T | null {
  const hit = store.get(key);
  if (!hit) return null;
  if (Date.now() > hit.expiresAt) {
    store.delete(key);
    return null;
  }
  return hit.value as T;
}

export function memSet<T>(key: string, value: T, ttlSec: number) {
  store.set(key, { value, expiresAt: Date.now() + ttlSec * 1000 });
}

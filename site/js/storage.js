// localStorage with a memory fallback, for private windows and blocked storage.
const memory = new Map();
const PREFIX = "leftovers:v1:";

export function load(key, fallback) {
  const k = PREFIX + key;
  try {
    const raw = window.localStorage.getItem(k);
    if (raw !== null) return JSON.parse(raw);
  } catch {
    /* blocked or corrupt: fall through */
  }
  return memory.has(k) ? memory.get(k) : fallback;
}

export function save(key, value) {
  const k = PREFIX + key;
  memory.set(k, value);
  try {
    window.localStorage.setItem(k, JSON.stringify(value));
  } catch {
    /* storage full or blocked: keep the in-memory copy */
  }
}

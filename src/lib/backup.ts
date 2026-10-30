// Backup and restore: every `finance:*` localStorage key in one versioned JSON file, optionally
// encrypted with a passphrase (AES-GCM, key from PBKDF2-SHA-256; Web Crypto, no dependency).
// This is the free stand-in for sync: export in one browser, import in another.

export const APP = 'finance-dashboard';
/** Bump when the file's shape changes; files from a newer version are refused, not guessed at. */
export const BACKUP_VERSION = 1;
const PREFIX = 'finance:';
const ITERATIONS = 310_000;

/** Each saved key's raw localStorage string, so a restore writes back exactly what was there. */
export type Keys = Record<string, string>;

export interface PlainBackup {
  app: typeof APP;
  version: number;
  exportedAt: string;
  keys: Keys;
}

export interface EncryptedBackup {
  app: typeof APP;
  version: number;
  exportedAt: string;
  encrypted: { alg: 'AES-GCM'; kdf: 'PBKDF2-SHA-256'; iterations: number; salt: string; iv: string; data: string };
}

export type Backup = PlainBackup | EncryptedBackup;

export class BackupError extends Error {}

export const buildBackup = (keys: Keys, now = new Date()): PlainBackup => ({
  app: APP,
  version: BACKUP_VERSION,
  exportedAt: now.toISOString(),
  keys,
});

const isKeys = (k: unknown): k is Keys =>
  !!k && typeof k === 'object' && !Array.isArray(k) &&
  Object.entries(k).every(([key, v]) => key.startsWith(PREFIX) && typeof v === 'string');

/** Parses and checks a backup file's text. Throws a BackupError that can be shown as is. */
export function parseBackup(text: string): Backup {
  let b: any;
  try {
    b = JSON.parse(text);
  } catch {
    throw new BackupError("This file isn't a dashboard backup: it isn't valid JSON.");
  }
  if (!b || b.app !== APP) throw new BackupError("This file isn't a dashboard backup.");
  if (!Number.isInteger(b.version) || b.version < 1) throw new BackupError('This backup has no valid version number.');
  if (b.version > BACKUP_VERSION)
    throw new BackupError(
      `This backup was made by a newer version of the dashboard (format ${b.version}; this page reads up to ${BACKUP_VERSION}). Reload to get the latest version, then try again.`,
    );
  if (b.encrypted) {
    const e = b.encrypted;
    if (e.alg !== 'AES-GCM' || typeof e.salt !== 'string' || typeof e.iv !== 'string' || typeof e.data !== 'string' || !Number.isInteger(e.iterations))
      throw new BackupError('This encrypted backup is damaged.');
    return b as EncryptedBackup;
  }
  if (!isKeys(b.keys)) throw new BackupError('This backup is damaged: its saved data is missing or malformed.');
  return b as PlainBackup;
}

export const isEncrypted = (b: Backup): b is EncryptedBackup => 'encrypted' in b;

const b64 = (bytes: Uint8Array) => {
  let s = '';
  // In chunks: spreading a large array into one call overflows the stack.
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
};
const unb64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

const deriveKey = async (passphrase: string, salt: Uint8Array, iterations: number) => {
  const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(passphrase), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations },
    base,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
};

export async function encryptBackup(b: PlainBackup, passphrase: string): Promise<EncryptedBackup> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(passphrase, salt, ITERATIONS);
  const data = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(JSON.stringify(b.keys))));
  return {
    app: APP, version: b.version, exportedAt: b.exportedAt,
    encrypted: { alg: 'AES-GCM', kdf: 'PBKDF2-SHA-256', iterations: ITERATIONS, salt: b64(salt), iv: b64(iv), data: b64(data) },
  };
}

export async function decryptBackup(b: EncryptedBackup, passphrase: string): Promise<PlainBackup> {
  const e = b.encrypted;
  let text: string;
  try {
    const key = await deriveKey(passphrase, unb64(e.salt), e.iterations);
    text = new TextDecoder().decode(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(e.iv) }, key, unb64(e.data)));
  } catch {
    throw new BackupError("Wrong passphrase, or the file is damaged.");
  }
  const keys = JSON.parse(text);
  if (!isKeys(keys)) throw new BackupError('This backup is damaged: its saved data is malformed.');
  return { app: APP, version: b.version, exportedAt: b.exportedAt, keys };
}

/** Plain-language list of what a backup holds, e.g. "incomes, accounts, credit". */
export const describeKeys = (keys: Keys) => {
  const names = Object.keys(keys)
    .filter((k) => !k.endsWith(':migration'))
    .map((k) => k.split(':')[1])
    .filter((n) => n !== 'mode');
  return [...new Set(names)].join(', ') || 'no entries';
};

import { STORAGE_KEY, readRawLocalAppData } from "@/lib/local-storage";
import {
  bootstrapFreshAppData,
  isBootstrapDemoData,
  normalizeAppData,
} from "@/lib/storage";
import type { AppData } from "@/lib/types";

const VAULT_META_KEY = "life-schedule:vault-meta:v1";
const VAULT_DATA_KEY = "life-schedule:vault-data:v1";
const PBKDF2_ITERATIONS = 120_000;

type VaultMeta = {
  version: 1;
  salt: string;
  verifier: string;
};

type VaultPayload = {
  iv: string;
  ciphertext: string;
};

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function base64ToBytes(value: string): Uint8Array<ArrayBuffer> {
  const binary = atob(value);
  const buffer = new ArrayBuffer(binary.length);
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function readVaultMeta(): VaultMeta | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(VAULT_META_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as VaultMeta;
    if (parsed.version !== 1 || !parsed.salt || !parsed.verifier) return null;
    return parsed;
  } catch {
    return null;
  }
}

function readVaultPayload(): VaultPayload | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(VAULT_DATA_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as VaultPayload;
    if (!parsed.iv || !parsed.ciphertext) return null;
    return parsed;
  } catch {
    return null;
  }
}

async function deriveKey(
  password: string,
  salt: Uint8Array<ArrayBuffer>,
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const baseKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

async function createVerifier(
  password: string,
  salt: Uint8Array<ArrayBuffer>,
): Promise<string> {
  const encoder = new TextEncoder();
  const baseKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    baseKey,
    128,
  );
  return bytesToBase64(new Uint8Array(bits));
}

async function encryptAppData(
  password: string,
  salt: Uint8Array<ArrayBuffer>,
  data: AppData,
): Promise<VaultPayload> {
  const key = await deriveKey(password, salt);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(JSON.stringify(data));
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoded,
  );
  return {
    iv: bytesToBase64(iv),
    ciphertext: bytesToBase64(new Uint8Array(ciphertext)),
  };
}

async function decryptAppData(
  password: string,
  salt: Uint8Array<ArrayBuffer>,
  payload: VaultPayload,
): Promise<AppData> {
  const key = await deriveKey(password, salt);
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: base64ToBytes(payload.iv) },
    key,
    base64ToBytes(payload.ciphertext),
  );
  const parsed = JSON.parse(new TextDecoder().decode(decrypted)) as Partial<AppData>;
  return normalizeAppData(parsed);
}

function readLegacyPlainData(): AppData | null {
  const legacy = readRawLocalAppData();
  if (!legacy) return null;
  return normalizeAppData(legacy);
}

export function hasVault(): boolean {
  return readVaultMeta() != null && readVaultPayload() != null;
}

export function hasLegacyPlainStorage(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEY) != null;
}

export function hasMigratableLegacyPlainStorage(): boolean {
  const legacy = readLegacyPlainData();
  return legacy != null && !isBootstrapDemoData(legacy);
}

function resolveInitialVaultData(initialData?: AppData): AppData {
  if (initialData) return initialData;
  const legacy = readLegacyPlainData();
  if (legacy && !isBootstrapDemoData(legacy)) return legacy;
  return bootstrapFreshAppData();
}

export async function setupVault(
  password: string,
  initialData?: AppData,
): Promise<void> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const data = resolveInitialVaultData(initialData);
  const meta: VaultMeta = {
    version: 1,
    salt: bytesToBase64(salt),
    verifier: await createVerifier(password, salt),
  };
  const payload = await encryptAppData(password, salt, data);
  localStorage.setItem(VAULT_META_KEY, JSON.stringify(meta));
  localStorage.setItem(VAULT_DATA_KEY, JSON.stringify(payload));
  localStorage.removeItem(STORAGE_KEY);
}

export async function unlockVault(password: string): Promise<AppData> {
  const meta = readVaultMeta();
  const payload = readVaultPayload();
  if (!meta || !payload) {
    throw new Error("VAULT_NOT_FOUND");
  }
  const salt = base64ToBytes(meta.salt);
  const verifier = await createVerifier(password, salt);
  if (verifier !== meta.verifier) {
    throw new Error("INVALID_PASSWORD");
  }
  return decryptAppData(password, salt, payload);
}

export async function saveVault(password: string, data: AppData): Promise<void> {
  const meta = readVaultMeta();
  if (!meta) {
    await setupVault(password, data);
    return;
  }
  const salt = base64ToBytes(meta.salt);
  const payload = await encryptAppData(password, salt, data);
  localStorage.setItem(VAULT_DATA_KEY, JSON.stringify(payload));
}

export async function changeVaultPassword(
  currentPassword: string,
  nextPassword: string,
  data: AppData,
): Promise<void> {
  await unlockVault(currentPassword);
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const meta: VaultMeta = {
    version: 1,
    salt: bytesToBase64(salt),
    verifier: await createVerifier(nextPassword, salt),
  };
  const payload = await encryptAppData(nextPassword, salt, data);
  localStorage.setItem(VAULT_META_KEY, JSON.stringify(meta));
  localStorage.setItem(VAULT_DATA_KEY, JSON.stringify(payload));
}

export function wipeVault(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(VAULT_META_KEY);
  localStorage.removeItem(VAULT_DATA_KEY);
}

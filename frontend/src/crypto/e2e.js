// ═══════════════════════════════════════════════════════
// WereWere Parliament — End-to-End Encryption Module
// Uses ECDH (Elliptic Curve Diffie-Hellman) — the
// "half-half" key system your mentor described.
//
// How it works:
// 1. Each user generates a key PAIR (public + private)
// 2. Public key → uploaded to server (everyone can see)
// 3. Private key → stays in browser memory ONLY
// 4. When two users chat:
//    - Fetch partner's public key from server
//    - Combine YOUR private + THEIR public = shared secret
//    - They do the same in reverse = same shared secret
//    - Neither half alone can decrypt anything
//    - Server never sees the shared secret
// ═══════════════════════════════════════════════════════

const ECDH_PARAMS = { name: 'ECDH', namedCurve: 'P-256' }
const AES_PARAMS  = { name: 'AES-GCM', length: 256 }

// ── STEP 1: Generate your half of the key ──────────────
// Called once when user logs in
// Returns { publicKey, privateKey }
// Private key NEVER leaves this function's return value
export async function generateKeyPair() {
  const keyPair = await crypto.subtle.generateKey(
    ECDH_PARAMS,
    true,           // extractable — so we can export public key
    ['deriveKey']   // can only be used to derive shared keys
  )
  return keyPair
}

// ── STEP 2: Export public key to send to server ────────
// Converts CryptoKey → base64 string for sending over HTTP
export async function exportPublicKey(publicKey) {
  const exported = await crypto.subtle.exportKey('spki', publicKey)
  return btoa(String.fromCharCode(...new Uint8Array(exported)))
}

// ── STEP 3: Import someone else's public key ──────────
// Converts base64 string from server → CryptoKey
export async function importPublicKey(base64PublicKey) {
  const binary = Uint8Array.from(atob(base64PublicKey), c => c.charCodeAt(0))
  return crypto.subtle.importKey(
    'spki',
    binary,
    ECDH_PARAMS,
    true,
    []    // public keys have no usages — they're just data
  )
}

// ── STEP 4: Derive the shared secret ──────────────────
// YOUR private key + THEIR public key = shared secret
// They do: THEIR private key + YOUR public key = same secret
// This is the "half-half" — neither half alone works
export async function deriveSharedKey(myPrivateKey, theirPublicKey) {
  return crypto.subtle.deriveKey(
    { name: 'ECDH', public: theirPublicKey },
    myPrivateKey,     // ← your half
    AES_PARAMS,       // derive an AES-256-GCM key
    false,            // not extractable — can never be exported
    ['encrypt', 'decrypt']
  )
}

// ── STEP 5: Encrypt a message ─────────────────────────
// Uses the shared secret to encrypt text
// Returns base64 string safe to send over network
export async function encryptMessage(sharedKey, plaintext) {
  // Random initialization vector — different every message
  // Like a random salt — ensures same message encrypts differently each time
  const iv = crypto.getRandomValues(new Uint8Array(12))

  const encoded = new TextEncoder().encode(plaintext)

  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    sharedKey,
    encoded
  )

  // Combine iv + encrypted data into one package
  const combined = new Uint8Array(iv.length + encrypted.byteLength)
  combined.set(iv, 0)
  combined.set(new Uint8Array(encrypted), iv.length)

  return btoa(String.fromCharCode(...combined))
}

// ── STEP 6: Decrypt a message ─────────────────────────
// Uses the shared secret to decrypt received message
export async function decryptMessage(sharedKey, encryptedBase64) {
  try {
    const combined = Uint8Array.from(
      atob(encryptedBase64),
      c => c.charCodeAt(0)
    )

    // Split back into iv and encrypted data
    const iv        = combined.slice(0, 12)
    const encrypted = combined.slice(12)

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      sharedKey,
      encrypted
    )

    return new TextDecoder().decode(decrypted)
  } catch (err) {
    return '[Message could not be decrypted]'
  }
}

// ── KEY STORE: In-memory storage ──────────────────────
// Keys live ONLY in memory — deleted on logout
// Never written to localStorage, never sent to server
class KeyStore {
  constructor() {
    this.myKeyPair   = null    // { publicKey, privateKey }
    this.sharedKeys  = {}      // { username: CryptoKey }
    this.publicKeys  = {}      // { username: base64 }
  }

  setMyKeyPair(keyPair) {
    this.myKeyPair = keyPair
  }

  getMyKeyPair() {
    return this.myKeyPair
  }

  setSharedKey(username, key) {
    this.sharedKeys[username] = key
  }

  getSharedKey(username) {
    return this.sharedKeys[username]
  }

  cachePublicKey(username, base64) {
    this.publicKeys[username] = base64
  }

  getCachedPublicKey(username) {
    return this.publicKeys[username]
  }

  // Called on logout — wipes ALL keys from memory
  clear() {
    this.myKeyPair  = null
    this.sharedKeys = {}
    this.publicKeys = {}
    console.log('🔐 All keys cleared from memory')
  }
}

export const keyStore = new KeyStore()

// ── MASTER SETUP: Called on login ─────────────────────
// Generates key pair, returns public key for server upload
export async function setupEncryption() {
  const keyPair = await generateKeyPair()
  keyStore.setMyKeyPair(keyPair)
  const publicKeyBase64 = await exportPublicKey(keyPair.publicKey)
  console.log('🔐 ECDH key pair generated — private key in memory only')
  return publicKeyBase64
}

// ── GET SHARED KEY: Called before first message ────────
// Fetches partner's public key from server if not cached
// Derives and caches the shared secret
export async function getOrCreateSharedKey(partnerUsername, fetchPublicKey) {
  // Return cached key if exists
  const cached = keyStore.getSharedKey(partnerUsername)
  if (cached) return cached

  // Fetch partner's public key from server
  const partnerPublicKeyBase64 = await fetchPublicKey(partnerUsername)
  if (!partnerPublicKeyBase64) {
    throw new Error(`Cannot find public key for ${partnerUsername}`)
  }

  // Import their public key
  const theirPublicKey = await importPublicKey(partnerPublicKeyBase64)

  // Derive shared secret — the "full key from two halves"
  const myPrivateKey = keyStore.getMyKeyPair().privateKey
  const sharedKey = await deriveSharedKey(myPrivateKey, theirPublicKey)

  // Cache it — don't re-derive every message
  keyStore.setSharedKey(partnerUsername, sharedKey)

  console.log(`🔐 Shared key derived with ${partnerUsername}`)
  return sharedKey
}

// ── PASSWORD HASHING: For local key derivation ─────────
// Derives a deterministic key from password
// Used to re-derive keys consistently from same password
export async function deriveKeyFromPassword(password, salt) {
  const encoder = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  )

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode(salt),
      iterations: 100000,   // 100k iterations — slow on purpose (brute force protection)
      hash: 'SHA-256',
    },
    keyMaterial,
    AES_PARAMS,
    false,
    ['encrypt', 'decrypt']
  )
}
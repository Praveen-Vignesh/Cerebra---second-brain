// Server-only. Encrypts/decrypts small secrets (the user's AI API key) before
// they're stored in the database. Uses Node's built-in `crypto` — never import
// this from a client component (it needs the server-side secret key + node APIs).
//
// Algorithm: AES-256-GCM.
//   - AES-256 = a symmetric cipher (same key encrypts and decrypts) with a 32-byte key.
//   - GCM = an "authenticated" mode: besides the ciphertext it produces an "auth
//     tag" that lets decryption detect if the data was tampered with. If anything
//     changed, decryption throws instead of returning garbage.
//
// The 32-byte key lives in the SETTINGS_ENCRYPTION_KEY env var (see .env.local),
// as 64 hex characters. Generate one with:  openssl rand -hex 32

import crypto from 'crypto';

const ALGO = 'aes-256-gcm';

// Read + validate the encryption key from the environment. Kept in a function so
// a missing/wrong key fails loudly at call time with a clear message.
function getKey(): Buffer {
	const raw = process.env.SETTINGS_ENCRYPTION_KEY;
	if (!raw) {
		throw new Error('SETTINGS_ENCRYPTION_KEY is not set in .env.local (need 64 hex chars).');
	}
	const key = Buffer.from(raw, 'hex');
	if (key.length !== 32) {
		throw new Error('SETTINGS_ENCRYPTION_KEY must be 32 bytes (64 hex chars). Generate: openssl rand -hex 32');
	}
	return key;
}

// Encrypt a plaintext string → a single self-contained token we can store in one
// text column. We pack three things, base64-encoded and colon-separated:
//   iv  : a fresh random 12-byte "initialization vector" (makes the same input
//         encrypt differently each time — never reuse an IV with the same key).
//   tag : the GCM auth tag, used to verify integrity on decrypt.
//   data: the actual ciphertext.
export function encryptSecret(plain: string): string {
	const iv = crypto.randomBytes(12);
	const cipher = crypto.createCipheriv(ALGO, getKey(), iv);
	const data = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
	const tag = cipher.getAuthTag();
	return [iv.toString('base64'), tag.toString('base64'), data.toString('base64')].join(':');
}

// Reverse of the above. Splits the token back into iv/tag/data and decrypts. If
// the token was tampered with (or the key is wrong), `final()` throws.
export function decryptSecret(token: string): string {
	const [ivB64, tagB64, dataB64] = token.split(':');
	const iv = Buffer.from(ivB64, 'base64');
	const tag = Buffer.from(tagB64, 'base64');
	const data = Buffer.from(dataB64, 'base64');
	const decipher = crypto.createDecipheriv(ALGO, getKey(), iv);
	decipher.setAuthTag(tag);
	return Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8');
}

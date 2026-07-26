/**
 * Client-Side Cryptographic Utilities using Web Crypto API
 */

export async function computeSha256(dataStr: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(dataStr);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function encryptAnswerPayload(
  payloadObj: any,
  secretKeyStr: string = "AIBOS-STUDENT-ENCRYPTION-KEY"
): Promise<{ ciphertext: string; nonce: string }> {
  const encoder = new TextEncoder();
  const plaintext = encoder.encode(JSON.stringify(payloadObj));
  
  // Derive key using SHA-256
  const keyHash = await window.crypto.subtle.digest('SHA-256', encoder.encode(secretKeyStr));
  const cryptoKey = await window.crypto.subtle.importKey(
    'raw',
    keyHash,
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  );

  const nonce = window.crypto.getRandomValues(new Uint8Array(12));
  const ciphertextBuffer = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: nonce },
    cryptoKey,
    plaintext
  );

  const ciphertextArray = Array.from(new Uint8Array(ciphertextBuffer));
  const nonceArray = Array.from(nonce);

  return {
    ciphertext: btoa(String.fromCharCode(...ciphertextArray)),
    nonce: btoa(String.fromCharCode(...nonceArray))
  };
}

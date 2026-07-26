import base64
import os
import hashlib
from typing import Tuple, Dict, Any
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from app.core.config import settings

# Master system key derived from SECRET_KEY
def _get_derived_key() -> bytes:
    return hashlib.sha256(settings.SECRET_KEY.encode('utf-8')).digest()

def encrypt_payload(data_str: str) -> Dict[str, str]:
    """
    Encrypts plaintext string payload using AES-256-GCM.
    Returns base64 encoded ciphertext and nonce.
    """
    key = _get_derived_key()
    aesgcm = AESGCM(key)
    nonce = os.urandom(12)  # 96-bit nonce for AES-GCM
    ciphertext = aesgcm.encrypt(nonce, data_str.encode('utf-8'), None)
    
    return {
        "ciphertext": base64.b64encode(ciphertext).decode('utf-8'),
        "nonce": base64.b64encode(nonce).decode('utf-8')
    }

def decrypt_payload(ciphertext_b64: str, nonce_b64: str) -> str:
    """
    Decrypts AES-256-GCM ciphertext back to plaintext.
    """
    key = _get_derived_key()
    aesgcm = AESGCM(key)
    ciphertext = base64.b64decode(ciphertext_b64.encode('utf-8'))
    nonce = base64.b64decode(nonce_b64.encode('utf-8'))
    
    decrypted_bytes = aesgcm.decrypt(nonce, ciphertext, None)
    return decrypted_bytes.decode('utf-8')

def compute_hash_chain(previous_hash: str, payload_str: str, timestamp_str: str) -> str:
    """
    Calculates SHA-256 hash chain checksum for tamper detection.
    """
    combined = f"{previous_hash}:{payload_str}:{timestamp_str}"
    return hashlib.sha256(combined.encode('utf-8')).hexdigest()

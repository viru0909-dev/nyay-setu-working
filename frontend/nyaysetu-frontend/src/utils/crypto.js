// E2EE Utility using Web Crypto API

/**
 * Generate a new AES-GCM encryption key.
 */
export async function generateKey() {
    return await window.crypto.subtle.generateKey(
        {
            name: "AES-GCM",
            length: 256
        },
        true,
        ["encrypt", "decrypt"]
    );
}

/**
 * Encrypt a plaintext string using the provided key.
 */
export async function encryptMessage(key, message) {
    const encoder = new TextEncoder();
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encryptedContent = await window.crypto.subtle.encrypt(
        {
            name: "AES-GCM",
            iv: iv
        },
        key,
        encoder.encode(message)
    );
    
    // Combine IV and encrypted content for storage/transmission
    const encryptedBytes = new Uint8Array(iv.length + encryptedContent.byteLength);
    encryptedBytes.set(iv, 0);
    encryptedBytes.set(new Uint8Array(encryptedContent), iv.length);
    
    // Return Base64 encoded string
    return btoa(String.fromCharCode.apply(null, encryptedBytes));
}

/**
 * Decrypt a Base64 encoded ciphertext string using the provided key.
 */
export async function decryptMessage(key, encryptedBase64) {
    const encryptedBytes = new Uint8Array(atob(encryptedBase64).split('').map(char => char.charCodeAt(0)));
    const iv = encryptedBytes.slice(0, 12);
    const data = encryptedBytes.slice(12);
    
    const decryptedContent = await window.crypto.subtle.decrypt(
        {
            name: "AES-GCM",
            iv: iv
        },
        key,
        data
    );
    
    const decoder = new TextDecoder();
    return decoder.decode(decryptedContent);
}

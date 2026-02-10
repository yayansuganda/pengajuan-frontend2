/**
 * Fronting Authentication Module
 * Handles POS officer authentication and session management
 */

import CryptoJS from 'crypto-js';

export interface FrontingUserData {
    name: string;
    nippos: string;
    account_no: string;
    kcu_name?: string;
    kc_name?: string;
    role: string;
    timestamp?: number;
}

const FRONTING_USER_KEY = 'fronting_user';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const SECRET_KEY = 'KEYSMMFR23012026'; // Secret key untuk dekripsi
const IV_KEY = 'XIVMMFRI23012026'; // IV key untuk dekripsi

/**
 * Helper function to convert string to Uint8Array (for browser environment)
 */
function stringToUint8Array(str: string): Uint8Array {
    const arr = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++) {
        arr[i] = str.charCodeAt(i);
    }
    return arr;
}

/**
 * Helper function to convert Uint8Array to string
 */
function uint8ArrayToString(arr: Uint8Array): string {
    return Array.from(arr).map(byte => String.fromCharCode(byte)).join('');
}

/**
 * Decrypt the fronting data from URL parameter using AES-128-CTR encryption
 * 
 * VERIFIED PROCESS (matching Node.js script that works):
 * 1. Base64 decode #1 → String (still base64)
 * 2. Base64 decode #2 → Binary encrypted data
 * 3. AES-128-CTR decrypt with direct UTF-8 keys (NO hashing)
 * 4. Result: JSON data
 * 
 * @param encryptedData - The encrypted data string from URL (double base64 encoded)
 * @returns Promise<FrontingUserData | null> - Decrypted user data or null if failed
 */
export async function decryptFrontingData(encryptedData: string): Promise<FrontingUserData | null> {
    try {
        console.log('[frontingAuth] Starting decryption...');
        console.log('[frontingAuth] Raw encrypted data length:', encryptedData.length);
        console.log('[frontingAuth] First 50 chars:', encryptedData.substring(0, 50));

        // IMPORTANT: Clean up the data first
        // URL encoding might change + to space, or add other characters
        let cleanedData = encryptedData;

        // Replace spaces with + (URL decoding issue)
        cleanedData = cleanedData.replace(/ /g, '+');

        // Remove any whitespace/newlines
        cleanedData = cleanedData.trim();

        console.log('[frontingAuth] Cleaned data length:', cleanedData.length);
        console.log('[frontingAuth] First 50 chars (cleaned):', cleanedData.substring(0, 50));

        // STEP 1: First Base64 Decode
        console.log('[frontingAuth] Step 1: First base64 decode...');
        const firstDecode = atob(cleanedData);
        console.log('[frontingAuth] ✓ First decode length:', firstDecode.length);
        console.log('[frontingAuth] First 50 chars:', firstDecode.substring(0, 50));

        // STEP 2: Second Base64 Decode
        console.log('[frontingAuth] Step 2: Second base64 decode...');
        const secondDecode = atob(firstDecode);
        console.log('[frontingAuth] ✓ Second decode length:', secondDecode.length);

        // Convert to Uint8Array for proper binary handling
        const encryptedBytes = stringToUint8Array(secondDecode);
        console.log('[frontingAuth] Encrypted bytes length:', encryptedBytes.length);
        console.log('[frontingAuth] First 32 bytes (hex):', Array.from(encryptedBytes.slice(0, 32)).map(b => b.toString(16).padStart(2, '0')).join(''));

        // STEP 3: Prepare keys (matching Node.js implementation exactly)
        console.log('[frontingAuth] Step 3: Preparing keys...');
        const keyBytes = stringToUint8Array(SECRET_KEY);
        const ivBytes = stringToUint8Array(IV_KEY);

        console.log('[frontingAuth] Key length:', keyBytes.length);
        console.log('[frontingAuth] IV length:', ivBytes.length);
        console.log('[frontingAuth] Key (hex):', Array.from(keyBytes).map(b => b.toString(16).padStart(2, '0')).join(''));
        console.log('[frontingAuth] IV (hex):', Array.from(ivBytes).map(b => b.toString(16).padStart(2, '0')).join(''));

        // STEP 4: Use Web Crypto API (browser native, like Node.js crypto)
        console.log('[frontingAuth] Step 4: Using Web Crypto API for decryption...');

        // Import key
        return crypto.subtle.importKey(
            'raw',
            keyBytes.buffer as ArrayBuffer,
            { name: 'AES-CTR', length: 128 },
            false,
            ['decrypt']
        ).then(cryptoKey => {
            // Decrypt
            return crypto.subtle.decrypt(
                {
                    name: 'AES-CTR',
                    counter: ivBytes.buffer as ArrayBuffer,
                    length: 128
                },
                cryptoKey,
                encryptedBytes.buffer as ArrayBuffer
            );
        }).then(decrypted => {
            // Convert result to string
            const decryptedBytes = new Uint8Array(decrypted);
            const decryptedText = new TextDecoder('utf-8').decode(decryptedBytes);

            console.log('[frontingAuth] ✓ Decryption successful!');
            console.log('[frontingAuth] Decrypted text length:', decryptedText.length);
            console.log('[frontingAuth] Decrypted text preview (first 100):', decryptedText.substring(0, 100));
            console.log('[frontingAuth] Decrypted text preview (last 100):', decryptedText.substring(decryptedText.length - 100));
            console.log('[frontingAuth] ===== FULL DECRYPTED TEXT =====');
            console.log(decryptedText);
            console.log('[frontingAuth] ===== END FULL TEXT =====');

            // Check for common issues
            console.log('[frontingAuth] Text starts with:', decryptedText.charAt(0), '(charCode:', decryptedText.charCodeAt(0), ')');
            console.log('[frontingAuth] Text ends with:', decryptedText.charAt(decryptedText.length - 1), '(charCode:', decryptedText.charCodeAt(decryptedText.length - 1), ')');

            // Try to trim and clean
            const cleanedText = decryptedText.trim();
            console.log('[frontingAuth] After trim, length:', cleanedText.length);
            console.log('[frontingAuth] Cleaned text:', cleanedText);

            // Parse JSON
            console.log('[frontingAuth] Attempting to parse JSON...');
            const userData = JSON.parse(cleanedText) as FrontingUserData;

            // Validate
            if (!userData.name || !userData.nippos) {
                console.error('[frontingAuth] ❌ Invalid user data: missing required fields');
                return null;
            }

            // Add timestamp
            userData.timestamp = Date.now();

            console.log('[frontingAuth] ✅ Success! User:', userData.name);
            console.log('[frontingAuth] NIPPOS:', userData.nippos);

            return userData;

        }).catch(error => {
            console.error('[frontingAuth] ❌ Web Crypto API failed:', error);

            // FALLBACK: Try with CryptoJS
            console.log('[frontingAuth] Trying fallback with CryptoJS...');
            try {
                const ciphertext = CryptoJS.enc.Latin1.parse(secondDecode);
                const cipherParams = CryptoJS.lib.CipherParams.create({ ciphertext });

                const key = CryptoJS.enc.Utf8.parse(SECRET_KEY);
                const iv = CryptoJS.enc.Utf8.parse(IV_KEY);

                const decrypted = CryptoJS.AES.decrypt(cipherParams, key, {
                    mode: CryptoJS.mode.CTR,
                    padding: CryptoJS.pad.NoPadding,
                    iv: iv
                });

                const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);

                if (decryptedText && decryptedText.length > 0) {
                    const userData = JSON.parse(decryptedText) as FrontingUserData;
                    if (userData.name && userData.nippos) {
                        userData.timestamp = Date.now();
                        console.log('[frontingAuth] ✅ Fallback successful!');
                        return userData;
                    }
                }

                return null;
            } catch (fallbackError: any) {
                console.error('[frontingAuth] Fallback also failed:', fallbackError);
                return null;
            }
        });

    } catch (error: any) {
        console.error('[frontingAuth] ❌ Decryption failed:', error.message);
        console.error('[frontingAuth] Error name:', error.name);
        console.error('[frontingAuth] Stack:', error.stack);

        // If it's a JSON parse error, we actually decrypted something but it's not valid JSON
        if (error instanceof SyntaxError && error.message.includes('JSON')) {
            console.error('[frontingAuth] 🔍 This is a JSON parse error!');
            console.error('[frontingAuth] 🔍 Decryption probably succeeded but output is not valid JSON');
            console.error('[frontingAuth] 🔍 Check the FULL DECRYPTED TEXT above to see what was decrypted');
        }

        return null;
    }
}

/**
 * Validate if the user is a valid POS officer
 * @param userData - The user data to validate
 * @returns true if valid POS officer, false otherwise
 */
export function isValidPOSOfficer(userData: FrontingUserData): boolean {
    if (!userData) return false;

    // Check required fields
    const hasRequiredFields = !!(
        userData.name &&
        userData.nippos &&
        userData.account_no &&
        userData.role
    );

    if (!hasRequiredFields) return false;

    // Validate role is POS officer
    const validRoles = ['POS', 'POS_OFFICER', 'PETUGAS_POS'];
    return validRoles.includes(userData.role.toUpperCase());
}

/**
 * Store fronting user data in localStorage
 * @param userData - The user data to store
 */
export function storeFrontingUser(userData: FrontingUserData): void {
    try {
        // Add/update timestamp
        userData.timestamp = Date.now();

        // Store in localStorage
        localStorage.setItem(FRONTING_USER_KEY, JSON.stringify(userData));
    } catch (error) {
        console.error('Failed to store fronting user:', error);
    }
}

/**
 * Get fronting user data from localStorage
 * @returns FrontingUserData or null if not found
 */
export function getFrontingUser(): FrontingUserData | null {
    try {
        const storedData = localStorage.getItem(FRONTING_USER_KEY);

        if (!storedData) return null;

        const userData = JSON.parse(storedData) as FrontingUserData;
        return userData;
    } catch (error) {
        console.error('Failed to get fronting user:', error);
        return null;
    }
}

/**
 * Check if the fronting session is still valid
 * @returns true if session is valid, false otherwise
 */
export function isFrontingSessionValid(): boolean {
    try {
        const userData = getFrontingUser();

        if (!userData) return false;

        // Check basic required fields (NO ROLE VALIDATION)
        if (!userData.name || !userData.nippos) {
            console.log('[frontingAuth] Session invalid: missing name or nippos');
            return false;
        }

        // Check timestamp
        if (!userData.timestamp) {
            console.log('[frontingAuth] Session invalid: missing timestamp');
            return false;
        }

        // Check if session has expired
        const now = Date.now();
        const sessionAge = now - userData.timestamp;

        if (sessionAge >= SESSION_DURATION) {
            console.log('[frontingAuth] Session expired:', sessionAge, 'ms');
            return false;
        }

        console.log('[frontingAuth] ✅ Session valid:', userData.name);
        return true;
    } catch (error) {
        console.error('Failed to validate fronting session:', error);
        return false;
    }
}

/**
 * Clear fronting user session
 */
export function clearFrontingUser(): void {
    try {
        localStorage.removeItem(FRONTING_USER_KEY);
    } catch (error) {
        console.error('Failed to clear fronting user:', error);
    }
}

/**
 * Encrypt user data for URL parameter
 * @param userData - The user data to encrypt
 * @returns Encrypted string for URL parameter
 */
export function encryptFrontingData(userData: FrontingUserData): string {
    try {
        // Convert to JSON
        const jsonData = JSON.stringify(userData);

        // Encode to base64
        const encodedData = btoa(jsonData);

        return encodedData;
    } catch (error) {
        console.error('Failed to encrypt fronting data:', error);
        return '';
    }
}

import * as CryptoJS from 'crypto-js';

/**
 * Generate JWT signature for external API authentication
 * Following JWT standard: header.payload.signature
 */
export class JWTHelper {
    private static readonly SECRET_KEY = 'jNlMdUdxtqflm5LqX1aMZAR7sHQgyqOnu2tpDp84eOm40nDCqzFqJvaD7JJX1j55';
    private static readonly PARTNER_ID = 'M0ABAYOWOCGBHWCCL4QXEOCKK1ED3MZL';

    /**
     * Encode string to Base64URL format
     */
    private static base64UrlEncode(str: string): string {
        const base64 = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(str));
        return base64
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '');
    }

    /**
     * Generate HMAC SHA256 signature
     */
    private static hmacSha256(data: string, secret: string): string {
        return CryptoJS.HmacSHA256(data, secret).toString(CryptoJS.enc.Base64)
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '');
    }

    /**
     * Generate JWT token from payload
     * @param payload - The payload object to be signed
     * @returns Complete JWT token (header.payload.signature)
     */
    static generateToken(payload: object): string {
        // 1. Prepare JWT header
        const header = {
            alg: 'HS256',
            typ: 'JWT'
        };

        // 2. Encode header to Base64URL
        const encodedHeader = this.base64UrlEncode(JSON.stringify(header));

        // 3. Encode payload to Base64URL
        const encodedPayload = this.base64UrlEncode(JSON.stringify(payload));

        // 4. Create signature: HMACSHA256(base64UrlEncode(header) + "." + base64UrlEncode(payload), secret)
        const signatureInput = `${encodedHeader}.${encodedPayload}`;
        const signature = this.hmacSha256(signatureInput, this.SECRET_KEY);

        // 5. Combine all parts with dots
        return `${encodedHeader}.${encodedPayload}.${signature}`;
    }

    /**
     * Get Partner ID for API header
     */
    static getPartnerId(): string {
        return this.PARTNER_ID;
    }
}

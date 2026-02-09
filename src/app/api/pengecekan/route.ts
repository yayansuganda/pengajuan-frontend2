import { NextRequest, NextResponse } from 'next/server';
import * as CryptoJS from 'crypto-js';
import axios from 'axios';

// Konfigurasi API
const BASE_URL = 'https://pospay-callback.posindonesia.co.id/proxy2-api/dev/pensiun/pos/request/dapempensiun';
const PARTNER_ID = 'M0ABAYOWOCGBHWCCL4QXEOCKK1ED3MZL';
const SECRET_KEY = 'jNlMdUdxtqflm5LqX1aMZAR7sHQgyqOnu2tpDp84eOm40nDCqzFqJvaD7JJX1j55';

// Helper functions untuk JWT
function base64UrlEncode(str: string): string {
    const base64 = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(str));
    return base64
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

function hmacSha256(data: string, secret: string): string {
    return CryptoJS.HmacSHA256(data, secret).toString(CryptoJS.enc.Base64)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

function generateJWT(payload: object): string {
    const header = {
        alg: 'HS256',
        typ: 'JWT'
    };

    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedPayload = base64UrlEncode(JSON.stringify(payload));

    const signatureInput = `${encodedHeader}.${encodedPayload}`;
    const signature = hmacSha256(signatureInput, SECRET_KEY);

    return `${encodedHeader}.${encodedPayload}.${signature}`;
}

export async function POST(request: NextRequest) {
    try {
        // Parse request body
        const body = await request.json();
        const { nopen } = body;

        if (!nopen) {
            return NextResponse.json(
                { error: 'NOPEN is required' },
                { status: 400 }
            );
        }

        // Prepare payload
        const payload = {
            idpensiun: nopen
        };

        // Generate JWT token
        const jwtToken = generateJWT(payload);

        // Prepare headers
        const headers = {
            'Content-Type': 'application/json',
            'X-Partner-Id': PARTNER_ID,
            'X-Signature': jwtToken
        };

        console.log('Calling external API:', BASE_URL);
        console.log('Payload:', payload);
        console.log('JWT Token:', jwtToken);

        // Call external API
        const response = await axios.post(BASE_URL, payload, { headers });

        console.log('API Response:', response.data);

        // Return response
        return NextResponse.json(response.data);

    } catch (error: any) {
        console.error('Error calling external API:', error);

        if (error.response) {
            return NextResponse.json(
                {
                    error: 'External API error',
                    details: error.response.data,
                    status: error.response.status
                },
                { status: error.response.status }
            );
        }

        return NextResponse.json(
            { error: 'Internal server error', message: error.message },
            { status: 500 }
        );
    }
}

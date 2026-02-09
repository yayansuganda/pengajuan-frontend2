/**
 * Test Script untuk API Pengecekan Pensiunan
 * Jalankan dengan: node --loader ts-node/esm test-api-call.ts
 */

import * as CryptoJS from 'crypto-js';
import axios from 'axios';

// Konfigurasi
const BASE_URL = 'https://pospay-callback.posindonesia.co.id/proxy2-api/dev/pensiun/pos/request/dapempensiun';
const PARTNER_ID = 'M0ABAYOWOCGBHWCCL4QXEOCKK1ED3MZL';
const SECRET_KEY = 'jNlMdUdxtqflm5LqX1aMZAR7sHQgyqOnu2tpDp84eOm40nDCqzFqJvaD7JJX1j55';
const TEST_NOPEN = '08000511000';

// Helper functions
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
    // 1. Header
    const header = {
        alg: 'HS256',
        typ: 'JWT'
    };

    // 2. Encode header & payload
    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedPayload = base64UrlEncode(JSON.stringify(payload));

    // 3. Create signature
    const signatureInput = `${encodedHeader}.${encodedPayload}`;
    const signature = hmacSha256(signatureInput, SECRET_KEY);

    // 4. Combine
    return `${encodedHeader}.${encodedPayload}.${signature}`;
}

// Main test function
async function testAPICall() {
    console.log('='.repeat(60));
    console.log('TEST API PENGECEKAN PENSIUNAN');
    console.log('='.repeat(60));
    console.log();

    // 1. Prepare payload
    const payload = {
        idpensiun: TEST_NOPEN
    };

    console.log('1. Payload:');
    console.log(JSON.stringify(payload, null, 2));
    console.log();

    // 2. Generate JWT
    const jwtToken = generateJWT(payload);
    console.log('2. JWT Token:');
    console.log(jwtToken);
    console.log();

    // 3. Prepare headers
    const headers = {
        'Content-Type': 'application/json',
        'X-Partner-Id': PARTNER_ID,
        'X-Signature': jwtToken
    };

    console.log('3. Headers:');
    console.log(JSON.stringify(headers, null, 2));
    console.log();

    // 4. Make API call
    console.log('4. Calling API...');
    console.log(`URL: ${BASE_URL}`);
    console.log();

    try {
        const startTime = Date.now();
        const response = await axios.post(BASE_URL, payload, { headers });
        const duration = Date.now() - startTime;

        console.log('✅ SUCCESS!');
        console.log(`Duration: ${duration}ms`);
        console.log();

        console.log('5. Response:');
        console.log(JSON.stringify(response.data, null, 2));
        console.log();

        // 6. Parse data
        if (response.data.status && response.data.resp_code === '00') {
            const data = response.data.data;
            console.log('6. Parsed Data:');
            console.log('---');
            console.log(`Nama: ${data.nama_lengkap}`);
            console.log(`NOPEN: ${data.nomor_pensiun}`);
            console.log(`Gaji Bersih: Rp ${data.gaji_bersih.toLocaleString('id-ID')}`);
            console.log(`Bank: ${data.mitra}`);
            console.log(`No. Rekening: ${data.nomor_rekening}`);
            console.log(`Kantor: ${data.nama_kantor}`);
            console.log(`Status: ${data.status_dapem === '13' ? 'Aktif' : 'Tidak Aktif'}`);
            console.log(`Bulan: ${data.bulan_dapem}`);
            console.log('---');
        } else {
            console.log('❌ API returned error:');
            console.log(`Code: ${response.data.resp_code}`);
            console.log(`Message: ${response.data.resp_mess}`);
        }

    } catch (error: any) {
        console.log('❌ ERROR!');
        console.log();

        if (error.response) {
            console.log('Response Error:');
            console.log(`Status: ${error.response.status}`);
            console.log(`Data:`, JSON.stringify(error.response.data, null, 2));
        } else if (error.request) {
            console.log('Request Error:');
            console.log('No response received from server');
            console.log(error.message);
        } else {
            console.log('Error:', error.message);
        }
    }

    console.log();
    console.log('='.repeat(60));
}

// Run test
testAPICall().catch(console.error);

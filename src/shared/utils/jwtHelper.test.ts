import { JWTHelper } from '@/shared/utils/jwtHelper';

/**
 * Test file untuk memverifikasi JWT signature generation
 * Sesuai dengan contoh dari dokumentasi Pos Indonesia
 */

// Test case dari dokumentasi
const testPayload = {
    idpensiun: "08000511000"
};

console.log('=== JWT Signature Test ===\n');

// Generate JWT token
const jwtToken = JWTHelper.generateToken(testPayload);

console.log('Payload:', JSON.stringify(testPayload));
console.log('\nGenerated JWT Token:');
console.log(jwtToken);

// Split token untuk analisis
const parts = jwtToken.split('.');
console.log('\n--- Token Parts ---');
console.log('Header (Base64URL):', parts[0]);
console.log('Payload (Base64URL):', parts[1]);
console.log('Signature (Base64URL):', parts[2]);

// Decode header dan payload untuk verifikasi
try {
    const headerDecoded = Buffer.from(parts[0], 'base64').toString('utf-8');
    const payloadDecoded = Buffer.from(parts[1], 'base64').toString('utf-8');

    console.log('\n--- Decoded Parts ---');
    console.log('Header:', headerDecoded);
    console.log('Payload:', payloadDecoded);
} catch (e) {
    console.log('Note: Decoding may fail due to Base64URL padding removal (this is normal)');
}

console.log('\n--- Expected Format ---');
console.log('Expected from docs: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZHBlbnNpdW4iOiIwODAwMDUxMTAwMCJ9.hod6R9iXY_Wd_fk1gkgu314RKPwiHo4CpLh_4y06kE');
console.log('Generated token:    ' + jwtToken);

console.log('\n--- Headers for API Call ---');
console.log('X-Partner-Id:', JWTHelper.getPartnerId());
console.log('X-Signature:', jwtToken);
console.log('Content-Type: application/json');

console.log('\n=== Test Complete ===');

export { };

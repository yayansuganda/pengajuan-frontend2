/**
 * Example Usage: Pengecekan API Integration
 * 
 * File ini menunjukkan cara menggunakan API pengecekan pensiunan
 * dengan JWT signature authentication
 */

import { PengecekanRepositoryImpl } from '@/modules/pengecekan/data/PengecekanRepositoryImpl';
import { JWTHelper } from '@/shared/utils/jwtHelper';

// ============================================
// Example 1: Direct API Call with JWT
// ============================================

async function exampleDirectAPICall() {
    const nopen = "08000511000";

    // 1. Prepare payload
    const payload = {
        idpensiun: nopen
    };

    // 2. Generate JWT token
    const jwtToken = JWTHelper.generateToken(payload);

    console.log('Request Details:');
    console.log('URL:', 'https://pospay-callback.posindonesia.co.id/proxy2-api/dev/pensiun/pos/request/dapempensiun');
    console.log('Method: POST');
    console.log('Headers:', {
        'Content-Type': 'application/json',
        'X-Partner-Id': JWTHelper.getPartnerId(),
        'X-Signature': jwtToken
    });
    console.log('Body:', JSON.stringify(payload));

    // 3. Make the call (using fetch as alternative)
    try {
        const response = await fetch('https://pospay-callback.posindonesia.co.id/proxy2-api/dev/pensiun/pos/request/dapempensiun', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Partner-Id': JWTHelper.getPartnerId(),
                'X-Signature': jwtToken
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        console.log('Response:', data);

        return data;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

// ============================================
// Example 2: Using Repository (Recommended)
// ============================================

async function exampleUsingRepository() {
    const repository = new PengecekanRepositoryImpl();
    const nopen = "08000511000";

    try {
        console.log('Checking pensiunan with NOPEN:', nopen);

        const pensiunan = await repository.checkPensiunan(nopen);

        console.log('Pensiunan Data:');
        console.log('- Nama:', pensiunan.nama_lengkap);
        console.log('- NOPEN:', pensiunan.nopen);
        console.log('- Status:', pensiunan.status_keaktifan);
        console.log('- Gaji Bersih:', pensiunan.gaji_bersih);
        console.log('- Bank:', pensiunan.nama_bank);
        console.log('- No. Rekening:', pensiunan.no_rekening);

        return pensiunan;
    } catch (error) {
        console.error('Failed to fetch pensiunan:', error);
        throw error;
    }
}

// ============================================
// Example 3: Testing JWT Generation
// ============================================

function exampleJWTGeneration() {
    const testCases = [
        { idpensiun: "08000511000" },
        { idpensiun: "12345678901" },
        { idpensiun: "98765432109" }
    ];

    console.log('JWT Generation Test Cases:\n');

    testCases.forEach((payload, index) => {
        const token = JWTHelper.generateToken(payload);
        console.log(`Test Case ${index + 1}:`);
        console.log('Payload:', JSON.stringify(payload));
        console.log('JWT Token:', token);
        console.log('Token Length:', token.length);
        console.log('---');
    });
}

// ============================================
// Example 4: Error Handling
// ============================================

async function exampleErrorHandling() {
    const repository = new PengecekanRepositoryImpl();

    // Test dengan NOPEN yang tidak valid
    const invalidNopens = [
        "",           // Empty
        "123",        // Too short
        "INVALID",    // Not numeric
        "00000000000" // Possibly non-existent
    ];

    for (const nopen of invalidNopens) {
        try {
            console.log(`\nTesting with NOPEN: "${nopen}"`);
            const result = await repository.checkPensiunan(nopen);
            console.log('Success:', result);
        } catch (error: any) {
            console.log('Error:', error.message);
        }
    }
}

// ============================================
// Example 5: Response Mapping Verification
// ============================================

function exampleResponseMapping() {
    // Contoh response dari API (simulasi)
    const mockAPIResponse = {
        nopen: "08000511000",
        nama: "John Doe",
        tgl_lahir: "1960-01-01",
        gender: "L",
        jenis_penerima: "Pensiun Normal",
        status: "Aktif",
        kantor: "Jakarta Pusat",
        alamat: "Jl. Sudirman No. 123",
        bank: "BRI",
        rekening: "1234567890",
        gaji_kotor: 5000000,
        tunjangan: 1000000,
        potongan: 500000,
        gaji_netto: 5500000
    };

    console.log('Mock API Response:', mockAPIResponse);
    console.log('\nMapped to Pensiunan Entity:');

    // Simulasi mapping (sesuai dengan PengecekanRepositoryImpl)
    const mapped = {
        nopen: mockAPIResponse.nopen || "",
        nama_lengkap: mockAPIResponse.nama || "",
        tanggal_lahir: mockAPIResponse.tgl_lahir || "",
        jenis_kelamin: mockAPIResponse.gender || "",
        jenis_pensiun: mockAPIResponse.jenis_penerima || "",
        status_keaktifan: mockAPIResponse.status || "Aktif",
        kantor_bayar: mockAPIResponse.kantor || "",
        alamat: mockAPIResponse.alamat || "",
        nama_bank: mockAPIResponse.bank || "",
        no_rekening: mockAPIResponse.rekening || "",
        gaji_pokok: parseFloat(String(mockAPIResponse.gaji_kotor || 0)),
        tunjangan: parseFloat(String(mockAPIResponse.tunjangan || 0)),
        potongan: parseFloat(String(mockAPIResponse.potongan || 0)),
        gaji_bersih: parseFloat(String(mockAPIResponse.gaji_netto || 0)),
        last_updated: new Date().toISOString()
    };

    console.log(JSON.stringify(mapped, null, 2));
}

// ============================================
// Export examples for testing
// ============================================

export {
    exampleDirectAPICall,
    exampleUsingRepository,
    exampleJWTGeneration,
    exampleErrorHandling,
    exampleResponseMapping
};

// ============================================
// Usage in Browser Console:
// ============================================
/*

// Import the examples
import { 
    exampleDirectAPICall, 
    exampleUsingRepository,
    exampleJWTGeneration 
} from '@/shared/examples/pengecekanExamples';

// Test JWT generation
exampleJWTGeneration();

// Test repository call
await exampleUsingRepository();

// Test direct API call
await exampleDirectAPICall();

*/

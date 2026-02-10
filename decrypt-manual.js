// Manual decrypt script - masukkan IV jika Anda tahu
const CryptoJS = require('crypto-js');

// Configuration
const encryptedData = 'SVl4R1VuVkpFZFZGQlhlT2p1ekt3cDF1SEVBanQ1RnNCMVdlbjdMa3VkdE8rTmQyNjRoVVNPUGltU2d0M2pHaHQxUWNxRnlvams2TVRuT0M1WXY5RHJyVWJUUDBlUi8veUVyUUlHTzIzK1AyK2hoYnc3cWNvaDRQYi9jNS83Nk9xNFl6UXBtaWhnUzkwMWxiUGpaVlEybnJOTE8yZUwxaWU1dit1Nm1MQkQzQng2NTUrRlBzZFZZT241OFpmWm1FNEFIdHRGOUFRVXNvaVJ0QU5ib1pKVTBsSmxjdnhjby8xRXFSRU9BTk9DcDJkc2FjK3Voam9zbzlJWEtsUmJyVVFTbzNBN1RZbitycENQN0MrTU9VNERJa2ZwZXlMZz09';
const SECRET_KEY = 'KEYSMMFR23012026';

// ========================================
// EDIT BAGIAN INI SESUAI DENGAN BACKEND
// ========================================

// Contoh 1: IV adalah string tertentu
const IV_STRING = '1234567890123456'; // Ganti dengan IV yang benar

// Contoh 2: IV di-generate dari fungsi tertentu
// const IV_STRING = SECRET_KEY; // Atau cara lain

// ========================================

console.log('=== MANUAL DECRYPT TEST ===\n');
console.log('Secret Key:', SECRET_KEY);
console.log('IV String:', IV_STRING);
console.log('\n');

try {
    // Parse
    const ciphertext = CryptoJS.enc.Base64.parse(encryptedData);
    const cipherParams = CryptoJS.lib.CipherParams.create({ ciphertext });
    
    // Prepare key and IV
    const key = CryptoJS.enc.Utf8.parse(SECRET_KEY.substring(0, 16));
    const iv = CryptoJS.enc.Utf8.parse(IV_STRING.substring(0, 16));
    
    console.log('Attempting decryption...\n');
    
    // Decrypt
    const decrypted = CryptoJS.AES.decrypt(cipherParams, key, {
        mode: CryptoJS.mode.CTR,
        padding: CryptoJS.pad.NoPadding,
        iv: iv
    });
    
    const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);
    
    if (decryptedText && decryptedText.length > 0) {
        console.log('✅ DEKRIPSI BERHASIL!\n');
        console.log('Decrypted Text:');
        console.log(decryptedText);
        console.log('\n');
        
        try {
            const userData = JSON.parse(decryptedText);
            console.log('📦 User Data:');
            console.log(JSON.stringify(userData, null, 2));
        } catch (e) {
            console.log('⚠️  Bukan format JSON');
        }
    } else {
        console.log('❌ Dekripsi gagal - hasil kosong');
        console.log('Coba ganti IV_STRING dengan nilai yang benar');
    }
    
} catch (error) {
    console.log('❌ Error:', error.message);
    console.log('\nKemungkinan IV atau key tidak cocok dengan yang digunakan saat enkripsi');
}

console.log('\n' + '='.repeat(60));
console.log('INSTRUKSI:');
console.log('1. Edit variable IV_STRING di script ini');
console.log('2. Gunakan IV yang sama dengan yang dipakai saat enkripsi');
console.log('3. Jalankan: node decrypt-manual.js');
console.log('='.repeat(60));






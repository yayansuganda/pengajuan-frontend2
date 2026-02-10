// Test berdasarkan temuan: double decrypt menghasilkan base64
const crypto = require('crypto');

const encryptedData = 'SVl4R1VuVkpFZFZGQlhlT2p1ekt3cDF1SEVBanQ1RnNCMVdlbjdMa3VkdE8rTmQyNjRoVVNPUGltU2d0M2pHaHQxUWNxRnlvams2TVRuT0M1WXY5RHJyVWJUUDBlUi8veUVyUUlHTzIzK1AyK2hoYnc3cWNvaDRQYi9jNS83Nk9xNFl6UXBtaWhnUzkwMWxiUGpaVlEybnJOTE8yZUwxaWU1dit1Nm1MQkQzQng2NTUrRlBzZFZZT241OFpmWm1FNEFIdHRGOUFRVXNvaVJ0QU5ib1pKVTBsSmxjdnhjby8xRXFSRU9BTk9DcDJkc2FjK3Voam9zbzlJWEtsUmJyVVFTbzNBN1RZbitycENQN0MrTU9VNERJa2ZwZXlMZz09';
const SECRET_KEY = 'KEYSMMFR23012026';
const IV_KEY = 'XIVMMFRI23012026';

console.log('=== DECRYPTION TEST - Double Decrypt Then Base64 ===\n');

// Step 1: First AES decrypt
console.log('Step 1: First AES-128-CTR decryption...');
const encryptedBuffer = Buffer.from(encryptedData, 'base64');
const decipher1 = crypto.createDecipheriv('aes-128-ctr', Buffer.from(SECRET_KEY, 'utf8'), Buffer.from(IV_KEY, 'utf8'));
let decrypted1 = decipher1.update(encryptedBuffer);
decrypted1 = Buffer.concat([decrypted1, decipher1.final()]);
console.log('✓ First decrypt complete\n');

// Step 2: Second AES decrypt
console.log('Step 2: Second AES-128-CTR decryption...');
const decipher2 = crypto.createDecipheriv('aes-128-ctr', Buffer.from(SECRET_KEY, 'utf8'), Buffer.from(IV_KEY, 'utf8'));
let decrypted2 = decipher2.update(decrypted1);
decrypted2 = Buffer.concat([decrypted2, decipher2.final()]);
const doubleDecrypted = decrypted2.toString('utf8');
console.log('✓ Second decrypt complete');
console.log('Result looks like base64:', doubleDecrypted.substring(0, 50) + '...\n');

// Step 3: Decode base64
console.log('Step 3: Decoding base64...');
try {
    const finalData = Buffer.from(doubleDecrypted, 'base64').toString('utf8');
    console.log('✓ Base64 decoded\n');
    console.log('='.repeat(70));
    console.log('DECRYPTED DATA:');
    console.log('='.repeat(70));
    console.log(finalData);
    console.log('='.repeat(70));
    
    // Try parse JSON
    try {
        const userData = JSON.parse(finalData);
        console.log('\n🎉🎉🎉 SUCCESS! USER DATA (JSON):');
        console.log('='.repeat(70));
        console.log(JSON.stringify(userData, null, 2));
        console.log('='.repeat(70));
        
        console.log('\n👤 USER INFO:');
        console.log('  Name:', userData.name || '-');
        console.log('  NIPPOS:', userData.nippos || '-');
        console.log('  Account No:', userData.account_no || '-');
        console.log('  Role:', userData.role || '-');
        console.log('  KCU Name:', userData.kcu_name || '-');
        console.log('  KC Name:', userData.kc_name || '-');
        
        console.log('\n✅ DEKRIPSI BERHASIL!');
        process.exit(0);
    } catch (e) {
        console.log('\n⚠️  Decoded data bukan JSON:', e.message);
    }
} catch (e) {
    console.log('❌ Base64 decode failed:', e.message);
}

// Alternative: Triple decrypt
console.log('\n\nTrying triple decrypt...');
try {
    const base64Decoded = Buffer.from(doubleDecrypted, 'base64');
    const decipher3 = crypto.createDecipheriv('aes-128-ctr', Buffer.from(SECRET_KEY, 'utf8'), Buffer.from(IV_KEY, 'utf8'));
    let decrypted3 = decipher3.update(base64Decoded);
    decrypted3 = Buffer.concat([decrypted3, decipher3.final()]);
    
    const finalData = decrypted3.toString('utf8');
    console.log('Triple decrypt result:', finalData.substring(0, 200));
    
    try {
        const userData = JSON.parse(finalData);
        console.log('\n🎉 SUCCESS with triple decrypt!');
        console.log(JSON.stringify(userData, null, 2));
        process.exit(0);
    } catch (e) {}
} catch (e) {
    console.log('Triple decrypt failed:', e.message);
}

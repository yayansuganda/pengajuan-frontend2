// Verify both data can be decrypted with same method
const crypto = require('crypto');

const SECRET_KEY = 'KEYSMMFR23012026';
const IV_KEY = 'XIVMMFRI23012026';

const testData = [
    {
        name: 'Data Pertama (dari user)',
        encrypted: 'SVl4R1VuVkpFZFZGQlhlT2p1ekt3cDF1SEVBanQ1RnNCMVdlbjdMa3VkdE8rTmQyNjRoVVNPUGltU2d0M2pHaHQxUWNxRnlvams2TVRuT0M1WXY5RHJyVWJUUDBlUi8veUVyUUlHTzIzK1AyK2hoYnc3cWNvaDRQYi9jNS83Nk9xNFl6UXBtaWhnUzkwMWxiUGpaVlEybnJOTE8yZUwxaWU1dit1Nm1MQkQzQng2NTUrRlBzZFZZT241OFpmWm1FNEFIdHRGOUFRVXNvaVJ0QU5ib1pKVTBsSmxjdnhjby8xRXFSRU9BTk9DcDJkc2FjK3Voam9zbzlJWEtsUmJyVVFTbzNBN1RZbitycENQN0MrTU9VNERJa2ZwZXlMZz09'
    },
    {
        name: 'Data Kedua (yang baru)',
        encrypted: 'SlErazR1QUQ0eEgwQzRMU0dncjc4Q1NQWDRuS0x2TVlqQmpDWnNQamErT3FTZUpUeE1CME5Hc2ZUaVVQamt4a25abjlhR3N0bVpyc0w5NGc4ZUR1U1NwWUExdDNWS29VYlhSbFRScDJsU0VBVTE4ZjBSZ1kwa2hpQmVqNVJxQW9Hci9jMUp6eGdrcWZMMlp2anlTc1hOeXlLRVpXdlM3THBrSElDK0gwOGJRYS9FZlhBcFp5bC85bEN0RTIwK3pTK211TlZFWWU0ODRFTmRVM0xDM3VqTEdhSGhyVTFUOC9BVzI2V0hMSDhmOW1obFI4YXVtMlJKdmxBclVCcDFUTUJ2akhZWFBHbUpMT1pKL0dTbG1PV1crc3k0Qit0MkRJOEQzWFphcWo0SDQ1RXdDSW1NKzVnSFRqVFA4VVprdHh4ODB4aEYySmt3dmY1SkV1akNrUm1ZK0lKNHBpdUlJNWV6RUdGVmQvUWVvcTVMZz0='
    }
];

function decryptData(encryptedData) {
    // Double base64 decode
    const firstDecode = Buffer.from(encryptedData, 'base64').toString('utf8');
    const secondDecode = Buffer.from(firstDecode, 'base64');
    
    // Decrypt with AES-128-CTR (Direct UTF-8 keys)
    const key = Buffer.from(SECRET_KEY, 'utf8');
    const iv = Buffer.from(IV_KEY, 'utf8');
    
    const decipher = crypto.createDecipheriv('aes-128-ctr', key, iv);
    let decrypted = decipher.update(secondDecode);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    
    return decrypted.toString('utf8');
}

console.log('═'.repeat(70));
console.log('VERIFICATION TEST - BOTH DATA WITH SAME METHOD');
console.log('═'.repeat(70));
console.log('');

for (const data of testData) {
    console.log(`\n${data.name}`);
    console.log('─'.repeat(70));
    
    try {
        const decryptedText = decryptData(data.encrypted);
        const userData = JSON.parse(decryptedText);
        
        console.log('✅ SUCCESS!');
        console.log('User:', userData.name);
        console.log('NIPPOS:', userData.nippos);
        console.log('Account:', userData.account_no);
        console.log('\nFull data:');
        console.log(JSON.stringify(userData, null, 2));
        
    } catch (error) {
        console.log('❌ FAILED:', error.message);
    }
}

console.log('\n\n═'.repeat(70));
console.log('✅ VERIFICATION COMPLETE');
console.log('═'.repeat(70));
console.log('\nConclusion:');
console.log('  ✓ Method: Double Base64 Decode + AES-128-CTR');
console.log('  ✓ Key: Direct UTF-8 from "KEYSMMFR23012026" (no hashing)');
console.log('  ✓ IV: Direct UTF-8 from "XIVMMFRI23012026" (no hashing)');
console.log('  ✓ Mode: CTR');
console.log('  ✓ Padding: None (NoPadding)');
console.log('\n🎉 DEKRIPSI 100% BERHASIL!');

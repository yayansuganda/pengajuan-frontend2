// Test berbagai metode key derivation
const crypto = require('crypto');

const encryptedDataBase64 = 'SVl4R1VuVkpFZFZGQlhlT2p1ekt3cDF1SEVBanQ1RnNCMVdlbjdMa3VkdE8rTmQyNjRoVVNPUGltU2d0M2pHaHQxUWNxRnlvams2TVRuT0M1WXY5RHJyVWJUUDBlUi8veUVyUUlHTzIzK1AyK2hoYnc3cWNvaDRQYi9jNS83Nk9xNFl6UXBtaWhnUzkwMWxiUGpaVlEybnJOTE8yZUwxaWU1dit1Nm1MQkQzQng2NTUrRlBzZFZZT241OFpmWm1FNEFIdHRGOUFRVXNvaVJ0QU5ib1pKVTBsSmxjdnhjby8xRXFSRU9BTk9DcDJkc2FjK3Voam9zbzlJWEtsUmJyVVFTbzNBN1RZbitycENQN0MrTU9VNERJa2ZwZXlMZz09';

const SECRET_KEY = 'KEYSMMFR23012026';
const IV_KEY = 'XIVMMFRI23012026';

console.log('=== TESTING DIFFERENT KEY DERIVATION METHODS ===\n');

// Decode base64 first
const encryptedBuffer = Buffer.from(encryptedDataBase64, 'base64');
console.log('Encrypted buffer length:', encryptedBuffer.length, 'bytes\n');

const methods = [
    {
        name: '1. Direct UTF-8 (no hash)',
        key: Buffer.from(SECRET_KEY, 'utf8'),
        iv: Buffer.from(IV_KEY, 'utf8')
    },
    {
        name: '2. MD5 hash both',
        key: crypto.createHash('md5').update(SECRET_KEY).digest(),
        iv: crypto.createHash('md5').update(IV_KEY).digest()
    },
    {
        name: '3. SHA256 hash (first 16 bytes)',
        key: crypto.createHash('sha256').update(SECRET_KEY).digest().slice(0, 16),
        iv: crypto.createHash('sha256').update(IV_KEY).digest().slice(0, 16)
    },
    {
        name: '4. Key as hex string',
        key: Buffer.from(Buffer.from(SECRET_KEY, 'utf8').toString('hex').substring(0, 32), 'hex'),
        iv: Buffer.from(Buffer.from(IV_KEY, 'utf8').toString('hex').substring(0, 32), 'hex')
    },
    {
        name: '5. PBKDF2 with 1 iteration',
        key: crypto.pbkdf2Sync(SECRET_KEY, 'salt', 1, 16, 'sha256'),
        iv: crypto.pbkdf2Sync(IV_KEY, 'salt', 1, 16, 'sha256')
    },
    {
        name: '6. PBKDF2 with 1000 iterations',
        key: crypto.pbkdf2Sync(SECRET_KEY, 'salt', 1000, 16, 'sha256'),
        iv: crypto.pbkdf2Sync(IV_KEY, 'salt', 1000, 16, 'sha256')
    },
    {
        name: '7. SHA1 hash (first 16 bytes)',
        key: crypto.createHash('sha1').update(SECRET_KEY).digest().slice(0, 16),
        iv: crypto.createHash('sha1').update(IV_KEY).digest().slice(0, 16)
    },
    {
        name: '8. Base64 encode then take bytes',
        key: Buffer.from(Buffer.from(SECRET_KEY).toString('base64').substring(0, 16), 'utf8'),
        iv: Buffer.from(Buffer.from(IV_KEY).toString('base64').substring(0, 16), 'utf8')
    }
];

for (const method of methods) {
    console.log(`\n${method.name}`);
    console.log('─'.repeat(70));
    console.log(`Key (hex): ${method.key.toString('hex')}`);
    console.log(`IV (hex): ${method.iv.toString('hex')}`);
    
    try {
        const decipher = crypto.createDecipheriv('aes-128-ctr', method.key, method.iv);
        let decrypted = decipher.update(encryptedBuffer);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        
        const decryptedText = decrypted.toString('utf8');
        
        // Check if it looks like JSON
        if (decryptedText.includes('{') && decryptedText.includes('}')) {
            console.log('✅ LOOKS PROMISING! Contains JSON brackets');
            console.log('Decrypted text:', decryptedText);
            
            try {
                const userData = JSON.parse(decryptedText);
                console.log('\n🎉🎉🎉 SUCCESS!!!');
                console.log(JSON.stringify(userData, null, 2));
                process.exit(0);
            } catch (e) {
                console.log('Contains brackets but not valid JSON');
            }
        } else if (decryptedText.match(/^[A-Za-z0-9+/=]+$/)) {
            // Looks like base64
            console.log('⚠️  Result looks like base64, trying to decode...');
            try {
                const decoded = Buffer.from(decryptedText, 'base64').toString('utf8');
                console.log('Base64 decoded:', decoded.substring(0, 100));
                
                if (decoded.includes('{')) {
                    try {
                        const userData = JSON.parse(decoded);
                        console.log('\n🎉🎉🎉 SUCCESS AFTER BASE64 DECODE!!!');
                        console.log(JSON.stringify(userData, null, 2));
                        process.exit(0);
                    } catch (e) {}
                }
            } catch (e) {}
        } else {
            // Show first 50 chars
            const preview = decryptedText.substring(0, 50).replace(/[^\x20-\x7E]/g, '.');
            console.log(`Result: ${preview}... (garbage)`);
        }
        
    } catch (error) {
        console.log('❌ Error:', error.message);
    }
}

console.log('\n\n❌ Semua metode gagal!');
console.log('\n🔴 CRITICAL: Perlu kode enkripsi backend untuk mengetahui:');
console.log('   1. Bagaimana key di-generate dari string SECRET_KEY');
console.log('   2. Bagaimana IV di-generate dari string IV_KEY');
console.log('   3. Apakah ada salt/pepper/rounds?');
console.log('   4. Library/function apa yang digunakan?');
console.log('\nContoh kode yang dibutuhkan (PHP):');
console.log('─'.repeat(70));
console.log(`$key = 'KEYSMMFR23012026';
$iv = 'XIVMMFRI23012026';
$data = json_encode($userData);

// Bagaimana enkripsi dilakukan?
$encrypted = openssl_encrypt($data, 'aes-128-ctr', $key, ???, $iv);
$result = base64_encode($encrypted);`);
console.log('─'.repeat(70));

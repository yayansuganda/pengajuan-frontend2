// Test dengan double base64 decode + berbagai key derivation
const crypto = require('crypto');

const encryptedData = 'SVl4R1VuVkpFZFZGQlhlT2p1ekt3cDF1SEVBanQ1RnNCMVdlbjdMa3VkdE8rTmQyNjRoVVNPUGltU2d0M2pHaHQxUWNxRnlvams2TVRuT0M1WXY5RHJyVWJUUDBlUi8veUVyUUlHTzIzK1AyK2hoYnc3cWNvaDRQYi9jNS83Nk9xNFl6UXBtaWhnUzkwMWxiUGpaVlEybnJOTE8yZUwxaWU1dit1Nm1MQkQzQng2NTUrRlBzZFZZT241OFpmWm1FNEFIdHRGOUFRVXNvaVJ0QU5ib1pKVTBsSmxjdnhjby8xRXFSRU9BTk9DcDJkc2FjK3Voam9zbzlJWEtsUmJyVVFTbzNBN1RZbitycENQN0MrTU9VNERJa2ZwZXlMZz09';

const SECRET_KEY = 'KEYSMMFR23012026';
const IV_KEY = 'XIVMMFRI23012026';

console.log('=== DOUBLE BASE64 DECODE + KEY DERIVATION TESTING ===\n');

// Double base64 decode
console.log('Step 1: First base64 decode...');
const firstDecode = Buffer.from(encryptedData, 'base64').toString('utf8');
console.log('✓ First decode (base64 string):', firstDecode.substring(0, 50) + '...\n');

console.log('Step 2: Second base64 decode...');
const encryptedBuffer = Buffer.from(firstDecode, 'base64');
console.log('✓ Second decode length:', encryptedBuffer.length, 'bytes\n');

// Now test various key derivations
const methods = [
    {
        name: '1. Direct UTF-8',
        getKey: () => Buffer.from(SECRET_KEY, 'utf8'),
        getIV: () => Buffer.from(IV_KEY, 'utf8')
    },
    {
        name: '2. MD5 hash',
        getKey: () => crypto.createHash('md5').update(SECRET_KEY).digest(),
        getIV: () => crypto.createHash('md5').update(IV_KEY).digest()
    },
    {
        name: '3. SHA256 (16 bytes)',
        getKey: () => crypto.createHash('sha256').update(SECRET_KEY).digest().slice(0, 16),
        getIV: () => crypto.createHash('sha256').update(IV_KEY).digest().slice(0, 16)
    },
    {
        name: '4. SHA1 (16 bytes)',
        getKey: () => crypto.createHash('sha1').update(SECRET_KEY).digest().slice(0, 16),
        getIV: () => crypto.createHash('sha1').update(IV_KEY).digest().slice(0, 16)
    },
    {
        name: '5. Hex encoded then decoded',
        getKey: () => Buffer.from(SECRET_KEY, 'hex').slice(0, 16),
        getIV: () => Buffer.from(IV_KEY, 'hex').slice(0, 16)
    },
    {
        name: '6. PBKDF2 (1 iteration, no salt)',
        getKey: () => crypto.pbkdf2Sync(SECRET_KEY, '', 1, 16, 'sha256'),
        getIV: () => crypto.pbkdf2Sync(IV_KEY, '', 1, 16, 'sha256')
    },
    {
        name: '7. PBKDF2 (1000 iterations, no salt)',
        getKey: () => crypto.pbkdf2Sync(SECRET_KEY, '', 1000, 16, 'sha256'),
        getIV: () => crypto.pbkdf2Sync(IV_KEY, '', 1000, 16, 'sha256')
    },
    {
        name: '8. Repeated to 16 bytes',
        getKey: () => {
            let k = SECRET_KEY;
            while (k.length < 16) k += SECRET_KEY;
            return Buffer.from(k.substring(0, 16), 'utf8');
        },
        getIV: () => {
            let i = IV_KEY;
            while (i.length < 16) i += IV_KEY;
            return Buffer.from(i.substring(0, 16), 'utf8');
        }
    }
];

for (const method of methods) {
    console.log(`\n${method.name}`);
    console.log('─'.repeat(70));
    
    try {
        const key = method.getKey();
        const iv = method.getIV();
        
        console.log('Key:', key.toString('hex'));
        console.log('IV:', iv.toString('hex'));
        
        const decipher = crypto.createDecipheriv('aes-128-ctr', key, iv);
        let decrypted = decipher.update(encryptedBuffer);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        
        const decryptedText = decrypted.toString('utf8');
        
        // Check for JSON patterns
        if (decryptedText.includes('{') && decryptedText.includes('"nippos"')) {
            console.log('✅✅✅ FOUND JSON WITH "nippos"!');
            console.log('Decrypted:', decryptedText);
            
            try {
                const userData = JSON.parse(decryptedText);
                console.log('\n🎉🎉🎉 SUCCESS! USER DATA:');
                console.log(JSON.stringify(userData, null, 2));
                process.exit(0);
            } catch (e) {
                console.log('Has nippos but JSON invalid:', e.message);
            }
        } else if (decryptedText.includes('{') && decryptedText.includes('}')) {
            console.log('⚠️  Contains JSON brackets');
            console.log('Preview:', decryptedText.substring(0, 100).replace(/[^\x20-\x7E]/g, '.'));
        } else {
            const printable = decryptedText.substring(0, 50).replace(/[^\x20-\x7E]/g, '.');
            console.log('Result:', printable + '...');
        }
        
    } catch (error) {
        console.log('Error:', error.message);
    }
}

console.log('\n\n' + '='.repeat(70));
console.log('❌ Tidak menemukan kombinasi yang tepat');
console.log('='.repeat(70));
console.log('\n💡 Kemungkinan:');
console.log('1. Ada salt khusus yang digunakan untuk key derivation');
console.log('2. Ada iterasi khusus untuk PBKDF2');
console.log('3. Backend menggunakan library enkripsi custom');
console.log('4. Ada pre-processing data sebelum enkripsi');
console.log('\n🔴 SOLUSI: Minta kode enkripsi backend untuk tahu persis bagaimana');
console.log('   key dan IV di-generate dari string SECRET_KEY dan IV_KEY');

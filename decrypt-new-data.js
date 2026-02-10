// Test decrypt data baru
const crypto = require('crypto');

const newEncryptedData = 'SlErazR1QUQ0eEgwQzRMU0dncjc4Q1NQWDRuS0x2TVlqQmpDWnNQamErT3FTZUpUeE1CME5Hc2ZUaVVQamt4a25abjlhR3N0bVpyc0w5NGc4ZUR1U1NwWUExdDNWS29VYlhSbFRScDJsU0VBVTE4ZjBSZ1kwa2hpQmVqNVJxQW9Hci9jMUp6eGdrcWZMMlp2anlTc1hOeXlLRVpXdlM3THBrSElDK0gwOGJRYS9FZlhBcFp5bC85bEN0RTIwK3pTK211TlZFWWU0ODRFTmRVM0xDM3VqTEdhSGhyVTFUOC9BVzI2V0hMSDhmOW1obFI4YXVtMlJKdmxBclVCcDFUTUJ2akhZWFBHbUpMT1pKL0dTbG1PV1crc3k0Qit0MkRJOEQzWFphcWo0SDQ1RXdDSW1NKzVnSFRqVFA4VVprdHh4ODB4aEYySmt3dmY1SkV1akNrUm1ZK0lKNHBpdUlJNWV6RUdGVmQvUWVvcTVMZz0=';

const SECRET_KEY = 'KEYSMMFR23012026';
const IV_KEY = 'XIVMMFRI23012026';

console.log('=== DECRYPTING NEW DATA ===\n');
console.log('Encrypted data length:', newEncryptedData.length, 'chars\n');

// STEP 1: First Base64 Decode
console.log('STEP 1: First base64 decode...');
const firstDecode = Buffer.from(newEncryptedData, 'base64').toString('utf8');
console.log('✓ First decode length:', firstDecode.length, 'chars');
console.log('First 100 chars:', firstDecode.substring(0, 100));
console.log('');

// STEP 2: Second Base64 Decode
console.log('STEP 2: Second base64 decode...');
const secondDecode = Buffer.from(firstDecode, 'base64');
console.log('✓ Second decode length:', secondDecode.length, 'bytes');
console.log('First 32 bytes (hex):', secondDecode.slice(0, 32).toString('hex'));
console.log('');

// STEP 3: Try various key derivation methods
console.log('STEP 3: Testing different key derivation methods...\n');

const methods = [
    {
        name: 'Method 1: Direct UTF-8',
        key: Buffer.from(SECRET_KEY, 'utf8'),
        iv: Buffer.from(IV_KEY, 'utf8')
    },
    {
        name: 'Method 2: MD5 hash',
        key: crypto.createHash('md5').update(SECRET_KEY).digest(),
        iv: crypto.createHash('md5').update(IV_KEY).digest()
    },
    {
        name: 'Method 3: SHA256 (16 bytes)',
        key: crypto.createHash('sha256').update(SECRET_KEY).digest().slice(0, 16),
        iv: crypto.createHash('sha256').update(IV_KEY).digest().slice(0, 16)
    },
    {
        name: 'Method 4: SHA1 (16 bytes)',
        key: crypto.createHash('sha1').update(SECRET_KEY).digest().slice(0, 16),
        iv: crypto.createHash('sha1').update(IV_KEY).digest().slice(0, 16)
    },
    {
        name: 'Method 5: PBKDF2 (1 iteration)',
        key: crypto.pbkdf2Sync(SECRET_KEY, '', 1, 16, 'sha256'),
        iv: crypto.pbkdf2Sync(IV_KEY, '', 1, 16, 'sha256')
    },
    {
        name: 'Method 6: PBKDF2 (1000 iterations)',
        key: crypto.pbkdf2Sync(SECRET_KEY, '', 1000, 16, 'sha256'),
        iv: crypto.pbkdf2Sync(IV_KEY, '', 1000, 16, 'sha256')
    },
    {
        name: 'Method 7: PBKDF2 (10000 iterations)',
        key: crypto.pbkdf2Sync(SECRET_KEY, '', 10000, 16, 'sha256'),
        iv: crypto.pbkdf2Sync(IV_KEY, '', 10000, 16, 'sha256')
    }
];

for (let i = 0; i < methods.length; i++) {
    const method = methods[i];
    
    console.log(`${method.name}`);
    console.log('─'.repeat(70));
    console.log('Key:', method.key.toString('hex'));
    console.log('IV:', method.iv.toString('hex'));
    
    try {
        const decipher = crypto.createDecipheriv('aes-128-ctr', method.key, method.iv);
        let decrypted = decipher.update(secondDecode);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        
        const decryptedText = decrypted.toString('utf8');
        
        // Check for JSON
        if (decryptedText.includes('{') && decryptedText.includes('"nippos"')) {
            console.log('✅✅✅ FOUND "nippos" in JSON!');
            console.log('Decrypted text:', decryptedText);
            
            try {
                const userData = JSON.parse(decryptedText);
                console.log('\n🎉🎉🎉 SUCCESS! USER DATA:');
                console.log('═'.repeat(70));
                console.log(JSON.stringify(userData, null, 2));
                console.log('═'.repeat(70));
                console.log('\n✅ DEKRIPSI BERHASIL dengan', method.name);
                process.exit(0);
            } catch (e) {
                console.log('Has nippos but JSON parse failed:', e.message);
            }
        } else if (decryptedText.includes('{')) {
            console.log('⚠️  Contains { but no nippos field');
            console.log('Preview:', decryptedText.substring(0, 150).replace(/[^\x20-\x7E]/g, '.'));
        } else {
            const preview = decryptedText.substring(0, 50).replace(/[^\x20-\x7E]/g, '.');
            console.log('Result:', preview + '...');
        }
        
    } catch (error) {
        console.log('❌ Error:', error.message);
    }
    
    console.log('');
}

console.log('\n' + '═'.repeat(70));
console.log('❌ Tidak menemukan metode yang tepat');
console.log('═'.repeat(70));
console.log('\n🔴 Masih membutuhkan kode enkripsi backend untuk mengetahui');
console.log('   key derivation method yang tepat.');

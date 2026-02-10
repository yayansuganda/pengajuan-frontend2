// Investigate PBKDF2 method more deeply
const crypto = require('crypto');

const encryptedDataBase64 = 'SVl4R1VuVkpFZFZGQlhlT2p1ekt3cDF1SEVBanQ1RnNCMVdlbjdMa3VkdE8rTmQyNjRoVVNPUGltU2d0M2pHaHQxUWNxRnlvams2TVRuT0M1WXY5RHJyVWJUUDBlUi8veUVyUUlHTzIzK1AyK2hoYnc3cWNvaDRQYi9jNS83Nk9xNFl6UXBtaWhnUzkwMWxiUGpaVlEybnJOTE8yZUwxaWU1dit1Nm1MQkQzQng2NTUrRlBzZFZZT241OFpmWm1FNEFIdHRGOUFRVXNvaVJ0QU5ib1pKVTBsSmxjdnhjby8xRXFSRU9BTk9DcDJkc2FjK3Voam9zbzlJWEtsUmJyVVFTbzNBN1RZbitycENQN0MrTU9VNERJa2ZwZXlMZz09';

const SECRET_KEY = 'KEYSMMFR23012026';
const IV_KEY = 'XIVMMFRI23012026';

const encryptedBuffer = Buffer.from(encryptedDataBase64, 'base64');

console.log('=== INVESTIGATING PBKDF2 METHOD ===\n');

// Try various PBKDF2 configurations
const configs = [
    { iterations: 1, salt: '', hash: 'sha256' },
    { iterations: 1, salt: 'salt', hash: 'sha256' },
    { iterations: 1000, salt: '', hash: 'sha256' },
    { iterations: 1000, salt: 'salt', hash: 'sha256' },
    { iterations: 10000, salt: '', hash: 'sha256' },
    { iterations: 1, salt: SECRET_KEY, hash: 'sha256' },
    { iterations: 1, salt: IV_KEY, hash: 'sha256' },
    { iterations: 1000, salt: SECRET_KEY, hash: 'sha256' },
    { iterations: 1000, salt: IV_KEY, hash: 'sha256' },
    { iterations: 1, salt: '', hash: 'sha1' },
    { iterations: 1000, salt: '', hash: 'sha1' },
    { iterations: 1, salt: '', hash: 'md5' },
];

for (let i = 0; i < configs.length; i++) {
    const config = configs[i];
    
    console.log(`\n[${i + 1}] PBKDF2: ${config.iterations} iterations, salt="${config.salt}", hash=${config.hash}`);
    console.log('─'.repeat(70));
    
    try {
        const key = crypto.pbkdf2Sync(SECRET_KEY, config.salt, config.iterations, 16, config.hash);
        const iv = crypto.pbkdf2Sync(IV_KEY, config.salt, config.iterations, 16, config.hash);
        
        const decipher = crypto.createDecipheriv('aes-128-ctr', key, iv);
        let decrypted = decipher.update(encryptedBuffer);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        
        const decryptedText = decrypted.toString('utf8');
        
        // Look for JSON patterns
        const hasOpenBrace = decryptedText.includes('{');
        const hasCloseBrace = decryptedText.includes('}');
        const hasQuote = decryptedText.includes('"');
        const hasColon = decryptedText.includes(':');
        
        if (hasOpenBrace && hasCloseBrace) {
            console.log('✅ Contains { and }');
            console.log('Has quotes:', hasQuote);
            console.log('Has colons:', hasColon);
            
            // Try to find JSON in the middle
            const start = decryptedText.indexOf('{');
            const end = decryptedText.lastIndexOf('}') + 1;
            
            if (start >= 0 && end > start) {
                const jsonPart = decryptedText.substring(start, end);
                console.log(`\nExtracted JSON part (${jsonPart.length} chars):`);
                console.log(jsonPart.substring(0, 200));
                
                try {
                    const userData = JSON.parse(jsonPart);
                    console.log('\n🎉🎉🎉 SUCCESS! USER DATA:');
                    console.log(JSON.stringify(userData, null, 2));
                    process.exit(0);
                } catch (e) {
                    console.log('❌ Not valid JSON:', e.message);
                }
            }
            
            // Show hex dump around braces
            const braceIndex = decryptedText.indexOf('{');
            if (braceIndex >= 0) {
                const startByte = Math.max(0, braceIndex - 10);
                const endByte = Math.min(decrypted.length, braceIndex + 50);
                console.log(`\nHex around "{" (bytes ${startByte}-${endByte}):`);
                console.log(decrypted.slice(startByte, endByte).toString('hex'));
                console.log('As text:', decrypted.slice(startByte, endByte).toString('utf8').replace(/[^\x20-\x7E]/g, '.'));
            }
        } else {
            console.log(`❌ No JSON brackets found`);
        }
        
    } catch (error) {
        console.log('❌ Error:', error.message);
    }
}

console.log('\n\n═══════════════════════════════════════════════════════════════════════');
console.log('⚠️  TIDAK BERHASIL MENEMUKAN KONFIGURASI YANG TEPAT');
console.log('═══════════════════════════════════════════════════════════════════════');
console.log('\n🔴 CRITICAL INFORMATION NEEDED:');
console.log('\nUntuk menyelesaikan dekripsi ini, kami membutuhkan KODE ENKRIPSI BACKEND.');
console.log('\nSilakan tanyakan ke backend developer dan share kode enkripsinya.');
console.log('Tanpa informasi ini, tidak mungkin untuk menebak konfigurasi yang tepat.');

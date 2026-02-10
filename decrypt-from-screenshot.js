// Decrypt berdasarkan tutorial dari screenshot
const crypto = require('crypto');

console.log('=== DECRYPT BASED ON SCREENSHOT TUTORIAL ===\n');

// Data dari screenshot
const screenshotData = 'SVl4R1VuVkpFZFZGQlhlT2p1ekt3cDF1SEVBanQ1RnNCMVdlbjdMa3VkdE8rTmQyNjRoVVNPUGltU2d0M2pHaHQxUWNxRnlvams2TVRuT0M1WXY5RHJyVWJUUDBlUi8veUVyUUlHTzIzK1AyK2hoYnc3cWNvaDRQYi9jNS83Nk9xNFl6UXBtaWhnUzkwMWxiUGpaVlEybnJOTE8yZUwxaWU1dit1Nm1MQkQzQng2NTUrRlBzZFZZT241OFpmWm1FNEFIdHRGOUFRVXNvaVJ0QU5ib1pKVTBsSmxjdnhjby8xRXFSRU9BTk9DcDJkc2FjK3Voam9zbzlJWEtsUmJyVVFTbzNBN1RZbitycENQN0MrTU9VNERJa2ZwZXlMZz09';

// Expected result from screenshot
const expectedResult = {
    "nippos": "991406965",
    "name": "CEPI YUDI AFRIZAL",
    "account_no": "0100031467",
    "phone": "628567146164",
    "kcu_code": "40005",
    "kcu_name": "KANTOR PUSAT",
    "kc_code": "40005",
    "kc_name": "KANTOR PUSAT",
    "kcp_code": "",
    "kcp_name": ""
};

const SECRET_KEY = 'KEYSMMFR23012026';
const IV_KEY = 'XIVMMFRI23012026';

console.log('Expected Result:');
console.log(JSON.stringify(expectedResult, null, 2));
console.log('\n' + '='.repeat(70) + '\n');

// STEP 1: Base64 Decode
console.log('STEP 1: Base64 Decode...');
const base64Decoded = Buffer.from(screenshotData, 'base64');
console.log('✓ Decoded length:', base64Decoded.length, 'bytes');
console.log('First 50 bytes (hex):', base64Decoded.slice(0, 50).toString('hex'));
console.log('');

// From screenshot, after base64 decode, the result is:
// iYxGUnVJEdVFBXeOjuzKwp1uHEAjt5FsB1Wen7LkudtO+Nd264hUSOPimSgt3jGht1QcqFyojk6MTnOC5Yv9D...
// This looks like it's ANOTHER base64 string!

const base64DecodedString = base64Decoded.toString('utf8');
console.log('Base64 decoded as UTF-8 string (first 100 chars):');
console.log(base64DecodedString.substring(0, 100));
console.log('');

// Check if it's another base64
if (/^[A-Za-z0-9+/=]+$/.test(base64DecodedString)) {
    console.log('✅ This looks like ANOTHER base64 string!');
    console.log('');
    
    // STEP 2: Decode the second base64
    console.log('STEP 2: Decoding second base64 layer...');
    const secondDecode = Buffer.from(base64DecodedString, 'base64');
    console.log('✓ Second decode length:', secondDecode.length, 'bytes');
    console.log('First 50 bytes (hex):', secondDecode.slice(0, 50).toString('hex'));
    console.log('');
    
    // STEP 3: Now decrypt with AES-128-CTR
    console.log('STEP 3: Decrypt with AES-128-CTR...');
    const key = Buffer.from(SECRET_KEY, 'utf8');
    const iv = Buffer.from(IV_KEY, 'utf8');
    
    try {
        const decipher = crypto.createDecipheriv('aes-128-ctr', key, iv);
        let decrypted = decipher.update(secondDecode);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        
        const decryptedText = decrypted.toString('utf8');
        console.log('✓ Decryption complete');
        console.log('');
        console.log('Decrypted text:');
        console.log(decryptedText);
        console.log('');
        
        try {
            const userData = JSON.parse(decryptedText);
            console.log('═'.repeat(70));
            console.log('🎉🎉🎉 SUCCESS! USER DATA:');
            console.log('═'.repeat(70));
            console.log(JSON.stringify(userData, null, 2));
            console.log('═'.repeat(70));
            console.log('');
            
            // Compare with expected
            console.log('Comparing with expected result:');
            console.log('✓ NIPPOS:', userData.nippos === expectedResult.nippos ? '✅ Match' : '❌ Different');
            console.log('✓ Name:', userData.name === expectedResult.name ? '✅ Match' : '❌ Different');
            console.log('✓ Account:', userData.account_no === expectedResult.account_no ? '✅ Match' : '❌ Different');
            
        } catch (e) {
            console.log('❌ Not valid JSON:', e.message);
        }
    } catch (e) {
        console.log('❌ Decryption failed:', e.message);
    }
}

console.log('\n' + '='.repeat(70));
console.log('ANALYSIS COMPLETE');
console.log('='.repeat(70));

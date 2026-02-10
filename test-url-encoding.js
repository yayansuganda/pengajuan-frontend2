// Test URL encoding issue
console.log('=== URL ENCODING TEST ===\n');

const originalData = 'SlErazR1QUQ0eEgwQzRMU0dncjc4Q1NQWDRuS0x2TVlqQmpDWnNQamErT3FTZUpUeE1CME5Hc2ZUaVVQamt4a25abjlhR3N0bVpyc0w5NGc4ZUR1U1NwWUExdDNWS29VYlhSbFRScDJsU0VBVTE4ZjBSZ1kwa2hpQmVqNVJxQW9Hci9jMUp6eGdrcWZMMlp2anlTc1hOeXlLRVpXdlM3THBrSElDK0gwOGJRYS9FZlhBcFp5bC85bEN0RTIwK3pTK211TlZFWWU0ODRFTmRVM0xDM3VqTEdhSGhyVTFUOC9BVzI2V0hMSDhmOW1obFI4YXVtMlJKdmxBclVCcDFUTUJ2akhZWFBHbUpMT1pKL0dTbG1PV1crc3k0Qit0MkRJOEQzWFphcWo0SDQ1RXdDSW1NKzVnSFRqVFA4VVprdHh4ODB4aEYySmt3dmY1SkV1akNrUm1ZK0lKNHBpdUlJNWV6RUdGVmQvUWVvcTVMZz0=';

// Simulate URL encoding/decoding
const encoded = encodeURIComponent(originalData);
const decoded = decodeURIComponent(encoded);

console.log('Original data length:', originalData.length);
console.log('Encoded data length:', encoded.length);
console.log('Decoded data length:', decoded.length);
console.log('');

console.log('Has + character:', originalData.includes('+'));
console.log('Count of + chars:', (originalData.match(/\+/g) || []).length);
console.log('');

// Show what happens when + becomes space
const withSpaces = originalData.replace(/\+/g, ' ');
console.log('If + becomes space, length:', withSpaces.length);
console.log('');

// Try to decode both
console.log('Trying to decode original (with +):');
try {
    const result = Buffer.from(originalData, 'base64');
    console.log('✅ Success! Length:', result.length);
} catch (e) {
    console.log('❌ Failed:', e.message);
}

console.log('');
console.log('Trying to decode with spaces (after URL decoding):');
try {
    const result = Buffer.from(withSpaces, 'base64');
    console.log('✅ Success! Length:', result.length);
} catch (e) {
    console.log('❌ Failed:', e.message);
}

console.log('');
console.log('Trying to decode after fixing (replace space → +):');
try {
    const fixed = withSpaces.replace(/ /g, '+');
    const result = Buffer.from(fixed, 'base64');
    console.log('✅ Success! Length:', result.length);
} catch (e) {
    console.log('❌ Failed:', e.message);
}

console.log('\n' + '='.repeat(70));
console.log('CONCLUSION:');
console.log('='.repeat(70));
console.log('URL encoding changes + to space.');
console.log('Must replace spaces back to + before atob()!');
console.log('');
console.log('FIX: data = data.replace(/ /g, "+")');

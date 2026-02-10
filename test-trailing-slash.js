// Test trailing slash issue
console.log('=== TRAILING SLASH URL TEST ===\n');

const urls = [
    'http://localhost:3000/fronting?data=test123',
    'http://localhost:3000/fronting/?data=test123',
];

urls.forEach(url => {
    console.log(`URL: ${url}`);
    
    const urlObj = new URL(url);
    const data = urlObj.searchParams.get('data');
    
    console.log(`  pathname: ${urlObj.pathname}`);
    console.log(`  search: ${urlObj.search}`);
    console.log(`  data parameter: ${data}`);
    console.log(`  has trailing slash: ${urlObj.pathname.endsWith('/')}`);
    console.log('');
});

console.log('✅ Both URLs should extract parameter correctly');
console.log('But Next.js might redirect /fronting/ to /fronting');
console.log('');
console.log('SOLUTION: Remove trailing slash from URL, or handle both cases');

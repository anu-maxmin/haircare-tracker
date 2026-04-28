// src/scripts/generate-vapid-keys.js
// Run: node src/scripts/generate-vapid-keys.js
// Copy the output into your Vercel environment variables

const webpush = require('web-push');
const keys = webpush.generateVAPIDKeys();

console.log('\n=== VAPID KEYS ===');
console.log('Add these to your Vercel Environment Variables:\n');
console.log('NEXT_PUBLIC_VAPID_PUBLIC_KEY =', keys.publicKey);
console.log('VAPID_PRIVATE_KEY =', keys.privateKey);
console.log('VAPID_EMAIL = your@email.com');
console.log('\n==================\n');

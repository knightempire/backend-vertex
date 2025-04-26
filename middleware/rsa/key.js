
 
const nacl = require('tweetnacl');
const fs = require('fs');
 
// Generate Ed25519 key pair
function generateEd25519KeyPair() {
    const keyPair = nacl.sign.keyPair();  // Generates Ed25519 key pair
    return { publicKey: keyPair.publicKey, privateKey: keyPair.secretKey };
}
 
const { publicKey, privateKey } = generateEd25519KeyPair();
 
 
fs.writeFileSync('private_key.pem', privateKey, 'binary');
console.log('Private Ed25519 key saved to private_key.pem');
 
 
fs.writeFileSync('public_key.pem', publicKey, 'binary');
console.log('Public Ed25519 key saved to public_key.pem');
 
 
const CryptoJS = require('crypto-js');
const crypto = require('crypto');

function createKeyOrIV(userId) {
  // SHA256 hash of the user ID
  const hash = crypto.createHash('sha256').update(userId, 'utf8').digest();

  // Convert the hash to a 32-byte string
  const keyOrIV = CryptoJS.enc.Hex.parse(hash.toString('hex'));

  return keyOrIV;
}

function encrypt(password, userId) {
  const secretKey = createKeyOrIV(userId);
  const iv = createKeyOrIV(userId);

  const cipherOption = { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 };
  const cipherText = CryptoJS.AES.encrypt(password, secretKey, cipherOption).toString();

  return cipherText;
}

function decrypt(ciphertext, userId) {
  const secretKey = createKeyOrIV(userId);
  const iv = createKeyOrIV(userId);
  
  const cipherOption = { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 };
  const bytes = CryptoJS.AES.decrypt(ciphertext, secretKey, cipherOption);
  const originalText = bytes.toString(CryptoJS.enc.Utf8);

  return originalText;
}

function checkPassword(inputPassword, storedPassword, userId) {
  const decryptedStoredPassword = decrypt(storedPassword, userId);

  if (inputPassword === decryptedStoredPassword) {
    return true;
  } else {
    return false;
  }
}

module.exports = { encrypt, decrypt, checkPassword };

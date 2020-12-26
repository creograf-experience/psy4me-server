const mongoose = require('mongoose');
const crypto = require('crypto');

const adminSchema = new mongoose.Schema({
  username: String,
  passwordHash: String,
  salt: String,
}, { timestamps: true });

adminSchema
  .virtual('password')
  .set(function setPassword(password) {
    this._plainPassword = password;
    if (password) {
      this.salt = crypto.randomBytes(128).toString('base64');
      this.passwordHash = crypto.pbkdf2Sync(password, this.salt, 1, 128, 'sha1');
    } else {
      this.salt = undefined;
      this.passwordHash = undefined;
    }
  })
  .get(function getPassword() {
    return this._plainPassword;
  });

adminSchema.methods.checkPassword = function checkPassword(password) {
  return !password || !this.passwordHash
    ? false
    : crypto.pbkdf2Sync(password, this.salt, 1, 128, 'sha1').toString() === this.passwordHash;
};

module.exports = mongoose.model('Admin', adminSchema);

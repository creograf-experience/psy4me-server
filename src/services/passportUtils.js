const jwt = require('jsonwebtoken'); // аутентификация по JWT для http
const { passport } = require('../constants');

module.exports = {
  buildToken: id => `Bearer ${jwt.sign(
    {
      id
    },
    passport.JWT_SECRET
  )}`
};

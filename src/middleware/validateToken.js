const passport = require('./passport');
const { response } = require('../constants');

module.exports = (req, res, next) => {
  passport.authenticate('jwt', (err, user) => {
    if (err) {
      res.send('Check token error');
      return;
    }
    if (user) {
      res.userId = user._id;
      next();
    } else {
      res.send(response.TOKEN_INVALID());
    }
  })(req, res);
};

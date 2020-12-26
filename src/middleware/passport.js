const Passport = require('passport'); // passport
const { ExtractJwt, Strategy } = require('passport-jwt'); // авторизация через JWT

const { passport } = require('../constants');

const models = require('../model');

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: passport.JWT_SECRET,
  passReqToCallback: true
};

/**
 * Подключает стратегию авторизации по JWT.
 * req.model - строкое название модели, которое устанавливается в src/api/index.js
 * Соответственно, по нему ищем пользователя в БД в нужной таблице
 */

Passport.use(
  new Strategy(jwtOptions, (req, payload, done) => {
    models[req.model].findOne({ _id: payload.id }, done);
  })
);

module.exports = Passport;

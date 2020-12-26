const express = require('express');

const publicRoutes = require('./public');
const privateRoutes = require('./private');

const { validateToken } = require('../middleware');

const router = express.Router();

// Запросы, на которые не нужна авторизация по токену
router.use('/public', publicRoutes);
router.use(
  '/private/:model',
  (req, res, next) => {
    /**
     * Здесь определяем, какую модель нужно использовать, чтобы найти пользователя по расшифрованному JWT.
     * Параметр model в url должен быть такой же, как и имя модели, только с маленькой буквы
     * пример запроса api/private/user/auth/login
     * */
    const { model } = req.params;
    req.model = model.charAt(0).toUpperCase() + model.slice(1);
    next();
  },
  validateToken
);
// Запросы, на которые нужна авторизация по токену
router.use('/private', privateRoutes);

module.exports = router;

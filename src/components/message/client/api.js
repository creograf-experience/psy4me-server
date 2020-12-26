const router = require('express').Router();
const controller = require('./controller');

router.get('/:chatId', controller.get);
module.exports = router;
const router = require('express').Router();
const controller = require('./controller');

router.get('/', controller.getAll);
module.exports = router;
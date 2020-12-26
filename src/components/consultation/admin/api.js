const router = require('express').Router();
const controller = require('./controller');

router.post('/filter', controller.getConsults);
router.post('/:user', controller.getUserConsults);
router.post('/', controller.create);
router.put('/', controller.reschedule);

module.exports = router;

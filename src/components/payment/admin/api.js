const router = require('express').Router();
const controller = require('./controller');

router.post('/filter', controller.getPayments);
router.post('/', controller.addPayment);


module.exports = router;
const router = require('express').Router();
const controller = require('./controller');

router.post('/', controller.pay);
router.post('/subscribe', controller.subscribe);
router.post('/unsubscribe', controller.unsubscribe);
router.get('/', controller.getPaymentInfo);

module.exports = router;
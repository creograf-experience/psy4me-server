const router = require('express').Router();
const controller = require('./controller');

router.get('/', controller.getAll);
router.put('/', controller.reschedule);
router.put('/complete', controller.complete);
router.put('/accept-reschedule', controller.acceptReschedule);
router.put('/rate', controller.rate);

module.exports = router;

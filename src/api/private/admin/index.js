const express = require('express');

const manage = require('./manage');
const consultation = require('../../../components/consultation/admin/api');
const payment = require('../../../components/payment/admin/api');

const router = express.Router();

router.use('/manage', manage);
router.use('/consultations', consultation);
router.use('/payments', payment);

module.exports = router;

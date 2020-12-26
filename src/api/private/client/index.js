const express = require('express');

const auth = require('./auth');
const personal = require('./personal');
const consultation = require('../../../components/consultation/client/api');
const chat = require('../../../components/chat/client/api');
const message = require('../../../components/message/client/api');
const payment = require('../../../components/payment/client/api');

const router = express.Router();

router.use('/auth', auth);
router.use('/personal', personal);
router.use('/consultations', consultation);
router.use('/chats', chat);
router.use('/message', message);
router.use('/payments', payment);

module.exports = router;

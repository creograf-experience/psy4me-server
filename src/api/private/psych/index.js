const express = require('express');

const auth = require('./auth');
const personal = require('./personal');
const consultation = require('../../../components/consultation/psych/api');
const chat = require('../../../components/chat/psych/api');
const message = require('../../../components/message/psych/api');

const router = express.Router();

router.use('/auth', auth);
router.use('/personal', personal);
router.use('/consultations', consultation);
router.use('/chats', chat);
router.use('/message', message);

module.exports = router;

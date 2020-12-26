const express = require('express');

const psychRoutes = require('./psych');
const clientRoutes = require('./client');
const adminRoutes = require('./admin');

const router = express.Router();

router.use('/psych', psychRoutes);
router.use('/client', clientRoutes);
router.use('/admin', adminRoutes);

module.exports = router;

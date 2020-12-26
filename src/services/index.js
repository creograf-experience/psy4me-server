const passportUtils = require('./passportUtils');
const phones = require('./phones');
const emails = require('./emails');
const smsService = require('./smsService');
const upload = require('./upload');
const socketManager = require('./socketManger');
const utils = require('./utils');

exports.passportUtils = passportUtils;
exports.phones = phones;
exports.emails = emails;
exports.smsService = smsService;
exports.upload = upload;
exports.socketManager = socketManager;
exports.utils = utils;
const express = require('express');
const { response } = require('../../../constants');
const { passportUtils } = require('../../../services');
const { Admin } = require('../../../model');

const router = express.Router();

router
  .post('/login', async (req, res) => {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username });
    if (!admin || !admin.checkPassword(password)) {
      res.body = response.DATA_ERROR();
    } else {
      res.body = response.OK();
      res.body.token = passportUtils.buildToken(admin._id);
    }
    res.send(res.body);
  })
  .post('/reg', async (req, res) => {
    const { username, password } = req.body;
    if (await Admin.findOne({ username })) {
      res.body = response.CONFLICT();
    } else {
      const newAdmin = await Admin.create({ username, password });
      res.body = response.OK();
      res.body.token = passportUtils.buildToken(newAdmin._id);
    }
    res.send(res.body);
  });

module.exports = router;

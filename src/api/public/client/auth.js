const express = require('express');
const { response } = require('../../../constants');
const { passportUtils, phones, smsService } = require('../../../services');
const { Client } = require('../../../model');

const router = express.Router();
router
/**
 * Авторизация по номеру телефона и паролю
 */
  .post('/login', async (req, res) => {
    const { phone, password } = req.body;
    const rawPhone = phones.getRawPhone(phone);
    const client = await Client.findOne({ phone: rawPhone });
    if (!client || !client.checkPassword(password) || !client.firstName) {
      res.body = response.DATA_ERROR();
    } else {
      res.body = response.OK();
      res.body.token = passportUtils.buildToken(client._id);
      res.body.quizDone = !!client.troubles.length;
    }
    res.send(res.body);
  })
  /**
   * Регистрация по номеру телефона и паролю
   */
  .post('/reg', async (req, res) => {
    const { phone, password } = req.body;
    const rawPhone = phones.getRawPhone(phone);
    const conflictUser = await Client.findOne({ phone: rawPhone });
    if (conflictUser) {
      if (conflictUser.firstName) {
        res.body = response.CONFLICT();
      } else {
        await Client.updateOne({ phone: rawPhone }, {
          $set: {
            phone: rawPhone,
            phoneMask: phone,
            password,
          },
        });
        res.body = response.OK();
        res.body.token = passportUtils.buildToken(conflictUser._id);
      }
    } else {
      const newClient = await Client.create({ phone: rawPhone, phoneMask: phone, password });
      res.body = response.OK();
      res.body.token = passportUtils.buildToken(newClient._id);
    }
    res.send(res.body);
  })
  /**
   * Получение кода на номер телефона для восстановления пароля
   */
  .post('/code', async (req, res) => {
    const { phone } = req.body;
    const rawPhone = phones.getRawPhone(phone);
    const client = await Client.findOne({ phone: rawPhone });

    if (!client || !client.troubles.length) {
      res.body = response.DATA_ERROR();
    } else {
      client.setLastSmsCode(smsService.getRandomSmsCode());
      smsService.sendSmsCode({ phone: rawPhone, code: client.lastSmsCode });
      await client.save();
      res.body = response.OK();
    }
    res.send(res.body);
  })
  /**
   * Проверка полученного по смс кода
   */
  .put('/code', async (req, res) => {
    const { phone, code } = req.body;
    const rawPhone = phones.getRawPhone(phone);
    const client = await Client.findOne({ phone: rawPhone });

    if (!client) {
      // Если психолог с номером телефона не найден
      res.body = response.NOT_FOUND();
    } else if (client.lastSmsCode !== code) {
      // Если пароль из смс неверен
      res.body = response.DATA_ERROR();
    } else {
      client.setLastSmsCode('');
      await client.save();
      res.body = response.OK();
      res.body.token = passportUtils.buildToken(client._id);
    }
    res.send(res.body);
  });

module.exports = router;

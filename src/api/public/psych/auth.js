const express = require('express');
const { response } = require('../../../constants');
const { passportUtils, phones, smsService } = require('../../../services');
const { Psych } = require('../../../model');

const router = express.Router();
router
  /**
   * Авторизация по номеру телефона и паролю
   */
  .post('/login', async (req, res) => {
    const { phone, password } = req.body;
    const rawPhone = phones.getRawPhone(phone);
    const psych = await Psych.findOne({ phone: rawPhone });
    if (!psych || !psych.checkPassword(password) || !psych.firstName) {
      res.body = response.DATA_ERROR();
    } else {
      res.body = response.OK();
      res.body.token = passportUtils.buildToken(psych._id);
      res.body.quizDone = !!psych.consultingObject;
    }
    res.send(res.body);
  })
  /**
   * Регистрация по номеру телефона и паролю
   */
  .post('/reg', async (req, res) => {
    const { phone, password } = req.body;
    const rawPhone = phones.getRawPhone(phone);
    const conflictUser = await Psych.findOne({ phone: rawPhone });
    if (conflictUser) {
      if (conflictUser.firstName) {
        res.body = response.CONFLICT();
      } else {
        await Psych.updateOne({ phone: rawPhone }, {
          $set: {
            phone: rawPhone,
            phoneMask: phone,
            password
          },
        });
        res.body = response.OK();
        res.body.token = passportUtils.buildToken(conflictUser._id);
      }
    } else {
      const newPsych = await Psych.create({ phone: rawPhone, phoneMask: phone, password });
      res.body = response.OK();
      res.body.token = passportUtils.buildToken(newPsych._id);
    }
    res.send(res.body);
  })
  /**
   * Получение кода на номер телефона для восстановления пароля
   */
  .post('/code', async (req, res) => {
    const { phone } = req.body;
    const rawPhone = phones.getRawPhone(phone);
    const psych = await Psych.findOne({ phone: rawPhone });

    if (!psych || !psych.consultingObject) {
      res.body = response.DATA_ERROR();
    } else {
      psych.setLastSmsCode(smsService.getRandomSmsCode());
      smsService.sendSmsCode({ phone: rawPhone, code: psych.lastSmsCode });
      await psych.save();
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
    const psych = await Psych.findOne({ phone: rawPhone });

    if (!psych) {
      // Если психолог с номером телефона не найден
      res.body = response.DATA_ERROR();
    } else if (psych.lastSmsCode !== code) {
      // Если пароль из смс неверен
      res.body = response.DATA_ERROR();
    } else {
      psych.setLastSmsCode('');
      await psych.save();
      res.body = response.OK();
      res.body.token = passportUtils.buildToken(psych._id);
    }
    res.send(res.body);
  });

module.exports = router;

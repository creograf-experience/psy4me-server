const express = require('express');
const moment = require('moment');
const { response } = require('../../../constants');
const { Psych } = require('../../../model');
const { Client } = require('../../../model');

const router = express.Router();

router
  .get('/checktoken', (req, res) => {
    res.body = response.OK();
    res.send(res.body);
  })

  .get('/profile', async (req, res) => {
    const psych = await Psych.findById(res.userId);
    if (!psych) {
      res.body = response.DATA_ERROR();
    } else {
      const {
        firstName,
        lastName,
        middleName,
        gender,
        birthDay,
        phoneMask,
        email,
        country,
        city,
        timezone,
        language,
        personalTherapyHours,
        activityStartDate,
        aboutMe,
        bankName,
        accountNumber,
        bankID,
        TIN,
        troubles,
        consultingObject,
        depression,
        social,
        educations,
        infoObject,
        freeHelp,
        schedule
      } = psych;

      res.body = response.OK();
      const formatBirthDay = moment(psych.birthDay).format('DD.MM.YYYY');
      const formatactivityStartDate = moment(psych.activityStartDate).format('DD.MM.YYYY');

      res.body.profile = {
        firstName,
        lastName,
        middleName,
        gender,
        birthDay: formatBirthDay,
        phoneMask,
        email,
        country,
        city,
        timezone,
        language,
        personalTherapyHours,
        activityStartDate: formatactivityStartDate,
        aboutMe,
        bankName,
        accountNumber,
        bankID,
        TIN,
        troubles,
        consultingObject,
        social,
        depression: depression ? 'Да' : 'Нет',
        educations,
        infoObject,
        freeHelp: freeHelp ? 'Да' : 'Нет',
        schedule
      };
    }

    res.send(res.body);
  })

  .get('/fetchfirstquiz', async (req, res) => {
    const psych = await Psych.findById(res.userId);

    if (!psych) {
      res.body = response.DATA_ERROR();
    } else {
      res.body = response.OK();

      if (psych.firstName) {
        const {
          firstName,
          lastName,
          middleName,
          gender,
          birthDay,
          email,
          country,
          city,
          timezone,
          language,
          personalTherapyHours,
          activityStartDate,
          aboutMe,
          bankName,
          accountNumber,
          bankID,
          TIN
        } = psych;

        res.body.quiz = {
          firstName,
          lastName,
          middleName,
          gender,
          birthDay,
          email,
          country,
          city,
          timezone,
          language,
          personalTherapyHours,
          activityStartDate,
          aboutMe,
          bankName,
          accountNumber,
          bankID,
          TIN
        };
      }
    }

    res.send(res.body);
  })

  .get('/fetchsecondquiz', async (req, res) => {
    const psych = await Psych.findById(res.userId);

    if (!psych) {
      res.body = response.DATA_ERROR();
    } else {
      res.body = response.OK();

      if (psych.troubles.length) {
        const {
          troubles, consultingObject, depression, social, educations, infoObject, freeHelp, schedule
        } = psych;

        res.body.quiz = {
          troubles,
          consultingObject,
          depression,
          social,
          educations,
          infoObject,
          freeHelp,
          schedule
        };
      }
    }

    res.send(res.body);
  })

  .get('/id', async (req, res) => {
    res.body = response.OK();
    res.body._id = res.userId;
    res.send(res.body);
  })

// .patch('/updateprofile', async (req, res) => {
//   const psych = await Psych.findById(res.userId);
//
//   if (!psych) {
//     res.body = response.DATA_ERROR();
//   } else {
//     const {
//       firstName,
//       lastName,
//       middleName,
//       phoneMask,
//       email,
//     } = req.body;
//
//     const { _id } = psych;
//
//     await Psych.updateOne({ _id }, {
//       $set: {
//         firstName,
//         lastName,
//         middleName,
//         phoneMask,
//         phone: phones.getRawPhone(phoneMask),
//         email,
//       },
//     });
//
//     res.body = response.OK();
//   }
//
//   res.send(res.body);
// });

  .get('/clientlist', async (req, res) => {
    const clientList = await Client.find({});
    const filteredList = clientList
      .filter(client => !!client.firstName && res.userId == client.psychSelection)
      .map((client) => {
        const {
          _id,
          firstName,
          middleName,
          lastName,
          phoneMask,
          gender,
          email,
          country,
          city,
          language,
          avatar,
          banned,
          psychSelection,
          consultations,
          birthDay,
          troubles,
          consultingObject,
          psychoHelp,
          depression,
          schedule,
          timezone
        } = client;

        return {
          _id,
          lastName,
          firstName,
          middleName,
          gender,
          email,
          phoneMask,
          country,
          city,
          language,
          avatar,
          banned,
          psychSelection,
          consultations,
          birthDay,
          troubles,
          consultingObject,
          psychoHelp,
          depression,
          schedule,
          timezone
        };
      });
    res.body = response.OK();
    res.body.clientList = filteredList;
    res.send(res.body);
  });

module.exports = router;

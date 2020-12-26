
const moment = require('moment');
const express = require('express');
const { response } = require('../../../constants');
const { Client } = require('../../../model');
const { Psych } = require('../../../model');
const { Refusal } = require("../../../model");
const { getMatchedPsyches } = require('./service');

const router = express.Router();

router
  .get('/checktoken', (req, res) => {
    res.body = response.OK();
    res.send(res.body);
  })

  .get('/profile', async (req, res) => {
    const client = await Client.findById(res.userId);
    if (!client) {
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
        aboutMe,
        troubles,
        consultingObject,
        psychoHelp,
        infoObject,
        social,
        depression,
        medicine,
        workingStyle,
        priceObject,
        psychSelection,
        schedule
      } = client;

      res.body = response.OK();
      const formatBirthDay = moment(client.birthDay).format('DD.MM.YYYY');

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
        aboutMe,
        troubles,
        consultingObject,
        psychoHelp,
        infoObject,
        social,
        depression: depression ? 'Да' : 'Нет',
        medicine: medicine ? 'Да' : 'нет',
        workingStyle,
        priceObject,
        psychSelection,
        schedule
      };
    }

    res.send(res.body);
  })

  .get('/fetchfirstquiz', async (req, res) => {
    const client = await Client.findById(res.userId);

    if (!client) {
      res.body = response.DATA_ERROR();
    } else {
      res.body = response.OK();

      if (client.firstName) {
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
          aboutMe
        } = client;

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
          aboutMe
        };
      }
    }

    res.send(res.body);
  })

  .get('/fetchsecondquiz', async (req, res) => {
    const client = await Client.findById(res.userId);

    if (!client) {
      res.body = response.DATA_ERROR();
    } else {
      res.body = response.OK();

      if (client.troubles.length) {
        const {
          troubles,
          consultingObject,
          psychoHelp,
          depression,
          medicine,
          workingStyle,
          priceObject,
          infoObject,
          psychSelection,
          schedule,
          social
        } = client;

        res.body.quiz = {
          troubles,
          consultingObject,
          psychoHelp,
          depression,
          medicine,
          workingStyle,
          priceObject,
          infoObject,
          psychSelection,
          schedule,
          social
        };
      }
    }

    res.send(res.body);
  })
  // .get('/profile', async (req, res) => {
  //   const client = await Client.findById(res.userId);
  //   res.body = response.OK();
  //   res.body.profile = client;
  //   res.send(res.body);
  // })

  .get('/id', async (req, res) => {
    res.body = response.OK();
    res.body._id = res.userId;
    res.send(res.body);
  })

  // Получить список консультантов
  .get('/listofpsych', async (req, res) => {
    try {
      const client = await Client.findById(res.userId);
      const matched = await getMatchedPsyches(client);

      client.requests.push({
        amountOfPsychsFind: matched.length,
        date: new Date()
      });
      await client.save();

      const filteredList = matched
        // .filter(psych => !!psych.firstName && !!psych.consultingObject)
        // .filter(psych => !!psych.firstName)
        .map((psych) => {
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
            consultations,
          } = psych;

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
            consultations,
          };
        });

      res.body = response.OK();
      res.body.psychList = filteredList;
      res.send(res.body);
    } catch (err) {
      console.error(err.message);
      return res.status(500).json(response.INTERNAL_ERROR());
    }
  })

  .get('/psychforclient', async (req, res) => {
    const client = await Client.findById(res.userId);
    if (!client.psychSelection.length) {
      res.body = response.OK();
      res.body.psychprofile = null;
    } else {
      const findPsych = await Psych.findById(client.psychSelection);
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
        consultations,
        timezone,
        troubles,
        consultingObject,
        schedule,
        activityStartDate,
        birthDay,
        educations
      } = findPsych;

      res.body = response.OK();
      res.body.psychprofile = {
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
        consultations,
        timezone,
        troubles,
        consultingObject,
        schedule,
        activityStartDate,
        birthDay,
        educations
      };
    }
    res.send(res.body);
  })

  .put('/deleteYourPsych', async (req, res) => {
    const client = await Client.findById(res.userId);
    if (!client) {
      res.body = response.DATA_ERROR();
    } else {
      const psych = await Psych.findById(client.psychSelection);
      psych.deleteClient(client._id);
      await psych.save();

      client.deleteYourPsych();
      await client.save();

      await Refusal.create({
        client: client._id,
        psych: psych._id,
        isClientRefuse: true
      });

      res.body = response.OK();
    }
    res.send(res.body);
  });

module.exports = router;

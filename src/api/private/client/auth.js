const express = require('express');
const multer = require('multer');
const fs = require('fs');

const { response } = require('../../../constants');
const { Client, Psych } = require('../../../model');


const router = express.Router();

router
/**
 * Проверка токена на актуальность
 */
  .get('/checktoken', async (req, res) => {
    res.body = response.OK();
    res.send(res.body);
  })
  .put('/password', async (req, res) => {
    const { password } = req.body;
    const client = await Client.findById(res.userId);
    if (!client) {
      res.body = response.DATA_ERROR();
    } else {
      client.updatePassword(password);
      await client.save();
      res.body = response.OK();
    }
    res.send(res.body);
  })
  .put('/firstquiz', async (req, res) => {
    const client = await Client.findById(res.userId);
    if (!client) {
      res.body = response.DATA_ERROR();
    } else {
      const userFolderPath = `./public/photos/client/${client._id}`;
      const path = `./public/photos/client/${client._id}/avatar`;
      if (!fs.existsSync(userFolderPath)) {
        fs.mkdirSync(userFolderPath);
      }
      if (!fs.existsSync(path)) {
        fs.mkdirSync(path);
      }

      const clientAvatarStorage = multer.diskStorage({
        destination: (request, file, callback) => {
          callback(null, path);
        },
        filename: (request, file, callback) => {
          callback(null, `${file.fieldname}_${client._id}.jpg`);
        },
      });

      const upload = multer({
        storage: clientAvatarStorage,
        limits: { fieldSize: 50 * 1024 * 1024 }
      }).single('avatar');

      upload(req, res, async (error) => {
        if (error) {
          res.body = response.INTERNAL_ERROR();
          console.log(error);
        } else {
          const quiz = JSON.parse(req.body.quiz);
          console.log(quiz);
          quiz.avatar = req.file ? req.file.path : '';

          client.addFirstQuizAnswers(quiz);
          await client.save();

          res.body = response.OK();
        }
        res.send(res.body);
      });
    }
  })
  .put('/secondquiz', async (req, res) => {
    const client = await Client.findById(res.userId);
    if (!client) {
      res.body = response.DATA_ERROR();
    } else {
      client.addSecondQuizAnswers(req.body);
      await client.save();

      res.body = response.OK();
    }
    res.send(res.body);
    console.log(req.body);
  })

  // Привязать психолога
  .put('/connectPsych', async (req, res) => {
    const {
      clientID,
      psychID,
    } = req.body;
    const client = await Client.findById(clientID);
    const psych = await Psych.findById(psychID);

    if (!client || !psych) {
      res.body = response.DATA_ERROR();
    } else {
      client.connectPsychSelection(psychID);
      await client.save();

      psych.addClient(clientID);
      await psych.save();

      res.body = response.OK();
    }

    res.send(res.body);
  });

module.exports = router;

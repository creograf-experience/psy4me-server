const express = require('express');
const multer = require('multer');
const fs = require('fs');

const { response } = require('../../../constants');
const { Psych } = require('../../../model');


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
    const psych = await Psych.findById(res.userId);
    if (!psych) {
      res.body = response.DATA_ERROR();
    } else {
      psych.updatePassword(password);
      await psych.save();
      res.body = response.OK();
    }
    res.send(res.body);
  })
  .put('/firstquiz', async (req, res) => {
    const psych = await Psych.findById(res.userId);
    if (!psych) {
      res.body = response.DATA_ERROR();
    } else {
      const userFolderPath = `./public/photos/psych/${psych._id}`;
      const path = `./public/photos/psych/${psych._id}/avatar`;
      if (!fs.existsSync(userFolderPath)) {
        fs.mkdirSync(userFolderPath);
      }
      if (!fs.existsSync(path)) {
        fs.mkdirSync(path);
      }

      const psychAvatarStorage = multer.diskStorage({
        destination: (request, file, callback) => {
          callback(null, path);
        },
        filename: (request, file, callback) => {
          callback(null, `${file.fieldname}_${psych._id}.jpg`);
        },
      });

      const upload = multer({
        storage: psychAvatarStorage,
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

          psych.addFirstQuizAnswers(quiz);
          await psych.save();

          res.body = response.OK();
        }
        res.send(res.body);
      });
    }
  })
  .put('/secondquiz', async (req, res) => {
    const psych = await Psych.findById(res.userId);
    if (!psych) {
      res.body = response.DATA_ERROR();
    } else {
      const userFolderPath = `./public/photos/psych/${psych._id}`;
      const path = `./public/photos/psych/${psych._id}/docs`;
      if (!fs.existsSync(userFolderPath)) {
        fs.mkdirSync(userFolderPath);
      }
      if (!fs.existsSync(path)) {
        fs.mkdirSync(path);
      }

      let docCount = 0;

      const psychAvatarStorage = multer.diskStorage({
        destination: (request, file, callback) => {
          callback(null, path);
        },
        filename: (request, file, callback) => {
          callback(null, `${file.fieldname}_${psych._id}_${docCount++}.jpg`);
        },
      });

      const upload = multer({ storage: psychAvatarStorage }).any();

      upload(req, res, async (error) => {
        if (error) {
          res.body = response.INTERNAL_ERROR();
        } else {
          const quiz = JSON.parse(req.body.quiz);
          quiz.educations = quiz.educations.map((education, index) => {
            const newEducation = education;
            newEducation.documents = req.files
              ? req.files
                .map(file => file.path)
                .filter(filePath => filePath.split('/')[5][4] === index.toString())
              : [];
            return newEducation;
          });

          psych.addSecondQuizAnswers(quiz);
          await psych.save();

          res.body = response.OK();
        }
        res.send(res.body);
      });
    }
  });

module.exports = router;

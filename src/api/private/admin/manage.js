const express = require('express');

const { getCharts } = require("./service")
const { response } = require('../../../constants');
const { phones, emails } = require('../../../services');
const {
  Psych,
  Client,
  Consultation,
} = require('../../../model');

const router = express.Router();

router
  .get('/checktoken', (req, res) => {
    res.body = response.OK();
    res.send(res.body);
  })

  // Психологи
  .get('/psychlist', async (req, res) => {
    const psychList = await Psych.find({});
    const filteredList = psychList
      .filter(psych => !!psych.firstName && !!psych.consultingObject)
      // .filter(psych => !!psych.firstName)
      // .map((psych) => {
      //   const {
      //     _id,
      //     firstName,
      //     middleName,
      //     lastName,
      //     phoneMask,
      //     gender,
      //     email,
      //     country,
      //     city,
      //     language,
      //     avatar,
      //     banned,
      //     consultations,
      //   } = psych;

      //   return {
      //     _id,
      //     lastName,
      //     firstName,
      //     middleName,
      //     gender,
      //     email,
      //     phoneMask,
      //     country,
      //     city,
      //     language,
      //     avatar,
      //     banned,
      //     consultations,
      //   };
      // });

    res.body = response.OK();
    res.body.psychList = filteredList;
    res.send(res.body);
  })

  .put('/psychedit', async (req, res) => {
    const { _id } = req.body;
    const psych = await Psych.findById(_id);
    if (!psych) {
      res.body = response.DATA_ERROR();
    } else {
      const { newData } = req.body;

      const {
        firstName,
        middleName,
        lastName,
        phone,
        email,
        city,
        country,
        gender,
        language,
        pricePsych60,
        pricePsych90,
        priceClient60,
        priceClient90
      } = newData;

      if (!firstName) {
        newData.firstName = psych.firstName;
      }

      if (!middleName) {
        newData.middleName = psych.middleName;
      }

      if (!lastName) {
        newData.lastName = psych.lastName;
      }

      if (!phone) {
        newData.phone = psych.phoneMask;
      }

      if (!email) {
        newData.email = psych.email;
      }

      if (!city) {
        newData.city = psych.city;
      }

      if (!country) {
        newData.country = psych.country;
      }

      if (!gender) {
        newData.gender = psych.gender;
      }

      if (!language) {
        newData.language = psych.language;
      }

      if (!pricePsych60) {
        newData.pricePsych60 = psych.pricePsych60
      }

      if (!pricePsych90) {
        newData.pricePsych90 = psych.pricePsych90
      }

      if (!priceClient60) {
        newData.priceClient60 = psych.priceClient60
      }

      if (!priceClient90) {
        newData.priceClient90 = psych.priceClient90
      }

      if (pricePsych60 >= priceClient60) {
        return res.send(response.DATA_ERROR())
      }

      if (pricePsych90 >= priceClient90) {
        return res.send(response.DATA_ERROR())
      }

      if (!emails.emailIsValid(newData.email)) {
        res.body = response.DATA_ERROR();
      } else {
        const rawPhone = phones.getRawPhone(newData.phone);
        if (rawPhone.length < 10 || rawPhone[0] === '8') {
          res.body = response.DATA_ERROR();
        } else {
          newData.phoneMask = newData.phone;
          newData.phone = rawPhone;
          await Psych.updateOne({ _id }, {
            $set: newData,
          });
          res.body = response.OK();
        }
      }
    }

    res.send(res.body);
  })

  .put('/psychban', async (req, res) => {
    const { _id } = req.body;
    const psych = await Psych.findById(_id);

    if (!psych) {
      res.body = response.DATA_ERROR();
    } else {
      const { banStatus } = req.body;
      await Psych.updateOne({ _id }, {
        $set: {
          banned: banStatus,
        },
      });
      res.body = response.OK();
    }

    res.send(res.body);
  })

  .delete('/psychdelete', async (req, res) => {
    const { _id } = req.body;
    const psych = await Psych.findById(_id);

    if (!psych) {
      res.body = response.DATA_ERROR();
    } else {
      await Psych.deleteOne({ _id });
      res.body = response.OK();
    }

    res.send(res.body);
  })

  // Клиенты
  .get('/clientlist', async (req, res) => {
    const clientList = await Client
      .find()
      .populate('personalPsych');
    const filteredList = clientList
      .filter(client => !!client.firstName)
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
          personalPsych,
          consultations,
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
          personalPsych: personalPsych && personalPsych._id,
          consultations,
        };
      });

    res.body = response.OK();
    res.body.clientList = filteredList;
    res.send(res.body);
  })

  .put('/clientedit', async (req, res) => {
    const { _id } = req.body;
    const client = await Client.findById(_id);
    if (!client) {
      res.body = response.DATA_ERROR();
    } else {
      const { newData } = req.body;

      const {
        firstName,
        middleName,
        lastName,
        phone,
        email,
        city,
        country,
        gender,
        language,
      } = newData;

      if (!firstName) {
        newData.firstName = client.firstName;
      }

      if (!middleName) {
        newData.middleName = client.middleName;
      }

      if (!lastName) {
        newData.lastName = client.lastName;
      }

      if (!phone) {
        newData.phone = client.phoneMask;
      }

      if (!email) {
        newData.email = client.email;
      }

      if (!city) {
        newData.city = client.city;
      }

      if (!country) {
        newData.country = client.country;
      }

      if (!gender) {
        newData.gender = client.gender;
      }

      if (!language) {
        newData.language = client.language;
      }

      if (!emails.emailIsValid(newData.email)) {
        res.body = response.DATA_ERROR();
      } else {
        const rawPhone = phones.getRawPhone(newData.phone);
        if (rawPhone.length < 10 || rawPhone[0] === '8') {
          res.body = response.DATA_ERROR();
        } else {
          newData.phoneMask = newData.phone;
          newData.phone = rawPhone;
          await Client.updateOne({ _id }, {
            $set: newData,
          });
          res.body = response.OK();
        }
      }
    }

    res.send(res.body);
  })

  .put('/clientban', async (req, res) => {
    const { _id } = req.body;
    const client = await Client.findById(_id);

    if (!client) {
      res.body = response.DATA_ERROR();
    } else {
      const { banStatus } = req.body;
      await Client.updateOne({ _id }, {
        $set: {
          banned: banStatus,
        },
      });
      res.body = response.OK();
    }

    res.send(res.body);
  })

  .delete('/clientdelete', async (req, res) => {
    const { _id } = req.body;
    const client = await Client.findById(_id);

    if (!client) {
      res.body = response.DATA_ERROR();
    } else {
      await Client.deleteOne({ _id });
      res.body = response.OK();
    }

    res.send(res.body);
  })

  .put('/connectpsych', async (req, res) => {
    const {
      clientID,
      psychID,
    } = req.body;

    const [client, psych] = await Promise.all([
      Client.findById(clientID),
      Psych.findById(psychID)
    ]);

    if (!client || !psych) {
      res.body = response.DATA_ERROR();
    } else {
      client.connectPsych(psychID);
      psych.addClient(clientID);

      await Promise.all([client.save(), psych.save()]);

      res.body = response.OK();
    }

    res.send(res.body);
  })

  .post('/newconsultationforclient', async (req, res) => {
    const { clientID } = req.body;

    const client = await Client.findById(clientID);

    if (!client) {
      res.body = response.DATA_ERROR();
    } else {
      const {
        durationInMinutes,
        date,
      } = req.body;

      const psychID = client.personalPsych;

      const newConsultation = await Consultation.create({
        client: clientID,
        psych: psychID,
        durationInMinutes,
        date
      });

      const psych = await Psych.findById(psychID);

      if (!psych) {
        res.body = response.DATA_ERROR();
      } else {
        const { _id } = newConsultation;

        psych.setConsultation(_id);
        client.setConsultation(_id);

        psych.save();
        client.save();

        res.body = response.OK();
      }
    }

    res.send(res.body);
  })

  .get('/allconsultations', async (req, res) => {
    const consultations = await Consultation.find({});

    res.body = response.OK();
    res.body.consultations = consultations;

    res.send(res.body);
  })

// .get('/getconnectedpsych', async (req, res) => {
//   const { clientID } = req.body;
//
//   const client = await Client.findById(clientID);
//
//   if (!client) {
//     res.body = response.DATA_ERROR();
//   } else {
//     res.body = response.OK();
//     res.body.psychID = client.personalPsych;
//   }
//
//   res.send(res.body);
// })

  .patch('/consultationedit', async (req, res) => {
    const {
      consultationID,
      newData,
    } = req.body;

    const consultation = await Consultation.findById(consultationID);

    if (!consultation) {
      res.body = response.DATA_ERROR();
    } else {
      res.body = response.OK();
      res.body.oldDate = consultation.date;

      consultation.editConsultation(newData);
      consultation.save();
    }

    res.send(res.body);
  })

  .delete('/consultationdelete', async (req, res) => {
    const { consultationID } = req.body;

    const consultation = await Consultation.findById(consultationID);

    if (!consultation) {
      res.body = response.DATA_ERROR();
    } else {
      await Consultation.deleteOne({ _id: consultationID });

      res.body = response.OK();
    }

    res.send(res.body);
  })

  .get('/charts/:date', async (req, res) => {
    try {
      const data = await getCharts(req.params.date);

      res.body = response.OK();
      res.body.data = data;

      res.send(res.body);
    } catch (err) {
      console.error(err.message);
      return res.status(500).json(response.INTERNAL_ERROR());
    }
  });

module.exports = router;

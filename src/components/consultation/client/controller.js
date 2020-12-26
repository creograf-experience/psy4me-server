const { response } = require('../../../constants');
const ConsultationModel = require('../model');
const { Psych, Client } = require('../../../model');

exports.getAll = async function(req, res) {
  try {
    const consultations = await ConsultationModel
      .find({ client: res.userId })
      .populate('psych client');
      res.body=response.OK();
      res.body.consultations=consultations;
    return res.send(res.body);

  } catch (err) {
    console.error(err);
    res.body = response.INTERNAL_ERROR();
    return res.send(res.body);
  }
};

exports.create = async function(req, res) {
  try {
    const {
      psych,
      client,
      date,
      durationInMinutes
    } = req.body;

    const [psychObj, clientObj] = await Promise.all([
      Psych.findById(psych),
      Client.findById(client)
    ]);

    if (!psychObj || !clientObj || !date || !durationInMinutes) {
      return res.status(400).json(response.DATA_ERROR());
    }

    const newConsult = new ConsultationModel({
      psych,
      client,
      date,
      durationInMinutes
    });

    await newConsult.save();

    return res.status(200).json(response.OK());

  } catch (err) {
    console.error(err);
    return res.status(500).json(response.INTERNAL_ERROR());
  }
};

exports.reschedule = async function(req, res) {
  try {
    const { id, date } = req.body;
    if (!id || !date) {
      return res.status(400).json(response.DATA_ERROR());
    }

    const consult = await ConsultationModel.findById(id);
    if (!consult) {
      return res.status(400).json(response.DATA_ERROR());
    }

    consult.rescheduleByClients(date);
    await consult.save();

    return res.status(200).json(response.OK());

  } catch (err) {
    console.error(err);
    return res.status(500).json(response.INTERNAL_ERROR());
  }
};

exports.complete = async function(req, res) {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json(response.DATA_ERROR());
    }

    const consult = await ConsultationModel.findById(id);
    if (!consult) {
      return res.status(400).json(response.DATA_ERROR());
    }

    consult.status = 'Завершена';
    await consult.save();

    return res.status(200).json(response.OK());

  } catch (err) {
    console.error(err);
    return res.status(500).json(response.INTERNAL_ERROR());
  }
};

exports.acceptReschedule = async function(req, res) {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json(response.DATA_ERROR());
    }

    const consult = await ConsultationModel.findById(id);
    if (!consult) {
      return res.status(400).json(response.DATA_ERROR());
    }

    consult.acceptReschedule();
    await consult.save();

    return res.status(200).json(response.OK());

  } catch (err) {
    console.error(err);
    return res.status(500).json(response.INTERNAL_ERROR());
  }
};

exports.rate = async function(req, res) {
  try {
    const { id, psychRating, connectionRating } = req.body;
    if (!id || !psychRating || !connectionRating) {
      return res.status(400).json(response.DATA_ERROR());
    }

    const consult = await ConsultationModel.findById(id);
    if (!consult) {
      return res.status(400).json(response.DATA_ERROR());
    }

    consult.rateByClient(psychRating, connectionRating);
    await consult.save();

    return res.status(200).json(response.OK());

  } catch (err) {
    console.error(err);
    return res.status(500).json(response.INTERNAL_ERROR());
  }
};

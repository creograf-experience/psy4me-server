const { response } = require('../../../constants');
const ConsultationModel = require('../model');

exports.getAll = async function(req, res) {
  try {
    const consultations = await ConsultationModel
      .find({ psych: res.userId })
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

    consult.rescheduleByPsychs(date);
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
    const { id, connectionRating } = req.body;
    if (!id || !connectionRating) {
      return res.status(400).json(response.DATA_ERROR());
    }

    const consult = await ConsultationModel.findById(id);
    if (!consult) {
      return res.status(400).json(response.DATA_ERROR());
    }

    consult.rateByPsych(connectionRating);
    await consult.save();

    return res.status(200).json(response.OK());

  } catch (err) {
    console.error(err);
    return res.status(500).json(response.INTERNAL_ERROR());
  }
};

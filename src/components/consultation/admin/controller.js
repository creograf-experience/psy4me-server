const {consultationsResponse} = require('../../../dto/consultation');
const {response} = require('../../../constants');
const ConsultationModel = require('../model');
const {Psych, Client} = require('../../../model');

exports.getUserConsults = async function (req, res) {
  try {
    let {clientId, psychId, page = 0, size = 5} = req.body;

    let filter = {};

    if (clientId) {
      filter.client = clientId;
    }

    if (psychId) {
      filter.psych = psychId;
    }

    const consultations = await ConsultationModel
      .find(filter)
      .sort({date: 1})
      .skip(((page + 1) - 1) * size)
      .limit(size)
      .populate("psych client", '_id, firstName lastName middleName, connectedClients, personalPsych');

    const count = await ConsultationModel.countDocuments(filter);
    const schedule = await consultationsResponse(consultations);

    res.body = response.OK();
    res.body.data = {
      totalCount: count,
      schedule: schedule || []
    }

    res.send(res.body);

  } catch (err) {
    console.error(err);
    return res.status(500).json(response.INTERNAL_ERROR());
  }
};

exports.getConsults = async function (req, res) {
  try {
    let {client, psych, from, to, page = 0, size = 5} = req.body;

    let filter = {
      date: {
        $gte: new Date(from).getTime(),
        $lt: new Date(to).getTime()
      }
    };

    if (client) {
      filter.client = client;
    }

    if (psych) {
      filter.psych = psych;
    }

    const consultations = await ConsultationModel
      .find(filter)
      .sort({date: 1})
      .skip(((page + 1) - 1) * size)
      .limit(size)
      .populate("psych client", '_id, firstName lastName middleName');

    const count = await ConsultationModel.countDocuments(filter);

    const schedule = await consultationsResponse(consultations);

    res.body = response.OK();
    res.body.data = {
      totalCount: count,
      totalPages: Math.ceil(count / size),
      schedule: schedule || []
    }

    res.send(res.body);
  } catch (err) {
    console.error(err);
    return res.status(500).json(response.INTERNAL_ERROR());
  }
};

exports.reschedule = async function (req, res) {
  try {
    const {id, date, durationInMinutes, status} = req.body;

    let doc = {};

    if (date) {
      doc.date = date;
    }

    if (durationInMinutes) {
      doc.durationInMinutes = durationInMinutes;
    }

    if (status) {
      doc.status = status;
    }

    await ConsultationModel.findOneAndUpdate(
      {_id: id},
      doc,
      {useFindAndModify: false}
    )

    return res.status(200).json(response.OK());
  } catch (err) {
    console.error(err);
    return res.status(500).json(response.INTERNAL_ERROR());
  }
}

exports.create = async function (req, res) {
  try {
    const {
      psych,
      client,
      date,
      durationInMinutes,
      status
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
      durationInMinutes,
      status
    });

    await newConsult.save();

    return res.status(200).json(response.OK());

  } catch (err) {
    console.error(err);
    return res.status(500).json(response.INTERNAL_ERROR());
  }
};

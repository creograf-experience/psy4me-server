const MessageModel = require('../message');
const { response } = require('../../../constants');

exports.get = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit);
    const skip = parseInt(req.query.skip) || 0;
    const { chatId } = req.params;
    if(!chatId) {
      res.body = response.NOT_FOUND();
      return res.send(res.body);
    }

    const messages = await MessageModel
      .find({ chatId })
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit);

    res.body = response.OK();
    res.body.messages = messages;
    return res.send(res.body);

  } catch (err) {
    console.error(err);
    res.body = response.INTERNAL_ERROR();
    return res.send(res.body);
  }
};
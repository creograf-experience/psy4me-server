const ChatModel = require('../chat');
const { response } = require('../../../constants');
const { Psych, Client } = require('../../../model');

exports.getAll = async (req, res) => {
  try {
    const chats = await ChatModel
      .find({ userId: res.userId })
      .populate('latestMessage')
      .sort({ updatedAt: -1 });

    res.body = response.OK();
    res.body.chats = chats;
    return res.send(res.body);
  } catch (err) {
    console.error(err);
    res.body = response.INTERNAL_ERROR();
    return res.send(res.body);
  }
};
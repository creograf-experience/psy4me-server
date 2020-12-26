const mongoose = require('mongoose');

const { Types } = mongoose.Schema;

const MessageSchema = new mongoose.Schema({
  chatId: String,

  uuid: String,

  from: String,

  fromId: String,

  content: {
    message: String,
    attachments: {
      photo: String,
      imageName: String
    }
  }
}, { timestamps: true });

const MessageModel = mongoose.model('Message', MessageSchema);
module.exports = MessageModel;

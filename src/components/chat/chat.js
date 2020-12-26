const mongoose = require('mongoose');

const { Types } = mongoose.Schema;

const ChatSchema = new mongoose.Schema({
  userId: String,

  userPhone: String,
  
  receivingId: String,

  receivingType: String,

  receivingPhone: String,

  type: String,

  mirrorId: String,
  
  generatedNum: String,

  consultationChat: Boolean,

  latestMessage: {
    type: Types.ObjectId,
    ref: 'Message'
  }

}, { timestamps: true });

const ChatModel = mongoose.model('Chat', ChatSchema);
module.exports = ChatModel;

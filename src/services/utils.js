const server = require('../index');
const uuidv4 = require('uuid/v4');
const base64Img = require('base64-img');
const {images} = require('../constants');
const ChatModel = require('../components/chat/chat');
const MessageModel = require('../components/message/message');

const utils = {
  getSocketByPhone: (phone, users) => {
    let socket;

    users.forEach((value, key) => {
      if (value.phone === phone) socket = key;
    });

    return socket;
  },

  filterFilePath: path =>
    path
      .split('/')
      .slice(-3)
      .join('/'),

  assignMessage: (message, documents) => {
    const { senderMessage, receiverMessage } = documents;

    senderMessage.content.message = message;
    receiverMessage.content.message = message;
  },

  assignAttachment: (attachment, documents) => {
    const { senderMessage, receiverMessage } = documents;
    if (attachment.photo) {
      const imageName = uuidv4();

      const filePath = `${images.localURL}/` + utils.filterFilePath(
        base64Img.imgSync(attachment.photo, images.CLIENT_IMAGE_FOLDER, imageName)
      );
      console.log(filePath);
      senderMessage.content.attachments.photo = filePath;
      senderMessage.content.attachments.imageName = imageName;
      receiverMessage.content.attachments.imageName = imageName;
      receiverMessage.content.attachments.photo = filePath;

      return;
    }
  },
  createMessages: (chats, content) => {
    const { senderChat, receiverChat } = chats;
    const senderMessage = new MessageModel({
      chatId: senderChat._id,
      uuid: content.uuid,
      from: senderChat.userPhone,
      fromId: senderChat.userId,
      content: {}
    });

    const receiverMessage = new MessageModel({
      chatId: receiverChat._id,
      from: senderChat.userPhone,
      fromId: senderChat.userId,
      content: {}
    });

    if (content.message) {
      utils.assignMessage(
        content.message,
        { senderMessage, receiverMessage }
      );
    }

    if (content.attachment) {
      utils.assignAttachment(
        content.attachment,
        { senderMessage, receiverMessage }
      );
    }

    return [senderMessage, receiverMessage];
  },
  deleteMsgByIdOrUuid: async _id => {
    try {
      return String(_id).length < 30
        ? await MessageModel.findOneAndDelete({ _id })
        : await MessageModel.findOneAndDelete({ uuid: _id });
    } catch (err) {
      console.error(err)
    }
  }
};

module.exports = utils;
const jwt = require('jsonwebtoken');
const io = require('../index');
const uuidv4 = require('uuid/v4');
const base64Img = require('base64-img');
const utils = require('./utils');
const server = require('../index');

const { passport } = require('../constants');
const { Psych, Client } = require('../model');
const ChatModel = require('../components/chat/chat');
const MessageModel = require('../components/message/message');

const users = new Map();

module.exports = socket => {
  console.log('user connected with socket:' + socket.id);

  socket.on('disconnect', () => {
    console.log('user disconnected with socket: ' + socket.id);
    users.delete(socket.id);
  });

  socket.on('init user', async jwtToken => {
    try {
      console.log('init user with socket ' + socket.id);
      if (!jwtToken) {
        socket.emit('err', 'Invalid data');
        return socket.emit('disconnect');
      }

      const decoded = await jwt.verify(
        jwtToken.replace('Bearer ', ''),
        passport.JWT_SECRET
      );

      const psych = await Psych.findById(decoded.id);
      const client = await Client.findById(decoded.id);

      if(!psych && !client) {
        console.log('user does not exist');
        return socket.emit('dissconnect');
      }

      console.log('user decoded');
      /*users.forEach((value,key) => {
        if(value.phone === psych.phone || value.phone === client.phone){
          console.log('user already exist, dissconnect ');
          io.sockets.connected[key].disconnect();
        }
      });*/
      if(client){
        users.set(socket.id, {id:client._id, type:'client',phone: client.phone});
        socket.emit('receive init user', client);
      }
      if(psych){
        users.set(socket.id, {id:psych._id, type:'psych',phone: psych.phone});
        socket.emit('receive init user', psych);
      }
    } catch (err) {
      console.error('Not decoded', err);
      return socket.emit('disconnect');
    }
  });

  socket.on('create chat', async data => {
    try{
      const { receiver, content} = data;

      if(!users.get(socket.id)) return socket.emit('err','User is not initialized');

      const sender = users.get(socket.id);
      
      const senderChat = new ChatModel({
        userPhone:sender.phone,
        type:sender.type,
        userId: users.get(socket.id).id,
        receivingId: receiver.id,
        receivingType: receiver.type,
        receivingPhone: receiver.phone.slice(1),
        consultationChat: receiver.consultationChat
      });
      

      const receiverChat = new ChatModel({
        userPhone: receiver.phone.slice(1),
        type: receiver.type,
        userId: receiver.id,
        receivingId: users.get(socket.id).id,
        receivingType: sender.type,
        receivingPhone: receiver.phone.slice(1),
        consultationChat: receiver.consultationChat,
        mirrorId: senderChat._id,
      });

      const [senderMessage,receiverMessage] = utils.createMessages(
        { senderChat, receiverChat },
        content
      );

      senderChat.latestMessage = senderMessage._id;
      receiverChat.latestMessage = receiverMessage._id;
      senderChat.mirrorId = receiverChat._id;

      await Promise.all([
        senderMessage.save(),
        receiverMessage.save(),
        senderChat.save(),
        receiverChat.save()
      ]);
      
      senderChats = await ChatModel
        .findById(senderChat._id)
        .populate('latestMessage');

      receiverChats = await ChatModel
        .findById(receiverChat._id)
        .populate('latestMessage');

      socket.emit('sender chat', senderChats);
      
      const receiverSocket = utils.getSocketByPhone(
        receiverChat.userPhone,
        users
      );
      if (receiverSocket) {
        io.to(receiverSocket).emit('receiver chat', receiverChat);
      }

    }catch (err) {
      console.error(err);
    }
  });

  socket.on('create message', async data => {
    try{
      const { chatId, mirrorId, message, attachment,uuid } = data;
      if(!users.get(socket.id)) return socket.emit('err','User is not initialized');

      const user = users.get(socket.id);
      
      if(
        (!user || !chatId || !mirrorId) ||
        (!message && !attachment)
      ) return;

      const [senderChat, receiverChat] = await Promise.all([
        ChatModel.findById(chatId),
        ChatModel.findById(mirrorId)
      ]);

      const [senderMessage, receiverMessage] = utils.createMessages(
        { senderChat, receiverChat },
        { message, attachment, uuid }
      );
 
      senderChat.latestMessage = senderMessage._id;
      receiverChat.latestMessage = receiverMessage._id;

      await Promise.all([
        senderMessage.save(),
        receiverMessage.save(),
        senderChat.save(),
        receiverChat.save()
      ]);

      socket.emit('receive message', senderMessage);
      const receiverSocket = utils.getSocketByPhone(receiverChat.userPhone,users);
      if (receiverSocket) {
        io.to(receiverSocket).emit('receive private message', receiverMessage);
      }

    } catch (err){
      console.error(err);
    }
  });

  socket.on('delete message', async data => {
    try {
      const { chatId, _id } = data;
      if (!chatId || !_id) return;

      const [chat,message] = await Promise.all([
        ChatModel.findById(chatId),
        utils.deleteMsgByIdOrUuid(_id)
      ]);

      if(!chat || !message) return;
      if(String(chat.latestMessage) !== String(message._id)) return;

      const [prevMessage] = await MessageModel.find({ chatId }).sort({ _id:-1 }).limit(1);
      chat.latestMessage = prevMessage ? prevMessage._id : null;
      await chat.save();
    } catch (err){
      console.error(err);
    }
  });

};
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const http = require('http').Server(app);
const io = module.exports = require('socket.io')(http, {
  pingTimeout: 58000,
  pingInterval: 2000
});
const { passport } = require('./middleware');
const { db } = require('./config');
const routes = require('./api');

// Проверяет режим, в котором сервер запущен (по умолчанию dev)
const env = process.env.NODE_ENV || 'dev';
const PORT = 3100;

mongoose.connect(db[env], { useUnifiedTopology: true, useNewUrlParser: true });

const dataBase = mongoose.connection;
mongoose.Promise = global.Promise;

/**
 * Обработчики подключения к БД
 */
dataBase.on('error', console.error.bind(console, 'dataBase connection error:'));
dataBase.once('open', () => {
  console.log('База данных подключена');
  // console.log(dataBase.collection('admins').find());
});

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,Content-type,Authorization');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

const root = path.join(__dirname, '../');
app.use('/photos', express.static(`${root}public/photos`));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(passport.initialize());

/**
 * Подключение роутов для апи
 */

app.use('/api', routes);

const socketManager = require('./services/socketManger');
io.on('connection', socketManager);

/**
 * Старт сервера
 */
const server = http.listen(PORT, () => {
  console.log(`Сервер слушает порт ${PORT}!`);
  console.log(`Сервер запущен в режиме ${env}`);
  console.log(`Все работает`);
});

module.exports = server;

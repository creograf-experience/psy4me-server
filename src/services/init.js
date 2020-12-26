const mongoose = require('mongoose');
const { db } = require('../config');

const init = async () => {
  // create folder public

  mongoose.connect(
    db.dev,
    { useNewUrlParser: true }
  );

  const dataBase = mongoose.connection;
  mongoose.Promise = global.Promise;

  dataBase.on('error', () => {
    console.log('Error db');
  });
  console.log('База данных подключена');
  // call your init functions
  console.log('Init ended');
  process.exit(0);
};

init();

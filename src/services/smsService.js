const { min, max } = { min: 1000, max: 9999 };

const smsService = {
  // getRandomSmsCode: () => parseInt(Math.random() * (max - min) + min),
  getRandomSmsCode: () => 1111, // Генерация кода 1111 для облегченного тестирования
  sendSmsCode: ({ phone, code }) => {
    console.log(`Sending sms to phone: ${phone} with code: ${code}`);
  }
};

module.exports = smsService;

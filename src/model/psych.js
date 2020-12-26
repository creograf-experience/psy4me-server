const mongoose = require('mongoose');
const crypto = require('crypto');

const { Types } = mongoose.Schema;

const psychSchema = new mongoose.Schema({
  // Аватар
  avatar: {
    type: String,
    default: ''
  },
  // Имя
  firstName: {
    type: String,
    default: ''
  },
  // Фамилия
  lastName: {
    type: String,
    default: ''
  },
  // Отчество
  middleName: {
    type: String,
    default: ''
  },
  // Пол
  gender: {
    type: String,
    default: 'М',
    enum: ['М', 'Ж']
  },
  // День рождения
  birthDay: {
    type: String,
    default: ''
  },
  // Email
  email: {
    type: String,
    default: ''
  },
  // Страна
  country: {
    type: String,
    default: ''
  },
  // Город
  city: {
    type: String,
    default: ''
  },
  // Часовой пояс
  timezone: {
    type: String,
    default: ''
  },
  // Язык
  language: {
    type: String,
    default: ''
  },
  // Дата начала работы психологом
  activityStartDate: {
    type: String,
    default: ''
  },
  // Часы личной терапии
  personalTherapyHours: {
    type: Number,
    default: 0
  },
  // О себе
  aboutMe: {
    type: String,
    default: ''
  },
  // Номер телефона, вида 71111111
  phone: {
    type: String,
    default: ''
  },
  // Номер телефона, вида +7 111 11-11
  phoneMask: {
    type: String,
    default: ''
  },
  passwordHash: String,
  salt: String,
  // Последний отправленный код на телефон
  lastSmsCode: {
    type: String,
    default: ''
  },
  // Название банка
  bankName: {
    type: String,
    default: ''
  },
  // Номер счета
  accountNumber: {
    type: String,
    default: ''
  },
  // БИК
  bankID: {
    type: String,
    default: ''
  },
  // ИНН
  TIN: {
    type: String,
    default: ''
  },
  // Проблемы, с которыми работает психолог
  troubles: [
    {
      type: String,
      default: ''
    }
  ],
  // Кого консультирует
  consultingObject: [
    {
      type: String,
      default: ''
    }
  ],
  // Работает ли с депрессиями
  depression: {
    type: Boolean,
    default: false
  },
  // Соцсети
  social: {
    // vkontakte
    vk: {
      type: String,
      default: ''
    },
    // facebook
    facebook: {
      type: String,
      default: ''
    },
    // instagram
    instagram: {
      type: String,
      default: ''
    }
  },
  // Образования
  educations: [
    {
      // Университет
      university: {
        type: String,
        default: ''
      },
      // Специальность
      specialty: {
        type: String,
        default: ''
      },
      // Подтверждающие документы
      documents: [
        {
          type: String,
          default: ''
        }
      ]
    }
  ],
  // Пожелания
  infoObject: {
    type: String,
    default: ''
  },
  // Оказывает ли бесплатную поддержку
  freeHelp: {
    type: Boolean,
    default: false
  },
  // Удобное для работы время
  schedule: [
    {
      // День недели
      weekDay: {
        type: String,
        default: ''
      },
      // С
      startTime: {
        type: Number,
        default: 0
      },
      // До
      endTime: {
        type: Number,
        default: 0
      }
    }
  ],
  // Статус бана
  banned: {
    type: Boolean,
    default: false
  },

  connectedClients: [
    {
      type: Types.ObjectId,
      ref: 'Client'
    }
  ],

  pricePsych60: String,
  pricePsych90: String,

  priceClient60: String,
  priceClient90: String
}, { timestamps: true });

psychSchema
  .virtual('password')
  .set(function setPassword(password) {
    this._plainPassword = password;
    if (password) {
      this.salt = crypto.randomBytes(128).toString('base64');
      this.passwordHash = crypto.pbkdf2Sync(password, this.salt, 1, 128, 'sha1');
    } else {
      this.salt = undefined;
      this.passwordHash = undefined;
    }
  })

  .get(function getPassword() {
    return this._plainPassword;
  });

psychSchema.methods.checkPassword = function checkPassword(password) {
  return !password || !this.passwordHash
    ? false
    : crypto.pbkdf2Sync(password, this.salt, 1, 128, 'sha1').toString() === this.passwordHash;
};

psychSchema.methods.setLastSmsCode = function setLastSmsCode(code) {
  this.lastSmsCode = code;
};

psychSchema.methods.updatePassword = function updatePassword(code) {
  this.password = code;
};

psychSchema.methods.addFirstQuizAnswers = function addFirstQuizAnswers(quiz) {
  const {
    firstName,
    lastName,
    patronymic,
    sex,
    birthDay,
    email,
    country,
    city,
    timezone,
    language,
    activityStartDate,
    personalTherapyHours,
    personalInfo,
    bankName,
    accountNumber,
    bankID,
    TIN,
    avatar
  } = quiz;

  this.avatar = avatar;
  this.firstName = firstName;
  this.lastName = lastName;
  this.middleName = patronymic;
  this.gender = sex;
  this.birthDay = birthDay.toString();
  this.email = email;
  this.country = country;
  this.city = city;
  this.timezone = timezone;
  this.language = language;
  this.activityStartDate = activityStartDate.toString();
  this.personalTherapyHours = personalTherapyHours;
  this.aboutMe = personalInfo;
  this.bankName = bankName;
  this.accountNumber = accountNumber;
  this.bankID = bankID;
  this.TIN = TIN;
};

psychSchema.methods.addSecondQuizAnswers = function addSecondQuizAnswers(quiz) {
  const {
    pickedTroubles,
    consultingObject,
    depression,
    socialNetworks,
    educations,
    infoObject,
    freeHelp,
    schedule
  } = quiz;

  this.troubles = pickedTroubles;
  this.consultingObject = consultingObject;
  this.depression = depression;
  this.social = socialNetworks;
  this.educations = educations;
  this.infoObject = infoObject;
  this.freeHelp = freeHelp;
  this.schedule = schedule;
};

psychSchema.methods.addClient = function addClient(id) {
  const { connectedClients } = this;

  this.connectedClients = [...connectedClients, id];
};

psychSchema.methods.deleteClient = function deleteClient(id) {
  const { connectedClients } = this;
  const deleteClientId = connectedClients.filter(el=>el.toString() !== id.toString());
  this.connectedClients = deleteClientId;
}

module.exports = mongoose.model('Psych', psychSchema);

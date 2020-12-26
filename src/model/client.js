const mongoose = require('mongoose');
const crypto = require('crypto');

const { Types } = mongoose.Schema;

const clientSchema = new mongoose.Schema({
  passwordHash: String,
  salt: String,
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
    default: '',
  },
  // Язык
  language: {
    type: String,
    default: ''
  },
  // Статус бана
  banned: {
    type: Boolean,
    default: false
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
  // Последний отправленный код на телефон
  lastSmsCode: {
    type: String,
    default: ''
  },
  // Проблемы клиента
  troubles: [
    {
      type: String,
      default: ''
    }
  ],
  // Обращался ли к психологам
  consultingObject: {
    type: String,
    default: '',
  },
  // Какой консультант нужен
  psychoHelp: {
    type: String,
    default: ''
  },
  // Испытывает ли депрессию
  depression: {
    type: Boolean,
    default: false
  },
  // Принимает ли антидепрессанты
  medicine: {
    type: Boolean,
    default: false,
  },
  // Предпочтения по стилю работы
  workingStyle: {
    type: String,
    default: '',
  },
  // Стоимость от квалификации и опыта консультанта
  priceObject: {
    type: String,
    default: ''
  },
  // Пожелания
  infoObject: {
    type: String,
    default: ''
  },
  // psych
  psychSelection: {
    type: String,
    default: ''
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
  // запрос на подбор психолога
  requests: [
    {
      // количество найденных психологов
      amountOfPsychsFind: {
        type: Number,
      },
      // дата запрос
      date: {
        type: Date
      }
    }
  ],
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
  // Привязанный психолог
  personalPsych: {
    type: Types.ObjectId,
    ref: 'Psych'
  }
}, { timestamps: true });

clientSchema
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

clientSchema.methods.checkPassword = function checkPassword(password) {
  return !password || !this.passwordHash
    ? false
    : crypto.pbkdf2Sync(password, this.salt, 1, 128, 'sha1').toString() === this.passwordHash;
};

clientSchema.methods.setLastSmsCode = function setLastSmsCode(code) {
  this.lastSmsCode = code;
};

clientSchema.methods.updatePassword = function updatePassword(code) {
  this.password = code;
};

clientSchema.methods.addFirstQuizAnswers = function addFirstQuizAnswers(quiz) {
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
    personalTherapyHours,
    personalInfo,
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
  this.personalTherapyHours = personalTherapyHours;
  this.aboutMe = personalInfo;
};

clientSchema.methods.addSecondQuizAnswers = function addSecondQuizAnswers(quiz) {
  const {
    pickedTroubles,
    consultingObject,
    psychoHelp,
    depression,
    medicine,
    workingStyle,
    priceObject,
    infoObject,
    psychSelection,
    socialNetworks,
    schedule
  } = quiz;

  this.troubles = pickedTroubles;
  this.consultingObject = consultingObject;
  this.psychoHelp = psychoHelp;
  this.depression = depression;
  this.medicine = medicine;
  this.workingStyle = workingStyle;
  this.priceObject = priceObject;
  this.infoObject = infoObject;
  this.psychSelection = psychSelection;
  this.social = socialNetworks;
  this.schedule = schedule;
};

clientSchema.methods.connectPsych = function connectPsych(psychID) {
  this.personalPsych = psychID;
};

clientSchema.methods.connectPsychSelection = function connectPsychSelection(psychID) {
  this.psychSelection = psychID;
};

clientSchema.methods.setConsultation = function setConsultation(id) {
  const { consultations } = this;

  this.consultations = [...consultations, id];
};

clientSchema.methods.deleteYourPsych = function deleteYourPsych() {
  this.psychSelection = '';
};

// taskSchema.statics.getAllowedFieldsForCreate = () => [
//   'name',
//   'place',
//   'prize',
//   'image',
//   'description',
//   'date',
// ];

// taskSchema.loadClass(BaseClass);

module.exports = mongoose.model('Client', clientSchema);

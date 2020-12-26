const mongoose = require('mongoose');

const {Types} = mongoose.Schema;

const PaymentSchema = new mongoose.Schema({
  client: {
    type: Types.ObjectId,
    ref: 'Client',
  },
  psych: {
    type: Types.ObjectId,
    ref: 'Psych',
  },
  description: {
    type: String,
    default: ''
  },
  // сумма платежа
  amount: {
    type: Number,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['payed', 'canceled', 'processed']
  },
  paymentOption: {
    type: String,
    required: true,
    enum: ['sber', 'acquiring', 'cashless', 'gift']
  },
  // валюта
  currency: {
    type: String,
    required: true,
    enum: ['RUB', 'USD', 'EUR', 'UAH', 'GBP', 'BYR', 'BYN', 'KZT', 'AZN', 'CAD']
  },
  // номер заказа
  invoiceId: {
    type: String,
    default: ''
  },
  isSubscription: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean
  },
  subscriptionId: {
    type: String
  },
  // идентификатор плательщика (обязательно для создания подписки)
  accountId: {
    type: String,
    default: ''
  },
  // точная информация по оплате услуги
  receipt: {
    description: {
      type: String,
    },
    price: {
      type: Number
    },
    amount: {
      type: Number
    },
    durationInMinutes: {
      type: Number
    },
    quantity: {
      type: Number
    },
    // e-mail плательщика
    email: {
      type: String,
    },
  },
  // подписка
  recurrent: {
    // итервал, возможные значения: Day, Week, Month
    interval: {
      type: String,
      enum: ['Day', 'Week', 'Month']
    },
    // Период. В комбинации с интервалом, 1 Month значит раз в месяц, а 2 Week — раз в две недели.
    period: {
      type: Number,
    },
    // Дата и время первого платежа по плану во временной зоне UTC.
    // По умолчанию запуск произойдет через указанный интервал и период.
    startDate: {
      type: Date,
    }
  }
}, {timestamps: true});

const Payment = mongoose.model('Payment', PaymentSchema);
module.exports = Payment;
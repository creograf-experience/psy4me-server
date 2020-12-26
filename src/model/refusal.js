const mongoose = require('mongoose');
const { Types } = mongoose.Schema;

/**
 * Отказ от психолога, клиента. Для статистики.
 * */
const RefusalSchema = new mongoose.Schema({
  client: {
    type: Types.ObjectId,
    ref: 'Client',
  },
  psych: {
    type: Types.ObjectId,
    ref: 'Psych',
  },
  // причина отказа
  reason: {
    type: String,
    default: ''
  },
  // клиент отказывается от психолога
  isClientRefuse: {
    type: Boolean,
    default: false
  },
  // психолог отказывается от клиента
  isPsychRefuse: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

const Refusal = mongoose.model('Refusal', RefusalSchema);
module.exports = Refusal;
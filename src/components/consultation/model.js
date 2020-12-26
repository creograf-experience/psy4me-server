const mongoose = require('mongoose');

const { Types } = mongoose.Schema;

const ConsultationSchema = new mongoose.Schema({
  psych: {
    type: Types.ObjectId,
    ref: 'Psych',
    required: true
  },

  client: {
    type: Types.ObjectId,
    ref: 'Client',
    required: true
  },

  date: {
    type: Number,
    required: true
  },

  durationInMinutes: {
    type: Number,
    required: true
  },

  rescheduleDate: Number,

  rescheduleByClient: {
    type: Boolean,
    default: false
  },

  rescheduleByPsych: {
    type: Boolean,
    default: false
  },

  // postponed = перенесено, canceled = отменено
  // assigned = назначено, consultation_took_place = прошла консультация
  status: {
    type: String,
    enum: ['Запланирована', 'Завершена', 'Перенесена', // выпилить
      'postponed', 'assigned', 'canceled',
      'client_do_not_come', 'psych_do_not_come',
      'consultation_took_place'],
    default: 'assigned'
  },

  clientRating: {
    psych: {
      type: Number,
      default: 0
    },
    connection: {
      type: Number,
      default: 0
    }
  },

  psychRating: {
    connection: {
      type: Number,
      default: 0
    },
  },
}, { timestamps: true });

ConsultationSchema.methods.rescheduleByClients = function(date) {
  this.rescheduleByClient = true;
  this.rescheduleByPsych = false;
  this.rescheduleDate = date;
}

ConsultationSchema.methods.rescheduleByPsychs = function(date) {
  this.rescheduleByPsych = true;
  this.rescheduleByClient = false;
  this.rescheduleDate = date;
}

ConsultationSchema.methods.acceptReschedule = function() {
  this.date = this.rescheduleDate;
  this.status = 'postponed';
  this.rescheduleDate = 0;
}

ConsultationSchema.methods.rateByClient = function(psych, connection) {
  this.clientRating = { psych, connection};
}

ConsultationSchema.methods.rateByPsych = function(connection) {
  this.psychRating = { connection };
}

const ConsultationModel = mongoose.model('Consultation', ConsultationSchema);
module.exports = ConsultationModel;

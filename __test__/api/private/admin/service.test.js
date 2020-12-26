const mongoose = require('mongoose');
const {describe, expect, it, afterEach, beforeAll, afterAll} = require("@jest/globals");

const {
  getAmountOfConsultations,
  getAmountOfRequestsFromClients,
  getAmountOfRefusalsFromPsychs,
  getAmountOfPostponedConsultations,
  getAmountOfRegisteredPsychologists,
} = require("src/api/private/admin/service");

const {psyches} = require("./mock-data/psych");
const {refusals} = require("./mock-data/refusal");
const {clients} = require("./mock-data/client-request");
const {consultations} = require("./mock-data/consultations");
const {consultations: postponed} = require("./mock-data/consultations-postponed");

const Consultation = require("src/components/consultation/model");
const {Psych, Refusal, Client} = require("src/model");

const REQUESTED_DATE = new Date('2020-02-17T03:24:00');
const DAYS_IN_MONTH = 29;

describe('testing charts for February 2020 (29 days)', () => {
  describe('amount of registered psychologists', () => {
    it('on the first day of month amount of registration equal to 4', async () => {
      await Psych.insertMany(psyches);
      const {data} = await getAmountOfRegisteredPsychologists(REQUESTED_DATE);

      expect(data[0]).toEqual(4);
    });
    it('the length of the data corresponds to the number of days in a month', async () => {
      await Psych.insertMany(psyches);
      const {data} = await getAmountOfRegisteredPsychologists(REQUESTED_DATE);

      expect(data.length).toEqual(DAYS_IN_MONTH);
    });
  })

  describe('amount of refusals from psychologists', () => {
    it('on the first day of month amount of refusals equal to 4', async () => {
      await Refusal.insertMany(refusals);
      const {data} = await getAmountOfRefusalsFromPsychs(REQUESTED_DATE);

      expect(data[0]).toEqual(4);
    });
    it('on the last day of month amount of refusals equal to 1', async () => {
      await Refusal.insertMany(refusals)
      const {data} = await getAmountOfRefusalsFromPsychs(REQUESTED_DATE);

      expect(data[DAYS_IN_MONTH - 1]).toEqual(1);
    });
    it('the length of the data corresponds to the number of days in a month', async () => {
      await Refusal.insertMany(refusals);
      const {data} = await getAmountOfRefusalsFromPsychs(REQUESTED_DATE);

      expect(data.length).toEqual(DAYS_IN_MONTH);
    });
  })

  describe('amount of requests', () => {
    it('on the first day of month amount of requests equal to 4', async () => {
      await Client.insertMany(clients);
      const {data} = await getAmountOfRequestsFromClients(REQUESTED_DATE);

      expect(data[0]).toEqual(4);
    })
    it('on the last day of month amount of requests equal to 1', async () => {
      await Client.insertMany(clients);
      const {data} = await getAmountOfRequestsFromClients(REQUESTED_DATE);

      expect(data[DAYS_IN_MONTH - 1]).toEqual(1)
    });
    it('the length of the data corresponds to the number of days in a month', async () => {
      await Client.insertMany(clients);
      const {data} = await getAmountOfRequestsFromClients(REQUESTED_DATE);

      expect(data.length).toEqual(DAYS_IN_MONTH);
    });
  })

  describe('amount of consultations', () => {
    it('on the first day of month amount of consultations equal to 4', async () => {
      await Consultation.insertMany(consultations);
      const {data} = await getAmountOfConsultations(REQUESTED_DATE);

      expect(data[0]).toEqual(4);
    })
    it('the length of the data corresponds to the number of days in a month', async () => {
      await Consultation.insertMany(consultations);
      const {data} = await getAmountOfConsultations(REQUESTED_DATE);

      expect(data.length).toEqual(DAYS_IN_MONTH);
    })
  })

  describe('amount of postponed consultations', () => {
    it('on the first day of month amount of postponed consultations equal to 4', async () => {
      await Consultation.insertMany(postponed);
      const {data} = await getAmountOfPostponedConsultations(REQUESTED_DATE);

      expect(data[0]).toEqual(4);
    })
    it('the length of the data corresponds to the number of days in a month', async () => {
      await Consultation.insertMany(postponed);
      const {data} = await getAmountOfPostponedConsultations(REQUESTED_DATE);

      expect(data.length).toEqual(DAYS_IN_MONTH);
    })
  })


  beforeAll(async () =>
    await mongoose.connect(global.__MONGO_URI__, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }, (err) => {
      if (err) {
        console.error(err);
        process.exit(1);
      }
    }));

  afterEach(async () => await removeAllCollections())

  afterAll(async () => await mongoose.disconnect())
});

async function removeAllCollections() {
  const collections = Object.keys(mongoose.connection.collections)
  for (const collectionName of collections) {
    const collection = mongoose.connection.collections[collectionName]
    await collection.deleteMany()
  }
}



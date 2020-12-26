const mongoose = require('mongoose');
const {Psych, Client} = require("src/model");
const {getByLangSchedulePrice, getMatchedPsyches} = require("../../../../src/api/private/client/service");
const {describe, expect, it, afterEach, beforeAll, afterAll} = require("@jest/globals");
const {client: client1, psyches: psyches1} = require("./mock-data/psych-client1");
const {client: client2, psyches: psyches2} = require("./mock-data/psych-client2");
const {client: client3, psyches: psyches3} = require("./mock-data/psych-client3");
const {client: client4, psyches: psyches4} = require("./mock-data/psych-client4");

describe('get matched psychs to given client', () => {

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

    it('get by lang, schedule, price; clients price lesser than 3000 per hour, russian lang', async () => {
        await Client.create(client1);
        await Psych.insertMany(psyches1)

        const result = await getByLangSchedulePrice(client1);
        expect(result.length).toEqual(1);
    });

    it('get by lang, schedule, price; only by thursday, russian lang', async () => {
        await Client.create(client2);
        await Psych.insertMany(psyches2)

        const result = await getByLangSchedulePrice(client2);
        expect(result.length).toEqual(1);
    });

    it('get by lang, schedule, price; client does not care about a price', async () => {
        await Client.create(client3);
        await Psych.insertMany(psyches3)

        const result = await getByLangSchedulePrice(client3);
        expect(result.length).toEqual(2);
    });

    it('get five matched psyches', async () => {
        await Client.create(client4);
        await Psych.insertMany(psyches4)

        const result = await getMatchedPsyches(client4);
        expect(result.length).toEqual(5);
    });
});

async function removeAllCollections() {
    const collections = Object.keys(mongoose.connection.collections)
    for (const collectionName of collections) {
        const collection = mongoose.connection.collections[collectionName]
        await collection.deleteMany()
    }
}

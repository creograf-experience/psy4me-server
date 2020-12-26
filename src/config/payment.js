const {ClientService, TaxationSystem} = require('cloudpayments');
require("dotenv").config();

const env = process.env;

const options = {
    privateKey: env.PRIVATE_KEY,
    publicId: env.PUBLIC_ID,
    org: {
        taxationSystem: TaxationSystem.GENERAL,
        inn: 123456789
    }
}

const payment = new ClientService(options);

module.exports = payment




const {getPayments} = require("./service");
const {response} = require('../../../constants');
const Payment = require('../payment');

exports.getPayments = async (req, res) => {
  try {
    const [count, payments] = await getPayments(req.body);

    res.body = response.OK();
    res.body.data = {
      totalCount: count,
      payments: payments
    }

    res.send(res.body);
  } catch (err) {
    console.error(err.message);
    return res.status(500).json(response.INTERNAL_ERROR());
  }
}

exports.addPayment = async (req, res) => {
  try {
    const {
      type,
      person,
      currency,
      paymentOption,
      paymentStatus,
      sum
    } = req.body;

    let result = {
      currency,
      paymentOption,
      paymentStatus,
      amount: sum
    };

    type === 'client' ? result.client = person : result.psych = person;

    await Payment.create(result)

    res.body = response.OK();
    res.send(res.body);
  } catch (err) {
    console.error(err.message);
    return res.status(500).json(response.INTERNAL_ERROR());
  }
}





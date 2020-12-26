const payment = require('../../../config/payment');
const {response} = require('../../../constants');
const Payment = require('../payment');

// единоразовый платёж
exports.pay = async (req, res) => {
  try {
    const {description, amount, currency, invoiceId, accountId, data} = req.body;

    await Payment.create({
      client: res.userId,
      description,
      amount,
      currency,
      invoiceId,
      accountId,
      paymentStatus: data.paymentStatus,
      paymentOption: data.paymentOption,
      receipt: data.receipt,
    });

    res.body = response.OK();
    res.send(res.body);
  } catch (err) {
    console.error(err.message);
    return res.status(500).json(response.INTERNAL_ERROR());
  }
}

// подписаться на услугу
exports.subscribe = async (req, res) => {

  try {
    const {description, amount, currency, invoiceId, accountId, data} = req.body;

    await Payment.create({
      client: res.userId,
      description,
      amount,
      currency,
      invoiceId,
      accountId,
      paymentStatus: data.paymentStatus,
      paymentOption: data.paymentOption,
      recurrent: data.recurrent,
      receipt: data.receipt,
      isSubscription: true,
      isActive: true
    });

    res.body = response.OK();
    res.send(res.body);
  } catch (err) {
    console.error(err.message);
    return res.status(500).json(response.INTERNAL_ERROR());
  }
}

// отписаться от услуги
exports.unsubscribe = async (req, res) => {
  try {
    const payed = await Payment.findOne({client: res.userId, isSubscription: true}) || {};

    const subscriptions = await payment
      .getClientApi()
      .getSubscriptionsList({accountId: payed.accountId});

    const subscription = subscriptions
      && subscriptions.response
      && subscriptions.response.Model
      && subscriptions.response.Model.filter(sub => sub.Status === "Active")[0] || {};

    const result = await payment
      .getClientApi()
      .cancelSubscription({Id: subscription.Id});

    if (result.success) {
      await Payment.findOneAndUpdate(
        {_id: payed._id},
        {isActive: false},
        {upsert: false})

      res.body = response.OK();
      res.send(res.body);
    } else {
      return res.send(response.DATA_ERROR());
    }
  } catch (err) {
    console.error(err.message);
    return res.status(500).json(response.INTERNAL_ERROR());
  }
}

// получить инфу по оплате
exports.getPaymentInfo = async (req, res) => {
  try {
    const payment = await Payment
      .find({ client: res.userId })
      res.body = response.OK();
      res.body.payment = payment;
    return res.send(res.body);
  } catch (err) {
    console.error(err);
    res.body = response.INTERNAL_ERROR();
    return res.send(res.body);
  }
};
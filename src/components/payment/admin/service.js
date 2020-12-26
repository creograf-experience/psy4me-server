const {paymentsResponse} = require("../../../dto/payments");
const Payment = require('../payment');

const getPayments = async ({
                             str,
                             type,
                             paymentStatus,
                             paymentOptions,
                             from,
                             to,
                             page = 0,
                             size = 5
                           } = {}) => {

  const filter = await getFilter({
    paymentStatus,
    paymentOptions,
    from,
    to,
  });

  const joinTable = await getJoinTable(type);

  const result = await Payment.aggregate([
    {$match: filter},
    {
      $lookup: {
        localField: joinTable.localField,
        from: joinTable.from,
        foreignField: "_id",
        as: "user"
      }
    },
    {$unwind: "$user"},
    {
      $match: {
        $or: [
          {"user.firstName": {$regex: str, $options: "i"}},
          {"user.middleName": {$regex: str, $options: "i"}},
          {"user.lastName": {$regex: str, $options: "i"}},
          {"user.email": {$regex: str, $options: "i"}},
          {"user.phone": {$regex: str, $options: "i"}},
        ]
      }
    },
    {$sort: {"createdAt":  -1}},
    {
      $group: {
        _id: null,
        total: {$sum: 1},
        arr: {
          $push: {
            _id: "$_id",
            createdAt: "$createdAt",
            amount: "$amount",
            paymentOption: "$paymentOption",
            paymentStatus: "$paymentStatus",
            currency: "$currency",
            user: {
              "firstName": "$user.firstName",
              "middleName": "$user.middleName",
              "lastName": "$user.lastName",
              "email": "$user.email",
              "phone": "$user.phone",
              "_id": "$user._id",
            }
          }
        }
      }
    },
    {
      $project: {
        count: "$total",
        payments: {
          $slice: ["$arr", ((page + 1) - 1) * size, size]
        }
      }
    }
  ])

  const payments = result && result.length !== 0 && result[0].payments || [];

  const paymentsResult = await paymentsResponse(payments);
  const countResult = result && result.length !== 0 && result[0].count || 0;

  return [countResult, paymentsResult];
}

const getJoinTable = async (type) => {
  return type === 'client' ? {
    localField: "client",
    from: "clients"
  } : {
    localField: "psych",
    from: "psyches"
  }
}

const getFilter = async ({
                           paymentOptions = [],
                           paymentStatus,
                           from,
                           to,
                         }) => {
  let filter = {
    createdAt: {
      $gte: new Date(from),
      $lte: new Date(to)
    }
  };

  if (paymentOptions.length !== 0) {
    const options = paymentOptions
      .filter(({checked}) => checked === true)
      .map(({name}) => name);

    if (options.length !== 0) {
      filter.paymentOption = {
        $in: options
      }
    }
  }

  if (paymentStatus) {
    filter.paymentStatus = paymentStatus;
  }

  return filter;
}

module.exports = {
  getPayments
}
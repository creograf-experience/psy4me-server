const paymentStatusConverter = (status = "") => {
  switch (status) {
    case "payed":
      return "Оплачено";
    case "canceled":
      return "Отменено";
    case "processed":
      return "В процессе";
    default:
      return status;
  }
}

const paymentResponse = async ({
                                 _id,
                                 description,
                                 user,
                                 amount,
                                 paymentOption,
                                 paymentStatus,
                                 currency,
                                 createdAt
                               } = {}) => {
  return {
    _id,
    date: new Date(createdAt).toISOString().slice(0, 16).replace('T', ' '),
    clientId: user && user._id,
    firstName: user && user.firstName,
    lastName: user && user.lastName,
    middleName: user && user.middleName,
    contact: `${user && user.email} ${user && user.phone}`,
    sum: `${amount} ${currency}`,
    paymentStatus: paymentStatusConverter(paymentStatus),
    amountInHours: ""
  }
}

const paymentsResponse = async (arr = []) =>
  await Promise.all(arr.map(async (el) => await paymentResponse(el)));


module.exports = {
  paymentResponse,
  paymentsResponse
}
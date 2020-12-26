const consultationResponse = async ({
                                      _id,
                                      clientRating = {},
                                      psychRating = {},
                                      status,
                                      psych,
                                      client,
                                      date,
                                      rescheduleDate,
                                      durationInMinutes
                                    } = {}) => {
  const rateAndComment = `psych rate: ${psychRating.connection}, client rate: ${clientRating.connection}`;
  const dateAndTimeFormat = new Date(date).toISOString().slice(0, 16);

  return {
    _id,
    dateAndTime: dateAndTimeFormat,
    psych: {
      psychId: psych && psych._id,
      name: psych && psych.lastName
    },
    client: {
      clientId: client && client._id,
      name: client && client.lastName
    },
    sum: "",
    duration: durationInMinutes,
    status,
    rateAndComment: rateAndComment
  }
};

const consultationsResponse = async (arr = []) => {
  return await Promise.all(arr.map(async (el) => await consultationResponse(el)));
};

module.exports = {
  consultationResponse,
  consultationsResponse
};
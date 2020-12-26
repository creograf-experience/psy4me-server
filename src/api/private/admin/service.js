const ConsultationModel = require("../../../components/consultation/model");
const {Psych, Refusal, Client} = require("../../../model");

const getCharts = async (period) => {
  const date = getDate(period);

  return {
    charts: [
      await getAmountOfConsultations(date),
      await getAmountOfRequestsFromClients(date),
      await getAmountOfRefusalsFromPsychs(date),
      await getAmountOfPostponedConsultations(date),
      await getAmountOfRegisteredPsychologists(date),
    ]
  };
}

/**
 * Amount of requests, completed questionnaires for the selection of a psychologist.
 *
 * @param period (date as string)
 * @returns {Promise<{data: *, title: string, labels: *}>}
 */
const getAmountOfRequestsFromClients = async (period) => {
  const AMOUNT_OF_REQUESTS_TITLE = "Количество заявок";

  const amountOfDaysInMonth = await getAmountOfDaysInMonth(period);

  let filter = {
    "requests.date": {
      $gte: getStartOfMonth(period),
      $lte: getEndOfMonth(period),
    },
  };

  const queryResult = await Client.aggregate([
    {
      $unwind: "$requests"
    },
    {
      $match: filter
    },
    {
      $group: {
        _id: {$dateToString: {format: "%d", date: "$requests.date"}},
        count: {$sum: 1}
      }
    },
    pipeSort,
    pipeProject,
    pipeGroup,
    pipeProjectStatistics(amountOfDaysInMonth),
    pipeUnwind,
    pipeReplaceRoot
  ])

  return {
    title: AMOUNT_OF_REQUESTS_TITLE,
    labels: getLabels(amountOfDaysInMonth),
    data: extractChartData(queryResult)
  }
}

/**
 * Amount of refusals from psychologists per day within period of time.
 *
 * @param period (date as string)
 * @returns {Promise<{data: *, title: string, labels: number[]}>}
 */
const getAmountOfRefusalsFromPsychs = async (period) => {
  const AMOUNT_OF_REFUSALS_FROM_PSYCHS_TITLE = "Количество отказов от психологов";

  const amountOfDaysInMonth = await getAmountOfDaysInMonth(period);

  let filter = {
    createdAt: {
      $gte: getStartOfMonth(period),
      $lte: getEndOfMonth(period),
    },
    isClientRefuse: true
  };

  const queryResult = await Refusal.aggregate([
    {
      $match: filter
    },
    {
      $group: {
        _id: {$dateToString: {format: "%d", date: "$createdAt"}},
        count: {$sum: 1}
      }
    },
    pipeSort,
    pipeProject,
    pipeGroup,
    pipeProjectStatistics(amountOfDaysInMonth),
    pipeUnwind,
    pipeReplaceRoot
  ])

  return {
    title: AMOUNT_OF_REFUSALS_FROM_PSYCHS_TITLE,
    labels: getLabels(amountOfDaysInMonth),
    data: extractChartData(queryResult)
  }
}

/**
 * Amount of psychologists registered per day within period of time.
 *
 * @param period (date as string)
 * @returns {Promise<{data: *, title: string, labels: number[]}>}
 */
const getAmountOfRegisteredPsychologists = async (period) => {
  const AMOUNT_OF_REGISTERED_PSYCHOLOGISTS_TITLE = "Количество зарегистрированных психологов";

  const amountOfDaysInMonth = await getAmountOfDaysInMonth(period);

  let filter = {
    createdAt: {
      $gte: getStartOfMonth(period),
      $lte: getEndOfMonth(period)
    }
  };

  const queryResult = await Psych.aggregate([
    {
      $match: filter
    },
    {
      $group: {
        _id: {$dateToString: {format: "%d", date: "$createdAt"}},
        count: {$sum: 1}
      }
    },
    pipeSort,
    pipeProject,
    pipeGroup,
    pipeProjectStatistics(amountOfDaysInMonth),
    pipeUnwind,
    pipeReplaceRoot
  ])

  return {
    title: AMOUNT_OF_REGISTERED_PSYCHOLOGISTS_TITLE,
    labels: getLabels(amountOfDaysInMonth),
    data: extractChartData(queryResult)
  }
}

/**
 * Amount of postponed consultations per day within period of time.
 *
 * @param period (date as string)
 * @returns {Promise<{data: *, title: string, labels: number[]}>}
 */
const getAmountOfPostponedConsultations = async (period) => {
  const AMOUNT_OF_POSTPONED_CONSULTATION_TITLE = "Количество переносов консультаций";

  const amountOfDaysInMonth = await getAmountOfDaysInMonth(period);

  let filter = {
    date: {
      $gte: getStartOfMonth(period).getTime(),
      $lt: getEndOfMonth(period).getTime()
    },
    status: "postponed"
  };

  const queryResult = await ConsultationModel.aggregate([
    {
      $match: filter
    },
    {
      $project: {
        day: {$add: [new Date("1970-01-01"), "$date"]},
      }
    },
    {
      $group: {
        _id: {$dateToString: {format: "%d", date: "$day"}},
        count: {$sum: 1},
      }
    },
    pipeSort,
    pipeProject,
    pipeGroup,
    pipeProjectStatistics(amountOfDaysInMonth),
    pipeUnwind,
    pipeReplaceRoot
  ]);

  return {
    title: AMOUNT_OF_POSTPONED_CONSULTATION_TITLE,
    labels: getLabels(amountOfDaysInMonth),
    data: extractChartData(queryResult)
  }
}


/**
 * Amount of consultation per day within period of time (month)
 *
 * @param period (date as string)
 * @returns {Promise<{data: *, title: string, labels: number[]}>}
 */
const getAmountOfConsultations = async (period) => {
  const AMOUNT_OF_CONSULTATION_TITLE = "Количество консультаций";

  const amountOfDaysInMonth = await getAmountOfDaysInMonth(period);

  let filter = {
    date: {
      $gte: getStartOfMonth(period).getTime(),
      $lt: getEndOfMonth(period).getTime()
    }
  };

  const queryResult = await ConsultationModel.aggregate([
    {
      $match: filter
    },
    {
      $project: {
        _id: {$add: [new Date("1970-01-01"), "$date"]},
      }
    },
    {
      $group: {
        _id: {$dateToString: {format: "%d", date: "$_id"}},
        count: {$sum: 1}
      }
    },
    pipeSort,
    pipeProject,
    pipeGroup,
    pipeProjectStatistics(amountOfDaysInMonth),
    pipeUnwind,
    pipeReplaceRoot
  ]);

  return {
    title: AMOUNT_OF_CONSULTATION_TITLE,
    labels: getLabels(amountOfDaysInMonth),
    data: extractChartData(queryResult)
  }
}

// common aggregation pipes
const pipeSort = {
  $sort: {
    _id: 1
  }
};

const pipeProject = {
  $project: {
    day: "$_id",
    count: "$count"
  }
};

const pipeGroup = {
  $group: {
    _id: null,
    stats: {
      $push: "$$ROOT"
    }
  }
};

const pipeProjectStatistics = (amountOfDaysInMonth) => {
  return {
    $project: {
      stats: {
        $map: {
          input: formatInput(amountOfDaysInMonth),
          as: "day",
          in: {
            $let: {
              vars: {dayIndex: {"$indexOfArray": ["$stats._id", "$$day"]}},
              in: {
                $cond: {
                  if: {$ne: ["$$dayIndex", -1]},
                  then: {$arrayElemAt: ["$stats", "$$dayIndex"]},
                  else: {_id: "$$day", day: "$$day", count: 0}
                }
              }
            }
          }
        }
      }
    }
  };
};

const pipeUnwind = {
  $unwind: "$stats"
};
const pipeReplaceRoot = {
  $replaceRoot: {
    newRoot: "$stats"
  }
};
// -- //

const extractChartData = (arr = []) => arr.map(it => it.count);

const formatInput = (num) => [...Array(num).keys()].map(x => String("00" + ++x).slice(-2));

const getLabels = (num) => [...Array(num).keys()].map(x => ++x);

const getStartOfMonth = (date) =>
  new Date(date.getFullYear(), date.getMonth(), 1, 1, 0, 0);

const getEndOfMonth = (date) =>
  new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);

const getAmountOfDaysInMonth = async (date) =>
  new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

const getDate = (period) => {
  if (!period) {
    throw new Error(`Period must be provided`)
  }

  return new Date(period);
}


module.exports = {
  getCharts,
  getAmountOfConsultations,
  getAmountOfRequestsFromClients,
  getAmountOfRefusalsFromPsychs,
  getAmountOfPostponedConsultations,
  getAmountOfRegisteredPsychologists
}


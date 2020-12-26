const {Psych} = require('../../../model');

const SIMILARITY_KEY = "similarity";
const DEFAULT_LANG = "Русский"
const DEFAULT_AMOUNT_OF_PSYCHES = 5;

// фильтрация по языку и
// по удобному для работу времени
const getByLangSchedulePrice = async (client) => {
    const {language, schedule = [], priceObject} = client;

    const clientWeekDays = schedule.map(el => el.weekDay);
    const clientPrice = extractPrice(priceObject);

    let filtered = await Psych.find({
        language: language,
        "schedule.weekDay": {
            $in: clientWeekDays
        }
    });

    filtered = (filtered.length === 0
        ? await Psych.find({language: DEFAULT_LANG})
        : filtered) || [];

    // по цене, клиент выбирает варианты почасовой оплаты
    // пока что priceObject клиента в формате: "3000 р / час"
    if (clientPrice) {
        filtered = await filterByPrice(clientPrice, filtered);
    }

    return filtered;
}

// фильтрация по troubles, depression
// возможно нужно по consultingObject, но у психов и клиентов это разные понятия
const getMatchedPsyches = async (client = {}, count = DEFAULT_AMOUNT_OF_PSYCHES) => {
    const psyches = await getByLangSchedulePrice(client) || [];

    const clientEvaluation = await makeEvaluationObj(client, subjects);

    let psychesEvaluation = await Promise.all(psyches.map(async psych => {
        const psychEvaluation = await makeEvaluationObj(psych, subjects);

        return await getWithSimilarity(clientEvaluation, psychEvaluation, subjects);
    })) || [];

    psychesEvaluation.sort(compareSimilarity);

    return psychesEvaluation.slice(0, count).map(({originObject}) => originObject);
}

/**
 * Get similarity between client and psychologist.
 * A psych gets new key 'similarity'.
 * The higher the 'similarity', the more suitable to client
 *
 * @param source client
 * @param target psychologist
 * @param subjects troubles
 * @returns {Promise<*>}
 */
const getWithSimilarity = async (source, target, subjects = []) => {
    let sumSquares = 0;

    for await (let subject of subjects) {
        const sourceEvaluation = source[subject];
        const targetEvaluation = target[subject];

        let diff = sourceEvaluation - targetEvaluation;
        sumSquares += diff * diff;
    }

    target[SIMILARITY_KEY] = 1 / (1 + Math.sqrt(sumSquares));

    return target
}

/**
 * Create an object with the keys necessary for evaluation.
 * @example
 * {
 *     _id: 5eee0ec0f712470b535e0e62,
 *     originObject: {
 *          _id: 5eee0ec0f712470b535e0e62
 *          "firstName": "Test1",
 *          "lastName": "психолог",
 *          "middleName": "Сереевна",
 *          ...
 *     },
 *     "Страхи, панические атаки": 0,
 *     "Проблемы в отношениях с партнером": 0,
 *     "Психоматика, хронические боли": 1,
 *     "Не получается разобраться в себе, понять свои желания": 1,
 *     "Сексуальные проблемы": 0,
 *     ...
 * }
 *
 * @param obj clint or psych
 * @param subjects troubles
 * @returns {Promise<{}>}
 */
const makeEvaluationObj = async (obj = {}, subjects = []) => {
    let result = {};

    result._id = obj._id;
    result.originObject = obj;

    let arrTroubles = obj.troubles || [];

    if (obj.depression === true) {
        arrTroubles.push("depression")
    }

    for await (let subject of subjects) {
        if (arrTroubles.includes(subject)) {
            result[subject] = 1
        } else {
            result[subject] = 0
        }
    }

    return result;
}

const compareSimilarity = (a, b) => {
    return b.similarity - a.similarity;
}

const filterByPrice = async (clientPrice, psyches = []) => {
    let filterByPriceResult = [];

    let filterByPrice = [];
    if (clientPrice) {
        filterByPrice = psyches.filter(psych =>
            !psych.priceClient60 || clientPrice >= psych.priceClient60)

        filterByPriceResult = filterByPrice.length === 0 ? psyches : filterByPrice;
    } else {
        filterByPriceResult = psyches
    }
    return filterByPriceResult;
}

const extractPrice = (str = "") => {
    return (str
        .replace(/\s/g, "")
        .match(/\d+/) || [])
        .pop();
}

const subjects = [
    "Страхи, панические атаки",
    "Проблемы в отношениях с партнером",
    "Психоматика, хронические боли",
    "Не получается разобраться в себе, понять свои желания",
    "Сексуальные проблемы",
    "Детско-родительские отношения",
    "Психологическая травма, связанная с психилогическим или физическим насилием",
    "Развод, потеря близкого человека",
    "Обессивно-компульсивное расстройство, вегетососудистая дистония",
    "Недостаток уверенности в собственных силах",
    "Ограничивающие убеждения, мешающие развитию бизнеса или продвижению на работе",
    "ЛГБТ",
    "Деструктивные отношения, абьюз",
    "depression"
]

module.exports = {
    getByLangSchedulePrice,
    getMatchedPsyches
}

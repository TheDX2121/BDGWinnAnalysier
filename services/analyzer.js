const Event = require("../models/Event");
const PatternStat = require("../models/PatternStat");
const Outcome = require("../models/Outcome");

const { getSize } =
  require("../utils/classifier");

async function updatePatternStat(
  datasetId,
  first,
  second,
  next,
  resultType
) {
  let stat =
    await PatternStat.findOne({
      datasetId,
      first,
      second
    });

  if (!stat) {
    stat = new PatternStat({
      datasetId,
      first,
      second
    });
  }

  // Every real occurrence counts.
  stat.total += 1;

  if (resultType === "Big") {
    stat.bigCount += 1;
  } else {
    stat.smallCount += 1;
  }

  const existingNumber =
    stat.nextNumbers.find(
      item => item.number === next
    );

  if (existingNumber) {
    existingNumber.count += 1;
  } else {
    stat.nextNumbers.push({
      number: next,
      count: 1
    });
  }

  stat.bigPercent =
    Number(
      (
        (stat.bigCount / stat.total) *
        100
      ).toFixed(2)
    );

  stat.smallPercent =
    Number(
      (
        (stat.smallCount / stat.total) *
        100
      ).toFixed(2)
    );

  await stat.save();

  return stat;
}

async function processNewOutcome(
  datasetId,
  outcome
) {
  const previousTwo =
    await Outcome.find({
      datasetId,
      sequence: {
        $lt: outcome.sequence
      }
    })
      .sort({
        sequence: -1
      })
      .limit(2);

  if (previousTwo.length < 2) {
    return {
      event: null,
      stat: null
    };
  }

  const first =
    previousTwo[1].number;

  const second =
    previousTwo[0].number;

  const next =
    outcome.number;

  const resultType =
    getSize(next);

  /*
    IMPORTANT:

    Same A-B-C appearing later is NOT
    considered a duplicate.

    Example:

    9-8 → 1
    9-8 → 1

    Both are counted.
  */

  const event =
    await Event.create({
      datasetId,
      first,
      second,
      next,
      resultType,
      sequence: outcome.sequence
    });

  const stat =
    await updatePatternStat(
      datasetId,
      first,
      second,
      next,
      resultType
    );

  return {
    event,
    stat
  };
}

module.exports = {
  processNewOutcome,
  updatePatternStat
};
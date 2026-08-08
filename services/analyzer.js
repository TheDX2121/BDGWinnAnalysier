const Event = require("../models/Event");
const PatternStat = require("../models/PatternStat");
const Outcome = require("../models/Outcome");

const { getSize } = require("../utils/classifier");

async function updatePatternStat(
  datasetId,
  first,
  second,
  resultType
) {
  const increment = {
    total: 1
  };

  if (resultType === "Big") {
    increment.bigCount = 1;
  } else {
    increment.smallCount = 1;
  }

  const stat = await PatternStat.findOneAndUpdate(
    {
      datasetId,
      first,
      second
    },
    {
      $inc: increment
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true
    }
  );

  stat.bigPercent =
    stat.total > 0
      ? Number(
          (
            (stat.bigCount / stat.total) *
            100
          ).toFixed(2)
        )
      : 0;

  stat.smallPercent =
    stat.total > 0
      ? Number(
          (
            (stat.smallCount / stat.total) *
            100
          ).toFixed(2)
        )
      : 0;

  await stat.save();

  return stat;
}

/*
  Process ONLY newly created outcomes.

  If previous outcomes are:

  9, 8

  and new outcome:

  1

  event:

  9,8 -> 1

  Next new outcome:

  9

  event:

  8,1 -> 9
*/

async function processNewOutcome(
  datasetId,
  outcome
) {
  const previousTwo = await Outcome.find({
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

  const first = previousTwo[1].number;
  const second = previousTwo[0].number;
  const next = outcome.number;

  const resultType = getSize(next);

  const event = await Event.create({
    datasetId,
    first,
    second,
    next,
    resultType,
    sequence: outcome.sequence
  });

  const stat = await updatePatternStat(
    datasetId,
    first,
    second,
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
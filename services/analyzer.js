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

  /*
    First time this A-B pattern appears
  */

  if (!stat) {
    stat = new PatternStat({
      datasetId,
      first,
      second,
      total: 0,
      bigCount: 0,
      smallCount: 0,
      bigPercent: 0,
      smallPercent: 0,
      nextNumbers: []
    });
  }

  /*
    Every REAL occurrence counts.
  */

  stat.total += 1;

  if (resultType === "Big") {
    stat.bigCount += 1;
  } else {
    stat.smallCount += 1;
  }

  /*
    Exact C number counting
  */

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

  /*
    Percentages
  */

  stat.bigPercent =
    stat.total > 0
      ? Number(
          (
            (stat.bigCount /
              stat.total) *
            100
          ).toFixed(2)
        )
      : 0;

  stat.smallPercent =
    stat.total > 0
      ? Number(
          (
            (stat.smallCount /
              stat.total) *
            100
          ).toFixed(2)
        )
      : 0;

  await stat.save();

  return stat;
}


/*
  Process ONE newly added outcome.

  Example:

  Previous:
  9, 8

  New:
  1

  Result:

  9-8 → 1
*/

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


  /*
    First two outcomes don't create
    a pattern yet.
  */

  if (previousTwo.length < 2) {

    return {
      event: null,
      stat: null
    };

  }


  /*
    Because query is descending:

    previousTwo[0] = immediately previous
    previousTwo[1] = one before that
  */

  const first =
    previousTwo[1].number;

  const second =
    previousTwo[0].number;

  const next =
    outcome.number;


  /*
    Convert C into Big / Small
  */

  const resultType =
    getSize(next);


  /*
    IMPORTANT:

    Every NEW actual outcome creates
    a NEW event.

    We are NOT checking whether
    the same A-B-C happened before.

    So:

    9-8 → 1
    9-8 → 1

    = 2 separate observations.
  */

  const event =
    await Event.create({
      datasetId,

      first,
      second,
      next,

      resultType,

      sequence:
        outcome.sequence
    });


  /*
    Update aggregate statistics.
  */

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
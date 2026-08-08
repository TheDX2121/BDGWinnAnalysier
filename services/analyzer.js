const Event =
  require("../models/Event");

const PatternStat =
  require("../models/PatternStat");

const Outcome =
  require("../models/Outcome");

const {
  getSize
} = require("../utils/classifier");


// =====================================================
// UPDATE PATTERN STAT
// =====================================================

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

    stat =
      new PatternStat({
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


  // Every real occurrence counts.

  stat.total += 1;


  if (
    resultType === "Big"
  ) {

    stat.bigCount += 1;

  } else {

    stat.smallCount += 1;
  }


  // -------------------------------------------------
  // Record actual next number
  // -------------------------------------------------

  const existingNumber =
    stat.nextNumbers.find(
      item =>
        item.number === next
    );


  if (existingNumber) {

    existingNumber.count += 1;

  } else {

    stat.nextNumbers.push({
      number: next,
      count: 1
    });
  }


  // -------------------------------------------------
  // Percentages
  // -------------------------------------------------

  if (stat.total > 0) {

    stat.bigPercent =
      Number(
        (
          (
            stat.bigCount /
            stat.total
          ) * 100
        ).toFixed(2)
      );


    stat.smallPercent =
      Number(
        (
          (
            stat.smallCount /
            stat.total
          ) * 100
        ).toFixed(2)
      );
  }


  await stat.save();


  return stat;
}


// =====================================================
// PROCESS ONE NEW OUTCOME
// =====================================================

async function processNewOutcome(
  datasetId,
  outcome
) {

  const previousTwo =
    await Outcome.find({
      datasetId,

      sequence: {
        $lt:
          outcome.sequence
      }
    })
      .sort({
        sequence: -1
      })
      .limit(2);


  // Need two previous outcomes.

  if (
    previousTwo.length < 2
  ) {

    return {
      event: null,
      stat: null
    };
  }


  // Because query is descending:
  //
  // previousTwo[0] = immediate previous
  // previousTwo[1] = two positions back

  const first =
    previousTwo[1].number;

  const second =
    previousTwo[0].number;

  const next =
    outcome.number;


  const resultType =
    getSize(next);


  // -------------------------------------------------
  // Every occurrence creates a new event.
  //
  // Duplicate A-B-C later is NOT ignored.
  // -------------------------------------------------

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


// =====================================================
// REBUILD COMPLETE DATASET
// =====================================================

async function rebuildDataset(
  datasetId
) {

  // Clear old calculated data.

  await Event.deleteMany({
    datasetId
  });


  await PatternStat.deleteMany({
    datasetId
  });


  const outcomes =
    await Outcome.find({
      datasetId
    })
      .sort({
        sequence: 1
      });


  // Recalculate every A-B-C.

  for (
    const outcome of outcomes
  ) {

    await processNewOutcome(
      datasetId,
      outcome
    );
  }


  return {
    success: true,

    processed:
      outcomes.length
  };
}


module.exports = {

  processNewOutcome,

  updatePatternStat,

  rebuildDataset
};
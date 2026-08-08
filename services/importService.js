const Outcome = require("../models/Outcome");
const Sequence = require("../models/Sequence");

const { getSize } =
  require("../utils/classifier");

const {
  processNewOutcome
} = require("./analyzer");

function findOverlap(
  existing,
  incoming
) {
  const maxLength =
    Math.min(
      existing.length,
      incoming.length
    );

  for (
    let length = maxLength;
    length > 0;
    length--
  ) {
    const existingPart =
      existing.slice(
        existing.length - length
      );

    const incomingPart =
      incoming.slice(
        0,
        length
      );

    const same =
      existingPart.every(
        (value, index) =>
          value === incomingPart[index]
      );

    if (same) {
      return length;
    }
  }

  return 0;
}

async function importOutcomes(
  datasetId,
  numbers
) {
  const existing =
    await Outcome.find({
      datasetId
    })
      .sort({
        sequence: 1
      })
      .select(
        "number sequence"
      );

  const existingNumbers =
    existing.map(
      item => item.number
    );

  const overlap =
    findOverlap(
      existingNumbers,
      numbers
    );

  const newNumbers =
    numbers.slice(overlap);

  if (newNumbers.length === 0) {
    return {
      imported: 0,
      skipped: numbers.length,
      overlap,
      results: []
    };
  }

  let sequence =
    await Sequence.findOne({
      datasetId
    });

  if (!sequence) {
    sequence =
      await Sequence.create({
        datasetId,
        nextSequence:
          existing.length + 1
      });
  }

  const results = [];

  for (const number of newNumbers) {
    const outcome =
      await Outcome.create({
        datasetId,

        sequence:
          sequence.nextSequence,

        number,

        size:
          getSize(number)
      });

    sequence.nextSequence += 1;

    const analysis =
      await processNewOutcome(
        datasetId,
        outcome
      );

    results.push({
      outcome,
      event:
        analysis.event,
      stat:
        analysis.stat
    });
  }

  await sequence.save();

  return {
    imported:
      newNumbers.length,

    skipped:
      overlap,

    overlap,

    results
  };
}

module.exports = {
  findOverlap,
  importOutcomes
};
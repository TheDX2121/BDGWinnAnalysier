const express = require("express");

const Dataset = require("../models/Dataset");
const Outcome = require("../models/Outcome");
const Sequence = require("../models/Sequence");

const authMiddleware = require("../middleware/auth");
const { getSize } = require("../utils/classifier");
const { validateNumbers } = require("../utils/validation");
const { processNewOutcome } = require("../services/analyzer");

const router = express.Router();

router.use(authMiddleware);

async function getOwnedDataset(
  datasetId,
  userId
) {
  return Dataset.findOne({
    _id: datasetId,
    userId
  });
}

/*
  POST /api/outcomes/:datasetId

  Body:

  {
    "numbers": [9, 8, 1, 9]
  }
*/

router.post("/:datasetId", async (req, res) => {
  try {
    const { datasetId } = req.params;
    const { numbers } = req.body;

    const validation = validateNumbers(numbers);

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.message
      });
    }

    const dataset = await getOwnedDataset(
      datasetId,
      req.user.userId
    );

    if (!dataset) {
      return res.status(404).json({
        success: false,
        message: "Dataset not found."
      });
    }

    let sequence = await Sequence.findOne({
      datasetId
    });

    if (!sequence) {
      sequence = await Sequence.create({
        datasetId,
        nextSequence: 1
      });
    }

    const created = [];

    for (const number of numbers) {
      const outcome = await Outcome.create({
        datasetId,
        sequence: sequence.nextSequence,
        number,
        size: getSize(number)
      });

      sequence.nextSequence++;

      const analysis =
        await processNewOutcome(
          datasetId,
          outcome
        );

      created.push({
        outcome,
        event: analysis.event,
        stat: analysis.stat
      });
    }

    await sequence.save();

    res.status(201).json({
      success: true,
      added: created.length,
      results: created
    });
  } catch (error) {
    console.error("Outcome error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to process outcomes."
    });
  }
});

/*
  GET /api/outcomes/:datasetId
*/

router.get("/:datasetId", async (req, res) => {
  try {
    const dataset = await getOwnedDataset(
      req.params.datasetId,
      req.user.userId
    );

    if (!dataset) {
      return res.status(404).json({
        success: false,
        message: "Dataset not found."
      });
    }

    const outcomes = await Outcome.find({
      datasetId: dataset._id
    }).sort({
      sequence: 1
    });

    res.json({
      success: true,
      outcomes
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Unable to load outcomes."
    });
  }
});

module.exports = router;
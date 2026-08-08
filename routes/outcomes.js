const express = require("express");

const Dataset = require("../models/Dataset");
const Outcome = require("../models/Outcome");

const authMiddleware = require("../middleware/auth");
const { processEvents } = require("../services/analyzer");
const { getSize } = require("../utils/classifier");
const { validateNumbers } = require("../utils/validation");

const router = express.Router();

router.use(authMiddleware);

/*
  POST
  /api/outcomes/:datasetId
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

    const dataset = await Dataset.findOne({
      _id: datasetId,
      userId: req.user.userId
    });

    if (!dataset) {
      return res.status(404).json({
        success: false,
        message: "Dataset not found."
      });
    }

    const lastOutcome = await Outcome.findOne({
      datasetId
    }).sort({
      sequence: -1
    });

    let nextSequence =
      lastOutcome
        ? lastOutcome.sequence + 1
        : 1;

    const outcomeDocuments = numbers.map(number => {
      const document = {
        datasetId,
        sequence: nextSequence,
        number,
        size: getSize(number)
      };

      nextSequence++;

      return document;
    });

    await Outcome.insertMany(outcomeDocuments);

    const result = await processEvents(
      datasetId,
      numbers
    );

    res.status(201).json({
      success: true,
      outcomesAdded: outcomeDocuments.length,
      eventsCreated: result.events.length,
      statsUpdated: result.stats.length
    });

  } catch (error) {
    console.error("Outcome processing error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to process outcomes."
    });
  }
});

/*
  GET
  /api/outcomes/:datasetId
*/

router.get("/:datasetId", async (req, res) => {
  try {
    const { datasetId } = req.params;

    const dataset = await Dataset.findOne({
      _id: datasetId,
      userId: req.user.userId
    });

    if (!dataset) {
      return res.status(404).json({
        success: false,
        message: "Dataset not found."
      });
    }

    const outcomes = await Outcome.find({
      datasetId
    }).sort({
      sequence: 1
    });

    res.json({
      success: true,
      outcomes
    });

  } catch (error) {
    console.error("Get outcomes error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to load outcomes."
    });
  }
});

module.exports = router;
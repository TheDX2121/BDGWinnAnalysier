const express = require("express");

const Dataset =
  require("../models/Dataset");

const PatternStat =
  require("../models/PatternStat");

const Event =
  require("../models/Event");

const auth =
  require("../middleware/auth");

const router = express.Router();

router.use(auth);

async function ownedDataset(
  datasetId,
  userId
) {
  return Dataset.findOne({
    _id: datasetId,
    userId
  });
}

/*
  GET ALL 100 PATTERNS
*/

router.get(
  "/:datasetId/patterns",
  async (req, res) => {
    try {
      const dataset =
        await ownedDataset(
          req.params.datasetId,
          req.user.userId
        );

      if (!dataset) {
        return res.status(404).json({
          success: false,
          message:
            "Dataset not found."
        });
      }

      const stats =
        await PatternStat.find({
          datasetId:
            dataset._id
        }).sort({
          first: 1,
          second: 1
        });

      res.json({
        success: true,
        stats
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false,
        message:
          "Unable to load statistics."
      });
    }
  }
);

/*
  GET ONE PATTERN

  /api/analysis/:datasetId/pattern/9/8
*/

router.get(
  "/:datasetId/pattern/:first/:second",
  async (req, res) => {
    try {
      const {
        datasetId,
        first,
        second
      } = req.params;

      const dataset =
        await ownedDataset(
          datasetId,
          req.user.userId
        );

      if (!dataset) {
        return res.status(404).json({
          success: false,
          message:
            "Dataset not found."
        });
      }

      const firstNumber =
        Number(first);

      const secondNumber =
        Number(second);

      if (
        !Number.isInteger(
          firstNumber
        ) ||
        !Number.isInteger(
          secondNumber
        ) ||
        firstNumber < 0 ||
        firstNumber > 9 ||
        secondNumber < 0 ||
        secondNumber > 9
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Pattern must be between 0-0 and 9-9."
        });
      }

      const stat =
        await PatternStat.findOne({
          datasetId,
          first:
            firstNumber,
          second:
            secondNumber
        });

      const events =
        await Event.find({
          datasetId,
          first:
            firstNumber,
          second:
            secondNumber
        }).sort({
          sequence: 1
        });

      res.json({
        success: true,

        pattern: {
          first:
            firstNumber,

          second:
            secondNumber
        },

        stats:
          stat || {
            total: 0,
            bigCount: 0,
            smallCount: 0,
            bigPercent: 0,
            smallPercent: 0,
            nextNumbers: []
          },

        events
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false,
        message:
          "Unable to load pattern."
      });
    }
  }
);

module.exports = router;
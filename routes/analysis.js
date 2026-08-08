const express = require("express");

const Dataset = require("../models/Dataset");
const PatternStat = require("../models/PatternStat");
const Event = require("../models/Event");

const authMiddleware = require("../middleware/auth");

const router = express.Router();

router.use(authMiddleware);

async function ownsDataset(
  datasetId,
  userId
) {
  return Dataset.findOne({
    _id: datasetId,
    userId
  });
}

/*
  All 100 patterns
*/

router.get(
  "/:datasetId/patterns",
  async (req, res) => {
    try {
      const dataset = await ownsDataset(
        req.params.datasetId,
        req.user.userId
      );

      if (!dataset) {
        return res.status(404).json({
          success: false,
          message: "Dataset not found."
        });
      }

      const stats = await PatternStat.find({
        datasetId: dataset._id
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
        message: "Unable to load statistics."
      });
    }
  }
);

/*
  Specific pattern

  /api/analysis/DATASET_ID/pattern/9/8
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

      const dataset = await ownsDataset(
        datasetId,
        req.user.userId
      );

      if (!dataset) {
        return res.status(404).json({
          success: false,
          message: "Dataset not found."
        });
      }

      const stat = await PatternStat.findOne({
        datasetId,
        first: Number(first),
        second: Number(second)
      });

      const events = await Event.find({
        datasetId,
        first: Number(first),
        second: Number(second)
      }).sort({
        sequence: 1
      });

      res.json({
        success: true,

        pattern: {
          first: Number(first),
          second: Number(second)
        },

        stats: stat || {
          total: 0,
          bigCount: 0,
          smallCount: 0,
          bigPercent: 0,
          smallPercent: 0
        },

        events
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false,
        message: "Unable to load pattern."
      });
    }
  }
);

module.exports = router;
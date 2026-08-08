const express = require("express");

const Dataset = require("../models/Dataset");
const PatternStat = require("../models/PatternStat");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

router.use(authMiddleware);

/*
  GET
  /api/analysis/:datasetId/patterns
*/

router.get("/:datasetId/patterns", async (req, res) => {
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

    const stats = await PatternStat.find({
      datasetId
    }).sort({
      first: 1,
      second: 1
    });

    res.json({
      success: true,
      datasetId,
      stats
    });

  } catch (error) {
    console.error("Pattern statistics error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to load pattern statistics."
    });
  }
});

/*
  GET
  /api/analysis/:datasetId/pattern/:first/:second
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

      const stat = await PatternStat.findOne({
        datasetId,
        first: Number(first),
        second: Number(second)
      });

      res.json({
        success: true,
        pattern: `${first}-${second}`,
        stats: stat || {
          total: 0,
          bigCount: 0,
          smallCount: 0,
          bigPercent: 0,
          smallPercent: 0
        }
      });

    } catch (error) {
      console.error("Pattern error:", error);

      res.status(500).json({
        success: false,
        message: "Unable to load pattern."
      });
    }
  }
);

module.exports = router;
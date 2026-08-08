const express = require("express");

const router = express.Router();

const PatternStat =
  require("../models/PatternStat");


// GET ALL PATTERN STATISTICS
router.get(
  "/:datasetId/patterns",
  async (req, res) => {

    try {

      const stats =
        await PatternStat.find({
          dataset:
            req.params.datasetId
        })
          .sort({
            first: 1,
            second: 1
          })
          .lean();


      res.json({
        success: true,
        stats
      });


    } catch (error) {

      console.error(
        "Analysis error:",
        error
      );


      res.status(500).json({
        success: false,
        message:
          "Failed to load analysis."
      });
    }
  }
);


// GET ONE SPECIFIC PATTERN
router.get(
  "/:datasetId/pattern/:first/:second",
  async (req, res) => {

    try {

      const first =
        Number(
          req.params.first
        );

      const second =
        Number(
          req.params.second
        );


      if (
        !Number.isInteger(first) ||
        !Number.isInteger(second) ||
        first < 0 ||
        first > 9 ||
        second < 0 ||
        second > 9
      ) {

        return res.status(400).json({
          success: false,
          message:
            "Invalid pattern."
        });
      }


      const stat =
        await PatternStat.findOne({
          dataset:
            req.params.datasetId,

          first,

          second
        }).lean();


      if (!stat) {

        return res.json({
          success: true,

          stat: {
            first,
            second,

            total: 0,

            bigCount: 0,

            smallCount: 0,

            bigPercent: 0,

            smallPercent: 0,

            nextNumbers: []
          }
        });
      }


      res.json({
        success: true,
        stat
      });


    } catch (error) {

      console.error(
        "Pattern analysis error:",
        error
      );


      res.status(500).json({
        success: false,
        message:
          "Failed to load pattern."
      });
    }
  }
);


module.exports = router;
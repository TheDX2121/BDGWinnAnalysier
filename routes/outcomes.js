const express = require("express");

const router = express.Router();

const Outcome =
  require("../models/Outcome");

const analyzer =
  require("../services/analyzer");


// GET ALL OUTCOMES
router.get(
  "/:datasetId",
  async (req, res) => {
    try {
      const outcomes =
        await Outcome.find({
          dataset: req.params.datasetId
        })
          .sort({ createdAt: 1 })
          .lean();

      res.json({
        success: true,
        outcomes
      });

    } catch (error) {
      console.error(
        "Get outcomes error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to load outcomes."
      });
    }
  }
);


// ADD SINGLE LIVE OUTCOME
router.post(
  "/:datasetId",
  async (req, res) => {
    try {
      const number =
        Number(req.body.numbers?.[0]);

      if (
        !Number.isInteger(number) ||
        number < 0 ||
        number > 9
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Outcome must be a number from 0 to 9."
        });
      }


      const previous =
        await Outcome.find({
          dataset: req.params.datasetId
        })
          .sort({ createdAt: -1 })
          .limit(2)
          .lean();


      const outcome =
        await Outcome.create({
          dataset:
            req.params.datasetId,

          number
        });


      // Analyze the new outcome
      if (previous.length >= 2) {

        const second =
          previous[0].number;

        const first =
          previous[1].number;

        await analyzer.processNewOutcome({
          datasetId:
            req.params.datasetId,

          first,

          second,

          next: number
        });
      }


      res.status(201).json({
        success: true,
        imported: 1,
        outcome
      });

    } catch (error) {
      console.error(
        "Add outcome error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to add outcome."
      });
    }
  }
);


// IMPORT HISTORY
router.post(
  "/:datasetId/import",
  async (req, res) => {
    try {

      const numbers =
        Array.isArray(
          req.body.numbers
        )
          ? req.body.numbers
          : [];


      if (!numbers.length) {
        return res.status(400).json({
          success: false,
          message:
            "No outcomes provided."
        });
      }


      const validNumbers =
        numbers.every(
          number =>
            Number.isInteger(number) &&
            number >= 0 &&
            number <= 9
        );


      if (!validNumbers) {
        return res.status(400).json({
          success: false,
          message:
            "All outcomes must be numbers from 0 to 9."
        });
      }


      // Get existing outcomes
      const existing =
        await Outcome.find({
          dataset:
            req.params.datasetId
        })
          .sort({ createdAt: 1 })
          .lean();


      /*
       * We do NOT remove repeated patterns.
       *
       * Every real occurrence is recorded.
       *
       * Example:
       *
       * 9,8,1
       * ...
       * 9,8,1
       *
       * Both 9-8 -> 1 events count.
       */


      const documents =
        numbers.map(number => ({
          dataset:
            req.params.datasetId,

          number
        }));


      const created =
        await Outcome.insertMany(
          documents
        );


      /*
       * Rebuild/analyze the complete dataset
       * so repeated patterns remain counted.
       */

      await analyzer.rebuildDataset(
        req.params.datasetId
      );


      res.json({
        success: true,

        imported:
          created.length,

        skipped: 0
      });

    } catch (error) {

      console.error(
        "Import history error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to import history."
      });
    }
  }
);


module.exports = router;
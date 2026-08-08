const express = require("express");

const router = express.Router();

const Outcome = require("../models/Outcome");
const analyzer = require("../services/analyzer");


// =====================================================
// GET ALL OUTCOMES
// =====================================================

router.get(
  "/:datasetId",
  async (req, res) => {
    try {
      const outcomes = await Outcome.find({
        dataset: req.params.datasetId
      })
        .sort({ createdAt: 1 })
        .lean();

      return res.json({
        success: true,
        outcomes
      });

    } catch (error) {
      console.error(
        "GET OUTCOMES ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);


// =====================================================
// ADD ONE LIVE OUTCOME
// =====================================================

router.post(
  "/:datasetId",
  async (req, res) => {
    try {

      const datasetId =
        req.params.datasetId;


      // Accept numbers: [9]
      // Also accept number: 9
      let number;

      if (
        Array.isArray(
          req.body.numbers
        )
      ) {
        number =
          Number(
            req.body.numbers[0]
          );
      } else {
        number =
          Number(
            req.body.number
          );
      }


      // Validate number
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


      // -------------------------------------------------
      // Get the previous two outcomes
      // -------------------------------------------------

      const previous =
        await Outcome.find({
          dataset: datasetId
        })
          .sort({
            createdAt: -1
          })
          .limit(2)
          .lean();


      // -------------------------------------------------
      // Save actual outcome
      // -------------------------------------------------

      const outcome =
        await Outcome.create({
          dataset: datasetId,
          number: number
        });


      // -------------------------------------------------
      // Pattern analysis
      //
      // Example:
      //
      // Previous:
      // 9, 8
      //
      // New:
      // 1
      //
      // Record:
      // 9-8 -> 1
      // -------------------------------------------------

      if (
        previous.length >= 2
      ) {

        const second =
          previous[0].number;

        const first =
          previous[1].number;


        if (
          analyzer &&
          typeof
            analyzer.processNewOutcome ===
              "function"
        ) {

          await analyzer.processNewOutcome({
            datasetId,
            first,
            second,
            next: number
          });

        } else {

          console.warn(
            "processNewOutcome() not available in analyzer.js"
          );
        }
      }


      return res.status(201).json({
        success: true,
        imported: 1,
        outcome
      });


    } catch (error) {

      console.error(
        "ADD OUTCOME ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to add outcome."
      });
    }
  }
);


// =====================================================
// IMPORT MULTIPLE OUTCOMES
// =====================================================

router.post(
  "/:datasetId/import",
  async (req, res) => {

    try {

      const datasetId =
        req.params.datasetId;


      const numbers =
        Array.isArray(
          req.body.numbers
        )
          ? req.body.numbers
          : [];


      // -------------------------------------------------
      // Validate input
      // -------------------------------------------------

      if (!numbers.length) {

        return res.status(400).json({
          success: false,
          message:
            "No outcomes provided."
        });
      }


      const converted =
        numbers.map(
          value => Number(value)
        );


      const valid =
        converted.every(
          number =>
            Number.isInteger(number) &&
            number >= 0 &&
            number <= 9
        );


      if (!valid) {

        return res.status(400).json({
          success: false,
          message:
            "All outcomes must be numbers from 0 to 9."
        });
      }


      // -------------------------------------------------
      // IMPORTANT
      //
      // Every imported outcome is stored.
      //
      // We DO NOT remove repeated patterns.
      //
      // Example:
      //
      // 9 8 1
      // ...
      // 9 8 1
      //
      // Both occurrences remain in the dataset.
      // -------------------------------------------------

      const documents =
        converted.map(
          number => ({
            dataset: datasetId,
            number
          })
        );


      const created =
        await Outcome.insertMany(
          documents
        );


      // -------------------------------------------------
      // Rebuild pattern statistics
      // -------------------------------------------------

      if (
        analyzer &&
        typeof analyzer.rebuildDataset ===
          "function"
      ) {

        await analyzer.rebuildDataset(
          datasetId
        );

      } else {

        console.warn(
          "rebuildDataset() not available in analyzer.js"
        );
      }


      return res.json({
        success: true,

        imported:
          created.length,

        skipped: 0
      });


    } catch (error) {

      console.error(
        "IMPORT OUTCOMES ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to import outcomes."
      });
    }
  }
);


// =====================================================
// DELETE ALL OUTCOMES OF A DATASET
// =====================================================

router.delete(
  "/:datasetId",
  async (req, res) => {

    try {

      const result =
        await Outcome.deleteMany({
          dataset:
            req.params.datasetId
        });


      // Rebuild empty statistics
      if (
        analyzer &&
        typeof analyzer.rebuildDataset ===
          "function"
      ) {

        await analyzer.rebuildDataset(
          req.params.datasetId
        );
      }


      return res.json({
        success: true,

        deleted:
          result.deletedCount
      });


    } catch (error) {

      console.error(
        "DELETE OUTCOMES ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to delete outcomes."
      });
    }
  }
);


module.exports = router;
const express = require("express");

const router = express.Router();

const Outcome = require("../models/Outcome");
const analyzer = require("../services/analyzer");
const { getSize } = require("../utils/classifier");


// =====================================================
// GET ALL OUTCOMES
// =====================================================

router.get(
  "/:datasetId",
  async (req, res) => {
    try {
      const outcomes = await Outcome.find({
        datasetId: req.params.datasetId
      })
        .sort({
          sequence: 1
        })
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
        message:
          error.message ||
          "Failed to load outcomes."
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


      // Accept:
      // { number: 9 }
      //
      // OR:
      // { numbers: [9] }

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
      // Find latest sequence
      // -------------------------------------------------

      const lastOutcome =
        await Outcome.findOne({
          datasetId
        })
          .sort({
            sequence: -1
          })
          .lean();


      const sequence =
        lastOutcome
          ? lastOutcome.sequence + 1
          : 1;


      // -------------------------------------------------
      // Calculate Big / Small
      // -------------------------------------------------

      const size =
        getSize(number);


      // -------------------------------------------------
      // Create actual outcome
      // -------------------------------------------------

      const outcome =
        await Outcome.create({
          datasetId,
          sequence,
          number,
          size
        });


      // -------------------------------------------------
      // Analyze previous two → new outcome
      // -------------------------------------------------

      const analysis =
        await analyzer.processNewOutcome(
          datasetId,
          outcome
        );


      return res.status(201).json({
        success: true,

        imported: 1,

        outcome,

        analysis
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
// IMPORT HISTORY
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
      // Continue sequence
      // -------------------------------------------------

      const lastOutcome =
        await Outcome.findOne({
          datasetId
        })
          .sort({
            sequence: -1
          })
          .lean();


      let sequence =
        lastOutcome
          ? lastOutcome.sequence + 1
          : 1;


      // -------------------------------------------------
      // Create outcomes one-by-one
      //
      // This is intentional.
      //
      // Every new outcome is passed through
      // analyzer.processNewOutcome()
      //
      // So:
      //
      // 9 8 1
      //
      // records:
      //
      // 9-8 → 1
      //
      // and if later:
      //
      // 9 8 1
      //
      // appears again:
      //
      // 9-8 → 1
      //
      // gets counted again.
      // -------------------------------------------------

      let imported = 0;

      const createdOutcomes = [];


      for (
        const number of converted
      ) {

        const size =
          getSize(number);


        const outcome =
          await Outcome.create({
            datasetId,
            sequence,
            number,
            size
          });


        await analyzer.processNewOutcome(
          datasetId,
          outcome
        );


        createdOutcomes.push(
          outcome
        );


        imported += 1;

        sequence += 1;
      }


      return res.json({
        success: true,

        imported,

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
// DELETE ALL OUTCOMES OF DATASET
// =====================================================

router.delete(
  "/:datasetId",
  async (req, res) => {

    try {

      const result =
        await Outcome.deleteMany({
          datasetId:
            req.params.datasetId
        });


      // Also remove pattern/event data
      // for this dataset.

      const Event =
        require("../models/Event");

      const PatternStat =
        require("../models/PatternStat");


      await Event.deleteMany({
        datasetId:
          req.params.datasetId
      });


      await PatternStat.deleteMany({
        datasetId:
          req.params.datasetId
      });


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
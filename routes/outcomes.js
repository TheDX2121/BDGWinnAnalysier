const express = require("express");

const Dataset = require("../models/Dataset");
const Outcome = require("../models/Outcome");

const auth =
  require("../middleware/auth");

const {
  validateNumbers
} = require("../utils/validation");

const {
  importOutcomes
} = require("../services/importService");

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
  LIVE / NORMAL INPUT

  POST /api/outcomes/:datasetId

  {
    "numbers": [9]
  }

  or

  {
    "numbers": [9,8,1]
  }
*/

router.post(
  "/:datasetId",
  async (req, res) => {
    try {
      const {
        datasetId
      } = req.params;

      const {
        numbers
      } = req.body;

      const validation =
        validateNumbers(numbers);

      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          message:
            validation.message
        });
      }

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

      const result =
        await importOutcomes(
          datasetId,
          numbers
        );

      res.status(201).json({
        success: true,
        mode: "live",
        ...result
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false,
        message:
          "Unable to process outcomes."
      });
    }
  }
);

/*
  HISTORY IMPORT

  POST /api/outcomes/:datasetId/import

  {
    "numbers": [9,8,1,9,7]
  }
*/

router.post(
  "/:datasetId/import",
  async (req, res) => {
    try {
      const {
        datasetId
      } = req.params;

      const {
        numbers
      } = req.body;

      const validation =
        validateNumbers(numbers);

      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          message:
            validation.message
        });
      }

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

      const result =
        await importOutcomes(
          datasetId,
          numbers
        );

      res.status(201).json({
        success: true,
        mode: "history",
        ...result
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false,
        message:
          "Unable to import history."
      });
    }
  }
);

router.get(
  "/:datasetId",
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

      const outcomes =
        await Outcome.find({
          datasetId:
            dataset._id
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
        message:
          "Unable to load outcomes."
      });
    }
  }
);

module.exports = router;
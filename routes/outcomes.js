const express = require("express");

const Dataset = require("../models/Dataset");

const authMiddleware =
  require("../middleware/auth");

const {
  validateNumbers
} = require("../utils/validation");

const {
  importOutcomes
} = require("../services/importService");

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
  POST

  /api/outcomes/:datasetId

  Normal/live outcome entry.

  Example:

  {
    "numbers": [9]
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
          message: validation.message
        });
      }

      const dataset =
        await getOwnedDataset(
          datasetId,
          req.user.userId
        );

      if (!dataset) {
        return res.status(404).json({
          success: false,
          message: "Dataset not found."
        });
      }

      const result =
        await importOutcomes(
          datasetId,
          numbers
        );

      res.status(201).json({
        success: true,
        ...result
      });

    } catch (error) {
      console.error(
        "Outcome error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Unable to process outcomes."
      });
    }
  }
);

/*
  POST

  /api/outcomes/:datasetId/import

  Used for large history imports.

  Example:

  {
    "numbers": [
      9,8,1,9,7,6,2,4
    ]
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
          message: validation.message
        });
      }

      const dataset =
        await getOwnedDataset(
          datasetId,
          req.user.userId
        );

      if (!dataset) {
        return res.status(404).json({
          success: false,
          message: "Dataset not found."
        });
      }

      const result =
        await importOutcomes(
          datasetId,
          numbers
        );

      res.status(201).json({
        success: true,
        mode: "history-import",
        ...result
      });

    } catch (error) {
      console.error(
        "Import error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Unable to import history."
      });
    }
  }
);

/*
  GET

  /api/outcomes/:datasetId
*/

router.get(
  "/:datasetId",
  async (req, res) => {
    try {
      const dataset =
        await getOwnedDataset(
          req.params.datasetId,
          req.user.userId
        );

      if (!dataset) {
        return res.status(404).json({
          success: false,
          message: "Dataset not found."
        });
      }

      const Outcome =
        require("../models/Outcome");

      const outcomes =
        await Outcome.find({
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
        message:
          "Unable to load outcomes."
      });
    }
  }
);

module.exports = router;
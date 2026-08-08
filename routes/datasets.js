const express = require("express");

const router = express.Router();

const Dataset =
  require("../models/Dataset");


// GET ALL DATASETS
router.get(
  "/",
  async (req, res) => {

    try {

      const datasets =
        await Dataset.find({})
          .sort({
            createdAt: -1
          })
          .lean();

      res.json({
        success: true,
        datasets
      });

    } catch (error) {

      console.error(error);

      res.status(500).json({
        success: false,
        message:
          "Failed to load datasets."
      });
    }
  }
);


// CREATE DATASET
router.post(
  "/",
  async (req, res) => {

    try {

      const name =
        String(
          req.body.name || ""
        ).trim();


      if (!name) {

        return res.status(400).json({
          success: false,
          message:
            "Dataset name is required."
        });
      }


      const dataset =
        await Dataset.create({
          name
        });


      res.status(201).json({
        success: true,
        dataset
      });

    } catch (error) {

      console.error(error);

      res.status(500).json({
        success: false,
        message:
          "Failed to create dataset."
      });
    }
  }
);


// DELETE DATASET
router.delete(
  "/:id",
  async (req, res) => {

    try {

      const dataset =
        await Dataset.findByIdAndDelete(
          req.params.id
        );


      if (!dataset) {

        return res.status(404).json({
          success: false,
          message:
            "Dataset not found."
        });
      }


      res.json({
        success: true,
        message:
          "Dataset deleted."
      });

    } catch (error) {

      console.error(error);

      res.status(500).json({
        success: false,
        message:
          "Failed to delete dataset."
      });
    }
  }
);


module.exports = router;
const express = require("express");
const router = express.Router();

const Dataset = require("../models/Dataset");
const auth = require("../middleware/auth");

// Get all datasets
router.get("/", auth, async (req, res) => {
  try {
    const datasets = await Dataset.find({
      user: req.user.id
    })
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      datasets
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to load datasets."
    });
  }
});


// Create dataset
router.post("/", auth, async (req, res) => {
  try {
    const name =
      String(req.body.name || "").trim();

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Dataset name is required."
      });
    }

    const dataset =
      await Dataset.create({
        name,
        user: req.user.id
      });

    res.status(201).json({
      success: true,
      dataset
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to create dataset."
    });
  }
});


// Delete dataset
router.delete(
  "/:id",
  auth,
  async (req, res) => {
    try {
      const dataset =
        await Dataset.findOneAndDelete({
          _id: req.params.id,
          user: req.user.id
        });

      if (!dataset) {
        return res.status(404).json({
          success: false,
          message: "Dataset not found."
        });
      }

      res.json({
        success: true,
        message: "Dataset deleted."
      });

    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false,
        message: "Failed to delete dataset."
      });
    }
  }
);


module.exports = router;
const express = require("express");

const Dataset = require("../models/Dataset");
const Outcome = require("../models/Outcome");
const Event = require("../models/Event");
const PatternStat = require("../models/PatternStat");
const Sequence = require("../models/Sequence");

const authMiddleware = require("../middleware/auth");

const router = express.Router();

router.use(authMiddleware);

router.get("/", async (req, res) => {
  try {
    const datasets = await Dataset.find({
      userId: req.user.userId
    }).sort({
      createdAt: -1
    });

    res.json({
      success: true,
      datasets
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Unable to load datasets."
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Dataset name is required."
      });
    }

    const dataset = await Dataset.create({
      userId: req.user.userId,
      name: name.trim()
    });

    await Sequence.create({
      datasetId: dataset._id,
      nextSequence: 1
    });

    res.status(201).json({
      success: true,
      dataset
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Unable to create dataset."
    });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Dataset name is required."
      });
    }

    const dataset = await Dataset.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user.userId
      },
      {
        name: name.trim()
      },
      {
        new: true
      }
    );

    if (!dataset) {
      return res.status(404).json({
        success: false,
        message: "Dataset not found."
      });
    }

    res.json({
      success: true,
      dataset
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Unable to rename dataset."
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const filter = {
      _id: req.params.id,
      userId: req.user.userId
    };

    const dataset = await Dataset.findOne(filter);

    if (!dataset) {
      return res.status(404).json({
        success: false,
        message: "Dataset not found."
      });
    }

    await Promise.all([
      Outcome.deleteMany({
        datasetId: dataset._id
      }),

      Event.deleteMany({
        datasetId: dataset._id
      }),

      PatternStat.deleteMany({
        datasetId: dataset._id
      }),

      Sequence.deleteOne({
        datasetId: dataset._id
      }),

      Dataset.deleteOne({
        _id: dataset._id
      })
    ]);

    res.json({
      success: true,
      message: "Dataset and its data deleted."
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Unable to delete dataset."
    });
  }
});

module.exports = router;
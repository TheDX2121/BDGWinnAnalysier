const express = require("express");

const Dataset = require("../models/Dataset");

const router = express.Router();

/*
  Temporary authentication helper.

  Later this will be replaced with proper
  JWT middleware.
*/

function getUserId(req) {
  return req.headers["x-user-id"];
}

/*
  GET /api/datasets
*/

router.get("/", async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required."
      });
    }

    const datasets = await Dataset.find({
      userId
    }).sort({
      createdAt: -1
    });

    res.json({
      success: true,
      datasets
    });

  } catch (error) {
    console.error("Get datasets error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to load datasets."
    });
  }
});

/*
  POST /api/datasets
*/

router.post("/", async (req, res) => {
  try {
    const userId = getUserId(req);
    const { name } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required."
      });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Dataset name is required."
      });
    }

    const dataset = await Dataset.create({
      userId,
      name: name.trim()
    });

    res.status(201).json({
      success: true,
      dataset
    });

  } catch (error) {
    console.error("Create dataset error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to create dataset."
    });
  }
});

/*
  PATCH /api/datasets/:id
*/

router.patch("/:id", async (req, res) => {
  try {
    const userId = getUserId(req);
    const { name } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required."
      });
    }

    const dataset = await Dataset.findOneAndUpdate(
      {
        _id: req.params.id,
        userId
      },
      {
        name: name?.trim()
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
    console.error("Rename dataset error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to rename dataset."
    });
  }
});

/*
  DELETE /api/datasets/:id
*/

router.delete("/:id", async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required."
      });
    }

    const dataset = await Dataset.findOneAndDelete({
      _id: req.params.id,
      userId
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
    console.error("Delete dataset error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to delete dataset."
    });
  }
});

module.exports = router;
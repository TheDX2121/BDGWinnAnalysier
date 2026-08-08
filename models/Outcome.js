const mongoose = require("mongoose");

const outcomeSchema = new mongoose.Schema(
  {
    datasetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Dataset",
      required: true,
      index: true
    },

    sequence: {
      type: Number,
      required: true
    },

    number: {
      type: Number,
      required: true,
      min: 0,
      max: 9
    },

    size: {
      type: String,
      enum: ["Big", "Small"],
      required: true
    }
  },
  {
    timestamps: true
  }
);

outcomeSchema.index(
  {
    datasetId: 1,
    sequence: 1
  },
  {
    unique: true
  }
);

module.exports = mongoose.model(
  "Outcome",
  outcomeSchema
);
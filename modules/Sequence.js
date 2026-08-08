const mongoose = require("mongoose");

const sequenceSchema = new mongoose.Schema(
  {
    datasetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Dataset",
      required: true,
      unique: true
    },

    nextSequence: {
      type: Number,
      default: 1,
      min: 1
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  "Sequence",
  sequenceSchema
);
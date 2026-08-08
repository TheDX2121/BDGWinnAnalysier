const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    datasetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Dataset",
      required: true,
      index: true
    },

    first: {
      type: Number,
      required: true,
      min: 0,
      max: 9
    },

    second: {
      type: Number,
      required: true,
      min: 0,
      max: 9
    },

    next: {
      type: Number,
      required: true,
      min: 0,
      max: 9
    },

    resultType: {
      type: String,
      enum: ["Big", "Small"],
      required: true
    },

    sequence: {
      type: Number,
      required: true
    }
  },
  {
    timestamps: true
  }
);

eventSchema.index({
  datasetId: 1,
  sequence: 1
});

eventSchema.index({
  datasetId: 1,
  first: 1,
  second: 1
});

module.exports = mongoose.model(
  "Event",
  eventSchema
);
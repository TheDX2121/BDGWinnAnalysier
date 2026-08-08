const mongoose = require("mongoose");

const nextNumberSchema = new mongoose.Schema(
  {
    number: {
      type: Number,
      required: true,
      min: 0,
      max: 9
    },

    count: {
      type: Number,
      default: 0
    }
  },
  {
    _id: false
  }
);

const patternStatSchema = new mongoose.Schema(
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

    total: {
      type: Number,
      default: 0
    },

    bigCount: {
      type: Number,
      default: 0
    },

    smallCount: {
      type: Number,
      default: 0
    },

    bigPercent: {
      type: Number,
      default: 0
    },

    smallPercent: {
      type: Number,
      default: 0
    },

    nextNumbers: {
      type: [nextNumberSchema],
      default: []
    }
  },
  {
    timestamps: true
  }
);

patternStatSchema.index(
  {
    datasetId: 1,
    first: 1,
    second: 1
  },
  {
    unique: true
  }
);

module.exports = mongoose.model(
  "PatternStat",
  patternStatSchema
);
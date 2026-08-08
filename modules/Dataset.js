const mongoose = require("mongoose");

const datasetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    }
  },
  {
    timestamps: true
  }
);

datasetSchema.index({
  userId: 1,
  createdAt: -1
});

module.exports = mongoose.model("Dataset", datasetSchema);
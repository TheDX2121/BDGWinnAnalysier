require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const datasetRoutes = require("./routes/datasets");
const outcomeRoutes = require("./routes/outcomes");
const analysisRoutes = require("./routes/analysis");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/datasets", datasetRoutes);
app.use("/api/outcomes", outcomeRoutes);
app.use("/api/analysis", analysisRoutes);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/dashboard", (req, res) => {
  res.sendFile(
    path.join(__dirname, "public", "dashboard.html")
  );
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Analyzer API is running"
  });
});

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    if (!process.env.MONGODB_URI) {
      console.log("MONGODB_URI is not configured.");
    } else {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log("MongoDB connected.");
    }

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Startup error:", error.message);
    process.exit(1);
  }
}

startServer();

module.exports = app;
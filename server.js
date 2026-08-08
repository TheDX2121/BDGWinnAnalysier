const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

const datasetRoutes =
  require("./routes/datasets");

const outcomeRoutes =
  require("./routes/outcomes");

const analysisRoutes =
  require("./routes/analysis");

const app = express();

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true
  })
);

app.use(
  express.static(
    path.join(__dirname, "public")
  )
);


// MongoDB connection
let connectionPromise = null;

async function connectDB() {
  if (
    mongoose.connection.readyState === 1
  ) {
    return;
  }

  if (!connectionPromise) {
    connectionPromise =
      mongoose.connect(
        process.env.MONGODB_URI
      );
  }

  await connectionPromise;
}


// Database middleware
app.use(
  async (req, res, next) => {
    try {
      await connectDB();
      next();
    } catch (error) {

      console.error(
        "MongoDB connection error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Database unavailable."
      });
    }
  }
);


// API routes
app.use(
  "/api/datasets",
  datasetRoutes
);

app.use(
  "/api/outcomes",
  outcomeRoutes
);

app.use(
  "/api/analysis",
  analysisRoutes
);


// Dashboard
app.get(
  "/",
  (req, res) => {
    res.sendFile(
      path.join(
        __dirname,
        "public",
        "dashboard.html"
      )
    );
  }
);

app.get(
  "/dashboard",
  (req, res) => {
    res.sendFile(
      path.join(
        __dirname,
        "public",
        "dashboard.html"
      )
    );
  }
);


module.exports = app;
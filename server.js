const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

const authRoutes =
  require("./routes/auth");

const userRoutes =
  require("./routes/users");

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
        message: "Database unavailable."
      });
    }
  }
);

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/users",
  userRoutes
);

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

app.get(
  "/",
  (req, res) => {
    res.sendFile(
      path.join(
        __dirname,
        "public",
        "index.html"
      )
    );
  }
);

module.exports = app;
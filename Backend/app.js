const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");
const fs = require("fs");

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/Users/users.route");
const gameRoutes = require("./routes/Game/game.route");
const spinRouter = require("./routes/Spin/spin.route");
const { HttpError } = require("./utils/http");

const app = express();
const clientBuildPath = path.join(__dirname, "dist");

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

if (fs.existsSync(clientBuildPath)) {
  app.use(express.static(clientBuildPath));
}

app.use("/", indexRouter);

// API routes stay grouped at the top level so frontend calls do not change.
app.use("/users", usersRouter);
app.use("/game", gameRoutes);
app.use("/spin", spinRouter);

// Serve the built React app only when the backend build folder exists.
app.get("*", (req, res, next) => {
  const indexFile = path.join(clientBuildPath, "index.html");

  if (!fs.existsSync(indexFile)) {
    return next(createError(404));
  }

  res.sendFile(indexFile);
});

app.use((req, res, next) => {
  next(createError(404));
});

app.use((err, req, res, next) => {
  const isUploadError = err.name === "MulterError";
  const status = err.status || err.statusCode || (isUploadError ? 400 : 500);
  const message = status === 500 ? "Internal server error" : err.message;

  if (status === 500) {
    console.error("Unhandled request error:", err);
  }

  if (req.originalUrl.startsWith("/users") || req.originalUrl.startsWith("/game") || req.originalUrl.startsWith("/spin")) {
    return res.status(status).json({ message });
  }

  if (err instanceof HttpError) {
    return res.status(status).json({ message });
  }

  res.locals.message = message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.status(status);
  res.render("error");
});

module.exports = app;

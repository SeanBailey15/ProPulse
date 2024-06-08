"use strict";

const express = require("express");
const cors = require("cors");

const { NotFoundError } = require("./expressError");

const usersRoutes = require("./routes/users");
const jobsRoutes = require("./routes/jobs");
const postsRoutes = require("./routes/posts");

const morgan = require("morgan");

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("tiny"));
// app.use(authenticateJWT); UNCOMMENT ONCE IMPLEMENTED

/*
 APP.USE ALL ROUTES HERE
*/
app.use("/users", usersRoutes);
app.use("/jobs", jobsRoutes);
app.use("/posts", postsRoutes);

app.use(function (req, res, next) {
  return next(new NotFoundError());
});

app.use(function (err, req, res, next) {
  if (process.env.NODE_ENV !== "test") console.error(err.stack);
  const status = err.status || 500;
  const message = err.message;

  return res.status(status).json({
    error: { message, status },
  });
});

module.exports = app;

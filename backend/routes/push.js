"use strict";

/** Routes for push notifications. */

const jsonschema = require("jsonschema");

const express = require("express");
const { BadRequestError } = require("../expressError");
const User = require("../models/user");
const Job = require("../models/job");

const push = require("../config");

const router = express.Router();

router.post("/subscribe/:id", async function (req, res, next) {
  try {
    const subscription = req.body;
    const userId = req.params.id;

    const subscriptions = await User.addSubscription(subscription, userId);

    return res.json({ subscriptions });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;

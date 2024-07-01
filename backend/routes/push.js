"use strict";

/** Routes for push notifications. */

const express = require("express");
const User = require("../models/user");

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

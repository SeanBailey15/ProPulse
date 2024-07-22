"use strict";

/** Routes for push notifications. */

const jsonschema = require("jsonschema");

const express = require("express");
const { BadRequestError } = require("../expressError");
const User = require("../models/user");
const newSubscriptionSchema = require("../schemas/newSubscription.json");
const { sendPushNotification } = require("../helpers/pushNotification");

const router = express.Router();

router.post("/subscribe/:id", async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, newSubscriptionSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const subscription = req.body;

    const userId = req.params.id;

    const result = await User.addSubscription(subscription, userId);

    const recipient = await User.get(userId);

    if (!recipient.subscriptions)
      throw new BadRequestError("This user is not subscribed to notifications");

    const notificationPayload = {
      title: `Welcome to ProPulse ${recipient.firstName}!`,
      body: `Please tell your friends and co-workers about us!`,
    };

    await sendPushNotification(recipient.subscriptions, notificationPayload);

    return res.json(result);
  } catch (err) {
    return next(err);
  }
});

module.exports = router;

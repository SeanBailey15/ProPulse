"use strict";

/** Routes for posts. */

const jsonschema = require("jsonschema");

const express = require("express");
const { BadRequestError } = require("../expressError");
const Post = require("../models/post");
const User = require("../models/user");
const postNewSchema = require("../schemas/postNew.json");
const replyNewSchema = require("../schemas/replyNew.json");
const { BASE_URL } = require("../config");
const { sendPushNotification } = require("../helpers/pushNotification");

const router = express.Router();

/** POST / {post} => {post}
 *
 * Creates a post in the database
 *
 * Sends notification to any tagged users
 *
 * Returns post data
 **/

router.post("/", async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, postNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const post = await Post.createPost(req.body);

    const subscriptions = await User.getTaggedUserSubs(post.tagged);

    if (subscriptions.length) {
      const notificationPayload = {
        title: `${res.locals.user.email} tagged you in a post!`,
        body: `Click the link to view the message.`,
        url: `${BASE_URL}/posts/${post.id}`,
      };

      await sendPushNotification(subscriptions, notificationPayload);
    }

    return res.status(201).json({ post });
  } catch (err) {
    return next(err);
  }
});

/** POST / {reply} => {reply}
 *
 * Creates a post reply in the database
 *
 * Sends notification to any tagged users
 *
 * Returns reply data
 **/

router.post("/reply", async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, replyNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const reply = await Post.createReply(req.body);

    const subscriptions = await User.getTaggedUserSubs(reply.tagged);

    if (subscriptions.length) {
      const notificationPayload = {
        title: `${res.locals.user.email} tagged you in a post!`,
        body: `Click the link to view the message.`,
        url: `${BASE_URL}/posts/replies/${reply.id}`,
      };

      await sendPushNotification(subscriptions, notificationPayload);
    }

    return res.status(201).json({ reply });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;

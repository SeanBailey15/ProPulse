"use strict";

/** Routes for posts. */

const jsonschema = require("jsonschema");

const express = require("express");
const { BadRequestError, UnauthorizedError } = require("../expressError");
const Post = require("../models/post");
const User = require("../models/user");
const postNewSchema = require("../schemas/postNew.json");
const replyNewSchema = require("../schemas/replyNew.json");
const { FRONTEND_URL } = require("../config");
const { sendPushNotification } = require("../helpers/pushNotification");
const { ensureLoggedIn, ensureJobMatch } = require("../middleware/auth");

const router = express.Router();

/** POST / {post} => {post}
 *
 * Creates a post in the database
 *
 * Sends notification to any tagged users
 *
 * Returns post data
 *
 * Authorization: Must be logged in
 **/

router.post(
  "/:jobId",
  ensureLoggedIn,
  ensureJobMatch,
  async function (req, res, next) {
    try {
      const validator = jsonschema.validate(req.body, postNewSchema);
      if (!validator.valid) {
        const errs = validator.errors.map((e) => e.stack);
        throw new BadRequestError(errs);
      }

      const creatorId = res.locals.user.id;

      const jobId = +req.params.jobId;

      const post = await Post.createPost(req.body, creatorId, jobId);

      const subscriptions = await User.getTaggedUserSubs(post.tagged);

      if (subscriptions.length) {
        const notificationPayload = {
          title: `${res.locals.user.email} tagged you in a post!`,
          body: `Click the link to view the message.`,
          url: `${FRONTEND_URL}/posts/${post.id}`,
        };

        await sendPushNotification(subscriptions, notificationPayload);
      }

      return res.status(201).json({ post });
    } catch (err) {
      return next(err);
    }
  }
);

/** POST / {reply} => {reply}
 *
 * Creates a post reply in the database
 *
 * Sends notification to any tagged users
 *
 * Returns reply data
 *
 * Authorization: Must be logged in
 **/

router.post("/reply/:postId", ensureLoggedIn, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, replyNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const postId = req.params.postId;

    const post = await Post.getPost(postId);

    if (!res.locals.user.jobs)
      throw new UnauthorizedError("You are not associated with this project");
    await Post.checkCurrentUserJobs(res.locals.user.jobs, post.jobId);

    const creatorId = res.locals.user.id;

    const reply = await Post.createReply(req.body, creatorId, postId);

    const subscriptions = await User.getTaggedUserSubs(reply.tagged);

    if (subscriptions.length) {
      const notificationPayload = {
        title: `${res.locals.user.email} tagged you in a reply!`,
        body: `Click the link to view the message.`,
        url: `${FRONTEND_URL}/replies/${reply.id}`,
      };

      await sendPushNotification(subscriptions, notificationPayload);
    }

    return res.status(201).json({ reply });
  } catch (err) {
    return next(err);
  }
});

/** GET / { post id } => { post }
 *
 * Gets post information from the database
 *
 * Authorization: Must be logged in
 *  Functional check to see if current user's job associations match the job id of the post
 */

router.get("/:postId", ensureLoggedIn, async function (req, res, next) {
  try {
    const post = await Post.getPost(req.params.postId);

    if (!res.locals.user.jobs)
      throw new UnauthorizedError("You are not associated with this project");
    await Post.checkCurrentUserJobs(res.locals.user.jobs, post.jobId);

    return res.json({ post });
  } catch (err) {
    return next(err);
  }
});

/** GET / { reply id } => { reply }
 *
 * Gets reply information from the database
 *
 * Authorization: Must be logged in
 *  Functional check to see if current user's job associations match the job id of the reply
 */

router.get(
  "/replies/:replyId",
  ensureLoggedIn,
  async function (req, res, next) {
    try {
      const reply = await Post.getReply(req.params.replyId);

      if (!res.locals.user.jobs)
        throw new UnauthorizedError("You are not associated with this project");
      await Post.checkCurrentUserJobs(res.locals.user.jobs, reply.jobId);

      return res.json({ reply });
    } catch (err) {
      return next(err);
    }
  }
);

module.exports = router;

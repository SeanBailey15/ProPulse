"use strict";

/** Routes for posts. */

const jsonschema = require("jsonschema");

const express = require("express");
const { BadRequestError } = require("../expressError");
const Post = require("../models/post");
const postNewSchema = require("../schemas/postNew.json");
const replyNewSchema = require("../schemas/replyNew.json");

const router = express.Router();

/** POST / {post} => {post}
 *
 * Creates a post in the database
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
    return res.status(201).json({ post });
  } catch (err) {
    return next(err);
  }
});

/** POST / {reply} => {reply}
 *
 * Creates a post reply in the database
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
    return res.status(201).json({ reply });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;

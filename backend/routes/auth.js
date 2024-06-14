"use strict";

/** Routes for authentication. */

const express = require("express");
const { BadRequestError } = require("../expressError");
const User = require("../models/user");
const Job = require("../models/job");
const { createToken } = require("../helpers/tokens");
const jsonschema = require("jsonschema");
const userAuthSchema = require("../schemas/userAuth.json");
const userNewSchema = require("../schemas/userNew.json");

const router = new express.Router();

/** POST /auth/token:  { email, password } => { token }
 *
 * Returns JWT token which can be used to authenticate further requests.
 */

router.post("/login", async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, userAuthSchema);

    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const { email, password } = req.body;

    const user = await User.authenticate(email, password);

    const userJobs = await Job.findUserJobs(user.id);

    if (userJobs.length > 0) {
      user.jobs = userJobs.map((j) => j.id);
    } else if (userJobs.message) {
      user.message = userJobs.message;
    }

    const token = createToken(user);
    return res.json({ token });
  } catch (err) {
    return next(err);
  }
});

/** POST /auth/register:   { user } => { token }
 *
 * user must include { email, firstName, lastName, phone, password, organization, title }
 *
 * Returns JWT token which can be used to authenticate further requests.
 */

router.post("/register", async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, userNewSchema);

    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const user = await User.register({ ...req.body });

    const userJobs = await Job.findUserJobs(user.id);

    if (userJobs.length > 0) {
      user.jobs = userJobs.map((j) => j.id);
    } else if (userJobs.message) {
      user.message = userJobs.message;
    }

    const token = createToken(user);
    return res.status(201).json({ token });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;

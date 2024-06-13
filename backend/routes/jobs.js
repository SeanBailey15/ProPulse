"use strict";

/** Routes for jobs. */

const jsonschema = require("jsonschema");

const express = require("express");
const { BadRequestError } = require("../expressError");
const Job = require("../models/job");
const jobNewSchema = require("../schemas/jobNew.json");
const { createToken } = require("../helpers/tokens");
const { ensureLoggedIn, ensureJobMatch } = require("../middleware/auth");

const router = express.Router();

/** POST / { job }  => { job }
 *
 * Creates a new job
 * Creates an updated token for auth
 * Returns job data
 **/

router.post("/", ensureLoggedIn, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, jobNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const job = await Job.createJob(req.body);

    const user = { ...res.locals.user };

    const userJobs = await Job.findUserJobs(user.id);
    if (userJobs.length > 0) {
      user.jobs = userJobs.map((j) => j.id);
    } else if (userJobs.message) {
      user.message = userJobs.message;
    }

    const token = createToken(user);
    return res.status(201).json({ job, token });
  } catch (err) {
    return next(err);
  }
});

router.get("/:id", ensureJobMatch, async function (req, res, next) {
  try {
    const job = await Job.getJob(req.params.id);
    return res.json({ job });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;

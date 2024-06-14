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
 *
 * Authorization: Must be logged in
 **/

router.post("/", ensureLoggedIn, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, jobNewSchema);

    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const user = { ...res.locals.user };

    const job = await Job.createJob(req.body, user.id);

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

/** GET /id => { job }
 *
 * Returns {id, name, city, state, streetAddr, adminId, adminEmail}
 *    where posts is [{id, datePosted, postedBy, deadline, progress, urgency, content}, ...]
 *    or posts property not listed when no posts are found
 *    and where users is [{id, email, organization, title}, ...]
 *    omitting admin from the collection of users since they are retrieved in the first query
 *    or users property not listed when no users are found
 *
 * Authorization: Must be logged in AND associated with the job
 */

router.get(
  "/:id",
  ensureLoggedIn,
  ensureJobMatch,
  async function (req, res, next) {
    try {
      const job = await Job.getJob(req.params.id);
      return res.json({ job });
    } catch (err) {
      return next(err);
    }
  }
);

module.exports = router;

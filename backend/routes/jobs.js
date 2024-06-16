"use strict";

/** Routes for jobs. */

const jsonschema = require("jsonschema");

const express = require("express");
const { BadRequestError } = require("../expressError");
const Job = require("../models/job");
const User = require("../models/user");
const jobNewSchema = require("../schemas/jobNew.json");
const inviteJobSchema = require("../schemas/inviteJob.json");
const { createToken } = require("../helpers/tokens");
const {
  ensureLoggedIn,
  ensureJobMatch,
  ensureSelf,
} = require("../middleware/auth");

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

// ************************************************************************************
// THIS WILL NEED TO BE CHANGED ONCE INVITE ROUTE IS FIGURED OUT WITH JWTs!!!

/** POST /accept/:id => { message }
 *
 * Associates a user to a job after invite accepted
 *
 * Returns a message depending on invite with/without privilege
 *
 * Authorization: Must be logged in
 *
 * Throws BadRequest if current user is not the invited user
 */

router.post("/accept/:id", ensureLoggedIn, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, inviteJobSchema);

    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const jobId = req.params.id;
    const userId = res.locals.user.id;
    const { invited, privilege } = req.body;

    const userRes = await User.getByEmail(invited);
    const invitedUser = userRes.rows[0];

    if (userId !== invitedUser.id)
      throw new BadRequestError("You were not invited to this project!");

    const message = await Job.associate(jobId, userId, privilege);

    return res.json({ message });
  } catch (err) {
    return next(err);
  }
});

// *************************************************************************************

/** GET /id => { job }
 *
 * Returns {id, name, city, state, streetAddr, adminId, adminEmail}
 *    where posts is [{id, datePosted, postedBy, deadline, progress, urgency, content}, ...]
 *    or posts property not listed when no posts are found
 *    and where users is [{id, email, organization, title}, ...]
 *    omitting admin from the collection of users since they are retrieved in the first query
 *    or users property not listed when no users are found
 *    and privilege true/false => current user has job privileges?
 *
 * Authorization: Must be logged in AND associated with the job
 */

router.get(
  "/:id",
  ensureLoggedIn,
  ensureJobMatch,
  async function (req, res, next) {
    try {
      const user = { ...res.locals.user };

      const job = await Job.getJob(req.params.id, user.id);

      return res.json({ job });
    } catch (err) {
      return next(err);
    }
  }
);

/** GET /user/id => { jobs }
 *
 * Get all jobs for a given user
 *
 * Returns [{ id, name, city, state, streetAddr, adminId, adminEmail }, ...]
 *
 * Authorization: Must be logged in AND requesting self
 */

router.get(
  "/user/:id",
  ensureLoggedIn,
  ensureSelf,
  async function (req, res, next) {
    try {
      const jobsRes = await Job.findUserJobs(req.params.id);
      return res.json({ jobs: jobsRes });
    } catch (err) {
      return next(err);
    }
  }
);

module.exports = router;

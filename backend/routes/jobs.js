"use strict";

/** Routes for jobs. */

const jsonschema = require("jsonschema");
const jwt = require("jsonwebtoken");
const { SECRET_KEY, BASE_URL, FRONTEND_URL } = require("../config");
const express = require("express");

const { BadRequestError } = require("../expressError");
const Job = require("../models/job");
const User = require("../models/user");
const jobNewSchema = require("../schemas/jobNew.json");
const jobInviteSchema = require("../schemas/jobInvite.json");
const jobUpdateSchema = require("../schemas/jobUpdate.json");
const { createToken } = require("../helpers/tokens");
const { sendPushNotification } = require("../helpers/pushNotification");
const {
  ensureLoggedIn,
  ensureJobMatch,
  ensureSelf,
  ensurePrivileges,
  ensureAdmin,
} = require("../middleware/auth");

const router = express.Router();

/** POST / { job }  => { job }
 *
 * Creates a new job
 *
 * Creates an updated token for auth
 *
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

/** POST /invite/:id => { pushToken }
 *
 * Receives request body data for an invite.
 *
 * Processes the data to form a JWT
 *
 * Sends the token with the invite link as a query string
 *  through a push notification to recipient
 *
 * Returns a message if successful
 *
 * Throws Errors depending on data passed to route
 *
 * Authorization: Must be logged in
 */

router.post(
  "/invite/:id",
  ensureLoggedIn,
  ensurePrivileges,
  async function (req, res, next) {
    try {
      const validator = jsonschema.validate(req.body, jobInviteSchema);

      if (!validator.valid) {
        const errs = validator.errors.map((e) => e.stack);
        throw new BadRequestError(errs);
      }

      const sender = res.locals.user.email;

      const jobId = req.params.id;
      const { invited, privilege } = req.body;

      const recipient = await User.getByEmail(invited);

      if (!recipient.subscriptions)
        throw new BadRequestError(
          "This user is not subscribed to notifications"
        );

      const tokenPayload = {
        invited: recipient.id,
        privilege: privilege,
        jobId: +jobId,
      };

      const token = jwt.sign(tokenPayload, SECRET_KEY);

      const notificationPayload = {
        title: `${recipient.firstName}, you have an invitation!`,
        body: `${sender} has invited you to a project. Click to accept.`,
        url: `${FRONTEND_URL}/invitation?token=${token}`,
      };

      await sendPushNotification(recipient.subscriptions, notificationPayload);

      return res.json({ message: "Invitation sent successfully" });
    } catch (err) {
      return next(err);
    }
  }
);

// *************************************************************************************

/** GET /invitation?token => token
 *
 * Will function as a landing page for a user that clicks on an invitation notification
 *
 * Returns a token containing data necessary for job associations
 *
 * Authorization: Must be logged in
 */

router.get("/invitation", ensureLoggedIn, async function (req, res, next) {
  try {
    const { token } = req.query;
    return res.json(token);
  } catch (err) {
    return next(err);
  }
});

// ************************************************************************************

/** POST /accept?token => { message }
 *
 * Associates a user to a job after invite accepted
 *
 * Returns a message depending on invite with/without privilege
 *
 * Throws BadRequest if current user is not the invited user
 *
 * Authorization: Must be logged in
 */

router.post("/accept", ensureLoggedIn, async function (req, res, next) {
  try {
    const { token } = req.query;
    const decoded = jwt.verify(token, SECRET_KEY);

    const { invited, privilege, jobId } = decoded;

    const message = await Job.associate(jobId, invited, privilege);

    const user = { ...res.locals.user };

    const userJobs = await Job.findUserJobs(user.id);

    if (userJobs.length > 0) {
      user.jobs = userJobs.map((j) => j.id);
    } else if (userJobs.message) {
      user.message = userJobs.message;
    }

    const authToken = createToken(user);

    return res.json({ message, authToken });
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

/** POST /:id/remove/:userId => { message }
 *
 * Deletes a job-user association from the database
 *
 * Returns a message
 *
 * Authorization: Must be logged in
 */

router.post(
  "/:id/remove/:userId",
  ensureLoggedIn,
  ensurePrivileges,
  async function (req, res, next) {
    try {
      const jobId = req.params.id;
      const userId = req.params.userId;

      const message = await Job.dissociate(jobId, userId);
      return res.json(message);
    } catch (err) {
      return next(err);
    }
  }
);

/** POST /:id/trust/:userId => { message }
 *
 * Creates job-user privilege association
 *
 * Returns a message
 *
 * Authorization: Must be logged in
 */

router.post(
  "/:id/trust/:userId",
  ensureLoggedIn,
  ensurePrivileges,
  async function (req, res, next) {
    try {
      const jobId = req.params.id;
      const userId = req.params.userId;

      const message = await Job.givePrivilege(jobId, userId);
      return res.json({ message });
    } catch (err) {
      return next(err);
    }
  }
);

/** PATCH /:id { data } => { job }
 *
 * Given a job id and data, update relevant job properties
 *
 * Data can include:
 *  { name, city, state, streetAddr }
 *
 * Returns:
 *  {
 *    job: { id, name, city, state, streetAddr, admin },
 *    message
 *  }
 *
 * Authorization: Must be logged in and have job privileges
 */

router.patch(
  "/:id",
  ensureLoggedIn,
  ensurePrivileges,
  async function (req, res, next) {
    try {
      const validator = jsonschema.validate(req.body, jobUpdateSchema);

      if (!validator.valid) {
        const errs = validator.errors.map((e) => e.stack);
        throw new BadRequestError(errs);
      }

      const job = await Job.update(req.params.id, req.body);

      return res.json({ job, message: "Project info updated successfully" });
    } catch (err) {
      return next(err);
    }
  }
);

/** PATCH /:id/transfer/:userId => { message }
 *
 * Given a job id and a target user id, change admin for the job
 *
 * Returns a message on success
 *
 * Throws BadRequestError if new admin is not associated with the job
 *
 * Authorization: Must be logged in and current admin of the job
 */

router.patch(
  "/:id/transfer/:userId",
  ensureLoggedIn,
  ensureAdmin,
  async function (req, res, next) {
    try {
      const jobId = req.params.id;
      const userId = req.params.userId;

      const newAdmin = await User.get(userId);

      const newAdminJobIds = newAdmin.jobs.map((job) => job.id);

      if (!newAdminJobIds.includes(+jobId))
        throw new BadRequestError(
          `The recipient is not associated with this project`
        );

      const message = await Job.transferAdmin(jobId, userId);

      if (message) {
        const sender = res.locals.user.email;

        const notificationPayload = {
          title: `${newAdmin.firstName}, you are now the admin!`,
          body: `${sender} has made you the admin. Click the link for more info.`,
          url: `${BASE_URL}/jobs/${jobId}`,
        };

        await sendPushNotification(newAdmin.subscriptions, notificationPayload);
      }

      return res.json({ message });
    } catch (err) {
      return next(err);
    }
  }
);

module.exports = router;

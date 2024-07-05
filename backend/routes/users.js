"use strict";

/** Routes for users. */

const jsonschema = require("jsonschema");

const express = require("express");
const { BadRequestError, UnauthorizedError } = require("../expressError");
const User = require("../models/user");
const Job = require("../models/job");
const userUpdateSchema = require("../schemas/userUpdate.json");
const { createToken } = require("../helpers/tokens");
const {
  ensureLoggedIn,
  ensureSelf,
  blockRoute,
} = require("../middleware/auth");

const router = express.Router();

/** GET / => { users }
 *
 * Returns [{ id, email, firstName, lastName, phone, organization, title, active, subscriptions }, ...]
 *
 * Authorization: Blocked to all until use becomes evident, dev purposes for now
 */

router.get("/", blockRoute, async function (req, res, next) {
  try {
    const users = await User.getAll();
    return res.json({ users });
  } catch (err) {
    return next(err);
  }
});

/** GET /id => { user }
 *
 * Checks if the current user has any jobs in common with the requested user;
 *  Current user requesting self is ok => immediate return.
 *
 * Returns { id, email, firstName, lastName, phone, organization, title, jobs }
 *   where jobs is { id, name, city, state, streetAddr, adminId, adminEmail }
 *
 * Throws UnauthorizedError if current user is not associated with ANY jobs
 *
 * Throws UnauthorizedError if no jobs in common:
 *  current user should not be able to get requested user data in this case.
 *
 * Authorization: Must be logged in
 **/

router.get("/:id", ensureLoggedIn, async function (req, res, next) {
  try {
    const user = await User.get(req.params.id);

    if (+res.locals.user.id === +req.params.id) return res.json({ user });

    if (!res.locals.user.jobs) throw new UnauthorizedError();

    let jobRelationships = [];

    if (user.jobs) {
      let userJobIds = user.jobs.map((j) => j.id);
      for (let jobId of res.locals.user.jobs) {
        if (userJobIds.includes(jobId)) jobRelationships.push(jobId);
      }
    }

    if (jobRelationships.length === 0) throw new UnauthorizedError();

    return res.json({ user });
  } catch (err) {
    return next(err);
  }
});

/** PATCH /:id {user} => {user, token}
 *
 * Data can include:
 *  { email, firstName, lastName, phone, organization, title }
 *
 * Returns:
 *    user: { email, firstName, lastName, phone, organization, title }
 *    token: { token }
 */

router.patch(
  "/:id",
  ensureLoggedIn,
  ensureSelf,
  async function (req, res, next) {
    try {
      const validator = jsonschema.validate(req.body, userUpdateSchema);
      if (!validator.valid) {
        const errs = validator.errors.map((e) => e.stack);
        throw new BadRequestError(errs);
      }

      const user = await User.update(req.params.id, req.body);

      const userJobs = await Job.findUserJobs(req.params.id);
      if (userJobs.length > 0) {
        user.jobs = userJobs.map((j) => j.id);
      } else if (userJobs.message) {
        user.message = userJobs.message;
      }

      const token = createToken(user);

      return res.json({ user, token });
    } catch (err) {
      return next(err);
    }
  }
);

/** PATCH /deactivate/id {user} => {message}
 *
 * Returns message on success, error on failure
 */

router.patch(
  "/deactivate/:id",
  ensureLoggedIn,
  ensureSelf,
  async function (req, res, next) {
    try {
      const message = await User.deactivate(req.params.id);
      return res.json(message);
    } catch (err) {
      return next(err);
    }
  }
);

module.exports = router;

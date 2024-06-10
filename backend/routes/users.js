"use strict";

/** Routes for users. */

const jsonschema = require("jsonschema");

const express = require("express");
const { BadRequestError } = require("../expressError");
const User = require("../models/user");
const Job = require("../models/job");
const userUpdateSchema = require("../schemas/userUpdate.json");
const { createToken } = require("../helpers/tokens");

const router = express.Router();

/** GET /id => { user }
 *
 * Returns { id, email, firstName, lastName, phone, organization, title, jobs }
 *   where jobs is { id, name, city, state, streetAddr, adminId, adminEmail }
 **/

router.get("/:id", async function (req, res, next) {
  try {
    const user = await User.get(req.params.id);
    return res.json({ user });
  } catch (err) {
    return next(err);
  }
});

/** PATCH /id {user} => {user, token}
 *
 * Data can include:
 *  { email, firstName, lastName, phone, organization, title, profileImg }
 *
 * Returns:
 *    user: { email, firstName, lastName, phone, organization, title, profileImg }
 *    token: { token }
 */

router.patch("/:id", async function (req, res, next) {
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
});

module.exports = router;

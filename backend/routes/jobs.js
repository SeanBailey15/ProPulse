"use strict";

/** Routes for jobs. */

const jsonschema = require("jsonschema");

const express = require("express");
const { BadRequestError } = require("../expressError");
const Job = require("../models/job");
const jobNewSchema = require("../schemas/jobNew.json");

const router = express.Router();

/** POST / { job }  => { job }
 *
 * Creates a new job
 * Returns job data
 **/

router.post("/", async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, jobNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const job = await Job.createJob(req.body);
    // const token = createToken(user);
    return res.status(201).json({ job }); // !!!put token into json return once implemented!!!
  } catch (err) {
    return next(err);
  }
});

router.get("/:id", async function (req, res, next) {
  try {
    const job = await Job.getJob(req.params.id);
    return res.json({ job });
  } catch (err) {
    return next(err);
  }
});

router.get("/userJobs/:userId", async function (req, res, next) {
  try {
    const userJobs = await Job.findUserJobs(req.params.userId);
    return res.json({ userJobs });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;

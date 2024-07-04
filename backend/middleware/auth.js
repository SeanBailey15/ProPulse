"use strict";

/** Convenience middleware to handle common auth cases in routes. */

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const { UnauthorizedError } = require("../expressError");
const Job = require("../models/job");

/** Middleware: Block access to route
 *
 * Simply throws unauthorized error to block route
 *
 * Made to protect certain routes that are not apparently useful yet
 *
 * Throws Unauthorized Error
 */

function blockRoute(req, res, next) {
  try {
    throw new UnauthorizedError();
  } catch (err) {
    return next(err);
  }
}

/** Middleware: Authenticate user.
 *
 * If a token was provided, verify it, and, if valid, store the token payload
 * on res.locals
 *
 * It's not an error if no token was provided or if the token is not valid.
 */

function authenticateJWT(req, res, next) {
  try {
    const authHeader = req.headers && req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace(/^[Bb]earer /, "").trim();
      res.locals.user = jwt.verify(token, SECRET_KEY);
    }
    return next();
  } catch (err) {
    return next();
  }
}

/** Middleware to use when user must be logged in.
 *
 * If not, raises Unauthorized.
 */

function ensureLoggedIn(req, res, next) {
  try {
    if (!res.locals.user) throw new UnauthorizedError();
    return next();
  } catch (err) {
    return next(err);
  }
}

/** Middleware to use when user requests access to a job.
 *
 * user.jobs must include the requested job id.
 *
 * If not, raises Unauthorized.
 */

function ensureJobMatch(req, res, next) {
  try {
    if (!res.locals.user.jobs.includes(+req.params.id))
      throw new UnauthorizedError();
    return next();
  } catch (err) {
    return next(err);
  }
}

/** Middleware to use when requested user must be current user.
 *
 * Current user id must equal requested user id.
 *
 * If not, raises Unauthorized.
 */

function ensureSelf(req, res, next) {
  try {
    if (res.locals.user.id !== +req.params.id) throw new UnauthorizedError();
    return next();
  } catch (err) {
    return next(err);
  }
}

/** Middleware to use when current user must have job privileges
 *
 * Job id and current user id must be associated in job_privileges table of database
 *
 * If not, raises Unauthorized
 */

async function ensurePrivileges(req, res, next) {
  try {
    const jobId = req.params.id;
    const userId = res.locals.user.id;
    const check = await Job.isTrusted(jobId, userId);

    if (check === false) throw new UnauthorizedError();

    return next();
  } catch (err) {
    return next(err);
  }
}

async function ensureAdmin(req, res, next) {
  try {
    const jobId = req.params.id;
    const userId = res.locals.user.id;
    const job = await Job.getJob(jobId, userId);

    if (job.adminId !== userId) throw new UnauthorizedError();

    return next();
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  authenticateJWT,
  ensureLoggedIn,
  ensureJobMatch,
  ensureSelf,
  ensurePrivileges,
  ensureAdmin,
  blockRoute,
};

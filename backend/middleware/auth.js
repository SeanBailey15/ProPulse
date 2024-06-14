"use strict";

/** Convenience middleware to handle common auth cases in routes. */

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const { UnauthorizedError } = require("../expressError");

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

/** Middleware to use when they must be logged in.
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
  if (!res.locals.user.jobs.includes(+req.params.id))
    throw new UnauthorizedError();
  return next();
}

/** Middleware to use when requested user must be current user.
 *
 * Current user id must equal requested user id.
 *
 * If not, raises Unauthorized.
 */

function ensureSelf(req, res, next) {
  if (res.locals.user.id !== +req.params.id) throw new UnauthorizedError();
  return next();
}

module.exports = {
  authenticateJWT,
  ensureLoggedIn,
  ensureJobMatch,
  ensureSelf,
};

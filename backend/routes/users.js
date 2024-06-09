"use strict";

/** Routes for users. */

const jsonschema = require("jsonschema");

const express = require("express");
const { BadRequestError } = require("../expressError");
const User = require("../models/user");
const userNewSchema = require("../schemas/userNew.json");

const router = express.Router();

/** GET / => { users: [ {id, email, firstName, lastName, phone, organization, title }, ... ] }
 *
 * Returns list of all users.
 **/

router.get("/", async function (req, res, next) {
  try {
    const users = await User.findAll();
    return res.json({ users });
  } catch (err) {
    return next(err);
  }
});

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

module.exports = router;

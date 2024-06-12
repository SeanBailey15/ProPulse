"use strict";

/** Shared config for application; can be required many places. */

require("dotenv").config();
require("colors");

// Set up web push configuration
const push = require("web-push");

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const MAIL_TO_ID = process.env.MAIL_TO_ID;

push.setVapidDetails(MAIL_TO_ID, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

// Other configuration
const SECRET_KEY = process.env.SECRET_KEY || "secret-dev";

const PORT = +process.env.PORT || 3001;

const PGPASSWORD = process.env.PGPASSWORD || "secret-password";

// Use dev database, testing database, or via env var, production database
function getDatabaseUri() {
  return process.env.NODE_ENV === "test"
    ? "postgresql:///propulse_test"
    : process.env.DATABASE_URL || "postgresql:///propulse";
}

// Speed up bcrypt during tests, since the algorithm safety isn't being tested
//
// WJB: Evaluate in 2021 if this should be increased to 13 for non-test use
const BCRYPT_WORK_FACTOR = process.env.NODE_ENV === "test" ? 1 : 12;

console.log("ProPulse Config:".green);
console.log("SECRET_KEY:".yellow, SECRET_KEY);
console.log("PORT:".yellow, PORT.toString());
console.log("BCRYPT_WORK_FACTOR".yellow, BCRYPT_WORK_FACTOR);
console.log("Database:".yellow, getDatabaseUri());
console.log("----------".blue);

module.exports = {
  SECRET_KEY,
  PORT,
  PGPASSWORD,
  BCRYPT_WORK_FACTOR,
  getDatabaseUri,
  push,
};

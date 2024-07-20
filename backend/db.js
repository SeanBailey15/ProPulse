"use strict";

const { Pool } = require("pg");
const { PGPASSWORD, getDatabaseUri } = require("./config");

let db;

if (process.env.NODE_ENV === "production") {
  db = new Pool({
    connectionString: getDatabaseUri(),
    password: PGPASSWORD,
    ssl: {
      rejectUnauthorized: false,
    },
  });
} else {
  db = new Pool({
    connectionString: getDatabaseUri(),
    password: PGPASSWORD,
  });
}

module.exports = db;

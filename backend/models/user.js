"use strict";

const db = require("../db");
const bcrypt = require("bcrypt");

const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");

const { BCRYPT_WORK_FACTOR } = require("../config.js");

/** Related functions for users. */

class User {
  /** authenticate user with email, password.
   *
   * Returns { id, email, firstName, lastName, phone, organization, title, profileImg }
   *
   * Throws UnauthorizedError is user not found or wrong password.
   **/

  static async authenticate(email, password) {
    // try to find the user first
    const result = await db.query(
      `SELECT id, 
              email,
              password,
              first_name AS "firstName",
              last_name AS "lastName",
              phone,
              organization,
              title,
              profile_img AS "profileImg"
           FROM users
           WHERE email = $1`,
      [email]
    );

    const user = result.rows[0];

    if (user) {
      // compare hashed password to a new hash from password
      const isValid = await bcrypt.compare(password, user.password);
      if (isValid === true) {
        delete user.password;
        return user;
      }
    }

    throw new UnauthorizedError("Invalid email/password");
  }

  /** Register user with data.
   *
   * Returns { id, email, firstName, lastName, phone, organization, title }
   *
   * Throws BadRequestError on duplicates.
   **/

  static async register({
    email,
    password,
    firstName,
    lastName,
    phone,
    organization,
    title,
  }) {
    const duplicateCheck = await db.query(
      `SELECT email
           FROM users
           WHERE email = $1`,
      [email]
    );

    if (duplicateCheck.rows[0]) {
      throw new BadRequestError(`Duplicate email: ${email}`);
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

    const result = await db.query(
      `INSERT INTO users
           (email,
            password,
            first_name,
            last_name,
            phone,
            organization,
            title)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           RETURNING id, email, first_name AS "firstName", last_name AS "lastName", phone, organization, title`,
      [email, hashedPassword, firstName, lastName, phone, organization, title]
    );

    const user = result.rows[0];

    return user;
  }

  /** Given a user id, return data about user and their jobs.
   *
   * Returns { id, email, firstName, lastName, phone, organization, title, jobs }
   *   where jobs is [{ id, name, city, state, streetAddr, adminId, adminEmail }, ...]
   *   or jobs property not listed when no jobs are found
   *
   * Throws NotFoundError if user not found.
   **/

  static async get(userId) {
    const userRes = await db.query(
      `SELECT id, 
              email,
              first_name AS "firstName",
              last_name AS "lastName",
              phone,
              organization,
              title,
              profile_img AS "profileImg"
           FROM users
           WHERE id = $1`,
      [userId]
    );
    const user = userRes.rows[0];

    if (!user) throw new NotFoundError(`No user with id: ${userId}`);

    const id = userRes.rows[0].id;
    const userJobsRes = await db.query(
      `SELECT jobs.id,
              jobs.name,
              jobs.city,
              jobs.state,
              jobs.street_addr AS "streetAddr",
              jobs.admin AS "adminId",
              users.email AS "adminEmail"
           FROM jobs
           JOIN job_associations AS ja
           ON jobs.id = ja.job_id
           JOIN users
           ON jobs.admin = users.id
           WHERE ja.user_id = $1`,
      [id]
    );

    if (userJobsRes.rows[0]) user.jobs = userJobsRes.rows.map((ja) => ja);

    return user;
  }
}

module.exports = User;

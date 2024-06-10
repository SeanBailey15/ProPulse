"use strict";

const db = require("../db");

const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");

/** Related functions for jobs. */

class Job {
  /** Create job with data.
   *
   * Returns {id, name, city, state, streetAddr, adminId}
   *
   * Inserts the job id and the admin (person who created job) id into
   * the job_associations table
   **/

  static async createJob({ name, city, state, streetAddr, adminId }) {
    const result = await db.query(
      `INSERT INTO jobs
                (name,
                 city,
                 state,
                 street_addr,
                 admin)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING id, name, city, state, street_addr AS "streetAddr", admin AS "adminId"`,
      [name, city, state, streetAddr, adminId]
    );

    const job = result.rows[0];

    await db.query(
      `INSERT INTO job_associations
                (job_id,
                 user_id)
                VALUES ($1, $2)`,
      [job.id, job.adminId]
    );

    return job;
  }

  /** Given a userId, finds all jobs associated with the user.
   *
   * Returns [{ id, name, city, state, streetAddr, adminId}, ...]
   *
   * Returns a message if the user is not associated with any jobs
   **/

  // Useful to supplement User.authenticate method upon login
  static async findUserJobs(userId) {
    const result = await db.query(
      `SELECT id,
            name,
            city,
            state,
            street_addr AS "streetAddr",
            admin AS "adminId"
        FROM jobs
        JOIN job_associations AS ja
        ON jobs.id = ja.job_id
        WHERE ja.user_id = $1`,
      [userId]
    );

    if (result.rows[0]) {
      const userJobs = result.rows;
      return userJobs;
    }
    return {
      message: "User is not associated with any jobs.",
    };
  }

  /**
   * Given a job id, return data about job and its posts.
   *
   * Returns {id, name, city, state, streetAddr, adminId, adminEmail}
   *    where posts is [{id, datePosted, postedBy, deadline, progress, urgency, content}, ...]
   *    or posts property not listed when no posts are found
   *    and where users is [{id, email, organization, title}, ...]
   *    omitting admin from the collection of users since they are retrieved in the first query
   *    or users property not listed when no users are found
   *
   * Throw NotFoundError if job not found.
   **/

  static async getJob(jobId) {
    const result = await db.query(
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
            WHERE ja.job_id = $1`,
      [jobId]
    );
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job with id: ${jobId}`);

    const jobPostsRes = await db.query(
      `SELECT posts.id,
              posts.date_posted AS "datePosted",
              users.email AS "postedBy",
              posts.deadline,
              posts.progress,
              posts.urgency,
              posts.content
            FROM posts
            JOIN users
            ON posts.posted_by = users.id
            WHERE posts.job_id = $1
            ORDER BY date_posted`,
      [jobId]
    );

    if (jobPostsRes.rows[0]) job.posts = jobPostsRes.rows.map((jp) => jp);

    const jobUserRes = await db.query(
      `SELECT users.id,
              users.email,
              users.organization,
              users.title
            FROM users
            JOIN job_associations AS ja
            ON users.id = ja.user_id
            JOIN jobs
            ON jobs.id = ja.job_id
            WHERE jobs.id = $1 AND users.id <> $2
            ORDER BY email`,
      [jobId, job.adminId]
    );

    if (jobUserRes.rows[0]) job.users = jobUserRes.rows.map((ju) => ju);

    return job;
  }
}

module.exports = Job;

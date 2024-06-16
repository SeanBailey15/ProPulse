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

  static async createJob({ name, city, state, streetAddr }, adminId) {
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

    await db.query(
      `INSERT INTO job_privileges
                  (job_id,
                   user_id)
                   VALUES ($1, $2)`,
      [job.id, job.adminId]
    );

    return job;
  }

  /** Given a userId, finds all jobs associated with the user.
   *
   * Returns [{ id, name, city, state, streetAddr, adminId, adminEmail }, ...]
   *
   * Returns a message if the user is not associated with any jobs
   **/

  // *** Useful to supplement user routes and update tokens ***

  static async findUserJobs(userId) {
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
            WHERE ja.user_id = $1`,
      [userId]
    );

    if (result.rows[0]) {
      const userJobs = result.rows;
      return userJobs;
    }
    return {
      message: "The user is not associated with any jobs.",
    };
  }

  /** Given a job id, return data about job and its posts.
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

  static async getJob(jobId, userId) {
    // Get data for given job
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

    // Get post data for job if posts exist
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

    // Get users associated with the job
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

    // Determine if current user has job privileges
    const userPrivilegeRes = await db.query(
      `SELECT user_id 
        FROM job_privileges AS jp
        WHERE jp.job_id = $1`,
      [jobId]
    );

    const privilegedUsers = userPrivilegeRes.rows.map((up) => up.user_id);
    job.privilege = privilegedUsers.includes(userId);

    return job;
  }

  /** Given job id and user id, create job associations
   *
   * Create privilege associations if privilege is truthy
   *
   * Returns a message depending on whether privilege is updated or not
   *
   * Throws BadRequestError if user is already associated with the job
   */

  static async associate(jobId, userId, privilege) {
    const checkRes = await db.query(
      `SELECT *
        FROM job_associations
        WHERE job_id = $1 AND user_id = $2`,
      [jobId, userId]
    );

    if (checkRes.rows)
      throw new BadRequestError("The user is already associated with this job");

    if (!privilege) {
      await db.query(
        `INSERT INTO job_associations
          (job_id, user_id)
          VALUES($1, $2)`,
        [jobId, userId]
      );

      return { message: "You have been added to the project!" };
    }
    if (privilege) {
      await db.query(
        `INSERT INTO job_associations
          (job_id, user_id)
          VALUES($1, $2)`,
        [jobId, userId]
      );

      await db.query(
        `INSERT INTO job_privileges
          (job_id, user_id)
          VALUES($1, $2)`,
        [jobId, userId]
      );

      return {
        message: "You have been added to the project as a trusted user!",
        detail: "As a trusted user, you may invite other users to the project!",
      };
    }
  }

  /** Given a job id and a user id, delete associations
   *
   * Deletes job privileges as well
   *  If a user is removed from a project, their privilege should be removed also
   *
   * Returns a message
   *
   * Throws NotFoundError if the association doesn't exist
   */

  static async dissociate(jobId, userId) {
    const checkRes = await db.query(
      `SELECT *
        FROM job_associations
        WHERE job_id = $1 AND user_id = $2`,
      [jobId, userId]
    );

    if (!checkRes.rows)
      throw new NotFoundError("The user is not associated with this job");

    await db.query(
      `DELETE FROM job_associations
        WHERE job_id = $1 AND user_id = $2`,
      [jobId, userId]
    );

    await db.query(
      `DELETE FROM job_privileges
        WHERE job_id = $1 AND user_id = $2`,
      [jobId, userId]
    );

    return {
      message: "The user was removed successfully",
    };
  }

  /** Given a job id and user id, bestow job privileges to a user
   *
   * Creates association in job_privileges table
   *
   * Returns a message
   *
   * Throws BadRequestError if the user is not associated to the given job
   */

  static async givePrivilege(jobId, userId) {
    const checkRes = await db.query(
      `SELECT *
        FROM job_associations
        WHERE job_id = $1 AND user_id = $2`,
      [jobId, userId]
    );

    if (!checkRes.rows)
      throw new NotFoundError("The user is not associated with this job");

    await db.query(
      `INSERT INTO job_privileges
        (job_id, user_id)
        VALUES($1, $2)`,
      [jobId, userId]
    );

    return {
      message: "You have been added to the project as a trusted user!",
      detail: "As a trusted user, you may invite other users to the project!",
    };
  }
}

module.exports = Job;

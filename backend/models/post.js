"use strict";

const db = require("../db");

const {
  NotFoundError,
  UnauthorizedError,
  BadRequestError,
} = require("../expressError");

/** Related functions for posts. */

class Post {
  /**
   * Create post with data.
   *
   * Inserts data into posts table
   *  Returns {id, datePosted, postedBy, jobId, content, tagged, isReply }
   *
   * Throws BadRequestError if a tagged user is not associated with the job being posted to
   **/

  static async createPost(data, creatorId, jobId) {
    const { content, tagged = [] } = data;

    // CONVERT EMAIL TAGS INTO USER IDS
    const tagIdQuery = `
        SELECT id
          FROM users
          WHERE email = ANY($1::text[])`;

    const tagIdRes = await db.query(tagIdQuery, [tagged]);

    const taggedIds = tagIdRes.rows.map((row) => row.id);

    // GET EACH TAGGED USERS JOB ASSOCIATIONS AND CHECK THEY ARE ASSOCIATED WITH THIS JOB

    const taggedUserJobs = taggedIds.map(async (id) => {
      const userJobsRes = await db.query(
        `SELECT jobs.id
              FROM jobs
              JOIN job_associations AS ja
              ON jobs.id = ja.job_id
              WHERE ja.user_id = $1`,
        [id]
      );

      const userJobs = userJobsRes.rows.map((row) => row.id);

      // THROW ERROR IF A TAGGED USER IS NOT ASSOCIATED WITH THIS JOB
      if (!userJobs.includes(jobId))
        throw new BadRequestError(
          "One or more tagged users are not associated with this project"
        );
    });

    await Promise.all(taggedUserJobs);

    // INSERT ALL DATA INTO POSTS TABLE
    const result = await db.query(
      `INSERT INTO posts
                    (posted_by,
                     job_id,
                     content,
                     tagged)
                    VALUES ($1, $2, $3, $4)
                    RETURNING id,
                              date_posted AS "datePosted",
                              posted_by AS "postedBy",
                              job_id AS "jobId",
                              content,
                              tagged,
                              is_reply AS "isReply"`,
      [creatorId, jobId, content, taggedIds]
    );

    const post = result.rows[0];

    return post;
  }

  /**
   * Create post reply with data.
   *
   * Inserts data into replies table
   *  Returns {id, datePosted, postedBy, replyTo, content, tagged, isReply }
   *
   * Throws BadRequestError if a tagged user is not associated with the job being posted to
   **/

  static async createReply(data, creatorId, postId) {
    const { content, tagged = [] } = data;

    // CONVERT EMAIL TAGS INTO USER IDS
    const tagIdQuery = `
        SELECT id
          FROM users
          WHERE email = ANY($1::text[])`;

    const tagIdRes = await db.query(tagIdQuery, [tagged]);

    const taggedIds = tagIdRes.rows.map((row) => row.id);

    // GET THE JOB ID FOR THE ORIGIN POST
    const jobIdRes = await db.query(
      `SELECT job_id
            FROM posts
            WHERE id = $1`,
      [postId]
    );

    const jobId = jobIdRes.rows[0].job_id;

    // GET EACH TAGGED USERS JOB ASSOCIATIONS AND CHECK THEY ARE ASSOCIATED WITH THIS JOB
    const taggedUserJobs = taggedIds.map(async (id) => {
      const userJobsRes = await db.query(
        `SELECT jobs.id
                  FROM jobs
                  JOIN job_associations AS ja
                  ON jobs.id = ja.job_id
                  WHERE ja.user_id = $1`,
        [id]
      );

      const userJobs = userJobsRes.rows.map((row) => row.id);

      // THROW ERROR IF A TAGGED USER IS NOT ASSOCIATED WITH THIS JOB
      if (!userJobs.includes(jobId))
        throw new BadRequestError(
          "One or more tagged users are not associated with this project"
        );
    });

    await Promise.all(taggedUserJobs);

    const result = await db.query(
      `INSERT INTO replies
        (posted_by,
         reply_to,
         content,
         tagged)
        VALUES ($1, $2, $3, $4)
        RETURNING id,
                  date_posted AS "datePosted",
                  posted_by AS "postedBy",
                  reply_to AS "replyTo",
                  content,
                  tagged,
                  is_reply AS "isReply"`,
      [creatorId, postId, content, taggedIds]
    );

    const reply = result.rows[0];

    return reply;
  }

  /** Given a post id, get post information
   *
   * Returns { id, datePosted, creatorId, createdBy, jobId, jobName, content, isReply, taggedIds, taggedUsers }
   *  Where taggedUsers is [{email}]
   */

  static async getPost(postId) {
    const result = await db.query(
      `SELECT posts.id,
              posts.date_posted AS "datePosted",
              users.id AS "creatorId",
              users.email AS "createdBy",
              posts.job_id AS "jobId",
              jobs.name AS "jobName",
              posts.content,
              posts.is_reply AS "isReply",
              posts.tagged AS "taggedIds"
            FROM posts
            JOIN users
            ON posts.posted_by = users.id
            JOIN jobs
            ON posts.job_id = jobs.id
            WHERE posts.id = $1`,
      [postId]
    );
    const post = result.rows[0];

    if (!post) throw new NotFoundError(`No post with the id: ${postId}`);

    // GET EMAILS FOR ALL TAGGED USERS AND CREATE AN ARRAY WITH DATA IF DATA EXISTS

    const emailQuery = `
    SELECT email
      FROM users
      WHERE id = ANY($1::integer[])`;

    const emailRes = await db.query(emailQuery, [post.taggedIds]);

    if (emailRes.rows.length)
      post.taggedUsers = emailRes.rows.map((row) => row.email);

    // GET ALL REPLIES FOR THE POST AND CREATE AN ARRAY WITH DATA IF DATA EXISTS

    const replyRes = await db.query(
      `SELECT replies.id,
              replies.date_posted AS "datePosted",
              replies.posted_by AS "creatorId",
              users.email AS "createdBy",
              replies.content,
              replies.is_reply AS "isReply",
              replies.tagged AS "taggedIds"
            FROM replies
            JOIN users
            ON replies.posted_by = users.id
            WHERE replies.reply_to = $1`,
      [postId]
    );

    if (replyRes.rows.length) post.replies = replyRes.rows.map((row) => row);

    // GET EMAILS FOR USERS TAGGED IN REPLIES AND CREATE AN ARRAY WITH DATA IF IT EXISTS

    if (post.replies) {
      const replyEmailQuery = `
    SELECT email
      FROM users
      WHERE id = ANY($1::integer[])`;

      const replyEmailPromises = post.replies.map(async (reply) => {
        if (reply.taggedIds.length) {
          const replyEmailRes = await db.query(replyEmailQuery, [
            reply.taggedIds,
          ]);
          reply.taggedUsers = replyEmailRes.rows.map((row) => row.email);
          return reply;
        }
      });

      await Promise.all(replyEmailPromises);
    }

    return post;
  }

  static async getReply(replyId) {
    const result = await db.query(
      `SELECT replies.id,
              replies.date_posted AS "datePosted",
              replies.posted_by AS "creatorId",
              users.email AS "createdBy",
              replies.reply_to AS "replyTo",
              posts.job_id AS "jobId",
              replies.content,
              replies.is_reply AS "isReply",
              replies.tagged AS "taggedIds"
            FROM replies
            JOIN users
            ON replies.posted_by = users.id
            JOIN posts
            ON replies.reply_to = posts.id
            WHERE replies.id = $1`,
      [replyId]
    );

    const reply = result.rows[0];

    if (!reply) throw new NotFoundError(`No reply with the id: ${replyId}`);

    // GET EMAILS FOR ALL TAGGED USERS AND CREATE AN ARRAY WITH DATA IF DATA EXISTS

    const emailQuery = `
    SELECT email
      FROM users
      WHERE id = ANY($1::integer[])`;

    const emailRes = await db.query(emailQuery, [reply.taggedIds]);

    if (emailRes.rows.length)
      reply.taggedUsers = emailRes.rows.map((row) => row.email);

    return reply;
  }

  static async checkCurrentUserJobs(jobs, jobId) {
    if (!jobs.includes(jobId))
      throw new UnauthorizedError("You are not associated with this project");
    return;
  }
}

module.exports = Post;

"use strict";

const db = require("../db");

const { NotFoundError, BadRequestError } = require("../expressError");
const User = require("./user");

/** Related functions for posts. */

class Post {
  /**
   * Create post with data.
   *
   * Inserts data into posts table
   *  Returns {id, datePosted, postedBy, jobId, content, tagged, isReply }
   *
   * Inserts association data into post_tagged_users table after post creation
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

    // IF POST CREATION FAILS, THROW ERROR
    if (!post) throw new BadRequestError(`Invalid Input`);

    // IF POST CREATION SUCCESS, INSERT RELEVANT IDS INTO post_tagged_users ASSOCIATION TABLE
    await taggedIds.map((id) => {
      db.query(
        `INSERT into post_tagged_users(
                post_id,
                user_id)
             VALUES( $1, $2)`,
        [post.id, id]
      );
    });

    return post;
  }

  /**
   * Create post reply with data.
   *
   * Inserts data into replies table
   *  Returns {id, datePosted, postedBy, replyTo, content, tagged, isReply }
   *
   * Inserts association data into reply_tagged_users table after reply creation
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

    // IF REPLY CREATION FAILS, THROW ERROR
    if (!reply) throw new BadRequestError(`Invalid Input`);

    // IF REPLY CREATION SUCCESS, INSERT RELEVANT IDS INTO reply_tagged_users ASSOCIATION TABLE
    await taggedIds.map((id) => {
      db.query(
        `INSERT into reply_tagged_users(
                    reply_id,
                    user_id)
                 VALUES( $1, $2)`,
        [reply.id, id]
      );
    });

    return reply;
  }

  /** Given a post id, get post information
   *
   * Returns { id, datePosted, postedBy, jobId, jobName, content}
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
              posts.tagged AS "taggedIds",
              posts.is_reply AS "isReply"
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

    const emailQuery = `
    SELECT email
      FROM users
      WHERE id = ANY($1::integer[])`;

    const emailRes = await db.query(emailQuery, [post.taggedIds]);

    post.taggedUsers = emailRes.rows.map((row) => row.email);

    return post;
  }
}

module.exports = Post;

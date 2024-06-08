"use strict";

const db = require("../db");

const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");

/** Related functions for posts. */

class Post {
  /**
   * Create post with data.
   *
   * Inserts data into posts table
   *  Returns {id, datePosted, postedBy, jobId, deadline, progress, urgency, content, tagged, isReply }
   *
   * Inserts association data into post_tagged_users table after post creation
   **/

  static async createPost({
    postedBy,
    jobId,
    deadline,
    progress,
    urgency,
    content,
    tagged = [],
  }) {
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
                     deadline,
                     progress,
                     urgency,
                     content,
                     tagged)
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                    RETURNING id,
                              date_posted AS "datePosted",
                              posted_by AS "postedBy",
                              job_id AS "jobId",
                              deadline,
                              progress,
                              urgency,
                              content,
                              tagged,
                              is_reply AS "isReply"`,
      [postedBy, jobId, deadline, progress, urgency, content, taggedIds]
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
   *  Returns {id, datePosted, postedBy, replyTo, deadline, content, tagged, isReply }
   *
   * Inserts association data into reply_tagged_users table after reply creation
   **/

  static async createReply({
    postedBy,
    replyTo,
    deadline,
    content,
    tagged = [],
  }) {
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
         deadline,
         content,
         tagged)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id,
                  date_posted AS "datePosted",
                  posted_by AS "postedBy",
                  reply_to AS "replyTo",
                  deadline,
                  content,
                  tagged,
                  is_reply AS "isReply"`,
      [postedBy, replyTo, deadline, content, taggedIds]
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
}

module.exports = Post;

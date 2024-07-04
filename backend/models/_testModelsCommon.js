const bcrypt = require("bcrypt");

const db = require("../db");
const { BCRYPT_WORK_FACTOR } = require("../config");

async function commonBeforeAll() {
  await db.query(
    "TRUNCATE job_privileges, job_associations, replies, posts, jobs, users RESTART IDENTITY CASCADE"
  );

  await db.query(
    `INSERT INTO users (email, first_name, last_name, phone, password, organization, title)
            VALUES ('user1@email.com', 'First', 'One', '1111111111', $1, 'Org One', 'Test1'),
                   ('user2@email.com', 'Second', 'Two', '2222222222', $2, 'Org Two', 'Test2'),
                   ('user3@email.com', 'Third', 'Three', '3333333333', $3, 'Org Three', 'Test3'),
                   ('user4@email.com', 'Fourth', 'Four', '4444444444', $4, 'Org Four', 'Test4')`,
    [
      await bcrypt.hash("password1", BCRYPT_WORK_FACTOR),
      await bcrypt.hash("password2", BCRYPT_WORK_FACTOR),
      await bcrypt.hash("password3", BCRYPT_WORK_FACTOR),
      await bcrypt.hash("password4", BCRYPT_WORK_FACTOR),
    ]
  );

  await db.query(
    `INSERT INTO jobs (name, city, state, street_addr, admin)
            VALUES ('Job1', 'City', 'NY', '1 Main St.', 1),
                   ('Job2', 'City', 'NY', '2 Main St.', 2),
                   ('Job3', 'City', 'NY', '3 Main St.', 3),
                   ('Job4', 'City', 'NY', '4 Main St.', 1)`
  );

  await db.query(
    `INSERT INTO job_associations (job_id, user_id)
            VALUES (1,1),
                   (1,2),
                   (2,2),
                   (2,3),
                   (3,3),
                   (3,2),
                   (4,1),
                   (4,2),
                   (4,3)`
  );

  await db.query(
    `INSERT INTO job_privileges (job_id, user_id)
            VALUES (1,1),
                   (2,2),
                   (3,3),
                   (4,1),
                   (4,2),
                   (4,3)`
  );

  await db.query(
    `INSERT INTO posts (posted_by, job_id, content, tagged)
            VALUES (1, 1, 'Welcome to the team', ARRAY [2]),
                   (2, 2, 'Hello World', ARRAY [3]),
                   (3, 3, 'Hi user2!', ARRAY [2]),
                   (1, 4, 'Ready to rumble?', ARRAY [2, 3])`
  );

  await db.query(
    `INSERT INTO posts (posted_by, job_id, content)
            VALUES (1, 4, 'Cookout Friday!!!')`
  );

  await db.query(
    `INSERT INTO replies (posted_by, reply_to, content, tagged)
            VALUES (2, 4, 'I am READY!!', ARRAY [1, 3]),
                   (3, 4, 'Me too! Lets GOOOOO!', ARRAY [1, 2])`
  );
}

async function commonBeforeEach() {
  await db.query("BEGIN");
}

async function commonAfterEach() {
  await db.query("ROLLBACK");
}

async function commonAfterAll() {
  await db.end();
}

module.exports = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
};

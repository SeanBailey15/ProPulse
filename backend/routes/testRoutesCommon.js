"use strict";

const db = require("../db");
const User = require("../models/user");
const Job = require("../models/job");
const Post = require("../models/post");

async function commonBeforeAll() {
  await db.query(
    "TRUNCATE job_privileges, job_associations, replies, posts, jobs, users RESTART IDENTITY CASCADE"
  );

  await User.register({
    email: "user1@email.com",
    password: "password1",
    firstName: "First",
    lastName: "One",
    phone: "1111111111",
    organization: "Org One",
    title: "Test1",
  });
  await User.register({
    email: "user2@email.com",
    password: "password2",
    firstName: "Second",
    lastName: "Two",
    phone: "2222222222",
    organization: "Org Two",
    title: "Test2",
  });
  await User.register({
    email: "user3@email.com",
    password: "password3",
    firstName: "Third",
    lastName: "Three",
    phone: "3333333333",
    organization: "Org Three",
    title: "Test3",
  });
  await User.register({
    email: "user4@email.com",
    password: "password4",
    firstName: "Fourth",
    lastName: "Four",
    phone: "4444444444",
    organization: "Org Four",
    title: "Test4",
  });
  await User.register({
    email: "user5@email.com",
    password: "password5",
    firstName: "Fifth",
    lastName: "Five",
    phone: "5555555555",
    organization: "Org Five",
    title: "Test5",
  });

  const TEST_SUBSCRIPTION =
    '{"endpoint":"https://someendpoint.com","expirationTime":null,"keys":{"p256dh":"fake_p256dh_key","auth":"fake_auth_key"}}';

  const sub = JSON.parse(TEST_SUBSCRIPTION);

  await User.addSubscription(sub, 5);

  await Job.createJob(
    {
      name: "Job One",
      city: "City One",
      state: "NY",
      streetAddr: "1 One Street",
    },
    1
  );
  await Job.createJob(
    {
      name: "Job Two",
      city: "City Two",
      state: "NY",
      streetAddr: "2 Two Street",
    },
    2
  );
  await Job.createJob(
    {
      name: "Job Three",
      city: "City Three",
      state: "NY",
      streetAddr: "3 Three Street",
    },
    3
  );
  await Job.createJob(
    {
      name: "Job Four",
      city: "City Four",
      state: "NY",
      streetAddr: "4 Four Street",
    },
    1
  );
  await Job.createJob(
    {
      name: "Job Five",
      city: "City Five",
      state: "NY",
      streetAddr: "5 Five Street",
    },
    5
  );

  await Job.associate(1, 2, "No");
  await Job.associate(2, 3, "No");
  await Job.associate(3, 2, "No");
  await Job.associate(4, 2, "Yes");
  await Job.associate(4, 3, "Yes");

  await Post.createPost(
    {
      content: "Post 1",
      tagged: ["user2@email.com"],
    },
    1,
    1
  );
  await Post.createPost(
    {
      content: "Post 2",
      tagged: ["user3@email.com"],
    },
    2,
    2
  );
  await Post.createPost(
    {
      content: "Post 3",
      tagged: ["user2@email.com"],
    },
    3,
    3
  );
  await Post.createPost(
    {
      content: "Post 4",
      tagged: ["user2@email.com", "user3@email.com"],
    },
    1,
    4
  );

  await Post.createReply(
    {
      content: "User 2 reply to post 4",
      tagged: ["user1@email.com", "user3@email.com"],
    },
    2,
    4
  );
  await Post.createReply(
    {
      content: "User 3 reply to post 4",
      tagged: ["user1@email.com", "user2@email.com"],
    },
    3,
    4
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

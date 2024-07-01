"use strict";

const { NotFoundError, BadRequestError } = require("../expressError");
const Post = require("../models/post.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("../_testModelsCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** createPost */

describe("createPost", function () {
  let data = {
    content: "This is a new post",
    tagged: ["user2@email.com", "user3@email.com"],
  };
  test("works", async function () {
    let res = await Post.createPost(data, 1, 4);
    expect(res).toEqual({
      id: 6,
      datePosted: expect.any(Date),
      postedBy: 1,
      jobId: 4,
      content: "This is a new post",
      tagged: [2, 3],
      isReply: false,
    });
  });
  test("throws BadRequestError", async function () {
    try {
      await Post.createPost(data, 1, 1);
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** createReply */

describe("createReply", function () {
  let data = {
    content: "This is a reply",
    tagged: ["user1@email.com", "user3@email.com"],
  };
  test("works", async function () {
    let res = await Post.createReply(data, 2, 4);
    expect(res).toEqual({
      id: 3,
      datePosted: expect.any(Date),
      postedBy: 2,
      replyTo: 4,
      content: "This is a reply",
      tagged: [1, 3],
      isReply: true,
    });
  });
  test("throws BadRequestError", async function () {
    try {
      await Post.createReply(data, 3, 1);
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** getPost */

describe("getPost", function () {
  test("works", async function () {
    let res = await Post.getPost(4);
    expect(res).toEqual({
      id: 4,
      datePosted: expect.any(Date),
      creatorId: 1,
      createdBy: "user1@email.com",
      jobId: 4,
      jobName: "Job4",
      content: "Ready to rumble?",
      isReply: false,
      taggedIds: [2, 3],
      taggedUsers: ["user2@email.com", "user3@email.com"],
      replies: [
        {
          id: 1,
          datePosted: expect.any(Date),
          creatorId: 2,
          createdBy: "user2@email.com",
          content: "I am READY!!",
          isReply: true,
          taggedIds: [1, 3],
          taggedUsers: ["user1@email.com", "user3@email.com"],
        },
        {
          id: 2,
          datePosted: expect.any(Date),
          creatorId: 3,
          createdBy: "user3@email.com",
          content: "Me too! Lets GOOOOO!",
          isReply: true,
          taggedIds: [1, 2],
          taggedUsers: ["user1@email.com", "user2@email.com"],
        },
      ],
    });
  });
  test("throws NotFoundError", async function () {
    try {
      await Post.getPost(99);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** getReply */

describe("getReply", function () {
  test("works", async function () {
    let res = await Post.getReply(1);
    expect(res).toEqual({
      id: 1,
      datePosted: expect.any(Date),
      creatorId: 2,
      createdBy: "user2@email.com",
      replyTo: 4,
      jobId: 4,
      content: "I am READY!!",
      isReply: true,
      taggedIds: [1, 3],
      taggedUsers: ["user1@email.com", "user3@email.com"],
    });
  });
  test("throws NotFoundError", async function () {
    try {
      await Post.getReply(99);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

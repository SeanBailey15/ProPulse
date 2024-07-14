"use strict";

const request = require("supertest");
const app = require("../app");

const { sendPushNotification } = require("../helpers/pushNotification");
jest.fn(sendPushNotification);

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("../routes/testRoutesCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

const u1 = async function () {
  const resp = await request(app)
    .post("/auth/login")
    .send({ email: "user1@email.com", password: "password1" });
  return resp.body.token;
};

const u2 = async function () {
  const resp = await request(app)
    .post("/auth/login")
    .send({ email: "user2@email.com", password: "password2" });
  return resp.body.token;
};

const u3 = async function () {
  const resp = await request(app)
    .post("/auth/login")
    .send({ email: "user3@email.com", password: "password3" });
  return resp.body.token;
};

const u4 = async function () {
  const resp = await request(app)
    .post("/auth/login")
    .send({ email: "user4@email.com", password: "password4" });
  return resp.body.token;
};

const u5 = async function () {
  const resp = await request(app)
    .post("/auth/login")
    .send({ email: "user5@email.com", password: "password5" });
  return resp.body.token;
};

/************************************** POST /posts/:jobId */

describe("POST /posts/:jobId", function () {
  test("works for logged in", async function () {
    const u1token = await u1();
    const data = {
      content: "Test post",
      tagged: ["user2@email.com"],
    };

    const resp = await request(app)
      .post("/posts/1")
      .send(data)
      .set("authorization", `Bearer ${u1token}`);
    expect(resp.body).toEqual({
      post: {
        id: 5,
        datePosted: expect.any(String),
        postedBy: 1,
        jobId: 1,
        content: "Test post",
        tagged: [2],
        isReply: false,
      },
    });
  });

  test("badrequest for invalid data", async function () {
    const u1token = await u1();
    const data = {
      content: "Test post",
      tagged: ["user2@email.com"],
      badData: true,
    };

    const resp = await request(app)
      .post("/posts/1")
      .send(data)
      .set("authorization", `Bearer ${u1token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("badrequest for tagged user not associated with job", async function () {
    const u1token = await u1();
    const data = {
      content: "Test post",
      tagged: ["user4@email.com"],
    };

    const resp = await request(app)
      .post("/posts/1")
      .send(data)
      .set("authorization", `Bearer ${u1token}`);
    expect(resp.statusCode).toEqual(400);
    expect(resp.error.text).toEqual(
      '{"error":{"message":"One or more tagged users are not associated with this project","status":400}}'
    );
  });

  test("unauth for current user not associated with job", async function () {
    const u1token = await u1();
    const data = {
      content: "Test post",
      tagged: ["user4@email.com"],
    };

    const resp = await request(app)
      .post("/posts/2")
      .send(data)
      .set("authorization", `Bearer ${u1token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const data = {
      content: "Test post",
      tagged: ["user4@email.com"],
    };

    const resp = await request(app).post("/posts/2").send(data);
    expect(resp.statusCode).toEqual(401);
  });
});

/************************************** POST /posts/reply/:postId */

describe("POST /posts/reply/:postId", function () {
  test("works for logged in", async function () {
    const u2token = await u2();
    const data = {
      content: "User 2 reply to post 1",
      tagged: ["user1@email.com"],
    };

    const resp = await request(app)
      .post("/posts/reply/1")
      .send(data)
      .set("authorization", `Bearer ${u2token}`);
    expect(resp.body).toEqual({
      reply: {
        id: 3,
        datePosted: expect.any(String),
        postedBy: 2,
        replyTo: 1,
        content: "User 2 reply to post 1",
        tagged: [1],
        isReply: true,
      },
    });
  });

  test("badrequest for invalid data", async function () {
    const u2token = await u2();
    const data = {
      content: "User 2 reply to post 1",
      tagged: ["user1@email.com"],
      badData: true,
    };

    const resp = await request(app)
      .post("/posts/reply/1")
      .send(data)
      .set("authorization", `Bearer ${u2token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("badrequest for tagged user not associated with job", async function () {
    const u2token = await u2();
    const data = {
      content: "User 2 reply to post 1",
      tagged: ["user4@email.com"],
      badData: true,
    };

    const resp = await request(app)
      .post("/posts/reply/1")
      .send(data)
      .set("authorization", `Bearer ${u2token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("unauth for current user with no job associations", async function () {
    const u4token = await u4();
    const data = {
      content: "User 4 reply to post 1",
    };

    const resp = await request(app)
      .post("/posts/reply/1")
      .send(data)
      .set("authorization", `Bearer ${u4token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for current user not associated with the job", async function () {
    const u1token = await u1();
    const data = {
      content: "User 4 reply to post 1",
    };

    const resp = await request(app)
      .post("/posts/reply/2")
      .send(data)
      .set("authorization", `Bearer ${u1token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const data = {
      content: "User 2 reply to post 1",
      tagged: ["user4@email.com"],
    };

    const resp = await request(app).post("/posts/reply/1").send(data);
    expect(resp.statusCode).toEqual(401);
  });
});

/************************************** GET /posts/:postId */

describe("GET /posts/:postId", function () {
  test("works for logged in and associated with the job, post without replies", async function () {
    const u1token = await u1();

    const resp = await request(app)
      .get("/posts/1")
      .set("authorization", `Bearer ${u1token}`);
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      post: {
        id: 1,
        datePosted: expect.any(String),
        creatorId: 1,
        createdBy: "user1@email.com",
        jobId: 1,
        jobName: "Job One",
        content: "Post 1",
        isReply: false,
        taggedIds: [2],
        taggedUsers: ["user2@email.com"],
      },
    });
  });

  test("works for logged in and associated with the job, post with replies", async function () {
    const u1token = await u1();

    const resp = await request(app)
      .get("/posts/4")
      .set("authorization", `Bearer ${u1token}`);
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      post: {
        id: 4,
        datePosted: expect.any(String),
        creatorId: 1,
        createdBy: "user1@email.com",
        jobId: 4,
        jobName: "Job Four",
        content: "Post 4",
        isReply: false,
        taggedIds: [2, 3],
        taggedUsers: ["user2@email.com", "user3@email.com"],
        replies: [
          {
            id: 1,
            datePosted: expect.any(String),
            creatorId: 2,
            createdBy: "user2@email.com",
            content: "User 2 reply to post 4",
            isReply: true,
            taggedIds: [1, 3],
            taggedUsers: ["user1@email.com", "user3@email.com"],
          },
          {
            id: 2,
            datePosted: expect.any(String),
            creatorId: 3,
            createdBy: "user3@email.com",
            content: "User 3 reply to post 4",
            isReply: true,
            taggedIds: [1, 2],
            taggedUsers: ["user1@email.com", "user2@email.com"],
          },
        ],
      },
    });
  });

  test("not found for non existent post", async function () {
    const u1token = await u1();

    const resp = await request(app)
      .get("/posts/99")
      .set("authorization", `Bearer ${u1token}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("unauth for current user not associated with the job", async function () {
    const u1token = await u1();

    const resp = await request(app)
      .get("/posts/2")
      .set("authorization", `Bearer ${u1token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for current user with no job associations", async function () {
    const u4token = await u4();

    const resp = await request(app)
      .get("/posts/2")
      .set("authorization", `Bearer ${u4token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app).get("/posts/2");
    expect(resp.statusCode).toEqual(401);
  });
});

/************************************** GET /posts/replies/:replyId */

describe("GET /posts/replies/:replyId", function () {
  test("works for logged in", async function () {
    const u1token = await u1();

    const resp = await request(app)
      .get("/posts/replies/1")
      .set("authorization", `Bearer ${u1token}`);
    expect(resp.body).toEqual({
      reply: {
        id: 1,
        datePosted: expect.any(String),
        creatorId: 2,
        createdBy: "user2@email.com",
        replyTo: 4,
        jobId: 4,
        content: "User 2 reply to post 4",
        isReply: true,
        taggedIds: [1, 3],
        taggedUsers: ["user1@email.com", "user3@email.com"],
      },
    });
  });

  test("not found for non existent reply", async function () {
    const u1token = await u1();

    const resp = await request(app)
      .get("/posts/replies/99")
      .set("authorization", `Bearer ${u1token}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("unauth for current user with no jobs", async function () {
    const u4token = await u4();

    const resp = await request(app)
      .get("/posts/replies/1")
      .set("authorization", `Bearer ${u4token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for current user not associated with the job", async function () {
    const u5token = await u5();

    const resp = await request(app)
      .get("/posts/replies/1")
      .set("authorization", `Bearer ${u5token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app).get("/posts/replies/1");
    expect(resp.statusCode).toEqual(401);
  });
});

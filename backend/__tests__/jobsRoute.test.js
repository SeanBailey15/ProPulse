"use strict";

const request = require("supertest");
const app = require("../app");
const { SECRET_KEY } = require("../config");
const jwt = require("jsonwebtoken");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("../routes/testRoutesCommon");
const Job = require("../models/job");

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

// const u1token = await u1();
// const u2token = await u2();
// const u3token = await u3();
// const u4token = await u4();
// const u5token = await u5();

/************************************** POST /jobs */

describe("POST /jobs", function () {
  test("works for logged in", async function () {
    const u1token = await u1();
    const resp = await request(app)
      .post("/jobs")
      .send({
        name: "Test Job",
        city: "Test City",
        state: "ST",
        streetAddr: "1 Test Street",
      })
      .set("authorization", `Bearer ${u1token}`);
    expect(resp.body).toEqual({
      job: {
        id: expect.any(Number),
        name: "Test Job",
        city: "Test City",
        state: "ST",
        streetAddr: "1 Test Street",
        adminId: 1,
      },
      token: expect.any(String),
    });
  });

  test("bad request for invalid data", async function () {
    const u1token = await u1();

    const resp = await request(app)
      .post("/jobs")
      .send({
        country: "United States",
        name: "Test Job",
        city: "Test City",
        state: "ST",
        streetAddr: "1 Test Street",
      })
      .set("authorization", `Bearer ${u1token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("unauth for anon", async function () {
    const resp = await request(app).post("/jobs").send({
      name: "Test Job",
      city: "Test City",
      state: "ST",
      streetAddr: "1 Test Street",
    });
    expect(resp.statusCode).toEqual(401);
  });
});

/************************************** POST /jobs/invite/:id */

describe("POST /jobs/invite/:id", function () {
  test("works for logged in with job privileges", async function () {
    const u1token = await u1();

    const resp = await request(app)
      .post("/jobs/invite/1")
      .send({ invited: "user5@email.com", privilege: "No" })
      .set("authorization", `Bearer ${u1token}`);
    expect(resp.body).toEqual({
      message: "Invitation sent successfully",
    });
  });

  test("unauth for logged in without privileges", async function () {
    const u2token = await u2();

    const resp = await request(app)
      .post("/jobs/invite/1")
      .send({ invited: "user5@email.com", privilege: "No" })
      .set("authorization", `Bearer ${u2token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
      .post("/jobs/invite/1")
      .send({ invited: "user5@email.com", privilege: "No" });
    expect(resp.statusCode).toEqual(401);
  });

  test("bad request for invalid data", async function () {
    const u1token = await u1();

    const resp = await request(app)
      .post("/jobs/invite/1")
      .send({ invited: "user5@email.com", privilege: "No", badData: true })
      .set("authorization", `Bearer ${u1token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request for user without subscriptions", async function () {
    const u1token = await u1();

    const resp = await request(app)
      .post("/jobs/invite/1")
      .send({ invited: "user2@email.com", privilege: "No" })
      .set("authorization", `Bearer ${u1token}`);
    expect(resp.statusCode).toEqual(400);
    expect(resp.body.error.message).toEqual(
      "This user is not subscribed to notifications"
    );
  });
});

/************************************** GET /jobs/:id */

describe("GET /jobs/:id", function () {
  test("works for logged in and associated with job", async function () {
    const u1token = await u1();

    const resp = await request(app)
      .get("/jobs/1")
      .set("authorization", `Bearer ${u1token}`);
    expect(resp.body).toEqual({
      job: {
        id: 1,
        name: "Job One",
        city: "City One",
        state: "NY",
        streetAddr: "1 One Street",
        adminId: 1,
        adminEmail: "user1@email.com",
        privilege: true,
        posts: [
          {
            id: 1,
            datePosted: expect.any(String),
            postedBy: "user1@email.com",
            content: "Post 1",
          },
        ],
        users: [
          {
            id: 2,
            email: "user2@email.com",
            organization: "Org Two",
            title: "Test2",
          },
        ],
      },
    });
  });

  test("unauth for not associated with job", async function () {
    const u3token = await u3();

    const resp = await request(app)
      .get("/jobs/1")
      .set("authorization", `Bearer ${u3token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app).get("/jobs/1");
    expect(resp.statusCode).toEqual(401);
  });
});

/************************************** GET /jobs/user/:id */

describe("GET /jobs/user/:id", function () {
  test("works for logged in and self", async function () {
    const u1token = await u1();

    const resp = await request(app)
      .get("/jobs/user/1")
      .set("authorization", `Bearer ${u1token}`);

    expect(resp.body).toEqual({
      jobs: [
        {
          id: 1,
          name: "Job One",
          city: "City One",
          state: "NY",
          streetAddr: "1 One Street",
          adminId: 1,
          date_created: expect.any(String),
          adminEmail: "user1@email.com",
        },
        {
          id: 4,
          name: "Job Four",
          city: "City Four",
          state: "NY",
          streetAddr: "4 Four Street",
          adminId: 1,
          date_created: expect.any(String),
          adminEmail: "user1@email.com",
        },
      ],
    });
  });

  test("unauth for not self", async function () {
    const u1token = await u1();

    const resp = await request(app)
      .get("/jobs/user/2")
      .set("authorization", `Bearer ${u1token}`);

    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app).get("/jobs/user/2");
    expect(resp.statusCode).toEqual(401);
  });
});

/************************************** POST /jobs/:id/remove/:userId */

describe("POST /jobs/:id/remove/:userId", function () {
  test("works for logged in with privileges", async function () {
    const u1token = await u1();

    const resp = await request(app)
      .post("/jobs/1/remove/2")
      .set("authorization", `Bearer ${u1token}`);

    expect(resp.body).toEqual({
      message: "The user was removed from the project",
    });
  });
});

/************************************** POST /jobs/accept */

describe("POST /jobs/accept", function () {
  test("works for logged in and privilege granted", async function () {
    const u5token = await u5();

    const tokenPayload = {
      invited: 5,
      privilege: "Yes",
      jobId: 1,
    };

    const token = jwt.sign(tokenPayload, SECRET_KEY);
    const resp = await request(app)
      .post(`/jobs/accept`)
      .query({ token: token })
      .set("authorization", `Bearer ${u5token}`);

    expect(resp.body).toEqual({
      message: "You have been added to the project as a trusted user!",
      detail: "As a trusted user, you may invite other users to the project!",
    });
  });

  test("works for logged in and no privilege granted", async function () {
    const u5token = await u5();

    const tokenPayload = {
      invited: 5,
      privilege: "No",
      jobId: 1,
    };

    const token = jwt.sign(tokenPayload, SECRET_KEY);
    const resp = await request(app)
      .post(`/jobs/accept`)
      .query({ token: token })
      .set("authorization", `Bearer ${u5token}`);

    expect(resp.body).toEqual({
      message: "You have been added to the project!",
    });
  });

  test("bad request for user already associated with the job", async function () {
    const u1token = await u1();

    const tokenPayload = {
      invited: 1,
      privilege: "No",
      jobId: 1,
    };

    const token = jwt.sign(tokenPayload, SECRET_KEY);
    const resp = await request(app)
      .post(`/jobs/accept`)
      .query({ token: token })
      .set("authorization", `Bearer ${u1token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("unauth for anon", async function () {
    const tokenPayload = {
      invited: 1,
      privilege: "No",
      jobId: 1,
    };

    const token = jwt.sign(tokenPayload, SECRET_KEY);
    const resp = await request(app)
      .post(`/jobs/accept`)
      .query({ token: token });
    expect(resp.statusCode).toEqual(401);
  });
});

"use strict";

const request = require("supertest");
const app = require("../app");

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

/************************************** GET /users/:id */

describe("GET /users/:id", function () {
  test("works for self", async function () {
    const u1token = await u1();

    const resp = await request(app)
      .get("/users/1")
      .set("authorization", `Bearer ${u1token}`);
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      user: {
        id: 1,
        email: "user1@email.com",
        firstName: "First",
        lastName: "One",
        phone: "1111111111",
        title: "Test1",
        organization: "Org One",
        active: true,
        subscriptions: null,
        jobs: [
          {
            id: 1,
            name: "Job One",
            city: "City One",
            state: "NY",
            streetAddr: "1 One Street",
            adminId: 1,
            adminEmail: "user1@email.com",
          },
          {
            id: 4,
            name: "Job Four",
            city: "City Four",
            state: "NY",
            streetAddr: "4 Four Street",
            adminId: 1,
            adminEmail: "user1@email.com",
          },
        ],
      },
    });
  });

  test("works for other with common job association", async function () {
    const u2token = await u2();

    const resp = await request(app)
      .get("/users/1")
      .set("authorization", `Bearer ${u2token}`);
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      user: {
        id: 1,
        email: "user1@email.com",
        firstName: "First",
        lastName: "One",
        phone: "1111111111",
        title: "Test1",
        organization: "Org One",
        active: true,
        subscriptions: null,
        jobs: [
          {
            id: 1,
            name: "Job One",
            city: "City One",
            state: "NY",
            streetAddr: "1 One Street",
            adminId: 1,
            adminEmail: "user1@email.com",
          },
          {
            id: 4,
            name: "Job Four",
            city: "City Four",
            state: "NY",
            streetAddr: "4 Four Street",
            adminId: 1,
            adminEmail: "user1@email.com",
          },
        ],
      },
    });
  });

  test("unauth for other with NO job associations", async function () {
    const u4token = await u4();

    const resp = await request(app)
      .get("/users/1")
      .set("authorization", `Bearer ${u4token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for other without common job associations", async function () {
    const u5token = await u5();

    const resp = await request(app)
      .get("/users/1")
      .set("authorization", `Bearer ${u5token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app).get("/users/1");
    expect(resp.statusCode).toEqual(401);
  });

  test("not found for no user", async function () {
    const u1token = await u1();

    const resp = await request(app)
      .get("/users/99")
      .set("authorization", `Bearer ${u1token}`);
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** PATCH /users/:id */

describe("PATCH /users/:id", function () {
  test("works for self", async function () {
    const u1token = await u1();

    const resp = await request(app)
      .patch("/users/1")
      .send({
        lastName: "Uno",
        organization: "Org Uno",
      })
      .set("authorization", `Bearer ${u1token}`);
    expect(resp.body).toEqual({
      user: {
        email: "user1@email.com",
        firstName: "First",
        lastName: "Uno",
        phone: "1111111111",
        organization: "Org Uno",
        title: "Test1",
        active: true,
        subscriptions: null,
        jobs: [1, 4],
      },
      token: expect.any(String),
    });
  });

  test("unauth for other", async function () {
    const u1token = await u1();

    const resp = await request(app)
      .patch("/users/2")
      .send({
        lastName: "Uno",
        organization: "Org Uno",
      })
      .set("authorization", `Bearer ${u1token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app).patch("/users/1").send({
      lastName: "Uno",
      organization: "Org Uno",
    });

    expect(resp.statusCode).toEqual(401);
  });

  test("bad request for invalid data", async function () {
    const u1token = await u1();

    const resp = await request(app)
      .patch("/users/1")
      .send({
        dinner: "Pizza",
      })
      .set("authorization", `Bearer ${u1token}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** PATCH /users/deactivate/:id */

describe("PATCH /users/deactivate/:id", function () {
  test("works for self", async function () {
    const u1token = await u1();

    const resp = await request(app)
      .patch("/users/deactivate/1")
      .set("authorization", `Bearer ${u1token}`);
    expect(resp.body).toEqual({
      message: "User deactivated",
    });
  });

  test("unauth for other", async function () {
    const u1token = await u1();

    const resp = await request(app)
      .patch("/users/deactivate/2")
      .set("authorization", `Bearer ${u1token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app).patch("/users/deactivate/2");
    expect(resp.statusCode).toEqual(401);
  });
});

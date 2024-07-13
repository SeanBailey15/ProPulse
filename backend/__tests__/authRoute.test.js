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

/************************************** POST /auth/login*/

describe("POST /auth/login", function () {
  test("works for known user", async function () {
    const resp = await request(app)
      .post("/auth/login")
      .send({ email: "user1@email.com", password: "password1" });
    expect(resp.body).toEqual({
      token: expect.any(String),
    });
  });

  test("badrequest for invalid data", async function () {
    const resp = await request(app)
      .post("/auth/login")
      .send({ email: "user1@email.com", password: "password1", badData: true });
    expect(resp.statusCode).toEqual(400);
  });

  test("unauth for invalid email/password combination", async function () {
    const resp1 = await request(app)
      .post("/auth/login")
      .send({ email: "user1@email.com", password: "password" });
    expect(resp1.statusCode).toEqual(401);
    const resp2 = await request(app)
      .post("/auth/login")
      .send({ email: "user@email.com", password: "password" });
    expect(resp2.statusCode).toEqual(401);
  });
});

/************************************** POST /auth/register*/

describe("POST /auth/register", function () {
  const data = {
    email: "newuser@email.com",
    firstName: "New",
    lastName: "Guy",
    phone: "7777777777",
    password: "newpassword",
    organization: "New Org",
    title: "New Dev",
  };
  test("works", async function () {
    const resp = await request(app).post("/auth/register").send(data);
    expect(resp.body).toEqual({
      token: expect.any(String),
    });
  });

  test("badrequest for invalid data", async function () {
    const badData = {
      ...data,
      badData: true,
    };
    const resp = await request(app).post("/auth/register").send(badData);
    expect(resp.statusCode).toEqual(400);
  });

  test("badrequest for duplicate email", async function () {
    const resp1 = await request(app).post("/auth/register").send(data);
    expect(resp1.body).toEqual({
      token: expect.any(String),
    });
    const resp2 = await request(app).post("/auth/register").send(data);
    expect(resp2.statusCode).toEqual(400);
    expect(resp2.error.text).toEqual(
      '{"error":{"message":"Duplicate email: newuser@email.com already exists","status":400}}'
    );
  });
});

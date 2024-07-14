"use strict";

const jwt = require("jsonwebtoken");
const request = require("supertest");
const app = require("../app.js");
const { UnauthorizedError } = require("../expressError.js");

const {
  authenticateJWT,
  ensureLoggedIn,
  ensureJobMatch,
  ensureSelf,
  ensurePrivileges,
  ensureAdmin,
} = require("../middleware/auth.js");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("../models/_testModelsCommon.js");

// FUNCTION TO GET TOKENS, PROVIDED BY THE LOGIN ROUTE, USING REAL "USER" DATA FROM THE TEST DATABASE
const tokenWithJobs = async function () {
  const resp = await request(app)
    .post("/auth/login")
    .send({ email: "user1@email.com", password: "password1" });
  return resp.body.token;
};

const tokenNoJobs = async function () {
  const resp = await request(app)
    .post("/auth/login")
    .send({ email: "user4@email.com", password: "password4" });
  return resp.body.token;
};
//******************************************************************

// MOCK TOKEN USING BAD SECRET_KEY
const badJwt = jwt.sign(
  { id: 5, email: "user5@email.com", jobs: [8, 9] },
  "wrong"
);

// SETUP/TEARDOWN FOR TEST DATABASE
beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** authenticateJWT */

describe("authenticateJWT", function () {
  test("works: via header - user with jobs", async function () {
    expect.assertions(2);

    const token = await tokenWithJobs();

    const req = {
      headers: { authorization: `Bearer ${token}` },
    };
    const res = { locals: {} };
    const next = function (err) {
      expect(err).toBeFalsy();
    };
    authenticateJWT(req, res, next);

    expect(res.locals).toEqual({
      user: {
        iat: expect.any(Number),
        id: 1,
        email: "user1@email.com",
        jobs: [1, 4],
      },
    });
  });

  test("works: via header - user without jobs", async function () {
    expect.assertions(2);

    const token = await tokenNoJobs();

    const req = {
      headers: { authorization: `Bearer ${token}` },
    };
    const res = { locals: {} };
    const next = function (err) {
      expect(err).toBeFalsy();
    };
    authenticateJWT(req, res, next);
    expect(res.locals).toEqual({
      user: {
        iat: expect.any(Number),
        id: 4,
        email: "user4@email.com",
        message: "The user is not associated with any projects",
      },
    });
  });

  test("works: no header", function () {
    expect.assertions(2);
    const req = {};
    const res = { locals: {} };
    const next = function (err) {
      expect(err).toBeFalsy();
    };
    authenticateJWT(req, res, next);
    expect(res.locals).toEqual({});
  });

  test("works: invalid token", function () {
    expect.assertions(2);
    const req = { headers: { authorization: `Bearer ${badJwt}` } };
    const res = { locals: {} };
    const next = function (err) {
      expect(err).toBeFalsy();
    };
    authenticateJWT(req, res, next);
    expect(res.locals).toEqual({});
  });
});

/************************************** ensureLoggedIn */

describe("ensureLoggedIn", function () {
  test("works", function () {
    expect.assertions(1);
    const req = {};
    const res = {
      locals: { user: { id: 1, email: "user1@email.com", jobs: [1, 2] } },
    };
    const next = function (err) {
      expect(err).toBeFalsy();
    };
    ensureLoggedIn(req, res, next);
  });

  test("unauth if no login", function () {
    expect.assertions(1);
    const req = {};
    const res = { locals: {} };
    const next = function (err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    };
    ensureLoggedIn(req, res, next);
  });
});

/************************************** ensureLoggedIn */

describe("ensureJobMatch", function () {
  test("works", function () {
    expect.assertions(1);
    const req = { params: { id: 1 } };
    const res = {
      locals: { user: { id: 1, email: "user1@email.com", jobs: [1, 2] } },
    };
    const next = function (err) {
      expect(err).toBeFalsy();
    };
    ensureJobMatch(req, res, next);
  });

  test("unauth if no job match", function () {
    expect.assertions(1);
    const req = { params: { id: 9 } };
    const res = {
      locals: { user: { id: 1, email: "user1@email.com", jobs: [1, 2] } },
    };
    const next = function (err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    };
    ensureJobMatch(req, res, next);
  });
});

/************************************** ensureSelf */

describe("ensureSelf", function () {
  test("works", function () {
    expect.assertions(1);
    const req = { params: { id: 1 } };
    const res = {
      locals: { user: { id: 1, email: "user1@email.com", jobs: [1, 2] } },
    };
    const next = function (err) {
      expect(err).toBeFalsy();
    };
    ensureSelf(req, res, next);
  });

  test("unauth if not self", function () {
    expect.assertions(1);
    const req = { params: { id: 2 } };
    const res = {
      locals: { user: { id: 1, email: "user1@email.com", jobs: [1, 2] } },
    };
    const next = function (err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    };
    ensureSelf(req, res, next);
  });
});

/************************************** ensurePrivileges */

describe("ensurePrivileges", function () {
  test("works", async function () {
    expect.assertions(1);
    const req = { params: { id: 1 } };
    const res = {
      locals: { user: { id: 1, email: "user1@email.com", jobs: [1, 4] } },
    };
    const next = function (err) {
      expect(err).toBeFalsy();
    };
    ensurePrivileges(req, res, next);
  });

  test("unauth if no privileges for job", async function () {
    expect.assertions(0);
    const req = { params: { id: 1 } };
    const res = {
      locals: {
        user: {
          id: 4,
          email: "user4@email.com",
          message: "The user is not associated with any projects",
        },
      },
    };
    const next = function (err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    };
    ensurePrivileges(req, res, next);
  });
});

describe("ensureAdmin", function () {
  test("works", function () {
    expect.assertions(1);
    const req = { params: { id: 1 } };
    const res = {
      locals: { user: { id: 1, email: "user1@email.com", jobs: [1, 4] } },
    };
    const next = function (err) {
      expect(err).toBeFalsy();
    };
    ensureAdmin(req, res, next);
  });

  test("unauth if not admin", function () {
    expect.assertions(2);
    const req = { params: { id: 1 } };
    const res = {
      locals: {
        user: {
          id: 4,
          email: "user4@email.com",
          message: "The user is not associated with any projects",
        },
      },
    };
    const next = function (err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    };
    ensureAdmin(req, res, next);
  });
});

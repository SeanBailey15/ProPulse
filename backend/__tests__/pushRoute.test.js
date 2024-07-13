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

/************************************** POST /push/subscribe/:id*/

describe("POST /push/subscribe/:id", function () {
  const sub = {
    endpoint: "https://someendpoint.com",
    expirationTime: null,
    keys: {
      p256dh: "fake_p256dh_key",
      auth: "fake_auth_key",
    },
  };
  test("works", async function () {
    const resp = await request(app).post("/push/subscribe/1").send(sub);
    expect(resp.body).toEqual({
      message: "Subscription added successfully",
    });
  });

  test("badrequest for invalid data", async function () {
    const badData = {
      endpoint: "https://someendpoint.com",
      expirationTime: null,
      keys: {
        p256dh: "fake_p256dh_key",
        auth: "fake_auth_key",
      },
      badData: true,
    };
    const resp = await request(app).post("/push/subscribe/1").send(badData);
    expect(resp.statusCode).toEqual(400);
  });

  test("badrequest for duplicate subscriptions", async function () {
    const respGood = await request(app).post("/push/subscribe/1").send(sub);
    expect(respGood.body).toEqual({
      message: "Subscription added successfully",
    });

    const respBad = await request(app).post("/push/subscribe/1").send(sub);
    expect(respBad.statusCode).toEqual(400);
    expect(respBad.error.text).toEqual(
      '{"error":{"message":"Subscription already exists","status":400}}'
    );
  });
});

const jwt = require("jsonwebtoken");
const { createToken } = require("../helpers/tokens");
const { SECRET_KEY } = require("../config");

describe("createToken", function () {
  test("works: user with jobs", function () {
    const token = createToken({
      id: 1,
      email: "user1@email.com",
      jobs: [1, 2],
    });
    const payload = jwt.verify(token, SECRET_KEY);
    expect(payload).toEqual({
      iat: expect.any(Number),
      id: 1,
      email: "user1@email.com",
      jobs: [1, 2],
    });
  });

  test("works: user without jobs ", function () {
    const token = createToken({
      id: 2,
      email: "user2@email.com",
      message: "The user is not associated with any projects",
    });
    const payload = jwt.verify(token, SECRET_KEY);
    expect(payload).toEqual({
      iat: expect.any(Number),
      id: 2,
      email: "user2@email.com",
      message: "The user is not associated with any projects",
    });
  });
});

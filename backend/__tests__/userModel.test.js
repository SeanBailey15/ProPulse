"use strict";

const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");
const db = require("../db.js");
const User = require("../models/user.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testModelsCommon");
const { subscribe } = require("../routes/posts.js");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** authenticate */

describe("authenticate", function () {
  test("works", async function () {
    let res = await User.authenticate("user1@email.com", "password1");
    expect(res).toEqual({
      id: 1,
      email: "user1@email.com",
      firstName: "First",
      lastName: "One",
      phone: "1111111111",
      organization: "Org One",
      title: "Test1",
      profileImg: null,
    });
  });
  test("throws UnauthorizedError", async function () {
    try {
      await User.authenticate("user1@email.com", "wrong");
      fail();
    } catch (err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    }
  });
});

/************************************** register */

describe("register", function () {
  let data = {
    email: "new@email.com",
    password: "newguy",
    firstName: "New",
    lastName: "Guy",
    phone: "5555555555",
    organization: "New Org",
    title: "TestNew",
  };
  let badData = {
    email: "user1@email.com",
    password: "newguy",
    firstName: "New",
    lastName: "Guy",
    phone: "5555555555",
    organization: "New Org",
    title: "TestNew",
  };

  test("register new user", async function () {
    let res = await User.register(data);
    expect(res).toEqual({
      id: 5,
      email: "new@email.com",
      firstName: "New",
      lastName: "Guy",
      phone: "5555555555",
      organization: "New Org",
      title: "TestNew",
      profileImg: null,
    });
  });
  test("throws BadRequestError", async function () {
    try {
      await User.register(badData);
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** get */

describe("get", function () {
  test("get user by id", async function () {
    let res = await User.get(1);
    expect(res).toEqual({
      id: 1,
      email: "user1@email.com",
      firstName: "First",
      lastName: "One",
      phone: "1111111111",
      organization: "Org One",
      title: "Test1",
      profileImg: null,
      active: true,
      subscriptions: null,
      jobs: [
        {
          adminEmail: "user1@email.com",
          adminId: 1,
          city: "City",
          id: 1,
          name: "Job1",
          state: "NY",
          streetAddr: "1 Main St.",
        },
        {
          adminEmail: "user1@email.com",
          adminId: 1,
          city: "City",
          id: 4,
          name: "Job4",
          state: "NY",
          streetAddr: "4 Main St.",
        },
      ],
    });
  });
  test("throws NotFoundError", async function () {
    try {
      let res = await User.get(99);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** getByEmail */

describe("getByEmail", function () {
  test("get user by email", async function () {
    let res = await User.getByEmail("user2@email.com");
    expect(res).toEqual({
      id: 2,
      email: "user2@email.com",
      firstName: "Second",
      lastName: "Two",
      phone: "2222222222",
      organization: "Org Two",
      title: "Test2",
      profileImg: null,
      active: true,
      subscriptions: null,
    });
  });
  test("throws NotFoundError", async function () {
    try {
      await User.getByEmail("wrong@email.com");
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** getAll */

describe("getAll", function () {
  test("get all users", async function () {
    let res = await User.getAll();
    expect(res).toEqual([
      {
        id: 1,
        email: "user1@email.com",
        firstName: "First",
        lastName: "One",
        phone: "1111111111",
        organization: "Org One",
        title: "Test1",
        profileImg: null,
        active: true,
        subscriptions: null,
      },
      {
        id: 2,
        email: "user2@email.com",
        firstName: "Second",
        lastName: "Two",
        phone: "2222222222",
        organization: "Org Two",
        title: "Test2",
        profileImg: null,
        active: true,
        subscriptions: null,
      },
      {
        id: 3,
        email: "user3@email.com",
        firstName: "Third",
        lastName: "Three",
        phone: "3333333333",
        organization: "Org Three",
        title: "Test3",
        profileImg: null,
        active: true,
        subscriptions: null,
      },
      {
        id: 4,
        email: "user4@email.com",
        firstName: "Fourth",
        lastName: "Four",
        phone: "4444444444",
        organization: "Org Four",
        title: "Test4",
        profileImg: null,
        active: true,
        subscriptions: null,
      },
    ]);
  });
});

/************************************** update */

describe("update", function () {
  let data = {
    email: "userone@email.com",
    last_name: "Uno",
    title: "Number One Dev",
  };
  test("update user info", async function () {
    let res = await User.update(1, data);
    expect(res).toEqual({
      email: "userone@email.com",
      firstName: "First",
      lastName: "Uno",
      phone: "1111111111",
      organization: "Org One",
      title: "Number One Dev",
      profileImg: null,
      active: true,
      subscriptions: null,
    });
  });
  test("throws NotFoundError", async function () {
    try {
      await User.update(99, data);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** deactivate */

describe("deactivate", function () {
  test("deactivate a user", async function () {
    let res = await User.deactivate(1);
    expect(res).toEqual({ message: "User deactivated" });

    // User now inactive, User.get throws NotFoundError
    try {
      await User.get(1);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
  test("throws NotFoundError", async function () {
    try {
      await User.deactivate(99);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** addSubscription */

describe("addSubscription", function () {
  let sub = {
    endpoint: "An http endpoint for push notifications",
    userAuth: "user auth key",
    userPublicKey: "another key",
  };
  test("add subscription for user", async function () {
    let res = await User.addSubscription(sub, 1);
    expect(res).toEqual({ message: "Subscription added successfully" });

    let subRes = await User.get(1);
    expect(subRes.subscriptions).toEqual([
      {
        endpoint: "An http endpoint for push notifications",
        userAuth: "user auth key",
        userPublicKey: "another key",
      },
    ]);

    // Now try to add a duplicate subscription
    try {
      await User.addSubscription(sub, 1);
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});
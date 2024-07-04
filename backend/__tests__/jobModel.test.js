"use strict";

const { NotFoundError, BadRequestError } = require("../expressError");
const Job = require("../models/job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("../models/_testModelsCommon.js");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** createJob */

describe("createJob", function () {
  let newJob = {
    name: "Test",
    city: "City",
    state: "CA",
    streetAddr: "1 Beach St.",
  };

  test("works", async function () {
    let job = await Job.createJob(newJob, 1);
    expect(job).toEqual({
      ...newJob,
      adminId: 1,
      id: expect.any(Number),
    });
  });
});

/************************************** findUserJobs */

describe("findUserJobs", function () {
  test("gets user1's jobs", async function () {
    let res = await Job.findUserJobs(1);
    expect(res).toEqual([
      {
        id: 1,
        name: "Job1",
        city: "City",
        state: "NY",
        streetAddr: "1 Main St.",
        date_created: expect.any(Date),
        adminId: 1,
        adminEmail: "user1@email.com",
      },
      {
        id: 4,
        name: "Job4",
        city: "City",
        state: "NY",
        streetAddr: "4 Main St.",
        date_created: expect.any(Date),
        adminId: 1,
        adminEmail: "user1@email.com",
      },
    ]);
  });
  test("gets user2's jobs", async function () {
    let res = await Job.findUserJobs(2);
    expect(res).toEqual([
      {
        id: 1,
        name: "Job1",
        city: "City",
        state: "NY",
        streetAddr: "1 Main St.",
        date_created: expect.any(Date),
        adminId: 1,
        adminEmail: "user1@email.com",
      },
      {
        id: 2,
        name: "Job2",
        city: "City",
        state: "NY",
        streetAddr: "2 Main St.",
        date_created: expect.any(Date),
        adminId: 2,
        adminEmail: "user2@email.com",
      },
      {
        id: 3,
        name: "Job3",
        city: "City",
        state: "NY",
        streetAddr: "3 Main St.",
        date_created: expect.any(Date),
        adminId: 3,
        adminEmail: "user3@email.com",
      },
      {
        id: 4,
        name: "Job4",
        city: "City",
        state: "NY",
        streetAddr: "4 Main St.",
        date_created: expect.any(Date),
        adminId: 1,
        adminEmail: "user1@email.com",
      },
    ]);
  });
  test("gets user3's jobs", async function () {
    let res = await Job.findUserJobs(3);
    expect(res).toEqual([
      {
        id: 2,
        name: "Job2",
        city: "City",
        state: "NY",
        streetAddr: "2 Main St.",
        date_created: expect.any(Date),
        adminId: 2,
        adminEmail: "user2@email.com",
      },
      {
        id: 3,
        name: "Job3",
        city: "City",
        state: "NY",
        streetAddr: "3 Main St.",
        date_created: expect.any(Date),
        adminId: 3,
        adminEmail: "user3@email.com",
      },
      {
        id: 4,
        name: "Job4",
        city: "City",
        state: "NY",
        streetAddr: "4 Main St.",
        date_created: expect.any(Date),
        adminId: 1,
        adminEmail: "user1@email.com",
      },
    ]);
  });
  test("gets user4's jobs (no jobs = message)", async function () {
    let res = await Job.findUserJobs(4);
    expect(res).toEqual({
      message: "The user is not associated with any projects",
    });
  });
});

/************************************** getJob */

// MUST UPDATE ONCE POSTS ARE INCLUDED!!!!!!!

describe("getJob", function () {
  test("gets job1 as user1", async function () {
    let res = await Job.getJob(1, 1);
    expect(res).toEqual({
      id: 1,
      name: "Job1",
      city: "City",
      state: "NY",
      streetAddr: "1 Main St.",
      adminId: 1,
      adminEmail: "user1@email.com",
      privilege: true,
      users: [
        {
          id: 2,
          email: "user2@email.com",
          organization: "Org Two",
          title: "Test2",
        },
      ],
      posts: [
        {
          id: 1,
          datePosted: expect.any(Date),
          postedBy: "user1@email.com",
          content: "Welcome to the team",
        },
      ],
    });
  });
  test("gets job1 as user2 (no job privilege)", async function () {
    let res = await Job.getJob(1, 2);
    expect(res).toEqual({
      id: 1,
      name: "Job1",
      city: "City",
      state: "NY",
      streetAddr: "1 Main St.",
      adminId: 1,
      adminEmail: "user1@email.com",
      privilege: false,
      users: [
        {
          id: 2,
          email: "user2@email.com",
          organization: "Org Two",
          title: "Test2",
        },
      ],
      posts: [
        {
          id: 1,
          datePosted: expect.any(Date),
          postedBy: "user1@email.com",
          content: "Welcome to the team",
        },
      ],
    });
  });
  test("gets job4 as user2", async function () {
    let res = await Job.getJob(4, 2);
    expect(res).toEqual({
      id: 4,
      name: "Job4",
      city: "City",
      state: "NY",
      streetAddr: "4 Main St.",
      adminId: 1,
      adminEmail: "user1@email.com",
      privilege: true,
      users: [
        {
          id: 2,
          email: "user2@email.com",
          organization: "Org Two",
          title: "Test2",
        },
        {
          id: 3,
          email: "user3@email.com",
          organization: "Org Three",
          title: "Test3",
        },
      ],
      posts: [
        {
          id: 4,
          datePosted: expect.any(Date),
          postedBy: "user1@email.com",
          content: "Ready to rumble?",
        },
        {
          id: 5,
          datePosted: expect.any(Date),
          postedBy: "user1@email.com",
          content: "Cookout Friday!!!",
        },
      ],
    });
  });
  test("throws NotFoundError", async function () {
    try {
      await Job.getJob(5, 1);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** associate */

describe("associate", function () {
  test("associate job1 with user3 without privilege", async function () {
    let res = await Job.associate(1, 3, "No");
    expect(res).toEqual({
      message: "You have been added to the project!",
    });
  });
  test("associate job2 with user1 with privilege", async function () {
    let res = await Job.associate(2, 1, "Yes");
    expect(res).toEqual({
      message: "You have been added to the project as a trusted user!",
      detail: "As a trusted user, you may invite other users to the project!",
    });
  });
  test("throws BadRequestError", async function () {
    try {
      await Job.associate(1, 2, "Yes");
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** dissociate */

describe("dissociate", function () {
  test("dissociate job1 with user2", async function () {
    let res = await Job.dissociate(1, 2);
    expect(res).toEqual({
      message: "The user was removed from the project",
    });
  });
  test("throws BadRequestError", async function () {
    try {
      await Job.dissociate(1, 3);
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** givePrivilege */

describe("givePrivilege", function () {
  test("grant privilege for job1 to user2", async function () {
    let res = await Job.givePrivilege(1, 2);
    expect(res).toEqual({
      message: "You have added the user to the project as a trusted user!",
      detail: "As a trusted user, they may invite other users to the project!",
    });
  });
  test("throws BadRequestError ()", async function () {
    try {
      await Job.givePrivilege(1, 3);
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
      expect(err.message).toEqual(
        "The user is not associated with this project"
      );
    }
  });
  test("throws BadRequestError ()", async function () {
    try {
      await Job.givePrivilege(1, 1);
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
      expect(err.message).toEqual(
        "The user already has privileges for this project"
      );
    }
  });
});

/************************************** isTrusted */

describe("isTrusted", function () {
  test("check if user2 has privileges for job1", async function () {
    let res = await Job.isTrusted(1, 2);
    expect(res).toEqual(false);
  });
  test("check if user2 has privileges for job4", async function () {
    let res = await Job.isTrusted(4, 2);
    expect(res).toEqual(true);
  });
});

/************************************** update */

describe("update", function () {
  let data = {
    name: "Updated1",
    city: "New City",
    streetAddr: "1 Broadway",
  };
  test("update data for job1", async function () {
    let res = await Job.update(1, data);
    expect(res).toEqual({
      id: 1,
      name: "Updated1",
      city: "New City",
      state: "NY",
      streetAddr: "1 Broadway",
      adminId: 1,
    });
  });
  test("throws NotFoundError", async function () {
    try {
      await Job.update(5, data);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** transferAdmin */

describe("transferAdmin", function () {
  test("transfer admin for job1 to user 2", async function () {
    let res = await Job.transferAdmin(1, 2);
    expect(res).toEqual({
      message: "Admin transfer successful",
    });
  });
  test("throws BadRequestError", async function () {
    try {
      await Job.transferAdmin(1, 2);
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

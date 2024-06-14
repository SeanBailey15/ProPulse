const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");

/** return signed JWT from user data. */

function createToken(user) {
  let payload;
  if (user.jobs) {
    payload = {
      id: user.id, // needed to pass into some requests
      email: user.email, // needed for display purposes
      jobs: user.jobs, // needed for authorization checks
      profileImg: user.profileImg, // needed to display img on various routes
    };
  } else {
    payload = {
      id: user.id,
      email: user.email,
      message: user.message, // will be in the token if no jobs are available
      profileImg: user.profileImg,
    };
  }

  return jwt.sign(payload, SECRET_KEY);
}

module.exports = { createToken };

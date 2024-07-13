const { JEST_CONFIG_ROOT_PATH } = require("./config");

module.exports = {
  setupFiles: [`${JEST_CONFIG_ROOT_PATH}/jest.setup.js`],
  testPathIgnorePatterns: ["/node_modules/", "config.js"],
};

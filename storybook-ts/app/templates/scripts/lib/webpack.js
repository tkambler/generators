const path = require('path');
const webpackConfigPath = path.resolve(__dirname, '../../.storybook/webpack.config.js');

module.exports = require(webpackConfigPath)({
  config: {}
});

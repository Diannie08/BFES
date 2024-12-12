const webpack = require('webpack');
const path = require('path');

module.exports = function override(config) {
  // Disable source map loading for react-router-dom
  config.module.rules = config.module.rules.map(rule => {
    if (rule.loader && rule.loader.includes('source-map-loader')) {
      rule.exclude = [
        /react-router-dom/,
        path.resolve(__dirname, 'node_modules/react-router-dom')
      ];
    }
    return rule;
  });

  // Remove source-map-loader completely
  config.module.rules = config.module.rules.filter(
    rule => !rule.loader || !rule.loader.includes('source-map-loader')
  );

  return config;
};

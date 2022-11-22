'use strict';

const { merge } = require('webpack-merge');

const common = require('./webpack.common.js');
const PATHS = require('./paths');

// Merge webpack configuration files
const config = (env, argv) =>
  merge(common, {
    entry: {
      fetch_homework_storage: PATHS.src + '/fetch_homework_storage.js',
      show_homework_storage: PATHS.src + '/show_homework_storage.js',
      popup: PATHS.src + '/popup.js',
    },
    devtool: argv.mode === 'production' ? false : 'source-map',
  });

module.exports = config;

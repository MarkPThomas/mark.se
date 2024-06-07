const path = require('path');
const webpackNodeExternals = require('webpack-node-externals');
const { merge } = require('webpack-merge');
const sharedConfig = require('./webpack.shared.config.js');

let config = {
  target: 'node',

  entry: './src/index.ts',

  output: {
    path: path.join(__dirname, './dist'),
    filename: 'bundle.js',
    hashFunction: 'xxhash64',
  },

  externals: [webpackNodeExternals()],

  module: {
  },
};

module.exports = merge(sharedConfig, config);

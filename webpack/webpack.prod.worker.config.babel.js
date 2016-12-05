import webpack from 'webpack';
import path from 'path';
import fs from 'fs';
import CopyWebpackPlugin from 'copy-webpack-plugin';

import babelQuery from '../babel/babelquery';

const nodeModules = {};
fs.readdirSync('node_modules')
  .filter(entry => ['.bin'].indexOf(entry) === -1)
  .forEach(module => {
    nodeModules[module] = `commonjs ${module}`;
  });

export default {
  entry: './src/worker/main.js',
  target: 'node',
  output: {
    path: path.join(__dirname, '../dist'),
    filename: 'worker.js'
  },
  externals: nodeModules,
  module: {
    loaders: [{
      test: /\.js$/,
      loader: 'babel',
      include: path.join(__dirname, '../src'),
      query: babelQuery
    }]
  },
  resolve: {
    extensions: ['', '.js']
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      compress: { warnings: false }
    })
  ]
};

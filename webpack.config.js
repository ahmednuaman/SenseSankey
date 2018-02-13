'use strict'

const BUILD_DIR = 'build'
const CWD = process.cwd()
const ENV = process.env.NODE_ENV || 'development'
const PKG = require('./package.json')
const ZIP_FILE = `${PKG.name}.zip`

const path = require('path')
const src = path.resolve(CWD, 'src')
const webpack = require('webpack')
const WebpackCleanPlugin = require('clean-webpack-plugin')
const WebpackCopyPlugin = require('copy-webpack-plugin')
const WebpackStatsWriterPlugin = require('webpack-stats-plugin').StatsWriterPlugin
const WebpackZipPlugin = require('zip-webpack-plugin')

let config = {
  context: src,
  cache: true,
  entry: {
    [`${PKG.name}.js`]: ['./js/app.js']
  },
  output: {
    filename: '[name]',
    publicPath: '',
    path: path.resolve(CWD, BUILD_DIR),
    libraryTarget: 'amd'
  },
  devtool: 'inline-source-map',
  module: {
    loaders: [{
      test: /\.(gif|png|jpg)$/,
      loader: 'url?limit=100000'
    }, {
      test: /\.json$/,
      loader: 'json'
    }, {
      test: /\.js?$/,
      exclude: [
        /node_modules/
      ],
      loader: 'babel',
      query: {
        compact: false
      }
    }, {
      test: /\.css$/,
      loader: 'style!css'
    }]
  },
  resolve: {
    extensions: ['', '.js', '.json', '.css'],
    alias: {
      img: `${src}/img/`,
      json: `${src}/json/`,
      pug: `${src}/pug/`
    }
  },
  externals: [
    'angular',
    'jquery',
    'js/qlik',
    'qlik',
    'objects.utils/number-formatter'
  ],
  plugins: [
    new WebpackCleanPlugin([BUILD_DIR, ZIP_FILE]),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(ENV)
    }),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.NoErrorsPlugin(),
    new WebpackCopyPlugin([{
      from: '../qlik/template.qext',
      to: `${PKG.name}.qext`
    }, {
      from: '../qlik/preview.png'
    }])
  ]
}

config.plugins.push(
  new WebpackStatsWriterPlugin({
    filename: 'wbfolder.wbl',
    fields: null,
    transform: (stats, opts) => stats.assets.map(({ name }) => name).join(';\n')
  }),
  new WebpackZipPlugin({
    filename: ZIP_FILE,
    pathPrefix: PKG.name,
    exclude: /^\..*/
  })
)

module.exports = config

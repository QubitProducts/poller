/* globals process */
var RewirePlugin = require('rewire-webpack')
var path = require('path')
var DEBUG = process.env.DEBUG

module.exports = function (config) {
  config.set({
    frameworks: [ 'mocha' ],
    files: [ 'test/*test.js' ],
    preprocessors: { '/**/*.js': [ 'webpack', 'sourcemap' ] },
    webpack: {
      watch: true,
      devtool: 'inline-source-map',
      amd: { jQuery: true },
      module: {
        loaders: !DEBUG &&
          [
            {
              test: /\.js$/,
              loader: 'istanbul-instrumenter-loader',
              include: [ path.resolve('lib/'), path.resolve('poller.js') ],
              exclude: /(test|node_modules|bower_components)\//
            }
          ]
      },
      plugins: [ new RewirePlugin() ]
    },
    webpackServer: { quiet: true, noInfo: true },
    reporters: DEBUG
      ? [ 'progress' ]
      : [ 'progress', 'coverage-istanbul', 'coverage' ],
    coverageIstanbulReporter: {
      reports: [ 'text-summary' ],
      fixWebpackSourcePaths: true
    },
    coverageReporter: {
      check: {
        global: { statements: 100, lines: 100, functions: 100, branches: 100 }
      }
    },
    browsers: [ 'Chrome' ]
  })
}

var RewirePlugin = require('rewire-webpack')
var path = require('path')

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
        loaders: [
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
    reporters: [ 'progress', 'coverage-istanbul', 'coverage' ],
    coverageIstanbulReporter: {
      reports: [ 'text-summary' ],
      fixWebpackSourcePaths: true
    },
    coverageReporter: {
      check: {
        global: { statements: 95, lines: 95, functions: 95, branches: 80 }
      }
    },
    browsers: [ 'Chrome' ]
  })
}

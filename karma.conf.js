module.exports = function(config) {
  config.set({

    frameworks: ['mocha', 'sinon-chai'],

    files: [
      // only specify one entry point
      // and require all tests in there
      'test/main.js'
    ],

    // add webpack as preprocessor
    preprocessors: {
      'test/main.js': ['webpack', 'sourcemap']
    },

    webpack: {
      // karma watches test/test_index.js
      // webpack watches dependencies of test/test_index.js
      watch: true,
      devtool: 'inline-source-map',
      amd: { jQuery: true },
      resolve: {
        extensions: ["", ".js", ".css"]
      }
    },

    webpackServer: {
      quiet: true,
      noInfo: true
    },

    browsers: ['Chrome']

  });
};

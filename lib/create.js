var driftwood = require('driftwood')

module.exports = function create (targets, options) {
  var isArray = Array.isArray(targets)
  return {
    targets: isArray ? targets : [targets],
    evaluated: [],
    isSingleton: !isArray,
    resolve: options.resolve,
    reject: options.reject,
    logger: options.logger || driftwood('poller'),
    timeout: options.timeout,
    stopOnError: options.stopOnError
  }
}

module.exports = function create (targets, resolve, reject, options) {
  var isArray = Array.isArray(targets)
  return {
    targets: isArray ? targets : [targets],
    evaluated: [],
    resolve: resolve,
    reject: reject,
    isSingleton: !isArray,
    logger: options.logger,
    timeout: options.timeout
  }
}

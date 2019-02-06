var _ = require('slapdash')

module.exports = function validate (targets, options, logger) {
  if (areTargetsInvalid(targets)) {
    throw new Error(
      'Expected first argument to be a selector string ' +
      'or array containing selectors, window variables or functions.'
    )
  }
  if (options !== void 0) {
    var optionsIsFunction = typeof options === 'function'
    if (optionsIsFunction) {
      logger.warn('Poller has a new API, see https://package-browser.qubit.com/packages/@qubit/poller')
    }
    if (optionsIsFunction || !_.isObject(options)) {
      throw new Error(
        'Expected second argument to be an options object'
      )
    }
  }
}

function areTargetsInvalid (targets) {
  if (Array.isArray(targets)) {
    return !!_.find(targets, isInvalidType)
  } else {
    return isInvalidType(targets)
  }
}

function isInvalidType (target) {
  var targetType = typeof target
  return targetType !== 'string' && targetType !== 'function'
}

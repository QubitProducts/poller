var _ = require('slapdash')

module.exports = function validate (targets, options) {
  if (areTargetsInvalid(targets)) {
    throw new Error(
      'Poller: Expected first argument to be a selector string ' +
      'or array containing selectors, window variables or functions.'
    )
  }
  if (options !== void 0) {
    var optionsIsFunction = typeof options === 'function'
    if (optionsIsFunction || !_.isObject(options)) {
      throw new Error(
        'Poller: Expected second argument to be an options object. ' +
        'Poller has a new API, see https://docs.qubit.com/content/developers/experiences-poller'
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

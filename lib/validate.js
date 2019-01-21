var _ = require('slapdash')

module.exports = function validate (targets, options) {
  if (areTargetsInvalid(targets)) {
    throw new Error(
      'Expected first argument to be a selector string ' +
      'or array containing selectors, window variables or functions.'
    )
  }

  if (options !== void 0) {
    if (typeof options === 'function' || !_.isObject(options)) {
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

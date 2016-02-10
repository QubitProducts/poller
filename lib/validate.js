var _ = require('@qubit/underscore')

module.exports = function validate (targets, callback) {
  if (!_.isFunction(callback)) {
    return new Error('Expected second argument to be a callback function.')
  }

  if (areTargetsInvalid(targets)) {
    return new Error(
      'Expected first argument to be selector string ' +
      'or array containing selectors, window variables or functions.'
    )
  }

  return false
}

function areTargetsInvalid (targets) {
  if (_.isArray(targets)) {
    return _.some(targets, isInvalidType)
  } else {
    return isInvalidType(targets)
  }
}

function isInvalidType (target) {
  return !(_.isString(target) || _.isFunction(target))
}

var find = require('slapdash').find

module.exports = function validate (targets, callback) {
  if (typeof callback !== 'function') {
    throw new Error('Expected second argument to be a callback function.')
  }

  if (areTargetsInvalid(targets)) {
    throw new Error(
      'Expected first argument to be selector string ' +
      'or array containing selectors, window variables or functions.'
    )
  }
}

function areTargetsInvalid (targets) {
  if (Array.isArray(targets)) {
    return !!find(targets, isInvalidType)
  } else {
    return isInvalidType(targets)
  }
}

function isInvalidType (target) {
  return !(typeof target === 'string' || typeof target === 'function')
}

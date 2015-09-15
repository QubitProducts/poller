var _ = require('@qubit/underscore')

module.exports = function validate (targets, callback) {
  if (!_.isFunction(callback)) {
    throw new Error('Expected second argument to be a callback function.')
  }

  if (_.isNumber(targets) || _.isBoolean(targets)) {
    throw new Error(
      'Expected first argument to be selector string ' +
      'or array containing selectors, window variables or functions.'
    )
  }
}

var $ = require('@qubit/jquery')
var _ = require('@qubit/underscore')
var attr = require('@qubit/attr')

module.exports = function evaluate (target) {
  if (_.isFunction(target)) return target() || undefined
  if (_.isString(target) && target.indexOf('window.') === 0) return attr(window, target)

  var result = $(target)
  return result.length !== 0 ? result : undefined
}

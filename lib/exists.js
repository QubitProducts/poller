var $ = require('@qubit/jquery')
var _ = require('@qubit/underscore')
var attr = require('@qubit/attr')

module.exports = function exists (target) {
  if (_.isFunction(target)) return target()
  if (_.isString(target) && target.indexOf('window.') === 0) return !_.isUndefined(attr(window, target))
  return $(target).length !== 0
}

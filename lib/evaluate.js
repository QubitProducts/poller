var $ = require('@qubit/jquery')
var get = require('slapdash').get

module.exports = function evaluate (target) {
  if (typeof target === 'function') return target() || undefined
  if (typeof target === 'string' && target.indexOf('window.') === 0) return get(window, target)

  var result = $(target)
  return result.length !== 0 ? result : undefined
}

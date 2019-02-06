var get = require('slapdash').get
var undef = void 0

module.exports = function evaluate (target) {
  if (typeof target === 'function') return target() || undef
  if (typeof target === 'string' && target.indexOf('window.') === 0) return get(window, target)
  return document.querySelector(target) || undef
}

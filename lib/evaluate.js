var get = require('slapdash').get
var undef = void 0

module.exports = function evaluate (target, queryAll) {
  if (typeof target === 'function') return target() || undef
  if (typeof target === 'string' && target.indexOf('window.') === 0) return get(window, target)
  var resolveFunction = queryAll ? document.querySelectorAll : document.querySelector
  return resolveFunction(target) || undef
}

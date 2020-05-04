var get = require('slapdash').get
var undef = void 0

module.exports = function evaluate (target, queryAll) {
  if (typeof target === 'function') return target() || undef
  if (typeof target === 'string' && target.indexOf('window.') === 0) return get(window, target)
  if (queryAll) {
    var items = document.querySelectorAll(target) || undef
    return items.length ? items : undef
  } else {
    return document.querySelector(target) || undef
  }
}

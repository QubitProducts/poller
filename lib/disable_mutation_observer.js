module.exports = function disableMutationObserver () {
  return brokenAngular()
}

// https://github.com/angular/angular.js/blob/master/CHANGELOG.md#1229-ultimate-deprecation-2015-09-29
function brokenAngular () {
  if (!window.angular || !window.angular.version) {
    return false
  }

  var v = window.angular.version || {}

  if (v.major <= 1) {
    if (v.minor < 2) return true
    if (v.minor === 2 && v.dot < 29) return true
  }

  return false
}

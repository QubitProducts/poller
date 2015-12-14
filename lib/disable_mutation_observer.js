module.exports = function disableMutationObserver (ua) {
  return ie11(ua)
}

function ie11 (ua) {
  ua = ua || window.navigator.userAgent
  return ua.indexOf('Trident/7.0') > 0
}

module.exports = function raf (fn) {
  return getRaf()(fn)
}

function getRaf () {
  return window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    defer
}

function defer (callback) {
  window.setTimeout(callback, 0)
}

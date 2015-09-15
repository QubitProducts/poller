module.exports = window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  function (callback, ms) {
    window.setTimeout(callback, ms || 0)
  }

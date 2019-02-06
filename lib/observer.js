var _ = require('slapdash')

module.exports = function createObserver (cb) {
  var Observer = window.MutationObserver || window.WebKitMutationObserver
  var supported = Boolean(Observer && !isTrident())
  var disabled = !supported
  var mobserver = supported && new Observer(cb)
  var active = false

  function enable () {
    if (supported) disabled = false
  }

  function disable () {
    stop()
    disabled = true
  }

  function start () {
    if (active || disabled) return
    mobserver.observe(document.documentElement, {
      childList: true,
      subtree: true
    })
    active = true
  }

  function stop () {
    if (!active || disabled) return
    mobserver.disconnect()
    active = false
  }

  return {
    enable: enable,
    disable: disable,
    start: start,
    stop: stop
  }
}

function isTrident () {
  var agent = _.get(window, 'navigator.userAgent') || ''
  return agent.indexOf('Trident/7.0') > -1
}

var _ = require('@qubit/underscore')
var requestAnimationFrame = require('./lib/raf')
var observeMutations = require('./lib/observeMutations')
var exists = require('./lib/exists')
var create = require('./lib/create')
var now = require('./lib/now')

/**
 * Constants - these are not configurable to
 * make polling more efficient by reusing the
 * same global timeout.
 */
var INITIAL_TICK = Math.round(1000 / 60) // The initial tick interval duration before we start backing off (ms)
var INCREASE_RATE = 1.5 // The backoff multiplier
var BACKOFF_THRESHOLD = Math.round((3 * 1000) / (1000 / 60)) // How many ticks before we start backing off
var MAX_DURATION = 15000 // How long before we stop polling (ms)

/**
 * Globals
 */
var start, tickCount, currentTickDelay, timeout
var callbacks = []

observeMutations(function () {
  if (callbacks.length) {
    tock()
  }
})

/**
 * Main poller method to register 'targets' to poll for
 * and a callback when all targets validated and complete
 * 'targets' can be one of the following formats:
 *   - a selector string e.g. 'body > span.grid15'
 *   - a window variable formatted as a string e.g. 'window.universal_variable'
 *   - a function which returns a condition for which to stop the polling e.g.
 *     function () {
 *       return $('.some-class').length === 2;
 *     }
 *   - an array of any of the above formats
 */
function poller (targets, callback) {
  var active = isActive()
  var item = create(targets, callback)

  register(item)

  // reset state
  init()

  // don't start ticking unless current ticking is inactive
  if (!active) {
    tick()
  }

  resetAfterMaxDuration()

  return item.cancel
}

function tick () {
  tock()
  if (isActive()) {
    // start increasing tick rate
    if (tickCount < BACKOFF_THRESHOLD) {
      requestAnimationFrame(tick, currentTickDelay)
    } else {
      currentTickDelay = currentTickDelay * INCREASE_RATE
      window.setTimeout(tick, currentTickDelay)
    }
  }
}

/**
 * Loop through all registered callbacks, polling for selectors or executing filter functions
 */
function tock () {
  tickCount += 1

  var callQueue = []
  callbacks = _.filter(callbacks, filterItems)

  // we've reached the max threshold
  if ((now() - start) >= MAX_DURATION) callbacks = []

  while (callQueue.length) {
    try {
      callQueue.pop()()
    } catch (error) {
      logError(error)
    }
  }

  function filterItems (item) {
    if (!_.isFunction(item.callback)) return false
    try {
      if (_.every(item.targets, exists)) {
        callQueue.push(item.callback)
        return false
      }
    } catch (error) {
      logError(error)
      return false
    }
    return true
  }
}

function resetAfterMaxDuration () {
  clearTimeout(timeout)
  timeout = window.setTimeout(reset, MAX_DURATION)
}

function init () {
  start = now()
  tickCount = 0
  currentTickDelay = INITIAL_TICK
}

function isActive () {
  return !!callbacks.length
}

function register (item) {
  return callbacks.push(item)
}

function reset () {
  init()
  callbacks = []
}

function logError (error) {
  error.message = 'Poller function errored: ' + error.message
  return console && console.error && console.error(error)
}

poller.isActive = isActive
poller.reset = reset

module.exports = poller

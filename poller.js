var _ = require('slapdash')
var defer = require('sync-p/defer')
var requestAnimationFrame = require('./lib/raf')
var disableMutationObserver = require('./lib/disable_mutation_observer')
var validFrame = require('./lib/valid_frame')
var observeMutations = require('./lib/observe_mutations')
var evaluate = require('./lib/evaluate')
var validate = require('./lib/validate')
var create = require('./lib/create')
var now = require('./lib/now')
var log = require('driftwood')('poller')

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

if (!disableMutationObserver()) {
  observeMutations(function () {
    if (callbacks.length) {
      tock()
    }
  })
}

/**
 * Main poller method to register 'targets' to poll for
 * and a callback when all targets validated and complete
 * 'targets' can be one of the following formats:
 *   - a selector string e.g. 'body > span.grid15'
 *   - a window variable formatted as a string e.g. 'window.universal_variable'
 *   - a function which returns a condition for which to stop the polling e.g.
 *     function () {
 *       return $('.some-class').length === 2
 *     }
 *   - an array of any of the above formats
 */

function poller (targets) {
  var deferred = defer()
  var active = isActive()

  try {
    validate(targets)
  } catch (error) {
    logError(error)
  }
  var item = create(targets, deferred.resolve, deferred.reject)

  return {
    start: function start () {
      register(item)

      // reset state
      init()

      // don't start ticking unless current ticking is inactive
      if (!active) {
        tick()
      }

      resetAfterMaxDuration()
      return deferred.promise
    },
    stop: function stop () {
      unregister(item)
    }
  }
}

function tick () {
  tickCount += 1
  var next = requestAnimationFrame
  var shouldBackoff = tickCount >= BACKOFF_THRESHOLD
  if (shouldBackoff) {
    currentTickDelay = currentTickDelay * INCREASE_RATE
    next = window.setTimeout
  }
  if (shouldBackoff || validFrame(tickCount)) {
    tock()
  }
  if (!isActive()) return
  return next(tick, currentTickDelay)
}

/**
 * Loop through all registered callbacks, polling for selectors or executing filter functions
 */
function tock () {
  var callQueue = []
  callbacks = _.filter(callbacks, filterItems)

  // we've reached the max threshold
  if ((now() - start) >= MAX_DURATION) callbacks = []

  var callItem
  while (callQueue.length) {
    try {
      callItem = callQueue.pop()
      callItem.callback(callItem.params)
    } catch (error) {
      logError(error)
    }
  }

  function filterItems (item) {
    var callback = item.callback
    var targets = item.targets
    var len = targets.length
    var i = 0
    if (typeof callback !== 'function') return false
    try {
      var evaluated = []
      var result
      for (i = 0; i < len; i++) {
        result = evaluate(targets[i])
        if (typeof result === 'undefined') {
          item.remainders = targets.slice(i)
          return true
        }
        evaluated.push(result)
      }
      callQueue.push({
        callback: callback,
        params: evaluated
      })
      return false
    } catch (error) {
      item.remainders = item.targets.slice(i)
      logError(error)
      return true
    }
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
  unregister(item)
  return callbacks.push(item)
}

function unregister (item) {
  callbacks = callbacks.filter(function (i) {
    return i !== item
  })
}

function reset () {
  init()
  log.debug('Poller complete')
  if (callbacks.length) {
    log.debug('Logging unresolved items')
    callbacks.forEach(function (item) {
      if (item.remainders) {
        log.debug(item.remainders)
        item.onTimeout && item.onTimeout(new Error('Poller timed out'))
      }
    })
  }
  callbacks = []
}

function logError (error) {
  error = new Error('Poller function errored: ' + error.message, error.stack)
  error.code = 'EPOLLER'
  log.error(error)
  if (window.__qubit && window.__qubit.previewActive === true) {
    throw error
  }
}

poller.isActive = isActive
poller.reset = reset
poller.log = log

module.exports = poller

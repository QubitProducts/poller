var _ = require('slapdash')
var defer = require('sync-p/defer')
var requestAnimationFrame = require('./lib/raf')
var validFrame = require('./lib/valid_frame')
var evaluate = require('./lib/evaluate')
var validate = require('./lib/validate')
var create = require('./lib/create')
var logger = require('driftwood')('poller')

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
var tickCount, currentTickDelay, timeout
var callbacks = []

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

function poller (targets, opts) {
  var deferred = defer()
  var active = isActive()
  var options = _.assign({
    logger: logger,
    timeout: MAX_DURATION
  }, opts)

  try {
    validate(targets, opts, options.logger)

    var item = create(targets, deferred.resolve, deferred.reject)

    deferred.promise.then(function () {
      unregister(item)
    }, function () {
      unregister(item)
    })

    start()

    return {
      start: start,
      stop: stop,
      then: deferred.promise.then,
      catch: deferred.promise.catch
    }
  } catch (error) {
    logError(error)
  }

  function start () {
    register(item)

    // reset state
    init()

    // don't start ticking unless current ticking is inactive
    if (!active) tick()

    resetAfterMaxDuration()
    return deferred.promise
  }

  function stop () {
    return unregister(item)
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

    var callItem
    while (callQueue.length) {
      callItem = callQueue.pop()
      callItem.resolve(callItem.params)
    }

    function filterItems (item) {
      var targets = item.targets
      var len = targets.length
      var i = 0
      try {
        var result
        for (i = 0; i < len; i++) {
          if (i >= item.evaluated.length) {
            result = evaluate(targets[i])
            if (typeof result === 'undefined') {
              item.remainders = targets.slice(i)
              return true
            } else {
              item.evaluated.push(result)
              options.logger.info('Poller: resolved ' + String(targets[i]))
            }
          }
        }
        callQueue.push({
          resolve: item.resolve,
          params: item.evaluated
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
    timeout = window.setTimeout(function () {
      timeoutUnresolvedItems()
      options.logger.info('Poller: complete')
      reset()
    }, options.timeout)
  }

  function timeoutUnresolvedItems () {
    if (callbacks.length) {
      callbacks.forEach(function (item) {
        // There should always be a remainder if poller times out
        var remainder = String(unregister(item))
        options.logger.info('Poller: could not resolve ' + remainder)
        item.reject(new Error('Poller: could not resolve ' + remainder))
      })
    }
  }

  function logError (error) {
    error.code = 'EPOLLER'
    options.logger.error(error)
    if (_.get(window, '__qubit.previewActive')) throw error
  }
}

function init () {
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
  callbacks = _.filter(callbacks, function (i) {
    return i !== item
  })
  if (item.remainders) {
    return item.remainders[0]
  }
}

function reset () {
  init()
  callbacks = []
}

poller.isActive = isActive
poller.reset = reset
poller.logger = logger

module.exports = poller

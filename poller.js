var _ = require('slapdash')
var defer = require('sync-p/defer')
var requestAnimationFrame = require('./lib/raf')
var validFrame = require('./lib/valid_frame')
var createObserver = require('./lib/observer')
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
var DEFAULTS = {
  logger: logger,
  timeout: 15000, // How long before we stop polling (ms)
  stopOnError: false // Whether to stop and throw an error if the evaulation throws
}
/**
 * Globals
 */
var tickCount, currentTickDelay
var queue = []
var observer = createObserver(tock)

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
  var options = _.assign({}, DEFAULTS, opts)

  try {
    validate(targets, opts, options.logger)

    var item = create(targets, deferred.resolve, deferred.reject, options)

    start()

    return {
      start: start,
      stop: stop,
      then: deferred.promise.then,
      catch: deferred.promise.catch
    }
  } catch (error) {
    logError(error, options)
  }

  function start () {
    register(item)
    return deferred.promise
  }

  function stop () {
    return unregister(item)
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
 * Loop through all registered items, polling for selectors or executing filter functions
 */
function tock () {
  var ready = _.filter(queue, evaluateQueue)

  while (ready.length) resolve(ready.pop())

  function evaluateQueue (item) {
    var i, result
    var cacheIndex = item.evaluated.length
    try {
      for (i = 0; i < item.targets.length; i++) {
        if (i >= item.evaluated.length) {
          result = evaluate(item.targets[i])
          if (typeof result !== 'undefined') {
            item.logger.info('Poller: resolved ' + String(item.targets[i]))
            item.evaluated.push(result)
          } else if ((new Date() - item.start) >= item.timeout) {
            // Item has timed out, resolve item
            return true
          } else {
            // Cannot resolve item, exit
            return
          }
        }
      }

      // Everything has been found, lets re-evaluate cached entries
      // to make sure they have not gone stale
      for (i = 0; i < cacheIndex; i++) {
        result = evaluate(item.targets[i])
        if (typeof result === 'undefined') {
          item.evaluated = item.evaluated.slice(0, i)
          item.logger.info('Poller: item went stale: ' + String(item.targets[i]))
          // Cannot resolve item, exit
          return
        } else {
          item.evaluated[i] = result
        }
      }

      // All targets evaluated, add to resolved list
      return true
    } catch (error) {
      logError(error, item)
      // Cannot resolve item, exit
    }
  }
}

function init () {
  tickCount = 0
  currentTickDelay = INITIAL_TICK
}

function reset () {
  init()
  observer.stop()
  queue = []
}

function isActive () {
  return !!queue.length
}

function register (item) {
  var active = isActive()

  init()

  item.start = new Date()

  queue = _.filter(queue, function (i) {
    return i !== item
  })

  queue.push(item)

  if (!active) {
    item.logger.info('Poller: started')
    tick()
    observer.start()
  }
}

function unregister (item) {
  queue = _.filter(queue, function (i) {
    return i !== item
  })
  if (!isActive()) {
    observer.stop()
  }
  return item.targets[item.evaluated.length]
}

function resolve (item) {
  var remainder = unregister(item)
  if (remainder) {
    remainder = String(remainder)
    item.logger.info('Poller: could not resolve ' + remainder)
    item.reject(new Error('Poller: could not resolve ' + remainder))
  } else {
    var evaluated = item.isSingleton
      ? item.evaluated[0]
      : item.evaluated
    item.resolve(evaluated)
  }

  if (!isActive()) {
    item.logger.info('Poller: complete')
  }
}

function logError (error, options) {
  error.code = 'EPOLLER'
  options.logger.error(error)
  if (options.stopOnError) throw error
}

poller.isActive = isActive
poller.reset = reset

poller.logger = logger
poller.disableMutationObserver = observer.disable
poller.defaults = function (newDefaults) {
  _.assign(DEFAULTS, newDefaults)
}

module.exports = poller

var $ = require("@qubit/jquery");
var _ = require("@qubit/underscore");
var attr = require("@qubit/attr");

/**
 * Constants - these are not configurable to
 * make polling more efficient by reusing the
 * same global timeout.
 */

var INITIAL_TICK = 50; // The duration of the initial ticks before we start backing off
var INCREASE_RATE = 1.5; // The backoff multiplier
var BACKOFF_THRESHOLD = 5; // How many ticks before we start backing off
var MAX_DURATION = 15000; // How much time before we stop polling completely

/**
 * Globals
 */
var startTime, tickCount, currentTickDelay;
var callbacks = [];
var active = false;

/**
 * Main poller method to register 'targets' to poll for
 * and a callback when all targets validated and complete
 * 'targets' can be one of the following formats:
 *   - a selector string e.g. 'body > span.grid15'
 *   - a window variable formatted as a string e.g. 'window.universal_variable'
 *   - a function which returns a condition for which to stop the polling e.g.
 *     function () {
 *       return $(".some-class").length === 2;
 *     }
 *   - an array of any of the above formats
 */
module.exports = function poller(targets, callback) {
  var callbackItem = createCallbackItem(targets, callback);
  registerCallbackItem(callbackItem);

  // reset state
  startTime = (+new Date());
  tickCount = 0;
  currentTickDelay = INITIAL_TICK;

  // don't start ticking unless current ticking is inactive
  if (!active) {
    active = true;
    tick();
  }

  return callbackItem.cancel;
};

/**
 * A boolean check to see if the poller is currently active
 */
module.exports.isActive = function isActive() {
  return active;
};

/**
 * Loop through all registered callbacks, polling for selectors or executing filter functions
 */
function tick() {
  tickCount += 1;

  var errors = {};
  callbacks = _.filter(callbacks, _.bind(filterCallbackItem, null, errors));

  // all poller callbacks have been satisfied
  if (callbacks.length === 0) {
    active = false;
    return;
  }

  // we've reached the max threshold
  if ((+new Date() - startTime) > MAX_DURATION) {
    active = false;
    callbacks = [];
    _.each(errors, function(error, index) {
      console && console.error && console.error("Poller function errored at index " + index + ": " + error);
    });
    return;
  }

  // start increasing tick rate
  if (tickCount > BACKOFF_THRESHOLD) {
    currentTickDelay = currentTickDelay * INCREASE_RATE;
  }

  setTimeout(tick, currentTickDelay);
}

/**
 * Adds callback item to the global array of callbacks
 */
function createCallbackItem(targets, callback) {
  validateInputs(targets, callback);
  if (!_.isArray(targets)) {
    targets = [targets];
  }
  targets = _.compact(targets);
  var callbackItem = {
    targets: targets,
    callback: callback,
    cancel: function () {
      delete callbackItem.callback;
    }
  };
  return callbackItem;
}

/**
 * Register a callback item in the polling
 */
function registerCallbackItem(callbackItem) {
  return callbacks.push(callbackItem);
}

/**
 * Validate the input parameters passed to poller
 */
function validateInputs(targets, callback) {
  if (typeof targets === "number" || typeof targets === "boolean") {
    throw new Error([
      "Expected first argument to be selector string",
      "or array containing selectors, window variables or functions."
    ].join(" "));
  }

  if (typeof callback !== "function") {
    throw new Error("Expected second argument to be a callback function.");
  }
}

/**
 * Filter callback item based on the polling validation each of the specified polling
 * targets (selectors, window vars or functions). If the callback item passes the
 * validation then it's success callback is fired.
 */
function filterCallbackItem(errors, item) {
  var targets = item.targets;
  var cb = item.callback;

  // If the item has been cancelled, we want to remove
  // it from the polling chain
  if (!cb) {
    return false;
  }

  for (var index = 0; index < targets.length; index++) {
    var target = targets[index];
    if (typeof target === "function") {
      try {
        if (!target()) {
          return true;
        }
      } catch (err) {
        errors[index] = err.stack;
        return true;
      }
    } else if (target.indexOf("window.") === 0) {
      if (typeof attr(window, target) === "undefined") {
        return true;
      }
    } else if ($(target).length === 0) {
      return true;
    }
  }

  setTimeout(cb, 0);
  return false;
}

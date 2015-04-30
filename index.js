/**
  * EXAMPLE USAGE
  *
  * var poller = require("@qubit/poller");
  * poller(".nav", cb);
  * poller(function() { return true; }, cb);
  * poller([".nav", ".header"], cb);
  * poller([".nav", "window.universal_variable"], cb);
  * poller([".nav", "window.universal_variable", function () { return true; }], cb);

  * TODO

  * Test multiple intervals (from 10-200ms, linearly increasing on each poll)
  * Test difference methods of polling (setTimeout/setInterval, requestAnimationFrame, mutationObservers)
  */

var $ = require("@qubit/jquery");
var _ = require("@qubit/underscore");
var attr = require("@qubit/attr");

// These are not configurable to
// make polling more efficient by reusing the
// same global timeout.

// The duration of the initial ticks before
// we start backing off
var INITIAL_TICK = 50;
// The backoff multiplier
var INCREASE_RATE = 1.5;
// How many ticks before we start backing off
var BACKOFF_THRESHOLD = 5;
// How much time before we stop polling completely
var MAX_DURATION = 15000;

var callbacks = [];
var active = false;

var startTime;
var tickCount;
var currentTickDelay;

module.exports = function poll(targets, callback) {
  if (typeof targets === "number" || typeof targets === "boolean") {
    throw new Error([
      "Expected first argument to be selector string",
      "or array containing selectors, window variables or functions."
    ].join(" "));
  }

  if (typeof callback !== "function") {
    throw new Error("Expected second argument to be a callback function.");
  }

  currentTickDelay = INITIAL_TICK;
  startTime = (+new Date());
  tickCount = 0;

  if (!_.isArray(targets)) targets = [targets];
  targets = _.compact(targets);

  callbacks.push({
    targets: targets,
    callback: callback
  });

  if (!active) {
    active = true;
    tick();
  }
};

/**
 * Loop through all registered callbacks, polling for selectors or executing filter functions
 * @return {}
 */
function tick() {
  tickCount += 1;

  var errors = {};
  callbacks = _.reduce(callbacks, function (memo, item) {
    var targets = item.targets;
    var cb = item.callback;

    var targetsPass = true;
    for (var index = 0; index < targets.length; index++) {
      var target = targets[index];
      if (typeof target === "function") {
        try {
          if (!target()) {
            targetsPass = false; break;
          }
        } catch (err) {
          errors[index] = err.stack;
          targetsPass = false; break;
        }
      } else if (target.indexOf("window.") === 0) {
        if (typeof attr(window, target) === "undefined") {
          targetsPass = false; break;
        }
      } else if ($(target).length === 0) {
        targetsPass = false; break;
      }
    }

    if (targetsPass) {
      setTimeout(cb, 0);
      return memo;
    } else {
      return memo.concat([item]);
    }
  }, []);

  // all poller callbacks have been satisfied
  if (callbacks.length === 0) {
    active = false;
    return;
  }

  // we've reached the max treshold
  if ((+new Date() - startTime) > MAX_DURATION) {
    active = false;
    _.each(errors, function(error, index) {
      console && console.error && console.error("Poller function errored at index " + index + ": " + error);
    });
    return;
  }

  if (tickCount > BACKOFF_THRESHOLD) {
    currentTickDelay = currentTickDelay * INCREASE_RATE;
  }

  setTimeout(tick, currentTickDelay);
}

module.exports.isActive = function () {
  return active;
};

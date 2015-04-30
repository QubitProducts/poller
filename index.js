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

// These are currently not configurable to
// make polling more efficient by reusing the
// same global timeout.
var INCREASE_RATE = 1.5;
var MAX_DURATION = 15000;

var callbacks = [];
var active = false;

module.exports = function(targets, callback) {

  var startInterval = 50;
  var startTime = (+new Date());

  if (typeof targets === "number" || typeof targets === "boolean") {
    throw new Error([
      "Expected first argument to be selector string",
      "or array containing selectors, window variables or functions."
    ].join(""));
  } else if (typeof callback !== "function") {
    throw new Error("Expected second argument to be a callback function.");
  } else {

    if (!_.isArray(targets)) {
      targets = [targets];
    }
    callbacks.push({
      targets: targets,
      callback: callback
    });
  }

  active = true;
  tick(startInterval);

  /**
   * Loop through all registered callbacks, polling for selectors or executing filter functions
   * @return {}
   */
  function tick (time) {
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
        } else if (target === "" || $(target).length === 0) {
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

    if (callbacks.length !== 0) {
      setTimeout(function() {
        if ((+new Date() - startTime) < MAX_DURATION) {
          tick(time * INCREASE_RATE);
          active = true;
        } else {
          active = false;
          _.each(errors, function(error, index) {
            console && console.error && console.error("Poller function errored at index " + index + ": " + error);
          });
        }
      }, time);
    }
  }
};

module.exports.isActive = function () {
  return active;
};

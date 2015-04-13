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
var INTERVAL = 50;
// var BACKOFF_THRESHOLD = 100;
// var BACKOFF_RATE = 1;
var MAX_DURATION = 20000;

var callbacks = [];
var active = false;

module.exports = function(targets, callback) {

  var timeElapsed = 0;

  if (typeof targets === "number" || typeof targets === "boolean") {
    throw new Error([
      "Expected first argument to be selector string",
      "or array containing selectors, window variables or functions."
    ].join(""));
  } else if (typeof callback !== "function") {
    throw new Error("Expected second argument to be a callback function.");
  } else {

    if (!_.isArray(targets)) {
      targets = new Array(targets);
    }
    callbacks.push({
      targets: targets,
      callback: callback,
      remove: false
    });
  }

  active = true;
  tick(INTERVAL);

  /**
   * Loop through all registered callbacks, polling for selectors or executing filter functions
   * @return {}
   */
  function tick (time) {
    try {
      callbacks = _.filter(_.map(callbacks, function (item) {

        var targets = item.targets,
          cb = item.callback;

        var targetsPass = true;
        _.each(targets, function (target) {
          if (typeof target === "function") {
            if (!target()) {
              targetsPass = false;
            }
          } else if (target.indexOf("window.") === 0) {
            if (typeof attr(window, target) === "undefined") {
              targetsPass = false;
            }
          } else if (target === "" || $(target).length === 0) {
            targetsPass = false;
          }
        });

        if (targetsPass) {
          item.remove = true;
          cb(null);
        }

        return item;
      }), function (item) {
        return !item.remove;
      });
    }
    catch (e) {
      console.error(e);
    }

    if (callbacks.length !== 0) {
      setTimeout(function() {
        timeElapsed += time;
        if (timeElapsed < MAX_DURATION) {
          tick(time);
          active = true;
        } else {
          active = false;
        }
      }, time);
    }
  }
};

module.exports.isActive = function () {
  return active;
};

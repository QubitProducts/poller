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

  if (!targets || typeof targets === "number" || typeof targets === "boolean") {
    throw new Error([
      "Expected first argument to be selector string",
      "or array containing selectors, window variables or functions."
    ].join(""));
  }
  if (typeof callback !== "function") {
    throw new Error("Expected second argument to be a callback function.");
  } else {
    callbacks.push({
      targets: targets,
      callback: callback
    });
  }

  tick(INTERVAL);

  /**
   * Loop through all registered callbacks and execute their filter functions,
   *    resolving or rejecting them where necessary
   * @return {}
   */
  function tick (time) {
    for (var i = 0, len = callbacks.length; i < len; i++) {

      if (callbacks[i] !== null && callbacks[i] !== undefined) {

        var targets = callbacks[i].targets,
          callback = callbacks[i].callback;

        try {

          var targetsPass = false;

          if (typeof targets === "string") {
            if (targets === "" || $(targets).length) {
              targetsPass = true;
            }
          } else if (typeof targets === "function") {
            if (targets()) {
              targetsPass = true;
            }
          } else if ($.isArray(targets)) {
            targetsPass = true;
            for (i = 0, len = targets.length; i < len; i++) {
              if (typeof targets[i] === "function") {
                if (!targets[i]()) {
                  targetsPass = false; break;
                }
              } else if (targets[i].indexOf("window") > -1) {
                if (typeof attr(window, targets[i]) === "undefined") {
                  targetsPass = false; break;
                }
              } else if ($(targets[i]).length === 0) {
                targetsPass = false; break;
              }
            }
          } else {
            spliceOne(callbacks, i);
            callback("Error: Selectors parameter must be a string or array of selectors");
          }

          if (targetsPass) {
            spliceOne(callbacks, i);
            callback(null);
          }

        }
        catch (e) {
          console.error(e);
        }
      }
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

  function spliceOne(array, index) {
    var len = array.length;
    if (!len) { return; }
    while (index < len) {
      array[index] = array[index + 1]; index++;
    }
    array.length--;
  }
};

module.exports.isActive = function () {
  return active;
};

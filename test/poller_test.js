define(function (require) {

  var $ = require("@qubit/jquery");
  var poller = require("../index");

  describe("poller", function () {

    describe("the first argument", function() {

      it("should not be a number or boolean", function() {

        try {
          poller(12345, function() {});
        }
        catch (err) {
          expect(err.message).to.eql([
            "Expected first argument to be selector string",
            "or array containing selectors, window variables or functions."
          ].join(""));
        }
      });

      it("should execute a function", function(done) {
        poller(function() { return true; }, done);
      });

    });

    describe("the second argument", function() {

      it("should be a callback function", function() {
        try {
          poller("noop");
        }
        catch (err) {
          expect(err.message).to.eql("Expected second argument to be a callback function.");
        }
      });

    });

    it("should poll for window variables", function(done) {
      poller(["window.universal_variable.page.type"], function () {
        expect(window.universal_variable.page.type).to.eql("foo");
        done();
      });
      setTimeout(function () {
        window.universal_variable = {
          page: {
            type: "foo"
          }
        };
      }, 10);
    });

    it("should poll for a single selector as a string", function(done) {
      $(".some-el").remove();
      poller(".some-el", done);
      setTimeout(function () {
        $("<div>").addClass("some-el").appendTo("body");
      }, 100);
    });

    it("should poll for a single selector in an array", function(done) {
      $(".some-el").remove();
      poller([".some-el"], done);
      setTimeout(function () {
        $("<div>").addClass("some-el").appendTo("body");
      }, 10);
    });

    it("should poll for multiple selectors in an array", function(done) {
      $(".some-el, .other-el").remove();
      poller([".some-el", ".other-el"], done);
      setTimeout(function () {
        $("<div>").addClass("some-el").appendTo("body");
        $("<div>").addClass("other-el").appendTo("body");
      }, 10);
    });

    it("should poll for multiple selectors, window variables and execute filter functions", function(done) {
      $(".some-el").remove();
      poller([".some-el", "window.universal_variable.page.type", function() { return true; }], function() {
        expect(window.universal_variable.page.type).to.eql("foo");
        done();
      });
      setTimeout(function () {
        $("<div>").addClass("some-el").appendTo("body");
        window.universal_variable = {
          page: {
            type: "foo"
          }
        };
      }, 10);
    });

    it("should be able to handle callback functions that call poller", function(done) {
      var secondFunc = function() {
        console.log("second func");
        done();
      };

      var firstFunc = function() {
        console.log("first func");
        poller([function() { return true; }], secondFunc);
      };

      poller([function() { return true; }], firstFunc);
    });

    describe("pausing", function () {
      var clock;
      beforeEach(function () {
        clock = sinon.useFakeTimers();
      });
      afterEach(function () {
        clock.restore();
      });
      it("should poll after having been paused", function() {
        var cb = sinon.stub();
        poller(".foo", cb);
        clock.tick(50);
        expect(poller.isActive()).to.be.eql(true);
        clock.tick(10000);
        expect(poller.isActive()).to.be.eql(true);
        clock.tick(10000);
        expect(cb.called).to.be.eql(false);
        expect(poller.isActive()).to.be.eql(false);
      });

    });

  });

});

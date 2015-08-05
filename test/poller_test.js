define(function (require) {
  var $ = require("@qubit/jquery");
  var poller = require("../poller");

  describe("poller", function () {
    var $container;

    beforeEach(function () {
      $container = $("<div class='container'/>").appendTo("body");
    });

    afterEach(function () {
      $container.remove();
    });

    describe("the first argument", function() {
      it("should not be a number or boolean", function() {
        try {
          poller(12345, function() {});
        } catch (err) {
          expect(err.message).to.eql([
            "Expected first argument to be selector string",
            "or array containing selectors, window variables or functions."
          ].join(" "));
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
      poller(".some-el", done);
      setTimeout(function () {
        $("<div>").addClass("some-el").appendTo($container);
      }, 100);
    });

    it("should poll for a single selector in an array", function(done) {
      poller([".some-el"], done);
      setTimeout(function () {
        $("<div>").addClass("some-el").appendTo($container);
      }, 10);
    });

    it("should poll for multiple selectors in an array", function(done) {
      poller([".some-el", ".other-el"], done);
      setTimeout(function () {
        $container.append("<div class='some-el'></div><div class='other-el'></div>");
      }, 10);
    });

    it("should poll for multiple selectors, window variables and execute filter functions", function(done) {
      $(".some-el").remove();
      poller([".some-el", "window.universal_variable.page.type", function() { return true; }], function() {
        expect(window.universal_variable.page.type).to.eql("foo");
        done();
      });
      setTimeout(function () {
        $("<div>").addClass("some-el").appendTo($container);
        window.universal_variable = {
          page: {
            type: "foo"
          }
        };
      }, 10);
    });

    it("should be able to handle callback functions that call poller", function(done) {
      function secondFunc() {
        done();
      }

      function firstFunc() {
        poller([function() { return true; }], secondFunc);
      }

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

        // restart polling
        poller(".bar", cb);
        expect(poller.isActive()).to.be.eql(true);
        clock.tick(10000);
        expect(poller.isActive()).to.be.eql(true);
        clock.tick(10000);
        expect(cb.called).to.be.eql(false);
        expect(poller.isActive()).to.be.eql(false);
      });
    });

    describe("cancel", function () {
      var clock, $foo, $bar;

      beforeEach(function () {
        $foo = $("<div class='foo'/>");
        $bar = $("<div class='bar'/>");
        clock = sinon.useFakeTimers();
      });

      afterEach(function () {
        clock.restore();
      });

      it("should remove the corresponding callback from the polling chain", function () {
        var fooCb = sinon.stub();
        var cancelFoo = poller(".foo", fooCb);
        expect(poller.isActive()).to.be.eql(true);

        cancelFoo();

        // make it exist
        $container.append($foo);

        clock.tick(50);
        expect(poller.isActive()).to.be.eql(false);
        expect(fooCb.called).to.be.eql(false);
      });

      it("should continue polling for other callback items after cancelling another", function () {
        var fooCb = sinon.stub();
        var barCb = sinon.stub();
        var cancelFoo = poller(".foo", fooCb);
        poller(".bar", barCb);

        cancelFoo();

        clock.tick(100);
        expect(poller.isActive()).to.be.eql(true);
        expect(fooCb.called).to.be.eql(false);
        expect(barCb.called).to.be.eql(false);

        // make foo and bar elements exist
        $container.append($bar, $foo);

        clock.tick(100);
        expect(poller.isActive()).to.be.eql(false);
        expect(fooCb.called).to.be.eql(false);
        expect(barCb.called).to.be.eql(true);
      });
    });
  });
});

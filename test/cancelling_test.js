/* globals define describe beforeEach afterEach it expect sinon */
define(function (require) {
  var $ = require('@qubit/jquery')
  var poller = require('../poller')

  describe('cancelling', function () {
    var $container
    var clock
    var $foo
    var $bar

    beforeEach(function () {
      $container = $('<div class="container"/>').appendTo('body')
      $foo = $('<div class="foo"/>')
      $bar = $('<div class="bar"/>')
      clock = sinon.useFakeTimers()
    })

    afterEach(function () {
      window.universal_variable = false
      $container.remove()
      poller.reset()
      clock.restore()
    })

    it('should remove the corresponding callback from the polling chain', function () {
      var fooCb = sinon.stub()
      var cancelFoo = poller('.foo', fooCb)
      expect(poller.isActive()).to.be.eql(true)

      cancelFoo()

      // make it exist
      $container.append($foo)

      clock.tick(50)
      expect(poller.isActive()).to.be.eql(false)
      expect(fooCb.called).to.be.eql(false)
    })

    it('should continue polling for other callback items after cancelling another', function () {
      var fooCb = sinon.stub()
      var barCb = sinon.stub()
      var cancelFoo = poller('.foo', fooCb)
      poller('.bar', barCb)

      cancelFoo()

      clock.tick(100)
      expect(poller.isActive()).to.be.eql(true)
      expect(fooCb.called).to.be.eql(false)
      expect(barCb.called).to.be.eql(false)

      // make foo and bar elements exist
      $container.append($bar, $foo)

      clock.tick(100)
      expect(poller.isActive()).to.be.eql(false)
      expect(fooCb.called).to.be.eql(false)
      expect(barCb.called).to.be.eql(true)
    })
  })
})

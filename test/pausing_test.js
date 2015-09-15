/* globals define describe beforeEach afterEach it expect sinon */
define(function (require) {
  var $ = require('@qubit/jquery')
  var poller = require('../poller')

  describe('pausing', function () {
    var clock
    var $container

    beforeEach(function () {
      clock = sinon.useFakeTimers()
      $container = $('<div class="container"/>').appendTo('body')
    })

    afterEach(function () {
      window.universal_variable = false
      $container.remove()
      poller.reset()
      clock.restore()
    })

    it('should poll after having been paused', function () {
      var cb = sinon.stub()

      poller('.foo', cb)
      clock.tick(50)
      expect(poller.isActive()).to.be.eql(true)
      clock.tick(10000)
      expect(poller.isActive()).to.be.eql(true)
      clock.tick(10000)
      expect(cb.called).to.be.eql(false)
      expect(poller.isActive()).to.be.eql(false)

      // restart polling
      poller('.bar', cb)
      expect(poller.isActive()).to.be.eql(true)
      clock.tick(10000)
      expect(poller.isActive()).to.be.eql(true)
      clock.tick(10000)
      expect(cb.called).to.be.eql(false)
      expect(poller.isActive()).to.be.eql(false)
    })
  })
})

define(function (require) {
  var $ = require('@qubit/jquery')
  var rewire = require('rewire')
  var poller = rewire('../poller')

  describe('pausing', function () {
    var clock
    var $container
    var reverts

    beforeEach(function () {
      $container = $('<div class="container"/>').appendTo('body')
      clock = sinon.useFakeTimers()
      reverts = [poller.__set__('requestAnimationFrame', window.setTimeout)]
    })

    afterEach(function () {
      window.universal_variable = false
      $container.remove()
      poller.reset()
      clock.restore()
      while (reverts.length) reverts.pop()()
    })

    it('should poll after having been paused', function () {
      var cb = sinon.stub()

      poller('.foo', cb)
      clock.tick(poller.__get__('INITIAL_TICK'))
      expect(poller.isActive()).to.be.eql(true)
      clock.tick(poller.__get__('INITIAL_TICK'))
      expect(poller.isActive()).to.be.eql(true)
      clock.tick(poller.__get__('MAX_DURATION'))
      expect(cb.called).to.be.eql(false)
      expect(poller.isActive()).to.be.eql(false)

      // restart polling
      poller('.bar', cb)
      expect(poller.isActive()).to.be.eql(true)
      clock.tick(poller.__get__('INITIAL_TICK'))
      expect(poller.isActive()).to.be.eql(true)
      clock.tick(poller.__get__('MAX_DURATION') + poller.__get__('INITIAL_TICK'))
      expect(cb.called).to.be.eql(false)
      expect(poller.isActive()).to.be.eql(false)
    })
  })
})

/* globals describe beforeEach afterEach it */
var $ = require('@qubit/jquery')
var rewire = require('rewire')
var expect = require('expect.js')
var sinon = require('sinon')
var poller = rewire('../poller')
var tock = poller.__get__('tock')
var TICK = poller.__get__('INITIAL_TICK')
var TIMEOUT = TICK * 4

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
    poller('.foo', { timeout: TIMEOUT }).then(cb)
    clock.tick(TICK)
    expect(poller.isActive()).to.be.eql(true)
    clock.tick(TICK)
    expect(poller.isActive()).to.be.eql(true)
    clock.tick(TIMEOUT - TICK - TICK)
    tock()
    expect(cb.called).to.be.eql(false)
    expect(poller.isActive()).to.be.eql(false)

    // restart polling
    poller('.bar', { timeout: TIMEOUT }).then(cb)
    expect(poller.isActive()).to.be.eql(true)
    clock.tick(TICK)
    expect(poller.isActive()).to.be.eql(true)
    clock.tick(TIMEOUT - TICK)
    tock()
    expect(cb.called).to.be.eql(false)
    expect(poller.isActive()).to.be.eql(false)
  })
})

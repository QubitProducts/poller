/* globals describe beforeEach afterEach it */
var $ = require('@qubit/jquery')
var expect = require('expect.js')
var sinon = require('sinon')
var rewire = require('rewire')
var poller = rewire('../poller')

describe('timemout', function () {
  var $container
  var clock
  var $foo
  var reverts

  beforeEach(function () {
    $container = $('<div class="container"/>').appendTo('body')
    $foo = $('<div class="foo"/>')
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

  it('should call the timeout callback when the poller times out', function () {
    var fooCb = sinon.stub()
    var barCb = sinon.stub()
    poller('.foo')()
      .then(fooCb, barCb)

    expect(poller.isActive()).to.eql(true)
    clock.tick(poller.__get__('MAX_DURATION') + 1)
    expect(poller.isActive()).to.eql(false)
    expect(fooCb.called).to.be.eql(false)
    expect(barCb.called).to.be.eql(true)
  })

  it('should not call the timeout callback when the poller completes', function () {
    var fooCb = sinon.stub()
    var barCb = sinon.stub()
    poller('.foo')()
      .then(fooCb, barCb)

    // make it exist
    $container.append($foo)
    expect(poller.isActive()).to.eql(true)

    clock.tick(poller.__get__('MAX_DURATION') + 1)
    expect(poller.isActive()).to.eql(false)
    expect(fooCb.called).to.be.eql(true)
    expect(barCb.called).to.be.eql(false)
  })

  it('should not call the timeout callback when the poller is cancelled', function () {
    var fooCb = sinon.stub()
    var barCb = sinon.stub()
    var poll = poller('.foo', fooCb, barCb)

    poll.stop()

    clock.tick(poller.__get__('MAX_DURATION') + 1)
    expect(poller.isActive()).to.eql(false)
    expect(fooCb.called).to.be.eql(false)
    expect(barCb.called).to.be.eql(false)
  })
})

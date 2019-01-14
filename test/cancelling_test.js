/* globals describe beforeEach afterEach it */
var $ = require('@qubit/jquery')
var rewire = require('rewire')
var sinon = require('sinon')
var expect = require('expect.js')
var poller = rewire('../poller')

describe('cancelling', function () {
  var $container
  var clock
  var $foo
  var $bar
  var reverts

  beforeEach(function () {
    $container = $('<div class="container"/>').appendTo('body')
    $foo = $('<div class="foo"/>')
    $bar = $('<div class="bar"/>')
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

  it('should remove the corresponding callback from the polling chain', function () {
    var fooCb = sinon.stub()
    var cancelFoo = poller('.foo', fooCb)
    expect(poller.isActive()).to.eql(true)

    cancelFoo()

    // make it exist
    $container.append($foo)

    clock.tick(poller.__get__('INITIAL_TICK'))
    expect(poller.isActive()).to.be.eql(false)
    expect(fooCb.called).to.be.eql(false)
  })

  it('should continue polling for other callback items after cancelling another', function () {
    var fooCb = sinon.stub()
    var barCb = sinon.stub()
    var cancelFoo = poller('.foo', fooCb)
    poller('.bar', barCb)

    cancelFoo()
    clock.tick(poller.__get__('INITIAL_TICK') * 2)
    expect(poller.isActive()).to.be.eql(true)
    expect(fooCb.called).to.be.eql(false)
    expect(barCb.called).to.be.eql(false)

    // make foo and bar elements exist
    $container.append($bar, $foo)
    clock.tick(poller.__get__('INITIAL_TICK') * 2)
    expect(poller.isActive()).to.be.eql(false)
    expect(fooCb.called).to.be.eql(false)
    expect(barCb.called).to.be.eql(true)
  })
})

/* globals describe beforeEach afterEach it */
var $ = require('@qubit/jquery')
var sinon = require('sinon')
var expect = require('expect.js')
var rewire = require('rewire')
var poller = rewire('../poller')

describe('poller', function () {
  var $container, clock, reverts, stub

  beforeEach(function () {
    stub = sinon.stub()
    $container = $('<div class="container"/>').appendTo('body')
    clock = sinon.useFakeTimers()
    reverts = [poller.__set__('requestAnimationFrame', window.setTimeout)]
  })

  afterEach(function () {
    delete window.variable
    $container.remove()
    poller.reset()
    clock.restore()
    while (reverts.length) reverts.pop()()
  })

  it('should poll for window variables', function () {
    poller(['window.variable.page.type'], { logger: false }).then(stub)
    window.variable = { page: { type: 'foo' } }
    expect(stub.called).to.eql(false)
    clock.tick(poller.__get__('INITIAL_TICK'))
    expect(stub.called).to.eql(true)
  })

  it('should poll for selectors', function () {
    poller('.some-el').then(stub)
    $('<div>').addClass('some-el').appendTo($container)
    expect(stub.called).to.eql(false)
    clock.tick(poller.__get__('INITIAL_TICK'))
    expect(stub.called).to.eql(true)
  })

  it('should poll for selector arrays', function () {
    poller(['.some-el']).then(stub)
    $('<div>').addClass('some-el').appendTo($container)
    expect(stub.called).to.eql(false)
    clock.tick(poller.__get__('INITIAL_TICK'))
    expect(stub.called).to.eql(true)
  })

  it('should poll for selector arrays with multiple items', function () {
    poller(['.some-el', '.other-el']).then(stub)
    $container.append('<div class="some-el"></div><div class="other-el"></div>')
    expect(stub.called).to.eql(false)
    clock.tick(poller.__get__('INITIAL_TICK'))
    expect(stub.called).to.eql(true)
  })

  it('should not resolve if items have gone stale', function () {
    poller(['.el-1', '.el-2', '.el-3']).then(stub)
    var $el1 = $('<div class="el-1"></div>')
    var $el2 = $('<div class="el-2"></div>')
    var $el3 = $('<div class="el-3"></div>')
    $container.append($el1)
    $container.append($el2)
    expect(stub.called).to.eql(false)
    clock.tick(poller.__get__('INITIAL_TICK'))
    $el2.remove()
    $container.append($el3)
    clock.tick(poller.__get__('INITIAL_TICK'))
    expect(stub.called).to.eql(false)
    $container.append($el2)
    clock.tick(poller.__get__('INITIAL_TICK'))
    clock.tick(poller.__get__('INITIAL_TICK'))
    expect(stub.called).to.eql(true)
  })

  it('should poll for a mixture of targets', function () {
    var later = false
    $('.some-el').remove()
    poller([
      function () { return later },
      '.some-el',
      'window.variable.page.type'
    ]).then(stub)
    later = true
    $('<div>').addClass('some-el').appendTo($container)
    window.variable = {
      page: {
        type: 'foo'
      }
    }
    expect(stub.called).to.eql(false)
    clock.tick(poller.__get__('INITIAL_TICK'))
    expect(stub.called).to.eql(true)
  })

  it('should retry when errors are thrown in filter function', function () {
    poller(function () { return window.variable.page.type === 'foo' }).then(stub)
    window.variable = { page: { type: 'foo' } }
    expect(stub.called).to.eql(false)
    clock.tick(poller.__get__('INITIAL_TICK'))
    expect(stub.called).to.eql(true)
  })

  it('should retry when errors are thrown in filter function', function () {
    poller(function () { return window.variable.page.type === 'foo' }).then(stub)
    window.variable = {
      page: {
        type: 'foo'
      }
    }
    expect(stub.called).to.eql(false)
    clock.tick(poller.__get__('INITIAL_TICK'))
    expect(stub.called).to.eql(true)
  })

  it('should be able to handle callback functions that call poller', function (done) {
    function secondFunc () {
      done()
    }

    function firstFunc () {
      poller([ truethy ]).then(secondFunc)
    }

    poller([ truethy ]).then(firstFunc)
  })

  it('should not run the callback if only the first argument passes', function () {
    window.variable = {
      page: {
        type: 'foo'
      }
    }
    poller(['window.variable.page.type', 'window.somethingelse']).then(stub)
    clock.tick(poller.__get__('INITIAL_TICK'))
    expect(stub.called).to.eql(false)
  })

  function truethy () {
    return true
  }
})

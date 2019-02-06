/* globals describe beforeEach afterEach it */
var rewire = require('rewire')
var expect = require('expect.js')
var sinon = require('sinon')
var createObserver = rewire('../lib/observer')

describe('observer', function () {
  var reverts, mockWindow, observer

  beforeEach(function () {
    reverts = []
  })

  afterEach(function () {
    while (reverts.length) reverts.pop()()
  })

  it('should create a mutation observer', function () {
    setup()
    createObserver(noop)
    expect(mockWindow.MutationObserver.calledOnce).to.eql(true)
    expect(mockWindow.MutationObserver.calledWith(noop)).to.eql(true)
  })

  it('should fallback on WebKitMutationObserver', function () {
    setup('WebKitMutationObserver')
    createObserver(noop)
    expect(mockWindow.WebKitMutationObserver.calledOnce).to.eql(true)
    expect(mockWindow.WebKitMutationObserver.calledWith(noop)).to.eql(true)
  })

  it('should prevent double calling start', function () {
    setup()
    var api = createObserver(noop)
    api.start()
    api.start()
    expect(observer.observe.calledOnce).to.eql(true)
    api.stop()
    expect(observer.disconnect.calledOnce).to.eql(true)
    api.start()
    expect(observer.observe.calledTwice).to.eql(true)
  })

  it('should not try to use MutationObserver if it is not available', function () {
    setup('unavailable')
    var api = createObserver(noop)
    api.start()
    expect(observer.observe.called).to.eql(false)
    api.stop()
    expect(observer.observe.called).to.eql(false)
  })

  it('should not try to use MutationObserver if the userAgent is bad', function () {
    setup(null, 'Trident/7.0')
    var api = createObserver(noop)
    api.start()
    expect(observer.observe.called).to.eql(false)
    api.stop()
    expect(observer.observe.called).to.eql(false)
  })

  it('should be possible to enable or disable the feature', function () {
    setup()
    var api = createObserver(noop)
    api.start()
    expect(observer.observe.calledOnce).to.eql(true)
    api.stop()
    api.disable()
    api.start()
    expect(observer.disconnect.calledOnce).to.eql(true)
    api.enable()
    api.start()
    expect(observer.observe.calledTwice).to.eql(true)
  })

  it('should not be possible to enable the feature if it is unsupported', function () {
    setup(null, 'Trident/7.0')
    var api = createObserver(noop)
    api.enable()
    api.start()
    expect(observer.observe.called).to.eql(false)
  })

  function setup (attr, userAgent) {
    attr = attr || 'MutationObserver'
    mockWindow = {
      MutationObserver: false,
      WebKitMutationObserver: false,
      navigator: { userAgent: userAgent }
    }
    observer = {
      observe: sinon.stub(),
      disconnect: sinon.stub()
    }
    mockWindow[attr] = sinon.spy(function MockMutationObserver () {
      return observer
    })

    reverts = reverts.concat([createObserver.__set__({
      'window': mockWindow
    })])
  }
})

function noop () {}

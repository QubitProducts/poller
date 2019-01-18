/* globals describe beforeEach afterEach it */
var indexOf = require('slapdash').indexOf
var rewire = require('rewire')
var expect = require('expect.js')
var sinon = require('sinon')
var poller = rewire('../poller')
var raf = rewire('../lib/raf')
var validFrame = require('../lib/valid_frame')
var validFrames = validFrame.getValidFrames()

describe('request animation frame', function () {
  this.timeout(5000)

  var reverts, validFrameSpy

  beforeEach(function () {
    window.bgark = {}
    validFrameSpy = sinon.spy(validFrame)
    reverts = [poller.__set__('validFrame', validFrameSpy)]
  })

  afterEach(function () {
    poller.reset()
    while (reverts.length) reverts.pop()()
  })

  it('should only fire on valid frames per second', function (done) {
    poller('window.bgark.mcgee')()
      .then(function () {
        // Should be ~60frames === 1 second at ~60fps
        expect(validFrameSpy.callCount).to.be.below(65)
        expect(validFrameSpy.callCount).to.be.above(55)
        checkAllValidFrameCalls()
        done()
      })
      .catch(done)
    setTimeout(function () {
      window.bgark.mcgee = true
    }, 1000)
  })

  it('should only last until the backoff threshold', function (done) {
    poller('window.bgark.mcgee')()
      .then(function () {
        // Should be ~180frames === 3 seconds at ~60fps
        expect(validFrameSpy.callCount).to.be.below(185)
        expect(validFrameSpy.callCount).to.be.above(175)
        checkAllValidFrameCalls()
        done()
      })
      .catch(done)
    setTimeout(function () {
      window.bgark.mcgee = true
    }, 4000)
  })

  describe('fallbacks', function () {
    var mockWindow

    it('should fallback on webkitRequestAnimationFrame', function () {
      setup('webkitRequestAnimationFrame')
      raf(noop)
      expect(mockWindow.webkitRequestAnimationFrame.calledOnce).to.eql(true)
    })

    it('should fallback on mozRequestAnimationFrame', function () {
      setup('mozRequestAnimationFrame')
      raf(noop)
      expect(mockWindow.mozRequestAnimationFrame.calledOnce).to.eql(true)
    })

    it('should fallback on setTimeout', function () {
      setup('setTimeout')
      raf(noop)
      expect(mockWindow.setTimeout.calledOnce).to.eql(true)
    })

    function setup (attr) {
      mockWindow = {
        requestAnimationFrame: false,
        webkitRequestAnimationFrame: false,
        mozRequestAnimationFrame: false,
        setTimeout: false
      }
      mockWindow[attr] = sinon.stub()
      reverts = reverts.concat([raf.__set__({
        'window': mockWindow
      })])
    }
  })

  function checkAllValidFrameCalls () {
    for (var i = 0; i < validFrameSpy.callCount; i++) {
      var call = validFrameSpy.getCall(i)
      if (indexOf(validFrames, (i % 60) + 1) !== -1) {
        expect(call.returnValue).to.eql(true)
      } else {
        expect(call.returnValue).to.eql(false)
      }
    }
  }
})

function noop () {}

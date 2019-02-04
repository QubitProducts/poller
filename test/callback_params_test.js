/* globals describe beforeEach afterEach it */
var $ = require('@qubit/jquery')
var poller = require('../poller')
var expect = require('expect.js')

describe('poller', function () {
  this.timeout(4000)
  var $container

  beforeEach(function () {
    $container = $('<div class="container"/>').appendTo('body')
  })

  afterEach(function () {
    window.universal_variable = false
    $container.remove()
    poller.reset()
  })

  it('should support a singleton shorthand', function (done) {
    var $someEl = $('<div>').addClass('some-el')
    poller('.some-el').then(function (el) {
      expect(el).to.eql($someEl[0])
      done()
    })
    setTimeout(function () {
      $someEl.appendTo($container)
    }, 0)
  })

  it('should return window variables', function (done) {
    poller(['window.universal_variable.page.type']).then(function (items) {
      expect(items[0]).to.eql('foo')
      done()
    })
    setTimeout(function () {
      window.universal_variable = { page: { type: 'foo' } }
    }, 0)
  })

  it('should return DOM elements', function (done) {
    var $someEl = $('<div>').addClass('some-el')
    poller(['.some-el']).then(function (items) {
      expect(items[0]).to.eql($someEl[0])
      done()
    })
    setTimeout(function () {
      $someEl.appendTo($container)
    }, 0)
  })

  it('should return function values', function (done) {
    poller([ function () { return 'bar' } ]).then(function (items) {
      expect(items[0]).to.eql('bar')
      done()
    })
    setTimeout(function () {
      window.universal_variable = { page: { type: 'foo' } }
    }, 0)
  })
})

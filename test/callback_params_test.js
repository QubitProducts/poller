/* globals define describe beforeEach afterEach expect it */
define(function (require) {
  var $ = require('@qubit/jquery')
  var poller = require('../poller')

  describe('poller', function () {
    var $container

    beforeEach(function () {
      $container = $('<div class="container"/>').appendTo('body')
    })

    afterEach(function () {
      window.universal_variable = false
      $container.remove()
      poller.reset()
    })

    it('should return window variables', function (done) {
      poller(['window.universal_variable.page.type'], function (pageType) {
        expect(pageType).to.eql('foo')
        done()
      })
      setTimeout(function () {
        window.universal_variable = { page: { type: 'foo' } }
      }, 0)
    })

    it('should return jquery elements', function (done) {
      var $someEl = $('<div>').addClass('some-el')
      poller(['.some-el'], function ($el) {
        expect($el[0]).to.eql($someEl[0])
        done()
      })
      setTimeout(function () {
        $someEl.appendTo($container)
      }, 0)
    })

    it('should return function values', function (done) {
      poller([ function () { return 'bar' } ], function (foo) {
        expect(foo).to.eql('bar')
        done()
      })
      setTimeout(function () {
        window.universal_variable = { page: { type: 'foo' } }
      }, 0)
    })
  })
})

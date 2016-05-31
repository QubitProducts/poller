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

    it('should poll for window variables', function (done) {
      poller(['window.universal_variable.page.type'], function () { done() })
      setTimeout(function () {
        window.universal_variable = { page: { type: 'foo' } }
      }, 0)
    })

    it('should poll for selectors', function (done) {
      poller('.some-el', function () { done() })
      setTimeout(function () {
        $('<div>').addClass('some-el').appendTo($container)
      }, 0)
    })

    it('should poll for selector arrays', function (done) {
      poller(['.some-el'], function () { done() })
      setTimeout(function () {
        $('<div>').addClass('some-el').appendTo($container)
      }, 0)
    })

    it('should poll for selector arrays with multiple items', function (done) {
      poller(['.some-el', '.other-el'], function () { done() })
      setTimeout(function () {
        $container.append('<div class="some-el"></div><div class="other-el"></div>')
      }, 0)
    })

    it('should poll for a mixture of targets', function (done) {
      var later = false
      $('.some-el').remove()
      poller(['.some-el', 'window.universal_variable.page.type', function () { return later }], function () { done() })
      setTimeout(function () {
        later = true
        $('<div>').addClass('some-el').appendTo($container)
        window.universal_variable = {
          page: {
            type: 'foo'
          }
        }
      }, 0)
    })

    it('should retry when errors are thrown in filter function', function (done) {
      poller(function () { return window.universal_variable.page.type === 'foo' }, function () { done() })
      setTimeout(function () {
        window.universal_variable = {
          page: {
            type: 'foo'
          }
        }
      }, 0)
    })

    it('should be able to handle callback functions that call poller', function (done) {
      function secondFunc () {
        done()
      }

      function firstFunc () {
        poller([
          function () {
            return true
          }
        ], secondFunc)
      }

      poller([
        function () {
          return true
        }
      ], firstFunc)
    })
  })
})

/* globals describe beforeEach afterEach it */
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
    poller(['window.universal_variable.page.type'])
      .start()
      .then(function () {
        done()
      })
    setTimeout(function () {
      window.universal_variable = { page: { type: 'foo' } }
    }, 0)
  })

  it('should poll for selectors', function (done) {
    poller('.some-el')
      .start()
      .then(function () {
        done()
      })
    setTimeout(function () {
      $('<div>').addClass('some-el').appendTo($container)
    }, 0)
  })

  it('should poll for selector arrays', function (done) {
    poller(['.some-el'])
      .start()
      .then(function () {
        done()
      })
    setTimeout(function () {
      $('<div>').addClass('some-el').appendTo($container)
    }, 0)
  })

  it('should poll for selector arrays with multiple items', function (done) {
    poller(['.some-el', '.other-el'])
      .start()
      .then(function () {
        done()
      })
    setTimeout(function () {
      $container.append('<div class="some-el"></div><div class="other-el"></div>')
    }, 0)
  })

  it('should poll for a mixture of targets', function (done) {
    var later = false
    $('.some-el').remove()
    poller([
      '.some-el',
      'window.universal_variable.page.type',
      function () { return later }
    ])
    .start()
    .then(function () {
      done()
    })
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
    poller(function () { return window.universal_variable.page.type === 'foo' })
      .start()
      .then(function () {
        done()
      })
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
      ])
      .start()
      .then(secondFunc)
    }

    poller([
      function () {
        return true
      }
    ])
    .start()
    .then(firstFunc)
  })
})

it('should not run the callback if only the first argument passes', function (done) {
  var cbFired = false
  window.universal_variable = {
    page: {
      type: 'foo'
    }
  }
  poller(['window.universal_variable.page.type', 'window.somethingelse'])
    .start()
    .then(function () {
      cbFired = true
    })
  setTimeout(function () {
    if (cbFired) {
      done(new Error('should not have fired'))
    }
    done()
  }, 0)
})

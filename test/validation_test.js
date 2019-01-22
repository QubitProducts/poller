/* globals beforeEach afterEach describe it */
var _ = require('slapdash')
var poller = require('../poller')
var POLLER_ERROR = 'EPOLLER'
var sinon = require('sinon')
var expect = require('expect.js')

describe('validation', function () {
  afterEach(function () {
    poller.reset()
  })

  it('should not poll if an error is thrown', function () {
    try {
      poller(12345) // This should fail validation
    } catch (err) {}
    return expect(poller.isActive()).to.eql(false)
  })

  describe('while in preview', function () {
    beforeEach(function () {
      window.__qubit = { previewActive: true }
    })

    afterEach(function () {
      delete window.__qubit
    })

    describe('the second argument', function () {
      beforeEach(function () {
        sinon.spy(poller.logger, 'warn')
      })

      afterEach(function () {
        poller.logger.warn.restore()
      })
      it('must be an object or undefined', function () {
        var allowed = [{}, void 0]
        _.each(allowed, function (arg) {
          poller([], arg)
        })
        var disallowed = [function () {}, 1234, null, true]
        _.each(disallowed, function (arg) {
          let error
          try {
            poller([], arg)
          } catch (err) {
            error = err
          }
          expect(error && error.code).to.eql(POLLER_ERROR)
        })
      })

      it('should warn about the new api', function () {
        var error
        try {
          poller([], function () {})
        } catch (err) {
          error = err
        }
        expect(error && error.code).to.eql(POLLER_ERROR)
        expect(poller.logger.warn.calledWith(sinon.match(function (warning) {
          return warning.indexOf('https://package-browser.qubit.com/packages/@qubit/poller') > -1
        }))).to.eql(true)
      })
    })

    describe('the first argument', function () {
      it('should not be a number', function () {
        try {
          poller(12345)
        } catch (err) {
          return expect(err.code).to.eql(POLLER_ERROR)
        }
        throw new Error('poller did not throw an error')
      })

      it('should not be a boolean', function () {
        try {
          poller(true)
        } catch (err) {
          return expect(err.code).to.eql(POLLER_ERROR)
        }
        throw new Error('poller did not throw an error')
      })

      it('should not be null', function () {
        try {
          poller(null)
        } catch (err) {
          return expect(err.code).to.eql(POLLER_ERROR)
        }
        throw new Error('poller did not throw an error')
      })

      it('should not be undefined', function () {
        try {
          poller(undefined)
        } catch (err) {
          return expect(err.code).to.eql(POLLER_ERROR)
        }
        throw new Error('poller did not throw an error')
      })

      it('should not be an object', function () {
        try {
          poller({})
        } catch (err) {
          return expect(err.code).to.eql(POLLER_ERROR)
        }
        throw new Error('poller did not throw an error')
      })

      it('should execute a function', function (done) {
        poller(function () { return true })
          .then(function () { done() })
      })

      describe('as an array', function () {
        it('should not contain a number', function () {
          try {
            poller(12345)
          } catch (err) {
            return expect(err.code).to.eql(POLLER_ERROR)
          }
          throw new Error('poller did not throw an error')
        })

        it('should not contain a boolean', function () {
          try {
            poller(true)
          } catch (err) {
            return expect(err.code).to.eql(POLLER_ERROR)
          }
          throw new Error('poller did not throw an error')
        })

        it('should not contain null', function () {
          try {
            poller(null)
          } catch (err) {
            return expect(err.code).to.eql(POLLER_ERROR)
          }
          throw new Error('poller did not throw an error')
        })

        it('should not contain undefined', function () {
          try {
            poller(undefined)
          } catch (err) {
            return expect(err.code).to.eql(POLLER_ERROR)
          }
          throw new Error('poller did not throw an error')
        })

        it('should not contain an object', function () {
          try {
            poller({})
          } catch (err) {
            return expect(err.code).to.eql(POLLER_ERROR)
          }
          throw new Error('poller did not throw an error')
        })
      })
    })
  })
})

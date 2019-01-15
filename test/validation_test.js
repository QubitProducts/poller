/* globals beforeEach afterEach describe it */
var poller = require('../poller')
var POLLER_ERROR = 'EPOLLER'
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
          .start()
          .then(function () { done() })
      })

      describe('as an array', function () {
        it('should not contain a number', function () {
          try {
            poller(12345).start()
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

/* globals define beforeEach afterEach describe it expect */
define(function (require) {
  var poller = require('../poller')
  var POLLER_ERROR = 'EPOLLER'

  describe('validation', function () {
    afterEach(function () {
      poller.reset()
    })

    it('should not poll if an error is thrown', function () {
      try {
        poller(12345, function () {}) // This should fail validation
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
            poller(12345, function () {})
          } catch (err) {
            return expect(err.code).to.eql(POLLER_ERROR)
          }
          throw new Error('poller did not throw an error')
        })

        it('should not be a boolean', function () {
          try {
            poller(true, function () {})
          } catch (err) {
            return expect(err.code).to.eql(POLLER_ERROR)
          }
          throw new Error('poller did not throw an error')
        })

        it('should not be null', function () {
          try {
            poller(null, function () {})
          } catch (err) {
            return expect(err.code).to.eql(POLLER_ERROR)
          }
          throw new Error('poller did not throw an error')
        })

        it('should not be undefined', function () {
          try {
            poller(undefined, function () {})
          } catch (err) {
            return expect(err.code).to.eql(POLLER_ERROR)
          }
          throw new Error('poller did not throw an error')
        })

        it('should not be an object', function () {
          try {
            poller({}, function () {})
          } catch (err) {
            return expect(err.code).to.eql(POLLER_ERROR)
          }
          throw new Error('poller did not throw an error')
        })

        it('should execute a function', function (done) {
          poller(function () { return true }, function () { done() })
        })

        describe('as an array', function () {
          it('should not contain a number', function () {
            try {
              poller(12345, function () {})
            } catch (err) {
              return expect(err.code).to.eql(POLLER_ERROR)
            }
            throw new Error('poller did not throw an error')
          })

          it('should not contain a boolean', function () {
            try {
              poller(true, function () {})
            } catch (err) {
              return expect(err.code).to.eql(POLLER_ERROR)
            }
            throw new Error('poller did not throw an error')
          })

          it('should not contain null', function () {
            try {
              poller(null, function () {})
            } catch (err) {
              return expect(err.code).to.eql(POLLER_ERROR)
            }
            throw new Error('poller did not throw an error')
          })

          it('should not contain undefined', function () {
            try {
              poller(undefined, function () {})
            } catch (err) {
              return expect(err.code).to.eql(POLLER_ERROR)
            }
            throw new Error('poller did not throw an error')
          })

          it('should not contain an object', function () {
            try {
              poller({}, function () {})
            } catch (err) {
              return expect(err.code).to.eql(POLLER_ERROR)
            }
            throw new Error('poller did not throw an error')
          })
        })
      })

      describe('the second argument', function () {
        it('should be a callback function', function () {
          try {
            poller('noop')
          } catch (err) {
            return expect(err.code).to.eql(POLLER_ERROR)
          }
          throw new Error('poller did not throw an error')
        })
      })
    })
  })
})

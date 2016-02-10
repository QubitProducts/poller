/* globals define describe it expect */
define(function (require) {
  var poller = require('../poller')

  describe('validation', function () {
    describe('the first argument', function () {
      it('should not be a number', function () {
        try {
          poller(12345, function () {})
        } catch (err) {
          expect(err.message).to.eql(
            'Expected first argument to be selector string ' +
            'or array containing selectors, window variables or functions.'
          )
        }
      })

      it('should not be a boolean', function () {
        try {
          poller(true, function () {})
        } catch (err) {
          expect(err.message).to.eql(
            'Expected first argument to be selector string ' +
            'or array containing selectors, window variables or functions.'
          )
        }
      })

      it('should not be null', function () {
        try {
          poller(null, function () {})
        } catch (err) {
          expect(err.message).to.eql(
            'Expected first argument to be selector string ' +
            'or array containing selectors, window variables or functions.'
          )
        }
      })

      it('should not be undefined', function () {
        try {
          poller(undefined, function () {})
        } catch (err) {
          expect(err.message).to.eql(
            'Expected first argument to be selector string ' +
            'or array containing selectors, window variables or functions.'
          )
        }
      })

      it('should not be an object', function () {
        try {
          poller({}, function () {})
        } catch (err) {
          expect(err.message).to.eql(
            'Expected first argument to be selector string ' +
            'or array containing selectors, window variables or functions.'
          )
        }
      })

      it('should execute a function', function (done) {
        poller(function () { return true }, function () { done() })
      })

      describe('as an array', function () {
        it('should not contain a number', function () {
          try {
            poller(12345, function () {})
          } catch (err) {
            expect(err.message).to.eql(
              'Expected first argument to be selector string ' +
              'or array containing selectors, window variables or functions.'
            )
          }
        })

        it('should not contain a boolean', function () {
          try {
            poller(true, function () {})
          } catch (err) {
            expect(err.message).to.eql(
              'Expected first argument to be selector string ' +
              'or array containing selectors, window variables or functions.'
            )
          }
        })

        it('should not contain null', function () {
          try {
            poller(null, function () {})
          } catch (err) {
            expect(err.message).to.eql(
              'Expected first argument to be selector string ' +
              'or array containing selectors, window variables or functions.'
            )
          }
        })

        it('should not contain undefined', function () {
          try {
            poller(undefined, function () {})
          } catch (err) {
            expect(err.message).to.eql(
              'Expected first argument to be selector string ' +
              'or array containing selectors, window variables or functions.'
            )
          }
        })

        it('should not contain an object', function () {
          try {
            poller({}, function () {})
          } catch (err) {
            expect(err.message).to.eql(
              'Expected first argument to be selector string ' +
              'or array containing selectors, window variables or functions.'
            )
          }
        })
      })
    })

    describe('the second argument', function () {
      it('should be a callback function', function () {
        try {
          poller('noop')
        } catch (err) {
          expect(err.message).to.eql('Expected second argument to be a callback function.')
        }
      })
    })
  })
})

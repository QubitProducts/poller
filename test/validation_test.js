/* globals define describe it expect */
define(function (require) {
  var poller = require('../poller')

  describe('validation', function () {
    describe('the first argument', function () {
      it('should not be a number or boolean', function () {
        try {
          poller(12345, function () {})
        } catch (err) {
          expect(err.message).to.eql(
            'Expected first argument to be selector string ' +
            'or array containing selectors, window variables or functions.'
          )
        }
      })

      it('should execute a function', function (done) {
        poller(function () { return true }, done)
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

/* globals define describe it expect */
define(function (require) {
  var disableMutationObserver = require('../lib/disable_mutation_observer')

  describe('disableMutationObserver', function () {
    it('detects broken Angular', function () {
      delete window.angular
      expect(disableMutationObserver()).to.be.false

      window.angular = version('1.2.29')
      expect(disableMutationObserver()).to.be.false

      window.angular = version('1.2.30')
      expect(disableMutationObserver()).to.be.false

      window.angular = version('1.3.1')
      expect(disableMutationObserver()).to.be.false

      window.angular = version('1.3.100')
      expect(disableMutationObserver()).to.be.false

      window.angular = version('1000.3.100')
      expect(disableMutationObserver()).to.be.false

      window.angular = version('2.1.1')
      expect(disableMutationObserver()).to.be.false

      window.angular = version('2.0.0')
      expect(disableMutationObserver()).to.be.false

      window.angular = version('2.0')
      expect(disableMutationObserver()).to.be.false

      window.angular = version('1.2.28')
      expect(disableMutationObserver()).to.be.true

      window.angular = version('1.1.30')
      expect(disableMutationObserver()).to.be.true

      window.angular = version('1.1.1')
      expect(disableMutationObserver()).to.be.true

      window.angular = version('0.0.1')
      expect(disableMutationObserver()).to.be.true

      window.angular = version('0.0.40')
      expect(disableMutationObserver()).to.be.true

      window.angular = version('0.1')
      expect(disableMutationObserver()).to.be.true

      window.angular = {}
      expect(disableMutationObserver()).to.be.false

      window.angular = 'dsajdlsaj'
      expect(disableMutationObserver()).to.be.false

      window.angular = {version: {}}
      expect(disableMutationObserver()).to.be.false

      window.angular = {version: { major: false }}
      expect(disableMutationObserver()).to.be.false
    })
  })

  function version (v) {
    v = v.split('.').map(parseFloat)
    return { version: { major: v[0], minor: v[1], dot: v[2] } }
  }
})

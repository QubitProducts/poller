/* globals define describe it expect beforeEach afterEach */
define(function (require) {
  var disableMutationObserver = require('../lib/disable_mutation_observer')
  var ie = 'Foo Trident/7.0 bar'

  describe('disableMutationObserver', function () {
    beforeEach(function () {
      delete window.angular
      delete window.__qubit
    })

    afterEach(function () {
      delete window.angular
      delete window.__qubit
    })

    it('returns false by default', function () {
      expect(disableMutationObserver()).to.be.false
    })

    it('detects the global config flag if ie11', function () {
      window.__qubit = { disableMutationObserver: true }
      expect(disableMutationObserver()).to.be.false
      expect(disableMutationObserver(ie)).to.be.true
    })

    it('detects broken Angular', function () {
      expect(disableMutationObserver(ie)).to.be.false

      window.angular = version('1.2.29')
      expect(disableMutationObserver(ie)).to.be.false

      window.angular = version('1.2.30')
      expect(disableMutationObserver(ie)).to.be.false

      window.angular = version('1.3.1')
      expect(disableMutationObserver(ie)).to.be.false

      window.angular = version('1.3.100')
      expect(disableMutationObserver(ie)).to.be.false

      window.angular = version('1000.3.100')
      expect(disableMutationObserver(ie)).to.be.false

      window.angular = version('2.1.1')
      expect(disableMutationObserver(ie)).to.be.false

      window.angular = version('2.0.0')
      expect(disableMutationObserver(ie)).to.be.false

      window.angular = version('2.0')
      expect(disableMutationObserver(ie)).to.be.false

      window.angular = version('1.2.28')
      expect(disableMutationObserver(ie)).to.be.true

      window.angular = version('1.1.30')
      expect(disableMutationObserver(ie)).to.be.true

      window.angular = version('1.1.1')
      expect(disableMutationObserver(ie)).to.be.true

      window.angular = version('0.0.1')
      expect(disableMutationObserver(ie)).to.be.true

      window.angular = version('0.0.40')
      expect(disableMutationObserver(ie)).to.be.true

      window.angular = version('0.1')
      expect(disableMutationObserver(ie)).to.be.true

      window.angular = {}
      expect(disableMutationObserver(ie)).to.be.false

      window.angular = 'dsajdlsaj'
      expect(disableMutationObserver(ie)).to.be.false

      window.angular = {version: {}}
      expect(disableMutationObserver(ie)).to.be.false

      window.angular = {version: { major: false }}
      expect(disableMutationObserver(ie)).to.be.false
    })
  })

  function version (v) {
    v = v.split('.').map(parseFloat)
    return { version: { major: v[0], minor: v[1], dot: v[2] } }
  }
})

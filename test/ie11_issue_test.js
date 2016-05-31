define(function (require) {
  var disableMutationObserver = require('../lib/disable_mutation_observer')
  var chrome = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.41 Safari/537.36'
  var ie = 'Foo Trident/7.0 bar'

  describe('disableMutationObserver', function () {
    it('returns false by default', function () {
      expect(disableMutationObserver(chrome)).to.be.false
    })

    it('detects the global config flag if ie11', function () {
      window.__qubit = { disableMutationObserver: true }
      expect(disableMutationObserver()).to.be.false
      expect(disableMutationObserver(ie)).to.be.true
    })
  })
})

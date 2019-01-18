var poller = require('../index')
var $ = require('@qubit/jquery')
window.poller = poller

try {
  poller(['window.universal_variable.page.type'])
} catch (e) {
  console.log('Expection: thrown if no callback function is supplied as the second parameter')
}

// Be able to poll for window variables
poller(['window.universal_variable.page.type'])()
  .then(function () {
    console.log('Loaded: window.universal_variable.page.type')
  })

// Be able to poll for a single selector
poller('#hero-image img')()
  .then(function () {
    console.log('Loaded: #hero-image img')
  })

// Be able to poll for a single selector
poller(['#hero-image img'])()
  .then(function () {
    console.log('Loaded: #hero-image img')
  })

// Be able to poll for multiple selectors
poller(['#hero-image img', '.top-nav li:last'])()
  .then(function () {
    console.log('Loaded: #hero-image img')
    console.log('Loaded: .top-nav li:last')
  })

// Be able to poll for multiple selectors, window variables and execute filter functions
poller(['window.universal_variable.page.type', '#hero-image img', function () { return true }])()
  .then(function () {
    console.log('Loaded: window.universal_variable.page.type')
    console.log('Loaded: #hero-image img')
  })

setTimeout(function () {
  $('body').append('<div class="test-div"/>')
}, 2000)

// Be able to poll for something after page load
poller(['.test-div'])()
  .then(function () {
    console.log('Loaded: .test-div')
  })

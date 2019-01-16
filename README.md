@qubit/poller
=============

Poller allows you to wait for:
  - the presence of DOM elements
  - window variables to be defined
  - arbitrary conditions to be met

...and returns a promise for those elements, variables or the results of your custom poll functions

### Usage

```js
var poller = require('@qubit/poller')

// Simple case: poll for DOM elements by passing in a selector
poller(['body > .nav']).start().then(function (items) {
  var nav = items[0]
  console.log(nav)
})

// Create a poller instance with several targets
var poll = poller(['body > .nav', 'window.foo.bar', function () {
  return true
}])

poll
  // Start polling
  .start()
  // The start method returns a promise for the items being polled for
  .then(function (items) {
    var nav = items[0]
    var bar = items[1]
    var truthyThing = items[2]
    console.log(nav, bar, truthyThing)
  })

// Stop polling
poll.stop()

var $ = require('jquery')

// Custom functions allow you to poll for arbitrary conditions
poller([function checkModalVisibility () {
  return $('.modal:visible')
}])
.start()
.then(cb)

// Poll for variables on the window object (these resolve when the variable is no longer undefined)
poller(['window.foo.bar']).start().then(function (items) {
  var bar = items[0]
})
```
The max polling time is 15 seconds - if all conditions are not all met within this time, polling will stop

However you can stop polling earlier by calling stop on your polling instance:
```js
const poll = poller(['body, > .nav'])
poll.start()
setTimeout(poll.stop, 5000)
```

When the poller times out the promise is rejected. You can handle this case like so:
```js
poller(['window.foo', () => false, 'body'])
  .start()
  .then(cb)
  .catch(function (err) {
    console.log(err)
    // => poller timed out: could not resolve function () { return false }
  })

window.foo = 'bar'
```

### Performance
Since the main usage of this library is to ensure certain DOM elements are present on page, performance is optimised by using `MutationObserver` if available. Failing this, poller will use `requestAnimationFrame`, or `setTimeout` with a backoff multiplier of 1.5 after 3 seconds

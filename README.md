@qubit/poller
=============

Poller allows you to wait for:
  - the presence of DOM elements
  - window variables to be defined
  - arbitrary conditions to be met

and returns a promise for those elements, variables or the results of your custom poll functions

### Simple usage

```js
var poller = require('@qubit/poller')

// Wait for DOM elements by passing in a selector:
poller(['body > .nav']).start().then(cb)

// Wait for variables on the window object to be defined:
poller(['window.foo.bar']).start().then(cb)

// Wait for arbitrary conditions to be true by passing in a custom function:
poller([() => true]).start().then(cb)

// Mix and match:
poller(['body > .nav', 'window.foo', () => true]).start().then(cb)

```

### Advanced usage

```js
// Create a poller instance with several targets
var poll = poller(['body > .nav', 'window.foo.bar', function () {
  return true
}])

poll
  // Start polling - the start method returns a promise for the items being polled for
  .start()
  .then(function ([nav, bar, truthyThing]) {
    // The array of items being polled for will be passed to your callback function
    console.log(nav, bar, truthyThing)
  })

// Stop polling
poll.stop()
```

The max polling time is 15 seconds - if all conditions are not all met within this time, polling will stop

However you can stop polling earlier by calling stop on your polling instance:
```js
const poll = poller(['body, > .nav'])
poll.start()
setTimeout(poll.stop, 5000)
```

When the poller times out the promise is rejected
It's possible to run a function when the poller expires by handling this case like so:
```js
poller([() => false])
  .start()
  .then(cb)
  .catch(function (err) {
    console.log(err)
    // => Poller timed out: could not resolve function () { return false }
  })
```

### Performance
Since the main usage of this library is to ensure certain DOM elements are present on page, performance is optimised by using `MutationObserver` if available. Failing this, poller will use `requestAnimationFrame`, or `setTimeout` with a backoff multiplier of 1.5 after 3 seconds

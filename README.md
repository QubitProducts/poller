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
poller(['body > .nav']).then(cb)

// Wait for variables on the window object to be defined:
poller(['window.foo.bar']).then(cb)

// Wait for arbitrary conditions to be true by passing in a custom function:
poller([() => true]).then(cb)

// Mix and match:
poller(['body > .nav', 'window.foo', () => true]).then(cb)

```

### Advanced usage

```js
// Create a poller instance with several targets
var poll = poller([
  'body > .nav',
  'window.foo.bar',
  () => true
], {
  // Custom logger
  logger: logger
})

// Start polling
poll
  // returns a promise for the items being polled for
  .then(function ([nav, bar, truthyThing]) {
    // The array of items being polled for will be passed to your callback function
    console.log(nav, bar, truthyThing)
  })

// Stop polling
poll.stop()

// Start polling again
poll.start()
```

The max polling time is 15 seconds - if all conditions are not all met within this time, polling will stop

However you can stop polling earlier by calling stop on your polling instance:
```js
const poll = poller(['body, > .nav'])
setTimeout(poll.stop, 5000)
```

When the poller times out the promise is rejected

You can handle this case like so:
```js
poller([() => false])
  .then(cb)
  .catch(function (err) {
    console.log(err)
    // => Poller timed out: could not resolve function () { return false }
  })
```

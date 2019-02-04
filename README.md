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

// Wait for the presence of DOM elements by passing in a selector:
poller('body > .nav').then(function (nav) {
  console.log(nav)
})

// Wait for window variables to be defined:
poller('window.foo.bar').then(function (bar) {
  console.log(bar)
})

// Wait for arbitrary conditions to become truthy by passing in a custom function:
poller(() => true).then(cb)

// Mix and match:
poller(['body > .nav', 'window.foo', () => 1234]).then(function ([nav, foo, id]) {
  console.log(nav, foo, id)
})
```

### Advanced usage

```js
// Create a poller instance with several targets
var poll = poller([
  'body > .nav',
  'window.foo.bar',
  () => 123
], {
  // Custom logger
  logger: logger
})

// Start polling
poll
  // returns a promise for the items being polled for
  .then(function ([nav, bar, id]) {
    console.log(nav, bar, id)
  })

// Stop polling
poll.stop()

// Start polling again
poll.start()
```

The max polling time is 15 seconds - if all conditions are not all met within this time, polling will stop

However you can stop polling earlier by calling stop on your polling instance:
```js
const poll = poller('body, > .nav')
setTimeout(poll.stop, 5000)
```

When the poller times out the promise is rejected

You can handle this case like so:
```js
poller(() => false)
  .then(cb)
  .catch(function (err) {
    console.log(err)
    // => Poller timed out: could not resolve function () { return false }
  })
```

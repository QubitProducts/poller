@qubit/poller
=============

Poller allows you to wait for:
  - the presence of DOM elements
  - window variables to be defined
  - arbitrary conditions to be met

and returns a promise for those elements, variables or the results of your custom poll functions

### Design considerations

We have careful designed this module to be highly performant during the most critical stages of page loading. Here are some of the considerations we have made:

- We use the `document.querySelector` method to check if an element is on the page
  - We do not use `document.querySelectorAll` as this would require walking the entire DOM tree, whereas `querySelector` bails at the first match
  - Some of our competitors rely on the jQuery 'Sizzle' selector engine, which is much larger in size and slower
- When an element is not found, we apply an exponential backoff to minimise impact on page performance
  - We choose to poll a little more often at first to reduce page flicker, but then rapidly back off
- We use the `requestAnimationFrame` JavaScript function instead of `setTimeout` to ensure we do not cause janky rendering
- When polling for multiple things, successful matches are temporarily cached to avoid unnecessary repeated polling, and then re-evaluated one final time once everything is ready to ensure they still exist


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
  // Options
  logger: logger // Pass in a custom logger
  stopOnError: true // Prevents error suppression during evaluation
  timeout: 1000 // Number of milliseconds after which the poller will expire unresolved items
  queryAll: true // Use querySelectorAll to retrive a node list matching the selector
})

poll
  // returns a promise for the items being polled for
  .then(function ([nav, bar, id]) {
    console.log(nav, bar, id)
  })

```

The default timeout is 15 seconds - if all conditions are not all met within this time, polling will stop

However you can stop and restart polling at any time by calling `stop` and `start`:
```js
const poll = poller('body, > .nav')

// Stop polling
poll.stop()

// Restart polling
poll.start()
```

When the poller times out the promise is rejected:
```js
poller(() => false)
  .then(cb)
  .catch(function (err) {
    console.log(err)
    // => Poller timed out: could not resolve function () { return false }
  })

```
Note: This library uses the [sync-p](https://github.com/QubitProducts/sync-p) promise library which will resolve synchronously if your items are already resolvable

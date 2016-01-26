@qubit/poller
=====

### Examples

```js
var poller = require('@qubit/poller')
// 1.
poller('.nav', cb)

// 2.
poller(function() { return true }, cb)

// 3.
poller(['.nav', '.header'], cb)

// 4.
poller(['.nav', 'window.universal_variable'], cb)

// 5.
poller(['.nav', 'window.universal_variable', function () {
  return true
}], cb)
```

The resulting targets will be passed into the `cb` in the same order:

```js
poller(['.nav', 'window.universal_variable.page.type', function () {
  return window.foo()
}], function ($nav, pageType, bar) {
  ...
})
```

## Todo
* Test multiple intervals (from 10-200ms, linearly increasing on each poll)
* Test difference methods of polling (setTimeout / setInterval, requestAnimationFrame, mutationObservers)

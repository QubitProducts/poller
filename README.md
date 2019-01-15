@qubit/poller
=============

Poller allows you to test for certain elements to be on site or certain conditions to be true before proceeding with a callback function

### Usage

```js
var poller = require('@qubit/poller')

// Poll for DOM elements by passing in a selector
poller(['body > .nav']).start().then(cb)

poller(['body > .nav']).start().then(cb)


// Pass in custom functions to be tested
// Any truthy value returned will be considered a passing condition
poller([function () { return true })).start().then(cb)


// Shorthand for testing that window variables are not undefined
poller(['window.foo.bar']).start().then(cb)

// which is equivalent to
poller([function () {
  return window.foo && typeof window.foo.bar !== 'undefined'
}])
.start()
.then(cb)


// Or mix and match
poller(['body > .nav', 'window.foo', () => true])
  .start()
  .then(cb)

```

The items being polled for will be passed to your callback function in the same order:

```js
poller([ 'body > .nav', 'window.page.type', () => window.foo ])
  .start()
  .then(function cb ([nav, pageType, foo]) {
    console.log(nav)
    // => `.nav` DOM element

    console.log(pageType)
    // => 'home'

    console.log(foo)
    // => 'bar'
  })

window.page = { type: 'home' }
window.foo = 'bar'
```

You can stop poller from polling by calling stop on your polling instance:
```js
const poll = poller(['body, > .nav'])
poll.start()

// Cancel if not resolved within 5 seconds
setTimeout(poll.stop, 5000)
```

The max polling time is 15 seconds - if all conditions are not all met within this time, polling will stop

In the event that you want a function to run when the poller times out, you can pass a time out handler:
```js
poller(['window.foo', function () { return false }, 'body'])
  .then(cb)
  .catch(function (err) {
    console.log(err)
  })

window.foo = 'bar'
// => poller timed out: [f, 'body']
```

### Performance
Since the main usage of this library is to ensure certain DOM elements are present on page, performance is optimised by using `MutationObserver` if available. Failing this, poller will use `setTimeout` with a backoff multiplier of 1.5 after 3 seconds

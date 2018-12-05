@qubit/poller
=============

Poller allows you to test for certain elements to be on site or certain conditions to be true before proceeding with a callback function.

### Usage

```js
var poller = require('@qubit/poller')

// Poll for DOM elements using `jquery` by passing in a selector
poller(['body > .nav'], cb)


// Pass in custom functions to be tested. Any truthy value returned will be considered a passing condition.
poller([function() { return true }], cb)


// Shorthand for testing window variables are not undefined
poller(['window.foo.bar'], cb)

// which is equivalent to
poller([() => { return window.foo && typeof window.foo.bar !== 'undefined' }], cb)


// Or mix and match
poller(['body > .nav', 'window.foo', () => true], cb)

```

The resulting targets will be passed back into the `cb` function in the same order:

```js

poller(
  [ 'body > .nav', 'window.page.type', () => window.foo ],
  function cb ($nav, pageType, foo) {
    console.log($nav)
    // => jQuery instance of `.nav` DOM element
    
    console.log(pageType)
    // => 'home'
    
    console.log(foo)
    // => 'bar'
  }
)

window.page = { type: 'home' }
window.foo = 'bar'
```

You can cancel a poller by calling the function that is returned:
```js
const cancel = poller(['body, > .nav'], cb)

// Cancel if not resolved within 5 seconds
setTimeout(() => cancel(), 5000)
```

The max polling time is 15 seconds, meaning if the conditions are not all met after this time, polling will automatially be cancelled.

In the event that you want a function to run when the poller expires, you can pass a timeout handler:
```js
poller(
  ['window.foo', function () { return false }, 'body'], // targets (note second parameter will never pass returning false)
  cb, // Would be 'done' function
  function (remainders) { console.log('poller timed out: ', remainders) } // onTimeout handler which logs params
)

window.foo = 'bar'
// => poller timed out: [f, 'body']
```

### Performance
Since the main usage of this library is to ensure certain DOM elements are present on page, performance is optimised by using `MutationObserver` if available. Failing this, poller will use `setTimeout` with a backoff multiplier of 1.5 after 3 seconds

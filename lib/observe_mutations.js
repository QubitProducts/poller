var doc = document
var MObserver = window.MutationObserver || window.WebKitMutationObserver
module.exports = function observeMutations (cb) {
  if (!MObserver) {
    return false
  }
  var mobserver = new MObserver(cb)
  mobserver.observe(doc.documentElement, {
    childList: true,
    subtree: true
  })
  return mobserver
}

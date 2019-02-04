module.exports = function create (targets, resolve, reject) {
  var item
  var singleton = false
  if (!Array.isArray(targets)) {
    targets = [targets]
    singleton = true
  }
  item = {
    targets: targets,
    evaluated: [],
    resolve: resolve,
    reject: reject,
    singleton: singleton
  }
  return item
}

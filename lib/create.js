module.exports = function create (targets, resolve, reject) {
  var item
  if (!Array.isArray(targets)) {
    targets = [targets]
  }
  item = {
    targets: targets,
    resolve: resolve,
    reject: reject
  }
  return item
}

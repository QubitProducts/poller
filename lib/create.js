module.exports = function create (targets, callback, onTimeout) {
  var item
  if (!Array.isArray(targets)) {
    targets = [targets]
  }
  item = {
    targets: targets,
    callback: callback,
    onTimeout: onTimeout
  }
  return item
}

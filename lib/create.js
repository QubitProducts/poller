module.exports = function create (targets, callback) {
  var item
  if (!Array.isArray(targets)) {
    targets = [targets]
  }
  item = {
    targets: targets,
    callback: callback,
    cancel: function () {
      delete item.callback
    }
  }
  return item
}

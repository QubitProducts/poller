var _ = require('@qubit/underscore')
var validate = require('./validate')

module.exports = function create (targets, callback) {
  var item
  validate(targets, callback)
  if (!_.isArray(targets)) {
    targets = [targets]
  }
  targets = _.compact(targets)
  item = {
    targets: targets,
    callback: callback,
    cancel: function () {
      delete item.callback
    }
  }
  return item
}

var _ = require('@qubit/underscore')
var FPS = 60

function validFrame (tickCount) {
  return _.contains(getValidFrames(), tickCount % FPS)
}

function getValidFrames () {
  return [1, 2, 3, 5, 8, 13, 21, 34, 55]
}

module.exports = validFrame
module.exports.getValidFrames = getValidFrames

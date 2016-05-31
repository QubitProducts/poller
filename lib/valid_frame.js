var indexOf = require('slapdash/src/indexOf')
var FPS = 60

function validFrame (tickCount) {
  return indexOf(getValidFrames(), tickCount % FPS) !== -1
}

function getValidFrames () {
  return [1, 2, 3, 5, 8, 13, 21, 34, 55]
}

module.exports = validFrame
module.exports.getValidFrames = getValidFrames

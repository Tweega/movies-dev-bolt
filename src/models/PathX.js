var _ = require('lodash');

function PathX(_node) {
  _.extend(this, _node.properties);

  if (this.id) {
    this.id = this.id.toNumber();
  }

console.log(_node.endSDS)
}

module.exports = PathX;

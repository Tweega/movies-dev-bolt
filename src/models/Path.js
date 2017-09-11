var _ = require('lodash');
var PathX = require('./PathX');

function Path(_node) {
  _.extend(this, _node.properties);

  if (this.id) {
    this.id = this.id.toNumber();
  }

  // let xs = _node.map(record => {
  //   return new PathX(record.get('m'));
  // });
//let aa = _node.get("segments")
//console.log(_node.end.identity.low)
//console.log(_node.start.properties)
//console.log(_node.segments)
}

module.exports = Path;

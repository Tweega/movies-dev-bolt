var utils = require('./Utils');

function render_links(lhs_hierarchy, rhs_hierarchy, pivot_list, lhs_svg) {
    //in the first instance we want to remove any existing links//we could do this with an exit join - we'll see


      var leaf_nodes = [];
      var links = [];
      var pivots = {};

console.log("pivot_list");
console.log(pivot_list);

      pivot_list.list.forEach(function(plist, i){
          plist.forEach(function (p, x){ //use apply?
              pivots[p.name] = x; //might be able to store something more useful than the index as value here.
              //what would be more useful would be x,y coords if we can get them already.
              
              console.log("p");
              console.log(p);
          });

      });
      console.log("pivots");
      console.log(pivots);

      utils.traverseTree(lhs_hierarchy, get_leaf_nodes, null, leaf_nodes);

      console.log("leaf_nodes");
      console.log(leaf_nodes);

      // for each leaf node, we want the list of rels - these are the names of pivot fields that
      // link from this leaf node.

      leaf_nodes.forEach(function(node, i){
        //if we were to store the pivot fields in rels by level, then we would not need to do this
        console.log(node.rels);
        Object.keys(node.rels).forEach(function(rel, idx) {
          if (rel in pivots) {
            links.push(rel);
          }
        });
      });
      console.log("pivots");
      console.log(pivots);
  }

function get_leaf_nodes(node, leaves, depth) {

  console.log("leaves");
  console.log(leaves);

  if (typeof(node.children) == "undefined") {
    console.log(`leaf node: ${node.name}`);

    leaves.push(node);
    //once we have identifies a leaf node, there is no need to traverse children.
    //consider returning a boolean indicating whether to abort or not.

  }
}

exports.render = render_links;

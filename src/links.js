var utils = require('./Utils');


function render_links(hierarchy, pivots, svg, dock_side, item_height) {
    //in the first instance we want to remove any existing links//we could do this with an exit join - we'll see

    dock_side = typeof(dock_side) != "undefined" ? dock_side : utils.consts.WEST;
      var leaf_nodes = [];
      var links = [];
      var total_out = hierarchy.total_out;
      let sideStr = utils.getSideStr(dock_side);

      utils.traverseTree(hierarchy, get_leaf_nodes, null, {side: sideStr, leaves: leaf_nodes});

      // for each leaf node, we want the list of rels - these are the names of pivot fields that
      // link from this leaf node.

      leaf_nodes.forEach(function(leaf, i) {
        //if we were to store the pivot fields in rels by level, then we would not need to do this

        Object.keys(leaf.rels).forEach(function(rel, idx) {

          if (rel in pivots) {
            let r = pivots[rel];
            let jj = leaf.rels[rel];
            let dock_x = dock_side == utils.consts.WEST ? r.dock_x_west : r.dock_x_east;

            //this totalising should be done in app.js - but that requires a bit of refactoring - so for the moment calculate here.
            var sum = 0;
            Object.keys(jj).forEach(function(rel_key, ii) {
                sum += jj[rel_key].value;
            });

            var temp_item_height = 20;
            let stroke_width = Math.max(Math.round((sum / total_out) * 10 * temp_item_height) / 10, 0.1);
            let xFudge = 4 * (dock_side == utils.consts.LHS ? 1 : -1);
            let source_id = sideStr + leaf.neo_id.toString();

            links.push({source_id: source_id, target_id: r.neo_id, source: leaf.name, target: rel, source_x: leaf.x, source_y: leaf.y + xFudge, target_x: dock_x, target_y: r.dock_y, sw: stroke_width});
          }
        });
      });

      //the target coordinates are on pivots - for each key (pivot field) there is a dock_x and dock_y

      //the source coordinates  - these are inferred by the x, y coords on the leaf_nodes collection?
      //we will have to compensate for the length of text and circle Object

      //so our data set is links

     var diagonal = d3.svg.diagonal()
    .source(function(d) { return {"x":d.source_x, "y":d.source_y}; })
    .target(function(d) { return {"x":d.target_y, "y":d.target_x}; })
    .projection(function(d) { return [d.y, d.x]; });

   var linkage = svg
          .selectAll(".linkdas")
           .data(links)
           .enter()
           .append("path")
           .attr("stroke-width", function(d, i) { return d.sw;})
           .attr("class", function(d, i) { return "link"; })
           .attr("id", function(d, i) { return "link_" + d.source_id + "_" + d.target_id; })
           .attr("d", diagonal);
  }

function get_leaf_nodes(node, params, depth) {
  var leaves = params.leaves;
  var side = params.side;

  if (typeof(node.children) == "undefined") {
    let nodeID = side + node.neo_id;

    if (!((d3.select("#" + nodeID).classed("hide2"))  || (d3.select("#" + nodeID).classed("hide1")))) {

      leaves.push(node);
    }
    //once we have identified a leaf node, there is no need to traverse children.
    //consider returning a boolean indicating whether to abort or not.

  }
}

exports.render = render_links;

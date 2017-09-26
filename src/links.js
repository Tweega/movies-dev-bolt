var utils = require('./Utils');


function render_links(hierarchy, pivot_list, svg, dock_side) {
    //in the first instance we want to remove any existing links//we could do this with an exit join - we'll see

    dock_side = typeof(dock_side) != "undefined" ? dock_side : utils.consts.WEST;

      var leaf_nodes = [];
      var links = [];
      var pivots = {};

      pivot_list.list.forEach(function(plist, i){
          plist.forEach(function (p, x){ //use apply?
              pivots[p.name] = p;
              //what would be more useful would be x,y coords if we can get them already.
          });
      });
      console.log("pivots");
      console.log(pivots);

      utils.traverseTree(hierarchy, get_leaf_nodes, null, leaf_nodes);

      // for each leaf node, we want the list of rels - these are the names of pivot fields that
      // link from this leaf node.

      leaf_nodes.forEach(function(leaf, i){

        //if we were to store the pivot fields in rels by level, then we would not need to do this
        //console.log(leaf.rels);
        Object.keys(leaf.rels).forEach(function(rel, idx) {
          if (rel in pivots) {
            let r = pivots[rel];
            let dock_x = dock_side == utils.consts.WEST ? r.dock_x_west : r.dock_x_east;
            links.push({source: leaf.name, target: rel, source_x: leaf.x, source_y: leaf.y, target_x: dock_x, target_y: r.dock_y});
          }
        });
      });

      //the target coordinates are on pivots - for each key (pivot field) there is a dock_x and dock_y

      //the source coordinates  - these are inferred by the x, y coords on the leaf_nodes collection?
      //we will have to compensate for the length of text and circle Object

      //so our data set is links
      console.log("how do we get the source coords?");
      console.log(leaf_nodes);

      console.log(links);

    //   var diagonal = d3.svg.diagonal()
    //  .source(function(d) { console.log("Am I trying?"); return {"x":d.source_y, "y":d.source_x}; })
    //  .target(function(d) { return {"x":d.target_y, "y":d.target_x}; })

     var diagonal = d3.svg.diagonal()
    .source(function(d) { console.log("Am I trying?"); return {"x":d.source_x, "y":d.source_y}; })
    .target(function(d) { return {"x":d.target_y, "y":d.target_x}; })
    .projection(function(d) { return [d.y, d.x]; });

  //   .projection(function(d) { return [d.y, d.x]; });

 // var link = svg.selectAll(".link")
 //         .data(links)
 //         .enter().append("path")
 //         .attr("class", function(d, i) { console.log("any sign of life?");  return "link";})
 //         .attr("d", diagonal);




 // var pivot_groups = pivot_svg
 //   .selectAll(".pivot_group")
 //   .data(function(d) { return d.list; })   //d.list is a list of groups
 //   .enter()
 //   .append("g")
 //   .attr("transform", function(d, i) {
 //     let x = Math.ceil((pivot_width - item_width) / 2);
 //     let y = groupOffsets[i].top;
 //     return `translate(${x}, ${y})`;
 //   });
console.log(links);


   var linkage = svg
          .selectAll(".linkdas")
           .data(links)
           .enter()
           .append("path")
           .attr("class", function(d, i) { console.log("any sign of life?");  return "link";})
           .attr("d", diagonal);





// svg.append("rect")
// .attr("x", 100)
// .attr("y", 100)
// .attr("height", 100)
// .attr("width", 100);

console.log("Hmmm")
  }

function get_leaf_nodes(node, leaves, depth) {



  if (typeof(node.children) == "undefined") {

    leaves.push(node);
    //once we have identifies a leaf node, there is no need to traverse children.
    //consider returning a boolean indicating whether to abort or not.

  }
}

exports.render = render_links;

var utils = require('./Utils');

const MSG_HIGHLIGHT_PATH = 111;
const MSG_MAKE_NEW_ROOT = 222;
const MSG_REDRAW_LINKS = 333;
const MSG_NONE = 0;

function render(hierarchy, side, svg, margins, pivots, callback) {
  if (typeof(side) == "undefined") {
    side = utils.consts.LHS;
  }

  var margin = margins.margin;
  var width = margins.width;
  var height = margins.height;
  var duration = margins.duration;
  var total_out = hierarchy.total_out;
  var i = 0,
      root;

  var sideStr = utils.getSideStr(side);

  var tree = d3.layout.tree()
      .size([height, width]);

  var diagonal = d3.svg.diagonal()
      .projection(function(d) { return [d.y, d.x]; });

    root = hierarchy;
    root.x0 = height / 2;
    root.y0 = (side === utils.consts.RHS ? width : 0);

    function collapse(d) {
      if (d.children) {
        d._children = d.children;
        d._children.forEach(collapse);
        d.children = null;
      }
    }

    update(root); //this is a fudge to keep setting new root from breaking things.
    if (typeof(root.isRoot) == "undefined") {
      root["isRoot"] = true;
      if(typeof(root.children) != "undefined") {
        root.children.forEach(collapse);
      }
    }
    update(root);

  //d3.select(self.frameElement).style("height", "800px");

  function update(source) {

    // Compute the new tree layout.
    var nodes = tree.nodes(root).reverse(),
        links = tree.links(nodes);

    // Normalize for fixed-depth.
    if (side === utils.consts.RHS) {
      nodes.forEach(function(d) { d.y = width - (d.depth * 180); });
    }
    else {
      nodes.forEach(function(d) { d.y = d.depth * 180; });
    }

    // Update the nodes…
    var node = svg.selectAll("g.node")
        .data(nodes, function(d) { return d.id || (d.id = ++i); });

    // Enter any new nodes at the parent's previous position.
    var nodeEnter = node.enter().append("g")
        .attr("class", "node")
        .attr("id", function(d, i) { return sideStr + d.neo_id})
        .attr("transform", function(d) {  return "translate(" + source.y0 + "," + source.x0 + ")"; });


    nodeEnter.append("circle")
        .attr("r", 1e-6)
        .style("fill", function(d) { return utils.deloitte_colour(d.depth)})
        .on("click", click_circle);

    var pos_info = side === utils.consts.RHS ? {pos_a: "start", pos_b: "end", off_a: 10, off_b: -10} : {pos_a: "end", pos_b: "start", off_a: -10, off_b: 10}

    nodeEnter.append("text")
        .attr("x", function(d) { return d.children || d._children ? pos_info.off_a : pos_info.off_b; })
        .attr("dy", ".35em")
        .attr("text-anchor", function(d) { return d.children || d._children ? pos_info.pos_a : pos_info.pos_b; })
        .text(function(d) { return d.name; })
        .style("fill-opacity", 1e-6)
        .on("click", click_text);

    // Transition nodes to their new position.
    var nodeUpdate = node
        .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

    nodeUpdate.select("circle")
        .attr("r", 4.5)
        .style("fill", function(d) {
          return utils.deloitte_colour(d.depth)
        });

    nodeUpdate.select("text")
        .style("fill-opacity", 1)
        .on("click", click_text); //this needs to be set again as root may have changed and if not set, then click_text function will be bound to an earlier copy of it

    // Transition exiting nodes to the parent's new position.
    var nodeExit = node.exit()
        .remove();

    nodeExit.select("circle")
        .attr("r", 1e-6);

    nodeExit.select("text")
        .style("fill-opacity", 1e-6);

    // Update the links…
    var link = svg.selectAll("path.link")
        .data(links, function(d) { return d.target.id; });

    // Enter any new links at the parent's previous position.
    link.enter().insert("path", "g")
        .attr("class", "link")
          .attr("stroke-width", function(d) {
            //this totalising should be done in app.js - but that requires a bit of refactoring - so for the moment calculate here.
            //get hold of the target rels
            var target_rels = d.target.rels;
            var sum = 0;
            //for each key on target_rels

            Object.keys(target_rels).forEach(function (pivot_key) {
              if (pivot_key in pivots) {
                var rel = target_rels[pivot_key];

                Object.keys(rel).forEach(function (rel_key) {
                  //totalise each value property
                  sum += rel[rel_key].value;
                });
              }
            });

            var temp_item_height = 20;
            let stroke_width = Math.max(Math.round((sum / total_out) * 10 * temp_item_height) / 10, 0.1);

            return stroke_width;
          })
          .attr("id", function(d) {
            return "link_" + sideStr + d.source.neo_id + "_" + d.target.neo_id;
          })
        .attr("d", function(d) {
          var o = {x: source.x0, y: source.y0};
          return diagonal({source: o, target: o});
        });

    // Transition links to their new position.
    link
        .attr("d", diagonal);

    // Transition exiting nodes to the parent's new position.
    link.exit()
        .attr("d", function(d) {
          var o = {x: source.x, y: source.y};
          return diagonal({source: o, target: o});
        })
        .remove();

    // Stash the old positions for transition.
    nodes.forEach(function(d) {
      d.x0 = d.x;
      d.y0 = d.y;
    });
  }

  // Toggle children on click.
  function click_text(d) {

    var msg = MSG_NONE;

    if (d3.event.shiftKey) {
        msg = MSG_MAKE_NEW_ROOT;
        root = d;
    }

    else {
      msg = MSG_REDRAW_LINKS;
      if (d.children) {
        d._children = d.children;
        d.children = null;
      } else {
        d.children = d._children;
        d._children = null;
      }

      update(d);
    }

    callback(d, msg, side);
  }

  function click_circle(d) {
    callback(d, MSG_HIGHLIGHT_PATH, side);
  }
}



exports.render = render;
exports.MSG_HIGHLIGHT_PATH = MSG_HIGHLIGHT_PATH;
exports.MSG_MAKE_NEW_ROOT = MSG_MAKE_NEW_ROOT;
exports.MSG_REDRAW_LINKS = MSG_REDRAW_LINKS;

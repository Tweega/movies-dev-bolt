var tree = require('./layerTree');
var pivot = require('./pivot');
var utils = require('./Utils');
var links = require('./links');
var nav = require('./pivot_nav');


function create3Layer(lhs_hierarchy, rhs_hierarchy, pivotLists) {
  //if we already have data, we will propbably have to do something here to clear it out.
  return new lay3r(lhs_hierarchy, rhs_hierarchy, pivotLists);
}

function lay3r(lhs_hierarchy, rhs_hierarchy, pivotLists) {
  this.lhs = lhs_hierarchy;
  this.rhs = rhs_hierarchy;
  this.lhs_svg = null;
  this.rhs_svg = null;
  this.pivot_svg = null;
  this.pivot_lists = pivotLists;
  this.pivot_list = null;
  this.callback = lay3r.createCallback(this);
  this.margins = {};
  this.pivot_level = 1;
  this.schutz_id = -1;  //i.e an id that neo4j presumab,y would not come up with.

  var dendodiv = document.getElementById("layerTree");
  let font_size = utils.getFontSize(dendodiv);

  var screenDimensions = {width: dendodiv.clientWidth - 13, height: document.documentElement.clientHeight};

var margin = {top: 20, right: 100, bottom: 20, left: 100},
    width = screenDimensions.width - margin.right - margin.left,
    height = screenDimensions.height - margin.top - margin.bottom,
    duration = 750;

  var margins = {margin: margin, width: width, height: height, duration: duration, font_size: font_size};
  this.margins = margins;

  var svg = d3.select("#layerTree").append("svg")
      .attr("width", width + margin.right + margin.left)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    this.svg = svg;

    let pivot_svg = svg.append("g");
    let lhs_svg = svg.append("g");
    let rhs_svg = svg.append("g");

    this.lhs_svg = lhs_svg;
    this.rhs_svg = rhs_svg;
    this.pivot_svg = pivot_svg;
}

lay3r.prototype.render = function() {
  //check that we have data for each of these

  var svg = this.svg;
  var margins = this.margins;
  var lhs_hierarchy = this.lhs;
  var rhs_hierarchy = this.rhs;
  var pivotLists = this.pivot_lists;
  var pivot_list = pivotLists[this.pivot_level];
  var lhs_svg = this.lhs_svg;
  var rhs_svg = this.rhs_svg;
  var pivot_svg = this.pivot_svg;

  pivot.render(pivot_list, pivot_svg, margins);
  var pivots = {};

  pivot_list.list.forEach(function(plist, i){ //this looks like it could be done in the constructor.
      plist.forEach(function (p, x){ //use apply?
          pivots[p.name] = p;
          //what would be more useful would be x,y coords if we can get them already.
      });
  });

  this.pivots = pivots;

  tree.render(lhs_hierarchy, utils.consts.LHS, lhs_svg, margins, pivots, this.callback);  //perhaps get a return value if there is a more suitable container to use for links
  tree.render(rhs_hierarchy, utils.consts.RHS, rhs_svg, margins, pivots, this.callback);

  //get a list of the lhs links that we need to draw
  //first get a collection of nodes that have no _children.

  links.render(lhs_hierarchy, pivots, lhs_svg);
  links.render(rhs_hierarchy, pivots, rhs_svg, utils.consts.EAST);

  let nav_svg = svg.append("g");
  nav.render(nav_svg, margins, pivotLists.length, this.callback);

}

lay3r.prototype.handle_message = function(data, msg_id, side) {
  switch(msg_id)
   {
     case utils.consts.LHS :

     links.render(this.lhs, this.pivots, this.lhs_svg, side);
     break;

     case utils.consts.RHS :
     links.render(this.rhs, this.pivots, this.rhs_svg, side);
     break;

     case utils.consts.PIVOT :

     //ok s0 what do we need to do?
     this.pivot_svg.selectAll("*").remove();
    // this.rhs_svg.selectAll("*").remove();
    // this.lhs_svg.selectAll("*").remove();
     this.pivot_level = data;

     //we need to go through the lhs and rhs hierarchies and renaming _children to children.

     //utils.traverseTree(this.lhs, resetChildren, null, {});

     //clearNodes(this.lhs);


     this.render();

     break;

     case 111:
       //traverse this data node, marking all descendants and links as being for highlighting

       let sideStr = utils.getSideStr(side);
       let selected_id = sideStr + data.neo_id;

       if (data.neo_id != this.lhs.neo_id) {
         if (selected_id == this.schutz_id) {
           this.lhs_svg.selectAll(".schutz").classed("schutz", false);
           this.lhs_svg.selectAll(".veiled").classed("veiled", false);
           this.schutz_id = -1;
         }
         else {
           this.schutz_id = selected_id;
           utils.traverseTree(data, highlight, null, {pivots: this.pivots, side: sideStr});
           //child elements of 'protected' elements should also be protoected
           this.lhs_svg.selectAll(".schutz>*").classed("schutz", true);
           this.lhs_svg.selectAll(":not(.schutz)").classed("veiled", true);
         }
       }
     break;

     default:
      console.log("unexpected message source");

   }
}

function highlight(node, params) {
  var side = params.side;
  var pivots = params.pivots;
  var parent_id = node.neo_id;
  let elemID = side + parent_id;

  d3.select("#" + elemID).classed("schutz", true);
  //flag any links stemming from this node

  //if this node has children, then there will be a link to each of the children
  if (typeof(node.children) != "undefined") {

    node.children.forEach(function(child, i) {
      // the name of the link will be "link_sourceID_targetID"
      let linkID = "link_" + parent_id + "_" + child.neo_id;

      d3.select("#" + linkID).classed("schutz", true);
    });
  }
  else {
    //no children - we ought to have a rels collection then - which may or may not have links to visible pivots
    //it would be odd if we did not have a rels in this case, but check anyway
    if (typeof(node.rels) != "undefined"){
      Object.keys(node.rels).forEach(function(rel, idx) {
        if (rel in pivots) {  //pivots is a list of pivots currently visible
          let r = pivots[rel];
          let linkID = "link_" + parent_id + "_" + r.neo_id;
          d3.select("#" + linkID).classed("schutz", true);
        }
      });
    }
    else {
      console.log("Odd that we don't have a rels in function highlight")
    }

  }
}

function clearNodes(d) {
        d.selected = 0;
        if (d.children) {
            d.children.forEach(clearNodes);
            resetNode (d);
          }
        else if (d._children) {
            d._children.forEach(clearNodes);
            resetNode(d);
          }
    }


lay3r.createCallback = function(cxLayer) {
  return function(dataNode, msg_id, side) {
    cxLayer.handle_message(dataNode, msg_id, side);
    }
}

function resetNode(node) {

  if(typeof(node["_children"]) != "undefined") {

    Object.defineProperty(node, "children",
        Object.getOwnPropertyDescriptor(node, "_children"));
    delete node["_children"];


  }

  if(typeof(node["x"]) != "undefined") { delete node["x"];}
  if(typeof(node["y"]) != "undefined") { delete node["y"];}
  if(typeof(node["x0"]) != "undefined") { delete node["x0"];}
  if(typeof(node["y0"]) != "undefined") { delete node["y0"];}
  if(typeof(node["selected"]) != "undefined") { delete node["selected"];}
  if(typeof(node["parent"]) != "undefined") { delete node["parent"];}



}

exports.create3Layer = create3Layer;

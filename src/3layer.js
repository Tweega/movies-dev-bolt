var tree = require('./layerTree');
var pivot = require('./pivot');
var utils = require('./Utils');
var links = require('./links');


function create3Layer(lhs_hierarchy, rhs_hierarchy, pivotLists) {
  //if we already have data, we will propbably have to do something here to clear it out.
  return new doodah(lhs_hierarchy, rhs_hierarchy, pivotLists);
}

function doodah(lhs_hierarchy, rhs_hierarchy, pivotLists) {
  this.lhs = lhs_hierarchy;
  this.rhs = rhs_hierarchy;
  this.lhs_svg = null;
  this.rhs_svg = null;
  this.pivot_lists = pivotLists;
  this.pivot_list = null;
  this.callback = doodah.createCallback(this);
  this.margins = {};
  this.pivot_level = -1;
}

doodah.prototype.render = function() {
  //check that we have data for each of these

  var lhs_hierarchy = this.lhs;
  var rhs_hierarchy = this.rhs;
  var pivotLists = this.pivot_lists;

  //put these checks in the constructor?
  var messages = [];
  if (typeof(lhs_hierarchy.children) == "undefined") {
    messages[messages.length] = "no data provided for left hand side - get this passed in";
  }
  if (typeof(rhs_hierarchy.children) == "undefined") {
    messages[messages.length] = "no data provided for right hand side - get this passed in";
  }
  if (pivotLists.length < 1) {
    messages[messages.length] = "no data provided for pivot data - get this passed in";
  }

  if (messages.length > 0) {
      console.log(messages);
  }
  else {
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

    var temp_level = 2;
    var pivot_list = pivotLists[temp_level];
    this.pivot_level = temp_level;

    pivot.render(pivot_list, svg, margins);

    let lhs_svg = svg.append("g");
    let rhs_svg = svg.append("g");


    var pivots = {};

    pivot_list.list.forEach(function(plist, i){
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

    this.lhs_svg = lhs_svg;
    this.rhs_svg = rhs_svg;



    //console.log(rhs_hierarchy);
  }
}

doodah.prototype.callbacko = function(dataNode, side) {
  switch(side)
   {
     case utils.consts.LHS :

     links.render(this.lhs, this.pivots, this.lhs_svg, side);
     break;

     case utils.consts.RHS :
     links.render(this.rhs, this.pivots, this.rhs_svg, side);
     break;

     case utils.consts.PIVOT :
     console.log("message for pivot");
     break;

     default:
      console.log("unexpected message source");

   }
}


doodah.createCallback = function(cxLayer) {
  return function(dataNode, side) {
    cxLayer.callbacko(dataNode, side);
    }
}

exports.create3Layer = create3Layer;

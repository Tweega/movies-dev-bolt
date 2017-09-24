var tree = require('./layerTree');
var pivot = require('./pivot');
var utils = require('./Utils');
var links = require('./links');

function render(lhs_hierarchy, rhs_hierarchy, pivotLists) {
  //check that we have data for each of these


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

    var svg = d3.select("#layerTree").append("svg")
        .attr("width", width + margin.right + margin.left)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


let lhs_svg = svg.append("g");
let yy = svg.append("g");

       tree.render(lhs_hierarchy, tree.LHS, lhs_svg, margins);  //perhaps get a return value if there is a more suitable container to use for links
      // tree.render(rhs_hierarchy, tree.RHS, yy, margins);
      var temp_level = 2;
      var pivot_list = pivotLists[temp_level];

      pivot.render(pivot_list, svg, margins);

      //get a list of the lhs links that we need to draw
      //first get a collection of nodes that have no _children.
      links.render(lhs_hierarchy, rhs_hierarchy, pivot_list, lhs_svg);

      //console.log(lhs_hierarchy);
  }
}

exports.render = render;

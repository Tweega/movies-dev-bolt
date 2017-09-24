var tree = require('./layerTree');
var pivot = require('./pivot');
var utils = require('./Utils');

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


let xx = svg.append("g");
let yy = svg.append("g");

      // tree.render(lhs_hierarchy, tree.LHS, xx, margins);
      // tree.render(rhs_hierarchy, tree.RHS, yy, margins);

      pivot.render(pivotLists, 3, svg, margins);
  }
}
exports.render = render;


function render(pivotLists, level) {

  //margin stuff needs to be passed in.
  var margin = {top: 20, right: 120, bottom: 20, left: 120},
      width = 700 - margin.right - margin.left,
      height = 500 - margin.top - margin.bottom;

  var i = 0,
      duration = 750,
      root;

  var tree = d3.layout.tree()
      .size([height, width]);

  var diagonal = d3.svg.diagonal()
      .projection(function(d) { return [d.y, d.x]; });

  //need to have a global g context instead of creating independent svg objects?
  var svg = d3.select("#layerTree").append("svg")
      .attr("width", width + margin.right + margin.left)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      //start off plopping a rectangle somewhere.
      
}

exports.render = render;

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




var temp_level = 2;
var pivot_list = pivotLists[temp_level];

pivot.render(pivot_list, svg, margins);

let lhs_svg = svg.append("g");
let rhs_svg = svg.append("g");

       tree.render(lhs_hierarchy, tree.LHS, lhs_svg, margins);  //perhaps get a return value if there is a more suitable container to use for links
       tree.render(rhs_hierarchy, tree.RHS, rhs_svg, margins);


      console.log("pivot_list")
      console.log(pivot_list)

      //get a list of the lhs links that we need to draw
      //first get a collection of nodes that have no _children.

      //links.render(lhs_hierarchy, pivot_list, lhs_svg);

      //links.render(rhs_hierarchy, pivot_list, rhs_svg, utils.east);

      //console.log(lhs_hierarchy);

      var data = [ {name: "p1", children: [{name: "c1"}, {name: "c2"}, {name: "c3"}, {name: "c4"}]}];
    var width = 400, height = 200, radius = 10, gap = 50;

    // test layout
    var nodes = [];
    var links = [];
    data.forEach(function(d, i) {
        d.x = width/4;
        d.y = height/2;
        nodes.push(d);
        d.children.forEach(function(c, i) {
          if(i == 3) {
            c.x =446;
            c.y = 349;
          }
          else {
            c.x = 3*width/4;
            c.y = gap * (i +1) -2*radius;
          }
            nodes.push(c);
            links.push({source: d, target: c});
        })
    })

    var color = d3.scale.category20();


    var diagonal = d3.svg.diagonal()
        .source(function(d) { return {"x":d.source.y, "y":d.source.x}; })
        .target(function(d) { return {"x":d.target.y, "y":d.target.x}; })
        .projection(function(d) { return [d.y, d.x]; });

    var link = lhs_svg.selectAll(".linkss")
            .data(links)
            .enter().append("path")
            .attr("class", "link")
            .attr("d", diagonal);

    var circle = svg.selectAll(".circle")
            .data(nodes)
            .enter()
            .append("g")
            .attr("class", "circle");

    var el = circle.append("circle")
            .attr("cx", function(d) {return d.x})
            .attr("cy", function(d) {return d.y})
            .attr("r", radius)
            .style("fill", function(d) {return color(d.name)})
            .append("title").text(function(d) {return d.name});


  }
}

exports.render = render;

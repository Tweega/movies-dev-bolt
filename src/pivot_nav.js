var utils = require('./Utils');

function render(nav_svg, margins, num_levels, callback) {
  //var a = new Array(num_levels - 1);
  var a = [...Array(num_levels).keys()];

  var margin = margins.margin;

  let pivot_width = 200;
  let pivot_left = (margins.width / 2) - (pivot_width / 2);


  nav_svg.attr("transform", "translate(" + pivot_left + "," + -10 + ")");
  nav_svg.selectAll(".nav_button")
    .data(a)
    .enter()
    .append("rect")
      .attr("x", function(d, i) {
        return i * 40;
      })
      .attr("y", 0)
      .attr("width", 10)
      .attr("height", 10)
      .attr("class", "pivot_nav")
      .attr("fill", function(d,i) { return utils.pivot_text_colour(i); } )
      .on("click", click);

      function click(d) {
        callback(d, utils.consts.PIVOT);
      }
  }

  function select_level(nav_svg, level) {
    nav_svg
    .selectAll(".selector")
    .data([{id: 1}])
    .enter()
      .append("rect")
      .attr("x", function(d, i) {
        return 40 * level;
      })
      .attr("y", 12)
      .attr("width", 10)
      .attr("height", 2)
      .attr("class", "pivot_nav")
      .attr("fill", function(d,i) { return utils.pivot_bg_colour(i); } )


  }

exports.render = render;
exports.select_level = select_level;

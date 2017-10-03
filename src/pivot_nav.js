var utils = require('./Utils');

function render(nav_svg, num_levels, callback, level) {
  //var a = new Array(num_levels - 1);

  var a = [...Array(num_levels).keys()];

  nav_svg.selectAll(".nav_button")
    .data(a)
    .enter()
    .append("rect")
      .attr("x", function(d, i) {
        return i * 40;
      })
      .attr("y", 0)
      .attr("width", 15)
      .attr("height", 15)
      .attr("class", "pivot_nav")
      .attr("fill", function(d,i) { return utils.deloitte_colour(i); } )
      .on("click", click);

  nav_svg.append("text")
  .attr("x", (level * 40) + 3)
  .attr("y", 13)
  .attr("fill", "white")
  .text(level.toString())

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

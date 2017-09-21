
function render(pivotLists, level, svg, margins) {

  var pivotMargins = {};
  var margin = margins.margin;

  let pivot_width = 200;
  let pivot_left = (margins.width / 2) - (pivot_width / 2);

  //we may need another svg object with its own clip if we have a lot of pivot nodes

  svg.attr("transform", "translate(" + pivot_left + "," + 0 + ")");

  console.log("margins");
    console.log(margins);
    console.log(margin);

  //let's just draw a rectangle to start showing the confines of the pivot area.

  var pivot_zone = svg.append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", pivot_width)
    .attr("height", margins.height)
    .attr("class", "pivot_zone");

console.log(margins.height);

  // var pivotWidth = 200; //say
  // var pivotHeight =
  // svg.append("use")
  // .attr("xlink:href","#s1")
  // .attr("x", 400)
  // .attr("y", 0);
  console.log("Do we get to pivot.render?");
  console.log(level);
    console.log(pivotLists);

  //for testing we will want to add some duplicate groups?

  var pivotInfo = pivotLists[level - 1];
  var num_groups = pivotInfo.list.length;
  var total_items = pivotInfo.total_items;
  var item_height = 40; //this to include inner margin
  var item_width = 100;
  var inner_margin_height = item_height / 2;
  var total_item_height = total_items * item_height; // + (inner_margin_height * 2);
  var total_margin_height = margins.height - total_item_height;
  var group_margin = total_margin_height / (num_groups + 1);
  console.log (group_margin);

  // we need to do a reduce on pivotInfo lists to calculate total item height

  var min_group_margin = 20;

  if (group_margin < min_group_margin) {
    group_margin = min_group_margin;
  }


  var groupOffsets = pivotInfo.list.map(function(group, i) {
    //we may not need to keep a reference to these offsets - just in case
    // we may want to store more than just y offset here
    console.log(i);
    var retVal = (item_height * i) + (group_margin * (i + 1));

    return retVal;
  });

  console.log(groupOffsets);
  console.log(item_height + group_margin);

  for (var idx = 0; idx < pivotInfo.list.length; idx++) {
    // height of this is number of items * item_height

    svg.append("rect")
      .attr("x", (pivot_width / 2) - (item_width / 2))
      .attr("y", groupOffsets[idx])
      .attr("width", item_width)
      .attr("height", total_item_height)
      .attr("class", "pivot_group");
  }

  //now draw the individual items

}

exports.render = render;

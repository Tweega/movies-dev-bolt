
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
  // we have yet to sort out what happens if the pivot space is not big enough to handle all pivot items
  var font_size = margins.font_size;
  var pivotInfo = pivotLists[level - 1];
  var num_groups = pivotInfo.list.length;
  var total_items = pivotInfo.total_items;
  var item_height = Math.ceil(font_size * 1.2);
  var item_width = pivot_width * 8 / 10;
  var inner_group_margin = item_height / 2;
  var pivot_item_gap = 3;
  var group_margin = font_size * 3;

  var total_item_height = total_items * item_height + (inner_group_margin * 2 * num_groups) + ((num_groups - 1) * group_margin);

  var remaining_height = margins.height - total_item_height;

  var top_and_bottom_margin = remaining_height / 2;


  console.log (item_height);

  /*
    total item height
      = item_height * total_items
      + inner_group_margin * 2 * num_groups
      + (num_groups - 1) * group_margin

    remaining_height
      = pivot height
      - total item height

    top and bottom margin
      = remaining_height / 2
  */
  var items_so_far = 0;

  var groupOffsets = pivotInfo.list.map(function(group, i) {
    //we may not need to keep a reference to these offsets - just in case
    // we may want to store more than just y offset here

    /*
      top of each group is given by


      = top_and_bottom_margin
      + item_height * total_items_so_far
      + inner_group_margin * 2 * num_groups_so_far
      + (num_groups_so_far) * group_margin


      the height of current group is
      = number of items * item height
      + inner margins * 2

    */

    var group_height = (group.length * item_height) + ((group.length - 1) * pivot_item_gap) + (inner_group_margin * 2);

    console.log("group_height");
    console.log(group_height);

    var group_top = top_and_bottom_margin + (items_so_far * item_height) + ((items_so_far - i) * pivot_item_gap) + (i * inner_group_margin * 2) + (i * group_margin);

    items_so_far += group.total_items;
    return [group_height, group_top];
  });


  for (var group_idx = 0; group_idx < pivotInfo.list.length; group_idx++) {
    // height of this is number of items * item_height

    /*
      the height of this group is
        = number items in group * item_height -- assuming that item height has margin built in
        + inner margin * 2
    */

    svg.append("rect")
      .attr("x", (pivot_width / 2) - (item_width / 2) )
      .attr("y", groupOffsets[group_idx][1])
      .attr("width", item_width)
      .attr("height", groupOffsets[group_idx][0])
      .attr("class", "pivot_group");


      // svg.append("rect")
      //   .attr("x", (pivot_width / 2) - (item_width / 2) + 20)
      //   .attr("y", groupOffsets[group_idx])
      //   .attr("width", item_width)
      //   .attr("height", item_height)
      //   .attr("class", "pivot_item");

      //now draw the individual items
      var pivotList = pivotInfo.list[group_idx];
      for (var item_idx = 0; item_idx < pivotList.length; item_idx++) {
        // height of this is number of items * item_height
        console.log("another item");
        /* the y position will be the
              = y position of the group,
              + a top margin amount
              + item height * (item_idx + 1)
        */

        let item_y = groupOffsets[group_idx][1] + (item_height * item_idx) + inner_group_margin + (item_idx * 2);


        svg.append("rect")
          .attr("x", (pivot_width / 2) - (item_width / 2) + 20)
          .attr("y", item_y)
          .attr("width", item_width)
          .attr("height", item_height)
          .attr("class", "pivot_item");

      }

  }



}

exports.render = render;

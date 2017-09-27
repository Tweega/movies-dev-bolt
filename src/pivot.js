function render(currentPivotLevel, parent_svg, margins) {

  //currentPivotLevel is a list of groups [{total_items: n, list: [[item1, item2 ...]], [another group]}]
  //where total_items is the number of pivot items across all groups

  //var currentPivotLevel = pivotLists[level - 1];

  var pivotMargins = {};
  var margin = margins.margin;

  let pivot_width = 200;
  let pivot_left = (margins.width / 2) - (pivot_width / 2);

  var pivot_svg = parent_svg.append("g")
    .datum(currentPivotLevel);  //this is a single item

  //we may need another svg object with its own clip if we have a lot of pivot nodes

  pivot_svg.attr("transform", "translate(" + pivot_left + "," + 0 + ")");
  
  var pivot_zone = pivot_svg.append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", pivot_width)
    .attr("height", margins.height)
    .attr("class", "pivot_zone");

  //we need item_height when drawing links for thickness - so we should calculate this is app.js and hold onto it.
  //for testing we will want to add some duplicate groups?
  // we have yet to sort out what happens if the pivot space is not big enough to handle all pivot items
  var font_size = margins.font_size;
  var num_groups = currentPivotLevel.list.length;
  var total_items = currentPivotLevel.total_items;
  var item_height = Math.ceil(font_size * 1.2);
  var item_width = pivot_width * 8 / 10;
  var inner_group_margin = item_height / 2;
  var pivot_item_gap = 3;
  var group_margin = font_size * 3;
  var text_padding = Math.ceil(font_size / 8);
  var text_box_height = font_size + 2 * text_padding;
  var pivot_item_padding = Math.ceil(text_box_height / 8);
  var box_height = text_box_height + (2 * pivot_item_padding);
  var total_item_height = total_items * box_height + ((num_groups - 1) * group_margin);

  var remaining_height = margins.height - total_item_height;
  var top_and_bottom_margin = remaining_height / 2;
  var gg = (box_height - item_height) /2;


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

  var groupOffsets = currentPivotLevel.list.map(function(group, i) {
    //we may not need to keep a reference to these offsets - just in case
    // we may want to store more than just y offset here

    /*
      top of each group is given by

      = top_and_bottom_margin
      + box_height * total_items_so_far
      + (num_groups_so_far) * group_margin


      the height of current group is
      = number of items * box_height


    */

    var group_height = (group.length * box_height) + (2 * inner_group_margin);
    var group_top = top_and_bottom_margin + (items_so_far * box_height) + (i * group_margin);
    let isf = items_so_far;
    items_so_far += group.length;
    return {height: group_height, top: group_top, items_so_far: isf};

    //we need to zip this in with   var currentPivotLevel = pivotLists[level - 1];
  });

  //the problem is that we are putting group_offsets as data on the pivot group which is not what we want to pass down
  // which is the array of pivot lists inside pivotLists[level - 1];

  //add pivot groups to the pivot zone
  var pivot_groups = pivot_svg
    .selectAll(".pivot_group")
    .data(function(d) { return d.list; })   //d.list is a list of groups
    .enter()
    .append("g")
    .attr("transform", function(d, i) {
      let x = Math.ceil((pivot_width - item_width) / 2);
      let y = groupOffsets[i].top;
      return `translate(${x}, ${y})`;
    });

  pivot_groups
    .append("rect")
      .attr("x", 0)
      .attr("y",  0)
      .attr("width", item_width)
      .attr("height",  function(d,i){return groupOffsets[i].height;})
      .attr("class", "pivot_group");

  pivot_groups
       .each(function(pivot_group, group_index) {

         var pivot_items = d3.select(this)
           .selectAll('.pivot_item')
           .data(function(d, i) { return d;})
           .enter()
           .append("g");

          pivot_items
            .append("rect")
                .attr("x", function(d, i) {
                  let x = Math.ceil((pivot_width - item_width) / 2);
                  let dock_x_west = pivot_left + x + text_padding;
                  let dock_x_east = dock_x_west + item_width - text_padding;
                  d["dock_x_east"] = dock_x_east;
                  d["dock_x_west"] = dock_x_west;
                  return text_padding;
                })
                .attr("y", function(d, i) {
                  let item_y =  (box_height * i) + inner_group_margin + gg;
                  let dock_y = groupOffsets[group_index].top + item_y + (item_height / 2);  //we will need more sophisticated docking calc.

                  d["dock_y"] = dock_y;
                  return item_y;
                })
                .attr("width", item_width - (2 * text_padding))
                .attr("height", item_height)
                .attr("class", "pivot_item");


          //add labels to the items
          var text_items = pivot_items
            .append("text")
                .attr("x", item_width / 2)
                .attr("y", function(d, i) { return (box_height * i) + inner_group_margin + gg + item_height - text_padding;})
                .attr('text-anchor', 'middle')
                .attr("class", "pivot_text")
                .text(function(d, i) {return d.name;});

                //var txt = pivotList[item_idx].name;
        });

  }

exports.render = render;

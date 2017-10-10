var tree = require('./layerTree');
var pivot = require('./pivot');
var utils = require('./Utils');
var links = require('./links');
var nav = require('./pivot_nav');



function create3Layer(lhs_hierarchy, rhs_hierarchy, pivotLists, pivotName) {
  //if we already have data, we will propbably have to do something here to clear it out.
  return new lay3r(lhs_hierarchy, rhs_hierarchy, pivotLists, pivotName);
}

function lay3r(lhs_hierarchy, rhs_hierarchy, pivotLists, pivotName) {
  this.lhs_hierarchies = [lhs_hierarchy];
  this.rhs_hierarchies = [rhs_hierarchy];
  this.lhs_svg = null;
  this.rhs_svg = null;
  this.pivot_svg = null;
  this.pivot_lists = pivotLists;
  this.pivot_list = null;
  this.callback = lay3r.createCallback(this);
  this.margins = {};
  this.pivot_level = 0;
  this.schutz = {};
  this.schutz[utils.getSideStr(utils.consts.LHS)] = {neo_id: -1};
  this.schutz[utils.getSideStr(utils.consts.RHS)] = {neo_id: -1};

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
    this.svg = svg;

let info_svg = svg.append("g");

let xx_text = `${lhs_hierarchy.name} - ${pivotName} - ${rhs_hierarchy.name}`
    info_svg.append("text")
    .attr("x", 0 - margin.left) //don't understand why 0 is not the right number here.  May be to do with the LHS tree pushing the containing g t the left
    .attr("y", 0)
    .attr("dy", ".35em")
    .attr("text-anchor", "start")
    .attr("class", "header")
    .text(xx_text);


        let yy_text = info_svg.append("text")
        .attr("x", 0 - margin.left) //don't understand why 0 is not the right number here.  May be to do with the LHS tree pushing the containing g t the left
        .attr("y", 30)
        .attr("dy", ".35em")
        .attr("text-anchor", "start")
        .attr("class", "pivot_level")
        .text(`${pivotName} level: `);


        var yybox = yy_text.node().getBBox();

  let nav_svg = info_svg.append("g")
    //  .attr("transform", "translate(22, 11)")  ;

    .attr("transform", "translate(" + parseInt(yybox.width - margin.left + 10).toString() + "," + parseInt(23) + ")");


  this.nav_svg = nav_svg;
   nav.render(nav_svg, pivotLists.length, this.callback, this.pivot_level);
  // this.select_level();



  let pivot_svg = svg.append("g");
  let lhs_svg = svg.append("g");
  let rhs_svg = svg.append("g");

  this.lhs_svg = lhs_svg;
  this.rhs_svg = rhs_svg;
  this.pivot_svg = pivot_svg;
  this.pivot_filter = null;
}

lay3r.prototype.render = function() {
  //check that we have data for each of these

  var svg = this.svg;
  var margins = this.margins;
  var pivotLists = this.pivot_lists;
  var pivot_list = this.pivot_filter != null ?  this.pivot_filter : pivotLists[this.pivot_level];
  var lhs_svg = this.lhs_svg;
  var rhs_svg = this.rhs_svg;
  var pivot_svg = this.pivot_svg;

  pivot.render(pivot_list, this.pivot_level, pivot_svg, margins, this.callback);
  var pivots = {};

  pivot_list.list.forEach(function(plist, i){ //this looks like it could be done in the constructor.
      plist.forEach(function (p, x){ //use apply?
          pivots[p.name] = p;
          //what would be more useful would be x,y coords if we can get them already.
      });
  });

  this.pivots = pivots;
  let lhs_hierarchy = this.lhs_hierarchies[this.lhs_hierarchies.length - 1];
  let rhs_hierarchy = this.rhs_hierarchies[this.rhs_hierarchies.length - 1];
  tree.render(lhs_hierarchy, utils.consts.LHS, lhs_svg, margins, pivots, this.callback);  //perhaps get a return value if there is a more suitable container to use for links
  tree.render(rhs_hierarchy, utils.consts.RHS, rhs_svg, margins, pivots, this.callback);

  //get a list of the lhs links that we need to draw
  //first get a collection of nodes that have no _children.
  links.render(lhs_hierarchy, pivots, lhs_svg, utils.consts.LHS);
  links.render(rhs_hierarchy, pivots, rhs_svg, utils.consts.RHS);

}

lay3r.prototype.handle_message = function(data, msg_id, side) {
  var reapplies = [];
  let that = this;
  var sideStr = utils.getSideStr(side);

  switch(msg_id)
  {
    case tree.MSG_REDRAW_LINKS :
      switch (side) {
        case utils.consts.LHS :
          links.render(this.lhs_hierarchies[this.lhs_hierarchies.length - 1], this.pivots, this.lhs_svg, side);
        break;

      case utils.consts.RHS :
        links.render(this.rhs_hierarchies[this.rhs_hierarchies.length - 1], this.pivots, this.rhs_svg, side);
      break;
      }
    break;

    case utils.consts.PIVOT : //get each component to manage their own messages
    reapplies = [];
    console.log(this.schutz);
      Object.keys(this.schutz).reduce(function(accum, r) {
        console.log(accum);
        if (that.schutz[r].neo_id > 0) {
          console.log("hello");
          accum.push({side: r, data: that.schutz[r]});
        }
        return accum;
      }, reapplies);

      this.pivot_filter = null;

      this.lhs_svg.selectAll(".hide2").classed("hide2", false);
      this.rhs_svg.selectAll(".hide2").classed("hide2", false);
      // this.lhs_svg.selectAll(".hide1").classed("hide1", false);
      // this.rhs_svg.selectAll(".hide1").classed("hide1", false);
      this.lhs_svg.selectAll(".link").remove();
      this.rhs_svg.selectAll(".link").remove();
      this.pivot_svg.selectAll("*").remove();
      // this.rhs_svg.selectAll("*").remove();
      // this.lhs_svg.selectAll("*").remove();
      this.pivot_level = data;
      this.render();
      nav.render(this.nav_svg, this.pivot_lists .length, this.callback, this.pivot_level);
      console.log("reapplies");
      console.log(reapplies);
      reapplies.forEach(function(r, i){
        console.log("trying to reapply");

          //here we want to call handle_message with tree.MSG_HIGHLIGHT_PATH
          //and pass in data, msg_id, side
          console.log("re-applying filter");
          let xxx = r.data;

          that.schutz[r.side] = {neo_id: -1};

          let s = r.side == "lhs_" ? utils.consts.LHS : utils.consts.RHS;

          that.handle_message(xxx, tree.MSG_HIGHLIGHT_PATH, s);

      });

    break;

  case tree.MSG_HIGHLIGHT_PATH:
    //traverse this data node, marking all descendants and links as being for highlighting
    var click_side_hierarchy = null;
    var click_side_svg = null;
    var other_side_hierarchy = null;
    var other_side_svg = null;
    //let sideStr = "";
    let otherSideStr = "";
    var filtered_pivots = {};

    if (side == utils.consts.LHS) {
      click_side_hierarchy = this.lhs_hierarchies[this.lhs_hierarchies.length - 1];
      click_side_svg = this.lhs_svg;
      other_side_hierarchy = this.rhs_hierarchies[this.rhs_hierarchies.length - 1];
      other_side_svg = this.rhs_svg;
      sideStr = "lhs_";
      otherSideStr = "rhs_"
    }
    else {
      click_side_hierarchy = this.rhs_hierarchies[this.rhs_hierarchies.length - 1];
      click_side_svg = this.rhs_svg;
      other_side_hierarchy = this.lhs_hierarchies[this.lhs_hierarchies.length - 1];
      other_side_svg = this.lhs_svg;
      sideStr = "rhs_";
      otherSideStr = "lhs_"
    }

    let selected_id = sideStr + data.neo_id;
    let side_schutz = this.schutz[sideStr];

    if (data.neo_id != click_side_hierarchy.neo_id || typeof(data.parent) != "undefined") {

      if (data.neo_id == side_schutz.neo_id) {
        // this.lhs_svg.selectAll(".schutz").classed("schutz", false);
        // this.lhs_svg.selectAll(".hide1").classed("hide1", false);

        click_side_svg.selectAll(".schutz").classed("schutz", false);
        click_side_svg.selectAll(".hide1").classed("hide1", false);

        this.schutz[sideStr] = {neo_id: -1};
      }
      else {

        this.schutz[sideStr] = data;

        utils.traverseTree(data, highlight, null, {pivots: this.pivots, side: sideStr, filtered_pivots: filtered_pivots});
        //child elements of 'protected' elements should also be protoected

        // now higlight the opposite side
        // pivots contains a list of visible pivots.  Traverse the rhs tree until we get to leaf nodes
        // while on the way building up paths that are to be highlighted.

        let paths = [[]];
        let found_paths = [];

        utils.traverseTree(other_side_hierarchy, highlight_other_side, rollup_other_side, {paths: paths, found_paths: found_paths, side: sideStr, filtered_pivots: filtered_pivots});
        paths.pop().pop();

        var highlightMap = {}
        //initialise highlightMap with the current root node in case there are no links expanded.
        highlightMap[other_side_hierarchy.name] = other_side_hierarchy;
        //we want the name of the node on the other side i think


        found_paths.forEach(function (path_list, iPathList) {
          path_list.forEach(function (node, i) {
            if (typeof(highlightMap[node.name]) == "undefined") {
              highlightMap[node.name] = node;
            }
          });
        });

        var params = {pivots: filtered_pivots, side: otherSideStr, filtered_pivots: {}}

        Object.keys(highlightMap).forEach(function(node_name, i) {
          let n = highlightMap[node_name];
          let elemID = otherSideStr + n.neo_id;
          d3.select("#" + elemID).classed("schutz", true);
        });

        //flag any links stemming from this node
        if (found_paths.length > 0) {
          highlightOtherLinks(found_paths, filtered_pivots, otherSideStr);
        }
        else {
            let discard = pop_and_check_rels([other_side_hierarchy], filtered_pivots);
        }

        this.lhs_svg.selectAll(".schutz>*").classed("schutz", true);
        this.lhs_svg.selectAll(":not(.schutz)").classed("hide1", true);

        this.rhs_svg.selectAll(".schutz>*").classed("schutz", true);
        this.rhs_svg.selectAll(":not(.schutz)").classed("hide1", true);

        this.lhs_svg.selectAll(".schutz").classed("schutz", false);
        this.rhs_svg.selectAll(".schutz").classed("schutz", false);

      }
    }
  break;
  case tree.MSG_MAKE_NEW_ROOT:
    //let sideString = utils.getSideStr(side);
    side_schutz = this.schutz[sideStr];
    if (data.neo_id == side_schutz.neo_id) {
      //remove filtering
      this.handle_message(data, tree.MSG_HIGHLIGHT_PATH, side);
    }

    var isRoot = typeof(data.isRoot) == "undefined" ? false : data.isRoot;
    var hierarchies = null;
    var svg = null;
    if (side == utils.consts.LHS) {
      hierarchies = this.lhs_hierarchies;
      svg = this.lhs_svg;
    }
    else {
      hierarchies = this.rhs_hierarchies;
      svg = this.rhs_svg;
    }

    if (typeof(data.parent) != "undefined") {
      if (isRoot) {
        delete data["isRoot"];
        hierarchies.pop();
        var x = hierarchies[hierarchies.length - 1];
        tree.render(x, side, svg, this.margins, this.pivots, this.callback);  //perhaps get a return value if there is a more suitable container to use for links
        links.render(x, this.pivots, svg, side);
      }
      else {
        data["isRoot"] = true;
        hierarchies.push(data);

        tree.render(data, side, svg, this.margins, this.pivots, this.callback);  //perhaps get a return value if there is a more suitable container to use for links
        links.render(data, this.pivots, svg, side);

      }
    }
  break;

  case pivot.MSG_FILTER_PIVOT :
reapplies = [];
  Object.keys(this.schutz).reduce(function(accum, r) {
    console.log(accum);
    if (that.schutz[r].neo_id > 0) {
      console.log("hello");
      accum.push({side: r, data: that.schutz[r]});
    }
    return accum;
  }, reapplies);


    this.pivot_filter = {is_filter: true, total_items: 1, list: [[data]]};

    let eID = "pivot_" + data.neo_id;

    if (typeof(this.prev_filter_id) != "undefined") {
      this.pivot_svg.select("#pivot" + this.prev_filter_id).classed("filter_pivot", false);
      this.pivot_svg.select("#pivot_txt" + this.prev_filter_id).classed("filter_pivot_txt", false);
    }

    this.prev_filter_id = "_" + data.neo_id;
    this.pivot_svg.select("#" + eID).classed("filter_pivot", true);
    eID = "pivot_txt_" + data.neo_id;

    this.pivot_svg.select("#" + eID).classed("filter_pivot_txt", true);

    //---------------
    filtered_pivots = {};
    var left_right = [{side: "lhs_", svg: this.lhs_svg, data: this.lhs_hierarchies[this.lhs_hierarchies.length - 1]}, {side: "rhs_", svg: this.rhs_svg, data: this.rhs_hierarchies[this.rhs_hierarchies.length - 1]}];

    left_right.forEach(function(side_info, i) {
      side_info.svg.selectAll(".link").remove();
      filtered_pivots[data.name] = data;
      let paths = [[]];
      let found_paths = [];

      utils.traverseTree(side_info.data , highlight_other_side, rollup_other_side, {paths: paths, found_paths: found_paths, side: side_info.side, filtered_pivots: filtered_pivots});
      paths.pop().pop();

      var highlightMap = {};
      //initialise highlightMap with the current root node in case there are no links expanded.
      highlightMap[side_info.data.name] = side_info.data;

      found_paths.forEach(function (path_list, iPathList) {
        path_list.forEach(function (node, i) {
          if (typeof(highlightMap[node.name]) == "undefined") {
            highlightMap[node.name] = node;
          }
        });
      });

      var params = {pivots: filtered_pivots, side: side_info.side, filtered_pivots: {}}
console.log("hide2");
      side_info.svg.selectAll(".hide2").classed("hide2", false);

      Object.keys(highlightMap).forEach(function(node_name, i) {
        let n = highlightMap[node_name];
        let elemID = side_info.side + n.neo_id;
        d3.select("#" + elemID).classed("schutz", true);
      });

      //flag any links stemming from this node

      highlightOtherLinks(found_paths, filtered_pivots, sideStr);
//zzz
      side_info.svg.selectAll(".schutz>*").classed("schutz", true);
      side_info.svg.selectAll(":not(.schutz)").classed("hide2", true);


    });
    // this.rhs_svg.selectAll(".schutz>*").classed("schutz", true);
    // this.rhs_svg.selectAll(":not(.schutz)").classed("hide1", true);
    //-------------

    this.render();
    this.lhs_svg.selectAll(".schutz").classed("schutz", false);
    this.rhs_svg.selectAll(".schutz").classed("schutz", false);
    reapplies.forEach(function(r, i){
      console.log("trying to reapply");

        //here we want to call handle_message with tree.MSG_HIGHLIGHT_PATH
        //and pass in data, msg_id, side
        console.log("re-applying filter");
        let xxx = r.data;

        that.schutz[r.side] = {neo_id: -1};

        let s = r.side == "lhs_" ? utils.consts.LHS : utils.consts.RHS;

        that.handle_message(xxx, tree.MSG_HIGHLIGHT_PATH, s);

    });
  break;

  case pivot.MSG_FILTER_PIVOT_CLEAR :
    this.pivot_svg.selectAll("*").remove(); //not sure why we have to do this.
    this.pivot_filter = null;

    this.lhs_svg.selectAll(".hide2").classed("hide2", false);
    this.rhs_svg.selectAll(".hide2").classed("hide2", false);
    this.lhs_svg.selectAll(".link").remove();
    this.rhs_svg.selectAll(".link").remove();
    //let eid = "pivot_" + this.prev_filter_id;
    delete this.prev_filter_id;
    this.render();
  break;

  default:
    console.log(`Unexpected message: ${msg_id}`);
  }
}


lay3r.prototype.select_level = function() {
  nav.select_level(this.nav_svg, this.pivot_level);
}


function highlight(node, params) {
  var side = params.side;
  var pivots = params.pivots;
  var filtered_pivots = params.filtered_pivots;
  var parent_id = node.neo_id;
  let elemID = side + parent_id;

  //hightligh the side that the user clicked
  d3.select("#" + elemID).classed("schutz", true);
  //flag any links stemming from this node

  //if this node has children, then there will be a link to each of the children
  if (typeof(node.children) != "undefined") {

    node.children.forEach(function(child, i) {
      // the name of the link will be "link_sourceID_targetID"
      let linkID = "link_" + parent_id + "_" + child.neo_id;

      d3.select("#" + linkID).classed("schutz", true);
    });
  }
  else {
    //no children - we ought to have a rels collection then - which may or may not have links to visible pivots
    //it would be odd if we did not have a rels in this case, but check anyway
    if (typeof(node.rels) != "undefined"){
      Object.keys(node.rels).forEach(function(rel, idx) {
        if (rel in pivots) {  //pivots is a list of pivots currently visible
          let r = pivots[rel];
          let linkID = "link_" + parent_id + "_" + r.neo_id;
          d3.select("#" + linkID).classed("schutz", true);
          filtered_pivots[rel] = r;
        }
      });
    }
    else {
      console.log("Odd that we don't have a rels in function highlight")
    }

  }
}

function highlightOtherLinks(path_list, pivots, side) {
  path_list.forEach(function(path, i){
  if (path.length > 1) {
    var target = pop_and_check_rels(path, pivots);
    var source = pop_and_check_rels(path, pivots);
    var targetID = target.neo_id;

      //Do the internal links
      while (source) {
        var sourceID = source.neo_id;
        //link_sourceID_targetID
        let linkID = "link_" + sourceID + "_" + targetID;

        d3.select("#" + linkID).classed("schutz", true);
        targetID = sourceID;
        source = pop_and_check_rels(path, pivots);
      }
    }
  });
}

function pop_and_check_rels(path, pivots) {
  var x = path.pop();

  if (typeof(x) != "undefined") {
    if (typeof(x.rels) != "undefined"){
      Object.keys(x.rels).forEach(function(rel, idx) {
        if (rel in pivots) {  //pivots is a list of pivots currently visible
          let r = pivots[rel];
          let linkID = "link_" + x.neo_id + "_" + r.neo_id;
          d3.select("#" + linkID).classed("schutz", true);
        }
      });
    }
    return x;
  }

  return false;
}

function rollup_other_side(child, parent, params){
  var side = params.side;
  var pivots = params.filtered_pivots;

  var path = params.paths.pop();
  //to be found, the child needs to have no children and that collection needs to include one of the visible pivots
  var found = false;
  if (typeof(child.children) == "undefined"){
    if (typeof(child.rels) != "undefined"){
      Object.keys(child.rels).forEach(function(rel, idx) {
        if (rel in pivots) {  //pivots is a list of pivots currently visible
          found = true;
        }
      });
    }
    else {
      console.log("Odd that other side has no rels");
    }
  }
  if (found == true) {
    params.found_paths.push(path);
  }


}

function highlight_other_side(node, params){
  var inheritedPath = params.paths[params.paths.length - 1];
  //as we go down the tree create a copy of the parentPaths and add this node to the end.
  //then make a copy of this for each child
  var extendedPath = inheritedPath.map(function(p, i){
    return p;
  });

  extendedPath.push(node);
  params.paths.push(extendedPath);

}



function clearNodes(d) {
        d.selected = 0;
        if (d.children) {
            d.children.forEach(clearNodes);
            resetNode (d);
          }
        else if (d._children) {
            d._children.forEach(clearNodes);
            resetNode(d);
          }
    }


lay3r.createCallback = function(cxLayer) {
  return function(dataNode, msg_id, side) {
    cxLayer.handle_message(dataNode, msg_id, side);
    }
}

function resetNode(node) {

  if(typeof(node["_children"]) != "undefined") {

    Object.defineProperty(node, "children",
        Object.getOwnPropertyDescriptor(node, "_children"));
    delete node["_children"];


  }

  if(typeof(node["x"]) != "undefined") { delete node["x"];}
  if(typeof(node["y"]) != "undefined") { delete node["y"];}
  if(typeof(node["x0"]) != "undefined") { delete node["x0"];}
  if(typeof(node["y0"]) != "undefined") { delete node["y0"];}
  if(typeof(node["selected"]) != "undefined") { delete node["selected"];}
  if(typeof(node["parent"]) != "undefined") { delete node["parent"];}

}



exports.create3Layer = create3Layer;

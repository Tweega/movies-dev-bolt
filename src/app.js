var api = require('./neo4jApi');
var tree = require('./layerTree');

$(function () {
 var params = {};

// not sure if promises below are meant to be so nested as below,  experimented with a job scheduler approach, but not enought time to go down that road
// as we need to be able to have job schedulers as scheduled items.

  params["lhs"] = "Organisation";
  params["rhs"] = "Technology";
  params["pivot"] = "Process";
  params["lhs_rel"] = "FTE";
  params["lhs_rel_field"] = "ftes";
  params["rhs_rel"] = "supports";
  params["rhs_rel_field"] = "supports";

  var depth = {lhs: 0, rhs: 0};
  console.log("hey diddle diddle");

  api.getHierarchy(params.lhs)

  .then(lhs_hierarchy => {

      if (lhs_hierarchy) {
          //do follow-on stuff with hierarchy
          api.setRelationships(params.lhs, params.pivot, params.lhs_rel, params.lhs_rel_field, lhs_hierarchy)
          .then(lhs_hierarchy2 => {
              if (lhs_hierarchy2) {
                  api.getHierarchy(params.rhs)
                  .then(rhs_hierarchy => {
                      if (rhs_hierarchy) {
                          //do follow-on stuff with hierarchy
                          api.setRelationships(params.rhs, params.pivot, params.rhs_rel, params.rhs_rel_field, rhs_hierarchy)
                          .then(lhs_r => {
                              //---------
                              if (lhs_r) {
                                  api.getHierarchy(params.pivot)
                                  .then(pivot_hierarchy => {
                                      if (pivot_hierarchy) {
                                          //do follow-on stuff with hierarchy

                                          //here we want to get lists of pivot leaves for each pivot node
                                          //jutzPath might have been useful here.

                                          pivot_hierarchy["isRoot"] = true;
                                          traverseTree(pivot_hierarchy, null, handlePivotListRollup, {});

                                          //the pivot hierarchy now has lists of leaf nodes that can be passed to hierarchy rollups



                                          traverseTree(lhs_hierarchy, null, linkLayers, pivot_hierarchy);
                                          traverseTree(rhs_hierarchy, null, linkLayers, pivot_hierarchy);

                                          let maxDepth = {depth: 0};

                                          traverseTree(pivot_hierarchy, countDepth, null, maxDepth);
                                          console.log (pivot_hierarchy);
                                          console.log (maxDepth);


                                          //create lists of pivot items for each level
                                          var pivotLists = new Array(maxDepth.depth - 1);
                                          for (var i = 0; i < pivotLists.length; i++){
                                            pivotLists[i] = {total_items: 0, list: []};
                                          }

                                          //for each level in the pivot tree we have a list that will contain the groups (also lists) of pivot fields
                                          // ie [  [["P0"]], [["P0_1", "P0_2"]], [["P0_1_1", "P0_1_2"], ["P1_1_1", "P0_1_2"]]]
                                          //so here we have a list of three lists-of-lists
                                          //the last list shown above is level 3 where we have two groups at this level, each with two processes - or whatever the pivot layer is.
                                          // ignore the first group as this is simply the root node?  Otherwise the root will appear to have a parent group which it does not
                                          //it may though be useful to know something about the parent which this provides.  Keep for now and ignore in the rendering.

                                          //if I am at the root level then there are not groups - or there is only the parent group.
                                          traverseTree(pivot_hierarchy, getPivotLists, null, pivotLists);


                                          console.log(pivotLists);

                                          tree.render(lhs_hierarchy, tree.LHS)
                                          tree.render(rhs_hierarchy, tree.RHS)

                                      } //if (rhs_hierarchy)
                                  }) //then(rhs_hierarchy
                              }   //if (lhs_hierarchy
                              //---------
                          })
                      } //if (rhs_hierarchy)
                  }) //then(rhs_hierarchy
              }   //if (lhs_hierarchy
          }); //then(lhs_hierarchy2
      } //if (lhs_hierarchy)
    }); //.then(lhs_hierarchy
}) //$function


/*
function testCB_A(x, cb) {
  console.log("Doing A");
  cb("A");
}

function testCB_A_Done(result) {
  console.log("A done" + result);
}

function testCB_B(x, cb) {
  console.log("Doing B");
  cb("B");
}

function testCB_B_Done(result) {
  console.log("B done" + result);
}


function testAllDone() {
  console.log ("All done");
}
*/


function traverseTree(rootNode, handleChild, handleRollup, props) {
  var depth = 0;

  if (handleChild != null) {
    handleChild(rootNode, props, depth);
  }

  var nextChildren = rootNode.children || [];
  nextChildren = nextChildren.map(function(c, i){
    return c;
  });

  var sanity = 0;

  var toDoLists = [nextChildren.reverse()];

  var parents = [rootNode];

  var lenToDoLists = toDoLists.length;



  while ((lenToDoLists > 0) && (sanity < 50)) {
    let nextToDoList = toDoLists[lenToDoLists - 1];

    if (nextToDoList.length == 0) {
      let discard = toDoLists.pop();
      let child =  parents.pop();
      depth--;
      let parent = parents[parents.length - 1];

      if (handleRollup != null && typeof(parent) != "undefined") {
        handleRollup(child, parent, props);
      }
    }
    else {
      let nextToDo = nextToDoList.pop();
      parents.push(nextToDo);
      depth++;
      nextChildren = nextToDo.children || [];
      nextChildren = nextChildren.map(function(c, i){
        return c;
      }); // can't remember what the point of this was - perhaps  there meant to be some kind of filter applied?  We would have a predicate function passed in?
      toDoLists.push(nextChildren.reverse());
      if (handleChild != null) {
        handleChild(nextToDo, props, depth);
      }
    }
    lenToDoLists = toDoLists.length;
    sanity++;
  }
  //console.log (rootNode);
}


function handlePivotListRollup(child, parent, props){
  //copy up each list of children
  // if this child node has no children, then initialise List with just this node

  if (typeof(child.children) == "undefined") {
      child["descendants"] = [[child.name]] //preferable to use ids?
  }

  if (typeof(parent.descendants) == "undefined") {
      parent["descendants"] = [];
  }

  let parentDescendants = parent["descendants"];
  let childDescendants = child["descendants"];

  parentDescendants.push.apply(parentDescendants, childDescendants)

}

function linkLayers(child, parent, pivotTree) {
  //copy up relationships into parent

  //traverse the process tree and for each node call another function

  if (typeof(child.rels) == "undefined") {
    child.rels = {};
  }
  if (typeof(parent.rels) == "undefined") {
    parent.rels = {};
  }

  traverseTree(pivotTree, _linkLayers, null, {parent: parent, child: child});


}

function _linkLayers(pivotNode, params) {

  var parent = params.parent;
  var child = params.child;
  var processList = pivotNode.descendants;
  var processKey = pivotNode.name;


  let isRoot = typeof(pivotNode.isRoot) != "undefined" ? true : false;
  //if this is a leaf node then create relationships for it
  if (typeof(child.relationships) != "undefined") {
    initialiseRels(child, processList, processKey, isRoot);
  }

  if (typeof(parent) != "undefined") {
    //rollup child to parent
    rollUp(parent, child, processKey);
  } //else we should be done now.

}

function rollUp(parent, child, processKey) {
  //copy up relationships into parent
    //child.rels is a dictionary, whose keys are the processInfo.key
    var childProcessMap = child.rels[processKey];

    if (typeof(childProcessMap) != "undefined") {
      var childProcessKeys = Object.keys(childProcessMap);

      //check if there is a rels context for this process on the parent

      var cxRels;

      if (typeof(parent.rels[processKey]) != "undefined") {
          cxRels = parent.rels[processKey];
      }
      else {
        cxRels = {};
        parent.rels[processKey] = cxRels;
      }

      //copy child rels up to parent (cxRels).
      childProcessKeys.forEach(function(key, i){
        let childRel = childProcessMap[key];
        //r is a child relation to copy up to parent
        let parentRel = cxRels[key];
        if (typeof(parentRel) != "undefined") {

          //let termpStarter = cxRels[key].value
          cxRels[key].value = cxRels[key].value + childRel.value;
        }
        else {
          let childRel = childProcessMap[key]
          cxRels[key] = {target: childRel.target, value: childRel.value};
        }
      });
    }
}


function initialiseRels(leafNode, processFilterList, processKey, isRoot) {
    var cx = leafNode["rels"];

    //var filterRequired = typeof(child.relationships) != "undefined" ? !processInfo.isRoot : false;
    var filterRequired = !isRoot;



    var cxRels = {};
    cx[processKey] = cxRels;

    var filteredRelationships = leafNode.relationships;

    if (filterRequired){
      filteredRelationships = leafNode.relationships.filter(function (r) {
        //return processFilterList.includes(r.target);
        return true;
      });
    }

    filteredRelationships.reduce(function(accum, r) {
        accum[r.target] = {target: r.target, value: parseInt(r.value)};
        return accum;
    }, cxRels);

    //we should now have on thr leaf nodes a rels dictionary keyed on process names
    //each of these will point to another dictionary

}

function countDepth(node, max, parentDepth) {

  node["depth"] = parentDepth + 1;

  if (node.depth > max.depth) {
    max.depth = node.depth;
  }

}


function getPivotLists(pivotNode, pivotLists){
  //if this node has children, then add those children as a group on the array for the level
  if (typeof(pivotNode.children) != "undefined") {
    var listInfo = pivotLists[pivotNode.depth - 1];
    listInfo.total_items = listInfo.total_items + pivotNode.children.length;
    listInfo.list.push(pivotNode.children);
  }
}

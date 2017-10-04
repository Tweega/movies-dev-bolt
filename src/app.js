var api = require('./neo4jApi');
var layer = require('./3layer');
var utils = require('./Utils');

$(function () {
 var params = {};

// not sure if promises below are meant to be so nested as below,  experimented with a job scheduler approach, but not enought time to go down that road
// as we need to be able to have job schedulers as scheduled items.

  // params["lhs"] = "Organisation";
  // params["rhs"] = "Technology";
  // params["pivot"] = "Process";
  // params["lhs_rel"] = "FTE";
  // params["lhs_rel_field"] = "ftes";
  // params["rhs_rel"] = "supports";
  // params["rhs_rel_field"] = "supports";

  params["lhs"] = "Governance";
  params["rhs"] = "Process";
  params["pivot"] = "Organisation";
  params["lhs_rel"] = "gov_att";
  params["lhs_rel_field"] = "gov_att";
  params["rhs_rel"] = "job_role_to_process";
  params["rhs_rel_field"] = "job_role_to_process";

  var depth = {lhs: 0, rhs: 0};

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


                                          utils.traverseTree(pivot_hierarchy, null, handlePivotListRollup, {});


                                          //the pivot hierarchy now has lists of leaf nodes that can be passed to hierarchy rollups

                                          utils.traverseTree(lhs_hierarchy, null, linkLayers, pivot_hierarchy);
                                          utils.traverseTree(rhs_hierarchy, null, linkLayers, pivot_hierarchy);



                                          //this may not be the best place to get this, but we need a total of all the leaf relation values

                                          totaliseHierarchy(lhs_hierarchy, pivot_hierarchy.name);
                                          totaliseHierarchy(rhs_hierarchy, pivot_hierarchy.name);

                                          let maxDepth = {depth: 0};

                                          utils.traverseTree(pivot_hierarchy, countDepth, null, maxDepth);


                                          //create lists of pivot items for each level
                                          var pivotLists = new Array(maxDepth.depth);
                                          for (var i = 0; i < pivotLists.length; i++){
                                            pivotLists[i] = {total_items: 0, list: []};
                                          }

                                          pivotLists[0].list.push([pivot_hierarchy]);
                                          pivotLists[0].total_items = 1;

                                          //for each level in the pivot tree we have a list that will contain the groups (also lists) of pivot fields
                                          // ie [  [["P0"]], [["P0_1", "P0_2"]], [["P0_1_1", "P0_1_2"], ["P1_1_1", "P0_1_2"]]]
                                          //so here we have a list of three lists-of-lists
                                          //the last list shown above is level 3 where we have two groups at this level, each with two processes - or whatever the pivot layer is.
                                          // ignore the first group as this is simply the root node?  Otherwise the root will appear to have a parent group which it does not
                                          //it may though be useful to know something about the parent which this provides.  Keep for now and ignore in the rendering.

                                          //if I am at the root level then there are not groups - or there is only the parent group.
                                          utils.traverseTree(pivot_hierarchy, getPivotLists, null, pivotLists);
                                          var l = layer.create3Layer(lhs_hierarchy, rhs_hierarchy, pivotLists, pivot_hierarchy.name);
                                          l.render();

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


function handlePivotListRollup(child, parent, props){
  //copy up each list of children
  // if this child node has no children, then initialise List with just this node

  //the point of this is so that root node contain a list of all descendants
  //if you are a leaf node, you are a descendant of yourself.

  //in the case of health assessments we have a case where the node has children
  //but those children
  //so it does not get given

  if (typeof(child.children) == "undefined") {
    //set this child to be the sole descendant of itself
    let descendants = {};
    descendants[child.name] = 0;  //preferable to use ids?  using this as a set, but there may be some useful data we could store about the child, such as force value?
    child["descendants"] = descendants;
  }

  if (typeof(parent.descendants) == "undefined") {

    let pd = {};
      pd[parent.name] = 0;  //preferable to use ids?  using this as a set, but there may be some useful data we could store about the child, such as force value?
      parent["descendants"] = pd;
  }

  let parentDescendants = parent["descendants"];
  let childDescendants = child["descendants"];

  Object.keys(childDescendants).forEach(function(z, i){
    parentDescendants[z] = i;
  });

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

  utils.traverseTree(pivotTree, _linkLayers, null, {parent: parent, child: child});

}

function _linkLayers(pivotNode, params) {
  var parent = params.parent;
  var child = params.child;
  var decendantsMap = pivotNode.descendants;
  var processKey = pivotNode.name;

  //if this is a leaf node then create relationships for it
  if (typeof(child.relationships) != "undefined") {
    initialiseRels(child, decendantsMap, processKey);
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


function initialiseRels(leafNode, processDescendantsMap, processKey) {
    var cx = leafNode["rels"];

    //var filterRequired = typeof(child.relationships) != "undefined" ? !processInfo.isRoot : false;
    var filterRequired = true;

    var cxRels = {};


    var filteredRelationships = leafNode.relationships;

    if (filterRequired){
      filteredRelationships = leafNode.relationships.filter(function (r) {

        var found = typeof(processDescendantsMap[r.target]) != "undefined" ? true : false;

        return  found;
        //return processDescendantsMap.includes(r.target);
        //return true; //right - this is the probalobalem
      });
    }
    if (filteredRelationships.length > 0) {

      filteredRelationships.reduce(function(accum, r) {
          accum[r.target] = {target: r.target, value: parseInt(r.value)};
          return accum;
      }, cxRels);

      cx[processKey] = cxRels;
    }

    //we should now have on thr leaf nodes a rels dictionary keyed on process names
    //each of these will point to another dictionary

}

function countDepth(node, max, parentDepth) {

  node["depth"] = parentDepth + 1;

  if (node.depth > max.depth) {
    max.depth = node.depth;
  }

}


function totaliseHierarchy(hierarchy, rootPivotName) {
  var rootRels = hierarchy.rels[rootPivotName];
  var sum = 0;

  Object.keys(rootRels).forEach(function(rel_key) {
      sum += rootRels[rel_key].value;
  });

  hierarchy["total_out"] = sum;

}

function getPivotLists(pivotNode, pivotLists){
  //if this node has children, then add those children as a group on the array for the level
  if (typeof(pivotNode.children) != "undefined") {
    var listInfo = pivotLists[pivotNode.depth];
    listInfo.total_items = listInfo.total_items + pivotNode.children.length;
    listInfo.list.push(pivotNode.children);
  }
}

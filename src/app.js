var api = require('./neo4jApi');

$(function () {
  //this runs on document load
 var params = {};
 var xx = 100;

// var jobs = api.createJobLot();

// jobs.addJob(testCB_A, {}, testCB_A_Done);
// jobs.addJob(testCB_B, {}, testCB_B_Done);
// jobs.doJobs(testAllDone);

// not sure if promises below are meant to be so nested as below,  experimented with a job scheduler approach, but not enought time to go down that road
// as we need to be able to have job schedulers as scheduled items.

  params["lhs"] = "Organisation";
  params["rhs"] = "Technology";
  params["pivot"] = "Process";
  params["lhs_rel"] = "FTE";
  params["lhs_rel_field"] = "ftes";
  params["rhs_rel"] = "supports";
  params["rhs_rel_field"] = "supports";

  api.getHierarchy(params.lhs)

  .then(lhs_hierarchy => {

      if (lhs_hierarchy) {
          //do follow-on stuff with hierarchy
          console.log("ok got hierarchy");
          console.log(params);
          api.setRelationships(params.lhs, params.pivot, params.lhs_rel, params.lhs_rel_field, lhs_hierarchy)
          .then(lhs_hierarchy2 => {
              if (lhs_hierarchy2) {
                  api.getHierarchy(params.rhs)
                  .then(rhs_hierarchy => {
                      if (rhs_hierarchy) {
                          //do follow-on stuff with hierarchy
                          console.log("ok got RHS hierarchy");

                          api.setRelationships(params.rhs, params.pivot, params.rhs_rel, params.rhs_rel_field, rhs_hierarchy)
                          .then(lhs_r => {
                              //---------
                              if (lhs_r) {
                                  api.getHierarchy(params.pivot)
                                  .then(pivot_hierarchy => {
                                      if (pivot_hierarchy) {
                                          //do follow-on stuff with hierarchy
                                          console.log("ok got pivot hierarchy");


                                          //here we want to get lists of pivot leaves for each pivot node
                                          //jutzPath might have been useful here.


                                          traverseTree(pivot_hierarchy, null, handlePivotListRollup, {});
  console.log(pivot_hierarchy);
                                          // console.log("can i still see the hierarchy object?");
                                          //
                                          // console.log(lhs_hierarchy);


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

  //handleChild(node, null, props);

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
      let parent = parents[parents.length - 1];
      if (handleRollup != null && typeof(parent) != "undefined") {

        handleRollup(child, parent, props);
      
      }
    }
    else {
      let nextToDo = nextToDoList.pop();
      parents.push(nextToDo);
      nextChildren = nextToDo.children || [];
      nextChildren = nextChildren.map(function(c, i){
        return c;
      });
      toDoLists.push(nextChildren.reverse());
      if (handleChild != null) {
        handleChild(nextToDo, props);
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

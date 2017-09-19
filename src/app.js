var api = require('./neo4jApi');

$(function () {
  //this runs on document load
 var params = {};
 var xx = 100;

// var jobs = api.createJobLot();

// jobs.addJob(testCB_A, {}, testCB_A_Done);
// jobs.addJob(testCB_B, {}, testCB_B_Done);
// jobs.doJobs(testAllDone);

//promises are not that flexible so treaating linearly here, but short of time to get a job scheduler working

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
                              console.log(lhs_r);
                          })
                      } //if (rhs_hierarchy)
                  }) //then(rhs_hierarchy
              }   //if (lhs_hierarchy
          }); //then(lhs_hierarchy2
      } //if (lhs_hierarchy)
    }); //.then(lhs_hierarchy
}) //$function


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
function callback(lhsTree, params){

 // var rhsTree = api.getHierarchy(rhs);
 // var pivotTree = api.getHierarchy(pivot);
 var lhsRelationships = api.setRelationships(params.lhs, params.pivot, params.lhs_rel, lhsTree, callback2);
 console.log(lhsRelationships);

 console.log("lhsRelationships");
//  var rhs_relationships = api.getRelationships(lhs, pivot, rhs_rel);
}

function callback(lhsTree, params){

 // var rhsTree = api.getHierarchy(rhs);
 // var pivotTree = api.getHierarchy(pivot);
 var lhsRelationships = api.setRelationships(params.lhs, params.pivot, params.lhs_rel, lhsTree, callback2);
 console.log(lhsRelationships);

 console.log("lhsRelationships");
//  var rhs_relationships = api.getRelationships(lhs, pivot, rhs_rel);
}


function callback2(lhsTree){


console.log(lhsTree)
}

var api = require('./neo4jApi');

$(function () {
  //this runs on document load
 var params = {};
 var xx = 100;

var jobs = api.createJobLot();

jobs.addJob(testCB_A, {}, testCB_A_Done);
jobs.addJob(testCB_B, {}, testCB_B_Done);
jobs.doJobs(testAllDone);

  // params["lhs"] = "Organisation";
  // params["rhs"] = "Technology";
  // params["pivot"] = "Process";
  // params["lhs_rel"] = "ftes";
  // params["rhs_rel"] = "supports";
  //
  // api.getHierarchy(params.lhs, callback, params);


});

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

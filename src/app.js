var api = require('./neo4jApi');

$(function () {
  //this runs on document load
 var params = {};
 var xx = 100;

  params["lhs"] = "Organisation";
  params["rhs"] = "Technology";
  params["pivot"] = "Process";
  params["lhs_rel"] = "ftes";
  params["rhs_rel"] = "supports";

  api.getHierarchy(params.lhs, callback, params);


});

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

require('file?name=[name].[ext]!../node_modules/neo4j-driver/lib/browser/neo4j-web.min.js');
var Movie = require('./models/Movie');
var MovieCast = require('./models/MovieCast');
var Path = require('./models/Path');
var utils = require('./Utils');
var _ = require('lodash');

var neo4j = window.neo4j.v1;
var driver = neo4j.driver("bolt://localhost", neo4j.auth.basic("neo4j", "Milwan1"));

function getHierarchy(rootClass) {
  var session = driver.session();
  var query = `MATCH p=(:${rootClass} {title: "${rootClass}"})<-[:is_part_of*]-(x)`
  // switch (rootClass) {
  //   case "Organisation" :
  //     query += ` WHERE x["level"]< 3 `
  //   //case "Process" :
  // }

  query +=" RETURN p"

//console.log(query);
  // 'MATCH p=(:Organisation {title: "Organisation"})<-[:is_part_of*]-(x) \
  // RETURN p',
  return session
    .run(query,{})
    .then(result => {
      session.close();

      if (result.records.length > 0) {
        let firstRecord = result.records[0].get('p');
        let rootTitle = firstRecord.start.properties.title;
        let rootCx = {name: rootTitle, children: []};
        var cxStack = [rootCx];

        let records = result.records;

        for (var recordIndex = 0, recordsLen = records.length; recordIndex < recordsLen; recordIndex++) {
          let pathInfo = records[recordIndex].get('p');
          let pathSegments = pathInfo.segments;  //if we get this far, there will be at least one element in segments array


          let pathLen = pathSegments.length;

          cxStack = cxStack.slice(0, pathLen);
          let currentCx = cxStack[pathLen - 1];
          let node = pathSegments[pathLen - 1];

          let newNode = {name: node.end.properties.title};

          if (typeof(currentCx.children) ==  "undefined") {
            currentCx.children = [];
          }
          currentCx.children.push(newNode);
          cxStack.push(newNode);

        }
        return(cxStack[0]);

    }
    else {
      return {name: "No hierarchy data found"};
    }
    })
    .catch(error => {
      session.close();
      throw error;
    });
}


//should this be in the api?
function setRelationships(lhs, rhs, rel_name, field, hierarchy) {
//   var query = `MATCH (l:${lhs})-[rel:${rel_name}]->(r:${rhs}) \
// WHERE exists(rel.${field}) \
// RETURN id(l) as l_id, id(r) as r_id, l.title as l_title, r.title as r_title, rel.${field} as field `

//for proof of concept at any rate, not insisting on the existence of the value field (ie ftes)
//and defaulting to a value of 1 where a value does not exist in the database.
//needless to say, this ought to change at some point.

var query = `MATCH (l:${lhs})-[rel:${rel_name}]-(r:${rhs}) \
RETURN id(l) as l_id, id(r) as r_id, l.title as l_title, r.title as r_title, case when rel.${field} is null then 1 else rel.${field} end as field `
//console.log(query)
  var session = driver.session();
  return session
  .run(query, {})
    .then(result => {
      session.close();

      if (result.records.length > 0) {
        let records = result.records;

        //var keys = records[0].keys;
        var indices = records[0]._fieldLookup;
        var sourceDictionary = {};


        records.forEach(function (rec, i) {
          //keys ["l_id", "r_id", "l_title", "r_title", "field"]
          // l_id = rec._fields[rec._fieldLookup["l_id"]];
          // r_id = rec._fields[rec._fieldLookup["r_id"]];

          let l_id = rec._fields[indices["l_id"]];
          let r_id = rec._fields[indices["r_id"]];

          let l_title = rec._fields[indices["l_title"]];


          let r_title = rec._fields[indices["r_title"]];
          let field = rec._fields[indices["field"]];

          let rel_info = {target: r_title, target_id: r_id, value: field};

          if (typeof(sourceDictionary[l_title]) != "undefined") {
            sourceDictionary[l_title].push(rel_info);
          }
          else {
            sourceDictionary[l_title] = [rel_info];

          }
        });
// console.log("sourceDictionary")
// console.log(sourceDictionary)

        utils.traverseTree (hierarchy, assignRelationships, null, {rel_dict: sourceDictionary});
// console.log("hierarchy");
// console.log(hierarchy);

        return hierarchy;
    }
    else {
      console.log("no relationships")
      return hierarchy;
    }
    })
    .catch(error => {
      session.close();
      throw error;
    });
}


function assignRelationships(node, props) {
  //this function traverses a tree with name and children properties
  //if the name property is in the list of node names that are known
  //to have relationships, then//the relationships array is added, and the children array, if there is one is deleted

  var dict = props.rel_dict;
  if (typeof(dict[node.name]) != "undefined") {


    //stitch these relationships into this Object
    node["relationships"] = dict[node.name]; //this should be an array of target_node_id and values
    //nodes with relationships are supposed to be children so delete the children collection of this node.
    if (typeof(node.children) != "undefined") {


      //delete node.children;
    }
  }
}


function jobLot(){
  this.jobDict = {};
}

jobLot.prototype.addJob = function(jobFunc, params, callback){
  let id = Object.keys(this.jobDict).length;


  var jobStruct = {job: jobFunc, callback: callback, params: params};
  this.jobDict[id] = jobStruct;
}

jobLot.prototype.doJobs = function(callback) {
  this.jobComplete = callback;
  var that = this;
  Object.keys(this.jobDict).forEach(function(key) {
    let cb = jobLot.createCallback(key, that);
    let job = that.jobDict[key];
    job.job(job.params, cb);
  });
}

jobLot.prototype.jobDone = function(id, result){
  let jobInfo = this.jobDict[id];
  delete this.jobDict[id];
  jobInfo.callback(result);   //need more complex structure if the callback itself needs async processing before the overall job lot can be considered complete.
  if (Object.keys(this.jobDict).length == 0) {
    //all jobs done.
    this.jobComplete();
  }
}

jobLot.createCallback = function(id, jobController) {
  return function (result) {
    jobController.jobDone(id, result);
  }
}

jobLot.createJobLot = function() {
  return new jobLot();
}

exports.getHierarchy = getHierarchy;
exports.setRelationships = setRelationships;
exports.createJobLot = jobLot.createJobLot;

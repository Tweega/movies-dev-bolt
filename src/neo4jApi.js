require('file?name=[name].[ext]!../node_modules/neo4j-driver/lib/browser/neo4j-web.min.js');
var Movie = require('./models/Movie');
var MovieCast = require('./models/MovieCast');
var Path = require('./models/Path');
var _ = require('lodash');

var neo4j = window.neo4j.v1;
var driver = neo4j.driver("bolt://localhost", neo4j.auth.basic("neo4j", "Milwan1"));

function getHierarchy(rootClass, callback, params) {
  var session = driver.session();
  var query = `MATCH p=(:${rootClass} {title: "${rootClass}"})<-[:is_part_of*]-(x) RETURN p`

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
        callback(cxStack[0], params);
        return cxStack[0];
    }
    else {
      return [];
    }
    })
    .catch(error => {
      session.close();
      throw error;
    });
}



function setRelationships(lhs, rhs, field, hierarchy, callback) {
  var query = `MATCH (l:${lhs})-[rel]->(r:${rhs}) \
WHERE exists(rel.${field}) \
RETURN id(l) as l_id, id(r) as r_id, l.title as l_title, r.title as r_title, rel.ftes as field `

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

        console.log (sourceDictionary);

        traverseTree (hierarchy, assignRelationships, {rel_dict: sourceDictionary})



        //we now want to trawl the hierarchy and stitch in relationships

        //now we have to do something with this in order to extract thr relationships


        //now get the relationships data

        //this query will be dynamically created base on choices by the user.


        //then process that into a decent shape


        //then sew it into the hierarchy data


        // var vv = JSON.stringify(cxStack[0])
        //         console.log(vv);
callback(hierarchy)
      return true;
    }
    else {
      return [];
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
//console.log(node);
//  console.log (`Looking for ${node.name}`)

  if (typeof(dict[node.name]) != "undefined") {
    //stitch these relationships into this Object
    node["relationships"] = dict[node.name]; //this should be an array of target_node_id and values
    //nodes with relationships are supposed to be children so delete the children collection of this node.
    if (typeof(node.children) != "undefined") {
      delete node.children;
    }
  }
}

function traverseTree(rootNode, withFunction, props) {

  //withFunction(node, null, props);

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
      //withFunction(child, parent, props); //this was the rollup function - not a process child function
    }
    else {
      let nextToDo = nextToDoList.pop();
      parents.push(nextToDo);
      nextChildren = nextToDo.children || [];
      nextChildren = nextChildren.map(function(c, i){
        return c;
      });
      toDoLists.push(nextChildren.reverse());
      withFunction(nextToDo, props);
    }
    lenToDoLists = toDoLists.length;
    sanity++;
  }
  //console.log (rootNode);
}



exports.getHierarchy = getHierarchy;
exports.setRelationships = setRelationships;

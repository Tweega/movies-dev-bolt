require('file?name=[name].[ext]!../node_modules/neo4j-driver/lib/browser/neo4j-web.min.js');
var utils = require('./Utils');
var neo4j = window.neo4j.v1;
var driver = neo4j.driver("bolt://localhost", neo4j.auth.basic("neo4j", "Milwan1"));
//
// var driver = neo4j.driver("bolt://wmw.uk.deloitte.com", neo4j.auth.basic("neo4j", "graph"));

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
        let rootCx = {neo_id: firstRecord.start.identity, name: rootTitle, children: []};
        var cxStack = [rootCx];

        let records = result.records;

        for (var recordIndex = 0, recordsLen = records.length; recordIndex < recordsLen; recordIndex++) {
          let pathInfo = records[recordIndex].get('p');
          let pathSegments = pathInfo.segments;  //if we get this far, there will be at least one element in segments array


          let pathLen = pathSegments.length;

          cxStack = cxStack.slice(0, pathLen);
          let currentCx = cxStack[pathLen - 1];
          let node = pathSegments[pathLen - 1];

//check here that we should not change to uid
          let newNode = {neo_id: node.end.identity, name: node.end.properties.title};

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

        utils.traverseTree (hierarchy, assignRelationships, null, {rel_dict: sourceDictionary});

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
  //to have relationships, then//the relationships array is added

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

function get3Ways(){
  // var query = `MATCH (l:${lhs})-[rel:${rel_name}]-(r:${rhs}) \
  // RETURN id(l) as l_id, id(r) as r_id, l.title as l_title, r.title as r_title, case when rel.${field} is null then 1 else rel.${field} end as field `

  var query = `MATCH (rhs)-[r]-(lhs) \
  WITH lhs, type(r) as rel_name, rhs, labels(lhs) AS lhs_labels, labels(rhs) as rhs_labels \
  WITH lhs, rel_name, rhs, reduce(dup = FALSE, label IN lhs_labels | (dup OR label IN rhs_labels)) AS has_dup \
  WHERE  NOT has_dup AND (exists(lhs.title) AND exists(rhs.title)) AND rel_name <> "is_part_of" \
  with distinct labels(lhs)[0] as lhs_label, rel_name, labels(rhs)[0] as rhs_label \
  with collect({r: rhs_label, l: lhs_label}) as r_lhs_rhs, lhs_label,  rhs_label \
  unwind r_lhs_rhs AS r_lhs_rhs_rows \
  with r_lhs_rhs_rows.r as pivots, count(r_lhs_rhs_rows.r) as count_rel \
  where count_rel > 1 \
  with pivots \
  MATCH (rhs)-[r]-(lhs) \
  WITH lhs, r, type(r) as rel_name, keys(r)[0] as field, rhs, labels(lhs) AS lhs_labels, labels(rhs) as rhs_labels, pivots, startNode(r) = rhs as is_rhs_start \
  WITH lhs, r, rel_name, rhs, reduce(dup = FALSE, label IN lhs_labels | (dup OR label IN rhs_labels)) AS has_dup, pivots, field, is_rhs_start \
  WHERE  NOT has_dup AND (exists(lhs.title) AND exists(rhs.title)) AND rel_name <> "is_part_of" \
  with r, labels(rhs)[0] as rhs_label, labels(lhs)[0] as lhs_label, rel_name, field, is_rhs_start \
  where labels(rhs)[0] in pivots \
  return distinct lhs_label, rhs_label, rel_name, field, is_rhs_start `
  var pivotDictionary = {};
  var lhsDictionary = null;

  var relations = null;

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


          records.forEach(function (rec, i) {
            //keys ["lhs_label", "rhs_label", "rel_name", "field", "is_rhs_start"]


            let lhs_label = rec._fields[indices["lhs_label"]];
            let rhs_label = rec._fields[indices["rhs_label"]];

            let rel_name = rec._fields[indices["rel_name"]];


            let field = rec._fields[indices["field"]];
            if (field == null) {field = "_none"}  //assuming this is not ever an actual field name.
            let is_rhs_start = rec._fields[indices["is_rhs_start"]];

            lhsDictionary = {};
            if (typeof(pivotDictionary[rhs_label]) != "undefined") {
              lhsDictionary = pivotDictionary[rhs_label];
            }
            else {
              pivotDictionary[rhs_label] = lhsDictionary;
            }

            relations = [];
            if (typeof(lhsDictionary[lhs_label]) != "undefined") {
              relations = lhsDictionary[lhs_label];
            }
            else {
              lhsDictionary[lhs_label] = relations;
            }

            relations.push({rel_name: rel_name, field: field, is_rhs_start: is_rhs_start})
          });

        //
        //   utils.traverseTree (hierarchy, assignRelationships, null, {rel_dict: sourceDictionary});
        //
        return pivotDictionary;
      }
      else {
        console.log("no 3 ways")
        return {name: "No 3 way relationships found"};
      }
      })
      .catch(error => {
        session.close();
        throw error;
      });
}



exports.getHierarchy = getHierarchy;
exports.setRelationships = setRelationships;
exports.get3Ways = get3Ways;

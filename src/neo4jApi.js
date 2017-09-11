require('file?name=[name].[ext]!../node_modules/neo4j-driver/lib/browser/neo4j-web.min.js');
var Movie = require('./models/Movie');
var MovieCast = require('./models/MovieCast');
var Path = require('./models/Path');
var _ = require('lodash');

var neo4j = window.neo4j.v1;
var driver = neo4j.driver("bolt://localhost", neo4j.auth.basic("neo4j", "Milwan1"));

function searchMovies(queryString) {
  var session = driver.session();
  return session
    .run(
      'MATCH p=(:Organisation {title: "Organisation"})<-[:is_part_of*]-(x) \
      RETURN p',
      {}
    )
    .then(result => {
      session.close();

      if (result.records.length > 0) {
        let firstRecord = result.records[0].get('p');
        let rootTitle = firstRecord.start.properties.title;
        let rootCx = {name: rootTitle, children: []};
        var cxStack = [rootCx];

        //console.log(cxStack);
        //console.log (result)
        // let paths = result.records.map(record => {
        //   return new Path(record.get('p'));
        // });

        let records = result.records;

        for (var recordIndex = 0, recordsLen = records.length; recordIndex < recordsLen; recordIndex++) {
          let pathInfo = records[recordIndex].get('p');
          let pathSegments = pathInfo.segments;  //if we get this far, there will be at least one element in segments array


          let pathLen = pathSegments.length;
//console.log(cxStack);
          cxStack = cxStack.slice(0, pathLen);
          let currentCx = cxStack[pathLen - 1];
          let node = pathSegments[pathLen - 1];

          let newNode = {name: node.end.properties.title};

          //console.log(cxStack);
          if (typeof(currentCx.children) ==  "undefined") {
            currentCx.children = [];
          }
          currentCx.children.push(newNode);
          cxStack.push(newNode);

        }

var vv = JSON.stringify(cxStack[0])
        console.log(vv);

      return paths;
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

function getMovie(title) {
  var session = driver.session();
  return session
    .run(
      "MATCH (movie:Movie {title:{title}}) \
      OPTIONAL MATCH (movie)<-[r]-(person:Person) \
      RETURN movie.title AS title, \
      collect([person.name, \
           head(split(lower(type(r)), '_')), r.roles]) AS cast \
      LIMIT 1", {title})
    .then(result => {
      session.close();

      if (_.isEmpty(result.records))
        return null;

      var record = result.records[0];
      return new MovieCast(record.get('title'), record.get('cast'));
    })
    .catch(error => {
      session.close();
      throw error;
    });
}

function getGraph() {
  var session = driver.session();
  return session.run(
    'MATCH (m:Movie)<-[:ACTED_IN]-(a:Person) \
    RETURN m.title AS movie, collect(a.name) AS cast \
    LIMIT {limit}', {limit: 100})
    .then(results => {
      session.close();
      var nodes = [], rels = [], i = 0;
      results.records.forEach(res => {
        nodes.push({title: res.get('movie'), label: 'movie'});
        var target = i;
        i++;

        res.get('cast').forEach(name => {
          var actor = {title: name, label: 'actor'};
          var source = _.findIndex(nodes, actor);
          if (source == -1) {
            nodes.push(actor);
            source = i;
            i++;
          }
          rels.push({source, target})
        })
      });

      return {nodes, links: rels};
    });
}

exports.searchMovies = searchMovies;
exports.getMovie = getMovie;
exports.getGraph = getGraph;

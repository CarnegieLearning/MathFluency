/*
    File: example.js
    
    An example implementation of a <Game Controller at http://fluencychallenge.com/wiki/DesignAndImplementation/GameController> which serves a website and allows users to play through several static sequences of problems from a choice of game engines.
*/

var http = require('http');
var util = require('util');
var QuestionHierarchy = require('../common/QuestionHierarchy')

http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.write(util.inspect(foo, true));
    res.write('\n');
    foo.getAllProblemSets(function (problemSets) {
        res.end(util.inspect(problemSets));
    });
}).listen(8000, '127.0.0.1');

console.log('Server running at http://127.0.0.1:8000');

var foo = new QuestionHierarchy.Stage({problemSets: ["foo", "bar", "baz"]});

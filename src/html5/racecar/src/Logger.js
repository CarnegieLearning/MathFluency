/*
Copyright 2011, Carnegie Learning

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

         http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
*/

// Import the cocos2d module
var cocos = require('cocos2d');

function Logger (){
    Logger.superclass.constructor.call(this);
    console.log('WARNING: Instantiating instance of static class Logger');
}

Logger.eventLog     = [];               // Array of logged events
Logger.alwaysLog    = {Timestamp: 0};   // Object of values to always be logged

// Logs an event, type is a string, data is an object with key-value pairs
Logger.log = function(type, data) {
    var log = '<' + type + ' ';
    for (prop in data) {
        if (data.hasOwnProperty(prop) && typeof data[prop] !== "function") {
            log += ' ' + prop + '="' + data[prop] + '"';
        }
    }
    for (prop in Logger.alwaysLog) {
        if (Logger.alwaysLog.hasOwnProperty(prop)) {
            log += ' ' + prop + '="' + Logger.alwaysLog[prop] + '"';
        }
    }
    log += '/>\n'
    
    Logger.eventLog.push(log);
};

// Increments the Logger's time by the supplied delta
Logger.incrementTime = function(dt) {
    Logger.alwaysLog.Timestamp = Math.round((Logger.alwaysLog.Timestamp + dt) * 1000) / 1000.0;
}

// Base toString method
Logger.toString = function() {
    return Logger.toStringConcat();
};

// Builds string with array.join method
Logger.toStringJoin = function() {
    var ret = '<Logger>\n';
    ret += Logger.eventLog.join("");
    ret += '</Logger>\n';
    
    return ret;
};
// Builds string with += concatination
Logger.toStringConcat = function() {
    var ret = '<Logger>\n';
    var i=0;
    while(i<Logger.eventLog.length) {
        ret += '    ' + Logger.eventLog[i];
        i+=1;
    }
    ret += '</Logger>\n';
    
    return ret;
}

module.exports = Logger;
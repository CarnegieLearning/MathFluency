/*
    Class: Stage
    Represents a Stage in the <question hierarchy at http://fluencychallenge.com/wiki/DesignAndImplementation#QuestionHierarchy>.
*/
exports.Stage = function (json) {
    this.getAllProblemSets = function (callback) {
        setTimeout(callback, 0, json['problemSets']);
    };
};

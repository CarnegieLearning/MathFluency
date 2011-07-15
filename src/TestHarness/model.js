var Sequelize = require('sequelize'),
    util = require('../common/Utilities');

var sequelize = new Sequelize('TestHarness', 'TestHarness', 'TestHarness');



var Condition = exports.Condition = sequelize.define('Condition', {
    name: Sequelize.STRING
});

var Level = exports.Level = sequelize.define('Level', {
    name: Sequelize.STRING,
    rank: Sequelize.INTEGER,
    configFile: Sequelize.STRING
});

var QuestionSet = exports.QuestionSet = sequelize.define('QuestionSet', {
    name: Sequelize.STRING,
    configFile: Sequelize.STRING
});

Condition.hasManyAndBelongsTo("levels", Level, "condition");
Level.hasManyAndBelongsTo("questionSets", QuestionSet, "level");



var Instructor = exports.Instructor = sequelize.define('Instructor', {
    loginID: Sequelize.STRING,
    password: Sequelize.STRING
},
{
    classMethods: {
        authenticate: function (loginID, password, callback)
        {
            // TODO: salt & hash passwords. For now we'll just manually enter teacher accounts and passwords, so tell them to not give us the same password as their bank account.
            Instructor.find({
                where: {
                    loginID: loginID,
                    password: password
                }
            }).on('success', callback);
        }
    }
});

var Student = exports.Student = sequelize.define('Student', {
    loginID: Sequelize.STRING,
    rosterID: Sequelize.STRING,
    lastName: Sequelize.STRING,
    firstName: Sequelize.STRING,
    password: Sequelize.STRING
},
{
    classMethods: {
        authenticate: function (loginID, password, callback)
        {
            Student.find({
                where: {
                    loginID: loginID,
                    password: password
                }
            }).on('success', callback);
        }
    },
    instanceMethods: {
        toJSON: function ()
        {
            return util.dictWithKeys(this, ['loginID', 'rosterID', 'lastName', 'firstName', 'password']);
        }
    }
});

Instructor.hasManyAndBelongsTo("students", Student, "instructor");
Student.hasOne(Condition);


var QuestionSetOutcome = exports.QuestionSetOutput = sequelize.define('QuestionSetOutcome', {
    startTime: Sequelize.DATE,
    endTime: Sequelize.DATE,
    dataFile: Sequelize.STRING,
    score: Sequelize.INTEGER,
    medal: Sequelize.INTEGER
});

Student.hasManyAndBelongsTo("questionSetOutcomes", QuestionSetOutcome, "student");
QuestionSet.hasManyAndBelongsTo("studentOutcomes", QuestionSetOutcome, "questionSet");


exports.init = function init(force, callback)
{
    sequelize.sync({force:force}).on('success', callback);
}

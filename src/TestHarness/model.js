var Sequelize = require('sequelize'),
    util = require('../common/Utilities');

var sequelize = new Sequelize('TestHarness', 'TestHarness', 'TestHarness');


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
    loginID: {type: Sequelize.STRING, unique: true},
    rosterID: Sequelize.STRING,
    lastName: Sequelize.STRING,
    firstName: Sequelize.STRING,
    password: Sequelize.STRING,
    condition: Sequelize.STRING
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
            return util.dictWithKeys(this, ['loginID', 'rosterID', 'lastName', 'firstName', 'password', 'condition']);
        }
    }
});

Instructor.hasMany(Student);
Student.belongsTo(Instructor);


var QuestionSetOutcome = exports.QuestionSetOutput = sequelize.define('QuestionSetOutcome', {
    startTime: Sequelize.DATE,
    endTime: Sequelize.DATE,
    dataFile: Sequelize.STRING,
    score: Sequelize.INTEGER,
    medal: Sequelize.INTEGER,
    questionSetID: Sequelize.STRING
});

Student.hasMany(QuestionSetOutcome);
QuestionSetOutcome.belongsTo(Student);


exports.init = function init(force, callback)
{
    sequelize.sync({force:force}).on('success', callback);
}

"use strict";

var Sequelize = require('sequelize'),
    util = require('../common/Utilities');

module.exports = function model(db, user, password, options, callback)
{
    options = options || {};
    
    var sequelize = new Sequelize(db, user, password, options);
    
    var model = {};
    model.sequelize = sequelize;
    
    model.Instructor = sequelize.define('Instructor', {
        loginID: {type: Sequelize.STRING, unique: true, allowNull: false},
        password: Sequelize.STRING,
        isAdmin: Sequelize.BOOLEAN
    },
    {
        classMethods: {
            authenticate: function (loginID, password, callback)
            {
                // TODO: salt & hash passwords. For now we'll just manually enter teacher accounts and passwords, so tell them to not give us the same password as their bank account.
                this.find({
                    where: {
                        loginID: loginID,
                        password: password
                    }
                }).on('success', callback);
            }
        }
    });
    
    model.Student = sequelize.define('Student', {
        loginID: {type: Sequelize.STRING, unique: true, allowNull: false},
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
                this.find({
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
    
    model.Instructor.hasMany(model.Student);
    model.Student.belongsTo(model.Instructor);
    
    
    model.QuestionSetOutcome = sequelize.define('QuestionSetOutcome', {
        elapsedMS: Sequelize.INTEGER,
        endTime: Sequelize.INTEGER,
        endState: Sequelize.INTEGER,
        dataFile: {type: Sequelize.STRING, unique: true},
        score: Sequelize.INTEGER,
        medal: Sequelize.INTEGER,
        condition: Sequelize.STRING,
        stageID: Sequelize.STRING,
        questionSetID: Sequelize.STRING
    },
    {
        classMethods: {
            medalString: function (medal)
            {
                return ['none', 'bronze', 'silver', 'gold'][medal || 0];
            },
            medalCode: function (str)
            {
                return {
                    g: 3,
                    s: 2,
                    b: 1
                }[str && str.length > 0 && str.charAt(0).toLowerCase()] || 0;
            },
            endStateString: function (endState)
            {
                return ['completed', 'aborted'][endState] || 'unknown';
            },
            endStateCode: function (str)
            {
                return {
                    FINISH: 0,
                    ABORT: 1
                }[str];
            }
        }
    });
    
    model.Student.hasMany(model.QuestionSetOutcome);
    model.QuestionSetOutcome.belongsTo(model.Student);
    
    sequelize.sync({force:options.forceSync}).on('success', function ()
    {
        callback(null, model);
    })
    .on('failure', function (error)
    {
        callback(error);
    });
};

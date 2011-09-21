"use strict";

var Sequelize = require('sequelize'),
    util = require('../common/Utilities');

module.exports = function model(db, user, password, options, callback)
{
    options = options || {};
    
    var sequelize = new Sequelize(db, user, password, options);
    
    var model = {};
    model.sequelize = sequelize;
    
    // Function to run custom query on the database, bypassing the ORM.  The current implementation is strictly depedent on Sequelize 1.1.0 and likely to break in future versions when Sequelize changes to use a connection pool.
    model.customQuery = function (query, params, callback)
    {
        if (options.logging)
        {
            console.log('Custom Query:' + query.replace(/ +/g, ' '));
            console.log('  - with parameters: ' + params);
        }
        if (!sequelize.connectorManager.isConnected)
        {
            sequelize.connectorManager.connect();
        }
        sequelize.connectorManager.client.query(query, params, callback);
    };
    
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

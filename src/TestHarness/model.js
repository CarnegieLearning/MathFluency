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
        condition: Sequelize.STRING,
        lastSequence: Sequelize.STRING,
        lastStage: Sequelize.STRING
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
            },
            addOrUpdateSA: function( stageID, medal, locked )
            {
                console.log('addOrUpdateSA( '+ stageID +', '+ medal +', '+ locked +' )');
                this.getStageAvailabilities().on('success', function(stageAvailabilities)
                {
                    var blocked = (locked ? true : false);
                    // update if we have the entry already
                    for( var i in stageAvailabilities ){
                        var sa = stageAvailabilities[i];
                        if( stageID == sa.stageID ){
                            sa.medal = medal;
                            sa.isLocked = blocked;
                            console.log('trying to update sa '+ sa );
                            sa.save().on('success', function()
                            {
                                console.log('updated sa!');
                            }).on('error', function(error)
                            {
                                console.log('error saving sa '+ sa.stageID +' for student '+ this.loginID +':'+ error );
                            });
                            return;
                        }
                    }
                    var sa = model.StageAvailability.build({
                        'stageID' : stageID,
                        'medal': medal,
                        'isLocked' : blocked
                    });
                    console.log('trying to create new sa '+ sa );
                    sa.setStudent( this ).on('success', function(sa)
                    {
                        sa.save().on('success', function()
                        {
                            console.log('created new sa!');
                        }).on('error', function(error)
                        {
                            console.log('error saving sa '+ sa.stageID +' for student '+ this.loginID +':'+ error );
                        });
                    }).on('error', function(error)
                    {
                        console.log('unable to set student '+ this.loginID +' on sa '+ sa.stageID +':'+ error  );
                    });
                }).on('error', function(error)
                {
                    console.log('unable to retrieve StageAvailabilities for student '+ this.loginID +':'+ error );
                });
            }
        }
    });
    
    model.Instructor.hasMany(model.Student);
    model.Student.belongsTo(model.Instructor);
    
    model.StageAvailability = sequelize.define('StageAvailability', {
        stageID: Sequelize.STRING,
        medal: Sequelize.INTEGER,
        isLocked: Sequelize.BOOLEAN
    },
    {
        instanceMethods: {
            toString: function()
            {
                return '{ stageID: '+ this.stageID +', medal: '+ this.medal +', isLocked: '+ this.isLocked +'}';
            }
        }
    });
    
    model.Student.hasMany(model.StageAvailability);
    model.StageAvailability.belongsTo(model.Student);
    
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

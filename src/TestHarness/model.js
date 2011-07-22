var Sequelize = require('sequelize'),
    util = require('../common/Utilities');

module.exports = function model(db, user, password, options, callback)
{
    options = options || {};
    
    var sequelize = new Sequelize(db, user, password, options);
    
    var model = {};
    
    model.Instructor = sequelize.define('Instructor', {
        loginID: Sequelize.STRING,
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
        startTime: Sequelize.DATE,
        endTime: Sequelize.DATE,
        dataFile: Sequelize.STRING,
        score: Sequelize.INTEGER,
        medal: Sequelize.INTEGER,
        questionSetID: Sequelize.STRING
    });
    
    model.Student.hasMany(model.QuestionSetOutcome);
    model.QuestionSetOutcome.belongsTo(model.Student);
    
    sequelize.sync({force:options.forceSync}).on('success', function ()
    {
        callback(model);
    });
}

var Sequelize = require('sequelize'),
    util = require('../common/Utilities');

module.exports = function model(db, user, password, options, callback)
{
    options = options || {};
    
    var sequelize = new Sequelize(db, user, password, options);
    
    var model = {};
    model.sequelize = sequelize;
    
    model.Instructor = sequelize.define('Instructor', {
        loginID: {type: Sequelize.STRING, unique: true},
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
        elapsedMS: Sequelize.INTEGER,
        endTime: Sequelize.INTEGER,
        dataFile: Sequelize.STRING,
        score: Sequelize.INTEGER,
        medal: Sequelize.INTEGER,
        condition: Sequelize.STRING,
        stageID: Sequelize.STRING,
        questionSetID: Sequelize.STRING
    },
    {
        instanceMethods: {
            medalString: function ()
            {
                return ['none', 'gold', 'silver', 'bronze'][this.medal || 0];
            },
            setMedalString: function (str)
            {
                this.medal = {
                    gold: 1,
                    silver: 2,
                    bronze: 3
                }[str && str.toLowerCase()] || 'none';
            }
        }
    });
    
    model.Student.hasMany(model.QuestionSetOutcome);
    model.QuestionSetOutcome.belongsTo(model.Student);
    
    sequelize.sync({force:options.forceSync}).on('success', function ()
    {
        callback(model);
    });
}

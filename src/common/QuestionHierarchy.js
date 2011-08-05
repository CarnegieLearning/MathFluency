/*
    Title: QuestionHierarchy
    
    These are the base implementations for various parts of the question hierarchy. The server and client will create instances of these classes, customized or subclassed as appropriate (e.g. the client would fetch data from the server, while the server would load data from a database or file system).
    
    Reference:
    http://fluencychallenge.com/wiki/DesignAndImplementation#QuestionHierarchy
*/

var util = require("./Utilities");

/*
    Class: QuestionEntity
    
    The base class for various parts of the question hierarchy. At the most basic level, a QuestionEntity is responsible for referencing a game engine and a set of properties that configures the game engine.  The values for the properties are "inherited" -- the lower levels of the hierarchy extends and overrides values specified by a higher level.
    
    Constructor Arguments:
        type - A string denoting the subclass type.
        parent - The parent entity (optional).
        id - A unique identifier for this entity within the parent.
        myGameProperties - The game properties defined at this level.
*/
var QuestionEntity = exports.QuestionEntity = function QuestionEntity(type, parent, id, displayName, gameProperties)
{
    this.type = type;
    this.parent = parent;
    if (id instanceof Object)
    {
        this.id = id.id;
        this.displayName = id.displayName;
        this.myGameProperties = id.myGameProperties;
    }
    else
    {
        this.id = id;
        this.displayName = displayName;
        this.myGameProperties = (gameProperties ? gameProperties : {});
    }
};

/*
    Method: allGameProperties
    
    Returns:
    All game properties defined by ancestors and extended and overidden by this.myGameProperties.
*/
QuestionEntity.prototype.allGameProperties = function allGameProperties()
{
    var props = (this.parent ? this.parent.allGameProperties() : {});
    for (var p in this.myGameProperties)
    {
        props[p] = this.myGameProperties[p];
    }
    return props;
};

/*
    Method: toJSON
    
    Returns a JSON serialization.  The default method returns an object containing an `id' and `myGameProperties' keys.
*/
QuestionEntity.prototype.toJSON = function toJSON()
{
    return {id: this.id, displayName: this.displayName, myGameProperties: this.myGameProperties};
};



/*
    Class: Stage
    
    Represents a Stage at the top level of the question hierarchy. A stage contains <QuestionSets>, which can be fetched asynchronously from the server.
    
    Extends:
    <QuestionEntity>
    
    Constructor Arguments:
        id - The unique ID for this stage.
        myGameProperties - An optional dictionary of game properties.
*/
var Stage = exports.Stage = function Stage(id, displayName, gameProperties)
{
    Stage.superConstructor.call(this, 'Stage', undefined, id, displayName, gameProperties);
};
util.extend(Stage, QuestionEntity);

/*
    Method: getAllQuestionSetIDs
    
    Calls callback passing an array of questionSetIDs contained in this stage. The order of the array is not necessarily the order presented to the player, and not all items will necessarily be presented to the player.
*/
Stage.prototype.getAllQuestionSetIDs = function (callback)
{
    setTimeout(callback, 0, []);
};

/*
    Method: getQuestionSet
    
    Calls callback passing the <QuestionSet> with the given ID.
*/
Stage.prototype.getQuestionSet = function (questionSetID, callback)
{
    setTimeout(callback, 0);
};

/*
    Method: getNextQuestionSet
    
    Given playerState, calls callback with the next selected <QuestionSet>, or undefined if there are no more question sets to do here.
    
    For now this returns question sets in order, but in the future we will support specifying a selection algorithm as part of the Stage that handles the logic here.
*/
Stage.prototype.getNextQuestionSet = function (playerState, callback)
{
    var self = this;
    this.getAllQuestionSetIDs(function (questionSetIDs)
    {
        var i = questionSetIDs.indexOf(playerState.questionSetID);
        var nextID = questionSetIDs[i + 1];
        if (nextID) self.getQuestionSet(nextID, callback);
        else callback(undefined);
    });
};



/*
    Class: QuestionSet
    
    Extends:
    <QuestionEntity>
    
    Constructor Arguments:
        stage - The parent <Stage>.
        id - The unique ID for this question set.
        myGameProperties - An optional dictionary of game properties.
*/
var QuestionSet = exports.QuestionSet = function QuestionSet(stage, id, displayName, gameProperties)
{
    QuestionSet.superConstructor.call(this, 'QuestionSet', stage, id, displayName, gameProperties);
};
util.extend(QuestionSet, QuestionEntity);

/*
    Method: getAllQuestionSubsetIDs
    
    Calls callback passing an array of questionSubsetIDs contained in this QuestionSet. The order of the array is not necessarily the order presented to the player, and not all items will necessarily be presented to the player.
*/
QuestionSet.prototype.getAllQuestionSubsetIDs = function (callback)
{
    setTimeout(callback, 0, []);
};

/*
    Method: getQuestionSubset
    
    Calls callback passing the <QuestionSet> with the given ID.
*/
QuestionSet.prototype.getQuestionSubset = function (questionSubsetID, callback)
{
    setTimeout(callback, 0);
};

/*
    Method: getNextQuestionSubset
    
    Given playerState, calls callback with the next selected <QuestionSubset>, or undefined if there are no more question subsets to do here.
    
    For now this returns question subsets in order, but in the future we will support specifying a selection algorithm as part of the QuestionSet that handles the logic here.
*/
QuestionSet.prototype.getNextQuestionSubset = function (playerState, callback)
{
    var self = this;
    this.getAllQuestionSubsetIDs(function (questionSubsetIDs)
    {
        var i = questionSubsetIDs.indexOf(playerState.questionSubsetID);
        var nextID = questionSubsetIDs[i + 1];
        if (nextID) self.getQuestionSubset(nextID, callback);
        else callback(undefined);
    });
};



/*
    Class: QuestionSubset
    
    Unlike the levels above this, QuestionSubset contains a list of questions that is always presented in order.  We'll just assume at this level there's no benefit of loading individual questions asynchronously.
    
    Extends:
    <QuestionEntity>
    
    Constructor Arguments:
        set - The parent <QuestionSet>.
        id - The unique ID for this question subset.
        questions - An array of <Questions>.
        myGameProperties - An optional dictionary of game properties.
*/
var QuestionSubset = exports.QuestionSubset = function QuestionSubset(set, id, questions, gameProperties)
{
    QuestionSubset.superConstructor.call(this, 'QuestionSubset', set, id, id, gameProperties);
    this.questions = questions;
};
util.extend(QuestionSubset, QuestionEntity);

/*
    Method: nextQuestion
    Returns the next question in the list of questions (synchronously).
*/
QuestionSubset.prototype.nextQuestion = function (playerState)
{
    return chooseItemAfterID(this.questions, playerState.questionID);
};



/*
    Class: Question
    
    Questions basically contain a questionProperties dictionary that specifies the particular variables for this question.
    
    Extends:
    <QuestionEntity>
    
    Constructor Arguments:
        subset - The parent <QuestionSubset>.
        id - The unique ID for this question.
        questionProperties - A dictionary defining the characteristics of this question, to be interpreted by the <GameEngine>.
*/
var Question = exports.Question = function Question(subset, id, questionProperties)
{
    Question.superConstructor.call(this, 'Question', subset, id, id);
    this.questionProperties = questionProperties;
};
util.extend(Question, QuestionEntity);



///// Utilities /////

function chooseItemAfterID(array, id)
{
    if (!id) return array[0];
    
    for (var i in array)
    {
        if (array[i].id == id) break;
    }
    return array[id+1];
}

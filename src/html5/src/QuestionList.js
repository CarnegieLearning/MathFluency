var cocos = require('cocos2d');
var events = require('events');

var Question = require('Question').Question;

// Contains the list of questions to be presented
var QuestionList = cocos.nodes.Node.extend({
    questions:null,             //List of questions
    current:null,               //Curent question index
    intermissions:null,         //List of intermissions
    nextIntermission:null,      //Question index of next intermission
    speed:null,                 //Current player speed
    currentAnswer:null,         //Current player answer (lane)
    init: function() {
        QuestionList.superclass.init.call(this);
        
        this.set('questions', []);
        this.set('current', -1);
        this.set('intermissions', []);
        this.set('nextIntermission', 0);
        this.set('speed', 1000);
        this.set('currentAnswer', 1);
        
        this.answerQuestionHandler = this.answerQuestionHandler.bind(this)
        this.nextQuestion = this.nextQuestion.bind(this)
    },
    // Adds a question to the list
    addQuestion: function(q) {
        var list = this.get('questions');
        list[list.length] = q;
        this.set('questions', list);
    },
    // Adds an intermission set at the current end of the question list
    addIntermission: function(s) {
        var list = this.get('intermissions');
        list[list.length] = {selector: s, onQuestion: this.get('questions').length};
        this.set('intermissions', list);
    },
    getCurrentQuestion: function() {
        return this.get('questions')[this.get('current')];
    },
    // 'Speeds up' the player, resulting in less time to answer the question
    speedUp: function() {
        var s = this.get('speed');
        if(s < 4000) {
            s *= 2;
            this.getCurrentQuestion().set('speed', s);
            this.set('speed', s);
            
            console.log("Speeding up, current speed: " + s);
            
            return true;
        }
        
        console.log("Cannot speed up any faster.");
        return false;
    },
    // 'Slows down' the player, resulting in more time to answer the question
    slowDown: function() {
        var s = this.get('speed');
        if(s > 250) {
            s /= 2;
            this.getCurrentQuestion().set('speed', s);
            this.set('speed', s);
            
            console.log("Slowing down, current speed: " + s);
            
            return true;
        }
        
        console.log("Cannot slow down any further");
        return false;
    },
    // Advances to the next question
    // TODO: Pass Question to main and let main handle display/event/interaction
    nextQuestion: function() {
        console.log("Advancing to next question");
    
        var questions = this.get('questions');
        var c = this.get('current');
        
        // Remove current question (except on first question)
        // TODO: Do not double remove on intermissions
        if(c > -1) {
            this.removeChild(questions[c]);
            console.log("    Removed question # " + (c + 1) + " from display");
        }
        
        if(c + 1 == this.get('nextIntermission')) {
            console.log("    New subset detected, triggering intermission");
            var inter = this.get('intermissions')
            events.trigger(this, 'intermission', (inter[0].selector));
            
            inter.shift();
            if(inter.length > 0) {
                this.set('nextIntermission', inter[0].onQuestion);
            }
            else {
                this.set('nextIntermission', -1);
            }
            this.set('intermissions', inter);
        }
        
        // Proceed to next question
        else if(c < questions.length - 1) {
            c += 1;
            
                    
            questions[c].set('speed', this.get('speed'));
            events.addListener(questions[c], 'QuestionTimeExpired', this.answerQuestionHandler.bind(this));
            this.addChild(questions[c]);
            this.set('current', c);
            
            console.log("    Showing question # " + (c + 1));
        }
        // Otherwise signal the end of the game
        else {
            console.log("    No more questions remaining");
        
            events.trigger(this, 'noQuestionsRemaining');
        }
    },
    answerQuestionHandler: function(evt) {
        this.get('questions')[this.get('current')].answerQuestion(this.get('currentAnswer'));
        setTimeout(this.nextQuestion.bind(this), 1000);
    },
});

exports.QuestionList = QuestionList
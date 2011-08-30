var events = require('events');

// Contains the list of questions to be presented
var QuestionList = BObject.extend({
    questions:null,             //List of questions
    current:null,               //Curent question index
    intermissions:null,         //List of intermissions
    nextIntermission:null,      //Question index of next intermission
    init: function() {
        QuestionList.superclass.init.call(this);
        
        this.set('questions', []);
        this.set('current', -1);
        this.set('intermissions', []);
        this.set('nextIntermission', -2);
        
        this.nextQuestion = this.nextQuestion.bind(this)
    },
    // Adds a question to the list
    addQuestion: function(q) {
        var list = this.get('questions');
        list[list.length] = q;
        this.set('questions', list);
    },
    // Adds an intermission set at the current end of the question list
    // Returns true on first intermission, signaling that the value passed it should be applyed to the Player
    addIntermission: function(s) {
        if(this.get('nextIntermission') == -2) {
            this.set('nextIntermission', -1);
            return true;
        }
        else if(this.get('nextIntermission') == -1) {
            this.set('nextIntermission', this.get('questions').length);
        }

        var list = this.get('intermissions');
        list[list.length] = {selector: s, onQuestion: this.get('questions').length};
        this.set('intermissions', list);
        
        return false;
    },
    //Stores the currently displayed question
    storeQuestion: function(question) {
        this.get('questions')[this.get('current')] = question;
    },
    // Advances to the next question
    nextQuestion: function() {
        console.log("Advancing to next question");
    
        var questions = this.get('questions');
        var c = this.get('current');
        
        // Check to see if there is an intermission ahead
        if(c + 1 == this.get('nextIntermission')) {
            console.log("    New subset detected, triggering intermission");
            var inter = this.get('intermissions')
            events.trigger(this, 'intermission', inter[0].selector);
            
            // Remove the intermission that was just triggered and set up the next one, if there is one
            inter.shift();
            if(inter.length > 0) {
                this.set('nextIntermission', inter[0].onQuestion);
            }
            else {
                this.set('nextIntermission', -3);
            }
            this.set('intermissions', inter);
        }
        
        // Proceed to next question
        else if(c < questions.length - 1) {
            c += 1;
            this.set('current', c);
            
            events.trigger(this, 'QuestionReady', questions[c]);
            console.log("    Showing question # " + (c + 1));
        }
        // Otherwise signal the end of the game
        else {
            console.log("    No more questions remaining");
        
            events.trigger(this, 'noQuestionsRemaining');
        }
    },
});

exports.QuestionList = QuestionList
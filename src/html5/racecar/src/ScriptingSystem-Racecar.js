/*
Copyright 2011, Carnegie Learning

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

         http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
*/

// Import the cocos2d module
var cocos = require('cocos2d');
var geo = require('geometry');
var events = require('events');

// Static Imports
var XML = require('/XML');

// ScriptingSystem Import
var SS = require('/ScriptingSystem');

// Actions /////////////////////////////////////////////////////////////////////////////////////////

// Locks the specified lane in the specified way
var LockAbsoluteLaneAct = function(opts) {
    LockAbsoluteLaneAct.superclass.constructor.call(this, opts);
    opts = opts.attributes;
    opts = this.getInt('lane', opts);
    
    if(this.lane < 0) {
        throw new Error('Value for LockAbsoluteLaneAct\'s lane is negative: ' + this.lane);
    }
    
    opts = this.getOpt('direction', opts);
    // Validate and convert direction from string to int
    if(this.direction == 'in') {
        this.direction = 1;
    }
    else if(this.direction == 'out') {
        this.direction = 2;
    }
    else if(this.direction == 'both') {
        this.direction = 3;
    }
    else {
        throw new Error('Invalid value for LockAbsoluteLaneAct\'s direction ( ' + this.direction + ' )');
    }
}
LockAbsoluteLaneAct.inherit(SS.Act, {
    lane        : -1,   // Holds the lane number to apply the locking effect to
    direction   : null, // Stores if the lock is in/outbound or bidirectional
    
    exec: function() {
        events.trigger(SS.eventRelay, 'LockAbsoluteLaneEvent', this.lane, this.direction);
    }
});

//***********************************************/

// Handles all Actions dealing with simple Medal Car interaction
var MedalCarAct = function(opts) {
    MedalCarAct.superclass.constructor.call(this, opts);
    opts = opts.attributes;
    opts = this.getOpt('type', opts);
    opts = this.getOpt('car', opts);
    
    // Validate and convert car from string to int
    if(this.car == 'gold') {
        this.car = 0;
    }
    else if(this.car == 'silver') {
        this.car = 1;
    }
    else if(this.car == 'bronze') {
        this.car = 2;
    }
    else {
        throw new Error('Invalid value for MedalCarAct\'s car ( ' + this.car + ' )');
    }
}
MedalCarAct.inherit(SS.Act, {
    car: -1,
    
    exec: function() {
        events.trigger(SS.eventRelay, this.type + 'Event', this.car);
    }
});

//***********************************************/

// Places the player in the specified lane
// NOTE: This is unaffacted by any sort of lane locking
var SetAbsoluteLaneAct = function(opts) {
    SetAbsoluteLaneAct.superclass.constructor.call(this, opts);
    opts = opts.attributes;
    opts = this.getInt('lane', opts);
    
    if(this.lane < 0) {
        throw new Error('Value for SetAbsoluteLaneAct\'s lane is negative: ' + this.lane);
    }
}
SetAbsoluteLaneAct.inherit(SS.Act, {
    lane: -1,   // Lane to put player into when the action executes
    
    exec: function() {
        events.trigger(SS.eventRelay, 'SetAbsoluteLaneEvent', this.lane);
    }
});

//***********************************************/

// Sets the player's velocity to the specified speed (in meters per second (mph ~= *4/9))
var SetVelocityAct = function(opts) {
    SetVelocityAct.superclass.constructor.call(this, opts);
    opts = opts.attributes;
    opts = this.getInt('velocity', opts);
    
    if(this.velocity < 0) {
        throw new Error('Invalid value for SetVelocityAct\'s velocity is negative: ' + this.velocity);
    }
}
SetVelocityAct.inherit(SS.Act, {
    velocity: -1,   // Player will be set to this velocity
    
    exec: function() {
        events.trigger(SS.eventRelay, 'SetVelocityEvent', this.velocity);
    }
});

//***********************************************/

// Unlocks the specified lane in the specified way
var UnlockAbsoluteLaneAct = function(opts) {
    UnlockAbsoluteLaneAct.superclass.constructor.call(this, opts);
    opts = opts.attributes;
    opts = this.getInt('lane', opts);
    
    if(this.lane < 0) {
        throw new Error('Value for LockAbsoluteLaneAct\'s lane is negative: ' + this.lane);
    }
    
    opts = this.getOpt('direction', opts);
    // Validate and convert direction from string to int
    if(this.direction == 'in') {
        this.direction = 1;
    }
    else if(this.direction == 'out') {
        this.direction = 2;
    }
    else if(this.direction == 'both') {
        this.direction = 3;
    }
    else {
        throw new Error('Invalid value for UnlockAbsoluteLaneAct\'s direction ( ' + this.direction + ' )');
    }
}
UnlockAbsoluteLaneAct.inherit(SS.Act, {
    lane        : -1,   // Holds the lane number to apply the unlocking effect to
    direction   : null, // Stores if the unlock is in/outbound or bidirectional
    
    exec: function() {
        events.trigger(SS.eventRelay, 'UnlockAbsoluteLaneEvent', this.lane, this.direction);
    }
});

// Triggers ////////////////////////////////////////////////////////////////////////////////////////

// Triggers when the player enters the specified lane
var AbsoluteLaneTrigger = function(opts) {
    AbsoluteLaneTrigger.superclass.constructor.call(this, opts);
    opts = opts.attributes;
    opts = this.getInt('lane', opts);
    
    if(this.lane < 0) {
        throw new Error('Value for AbsoluteLaneTrigger\'s lane is negative: ' + this.lane);
    }
}
AbsoluteLaneTrigger.inherit(SS.Trigger, {
    lane: -1,   // Lane number (leftmost is 0) that triggers this Trigger
    
    check: function() {
        return (this.lane == AbsoluteLaneTrigger.currentLane);
    }
});

AbsoluteLaneTrigger.currentLane = -2;

//***********************************************/

// Triggers when the player answers a question with the specified correctness
var AnswerTrigger = function(opts) {
    AnswerTrigger.superclass.constructor.call(this, opts);
    opts = opts.attributes;
    opts = this.getBoolean('correctness', opts, 'correct', 'incorrect');
    
    // Listen for when a question is answered
    events.addListener(SS.eventRelay, 'answerQuestionTrigger', this.handle.bind(this));
}
AnswerTrigger.inherit(SS.Trigger, {
    correctness : null,     // True if the answer needs to be correct, false if it needs to be incorrect
    trigger     : false,    // True when an answer has triggered this Trigger
    
    // Checks to see if an answer has triggered the Trigger
    check: function() {
        if(this.trigger) {
            this.trigger = false;
            return true;
        }
        return false;
    },
    
    // Determines if an answer should trigger this Trigger
    handle: function(isCorrect) {
        if(this.correctness == isCorrect) {
            this.trigger = true;
            setTimeout(this.buffer.bind(this), 1);
        }
    },
    
    // Introduces at least a one full frame delay, making sure that this Trigger can be adaquetly check()'ed
    buffer: function() {
        setTimeout(this.negateInput.bind(this), 1);
    },
    
    // Negates a triggering input
    negateInput: function() {
        this.trigger = false;
    }
});

//***********************************************/

var CorrectLaneTrigger = function(opts) {
    CorrectLaneTrigger.superclass.constructor.call(this, opts);
    opts = opts.attributes;
    opts = this.getInt('lane', opts);
    
    if(this.lane < 0) {
        throw new Error('Value for AbsoluteLaneTrigger\'s lane is negative: ' + this.lane);
    }
    
    events.addListener(SS.eventRelay, 'answerQuestionTrigger', this.handle.bind(this));
}
CorrectLaneTrigger.inherit(SS.Trigger, {
    lane    : -1,       // 
    trigger : false,    // 
    
    check: function() {
        if(this.trigger && CorrectLaneTrigger.lastCorrect == this.lane) {
            this.trigger = false;
            return true;
        }
        return false;
    },
    
    handle: function() {
        this.trigger = true;
        setTimeout(this.buffer.bind(this), 1);
    },
    
    // Introduces at least a one full frame delay, making sure that this Trigger can be adaquetly check()'ed
    buffer: function() {
        setTimeout(this.negateInput.bind(this), 1);
    },
    
    // Negates a triggering input
    negateInput: function() {
        this.trigger = false;
    }
});

CorrectLaneTrigger.lastCorrect = -1;

//***********************************************/

// Triggers once the player exceeds the specified distance based on a relative position
// TODO: Better error and warning handling
var DistanceTrigger = function(opts) {
    DistanceTrigger.superclass.constructor.call(this, opts);
    opts = opts.attributes;
    opts = this.getInt('offset', opts);
    opts = this.getOpt('relPoint', opts);
    if(!DistanceTrigger.relPoints.hasOwnProperty(this.relPoint)) {
        throw new Error('DistanceTrigger has invalid relPoint ( ' + this.relPoint + ' )');
    }
    
    // Only required for certain relPoints
    if(opts.hasOwnProperty('ordinal')) {
        opts = this.getInt('ordinal', opts);
        this.ordinal -= 1;
    }
    else if(this.relPoint == 'question' || this.relPoint == 'checkpoint') {
        throw new Error('DistanceTrigger missing "ordinal" attribute for relPoint type ( ' + this.relPoint + ' )');
    }
}
DistanceTrigger.inherit(SS.Trigger, {
    distance: -1,   // Distance after which the Trigger triggers
    offset  : -1,   // Offset in meters from relPoint to trigger
    ordinal : -1,   // Determines which relPoint to use if multiple exist for the category
    relPoint: '',   // Location to which this Trigger triggers relatively
    
    // Determines the actual distance based on the relative parameters
    resolve: function() {
        if(this.relPoint == 'question' || this.relPoint == 'checkpoint') {
            this.distance = DistanceTrigger.relPoints[this.relPoint][this.ordinal] + this.offset;
        }
        else {
            this.distance = DistanceTrigger.relPoints[this.relPoint] + this.offset;
        }
    },
    
    check: function() {
        if(this.distance == -1) {
            this.resolve();
        }
        
        return (this.distance < DistanceTrigger.currentDistance);
    }
});

DistanceTrigger.currentDistance = -2;
DistanceTrigger.relPoints = {
    question    : [],
    checkpoint  : [],
    start       : 0,
    finish      : -1
};

//***********************************************/

// Triggers when the player's velocity crosses the specified threshold
var VelocityTrigger = function(opts) {
    VelocityTrigger.superclass.constructor.call(this, opts);
    opts = opts.attributes;
    opts = this.getInt('velocity', opts);
    opts = this.getBoolean('direction', opts, 'accelerate', 'decelerate');
}
VelocityTrigger.inherit(SS.Trigger, {
    velocity    : null,     // Velocity threshold for triggering
    direction   : null,     // True when threshold is upper limit, false when threshold is lower limit
    
    check: function() {
        if(this.direction) {
            return (this.velocity < VelocityTrigger.currentVelocity);
        }
        return (this.velocity > VelocityTrigger.currentVelocity);
    }
});

VelocityTrigger.currentVelocity = -1;

// Scripting System ////////////////////////////////////////////////////////////////////////////////

// The main purpose of the subclass of ScriptingSystem is to register subclass specific Actions and Triggers
var RacecarScripting = function() {
    RacecarScripting.superclass.constructor.call(this);

    // Register Actions
    this.addAction('HideMedalCar',          MedalCarAct);
    this.addAction('LockAbsoluteLane',      LockAbsoluteLaneAct);
    this.addAction('LockVelocity',          SS.GeneralPurposeAct);
    this.addAction('RevertVelocity',        SS.GeneralPurposeAct);
    this.addAction('SetAbsoluteLane',       SetAbsoluteLaneAct);
    this.addAction('SetVelocity',           SetVelocityAct);
    this.addAction('ShowMedalCar',          MedalCarAct);
    this.addAction('StartTimer',            SS.GeneralPurposeAct);
    this.addAction('StopTimer',             SS.GeneralPurposeAct);
    this.addAction('UnlockAbsoluteLane',    UnlockAbsoluteLaneAct);
    this.addAction('UnlockVelocity',        SS.GeneralPurposeAct);
    
    // Register Triggers
    this.addTrigger('AbsoluteLane', AbsoluteLaneTrigger);
    this.addTrigger('Answer',       AnswerTrigger);
    this.addTrigger('CorrectLane', CorrectLaneTrigger);
    this.addTrigger('Distance',     DistanceTrigger);
    this.addTrigger('Velocity',     VelocityTrigger);
};

RacecarScripting.inherit(SS.ScriptingSystem, {
    update: function(dt) {
        RacecarScripting.superclass.update.call(this, dt);
    }
});

module.exports = {
    RacecarScripting    : RacecarScripting,
    eventRelay          : SS.eventRelay,
    
    AbsoluteLaneTrigger : AbsoluteLaneTrigger,
    AnswerTrigger       : AnswerTrigger,
    CorrectLaneTrigger  : CorrectLaneTrigger,
    DistanceTrigger     : DistanceTrigger,
    VelocityTrigger     : VelocityTrigger,
};
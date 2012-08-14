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

// Event Relay /////////////////////////////////////////////////////////////////////////////////////

// Empty object solely for providing a static relay point for cocos events
var eventRelay = {};

// Utility functions ///////////////////////////////////////////////////////////////////////////////

// Both Actions and Triggers make use of these functions for retrieving values from the opts object
var OptGetters = function() {
}
OptGetters.inherit(Object, {
    // Gets the specified value from opts, deletes it from opts and returns the fresh opts
    // Throws an error if the value does not exist within opts
    getOpt: function(name, opts) {
        if(opts.hasOwnProperty(name)) {
            this[name] = opts[name];
            delete opts[name];
            return opts;
        }
        
        throw new Error('opts does not contain property ( ' + name + ' )');
    },
    
    // Runs getOpt and then parses the received value as an int before returning it
    // Throws an error if the value resolves to NaN
    getInt: function(name, opts) {
        opts = this.getOpt(name, opts)
        this[name] = parseInt(this[name]);
        if(isNaN(this[name])) {
            throw new Error('opts[' + name +'] value is NaN after parseInt');
        }
        return opts;
    },
    
    // Runs getOpt and then parses the received value as an float before returning it
    // Throws an error if the value resolves to NaN
    getFloat: function(name, opts) {
        opts = this.getOpt(name, opts)
        this[name] = parseInt(this[name]);
        if(isNaN(this[name])) {
            throw new Error('opts[' + name +'] value is NaN after parseInt');
        }
        return opts;
    },
    
    // Runs getOpt and then parses the received value as a boolean based on the true and false values provided
    // Throws an error if the value does not equal either of the provided values
    getBoolean: function(name, opts, t, f) {
        opts = this.getOpt(name, opts);
        
        if(this[name] == t) {
            this[name] = true;
        }
        else if(this[name] == f) {
            this[name] = false;
        }
        else {
            throw new Error('Invalid boolean value: ' + this[name] + ' ( ' + t + ' || ' + f + ' )');
        }
        
        return opts;
    },
    
    // Converts all values passed in the opts object to floating point numbers if possible
    optionalConverter: function(opts) {
        for (var prop in opts) {
            if (opts.hasOwnProperty(prop)) {
                var ft = parseFloat(opts[prop]);
                if(!isNaN(ft)) {
                    opts[prop] = ft;
                }
            }
        }
        
        return opts;
    }
});

// Actions /////////////////////////////////////////////////////////////////////////////////////////

// Abstract base class for Actions
var Act = function() {
}
Act.inherit(OptGetters, {
    // exec() is what is called when an action is executed by a ScriptingEvent
    exec: function() {
        throw new Error('Subclass of Act must override exec()');
    },
});

//***********************************************/

var AudioAct = function(opts) {
    opts = this.getOpt('type');
    opts = this.getOpt('contentID', opts);
    
    if(this.type == 'PlayAudio') {
        this.mode = 'play';
    }
    else if(this.type == 'LoopAudio') {
        this.mode = 'loop';
    }
    else if(this.type == 'StopAudio') {
        this.mode = 'stop';
    }
    else if(this.type == 'AudioVolume') {
        this.mode = 'volume';
        opts = this.getFloat('volume', opts);
        if(this.volume < 0 || 1 < this.volume) {
            throw new Error('AudioAct volume is out of valid range [0, 1] ( ' + this.volume + ' )')
        }
    }
    else {
        throw new Error('Invalid AudioAct mode value ( ' + this.mode + ' )')
    }
}
AudioAct.inherit(Act, {
    contentID   : '',
    mode        : false,
    volume      : 1,
    
    exec: function() {
        this.trigger(eventRelay, 'AudioEvent', this.contentID, this.mode, this.volume);
    }
});

//***********************************************/

// Calls any arbitrary function on the ScriptingSystem object
var CallFunctionAct = function(opts) {
    delete opts['type'];
    this.params = this.getOpt('function', opts);
}
CallFunctionAct.inherit(Act, {
    func    : null,
    params  : null,
    
    exec: function() {
        events.trigger(eventRelay, 'CallFunctionEvent', this.func, this.params);
    }
});

//***********************************************/

// Do not subclass DelayAct, it is a special case Action
var DelayAct = function(opts) {
    opts = this.getOpt('duration', opts);
    this.duration *= 1000;
}
DelayAct.inherit(Act, {
    duration    : 0,    // Duration of the delay in milliseconds
    
    // As DelayAct never 'executes', its exec() throws an error when called
    exec: function() {
        throw new Error('exec() should never be called for DelayAct');
    }
});

//***********************************************/

// Handles 'DeactivateEvent', 'ReactivateEvent' and 'TriggerEvent'
var EventAct = function(opts) {
    opts = this.getOpt('eventID', opts);
    opts = this.getOpt('type', opts);
    
    // Validate type parameter
    if(this.type != 'ReactivateEvent' && this.type != 'DeactivateEvent' && this.type != 'TriggerEvent') {
        throw new Error('Invalid value for EventAct\'s type ( ' + this.type + ' )');
    }
}
EventAct.inherit(Act, {
    eventID : null,     // EventID that will be modified
    type    : null,     // The type of modification that will occur
    
    // Trigger an event to tell the ScriptingSystem to modify the specified event
    exec: function() {
        events.trigger(eventRelay, this.type + 'Event', this.eventID);
    }
});

//***********************************************/

// Use this Action for Actions who only need is to trigger an event for something else to act on
// instead of always creating a new Act which only calls an events.trigger()
var GeneralPurposeAct = function(opts) {
    this.getOpt('type', opts);
}
GeneralPurposeAct.inherit(Act, {
    exec: function() {
        events.trigger(eventRelay, this.type + 'Event');
    }
});

//***********************************************/

// Hides the object on screen with the specified contentID
var HideContentAct = function(opts) {
    opts = this.getOpt('contentID', opts);
}
HideContentAct.inherit(Act, {
    contentID   : null,
    
    exec: function() {
        events.trigger(eventRelay, 'HideContentEvent', this.contentID);
    }
});

//***********************************************/

var LoadAudioAct = function(opts) {
    opts = this.getOpt('contentID', opts);
    opts = this.getOpt('source', opts);
}
LoadAudioAct.inherit(Act, {
    source: null,
    
    exec: function() {
        this.trigger(eventRelay, 'LoadAudioEvent', this.contentID, this.source);
    }
});

//***********************************************/

var ManualTriggerAct = function (opts) {
    opts = this.getOpt('triggerID', opts);
}
ManualTriggerAct.inherit(Act, {
    triggerID   : '',
    
    exec: function() {
        events.trigger(eventRelay, 'ManualTriggerEvent', this.triggerID);
    }
});

//***********************************************/

// Displays a button to the screen
// ButtonInputTrigger listens for these buttons based on their 'contentID'
var ShowButtonAct = function(opts) {
    // Remove the type value from the opts object
    delete opts['type'];
    
    // Get all required values from the opts parameter
    opts = this.getOpt('resourceUp', opts);
    opts = this.getOpt('resourceDown', opts);
    opts = this.getOpt('contentID', opts);
    opts = this.getInt('x', opts);
    opts = this.getInt('y', opts);
    
    // Create parameter object for MenuItemImage constructor
    this.params = this.optionalConverter(opts);
    this.params['normalImage'] = this.resourceUp;
    this.params['selectedImage'] = this.resourceDown;
    this.params['disabledImage'] = this.resourceUp;
    this.params['callback'] = this.callback.bind(this);
}
ShowButtonAct.inherit(Act, {
    resourceUp  : null,     // Image resource for the unpressed button
    resourceDown: null,     // Image resource for the depressed button
    contentID   : null,     // String to reference button with in scripting content tracking dictionary
    x           : null,     // X screen coordinate
    y           : null,     // Y screen coordinate
    params      : null,     // Parameter object for MenuItemImage constructor
    
    // Create the button and fire an event for the ScriptingSystem to display it
    exec: function() {
        var btn = new cocos.nodes.MenuItemImage(this.params);
        btn.position = new geo.Point(this.x, this.y);
        
        var menu = new cocos.nodes.Menu({items: [btn]});
        
        events.trigger(eventRelay, 'ShowButtonEvent', this.contentID, menu);
    },
    
    // Handles the button being pressed by the player
    callback: function() {
        events.trigger(eventRelay, 'ButtonInputEvent', this.contentID);
    }
});

//***********************************************/

// Displays an image on the screen
var ShowImageAct = function(opts) {
    // Remove the type value from the opts object
    delete opts['type'];
    
    // Get all required values from the opts parameter
    opts = this.getOpt('resource', opts);
    opts = this.getOpt('contentID', opts);
    opts = this.getInt('x', opts);
    opts = this.getInt('y', opts);
    
    // Create parameter object for Sprite constructor
    this.params = this.optionalConverter(opts);
    this.params['file'] = this.resource;
}
ShowImageAct.inherit(Act, {
    resource    : null,     // Image resource to display
    contentID   : null,     // String to reference button with in scripting content tracking dictionary
    x           : null,     // X screen coordinate
    y           : null,     // Y screen coordinate
    params      : null,     // Parameter object for Sprite constructor
    
    // Create the image and fire an event for the ScriptingSystem to display it
    exec: function() {
        var img = new cocos.nodes.Sprite(this.params);
        img.position = new geo.Point(this.x, this.y);
        
        events.trigger(eventRelay, 'ShowImageEvent', this.contentID, img);
    }
});

//***********************************************/

// Displays a string on the screen
var ShowMessageAct = function(opts) {
    // Remove the type value from the opts object
    delete opts['type'];
    
    // Get all required values from the opts parameter
    opts = this.getOpt('message', opts);
    opts = this.getOpt('contentID', opts);
    opts = this.getInt('x', opts);
    opts = this.getInt('y', opts);
    
    // Create parameter object for Label constructor
    this.params = this.optionalConverter(opts);
    this.params['string'] = this.message;
}
ShowMessageAct.inherit(Act, {
    message     : null,     // String to be written on the screen
    contentID   : null,     // String to reference button with in scripting content tracking dictionary
    x           : null,     // X screen coordinate
    y           : null,     // Y screen coordinate
    params      : null,     // Parameter object for Label constructor
    
    // Create the text and fire an event for the ScriptingSystem to display it
    exec: function() {
        var msg = new cocos.nodes.Label(this.params);
        msg.position = new geo.Point(this.x, this.y);
        
        events.trigger(eventRelay, 'ShowMessageEvent', this.contentID, msg);
    }
});

// Triggers ////////////////////////////////////////////////////////////////////////////////////////

// Abstract base class for Triggers
var Trigger = function() {
}
Trigger.inherit(OptGetters, {
    // Called to determine if Trigger is satisified (returns true if so, false otherwise)
    // Must be overridden by subclasses
    check: function() {
        throw new Error('Trigger subclasses must override check()');
    }
});

//***********************************************/

// Triggers when a Button created through ShowButton with the specified contentID is pressed
var ButtonInputTrigger = function(opts) {
    opts = this.getOpt('buttonID', opts);
    
    events.addListener(eventRelay, 'ButtonInputEvent', this.handle.bind(this));
}
ButtonInputTrigger.inherit(Trigger, {
    buttonID: null,     // The buttonID that this Trigger listens for
    pressed : false,    // true when the button has been pressed
    
    // Checks to see if the bound button was pressed in this or the previous frame
    check: function() {
        if(!this.pressed) {
            return false;
        }
        this.pressed = false;
        return true;
    },
    
    // Checks to see if the button that was just pressed is the one this Trigger is bound to
    handle: function(id) {
        if(this.buttonID == id) {
            this.pressed = true;
            setTimeout(this.buffer.bind(this), 1);
        }
    },
    
    // Introduces at least a one full frame delay, making sure that this Trigger can be adaquetly check()'ed
    buffer: function() {
        setTimeout(this.negatePress.bind(this), 1);
    },
    
    // Ignores the button's press
    negatePress: function() {
        this.pressed = false;
    }
});

//***********************************************/

KeyTrigger = function(opts) {
    opts = this.getOpt('key', opts);
    if(this.key.length == 1) {
        this.key = this.key.toUpperCase();
        this.key = this.key.charCodeAt(0);
    }
    // Treat as int if keyVal is true (i.e. providing actual keyCode)
    else {
        this.key = parseInt(this.key);
        if(isNaN(this.key)) {
            throw new Error('KeyTrigger\'s key resolves to NaN');
        }
    }
    
    opts = this.getBoolean('state', opts, 'down', 'up');
}
KeyTrigger.inherit(Trigger, {
    key     : -1,       // Character code for the triggering key
    state   : null,     // When true, triggers on key down, and when false, triggers on key up
    keyVal  : false,    // When true, signals that the load value for key is a key code
    
    check: function() {
        if(KeyTrigger.keys) {
            return ((KeyTrigger.keys[this.key] == 2 && this.state) || (KeyTrigger.keys[this.key] == 1 && !this.state));
        }
    }
});

KeyTrigger.keys = null;

//***********************************************/

var ManualTrigger = function(opts) {
    opts = this.getOpt('triggerID', opts);
    
    events.addListener(eventRelay, 'ManualTriggerEvent', this.handle.bind(this));
}
ManualTrigger.inherit(Trigger, {
    triggerID   : '',       // Name of this trigger
    state       : false,    // If this trigger has been activated
    
    // Checks to see if the the trigger has fired and reset if it does not toggle
    check: function() {
        if(this.state) {
            this.state = false;
            return true;
        }
        
        return false;
    },
    
    // Checks the id against the triggerID and handles the toggle value
    handle: function(id) {
        if(this.triggerID == id) {
            this.state = true;
            setTimeout(this.buffer.bind(this), 1);
        }
    },
    
    // Introduces at least a one full frame delay, making sure that this Trigger can be adaquetly check()'ed
    buffer: function() {
        setTimeout(this.negate.bind(this), 1);
    },
    
    // Ignores the button's press
    negate: function() {
        this.state = false;
    }
});

//***********************************************/

// Triggers after a certain amount of time has elapsed since either the ScriptingSystem or the game stated
var TimeTrigger = function(opts) {
    opts = this.getFloat('duration', opts);
    opts = this.getBoolean('timer', opts, 'game', 'system');
    
    // Convert duration from seconds to milliseconds
    this.duration *= 1000;
}
TimeTrigger.inherit(Trigger, {
    duration: null, // Duration in seconds that must elapse before this Trigger triggers
    timer   : null, // Use gameTime when true, systemTime when false
    
    // Checks to see if the required amount of time has elapsed
    check: function() {
        if(this.timer) {
            return (this.duration < TimeTrigger.gameTime);
        }
        return (this.duration < TimeTrigger.systemTime);
    }
});

TimeTrigger.gameTime = 0;
TimeTrigger.systemTime = 0;

// ScriptingEvent //////////////////////////////////////////////////////////////////////////////////

// Represents a single event composed of at least one Trigger and at least one Action
var ScriptingEvent = function(xml) {
    // Initialize values
    this.eventID = xml.attributes.eventID;
    this.triggers = [];
    this.actions = [];
    this.endTrans = ScriptingEvent.NO_STATE;
    
    // If optional state attribute is present, parse it
    if(xml.attributes.hasOwnProperty('state')) {
        if(xml.attributes.state == 'active') {
            this.state = ScriptingEvent.ACTIVE;
        }
        else if(xml.attributes.state == 'inactive') {
            this.state = ScriptingEvent.INACTIVE;
        }
        else {
            throw new Error('Event ' + this.eventID + ' has invalid starting state ' + xml.attributes.state);
        }
    }
    // Otherwise default to active
    else {
        this.state = ScriptingEvent.ACTIVE;
    }
    
    // Retrieve a list of Triggers and Actions
    var t = XML.getChildrenByName(xml, 'TRIGGER');
    var a = XML.getChildrenByName(xml, 'ACTION');
    
    // Make sure we have at least one of each so that the Event is valid
    if(t.length == 0 || a.length == 0) {
        throw new Error('ScriptingEvent requires at least one Trigger ( ' + t.length + ' ) and one Action ( ' + a.length + ' )');
    }
    
    // Create Triggers
    var i=0;
    while(i < t.length) {
        var trig = new ScriptingSystem.triggerMap[t[i].attributes['type']](t[i].attributes);
        this.triggers.push(trig);
        i += 1;
    }
    
    // Create Actions
    i=0;
    while(i < a.length) {
        var act = new ScriptingSystem.actionMap[a[i].attributes['type']](a[i].attributes);
        this.actions.push(act);
        i += 1;
    }
}

ScriptingEvent.inherit(Object, {
    eventID : '',   // String for indentifying this event
    triggers: null, // List of triggers required to be true
    actions : null, // Sequential list of actions
    
    execNum : 0,    // Current action in the list of actions that is being executed
    
    state   : ScriptingEvent.NO_STATE,  // Current state of the event
    endTrans: ScriptingEvent.NO_STATE,  // State to change to from the TRANSITION state
    
    // Returns true if all triggers are true
    check: function() {
        var i = 0;
        while(i < this.triggers.length) {
            if(!this.triggers[i++].check())
                return false;
        }
        
        return true;
    },
    
    // Returns true if this event is allowed to exec()
    canExec: function() {
        return this.state == ScriptingEvent.ACTIVE;
    },
    
    // Executes all actions
    exec: function() {
        // If the ending state has not been set (ie the ScriptingEvent just started executing)
        // Set the ending state to the default of INACTIVE
        if(this.endTrans == ScriptingEvent.NO_STATE) {
            this.endTrans = ScriptingEvent.INACTIVE;
        }
    
        // Make sure that the ScriptingEvent is flagg as EXECUTING during execution
        this.state = ScriptingEvent.EXECUTING;
        
        while(this.execNum < this.actions.length) {
            // Catch special Delay case
            if(this.actions[this.execNum] instanceof DelayAct) {
                setTimeout(this.exec.bind(this), this.actions[this.execNum].duration);
                this.execNum++;
                return;
            }
        
            // Otherwise continue executing as normal
            this.actions[this.execNum++].exec()
        }
        
        // Start transitioning when finished
        this.state = ScriptingEvent.TRANSITIONING
    },
    
    // Begins activating the event
    activate: function() {
        // If inactive, start transitioning to active
        if(this.state == ScriptingEvent.INACTIVE) {
            this.state = ScriptingEvent.TRANSITIONING;
            this.endTrans = ScriptingEvent.ACTIVE;
        }
        
        // If executing or transitioning, set the target state as active
        else if(this.state == ScriptingEvent.TRANSITIONING || this.state == ScriptingEvent.EXECUTING) {
            if(this.endTrans != ScriptingEvent.ACTIVE) {
                this.endTrans = ScriptingEvent.ACTIVE;
            }
            else {
                console.log('WARNING: Cannot activate ' + this.eventID + ' when endTrans is already ACTIVE');
            }
        }
        
        // Otherwise warn that the state change cannot occur
        else {
            console.log('WARNING: Cannot activate ' + this.eventID + ' when in NO_STATE or ACTIVE');
        }
    },
    
    // Begins deactivating the event
    deactivate: function() {
        // If active, start transitioning to inactive
        if(this.state == ScriptingEvent.ACTIVE) {
            this.state = ScriptingEvent.TRANSITIONING;
            this.endTrans = ScriptingEvent.INACTIVE;
        }
        
        // If executing or transitioning, set the target state as inactive
        else if(this.state == ScriptingEvent.TRANSITIONING || this.state == ScriptingEvent.EXECUTING) {
            if(this.endTrans != ScriptingEvent.INACTIVE) {
                this.endTrans = ScriptingEvent.INACTIVE;
            }
            else {
                console.log('WARNING: Cannot deactivate ' + this.eventID + ' when endTrans is already INACTIVE');
            }
        }
        
        // Otherwise warn that the state change cannot occur
        else {
            console.log('WARNING: Cannot deactivate ' + this.eventID + ' when in NO_STATE or INACTIVE');
        }
    },
    
    // Handles automatically changing states
    updateState: function() {
        if(this.state != ScriptingEvent.TRANSITIONING) {
            return;
        }
        
        if(this.endTrans == ScriptingEvent.ACTIVE || this.endTrans == ScriptingEvent.INACTIVE) {
            this.state = this.endTrans;
            this.endTrans = ScriptingEvent.NO_STATE
            
            this.execNum = 0;
        }
        else {
            throw new Error('Cannot transition to NO_STATE, EXECUTING or TRANSITIONING');
        }
    }
});

// State static constants
ScriptingEvent.NO_STATE         = -1;   // Something has gone wrong if we end up here
ScriptingEvent.ACTIVE           = 0;    // Event is Active, ready to be triggered
ScriptingEvent.EXECUTING        = 1;    // Event is currently executing or delayed
ScriptingEvent.INACTIVE         = 2;    // Event is Inactive and cannot be triggered
ScriptingEvent.TRANSITIONING    = 3;    // Event will transitioning to Active/Inactive at the end of frame

// Scripting System ////////////////////////////////////////////////////////////////////////////////

var ScriptingSystem = function() {
    ScriptingSystem.superclass.constructor.call(this);

    // Initialize objects
    this.eventList = {};
    this.listenMap = {};
    this.events = {};
    this.tracker = {};
    this.vars = {};
    
    this.dynamicNode = new cocos.nodes.Node();
    this.addChild({child: this.dynamicNode});
    
    // Register Actions
    this.addAction('Delay',             DelayAct);
    this.addAction('DeactivateEvent',   EventAct,       'DeactivateEventEvent', this.deactivateEvent.bind(this));
    this.addAction('ReactivateEvent',   EventAct,       'ReactivateEventEvent', this.reactivateEvent.bind(this));
    this.addAction('TriggerEvent',      EventAct,       'TriggerEventEvent',    this.triggerEvent.bind(this));
    this.addAction('CallFunction,',     CallFunctionAct,'CallFunctionEvent',    this.callFunction.bind(this));
    this.addAction('ShowButton',        ShowButtonAct,  'ShowButtonEvent',      this.showContent.bind(this));
    this.addAction('ShowImage',         ShowImageAct,   'ShowImageEvent',       this.showContent.bind(this));
    this.addAction('ShowMessage',       ShowMessageAct, 'ShowMessageEvent',     this.showContent.bind(this));
    this.addAction('HideContent',       HideContentAct, 'HideContentEvent',     this.hideContent.bind(this));
    this.addAction('LoadAudio',         LoadAudioAct,   'LoadAudioEvent',       this.loadAudio.bind(this));
    this.addAction('PlayAudio',         AudioAct,       'AudioEvent',           this.audio.bind(this));
    this.addAction('LoopAudio',         AudioAct,       'AudioEvent',           this.audio.bind(this));
    this.addAction('StopAudio',         AudioAct,       'AudioEvent',           this.audio.bind(this));
    this.addAction('AudioVolume',       AudioAct,       'AudioEvent',           this.audio.bind(this));
    this.addAction('ManualTrigger',     ManualTriggerAct);
    
    // Register Triggers
    this.addTrigger('ButtonInput',      ButtonInputTrigger);
    this.addTrigger('KeyTrigger',       KeyTrigger);
    this.addTrigger('ManualTrigger',    ManualTrigger);
    this.addTrigger('Time',             TimeTrigger);
    
    // Start running every frame
    this.scheduleUpdate();
}

// Responsible for managing the creation, execution, and modification of ScriptingEvents
ScriptingSystem.inherit(cocos.nodes.Node, {
    eventList   : null,     // Dictionary of all events in the system
    
    loadTimer   : 0,        // Time in seconds since the system started
    gameTimer   : 0,        // Time in seconds since the game started
    started     : false,    // True once the game has started
    
    tracker     : null,     // Keeps track of dynamic content
    vars        : null,     // Keeps track of dynamic variables
    
    dynamicNode : null,
    
    audioHook   : null,     // Tie in point for AudioMixer to handle audio Actions
    
    // Adds an Action's id and associated constructor
    addAction: function(id, act, evt, func) {
        ScriptingSystem.actionMap[id] = act;
        if(evt && func) {
            events.addListener(eventRelay, evt, func);
        }
    },
    
    // Adds a Trigger to the Trigger mapping
    addTrigger: function(id, trig) {
        ScriptingSystem.triggerMap[id] = trig;
    },
    
    // Registers the keyboard with the KeyTrigger class
    hookKeyboard: function(keys) {
        KeyTrigger.keys = keys;
    },
    
    // Load ScriptingEvents from parsed xml
    loadXML: function(xml) {
        if(xml == null) {
            return;
        }
    
        // Get the list of ScriptingEvents from XML
        var evts = XML.getChildrenByName(xml, 'EVENT');
        
        // Interate over, validate and construct the ScriptingEvents
        var i=0;
        while(i<evts.length) {
            if(evts[i].attributes.hasOwnProperty('eventID')) {
                if(!this.eventList.hasOwnProperty(evts[i].attributes.eventID)) {
                    this.eventList[evts[i].attributes.eventID] = new ScriptingEvent(evts[i]);
                }
                else {
                    throw new Error('Event #' + (i+1) + ' has an eventID that is already in use ( ' + evts[i].attributes.eventID + ' )');
                }
            }
            else {
                throw new Error('Event #' + (i+1) + ' does not have an eventID');
            }
            i += 1;
        }
    },
    
    // Loads the specified audio file
    loadAudio: function(contentID, source) {
        if(!this.audioHook) {
            console.log('WARNING: loadAudio called with no audioHook');
            return;
        }
        
        this.audioHook.loadSound(contentID, source);
    },
    
    // Executes the specified command on the audio track
    audio: function(contentID, mode, volume) {
        if(!this.audioHook) {
            console.log('WARNING: audio called with no audioHook');
            return;
        }
        
        else if(this.mode != 'play') {
            this.audioHook.playSound(contentID);
        }
        else if(this.mode == 'loop') {
            this.audioHook.loopSound(contentID);
        }
        else if(this.mode == 'stop') {
            this.audioHook.stopSound(contentID);
        }
        else if(this.mode == 'volume') {
            this.audioHook.setTrackVolume(contentID, volume);
        }
        else {
            throw new Error('Invalid mode ( ' + mode + ' ) for audio()');
        }
    },
    
    // Deactivate the specified event
    deactivateEvent: function(eventID) {
        this.eventList[eventID].deactivate();
    },
    
    // Activate the specified event
    reactivateEvent: function(eventID) {
        this.eventList[eventID].activate();
    },
    
    // Trigger the specified event
    triggerEvent: function(eventID) {
        if(this.eventList[eventID].canExec()) {
            this.eventList[eventID].exec();
        }
    },
    
    // Calls an arbitrary function on this object
    callFunction: function(func, params) {
        try {
            this[func].call(params);
        }
        catch(e) {
            throw Error('Error calling function ' + func + ' with parameters ' + params)
        }
    },
    
    playAudio: function(track, loop) {
        if(this.audioHook) {
            if(loop) {
                this.audioHook.loopSound(track);
            }
            else {
                this.audioHook.playSound(track);
            }
        }
    },
    
    // Displays scripted content to the screen
    showContent: function(id, content) {
        if(!this.tracker.hasOwnProperty(id)) {
            this.tracker[id] = content;
            this.addChild({child: content});
        }
        else {
            throw new Error('Already tracking content with id ( ' + id + ' ), unable to showContent()');
        }
    },
    
    // Hides and deletes a piece of content that was previously displayed
    hideContent: function(id) {
        if(this.tracker.hasOwnProperty(id)) {
            this.removeChild({child: this.tracker[id]});
            delete this.tracker[id];
        }
        else {
            throw new Error('Not tracking any content with id ( ' + id + ' ), unable to hideContent()');
        }
    },
    
    // Runs every frame
    update: function(dt) {
        // Track timers
        this.loadTimer += dt;
        TimeTrigger.systemTime = this.loadTimer
        if(this.started) {
            this.gameTimer += dt;
            TimeTrigger.gameTime = this.gameTimer
        }
        
        // Iterate over events
        for (var prop in this.eventList) {
            if (this.eventList.hasOwnProperty(prop)) {
                // Shortcut evaluation: do not check() unless it canExec()
                if(this.eventList[prop].canExec() && this.eventList[prop].check()) {
                    this.eventList[prop].exec();
                }
            }
        }
        
        // Update event state
        for (var prop in this.eventList) {
            if (this.eventList.hasOwnProperty(prop)) {
                this.eventList[prop].updateState();
            }
        }
    },
    
    // Starts the gameTimer
    start: function() {
        this.started = true;
    }
});

// Stores the mapping between strings and constructors
ScriptingSystem.actionMap = {};
ScriptingSystem.triggerMap = {};

module.exports = {
    Act                 : Act,
    Trigger             : Trigger,
    ScriptingEvent      : ScriptingEvent,
    ScriptingSystem     : ScriptingSystem,
    eventRelay          : eventRelay,
    GeneralPurposeAct   : GeneralPurposeAct,
}
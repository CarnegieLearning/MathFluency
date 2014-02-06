(function(){
__jah__.resources["/AudioMixer.js"] = {data: function (exports, require, module, __filename, __dirname) {
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



// Cocos requires

var cocos = require('cocos2d');

var events = require('events');



// Static requires

var MOT = require('/ModifyOverTime');



// Project requires

var AudioTrack = require('/AudioTrack');



// Only need a single Audio Mixer, so the class is static

// Responsible for managing all the audio in the app

function AudioMixer() {

    AudioMixer.superclass.constructor.call(this);

    

    this.sounds = {};

    

    // If AudioMixer is disabled, do not do anything else

    if(!AudioMixer.enabled) {

        console.log("AudioMixer is currently disabled");

        return;

    }

    

    this.crossFadeComplete = this.crossFadeComplete.bind(this);



    var a = document.createElement('audio');

    // Detect <audio> capability

    if(a.canPlayType) {

        this.availible = true;

        

        // Detect ogg/oga capability

        var check = a.canPlayType('audio/ogg; codecs="vorbis"');

        if(check != '' && check != 'no') {

            this.ogg = true;

        }

        

        // Detect mp3 capability

        check = a.canPlayType('audio/mpeg;')

        if(check != '' && check != 'no') {

            this.mp3 = true;

        }

    }

}



AudioMixer.inherit(Object, {

    sounds      : null,  // Dictionary of AudioTracks

    availible   : false, // true if browser supports <audio>

    ogg         : false, // true if browser supports ogg/oga format

    mp3         : false, // true is browser supports mp3 format

    muted       : false, // Whether or not all audio should be muted

    volume      : 1,     // Master volume



    // Load a sound, do NOT supply a file extension with the filename

    loadSound: function(ref, filename) {

        if(!this.availible) {

            return;

        }

        

        // Set file extension based on filetype(s) supported

        if(this.ogg) {

            filename += '.ogg';

        }

        else if(this.mp3) {

            filename += '.mp3';

        }

        else {

            console.log('Can play audio, but no supported audio type availible');

            return

        }

        

        if(!this.checkRef(ref)) {

            try {

                this.sounds[ref] = new AudioTrack(filename);

            }

            catch(exception) {

                console.log(exception);

            }

        }

        else {

            console.log('AudioTrack already exists at reference: ' + ref);

        }

    },



    // Plays a sound

    playSound: function(ref, force) {

        if(!this.availible) {

            return;

        }

        

        if(this.checkRef(ref)) {

            if(force) {

                this.sounds[ref].forcePlay();

            }

            else {

                this.sounds[ref].play();

            }

        }

    },



    // Sets a sound to loop continuously, also starts playing the sound if it is not already playing

    loopSound: function(ref) {

        if(!this.availible) {

            return;

        }

        

        if(this.checkRef(ref)) {

            this.sounds[ref].loop = true;

            

            this.playSound(ref);

        }

    },



    // Stops a sound, also disables looping

    stopSound: function(ref) {

        if(!this.availible) {

            return;

        }

        

        if(this.checkRef(ref)) {

            this.sounds[ref].loop = false;

            this.sounds[ref].stop();

        }

    },



    // Sets whether or not all sound is to be muted

    setMute: function(b) {

        if(!this.availible) {

            return;

        }

        

        this.muted = b;

        

        for(snd in this.sounds) {

            this.sounds[snd].setMute(b);

        }

    },



    // Sets the master volume

    setMasterVolume: function(v) {

        if(!this.availible) {

            return;

        }

        

        // Keep the volume level within acceptable range

        v = Math.min(Math.max(0, v), 1);

        

        this.volume = v;

        

        for(snd in this.sounds) {

            this.sounds[snd].updateMasterVolume(v);

        }

    },

    

    // Sets specific track's volume

    setTrackVolume: function(t, v) {

        if(!this.availible) {

            return;

        }

        

        if(this.checkRef(t)) {

            this.getSound(t).setVolume(v);

        }

    },

    

    // Gets the specificied AudioTrack if it exists

    getSound: function(ref) {

        if(this.checkRef(ref)) {

            return this.sounds[ref];

        }

        return null;

    },

    

    // Cross fades from the specified track to the other specified track over the specified duration

    crossFade: function(from, to, dur) {

        var f = this.getSound(from);

        var t = this.getSound(to);

        

        if(f && t) {

            (new MOT(1, -1, dur)).bindFunc(f, f.setVolume);

            (new MOT(0, 1, dur)).bindFunc(t, t.setVolume);

        }

        

        setTimeout(this.crossFadeComplete, dur * 1000);

    },

    

    crossFadeComplete: function() {

        events.trigger(this, 'crossFadeComplete');

    },



    // Checks to see if the reference has a valid entry in the dictionary

    checkRef: function(ref) {

        if(ref in this.sounds) {

            return true;

        }

        return false;

    }

});



// Static constants

AudioMixer.enabled = false; //true; // Setting to false disables constructor, preventing audio from playing // mvy



module.exports = AudioMixer
}, mimetype: "application/javascript", remote: false}; // END: /AudioMixer.js


__jah__.resources["/AudioTrack.js"] = {data: function (exports, require, module, __filename, __dirname) {
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

// Cocos requires
var cocos = require('cocos2d')

// Wrapper class for the <audio> element
function AudioTrack (file) {
    this.audio = document.createElement('audio');
    this.audio.setAttribute('src', file);
    this.audio.addEventListener('ended', this.endCallback.bind(this), false);
    this.isPlaying = false;
}

AudioTrack.inherit(Object, {
    audio       : null,  // Holds the actual audio element
    loop        : false, // Whether or not the track should loop on ending
    isPlaying   : false, // True if the track is current playing
    volume      : 1,     // [0-1] the volume for this specific AudioTrack
    masterVolume: 1,     // [0-1] the volume of the AudioMixer

    // Starts playing the audio if it is not already playing
    // Returns true if the audio started to play
    play: function() {
        if(this.audio.networkState != HTMLMediaElement.NETWORK_NO_SOURCE) {
            if(!this.isPlaying) {
                this.audio.play();
                this.isPlaying = true;
                return true;
            }
        }
        return false;
    },
    
    // Forces the audio to start playing regardless of its current state
    forcePlay: function() {
        this.stop();
        this.play();
    },
    
    // Stops the audio if it is currently playing
    // Returns true if the audio was stopped
    stop: function() {
        if(this.audio.networkState != HTMLMediaElement.NETWORK_NO_SOURCE) {
            if(this.isPlaying) {
                this.audio.pause();
//                 this.audio.currentTime = 0;
                this.isPlaying = false;
                return true;
            }
        }
        return false;
    },
    
    // Called when a track finishes playing, loops if needed
    endCallback: function() {
        this.isPlaying = false;
        
        if(this.loop) {
            this.play();
        }
    },
    
    // Sets the muted attribute for the audio
    setMute: function(b) {
        if(this.audio.networkState != HTMLMediaElement.NETWORK_NO_SOURCE) {
            this.audio.muted = b;
        }
    },
    
    // Called by AudioMixer when the master volume level is changed
    updateMasterVolume: function(v) {
        if(this.audio.networkState != HTMLMediaElement.NETWORK_NO_SOURCE) {
            this.masterVolume = v;
            this.audio.volume = v * this.volume;
        }
    },
    
    // Called to change the volume of this specific AudioTrack
    setVolume: function(v) {
        if(this.audio.networkState != HTMLMediaElement.NETWORK_NO_SOURCE) {
            // Keep the volume level within acceptable range
            v = Math.min(Math.max(0, v), 1);
            
            this.volume = v;
            this.audio.volume = this.masterVolume * v;
        }
    }
});

module.exports = AudioTrack
}, mimetype: "application/javascript", remote: false}; // END: /AudioTrack.js


__jah__.resources["/Background.js"] = {data: function (exports, require, module, __filename, __dirname) {
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



var cocos = require('cocos2d');

var geo = require('geometry');



var PNode = require('/PerspectiveNode');

var RC = require('/RaceControl');



function Background (lanes) {

    Background.superclass.constructor.call(this);

    

    var dir = '/resources/Background/';

    

    // Sky background

    this.sky = new cocos.nodes.Sprite({file: dir + 'sky.png'});

    this.sky.anchorPoint = new geo.Point(0.5, 0);

    this.sky.position = new geo.Point(450, 0);

    this.addChild({child: this.sky});

    

    // City layer, will move up as race progresses, between sky and pavement

    this.city = new cocos.nodes.Sprite({file: dir + 'city.png'});

    this.city.anchorPoint = new geo.Point(0.5, 1);

    this.city.position = new geo.Point(450, 460);

    this.city.scaleX = 0.36;

    this.city.scaleY = 0.52;

    this.addChild({child: this.city});

    

    // Base pavement layer

    this.pave = new cocos.nodes.Sprite({file: dir + 'pavement.png'});

    this.pave.anchorPoint = new geo.Point(0.5, 0);

    this.pave.position = new geo.Point(450, -41);

    this.addChild({child: this.pave});

    

    // Street for cars

    this.street = new cocos.nodes.Sprite({file: dir + 'street.png'});

    this.street.anchorPoint = new geo.Point(0.5, 0);

    this.street.position = new geo.Point(450, -25);

    this.street.scaleX = 1.2;

    this.addChild({child: this.street});

    

    // Lane Delimiters

    //TODO: 2 (and 4?) lane version

    this.lines = new cocos.nodes.Sprite({file: dir + 'dividingLines3.png'});

    this.lines.anchorPoint = new geo.Point(0.5, 0);

    this.lines.position = new geo.Point(450, 000);

    this.lines.scaleX = 1.2;

    this.addChild({child: this.lines});

}



Background.inherit(cocos.nodes.Node, {

    sky     : null,     // Holds the sky background image

    city    : null,     // Holds the city image

    pave    : null,     // Holds the pavement image

    street  : null,     // Holds the street image

    lines   : null,     // Holds the lane delimiter image



    // Raises sky and city as race progresses

    progress: function(p) {

        this.sky.position.y = 130 * p;

        this.city.position.y = 460 + 130 * p;

        this.city.scaleX = 0.36 + 0.16 * p;

    }

});



module.exports = Background
}, mimetype: "application/javascript", remote: false}; // END: /Background.js


__jah__.resources["/Content.js"] = {data: function (exports, require, module, __filename, __dirname) {
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

// Project Imports
var FractionRenderer = require('/FractionRenderer');
var LabelBG = require('/LabelBG');
var PieChart = require('/PieChart');
var ImageContent = require('/ImageContent');

// Static Imports
var XML = require('/XML');

// Represents a single question to be answered by the player
function Content () {
}

// Holds registered subclasses' creation functions
Content.registeredContent = {};

// Every defined subclass used should be registered, the cls should be the class
Content.registerContent = function(str, cls) {
    Content.registeredContent[str] = cls;
}

Content.initialize = function () {
    Content.registerContent(LabelBG.identifier, LabelBG);
    Content.registerContent('Fraction', FractionRenderer);
    Content.registerContent('PieChart', PieChart);
    Content.registerContent('Image', ImageContent);
}

// Helper function to convert all attributes into a object using attribute names to map values
var mapper = function(xml) {
    var map = {};
    var attributes = xml[0].attributes;
	
    for (a = 0; a < attributes.length; a++) {
        map[attributes[a].name] = attributes[a].value;
    }
	
	return map;
}

// Build Content subclass from parsed XML
Content.buildFrom = function(xmlNode) {
    //if(xmlNode.attributes.hasOwnProperty('TYPE')) {
    if($(xmlNode).attr('TYPE')) {
        var cs = $(xmlNode).children('ContentSettings');
        
		var opts = {}
        if(cs.length > 0) {
            return new Content.registeredContent[$(xmlNode).attr('TYPE')](mapper($(cs)));
        }
        else {
            return new Content.registeredContent[$(xmlNode).attr('TYPE')](mapper($(xmlNode)));
        }
    }
    
    return null;
}

module.exports = Content;
}, mimetype: "application/javascript", remote: false}; // END: /Content.js


__jah__.resources["/Dashboard.js"] = {data: function (exports, require, module, __filename, __dirname) {
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



// Project Imports

var LFW = require('/LabelFW');

var PNode = require('/PerspectiveNode');



// Static Imports

var RC = require('/RaceControl');

var MOT = require('/ModifyOverTime');



// Displays the dashboard on the right hand side

function Dashboard (ckpt) {

    Dashboard.superclass.constructor.call(this);

    

    this.zOrder = 100;

    this.checkpoints = ckpt;

    

    // Directory with Dashboard resources

    var dir = '/resources/Dashboard/';

    

    // Medal meter fillings

    this.mms = [];

    this.mms.push(new cocos.nodes.Sprite({file: dir + 'dashBoardMedalBlack.png'}));

    this.mms.push(new cocos.nodes.Sprite({file: dir + 'dashBoardMedalBronze.png'}));

    this.mms.push(new cocos.nodes.Sprite({file: dir + 'dashBoardMedalSilver.png'}));

    this.mms.push(new cocos.nodes.Sprite({file: dir + 'dashBoardMedalGold.png'}));

    

    var offset = 31;

    for(var i=0; i<4; i+=1) {

        this.mms[i].anchorPoint = new geo.Point(0.5, 0);

        this.mms[i].scaleY = this.proportions(4-i) * 0.85;

        this.mms[i].position = new geo.Point(176, offset);

        this.addChild({child: this.mms[i]});

        offset += this.proportions(4-i) * 85;

    }

    

    // A little extra size for the top and bottom to mke sure they are flush with the meter's edges

    var pt = this.mms[0].position;

    pt.y -= 20;

    this.mms[0].position = pt;

    this.mms[0].scaleY = this.mms[0].scaleY + 0.2;

    this.mms[3].scaleY = this.mms[3].scaleY + 0.1;

    

    // Backing of the dashboard

    this.dashBack = new cocos.nodes.Sprite({file: dir + 'dashBoardBack.png'});

    this.dashBack.anchorPoint = new geo.Point(0, 0);

    this.dashBack.position = new geo.Point(-16, -24);

    this.addChild({child: this.dashBack});

    

    // Non-dynamic components of the dashboard display

    this.dashDial = new cocos.nodes.Sprite({file: dir + 'dashBoardDials.png'});

    this.dashDial.anchorPoint = new geo.Point(0, 0);

    this.dashDial.position = new geo.Point(42, 10);

    this.addChild({child: this.dashDial});

    

    // Medal needle

    this.medalNeedle = new cocos.nodes.Sprite({file: dir + 'dashBoardMedalIndicator.png'});

    this.medalNeedle.position = new geo.Point(172, 27);

    this.medalNeedle.rotation = 90;

    this.addChild({child: this.medalNeedle});

    

    // Speedometer needle

    this.speedNeedle = new cocos.nodes.Sprite({file: dir + 'dashBoardNeedle.png'});

    this.speedNeedle.anchorPoint = new geo.Point(0.5, 0.1);

    this.speedNeedle.position = new geo.Point(264, 40);

    this.speedNeedle.rotation = -110;

    this.addChild({child: this.speedNeedle});

    

    // Top layer of the dashboard

    this.dashFront = new cocos.nodes.Sprite({file: dir + 'dashBoardFront.png'});

    this.dashFront.anchorPoint = new geo.Point(0, 0);

    this.dashFront.position = new geo.Point(-32, -47);

    this.addChild({child: this.dashFront});

    

    // Hash marks

    var hash;

    for(var i=0; i<this.checkpoints.length; i+=1) {

        hash = new cocos.nodes.Sprite({file: dir + 'dashBoardHash.png'});

        hash.position = new geo.Point(48, 90 + this.checkpoints[i] / RC.finishLine * 115);

        this.addChild({child: hash});

    }

    

    // Minimap dots

    this.miniDots = []

    

    this.miniDots.push(new cocos.nodes.Sprite({file: dir + 'dashBoardMedalDotGold.png'}));

    this.miniDots[0].position = new geo.Point(50, 90);

    this.addChild({child: this.miniDots[0]});

    

    this.miniDots.push(new cocos.nodes.Sprite({file: dir + 'dashBoardMedalDotSilver.png'}));

    this.miniDots[1].position = new geo.Point(43, 90);

    this.addChild({child: this.miniDots[1]});

    

    this.miniDots.push(new cocos.nodes.Sprite({file: dir + 'dashBoardMedalDotBronze.png'}));

    this.miniDots[2].position = new geo.Point(53, 90);

    this.addChild({child: this.miniDots[2]});

    

    this.miniPlayer = new cocos.nodes.Sprite({file: dir + 'dashBoardMedalDotPlayer.png'});

    this.miniPlayer.position = new geo.Point(46, 90);

    this.addChild({child: this.miniPlayer});

    

    // Label for error count

    var opts = {};

    opts['fontName'] = RC.font;

    opts['string'] = '0';

    opts['fontSize'] = '22';

    this.penaltyCount = new cocos.nodes.Label(opts);

    this.penaltyCount.anchorPoint = new geo.Point(0.5, 0.5);

    this.penaltyCount.position = new geo.Point(120, RC.YTextOff(140, 22));

    this.addChild({child: this.penaltyCount});

    

    // Label for current speed

    opts['string'] = '0 MPH';

    opts['fontSize'] = '16';

    this.displaySpeed = new cocos.nodes.Label(opts);

    this.displaySpeed.anchorPoint = new geo.Point(1, 0);

    this.displaySpeed.position = new geo.Point(310, RC.YTextOff(7, 16));

    this.addChild({child: this.displaySpeed});

    

    

    opts['string'] = '.';

    var decimal = new cocos.nodes.Label(opts);

    //HACK: This does not need the YTextOff tweak

    decimal.position = new geo.Point(42, 0);

    

    // Label for elapsed time

    opts['fontSize'] = '16'

    opts['numDigits'] = 4;

    opts['offset'] = 16;

    delete opts['string'];

    this.elapsedLabel = new LFW(opts);

    this.elapsedLabel.labels[3].position.x += 2

    this.elapsedLabel.setStr('0000');

    this.elapsedLabel.anchorPoint = new geo.Point(0, 0);

    this.elapsedLabel.position = new geo.Point(67, RC.YTextOff(45, 16));

    this.addChild({child: this.elapsedLabel});

    

    this.elapsedLabel.addChild({child: decimal});

    

    var that = this;

    setTimeout(function() {

        that._updateLabelContentSize();

    }, 500);

    

    this.onlyOnce = false;

}



Dashboard.inherit(cocos.nodes.Node, {

    elapsedTime  : 0,       // Time in race elapsed so far

    elapsedLabel : null,    // Timer displayed to player

    gaugeRadius  : 40,      // Radius of the gauges

    penaltyCount : null,    // Displayed penalty time

    pCount       : 0,       // Stores number of penalties incurred

    speed        : 0,       // Speed for speedometer

    currentSpeed : null,    // Numerically displayed speed

    lastS        : 0,       // Previous frame's speed (for when current frame's speed is 0 due to pausing)

    maxSpeed     : 200,     // Maximum possible speed to display/calculate

    timerAcc     : 1,       // Number of digits to the right of the decimal place for timer accuracy

    pause        : false,   // Stores if the elapsed timer should be paused.

    speedMode    : 2,       // Defines what units to use when displaying speed

    

    // Minimap facilitation

    playerZ      : 0,       // The player's current location (updated by Player)

    goldZ        : 0,		// Z position of the gold medal car (updated by PNode)

    silverZ      : 0,		// Z position of the silver medal car (updated by PNode)

    bronzeZ      : 0,		// Z position of the bronze medal car (updated by PNode)

	checkpoints	 : [],		// Z positions of the checkpoints



    // Adjust the labels to match their content sizes and alignments

    _updateLabelContentSize: function() {

        //this.elapsedLabel._updateLabelContentSize();

        this.penaltyCount._updateLabelContentSize();

        this.displaySpeed._updateLabelContentSize();

    },

    

    // Updates a minimap dot's position

    updateDot: function (dot, val) {

        dot.position.y = Math.min(90 + ((val / RC.finishLine) * 115), 205);

    },

    

    // Starts tracking time and updating the dashboard timer.

    start: function () {

        this.elapsedTime = 0;

        this._updateLabelContentSize();

        this.scheduleUpdate();

    },

    

    // Changes the current amount of penalty time accured

    modifyPenaltyCount: function() {

        this.pCount += 1;

        this.penaltyCount.string = this.pCount;

        this.penaltyCount._updateLabelContentSize();

    },

    

    // Sets the pause state

    pauseTimer: function () {

        this.pause = true;

    },

    

    // Unsets the pause state

    unpauseTimer: function () {

        this.pause = false;

    },

    

    // Updates the time

    update: function(dt) {
        if(!this.pause) {

            // Update elapsed timer

            this.elapsedTime = (this.elapsedTime + dt);

            var t = this.elapsedTime * 10;

            

            // Only update positive elapsed time

            //TODO: Remove if?  elapsedTime no longer tracks negative time

            if(t > 0) {

                this.elapsedLabel.setStr(t.toFixed(this.timerAcc-1) + '');

            }

        }

        

        // Determine current speed as a percentage of max speed

        var s = this.getSpeed();

        var p = s / this.maxSpeed;

        

        this.speedNeedle.rotation = p * 220 - 110;

        

        // Save this frame's speed for 1 frame

        this.lastS = s;

        

        // Update numerical speedometer

        this.displaySpeed.string = this.getConvertedSpeed();

        this.displaySpeed._updateLabelContentSize();

        

        // Update minimap

        this.updateDot(this.miniPlayer, this.playerZ);

        this.updateDot(this.miniDots[0], this.goldZ);

        this.updateDot(this.miniDots[1], this.silverZ);

        this.updateDot(this.miniDots[2], this.bronzeZ);

        

        // Place the medal meter needle

        //TODO: Remove if?  elapsedTime no longer tracks negative time

        if(this.elapsedTime > 0) {

            this.placeMedalNeedle(this.pHelper(s));

        }

    },

    

    // Get speed converted to specified units

    getConvertedSpeed: function() {

        var s = this.getSpeed();

        

        if(this.speedMode == Dashboard.SPEED_M_PS) {

            if(s.toFixed) {

                s = s.toFixed(0);

            }

            s += ' m/s';

        }

        else if(this.speedMode == Dashboard.SPEED_KM_PH) {

            s = s * 36 / 10;

            if(s.toFixed) {

                s = s.toFixed(0);

            }

            s += ' KPH';

        }

        else if(this.speedMode == Dashboard.SPEED_MI_PH) {

            s = s * 36 / 16;

            if(s.toFixed) {

                s = s.toFixed(0);

            }

            s += ' MPH';

        }

        else {

            console.log('ERROR: Invalid speedMode (  ' + mode + ' )');

            return null;

        }

        

        return s;

    },

    

    // Places the medal meter needle

    placeMedalNeedle: function(p) {

        this.medalNeedle.rotation = 87 + p * 41;

        

        // Placement depends on which quartile the needle needs to be in

        if(p < 0.25) {

            p *= 4;

            

            this.medalNeedle.position = new geo.Point(172, 27 + p * 24);

        }

        else if(p < 0.50) {

            p -= 0.25;

            p *= 4;

            

            this.medalNeedle.position = new geo.Point(171 + p * 6, 51 + p * 22);

        }

        else if(p < 0.75) {

            p -= 0.50;

            p *= 4;

            

            this.medalNeedle.position = new geo.Point(177 + p * 12, 73 + p * 19);

        }

        else {

            p -= 0.75;

            p *= 4; 

            

            this.medalNeedle.position = new geo.Point(189 + p * 13, 92 + p * 17);

        }

    },

    

    // Getter for speed, accounts for the fact that 'speed' is 0 when paused

    getSpeed: function() {

        if(!this.pause) {

            return this.speed;

        }

        return this.lastS;

    },

    

    // Helper function for calculating needle position

    // TODO: Possibly rewrite to account for proportial areas instead of statically sized areas

    pHelper: function (s) {

        // TODO: Add chaseDist back into this, otherwise calculation will be off by part of a meter

        var dc = PNode.cameraZ + 12;

        var tc = this.elapsedTime + this.pCount * RC.penaltyTime;

        

        var te = (Math.max(RC.finishLine - dc, 0) / s) + tc;

        

        var p;

        p = 1 - (te - RC.times[0]) / (RC.times[4] - RC.times[0]);

        p = Math.min(Math.max(p, 0), 1);

        

        return p;

    },

    

    // Helper function that gives area percentage for medal time ranges

    proportions: function (i) {

        return (RC.times[i] - RC.times[i - 1]) / (RC.times[4] - RC.times[0]);

    }

});



// Speed setting constants

Dashboard.SPEED_M_PS = 0;       // Meters per second

Dashboard.SPEED_KM_PH = 1;      // Kilometers per hour

Dashboard.SPEED_MI_PH = 2;      // Miles per hour



module.exports = Dashboard
}, mimetype: "application/javascript", remote: false}; // END: /Dashboard.js


__jah__.resources["/EndOfGameDisplay.js"] = {data: function (exports, require, module, __filename, __dirname) {
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



// Cocos imports

var cocos = require('cocos2d');

var geo = require('geometry');

var events = require('events');



// Project imports

var LabelStroke = require('/LabelStroke');



// Static imports

var RC = require('/RaceControl');

var MOT = require('/ModifyOverTime');



function GuiNode (opts) {

    GuiNode.superclass.constructor.call(this, opts);

    this._actionComplete = this._actionComplete.bind(this);

}

    

GuiNode.inherit(cocos.nodes.Node, {

    // Slides a label in from the right

    slideLabelIn: function (l, d) {

        this.addChild({child: l});

        var a = new cocos.actions.MoveTo({position: new geo.Point(15, l.position.y), duration: d});

        a.startWithTarget(l);

        l.runAction(a);

        

        events.addListener(a, 'actionComplete', this._actionComplete);

    },

    

    // Totals a label up over time

    totalLabelUp: function(link, value, duration) {

        var m = new MOT(0.0, value, duration);

        m.bind(this, link);

        

        events.addListener(m, 'Completed', this._actionComplete);

    },

    

    // Causes a label to appear

    showLabel: function (l, d) {

        this.addChild({child: l});

        

        setTimeout(this._actionComplete, d * 1000);

    },

    

    // Triggers 'actionComplete'

    _actionComplete: function () {

        events.trigger(this, 'actionComplete');

    }

});



// Responsible for displaying the player's stats at the end of the game

function EndOfGameDisplay (ta, np, a) {

    EndOfGameDisplay.superclass.constructor.call(this);



    this.timeAmt = ta;

    this.numPenalty = np;

    this.abort = a;



    var lbl;

    var opts = {};

    

    // Back Pane /////////////////////////////////////////////////////////////////////////////////////////////////

    

    var dir = '/resources/EndScreen/';

    this.backPane = new cocos.nodes.Sprite({file: dir + 'signEndScreenBack.png'});

    this.backPane.anchorPoint = new geo.Point(0, 0);

    this.backPane.zOrder = -5;

    this.addChild(this.backPane);

    

    // Between Pane ///////////////////////////////////////////////////////////////////////////////////////////////

    

    this.medalBars = [];

    

    this.medalBars.push(new cocos.nodes.Sprite({file: dir + 'EndScreenIndicatorBlack.png'}));

    this.medalBars.push(new cocos.nodes.Sprite({file: dir + 'EndScreenIndicatorBronze.png'}));

    this.medalBars.push(new cocos.nodes.Sprite({file: dir + 'EndScreenIndicatorSilver.png'}));

    this.medalBars.push(new cocos.nodes.Sprite({file: dir + 'EndScreenIndicatorGold.png'}));

    

    var offset = 325;

    for(var i=0; i<4; i+=1) {

        this.medalBars[i].anchorPoint = new geo.Point(0, 0.5);

        this.medalBars[i].scaleX = this.proportions(4-i);

        this.medalBars[i].position = new geo.Point(offset, 270);

        this.medalBars[i].zOrder = -3;

        this.addChild({child: this.medalBars[i]});

        offset += this.proportions(4-i) * 235;

    }

    

    this.totalTimeBG = [];

    

    this.totalTimeBG.push(new cocos.nodes.Sprite({file: dir + 'sub-bg-0.png'}));

    this.totalTimeBG.push(new cocos.nodes.Sprite({file: dir + 'sub-bg-1.png'}));

    this.totalTimeBG.push(new cocos.nodes.Sprite({file: dir + 'sub-bg-2.png'}));

    this.totalTimeBG.push(new cocos.nodes.Sprite({file: dir + 'sub-bg-3.png'}));

    

    for(var i=0; i<4; i+=1) {

        this.totalTimeBG[i].position = new geo.Point(282, 31);

        this.totalTimeBG[i].anchorPoint = new geo.Point(0, 0);

        this.totalTimeBG[i].zOrder = -3;

    }

    

    this.addChild({child: this.totalTimeBG[0]});

    

    this.slider = new cocos.nodes.Sprite({file: dir + 'signEndScreenIndicator.png'});

    this.slider.position = new geo.Point(325, 288);

    this.addChild({child: this.slider});

    

    this.medals = []

    

    this.medals.push(new cocos.nodes.Sprite({file: '/resources/Medals/noMedal.png'}));

    this.medals.push(new cocos.nodes.Sprite({file: '/resources/Medals/bronzeMedal.png'}));

    this.medals.push(new cocos.nodes.Sprite({file: '/resources/Medals/silverMedal.png'}));

    this.medals.push(new cocos.nodes.Sprite({file: '/resources/Medals/goldMedal.png'}));

    this.medals[0].position = new geo.Point(670, 230);

    this.medals[1].position = new geo.Point(670, 230);

    this.medals[2].position = new geo.Point(670, 230);

    this.medals[3].position = new geo.Point(670, 230);

    

    this.addChild({child: this.medals[0]});

    

    // Front Pane /////////////////////////////////////////////////////////////////////////////////////////////////

    

    this.frontPane = new cocos.nodes.Sprite({file: dir + 'signEndScreenFront.png'});

    this.frontPane.anchorPoint = new geo.Point(0, 0);

    this.frontPane.zOrder = -1;

    this.addChild(this.frontPane);

    

    // On Top /////////////////////////////////////////////////////////////////////////////////////////////////////

    

    this.buildLabel('elapsedMin',   438, 174, '0',   '18', '#000000');

    this.buildLabel('elapsedSec',   535, 174, '0.0', '18', '#000000');

    this.buildLabel('penaltyCount', 120, 114, '0',   '18', '#000000');

    this.buildLabel('penaltyCost',  268, 114, '0',   '18', '#000000');

    this.buildLabel('penaltyMin',   427, 114, '0',   '18', '#000000');

    this.buildLabel('penaltySec',   524, 114, '0.0', '18', '#000000');

    this.bldLStroke('totalMin',     360, 58,  '0',   '26', '#FFFFFF');

    this.bldLStroke('totalSec',     510, 58,  '0.0', '26', '#FFFFFF');

    

    this.fix(this.penaltyCost, RC.penaltyTime, 1);

    

    this.eml = 0;

    this.esl = 0;

    this.pnl = 0;

    this.pcl = 0;

    this.pml = 0;

    this.psl = 0;

    this.tml = 0;

    this.tsl = 0;

    

    this.scheduleUpdate();

}



EndOfGameDisplay.inherit(GuiNode, {

    elapsedMin      : null,     // Text label for the elapsed number of minutes

    elapsedSec      : null,     // Text label for the elapsed number of seconds

    penaltyCount    : null,     // Text label for number of errors

    penaltyCost     : null,     // Text label for penalty per error

    penaltyMin      : null,     // Text label for the minutes of penalty time

    penaltySec      : null,     // Text label for the seconds of penalty time

    totalMin        : null,     // Text label for total number of minutes

    totalSec        : null,     // Text label for total number of seconds

    

    eml             : 0,        // Link for elapsed minutes

    esl             : 0,        // Link for elapsed seconds

    pnl             : 0,        // Link for penalty count

    pcl             : 0,        // Link for penalty cost

    pml             : 0,        // Link for penalty minutes

    psl             : 0,        // Link for penalty seconds

    tml             : 0,        // Link for total minutes

    tsl             : 0,        // Link for total seconds

    

    step            : 0,        // Current animation step

    state           : 0,

    

    timeAmt         : 0.0,      // Elapsed time to display

    numPenalty      : 0,        // Number of penalties incurred

    abort           : false,    // Abort state of the game

    

    sliderX         : 325,      // X location of the slider on the medal line



    // Helper function to build labels

    buildLabel: function(n, x, y, s, fs, fc) {

        var temp = new cocos.nodes.Label({string: s, fontName: RC.font, fontSize: fs, fontColor: fc});

        temp.anchorPoint = new geo.Point(1, 0);

        temp.position = new geo.Point(x, y);

        this.addChild({child: temp});

        this[n] = temp;

    },

    

    bldLStroke: function(n, x, y, s, fs, fc) {

        var temp = new LabelStroke({string: s, fontName: RC.font, fontSize: fs, fontColor: fc});

        temp.anchorPoint = new geo.Point(1, 0);

        temp.position = new geo.Point(x, y);

        this.addChild({child: temp});

        this[n] = temp;

    },

    

    // Called every frame

    update: function(dt) {

        if(this.esl > 59.94) {

            this.eml += 1;

            this.esl -= 60;

        }

        

        if(this.psl > 59.94) {

            this.pml += 1;

            this.psl -= 60;

        }

        

        if(this.tsl > 59.94) {

            this.tml += 1;

            this.tsl -= 60;

        }

        

        this.fix(this.elapsedSec, this.esl, 1);

        this.fix(this.penaltySec, this.psl, 1);

        this.fix(this.totalSec, this.tsl, 1);

        

        this.fix(this.elapsedMin, this.eml, 0);

        this.fix(this.penaltyCount, this.pnl, 0);

        this.fix(this.penaltyMin, this.pml, 0);

        this.fix(this.totalMin, this.tml, 0);

        

        this.slider.position = new geo.Point(this.sliderX, 288);

        

        // Show medal based on current slider progress

        if(this.state == 0 && this.sliderX > this.medalBars[1].position.x) {

            // Log that the first threshold has was passed

            this.state = 1;

            

            // Remove no medal, display bronze

            this.removeChild({child: this.totalTimeBG[0]});

            this.addChild({child: this.totalTimeBG[1]});

            this.removeChild({child: this.medals[0]});

            this.addChild({child: this.medals[1]});

            

            // Change total time to black stroke color for better visibility

            this.totalSec.fontColor = '#000000';

            this.totalMin.fontColor = '#000000';

        }

        else if(this.state == 1 && this.sliderX > this.medalBars[2].position.x) {

            // Log that second threshold was passed

            this.state = 2;

            

            // Remove bronze, display silver

            this.removeChild({child: this.totalTimeBG[1]});

            this.addChild({child: this.totalTimeBG[2]});

            this.removeChild({child: this.medals[1]});

            this.addChild({child: this.medals[2]});

        }

        else if(this.state == 2 && this.sliderX > this.medalBars[3].position.x) {

            // Log that the final threshold was passed

            this.state = 3;

            

            // Remove silver, display gold

            this.removeChild({child: this.totalTimeBG[2]});

            this.addChild({child: this.totalTimeBG[3]});

            this.removeChild({child: this.medals[2]});

            this.addChild({child: this.medals[3]});

        }

    },

    

    // Keeps the label's string value fixed to the specified precision

    fix: function(l, v, p) {

        f = parseFloat(v);

        l.string = f.toFixed(p);

        l._updateLabelContentSize();

    },

    

    // Start the animation sequence

    start: function() {

        events.addListener(this, 'actionComplete', this.next.bind(this));

        this.next();

    },

    

    // Begins the next step in the animation process

    next: function() {

        if(this.step == 0) {

            this.totalLabelUp('esl', this.timeAmt, 1.5);

        }

        

        else if(this.step == 1) {

            if(this.numPenalty > 0) {

                this.totalLabelUp('psl', this.numPenalty * RC.penaltyTime, 1.5);

                this.totalLabelUp('pnl', this.numPenalty, 1.5);

            }

            else {

                this.step += 2;

                this.next();

                return;

            }

        }

        // Next step = step+2 because each totalLabelUp() increments step on completion

        else if(this.step == 3) {

            this.totalTime = this.timeAmt + this.numPenalty * RC.penaltyTime;

            this.totalLabelUp('tsl', this.totalTime, 2.5);

            

            var x;

            if(this.abort)

                x = 0;

            else

                x = 235 * (1 - (this.totalTime - RC.times[0]) / (RC.times[4] - RC.times[0]));

                

            x = Math.max(0, x);

            

            var m = new MOT(this.sliderX, x, 2.5);

            m.bind(this, 'sliderX');

        }

        

        else if(this.step == 4) {

            //Signals "Retry" and "Next Level" buttons to appear

            events.trigger(this, 'almostComplete');

            

            var that = this;

            setTimeout(function() {

                events.trigger(that, 'actionComplete');

            }, 4000);

        }

        

        else if(this.step == 5) {

            events.trigger(this, 'complete');

        }

        

        this.step += 1;

    },

    

    // Helper function that gives area percentage for medal time ranges

    proportions: function (i) {

        return (RC.times[i] - RC.times[i - 1]) / (RC.times[4] - RC.times[0]);

    }

});

//<div class="cocos2d-app"> <script src="racecar/init.js" type="text/javascript""></script>

module.exports = EndOfGameDisplay;
}, mimetype: "application/javascript", remote: false}; // END: /EndOfGameDisplay.js


__jah__.resources["/FractionRenderer.js"] = {data: function (exports, require, module, __filename, __dirname) {
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

var cocos = require('cocos2d');
var geom = require('geometry');
var util = require('util');

// TODO: Subclass this off a Value/Expression class or have it pulled in when needed by such a class
function FractionRenderer (opts) {
    FractionRenderer.superclass.constructor.call(this);
    
    //Set properties from the option object
    var i = -1;
    while(++i < FractionRenderer.params.length) {
        if (opts[FractionRenderer.params[i]]) {
            this[FractionRenderer.params[i]] = opts[FractionRenderer.params[i]];
        }
    }
    
    this.bgShow = true;
    if(opts.hasOwnProperty('bgShow')) {
        if(!opts['bgShow'] || opts['bgShow'] == "false") {
            this.bgShow = false;
        }
    }
    
    // Create the numerical labels for the numerator and denominator
    var opts = Object();
    opts['string'] = this.numerator;
    opts['fontName'] = this.fontName;
    opts['fontColor'] = this.fontColor;
    opts['fontSize'] = this.fontSize;
    
    this.n = new cocos.nodes.Label(opts);
    this.n.anchorPoint = new geom.Point(0.5, 0.5);
    this.addChild({child: this.n});
    
    opts['string'] = this.denominator;
    this.d = new cocos.nodes.Label(opts);
    this.d.anchorPoint = new geom.Point(0.5, 0.5);
    this.addChild({child: this.d});
    
    // Figuring out combined content size
    var v = this.n.contentSize.height / 2 + this.d.contentSize.height / 2 + 36;
    var h = Math.max(this.n.contentSize.width, this.d.contentSize.width) + 10;
    
    // Regular fraction defaults
    if(this.whole == null) {
        //TODO: Position based on font size instead of magic number
        this.n.position = new geom.Point(0, 12);
        this.d.position = new geom.Point(0, -12);
        
        this.contentSize = new geom.Size(h, v);
        
        this.strRep = this.numerator + ' / ' + this.denominator;
    }
    // Account for the inclusion of a mixed number
    else {
        opts["string"] = this.whole;
        opts["fontSize"] *= 2;
        
        this.w = new cocos.nodes.Label(opts);
        this.addChild({child: this.w});
        
        this.n.anchorPoint = new geom.Point(1, 0.5);
        this.n.position = new geom.Point(h / 2 + 2, 15);
        
        this.d.anchorPoint = new geom.Point(1, 0.5);
        this.d.position = new geom.Point(h / 2 + 2, -15);
        
        this.w.anchorPoint = new geom.Point(0, 0.5);
        this.w.position = new geom.Point(h / -2 - 2, 0);
        
        h += this.w.contentSize.width;
        
        this.contentSize = new geom.Size(h, v);
        
        this.strRep = this.whole + ' ' + this.numerator + ' / ' + this.denominator;
    }
}

FractionRenderer.inherit(cocos.nodes.Node, {
    numerator   : 1,            // The numerator of the fraction
    denominator : 2,            // The denominator of the fraction
    whole       : null,         // The mixed number component of the fraction
    bgColor     : '#fff',       // Color of the background rectangle
    fontColor   : '#000',       // Color of the numerator and denominator (TODO: Seperate for numerator/denominator?)
    fontSize    : '16',         // Size of the numerator and denominator text
    fontName    : 'Helvetica',  // Font of the numerator and denominator
    lineColor   : '#a22',       // Color of the fraction bar between the numerator and denominator
    
    strRep      : '',           // String representation of content

    // Draw the background and the horizontal fraction bar
    draw: function(context) {
        var size = this.contentSize;
    
        if(this.bgShow) {
            context.fillStyle = this.bgColor;
            context.beginPath();
            context.moveTo(size.width /  2, size.height /  2);
            context.lineTo(size.width /  2, size.height / -2);
            context.lineTo(size.width / -2, size.height / -2);
            context.lineTo(size.width / -2, size.height /  2);
            context.closePath();
            context.fill();
        }
        
        context.strokeStyle = this.lineColor;
        context.beginPath();
        if(this.whole == null) {
            context.moveTo(size.width / -3, 0);
            context.lineTo(size.width /  3, 0);
        }
        // Account for offset due to mixed number presence
        else {
            context.moveTo(2                 , 0);
            context.lineTo(size.width / 2 - 2, 0);
        }
        context.closePath();
        context.stroke();
    },
    
    // With bindTo depreciated, a setter is needed to control multiple objects' opacity
    set opacityLink (val) {
        this.opacity = val;
        this.n.opacity = val;
        this.d.opacity = val;
        
        if(this.w) {
            this.w.opacity = val;
        }
    },
    
    get opacityLink () {
        return this.opacity;
    }
});

FractionRenderer.params = ['numerator','denominator','whole','bgColor','fontColor','seperatorColor','fontName','fontColor','fontSize']

module.exports = FractionRenderer
}, mimetype: "application/javascript", remote: false}; // END: /FractionRenderer.js


__jah__.resources["/ImageContent.js"] = {data: function (exports, require, module, __filename, __dirname) {
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



var cocos = require('cocos2d');

var events = require('events');



function ImageContent (opts) {

    ImageContent.superclass.constructor.call(this, opts);

    

    //Set properties from the option object

    var i = -1;

    while(++i < ImageContent.params.length) {

        if (opts[ImageContent.params[i]]) {

            this[ImageContent.params[i]] = opts[ImageContent.params[i]];

        }

    }

    

    this.uid = ImageContent.getUID();

    

    this.load();

}



ImageContent.inherit(cocos.nodes.Node, {

    uid     : null,

    scaleX  : null,

    scaleY  : null,

    src     : null,

    isLoaded: false,

    

    load: function() {

        var img = new Image()

        __jah__.resources[this.uid] = {url: this.src, path: this.uid};

        __jah__.resources[this.uid].data = img;

        ImageContent.toLoad++;

        

        img.onload = function () {

            ImageContent.toLoad--;

            __jah__.resources[this.uid].loaded = true;

            this.isLoaded = true;

            events.trigger(this, 'ImageLoaded');

            

            this.addChild({child: new cocos.nodes.Sprite({file: this.uid})});

        }.bind(this)

        

        img.onerror = function () {

            throw new Error('Failed to load resource: ' + this.uid + ' from ' + this.src);

        }.bind(this)

        

        img.src = this.src;

    }

});



ImageContent.params = ['scaleX','scaleY','src'];

ImageContent.idNum = 1;

ImageContent.toLoad = 0;



ImageContent.getUID = function() {

    return '/resources/__ImageContent_' + (++ImageContent.idNum);

}



module.exports = ImageContent
}, mimetype: "application/javascript", remote: false}; // END: /ImageContent.js


__jah__.resources["/Intermission.js"] = {data: function (exports, require, module, __filename, __dirname) {
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

var cocos = require('cocos2d');
var events = require('events');
var geom = require('geometry');

var PNode = require('/PerspectiveNode');

// Represents a single question to be answered by the player
// TODO: Build with an options object to allow easier initialization when customizing away from default values
function Intermission (selector, z) {
    Intermission.superclass.constructor.call(this, {xCoordinate:0, zCoordinate: z});
    
    // Initialize all variables
    this.selector = selector;
    
    // Schedule the per frame update
    this.scheduleUpdate();
}
    
Intermission.inherit(PNode, {
    fired       : false,        // True if the intermission has already fired
    selector    : null,         // Selector to change to during the intermission
    
    // Manages question timing and movement
    update: function(dt) {
        if(PNode.cameraZ + 6 >= this.zCoordinate && !this.fired) {
            this.fired = true;
            events.trigger(this, 'changeSelector', this.selector, this.zCoordinate);
        }
        
        Intermission.superclass.update.call(this, dt);
    },
});

// TODO: Write static helper for building an options object to initialize a question

module.exports = Intermission
}, mimetype: "application/javascript", remote: false}; // END: /Intermission.js


__jah__.resources["/KeyboardLayer.js"] = {data: function (exports, require, module, __filename, __dirname) {
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
    
// Handles reading keyboard input, allows us to ignore "Key Repeat" settings as the key is either down, or up
function KeyboardLayer() {
    // You must always call the super class version of init
    KeyboardLayer.superclass.constructor.call(this);
    
    // Enables detecting keypresses
    this.isKeyboardEnabled = true;
    
    // Build the array to hold keyboard state
    this.keys = Array(256);
    var i = 0;
    while(i < 256) {
        this.keys[i++] = 0;
    }
}

KeyboardLayer.inherit(cocos.nodes.Layer, {
    anyKey      : false,// true if any key has been pressed since the last time it was checked
    keys        : null, // Holds the array of key statuses
    bindings    : {},   // Holds the application specific bindings

    // Sets key to true when pressed
    keyDown: function(evt) {
        this.anyKey = true;
        this.keys[evt.keyCode] = KeyboardLayer.PRESS;
    },
    
    // Sets key to false when no longer pressed
    keyUp: function(evt) {
        this.keys[evt.keyCode] = KeyboardLayer.RELEASE;
    },
    
    // Check to see if a valid key is pressed
    // Returns: false is the key was invalid or not pressed
    //          0 if the key has not been pressed
    //          1 if it was released since last checked
    //          2 if this is the first time we are detecting the press
    //          3 if we have detected this press previously
    checkKey: function(keyCode) {
        if(keyCode > -1 && keyCode < 256) {
            var ret = this.keys[keyCode];
            
            // Lets us know if we have polled this key before and the user has not let it back up
            if(ret == KeyboardLayer.PRESS) {
                this.keys[keyCode] = KeyboardLayer.HOLD;
            }
            else if(ret == KeyboardLayer.RELEASE) {
                this.keys[keyCode] = KeyboardLayer.UP;
            }
            
            return ret;
        }
        
        return false;
    },
    
    // As checkKey but does not update the state of the key
    silentCheckKey: function(keyCode) {
        if(keyCode > -1 && keyCode < 256) {
            return this.keys[keyCode];
        }
        
        return false;
    },
    
    // Checks to see if any key has been pressed since it was last checked
    checkAnyKey: function() {
        if(this.anyKey) {
            this.anyKey = false;
            return true;
        }
        return false;
    },
    
    // Adds a key to a binding, or create the binding if none exists
    addToBinding: function(bind, to) {
        if(!bind in this.bindings) {
            this.bindings[bind] = [to];
        }
        else {
            this.bindings[bind].push(to);
        }
        
        return true;
    },
    
    // Removes a key from a binding, returns false if bind or rm was not found
    removeFromBinding: function(bind, rm) {
        if(bind in this.bindings) {
            var i=0
            while(i<b[bind].length && this.bindings[bind][i] != rm) {
                i+=1;
            }
            
            if(i<b[bind].length && this.bindings[bind][i] == rm) {
                this.bindings[bind].splice(i, 1);
                return true;
            }
        }
        return false;
    },
    
    // Explicitly set a binding to a list of keys
    setBinding: function(bind, list) {
        this.bindings[bind] = list;
        return true;
    },
    
    // Clears all keys from a binding, returns false in bind was not in bindings
    clearBinding: function(bind, to) {
        if(bind in this.bindings) {
            delete this.bindings[bind];
            return true;
        }
        return false;
    },
    
    // Checks to see if any key in the binding is pressed and returns the highest state of any such button pressed
    checkBinding: function(bind) {
        var ret = KeyboardLayer.UP;
        
        if(bind in this.bindings) {
            for(var i = 0; i < this.bindings[bind].length; i += 1) {
                var temp = this.checkKey(this.bindings[bind][i]);
                if(temp > ret) {
                    ret = temp;
                }
            }
            
            return ret;
        }
    },
});

// Static constants
KeyboardLayer.RELEASE   = 1;   // Key was released this frame
KeyboardLayer.UP        = 0;    // Key is up and was not recently released
KeyboardLayer.PRESS     = 2;    // Key has just been pressed (KeyDown)
KeyboardLayer.HOLD      = 3;    // Key is down and not been released

module.exports = KeyboardLayer
}, mimetype: "application/javascript", remote: false}; // END: /KeyboardLayer.js


__jah__.resources["/LabelBG.js"] = {data: function (exports, require, module, __filename, __dirname) {
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



function LabelBG (opts) {

    // You must always call the super class version of init

    LabelBG.superclass.constructor.call(this, opts);

    

    this.strRep = opts['string'];

    opts['string']    = this.defaulter(opts, 'string',    '');

    opts['fontName']  = this.defaulter(opts, 'fontName',  'Helvetica');

    opts['fontColor'] = this.defaulter(opts, 'fontColor', '#000');

    opts['fontSize']  = this.defaulter(opts, 'fontSize',  '16');

    

    this.bgShow = true;

    if(opts.hasOwnProperty('bgShow')) {

        if(!opts['bgShow'] || opts['bgShow'] == "false") {

            this.bgShow = false;

        }

    }

    

    var label = new cocos.nodes.Label(opts)

    this.label = label;

    this.addChild({child: label});

    

    this.bgColor = this.defaulter(opts, 'bgColor', '#FFFFFF');



    this.contentSize = this.label.contentSize;

}

    

    

LabelBG.inherit(cocos.nodes.Node, {

    label  : null,      //The label that the class wraps

    bgColor: '#FFFFFF', //The color of the background that will be behind the label

    

    strRep : '',        // String representation of content

    

    // Draws the background for the label

    draw: function(context) {

        if(this.bgShow) {

            var size = this.contentSize;

            

            context.fillStyle = this.bgColor;

            context.fillRect(size.width * -0.6, size.height * -0.75, size.width * 1.2, size.height * 1.5);

        }

    },

    

    //TODO: Put into a utility script/class

    defaulter: function(obj, prop, def) {

        return obj.hasOwnProperty(prop) ? obj[prop] : def;

    },

    

    // With bindTo depreciated, a setter is needed to control multiple objects' opacity

    set opacityLink (val) {

        this.opacity = val;

        this.label.opacity = val;

    },

    

    get opacityLink () {

        return this.opacity;

    }

});



// Static helper function to build the creation options object

LabelBG.helper = function(String, FontColor, BgColor, FontSize, FontName) {

    return {

        string      : String,

        fontColor   : FontColor,

        bgColor     : BgColor,

        fontSize    : FontSize,

        fontName    : FontName

    };

}



LabelBG.identifier = 'String';



module.exports = LabelBG
}, mimetype: "application/javascript", remote: false}; // END: /LabelBG.js


__jah__.resources["/LabelFW.js"] = {data: function (exports, require, module, __filename, __dirname) {
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

function LabelFW (opts) {
    // You must always call the super class version of init
    LabelFW.superclass.constructor.call(this, opts);
    
    opts['fontName']  = this.defaulter(opts, 'fontName',  'Helvetica');
    opts['fontColor'] = this.defaulter(opts, 'fontColor', '#FFF');
    opts['fontSize']  = this.defaulter(opts, 'fontSize',  '16');
    
    this.numDigits = this.defaulter(opts, 'numDigits',  4);
    this.offset = this.defaulter(opts, 'offset',  18);
    this.labels = [];
    
    for(var i=0; i<this.numDigits; i+=1) {
        this.labels.push(new cocos.nodes.Label(opts));
        this.labels[i].position = new geo.Point(i * this.offset, 0);
        this.labels[i].anchorPoint = new geo.Point(0.5, 0.5);
        this.addChild({child: this.labels[i]});
    }
}
    
    
LabelFW.inherit(cocos.nodes.Node, {
    label  : null,      //The label that the class wraps
    bgColor: '#FFFFFF', //The color of the background that will be behind the label
    
    strRep : '',        // String representation of content
    
    setStr: function(str) {
        var l = str.length;
        if(l > this.numDigits) {
            return
        }
        
        for(var i = 1; i < l + 1; i += 1) {
            //HACK: Ethnocentric '7' and '9' auto sizing/centering is wrong
            if(this.labels[this.numDigits - i].string != '7' && str[l-i] == '7' ||
               this.labels[this.numDigits - i].string != '9' && str[l-i] == '9') {
                this.labels[this.numDigits - i].position.x += 1
            }
            else if(this.labels[this.numDigits - i].string == '7' && str[l-i] != '7' ||
                    this.labels[this.numDigits - i].string == '9' && str[l-i] != '9') {
                this.labels[this.numDigits - i].position.x -= 1
            }
            //ENDHACK
            
            this.labels[this.numDigits - i].string = str[l-i];
        }
        for(var i = 0; i < this.numDigits; i += 1) {
            this.labels[i]._updateLabelContentSize();
        }
    },
    
    //TODO: Put into a utility script/class
    defaulter: function(obj, prop, def) {
        return obj.hasOwnProperty(prop) ? obj[prop] : def;
    },
    
    // With bindTo depreciated, a setter is needed to control multiple objects' opacity
    //TODO: Switch over to a function, update MOTs to use function
    set opacityLink (val) {
        this.opacity = val;
        this.label.opacity = val;
    },
    
    get opacityLink () {
        return this.opacity;
    }
});

module.exports = LabelFW
}, mimetype: "application/javascript", remote: false}; // END: /LabelFW.js


__jah__.resources["/LabelStroke.js"] = {data: function (exports, require, module, __filename, __dirname) {
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

function LabelStroke (opts) {
    // You must always call the super class version of init
    LabelStroke.superclass.constructor.call(this, opts);
}

LabelStroke.inherit(cocos.nodes.Label, {
    draw: function (context) {
        if (FLIP_Y_AXIS) {
            context.save()

            // Flip Y axis
            context.scale(1, -1)
            context.translate(0, -this.fontSize)
        }


        context.strokeStyle = this.fontColor
        context.font = this.font
        context.textBaseline = 'top'
        if (context.strokeText) {
            context.strokeText(this.string, 0, 0)
        }

        if (FLIP_Y_AXIS) {
            context.restore()
        }
    },
});

module.exports = LabelStroke
}, mimetype: "application/javascript", remote: false}; // END: /LabelStroke.js


__jah__.resources["/Logger.js"] = {data: function (exports, require, module, __filename, __dirname) {
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



function Logger (){

    Logger.superclass.constructor.call(this);

    console.log('WARNING: Instantiating instance of static class Logger');

}



Logger.eventLog     = [];               // Array of logged events

Logger.alwaysLog    = {Timestamp: 0};   // Object of values to always be logged



// Logs an event, type is a string, data is an object with key-value pairs

Logger.log = function(type, data) {

    var log = '<' + type + ' ';

    for (prop in data) {

        if (data.hasOwnProperty(prop) && typeof data[prop] !== "function") {

            log += ' ' + prop + '="' + data[prop] + '"';

        }

    }

    for (prop in Logger.alwaysLog) {

        if (Logger.alwaysLog.hasOwnProperty(prop)) {

            log += ' ' + prop + '="' + Logger.alwaysLog[prop] + '"';

        }

    }

    log += '/>\n'

    

    Logger.eventLog.push(log);

};



// Increments the Logger's time by the supplied delta

Logger.incrementTime = function(dt) {

    Logger.alwaysLog.Timestamp = Math.round((Logger.alwaysLog.Timestamp + dt) * 1000) / 1000.0;

}



// Base toString method

Logger.toString = function() {

    return Logger.toStringConcat();

};



// Builds string with array.join method

Logger.toStringJoin = function() {

    var ret = '<Logger>\n';

    ret += Logger.eventLog.join("");

    ret += '</Logger>\n';

    

    return ret;

};

// Builds string with += concatination

Logger.toStringConcat = function() {

    var ret = '<Logger>\n';

    var i=0;

    while(i<Logger.eventLog.length) {

        ret += '    ' + Logger.eventLog[i];

        i+=1;

    }

    ret += '</Logger>\n';

    

    return ret;

}



module.exports = Logger;
}, mimetype: "application/javascript", remote: false}; // END: /Logger.js


__jah__.resources["/main.js"] = {data: function (exports, require, module, __filename, __dirname) {
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
    
    Games developed with this code must be released with CC-Attribution and use
    the splash screen image/animation located at www.yyy.com as the form of attrubtion.
*/

// Import the cocos2d module
var cocos = require('cocos2d');
var geo = require('geometry');
var events = require('events');
var remote = require('remote_resources');
var Texture2D = require('cocos2d').Texture2D;

// Project Imports
var AudioMixer = require('/AudioMixer');
var Background = require('/Background');
var Dashboard = require('/Dashboard');
var Intermission = require('/Intermission');
var KeyboardLayer = require('/KeyboardLayer');
var Player = require('/Player');
var PNode = require('/PerspectiveNode');
var PNodeA = require('/PerspectiveNodeAnim');
var Question = require('/Question');
var EOGD = require('/EndOfGameDisplay');
var PreloadScene = require('/PreloadScene');
var SplashScreen = require('/SplashScreen');

// Scripting System import and shortcuts
var RS = require('/ScriptingSystem-Racecar');
var ER = RS.eventRelay;

// Static Imports
var RC = require('/RaceControl');
var MOT = require('/ModifyOverTime');
var XML = require('/XML');
var Content = require('/Content');

// TODO: De-magic number these
/* Zorder
-10 Background
-5  Finish Line
-4  Trees
-1  Dashboard
0   Anything not mentioned
100 Question Delimiters
*/

// Create a new layer
// TODO: Clean up main, it is getting bloated
function FluencyApp () {
    // You must always call the super class version of init
    FluencyApp.superclass.constructor.call(this);
    
    Content.initialize();
    
    this.loadGame();
    this.isMouseEnabled = false; // mvy
}

FluencyApp.inherit(RS.RacecarScripting, {
    player      : null,     // Holds the player
    background  : null,     // Holds the the background object
    dash        : null,     // Holds the right hand side dashboard
    audioMixer  : null,     // AudioMixer for sound effects
    musicMixer  : null,     // AudioMixer for music
	
    questionList: [],       // List of all questions in the input
	interList	: [],		// Refenences to all intermissions
	roadList	: [],		// Refences to all items on the sid eof the road
    medalCars   : [],       // Contains the pace cars
    inters		: [],       // Holds the list of checkpoints
	
    gameID      : '',       // Unique ID for the game
    
    bgFade      : false,    // True when crossfading between bg tracks
    bgFast      : false,    // True when playing bg_fast, false when playing bg_slow
    
    lanePosX    : {2: [-3, 3], 3: [-3.8, 0, 3.8]},
    lane        : 1,
    
    endOfGameCallback : null,   // Holds the name of the window function to call back to at the end of the game
    
    velocityLock: false,    // Prevents turbo and (ac/de)celleration when true
    laneLock:[0, 0, 0],     // 0 prevents nothing, 1 prevents moving in, 2 prevents moving out, 3 prevents both
    
    revertableVelocity: 0,  // Holds the player velocity prior to a setVelocity Action which enables the revertVelocity Action
    
    skipSplash  : false,    // When true, skip the splash screen completely
    
    version     : 'v 3.1',    // Current version number

    // Begin Overhaul
    
    // Only things done once per GAME are done here
    loadGame: function() {
        // Explicitly enable audio
        AudioMixer.enabled = true;
        var dir = 'sound/'
        // Set up basic audio
        var AM = new AudioMixer();
        AM.loadSound('screech',      dir + 'CarScreech2');
        AM.loadSound('decel',        dir + 'SlowDown');
        AM.loadSound('accel',        dir + 'SpeedUp');
        AM.loadSound('turbo',        dir + 'Turboboost');
        AM.loadSound('start',        dir + 'EngineStart');
        AM.loadSound('hum',          dir + 'Engine Hum');
        AM.loadSound('correct',      dir + 'Correct v1');
        AM.loadSound('wrong',        dir + 'Incorrect v1');
        AM.loadSound('finish',       dir + 'FinishLine v1');
        AM.loadSound('intermission', dir + 'Numberchange v1');
        AM.loadSound('countdown',    dir + 'countdown');
        this.audioMixer = AM;
        
        var MM = new AudioMixer();
        MM.loadSound('bg_slow', dir + 'Racecar v3-2');
        MM.loadSound('bg_fast', dir + 'Racecar FAST v3-2');
        MM.loadSound('bg_open', dir + 'Racecar Opening Chord');
        this.musicMixer = MM;

        events.addListener(MM, 'crossFadeComplete', this.onCrossFadeComplete.bind(this));

        // Create key bindings
        this.setBinding('MOVE_LEFT',    [65, 37]);  // [A, ARROW_LEFT]
        this.setBinding('MOVE_RIGHT',   [68, 39]);  // [D, ARROW_RIGHT]
        this.setBinding('SPEED_UP',     [87, 38]);  // [W, ARROW_UP]
        this.setBinding('SPEED_DOWN',   [83, 40]);  // [S, ARROW_DOWN]
        this.setBinding('TURBO',        [32]);      // [SPACE]
        this.setBinding('ABORT',        [27]);      // [ESC]
        this.setBinding('SHOW_FPS',     [80]);      // [P]
        
        // Generate things to the side of the road
        var dir = '/resources/sidewalk_stuff/';
        this.roadSprites = [
            new cocos.nodes.Sprite({file: dir + 'sideWalkCrack01.png',}),
            new cocos.nodes.Sprite({file: dir + 'sideWalkCrack02.png',}),
            new cocos.nodes.Sprite({file: dir + 'tire.png',}),
            new cocos.nodes.Sprite({file: dir + 'tirePile01.png',}),
            new cocos.nodes.Sprite({file: dir + 'tirePile02.png',})
        ];
        
        var anim = [];
        var texture = new Texture2D({file: module.dirname + '/resources/sidewalk_stuff/trashCanSheet.png'});
        for(var i=0; i<18; i+=1) {
            anim.push(new cocos.SpriteFrame({texture: texture, rect: geo.rectMake(i*140, 0, 140, 200)}));
        }
        
        this.roadAnim = [new cocos.Animation({frames: anim, delay: 0.1})];
        
        // I declare this line the savior of jQuery, delivering the code from months of annoying interrupts
        window.$ = window.parent.$;
    
        // Static binds
        this.addMeHandler = this.addMeHandler.bind(this)
        this.answerQuestion = this.answerQuestion.bind(this)
        this.removeMeHandler = this.removeMeHandler.bind(this)
        
        this.scriptedBindings();
        
        // Until menu based loading is implemented
        this.getLevel();
        
        //HACK: Using $.browser for detection is bad (and can be spoofed)
        if(!$.browser.mozilla && !$.browser.msie) {
            RC.textOffset = 0.5
        }
    },
    
    // The GREAT DIVIDE
    
    // Initializes level specific variables to their defaults
    initializeValues: function() {
        this.player = null;
        this.dash = null;
        this.eogd = null;
        
        this.questionList= [];
		this.interList   = [];
		this.roadList    = [];
        this.medalCars   = [];
        this.inters		 = [];
		
        this.gameID      = '';
        
        this.bgFade      = false;
        this.bgFast      = false;
        
        this.lane        = 1;
        
        this.laneLock    = [0, 0, 0];
        this.velocityLock = false;
        
        this.revertableVelocity = 0;
        
        this.fpsToggle = false;
    },
    
    // Remove level specific objects
    removePrevGame: function() {
		this.finishLine.cleanup();
		
		this.removeHelper(this.questionList);
		this.removeHelper(this.medalCars);
		this.removeHelper(this.interList);
		this.removeHelper(this.roadList);
		
		this.clearObject(this.player);
        this.clearObject(this.dash);
        this.clearObject(this.eogd);
        this.clearObject(this.background);
        this.clearObject(this.finishLine);
        this.clearObject(this.xml);
        
        this.ss_reinitialize();
    },
	
	// Helper function to clean up arrays of objects
	removeHelper: function (arr) {
		for(var i=0; i<arr.length; i+=1) {
			this.removeChild({child: arr[i]});
			arr[i].cleanup();
			this.clearObject(arr[i]);
		}
	},
    
    // Helper function for clearing out objects at end of game
    clearObject: function(obj) {
        this.removeChild({child: obj});
        events.clearInstanceListeners(obj);
        obj = null;
    },
    
	// Gets the XML file of the level, either from text fields if present, otherwise from the server
    getLevel: function() {
        try {
            var dynScript = $('#dynScriptField');
            var dynLoad = $('#dynLoadField');
            
            // Clunky, but allows for both single (content) load and split (content/script) load cases
            if(dynLoad.length == 1) {
                if(dynScript.length == 1) {
                    this.xml = $.parseXML(dynScript.val());
                }
				
				this.loadLevel($.parseXML(dynLoad.val()));
            }
            // Otherwise get "command line" arguments from the div tag
            else {
                var app_div = $('#cocos_test_app');
                if(app_div) {
                    var xml_path = app_div.attr('data');
                    this.gameID = app_div.attr('gameid');
                    this.endOfGameCallback = app_div.attr('callback');
                }
                
                // Set up remote resources, default value allows for running 'locally'
                var that = this;
                $.get(xml_path ? xml_path : 'set002_scripting.xml', function(data) {
                    that.loadLevel(data);
                });
            }
        }
        catch (e) {
            console.log(e);
        }
    },
    
    // Things that need to be done once per LEVEL are done here
    loadLevel: function(data) {
        // Reset game wide values
        this.initializeValues();
        
        // Check for the data
        if(data == undefined) {
            throw new Error('No XML level data found to load.');
        }
        
        this.parseXML(data);
        
        this.preprocessingComplete();
    },
    
    // End Overhaul
    
    // Parses the level xml file
    parseXML: function(xmlDoc) {
        console.log(xmlDoc);
        
        RC.parseSpacing(xmlDoc);    // Parses question and checkpoint spacing
        
        // Parse and process questions
        RC.finishLine = this.parseProblemSet(xmlDoc) + RC.finishSpacing;
        RS.DistanceTrigger.relPoints['finish'] = RC.finishLine;
        
        RC.parseMedals(xmlDoc);     // Parse medal information
        RC.parseAudio(xmlDoc);      // Parse the audio information
        RC.parseSpeed(xmlDoc);      // Parse and set player speed values
        RC.parsePenalty(xmlDoc);    // Get the penalty time for incorrect answers
        
        RC.postParse();             // Calculate values derived from parsed xml
        
        if(!this.xml) {
            this.xml = xmlDoc;
        }
        
        // Prime the scripting system
        var node = $(this.xml).find('SCRIPTING');
        if(node) {
            this.xml = node;
        }
        
        this.audioHook = this.audioMixer;
    },
    
    // Parses the PROBLEM_SET
    parseProblemSet: function (xml) {
        var problemRoot = $(xml).find('PROBLEM_SET');
        var subsets = $(problemRoot).children('PROBLEM_SUBSET');
        var z = RC.initialSpacing;
        var once = true;
        
        for(var i=0; i<subsets.length; i+=1) {
            z = this.parseProblemSubset(subsets[i], z, once);
            once = false;
        }
        
        return z;
    },
    
    // Parses a subset within the PROBLEM_SET
    parseProblemSubset: function (subset, z, once) {
        
        var interContent = Content.buildFrom($(subset).children('TARGET')[0]);
        interContent.scale = 2;
        
        // Not the first subset
        if(!once) {
            z += RC.intermissionSpacing;
            
            // Gets the intermission value
            var inter = new Intermission(interContent, z);
            events.addListener(inter, 'changeSelector', this.startIntermission.bind(this));
            inter.idle();
			
            // Append the intermission to the list of intermissions
			this.inters.push(z);
            RS.DistanceTrigger.relPoints['checkpoint'].push(z)
			this.interList.push(inter);
			
			// Add checkpoint marker to the race track
			var opts = {
				maxScale    : 1.00,
				alignH      : 0.5,
				alignV      : 0,
				visibility  : 1,
				xCoordinate : 0,
				zCoordinate : z,
				dropoffDist : -10,
			}
			opts['content'] = new cocos.nodes.Sprite({file: '/resources/checkPoint.png',});
			opts['content'].scaleX = 1.5;
			
			var fl = new PNode(opts);
			events.addListener(fl, 'addMe', this.addMeHandler);
			fl.idle();
			fl.zOrder = -5;
        }
        else {
            this.startSelector = interContent;
        }
        
        // Interate over questions in subset
        var list = this.questionList;
        var problems = $(subset).children('QUESTION');
        for(var i=0; i<problems.length; i+=1) {
            z += RC.questionSpacing;

            // Create a question
            list[list.length] = new Question(problems[i], z);
            events.addListener(list[list.length - 1], 'questionTimeExpired', this.answerQuestion);
            events.addListener(list[list.length - 1], 'addMe', this.addMeHandler);
            list[list.length - 1].idle();
            RS.DistanceTrigger.relPoints['question'].push(z)
        }
        
        return z;
    },
    
    // The 'real init()' called after all the preloading/parsing is completed
    preprocessingComplete: function () {
        // Create player
        this.player = new Player();
        this.player.xCoordinate = this.lanePosX[RC.curNumLanes][1];
        this.player.updatePosition();
        this.addChild({child: this.player});
        
        // Create dashboard
        var dash = new Dashboard(this.inters);
        dash.position = new geo.Point(0, 0);
        this.dash = dash;
        
        // Add the left hand side dash
        dash.maxSpeed = this.player.maxSpeed;
        this.addChild({child: dash});
        dash.zOrder = -1;
        
        // Draw background
        var bg = new Background();
        bg.zOrder = -10;
        this.background = bg;
        this.addChild({child: bg});
        
        events.addListener(this.player, 'IntermissionComplete', this.unpause.bind(this));
        
        // Create finish line
        var opts = {
            maxScale    : 1.00,
            alignH      : 0.5,
            alignV      : 0,
            visibility  : 1,
            xCoordinate : 0,
            zCoordinate : RC.finishLine,
            dropoffDist : -10,
        }
        opts['content'] = new cocos.nodes.Sprite({file: '/resources/finishline.png',});
        opts['content'].scaleX = 1.5;
        
        this.finishLine = new PNode(opts);
        events.addListener(this.finishLine, 'addMe', this.addMeHandler);
        this.finishLine.idle();
        this.finishLine.zOrder = -5;
        
        // Add version number
        var vtag = new cocos.nodes.Label({string: this.version})
        vtag.anchorPoint = new geo.Point(0.5, 0.5);
        vtag.position = new geo.Point(850, 590);
        this.addChild({child: vtag});
        
        // Create FPS meter
        var fps = new cocos.nodes.Label({string: '0 FPS'})
        fps.position = new geo.Point(20, 580);
        this.fps = fps;
        this.fpsTracker = [30, 30, 30, 30, 30];
        this.fpsToggle = false;
        
        // Add sprites to the roadsides
        this.populateRoadSide(1);
        this.populateRoadSide(-1);
        
        // Ghost cars representing medal cutoffs
        // TODO: Make seperate class, support lines in addition to cars
        this.medalCars = [];
        var names = ['Gold', 'Silver', 'Bronze']
        var hacks = ['goldZ', 'silverZ', 'bronzeZ']
        for(var i=0; i<3; i+= 1) {
            opts['content'] = new cocos.nodes.Sprite({file: '/resources/Cars/car'+names[i]+'01.png'});
            this.medalCars[i] = new PNode(opts)
            this.medalCars[i].zVelocity = RC.finishLine / RC.times[i+1];
            
            events.addListener(this.medalCars[i], 'addMe', this.addMeHandler);
            events.addListener(this.medalCars[i], 'removeMe', this.removeMeHandler);
            this.medalCars[i].delOnDrop = false;
            
            //HACK: Should be a cleaner way of doing this instead of a straight bypass
            this.medalCars[i].dash    = this.dash;
            this.medalCars[i].dashStr = hacks[i];
            //ENDHACK
        }
        
        if(!this.skipSplash) {
            this.splash = new SplashScreen(['/resources/splash.png']);
            events.addListener(this.splash, 'splashScreensCompleted', this.splashCallback.bind(this));;
            this.splash.zOrder = 110;
            this.addChild({child: this.splash});
            this.splash.start();
        }
        else {
            this.createStartButton();
			this.menu.addChild({child: this.startButton});
//             this.createLeftRightButtons(); // mvy
// 			this.menu.addChild({child: this.leftButton}); // mvy
// 			this.menu.addChild({child: this.rightButton}); // mvy
//             this.createBreakAccelerateButtons(); // mvy
// 			this.menu.addChild({child: this.breakButton}); // mvy
// 			this.menu.addChild({child: this.accelerateButton}); // mvy
            
            var that = this;
            setTimeout(function() {
                that.loadScriptingXML(that.xml);
                that.dash._updateLabelContentSize();
            }, 40);
        }
    },
    
    // Places sprites on either right side of road (inverter = 1) or left (inverter = -1)
    populateRoadSide: function(inverter) {
        var choice = 0;
        var p;
        for(var t=5; t<RC.finishLine + 100; t += Math.ceil(Math.random()*6 + 4)) {
            if(Math.random() < 0.5) {
                choice = Math.floor(Math.random() * (this.roadSprites.length + this.roadAnim.length));
                if(choice < 5) {
                    p = new PNode({xCoordinate: (inverter * 10) * Math.random() + (inverter * 6), zCoordinate: t, content: this.roadSprites[choice], alignH: 0.5, alignV: 0.5})
                }
                else {
                    p = new PNodeA({xCoordinate: (inverter * 10) * Math.random() + (inverter * 6), zCoordinate: t, content: new cocos.nodes.Sprite(), alignH: 0.5, alignV: 0.5})
                    p.prepareAnimation(new cocos.actions.Animate({animation: this.roadAnim[choice - this.roadSprites.length]}));
                }
                p.zOrder = -4;
                events.addListener(p, 'addMe', this.addMeHandler);
                p.idle();
				this.roadList.push(p);
            }
        }
    },
    
    // Callback for when the splash screen if finished
    splashCallback: function() {
        this.buildMenu();
        this.musicMixer.setMasterVolume(0.35);
        this.ss_audioHook = this.musicMixer;
        this.loadScriptingXML(this.xml);
        this.dash._updateLabelContentSize();
    },
    
    // Three second countdown before the game begins (after pressing the start button on the menu layer)
    countdown: function () {
        this.removeStartButton();
        
        var opts = {
            maxScale    : 1.00,
            alignH      : 0.5,
            alignV      : 0,
            visibility  : 1,
            xCoordinate : 4.5,
            zCoordinate : 0,
            dropoffDist : -10,
            delOnDrop   : false,
        }
        
        this.player.dash = this.dash;
        
        // Set audio levels
        this.audioMixer.setTrackVolume('accel', 0.8)
        this.audioMixer.setTrackVolume('screech', 0.5)
        
        this.audioMixer.playSound('countdown');
        
        setTimeout(this.startGame.bind(this), RC.initialCountdown);
        
        var cd = new cocos.nodes.Label({string: '3', textColor: '#000000', fontName: RC.font});
        cd.scaleX = 10;
        cd.scaleY = 10;
        cd.position = new geo.Point(450, 300);
        
        this.cdt = cd;
        this.addChild({child: cd});
        
        // Set the starting value on the player's car
        this.player.changeSelectorByForce(this.startSelector);
        
        var that = this;
        setTimeout(function () { that.cdt.string = '2'; }, 750);
        setTimeout(function () {
            that.cdt.string = '1';
            that.cdt._updateLabelContentSize();
        }, 1500);
        setTimeout(function () {
            that.cdt.string = 'GO!';
            that.cdt._updateLabelContentSize();
        }, 2250);
        setTimeout(function () { that.removeChild(that.cdt); }, 2750);
        
        this.audioMixer.playSound('start');
        this.audioMixer.loopSound('hum');
        
        // Catch window unloads at this point as aborts
        $(window).unbind('unload')
        $(window).unload(this.endOfGame.bind(this, null));
    },
    
    // Starts the game
    startGame: function () {
        cocos.Director.sharedDirector.swallowKeys = true;
    
        var p = this.player;
        p.scheduleUpdate();             // Start the player
        this.dash.start();              // Start timer and dash updates
        
        // Accelerate the player to their default speed after starting
        p.zVelocity = 0;
        (new MOT(0, p.zVelocity, 0.2)).bind(p, 'zVelocity');
        
        this.medalCars[0].scheduleUpdate();
        this.addChild({child: this.medalCars[0]});
        this.medalCars[1].scheduleUpdate();
        this.addChild({child: this.medalCars[1]});
        this.medalCars[2].scheduleUpdate();
        this.addChild({child: this.medalCars[2]});
        
        // Start background music
        this.musicMixer.loopSound('bg_slow');
        this.musicMixer.playSound('bg_open');
        this.musicMixer.setTrackVolume('bg_fast', 0);
        this.musicMixer.loopSound('bg_fast');
        
        // Start the ScriptingSystem's game timer
        this.ss_started = true;
    },
    
    // Function that allows the Scripting System to remove the standard start button
    removeStartButton: function() {
        this.menu.removeChild({child: this.startButton});
    },
    
    startIntermission: function(newVal, location) {
        this.player.startIntermission(newVal, location);
        this.pause();
    },
    
	// Pauses the dashboard and medal cars
    pause: function () {
        this.dash.pauseTimer();
        
        this.audioMixer.playSound('intermission');
        
        var mc = this.medalCars;
        
        for(var i=0; i<3; i+=1) {
            mc[i].prepause = mc[i].zVelocity;
            mc[i].zVelocity = 0;
        }
    },
    
	// Unpauses the dashboard and medal cars
    unpause: function () {
        this.dash.unpauseTimer();
        
        var mc = this.medalCars;
        
        for(var i=0; i<3; i+=1) {
            mc[i].zVelocity = mc[i].prepause;
            mc[i].prepause = 0;
        }
    },
    
    // Handles add requests from PerspectiveNodes
    // STATIC BIND
    //TODO: Make a PerspectiveView class to handle these functions?
    addMeHandler: function (toAdd) {
        this.addChild({child: toAdd});
        events.addListener(toAdd, 'removeMe', this.removeMeHandler);
    },
    
    // Handles removal requests from PerspectiveNodes
    // STATIC BIND
    removeMeHandler: function (toRemove) {
        this.removeChild(toRemove);
    },
    
    // Callback let the main program know when a cross fade has completed
    onCrossFadeComplete: function () {
        this.bgFade = false;
    },
    
    // Called when game ends, should collect results, display them to the screen and output the result XML
    // finished = null on window.unload, false on abort, true on completion
    endOfGame: function(finished) {
        cocos.Director.sharedDirector.swallowKeys = false;
    
        if(finished != null) {
            $(window).unbind('unload')
            $(window).unload(this.cleanup.bind(this));
        }
        else {
            this.cleanup();
        }
        
        // Fade out background music tracks at the end of the game
        var s;
        
        s = this.musicMixer.getSound('bg_fast');
        if(s) {
            (new MOT(s.volume, -1, 2)).bindFunc(s, s.setVolume);
        }
        
        s = this.musicMixer.getSound('bg_slow');
        if(s) {
            (new MOT(s.volume, -1, 2)).bindFunc(s, s.setVolume);
        }
        
        // Stop the ambient engine hum from looping and play the finish sound
        this.audioMixer.stopSound('hum');
        this.audioMixer.playSound('finish');
    
        // Stop the player from moving further and the dash from increasing the elapsed time
        cocos.Scheduler.sharedScheduler.unscheduleUpdateForTarget(this.player);
        cocos.Scheduler.sharedScheduler.unscheduleUpdateForTarget(this.dash);
        //this.dash.pauseTimer();
        
        this.player.newSelector = null;
        this.player.changeSelector(null);
        
        // Stops the medal pace cars
        this.medalCars[0].zVelocity = 0;
        this.medalCars[1].zVelocity = 0;
        this.medalCars[2].zVelocity = 0;
    
        var ql = this.questionList;
        var i = 0, correct = 0, incorrect = 0, unanswered = 0;
        
        // Tally question results
        while(i < ql.length) {
            if(ql[i].answeredCorrectly) {
                correct += 1;
            }
            else if(ql[i].answeredCorrectly == false) {
                incorrect += 1;
            }
            else {
                unanswered += 1;
            }
            
            i += 1;
        }
        
        // Checks to see if abort was related to window.unload
        if(finished != null) {
            var e = new EOGD(this.dash.elapsedTime, incorrect + unanswered, !finished);
            e.position = new geo.Point(50, 150);
            this.addChild({child: e});
            var that = this;
            events.addListener(e, 'almostComplete', this.addRetryButton.bind(this));
            this.eogd = e;
            e.start();
        }
        
        // Prepare the output
        var xmlOut;
        if(finished) {
            xmlOut = this.writeXML(correct, 'FINISH');
        }
        else {
            xmlOut = this.writeXML(correct, 'ABORT');
        }
        
        // If the 'command line' specified a call back, feed the callback the xml
        if(this.endOfGameCallback) {
            window[this.endOfGameCallback](xmlOut);
        }
        
        // Look for dynamic display field
        var dynDisp = $('#dynDispField');
        if(dynDisp.length == 1) {
            dynDisp.attr('value', xmlOut)
        }
    },

    // Writes the output xml file as a string and returns it
    //TODO: Decide on a new format if needed and update
    writeXML: function(correct, state) {
        // Get needed values
        var d = this.dash;
        var e = d.elapsedTime;
        var p = d.pCount * RC.penaltyTime;
        var m = ' - ';
        
        // Determine medal string
        if(state == 'FINISH') {
            if(e + p < RC.times[1])
                m = "Gold";
            else if(e + p < RC.times[2])
                m = "Silver";
            else if(e + p < RC.times[3])
                m = "Bronze";
        }
        
        // Convert times to milliseconds for reporting
        e = Math.round(e * 1000)
        p = Math.round(p * 1000)
        
        // Build the XML string
        var x =
        '<OUTPUT>\n' + 
        '    <GAME_REFERENCE_NUMBER ID="' + this.gameID + '"/>\n' + 
        '    <SCORE_SUMMARY>\n' + 
        '        <Score CorrectAnswers="' + correct + '" ElapsedTime="' + e + '" PenaltyTime="' + p + '" TotalScore="' + (e + p) + '" Medal="' + m + '"/>\n' + 
        '    </SCORE_SUMMARY>\n' +
        '    <SCORE_DETAILS>\n';
                var i = 0;
                var ql = this.questionList;
                while(i < ql.length) {
                x += '        <SCORE QuestionIndex="' + (i+1) +'" AnswerValue="' +  ql[i].correctAnswer + '" TimeTaken="'+ Math.round(ql[i].timeElapsed * 1000) + '" LaneChosen="' + ql[i].answer + '"/>\n';
                i += 1;
                }
            x += '    </SCORE_DETAILS>\n' + 
        '    <END_STATE STATE="' + state + '"/>\n' +
        '</OUTPUT>';
        
        return x;
    },
    
    // Code to be run when the game is finished
    cleanup: function() {
        // Clear the bind
        $(window).unbind('unload');
        
        cocos.Scheduler.sharedScheduler.unscheduleUpdateForTarget(this);
        
        var d = cocos.Director.sharedDirector;
        
        d.swallowKeys = false;
        
        // Stop the main loop and clear the scenes
        d.stopAnimation();
        delete d.sceneStack.pop();
        delete d.sceneStack.pop();
        
        // Clear the setup functions
        d.attachInView = null;
        d.runWithScene = null;
        
        // Clear the animating functions
        d.startAnimation = null;
        d.animate = null;
        d.drawScene = null;
        
        // Clear the instance
        d._instance = null;
    },
    
    // Handles answering the current question when time expires
    // STATIC BIND
    answerQuestion: function(question) {
        //HACK: Find a better place/way to do this
        RS.CorrectLaneTrigger.lastCorrect = question.correctAnswer;
        //ENDHACK
        var result = question.answerQuestion(this.lane);
        
        // Handle correct / incorrect feedback
        if(result) {
            this.audioMixer.playSound('correct', true);
            
            events.trigger(ER, 'answerQuestionTrigger', true);
        }
        else {
            var t = this.dash.elapsedTime + this.dash.pTime + parseFloat(RC.penaltyTime);
        
            this.player.wipeout(1);
            this.dash.modifyPenaltyCount();
            
            //this.audioMixer.playSound('wrong', true);
            this.audioMixer.playSound('screech', true);
            
            // Update medal car velocities to account for penalty time
            for(var i=0; i<3; i+=1) {
                var rd = RC.finishLine - this.medalCars[i].zCoordinate;
                var rt = RC.times[i+1] - t;
                
                if(rt > 0.1 && rd > 0) {
                    this.medalCars[i].zVelocity = rd / rt;
                }
                else if (rd > 0) {
                    this.medalCars[i].zVelocity = rd / 0.1;
                }
            }
            
            events.trigger(ER, 'answerQuestionTrigger', false);
        }
        
        this.player.endTurboBoost();
    },
    
    // Crude initial version of the mouse based movement
    //TODO: Ignore clicks near/on menu buttons
    mouseDown: function(evt) {
        if(this.ss_started) {
            // 'A' / 'LEFT' Move left, discreet
            if(evt.locationInCanvas.x < this.player.position.x) {
                if(this.lane > 0) {
                    this.moveLane(this.lane, this.lane-1);
                    this.player.xCoordinate = this.lanePosX[RC.curNumLanes][this.lane];
                    // this.audioMixer.playSound('accel', true); // mvy
                }
            }
            // 'D' / 'RIGHT' Move right, discreet
            else if(evt.locationInCanvas.x > this.position.x) {
                if(this.lane < RC.curNumLanes-1) {
                    this.moveLane(this.lane, this.lane+1);
                    this.player.xCoordinate = this.lanePosX[RC.curNumLanes][this.lane];
//                     this.audioMixer.playSound('accel', true); // mvy
                }
            }
        }
    },
    
    // Called every frame, manages keyboard input
    update: function(dt) {
        // Must call superclass.update for ScriptingSystem to function
        FluencyApp.superclass.update.call(this, dt);
        
        // Do not run the rest of update until the game has started
        if(!this.ss_started) {
            // Allow the player to fast foward through the splash screens
            if(this.splash && this.splash.isActive() && this.checkAnyKey()) {
                this.splash.skip();
            }
            
            return;
        }
        
        var player = this.player;
        
        // Update the skyline
        this.background.progress(player.zCoordinate / RC.finishLine);
        
        // Check if the race is finished
        if(player.zCoordinate > RC.finishLine && this.eogd == null) {
            this.endOfGame(true);
        }
        
    // Move the player according to keyboard
        // 'A' / 'LEFT' Move left, discreet
        if(this.checkBinding('MOVE_LEFT') == KeyboardLayer.PRESS) {
            if(this.lane > 0) {
                this.moveLane(this.lane, this.lane-1);
                player.xCoordinate = this.lanePosX[RC.curNumLanes][this.lane];
                this.audioMixer.playSound('accel', true);
            }
        }
        // 'D' / 'RIGHT' Move right, discreet
        else if(this.checkBinding('MOVE_RIGHT') == KeyboardLayer.PRESS) {
            if(this.lane < RC.curNumLanes-1) {
                this.moveLane(this.lane, this.lane+1);
                player.xCoordinate = this.lanePosX[RC.curNumLanes][this.lane];
                this.audioMixer.playSound('accel', true);
            }
        }
        
        var decel_lock = false;
        
        // 'S' / 'DOWN' Slow down, press
//         if(this.checkBinding('SPEED_DOWN') > KeyboardLayer.UP && !this.velocityLock) { // mvy
        if(this.doBreak && !this.velocityLock) { // mvy
            player.decelerate(dt);
            //this.audioMixer.loopSound('decel') //mvy
        
            // Cross fade tracks if needed and able
            if(this.bgFast && !this.bgFade && player.zVelocity < RC.crossFadeSpeed) {
                this.musicMixer.crossFade('bg_fast', 'bg_slow', 2);
                this.bgFast = false;
                this.bgFade = true;
            }
            
            // Prevents triggering both acceleration and deceleration
            decel_lock = true;
            this.doBreak = false; // mvy
        }
//         else
//             this.audioMixer.stopSound('decel'); // mvy
            
        // 'W' / 'UP' Speed up, press
//         if(!decel_lock && this.checkBinding('SPEED_UP') > KeyboardLayer.UP && !this.velocityLock) { // mvy
        if(!decel_lock && this.doAccelerate && !this.velocityLock) { // mvy
            player.accelerate(dt);
            //this.audioMixer.loopSound('accel') // mvy
            
            // Cross fade tracks if needed and able
            if(!this.bgFast && !this.bgFade && player.zVelocity > RC.crossFadeSpeed) {
                this.musicMixer.crossFade('bg_slow', 'bg_fast', 2);
                this.bgFast = true;
                this.bgFade = true;
            }
            this.doAccelerate = false; // mvy
        }
//         else
//             this.audioMixer.stopSound('accel'); // mvy
        
        // 'SPACE' turbo boost, discreet
        if(this.checkBinding('TURBO') == KeyboardLayer.PRESS && !this.velocityLock) {
            if(player.startTurboBoost())
                this.audioMixer.playSound('turbo', true);
        }
        
        // 'ESC' Abort game, discreet
        if(this.checkBinding('ABORT') == KeyboardLayer.PRESS) {
            this.endOfGame(false);
        }
        
        var sub = parseFloat(0);    // Zero the subtotal
        var cur = 1 / dt;           // Store the current frame's fps
        
        this.fpsTracker.shift();    // Get rid of oldest frame
        this.fpsTracker.push(cur);  // Add this frame
        
        // Log low FPS spikes to console if FPS tracker is enabled
        if(this.fpsToggle) {
            if(1 / dt < 10) {
                console.log('FPS Spike down frame ( ' + cur.toFixed(1) + ' FPS / ' + (dt*1000).toFixed(0) + ' ms dt )');
            }
        }
        
        // Smooth over multiple frames
        this.fps.fontColor = '#FFFFFF';
        for(t in this.fpsTracker){
            sub += this.fpsTracker[t];
            
            // Turn red on low framerate
            if(this.fpsTracker[t] < 20) {
                this.fps.fontColor = '#DD2222';
            }
        }
        
        // Update the FPS tracker label
        this.fps.string = (sub / this.fpsTracker.length).toFixed(1) + ' FPS';
        
        // 'P' Toggle showing FPS tracker, discreet
        if(this.checkBinding('SHOW_FPS') == KeyboardLayer.PRESS) {
            if(!this.fpsToggle) {
                this.addChild({child: this.fps});
                this.fpsToggle = true;
            }
            else {
                this.removeChild({child: this.fps});
                this.fpsToggle = false;
            }
        }
        
        // Update game specific, continually checked scripting Triggers
        RS.AbsoluteLaneTrigger.currentLane = this.lane;
        RS.DistanceTrigger.currentDistance = this.player.zCoordinate;
        RS.VelocityTrigger.currentVelocity = this.dash.getSpeed();      // dash.getSpeed() correctly accounts for pauses
    },
    
    // Resolve the requested lane movement against the laneLock array
    moveLane: function(from, to) {
        if(this.laneLock[from] == 2 || this.laneLock[from] == 3
        || this.laneLock[to] == 1   || this.laneLock[to] == 3) {
            return false;
        }
        
        if(!this.player.changeLane(to)) {
            return false;
        }
        
        this.lane = to;
        this.player.xCoordinate = this.lanePosX[RC.curNumLanes][to];
        return true;
    },

// Scripting Hookup Functions //////////////////////////////////////////////////////////////////////
    
    // Catch RacecarScripting Action events
    scriptedBindings: function() {
        events.addListener(ER, 'HideMedalCarEvent',         this.scriptedHideMedalCar.bind(this));
        events.addListener(ER, 'LockAbsoluteLaneEvent',     this.scriptedLockAbsoluteLane.bind(this));
        events.addListener(ER, 'LockVelocityEvent',         this.scriptedLockVelocity.bind(this));
        events.addListener(ER, 'RevertVelocityEvent',       this.scriptedRevertVelocity.bind(this));
        events.addListener(ER, 'SetAbsoluteLaneEvent',      this.scriptedSetAbsoluteLane.bind(this));
        events.addListener(ER, 'SetVelocityEvent',          this.scriptedSetVelocity.bind(this));
        events.addListener(ER, 'ShowMedalCarEvent',         this.scriptedShowMedalCar.bind(this));
        events.addListener(ER, 'StartTimerEvent',           this.scriptedStartTimer.bind(this));
        events.addListener(ER, 'StopTimerEvent',            this.scriptedStopTimer.bind(this));
        events.addListener(ER, 'UnlockAbsoluteLaneEvent',   this.scriptedUnlockAbsoluteLane.bind(this));
        events.addListener(ER, 'UnlockVelocityEvent',       this.scriptedUnlockVelocity.bind(this));
    },
    
    // Hides the specified medal car and associated minimap dot
    scriptedHideMedalCar: function(c) {
        this.removeChild({child: this.medalCars[c]});
        this.medalCars[c].disabled = true;
        this.dash.removeChild({child: this.dash.miniDots[c]});
    },
    
    // Enforces locking restrictions on the specified lane
    scriptedLockAbsoluteLane: function(l, d) {
        if(this.laneLock[l] == 0) {
            this.laneLock[l] = d;
        }
        else if(this.laneLock[l] != 3 && (this.laneLock[l] + d == 3 || d == 3)) {
            this.laneLock[l] = 3;
        }
    },
    
    // Prevents the player from changing velocity
    scriptedLockVelocity: function() {
        this.velocityLock = true;
    },
    
    // Sets the velocity to the value it was before the last set/revert velocity was called
    scriptedRevertVelocity: function() {
        var tmp = this.player.zVelocity;
        this.player.zVelocity = this.revertableVelocity;
        this.revertableVelocity = tmp;
    },
    
    // Forces the player into the specified lane
    scriptedSetAbsoluteLane: function(l) {
        this.lane = l;
        this.player.xCoordinate = this.lanePosX[RC.curNumLanes][this.lane];
    },
    
    // Sets the player's velocity to the specified value
    scriptedSetVelocity: function(v) {
        this.revertableVelocity = this.player.zVelocity;
        this.player.zVelocity = v;
    },
    
    // Shows the specified medal car and associated minimap dot
    scriptedShowMedalCar: function(c) {
        this.addChild({child: this.medalCars[c]});
        this.medalCars[c].disabled = true;
        this.dash.addChild({child: this.dash.miniDots[c]});
    },
    
    // Starts the game timer
    scriptedStartTimer: function() {
        this.dash.unpauseTimer();
        for(var i=0; i<3; i+=1) {
            this.medalCars[i].zVelocity = this.medalCars[i].prepause;
        }
    },
    
    // Stops the game timer
    scriptedStopTimer: function() {
        this.dash.pauseTimer();
        
        for(var i=0; i<3; i+=1) {
            this.medalCars[i].prepause = this.medalCars[i].zVelocity;
            this.medalCars[i].zVelocity = 0;
        }
    },
    
    // Allows the player to change velocity
    scriptedUnlockVelocity: function() {
        this.velocityLock = false;
    },
    
    // Lifts locking restriction for a specific lane
    scriptedUnlockAbsoluteLane: function(l, d) {
        if(this.laneLock[l] == 3)
            this.laneLock[l] -= d;
        else if(this.laneLock[l] != 0 && (this.laneLock[l] == d || d == 3)) {
            this.laneLock[l] = 0;
        }
    },

// Menu Related Functions //////////////////////////////////////////////////////////////////////////
    
    //Builds and displays the initial 'menu' of the start button and music/sfx mute/unmute buttons
    buildMenu: function() {
        this.createStartButton();
//         this.createLeftRightButtons(); // mvy
//         this.createBreakAccelerateButtons(); // mvy
    
        var dir = '/resources/Buttons/';
    
        // Create the button
        var opts = Object();
        
        // Create the volume control
        dir = '/resources/Dashboard/';
        // TODO: Make a better basic (toggle)button (extend MenuItemImage?)
        opts['normalImage']   = dir + 'dashBoardSoundOn.png';
        opts['selectedImage'] = dir + 'dashBoardSoundOn.png';
        opts['disabledImage'] = dir + 'dashBoardSoundOn.png';
        opts['callback'] = this.audioCallback.bind(this);
        
        var vc = new cocos.nodes.MenuItemImage(opts);
        vc.position = new geo.Point(-420, -240);
        this.volumeButtonOn = vc;
        
        opts['normalImage']   = dir + 'dashBoardMusicOn.png';
        opts['selectedImage'] = dir + 'dashBoardMusicOn.png';
        opts['disabledImage'] = dir + 'dashBoardMusicOn.png';
        opts['callback'] = this.musicCallback.bind(this);
        
        vc = new cocos.nodes.MenuItemImage(opts);
        vc.position = new geo.Point(-420, -275);
        this.musicButtonOn = vc;
        
        opts['normalImage']   = dir + 'dashBoardSoundOff.png';
        opts['selectedImage'] = dir + 'dashBoardSoundOff.png';
        opts['disabledImage'] = dir + 'dashBoardSoundOff.png';
        opts['callback'] = this.audioCallback.bind(this);
        
        vc = new cocos.nodes.MenuItemImage(opts);
        vc.position = new geo.Point(-420, -240);
        this.volumeButtonOff = vc;
        
        opts['normalImage']   = dir + 'dashBoardMusicOff.png';
        opts['selectedImage'] = dir + 'dashBoardMusicOff.png';
        opts['disabledImage'] = dir + 'dashBoardMusicOff.png';
        opts['callback'] = this.musicCallback.bind(this);
       
        vc = new cocos.nodes.MenuItemImage(opts);
        vc.position = new geo.Point(-420, -275);
        this.musicButtonOff = vc;
       
        <!-- mvy VVV -->
        opts['normalImage']   = dir + 'dashBoardSoundOn.png';
        opts['selectedImage'] = dir + 'dashBoardSoundOn.png';
        opts['disabledImage'] = dir + 'dashBoardSoundOn.png';
        opts['callback'] = this.audioCallback2.bind(this);
        var vc = new cocos.nodes.MenuItemImage(opts);
        vc.position = new geo.Point(-420, -205);
        this.volumeButton2On = vc;
        
        opts['normalImage']   = dir + 'dashBoardSoundOff.png';
        opts['selectedImage'] = dir + 'dashBoardSoundOff.png';
        opts['disabledImage'] = dir + 'dashBoardSoundOff.png';
        opts['callback'] = this.audioCallback2.bind(this);
        
        vc = new cocos.nodes.MenuItemImage(opts);
        vc.position = new geo.Point(-420, -205);
        this.volumeButton2Off = vc;
        
        // Steer Left
        var dir = '/resources/Buttons/buttonLeft';
        opts['normalImage']   = dir + 'Normal.png';
        opts['selectedImage'] = dir + 'Click.png';
        opts['disabledImage'] = dir + 'Normal.png';
        opts['callback'] = this.moveLeftCallback.bind(this);
        vc = new cocos.nodes.MenuItemImage(opts);
        vc.position = new geo.Point(-380, 0);
        this.leftButton = vc;
        
        // Steer Right
        var dir = '/resources/Buttons/buttonRight';
        opts['normalImage']   = dir + 'Normal.png';
        opts['selectedImage'] = dir + 'Click.png';
        opts['disabledImage'] = dir + 'Normal.png';
        opts['callback'] = this.moveRightCallback.bind(this);
        vc = new cocos.nodes.MenuItemImage(opts);
        vc.position = new geo.Point( 380, 0);
        this.rightButton = vc
        
        // Break
        var dir = '/resources/Buttons/buttonBreak';
        opts['normalImage']   = dir + 'Normal.png';
        opts['selectedImage'] = dir + 'Click.png';
        opts['disabledImage'] = dir + 'Normal.png';
        opts['callback'] = this.breakCallback.bind(this);
        vc = new cocos.nodes.MenuItemImage(opts);
        vc.position = new geo.Point( 380, -138);
        this.breakButton = vc
        this.doBreak = false;

		// Accelerate
        var dir = '/resources/Buttons/buttonAccelerate';
        opts['normalImage']   = dir + 'Normal.png';
        opts['selectedImage'] = dir + 'Click.png';
        opts['disabledImage'] = dir + 'Normal.png';
        opts['callback'] = this.accelerateCallback.bind(this);
        vc = new cocos.nodes.MenuItemImage(opts);
        vc.position = new geo.Point( -380,  138);
        this.accelerateButton = vc
        this.doAccelerate = false;
        // mvy ^^^ 
        
        this.menu = new cocos.nodes.Menu({items: [this.startButton, this.musicButtonOn, this.volumeButtonOn, this.volumeButton2On, this.leftButton, this.rightButton, this.breakButton, this.accelerateButton]}); // mvy 
        
        this.addChild({child: this.menu, z: 15});
    },
    
    // Displays the start button on the screen
    createStartButton: function() {
        var dir = '/resources/Buttons/buttonStart';
        var opts = Object();
        opts['normalImage']   = dir + 'Normal.png';
        opts['selectedImage'] = dir + 'Click.png';
        opts['disabledImage'] = dir + 'Normal.png';
        // We use this callback so we can do cleanup before handing everything over to the main game
        opts['callback'] = this.countdown.bind(this)
        
        this.startButton = new cocos.nodes.MenuItemImage(opts);
        this.startButton.position = new geo.Point(0, 0);
        this.startButton.scaleX = 0.5;
        this.startButton.scaleY = 0.5;
    },

	<!-- mvy VVV -->
    createBreakAccelerateButtons: function() {
        var dirB = '/resources/Buttons/buttonBreak';
        var dirA = '/resources/Buttons/buttonAccelerate';
        var optsB = Object();
        var optsA = Object();
        optsB['normalImage']   = dirB + 'Normal.png';
        optsB['selectedImage'] = dirB + 'Click.png';
        optsB['disabledImage'] = dirB + 'Normal.png';
        optsA['normalImage']   = dirA + 'Normal.png';
        optsA['selectedImage'] = dirA + 'Click.png';
        optsA['disabledImage'] = dirA + 'Normal.png';

        optsB['callback'] = this.breakCallback.bind(this);
        optsA['callback'] = this.accelerateCallback.bind(this);
        
        this.breakButton = new cocos.nodes.MenuItemImage(optsB);
        this.breakButton.position = new geo.Point( 380, -138);
        
        this.accelerateButton = new cocos.nodes.MenuItemImage(optsA);
        this.accelerateButton.position = new geo.Point(-380,  138);
    },
    
    createLeftRightButtons: function() {
        var dirL = '/resources/Buttons/buttonLeft';
        var dirR = '/resources/Buttons/buttonRight';
        var optsL = Object();
        var optsR = Object();
        optsL['normalImage']   = dirL + 'Normal.png';
        optsL['selectedImage'] = dirL + 'Click.png';
        optsL['disabledImage'] = dirL + 'Normal.png';
        optsR['normalImage']   = dirR + 'Normal.png';
        optsR['selectedImage'] = dirR + 'Click.png';
        optsR['disabledImage'] = dirR + 'Normal.png';

        optsL['callback'] = this.moveLeftCallback.bind(this);
        optsR['callback'] = this.moveRightCallback.bind(this);
        
        this.leftButton = new cocos.nodes.MenuItemImage(optsL);
        this.leftButton.position = new geo.Point(-250, 0);
        
        this.rightButton = new cocos.nodes.MenuItemImage(optsR);
        this.rightButton.position = new geo.Point( 250, 0);
    },
	<!-- mvy ^^^ -->
    
    // Displays the retry button on the screen
    addRetryButton: function() {
        var dir = '/resources/Buttons/buttonRetry';
        var opts = Object();
        opts['normalImage']   = dir + 'Normal.png';
        opts['selectedImage'] = dir + 'Click.png';
        opts['disabledImage'] = dir + 'Normal.png';
        opts['callback'] = this.retryLevel.bind(this)
        
        this.retryButton = new cocos.nodes.MenuItemImage(opts);
        this.retryButton.position = new geo.Point(0, -225);
        
        this.menu.addChild({child: this.retryButton});
    },
    
    // Restarts the level that the player just completed
    //TODO: Move out of Menu functions subsection?
    retryLevel: function() {
        this.skipSplash = true;
    
        this.removePrevGame();
        this.initializeValues();
        
        this.menu.removeChild({child: this.retryButton});
        
        PNode.cameraZ = 0;
        
        this.getLevel();
    },
    
    // Called when the volume button is pressed
    //TODO: Seperate this into two functions (mute/unmute)?
    //TODO: Implement a slider/levels to set master volume
    audioCallback: function() {
        if(!this.audioMixer.muted) {
            this.menu.removeChild(this.volumeButtonOn);
            this.menu.addChild({child: this.volumeButtonOff});
        }
        else {
            this.menu.removeChild(this.volumeButtonOff);
            this.menu.addChild({child: this.volumeButtonOn});
        }
        
        this.audioMixer.setMute(!this.audioMixer.muted);
    },
    
    <!-- mvy VVV -->
    breakCallback: function() {
    	this.doBreak = true;
        // 'S' / 'DOWN' Slow down, press
        /*
        if(!this.velocityLock) {
            this.player.decelerate(dt);
            this.audioMixer.loopSound('decel')
        
            // Cross fade tracks if needed and able
            if(this.bgFast && !this.bgFade && player.zVelocity < RC.crossFadeSpeed) {
                this.musicMixer.crossFade('bg_fast', 'bg_slow', 2);
                this.bgFast = false;
                this.bgFade = true;
            }
            
            // Prevents triggering both acceleration and deceleration
            // decel_lock = true; // mvy
        }
        else
            this.audioMixer.stopSound('decel');
        /**/
    },
    accelerateCallback: function() {
	    this.doAccelerate = true;
        // 'W' / 'UP' Speed up, press
        /*
        if(!this.velocityLock) {
            this.player.accelerate(dt);
            this.audioMixer.loopSound('accel')
            
            // Cross fade tracks if needed and able
            if(!this.bgFast && !this.bgFade && player.zVelocity > RC.crossFadeSpeed) {
                this.musicMixer.crossFade('bg_slow', 'bg_fast', 2);
                this.bgFast = true;
                this.bgFade = true;
            }
        }
        else
            this.audioMixer.stopSound('accel');
        /**/
    },

    moveLeftCallback: function() {
    	//alert(this.ss_started); it's something about the if check that screws it up on iPad
        //if(this.ss_started) {
            // 'A' / 'LEFT' Move left, discreet
            //if(evt.locationInCanvas.x < this.player.position.x) {
                if(this.lane > 0) {
                    this.moveLane(this.lane, this.lane-1);
                    this.player.xCoordinate = this.lanePosX[RC.curNumLanes][this.lane];
                    this.audioMixer.playSound('accel', true);
                }
            //}
        //}
    },
    moveRightCallback: function() {
    	//alert(this.ss_started); it's something about the if check that screws it up on iPad
        //if(this.ss_started) {
            // 'D' / 'RIGHT' Move right, discreet
            //if(evt.locationInCanvas.x > this.position.x) {
                if(this.lane < RC.curNumLanes-1) {
                    this.moveLane(this.lane, this.lane+1);
                    this.player.xCoordinate = this.lanePosX[RC.curNumLanes][this.lane];
                    this.audioMixer.playSound('accel', true);
                }
            //}
        //}
    },

    // Called when the volume button is pressed
    //TODO: Seperate this into two functions (mute/unmute)?
    //TODO: Implement a slider/levels to set master volume
    audioCallback2: function() {
        if(!this.audioMixer.muted) {
            this.menu.removeChild(this.volumeButton2On);
            this.menu.addChild({child: this.volumeButton2Off});
        }
        else {
            this.menu.removeChild(this.volumeButton2Off);
            this.menu.addChild({child: this.volumeButton2On});
        }
        
        this.audioMixer.setMute(!this.audioMixer.muted);
    },
    <!-- mvy ^^^ -->
    
    // Called when the music button is pressed
    //TODO: Same as audioCallback
    musicCallback: function() {
        if(!this.musicMixer.muted) {
            this.menu.removeChild(this.musicButtonOn);
            this.menu.addChild({child: this.musicButtonOff});
        }
        else {
            this.menu.removeChild(this.musicButtonOff);
            this.menu.addChild({child: this.musicButtonOn});
        }
        
        this.musicMixer.setMute(!this.musicMixer.muted);
    }
})

// Main ////////////////////////////////////////////////////////////////////////////////////////////

// Initialise application
function main() {
    // From: https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/bind
    // This defines function.bind for web browsers that have not implemented it:
    // Firefox < 4 ; Chrome < 7 ; IE < 9 ; Safari (all) ; Opera (all)
    if (!Function.prototype.bind) {  
        Function.prototype.bind = function (oThis) {  
        
            if (typeof this !== "function") { // closest thing possible to the ECMAScript 5 internal IsCallable function  
                throw new TypeError("Function.prototype.bind - what is trying to be fBound is not callable");  
            }

            var aArgs = Array.prototype.slice.call(arguments, 1),
                fToBind = this,
                fNOP = function () {},
                fBound = function () {
                    return fToBind.apply(this instanceof fNOP ? this : oThis || window, aArgs.concat(Array.prototype.slice.call(arguments)));
                };

            fNOP.prototype = this.prototype;
            fBound.prototype = new fNOP();

            return fBound;
        };
    }
    
    // Setup the director
    var director = cocos.Director.sharedDirector;
    
    events.addListener(director, 'ready', function(director) {
        var scene = new cocos.nodes.Scene();     // Create a scene
        var app = new FluencyApp();              // Create the layers

        // Add our layers to the scene
        scene.addChild(app);

        // Run the scene
        director.replaceScene(scene);
    });
    
    director.attachInView();
    director.preloadScene = new PreloadScene({emptyImage: '/resources/Loader/LoadingScreen00.png', fullImage: '/resources/Loader/LoadingScreen16.png'});
    director.runPreloadScene();
}

exports.main = main;
}, mimetype: "application/javascript", remote: false}; // END: /main.js


__jah__.resources["/ModifyOverTime.js"] = {data: function (exports, require, module, __filename, __dirname) {
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

var events = require('events');



// Automatically handles changing a value over time

function ModifyOverTime (x, amount, time) {

    ModifyOverTime.superclass.constructor.call();

    

    // Initialize

    this.value = x;

    this.rate = amount / time;

    this.duration = time;

    

    // Force calling updates since this will not be added to the scene

    cocos.Scheduler.sharedScheduler.scheduleUpdate({target: this, priority: 0, paused: false});

    

    // Keep track of this instance so we can remove it automatically later

    ModifyOverTime.list.push(this);

}



ModifyOverTime.inherit(Object, {

    duration: 0,    // Remaining duration of the change

    rate    : 0,    // Rate at which the value changes per second

    value   : null, // The value that is being changed

    

    obj     : null, // Object with value to be modified

    str     : null, // If not null, the variable name on the object to be changed

    func    : null, // If not null, the funciton name on the object to call with the changed value

    

    // Binds the direct set case

    bind: function (obj, str) {

        if(this.func == null) {

            this.obj = obj;

            this.str = str;

            return true;

        }

        

        console.log('WARNING: MOT already bound to function ( ' + this.func + ' )');

        return false;

    },

    

    // Binds the set by function case

    bindFunc: function (obj, func) {

        if(this.str == null) {

            this.obj = obj;

            this.func = func;

            return true;

        }

        

        console.log('WARNING: MOT already bound to variable ( ' + this.str + ' )');

        return false;

    },



    // Changes value over time

    update: function (dt) {

        var dur = this.duration;

        

        // Keep changing as long as there is duration remaining

        if(dur > 0) {

            // Check the case that the tick is longer than our remaining time

            var edt = Math.min(dt, dur);

            this.duration = dur - edt;

            

            // Update value

            this.value = this.value + this.rate * edt;

            

            // Direct set case

            if(this.str) {

                this.obj[this.str] += this.rate * edt;

            }

            

            // Set by function case

            if(this.func) {

                this.func.apply(this.obj, [this.value]);

            }

        }

        

        // Otherwise change is complete

        else {

            // Let anyone who wants to know that this change has finished

            events.trigger(this, 'Completed', this);

            

            // Then kill it

            this.kill();

        }

    },

    

    // Calling this directly will stop the MOT from modifying and remove it just like if its duration expired, but will not notify anything that it has ended

    kill: function () {

        // Clean up

        cocos.Scheduler.sharedScheduler.unscheduleUpdateForTarget(this);

        events.clearInstanceListeners(this);

        

        this.obj = null;

        this.str = null;

        this.func = null;

        

        // and remove

        var index = ModifyOverTime.list.indexOf(this);

        ModifyOverTime.list.splice(index, 1);

    },

    

    // Pauses the MOT

    pause: function () {

        cocos.Scheduler.sharedScheduler.pauseTarget(this);

    },

    

    // Resumes the MOT

    resume: function () {

        cocos.Scheduler.sharedScheduler.resumeTarget(this);

    }

});



// Static variables

ModifyOverTime.list = [];



module.exports = ModifyOverTime;
}, mimetype: "application/javascript", remote: false}; // END: /ModifyOverTime.js


__jah__.resources["/PerspectiveNode.js"] = {data: function (exports, require, module, __filename, __dirname) {
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



var cocos = require('cocos2d');

var geom = require('geometry');

var events = require('events');

var util = require('util');



var RC = require('/RaceControl');



// Base class for rending objects in perspective view

function PerspectiveNode (opts) {

    PerspectiveNode.superclass.constructor.call(this, opts);



    this.zCoordinate = 0;

    

    this.position = new geom.Point(0, 0);

    this.anchorPoint = new geom.Point(0, 0);

    

    //Set properties from the option object

    var i = -1;

    while(++i < PerspectiveNode.params.length) {

        if (opts[PerspectiveNode.params[i]]) {

            this[PerspectiveNode.params[i]] = opts[PerspectiveNode.params[i]];

        }

    }

    

    if(this.content != null) {

        this.content.anchorPoint = new geom.Point(0, 0);

        this.addChild({child: this.content});

        this.contentSize = this.content.contentSize;

    }

    

    this.idle = this.idle.bind(this);

}



PerspectiveNode.inherit(cocos.nodes.Node, {

    visibility  : 1,        // Content scale multiplier, used BEFORE clamping

    minScale    : null,     // Minimum scale for this node due to perspective distance (null disables minimum)

    maxScale    : null,     // Maximum scale for this node due to perspective distance (null disables maximum)

    xCoordinate : 0,        // The node's X position in the world

    silent      : false,    // If set to true, will not fire events

    added       : false,    // True once added to the scene

    lockX       : false,    // Set to true to lock X value

    lockY       : false,    // Set to true to lock Y value

    alignV      : 0,        // Vertical alignment of the node (0 top - 0.5 center - 1 bottom)

    alignH      : 0,        // Horizontal alignment of the node (0 right - 0.5 center - 1 left)

    dropoffDist : -10,      // Distance behind the camera that node requests removal from scene

    zVelocity   : 0,        // Meters per second speed along the Z axis

    xVelocity   : 0,        // Meters per second speed along the X axis

    content     : null,     // Content to be displayed in the node

    delOnDrop   : true,     // If true, runs cleanup when the node is removed from the scene

    

    disabled    : false,



    // Explicitly unschedules and unsubscribes this node

    cleanup: function () {

		clearTimeout(this.idleing);

        cocos.Scheduler.sharedScheduler.unscheduleUpdateForTarget(this);

        events.clearInstanceListeners(this);

    },

    

    // Callen when place into the scene

    onEnter: function() {

        this.added = true;

        PerspectiveNode.superclass.onEnter.call(this);

    },

    

    // Called when removed from the scene, if delOnDrop, runs cleanup, otherwise explictly reschedules the node

    onExit: function () {

        this.added = false;

        PerspectiveNode.superclass.onExit.call(this);

        

        //TODO: 1) No longer track delOnDrop, 2) All cleared objects revert to idleing

        if(this.delOnDrop) {

            this.cleanup();

        }

        else {

            cocos.Scheduler.sharedScheduler.scheduleUpdate({target: this, priority: 0, paused: false});

        }

    },

    

    // Applies visibility modifier and clamps to scale, then returns the augmented value

    scale: function (s) {

        s *= this.visibility;

        

        // Apply clamps to scale as needed

        if(this.minScale != null) {

            s = Math.max(this.minScale, s);

        }

        if(this.maxScale != null) {

            s = Math.min(this.maxScale, s);

        }

        

        // Set scale

        this.scaleX = s;

        this.scaleY = s;

        

        return s;

    },

    

    // Helper function for determining node width

    getContentWidth: function() {

        if(this.content) {

            return this.contentSize.width * this.content.scaleX;

        }

        return this.contentSize.width;

    },

    

    // Helper function for determining node height

    getContentHeight: function() {

        if(this.content) {

            return this.contentSize.height * this.content.scaleY;

        }

        return this.contentSize.height;

    },

    

    // Called once per second until node is 'just over the horizon' at which point, it starts running update() every frame instead

    // NOTE: This may not handle nodes in moion correctly

    idle: function () {

        var distance = this.zCoordinate - PerspectiveNode.cameraZ;

        

        if(distance < PerspectiveNode.horizonDistance + RC.maxDistWindow) {

            cocos.Scheduler.sharedScheduler.scheduleUpdate({target: this, priority: 0, paused: false});

        }

        else {

            this.idleing = setTimeout(this.idle, 1000);

        }

    },

    

    // Called every frame for distance checking and rendering

    update: function (dt) {

        // Update current position based on velocity

        this.zCoordinate = this.zCoordinate + this.zVelocity * dt;

        this.xCoordinate = this.xCoordinate + this.xVelocity * dt;

        

        var distance = this.zCoordinate - PerspectiveNode.cameraZ;

        

        // Only worry about drawing once node is on our side of the horizon

        if(distance > PerspectiveNode.horizonDistance) {

            if(this.added && !this.silent) {

                events.trigger(this, 'removeMe', this);

                return -1;

            }

        }

        else if(distance <= PerspectiveNode.horizonDistance && distance > this.dropoffDist) {

            // Make sure that the node gets added to the scene graph once it should be visible

            if(!this.added && !this.silent && !this.disabled) {

                events.trigger(this, 'addMe', this);

                return 1;

            }

            

            this.updatePosition();

        }

        // Once the node drops too far back, notify for removal

        else if (!this.silent) {

            events.trigger(this, 'removeMe', this);

            return -1;

        }

        

        return 0;

    },

    

    updatePosition: function() {

        // Perspective transform

        var distance = this.zCoordinate - PerspectiveNode.cameraZ;

        var scale = PerspectiveNode.horizonDistance * PerspectiveNode.horizonScale / distance;

        var screenX, screenY;

        

        // Apply scaling

        var displayScale = this.scale(scale);

        

        // Check to see if X axis is locked

        if(!this.lockX) {

            screenX = PerspectiveNode.roadOffset + PerspectiveNode.roadWidthPix / 2 * (1 + scale * 2.0 * (this.xCoordinate / PerspectiveNode.roadWidth));

            screenX -= this.alignH * this.getContentWidth() * displayScale;

        }

        else {

            screenX = this.alignH * this.getContentWidth() * displayScale;

        }

        

        // Check to see if Y axis is locked

        if(!this.lockY) {

            var yScale = (1.0 / (1.0 - PerspectiveNode.horizonScale)) * (scale - PerspectiveNode.horizonScale);

            screenY = PerspectiveNode.horizonHeight - PerspectiveNode.horizonHeight * (yScale);

            screenY += this.alignV * this.getContentHeight() * displayScale;

        }

        else {

            screenY = -1 * this.alignV * this.getContentHeight() * displayScale;

        }

        

        // Set position

        this.position = new geom.Point(screenX|0, screenY|0);

    },

    

    //HACK: for depreciated bindTo

    set zCoordinate (val) {

        this.z = val;

        

        if(this.dash && this.dashStr) {

            this.dash[this.dashStr] = val;

        }

    },

    

    get zCoordinate () {

        return this.z;

    }

});



// Static constants

PerspectiveNode.horizonHeight   = 409;      // From horizonStart to the bottom of the screen in pixels

PerspectiveNode.horizonDistance = 100;      // In meters from the camera

PerspectiveNode.horizonScale    = 0.074;    // Scale of objects on the horizon (553:41)

PerspectiveNode.roadWidth       = 9.0;      // Width of road at bottom of the screen in meters

PerspectiveNode.roadWidthPix    = 553*1.2;  // Width of road at bottom of the screen in pixels

PerspectiveNode.roadOffset      = 175-55.3; // Number of pixels from the left hand side that the road starts at



// Array of legal values in constructor opts argument

PerspectiveNode.params = ['visibility','minScale','maxScale','xCoordinate','zCoordinate','silent','lockX','lockY','alignV','alignH','dropoffDist','zVelocity','xVelocity','content','delOnDrop'];



// Static variables

PerspectiveNode.cameraZ = 0;                // Current Z coordinate of the camera



module.exports = PerspectiveNode
}, mimetype: "application/javascript", remote: false}; // END: /PerspectiveNode.js


__jah__.resources["/PerspectiveNodeAnim.js"] = {data: function (exports, require, module, __filename, __dirname) {
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



var cocos = require('cocos2d');

var events = require('events');



var PNode = require('/PerspectiveNode');



function PerspectiveNodeAnim (opts) {

    PerspectiveNodeAnim.superclass.constructor.call(this, opts);

}



PerspectiveNodeAnim.inherit(PNode, {

    prepareAnimation: function (act) {

        this.act = new cocos.actions.RepeatForever(act);

    },

    

    runAnimation: function() {

        this.content.runAction(this.act);

    },

    

    stopAnimation: function() {

        cocos.ActionManager.sharedManager.removeAllActionsFromTarget(this);

    },

    

    onEnter: function() {

        this.runAnimation();

        

        PerspectiveNodeAnim.superclass.onEnter.call(this);

    },

    

    onExit: function() {

        this.stopAnimation();

        

        PerspectiveNodeAnim.superclass.onExit.call(this);

    }

});



module.exports = PerspectiveNodeAnim
}, mimetype: "application/javascript", remote: false}; // END: /PerspectiveNodeAnim.js


__jah__.resources["/PieChart.js"] = {data: function (exports, require, module, __filename, __dirname) {
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

var cocos = require('cocos2d');
var geom = require('geometry');
var util = require('util');

// Draws a pie chart
PieChart = function(opts) {
    PieChart.superclass.constructor.call(this);
    
    //Set properties from the option object
    var i = -1;
    while(++i < PieChart.params.length) {
        if (opts[PieChart.params[i]]) {
            this[PieChart.params[i]] = opts[PieChart.params[i]];
        }
    }
    
    this.bgShow = true;
    if(opts.hasOwnProperty('bgShow')) {
        if(!opts['bgShow'] || opts['bgShow'] == "false") {
            this.bgShow = false;
        }
    }
    
    this.strRep = this.numFilled + ' / ' + this.numSections;
    
    // Explictly set contentSize so it plays nice with formating based on it
    this.contentSize = new geom.Size(this.radius * 2.4, this.radius * 2.4);
}

PieChart.inherit(cocos.nodes.Node, {
    numSections : 2,         // Total number of pie slices
    numFilled   : 1,         // Number of filled pie slices
    bgColor     : '#FFFFFF', // Color of the background
    lineColor   : '#000000', // Color of the lines used to outlijne and mark each section
    fillColor   : '#00A0A0', // Color of the filled in sections
    radius      : 10,        // Size of the chart

    strRep      : '',        // String representation of content
    
    // Draws the PieChart to the canvas
    draw: function(context) {
        var r = this.radius;
        
        // Draw background
        if(this.bgShow) {
            context.fillStyle = this.bgColor;
            context.fillRect(r * -1.2, r * -1.2, r * 2.4, r * 2.4);
        }
    
        var step = Math.PI*2 / this.numSections;
        var offset = Math.PI * 3 / 2    //This is so we draw with 'up' as our 0
    
        // Draw the filled portion
        context.fillStyle = this.fillColor;
        context.beginPath();
        context.arc(0, 0, r, offset, offset + step * this.numFilled);
        context.lineTo(0, 0);
        context.lineTo(0, -1 * r);
        context.closePath();
        context.fill();
    
        // Draw the outline
        context.strokeStyle = this.lineColor;
        context.beginPath();
        context.arc(0, 0, r, 0, Math.PI*2);
        context.closePath();
        context.stroke();
        
        // Draw the individual dividers
        for(var i=0; i<this.numSections; i+= 1) {
            context.beginPath();
            context.moveTo(0, 0);
            context.lineTo(Math.sin(i*step)*r, Math.cos(i*step)*r*-1)
            context.closePath();
            context.stroke();
        }
    },
    
    // Implemented in PieChart as other types of Content need these to function
    //TODO: Migrate a base version of these functions up to Content?
    set opacityLink (val) {
        this.opacity = val;
    },
    
    get opacityLink () {
        return this.opacity;
    }
});

// Static helper function to build the creation options object
PieChart.helper = function(Sections, Filled, BgColor, LineColor, FillColor, Radius) {
    return {
        numSections : Sections,
        numFilled   : Filled,
        bgColor     : BgColor,
        lineColor   : LineColor,
        fillColor   : FillColor,
        radius      : Radius
    };
}

PieChart.params = ['numSections','numFilled','bgColor','lineColor','fillColor','radius'];

module.exports = PieChart
}, mimetype: "application/javascript", remote: false}; // END: /PieChart.js


__jah__.resources["/Player.js"] = {data: function (exports, require, module, __filename, __dirname) {
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

// Cocos requirements
var cocos = require('cocos2d');
var geom = require('geometry');
var events = require('events');
var Texture2D = require('cocos2d').Texture2D;

// Project requirements
var LabelBG = require('/LabelBG');
var PNode = require('/PerspectiveNode');

// Static requirements
var RC = require('/RaceControl');
var MOT = require('/ModifyOverTime');
var L = require('/Logger');

// Represents the player in the game
function Player() {
    Player.superclass.constructor.call(this, {xCoordinate:0, zCoordinate: this.chaseDist});
    
    // Static binds
    this.changeSelector = this.changeSelector.bind(this);
    this.turboCompleted = this.turboCompleted.bind(this);
    this.endIntermission = this.endIntermission.bind(this);
    this.startIntermission = this.startIntermission.bind(this);
    this.startAnimationCallback = this.startAnimationCallback.bind(this);
    this.fishtailCallback = this.fishtailCallback.bind(this);
    
    this.selectorBG = new cocos.nodes.Sprite({file: '/resources/carNumberB.png'});
    this.selectorBG.zOrder = -1;
    this.selectorBG.scaleX = 0.3;
    this.selectorBG.scaleY = 0.3;
    
    // Load the car sprite for the player
    this.sprites = [
        new cocos.nodes.Sprite({file: '/resources/Cars/Car-left.png'}),
        new cocos.nodes.Sprite({file: '/resources/Cars/carPlayer01.png'}),
        new cocos.nodes.Sprite({file: '/resources/Cars/Car-right.png'})
    ];
    this.addChild({child: this.sprites[1]});
    
    // Load fishtail animation
    var anim = [];
    
    var texture = new Texture2D({file: module.dirname + '/resources/Fishtail/fishTailSheet.png'});
    for(var i=2; i<=17; i++) {
        anim.push(new cocos.SpriteFrame({texture: texture, rect: geom.rectMake((i-2)*200, 0, 200, 115)}));
    }
    
    this.animNode = new cocos.nodes.Sprite();
    this.animNode.position = new geom.Point(-32, 0);
    
    var anim = new cocos.Animation({frames: anim, delay: 0.05});
    this.fishtail = new cocos.actions.Animate({animation: anim, restoreOriginalFrame: false});
    
    this.maxSpeed = RC.maxSpeed;
    this.minSpeed = RC.minSpeed;
    this.zVelocity = RC.defaultSpeed;
    this.acceleration = RC.acceleration;
    this.deceleration = RC.deceleration;
    this.turboSpeed = RC.turboSpeed;
}    

Player.inherit(PNode, {
    selector        : null,     // Label that represents the value the player has control over
    
    wipeoutDuration : 0,        // Duration remaining on a wipeout
    wipeoutRotSpeed : 0,        // Rotational velocity in degrees per second for the current wipeout
    
    selectorX       : null,     // The X coordinate that the label should be at, ignoring rotational transforms
    selectorY       : null,     // The Y coordinate that the label should be at, ignoring rotational transforms
    
    chaseDist       : 13,       // The distance in meters the player is ahead of the camera by
    chaseMin        : 13,       // The closest the camera can get behind the car in meters
    chaseDelta      : 1,        // How many meters the player will pull away from the camera by moving at maximum speed
    
    minSpeed        : 0,        // Minimum player speed in m/s (Zero is okay, negatives are BAD)
    maxSpeed        : 200,      // Maximum player speed in m/s
    acceleration    : 13,       // Player acceleration in m/s^2
    deceleration    : 26,       // Player deceleration in m/s^2
    
    turbo           : false,    // True if turbo boost is currently active
    preTurbo        : 0,        // Holds what the zVelocity was before turbo boosting
    turboSpeed      : 200,      // Turbo boost speed in m/s
    turboMOT        : null,     // Hold the MOT currently affecting zVelocity
    
    fishtail        : null,     // Holds the fishtail animation
    animating       : false,    // True when animating the fishtail animation
    
    sprites         : null,     // Array of car sprites
    lcr             : 1,        // Which sprite to use
    
    // Plays the fishtail animation
    fishtailAnimation: function() {
        this.animating = true;
        
        this.removeChild({child: this.sprites[this.lcr]});
        this.addChild({child: this.animNode});
        
        if(this.lcr == 0 || this.lcr == 1 && Math.floor(Math.random() * 2)) {
            this.animNode.scaleX = -1;
        }
        else {
            this.animNode.scaleX = 1;
        }
        
        this.animNode.runAction(this.fishtail);
        
        setTimeout(this.fishtailCallback, 850);
    },
    
    // Cleans up the fishtail animation
    // STATIC BIND
    fishtailCallback: function() {
        this.removeChild({child: this.animNode});
        this.addChild({child: this.sprites[this.lcr]});
        
        this.animating = false;
    },
    
    // Change the car sprite relative to the current lane
    // Returns true if the player is allowed to change lanes, false otherwise
    changeLane: function(lane) {
        // Only allow lane changes when not animating fishtail
        if(this.animating) {
            return false;
        }
        
        // Swap the player car sprites
        this.removeChild({child: this.sprites[this.lcr]});
        this.lcr = lane;
        this.addChild({child: this.sprites[this.lcr]});
        
        return true;
    },
    
    // Changes the currently displayed selector on the car
    // STATIC BIND
    changeSelector: function(newVal, location) {
        // Remove previous selector if there was one
        if(this.selector != null) {
            this.selector.removeChild({child: this.selectorBG});
            this.removeChild({child: this.selector});
        }
        
        // Create the new selector if one is provided
        if(this.newSelector != null) {
            this.parent.removeChild({child: this.newSelector});
            this.changeSelectorByForce(this.newSelector);
            this.newSelector = null;
        }
        else {
            this.removeChild({child: this.selector});
            this.selector = null;
        }
        
        setTimeout(this.endIntermission, 100);
    },
    
    // Used to set the selector at the start of the game
    changeSelectorByForce: function(selector) {
        var x = selector.contentSize.width / 2 * selector.scaleX;
        
        selector.position = new geom.Point(x, -80);
        selector.bgShow = false;
        this.selectorX = x;
        this.selectorY = -80;
        this.addChild({child: selector});
        this.selector = selector;
        selector.addChild({child: this.selectorBG});
    },
    
    // Starts an intermission
    // STATIC BIND
    startIntermission: function(newVal, location) {
        L.log('CHECKPOINT_START', {});
        this.endTurboBoost();
        
        var tm = this.turboMOT;
        if(tm != null) {
            tm.pause();
            this.turboMOT = tm;
        }
        
        // Stop the player on the checkpoint
        if(this.zCoordinate > location) {
            this.zCoordinate = location;
        }
        
        var s = newVal.scale * 1.5;
        var cs = newVal.contentSize;
        newVal.scale = 0.1;
        newVal.position = new geom.Point(450, 500);
        this.parent.addChild({child: newVal});
        
        if(this.selector != null) {
            var m = new MOT(255, -255, 1.0);
            m.bind(this.selector, 'opacityLink');
        }
        
        var a1 = new cocos.actions.ScaleTo({scale: s, duration: 0.25});
        a1.startWithTarget(newVal);
        newVal.runAction(a1);
        
        this.intermission = true;
        this.preInter = this.zVelocity;
        this.zVelocity = 0;
        this.newSelector = newVal;
        
        setTimeout(this.startAnimationCallback, 1000);
    },
    
    // Finishes an intermission
    // STATIC BIND
    endIntermission: function() {
        this.intermission = false;
        
        var tm = this.turboMOT;
        if(tm != null) {
            tm.resume();
            this.turboMOT = tm;
        }
        
        this.zVelocity = this.preInter;
        events.trigger(this, 'IntermissionComplete');
        
        L.log('CHECKPOINT_END', {});
    },
    
    // Shows the new selector, schedules to hide if blink count is not exhausted
    // STATIC BIND
    startAnimationCallback: function() {
        var nv = this.newSelector;
        
        var a1 = new cocos.actions.ScaleTo({scale: nv.scale / 1.5, duration: 1.0});
        a1.startWithTarget(nv);
        nv.runAction(a1);
        
        var a2 = new cocos.actions.MoveTo({position: new geom.Point(this.position.x, this.position.y + this.selectorY), duration: 1.0});
        a2.startWithTarget(nv);
        nv.runAction(a2);
        
        setTimeout(this.changeSelector, 1000);
    },
    
    // Sets the wipeout status of the car, causing it to spin over time and slow down
    wipeout: function(spins) {
        this.fishtailAnimation();
        if(this.turbo) {
            this.endTurboBoost();
        }
        else {
            this.incorrectSlowdown();
        }
    },
    
    // Slows the player down due to an incorrect answer
    incorrectSlowdown: function() {
        if(!this.speedChange((this.zVelocity - this.minSpeed) * RC.penaltySpeed, 0.1)) {
            setTimeout(this.incorrectSlowdown.bind(this), 100);
        }
    },
    
    // Accelerates the player
    accelerate: function (dt) {
        if(!this.intermission && this.turboMOT == null) {
            var s = this.zVelocity + this.acceleration * dt
            s = Math.min(this.maxSpeed, s);
            this.zVelocity = s;
        }
    },
    
    // Decelerates the player
    decelerate: function (dt) {
        if(!this.intermission && this.turboMOT == null) {
            var s = this.zVelocity - this.deceleration * dt
            s = Math.max(this.minSpeed, s);
            this.zVelocity = s;
        }
    },

    // Starts a turbo boost if not already boosting
    startTurboBoost: function() {
        if(!this.turbo && !(this.wipeoutDuration > 0) && !this.intermission && this.turboMOT == null) {
            this.turbo = true;
            this.preTurbo = this.zVelocity;
            
            var tm = this.speedChange(this.turboSpeed - this.zVelocity, 0.1);
            this.turboMOT = tm;
            events.addListener(tm, 'Completed', this.turboCompleted);
            
            return true;
        }
        
        return false;
    },
    
    // STATIC BIND
    turboCompleted: function() {
        this.turboMOT = null;
    },
    
    // Ends a turbo boost if it is active (usually called when answering a question, but could be used to cut the boost early)
    endTurboBoost: function() {
        if(this.turbo) {
            var tm = this.turboMOT;
            if(tm != null) {
                tm.kill();
                this.turboMOT = null;
            }
            
            this.turbo = false;
            var tm = this.speedChange(this.preTurbo - this.zVelocity, 0.1);
            this.turboMOT = tm;
            events.addListener(tm, 'Completed', this.turboCompleted);
        }
    },
    
    // Shortcut function for applying a speed change over time, returns the MOT
    speedChange: function (amt, dur) {
        var m = new MOT(this.zVelocity, amt, dur);
        m.bind(this, 'zVelocity');
        
        return m;
    },
    
    update: function(dt) {
        // Always maintain at least the minimum speed
        var v = this.zVelocity;
        if(v < this.minSpeed && !this.intermission) {
            this.zVelocity = this.minSpeed;
        }
        else if(v < 0 || isNaN(v)) {
            this.zVelocity = 0;
        }
        
        // Stop on the finish line when crossed
        if(this.zCoordinate > RC.finishLine) {
            this.zCoordinate = RC.finishLine;
            //HACK: This velocity change is not supposed to be propagated
            this._v = 0;
        }
        
        // Set the chase distance based on current speed
        this.chaseDist = this.chaseMin + this.chaseDelta * (this.zVelocity / this.maxSpeed);
        
        // Update the camera and include the current frame's velocity which may not be applied to the player yet (eliminates jitter)
        PNode.cameraZ = this.zCoordinate - this.chaseDist + (this.zVelocity * dt);
        
        //HACK: Somewhere else is breaking these values
        this.selector.position.x = this.selectorX;
        this.selector.position.y = this.selectorY;
        
        // Let PNode handle perspective rendering
        Player.superclass.update.call(this, dt);
        
        L.alwaysLog['Speed'] = Math.round((this.zVelocity * 100)) / 100.0;
        L.alwaysLog['Z'] = Math.round((this.zCoordinate * 100)) / 100.0;
    },
    
    //HACK: for depreciated bindTo
    set zCoordinate (val) {
        this._z = val;
        
        if(this.dash) {
            this.dash.playerZ = val;
        }
    },
    
    get zCoordinate () {
        return this._z;
    },
    
    //HACK: for depreciated bindTo
    set zVelocity (val) {
        this._v = val;
        
        if(this.dash) {
            this.dash.speed = val;
        }
    },
    
    get zVelocity () {
        return this._v;
    }
});

module.exports = Player;
}, mimetype: "application/javascript", remote: false}; // END: /Player.js


__jah__.resources["/PreloadScene.js"] = {data: function (exports, require, module, __filename, __dirname) {
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

var util = require('util');



var Director = cocos.Director;

var Preloader = require('preloader').Preloader;



function ProgressBar (opts) {

    ProgressBar.superclass.constructor.call(this, opts);



    var s;

    if (opts.emptyImage) {

        s = new cocos.nodes.Sprite({file: opts.emptyImage});

        s.anchorPoint = new geo.Point(0, 0);

        this.emptySprite = s;

        this.addChild({child: s});

        this.contentSize = s.contentSize;

    }

    if (opts.fullImage) {

        s = new cocos.nodes.Sprite({file: opts.fullImage});

        s.anchorPoint = new geo.Point(0, 0);

        this.fullSprite = s;

        this.addChild({child: s});

        this.contentSize = s.contentSize;

    }



    events.addPropertyListener(this, 'maxval', 'change', this.updateImages.bind(this));

    events.addPropertyListener(this, 'val',    'change', this.updateImages.bind(this));



    this.updateImages();

}



ProgressBar.inherit(cocos.nodes.Node, {

    emptySprite : null,     // Image at 0% loaded

    fullSprite  : null,     // Image at 100% loaded

    maxval      : 100,      // 

    val         : 0,        // 



    updateImages: function () {

        var size = this.contentSize;



        var diff = Math.round(size.width * (this.val / this.maxval));

        if (diff === 0) {

            this.fullSprite.visible = false;

        }

        else {

            this.fullSprite.visible = true;

            this.fullSprite.rect = new geo.Rect(0, 0, diff, size.height);

            this.fullSprite.contentSize = new geo.Size(diff, size.height);

        }



        if ((size.width - diff) === 0) {

            this.emptySprite.visible = false;

        }

        else {

            this.emptySprite.visible = true;

            this.emptySprite.rect = new geo.Rect(diff, 0, size.width - diff, size.height);

            this.emptySprite.position = new geo.Point(diff, 0);

            this.emptySprite.contentSize = new geo.Size(size.width - diff, size.height);

        }

    }

});



function PreloadScene (opts) {

    PreloadScene.superclass.constructor.call(this, opts);

    var size = Director.sharedDirector.winSize;



    if (opts.emptyImage) {

        this.emptyImage = opts.emptyImage;

    }

    if (opts.fullImage) {

        this.fullImage = opts.fullImage;

    }

    

    // Setup preloader

    var preloader = new Preloader();    // The main preloader

    preloader.addEverythingToQueue();

    this.preloader = preloader;



    // Listen for preload events

    events.addListener(preloader, 'load', function (preloader, uri) {

        var loaded = preloader.loaded;

        var count = preloader.count;

        events.trigger(this, 'load', preloader, uri);

    }.bind(this));



    events.addListener(preloader, 'complete', function (preloader) {

        events.trigger(this, 'complete', preloader);

    }.bind(this));



    // Preloader for the loading screen resources

    var loadingPreloader = new Preloader([this.emptyImage, this.fullImage]);



    // When loading screen resources have loaded then draw them

    events.addListener(loadingPreloader, 'complete', function (preloader) {

        this.createProgressBar();

        if (this.isRunning) {

            this.preloader.load();

        }



        this.isReady = true;

    }.bind(this));



    loadingPreloader.load();

}



PreloadScene.inherit(cocos.nodes.Scene, {

    progressBar : null,     // Holds the instance of progress bar

    preloader   : null,     // Holds the instance of the preloader

    isReady     : false,    // True when both progress bar images have loaded

    emptyImage  : null,     // Image at 0% loaded

    fullImage   : null,     // Image at 100% loaded



    createProgressBar: function () {

        var preloader = this.preloader;

        var size = Director.sharedDirector.winSize;



        var progressBar = new ProgressBar({emptyImage: this.emptyImage, fullImage: this.fullImage});



        progressBar.position = new geo.Point(size.width / 2, size.height / 2);



        this.progressBar = progressBar;

        this.addChild({child: progressBar});



        events.addListener(preloader, 'load', function (preloader, uri) {

            progressBar.maxval = preloader.count;

            progressBar.val = preloader.loaded;

        });

    },



    onEnter: function () {

        PreloadScene.superclass.onEnter.call(this);

        var preloader = this.preloader;



        // Preload everything

        if (this.isReady) {

            preloader.load();

        }

    }

});



module.exports = PreloadScene
}, mimetype: "application/javascript", remote: false}; // END: /PreloadScene.js


__jah__.resources["/Question.js"] = {data: function (exports, require, module, __filename, __dirname) {
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

var cocos = require('cocos2d');
var events = require('events');
var geom = require('geometry');

var Content = require('/Content');
var PNode = require('/PerspectiveNode');
var RC = require('/RaceControl');

// Represents a single question to be answered by the player
function Question (node, z) {
    var superOpts = {
        xCoordinate : 0,
        zCoordinate : z,
        lockX       : true,
        minScale    : 1,
        maxScale    : 1
    }
    Question.superclass.constructor.call(this, superOpts);
    
    // Build delimiters for question
	var that = this, i=0;
    this.delimiters = [];
	
	//HACK: Remove 3 lane hardcoding
	$(node).children('Content').each(function() {
		that.buildDelim(this, z, i==0 ? 1 : -1);
        that.delimiters[i].xCoordinate = RC.delimiterSpacing[3][i];
		i += 1;
	});
    
    //HACK: Remove 3 lane hardcoding
    RC.curNumLanes = 3;

    this.correctAnswer = parseInt($(node).children('ANSWER').attr('VALUE'));
    
    return this;
}

Question.inherit(PNode, {
    correctAnswer    : null,    // The correct response
    answer           : null,    // The answer provided by the player
    answeredCorrectly: null,    // Stores if question has been correctly/incorrectly (null=not answered)
    delimiters       : null,    // Holds the delimiters
    timeElapsed      : 0.0,     // Real time elapsed since start of question (including delimeterStaticTime)

    buildDelim: function(node, z, flip) {
        var sign = new cocos.nodes.Sprite({file: '/resources/roadSignA.png'});
        sign.scaleX = 0.20 * flip;
        sign.scaleY = 0.20;
        
        var c = Content.buildFrom(node);
        c.scaleX = 5 * flip;
        c.scaleY = -5;
        sign.addChild({child: c});
        c.anchorPoint = new geom.Point(0.0, 0.0);       //HACK: (0, 0) works and (0.5, 0.5) does not work but should be correct
        c.position = new geom.Point(180, -270);
        c.bgShow = false;
        
        var pSet = $(node).find('PerspectiveSettings');
        
        // Create option settings
        var opts = {
            lockY       : true,
            silent      : true,
            minScale    : pSet.attr('minScale')   == null ? 1.2 : pSet.attr('minScale'),
            maxScale    : pSet.attr('maxScale')   == null ? 3.2 : pSet.attr('maxScale'),
            alignH      : 0.87,
            alignV      : 0,
            visibility  : pSet.attr('visibility') == null ? 5.5 : pSet.attr('visibility'),
            xCoordinate : 0,
            zCoordinate : z,
            content     : sign
        }
        
        // Create the first delimiter
        var delim = new PNode(opts);
        delim.scheduleUpdate();
        this.addChild({child: delim});
        this.delimiters.push(delim);
    },
    
    // Called when the question is answered, sets and returns the result
    answerQuestion: function(ans) {
        if(this.answeredCorrectly == null) {
            this.answer = ans;
            if(this.correctAnswer == ans) {
                this.answeredCorrectly = true;
                return true;
            }
            this.answeredCorrectly = false;
            return false;
        }
        
        return null;
    },
    
    // Manages question timing and movement
    update: function(dt) {
        Question.superclass.update.call(this, dt);
        
        if(this.added) {
            if(this.answeredCorrectly == null) {
                this.timeElapsed = this.timeElapsed + dt;
                
                // TODO: Get the chaseDist from the player, otherwise answers will be up to a meter late
                if(PNode.cameraZ + 13 >= this.zCoordinate) {
                    events.trigger(this, 'questionTimeExpired', this);
                }
            }
        }
    },
	
	// Should prevent race condition of being removed before being answered
	onExit: function () {
		if(this.answeredCorrectly == null) {
			events.trigger(this, 'questionTimeExpired', this);
		}
        Question.superclass.onExit.call(this);
    },
});

module.exports = Question
}, mimetype: "application/javascript", remote: false}; // END: /Question.js


__jah__.resources["/RaceControl.js"] = {data: function (exports, require, module, __filename, __dirname) {
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

// Static Imports
var XML = require('/XML');

// Static singleton class
function RaceControl () {
    console.log('WARNING: Attempting to instantiate static class RaceControl');
}

// Heper function for setting values without overwritting defaults
RaceControl.helper = function(obj, key, val) {
    if(val != null) {
        val = parseFloat(val);
        if(val < 0) {
            throw new Error(key + ' cannot be negative');
        }
        if(isNaN(val)) {
            throw new Error('[CRITICAL] [PARSE] RaceControl.' + key +' is NaN after parseFloat');
        }
        
        obj[key] = val;
    }
}

RaceControl.finishLine          = 3200;     // Holds the z value of the finish line
RaceControl.initialCountdown    = 3000;     // Initial countdown time in milliseconds

RaceControl.curNumLanes = 3;

RaceControl.font = 'Ethnocentric Regular';  // Default font
RaceControl.textOffset = 0.0;                      // Percentage of font size vertical offset for non-mozilla browsers
// Helper Function to account for non-standardized positioning of text
RaceControl.YTextOff = function(y, fs) {
    return y + RaceControl.textOffset * fs;
}

// <AudioSettings> ////////////////////////////////////////////////////////////////////////////////

RaceControl.crossFadeSpeed = 30;
RaceControl.parseAudio = function (xml) {
    var node = $(this).find('AudioSettings');
    RaceControl.helper(RaceControl, 'crossFadeSpeed', node.attr('crossFadeSpeed'));
};

// <MEDALS> ///////////////////////////////////////////////////////////////////////////////////////

RaceControl.times               = [32, 42, 68, 100, 200];   // Holds [min, gold, silver, bronze, max] times
RaceControl.medalNames          = ['Gold', 'Gold', 'Silver', 'Bronze', ' - '];

RaceControl.parseMedals = function (xml) {
    var node = $(xml).find('MEDALS');
    
    $(node).find('MEDAL').each(function() {
        RaceControl.times[$(this).attr('Id')] = $(this).attr('MEDAL_THRESHOLD') / 1000;
    });
};

RaceControl.gold    = '#CC9900';        // Color for gold medals
RaceControl.silver  = '#C0C0C0';        // Color for silver medals
RaceControl.bronze  = '#E26B10';        // Color for bronze medals
RaceControl.noMedal = '#202020';        // Color for no medal

// <GlobalSpacing> ////////////////////////////////////////////////////////////////////////////////

RaceControl.intermissionSpacing = 110;                      // Distance in meters from previous object to intermission
RaceControl.questionSpacing     = 150;                      // Distance in meters from previous object to question
RaceControl.finishSpacing       = 110;                      // Distance in meters after the last question to the finish line
RaceControl.initialSpacing      = 0;                        // Additional distance in meters before the first question

RaceControl.parseSpacing = function (xml) {
    var node = $(xml).find('GlobalSpacing');
    
    RaceControl.helper(RaceControl, 'intermissionSpacing', node.attr('IntermissionSpacing'));
    RaceControl.helper(RaceControl, 'questionSpacing'    , node.attr('QuestionSpacing'));
    RaceControl.helper(RaceControl, 'finishSpacing'      , node.attr('FinishSpacing'));
    RaceControl.helper(RaceControl, 'initialSpacing'     , node.attr('InitialSpacing'));
};

RaceControl.delimiterSpacing    = {2: [0], 3: [-1.5, 1.5], 4: [-3, 0, 3]};

// <PenaltySettings> ////////////////////////////////////////////////////////////////////////////////

RaceControl.penaltyTime         = 15;                       // Time in seconds lost for a incorrect answer
RaceControl.penaltySpeed        = -0.1;                     // Percentage speed change for an incorrect answer

RaceControl.parsePenalty = function (xml) {
    var node = $(xml).find('PenaltySettings');
    
    RaceControl.helper(RaceControl, 'penaltyTime', node.attr('TimeLost'));
    RaceControl.helper(RaceControl, 'penaltySpeed', node.attr('SpeedLost'));
    RaceControl.penaltySpeed *= -1;
};

// <SpeedSettings> ////////////////////////////////////////////////////////////////////////////////

RaceControl.maxSpeed = 150;
RaceControl.minSpeed = 10; <!-- mvy: raise default speed-->
RaceControl.defaultSpeed = 18;
RaceControl.acceleration = 13;
RaceControl.deceleration = 26;
RaceControl.turboSpeed = 150;

RaceControl.maxTimeWindow       = 110 / 150.0 * 0.9;        // Minimum time between two important z values: min z spacing / max speed * 90%
RaceControl.maxDistWindow       = 300;                      // Maximum distance coverable in 2 seconds

RaceControl.parseSpeed = function (xml) {
    var node = $(xml).find('SpeedSettings');
    
    var max = node.attr('Max');
    var min = node.attr('Min');
    var speed = node.attr('Default');
    var turbo = node.attr('Turbo');
    
    // Set the values on the player
    RaceControl.helper(RaceControl, 'maxSpeed', max);
    RaceControl.helper(RaceControl, 'minSpeed', min);
    RaceControl.helper(RaceControl, 'zVelocity', speed==null ? min : speed);
    RaceControl.helper(RaceControl, 'acceleration', node.attr('Acceleration'));
    RaceControl.helper(RaceControl, 'deceleration', node.attr('Deceleration'));
    RaceControl.helper(RaceControl, 'turboSpeed', turbo==null ? max : turbo);
};

// Calculate new min safe time
RaceControl.calcMTW = function() {
    var minDist = Math.min(RaceControl.questionSpacing, RaceControl.intermissionSpacing);
    minDist = Math.min(minDist, RaceControl.finishSpacing);
    var maxSpeed = Math.max(RaceControl.maxSpeed, RaceControl.turboSpeed);
    
    RaceControl.maxTimeWindow = minDist / maxSpeed * 0.9;
};

RaceControl.postParse = function() {
    RaceControl.calcMTW();
    
    // Process edge medal information
    RaceControl.times[0] = RaceControl.finishLine / RaceControl.maxSpeed;
    RaceControl.times[3] = RaceControl.times[2] * 1.5;
    
    // Sanity check
    if(RaceControl.times[0] > RaceControl.times[1]) {
        console.log('WARNING: Calculated minimum time ( ' + RaceControl.times[0] + ' ) is longer than the maximum allowed time for a gold medal ( ' + RaceControl.times[1] + ' ).');
    }
};

module.exports = RaceControl
}, mimetype: "application/javascript", remote: false}; // END: /RaceControl.js


__jah__.resources["/resources/Background/city.png"] = {data: __jah__.assetURL + "/resources/Background/city.png", mimetype: "image/png", remote: true};
__jah__.resources["/resources/Background/dividingLines3.png"] = {data: __jah__.assetURL + "/resources/Background/dividingLines3.png", mimetype: "image/png", remote: true};
__jah__.resources["/resources/Background/pavement.png"] = {data: __jah__.assetURL + "/resources/Background/pavement.png", mimetype: "image/png", remote: true};
__jah__.resources["/resources/Background/sky.png"] = {data: __jah__.assetURL + "/resources/Background/sky.png", mimetype: "image/png", remote: true};
__jah__.resources["/resources/Background/street.png"] = {data: __jah__.assetURL + "/resources/Background/street.png", mimetype: "image/png", remote: true};
__jah__.resources["/resources/black.png"] = {data: __jah__.assetURL + "/resources/black.png", mimetype: "image/png", remote: true};
__jah__.resources["/resources/Buttons/buttonNextLevelClick.png"] = {data: __jah__.assetURL + "/resources/Buttons/buttonNextLevelClick.png", mimetype: "image/png", remote: true};
__jah__.resources["/resources/Buttons/buttonNextLevelDisabled.png"] = {data: __jah__.assetURL + "/resources/Buttons/buttonNextLevelDisabled.png", mimetype: "image/png", remote: true};
__jah__.resources["/resources/Buttons/buttonNextLevelNormal.png"] = {data: __jah__.assetURL + "/resources/Buttons/buttonNextLevelNormal.png", mimetype: "image/png", remote: true};
__jah__.resources["/resources/Buttons/buttonRetryClick.png"] = {data: __jah__.assetURL + "/resources/Buttons/buttonRetryClick.png", mimetype: "image/png", remote: true};
__jah__.resources["/resources/Buttons/buttonRetryNormal.png"] = {data: __jah__.assetURL + "/resources/Buttons/buttonRetryNormal.png", mimetype: "image/png", remote: true};
__jah__.resources["/resources/Buttons/buttonStartClick.png"] = {data: __jah__.assetURL + "/resources/Buttons/buttonStartClick.png", mimetype: "image/png", remote: true};
__jah__.resources["/resources/Buttons/buttonStartClickAlt.png"] = {data: __jah__.assetURL + "/resources/Buttons/buttonStartClickAlt.png", mimetype: "image/png", remote: true};
__jah__.resources["/resources/Buttons/buttonStartNormal.png"] = {data: __jah__.assetURL + "/resources/Buttons/buttonStartNormal.png", mimetype: "image/png", remote: true};

__jah__.resources["/resources/Buttons/buttonLeftClick.png"] = {data: __jah__.assetURL + "/resources/Buttons/buttonLeftClick.png", mimetype: "image/png", remote: true}; // mvy 
__jah__.resources["/resources/Buttons/buttonLeftNormal.png"] = {data: __jah__.assetURL + "/resources/Buttons/buttonLeftNormal.png", mimetype: "image/png", remote: true}; // mvy 
__jah__.resources["/resources/Buttons/buttonRightClick.png"] = {data: __jah__.assetURL + "/resources/Buttons/buttonRightClick.png", mimetype: "image/png", remote: true}; // mvy 
__jah__.resources["/resources/Buttons/buttonRightNormal.png"] = {data: __jah__.assetURL + "/resources/Buttons/buttonRightNormal.png", mimetype: "image/png", remote: true}; // mvy 
__jah__.resources["/resources/Buttons/buttonBreakClick.png"] = {data: __jah__.assetURL + "/resources/Buttons/buttonBreakClick.png", mimetype: "image/png", remote: true}; // mvy 
__jah__.resources["/resources/Buttons/buttonBreakNormal.png"] = {data: __jah__.assetURL + "/resources/Buttons/buttonBreakNormal.png", mimetype: "image/png", remote: true}; // mvy 
__jah__.resources["/resources/Buttons/buttonAccelerateClick.png"] = {data: __jah__.assetURL + "/resources/Buttons/buttonAccelerateClick.png", mimetype: "image/png", remote: true}; // mvy 
__jah__.resources["/resources/Buttons/buttonAccelerateNormal.png"] = {data: __jah__.assetURL + "/resources/Buttons/buttonAccelerateNormal.png", mimetype: "image/png", remote: true}; // mvy 

__jah__.resources["/resources/carNumberA.png"] = {data: __jah__.assetURL + "/resources/carNumberA.png", mimetype: "image/png", remote: true};
__jah__.resources["/resources/carNumberB.png"] = {data: __jah__.assetURL + "/resources/carNumberB.png", mimetype: "image/png", remote: true};
__jah__.resources["/resources/carnumber_animation/carNumberA01.png"] = {data: __jah__.assetURL + "/resources/carnumber_animation/carNumberA01.png", mimetype: "image/png", remote: true};
__jah__.resources["/resources/carnumber_animation/carNumberA02.png"] = {data: __jah__.assetURL + "/resources/carnumber_animation/carNumberA02.png", mimetype: "image/png", remote: true};
__jah__.resources["/resources/carnumber_animation/carNumberA03.png"] = {data: __jah__.assetURL + "/resources/carnumber_animation/carNumberA03.png", mimetype: "image/png", remote: true};
__jah__.resources["/resources/carnumber_animation/carNumberA04.png"] = {data: __jah__.assetURL + "/resources/carnumber_animation/carNumberA04.png", mimetype: "image/png", remote: true};
__jah__.resources["/resources/carnumber_animation/carNumberB01.png"] = {data: __jah__.assetURL + "/resources/carnumber_animation/carNumberB01.png", mimetype: "image/png", remote: true};
__jah__.resources["/resources/carnumber_animation/carNumberB02.png"] = {data: __jah__.assetURL + "/resources/carnumber_animation/carNumberB02.png", mimetype: "image/png", remote: true};
__jah__.resources["/resources/carnumber_animation/carNumberB03.png"] = {data: __jah__.assetURL + "/resources/carnumber_animation/carNumberB03.png", mimetype: "image/png", remote: true};
__jah__.resources["/resources/carnumber_animation/carNumberB04.png"] = {data: __jah__.assetURL + "/resources/carnumber_animation/carNumberB04.png", mimetype: "image/png", remote: true};
__jah__.resources["/resources/Cars/Car-left.png"] = {data: __jah__.assetURL + "/resources/Cars/Car-left.png", mimetype: "image/png", remote: true};
__jah__.resources["/resources/Cars/Car-right.png"] = {data: __jah__.assetURL + "/resources/Cars/Car-right.png", mimetype: "image/png", remote: true};
__jah__.resources["/resources/Cars/carBronze01.png"] = {data: __jah__.assetURL + "/resources/Cars/carBronze01.png", mimetype: "image/png", remote: true};
__jah__.resources["/resources/Cars/carBronze02.png"] = {data: __jah__.assetURL + "/resources/Cars/carBronze02.png", mimetype: "image/png", remote: true};
__jah__.resources["/resources/Cars/carBronze03.png"] = {data: __jah__.assetURL + "/resources/Cars/carBronze03.png", mimetype: "image/png", remote: true};
__jah__.resources["/resources/Cars/carBronze04.png"] = {data: __jah__.assetURL + "/resources/Cars/carBronze04.png", mimetype: "image/png", remote: true};
__jah__.resources["/resources/Cars/carGold01.png"] = {data: __jah__.assetURL + "/resources/Cars/carGold01.png", mimetype: "image/png", remote: true};
__jah__.resources["/resources/Cars/carGold02.png"] = {data: __jah__.assetURL + "/resources/Cars/carGold02.png", mimetype: "image/png", remote: true};
__jah__.resources["/resources/Cars/carGold03.png"] = {data: __jah__.assetURL + "/resources/Cars/carGold03.png", mimetype: "image/png", remote: true};
__jah__.resources["/resources/Cars/carGold04.png"] = {data: __jah__.assetURL + "/resources/Cars/carGold04.png", mimetype: "image/png", remote: true};
__jah__.resources["/resources/Cars/carPlayer01.png"] = {data: __jah__.assetURL + "/resources/Cars/carPlayer01.png", mimetype: "image/png", remote: true};
__jah__.resources["/resources/Cars/carPlayer02.png"] = {data: __jah__.assetURL + "/resources/Cars/carPlayer02.png", mimetype: "image/png", remote: true};
__jah__.resources["/resources/Cars/carPlayer03.png"] = {data: __jah__.assetURL + "/resources/Cars/carPlayer03.png", mimetype: "image/png", remote: true};
__jah__.resources["/resources/Cars/carPlayer04.png"] = {data: __jah__.assetURL + "/resources/Cars/carPlayer04.png", mimetype: "image/png", remote: true};
__jah__.resources["/resources/Cars/carSilver01.png"] = {data: __jah__.assetURL + "/resources/Cars/carSilver01.png", mimetype: "image/png", remote: true};
__jah__.resources["/resources/Cars/carSilver02.png"] = {data: __jah__.assetURL + "/resources/Cars/carSilver02.png", mimetype: "image/png", remote: true};
__jah__.resources["/resources/Cars/carSilver03.png"] = {data: __jah__.assetURL + "/resources/Cars/carSilver03.png", mimetype: "image/png", remote: true};
__jah__.resources["/resources/Cars/carSilver04.png"] = {data: __jah__.assetURL + "/resources/Cars/carSilver04.png", mimetype: "image/png", remote: true};
__jah__.resources["/resources/checkPoint.png"] = {data: __jah__.assetURL + "/resources/checkPoint.png", mimetype: "image/png", remote: true};
__jah__.resources["/resources/Dashboard/dashBoardBack.png"] = {data: __jah__.assetURL + "/resources/Dashboard/dashBoardBack.png", mimetype: "image/png", remote: true};
__jah__.resources["/resources/Dashboard/dashBoardDials.png"] = {data: __jah__.assetURL + "/resources/Dashboard/dashBoardDials.png", mimetype: "image/png", remote: true};
__jah__.resources["/resources/Dashboard/dashBoardFront.png"] = {data: __jah__.assetURL + "/resources/Dashboard/dashBoardFront.png", mimetype: "image/png", remote: true};
__jah__.resources["/resources/Dashboard/dashBoardHash.png"] = {data: __jah__.assetURL + "/resources/Dashboard/dashBoardHash.png", mimetype: "image/png", remote: true};
__jah__.resources["/resources/Dashboard/dashBoardMedalBlack.png"] = {data: __jah__.assetURL + "/resources/Dashboard/dashBoardMedalBlack.png", mimetype: "image/png", remote: true};
__jah__.resources["/resources/Dashboard/dashBoardMedalBronze.png"] = {data: __jah__.assetURL + "/resources/Dashboard/dashBoardMedalBronze.png", mimetype: "image/png", remote: true};
__jah__.resources["/resources/Dashboard/dashBoardMedalDotBronze.png"] = {data: __jah__.assetURL + "/resources/Dashboard/dashBoardMedalDotBronze.png", mimetype: "image/png", remote: true};
__jah__.resources["/resources/Dashboard/dashBoardMedalDotGold.png"] = {data: __jah__.assetURL + "/resources/Dashboard/dashBoardMedalDotGold.png", mimetype: "image/png", remote: true};
__jah__.resources["/resources/Dashboard/dashBoardMedalDotPlayer.png"] = {data: __jah__.assetURL + "/resources/Dashboard/dashBoardMedalDotPlayer.png", mimetype: "image/png", remote: true};
__jah__.resources["/resources/Dashboard/dashBoardMedalDotSilver.png"] = {data: __jah__.assetURL + "/resources/Dashboard/dashBoardMedalDotSilver.png", mimetype: "image/png", remote: true};
__jah__.resources["/resources/Dashboard/dashBoardMedalGold.png"] = {data: __jah__.assetURL + "/resources/Dashboard/dashBoardMedalGold.png", mimetype: "image/png", remote: true};
__jah__.resources["/resources/Dashboard/dashBoardMedalIndicator.png"] = {data: __jah__.assetURL + "/resources/Dashboard/dashBoardMedalIndicator.png", mimetype: "image/png", remote: true};
__jah__.resources["/resources/Dashboard/dashBoardMedalSilver.png"] = {data: __jah__.assetURL + "/resources/Dashboard/dashBoardMedalSilver.png", mimetype: "image/png", remote: true};
__jah__.resources["/resources/Dashboard/dashBoardMusicOff.png"] = {data: __jah__.assetURL + "/resources/Dashboard/dashBoardMusicOff.png", mimetype: "image/png", remote: true};
__jah__.resources["/resources/Dashboard/dashBoardMusicOn.png"] = {data: __jah__.assetURL + "/resources/Dashboard/dashBoardMusicOn.png", mimetype: "image/png", remote: true};
__jah__.resources["/resources/Dashboard/dashBoardNeedle.png"] = {data: __jah__.assetURL + "/resources/Dashboard/dashBoardNeedle.png", mimetype: "image/png", remote: true};
__jah__.resources["/resources/Dashboard/dashBoardSoundOff.png"] = {data: __jah__.assetURL + "/resources/Dashboard/dashBoardSoundOff.png", mimetype: "image/png", remote: true};
__jah__.resources["/resources/Dashboard/dashBoardSoundOn.png"] = {data: __jah__.assetURL + "/resources/Dashboard/dashBoardSoundOn.png", mimetype: "image/png", remote: true};
__jah__.resources["/resources/EndScreen/EndScreenIndicatorBlack.png"] = {data: __jah__.assetURL + "/resources/EndScreen/EndScreenIndicatorBlack.png", mimetype: "image/png", remote: true};
__jah__.resources["/resources/EndScreen/EndScreenIndicatorBronze.png"] = {data: __jah__.assetURL + "/resources/EndScreen/EndScreenIndicatorBronze.png", mimetype: "image/png", remote: true};
__jah__.resources["/resources/EndScreen/EndScreenIndicatorGold.png"] = {data: __jah__.assetURL + "/resources/EndScreen/EndScreenIndicatorGold.png", mimetype: "image/png", remote: true};
__jah__.resources["/resources/EndScreen/EndScreenIndicatorSilver.png"] = {data: __jah__.assetURL + "/resources/EndScreen/EndScreenIndicatorSilver.png", mimetype: "image/png", remote: true};
__jah__.resources["/resources/EndScreen/signEndScreenBack.png"] = {data: __jah__.assetURL + "/resources/EndScreen/signEndScreenBack.png", mimetype: "image/png", remote: true};
__jah__.resources["/resources/EndScreen/signEndScreenFront.png"] = {data: __jah__.assetURL + "/resources/EndScreen/signEndScreenFront.png", mimetype: "image/png", remote: true};
__jah__.resources["/resources/EndScreen/signEndScreenIndicator.png"] = {data: __jah__.assetURL + "/resources/EndScreen/signEndScreenIndicator.png", mimetype: "image/png", remote: true};
__jah__.resources["/resources/EndScreen/sub-bg-0.png"] = {data: __jah__.assetURL + "/resources/EndScreen/sub-bg-0.png", mimetype: "image/png", remote: true};
__jah__.resources["/resources/EndScreen/sub-bg-1.png"] = {data: __jah__.assetURL + "/resources/EndScreen/sub-bg-1.png", mimetype: "image/png", remote: true};
__jah__.resources["/resources/EndScreen/sub-bg-2.png"] = {data: __jah__.assetURL + "/resources/EndScreen/sub-bg-2.png", mimetype: "image/png", remote: true};
__jah__.resources["/resources/EndScreen/sub-bg-3.png"] = {data: __jah__.assetURL + "/resources/EndScreen/sub-bg-3.png", mimetype: "image/png", remote: true};
__jah__.resources["/resources/finishline.png"] = {data: __jah__.assetURL + "/resources/finishline.png", mimetype: "image/png", remote: true};
__jah__.resources["/resources/Fishtail/fishTailSheet.png"] = {data: __jah__.assetURL + "/resources/Fishtail/fishTailSheet.png", mimetype: "image/png", remote: true};
__jah__.resources["/resources/Font_Android_Nation/androidnation_i.ttf"] = {data: __jah__.assetURL + "/resources/Font_Android_Nation/androidnation_i.ttf", mimetype: "text/plain", remote: true};
__jah__.resources["/resources/Loader/LoadingScreen00.png"] = {data: __jah__.assetURL + "/resources/Loader/LoadingScreen00.png", mimetype: "image/png", remote: true};
__jah__.resources["/resources/Loader/LoadingScreen16.png"] = {data: __jah__.assetURL + "/resources/Loader/LoadingScreen16.png", mimetype: "image/png", remote: true};
__jah__.resources["/resources/Medals/bronzeMedal.png"] = {data: __jah__.assetURL + "/resources/Medals/bronzeMedal.png", mimetype: "image/png", remote: true};
__jah__.resources["/resources/Medals/goldMedal.png"] = {data: __jah__.assetURL + "/resources/Medals/goldMedal.png", mimetype: "image/png", remote: true};
__jah__.resources["/resources/Medals/noMedal.png"] = {data: __jah__.assetURL + "/resources/Medals/noMedal.png", mimetype: "image/png", remote: true};
__jah__.resources["/resources/Medals/silverMedal.png"] = {data: __jah__.assetURL + "/resources/Medals/silverMedal.png", mimetype: "image/png", remote: true};
__jah__.resources["/resources/roadSignA.png"] = {data: __jah__.assetURL + "/resources/roadSignA.png", mimetype: "image/png", remote: true};
__jah__.resources["/resources/roadSignB.png"] = {data: __jah__.assetURL + "/resources/roadSignB.png", mimetype: "image/png", remote: true};
__jah__.resources["/resources/sidewalk_stuff/sideWalkCrack01.png"] = {data: __jah__.assetURL + "/resources/sidewalk_stuff/sideWalkCrack01.png", mimetype: "image/png", remote: true};
__jah__.resources["/resources/sidewalk_stuff/sideWalkCrack02.png"] = {data: __jah__.assetURL + "/resources/sidewalk_stuff/sideWalkCrack02.png", mimetype: "image/png", remote: true};
__jah__.resources["/resources/sidewalk_stuff/tire.png"] = {data: __jah__.assetURL + "/resources/sidewalk_stuff/tire.png", mimetype: "image/png", remote: true};
__jah__.resources["/resources/sidewalk_stuff/tirePile01.png"] = {data: __jah__.assetURL + "/resources/sidewalk_stuff/tirePile01.png", mimetype: "image/png", remote: true};
__jah__.resources["/resources/sidewalk_stuff/tirePile02.png"] = {data: __jah__.assetURL + "/resources/sidewalk_stuff/tirePile02.png", mimetype: "image/png", remote: true};
__jah__.resources["/resources/sidewalk_stuff/trashCanSheet.png"] = {data: __jah__.assetURL + "/resources/sidewalk_stuff/trashCanSheet.png", mimetype: "image/png", remote: true};
__jah__.resources["/resources/splash.png"] = {data: __jah__.assetURL + "/resources/splash.png", mimetype: "image/png", remote: true};
__jah__.resources["/resources/splash_placeholder.png"] = {data: __jah__.assetURL + "/resources/splash_placeholder.png", mimetype: "image/png", remote: true};
__jah__.resources["/SceneryManager.js"] = {data: function (exports, require, module, __filename, __dirname) {
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



var cocos = require('cocos2d');



var SceneryManager = function(arr) {

    SceneryManager.superclass.constructor.call(this);

    

    this.objects = arr;

    this.end = 0;

};



SceneryManager.inherit(cocos.nodes.Node, {

    objects : null,     // Ordered list (by zCoord) of scenery

    start   : 0,        // 

    end     : -1,       // 

    

    update: function(dt) {

        for(var i=this.start; i<this.objects.length && i<=this.end; i+=1) {

            var ret = this.objects[i].update(dt);

            

            if(ret == -1) {

                this.start += 1;

                this.removeChild({child: this.objects[i]});

            }

            else if(ret == 1) {

                this.end += 1;

                this.addChild({child: this.objects[i]});

            }

        }

    }

});



module.exports = SceneryManager;
}, mimetype: "application/javascript", remote: false}; // END: /SceneryManager.js


__jah__.resources["/ScriptingSystem-Racecar.js"] = {data: function (exports, require, module, __filename, __dirname) {
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
    this.getInt('lane', opts);
    
    if(this.lane < 0) {
        throw new Error('[CRITICAL] [PARSE] Value for LockAbsoluteLaneAct\'s lane is negative: ' + this.lane);
    }
    
    this.getOpt('direction', opts);
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
        throw new Error('[CRITICAL] [PARSE] Invalid value for LockAbsoluteLaneAct\'s direction ( ' + this.direction + ' )');
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
    this.type = $(opts).prop("tagName");
    this.getOpt('car', opts);
    
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
        throw new Error('[CRITICAL] [PARSE] Invalid value for MedalCarAct\'s car ( ' + this.car + ' )');
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
    this.getInt('lane', opts);
    
    if(this.lane < 0) {
        throw new Error('[CRITICAL] [PARSE] Value for SetAbsoluteLaneAct\'s lane is negative: ' + this.lane);
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
    this.getInt('velocity', opts);
    
    if(this.velocity < 0) {
        throw new Error('[CRITICAL] [PARSE] Value for SetVelocityAct\'s velocity is negative: ' + this.velocity);
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
    this.getInt('lane', opts);
    
    if(this.lane < 0) {
        throw new Error('[CRITICAL] [PARSE] Value for LockAbsoluteLaneAct\'s lane is negative: ' + this.lane);
    }
    
    this.getOpt('direction', opts);
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
        throw new Error('[CRITICAL] [PARSE] Invalid value for UnlockAbsoluteLaneAct\'s direction ( ' + this.direction + ' )');
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
    this.getInt('lane', opts);
    
    if(this.lane < 0) {
        throw new Error('[CRITICAL] [PARSE] Value for AbsoluteLaneTrigger\'s lane is negative: ' + this.lane);
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
    this.getBoolean('correctness', opts, 'correct', 'incorrect');
    
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
            setTimeout(this.buffer.bind(this), 100);
        }
    },
    
    // Introduces at least a one full frame delay, making sure that this Trigger can be adaquetly check()'ed
    buffer: function() {
        setTimeout(this.negateInput.bind(this), 100);
    },
    
    // Negates a triggering input
    negateInput: function() {
        this.trigger = false;
    }
});

//***********************************************/

var CorrectLaneTrigger = function(opts) {
    CorrectLaneTrigger.superclass.constructor.call(this, opts);
    this.getInt('lane', opts);
    
    if(this.lane < 0) {
        throw new Error('[CRITICAL] [PARSE] Value for CorrectLaneTrigger\'s lane is negative: ' + this.lane);
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
        setTimeout(this.buffer.bind(this), 100);
    },
    
    // Introduces at least a one full frame delay, making sure that this Trigger can be adaquetly check()'ed
    buffer: function() {
        setTimeout(this.negateInput.bind(this), 100);
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
    this.getInt('offset', opts);
    this.getOpt('relPoint', opts);
    if(!DistanceTrigger.relPoints.hasOwnProperty(this.relPoint)) {
        throw new Error('[CRITICAL] [PARSE] DistanceTrigger has invalid relPoint ( ' + this.relPoint + ' )');
    }
    
    // Only required for certain relPoints
    if(opts.attr('ordinal')) {
        this.getInt('ordinal', opts);
        this.ordinal -= 1;
    }
    else if(this.relPoint == 'question' || this.relPoint == 'checkpoint') {
        throw new Error('[CRITICAL] [PARSE] DistanceTrigger missing "ordinal" attribute for relPoint type ( ' + this.relPoint + ' )');
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
    this.getInt('velocity', opts);
    this.getBoolean('direction', opts, 'accelerate', 'decelerate');
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
    },
    
    ss_reinitialize: function() {
        RacecarScripting.superclass.ss_reinitialize.call(this);
        
        CorrectLaneTrigger.lastCorrect = -1;
        DistanceTrigger.currentDistance = -2;
        DistanceTrigger.relPoints = {
            question    : [],
            checkpoint  : [],
            start       : 0,
            finish      : -1
        };
        VelocityTrigger.currentVelocity = -1;
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
}, mimetype: "application/javascript", remote: false}; // END: /ScriptingSystem-Racecar.js


__jah__.resources["/ScriptingSystem.js"] = {data: function (exports, require, module, __filename, __dirname) {
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
var Texture2D = require('cocos2d').Texture2D;

// Project Imports
var KeyboardLayer = require('/KeyboardLayer');

// Static Imports
var XML = require('/XML');

// Event Relay /////////////////////////////////////////////////////////////////////////////////////

// Empty object solely for providing a static relay point for cocos events
var eventRelay = {};

// Utility base class //////////////////////////////////////////////////////////////////////////////

// Both Actions and Triggers make use of these functions for retrieving values from the opts object
var OptGetters = function(opts) {
    // For once in all of this code I do NOT need to call a superclass' constructor
}
OptGetters.inherit(Object, {
    // Gets the specified value from opts, deletes it from opts and returns the fresh opts
    // Throws an error if the value does not exist within opts
    getOpt: function(name, opts) {
        if(opts.attr(name)) {
            this[name] = opts.attr(name);
            opts.removeAttr(name);
            return;
        }
        
        throw new Error('[CRITICAL] [PARSE] opts does not contain property ( ' + name + ' )');
    },
    
    // Runs getOpt and then parses the received value as an int before returning it
    // Throws an error if the value resolves to NaN
    getInt: function(name, opts) {
        this.getOpt(name, opts)
        this[name] = parseInt(this[name]);
        if(isNaN(this[name])) {
            throw new Error('[CRITICAL] [PARSE] opts[' + name +'] value is NaN after parseInt');
        }
        return opts;
    },
    
    // Runs getOpt and then parses the received value as an float before returning it
    // Throws an error if the value resolves to NaN
    getFloat: function(name, opts) {
        this.getOpt(name, opts)
        this[name] = parseFloat(this[name]);
        if(isNaN(this[name])) {
            throw new Error('[CRITICAL] [PARSE] opts[' + name +'] value is NaN after parseFloat');
        }
    },
    
    // Runs getOpt and then parses the received value as a boolean based on the true and false values provided
    // Throws an error if the value does not equal either of the provided values
    getBoolean: function(name, opts, t, f) {
        this.getOpt(name, opts);
        
        if(this[name] == t) {
            this[name] = true;
        }
        else if(this[name] == f) {
            this[name] = false;
        }
        else {
            throw new Error('[CRITICAL] [PARSE] Invalid boolean value ( ' + this[name] + ' )  Expected ( ' + t + ' || ' + f + ' )');
        }
    },
    
    // Converts all values passed in the opts object to numbers if possible
    optionalConverter: function(opts) {
		var map = {};
		var attributes = opts[0].attributes;
		var aLength = attributes.length;
		
		for (a = 0; a < aLength; a++) {
			map[attributes[a].name] = attributes[a].value;
		}
	
        for (var prop in map) {
            if (map.hasOwnProperty(prop)) {
                var ft = parseFloat(map[prop]);
                if(!isNaN(ft)) {
                    map[prop] = ft;
                }
            }
        }
        
        return map;
    },
    
    kill: function() {
        events.clearInstanceListeners(this);
    }
});

// Actions /////////////////////////////////////////////////////////////////////////////////////////

// Abstract base class for Actions
var Act = function(opts) {
    Act.superclass.constructor.call(this, opts);
    
    if(opts.attr('errorLevel')) {
        if(opts.attr('errorLevel') == 'error') {
            this.errorLevel = 0;
        }
        else if(opts.attr('errorLevel') == 'warn') {
            this.errorLevel = 1;
        }
        else if(opts.attr('errorLevel') == 'ignore') {
            this.errorLevel = 2;
        }
        else {
            throw new Error('[CRITICAL] [PARSE] Illegal value for errorLevel ( ' + opts.attr('errorLevel') + ' )');
        }
    }
}
Act.inherit(OptGetters, {
    errorLevel: null,

    // exec() is what is called when an action is executed by a ScriptingEvent
    exec: function() {
        throw new Error('[CRITICAL] [RUNTIME] [SYSTEM] Subclass of Act must override exec()');
    },
    
    hasErrorLevel: function() {
        return (this.errorLevel != null);
    }
});

//***********************************************/

// Handles all forms of audio interaction from the scripting engine
var AudioAct = function(opts) {
    AudioAct.superclass.constructor.call(this, opts);
    this.type = $(opts).prop("tagName");
    this.getOpt('contentID', opts);
    
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
        this.getFloat('volume', opts);
        if(this.volume < 0 || 1 < this.volume) {
            throw new Error('[CRITICAL] [PARSE] AudioAct volume is out of valid range [0, 1] ( ' + this.volume + ' )')
        }
    }
    else {
        throw new Error('[CRITICAL] [PARSE] Invalid AudioAct mode value ( ' + this.mode + ' )')
    }
}
AudioAct.inherit(Act, {
    contentID   : '',       // String that references the track to be accessed
    mode        : false,    // String that represents what specific audio action to perform
    volume      : 1,        // For volume actions, the level of volume to set
    
    exec: function() {
        events.trigger(eventRelay, 'AudioEvent', this.contentID, this.mode, this.volume);
    }
});

//***********************************************/

// Calls any arbitrary function on the ScriptingSystem object
var CallFunctionAct = function(opts) {
    CallFunctionAct.superclass.constructor.call(this, opts);
    this.getOpt('func', opts);
    this.params = [];
    
	var map = {};
	var attributes = opts[0].attributes;
	var aLength = attributes.length;
	
	for (a = 0; a < aLength; a++) {
		map[attributes[a].name] = attributes[a].value;
	}
	
    for (var prop in map) {
        if (map.hasOwnProperty(prop)) {
            this.params.push(map[prop])
        }
    }
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
    DelayAct.superclass.constructor.call(this, opts);
    this.getOpt('duration', opts);
    this.duration *= 1000;
}
DelayAct.inherit(Act, {
    duration    : 0,    // Duration of the delay in milliseconds
    
    // As DelayAct never 'executes', its exec() throws an error when called
    exec: function() {
        throw new Error('[CRITICAL] [RUNTIME] [SYSTEM] exec() should never be called for DelayAct');
    }
});

//***********************************************/

// Handles 'DeactivateRule', 'ReactivateRule' and 'TriggerRule'
var EventAct = function(opts) {
    EventAct.superclass.constructor.call(this, opts);
    this.getOpt('ruleID', opts);
    this.type = $(opts).prop("tagName");
    
    // Validate type parameter
    if(this.type != 'ReactivateRule' && this.type != 'DeactivateRule'
    && this.type != 'TriggerRule' && this.type != 'AbortRule'
    && this.type != 'BlockEvent' && this.type != 'ResumeEvent') {
        throw new Error('Invalid value for EventAct\'s type ( ' + this.type + ' )');
    }
}
EventAct.inherit(Act, {
    ruleID : null,     // ruleID that will be modified
    type    : null,     // The type of modification that will occur
    
    // Trigger an event to tell the ScriptingSystem to modify the specified event
    exec: function() {
        events.trigger(eventRelay, this.type + 'Event', this.ruleID);
    }
});

//***********************************************/

// Use this Action for Actions who only need is to trigger an event for something else to act on
// instead of always creating a new Act which only calls an events.trigger()
//TODO: Figure out how to implement in revised version
var GeneralPurposeAct = function(opts) {
    GeneralPurposeAct.superclass.constructor.call(this, opts);
    this.type = $(opts).prop("tagName");
}
GeneralPurposeAct.inherit(Act, {
    exec: function() {
        events.trigger(eventRelay, this.type + 'Event');
    }
});

//***********************************************/

// Hides the object on screen with the specified contentID
var HideContentAct = function(opts) {
    HideContentAct.superclass.constructor.call(this, opts);
    this.getOpt('contentID', opts);
}
HideContentAct.inherit(Act, {
    contentID   : null,
    
    exec: function() {
        events.trigger(eventRelay, 'HideContentEvent', this.contentID);
    }
});

//***********************************************/

// Tells the ScriptingSystem to load an audio track
var LoadAudioAct = function(opts) {
    LoadAudioAct.superclass.constructor.call(this, opts);
    this.getOpt('contentID', opts);
    this.getOpt('source', opts);
}
LoadAudioAct.inherit(Act, {
    contentID   : null,     // The string for referencing the audio track from the AudioMixer
    source      : null,     // The source location for the audio track
    
    exec: function() {
        this.trigger(eventRelay, 'LoadAudioEvent', this.contentID, this.source);
    }
});

//***********************************************/

// Tells the ScriptingSystem to load an image
var LoadImageAct = function(opts) {
    LoadImageAct.superclass.constructor.call(this, opts);
    this.getOpt('resourceID', opts);
    this.getOpt('source', opts);
}
LoadImageAct.inherit(Act, {
    resourceID  : null,     // The string for referencing the image once loaded
    source      : null,     // The source location for the image
    
    exec: function() {
        var img = new Image()
        __jah__.resources[this.resourceID] = {url: this.source, path: this.resourceID};
        __jah__.resources[this.resourceID].data = img;
        
        img.onload = function () {
            __jah__.resources[this.resourceID].loaded = true;
            events.trigger(eventRelay, 'RemoteLoadEvent', this.resourceID, this.source);
        }.bind(this)
        
        img.onerror = function () {
            this.generateError('[RUNTIME] [REMOTE] Failed to load resource: ' + this.resourceID + ' from ' + this.source);
        }.bind(this)
        
        img.src = this.source;
    }
});

//***********************************************/

var LoadAnimationAct = function(opts) {
    LoadAnimationAct.superclass.constructor.call(this, opts);
    this.getOpt('resourceID', opts);
    this.getOpt('source', opts);
    this.getInt('frameWidth', opts);
    this.getInt('frameHeight', opts);
    this.getInt('frames', opts);
    
    if(opts.attr('fps')) {
        this.getInt('fps', opts);
        this.frameDelay = 1.0 / this.fps;
        
        if(opts.attr('frameDelay')) {
            throw new Error('[CRITICAL] [PARSE] LoadAnimationAct cannot have both "fps" and "frameDelay"');
        }
    }
    else if(opts.attr('frameDelay')) {
        this.getFloat('frameDelay', opts);
    }
    else {
        throw new Error('[CRITICAL] [PARSE] LoadAnimationAct requires one of either "fps" or "frameDelay"');
    }
}
LoadAnimationAct.inherit(Act, {
    resourceID  : null,     // The string for referencing the image once loaded
    source      : null,     // The source location for the image
    frameWidth  : null,     // Width of each individual frame
    frameHeight : null,     // Height of the frame strip -- TODO: Allow for multiline || infer this for single line
    frames      : null,     // Number of frames in the animation
    frameDelay  : null,     // The delay in seconds between each frame
    fps         : null,     // Number of frames to be displayed per second, used to calculate frameDelay
    
    exec: function() {
        var img = new Image()
        __jah__.resources[this.resourceID] = {url: this.source, path: this.resourceID};
        __jah__.resources[this.resourceID].data = img;
        
        img.onload = function () {
            __jah__.resources[this.resourceID].loaded = true;
            
            var anim = [];
            var texture = new Texture2D({file: module.dirname + this.resourceID});
            for(var i=0; i<this.frames; i++) {
                anim.push(new cocos.SpriteFrame({texture: texture, rect: geo.rectMake(i*this.frameWidth, 0, this.frameWidth, this.frameHeight)}));
            }
            
            __jah__.resources[this.resourceID].data = new cocos.Animation({frames: anim, delay: this.frameDelay});
            
            events.trigger(eventRelay, 'RemoteLoadEvent', this.resourceID, this.source);
        }.bind(this)
        
        img.onerror = function () {
            this.generateError('[RUNTIME] [REMOTE] Failed to load resource: ' + this.resourceID + ' from ' + this.source);
        }.bind(this)
        
        img.src = this.source;
    }
});

//***********************************************/

// Execute the specified Subroutine
var CallSubroutineAct = function (opts) {
    CallSubroutineAct.superclass.constructor.call(this, opts);
    this.getOpt('subroutineID', opts);
}
CallSubroutineAct.inherit(Act, {
    subroutineID: '',
    
    exec: function() {
        events.trigger(eventRelay, 'CallSubroutine', this.subroutineID);
    }
});

//***********************************************/

// Sets the specified variable to the specified value
var SetVarAct = function (opts) {
    SetVarAct.superclass.constructor.call(this, opts);
    this.getOpt('name', opts);
    
    this.getOpt('val', opts);
    // Check to see if value can be parsed as a number
    var temp = parseFloat(this.val);
    if(!isNaN(temp)) {
        this.val = temp;
    }
    // Otherwise it is string, check for boolean values
    else if(this.val == 'true') {
        this.val = true;
    }
    else if(this.val == 'false') {
        this.val = false;
    }
    
    // Only worry about the internal property if it is present
    if(opts.attr('internal')) {
        this.getBoolean('internal', opts, 'true', 'false');
    }
    
    // If this is not specified as interal, assume the scripter is accessing ss_vars
    if(!this.internal) {
        this.name = 'ss_vars.' + this.name;
    }
}
SetVarAct.inherit(Act, {
    name    : null,     // Holds the name of the variable to set
    val     : null,     // Holds the value to set the variable to
    internal: false,    // When true, do not assume ss_vars placement
    
    exec: function() {
        events.trigger(eventRelay, 'SetVarEvent', this.name, this.val);
    }
});

//***********************************************/

// Sets the specified variable to the specified variable with an optionable modification
var SetRelVarAct = function (opts) {
    SetRelVarAct.superclass.constructor.call(this, opts);
    this.getOpt('name', opts);
    
    // Parse source variable if present, otherwise default to the result variable
    if(opts.attr('val')) {
        this.getOpt('val', opts);
    }
    else {
        this.val = this.name;
    }
    
    // Detect and parse optional operator/modifier if present
    if(opts.attr('mod')) {
        this.getOpt('mod', opts);
        var temp = parseFloat(this.mod);
        if(!isNaN(temp)) {
            this.mod = temp;
        }
        
        this.getOpt('op', opts);
        
        if(!(this.op in ScriptingSystem.ops)) {
            throw new Error('[CRITICAL] [PARSE] Unrecognized operator ( ' + this.opt + ' )');
        }
    }
    else if(opts.attr('op')) {
        throw new Error('[CRITICAL] [PARSE] SetRelVarAct has op attribute with no mod attribute');
    }
    
    // Only worry about the internal property if it is present
    if(opts.attr('internal')) {
        this.getBoolean('internal', opts, 'true', 'false');
    }
    
    // If this is not specified as interal, assume the scripter is accessing ss_vars
    if(!this.internal) {
        this.name = 'ss_vars.' + this.name;
        this.val  = 'ss_vars.' + this.val;
    }
}
SetRelVarAct.inherit(Act, {
    name    : null,     // Holds the name of the variable to set
    val     : null,     // Holds the name of the variable to copy the value from
    op      : null,     // Operation with which to combine the values + - * / %
    mod     : 0,        // Optional amount to modify the second variable
    internal: false,    // When true, do not assume ss_vars placement
    
    exec: function() {
        if(this.mod == 0) {
            events.trigger(eventRelay, 'SetRelVarEvent', this.name, this.val);
        }
        else {
            events.trigger(eventRelay, 'SetRelVarEvent', this.name, this.val, this.op, this.mod);
        }
    }
});

//***********************************************/

// Performs an operation on two variables and stores the result
var CombineVarsAct = function(opts) {
    CombineVarsAct.superclass.constructor.call(this, opts);
    this.getOpt('name', opts);
    this.getOpt('other1', opts);
    this.getOpt('other2', opts);
    this.getOpt('op');
    
    if(!(this.op in ScriptingSystem.ops)) {
        throw new Error('[CRITICAL] [PARSE] Unrecognized operator ( ' + this.opt + ' )');
    }
    
    // Only worry about the internal property if it is present
    if(opts.attr('internal')) {
        this.getBoolean('internal', opts, 'true', 'false');
    }
    
    // If this is not specified as interal, assume the scripter is accessing ss_vars
    if(!this.internal) {
        this.name = 'ss_vars.' + this.name;
        this.other1  = 'ss_vars.' + this.other1;
        this.other2  = 'ss_vars.' + this.other2;
    }
}
CombineVarsAct.inherit(Act, {
    name    : null,     // Holds the name of the variable to set
    other1  : null,     // Name of the first variable to combine
    other2  : null,     // Name of the second variable to combine
    op      : null,     // Operation with which to combine the variables + - * / %
    internal: false,    // When true, do not assume ss_vars placement
    
    exec: function() {
        events.trigger(eventRelay, 'CombineVarsEvent', this.name, this.other1, this.other2, this.op);
    }
});

//***********************************************/

// Displays a button to the screen
// ButtonInputTrigger listens for these buttons based on their 'contentID'
var ShowButtonAct = function(opts) {
    ShowButtonAct.superclass.constructor.call(this, opts);
    // Get all required values from the opts parameter
    this.getOpt('resourceUp', opts);
    this.getOpt('resourceDown', opts);
    this.getOpt('contentID', opts);
    this.getInt('x', opts);
    this.getInt('y', opts);
    
    if(opts.attr('parent')) {
        this.getOpt('parent', opts);
    }
    
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
    parent      : null,     // Parent node that the content will be a child of, null defaults to ss_dynamicNode
    params      : null,     // Parameter object for MenuItemImage constructor
    
    // Create the button and fire an event for the ScriptingSystem to display it
    exec: function() {
        var btn = new cocos.nodes.MenuItemImage(this.params);
        // Normalize coordinates from menu space (0,0 center) to layer space (0,0 lower left corner)
        var s = cocos.Director.sharedDirector.winSize;
        btn.position = new geo.Point(this.x - s.width / 2, this.y - s.height / 2);
        
        if(this.params.scaleX) {
            btn.scaleX = this.params.scaleX;
        }
        if(this.params.scaleY) {
            btn.scaleY = this.params.scaleY;
        }
        
        var menu = new cocos.nodes.Menu({items: [btn]});
        
        events.trigger(eventRelay, 'ShowButtonEvent', this.contentID, menu);
    },
    
    // Handles the button being pressed by the player
    callback: function() {
        events.trigger(eventRelay, 'ButtonInputEvent', this.contentID, this.parent);
    }
});

//***********************************************/

// Displays an image on the screen
var ShowImageAct = function(opts) {
    ShowImageAct.superclass.constructor.call(this, opts);
    
    // Get all required values from the opts parameter
    this.getOpt('resource', opts);
    this.getOpt('contentID', opts);
    this.getInt('x', opts);
    this.getInt('y', opts);
    
    if(opts.attr('parent')) {
        this.getOpt('parent', opts);
    }
    
    // Create parameter object for Sprite constructor
    this.params = this.optionalConverter(opts);
    this.params['file'] = this.resource;
}
ShowImageAct.inherit(Act, {
    resource    : null,     // Image resource to display
    contentID   : null,     // String to reference button with in scripting content tracking dictionary
    x           : null,     // X screen coordinate
    y           : null,     // Y screen coordinate
    parent      : null,     // Parent node that the content will be a child of, null defaults to ss_dynamicNode
    params      : null,     // Parameter object for Sprite constructor
    
    // Create the image and fire an event for the ScriptingSystem to display it
    exec: function() {
        var img = new cocos.nodes.Sprite(this.params);
        img.position = new geo.Point(this.x, this.y);
        
        if(this.params.scaleX) {
            img.scaleX = this.params.scaleX;
        }
        if(this.params.scaleY) {
            img.scaleY = this.params.scaleY;
        }
        
        events.trigger(eventRelay, 'ShowImageEvent', this.contentID, img, this.parent);
    }
});

//***********************************************/

// Displays a string on the screen
var ShowMessageAct = function(opts) {
    ShowMessageAct.superclass.constructor.call(this, opts);
    
    // Get all required values from the opts parameter
    this.getOpt('message', opts);
    this.getOpt('contentID', opts);
    this.getInt('x', opts);
    this.getInt('y', opts);
    
    if(opts.attr('parent')) {
        this.getOpt('parent', opts);
    }
    
    // Create parameter object for Label constructor
    this.params = this.optionalConverter(opts);
    this.params['string'] = this.message;
}
ShowMessageAct.inherit(Act, {
    message     : null,     // String to be written on the screen
    contentID   : null,     // String to reference button with in scripting content tracking dictionary
    x           : null,     // X screen coordinate
    y           : null,     // Y screen coordinate
    parent      : null,     // Parent node that the content will be a child of, null defaults to ss_dynamicNode
    params      : null,     // Parameter object for Label constructor
    
    // Create the text and fire an event for the ScriptingSystem to display it
    exec: function() {
        var msg = new cocos.nodes.Label(this.params);
        msg.position = new geo.Point(this.x, this.y);
        
        if(this.params.scaleX) {
            msg.scaleX = this.params.scaleX;
        }
        if(this.params.scaleY) {
            msg.scaleY = this.params.scaleY;
        }
        
        events.trigger(eventRelay, 'ShowMessageEvent', this.contentID, msg, this.parent);
    }
});

//***********************************************/

// Plays or loops an animation on the screen
var PlayAnimationAct = function(opts) {
    PlayAnimationAct.superclass.constructor.call(this, opts);
    
    this.getOpt('resource', opts);
    this.getOpt('contentID', opts);
    this.getInt('x', opts);
    this.getInt('y', opts);
    
    if(opts.attr('loop')) {
        this.getBoolean('loop', opts, 'true', 'false');
    }
    
    if(opts.attr('parent')) {
        this.getOpt('parent', opts);
    }
}
PlayAnimationAct.inherit(Act, {
    resource    : null,     // Image resource to display
    contentID   : null,     // String to reference animation with in scripting content tracking dictionary
    x           : null,     // X screen coordinate
    y           : null,     // Y screen coordinate
    loop        : false,    // When true, the animation loops until told to stop
    parent      : null,     // Parent node that the content will be a child of, null defaults to ss_dynamicNode
    
    exec: function() {
        var anim = new cocos.actions.Animate({animation: __jah__.resources[this.resource].data, restoreOriginalFrame: false});
    
        if(this.loop) {
            anim = new cocos.actions.RepeatForever(anim);
        }
        
        events.trigger(eventRelay, 'PlayAnimationEvent', this.contentID, anim, new geo.Point(this.x, this.y), this.parent);
    }
});

//***********************************************/

// NOTE: Stopping an animation does NOT hide it, use HideContent to remove an animation from the screen
var StopAnimationAct = function(opts) {
    StopAnimationAct.superclass.constructor.call(this, opts);
    
    this.getOpt('contentID', opts);
    
    if(opts.attr('parent')) {
        this.getOpt('parent', opts);
    }
}
StopAnimationAct.inherit(Act, {
    contentID   : null,     // String to reference animation with in scripting content tracking dictionary
    parent      : null,     // Parent node of the content, null defaults to ss_dynamicNode
    
    exec: function() {
        events.trigger(eventRelay, 'StopAnimationEvent', this.contentID, this.parent);
    }
});

//***********************************************/

var MoveContentAct = function(opts) {
    MoveContentAct.superclass.constructor.call(this, opts);
    
    this.getOpt('contentID', opts);
    this.getInt('x', opts);
    this.getInt('y', opts);
    
}
MoveContentAct.inherit(Act, {
    contentID   : null,     // String to reference button with in scripting content tracking dictionary
    x           : null,     // X screen coordinate
    y           : null,     // Y screen coordinate
    
    exec: function() {
        events.trigger(eventRelay, 'MoveContentEvent', this.contentID, new geo.Point(this.x, this.y));
    }
});

//***********************************************/

var PrintfAct = function(opts) {
    PrintfAct.superclass.constructor.call(this, opts);
    // Remove the type value from the opts object
    delete opts['type'];
    
    // Get all required values from the opts parameter
    this.getOpt('message', opts);
    this.getOpt('contentID', opts);
    this.getInt('x', opts);
    this.getInt('y', opts);
    
    var i=1;
    this.args = [];
    while(opts.attr('arg' + i)) {
        this.args.push(opts['arg' + i]);
        delete opts['arg' + i];
        i+=1;
    }
    
    this.params = this.optionalConverter(opts);
    this.params['string'] = this.message;
}
PrintfAct.inherit(Act, {
    message     : null,     // String to be written on the screen
    contentID   : null,     // String to reference button with in scripting content tracking dictionary
    x           : null,     // X screen coordinate
    y           : null,     // Y screen coordinate
    args        : null,     // 
    params      : null,     // Parameter object for Label constructor
    
    exec: function() {
        var msg = new cocos.nodes.Label(this.params);
        msg.position = new geo.Point(this.x, this.y);
        
        events.trigger(eventRelay, 'PrintfEvent', this.contentID, msg, this.args);
    }
});

//***********************************************/

// Allows for basic IF-ELSE
var ConditionalAct = function(opts) {
    // Build initial if
    ConditionalAct.superclass.constructor.call(this, opts);
    opts.attr('ruleID', 'ConditionalAct');
    this.evt = [new ConditionalEvent(opts)];
    
    // Build else-if blocks, if present
    var elif = opts.children("ELSEIF");
    var that = this;
    elif.each(function() {
        $(this).attr('ruleID', 'ConditionalAct');
        that.evt.push(new ConditionalEvent($(this)));
    });
    
    // Build else case, if present
    var eCase = opts.children("ELSE");
    
    if(eCase.length > 1) {
        throw new Error("[CRITICAL] {PARSE] Conditional Actions may only have a single ELSE block.");
    }
    else if(eCase.length == 1) {
        $(eCase).attr('ruleID', 'ConditionalAct');
        that.elseCase = new ElseEvent($(eCase));
    }
}
ConditionalAct.inherit(Act, {
    evt     : null, // List of IF-ELSE ScriptingEvents
    elseCase: null,

    exec: function() {
        var i=0
        // Interate over ScriptingEvents until one is satisfied (IF-ELSEIF...)
        while(i<this.evt.length) {
            if(this.evt[i].check()) {
                this.evt[i].exec();
                return;
            }
            i+=1
        }
        
        if(this.elseCase) {
            this.elseCase.exec();
        }
        
    },
    
    kill: function() {
        events.clearInstanceListeners(this);
		$.each(this.evt, function() {
			this.kill();
		});
    }
});

//***********************************************/

var IncludeAct = function(opts) {
    IncludeAct.superclass.constructor.call(this, opts);
    this.getOpt('path', opts);
    this.getBoolean('preload', opts, 'true', 'false');
    
    if(this.preload) {
        var that = this;
        xmlhttp = new XMLHttpRequest();
        xmlhttp.open('GET', this.path, true);
        xmlhttp.onreadystatechange=function() {
            if (xmlhttp.readyState==4) {
                that.file = xmlhttp.responseXML; 
            }
        }
        xmlhttp.send(null);
    }
}
IncludeAct.inherit(Act, {
    oneShot : false,    // Includes may only fire once
    path    : null,     // Path to the scripting xml file to include
    preload : false,    // When true, the xml file will be preloaded, and executing the action will immediately load the script
    file    : null,     // Holds the loaded XML

    exec: function() {
        if(this.oneShot) {
            //TODO: Make non-critical
            throw new Error('[CRITICAL] [RUNTIME] An IncludeAct can only ever be executed once');
        }
        
        if(this.file === null && !this.preload) {
            var that = this;
            $.get(this.path, function(data) {
                that.file = data;
                that.trigger(data);
            });
        }
        else {
            this.trigger(this.file);
        }
        
        this.oneShot = true;
        
    },
    
    trigger: function(xml) {
        var child = $(xml).find('SCRIPTING')[0];
        events.trigger(eventRelay, 'IncludeEvent', child);
        events.trigger(eventRelay, 'IncludeTriggerRule', this.path);
    }
});

// Triggers ////////////////////////////////////////////////////////////////////////////////////////

// Abstract base class for Triggers
var Trigger = function(opts) {
    Trigger.superclass.constructor.call(this, opts);
}
Trigger.inherit(OptGetters, {
    // Called to determine if Trigger is satisified (returns true if so, false otherwise)
    // Must be overridden by subclasses
    check: function() {
        throw new Error('[CRITICAL] [RUNTIME] [SYSTEM] Trigger subclasses must override check()');
    }
});

//***********************************************/

// Provides the constructor for And, Not, Or and Xor
var LogicTrigger = function(opts, min, max) {
    LogicTrigger.superclass.constructor.call(this, opts);
    this.triggers = [];
    
    // Retrieve the list of Triggers
    var t = $(opts).children();
    
    // Make sure we have a legal number of Triggers
    if(min > t.length || t.length > max) {
        throw new Error('[CRITICAL] [PARSE] ' + $(opts).prop('tagName') + ' <LogicTrigger> requires between ' + min + ' and ' + max + ' Triggers ( ' + t.length + ' )');
    }
    
    // Create Triggers
    var that = this;
    t.each(function() {
        var type = $(this).prop('tagName');
        
        if(!ScriptingSystem.triggerMap.hasOwnProperty(type)) {
            console.log('Unsupported Trigger detected ( ' + type + ' )');
        }
        
        that.triggers.push(new ScriptingSystem.triggerMap[type]($(this)));
    });
}
LogicTrigger.inherit(Trigger, {
    triggers: null,
    
    kill: function() {
        events.clearInstanceListeners(this);
		$.each(this.triggers, function() {
			this.kill();
		});
    }
});

//***********************************************/

// Only allowed a single sub-Trigger, returns the inverse of the Trigger
var NotTrigger = function(opts) {
    AndTrigger.superclass.constructor.call(this, opts, 1, 1);
}
NotTrigger.inherit(LogicTrigger, {
    check: function() {
        return (!(this.triggers[0].check()));
    }
});

//***********************************************/

// Returns true only if all of the sub-Triggers are true
var AndTrigger = function(opts) {
    AndTrigger.superclass.constructor.call(this, opts, 2, 99);
}
AndTrigger.inherit(LogicTrigger, {
    check: function() {
        var i=0;
        while(i<this.triggers.length) {
            if(!this.triggers[i].check()) {
                return false;
            }
            i += 1;
        }
        
        return true;
    }
});

//***********************************************/

// Returns true so long as at least one of the sub-Triggers is true
var OrTrigger = function(opts) {
    OrTrigger.superclass.constructor.call(this, opts, 2, 99);
}
OrTrigger.inherit(LogicTrigger, {
    check: function() {
        var i=0;
        while(i<this.triggers.length) {
            if(this.triggers[i].check()) {
                return true;
            }
            i += 1;
        }
        
        return false;
    }
});

//***********************************************/

// Must have exactly two sub-Triggers, returns true if one is true and the other is not
var XorTrigger = function(opts) {
    XorTrigger.superclass.constructor.call(this, opts, 2, 2);
}
XorTrigger.inherit(LogicTrigger, {
    check: function() {
        var a = this.triggers[0].check();
        var b = this.triggers[1].check();
        
        return ((a && !b) || (!a && b));
    }
});

//***********************************************/

// Takes no parameters and is always true
var AutoTrigger = function(opts) {
    AutoTrigger.superclass.constructor.call(this, opts);
}
AutoTrigger.inherit(Trigger, {
    check: function() {
        return true;
    }
});

//***********************************************/

// Triggers when a Button created through ShowButton with the specified contentID is pressed
var ButtonInputTrigger = function(opts) {
    ButtonInputTrigger.superclass.constructor.call(this, opts);
    this.getOpt('buttonID', opts);
    
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

// Triggers based on the value of a variable relative to a constant
var CheckVarTrigger = function(opts) {
    CheckVarTrigger.superclass.constructor.call(this, opts);
    this.getOpt('name', opts);
    this.getOpt('op', opts);
    
    if(!(this.op in CheckVarTrigger.ops)) {
        throw new Error('[CRITICAL] [PARSE] Unrecognized comparison operator ( ' + this.op + ' )');
    }
    
    this.getOpt('val', opts);
    // Check to see if value can be parsed as a number
    var temp = parseFloat(this.val);
    if(!isNaN(temp)) {
        this.val = temp;
    }
    // Otherwise it is string, check for boolean values
    else if(this.val == 'true') {
        this.val = true;
    }
    else if(this.val == 'false') {
        this.val = false;
    }
    
    // Only worry about the internal property if it is present
    if(opts.attr('internal')) {
        this.getBoolean('internal', opts, 'true', 'false');
    }
    
    // If this is not specified as interal, assume the scripter is accessing ss_vars
    if(!this.internal) {
        this.name = 'ss_vars.' + this.name;
    }
    
    // Check to see if we are comparing two variables
    if(opts.attr('twoVar')) {
        this.getBoolean('twoVar', opts, 'true', 'false');
        
        if(!this.internal) {
            this.val = 'ss_vars.' + this.val;
        }
    }
}
CheckVarTrigger.inherit(Trigger, {
    name    : null,     // Name of variable to check
    op      : '',       // == === != !== > < >= <=
    val     : null,     // Value to compare against
    twoVar  : false,    // When true, use val as a second variable to check against
    internal: false,    // When true, do not assume ss_vars placement
    
    check: function() {
        var firstVar = CheckVarTrigger.get(this.name)
        var secondVar = this.val;
        if(this.twoVar) {
            secondVar = CheckVarTrigger.get(this.val);
        }
        
        return CheckVarTrigger.ops[this.op].call(this, firstVar, secondVar);
    }
});

CheckVarTrigger.get = null;     // Stores the get function for accessing variables
CheckVarTrigger.ops = {         // Stores operator functions by their string representation
    '==' : function (a, b) { return a ==  b; },
    '===': function (a, b) { return a === b; },
    '!=' : function (a, b) { return a !=  b; },
    '!==': function (a, b) { return a !== b; },
    '>'  : function (a, b) { return a >   b; },
    '<'  : function (a, b) { return a <   b; },
    '>=' : function (a, b) { return a >=  b; },
    '<=' : function (a, b) { return a <=  b; }
}

//***********************************************/

//TODO: Requires interrupt system to be designed/implemented
var ErrorTrigger = function(opts) {
    ErrorTrigger.superclass.constructor.call(this, opts);
}
ErrorTrigger.inherit(Trigger, {
    check: function() {
        return false;
    }
});

//***********************************************/

// Triggers anytime after the specified xml path has been included
var IncludeTrigger = function(opts) {
    IncludeTrigger.superclass.constructor.call(this, opts);
    this.getOpt('path', opts);
    events.addListener(eventRelay, 'IncludeTriggerRule', this.handle.bind(this));
}
IncludeTrigger.inherit(Trigger, {
    path        : null,     // Path of included file that this will trigger on
    included    : false,    // True once the file has been included
    
    check: function() {
        return this.included;
    },
    
    handle: function(path) {
        if(this.path == path) {
            this.included = true;
        }
    }
});

//***********************************************/

// Triggers based on keyboard input
var KeyTrigger = function(opts) {
    KeyTrigger.superclass.constructor.call(this, opts);
    this.getOpt('key', opts);
    if(this.key.length == 1) {
        this.key = this.key.toUpperCase();
        this.key = this.key.charCodeAt(0);
    }
    // Treat as int if keyVal is true (i.e. providing actual keyCode)
    else {
        this.key = parseInt(this.key);
        if(isNaN(this.key)) {
            throw new Error('[CRITICAL] [PARSE] KeyTrigger\'s length != 1 and key resolves to NaN with parseInt');
        }
    }
    
    this.getBoolean('state', opts, 'down', 'up');
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

var RemoteLoadTrigger = function(opts) {
    RemoteLoadTrigger.superclass.constructor.call(this, opts);
    this.getOpt('resourceID', opts);
    
    events.addListener(eventRelay, 'RemoteLoadEvent', this.handle.bind(this));
}
RemoteLoadTrigger.inherit(Trigger, {
    resourceID  : '',       // Name of this trigger
    state       : false,    // If this trigger has been activated
    
    // Checks to see if the the trigger has fired and reset if it does not toggle
    check: function() {
        return this.state;
    },
    
    // Checks the id against the triggerID and handles the toggle value
    handle: function(id) {
        if(this.resourceID == id) {
            this.state = true;
        }
    }
});

//***********************************************/

// Triggers after a certain amount of time has elapsed since either the ScriptingSystem or the game stated
var TimeTrigger = function(opts) {
    TimeTrigger.superclass.constructor.call(this, opts);
    this.getFloat('duration', opts);
    this.getBoolean('timer', opts, 'game', 'system');
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

// ConditionalEvent ////////////////////////////////////////////////////////////////////////////////

ConditionalEvent = function(xml) {
    // Initialize values
    this.triggers = [];
    this.actions = [];
    
    // Retrieve a list of Triggers and Actions
    var t = $(xml).children('TRIGGERS');
    var a = $(xml).children('ACTIONS');
    
    // Make sure we have at least one of each so that the Event is valid
    if(t.length != 1) {
        throw new Error('[CRITICAL] [PARSE] Event requires exactly one Trigger block');
    }
    if(a.length != 1) {
        throw new Error('[CRITICAL] [PARSE] Event requires exactly one Action block');
    }
    
    var that = this;
    t.children().each(function() {
        var type = $(this).prop('tagName');
        
        if(!ScriptingSystem.triggerMap.hasOwnProperty(type)) {
            console.log('Unsupported Trigger detected ( ' + type + ' )');
        }
        
        that.triggers.push(new ScriptingSystem.triggerMap[type]($(this)));
    });
    
    a.children().each(function() {
        var type = $(this).prop('tagName');
        
        if(!ScriptingSystem.actionMap.hasOwnProperty(type)) {
            console.log('Unsupported Action detected ( ' + type + ' )');
        }
        else if(type == 'Delay' && that.endTrans) {
            throw new Error('[CRITICAL] [PARSE] Delay cannot be used inside of a Conditional or ELSEIF');
        }
        
        that.actions.push(new ScriptingSystem.actionMap[type]($(this)));
    });
    
    if(xml.attr('errorLevel')) {
        if(xml.attr('errorLevel') == 'error') {
            this.errorLevel = 0;
        }
        else if(xml.attr('errorLevel') == 'warn') {
            this.errorLevel = 1;
        }
        else if(xml.attr('errorLevel') == 'ignore') {
            this.errorLevel = 2;
        }
        else {
            throw new Error('[CRITICAL] [PARSE] Illegal value for errorLevel ( ' + xml.attr('errorLevel') + ' )');
        }
    }
    else {
        this.errorLevel = 0;
    }
}
ConditionalEvent.inherit(Object, {
    triggers: null,     // List of triggers required to be true
    actions : null,     // Sequential list of actions
    
    execNum : 0,        // Current action in the list of actions that is being executed
    
    errorLevel: 0,      // 0: Error, 1: Warn, 2: Ignore
    curErrorLevel: 0,   //
    
    // Used to clean up and remove events permenantly
    kill: function() {
        events.clearInstanceListeners(this);
		$.each(this.triggers, function() {
			this.kill();
		});
		$.each(this.actions, function() {
			this.kill();
		});
    },
    
    // Returns true if all triggers are true
    check: function() {
        var i = 0;
        while(i < this.triggers.length) {
            if(!this.triggers[i++].check()) {
                return false;
            }
        }
        
        return true;
    },
    
    // Executes all actions
    exec: function() {
        this.setErrorLevel();
        while(this.execNum < this.actions.length) {
            this.actions[this.execNum++].exec();
        }
        this.execNum = 0;
    },
    
    setErrorLevel: function() {
        var er = this.actions[this.execNum].hasErrorLevel() ? this.actions[this.execNum].errorLevel : this.errorLevel;
        events.trigger(this, 'ErrorLevelEvent', er);
        this.curErrorLevel = er;
    },
    
    // Handles error generation for runtime error (parsing errors are always thrown)
    generateError: function(str) {
        if(this.curErrorLevel == 0) {
            throw new Error('[RUNTIME] ' + str);
        }
        else if(this.curErrorLevel == 1) {
            console.log('[RUNTIME] WARNING: ' + str);
        }
        else if(this.curErrorLevel != 2) {
            throw new Error('[RUNTIME] [CRITICAL] Error generated and handled with an invalid errorLevel ( ' + this.errorLevel + ' )');
        }
    }
});

// Special case of ConditionalEvent used for ELSE blocks
ElseEvent = function(xml) {
    this.actions = [];
    var t = $(xml).children('TRIGGERS');
    var a = $(xml).children('ACTIONS');
    
    // Make sure we have at least one of each so that the Event is valid
    if(t.length != 0) {
        throw new Error('[CRITICAL] [PARSE] ELSE block cannot have any Trigger blocks');
    }
    if(a.length != 1) {
        throw new Error('[CRITICAL] [PARSE] ELSE block requires exactly one Action block');
    }
    
    var that = this;
    a.children().each(function() {
        var type = $(this).prop('tagName');
        
        if(!ScriptingSystem.actionMap.hasOwnProperty(type)) {
            console.log('Unsupported Action detected ( ' + type + ' )');
        }
        else if(type == 'Delay') {
            throw new Error('[CRITICAL] [PARSE] Delay cannot be used inside of an ELSE');
        }
        
        that.actions.push(new ScriptingSystem.actionMap[type]($(this)));
    });
    
    if(xml.attr('errorLevel')) {
        if(xml.attr('errorLevel') == 'error') {
            this.errorLevel = 0;
        }
        else if(xml.attr('errorLevel') == 'warn') {
            this.errorLevel = 1;
        }
        else if(xml.attr('errorLevel') == 'ignore') {
            this.errorLevel = 2;
        }
        else {
            throw new Error('[CRITICAL] [PARSE] Illegal value for errorLevel ( ' + xml.attr('errorLevel') + ' )');
        }
    }
    else {
        this.errorLevel = 0;
    }
}
ElseEvent.inherit(ConditionalEvent, {
});

// Subroutine //////////////////////////////////////////////////////////////////////////////////////

Subroutine = function(xml) {
    this.subroutineID = xml.attr('subroutineID');
    
    this.actions = [];
    var a = $(xml).children('ACTIONS');
    
    var that = this;
    a.children().each(function() {
        var type = $(this).prop('tagName');
        
        if(!ScriptingSystem.actionMap.hasOwnProperty(type)) {
            console.log('Unsupported Action detected ( ' + type + ' )');
        }
        else if(type == 'Delay') {
            throw new Error('[CRITICAL] [PARSE] Delay cannot be used inside of a Subroutine');
        }
        
        that.actions.push(new ScriptingSystem.actionMap[type]($(this)));
    });
    
    if(xml.attr('errorLevel')) {
        if(xml.attr('errorLevel') == 'error') {
            this.errorLevel = 0;
        }
        else if(xml.attr('errorLevel') == 'warn') {
            this.errorLevel = 1;
        }
        else if(xml.attr('errorLevel') == 'ignore') {
            this.errorLevel = 2;
        }
        else {
            throw new Error('[CRITICAL] [PARSE] Illegal value for errorLevel ( ' + xml.attr('errorLevel') + ' )');
        }
    }
}
Subroutine.inherit(ConditionalEvent, {
    subroutineID: null,
    
    kill: function() {
        events.clearInstanceListeners(this);
		$.each(this.actions, function() {
			this.kill();
		});
    }
});

// ScriptingEvent //////////////////////////////////////////////////////////////////////////////////

// Represents a single event composed of at least one Trigger and at least one Action
var ScriptingEvent = function(xml) {
    ScriptingEvent.superclass.constructor.call(this, xml);
    
    this.ruleID = xml.attr('ruleID');
    this.endTrans = ScriptingEvent.NO_STATE;
    
    // If optional state attribute is present, parse it
    if(xml.attr('state')) {
        if(xml.attr('state') == 'active') {
            this.state = ScriptingEvent.ACTIVE;
        }
        else if(xml.attr('state') == 'inactive') {
            this.state = ScriptingEvent.INACTIVE;
        }
        else {
            throw new Error('[CRITICAL] [PARSE] Event ' + this.ruleID + ' has invalid starting state ' + xml.attr('state'));
        }
    }
    // Otherwise default to active
    else {
        this.state = ScriptingEvent.ACTIVE;
    }
    
    this.initState = this.state;
}

ScriptingEvent.inherit(ConditionalEvent, {
    ruleID     : '',       // String for indentifying this event
    
    aborting    : false,    // True when aborting from execution
    delay       : null,     // Holds the current delay timeout, null otherwise
    
    state       : ScriptingEvent.NO_STATE,  // Current state
    endTrans    : ScriptingEvent.NO_STATE,  // State to change to from the TRANSITION state
    initState   : ScriptingEvent.NO_STATE,  // Initial state when starting/rebooting
    
    // Returns true if this event is allowed to exec()
    canExec: function() {
        return this.state == ScriptingEvent.ACTIVE;
    },
    
    // Returns true if this event is allowed to abort()
    canAbort: function() {
        return this.state == ScriptingEvent.EXECUTING;
    },
    
    // Executes all actions
    exec: function() {
        // If the ending state has not been set (ie the ScriptingEvent just started executing)
        // Set the ending state to the default of INACTIVE
        if(this.endTrans == ScriptingEvent.NO_STATE) {
            this.endTrans = ScriptingEvent.INACTIVE;
        }
        
        this.delay = null;
        
        // Make sure that the ScriptingEvent is flagged as EXECUTING during execution
        this.state = ScriptingEvent.EXECUTING;
        
        while(this.execNum < this.actions.length) {
            // Abort cases
            if(this.aborting) {
                this.aborting = false;
                return;
            }
            
            // Set error level for this action
            this.setErrorLevel();
            
            // Catch special Delay case
            if(this.actions[this.execNum] instanceof DelayAct) {
                this.delay = setTimeout(this.exec.bind(this), this.actions[this.execNum].duration);
                this.execNum++;
                return;
            }
        
            // Otherwise continue executing as normal
            this.actions[this.execNum++].exec();
        }
        
        // Start transitioning when finished
        this.state = ScriptingEvent.TRANSITIONING;
    },
    
    // Tell the event to abort execution
    abort: function() {
        if(!this.canAbort()) {
            this.generateError('Cannot abort non-executing event ( ' + this.ruleID + ' )');
            return;
        }
        
        if(this.delay != null) {
            clearTimeout(this.delay);
            this.delay = null;
        }
        else {
            this.aborting = true;
        }
        
        this.state = ScriptingEvent.TRANSITIONING;
    },
    
    // Begins activating the event
    activate: function(errLvl) {
        this.curErrorLevel = errLvl;
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
                this.generateError('Cannot activate ' + this.ruleID + ' when endTrans is already ACTIVE');
            }
        }
        
        // Otherwise warn that the state change cannot occur
        else {
            this.generateError('Cannot activate ' + this.ruleID + ' when in NO_STATE or ACTIVE');
        }
    },
    
    // Begins deactivating the event
    deactivate: function(errLvl) {
        this.curErrorLevel = errLvl;
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
                this.generateError('Cannot deactivate ' + this.ruleID + ' when endTrans is already INACTIVE');
            }
        }
        
        // Otherwise warn that the state change cannot occur
        else {
            this.generateError('Cannot deactivate ' + this.ruleID + ' when in NO_STATE or INACTIVE');
        }
    },
    
    // Handles automatically changing states
    updateState: function() {
        if(this.state != ScriptingEvent.TRANSITIONING) {
            return;
        }
        
        if(this.endTrans == ScriptingEvent.ACTIVE || this.endTrans == ScriptingEvent.INACTIVE) {
            this.state = this.endTrans;
            this.endTrans = ScriptingEvent.NO_STATE;
            
            this.execNum = 0;
        }
        else {
            this.generateError('Cannot transition to NO_STATE, EXECUTING or TRANSITIONING');
        }
    },
    
    kill: function() {
        ScriptingEvent.superclass.kill.call(this);
        if(this.canAbort) {
            clearTimeout(this.delay);
            this.delay = null;
        }
        
        this.state = ScriptingEvent.KILLED;
        this.endTrans = ScriptingEvent.KILLED;
    },
    
    reboot: function() {
        this.state = this.initState;
    }
});

// State static constants
ScriptingEvent.KILLED           = -2;   // The event has been forcibly killed and deactivated
ScriptingEvent.NO_STATE         = -1;   // Something has gone wrong if we end up here
ScriptingEvent.ACTIVE           = 0;    // Event is Active, ready to be triggered
ScriptingEvent.EXECUTING        = 1;    // Event is currently executing or delayed
ScriptingEvent.INACTIVE         = 2;    // Event is Inactive and cannot be triggered
ScriptingEvent.TRANSITIONING    = 3;    // Event will transitioning to Active/Inactive at the end of frame

// Scripting System ////////////////////////////////////////////////////////////////////////////////

var ScriptingSystem = function() {
    ScriptingSystem.superclass.constructor.call(this);

    // Initialize objects
    this.ss_eventList = {};
    this.ss_subroutineList = {};
    this.ss_tracker = {};
    this.ss_vars = {};
    
    this.ss_dynamicNode = new cocos.nodes.Node();
    this.addChild({child: this.ss_dynamicNode, z: 200});
    
    // Register Actions
    this.addAction('Delay',             DelayAct);
    this.addAction('DeactivateRule',    EventAct,       'DeactivateRuleEvent', this.DeactivateRule.bind(this));
    this.addAction('ReactivateRule',    EventAct,       'ReactivateRuleEvent', this.ReactivateRule.bind(this));
    this.addAction('TriggerRule',       EventAct,       'TriggerRuleEvent',    this.TriggerRule.bind(this));
    this.addAction('AbortRule',         EventAct,       'AbortRuleEvent',      this.AbortRule.bind(this));
    this.addAction('CallFunction',      CallFunctionAct,'CallFunctionEvent',    this.callFunction.bind(this));
    this.addAction('ShowButton',        ShowButtonAct,  'ShowButtonEvent',      this.showContent.bind(this));
    this.addAction('ShowImage',         ShowImageAct,   'ShowImageEvent',       this.showContent.bind(this));
    this.addAction('ShowMessage',       ShowMessageAct, 'ShowMessageEvent',     this.showContent.bind(this));
    this.addAction('PlayAnimation',     PlayAnimationAct,'PlayAnimationEvent',  this.playAnimation.bind(this));
    this.addAction('StopAnimation',     StopAnimationAct,'StopAnimationEvent',  this.stopAnimation.bind(this));
    this.addAction('MoveContent',       MoveContentAct, 'MoveContentEvent',     this.moveContent.bind(this));
    this.addAction('HideContent',       HideContentAct, 'HideContentEvent',     this.hideContent.bind(this));
    this.addAction('LoadAudio',         LoadAudioAct,   'LoadAudioEvent',       this.loadAudio.bind(this));
    this.addAction('LoadImage',         LoadImageAct);
    this.addAction('LoadAnimation',     LoadAnimationAct);
    //TODO: Seperate these audio actions into distinct events?
    this.addAction('PlayAudio',         AudioAct);      // Since all four of these
    this.addAction('LoopAudio',         AudioAct);      // events use the same callback,
    this.addAction('StopAudio',         AudioAct);      // it only needs to be bound once
    this.addAction('AudioVolume',       AudioAct,       'AudioEvent',           this.audio.bind(this));
    this.addAction('SetVar',            SetVarAct,      'SetVarEvent',          this.setVar.bind(this));
    this.addAction('SetRelVar',         SetRelVarAct,   'SetRelVarEvent',       this.setRelVar.bind(this));
    this.addAction('CombineVars',       CombineVarsAct, 'CombineVarsEvent',     this.combineVars.bind(this));
    this.addAction('Printf',            PrintfAct,      'PrintfEvent',          this.printf.bind(this));
    this.addAction('Include',           IncludeAct,     'IncludeEvent',         this.loadScriptingXML.bind(this));
    this.addAction('DisableEngine',     GeneralPurposeAct,'DisableEngineEvent', this.disableEngine.bind(this));
    this.addAction('Conditional',       ConditionalAct);
    this.addAction('CallSubroutine',    CallSubroutineAct,'CallSubroutine',     this.callSubroutine.bind(this));
    
    // Register Triggers
    this.addTrigger('And',              AndTrigger);
    this.addTrigger('Or',               OrTrigger);
    this.addTrigger('Not',              NotTrigger);
    this.addTrigger('Xor',              XorTrigger);
    this.addTrigger('AutoTrigger',      AutoTrigger);
    this.addTrigger('CheckVar',         CheckVarTrigger);
    this.addTrigger('ButtonInput',      ButtonInputTrigger);
    this.addTrigger('IncludeTrigger',   IncludeTrigger);
    this.addTrigger('KeyTrigger',       KeyTrigger);
    this.addTrigger('RemoteLoadTrigger',RemoteLoadTrigger);
    this.addTrigger('Time',             TimeTrigger);
    
    KeyTrigger.keys = this.keys;
    CheckVarTrigger.get = this.reflectiveGet.bind(this);
    this.setErrorLevel = this.setErrorLevel.bind(this);
    
    // Start running every frame
    this.scheduleUpdate();
}

// Responsible for managing the creation, execution, and modification of ScriptingEvents
ScriptingSystem.inherit(KeyboardLayer, {
    ss_eventList    : null,     // Dictionary of all events in the system
    ss_disabled     : false,    // 
    
    ss_loadTimer    : 0,        // Time in seconds since the system started
    ss_gameTimer    : 0,        // Time in seconds since the game started
    ss_started      : false,    // True once the game has started
    ss_loaded       : false,    // True once the ScriptingSystem has loaded at least once
    
    ss_tracker      : null,     // Keeps track of dynamic content
    ss_vars         : null,     // A place to keep track of dynamic variables
    
    ss_dynamicNode  : null,     // Holds the visible dynamic content
    
    ss_audioHook    : null,     // Tie in point for AudioMixer to handle audio Actions
    
    ss_errorLevel   : 0,
    
    // Reset helper for ss_reinitialize and ss_reboot
    ss_refresh: function() {
        this.removeChild({child: this.ss_dynamicNode});
        this.ss_dynamicNode = new cocos.nodes.Node();
        this.addChild({child: this.ss_dynamicNode, z: 200});
        
        this.ss_tracker = {};
        this.ss_vars = {};
        
        this.ss_started = false;
        this.ss_loaded = false;
        
        this.ss_loadTimer = 0;
        this.ss_gameTimer = 0;
        
        this.ss_disabled = false;
    },
    
    //WARNING: Fails to execute correctly for any events that are executing
    ss_reinitialize: function() {
        this.ss_refresh();
        
		$.each(this.ss_eventList, function() {
			this.kill();
		});
        this.ss_eventList = {};
        
        $.each(this.ss_subroutineList, function() {
			this.kill();
		});
        this.ss_subroutineList = {};
    },
    
    //WARNING: Fails to execute correctly for any events that are executing
    ss_reboot: function() {
        this.ss_refresh();
		
		$.each(this.ss_eventList, function() {
			this.reboot();
		});
    },
    
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
    
    // STATICALLY BOUND
    setErrorLevel: function(lvl) {
        if(-1 < lvl && lvl < 3) {
            this.ss_errorLevel = lvl;
            return;
        }
        
        throw new Error('[CRITICAL] [RUNTIME] Illegal value for ss_errorLevel ( ' + lvl + ' ) ');
    },
    
    callSubroutine: function(subroutineID) {
        if(!this.ss_subroutineList[subroutineID]) {
            throw new Error('[CRITICAL] {RUNTIME] No subroutine with ID: ' + subroutineID);
        }
        
        this.ss_subroutineList[subroutineID].exec();
    },
    
    // Load ScriptingEvents from parsed xml
    loadScriptingXML: function(xml) {
        this.ss_loaded = true;
        
        if(xml == null) {
            return;
        }
    
        // Get the list of ScriptingEvents from XML
        var evts = $(xml).children('RULE');
        
        // Interate over, validate and construct the ScriptingEvents
        var i=0;
        while(i<evts.length) {
            var evt = $(evts[i]);
            if(evt.attr('ruleID')) {
                if(!this.ss_eventList.hasOwnProperty(evt.attr('ruleID'))) {
                    this.ss_eventList[evt.attr('ruleID')] = new ScriptingEvent(evt);
                    events.addListener(this.ss_eventList[evt.attr('ruleID')], 'ErrorLevelEvent', this.setErrorLevel);
                }
                else {
                    throw new Error('[CRITICAL] [PARSE] Event #' + (i+1) + ' has an ruleID that is already in use ( ' + evts[i].attributes.ruleID + ' )');
                }
            }
            else {
                throw new Error('[CRITICAL] [PARSE] Event #' + (i+1) + ' does not have an ruleID');
            }
            i += 1;
        }
        
        // Do the same for subroutines
        var subs = $(xml).children('SUBROUTINE');
        
        i=0;
        while(i<subs.length) {
            var sub = $(subs[i]);
            if(sub.attr('subroutineID')) {
                if(!this.ss_subroutineList.hasOwnProperty(sub.attr('subroutineID'))) {
                    this.ss_subroutineList[sub.attr('subroutineID')] = new Subroutine(sub);
                    events.addListener(this.ss_subroutineList[sub.attr('subroutineID')], 'ErrorLevelEvent', this.setErrorLevel);
                }
                else {
                    throw new Error('[CRITICAL] [PARSE] Subroutine #' + (i+1) + ' has an subroutineID that is already in use ( ' + evts[i].attributes.ruleID + ' )');
                }
            }
            else {
                throw new Error('[CRITICAL] [PARSE] Subroutine #' + (i+1) + ' does not have an subroutineID');
            }
            i += 1;
        }
    },
    
// Low level access ////////////////////////////////////////////////////////////////////////////////
    
    // Basic printf functionality
    //TODO: Restrict float precision
    printf: function(cid, lbl, args) {
        var tokens = lbl.string.split('%');
        console.log(tokens);
        var vars = [];
        for(var i=0; i<args.length; i+=1) {
            vars.push(this.reflectiveGet(args[i]));
        }
        
        var newStr = tokens[0];
        var val;
        
        // Iterate over tokenized string
        for(var i=1; i<tokens.length; i+=1) {
            if(tokens.length > 0) {
                val = parseInt(tokens[i].charAt(0));
                
                // A digit following a token implies a replacement
                if(!isNaN(val)) {
                    if(val-1 < vars.length) {
                        // If the replacement value can be parsed as a float
                        if(!isNaN(parseFloat(vars[val-1])) && tokens[i].length > 1) {
                            // Check to see if floating point precision is specified (0-9 digits)
                            var prec = parseInt(tokens[i].charAt(1));
                            if(!isNaN(prec)) {
                                newStr += vars[val-1].toFixed(prec);
                                newStr += tokens[i].slice(2);
                                continue;
                            }
                        }
                        
                        // If precision is not specified, or the value is not a float, append and continue
                        newStr += vars[val-1];
                        newStr += tokens[i].slice(1);
                    }
                    else {
                        this.generateError('Lacking argument #' + val + ' in printf statement ( ' + lbl.string + ' )');
                    }
                }
                // Non digit is ignored
                else {
                    newStr += tokens[i];
                    this.generateError('printf(): Detected token character without a following digit identifier');
                }
            }
            // If there is no length, then a sequence of %% was present, which is the escape sequence for a single '%'
            //TODO: Check behavior at end of string; check corner cases (eg '%%3' '%%%3' '%3%%')
            else {
                newStr += '%';
                i+=1;
                if(i<tokens.length) {
                    newStr += tokens[i];
                }
            }
        }
        
        lbl.string = newStr;
        this.showContent(cid, lbl);
    },
    
    reflectiveIndex: function(token) {
        var num = parseInt(token);
        if(!isNaN(num)) {
            return num;
        }
        return this.reflectiveGet(index);
    },
    
    // Who would of thought I was going to have to reimplement this after it was removed from cocos...
    // And hoping to avoid the overhead of recursion plus repeated splitting and joining
    //TODO: Combine common elements with reflectiveSet
    reflectiveGet: function(key) {
        var tokens = key.split('.');
        var obj = this;
        while(tokens.length > 0) {
            key = tokens.shift();
            // Array checking code
            if(key.indexOf('[') > -1) {
                var arrToken = key.split('[');
                key = arrToken[0];
                var index = this.reflectiveIndex(arrToken[1].slice(0, -1));
                
                if(!(key in obj)) {
                    throw new Error('[CRITICAL] [RUNTIME] ' + obj + ' lacks array ' + key);
                }
                
                obj = obj[key][index];
            }
            // Property checking code
            else {
                // Only operate on already existing attributes
                if(!(key in obj)) {
                    throw new Error('[CRITICAL] [RUNTIME] ' + obj + ' lacks property ' + key);
                }
                
                obj = obj[key];
            }
        }
        
        return obj;
    },
    
    // And the slightly different version for setting values
    //TODO: Combine common elements with reflectiveGet
    reflectiveSet: function(key, val) {
        var tokens = key.split('.');
        var obj = this;
        while(tokens.length > 0) {
            key = tokens.shift();
            
            // Array checking code
            if(key.indexOf('[') > -1) {
                var arrToken = key.split('[');
                key = arrToken[0];
                var index = this.reflectiveIndex(arrToken[1].slice(0, -1));
                
                // Have to check and assign like this, otherwise values fail to assign
                if(tokens.length > 0) {
                    // Only operate on already existing attributes
                    if(!(key in obj)) {
                        throw new Error('[CRITICAL] [RUNTIME] ' + obj + ' lacks array ' + key);
                    }
                
                    obj = obj[key][index];
                }
                else {
                    obj[key][index] = val;
                    return true;
                }
            }
            // Property checking code
            else {
                // Have to check and assign like this, otherwise values fail to assign
                if(tokens.length > 0) {
                    // Only operate on already existing attributes
                    if(!(key in obj)) {
                        throw new Error('[CRITICAL] [RUNTIME] ' + obj + ' lacks property ' + key);
                    }
                    obj = obj[key];
                }
                else {
                    obj[key] = val;
                    return true;
                }
            }
        }
    },
    
    // x = C
    setVar: function(name, val) {
        this.reflectiveSet(name, val);
    },
    
    // x = y ([op] C)
    setRelVar: function(name, other, op, mod) {
        var val = this.reflectiveGet(other);
        
        // Only apply the operation if present
        if(op && mod) {
            val = ScriptingSystem.ops[op].call(this, val, mod);
        }
        
        this.reflectiveSet(name, val);
    },
    
    // x = y [op] z
    combineVars: function(name, other1, other2, op) {
        this.reflectiveSet(name, ScriptingSystem.ops[op].call(this.get(other1), this.get(other2)));
    },
    
    // Calls an arbitrary function on this object
    callFunction: function(func, params) {
        try {
            var tokens = func.split('.');
            var obj = this;
            while(tokens.length > 1) {
                obj = obj[tokens.shift()];
            }
        
            obj[func].apply(this, params);
        }
        catch(e) {
            this.generateError('Error calling function ' + func + ' with parameters ' + params)
        }
    },
    
// Audio Management ////////////////////////////////////////////////////////////////////////////////
    
    // Loads the specified audio file
    loadAudio: function(contentID, source) {
        if(!this.ss_audioHook) {
            this.generateError('LoadAudio called with no audioHook');
            return;
        }
        
        this.ss_audioHook.loadSound(contentID, source);
    },
    
    // Executes the specified command on the audio track
    audio: function(contentID, mode, volume) {
        if(!this.ss_audioHook) {
            this.generateError('Audio called with no audioHook');
            return;
        }
        
        else if(mode == 'play') {
            this.ss_audioHook.playSound(contentID);
        }
        else if(mode == 'loop') {
            this.ss_audioHook.loopSound(contentID);
        }
        else if(mode == 'stop') {
            this.ss_audioHook.stopSound(contentID);
        }
        else if(mode == 'volume') {
            this.ss_audioHook.setTrackVolume(contentID, volume);
        }
        else {
            this.generateError('Invalid mode ( ' + mode + ' ) for audio()');
        }
    },
    
// Event Management Callsbacks /////////////////////////////////////////////////////////////////////
    
    disableEngine: function() {
        this.ss_disabled = true;
    },
    
    // Deactivate the specified event
    DeactivateRule: function(ruleID) {
        this.ss_eventList[ruleID].deactivate(this.ss_errorLevel);
    },
    
    // Activate the specified event
    ReactivateRule: function(ruleID) {
        this.ss_eventList[ruleID].activate(this.ss_errorLevel);
    },
    
    // Trigger the specified event
    TriggerRule: function(ruleID) {
        if(this.ss_eventList[ruleID].canExec()) {
            this.ss_eventList[ruleID].exec();
        }
        else {
            this.generateError('Cannot TriggerRule non-ACTIVE event ( ' + ruleID + ' )');
        }
    },
    
    // Aborts a currently executing event
    AbortRule: function(ruleID) {
        if(this.ss_eventList[ruleID].canAbort()) {
            this.ss_eventList[ruleID].abort();
        }
        else {
            this.generateError('Cannot AbortRule non-EXECUTING event ( ' + ruleID + ' )');
        }
    },

////////////////////////////////////////////////////////////////////////////////////////////////////    
    
    // Displays scripted content to the screen
    showContent: function(id, content, parent) {
        if(parent) {
            parent = this.reflectiveGet(parent);
        }
        else {
            parent = this.ss_dynamicNode;
        }
    
        if(!this.ss_tracker.hasOwnProperty(id)) {
            this.ss_tracker[id] = content;
            parent.addChild({child: content});
        }
        else {
            this.generateError('Already tracking content with id ( ' + id + ' ), unable to showContent()');
        }
    },
    
    // Plays or loops an animation
    playAnimation: function(id, anim, point, parent) {
        if(parent) {
            parent = this.reflectiveGet(parent);
        }
        else {
            parent = this.ss_dynamicNode;
        }
    
        if(!this.ss_tracker.hasOwnProperty(id)) {
            var animNode = new cocos.nodes.Sprite();
            animNode.position = point;
            
            this.ss_tracker[id] = animNode;
            parent.addChild({child: animNode});
            
            animNode.runAction(anim);
        }
        else {
            this.generateError('Already tracking content with id ( ' + id + ' ), unable to playAnimation()');
        }
    },
    
    // Stops but does NOT hide an animation
    stopAnimation: function(id) {
        if(this.ss_tracker.hasOwnProperty(id)) {
            this.ss_tracker[id].stopAllActions();
        }
        else {
            this.generateError('Not tracking any content with id ( ' + id + ' ), unable to stopAnimation()');
        }
    },
    
    // Moves already displayed content to a different location
    moveContent: function(id, pos) {
        if(this.ss_tracker.hasOwnProperty(id)) {
            this.ss_tracker[id].position = pos;
        }
        else {
            this.generateError('Not tracking any content with id ( ' + id + ' ), unable to moveContent()');
        }
    },
    
    // Hides and deletes a piece of content that was previously displayed
    hideContent: function(id, parent) {
        if(parent) {
            parent = this.reflectiveGet(parent);
        }
        else {
            parent = this.ss_dynamicNode;
        }
        
        if(this.ss_tracker.hasOwnProperty(id)) {
            parent.removeChild({child: this.ss_tracker[id]});
            delete this.ss_tracker[id];
        }
        else {
            this.generateError('Not tracking any content with id ( ' + id + ' ), unable to hideContent()');
        }
    },
    
    // Runs every frame
    update: function(dt) {
        if(this.ss_disabled) {
            return;
        }
    
        // Track timers
        if(this.ss_loaded) {
            this.ss_loadTimer += dt;
            TimeTrigger.systemTime = this.ss_loadTimer;
        }
        if(this.ss_started) {
            this.ss_gameTimer += dt;
            TimeTrigger.gameTime = this.ss_gameTimer;
        }
        
        // Iterate over events
        for (var prop in this.ss_eventList) {
            if (this.ss_eventList.hasOwnProperty(prop)) {
                // Shortcut evaluation: do not check() unless it canExec()
                if(this.ss_eventList[prop].canExec() && this.ss_eventList[prop].check()) {
                    this.ss_eventList[prop].exec();
                }
            }
            
            // Disabling takes effect immediately on the end of the event
            //TODO: Disable takes effect immediately after Action?
            if(this.ss_disabled) {
                return;
            }
        }
        
        // Update event state
        for (var prop in this.ss_eventList) {
            if (this.ss_eventList.hasOwnProperty(prop)) {
                this.ss_eventList[prop].updateState();
            }
        }
    },
    
    // Handles error generation for runtime error (parsing errors are always thrown)
    generateError: function(str) {
        if(this.ss_errorLevel == 0) {
            throw new Error('[RUNTIME] ' + str);
        }
        else if(this.ss_errorLevel == 1) {
            console.log('[RUNTIME] WARNING: ' + str);
        }
        else if(this.ss_errorLevel != 2) {
            throw new Error('[CRITICAL] [RUNTIME] Error generated and handled with an invalid errorLevel ( ' + this.ss_errorLevel + ' )');
        }
    }
});

// Stores the mapping between strings and constructors
ScriptingSystem.actionMap = {};
ScriptingSystem.triggerMap = {};

// Store operator functions by their string representation
ScriptingSystem.ops = {
    '+': function(a, b) { return a + b; },
    '-': function(a, b) { return a - b; },
    '*': function(a, b) { return a * b; },
    '/': function(a, b) { return a / b; },
    '%': function(a, b) { return a % b; }
};

module.exports = {
    Act                 : Act,
    Trigger             : Trigger,
    ScriptingEvent      : ScriptingEvent,
    ScriptingSystem     : ScriptingSystem,
    eventRelay          : eventRelay,
    GeneralPurposeAct   : GeneralPurposeAct,
};
}, mimetype: "application/javascript", remote: false}; // END: /ScriptingSystem.js


__jah__.resources["/SplashScreen.js"] = {data: function (exports, require, module, __filename, __dirname) {
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



var SplashScreen = function(arr) {

    SplashScreen.superclass.constructor.call(this);

    

    this.screens = [];

    var s;

    for(var i=0; i<arr.length; i+=1) {

        s = new cocos.nodes.Sprite({file: arr[i]});

        s.position = new geo.Point(450, 300);

        s.opacity = 0;

        this.screens.push(s);

    }

    

    this.black = new cocos.nodes.Sprite({file: '/resources/black.png'});

    this.black.position = new geo.Point(450, 300);

    this.black.zOrder = -1;

    this.addChild({child: this.black});

}



SplashScreen.inherit(cocos.nodes.Node, {

    screens : null, // An array holding the screens to be displayed in sequental order

    black   : null, // The black, blank background image

    fadeIn  : 1,    // Seconds to fade in a screen

    holdOn  : 2,    // Seconds to hold after fading in

    fadeOut : 1,    // Seconds to fade out a screen

    timer   : 0,    // Tracks elapsed time of the current state

    current : 0,    // Currently displayed screen number

    state   : -1,   // Current state of SplashScreen (0: fade in, 1: hold, 2: fade out, 3: fade to game)

    skipper : 1,    // Time multiplier for skipping, resets on each new splash screen

    

    // Starts the sequence of displaying splash screens

    start: function() {

        if(this.isActive()) {

            console.log('WARNING: Cannot start SplashScreen when already active');

            return;

        }

    

        this.addChild({child: this.screens[0]});

        this.state = 0;

        var that = this;

        setTimeout(function () {

            that.scheduleUpdate();

        }, 250);

    },

    

    isActive: function() {

        return this.state != -1;

    },

    

    // Fast forwards by a portion of one screen

    skip: function() {

        this.skipper = 3;

        

        if(this.state == 0) {

            this.state = 2;

        }

        else if(this.state == 1) {

            this.timer = 0;

            this.state = 2;

        }

        else if(this.state == 2) {

            this.timer = this.fadeOut;

        }

    },

    

    // Cycle through the queued splash screens then fade to the game

    update: function(dt) {

        this.timer += dt * this.skipper;

        

        // Fade in the current screen

        if(this.state == 0) {

            if(this.timer < this.fadeIn) {

                this.skipper = 1;

                this.screens[this.current].opacity = this.timer / this.fadeIn * 255;

            }

            else {

                this.state = 1;

                this.timer = 0;

                

                this.screens[this.current].opacity = 255;

            }

        }

        // Then hold it visible

        if(this.state == 1) {

            if(this.timer > this.holdOn) {

                this.state = 2;

                this.timer = 0;

            }

        }

        // Fade out, if any screens return back to state 0

        if(this.state == 2) {

            if(this.timer < this.fadeOut) {

                this.screens[this.current].opacity = 255 - ((this.timer / this.fadeOut) * 255);

            }

            else {

                this.timer = 0;

                

                this.removeChild({child: this.screens[this.current]});

                this.current += 1;

                if(this.current < this.screens.length) {

                    this.state = 0;

                    this.addChild({child: this.screens[this.current]});

                }

                else {

                    this.state = 3;

                }

            }

        }

        // After all screens, fade out to the game

        if(this.state == 3) {

            if(this.timer > this.fadeOut) {

                events.trigger(this, 'splashScreensCompleted');

                cocos.Scheduler.sharedScheduler.unscheduleUpdateForTarget(this);

                this.state = -1;

            }

            else {

                this.black.opacity = 255 - (this.timer / this.fadeOut) * 255;

            }

        }

    }

});



module.exports = SplashScreen;
}, mimetype: "application/javascript", remote: false}; // END: /SplashScreen.js


__jah__.resources["/tutorial.html"] = {data: __jah__.assetURL + "/tutorial.html", mimetype: "text/html", remote: true};
__jah__.resources["/XML.js"] = {data: function (exports, require, module, __filename, __dirname) {
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



// Static class, so nothing much here

function XML () {

}



// Simple, general XML parser

XML.parser = function(root, ret) {

	var r = {}



    r.name = root.tagName;

    

	// Process attributes

    r.attributes = {}

	for (var i = 0; i < root.attributes.length; i++) {

		var n = root.attributes[i].nodeName;

        

        r.attributes[n] = root.attributes[i].nodeValue;

	}

	

    r.children = [];

    

    // Process children

	for (var i = root.firstElementChild; i != null; i = i.nextElementSibling) {

		r.children.push(XML.parser(i));

	}

	

    // Process tagged value (ex: <TAG>This info here<INNER></INNER>but not here</TAG>

    r.value = null;

    if(root.childNodes) {

        if(root.childNodes.length > 0) {

            r.value = root.childNodes[0].nodeValue;

        }

    }

	

	return r;

}



// Gets the first child of the current node with the specified name

XML.getChildByName = function(root, name) {

    for(var i = 0; i < root.children.length; i++) {

        if(root.children[i].name == name) {

            return root.children[i];

        }

    }

    

    return null;

}



// As getChildByName, but at any depth from the current node

XML.getDeepChildByName = function(root, name) {

    for(var i = 0; i < root.children.length; i++) {

        if(root.children[i].name == name) {

            return root.children[i];

        }

        else {

            var ret = XML.getDeepChildByName(root.children[i], name);

            if(ret != null) {

                return ret;

            }

        }

    }

    

    return null;

}



// Gets an array of all children with the specified name

XML.getChildrenByName = function(root, name) {

    var ret = []

    

    for(var i = 0; i < root.children.length; i++) {

        if(root.children[i].name == name) {

            ret.push(root.children[i]);

        }

    }

    

    return ret;

}



module.exports = XML
}, mimetype: "application/javascript", remote: false}; // END: /XML.js


})();
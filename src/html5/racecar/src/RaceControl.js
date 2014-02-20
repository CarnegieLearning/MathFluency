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
RaceControl.minSpeed = 0;
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
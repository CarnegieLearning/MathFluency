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

var RaceControl = BObject.extend({
    init: function () {
        RaceControl.superclass.init.call(this);
    }
});

RaceControl.finishLine          = 3200;                     // Holds the z value of the finish line
RaceControl.initialCountdown    = 3000;                     // Initial countdown time in milliseconds

RaceControl.curNumLanes = 3;

// <AudioSettings>
RaceControl.crossFadeSpeed = 30;

// <MEDALS>
RaceControl.times               = [32, 42, 68, 100, 200];   // Holds [min, gold, silver, bronze, max] times
RaceControl.medalNames          = ['Ludicrous Speed', 'Gold', 'Silver', 'Bronze', ' - '];

RaceControl.calcProportions = function() {
    RaceControl.proportions = [];
    RaceControl.proportions[0] = (RaceControl.times[1] - RaceControl.times[0]) / RaceControl.times[4];
    RaceControl.proportions[1] = (RaceControl.times[2] - RaceControl.times[1]) / RaceControl.times[4];
    RaceControl.proportions[2] = (RaceControl.times[3] - RaceControl.times[2]) / RaceControl.times[4];
    RaceControl.proportions[3] = (RaceControl.times[4] - RaceControl.times[3]) / RaceControl.times[4];
}

RaceControl.gold    = '#CC9900';        // Color for gold medals
RaceControl.silver  = '#C0C0C0';        // Color for silver medals
RaceControl.bronze  = '#E26B10';        // Color for bronze medals
RaceControl.noMedal = '#202020';        // Color for no medal

// <GlobalSpacing>
RaceControl.intermissionSpacing = 110;                      // Distance in meters from previous object to intermission
RaceControl.questionSpacing     = 150;                      // Distance in meters from previous object to question
RaceControl.finishSpacing       = 110;                      // Distance in meters after the last question to the finish line

RaceControl.delimiterSpacing    = {2: [0], 3: [-1.5, 1.5], 4: [-3, 0, 3]};

// <PenaltySettings>
RaceControl.penaltyTime         = 15;                       // Time in seconds lost for a incorrect answer
RaceControl.penaltySpeed        = -0.1;                     // Percentage speed LOST for an incorrect answer

RaceControl.maxTimeWindow       = 110 / 200.0 * 0.9;        // Maximum time between two important z values: min z spacing / max speed * 90%
RaceControl.maxDistWindow       = 300;                      // Maximum distance coverable in 2 seconds

exports.RaceControl = RaceControl
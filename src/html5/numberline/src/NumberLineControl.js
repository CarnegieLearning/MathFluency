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
var NumberLineControl = BObject.extend({
    init: function() {
        NumberLineControl.superclass.init.call(this);
    }
});

NumberLineControl.feedbackDelay = 1300;     // Delay in ms before displaying feedback after answering

NumberLineControl.calcProportions = function() {
    NumberLineControl.proportions = [];
    NumberLineControl.proportions[0] = (NumberLineControl.medalScores[0] - NumberLineControl.medalScores[1]) / NumberLineControl.medalScores[0];
    NumberLineControl.proportions[1] = (NumberLineControl.medalScores[1] - NumberLineControl.medalScores[2]) / NumberLineControl.medalScores[0];
    NumberLineControl.proportions[2] = (NumberLineControl.medalScores[2] - NumberLineControl.medalScores[3]) / NumberLineControl.medalScores[0];
    NumberLineControl.proportions[3] = (NumberLineControl.medalScores[3] - NumberLineControl.medalScores[4]) / NumberLineControl.medalScores[0];
}

NumberLineControl.medalScores   = [100, 90, 60, 40, 0]; // List of medal minimum score values [max, gold, silver, bronze, 0]

NumberLineControl.goldColor     = '#CC9900';    // Color of gold medal
NumberLineControl.silverColor   = '#C0C0C0';    // Color of silver medal
NumberLineControl.bronzeColor   = '#A67D3D';    // Color of bronze medal
NumberLineControl.noMedalColor  = '#202020';    // Color for not getting a medal
NumberLineControl.colors = [NumberLineControl.goldColor, NumberLineControl.silverColor, NumberLineControl.bronzeColor, NumberLineControl.noMedalColor];

NumberLineControl.ptsStageBonus = 0;            // Points given per second left on the clock at the end of the stage

exports.NumberLineControl = NumberLineControl;
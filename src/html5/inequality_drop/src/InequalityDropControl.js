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
var InequalityDropControl = BObject.extend({
    init: function() {
        InequalityDropControl.superclass.init.call(this);
    }
});

InequalityDropControl.medalScores   = [100, 75, 50, 25, 0]  // List of important medal score values [max, gold, silver, bronze, 0]

InequalityDropControl.goldColor     = '#CC9900';    // Color of gold medal
InequalityDropControl.silverColor   = '#C0C0C0';    // Color of silver medal
InequalityDropControl.bronzeColor   = '#A67D3D';    // Color of bronze medal
InequalityDropControl.noMedalColor  = '#202020';    // Color for not getting a medal

InequalityDropControl.ptsStageBonus = 1;            // Points given per second left on the clock at the end of the stage

// Defaults for Question values //////////////////////
InequalityDropControl.ptsCorrect    = 10;           // Points given for correct answers
InequalityDropControl.ptsIncorrect  = -5;           // Points given for incorrect answers
InequalityDropControl.ptsTimeout    = -10;          // Points given for having a specific question time out
InequalityDropControl.ptsQuestBonus = 1;            // Points given per second left after answering a timed question correctly
//////////////////////////////////////////////////////

exports.InequalityDropControl = InequalityDropControl
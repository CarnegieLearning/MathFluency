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
var MathAttackControl = BObject.extend({
    init: function() {
        MathAttackControl.superclass.init.call(this);
    }
});

MathAttackControl.calcProportions = function() {
    MathAttackControl.proportions = [];
    MathAttackControl.proportions[0] = (MathAttackControl.medalScores[0] - MathAttackControl.medalScores[1]) / MathAttackControl.medalScores[0];
    MathAttackControl.proportions[1] = (MathAttackControl.medalScores[1] - MathAttackControl.medalScores[2]) / MathAttackControl.medalScores[0];
    MathAttackControl.proportions[2] = (MathAttackControl.medalScores[2] - MathAttackControl.medalScores[3]) / MathAttackControl.medalScores[0];
    MathAttackControl.proportions[3] = (MathAttackControl.medalScores[3] - MathAttackControl.medalScores[4]) / MathAttackControl.medalScores[0];
}

MathAttackControl.medalScores = [100, 90, 60, 40, 0] // List of important medal score values [max, gold, silver, bronze, 0]

exports.MathAttackControl = MathAttackControl
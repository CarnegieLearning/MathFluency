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

var XML = require('XML').XML;

var Question = BObject.extend({
    qContent    : null,
    correctVal  : 0,
    
    balls       : null,
    
    elapsedTime : 0,
    corrects    : 0,
    misses      : 0,
    
    maxMisses   : 0,
    maxCorrects : 0,
    
    init: function(xml) {
        Question.superclass.init.call(this);
        
        this.balls = [];
    },
    
    update: function(dt) {
        this.elapsedTime += dt;
        
        var i=0;
        for(var i=0; i<this.balls.length; i+=1) {
            this.balls[i].move();
        }
        
        for(var i=0; i<this.balls.length; i+=1) {
            for(var j=i+1; j<this.balls.length; j+=1) {
                if(this.balls[i].isColliding(this.balls[j])) {
                    //this.balls.collide(this.balls[j]);
                }
            }
        }
    }
});

Question.height     = 468;
Question.width      = 792;
Question.bufferW    = 50;
Question.hardW      = true;

exports.Question = Question;
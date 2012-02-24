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

var BallView = require('BallView').BallView;

var QuestionView = cocos.nodes.Node.extend({
    
    
    init: function() {
        QuestionView.superclass.init.call(this);
    },
    
    viewQuestion: function(model) {
        for(var i=0; i<model.balls.length; i+=1) {
            BallView.create(model.balls[i]);
        }
    }
});

exports.QuestionView = QuestionView;
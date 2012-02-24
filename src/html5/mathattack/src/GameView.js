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

var QuestionView = require('QuestionView').QuestionView;

var XML = require('XML').XML;

var GameView = cocos.nodes.Node.extend({
    roundLabel      : null,
    timeLabel       : null,
    remainingLabel  : null,
    incorrectLabel  : null,
    scoreLabel      : null,

    init: function(xml) {
        GameView.superclass.init.call(this);
        
        var fg = cocos.nodes.Sprite.create({file: '/resources/background.png'});
        fg.set('anchorPoint', new geo.Point(0, 0));
        
        this.addChild({child: fg});
        
        var qv = QuestionView.create();
        qv.set('position', geo.Point(60, 76));
        
        this.line = cocos.nodes.Sprite.create({file: '/resources/numberLine.png'});
        this.line.set('anchorPoint', new geo.Point(0.5, 0));
        this.line.set('position', new geo.Point(450, 5));
        this.addChild({child: this.line});
        
        var opts = {}
        opts['fontColor'] = '#000000';
        
        opts['string'] = 'Round';
        this.roundLabel = cocos.nodes.Label.create(opts);
        this.roundLabel.set('position', new geo.Point(110, 545));
        this.addChild({child: this.roundLabel});
        
        opts['string'] = 'Time';
        this.timeLabel = cocos.nodes.Label.create(opts);
        this.timeLabel.set('position', new geo.Point(230, 545));
        this.addChild({child: this.timeLabel});
        
        opts['string'] = 'Remaining';
        this.remainingLabel = cocos.nodes.Label.create(opts);
        this.remainingLabel.set('position', new geo.Point(430, 545));
        this.addChild({child: this.remainingLabel});
        
        opts['string'] = 'Misses';
        this.incorrectLabel = cocos.nodes.Label.create(opts);
        this.incorrectLabel.set('position', new geo.Point(640, 545));
        this.addChild({child: this.incorrectLabel});
        
        opts['string'] = 'Score';
        this.scoreLabel = cocos.nodes.Label.create(opts);
        this.scoreLabel.set('position', new geo.Point(780, 545));
        this.addChild({child: this.scoreLabel});
    },
    
    nextQuestionCallback: function() {
        
    },
    
    update: function(dt) {
    }
});

exports.GameView = GameView;
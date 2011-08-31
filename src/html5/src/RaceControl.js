var cocos = require('cocos2d');

var RaceControl = BObject.extend({
    init: function () {
        RaceControl.superclass.init.call(this);
    }
});

RaceControl.finishLine = 3200;
RaceControl.times = [32, 42, 68, 100, 200];

exports.RaceControl = RaceControl
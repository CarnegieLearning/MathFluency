var cocos = require('cocos2d');

var RaceControl = BObject.extend({
    init: function () {
        RaceControl.superclass.init.call(this);
    }
});

RaceControl.finishLine  = 3200;                     // Holds the z value of the finish line
RaceControl.times       = [32, 42, 68, 100, 200];   // Holds [min, gold, silver, bronze, max] times

exports.RaceControl = RaceControl
var cocos = require('cocos2d');

var PerspectiveNode = require('PerspectiveNode').PerspectiveNode;

var PerspectiveSprite = PerspectiveNode.extend({
    sprite: null,
    init: function(opts) {
        PerspectiveSprite.superclass.init.call(this, opts);
        
        if(opts.hasOwnProperty('sprite')) {
            var sprite = cocos.nodes.Sprite.create({file: opts['sprite'],});
            this.addChild({child: sprite});
            this.set('sprite', sprite);
            
            this.scheduleUpdate();
        }
    }
});

exports.PerspectiveSprite = PerspectiveSprite
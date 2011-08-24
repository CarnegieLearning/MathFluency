var cocos = require('cocos2d');
var util = require('util');
var events = require('events');

//Basic image preloader
//TODO: Add support for RemoteResource
//TODO: Trigger completion progress events
var Preloader = BObject.extend({
    loadQueue: null,
    toLoad: null,
    totalLoaded:null,
    init: function() {
        Preloader.superclass.init.call(this);
        
        this.set('loadQueue', []);
        this.loadCallback = this.loadCallback.bind(this)
    },
    //Queues an image in the preloader
    //path is where the image will be loaded and url is the address on the server where the image resides
    queueLoad: function(path, url) {
        opts = new Object();
        opts['path'] = path;
        opts['url'] = url;
        
        queue = this.get('loadQueue');
        queue.push(cocos.RemoteImage.create(opts));
        
        this.set('toLoad', this.get('toLoad') + 1);
        this.set('loadQueue', queue);
    },
    //Starts loading all queued images
    startLoad: function() {
        var queue = this.get('loadQueue');
        for (var i = 0; i < queue.length; i++) {
            events.addListener(queue[i], 'load', this.loadCallback);
            queue[i].load();
        }
    },
    //Called on every load completion
    loadCallback: function(evt) {
        this.set('totalLoaded', this.get('totalLoaded') + 1);
        
        //console.log(this.get('totalLoaded') + " / " this.get('toLoad'));
        //events.trigger(this, 'progress', this.get('totalLoaded') * 1.0 / this.get('toLoad'));
        
        if(this.get('totalLoaded') >= this.get('toLoad')) {
            events.trigger(this, 'complete');
        }
    }
});

exports.Preloader = Preloader;

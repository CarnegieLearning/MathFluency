var cocos = require('cocos2d');
var util = require('util');
var events = require('events');

// Basic remote resource/image preloader
// TODO: Trigger completion progress events
var Preloader = BObject.extend({
    loadQueue: null,    // Queue of objects to load
    toLoad: null,       // Total number of objects to load
    totalLoaded: null,  // Objects loaded so far
    failBit: null,      // True if any object fails to load
    init: function() {
        Preloader.superclass.init.call(this);
        
        this.set('loadQueue', []);
        this.loadCallback = this.loadCallback.bind(this)
        this.failCallback = this.failCallback.bind(this)
        this.set('failbit', false);
    },
    // Queues an image in the preloader
    // path is where the image will be loaded and url is the address on the server where the image resides
    queueLoad: function(type, path, url) {
        opts = new Object();
        opts['path'] = path;
        opts['url'] = url;
        
        queue = this.get('loadQueue');
        if(type == "RemoteImage") {
            queue.push(cocos.RemoteImage.create(opts));
        }
        else if(type == "RemoteResource") {
            queue.push(cocos.RemoteResource.create(opts));
        }
        
        console.log("Queued load of resource( " + path + " ) at url: " + url);
        
        this.set('toLoad', this.get('toLoad') + 1);
        this.set('loadQueue', queue);
    },
    // Starts loading all queued images
    startLoad: function() {
        var queue = this.get('loadQueue');
        for (var i = 0; i < queue.length; i++) {
            events.addListener(queue[i], 'load', this.loadCallback);
            events.addListener(queue[i], 'fail', this.failCallback);
            console.log("Starting load of resource( " + queue[i].get('path') + " ) at url: " + queue[i].get('url'));
            queue[i].load();
        }
    },
    // Called on every load completion
    // TODO: Trigger completion progress events
    loadCallback: function(evt) {
        this.set('totalLoaded', this.get('totalLoaded') + 1);
        
        //console.log(this.get('totalLoaded') + " / " this.get('toLoad'));
        //events.trigger(this, 'progress', this.get('totalLoaded') * 1.0 / this.get('toLoad'));
        
        if(this.get('totalLoaded') >= this.get('toLoad') && !this.get('failbit')) {
            console.log("Preloading completed");
            events.trigger(this, 'complete');
        }
    },
    
    // Called when a remote resource 404's
    failCallback: function(evt) {
        if(this.get('failbit') == false) {
            this.set('failbit', true);
            console.log("A remote resource has 404'ed");
            events.trigger(this, 'runLocal');
        }
    }
});

exports.Preloader = Preloader;

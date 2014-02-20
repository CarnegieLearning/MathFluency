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

// Import the cocos2d module
var cocos = require('cocos2d');
var geo = require('geometry');
var events = require('events');
var util = require('util');

var Director = cocos.Director;
var Preloader = require('preloader').Preloader;

function ProgressBar (opts) {
    ProgressBar.superclass.constructor.call(this, opts);

    var s;
    if (opts.emptyImage) {
        s = new cocos.nodes.Sprite({file: opts.emptyImage});
        s.anchorPoint = new geo.Point(0, 0);
        this.emptySprite = s;
        this.addChild({child: s});
        this.contentSize = s.contentSize;
    }
    if (opts.fullImage) {
        s = new cocos.nodes.Sprite({file: opts.fullImage});
        s.anchorPoint = new geo.Point(0, 0);
        this.fullSprite = s;
        this.addChild({child: s});
        this.contentSize = s.contentSize;
    }

    events.addPropertyListener(this, 'maxval', 'change', this.updateImages.bind(this));
    events.addPropertyListener(this, 'val',    'change', this.updateImages.bind(this));

    this.updateImages();
}

ProgressBar.inherit(cocos.nodes.Node, {
    emptySprite : null,     // Image at 0% loaded
    fullSprite  : null,     // Image at 100% loaded
    maxval      : 100,      // 
    val         : 0,        // 

    updateImages: function () {
        var size = this.contentSize;

        var diff = Math.round(size.width * (this.val / this.maxval));
        if (diff === 0) {
            this.fullSprite.visible = false;
        }
        else {
            this.fullSprite.visible = true;
            this.fullSprite.rect = new geo.Rect(0, 0, diff, size.height);
            this.fullSprite.contentSize = new geo.Size(diff, size.height);
        }

        if ((size.width - diff) === 0) {
            this.emptySprite.visible = false;
        }
        else {
            this.emptySprite.visible = true;
            this.emptySprite.rect = new geo.Rect(diff, 0, size.width - diff, size.height);
            this.emptySprite.position = new geo.Point(diff, 0);
            this.emptySprite.contentSize = new geo.Size(size.width - diff, size.height);
        }
    }
});

function PreloadScene (opts) {
    PreloadScene.superclass.constructor.call(this, opts);
    var size = Director.sharedDirector.winSize;

    if (opts.emptyImage) {
        this.emptyImage = opts.emptyImage;
    }
    if (opts.fullImage) {
        this.fullImage = opts.fullImage;
    }
    
    // Setup preloader
    var preloader = new Preloader();    // The main preloader
    preloader.addEverythingToQueue();
    this.preloader = preloader;

    // Listen for preload events
    events.addListener(preloader, 'load', function (preloader, uri) {
        var loaded = preloader.loaded;
        var count = preloader.count;
        events.trigger(this, 'load', preloader, uri);
    }.bind(this));

    events.addListener(preloader, 'complete', function (preloader) {
        events.trigger(this, 'complete', preloader);
    }.bind(this));

    // Preloader for the loading screen resources
    var loadingPreloader = new Preloader([this.emptyImage, this.fullImage]);

    // When loading screen resources have loaded then draw them
    events.addListener(loadingPreloader, 'complete', function (preloader) {
        this.createProgressBar();
        if (this.isRunning) {
            this.preloader.load();
        }

        this.isReady = true;
    }.bind(this));

    loadingPreloader.load();
}

PreloadScene.inherit(cocos.nodes.Scene, {
    progressBar : null,     // Holds the instance of progress bar
    preloader   : null,     // Holds the instance of the preloader
    isReady     : false,    // True when both progress bar images have loaded
    emptyImage  : null,     // Image at 0% loaded
    fullImage   : null,     // Image at 100% loaded

    createProgressBar: function () {
        var preloader = this.preloader;
        var size = Director.sharedDirector.winSize;

        var progressBar = new ProgressBar({emptyImage: this.emptyImage, fullImage: this.fullImage});

        progressBar.position = new geo.Point(size.width / 2, size.height / 2);

        this.progressBar = progressBar;
        this.addChild({child: progressBar});

        events.addListener(preloader, 'load', function (preloader, uri) {
            progressBar.maxval = preloader.count;
            progressBar.val = preloader.loaded;
        });
    },

    onEnter: function () {
        PreloadScene.superclass.onEnter.call(this);
        var preloader = this.preloader;

        // Preload everything
        if (this.isReady) {
            preloader.load();
        }
    }
});

module.exports = PreloadScene
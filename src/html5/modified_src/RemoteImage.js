/*globals module exports resource require BObject BArray*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util'),
    events = require('events'),
    RemoteResource = require('./RemoteResource').RemoteResource;

var RemoteImage = RemoteResource.extend(/** @lends cocos.RemoteImage# */{
    /**
     * @memberOf cocos
     * @extends cocos.RemoteResource
     * @constructs
     */
    init: function (opts) {
        RemoteImage.superclass.init.call(this, opts);
    },

    /**
     * Load a remote image
     * @returns Image
     */
    load: function () {
        var img = new Image();
        var self = this;
        img.onload = function () {
            var path = self.get('path');

            //BEGIN EDIT: tempjc
            
            //var r = __remote_resources__[path];
            //__resources__[path] = util.copy(r);
            __resources__[path] = new Object();
            __resources__[path]['data'] = null;
            __resources__[path]['meta'] = new Object;
            __resources__[path].meta['remote'] = true;
            
            //END EDIT: tempjc
            
            __resources__[path].data = img;
            __resources__[path].meta.remote = true;

            events.trigger(self, 'load', self);
        };
        
        img.src = this.get('url');

        return img;
    }
});

exports.RemoteImage = RemoteImage;

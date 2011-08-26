/*globals module exports resource require BObject BArray*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util'),
    events = require('events');

var RemoteResource = BObject.extend(/** @lends cocos.RemoteResource# */{
    /**
     * The URL to the remote resource
     * @type String
     */
    url: null,

    /**
     * The path used to reference the resource in the app
     * @type String
     */
    path: null,

    /**
     * @memberOf cocos
     * @extends BObject
     * @constructs
     */
    init: function (opts) {
        RemoteResource.superclass.init.call(this, opts);

        this.set('url', opts.url);
        this.set('path', opts.path);
        
    },

    /**
     * Load the remote resource via ajax
     */
    load: function () {
        var xhr = new XMLHttpRequest();
        var self = this;
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                var path = self.get('path');

                //BEGIN EDIT: tempjc
            
                if(xhr.status == 200) {
                    //var r = __remote_resources__[path];           //Commented out
                    //__resources__[path] = util.copy(r);           //Commented out
                    __resources__[path] = new Object();
                    __resources__[path]['data'] = null;
                    __resources__[path]['meta'] = new Object;
                    __resources__[path].meta['remote'] = true;
                    
                    __resources__[path].data = xhr.responseText;    //Untouched
                    __resources__[path].meta.remote = true;         //Untouched

                    events.trigger(self, 'load', self);
                }
                else if(xhr.status == 404) {
                    events.trigger(self, 'fail', self);
                }
                
                //END EDIT: tempjc
            }
        };

        xhr.open('GET', this.get('url'), true);  
        xhr.send(null);
    }
});


exports.RemoteResource = RemoteResource;

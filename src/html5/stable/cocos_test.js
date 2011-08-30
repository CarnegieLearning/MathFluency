
(function() {
var __main_module_name__ = "main";
var __resources__ = {};
var __remote_resources__ = {};
function __imageResource(data) { var img = new Image(); img.src = data; return img; };
var FLIP_Y_AXIS = false;
var ENABLE_WEB_GL = false;
var SHOW_REDRAW_REGIONS = false;

__resources__["/__builtin__/event.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*global module exports require*/
/*jslint white: true, undef: true, nomen: true, bitwise: true, regexp: true, newcap: true*/


/**
 * @namespace
 * Support for listening for and triggering events
 */
var event = {};

/**
 * @private
 * @ignore
 * Returns the event listener property of an object, creating it if it doesn't
 * already exist.
 *
 * @returns {Object}
 */
function getListeners(obj, eventName) {
    if (!obj.js_listeners_) {
        obj.js_listeners_ = {};
    }
    if (!eventName) {
        return obj.js_listeners_;
    }
    if (!obj.js_listeners_[eventName]) {
        obj.js_listeners_[eventName] = {};
    }
    return obj.js_listeners_[eventName];
}

/**
 * @private
 * @ignore
 * Keep track of the next ID for each new EventListener
 */
var eventID = 0;

/**
 * @class
 * Represents an event being listened to. You should not create instances of
 * this directly, it is instead returned by event.addListener
 *
 * @extends Object
 * 
 * @param {Object} source Object to listen to for an event
 * @param {String} eventName Name of the event to listen for
 * @param {Function} handler Callback to fire when the event triggers
 */
event.EventListener = function (source, eventName, handler) {
    /**
     * Object to listen to for an event
     * @type Object 
     */
    this.source = source;
    
    /**
     * Name of the event to listen for
     * @type String
     */
    this.eventName = eventName;

    /**
     * Callback to fire when the event triggers
     * @type Function
     */
    this.handler = handler;

    /**
     * Unique ID number for this instance
     * @type Integer 
     */
    this.id = ++eventID;

    getListeners(source, eventName)[this.id] = this;
};

/**
 * Register an event listener
 *
 * @param {Object} source Object to listen to for an event
 * @param {String} eventName Name of the event to listen for
 * @param {Function} handler Callback to fire when the event triggers
 *
 * @returns {event.EventListener} The event listener. Pass to removeListener to destroy it.
 */
event.addListener = function (source, eventName, handler) {
    return new event.EventListener(source, eventName, handler);
};

/**
 * Trigger an event. All listeners will be notified.
 *
 * @param {Object} source Object to trigger the event on
 * @param {String} eventName Name of the event to trigger
 */
event.trigger = function (source, eventName) {
    var listeners = getListeners(source, eventName),
        args = Array.prototype.slice.call(arguments, 2),
        eventID,
        l;

    for (eventID in listeners) {
        if (listeners.hasOwnProperty(eventID)) {
            l = listeners[eventID];
            if (l) {
                l.handler.apply(undefined, args);
            }
        }
    }
};

/**
 * Remove a previously registered event listener
 *
 * @param {event.EventListener} listener EventListener to remove, as returned by event.addListener
 */
event.removeListener = function (listener) {
    delete getListeners(listener.source, listener.eventName)[listener.eventID];
};

/**
 * Remove a all event listeners for a given event
 *
 * @param {Object} source Object to remove listeners from
 * @param {String} eventName Name of event to remove listeners from
 */
event.clearListeners = function (source, eventName) {
    var listeners = getListeners(source, eventName),
        eventID;


    for (eventID in listeners) {
        if (listeners.hasOwnProperty(eventID)) {
            var l = listeners[eventID];
            if (l) {
                event.removeListener(l);
            }
        }
    }
};

/**
 * Remove all event listeners on an object
 *
 * @param {Object} source Object to remove listeners from
 */
event.clearInstanceListeners = function (source, eventName) {
    var listeners = getListeners(source),
        eventID;

    for (eventName in listeners) {
        if (listeners.hasOwnProperty(eventName)) {
            var el = listeners[eventName];
            for (eventID in el) {
                if (el.hasOwnProperty(eventID)) {
                    var l = el[eventID];
                    if (l) {
                        event.removeListener(l);
                    }
                }
            }
        }
    }
};

module.exports = event;

}};
__resources__["/__builtin__/events.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*global module exports require*/
/*jslint white: true, undef: true, nomen: true, bitwise: true, regexp: true, newcap: true*/

/**
 * @namespace
 * Support for listening for and triggering events
 */
var events = {};

/**
 * @private
 * @ignore
 * Returns the event listener property of an object, creating it if it doesn't
 * already exist.
 *
 * @returns {Object}
 */
function getListeners(obj, eventName) {
    if (!obj.js_listeners_) {
        obj.js_listeners_ = {};
    }
    if (!eventName) {
        return obj.js_listeners_;
    }
    if (!obj.js_listeners_[eventName]) {
        obj.js_listeners_[eventName] = {};
    }
    return obj.js_listeners_[eventName];
}

/**
 * @private
 * @ignore
 * Keep track of the next ID for each new EventListener
 */
var eventID = 0;

/**
 * @class
 * Represents an event being listened to. You should not create instances of
 * this directly, it is instead returned by events.addListener
 *
 * @extends Object
 * 
 * @param {Object} source Object to listen to for an event
 * @param {String} eventName Name of the event to listen for
 * @param {Function} handler Callback to fire when the event triggers
 */
events.EventListener = function (source, eventName, handler) {
    /**
     * Object to listen to for an event
     * @type Object 
     */
    this.source = source;
    
    /**
     * Name of the event to listen for
     * @type String
     */
    this.eventName = eventName;

    /**
     * Callback to fire when the event triggers
     * @type Function
     */
    this.handler = handler;

    /**
     * Unique ID number for this instance
     * @type Integer 
     */
    this.id = ++eventID;

    getListeners(source, eventName)[this.id] = this;
};

/**
 * Register an event listener
 *
 * @param {Object} source Object to listen to for an event
 * @param {String|Stringp[} eventName Name or Array of names of the event(s) to listen for
 * @param {Function} handler Callback to fire when the event triggers
 *
 * @returns {events.EventListener|events.EventListener[]} The event listener(s). Pass to removeListener to destroy it.
 */
events.addListener = function (source, eventName, handler) {
    if (eventName instanceof Array) {
        var listeners = [];
        for (var i = 0, len = eventName.length; i < len; i++) {
            listeners.push(new events.EventListener(source, eventName[i], handler));
        }
        return listeners;
    } else {
        return new events.EventListener(source, eventName, handler);
    }
};

/**
 * Trigger an event. All listeners will be notified.
 *
 * @param {Object} source Object to trigger the event on
 * @param {String} eventName Name of the event to trigger
 */
events.trigger = function (source, eventName) {
    var listeners = getListeners(source, eventName),
        args = Array.prototype.slice.call(arguments, 2),
        eventID,
        l;

    for (eventID in listeners) {
        if (listeners.hasOwnProperty(eventID)) {
            l = listeners[eventID];
            if (l) {
                l.handler.apply(undefined, args);
            }
        }
    }
};

/**
 * Remove a previously registered event listener
 *
 * @param {events.EventListener} listener EventListener to remove, as returned by events.addListener
 */
events.removeListener = function (listener) {
    delete getListeners(listener.source, listener.eventName)[listener.eventID];
};

/**
 * Remove a all event listeners for a given event
 *
 * @param {Object} source Object to remove listeners from
 * @param {String} eventName Name of event to remove listeners from
 */
events.clearListeners = function (source, eventName) {
    var listeners = getListeners(source, eventName),
        eventID;


    for (eventID in listeners) {
        if (listeners.hasOwnProperty(eventID)) {
            var l = listeners[eventID];
            if (l) {
                events.removeListener(l);
            }
        }
    }
};

/**
 * Remove all event listeners on an object
 *
 * @param {Object} source Object to remove listeners from
 */
events.clearInstanceListeners = function (source) {
    var listeners = getListeners(source),
        eventID;

    for (var eventName in listeners) {
        if (listeners.hasOwnProperty(eventName)) {
            var el = listeners[eventName];
            for (eventID in el) {
                if (el.hasOwnProperty(eventID)) {
                    var l = el[eventID];
                    if (l) {
                        events.removeListener(l);
                    }
                }
            }
        }
    }
};

module.exports = events;

}};
__resources__["/__builtin__/global.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util'),
    events = require('events');


/**
 * @ignore
 */
function getAccessors(obj) {
    if (!obj.js_accessors_) {
        obj.js_accessors_ = {};
    }
    return obj.js_accessors_;
}

/**
 * @ignore
 */
function getBindings(obj) {
    if (!obj.js_bindings_) {
        obj.js_bindings_ = {};
    }
    return obj.js_bindings_;
}

/**
 * @ignore
 */
function addAccessor(obj, key, target, targetKey, noNotify) {
    getAccessors(obj)[key] = {
        key: targetKey,
        target: target
    };

    if (!noNotify) {
        obj.triggerChanged(key);
    }
}


/**
 * @ignore
 */
var objectID = 0;

/**
 * @class
 * A bindable object. Allows observing and binding to its properties.
 */
var BObject = function () {};
BObject.prototype = util.extend(BObject.prototype, /** @lends BObject# */{
    /**
     * Unique ID
     * @type Integer
     */
    _id: 0,
    

    /**
     * The constructor for subclasses. Overwrite this for any initalisation you
     * need to do.
     * @ignore
     */
    init: function () {},

    /**
     * Get a property from the object. Always use this instead of trying to
     * access the property directly. This will ensure all bindings, setters and
     * getters work correctly.
     * 
     * @param {String} key Name of property to get or dot (.) separated path to a property
     * @returns {*} Value of the property
     */
    get: function (key) {
        var next = false
        if (~key.indexOf('.')) {
            var tokens = key.split('.');
            key = tokens.shift();
            next = tokens.join('.');
        }


        var accessor = getAccessors(this)[key],
            val;
        if (accessor) {
            val = accessor.target.get(accessor.key);
        } else {
            // Call getting function
            if (this['get_' + key]) {
                val = this['get_' + key]();
            } else {
                val = this[key];
            }
        }

        if (next) {
            return val.get(next);
        } else {
            return val;
        }
    },


    /**
     * Set a property on the object. Always use this instead of trying to
     * access the property directly. This will ensure all bindings, setters and
     * getters work correctly.
     * 
     * @param {String} key Name of property to get
     * @param {*} value New value for the property
     */
    set: function (key, value) {
        var accessor = getAccessors(this)[key],
            oldVal = this.get(key);


        this.triggerBeforeChanged(key, oldVal);

        if (accessor) {
            accessor.target.set(accessor.key, value);
        } else {

            if (this['set_' + key]) {
                this['set_' + key](value);
            } else {
                this[key] = value;
            }
        }
        this.triggerChanged(key, oldVal);
    },

    /**
     * Set multiple propertys in one go
     *
     * @param {Object} kvp An Object where the key is a property name and the value is the value to assign to the property
     *
     * @example
     * var props = {
     *   monkey: 'ook',
     *   cat: 'meow',
     *   dog: 'woof'
     * };
     * foo.setValues(props);
     * console.log(foo.get('cat')); // Logs 'meow'
     */
    setValues: function (kvp) {
        for (var x in kvp) {
            if (kvp.hasOwnProperty(x)) {
                this.set(x, kvp[x]);
            }
        }
    },

    changed: function (key) {
    },

    /**
     * @private
     */
    notify: function (key, oldVal) {
        var accessor = getAccessors(this)[key];
        if (accessor) {
            accessor.target.notify(accessor.key, oldVal);
        }
    },

    /**
     * @private
     */
    triggerBeforeChanged: function (key, oldVal) {
        events.trigger(this, key.toLowerCase() + '_before_changed', oldVal);
    },

    /**
     * @private
     */
    triggerChanged: function (key, oldVal) {
        events.trigger(this, key.toLowerCase() + '_changed', oldVal);
    },

    /**
     * Bind the value of a property on this object to that of another object so
     * they always have the same value. Setting the value on either object will update
     * the other too.
     *
     * @param {String} key Name of the property on this object that should be bound
     * @param {BOject} target Object to bind to
     * @param {String} [targetKey=key] Key on the target object to bind to
     * @param {Boolean} [noNotify=false] Set to true to prevent this object's property triggering a 'changed' event when adding the binding
     */
    bindTo: function (key, target, targetKey, noNotify) {
        targetKey = targetKey || key;
        var self = this;
        this.unbind(key);

        var oldVal = this.get(key);

        // When bound property changes, trigger a 'changed' event on this one too
        getBindings(this)[key] = events.addListener(target, targetKey.toLowerCase() + '_changed', function (oldVal) {
            self.triggerChanged(key, oldVal);
        });

        addAccessor(this, key, target, targetKey, noNotify);
    },

    /**
     * Remove binding from a property which set setup using BObject#bindTo.
     *
     * @param {String} key Name of the property on this object to unbind
     */
    unbind: function (key) {
        var binding = getBindings(this)[key];
        if (!binding) {
            return;
        }

        delete getBindings(this)[key];
        events.removeListener(binding);
        // Grab current value from bound property
        var val = this.get(key);
        delete getAccessors(this)[key];
        // Set bound value
        this[key] = val;
    },

    /**
     * Remove all bindings on this object
     */
    unbindAll: function () {
        var keys = [],
            bindings = getBindings(this);
        for (var k in bindings) {
            if (bindings.hasOwnProperty(k)) {
                this.unbind(k);
            }
        }
    },

    /**
     * Unique ID for this object
     * @getter id
     * @type Integer
     */
    get_id: function () {
        if (!this._id) {
            this._id = ++objectID;
        }

        return this._id;
    }
});


/**
 * Create a new instance of this object
 * @returns {BObject} New instance of this object
 */
BObject.create = function () {
    var ret = new this();
    ret.init.apply(ret, arguments);
    return ret;
};

/**
 * Create a new subclass by extending this one
 * @returns {Object} A new subclass of this object
 */
BObject.extend = function() {
    var newObj = function() {},
        args = [],
        i,
        x;

    // Copy 'class' methods
    for (x in this) {
        if (this.hasOwnProperty(x)) {
            newObj[x] = this[x];
        }
    }


    // Add given properties to the prototype
    newObj.prototype = util.beget(this.prototype);
    args.push(newObj.prototype);
    for (i = 0; i<arguments.length; i++) {
        args.push(arguments[i]);
    }
    util.extend.apply(null, args);

    newObj.superclass = this.prototype;
    // Create new instance
    return newObj;
};

/**
 * Get a property from the class. Always use this instead of trying to
 * access the property directly. This will ensure all bindings, setters and
 * getters work correctly.
 * 
 * @function
 * @param {String} key Name of property to get
 * @returns {*} Value of the property
 */
BObject.get = BObject.prototype.get;

/**
 * Set a property on the class. Always use this instead of trying to
 * access the property directly. This will ensure all bindings, setters and
 * getters work correctly.
 * 
 * @function
 * @param {String} key Name of property to get
 * @param {*} value New value for the property
 */
BObject.set = BObject.prototype.set;

var BArray = BObject.extend(/** @lends BArray# */{

    /**
     * @constructs 
     * A bindable array. Allows observing for changes made to its contents
     *
     * @extends BObject
     * @param {Array} [array=[]] A normal JS array to use for data
     */
    init: function (array) {
        this.array = array || [];
        this.set('length', this.array.length);
    },

    /**
     * Get an item
     *
     * @param {Integer} i Index to get item from
     * @returns {*} Value stored in the array at index 'i'
     */
    getAt: function (i) {
        return this.array[i];
    },

    /**
     * Set an item -- Overwrites any existing item at index
     *
     * @param {Integer} i Index to set item to
     * @param {*} value Value to assign to index
     */
    setAt: function (i, value) {
        var oldVal = this.array[i];
        this.array[i] = value;

        events.trigger(this, 'set_at', i, oldVal);
    },

    /**
     * Insert a new item into the array without overwriting anything
     *
     * @param {Integer} i Index to insert item at
     * @param {*} value Value to insert
     */
    insertAt: function (i, value) {
        this.array.splice(i, 0, value);
        this.set('length', this.array.length);
        events.trigger(this, 'insert_at', i);
    },

    /**
     * Remove item from the array and return it
     *
     * @param {Integer} i Index to remove
     * @returns {*} Value that was removed
     */
    removeAt: function (i) {
        var oldVal = this.array[i];
        this.array.splice(i, 1);
        this.set('length', this.array.length);
        events.trigger(this, 'remove_at', i, oldVal);

        return oldVal;
    },

    /**
     * Get the internal Javascript Array instance
     *
     * @returns {Array} Internal Javascript Array
     */
    getArray: function () {
        return this.array;
    },

    /**
     * Append a value to the end of the array and return its new length
     *
     * @param {*} value Value to append to the array
     * @returns {Integer} New length of the array
     */
    push: function (value) {
        this.insertAt(this.array.length, value);
        return this.array.length;
    },

    /**
     * Remove value from the end of the array and return it
     *
     * @returns {*} Value that was removed
     */
    pop: function () {
        return this.removeAt(this.array.length - 1);
    }
});

exports.BObject = BObject;
exports.BArray = BArray;

}};
__resources__["/__builtin__/libs/base64.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/**
 * Thin wrapper around JXG's Base64 utils
 */

/** @ignore */
var JXG = require('JXGUtil');

/** @namespace */
var base64 = {
    /**
     * Decode a base64 encoded string into a binary string
     *
     * @param {String} input Base64 encoded data
     * @returns {String} Binary string
     */
    decode: function(input) {
        return JXG.Util.Base64.decode(input);
    },

    /**
     * Decode a base64 encoded string into a byte array
     *
     * @param {String} input Base64 encoded data
     * @returns {Integer[]} Array of bytes
     */
    decodeAsArray: function(input, bytes) {
        bytes = bytes || 1;

        var dec = JXG.Util.Base64.decode(input),
            ar = [], i, j, len;

        for (i = 0, len = dec.length/bytes; i < len; i++){
            ar[i] = 0;
            for (j = bytes-1; j >= 0; --j){
                ar[i] += dec.charCodeAt((i *bytes) +j) << (j *8);
            }
        }
        return ar;
    },

    /**
     * Encode a binary string into base64
     *
     * @param {String} input Binary string
     * @returns {String} Base64 encoded data
     */
    encode: function(input) {
        return JXG.Util.Base64.encode(input);
    }
};

module.exports = base64;

}};
__resources__["/__builtin__/libs/box2d.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
function extend(a, b) {
  for(var c in b) {
    a[c] = b[c]
  }
}
function isInstanceOf(obj, _constructor) {
  while(typeof obj === "object") {
    if(obj.constructor === _constructor) {
      return true
    }
    obj = obj._super
  }
  return false
}
;var b2BoundValues = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2BoundValues.prototype.__constructor = function() {
  this.lowerValues = new Array;
  this.lowerValues[0] = 0;
  this.lowerValues[1] = 0;
  this.upperValues = new Array;
  this.upperValues[0] = 0;
  this.upperValues[1] = 0
};
b2BoundValues.prototype.__varz = function() {
};
b2BoundValues.prototype.lowerValues = null;
b2BoundValues.prototype.upperValues = null;var b2PairManager = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2PairManager.prototype.__constructor = function() {
  this.m_pairs = new Array;
  this.m_pairBuffer = new Array;
  this.m_pairCount = 0;
  this.m_pairBufferCount = 0;
  this.m_freePair = null
};
b2PairManager.prototype.__varz = function() {
};
b2PairManager.prototype.AddPair = function(proxy1, proxy2) {
  var pair = proxy1.pairs[proxy2];
  if(pair != null) {
    return pair
  }
  if(this.m_freePair == null) {
    this.m_freePair = new b2Pair;
    this.m_pairs.push(this.m_freePair)
  }
  pair = this.m_freePair;
  this.m_freePair = pair.next;
  pair.proxy1 = proxy1;
  pair.proxy2 = proxy2;
  pair.status = 0;
  pair.userData = null;
  pair.next = null;
  proxy1.pairs[proxy2] = pair;
  proxy2.pairs[proxy1] = pair;
  ++this.m_pairCount;
  return pair
};
b2PairManager.prototype.RemovePair = function(proxy1, proxy2) {
  var pair = proxy1.pairs[proxy2];
  if(pair == null) {
    return null
  }
  var userData = pair.userData;
  delete proxy1.pairs[proxy2];
  delete proxy2.pairs[proxy1];
  pair.next = this.m_freePair;
  pair.proxy1 = null;
  pair.proxy2 = null;
  pair.userData = null;
  pair.status = 0;
  this.m_freePair = pair;
  --this.m_pairCount;
  return userData
};
b2PairManager.prototype.Find = function(proxy1, proxy2) {
  return proxy1.pairs[proxy2]
};
b2PairManager.prototype.ValidateBuffer = function() {
};
b2PairManager.prototype.ValidateTable = function() {
};
b2PairManager.prototype.Initialize = function(broadPhase) {
  this.m_broadPhase = broadPhase
};
b2PairManager.prototype.AddBufferedPair = function(proxy1, proxy2) {
  var pair = this.AddPair(proxy1, proxy2);
  if(pair.IsBuffered() == false) {
    pair.SetBuffered();
    this.m_pairBuffer[this.m_pairBufferCount] = pair;
    ++this.m_pairBufferCount
  }
  pair.ClearRemoved();
  if(b2BroadPhase.s_validate) {
    this.ValidateBuffer()
  }
};
b2PairManager.prototype.RemoveBufferedPair = function(proxy1, proxy2) {
  var pair = this.Find(proxy1, proxy2);
  if(pair == null) {
    return
  }
  if(pair.IsBuffered() == false) {
    pair.SetBuffered();
    this.m_pairBuffer[this.m_pairBufferCount] = pair;
    ++this.m_pairBufferCount
  }
  pair.SetRemoved();
  if(b2BroadPhase.s_validate) {
    this.ValidateBuffer()
  }
};
b2PairManager.prototype.Commit = function(callback) {
  var i = 0;
  var removeCount = 0;
  for(i = 0;i < this.m_pairBufferCount;++i) {
    var pair = this.m_pairBuffer[i];
    pair.ClearBuffered();
    var proxy1 = pair.proxy1;
    var proxy2 = pair.proxy2;
    if(pair.IsRemoved()) {
    }else {
      if(pair.IsFinal() == false) {
        callback(proxy1.userData, proxy2.userData)
      }
    }
  }
  this.m_pairBufferCount = 0;
  if(b2BroadPhase.s_validate) {
    this.ValidateTable()
  }
};
b2PairManager.prototype.m_broadPhase = null;
b2PairManager.prototype.m_pairs = null;
b2PairManager.prototype.m_freePair = null;
b2PairManager.prototype.m_pairCount = 0;
b2PairManager.prototype.m_pairBuffer = null;
b2PairManager.prototype.m_pairBufferCount = 0;var b2TimeStep = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2TimeStep.prototype.__constructor = function() {
};
b2TimeStep.prototype.__varz = function() {
};
b2TimeStep.prototype.Set = function(step) {
  this.dt = step.dt;
  this.inv_dt = step.inv_dt;
  this.positionIterations = step.positionIterations;
  this.velocityIterations = step.velocityIterations;
  this.warmStarting = step.warmStarting
};
b2TimeStep.prototype.dt = null;
b2TimeStep.prototype.inv_dt = null;
b2TimeStep.prototype.dtRatio = null;
b2TimeStep.prototype.velocityIterations = 0;
b2TimeStep.prototype.positionIterations = 0;
b2TimeStep.prototype.warmStarting = null;var b2Controller = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2Controller.prototype.__constructor = function() {
};
b2Controller.prototype.__varz = function() {
};
b2Controller.prototype.Step = function(step) {
};
b2Controller.prototype.Draw = function(debugDraw) {
};
b2Controller.prototype.AddBody = function(body) {
  var edge = new b2ControllerEdge;
  edge.controller = this;
  edge.body = body;
  edge.nextBody = m_bodyList;
  edge.prevBody = null;
  m_bodyList = edge;
  if(edge.nextBody) {
    edge.nextBody.prevBody = edge
  }
  m_bodyCount++;
  edge.nextController = body.m_controllerList;
  edge.prevController = null;
  body.m_controllerList = edge;
  if(edge.nextController) {
    edge.nextController.prevController = edge
  }
  body.m_controllerCount++
};
b2Controller.prototype.RemoveBody = function(body) {
  var edge = body.m_controllerList;
  while(edge && edge.controller != this) {
    edge = edge.nextController
  }
  if(edge.prevBody) {
    edge.prevBody.nextBody = edge.nextBody
  }
  if(edge.nextBody) {
    edge.nextBody.prevBody = edge.prevBody
  }
  if(edge.nextController) {
    edge.nextController.prevController = edge.prevController
  }
  if(edge.prevController) {
    edge.prevController.nextController = edge.nextController
  }
  if(m_bodyList == edge) {
    m_bodyList = edge.nextBody
  }
  if(body.m_controllerList == edge) {
    body.m_controllerList = edge.nextController
  }
  body.m_controllerCount--;
  m_bodyCount--
};
b2Controller.prototype.Clear = function() {
  while(m_bodyList) {
    this.RemoveBody(m_bodyList.body)
  }
};
b2Controller.prototype.GetNext = function() {
  return this.m_next
};
b2Controller.prototype.GetWorld = function() {
  return this.m_world
};
b2Controller.prototype.GetBodyList = function() {
  return m_bodyList
};
b2Controller.prototype.m_next = null;
b2Controller.prototype.m_prev = null;
b2Controller.prototype.m_world = null;var b2GravityController = function() {
  b2Controller.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2GravityController.prototype, b2Controller.prototype);
b2GravityController.prototype._super = b2Controller.prototype;
b2GravityController.prototype.__constructor = function() {
  this._super.__constructor.apply(this, arguments)
};
b2GravityController.prototype.__varz = function() {
};
b2GravityController.prototype.Step = function(step) {
  var i = null;
  var body1 = null;
  var p1 = null;
  var mass1 = 0;
  var j = null;
  var body2 = null;
  var p2 = null;
  var dx = 0;
  var dy = 0;
  var r2 = 0;
  var f = null;
  if(this.invSqr) {
    for(i = m_bodyList;i;i = i.nextBody) {
      body1 = i.body;
      p1 = body1.GetWorldCenter();
      mass1 = body1.GetMass();
      for(j = m_bodyList;j != i;j = j.nextBody) {
        body2 = j.body;
        p2 = body2.GetWorldCenter();
        dx = p2.x - p1.x;
        dy = p2.y - p1.y;
        r2 = dx * dx + dy * dy;
        if(r2 < Number.MIN_VALUE) {
          continue
        }
        f = new b2Vec2(dx, dy);
        f.Multiply(this.G / r2 / Math.sqrt(r2) * mass1 * body2.GetMass());
        if(body1.IsAwake()) {
          body1.ApplyForce(f, p1)
        }
        f.Multiply(-1);
        if(body2.IsAwake()) {
          body2.ApplyForce(f, p2)
        }
      }
    }
  }else {
    for(i = m_bodyList;i;i = i.nextBody) {
      body1 = i.body;
      p1 = body1.GetWorldCenter();
      mass1 = body1.GetMass();
      for(j = m_bodyList;j != i;j = j.nextBody) {
        body2 = j.body;
        p2 = body2.GetWorldCenter();
        dx = p2.x - p1.x;
        dy = p2.y - p1.y;
        r2 = dx * dx + dy * dy;
        if(r2 < Number.MIN_VALUE) {
          continue
        }
        f = new b2Vec2(dx, dy);
        f.Multiply(this.G / r2 * mass1 * body2.GetMass());
        if(body1.IsAwake()) {
          body1.ApplyForce(f, p1)
        }
        f.Multiply(-1);
        if(body2.IsAwake()) {
          body2.ApplyForce(f, p2)
        }
      }
    }
  }
};
b2GravityController.prototype.G = 1;
b2GravityController.prototype.invSqr = true;var b2DestructionListener = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2DestructionListener.prototype.__constructor = function() {
};
b2DestructionListener.prototype.__varz = function() {
};
b2DestructionListener.prototype.SayGoodbyeJoint = function(joint) {
};
b2DestructionListener.prototype.SayGoodbyeFixture = function(fixture) {
};var b2ContactEdge = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2ContactEdge.prototype.__constructor = function() {
};
b2ContactEdge.prototype.__varz = function() {
};
b2ContactEdge.prototype.other = null;
b2ContactEdge.prototype.contact = null;
b2ContactEdge.prototype.prev = null;
b2ContactEdge.prototype.next = null;var b2EdgeChainDef = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2EdgeChainDef.prototype.__constructor = function() {
  this.vertexCount = 0;
  this.isALoop = true;
  this.vertices = []
};
b2EdgeChainDef.prototype.__varz = function() {
};
b2EdgeChainDef.prototype.vertices = null;
b2EdgeChainDef.prototype.vertexCount = null;
b2EdgeChainDef.prototype.isALoop = null;var b2Vec2 = function(x_, y_) {
  if(arguments.length == 2) {
    this.x = x_;
    this.y = y_
  }
};
b2Vec2.Make = function(x_, y_) {
  return new b2Vec2(x_, y_)
};
b2Vec2.prototype.SetZero = function() {
  this.x = 0;
  this.y = 0
};
b2Vec2.prototype.Set = function(x_, y_) {
  this.x = x_;
  this.y = y_
};
b2Vec2.prototype.SetV = function(v) {
  this.x = v.x;
  this.y = v.y
};
b2Vec2.prototype.GetNegative = function() {
  return new b2Vec2(-this.x, -this.y)
};
b2Vec2.prototype.NegativeSelf = function() {
  this.x = -this.x;
  this.y = -this.y
};
b2Vec2.prototype.Copy = function() {
  return new b2Vec2(this.x, this.y)
};
b2Vec2.prototype.Add = function(v) {
  this.x += v.x;
  this.y += v.y
};
b2Vec2.prototype.Subtract = function(v) {
  this.x -= v.x;
  this.y -= v.y
};
b2Vec2.prototype.Multiply = function(a) {
  this.x *= a;
  this.y *= a
};
b2Vec2.prototype.MulM = function(A) {
  var tX = this.x;
  this.x = A.col1.x * tX + A.col2.x * this.y;
  this.y = A.col1.y * tX + A.col2.y * this.y
};
b2Vec2.prototype.MulTM = function(A) {
  var tX = b2Math.Dot(this, A.col1);
  this.y = b2Math.Dot(this, A.col2);
  this.x = tX
};
b2Vec2.prototype.CrossVF = function(s) {
  var tX = this.x;
  this.x = s * this.y;
  this.y = -s * tX
};
b2Vec2.prototype.CrossFV = function(s) {
  var tX = this.x;
  this.x = -s * this.y;
  this.y = s * tX
};
b2Vec2.prototype.MinV = function(b) {
  this.x = this.x < b.x ? this.x : b.x;
  this.y = this.y < b.y ? this.y : b.y
};
b2Vec2.prototype.MaxV = function(b) {
  this.x = this.x > b.x ? this.x : b.x;
  this.y = this.y > b.y ? this.y : b.y
};
b2Vec2.prototype.Abs = function() {
  if(this.x < 0) {
    this.x = -this.x
  }
  if(this.y < 0) {
    this.y = -this.y
  }
};
b2Vec2.prototype.Length = function() {
  return Math.sqrt(this.x * this.x + this.y * this.y)
};
b2Vec2.prototype.LengthSquared = function() {
  return this.x * this.x + this.y * this.y
};
b2Vec2.prototype.Normalize = function() {
  var length = Math.sqrt(this.x * this.x + this.y * this.y);
  if(length < Number.MIN_VALUE) {
    return 0
  }
  var invLength = 1 / length;
  this.x *= invLength;
  this.y *= invLength;
  return length
};
b2Vec2.prototype.IsValid = function() {
  return b2Math.IsValid(this.x) && b2Math.IsValid(this.y)
};
b2Vec2.prototype.x = 0;
b2Vec2.prototype.y = 0;var b2Vec3 = function(x, y, z) {
  if(arguments.length == 3) {
    this.x = x;
    this.y = y;
    this.z = z
  }
};
b2Vec3.prototype.SetZero = function() {
  this.x = this.y = this.z = 0
};
b2Vec3.prototype.Set = function(x, y, z) {
  this.x = x;
  this.y = y;
  this.z = z
};
b2Vec3.prototype.SetV = function(v) {
  this.x = v.x;
  this.y = v.y;
  this.z = v.z
};
b2Vec3.prototype.GetNegative = function() {
  return new b2Vec3(-this.x, -this.y, -this.z)
};
b2Vec3.prototype.NegativeSelf = function() {
  this.x = -this.x;
  this.y = -this.y;
  this.z = -this.z
};
b2Vec3.prototype.Copy = function() {
  return new b2Vec3(this.x, this.y, this.z)
};
b2Vec3.prototype.Add = function(v) {
  this.x += v.x;
  this.y += v.y;
  this.z += v.z
};
b2Vec3.prototype.Subtract = function(v) {
  this.x -= v.x;
  this.y -= v.y;
  this.z -= v.z
};
b2Vec3.prototype.Multiply = function(a) {
  this.x *= a;
  this.y *= a;
  this.z *= a
};
b2Vec3.prototype.x = 0;
b2Vec3.prototype.y = 0;
b2Vec3.prototype.z = 0;var b2DistanceProxy = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2DistanceProxy.prototype.__constructor = function() {
};
b2DistanceProxy.prototype.__varz = function() {
};
b2DistanceProxy.prototype.Set = function(shape) {
  switch(shape.GetType()) {
    case b2Shape.e_circleShape:
      var circle = shape;
      this.m_vertices = new Array(1);
      this.m_vertices[0] = circle.m_p;
      this.m_count = 1;
      this.m_radius = circle.m_radius;
      break;
    case b2Shape.e_polygonShape:
      var polygon = shape;
      this.m_vertices = polygon.m_vertices;
      this.m_count = polygon.m_vertexCount;
      this.m_radius = polygon.m_radius;
      break;
    default:
      b2Settings.b2Assert(false)
  }
};
b2DistanceProxy.prototype.GetSupport = function(d) {
  var bestIndex = 0;
  var bestValue = this.m_vertices[0].x * d.x + this.m_vertices[0].y * d.y;
  for(var i = 1;i < this.m_count;++i) {
    var value = this.m_vertices[i].x * d.x + this.m_vertices[i].y * d.y;
    if(value > bestValue) {
      bestIndex = i;
      bestValue = value
    }
  }
  return bestIndex
};
b2DistanceProxy.prototype.GetSupportVertex = function(d) {
  var bestIndex = 0;
  var bestValue = this.m_vertices[0].x * d.x + this.m_vertices[0].y * d.y;
  for(var i = 1;i < this.m_count;++i) {
    var value = this.m_vertices[i].x * d.x + this.m_vertices[i].y * d.y;
    if(value > bestValue) {
      bestIndex = i;
      bestValue = value
    }
  }
  return this.m_vertices[bestIndex]
};
b2DistanceProxy.prototype.GetVertexCount = function() {
  return this.m_count
};
b2DistanceProxy.prototype.GetVertex = function(index) {
  b2Settings.b2Assert(0 <= index && index < this.m_count);
  return this.m_vertices[index]
};
b2DistanceProxy.prototype.m_vertices = null;
b2DistanceProxy.prototype.m_count = 0;
b2DistanceProxy.prototype.m_radius = null;var b2ContactFactory = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2ContactFactory.prototype.__constructor = function() {
};
b2ContactFactory.prototype.__varz = function() {
  this.InitializeRegisters()
};
b2ContactFactory.prototype.AddType = function(createFcn, destroyFcn, type1, type2) {
  this.m_registers[type1][type2].createFcn = createFcn;
  this.m_registers[type1][type2].destroyFcn = destroyFcn;
  this.m_registers[type1][type2].primary = true;
  if(type1 != type2) {
    this.m_registers[type2][type1].createFcn = createFcn;
    this.m_registers[type2][type1].destroyFcn = destroyFcn;
    this.m_registers[type2][type1].primary = false
  }
};
b2ContactFactory.prototype.InitializeRegisters = function() {
  this.m_registers = new Array(b2Shape.e_shapeTypeCount);
  for(var i = 0;i < b2Shape.e_shapeTypeCount;i++) {
    this.m_registers[i] = new Array(b2Shape.e_shapeTypeCount);
    for(var j = 0;j < b2Shape.e_shapeTypeCount;j++) {
      this.m_registers[i][j] = new b2ContactRegister
    }
  }
  this.AddType(b2CircleContact.Create, b2CircleContact.Destroy, b2Shape.e_circleShape, b2Shape.e_circleShape);
  this.AddType(b2PolyAndCircleContact.Create, b2PolyAndCircleContact.Destroy, b2Shape.e_polygonShape, b2Shape.e_circleShape);
  this.AddType(b2PolygonContact.Create, b2PolygonContact.Destroy, b2Shape.e_polygonShape, b2Shape.e_polygonShape);
  this.AddType(b2EdgeAndCircleContact.Create, b2EdgeAndCircleContact.Destroy, b2Shape.e_edgeShape, b2Shape.e_circleShape);
  this.AddType(b2PolyAndEdgeContact.Create, b2PolyAndEdgeContact.Destroy, b2Shape.e_polygonShape, b2Shape.e_edgeShape)
};
b2ContactFactory.prototype.Create = function(fixtureA, fixtureB) {
  var type1 = fixtureA.GetType();
  var type2 = fixtureB.GetType();
  var reg = this.m_registers[type1][type2];
  var c;
  if(reg.pool) {
    c = reg.pool;
    reg.pool = c.m_next;
    reg.poolCount--;
    c.Reset(fixtureA, fixtureB);
    return c
  }
  var createFcn = reg.createFcn;
  if(createFcn != null) {
    if(reg.primary) {
      c = createFcn(this.m_allocator);
      c.Reset(fixtureA, fixtureB);
      return c
    }else {
      c = createFcn(this.m_allocator);
      c.Reset(fixtureB, fixtureA);
      return c
    }
  }else {
    return null
  }
};
b2ContactFactory.prototype.Destroy = function(contact) {
  if(contact.m_manifold.m_pointCount > 0) {
    contact.m_fixtureA.m_body.SetAwake(true);
    contact.m_fixtureB.m_body.SetAwake(true)
  }
  var type1 = contact.m_fixtureA.GetType();
  var type2 = contact.m_fixtureB.GetType();
  var reg = this.m_registers[type1][type2];
  if(true) {
    reg.poolCount++;
    contact.m_next = reg.pool;
    reg.pool = contact
  }
  var destroyFcn = reg.destroyFcn;
  destroyFcn(contact, this.m_allocator)
};
b2ContactFactory.prototype.m_registers = null;
b2ContactFactory.prototype.m_allocator = null;var b2ConstantAccelController = function() {
  b2Controller.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2ConstantAccelController.prototype, b2Controller.prototype);
b2ConstantAccelController.prototype._super = b2Controller.prototype;
b2ConstantAccelController.prototype.__constructor = function() {
  this._super.__constructor.apply(this, arguments)
};
b2ConstantAccelController.prototype.__varz = function() {
  this.A = new b2Vec2(0, 0)
};
b2ConstantAccelController.prototype.Step = function(step) {
  var smallA = new b2Vec2(this.A.x * step.dt, this.A.y * step.dt);
  for(var i = m_bodyList;i;i = i.nextBody) {
    var body = i.body;
    if(!body.IsAwake()) {
      continue
    }
    body.SetLinearVelocity(new b2Vec2(body.GetLinearVelocity().x + smallA.x, body.GetLinearVelocity().y + smallA.y))
  }
};
b2ConstantAccelController.prototype.A = new b2Vec2(0, 0);var b2SeparationFunction = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2SeparationFunction.prototype.__constructor = function() {
};
b2SeparationFunction.prototype.__varz = function() {
  this.m_localPoint = new b2Vec2;
  this.m_axis = new b2Vec2
};
b2SeparationFunction.e_points = 1;
b2SeparationFunction.e_faceA = 2;
b2SeparationFunction.e_faceB = 4;
b2SeparationFunction.prototype.Initialize = function(cache, proxyA, transformA, proxyB, transformB) {
  this.m_proxyA = proxyA;
  this.m_proxyB = proxyB;
  var count = cache.count;
  b2Settings.b2Assert(0 < count && count < 3);
  var localPointA;
  var localPointA1;
  var localPointA2;
  var localPointB;
  var localPointB1;
  var localPointB2;
  var pointAX;
  var pointAY;
  var pointBX;
  var pointBY;
  var normalX;
  var normalY;
  var tMat;
  var tVec;
  var s;
  var sgn;
  if(count == 1) {
    this.m_type = b2SeparationFunction.e_points;
    localPointA = this.m_proxyA.GetVertex(cache.indexA[0]);
    localPointB = this.m_proxyB.GetVertex(cache.indexB[0]);
    tVec = localPointA;
    tMat = transformA.R;
    pointAX = transformA.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
    pointAY = transformA.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
    tVec = localPointB;
    tMat = transformB.R;
    pointBX = transformB.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
    pointBY = transformB.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
    this.m_axis.x = pointBX - pointAX;
    this.m_axis.y = pointBY - pointAY;
    this.m_axis.Normalize()
  }else {
    if(cache.indexB[0] == cache.indexB[1]) {
      this.m_type = b2SeparationFunction.e_faceA;
      localPointA1 = this.m_proxyA.GetVertex(cache.indexA[0]);
      localPointA2 = this.m_proxyA.GetVertex(cache.indexA[1]);
      localPointB = this.m_proxyB.GetVertex(cache.indexB[0]);
      this.m_localPoint.x = 0.5 * (localPointA1.x + localPointA2.x);
      this.m_localPoint.y = 0.5 * (localPointA1.y + localPointA2.y);
      this.m_axis = b2Math.CrossVF(b2Math.SubtractVV(localPointA2, localPointA1), 1);
      this.m_axis.Normalize();
      tVec = this.m_axis;
      tMat = transformA.R;
      normalX = tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
      normalY = tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
      tVec = this.m_localPoint;
      tMat = transformA.R;
      pointAX = transformA.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
      pointAY = transformA.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
      tVec = localPointB;
      tMat = transformB.R;
      pointBX = transformB.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
      pointBY = transformB.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
      s = (pointBX - pointAX) * normalX + (pointBY - pointAY) * normalY;
      if(s < 0) {
        this.m_axis.NegativeSelf()
      }
    }else {
      if(cache.indexA[0] == cache.indexA[0]) {
        this.m_type = b2SeparationFunction.e_faceB;
        localPointB1 = this.m_proxyB.GetVertex(cache.indexB[0]);
        localPointB2 = this.m_proxyB.GetVertex(cache.indexB[1]);
        localPointA = this.m_proxyA.GetVertex(cache.indexA[0]);
        this.m_localPoint.x = 0.5 * (localPointB1.x + localPointB2.x);
        this.m_localPoint.y = 0.5 * (localPointB1.y + localPointB2.y);
        this.m_axis = b2Math.CrossVF(b2Math.SubtractVV(localPointB2, localPointB1), 1);
        this.m_axis.Normalize();
        tVec = this.m_axis;
        tMat = transformB.R;
        normalX = tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
        normalY = tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
        tVec = this.m_localPoint;
        tMat = transformB.R;
        pointBX = transformB.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
        pointBY = transformB.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
        tVec = localPointA;
        tMat = transformA.R;
        pointAX = transformA.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
        pointAY = transformA.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
        s = (pointAX - pointBX) * normalX + (pointAY - pointBY) * normalY;
        if(s < 0) {
          this.m_axis.NegativeSelf()
        }
      }else {
        localPointA1 = this.m_proxyA.GetVertex(cache.indexA[0]);
        localPointA2 = this.m_proxyA.GetVertex(cache.indexA[1]);
        localPointB1 = this.m_proxyB.GetVertex(cache.indexB[0]);
        localPointB2 = this.m_proxyB.GetVertex(cache.indexB[1]);
        var pA = b2Math.MulX(transformA, localPointA);
        var dA = b2Math.MulMV(transformA.R, b2Math.SubtractVV(localPointA2, localPointA1));
        var pB = b2Math.MulX(transformB, localPointB);
        var dB = b2Math.MulMV(transformB.R, b2Math.SubtractVV(localPointB2, localPointB1));
        var a = dA.x * dA.x + dA.y * dA.y;
        var e = dB.x * dB.x + dB.y * dB.y;
        var r = b2Math.SubtractVV(dB, dA);
        var c = dA.x * r.x + dA.y * r.y;
        var f = dB.x * r.x + dB.y * r.y;
        var b = dA.x * dB.x + dA.y * dB.y;
        var denom = a * e - b * b;
        s = 0;
        if(denom != 0) {
          s = b2Math.Clamp((b * f - c * e) / denom, 0, 1)
        }
        var t = (b * s + f) / e;
        if(t < 0) {
          t = 0;
          s = b2Math.Clamp((b - c) / a, 0, 1)
        }
        localPointA = new b2Vec2;
        localPointA.x = localPointA1.x + s * (localPointA2.x - localPointA1.x);
        localPointA.y = localPointA1.y + s * (localPointA2.y - localPointA1.y);
        localPointB = new b2Vec2;
        localPointB.x = localPointB1.x + s * (localPointB2.x - localPointB1.x);
        localPointB.y = localPointB1.y + s * (localPointB2.y - localPointB1.y);
        if(s == 0 || s == 1) {
          this.m_type = b2SeparationFunction.e_faceB;
          this.m_axis = b2Math.CrossVF(b2Math.SubtractVV(localPointB2, localPointB1), 1);
          this.m_axis.Normalize();
          this.m_localPoint = localPointB;
          tVec = this.m_axis;
          tMat = transformB.R;
          normalX = tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
          normalY = tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
          tVec = this.m_localPoint;
          tMat = transformB.R;
          pointBX = transformB.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
          pointBY = transformB.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
          tVec = localPointA;
          tMat = transformA.R;
          pointAX = transformA.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
          pointAY = transformA.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
          sgn = (pointAX - pointBX) * normalX + (pointAY - pointBY) * normalY;
          if(s < 0) {
            this.m_axis.NegativeSelf()
          }
        }else {
          this.m_type = b2SeparationFunction.e_faceA;
          this.m_axis = b2Math.CrossVF(b2Math.SubtractVV(localPointA2, localPointA1), 1);
          this.m_localPoint = localPointA;
          tVec = this.m_axis;
          tMat = transformA.R;
          normalX = tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
          normalY = tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
          tVec = this.m_localPoint;
          tMat = transformA.R;
          pointAX = transformA.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
          pointAY = transformA.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
          tVec = localPointB;
          tMat = transformB.R;
          pointBX = transformB.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
          pointBY = transformB.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
          sgn = (pointBX - pointAX) * normalX + (pointBY - pointAY) * normalY;
          if(s < 0) {
            this.m_axis.NegativeSelf()
          }
        }
      }
    }
  }
};
b2SeparationFunction.prototype.Evaluate = function(transformA, transformB) {
  var axisA;
  var axisB;
  var localPointA;
  var localPointB;
  var pointA;
  var pointB;
  var seperation;
  var normal;
  switch(this.m_type) {
    case b2SeparationFunction.e_points:
      axisA = b2Math.MulTMV(transformA.R, this.m_axis);
      axisB = b2Math.MulTMV(transformB.R, this.m_axis.GetNegative());
      localPointA = this.m_proxyA.GetSupportVertex(axisA);
      localPointB = this.m_proxyB.GetSupportVertex(axisB);
      pointA = b2Math.MulX(transformA, localPointA);
      pointB = b2Math.MulX(transformB, localPointB);
      seperation = (pointB.x - pointA.x) * this.m_axis.x + (pointB.y - pointA.y) * this.m_axis.y;
      return seperation;
    case b2SeparationFunction.e_faceA:
      normal = b2Math.MulMV(transformA.R, this.m_axis);
      pointA = b2Math.MulX(transformA, this.m_localPoint);
      axisB = b2Math.MulTMV(transformB.R, normal.GetNegative());
      localPointB = this.m_proxyB.GetSupportVertex(axisB);
      pointB = b2Math.MulX(transformB, localPointB);
      seperation = (pointB.x - pointA.x) * normal.x + (pointB.y - pointA.y) * normal.y;
      return seperation;
    case b2SeparationFunction.e_faceB:
      normal = b2Math.MulMV(transformB.R, this.m_axis);
      pointB = b2Math.MulX(transformB, this.m_localPoint);
      axisA = b2Math.MulTMV(transformA.R, normal.GetNegative());
      localPointA = this.m_proxyA.GetSupportVertex(axisA);
      pointA = b2Math.MulX(transformA, localPointA);
      seperation = (pointA.x - pointB.x) * normal.x + (pointA.y - pointB.y) * normal.y;
      return seperation;
    default:
      b2Settings.b2Assert(false);
      return 0
  }
};
b2SeparationFunction.prototype.m_proxyA = null;
b2SeparationFunction.prototype.m_proxyB = null;
b2SeparationFunction.prototype.m_type = 0;
b2SeparationFunction.prototype.m_localPoint = new b2Vec2;
b2SeparationFunction.prototype.m_axis = new b2Vec2;var b2DynamicTreePair = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2DynamicTreePair.prototype.__constructor = function() {
};
b2DynamicTreePair.prototype.__varz = function() {
};
b2DynamicTreePair.prototype.proxyA = null;
b2DynamicTreePair.prototype.proxyB = null;var b2ContactConstraintPoint = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2ContactConstraintPoint.prototype.__constructor = function() {
};
b2ContactConstraintPoint.prototype.__varz = function() {
  this.localPoint = new b2Vec2;
  this.rA = new b2Vec2;
  this.rB = new b2Vec2
};
b2ContactConstraintPoint.prototype.localPoint = new b2Vec2;
b2ContactConstraintPoint.prototype.rA = new b2Vec2;
b2ContactConstraintPoint.prototype.rB = new b2Vec2;
b2ContactConstraintPoint.prototype.normalImpulse = null;
b2ContactConstraintPoint.prototype.tangentImpulse = null;
b2ContactConstraintPoint.prototype.normalMass = null;
b2ContactConstraintPoint.prototype.tangentMass = null;
b2ContactConstraintPoint.prototype.equalizedMass = null;
b2ContactConstraintPoint.prototype.velocityBias = null;var b2ControllerEdge = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2ControllerEdge.prototype.__constructor = function() {
};
b2ControllerEdge.prototype.__varz = function() {
};
b2ControllerEdge.prototype.controller = null;
b2ControllerEdge.prototype.body = null;
b2ControllerEdge.prototype.prevBody = null;
b2ControllerEdge.prototype.nextBody = null;
b2ControllerEdge.prototype.prevController = null;
b2ControllerEdge.prototype.nextController = null;var b2DistanceInput = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2DistanceInput.prototype.__constructor = function() {
};
b2DistanceInput.prototype.__varz = function() {
};
b2DistanceInput.prototype.proxyA = null;
b2DistanceInput.prototype.proxyB = null;
b2DistanceInput.prototype.transformA = null;
b2DistanceInput.prototype.transformB = null;
b2DistanceInput.prototype.useRadii = null;var b2Settings = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2Settings.prototype.__constructor = function() {
};
b2Settings.prototype.__varz = function() {
};
b2Settings.b2MixFriction = function(friction1, friction2) {
  return Math.sqrt(friction1 * friction2)
};
b2Settings.b2MixRestitution = function(restitution1, restitution2) {
  return restitution1 > restitution2 ? restitution1 : restitution2
};
b2Settings.b2Assert = function(a) {
  if(!a) {
    throw"Assertion Failed";
  }
};
b2Settings.VERSION = "2.1alpha";
b2Settings.USHRT_MAX = 65535;
b2Settings.b2_pi = Math.PI;
b2Settings.b2_maxManifoldPoints = 2;
b2Settings.b2_aabbExtension = 0.1;
b2Settings.b2_aabbMultiplier = 2;
b2Settings.b2_polygonRadius = 2 * b2Settings.b2_linearSlop;
b2Settings.b2_linearSlop = 0.0050;
b2Settings.b2_angularSlop = 2 / 180 * b2Settings.b2_pi;
b2Settings.b2_toiSlop = 8 * b2Settings.b2_linearSlop;
b2Settings.b2_maxTOIContactsPerIsland = 32;
b2Settings.b2_maxTOIJointsPerIsland = 32;
b2Settings.b2_velocityThreshold = 1;
b2Settings.b2_maxLinearCorrection = 0.2;
b2Settings.b2_maxAngularCorrection = 8 / 180 * b2Settings.b2_pi;
b2Settings.b2_maxTranslation = 2;
b2Settings.b2_maxTranslationSquared = b2Settings.b2_maxTranslation * b2Settings.b2_maxTranslation;
b2Settings.b2_maxRotation = 0.5 * b2Settings.b2_pi;
b2Settings.b2_maxRotationSquared = b2Settings.b2_maxRotation * b2Settings.b2_maxRotation;
b2Settings.b2_contactBaumgarte = 0.2;
b2Settings.b2_timeToSleep = 0.5;
b2Settings.b2_linearSleepTolerance = 0.01;
b2Settings.b2_angularSleepTolerance = 2 / 180 * b2Settings.b2_pi;var b2Proxy = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2Proxy.prototype.__constructor = function() {
};
b2Proxy.prototype.__varz = function() {
  this.lowerBounds = new Array(2);
  this.upperBounds = new Array(2);
  this.pairs = new Object
};
b2Proxy.prototype.IsValid = function() {
  return this.overlapCount != b2BroadPhase.b2_invalid
};
b2Proxy.prototype.lowerBounds = new Array(2);
b2Proxy.prototype.upperBounds = new Array(2);
b2Proxy.prototype.overlapCount = 0;
b2Proxy.prototype.timeStamp = 0;
b2Proxy.prototype.pairs = new Object;
b2Proxy.prototype.next = null;
b2Proxy.prototype.userData = null;var b2Point = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2Point.prototype.__constructor = function() {
};
b2Point.prototype.__varz = function() {
  this.p = new b2Vec2
};
b2Point.prototype.Support = function(xf, vX, vY) {
  return this.p
};
b2Point.prototype.GetFirstVertex = function(xf) {
  return this.p
};
b2Point.prototype.p = new b2Vec2;var b2WorldManifold = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2WorldManifold.prototype.__constructor = function() {
  this.m_points = new Array(b2Settings.b2_maxManifoldPoints);
  for(var i = 0;i < b2Settings.b2_maxManifoldPoints;i++) {
    this.m_points[i] = new b2Vec2
  }
};
b2WorldManifold.prototype.__varz = function() {
  this.m_normal = new b2Vec2
};
b2WorldManifold.prototype.Initialize = function(manifold, xfA, radiusA, xfB, radiusB) {
  if(manifold.m_pointCount == 0) {
    return
  }
  var i = 0;
  var tVec;
  var tMat;
  var normalX;
  var normalY;
  var planePointX;
  var planePointY;
  var clipPointX;
  var clipPointY;
  switch(manifold.m_type) {
    case b2Manifold.e_circles:
      tMat = xfA.R;
      tVec = manifold.m_localPoint;
      var pointAX = xfA.position.x + tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
      var pointAY = xfA.position.y + tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
      tMat = xfB.R;
      tVec = manifold.m_points[0].m_localPoint;
      var pointBX = xfB.position.x + tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
      var pointBY = xfB.position.y + tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
      var dX = pointBX - pointAX;
      var dY = pointBY - pointAY;
      var d2 = dX * dX + dY * dY;
      if(d2 > Number.MIN_VALUE * Number.MIN_VALUE) {
        var d = Math.sqrt(d2);
        this.m_normal.x = dX / d;
        this.m_normal.y = dY / d
      }else {
        this.m_normal.x = 1;
        this.m_normal.y = 0
      }
      var cAX = pointAX + radiusA * this.m_normal.x;
      var cAY = pointAY + radiusA * this.m_normal.y;
      var cBX = pointBX - radiusB * this.m_normal.x;
      var cBY = pointBY - radiusB * this.m_normal.y;
      this.m_points[0].x = 0.5 * (cAX + cBX);
      this.m_points[0].y = 0.5 * (cAY + cBY);
      break;
    case b2Manifold.e_faceA:
      tMat = xfA.R;
      tVec = manifold.m_localPlaneNormal;
      normalX = tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
      normalY = tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
      tMat = xfA.R;
      tVec = manifold.m_localPoint;
      planePointX = xfA.position.x + tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
      planePointY = xfA.position.y + tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
      this.m_normal.x = normalX;
      this.m_normal.y = normalY;
      for(i = 0;i < manifold.m_pointCount;i++) {
        tMat = xfB.R;
        tVec = manifold.m_points[i].m_localPoint;
        clipPointX = xfB.position.x + tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
        clipPointY = xfB.position.y + tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
        this.m_points[i].x = clipPointX + 0.5 * (radiusA - (clipPointX - planePointX) * normalX - (clipPointY - planePointY) * normalY - radiusB) * normalX;
        this.m_points[i].y = clipPointY + 0.5 * (radiusA - (clipPointX - planePointX) * normalX - (clipPointY - planePointY) * normalY - radiusB) * normalY
      }
      break;
    case b2Manifold.e_faceB:
      tMat = xfB.R;
      tVec = manifold.m_localPlaneNormal;
      normalX = tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
      normalY = tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
      tMat = xfB.R;
      tVec = manifold.m_localPoint;
      planePointX = xfB.position.x + tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
      planePointY = xfB.position.y + tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
      this.m_normal.x = -normalX;
      this.m_normal.y = -normalY;
      for(i = 0;i < manifold.m_pointCount;i++) {
        tMat = xfA.R;
        tVec = manifold.m_points[i].m_localPoint;
        clipPointX = xfA.position.x + tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
        clipPointY = xfA.position.y + tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
        this.m_points[i].x = clipPointX + 0.5 * (radiusB - (clipPointX - planePointX) * normalX - (clipPointY - planePointY) * normalY - radiusA) * normalX;
        this.m_points[i].y = clipPointY + 0.5 * (radiusB - (clipPointX - planePointX) * normalX - (clipPointY - planePointY) * normalY - radiusA) * normalY
      }
      break
  }
};
b2WorldManifold.prototype.m_normal = new b2Vec2;
b2WorldManifold.prototype.m_points = null;var b2RayCastOutput = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2RayCastOutput.prototype.__constructor = function() {
};
b2RayCastOutput.prototype.__varz = function() {
  this.normal = new b2Vec2
};
b2RayCastOutput.prototype.normal = new b2Vec2;
b2RayCastOutput.prototype.fraction = null;var b2ConstantForceController = function() {
  b2Controller.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2ConstantForceController.prototype, b2Controller.prototype);
b2ConstantForceController.prototype._super = b2Controller.prototype;
b2ConstantForceController.prototype.__constructor = function() {
  this._super.__constructor.apply(this, arguments)
};
b2ConstantForceController.prototype.__varz = function() {
  this.F = new b2Vec2(0, 0)
};
b2ConstantForceController.prototype.Step = function(step) {
  for(var i = m_bodyList;i;i = i.nextBody) {
    var body = i.body;
    if(!body.IsAwake()) {
      continue
    }
    body.ApplyForce(this.F, body.GetWorldCenter())
  }
};
b2ConstantForceController.prototype.F = new b2Vec2(0, 0);var b2MassData = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2MassData.prototype.__constructor = function() {
};
b2MassData.prototype.__varz = function() {
  this.center = new b2Vec2(0, 0)
};
b2MassData.prototype.mass = 0;
b2MassData.prototype.center = new b2Vec2(0, 0);
b2MassData.prototype.I = 0;var b2DynamicTree = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2DynamicTree.prototype.__constructor = function() {
  this.m_root = null;
  this.m_freeList = null;
  this.m_path = 0;
  this.m_insertionCount = 0
};
b2DynamicTree.prototype.__varz = function() {
};
b2DynamicTree.prototype.AllocateNode = function() {
  if(this.m_freeList) {
    var node = this.m_freeList;
    this.m_freeList = node.parent;
    node.parent = null;
    node.child1 = null;
    node.child2 = null;
    return node
  }
  return new b2DynamicTreeNode
};
b2DynamicTree.prototype.FreeNode = function(node) {
  node.parent = this.m_freeList;
  this.m_freeList = node
};
b2DynamicTree.prototype.InsertLeaf = function(leaf) {
  ++this.m_insertionCount;
  if(this.m_root == null) {
    this.m_root = leaf;
    this.m_root.parent = null;
    return
  }
  var center = leaf.aabb.GetCenter();
  var sibling = this.m_root;
  if(sibling.IsLeaf() == false) {
    do {
      var child1 = sibling.child1;
      var child2 = sibling.child2;
      var norm1 = Math.abs((child1.aabb.lowerBound.x + child1.aabb.upperBound.x) / 2 - center.x) + Math.abs((child1.aabb.lowerBound.y + child1.aabb.upperBound.y) / 2 - center.y);
      var norm2 = Math.abs((child2.aabb.lowerBound.x + child2.aabb.upperBound.x) / 2 - center.x) + Math.abs((child2.aabb.lowerBound.y + child2.aabb.upperBound.y) / 2 - center.y);
      if(norm1 < norm2) {
        sibling = child1
      }else {
        sibling = child2
      }
    }while(sibling.IsLeaf() == false)
  }
  var node1 = sibling.parent;
  var node2 = this.AllocateNode();
  node2.parent = node1;
  node2.userData = null;
  node2.aabb.Combine(leaf.aabb, sibling.aabb);
  if(node1) {
    if(sibling.parent.child1 == sibling) {
      node1.child1 = node2
    }else {
      node1.child2 = node2
    }
    node2.child1 = sibling;
    node2.child2 = leaf;
    sibling.parent = node2;
    leaf.parent = node2;
    do {
      if(node1.aabb.Contains(node2.aabb)) {
        break
      }
      node1.aabb.Combine(node1.child1.aabb, node1.child2.aabb);
      node2 = node1;
      node1 = node1.parent
    }while(node1)
  }else {
    node2.child1 = sibling;
    node2.child2 = leaf;
    sibling.parent = node2;
    leaf.parent = node2;
    this.m_root = node2
  }
};
b2DynamicTree.prototype.RemoveLeaf = function(leaf) {
  if(leaf == this.m_root) {
    this.m_root = null;
    return
  }
  var node2 = leaf.parent;
  var node1 = node2.parent;
  var sibling;
  if(node2.child1 == leaf) {
    sibling = node2.child2
  }else {
    sibling = node2.child1
  }
  if(node1) {
    if(node1.child1 == node2) {
      node1.child1 = sibling
    }else {
      node1.child2 = sibling
    }
    sibling.parent = node1;
    this.FreeNode(node2);
    while(node1) {
      var oldAABB = node1.aabb;
      node1.aabb = b2AABB.Combine(node1.child1.aabb, node1.child2.aabb);
      if(oldAABB.Contains(node1.aabb)) {
        break
      }
      node1 = node1.parent
    }
  }else {
    this.m_root = sibling;
    sibling.parent = null;
    this.FreeNode(node2)
  }
};
b2DynamicTree.prototype.CreateProxy = function(aabb, userData) {
  var node = this.AllocateNode();
  var extendX = b2Settings.b2_aabbExtension;
  var extendY = b2Settings.b2_aabbExtension;
  node.aabb.lowerBound.x = aabb.lowerBound.x - extendX;
  node.aabb.lowerBound.y = aabb.lowerBound.y - extendY;
  node.aabb.upperBound.x = aabb.upperBound.x + extendX;
  node.aabb.upperBound.y = aabb.upperBound.y + extendY;
  node.userData = userData;
  this.InsertLeaf(node);
  return node
};
b2DynamicTree.prototype.DestroyProxy = function(proxy) {
  this.RemoveLeaf(proxy);
  this.FreeNode(proxy)
};
b2DynamicTree.prototype.MoveProxy = function(proxy, aabb, displacement) {
  b2Settings.b2Assert(proxy.IsLeaf());
  if(proxy.aabb.Contains(aabb)) {
    return false
  }
  this.RemoveLeaf(proxy);
  var extendX = b2Settings.b2_aabbExtension + b2Settings.b2_aabbMultiplier * (displacement.x > 0 ? displacement.x : -displacement.x);
  var extendY = b2Settings.b2_aabbExtension + b2Settings.b2_aabbMultiplier * (displacement.y > 0 ? displacement.y : -displacement.y);
  proxy.aabb.lowerBound.x = aabb.lowerBound.x - extendX;
  proxy.aabb.lowerBound.y = aabb.lowerBound.y - extendY;
  proxy.aabb.upperBound.x = aabb.upperBound.x + extendX;
  proxy.aabb.upperBound.y = aabb.upperBound.y + extendY;
  this.InsertLeaf(proxy);
  return true
};
b2DynamicTree.prototype.Rebalance = function(iterations) {
  if(this.m_root == null) {
    return
  }
  for(var i = 0;i < iterations;i++) {
    var node = this.m_root;
    var bit = 0;
    while(node.IsLeaf() == false) {
      node = this.m_path >> bit & 1 ? node.child2 : node.child1;
      bit = bit + 1 & 31
    }
    ++this.m_path;
    this.RemoveLeaf(node);
    this.InsertLeaf(node)
  }
};
b2DynamicTree.prototype.GetFatAABB = function(proxy) {
  return proxy.aabb
};
b2DynamicTree.prototype.GetUserData = function(proxy) {
  return proxy.userData
};
b2DynamicTree.prototype.Query = function(callback, aabb) {
  if(this.m_root == null) {
    return
  }
  var stack = new Array;
  var count = 0;
  stack[count++] = this.m_root;
  while(count > 0) {
    var node = stack[--count];
    if(node.aabb.TestOverlap(aabb)) {
      if(node.IsLeaf()) {
        var proceed = callback(node);
        if(!proceed) {
          return
        }
      }else {
        stack[count++] = node.child1;
        stack[count++] = node.child2
      }
    }
  }
};
b2DynamicTree.prototype.RayCast = function(callback, input) {
  if(this.m_root == null) {
    return
  }
  var p1 = input.p1;
  var p2 = input.p2;
  var r = b2Math.SubtractVV(p1, p2);
  r.Normalize();
  var v = b2Math.CrossFV(1, r);
  var abs_v = b2Math.AbsV(v);
  var maxFraction = input.maxFraction;
  var segmentAABB = new b2AABB;
  var tX;
  var tY;
  tX = p1.x + maxFraction * (p2.x - p1.x);
  tY = p1.y + maxFraction * (p2.y - p1.y);
  segmentAABB.lowerBound.x = Math.min(p1.x, tX);
  segmentAABB.lowerBound.y = Math.min(p1.y, tY);
  segmentAABB.upperBound.x = Math.max(p1.x, tX);
  segmentAABB.upperBound.y = Math.max(p1.y, tY);
  var stack = new Array;
  var count = 0;
  stack[count++] = this.m_root;
  while(count > 0) {
    var node = stack[--count];
    if(node.aabb.TestOverlap(segmentAABB) == false) {
      continue
    }
    var c = node.aabb.GetCenter();
    var h = node.aabb.GetExtents();
    var separation = Math.abs(v.x * (p1.x - c.x) + v.y * (p1.y - c.y)) - abs_v.x * h.x - abs_v.y * h.y;
    if(separation > 0) {
      continue
    }
    if(node.IsLeaf()) {
      var subInput = new b2RayCastInput;
      subInput.p1 = input.p1;
      subInput.p2 = input.p2;
      subInput.maxFraction = input.maxFraction;
      maxFraction = callback(subInput, node);
      if(maxFraction == 0) {
        return
      }
      tX = p1.x + maxFraction * (p2.x - p1.x);
      tY = p1.y + maxFraction * (p2.y - p1.y);
      segmentAABB.lowerBound.x = Math.min(p1.x, tX);
      segmentAABB.lowerBound.y = Math.min(p1.y, tY);
      segmentAABB.upperBound.x = Math.max(p1.x, tX);
      segmentAABB.upperBound.y = Math.max(p1.y, tY)
    }else {
      stack[count++] = node.child1;
      stack[count++] = node.child2
    }
  }
};
b2DynamicTree.prototype.m_root = null;
b2DynamicTree.prototype.m_freeList = null;
b2DynamicTree.prototype.m_path = 0;
b2DynamicTree.prototype.m_insertionCount = 0;var b2JointEdge = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2JointEdge.prototype.__constructor = function() {
};
b2JointEdge.prototype.__varz = function() {
};
b2JointEdge.prototype.other = null;
b2JointEdge.prototype.joint = null;
b2JointEdge.prototype.prev = null;
b2JointEdge.prototype.next = null;var b2RayCastInput = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2RayCastInput.prototype.__constructor = function() {
};
b2RayCastInput.prototype.__varz = function() {
  this.p1 = new b2Vec2;
  this.p2 = new b2Vec2
};
b2RayCastInput.prototype.p1 = new b2Vec2;
b2RayCastInput.prototype.p2 = new b2Vec2;
b2RayCastInput.prototype.maxFraction = null;var Features = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
Features.prototype.__constructor = function() {
};
Features.prototype.__varz = function() {
};
Features.prototype.__defineGetter__("referenceEdge", function() {
  return this._referenceEdge
});
Features.prototype.__defineSetter__("referenceEdge", function(value) {
  this._referenceEdge = value;
  this._m_id._key = this._m_id._key & 4294967040 | this._referenceEdge & 255
});
Features.prototype.__defineGetter__("incidentEdge", function() {
  return this._incidentEdge
});
Features.prototype.__defineSetter__("incidentEdge", function(value) {
  this._incidentEdge = value;
  this._m_id._key = this._m_id._key & 4294902015 | this._incidentEdge << 8 & 65280
});
Features.prototype.__defineGetter__("incidentVertex", function() {
  return this._incidentVertex
});
Features.prototype.__defineSetter__("incidentVertex", function(value) {
  this._incidentVertex = value;
  this._m_id._key = this._m_id._key & 4278255615 | this._incidentVertex << 16 & 16711680
});
Features.prototype.__defineGetter__("flip", function() {
  return this._flip
});
Features.prototype.__defineSetter__("flip", function(value) {
  this._flip = value;
  this._m_id._key = this._m_id._key & 16777215 | this._flip << 24 & 4278190080
});
Features.prototype._referenceEdge = 0;
Features.prototype._incidentEdge = 0;
Features.prototype._incidentVertex = 0;
Features.prototype._flip = 0;
Features.prototype._m_id = null;var b2FilterData = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2FilterData.prototype.__constructor = function() {
};
b2FilterData.prototype.__varz = function() {
  this.categoryBits = 1;
  this.maskBits = 65535
};
b2FilterData.prototype.Copy = function() {
  var copy = new b2FilterData;
  copy.categoryBits = this.categoryBits;
  copy.maskBits = this.maskBits;
  copy.groupIndex = this.groupIndex;
  return copy
};
b2FilterData.prototype.categoryBits = 1;
b2FilterData.prototype.maskBits = 65535;
b2FilterData.prototype.groupIndex = 0;var b2AABB = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2AABB.prototype.__constructor = function() {
};
b2AABB.prototype.__varz = function() {
  this.lowerBound = new b2Vec2;
  this.upperBound = new b2Vec2
};
b2AABB.Combine = function(aabb1, aabb2) {
  var aabb = new b2AABB;
  aabb.Combine(aabb1, aabb2);
  return aabb
};
b2AABB.prototype.IsValid = function() {
  var dX = this.upperBound.x - this.lowerBound.x;
  var dY = this.upperBound.y - this.lowerBound.y;
  var valid = dX >= 0 && dY >= 0;
  valid = valid && this.lowerBound.IsValid() && this.upperBound.IsValid();
  return valid
};
b2AABB.prototype.GetCenter = function() {
  return new b2Vec2((this.lowerBound.x + this.upperBound.x) / 2, (this.lowerBound.y + this.upperBound.y) / 2)
};
b2AABB.prototype.GetExtents = function() {
  return new b2Vec2((this.upperBound.x - this.lowerBound.x) / 2, (this.upperBound.y - this.lowerBound.y) / 2)
};
b2AABB.prototype.Contains = function(aabb) {
  var result = true && this.lowerBound.x <= aabb.lowerBound.x && this.lowerBound.y <= aabb.lowerBound.y && aabb.upperBound.x <= this.upperBound.x && aabb.upperBound.y <= this.upperBound.y;
  return result
};
b2AABB.prototype.RayCast = function(output, input) {
  var tmin = -Number.MAX_VALUE;
  var tmax = Number.MAX_VALUE;
  var pX = input.p1.x;
  var pY = input.p1.y;
  var dX = input.p2.x - input.p1.x;
  var dY = input.p2.y - input.p1.y;
  var absDX = Math.abs(dX);
  var absDY = Math.abs(dY);
  var normal = output.normal;
  var inv_d;
  var t1;
  var t2;
  var t3;
  var s;
  if(absDX < Number.MIN_VALUE) {
    if(pX < this.lowerBound.x || this.upperBound.x < pX) {
      return false
    }
  }else {
    inv_d = 1 / dX;
    t1 = (this.lowerBound.x - pX) * inv_d;
    t2 = (this.upperBound.x - pX) * inv_d;
    s = -1;
    if(t1 > t2) {
      t3 = t1;
      t1 = t2;
      t2 = t3;
      s = 1
    }
    if(t1 > tmin) {
      normal.x = s;
      normal.y = 0;
      tmin = t1
    }
    tmax = Math.min(tmax, t2);
    if(tmin > tmax) {
      return false
    }
  }
  if(absDY < Number.MIN_VALUE) {
    if(pY < this.lowerBound.y || this.upperBound.y < pY) {
      return false
    }
  }else {
    inv_d = 1 / dY;
    t1 = (this.lowerBound.y - pY) * inv_d;
    t2 = (this.upperBound.y - pY) * inv_d;
    s = -1;
    if(t1 > t2) {
      t3 = t1;
      t1 = t2;
      t2 = t3;
      s = 1
    }
    if(t1 > tmin) {
      normal.y = s;
      normal.x = 0;
      tmin = t1
    }
    tmax = Math.min(tmax, t2);
    if(tmin > tmax) {
      return false
    }
  }
  output.fraction = tmin;
  return true
};
b2AABB.prototype.TestOverlap = function(other) {
  var d1X = other.lowerBound.x - this.upperBound.x;
  var d1Y = other.lowerBound.y - this.upperBound.y;
  var d2X = this.lowerBound.x - other.upperBound.x;
  var d2Y = this.lowerBound.y - other.upperBound.y;
  if(d1X > 0 || d1Y > 0) {
    return false
  }
  if(d2X > 0 || d2Y > 0) {
    return false
  }
  return true
};
b2AABB.prototype.Combine = function(aabb1, aabb2) {
  this.lowerBound.x = Math.min(aabb1.lowerBound.x, aabb2.lowerBound.x);
  this.lowerBound.y = Math.min(aabb1.lowerBound.y, aabb2.lowerBound.y);
  this.upperBound.x = Math.max(aabb1.upperBound.x, aabb2.upperBound.x);
  this.upperBound.y = Math.max(aabb1.upperBound.y, aabb2.upperBound.y)
};
b2AABB.prototype.lowerBound = new b2Vec2;
b2AABB.prototype.upperBound = new b2Vec2;var b2Jacobian = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2Jacobian.prototype.__constructor = function() {
};
b2Jacobian.prototype.__varz = function() {
  this.linearA = new b2Vec2;
  this.linearB = new b2Vec2
};
b2Jacobian.prototype.SetZero = function() {
  this.linearA.SetZero();
  this.angularA = 0;
  this.linearB.SetZero();
  this.angularB = 0
};
b2Jacobian.prototype.Set = function(x1, a1, x2, a2) {
  this.linearA.SetV(x1);
  this.angularA = a1;
  this.linearB.SetV(x2);
  this.angularB = a2
};
b2Jacobian.prototype.Compute = function(x1, a1, x2, a2) {
  return this.linearA.x * x1.x + this.linearA.y * x1.y + this.angularA * a1 + (this.linearB.x * x2.x + this.linearB.y * x2.y) + this.angularB * a2
};
b2Jacobian.prototype.linearA = new b2Vec2;
b2Jacobian.prototype.angularA = null;
b2Jacobian.prototype.linearB = new b2Vec2;
b2Jacobian.prototype.angularB = null;var b2Bound = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2Bound.prototype.__constructor = function() {
};
b2Bound.prototype.__varz = function() {
};
b2Bound.prototype.IsLower = function() {
  return(this.value & 1) == 0
};
b2Bound.prototype.IsUpper = function() {
  return(this.value & 1) == 1
};
b2Bound.prototype.Swap = function(b) {
  var tempValue = this.value;
  var tempProxy = this.proxy;
  var tempStabbingCount = this.stabbingCount;
  this.value = b.value;
  this.proxy = b.proxy;
  this.stabbingCount = b.stabbingCount;
  b.value = tempValue;
  b.proxy = tempProxy;
  b.stabbingCount = tempStabbingCount
};
b2Bound.prototype.value = 0;
b2Bound.prototype.proxy = null;
b2Bound.prototype.stabbingCount = 0;var b2SimplexVertex = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2SimplexVertex.prototype.__constructor = function() {
};
b2SimplexVertex.prototype.__varz = function() {
};
b2SimplexVertex.prototype.Set = function(other) {
  this.wA.SetV(other.wA);
  this.wB.SetV(other.wB);
  this.w.SetV(other.w);
  this.a = other.a;
  this.indexA = other.indexA;
  this.indexB = other.indexB
};
b2SimplexVertex.prototype.wA = null;
b2SimplexVertex.prototype.wB = null;
b2SimplexVertex.prototype.w = null;
b2SimplexVertex.prototype.a = null;
b2SimplexVertex.prototype.indexA = 0;
b2SimplexVertex.prototype.indexB = 0;var b2Mat22 = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2Mat22.prototype.__constructor = function() {
  this.col1.x = this.col2.y = 1
};
b2Mat22.prototype.__varz = function() {
  this.col1 = new b2Vec2;
  this.col2 = new b2Vec2
};
b2Mat22.FromAngle = function(angle) {
  var mat = new b2Mat22;
  mat.Set(angle);
  return mat
};
b2Mat22.FromVV = function(c1, c2) {
  var mat = new b2Mat22;
  mat.SetVV(c1, c2);
  return mat
};
b2Mat22.prototype.Set = function(angle) {
  var c = Math.cos(angle);
  var s = Math.sin(angle);
  this.col1.x = c;
  this.col2.x = -s;
  this.col1.y = s;
  this.col2.y = c
};
b2Mat22.prototype.SetVV = function(c1, c2) {
  this.col1.SetV(c1);
  this.col2.SetV(c2)
};
b2Mat22.prototype.Copy = function() {
  var mat = new b2Mat22;
  mat.SetM(this);
  return mat
};
b2Mat22.prototype.SetM = function(m) {
  this.col1.SetV(m.col1);
  this.col2.SetV(m.col2)
};
b2Mat22.prototype.AddM = function(m) {
  this.col1.x += m.col1.x;
  this.col1.y += m.col1.y;
  this.col2.x += m.col2.x;
  this.col2.y += m.col2.y
};
b2Mat22.prototype.SetIdentity = function() {
  this.col1.x = 1;
  this.col2.x = 0;
  this.col1.y = 0;
  this.col2.y = 1
};
b2Mat22.prototype.SetZero = function() {
  this.col1.x = 0;
  this.col2.x = 0;
  this.col1.y = 0;
  this.col2.y = 0
};
b2Mat22.prototype.GetAngle = function() {
  return Math.atan2(this.col1.y, this.col1.x)
};
b2Mat22.prototype.GetInverse = function(out) {
  var a = this.col1.x;
  var b = this.col2.x;
  var c = this.col1.y;
  var d = this.col2.y;
  var det = a * d - b * c;
  if(det != 0) {
    det = 1 / det
  }
  out.col1.x = det * d;
  out.col2.x = -det * b;
  out.col1.y = -det * c;
  out.col2.y = det * a;
  return out
};
b2Mat22.prototype.Solve = function(out, bX, bY) {
  var a11 = this.col1.x;
  var a12 = this.col2.x;
  var a21 = this.col1.y;
  var a22 = this.col2.y;
  var det = a11 * a22 - a12 * a21;
  if(det != 0) {
    det = 1 / det
  }
  out.x = det * (a22 * bX - a12 * bY);
  out.y = det * (a11 * bY - a21 * bX);
  return out
};
b2Mat22.prototype.Abs = function() {
  this.col1.Abs();
  this.col2.Abs()
};
b2Mat22.prototype.col1 = new b2Vec2;
b2Mat22.prototype.col2 = new b2Vec2;var b2SimplexCache = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2SimplexCache.prototype.__constructor = function() {
};
b2SimplexCache.prototype.__varz = function() {
  this.indexA = new Array(3);
  this.indexB = new Array(3)
};
b2SimplexCache.prototype.metric = null;
b2SimplexCache.prototype.count = 0;
b2SimplexCache.prototype.indexA = new Array(3);
b2SimplexCache.prototype.indexB = new Array(3);var b2Shape = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2Shape.prototype.__constructor = function() {
  this.m_type = b2Shape.e_unknownShape;
  this.m_radius = b2Settings.b2_linearSlop
};
b2Shape.prototype.__varz = function() {
};
b2Shape.TestOverlap = function(shape1, transform1, shape2, transform2) {
  var input = new b2DistanceInput;
  input.proxyA = new b2DistanceProxy;
  input.proxyA.Set(shape1);
  input.proxyB = new b2DistanceProxy;
  input.proxyB.Set(shape2);
  input.transformA = transform1;
  input.transformB = transform2;
  input.useRadii = true;
  var simplexCache = new b2SimplexCache;
  simplexCache.count = 0;
  var output = new b2DistanceOutput;
  b2Distance.Distance(output, simplexCache, input);
  return output.distance < 10 * Number.MIN_VALUE
};
b2Shape.e_hitCollide = 1;
b2Shape.e_missCollide = 0;
b2Shape.e_startsInsideCollide = -1;
b2Shape.e_unknownShape = -1;
b2Shape.e_circleShape = 0;
b2Shape.e_polygonShape = 1;
b2Shape.e_edgeShape = 2;
b2Shape.e_shapeTypeCount = 3;
b2Shape.prototype.Copy = function() {
  return null
};
b2Shape.prototype.Set = function(other) {
  this.m_radius = other.m_radius
};
b2Shape.prototype.GetType = function() {
  return this.m_type
};
b2Shape.prototype.TestPoint = function(xf, p) {
  return false
};
b2Shape.prototype.RayCast = function(output, input, transform) {
  return false
};
b2Shape.prototype.ComputeAABB = function(aabb, xf) {
};
b2Shape.prototype.ComputeMass = function(massData, density) {
};
b2Shape.prototype.ComputeSubmergedArea = function(normal, offset, xf, c) {
  return 0
};
b2Shape.prototype.m_type = 0;
b2Shape.prototype.m_radius = null;var b2Segment = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2Segment.prototype.__constructor = function() {
};
b2Segment.prototype.__varz = function() {
  this.p1 = new b2Vec2;
  this.p2 = new b2Vec2
};
b2Segment.prototype.TestSegment = function(lambda, normal, segment, maxLambda) {
  var s = segment.p1;
  var rX = segment.p2.x - s.x;
  var rY = segment.p2.y - s.y;
  var dX = this.p2.x - this.p1.x;
  var dY = this.p2.y - this.p1.y;
  var nX = dY;
  var nY = -dX;
  var k_slop = 100 * Number.MIN_VALUE;
  var denom = -(rX * nX + rY * nY);
  if(denom > k_slop) {
    var bX = s.x - this.p1.x;
    var bY = s.y - this.p1.y;
    var a = bX * nX + bY * nY;
    if(0 <= a && a <= maxLambda * denom) {
      var mu2 = -rX * bY + rY * bX;
      if(-k_slop * denom <= mu2 && mu2 <= denom * (1 + k_slop)) {
        a /= denom;
        var nLen = Math.sqrt(nX * nX + nY * nY);
        nX /= nLen;
        nY /= nLen;
        lambda[0] = a;
        normal.Set(nX, nY);
        return true
      }
    }
  }
  return false
};
b2Segment.prototype.Extend = function(aabb) {
  this.ExtendForward(aabb);
  this.ExtendBackward(aabb)
};
b2Segment.prototype.ExtendForward = function(aabb) {
  var dX = this.p2.x - this.p1.x;
  var dY = this.p2.y - this.p1.y;
  var lambda = Math.min(dX > 0 ? (aabb.upperBound.x - this.p1.x) / dX : dX < 0 ? (aabb.lowerBound.x - this.p1.x) / dX : Number.POSITIVE_INFINITY, dY > 0 ? (aabb.upperBound.y - this.p1.y) / dY : dY < 0 ? (aabb.lowerBound.y - this.p1.y) / dY : Number.POSITIVE_INFINITY);
  this.p2.x = this.p1.x + dX * lambda;
  this.p2.y = this.p1.y + dY * lambda
};
b2Segment.prototype.ExtendBackward = function(aabb) {
  var dX = -this.p2.x + this.p1.x;
  var dY = -this.p2.y + this.p1.y;
  var lambda = Math.min(dX > 0 ? (aabb.upperBound.x - this.p2.x) / dX : dX < 0 ? (aabb.lowerBound.x - this.p2.x) / dX : Number.POSITIVE_INFINITY, dY > 0 ? (aabb.upperBound.y - this.p2.y) / dY : dY < 0 ? (aabb.lowerBound.y - this.p2.y) / dY : Number.POSITIVE_INFINITY);
  this.p1.x = this.p2.x + dX * lambda;
  this.p1.y = this.p2.y + dY * lambda
};
b2Segment.prototype.p1 = new b2Vec2;
b2Segment.prototype.p2 = new b2Vec2;var b2ContactRegister = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2ContactRegister.prototype.__constructor = function() {
};
b2ContactRegister.prototype.__varz = function() {
};
b2ContactRegister.prototype.createFcn = null;
b2ContactRegister.prototype.destroyFcn = null;
b2ContactRegister.prototype.primary = null;
b2ContactRegister.prototype.pool = null;
b2ContactRegister.prototype.poolCount = 0;var b2DebugDraw = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2DebugDraw.prototype.__constructor = function() {
  this.m_drawFlags = 0
};
b2DebugDraw.prototype.__varz = function() {
};
b2DebugDraw.e_shapeBit = 1;
b2DebugDraw.e_jointBit = 2;
b2DebugDraw.e_aabbBit = 4;
b2DebugDraw.e_pairBit = 8;
b2DebugDraw.e_centerOfMassBit = 16;
b2DebugDraw.e_controllerBit = 32;
b2DebugDraw.prototype.SetFlags = function(flags) {
  this.m_drawFlags = flags
};
b2DebugDraw.prototype.GetFlags = function() {
  return this.m_drawFlags
};
b2DebugDraw.prototype.AppendFlags = function(flags) {
  this.m_drawFlags |= flags
};
b2DebugDraw.prototype.ClearFlags = function(flags) {
  this.m_drawFlags &= ~flags
};
b2DebugDraw.prototype.SetSprite = function(sprite) {
  this.m_sprite = sprite
};
b2DebugDraw.prototype.GetSprite = function() {
  return this.m_sprite
};
b2DebugDraw.prototype.SetDrawScale = function(drawScale) {
  this.m_drawScale = drawScale
};
b2DebugDraw.prototype.GetDrawScale = function() {
  return this.m_drawScale
};
b2DebugDraw.prototype.SetLineThickness = function(lineThickness) {
  this.m_lineThickness = lineThickness
};
b2DebugDraw.prototype.GetLineThickness = function() {
  return this.m_lineThickness
};
b2DebugDraw.prototype.SetAlpha = function(alpha) {
  this.m_alpha = alpha
};
b2DebugDraw.prototype.GetAlpha = function() {
  return this.m_alpha
};
b2DebugDraw.prototype.SetFillAlpha = function(alpha) {
  this.m_fillAlpha = alpha
};
b2DebugDraw.prototype.GetFillAlpha = function() {
  return this.m_fillAlpha
};
b2DebugDraw.prototype.SetXFormScale = function(xformScale) {
  this.m_xformScale = xformScale
};
b2DebugDraw.prototype.GetXFormScale = function() {
  return this.m_xformScale
};
b2DebugDraw.prototype.Clear = function() {
  this.m_sprite.clearRect(0, 0, this.m_sprite.canvas.width, this.m_sprite.canvas.height)
};
b2DebugDraw.prototype.Y = function(y) {
  return this.m_sprite.canvas.height - y
};
b2DebugDraw.prototype.ToWorldPoint = function(localPoint) {
  return new b2Vec2(localPoint.x / this.m_drawScale, this.Y(localPoint.y) / this.m_drawScale)
};
b2DebugDraw.prototype.ColorStyle = function(color, alpha) {
  return"rgba(" + color.r + ", " + color.g + ", " + color.b + ", " + alpha + ")"
};
b2DebugDraw.prototype.DrawPolygon = function(vertices, vertexCount, color) {
  this.m_sprite.graphics.lineStyle(this.m_lineThickness, color.color, this.m_alpha);
  this.m_sprite.graphics.moveTo(vertices[0].x * this.m_drawScale, vertices[0].y * this.m_drawScale);
  for(var i = 1;i < vertexCount;i++) {
    this.m_sprite.graphics.lineTo(vertices[i].x * this.m_drawScale, vertices[i].y * this.m_drawScale)
  }
  this.m_sprite.graphics.lineTo(vertices[0].x * this.m_drawScale, vertices[0].y * this.m_drawScale)
};
b2DebugDraw.prototype.DrawSolidPolygon = function(vertices, vertexCount, color) {
  this.m_sprite.strokeSyle = this.ColorStyle(color, this.m_alpha);
  this.m_sprite.lineWidth = this.m_lineThickness;
  this.m_sprite.fillStyle = this.ColorStyle(color, this.m_fillAlpha);
  this.m_sprite.beginPath();
  this.m_sprite.moveTo(vertices[0].x * this.m_drawScale, this.Y(vertices[0].y * this.m_drawScale));
  for(var i = 1;i < vertexCount;i++) {
    this.m_sprite.lineTo(vertices[i].x * this.m_drawScale, this.Y(vertices[i].y * this.m_drawScale))
  }
  this.m_sprite.lineTo(vertices[0].x * this.m_drawScale, this.Y(vertices[0].y * this.m_drawScale));
  this.m_sprite.fill();
  this.m_sprite.stroke();
  this.m_sprite.closePath()
};
b2DebugDraw.prototype.DrawCircle = function(center, radius, color) {
  this.m_sprite.graphics.lineStyle(this.m_lineThickness, color.color, this.m_alpha);
  this.m_sprite.graphics.drawCircle(center.x * this.m_drawScale, center.y * this.m_drawScale, radius * this.m_drawScale)
};
b2DebugDraw.prototype.DrawSolidCircle = function(center, radius, axis, color) {
  this.m_sprite.strokeSyle = this.ColorStyle(color, this.m_alpha);
  this.m_sprite.lineWidth = this.m_lineThickness;
  this.m_sprite.fillStyle = this.ColorStyle(color, this.m_fillAlpha);
  this.m_sprite.beginPath();
  this.m_sprite.arc(center.x * this.m_drawScale, this.Y(center.y * this.m_drawScale), radius * this.m_drawScale, 0, Math.PI * 2, true);
  this.m_sprite.fill();
  this.m_sprite.stroke();
  this.m_sprite.closePath()
};
b2DebugDraw.prototype.DrawSegment = function(p1, p2, color) {
  this.m_sprite.lineWidth = this.m_lineThickness;
  this.m_sprite.strokeSyle = this.ColorStyle(color, this.m_alpha);
  this.m_sprite.beginPath();
  this.m_sprite.moveTo(p1.x * this.m_drawScale, this.Y(p1.y * this.m_drawScale));
  this.m_sprite.lineTo(p2.x * this.m_drawScale, this.Y(p2.y * this.m_drawScale));
  this.m_sprite.stroke();
  this.m_sprite.closePath()
};
b2DebugDraw.prototype.DrawTransform = function(xf) {
  this.m_sprite.lineWidth = this.m_lineThickness;
  this.m_sprite.strokeSyle = this.ColorStyle(new b2Color(255, 0, 0), this.m_alpha);
  this.m_sprite.beginPath();
  this.m_sprite.moveTo(xf.position.x * this.m_drawScale, this.Y(xf.position.y * this.m_drawScale));
  this.m_sprite.lineTo((xf.position.x + this.m_xformScale * xf.R.col1.x) * this.m_drawScale, this.Y((xf.position.y + this.m_xformScale * xf.R.col1.y) * this.m_drawScale));
  this.m_sprite.stroke();
  this.m_sprite.closePath();
  this.m_sprite.strokeSyle = this.ColorStyle(new b2Color(0, 255, 0), this.m_alpha);
  this.m_sprite.beginPath();
  this.m_sprite.moveTo(xf.position.x * this.m_drawScale, this.Y(xf.position.y * this.m_drawScale));
  this.m_sprite.lineTo((xf.position.x + this.m_xformScale * xf.R.col2.x) * this.m_drawScale, this.Y((xf.position.y + this.m_xformScale * xf.R.col2.y) * this.m_drawScale));
  this.m_sprite.stroke();
  this.m_sprite.closePath()
};
b2DebugDraw.prototype.m_drawFlags = 0;
b2DebugDraw.prototype.m_sprite = null;
b2DebugDraw.prototype.m_drawScale = 1;
b2DebugDraw.prototype.m_lineThickness = 1;
b2DebugDraw.prototype.m_alpha = 1;
b2DebugDraw.prototype.m_fillAlpha = 1;
b2DebugDraw.prototype.m_xformScale = 1;var b2Sweep = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2Sweep.prototype.__constructor = function() {
};
b2Sweep.prototype.__varz = function() {
  this.localCenter = new b2Vec2;
  this.c0 = new b2Vec2;
  this.c = new b2Vec2
};
b2Sweep.prototype.Set = function(other) {
  this.localCenter.SetV(other.localCenter);
  this.c0.SetV(other.c0);
  this.c.SetV(other.c);
  this.a0 = other.a0;
  this.a = other.a;
  this.t0 = other.t0
};
b2Sweep.prototype.Copy = function() {
  var copy = new b2Sweep;
  copy.localCenter.SetV(this.localCenter);
  copy.c0.SetV(this.c0);
  copy.c.SetV(this.c);
  copy.a0 = this.a0;
  copy.a = this.a;
  copy.t0 = this.t0;
  return copy
};
b2Sweep.prototype.GetTransform = function(xf, alpha) {
  xf.position.x = (1 - alpha) * this.c0.x + alpha * this.c.x;
  xf.position.y = (1 - alpha) * this.c0.y + alpha * this.c.y;
  var angle = (1 - alpha) * this.a0 + alpha * this.a;
  xf.R.Set(angle);
  var tMat = xf.R;
  xf.position.x -= tMat.col1.x * this.localCenter.x + tMat.col2.x * this.localCenter.y;
  xf.position.y -= tMat.col1.y * this.localCenter.x + tMat.col2.y * this.localCenter.y
};
b2Sweep.prototype.Advance = function(t) {
  if(this.t0 < t && 1 - this.t0 > Number.MIN_VALUE) {
    var alpha = (t - this.t0) / (1 - this.t0);
    this.c0.x = (1 - alpha) * this.c0.x + alpha * this.c.x;
    this.c0.y = (1 - alpha) * this.c0.y + alpha * this.c.y;
    this.a0 = (1 - alpha) * this.a0 + alpha * this.a;
    this.t0 = t
  }
};
b2Sweep.prototype.localCenter = new b2Vec2;
b2Sweep.prototype.c0 = new b2Vec2;
b2Sweep.prototype.c = new b2Vec2;
b2Sweep.prototype.a0 = null;
b2Sweep.prototype.a = null;
b2Sweep.prototype.t0 = null;var b2DistanceOutput = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2DistanceOutput.prototype.__constructor = function() {
};
b2DistanceOutput.prototype.__varz = function() {
  this.pointA = new b2Vec2;
  this.pointB = new b2Vec2
};
b2DistanceOutput.prototype.pointA = new b2Vec2;
b2DistanceOutput.prototype.pointB = new b2Vec2;
b2DistanceOutput.prototype.distance = null;
b2DistanceOutput.prototype.iterations = 0;var b2Mat33 = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2Mat33.prototype.__constructor = function(c1, c2, c3) {
  if(!c1 && !c2 && !c3) {
    this.col1.SetZero();
    this.col2.SetZero();
    this.col3.SetZero()
  }else {
    this.col1.SetV(c1);
    this.col2.SetV(c2);
    this.col3.SetV(c3)
  }
};
b2Mat33.prototype.__varz = function() {
  this.col1 = new b2Vec3;
  this.col2 = new b2Vec3;
  this.col3 = new b2Vec3
};
b2Mat33.prototype.SetVVV = function(c1, c2, c3) {
  this.col1.SetV(c1);
  this.col2.SetV(c2);
  this.col3.SetV(c3)
};
b2Mat33.prototype.Copy = function() {
  return new b2Mat33(this.col1, this.col2, this.col3)
};
b2Mat33.prototype.SetM = function(m) {
  this.col1.SetV(m.col1);
  this.col2.SetV(m.col2);
  this.col3.SetV(m.col3)
};
b2Mat33.prototype.AddM = function(m) {
  this.col1.x += m.col1.x;
  this.col1.y += m.col1.y;
  this.col1.z += m.col1.z;
  this.col2.x += m.col2.x;
  this.col2.y += m.col2.y;
  this.col2.z += m.col2.z;
  this.col3.x += m.col3.x;
  this.col3.y += m.col3.y;
  this.col3.z += m.col3.z
};
b2Mat33.prototype.SetIdentity = function() {
  this.col1.x = 1;
  this.col2.x = 0;
  this.col3.x = 0;
  this.col1.y = 0;
  this.col2.y = 1;
  this.col3.y = 0;
  this.col1.z = 0;
  this.col2.z = 0;
  this.col3.z = 1
};
b2Mat33.prototype.SetZero = function() {
  this.col1.x = 0;
  this.col2.x = 0;
  this.col3.x = 0;
  this.col1.y = 0;
  this.col2.y = 0;
  this.col3.y = 0;
  this.col1.z = 0;
  this.col2.z = 0;
  this.col3.z = 0
};
b2Mat33.prototype.Solve22 = function(out, bX, bY) {
  var a11 = this.col1.x;
  var a12 = this.col2.x;
  var a21 = this.col1.y;
  var a22 = this.col2.y;
  var det = a11 * a22 - a12 * a21;
  if(det != 0) {
    det = 1 / det
  }
  out.x = det * (a22 * bX - a12 * bY);
  out.y = det * (a11 * bY - a21 * bX);
  return out
};
b2Mat33.prototype.Solve33 = function(out, bX, bY, bZ) {
  var a11 = this.col1.x;
  var a21 = this.col1.y;
  var a31 = this.col1.z;
  var a12 = this.col2.x;
  var a22 = this.col2.y;
  var a32 = this.col2.z;
  var a13 = this.col3.x;
  var a23 = this.col3.y;
  var a33 = this.col3.z;
  var det = a11 * (a22 * a33 - a32 * a23) + a21 * (a32 * a13 - a12 * a33) + a31 * (a12 * a23 - a22 * a13);
  if(det != 0) {
    det = 1 / det
  }
  out.x = det * (bX * (a22 * a33 - a32 * a23) + bY * (a32 * a13 - a12 * a33) + bZ * (a12 * a23 - a22 * a13));
  out.y = det * (a11 * (bY * a33 - bZ * a23) + a21 * (bZ * a13 - bX * a33) + a31 * (bX * a23 - bY * a13));
  out.z = det * (a11 * (a22 * bZ - a32 * bY) + a21 * (a32 * bX - a12 * bZ) + a31 * (a12 * bY - a22 * bX));
  return out
};
b2Mat33.prototype.col1 = new b2Vec3;
b2Mat33.prototype.col2 = new b2Vec3;
b2Mat33.prototype.col3 = new b2Vec3;var b2PositionSolverManifold = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2PositionSolverManifold.prototype.__constructor = function() {
  this.m_normal = new b2Vec2;
  this.m_separations = new Array(b2Settings.b2_maxManifoldPoints);
  this.m_points = new Array(b2Settings.b2_maxManifoldPoints);
  for(var i = 0;i < b2Settings.b2_maxManifoldPoints;i++) {
    this.m_points[i] = new b2Vec2
  }
};
b2PositionSolverManifold.prototype.__varz = function() {
};
b2PositionSolverManifold.circlePointA = new b2Vec2;
b2PositionSolverManifold.circlePointB = new b2Vec2;
b2PositionSolverManifold.prototype.Initialize = function(cc) {
  b2Settings.b2Assert(cc.pointCount > 0);
  var i = 0;
  var clipPointX;
  var clipPointY;
  var tMat;
  var tVec;
  var planePointX;
  var planePointY;
  switch(cc.type) {
    case b2Manifold.e_circles:
      tMat = cc.bodyA.m_xf.R;
      tVec = cc.localPoint;
      var pointAX = cc.bodyA.m_xf.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
      var pointAY = cc.bodyA.m_xf.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
      tMat = cc.bodyB.m_xf.R;
      tVec = cc.points[0].localPoint;
      var pointBX = cc.bodyB.m_xf.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
      var pointBY = cc.bodyB.m_xf.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
      var dX = pointBX - pointAX;
      var dY = pointBY - pointAY;
      var d2 = dX * dX + dY * dY;
      if(d2 > Number.MIN_VALUE * Number.MIN_VALUE) {
        var d = Math.sqrt(d2);
        this.m_normal.x = dX / d;
        this.m_normal.y = dY / d
      }else {
        this.m_normal.x = 1;
        this.m_normal.y = 0
      }
      this.m_points[0].x = 0.5 * (pointAX + pointBX);
      this.m_points[0].y = 0.5 * (pointAY + pointBY);
      this.m_separations[0] = dX * this.m_normal.x + dY * this.m_normal.y - cc.radius;
      break;
    case b2Manifold.e_faceA:
      tMat = cc.bodyA.m_xf.R;
      tVec = cc.localPlaneNormal;
      this.m_normal.x = tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
      this.m_normal.y = tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
      tMat = cc.bodyA.m_xf.R;
      tVec = cc.localPoint;
      planePointX = cc.bodyA.m_xf.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
      planePointY = cc.bodyA.m_xf.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
      tMat = cc.bodyB.m_xf.R;
      for(i = 0;i < cc.pointCount;++i) {
        tVec = cc.points[i].localPoint;
        clipPointX = cc.bodyB.m_xf.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
        clipPointY = cc.bodyB.m_xf.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
        this.m_separations[i] = (clipPointX - planePointX) * this.m_normal.x + (clipPointY - planePointY) * this.m_normal.y - cc.radius;
        this.m_points[i].x = clipPointX;
        this.m_points[i].y = clipPointY
      }
      break;
    case b2Manifold.e_faceB:
      tMat = cc.bodyB.m_xf.R;
      tVec = cc.localPlaneNormal;
      this.m_normal.x = tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
      this.m_normal.y = tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
      tMat = cc.bodyB.m_xf.R;
      tVec = cc.localPoint;
      planePointX = cc.bodyB.m_xf.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
      planePointY = cc.bodyB.m_xf.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
      tMat = cc.bodyA.m_xf.R;
      for(i = 0;i < cc.pointCount;++i) {
        tVec = cc.points[i].localPoint;
        clipPointX = cc.bodyA.m_xf.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
        clipPointY = cc.bodyA.m_xf.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
        this.m_separations[i] = (clipPointX - planePointX) * this.m_normal.x + (clipPointY - planePointY) * this.m_normal.y - cc.radius;
        this.m_points[i].Set(clipPointX, clipPointY)
      }
      this.m_normal.x *= -1;
      this.m_normal.y *= -1;
      break
  }
};
b2PositionSolverManifold.prototype.m_normal = null;
b2PositionSolverManifold.prototype.m_points = null;
b2PositionSolverManifold.prototype.m_separations = null;var b2OBB = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2OBB.prototype.__constructor = function() {
};
b2OBB.prototype.__varz = function() {
  this.R = new b2Mat22;
  this.center = new b2Vec2;
  this.extents = new b2Vec2
};
b2OBB.prototype.R = new b2Mat22;
b2OBB.prototype.center = new b2Vec2;
b2OBB.prototype.extents = new b2Vec2;var b2Pair = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2Pair.prototype.__constructor = function() {
};
b2Pair.prototype.__varz = function() {
};
b2Pair.b2_nullProxy = b2Settings.USHRT_MAX;
b2Pair.e_pairBuffered = 1;
b2Pair.e_pairRemoved = 2;
b2Pair.e_pairFinal = 4;
b2Pair.prototype.SetBuffered = function() {
  this.status |= b2Pair.e_pairBuffered
};
b2Pair.prototype.ClearBuffered = function() {
  this.status &= ~b2Pair.e_pairBuffered
};
b2Pair.prototype.IsBuffered = function() {
  return(this.status & b2Pair.e_pairBuffered) == b2Pair.e_pairBuffered
};
b2Pair.prototype.SetRemoved = function() {
  this.status |= b2Pair.e_pairRemoved
};
b2Pair.prototype.ClearRemoved = function() {
  this.status &= ~b2Pair.e_pairRemoved
};
b2Pair.prototype.IsRemoved = function() {
  return(this.status & b2Pair.e_pairRemoved) == b2Pair.e_pairRemoved
};
b2Pair.prototype.SetFinal = function() {
  this.status |= b2Pair.e_pairFinal
};
b2Pair.prototype.IsFinal = function() {
  return(this.status & b2Pair.e_pairFinal) == b2Pair.e_pairFinal
};
b2Pair.prototype.userData = null;
b2Pair.prototype.proxy1 = null;
b2Pair.prototype.proxy2 = null;
b2Pair.prototype.next = null;
b2Pair.prototype.status = 0;var b2FixtureDef = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2FixtureDef.prototype.__constructor = function() {
  this.shape = null;
  this.userData = null;
  this.friction = 0.2;
  this.restitution = 0;
  this.density = 0;
  this.filter.categoryBits = 1;
  this.filter.maskBits = 65535;
  this.filter.groupIndex = 0;
  this.isSensor = false
};
b2FixtureDef.prototype.__varz = function() {
  this.filter = new b2FilterData
};
b2FixtureDef.prototype.shape = null;
b2FixtureDef.prototype.userData = null;
b2FixtureDef.prototype.friction = null;
b2FixtureDef.prototype.restitution = null;
b2FixtureDef.prototype.density = null;
b2FixtureDef.prototype.isSensor = null;
b2FixtureDef.prototype.filter = new b2FilterData;var b2ContactID = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2ContactID.prototype.__constructor = function() {
  this.features._m_id = this
};
b2ContactID.prototype.__varz = function() {
  this.features = new Features
};
b2ContactID.prototype.Set = function(id) {
  key = id._key
};
b2ContactID.prototype.Copy = function() {
  var id = new b2ContactID;
  id.key = key;
  return id
};
b2ContactID.prototype.__defineSetter__("key", function() {
  return this._key
});
b2ContactID.prototype.__defineSetter__("key", function(value) {
  this._key = value;
  this.features._referenceEdge = this._key & 255;
  this.features._incidentEdge = (this._key & 65280) >> 8 & 255;
  this.features._incidentVertex = (this._key & 16711680) >> 16 & 255;
  this.features._flip = (this._key & 4278190080) >> 24 & 255
});
b2ContactID.prototype._key = 0;
b2ContactID.prototype.features = new Features;var b2Transform = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2Transform.prototype.__constructor = function(pos, r) {
  if(pos) {
    this.position.SetV(pos);
    this.R.SetM(r)
  }
};
b2Transform.prototype.__varz = function() {
  this.position = new b2Vec2;
  this.R = new b2Mat22
};
b2Transform.prototype.Initialize = function(pos, r) {
  this.position.SetV(pos);
  this.R.SetM(r)
};
b2Transform.prototype.SetIdentity = function() {
  this.position.SetZero();
  this.R.SetIdentity()
};
b2Transform.prototype.Set = function(x) {
  this.position.SetV(x.position);
  this.R.SetM(x.R)
};
b2Transform.prototype.GetAngle = function() {
  return Math.atan2(this.R.col1.y, this.R.col1.x)
};
b2Transform.prototype.position = new b2Vec2;
b2Transform.prototype.R = new b2Mat22;var b2EdgeShape = function() {
  b2Shape.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2EdgeShape.prototype, b2Shape.prototype);
b2EdgeShape.prototype._super = b2Shape.prototype;
b2EdgeShape.prototype.__constructor = function(v1, v2) {
  this._super.__constructor.apply(this, []);
  this.m_type = b2Shape.e_edgeShape;
  this.m_prevEdge = null;
  this.m_nextEdge = null;
  this.m_v1 = v1;
  this.m_v2 = v2;
  this.m_direction.Set(this.m_v2.x - this.m_v1.x, this.m_v2.y - this.m_v1.y);
  this.m_length = this.m_direction.Normalize();
  this.m_normal.Set(this.m_direction.y, -this.m_direction.x);
  this.m_coreV1.Set(-b2Settings.b2_toiSlop * (this.m_normal.x - this.m_direction.x) + this.m_v1.x, -b2Settings.b2_toiSlop * (this.m_normal.y - this.m_direction.y) + this.m_v1.y);
  this.m_coreV2.Set(-b2Settings.b2_toiSlop * (this.m_normal.x + this.m_direction.x) + this.m_v2.x, -b2Settings.b2_toiSlop * (this.m_normal.y + this.m_direction.y) + this.m_v2.y);
  this.m_cornerDir1 = this.m_normal;
  this.m_cornerDir2.Set(-this.m_normal.x, -this.m_normal.y)
};
b2EdgeShape.prototype.__varz = function() {
  this.s_supportVec = new b2Vec2;
  this.m_v1 = new b2Vec2;
  this.m_v2 = new b2Vec2;
  this.m_coreV1 = new b2Vec2;
  this.m_coreV2 = new b2Vec2;
  this.m_normal = new b2Vec2;
  this.m_direction = new b2Vec2;
  this.m_cornerDir1 = new b2Vec2;
  this.m_cornerDir2 = new b2Vec2
};
b2EdgeShape.prototype.SetPrevEdge = function(edge, core, cornerDir, convex) {
  this.m_prevEdge = edge;
  this.m_coreV1 = core;
  this.m_cornerDir1 = cornerDir;
  this.m_cornerConvex1 = convex
};
b2EdgeShape.prototype.SetNextEdge = function(edge, core, cornerDir, convex) {
  this.m_nextEdge = edge;
  this.m_coreV2 = core;
  this.m_cornerDir2 = cornerDir;
  this.m_cornerConvex2 = convex
};
b2EdgeShape.prototype.TestPoint = function(transform, p) {
  return false
};
b2EdgeShape.prototype.RayCast = function(output, input, transform) {
  var tMat;
  var rX = input.p2.x - input.p1.x;
  var rY = input.p2.y - input.p1.y;
  tMat = transform.R;
  var v1X = transform.position.x + (tMat.col1.x * this.m_v1.x + tMat.col2.x * this.m_v1.y);
  var v1Y = transform.position.y + (tMat.col1.y * this.m_v1.x + tMat.col2.y * this.m_v1.y);
  var nX = transform.position.y + (tMat.col1.y * this.m_v2.x + tMat.col2.y * this.m_v2.y) - v1Y;
  var nY = -(transform.position.x + (tMat.col1.x * this.m_v2.x + tMat.col2.x * this.m_v2.y) - v1X);
  var k_slop = 100 * Number.MIN_VALUE;
  var denom = -(rX * nX + rY * nY);
  if(denom > k_slop) {
    var bX = input.p1.x - v1X;
    var bY = input.p1.y - v1Y;
    var a = bX * nX + bY * nY;
    if(0 <= a && a <= input.maxFraction * denom) {
      var mu2 = -rX * bY + rY * bX;
      if(-k_slop * denom <= mu2 && mu2 <= denom * (1 + k_slop)) {
        a /= denom;
        output.fraction = a;
        var nLen = Math.sqrt(nX * nX + nY * nY);
        output.normal.x = nX / nLen;
        output.normal.y = nY / nLen;
        return true
      }
    }
  }
  return false
};
b2EdgeShape.prototype.ComputeAABB = function(aabb, transform) {
  var tMat = transform.R;
  var v1X = transform.position.x + (tMat.col1.x * this.m_v1.x + tMat.col2.x * this.m_v1.y);
  var v1Y = transform.position.y + (tMat.col1.y * this.m_v1.x + tMat.col2.y * this.m_v1.y);
  var v2X = transform.position.x + (tMat.col1.x * this.m_v2.x + tMat.col2.x * this.m_v2.y);
  var v2Y = transform.position.y + (tMat.col1.y * this.m_v2.x + tMat.col2.y * this.m_v2.y);
  if(v1X < v2X) {
    aabb.lowerBound.x = v1X;
    aabb.upperBound.x = v2X
  }else {
    aabb.lowerBound.x = v2X;
    aabb.upperBound.x = v1X
  }
  if(v1Y < v2Y) {
    aabb.lowerBound.y = v1Y;
    aabb.upperBound.y = v2Y
  }else {
    aabb.lowerBound.y = v2Y;
    aabb.upperBound.y = v1Y
  }
};
b2EdgeShape.prototype.ComputeMass = function(massData, density) {
  massData.mass = 0;
  massData.center.SetV(this.m_v1);
  massData.I = 0
};
b2EdgeShape.prototype.ComputeSubmergedArea = function(normal, offset, xf, c) {
  var v0 = new b2Vec2(normal.x * offset, normal.y * offset);
  var v1 = b2Math.MulX(xf, this.m_v1);
  var v2 = b2Math.MulX(xf, this.m_v2);
  var d1 = b2Math.Dot(normal, v1) - offset;
  var d2 = b2Math.Dot(normal, v2) - offset;
  if(d1 > 0) {
    if(d2 > 0) {
      return 0
    }else {
      v1.x = -d2 / (d1 - d2) * v1.x + d1 / (d1 - d2) * v2.x;
      v1.y = -d2 / (d1 - d2) * v1.y + d1 / (d1 - d2) * v2.y
    }
  }else {
    if(d2 > 0) {
      v2.x = -d2 / (d1 - d2) * v1.x + d1 / (d1 - d2) * v2.x;
      v2.y = -d2 / (d1 - d2) * v1.y + d1 / (d1 - d2) * v2.y
    }else {
    }
  }
  c.x = (v0.x + v1.x + v2.x) / 3;
  c.y = (v0.y + v1.y + v2.y) / 3;
  return 0.5 * ((v1.x - v0.x) * (v2.y - v0.y) - (v1.y - v0.y) * (v2.x - v0.x))
};
b2EdgeShape.prototype.GetLength = function() {
  return this.m_length
};
b2EdgeShape.prototype.GetVertex1 = function() {
  return this.m_v1
};
b2EdgeShape.prototype.GetVertex2 = function() {
  return this.m_v2
};
b2EdgeShape.prototype.GetCoreVertex1 = function() {
  return this.m_coreV1
};
b2EdgeShape.prototype.GetCoreVertex2 = function() {
  return this.m_coreV2
};
b2EdgeShape.prototype.GetNormalVector = function() {
  return this.m_normal
};
b2EdgeShape.prototype.GetDirectionVector = function() {
  return this.m_direction
};
b2EdgeShape.prototype.GetCorner1Vector = function() {
  return this.m_cornerDir1
};
b2EdgeShape.prototype.GetCorner2Vector = function() {
  return this.m_cornerDir2
};
b2EdgeShape.prototype.Corner1IsConvex = function() {
  return this.m_cornerConvex1
};
b2EdgeShape.prototype.Corner2IsConvex = function() {
  return this.m_cornerConvex2
};
b2EdgeShape.prototype.GetFirstVertex = function(xf) {
  var tMat = xf.R;
  return new b2Vec2(xf.position.x + (tMat.col1.x * this.m_coreV1.x + tMat.col2.x * this.m_coreV1.y), xf.position.y + (tMat.col1.y * this.m_coreV1.x + tMat.col2.y * this.m_coreV1.y))
};
b2EdgeShape.prototype.GetNextEdge = function() {
  return this.m_nextEdge
};
b2EdgeShape.prototype.GetPrevEdge = function() {
  return this.m_prevEdge
};
b2EdgeShape.prototype.Support = function(xf, dX, dY) {
  var tMat = xf.R;
  var v1X = xf.position.x + (tMat.col1.x * this.m_coreV1.x + tMat.col2.x * this.m_coreV1.y);
  var v1Y = xf.position.y + (tMat.col1.y * this.m_coreV1.x + tMat.col2.y * this.m_coreV1.y);
  var v2X = xf.position.x + (tMat.col1.x * this.m_coreV2.x + tMat.col2.x * this.m_coreV2.y);
  var v2Y = xf.position.y + (tMat.col1.y * this.m_coreV2.x + tMat.col2.y * this.m_coreV2.y);
  if(v1X * dX + v1Y * dY > v2X * dX + v2Y * dY) {
    this.s_supportVec.x = v1X;
    this.s_supportVec.y = v1Y
  }else {
    this.s_supportVec.x = v2X;
    this.s_supportVec.y = v2Y
  }
  return this.s_supportVec
};
b2EdgeShape.prototype.s_supportVec = new b2Vec2;
b2EdgeShape.prototype.m_v1 = new b2Vec2;
b2EdgeShape.prototype.m_v2 = new b2Vec2;
b2EdgeShape.prototype.m_coreV1 = new b2Vec2;
b2EdgeShape.prototype.m_coreV2 = new b2Vec2;
b2EdgeShape.prototype.m_length = null;
b2EdgeShape.prototype.m_normal = new b2Vec2;
b2EdgeShape.prototype.m_direction = new b2Vec2;
b2EdgeShape.prototype.m_cornerDir1 = new b2Vec2;
b2EdgeShape.prototype.m_cornerDir2 = new b2Vec2;
b2EdgeShape.prototype.m_cornerConvex1 = null;
b2EdgeShape.prototype.m_cornerConvex2 = null;
b2EdgeShape.prototype.m_nextEdge = null;
b2EdgeShape.prototype.m_prevEdge = null;var b2BuoyancyController = function() {
  b2Controller.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2BuoyancyController.prototype, b2Controller.prototype);
b2BuoyancyController.prototype._super = b2Controller.prototype;
b2BuoyancyController.prototype.__constructor = function() {
  this._super.__constructor.apply(this, arguments)
};
b2BuoyancyController.prototype.__varz = function() {
  this.normal = new b2Vec2(0, -1);
  this.velocity = new b2Vec2(0, 0)
};
b2BuoyancyController.prototype.Step = function(step) {
  if(!m_bodyList) {
    return
  }
  if(this.useWorldGravity) {
    this.gravity = this.GetWorld().GetGravity().Copy()
  }
  for(var i = m_bodyList;i;i = i.nextBody) {
    var body = i.body;
    if(body.IsAwake() == false) {
      continue
    }
    var areac = new b2Vec2;
    var massc = new b2Vec2;
    var area = 0;
    var mass = 0;
    for(var fixture = body.GetFixtureList();fixture;fixture = fixture.GetNext()) {
      var sc = new b2Vec2;
      var sarea = fixture.GetShape().ComputeSubmergedArea(this.normal, this.offset, body.GetTransform(), sc);
      area += sarea;
      areac.x += sarea * sc.x;
      areac.y += sarea * sc.y;
      var shapeDensity;
      if(this.useDensity) {
        shapeDensity = 1
      }else {
        shapeDensity = 1
      }
      mass += sarea * shapeDensity;
      massc.x += sarea * sc.x * shapeDensity;
      massc.y += sarea * sc.y * shapeDensity
    }
    areac.x /= area;
    areac.y /= area;
    massc.x /= mass;
    massc.y /= mass;
    if(area < Number.MIN_VALUE) {
      continue
    }
    var buoyancyForce = this.gravity.GetNegative();
    buoyancyForce.Multiply(this.density * area);
    body.ApplyForce(buoyancyForce, massc);
    var dragForce = body.GetLinearVelocityFromWorldPoint(areac);
    dragForce.Subtract(this.velocity);
    dragForce.Multiply(-this.linearDrag * area);
    body.ApplyForce(dragForce, areac);
    body.ApplyTorque(-body.GetInertia() / body.GetMass() * area * body.GetAngularVelocity() * this.angularDrag)
  }
};
b2BuoyancyController.prototype.Draw = function(debugDraw) {
  var r = 1E3;
  var p1 = new b2Vec2;
  var p2 = new b2Vec2;
  p1.x = this.normal.x * this.offset + this.normal.y * r;
  p1.y = this.normal.y * this.offset - this.normal.x * r;
  p2.x = this.normal.x * this.offset - this.normal.y * r;
  p2.y = this.normal.y * this.offset + this.normal.x * r;
  var color = new b2Color(0, 0, 1);
  debugDraw.DrawSegment(p1, p2, color)
};
b2BuoyancyController.prototype.normal = new b2Vec2(0, -1);
b2BuoyancyController.prototype.offset = 0;
b2BuoyancyController.prototype.density = 0;
b2BuoyancyController.prototype.velocity = new b2Vec2(0, 0);
b2BuoyancyController.prototype.linearDrag = 2;
b2BuoyancyController.prototype.angularDrag = 1;
b2BuoyancyController.prototype.useDensity = false;
b2BuoyancyController.prototype.useWorldGravity = true;
b2BuoyancyController.prototype.gravity = null;var b2Body = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2Body.prototype.__constructor = function(bd, world) {
  this.m_flags = 0;
  if(bd.bullet) {
    this.m_flags |= b2Body.e_bulletFlag
  }
  if(bd.fixedRotation) {
    this.m_flags |= b2Body.e_fixedRotationFlag
  }
  if(bd.allowSleep) {
    this.m_flags |= b2Body.e_allowSleepFlag
  }
  if(bd.awake) {
    this.m_flags |= b2Body.e_awakeFlag
  }
  if(bd.active) {
    this.m_flags |= b2Body.e_activeFlag
  }
  this.m_world = world;
  this.m_xf.position.SetV(bd.position);
  this.m_xf.R.Set(bd.angle);
  this.m_sweep.localCenter.SetZero();
  this.m_sweep.t0 = 1;
  this.m_sweep.a0 = this.m_sweep.a = bd.angle;
  var tMat = this.m_xf.R;
  var tVec = this.m_sweep.localCenter;
  this.m_sweep.c.x = tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
  this.m_sweep.c.y = tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
  this.m_sweep.c.x += this.m_xf.position.x;
  this.m_sweep.c.y += this.m_xf.position.y;
  this.m_sweep.c0.SetV(this.m_sweep.c);
  this.m_jointList = null;
  this.m_controllerList = null;
  this.m_contactList = null;
  this.m_controllerCount = 0;
  this.m_prev = null;
  this.m_next = null;
  this.m_linearVelocity.SetV(bd.linearVelocity);
  this.m_angularVelocity = bd.angularVelocity;
  this.m_linearDamping = bd.linearDamping;
  this.m_angularDamping = bd.angularDamping;
  this.m_force.Set(0, 0);
  this.m_torque = 0;
  this.m_sleepTime = 0;
  this.m_type = bd.type;
  if(this.m_type == b2Body.b2_dynamicBody) {
    this.m_mass = 1;
    this.m_invMass = 1
  }else {
    this.m_mass = 0;
    this.m_invMass = 0
  }
  this.m_I = 0;
  this.m_invI = 0;
  this.m_inertiaScale = bd.inertiaScale;
  this.m_userData = bd.userData;
  this.m_fixtureList = null;
  this.m_fixtureCount = 0
};
b2Body.prototype.__varz = function() {
  this.m_xf = new b2Transform;
  this.m_sweep = new b2Sweep;
  this.m_linearVelocity = new b2Vec2;
  this.m_force = new b2Vec2
};
b2Body.b2_staticBody = 0;
b2Body.b2_kinematicBody = 1;
b2Body.b2_dynamicBody = 2;
b2Body.s_xf1 = new b2Transform;
b2Body.e_islandFlag = 1;
b2Body.e_awakeFlag = 2;
b2Body.e_allowSleepFlag = 4;
b2Body.e_bulletFlag = 8;
b2Body.e_fixedRotationFlag = 16;
b2Body.e_activeFlag = 32;
b2Body.prototype.connectEdges = function(s1, s2, angle1) {
  var angle2 = Math.atan2(s2.GetDirectionVector().y, s2.GetDirectionVector().x);
  var coreOffset = Math.tan((angle2 - angle1) * 0.5);
  var core = b2Math.MulFV(coreOffset, s2.GetDirectionVector());
  core = b2Math.SubtractVV(core, s2.GetNormalVector());
  core = b2Math.MulFV(b2Settings.b2_toiSlop, core);
  core = b2Math.AddVV(core, s2.GetVertex1());
  var cornerDir = b2Math.AddVV(s1.GetDirectionVector(), s2.GetDirectionVector());
  cornerDir.Normalize();
  var convex = b2Math.Dot(s1.GetDirectionVector(), s2.GetNormalVector()) > 0;
  s1.SetNextEdge(s2, core, cornerDir, convex);
  s2.SetPrevEdge(s1, core, cornerDir, convex);
  return angle2
};
b2Body.prototype.SynchronizeFixtures = function() {
  var xf1 = b2Body.s_xf1;
  xf1.R.Set(this.m_sweep.a0);
  var tMat = xf1.R;
  var tVec = this.m_sweep.localCenter;
  xf1.position.x = this.m_sweep.c0.x - (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
  xf1.position.y = this.m_sweep.c0.y - (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
  var f;
  var broadPhase = this.m_world.m_contactManager.m_broadPhase;
  for(f = this.m_fixtureList;f;f = f.m_next) {
    f.Synchronize(broadPhase, xf1, this.m_xf)
  }
};
b2Body.prototype.SynchronizeTransform = function() {
  this.m_xf.R.Set(this.m_sweep.a);
  var tMat = this.m_xf.R;
  var tVec = this.m_sweep.localCenter;
  this.m_xf.position.x = this.m_sweep.c.x - (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
  this.m_xf.position.y = this.m_sweep.c.y - (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y)
};
b2Body.prototype.ShouldCollide = function(other) {
  if(this.m_type != b2Body.b2_dynamicBody && other.m_type != b2Body.b2_dynamicBody) {
    return false
  }
  for(var jn = this.m_jointList;jn;jn = jn.next) {
    if(jn.other == other) {
      if(jn.joint.m_collideConnected == false) {
        return false
      }
    }
  }
  return true
};
b2Body.prototype.Advance = function(t) {
  this.m_sweep.Advance(t);
  this.m_sweep.c.SetV(this.m_sweep.c0);
  this.m_sweep.a = this.m_sweep.a0;
  this.SynchronizeTransform()
};
b2Body.prototype.CreateFixture = function(def) {
  if(this.m_world.IsLocked() == true) {
    return null
  }
  var fixture = new b2Fixture;
  fixture.Create(this, this.m_xf, def);
  if(this.m_flags & b2Body.e_activeFlag) {
    var broadPhase = this.m_world.m_contactManager.m_broadPhase;
    fixture.CreateProxy(broadPhase, this.m_xf)
  }
  fixture.m_next = this.m_fixtureList;
  this.m_fixtureList = fixture;
  ++this.m_fixtureCount;
  fixture.m_body = this;
  if(fixture.m_density > 0) {
    this.ResetMassData()
  }
  this.m_world.m_flags |= b2World.e_newFixture;
  return fixture
};
b2Body.prototype.CreateFixture2 = function(shape, density) {
  var def = new b2FixtureDef;
  def.shape = shape;
  def.density = density;
  return this.CreateFixture(def)
};
b2Body.prototype.DestroyFixture = function(fixture) {
  if(this.m_world.IsLocked() == true) {
    return
  }
  var node = this.m_fixtureList;
  var ppF = null;
  var found = false;
  while(node != null) {
    if(node == fixture) {
      if(ppF) {
        ppF.m_next = fixture.m_next
      }else {
        this.m_fixtureList = fixture.m_next
      }
      found = true;
      break
    }
    ppF = node;
    node = node.m_next
  }
  var edge = this.m_contactList;
  while(edge) {
    var c = edge.contact;
    edge = edge.next;
    var fixtureA = c.GetFixtureA();
    var fixtureB = c.GetFixtureB();
    if(fixture == fixtureA || fixture == fixtureB) {
      this.m_world.m_contactManager.Destroy(c)
    }
  }
  if(this.m_flags & b2Body.e_activeFlag) {
    var broadPhase = this.m_world.m_contactManager.m_broadPhase;
    fixture.DestroyProxy(broadPhase)
  }else {
  }
  fixture.Destroy();
  fixture.m_body = null;
  fixture.m_next = null;
  --this.m_fixtureCount;
  this.ResetMassData()
};
b2Body.prototype.SetPositionAndAngle = function(position, angle) {
  var f;
  if(this.m_world.IsLocked() == true) {
    return
  }
  this.m_xf.R.Set(angle);
  this.m_xf.position.SetV(position);
  var tMat = this.m_xf.R;
  var tVec = this.m_sweep.localCenter;
  this.m_sweep.c.x = tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
  this.m_sweep.c.y = tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
  this.m_sweep.c.x += this.m_xf.position.x;
  this.m_sweep.c.y += this.m_xf.position.y;
  this.m_sweep.c0.SetV(this.m_sweep.c);
  this.m_sweep.a0 = this.m_sweep.a = angle;
  var broadPhase = this.m_world.m_contactManager.m_broadPhase;
  for(f = this.m_fixtureList;f;f = f.m_next) {
    f.Synchronize(broadPhase, this.m_xf, this.m_xf)
  }
  this.m_world.m_contactManager.FindNewContacts()
};
b2Body.prototype.SetTransform = function(xf) {
  this.SetPositionAndAngle(xf.position, xf.GetAngle())
};
b2Body.prototype.GetTransform = function() {
  return this.m_xf
};
b2Body.prototype.GetPosition = function() {
  return this.m_xf.position
};
b2Body.prototype.SetPosition = function(position) {
  this.SetPositionAndAngle(position, this.GetAngle())
};
b2Body.prototype.GetAngle = function() {
  return this.m_sweep.a
};
b2Body.prototype.SetAngle = function(angle) {
  this.SetPositionAndAngle(this.GetPosition(), angle)
};
b2Body.prototype.GetWorldCenter = function() {
  return this.m_sweep.c
};
b2Body.prototype.GetLocalCenter = function() {
  return this.m_sweep.localCenter
};
b2Body.prototype.SetLinearVelocity = function(v) {
  if(this.m_type == b2Body.b2_staticBody) {
    return
  }
  this.m_linearVelocity.SetV(v)
};
b2Body.prototype.GetLinearVelocity = function() {
  return this.m_linearVelocity
};
b2Body.prototype.SetAngularVelocity = function(omega) {
  if(this.m_type == b2Body.b2_staticBody) {
    return
  }
  this.m_angularVelocity = omega
};
b2Body.prototype.GetAngularVelocity = function() {
  return this.m_angularVelocity
};
b2Body.prototype.GetDefinition = function() {
  var bd = new b2BodyDef;
  bd.type = this.GetType();
  bd.allowSleep = (this.m_flags & b2Body.e_allowSleepFlag) == b2Body.e_allowSleepFlag;
  bd.angle = this.GetAngle();
  bd.angularDamping = this.m_angularDamping;
  bd.angularVelocity = this.m_angularVelocity;
  bd.fixedRotation = (this.m_flags & b2Body.e_fixedRotationFlag) == b2Body.e_fixedRotationFlag;
  bd.bullet = (this.m_flags & b2Body.e_bulletFlag) == b2Body.e_bulletFlag;
  bd.awake = (this.m_flags & b2Body.e_awakeFlag) == b2Body.e_awakeFlag;
  bd.linearDamping = this.m_linearDamping;
  bd.linearVelocity.SetV(this.GetLinearVelocity());
  bd.position = this.GetPosition();
  bd.userData = this.GetUserData();
  return bd
};
b2Body.prototype.ApplyForce = function(force, point) {
  if(this.m_type != b2Body.b2_dynamicBody) {
    return
  }
  if(this.IsAwake() == false) {
    this.SetAwake(true)
  }
  this.m_force.x += force.x;
  this.m_force.y += force.y;
  this.m_torque += (point.x - this.m_sweep.c.x) * force.y - (point.y - this.m_sweep.c.y) * force.x
};
b2Body.prototype.ApplyTorque = function(torque) {
  if(this.m_type != b2Body.b2_dynamicBody) {
    return
  }
  if(this.IsAwake() == false) {
    this.SetAwake(true)
  }
  this.m_torque += torque
};
b2Body.prototype.ApplyImpulse = function(impulse, point) {
  if(this.m_type != b2Body.b2_dynamicBody) {
    return
  }
  if(this.IsAwake() == false) {
    this.SetAwake(true)
  }
  this.m_linearVelocity.x += this.m_invMass * impulse.x;
  this.m_linearVelocity.y += this.m_invMass * impulse.y;
  this.m_angularVelocity += this.m_invI * ((point.x - this.m_sweep.c.x) * impulse.y - (point.y - this.m_sweep.c.y) * impulse.x)
};
b2Body.prototype.Split = function(callback) {
  var linearVelocity = this.GetLinearVelocity().Copy();
  var angularVelocity = this.GetAngularVelocity();
  var center = this.GetWorldCenter();
  var body1 = this;
  var body2 = this.m_world.CreateBody(this.GetDefinition());
  var prev;
  for(var f = body1.m_fixtureList;f;) {
    if(callback(f)) {
      var next = f.m_next;
      if(prev) {
        prev.m_next = next
      }else {
        body1.m_fixtureList = next
      }
      body1.m_fixtureCount--;
      f.m_next = body2.m_fixtureList;
      body2.m_fixtureList = f;
      body2.m_fixtureCount++;
      f.m_body = body2;
      f = next
    }else {
      prev = f;
      f = f.m_next
    }
  }
  body1.ResetMassData();
  body2.ResetMassData();
  var center1 = body1.GetWorldCenter();
  var center2 = body2.GetWorldCenter();
  var velocity1 = b2Math.AddVV(linearVelocity, b2Math.CrossFV(angularVelocity, b2Math.SubtractVV(center1, center)));
  var velocity2 = b2Math.AddVV(linearVelocity, b2Math.CrossFV(angularVelocity, b2Math.SubtractVV(center2, center)));
  body1.SetLinearVelocity(velocity1);
  body2.SetLinearVelocity(velocity2);
  body1.SetAngularVelocity(angularVelocity);
  body2.SetAngularVelocity(angularVelocity);
  body1.SynchronizeFixtures();
  body2.SynchronizeFixtures();
  return body2
};
b2Body.prototype.Merge = function(other) {
  var f;
  for(f = other.m_fixtureList;f;) {
    var next = f.m_next;
    other.m_fixtureCount--;
    f.m_next = this.m_fixtureList;
    this.m_fixtureList = f;
    this.m_fixtureCount++;
    f.m_body = body2;
    f = next
  }
  body1.m_fixtureCount = 0;
  var body1 = this;
  var body2 = other;
  var center1 = body1.GetWorldCenter();
  var center2 = body2.GetWorldCenter();
  var velocity1 = body1.GetLinearVelocity().Copy();
  var velocity2 = body2.GetLinearVelocity().Copy();
  var angular1 = body1.GetAngularVelocity();
  var angular = body2.GetAngularVelocity();
  body1.ResetMassData();
  this.SynchronizeFixtures()
};
b2Body.prototype.GetMass = function() {
  return this.m_mass
};
b2Body.prototype.GetInertia = function() {
  return this.m_I
};
b2Body.prototype.GetMassData = function(data) {
  data.mass = this.m_mass;
  data.I = this.m_I;
  data.center.SetV(this.m_sweep.localCenter)
};
b2Body.prototype.SetMassData = function(massData) {
  b2Settings.b2Assert(this.m_world.IsLocked() == false);
  if(this.m_world.IsLocked() == true) {
    return
  }
  if(this.m_type != b2Body.b2_dynamicBody) {
    return
  }
  this.m_invMass = 0;
  this.m_I = 0;
  this.m_invI = 0;
  this.m_mass = massData.mass;
  if(this.m_mass <= 0) {
    this.m_mass = 1
  }
  this.m_invMass = 1 / this.m_mass;
  if(massData.I > 0 && (this.m_flags & b2Body.e_fixedRotationFlag) == 0) {
    this.m_I = massData.I - this.m_mass * (massData.center.x * massData.center.x + massData.center.y * massData.center.y);
    this.m_invI = 1 / this.m_I
  }
  var oldCenter = this.m_sweep.c.Copy();
  this.m_sweep.localCenter.SetV(massData.center);
  this.m_sweep.c0.SetV(b2Math.MulX(this.m_xf, this.m_sweep.localCenter));
  this.m_sweep.c.SetV(this.m_sweep.c0);
  this.m_linearVelocity.x += this.m_angularVelocity * -(this.m_sweep.c.y - oldCenter.y);
  this.m_linearVelocity.y += this.m_angularVelocity * +(this.m_sweep.c.x - oldCenter.x)
};
b2Body.prototype.ResetMassData = function() {
  this.m_mass = 0;
  this.m_invMass = 0;
  this.m_I = 0;
  this.m_invI = 0;
  this.m_sweep.localCenter.SetZero();
  if(this.m_type == b2Body.b2_staticBody || this.m_type == b2Body.b2_kinematicBody) {
    return
  }
  var center = b2Vec2.Make(0, 0);
  for(var f = this.m_fixtureList;f;f = f.m_next) {
    if(f.m_density == 0) {
      continue
    }
    var massData = f.GetMassData();
    this.m_mass += massData.mass;
    center.x += massData.center.x * massData.mass;
    center.y += massData.center.y * massData.mass;
    this.m_I += massData.I
  }
  if(this.m_mass > 0) {
    this.m_invMass = 1 / this.m_mass;
    center.x *= this.m_invMass;
    center.y *= this.m_invMass
  }else {
    this.m_mass = 1;
    this.m_invMass = 1
  }
  if(this.m_I > 0 && (this.m_flags & b2Body.e_fixedRotationFlag) == 0) {
    this.m_I -= this.m_mass * (center.x * center.x + center.y * center.y);
    this.m_I *= this.m_inertiaScale;
    b2Settings.b2Assert(this.m_I > 0);
    this.m_invI = 1 / this.m_I
  }else {
    this.m_I = 0;
    this.m_invI = 0
  }
  var oldCenter = this.m_sweep.c.Copy();
  this.m_sweep.localCenter.SetV(center);
  this.m_sweep.c0.SetV(b2Math.MulX(this.m_xf, this.m_sweep.localCenter));
  this.m_sweep.c.SetV(this.m_sweep.c0);
  this.m_linearVelocity.x += this.m_angularVelocity * -(this.m_sweep.c.y - oldCenter.y);
  this.m_linearVelocity.y += this.m_angularVelocity * +(this.m_sweep.c.x - oldCenter.x)
};
b2Body.prototype.GetWorldPoint = function(localPoint) {
  var A = this.m_xf.R;
  var u = new b2Vec2(A.col1.x * localPoint.x + A.col2.x * localPoint.y, A.col1.y * localPoint.x + A.col2.y * localPoint.y);
  u.x += this.m_xf.position.x;
  u.y += this.m_xf.position.y;
  return u
};
b2Body.prototype.GetWorldVector = function(localVector) {
  return b2Math.MulMV(this.m_xf.R, localVector)
};
b2Body.prototype.GetLocalPoint = function(worldPoint) {
  return b2Math.MulXT(this.m_xf, worldPoint)
};
b2Body.prototype.GetLocalVector = function(worldVector) {
  return b2Math.MulTMV(this.m_xf.R, worldVector)
};
b2Body.prototype.GetLinearVelocityFromWorldPoint = function(worldPoint) {
  return new b2Vec2(this.m_linearVelocity.x - this.m_angularVelocity * (worldPoint.y - this.m_sweep.c.y), this.m_linearVelocity.y + this.m_angularVelocity * (worldPoint.x - this.m_sweep.c.x))
};
b2Body.prototype.GetLinearVelocityFromLocalPoint = function(localPoint) {
  var A = this.m_xf.R;
  var worldPoint = new b2Vec2(A.col1.x * localPoint.x + A.col2.x * localPoint.y, A.col1.y * localPoint.x + A.col2.y * localPoint.y);
  worldPoint.x += this.m_xf.position.x;
  worldPoint.y += this.m_xf.position.y;
  return new b2Vec2(this.m_linearVelocity.x - this.m_angularVelocity * (worldPoint.y - this.m_sweep.c.y), this.m_linearVelocity.y + this.m_angularVelocity * (worldPoint.x - this.m_sweep.c.x))
};
b2Body.prototype.GetLinearDamping = function() {
  return this.m_linearDamping
};
b2Body.prototype.SetLinearDamping = function(linearDamping) {
  this.m_linearDamping = linearDamping
};
b2Body.prototype.GetAngularDamping = function() {
  return this.m_angularDamping
};
b2Body.prototype.SetAngularDamping = function(angularDamping) {
  this.m_angularDamping = angularDamping
};
b2Body.prototype.SetType = function(type) {
  if(this.m_type == type) {
    return
  }
  this.m_type = type;
  this.ResetMassData();
  if(this.m_type == b2Body.b2_staticBody) {
    this.m_linearVelocity.SetZero();
    this.m_angularVelocity = 0
  }
  this.SetAwake(true);
  this.m_force.SetZero();
  this.m_torque = 0;
  for(var ce = this.m_contactList;ce;ce = ce.next) {
    ce.contact.FlagForFiltering()
  }
};
b2Body.prototype.GetType = function() {
  return this.m_type
};
b2Body.prototype.SetBullet = function(flag) {
  if(flag) {
    this.m_flags |= b2Body.e_bulletFlag
  }else {
    this.m_flags &= ~b2Body.e_bulletFlag
  }
};
b2Body.prototype.IsBullet = function() {
  return(this.m_flags & b2Body.e_bulletFlag) == b2Body.e_bulletFlag
};
b2Body.prototype.SetSleepingAllowed = function(flag) {
  if(flag) {
    this.m_flags |= b2Body.e_allowSleepFlag
  }else {
    this.m_flags &= ~b2Body.e_allowSleepFlag;
    this.SetAwake(true)
  }
};
b2Body.prototype.SetAwake = function(flag) {
  if(flag) {
    this.m_flags |= b2Body.e_awakeFlag;
    this.m_sleepTime = 0
  }else {
    this.m_flags &= ~b2Body.e_awakeFlag;
    this.m_sleepTime = 0;
    this.m_linearVelocity.SetZero();
    this.m_angularVelocity = 0;
    this.m_force.SetZero();
    this.m_torque = 0
  }
};
b2Body.prototype.IsAwake = function() {
  return(this.m_flags & b2Body.e_awakeFlag) == b2Body.e_awakeFlag
};
b2Body.prototype.SetFixedRotation = function(fixed) {
  if(fixed) {
    this.m_flags |= b2Body.e_fixedRotationFlag
  }else {
    this.m_flags &= ~b2Body.e_fixedRotationFlag
  }
  this.ResetMassData()
};
b2Body.prototype.IsFixedRotation = function() {
  return(this.m_flags & b2Body.e_fixedRotationFlag) == b2Body.e_fixedRotationFlag
};
b2Body.prototype.SetActive = function(flag) {
  if(flag == this.IsActive()) {
    return
  }
  var broadPhase;
  var f;
  if(flag) {
    this.m_flags |= b2Body.e_activeFlag;
    broadPhase = this.m_world.m_contactManager.m_broadPhase;
    for(f = this.m_fixtureList;f;f = f.m_next) {
      f.CreateProxy(broadPhase, this.m_xf)
    }
  }else {
    this.m_flags &= ~b2Body.e_activeFlag;
    broadPhase = this.m_world.m_contactManager.m_broadPhase;
    for(f = this.m_fixtureList;f;f = f.m_next) {
      f.DestroyProxy(broadPhase)
    }
    var ce = this.m_contactList;
    while(ce) {
      var ce0 = ce;
      ce = ce.next;
      this.m_world.m_contactManager.Destroy(ce0.contact)
    }
    this.m_contactList = null
  }
};
b2Body.prototype.IsActive = function() {
  return(this.m_flags & b2Body.e_activeFlag) == b2Body.e_activeFlag
};
b2Body.prototype.IsSleepingAllowed = function() {
  return(this.m_flags & b2Body.e_allowSleepFlag) == b2Body.e_allowSleepFlag
};
b2Body.prototype.GetFixtureList = function() {
  return this.m_fixtureList
};
b2Body.prototype.GetJointList = function() {
  return this.m_jointList
};
b2Body.prototype.GetControllerList = function() {
  return this.m_controllerList
};
b2Body.prototype.GetContactList = function() {
  return this.m_contactList
};
b2Body.prototype.GetNext = function() {
  return this.m_next
};
b2Body.prototype.GetUserData = function() {
  return this.m_userData
};
b2Body.prototype.SetUserData = function(data) {
  this.m_userData = data
};
b2Body.prototype.GetWorld = function() {
  return this.m_world
};
b2Body.prototype.m_flags = 0;
b2Body.prototype.m_type = 0;
b2Body.prototype.m_islandIndex = 0;
b2Body.prototype.m_xf = new b2Transform;
b2Body.prototype.m_sweep = new b2Sweep;
b2Body.prototype.m_linearVelocity = new b2Vec2;
b2Body.prototype.m_angularVelocity = null;
b2Body.prototype.m_force = new b2Vec2;
b2Body.prototype.m_torque = null;
b2Body.prototype.m_world = null;
b2Body.prototype.m_prev = null;
b2Body.prototype.m_next = null;
b2Body.prototype.m_fixtureList = null;
b2Body.prototype.m_fixtureCount = 0;
b2Body.prototype.m_controllerList = null;
b2Body.prototype.m_controllerCount = 0;
b2Body.prototype.m_jointList = null;
b2Body.prototype.m_contactList = null;
b2Body.prototype.m_mass = null;
b2Body.prototype.m_invMass = null;
b2Body.prototype.m_I = null;
b2Body.prototype.m_invI = null;
b2Body.prototype.m_inertiaScale = null;
b2Body.prototype.m_linearDamping = null;
b2Body.prototype.m_angularDamping = null;
b2Body.prototype.m_sleepTime = null;
b2Body.prototype.m_userData = null;var b2ContactImpulse = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2ContactImpulse.prototype.__constructor = function() {
};
b2ContactImpulse.prototype.__varz = function() {
  this.normalImpulses = new Array(b2Settings.b2_maxManifoldPoints);
  this.tangentImpulses = new Array(b2Settings.b2_maxManifoldPoints)
};
b2ContactImpulse.prototype.normalImpulses = new Array(b2Settings.b2_maxManifoldPoints);
b2ContactImpulse.prototype.tangentImpulses = new Array(b2Settings.b2_maxManifoldPoints);var b2TensorDampingController = function() {
  b2Controller.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2TensorDampingController.prototype, b2Controller.prototype);
b2TensorDampingController.prototype._super = b2Controller.prototype;
b2TensorDampingController.prototype.__constructor = function() {
  this._super.__constructor.apply(this, arguments)
};
b2TensorDampingController.prototype.__varz = function() {
  this.T = new b2Mat22
};
b2TensorDampingController.prototype.SetAxisAligned = function(xDamping, yDamping) {
  this.T.col1.x = -xDamping;
  this.T.col1.y = 0;
  this.T.col2.x = 0;
  this.T.col2.y = -yDamping;
  if(xDamping > 0 || yDamping > 0) {
    this.maxTimestep = 1 / Math.max(xDamping, yDamping)
  }else {
    this.maxTimestep = 0
  }
};
b2TensorDampingController.prototype.Step = function(step) {
  var timestep = step.dt;
  if(timestep <= Number.MIN_VALUE) {
    return
  }
  if(timestep > this.maxTimestep && this.maxTimestep > 0) {
    timestep = this.maxTimestep
  }
  for(var i = m_bodyList;i;i = i.nextBody) {
    var body = i.body;
    if(!body.IsAwake()) {
      continue
    }
    var damping = body.GetWorldVector(b2Math.MulMV(this.T, body.GetLocalVector(body.GetLinearVelocity())));
    body.SetLinearVelocity(new b2Vec2(body.GetLinearVelocity().x + damping.x * timestep, body.GetLinearVelocity().y + damping.y * timestep))
  }
};
b2TensorDampingController.prototype.T = new b2Mat22;
b2TensorDampingController.prototype.maxTimestep = 0;var b2ManifoldPoint = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2ManifoldPoint.prototype.__constructor = function() {
  this.Reset()
};
b2ManifoldPoint.prototype.__varz = function() {
  this.m_localPoint = new b2Vec2;
  this.m_id = new b2ContactID
};
b2ManifoldPoint.prototype.Reset = function() {
  this.m_localPoint.SetZero();
  this.m_normalImpulse = 0;
  this.m_tangentImpulse = 0;
  this.m_id.key = 0
};
b2ManifoldPoint.prototype.Set = function(m) {
  this.m_localPoint.SetV(m.m_localPoint);
  this.m_normalImpulse = m.m_normalImpulse;
  this.m_tangentImpulse = m.m_tangentImpulse;
  this.m_id.Set(m.m_id)
};
b2ManifoldPoint.prototype.m_localPoint = new b2Vec2;
b2ManifoldPoint.prototype.m_normalImpulse = null;
b2ManifoldPoint.prototype.m_tangentImpulse = null;
b2ManifoldPoint.prototype.m_id = new b2ContactID;var b2PolygonShape = function() {
  b2Shape.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2PolygonShape.prototype, b2Shape.prototype);
b2PolygonShape.prototype._super = b2Shape.prototype;
b2PolygonShape.prototype.__constructor = function() {
  this._super.__constructor.apply(this, arguments);
  this.m_type = b2Shape.e_polygonShape;
  this.m_centroid = new b2Vec2;
  this.m_vertices = new Array;
  this.m_normals = new Array
};
b2PolygonShape.prototype.__varz = function() {
};
b2PolygonShape.AsArray = function(vertices, vertexCount) {
  var polygonShape = new b2PolygonShape;
  polygonShape.SetAsArray(vertices, vertexCount);
  return polygonShape
};
b2PolygonShape.AsVector = function(vertices, vertexCount) {
  var polygonShape = new b2PolygonShape;
  polygonShape.SetAsVector(vertices, vertexCount);
  return polygonShape
};
b2PolygonShape.AsBox = function(hx, hy) {
  var polygonShape = new b2PolygonShape;
  polygonShape.SetAsBox(hx, hy);
  return polygonShape
};
b2PolygonShape.AsOrientedBox = function(hx, hy, center, angle) {
  var polygonShape = new b2PolygonShape;
  polygonShape.SetAsOrientedBox(hx, hy, center, angle);
  return polygonShape
};
b2PolygonShape.AsEdge = function(v1, v2) {
  var polygonShape = new b2PolygonShape;
  polygonShape.SetAsEdge(v1, v2);
  return polygonShape
};
b2PolygonShape.ComputeCentroid = function(vs, count) {
  var c = new b2Vec2;
  var area = 0;
  var p1X = 0;
  var p1Y = 0;
  var inv3 = 1 / 3;
  for(var i = 0;i < count;++i) {
    var p2 = vs[i];
    var p3 = i + 1 < count ? vs[parseInt(i + 1)] : vs[0];
    var e1X = p2.x - p1X;
    var e1Y = p2.y - p1Y;
    var e2X = p3.x - p1X;
    var e2Y = p3.y - p1Y;
    var D = e1X * e2Y - e1Y * e2X;
    var triangleArea = 0.5 * D;
    area += triangleArea;
    c.x += triangleArea * inv3 * (p1X + p2.x + p3.x);
    c.y += triangleArea * inv3 * (p1Y + p2.y + p3.y)
  }
  c.x *= 1 / area;
  c.y *= 1 / area;
  return c
};
b2PolygonShape.ComputeOBB = function(obb, vs, count) {
  var i = 0;
  var p = new Array(count + 1);
  for(i = 0;i < count;++i) {
    p[i] = vs[i]
  }
  p[count] = p[0];
  var minArea = Number.MAX_VALUE;
  for(i = 1;i <= count;++i) {
    var root = p[parseInt(i - 1)];
    var uxX = p[i].x - root.x;
    var uxY = p[i].y - root.y;
    var length = Math.sqrt(uxX * uxX + uxY * uxY);
    uxX /= length;
    uxY /= length;
    var uyX = -uxY;
    var uyY = uxX;
    var lowerX = Number.MAX_VALUE;
    var lowerY = Number.MAX_VALUE;
    var upperX = -Number.MAX_VALUE;
    var upperY = -Number.MAX_VALUE;
    for(var j = 0;j < count;++j) {
      var dX = p[j].x - root.x;
      var dY = p[j].y - root.y;
      var rX = uxX * dX + uxY * dY;
      var rY = uyX * dX + uyY * dY;
      if(rX < lowerX) {
        lowerX = rX
      }
      if(rY < lowerY) {
        lowerY = rY
      }
      if(rX > upperX) {
        upperX = rX
      }
      if(rY > upperY) {
        upperY = rY
      }
    }
    var area = (upperX - lowerX) * (upperY - lowerY);
    if(area < 0.95 * minArea) {
      minArea = area;
      obb.R.col1.x = uxX;
      obb.R.col1.y = uxY;
      obb.R.col2.x = uyX;
      obb.R.col2.y = uyY;
      var centerX = 0.5 * (lowerX + upperX);
      var centerY = 0.5 * (lowerY + upperY);
      var tMat = obb.R;
      obb.center.x = root.x + (tMat.col1.x * centerX + tMat.col2.x * centerY);
      obb.center.y = root.y + (tMat.col1.y * centerX + tMat.col2.y * centerY);
      obb.extents.x = 0.5 * (upperX - lowerX);
      obb.extents.y = 0.5 * (upperY - lowerY)
    }
  }
};
b2PolygonShape.s_mat = new b2Mat22;
b2PolygonShape.prototype.Validate = function() {
  return false
};
b2PolygonShape.prototype.Reserve = function(count) {
  for(var i = this.m_vertices.length;i < count;i++) {
    this.m_vertices[i] = new b2Vec2;
    this.m_normals[i] = new b2Vec2
  }
};
b2PolygonShape.prototype.Copy = function() {
  var s = new b2PolygonShape;
  s.Set(this);
  return s
};
b2PolygonShape.prototype.Set = function(other) {
  this._super.Set.apply(this, [other]);
  if(isInstanceOf(other, b2PolygonShape)) {
    var other2 = other;
    this.m_centroid.SetV(other2.m_centroid);
    this.m_vertexCount = other2.m_vertexCount;
    this.Reserve(this.m_vertexCount);
    for(var i = 0;i < this.m_vertexCount;i++) {
      this.m_vertices[i].SetV(other2.m_vertices[i]);
      this.m_normals[i].SetV(other2.m_normals[i])
    }
  }
};
b2PolygonShape.prototype.SetAsArray = function(vertices, vertexCount) {
  var v = new Array;
  for(var i = 0, tVec = null;i < vertices.length, tVec = vertices[i];i++) {
    v.push(tVec)
  }
  this.SetAsVector(v, vertexCount)
};
b2PolygonShape.prototype.SetAsVector = function(vertices, vertexCount) {
  if(typeof vertexCount == "undefined") {
    vertexCount = vertices.length
  }
  b2Settings.b2Assert(2 <= vertexCount);
  this.m_vertexCount = vertexCount;
  this.Reserve(vertexCount);
  var i = 0;
  for(i = 0;i < this.m_vertexCount;i++) {
    this.m_vertices[i].SetV(vertices[i])
  }
  for(i = 0;i < this.m_vertexCount;++i) {
    var i1 = i;
    var i2 = i + 1 < this.m_vertexCount ? i + 1 : 0;
    var edge = b2Math.SubtractVV(this.m_vertices[i2], this.m_vertices[i1]);
    b2Settings.b2Assert(edge.LengthSquared() > Number.MIN_VALUE);
    this.m_normals[i].SetV(b2Math.CrossVF(edge, 1));
    this.m_normals[i].Normalize()
  }
  this.m_centroid = b2PolygonShape.ComputeCentroid(this.m_vertices, this.m_vertexCount)
};
b2PolygonShape.prototype.SetAsBox = function(hx, hy) {
  this.m_vertexCount = 4;
  this.Reserve(4);
  this.m_vertices[0].Set(-hx, -hy);
  this.m_vertices[1].Set(hx, -hy);
  this.m_vertices[2].Set(hx, hy);
  this.m_vertices[3].Set(-hx, hy);
  this.m_normals[0].Set(0, -1);
  this.m_normals[1].Set(1, 0);
  this.m_normals[2].Set(0, 1);
  this.m_normals[3].Set(-1, 0);
  this.m_centroid.SetZero()
};
b2PolygonShape.prototype.SetAsOrientedBox = function(hx, hy, center, angle) {
  this.m_vertexCount = 4;
  this.Reserve(4);
  this.m_vertices[0].Set(-hx, -hy);
  this.m_vertices[1].Set(hx, -hy);
  this.m_vertices[2].Set(hx, hy);
  this.m_vertices[3].Set(-hx, hy);
  this.m_normals[0].Set(0, -1);
  this.m_normals[1].Set(1, 0);
  this.m_normals[2].Set(0, 1);
  this.m_normals[3].Set(-1, 0);
  this.m_centroid = center;
  var xf = new b2Transform;
  xf.position = center;
  xf.R.Set(angle);
  for(var i = 0;i < this.m_vertexCount;++i) {
    this.m_vertices[i] = b2Math.MulX(xf, this.m_vertices[i]);
    this.m_normals[i] = b2Math.MulMV(xf.R, this.m_normals[i])
  }
};
b2PolygonShape.prototype.SetAsEdge = function(v1, v2) {
  this.m_vertexCount = 2;
  this.Reserve(2);
  this.m_vertices[0].SetV(v1);
  this.m_vertices[1].SetV(v2);
  this.m_centroid.x = 0.5 * (v1.x + v2.x);
  this.m_centroid.y = 0.5 * (v1.y + v2.y);
  this.m_normals[0] = b2Math.CrossVF(b2Math.SubtractVV(v2, v1), 1);
  this.m_normals[0].Normalize();
  this.m_normals[1].x = -this.m_normals[0].x;
  this.m_normals[1].y = -this.m_normals[0].y
};
b2PolygonShape.prototype.TestPoint = function(xf, p) {
  var tVec;
  var tMat = xf.R;
  var tX = p.x - xf.position.x;
  var tY = p.y - xf.position.y;
  var pLocalX = tX * tMat.col1.x + tY * tMat.col1.y;
  var pLocalY = tX * tMat.col2.x + tY * tMat.col2.y;
  for(var i = 0;i < this.m_vertexCount;++i) {
    tVec = this.m_vertices[i];
    tX = pLocalX - tVec.x;
    tY = pLocalY - tVec.y;
    tVec = this.m_normals[i];
    var dot = tVec.x * tX + tVec.y * tY;
    if(dot > 0) {
      return false
    }
  }
  return true
};
b2PolygonShape.prototype.RayCast = function(output, input, transform) {
  var lower = 0;
  var upper = input.maxFraction;
  var tX;
  var tY;
  var tMat;
  var tVec;
  tX = input.p1.x - transform.position.x;
  tY = input.p1.y - transform.position.y;
  tMat = transform.R;
  var p1X = tX * tMat.col1.x + tY * tMat.col1.y;
  var p1Y = tX * tMat.col2.x + tY * tMat.col2.y;
  tX = input.p2.x - transform.position.x;
  tY = input.p2.y - transform.position.y;
  tMat = transform.R;
  var p2X = tX * tMat.col1.x + tY * tMat.col1.y;
  var p2Y = tX * tMat.col2.x + tY * tMat.col2.y;
  var dX = p2X - p1X;
  var dY = p2Y - p1Y;
  var index = -1;
  for(var i = 0;i < this.m_vertexCount;++i) {
    tVec = this.m_vertices[i];
    tX = tVec.x - p1X;
    tY = tVec.y - p1Y;
    tVec = this.m_normals[i];
    var numerator = tVec.x * tX + tVec.y * tY;
    var denominator = tVec.x * dX + tVec.y * dY;
    if(denominator == 0) {
      if(numerator < 0) {
        return false
      }
    }else {
      if(denominator < 0 && numerator < lower * denominator) {
        lower = numerator / denominator;
        index = i
      }else {
        if(denominator > 0 && numerator < upper * denominator) {
          upper = numerator / denominator
        }
      }
    }
    if(upper < lower - Number.MIN_VALUE) {
      return false
    }
  }
  if(index >= 0) {
    output.fraction = lower;
    tMat = transform.R;
    tVec = this.m_normals[index];
    output.normal.x = tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
    output.normal.y = tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
    return true
  }
  return false
};
b2PolygonShape.prototype.ComputeAABB = function(aabb, xf) {
  var tMat = xf.R;
  var tVec = this.m_vertices[0];
  var lowerX = xf.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
  var lowerY = xf.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
  var upperX = lowerX;
  var upperY = lowerY;
  for(var i = 1;i < this.m_vertexCount;++i) {
    tVec = this.m_vertices[i];
    var vX = xf.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
    var vY = xf.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
    lowerX = lowerX < vX ? lowerX : vX;
    lowerY = lowerY < vY ? lowerY : vY;
    upperX = upperX > vX ? upperX : vX;
    upperY = upperY > vY ? upperY : vY
  }
  aabb.lowerBound.x = lowerX - this.m_radius;
  aabb.lowerBound.y = lowerY - this.m_radius;
  aabb.upperBound.x = upperX + this.m_radius;
  aabb.upperBound.y = upperY + this.m_radius
};
b2PolygonShape.prototype.ComputeMass = function(massData, density) {
  if(this.m_vertexCount == 2) {
    massData.center.x = 0.5 * (this.m_vertices[0].x + this.m_vertices[1].x);
    massData.center.y = 0.5 * (this.m_vertices[0].y + this.m_vertices[1].y);
    massData.mass = 0;
    massData.I = 0;
    return
  }
  var centerX = 0;
  var centerY = 0;
  var area = 0;
  var I = 0;
  var p1X = 0;
  var p1Y = 0;
  var k_inv3 = 1 / 3;
  for(var i = 0;i < this.m_vertexCount;++i) {
    var p2 = this.m_vertices[i];
    var p3 = i + 1 < this.m_vertexCount ? this.m_vertices[parseInt(i + 1)] : this.m_vertices[0];
    var e1X = p2.x - p1X;
    var e1Y = p2.y - p1Y;
    var e2X = p3.x - p1X;
    var e2Y = p3.y - p1Y;
    var D = e1X * e2Y - e1Y * e2X;
    var triangleArea = 0.5 * D;
    area += triangleArea;
    centerX += triangleArea * k_inv3 * (p1X + p2.x + p3.x);
    centerY += triangleArea * k_inv3 * (p1Y + p2.y + p3.y);
    var px = p1X;
    var py = p1Y;
    var ex1 = e1X;
    var ey1 = e1Y;
    var ex2 = e2X;
    var ey2 = e2Y;
    var intx2 = k_inv3 * (0.25 * (ex1 * ex1 + ex2 * ex1 + ex2 * ex2) + (px * ex1 + px * ex2)) + 0.5 * px * px;
    var inty2 = k_inv3 * (0.25 * (ey1 * ey1 + ey2 * ey1 + ey2 * ey2) + (py * ey1 + py * ey2)) + 0.5 * py * py;
    I += D * (intx2 + inty2)
  }
  massData.mass = density * area;
  centerX *= 1 / area;
  centerY *= 1 / area;
  massData.center.Set(centerX, centerY);
  massData.I = density * I
};
b2PolygonShape.prototype.ComputeSubmergedArea = function(normal, offset, xf, c) {
  var normalL = b2Math.MulTMV(xf.R, normal);
  var offsetL = offset - b2Math.Dot(normal, xf.position);
  var depths = new Array;
  var diveCount = 0;
  var intoIndex = -1;
  var outoIndex = -1;
  var lastSubmerged = false;
  var i = 0;
  for(i = 0;i < this.m_vertexCount;++i) {
    depths[i] = b2Math.Dot(normalL, this.m_vertices[i]) - offsetL;
    var isSubmerged = depths[i] < -Number.MIN_VALUE;
    if(i > 0) {
      if(isSubmerged) {
        if(!lastSubmerged) {
          intoIndex = i - 1;
          diveCount++
        }
      }else {
        if(lastSubmerged) {
          outoIndex = i - 1;
          diveCount++
        }
      }
    }
    lastSubmerged = isSubmerged
  }
  switch(diveCount) {
    case 0:
      if(lastSubmerged) {
        var md = new b2MassData;
        this.ComputeMass(md, 1);
        c.SetV(b2Math.MulX(xf, md.center));
        return md.mass
      }else {
        return 0
      }
      break;
    case 1:
      if(intoIndex == -1) {
        intoIndex = this.m_vertexCount - 1
      }else {
        outoIndex = this.m_vertexCount - 1
      }
      break
  }
  var intoIndex2 = (intoIndex + 1) % this.m_vertexCount;
  var outoIndex2 = (outoIndex + 1) % this.m_vertexCount;
  var intoLamdda = (0 - depths[intoIndex]) / (depths[intoIndex2] - depths[intoIndex]);
  var outoLamdda = (0 - depths[outoIndex]) / (depths[outoIndex2] - depths[outoIndex]);
  var intoVec = new b2Vec2(this.m_vertices[intoIndex].x * (1 - intoLamdda) + this.m_vertices[intoIndex2].x * intoLamdda, this.m_vertices[intoIndex].y * (1 - intoLamdda) + this.m_vertices[intoIndex2].y * intoLamdda);
  var outoVec = new b2Vec2(this.m_vertices[outoIndex].x * (1 - outoLamdda) + this.m_vertices[outoIndex2].x * outoLamdda, this.m_vertices[outoIndex].y * (1 - outoLamdda) + this.m_vertices[outoIndex2].y * outoLamdda);
  var area = 0;
  var center = new b2Vec2;
  var p2 = this.m_vertices[intoIndex2];
  var p3;
  i = intoIndex2;
  while(i != outoIndex2) {
    i = (i + 1) % this.m_vertexCount;
    if(i == outoIndex2) {
      p3 = outoVec
    }else {
      p3 = this.m_vertices[i]
    }
    var triangleArea = 0.5 * ((p2.x - intoVec.x) * (p3.y - intoVec.y) - (p2.y - intoVec.y) * (p3.x - intoVec.x));
    area += triangleArea;
    center.x += triangleArea * (intoVec.x + p2.x + p3.x) / 3;
    center.y += triangleArea * (intoVec.y + p2.y + p3.y) / 3;
    p2 = p3
  }
  center.Multiply(1 / area);
  c.SetV(b2Math.MulX(xf, center));
  return area
};
b2PolygonShape.prototype.GetVertexCount = function() {
  return this.m_vertexCount
};
b2PolygonShape.prototype.GetVertices = function() {
  return this.m_vertices
};
b2PolygonShape.prototype.GetNormals = function() {
  return this.m_normals
};
b2PolygonShape.prototype.GetSupport = function(d) {
  var bestIndex = 0;
  var bestValue = this.m_vertices[0].x * d.x + this.m_vertices[0].y * d.y;
  for(var i = 1;i < this.m_vertexCount;++i) {
    var value = this.m_vertices[i].x * d.x + this.m_vertices[i].y * d.y;
    if(value > bestValue) {
      bestIndex = i;
      bestValue = value
    }
  }
  return bestIndex
};
b2PolygonShape.prototype.GetSupportVertex = function(d) {
  var bestIndex = 0;
  var bestValue = this.m_vertices[0].x * d.x + this.m_vertices[0].y * d.y;
  for(var i = 1;i < this.m_vertexCount;++i) {
    var value = this.m_vertices[i].x * d.x + this.m_vertices[i].y * d.y;
    if(value > bestValue) {
      bestIndex = i;
      bestValue = value
    }
  }
  return this.m_vertices[bestIndex]
};
b2PolygonShape.prototype.m_centroid = null;
b2PolygonShape.prototype.m_vertices = null;
b2PolygonShape.prototype.m_normals = null;
b2PolygonShape.prototype.m_vertexCount = 0;var b2Fixture = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2Fixture.prototype.__constructor = function() {
  this.m_aabb = new b2AABB;
  this.m_userData = null;
  this.m_body = null;
  this.m_next = null;
  this.m_shape = null;
  this.m_density = 0;
  this.m_friction = 0;
  this.m_restitution = 0
};
b2Fixture.prototype.__varz = function() {
  this.m_filter = new b2FilterData
};
b2Fixture.prototype.Create = function(body, xf, def) {
  this.m_userData = def.userData;
  this.m_friction = def.friction;
  this.m_restitution = def.restitution;
  this.m_body = body;
  this.m_next = null;
  this.m_filter = def.filter.Copy();
  this.m_isSensor = def.isSensor;
  this.m_shape = def.shape.Copy();
  this.m_density = def.density
};
b2Fixture.prototype.Destroy = function() {
  this.m_shape = null
};
b2Fixture.prototype.CreateProxy = function(broadPhase, xf) {
  this.m_shape.ComputeAABB(this.m_aabb, xf);
  this.m_proxy = broadPhase.CreateProxy(this.m_aabb, this)
};
b2Fixture.prototype.DestroyProxy = function(broadPhase) {
  if(this.m_proxy == null) {
    return
  }
  broadPhase.DestroyProxy(this.m_proxy);
  this.m_proxy = null
};
b2Fixture.prototype.Synchronize = function(broadPhase, transform1, transform2) {
  if(!this.m_proxy) {
    return
  }
  var aabb1 = new b2AABB;
  var aabb2 = new b2AABB;
  this.m_shape.ComputeAABB(aabb1, transform1);
  this.m_shape.ComputeAABB(aabb2, transform2);
  this.m_aabb.Combine(aabb1, aabb2);
  var displacement = b2Math.SubtractVV(transform2.position, transform1.position);
  broadPhase.MoveProxy(this.m_proxy, this.m_aabb, displacement)
};
b2Fixture.prototype.GetType = function() {
  return this.m_shape.GetType()
};
b2Fixture.prototype.GetShape = function() {
  return this.m_shape
};
b2Fixture.prototype.SetSensor = function(sensor) {
  if(this.m_isSensor == sensor) {
    return
  }
  this.m_isSensor = sensor;
  if(this.m_body == null) {
    return
  }
  var edge = this.m_body.GetContactList();
  while(edge) {
    var contact = edge.contact;
    var fixtureA = contact.GetFixtureA();
    var fixtureB = contact.GetFixtureB();
    if(fixtureA == this || fixtureB == this) {
      contact.SetSensor(fixtureA.IsSensor() || fixtureB.IsSensor())
    }
    edge = edge.next
  }
};
b2Fixture.prototype.IsSensor = function() {
  return this.m_isSensor
};
b2Fixture.prototype.SetFilterData = function(filter) {
  this.m_filter = filter.Copy();
  if(this.m_body) {
    return
  }
  var edge = this.m_body.GetContactList();
  while(edge) {
    var contact = edge.contact;
    var fixtureA = contact.GetFixtureA();
    var fixtureB = contact.GetFixtureB();
    if(fixtureA == this || fixtureB == this) {
      contact.FlagForFiltering()
    }
    edge = edge.next
  }
};
b2Fixture.prototype.GetFilterData = function() {
  return this.m_filter.Copy()
};
b2Fixture.prototype.GetBody = function() {
  return this.m_body
};
b2Fixture.prototype.GetNext = function() {
  return this.m_next
};
b2Fixture.prototype.GetUserData = function() {
  return this.m_userData
};
b2Fixture.prototype.SetUserData = function(data) {
  this.m_userData = data
};
b2Fixture.prototype.TestPoint = function(p) {
  return this.m_shape.TestPoint(this.m_body.GetTransform(), p)
};
b2Fixture.prototype.RayCast = function(output, input) {
  return this.m_shape.RayCast(output, input, this.m_body.GetTransform())
};
b2Fixture.prototype.GetMassData = function(massData) {
  if(massData == null) {
    massData = new b2MassData
  }
  this.m_shape.ComputeMass(massData, this.m_density);
  return massData
};
b2Fixture.prototype.SetDensity = function(density) {
  this.m_density = density
};
b2Fixture.prototype.GetDensity = function() {
  return this.m_density
};
b2Fixture.prototype.GetFriction = function() {
  return this.m_friction
};
b2Fixture.prototype.SetFriction = function(friction) {
  this.m_friction = friction
};
b2Fixture.prototype.GetRestitution = function() {
  return this.m_restitution
};
b2Fixture.prototype.SetRestitution = function(restitution) {
  this.m_restitution = restitution
};
b2Fixture.prototype.GetAABB = function() {
  return this.m_aabb
};
b2Fixture.prototype.m_massData = null;
b2Fixture.prototype.m_aabb = null;
b2Fixture.prototype.m_density = null;
b2Fixture.prototype.m_next = null;
b2Fixture.prototype.m_body = null;
b2Fixture.prototype.m_shape = null;
b2Fixture.prototype.m_friction = null;
b2Fixture.prototype.m_restitution = null;
b2Fixture.prototype.m_proxy = null;
b2Fixture.prototype.m_filter = new b2FilterData;
b2Fixture.prototype.m_isSensor = null;
b2Fixture.prototype.m_userData = null;var b2DynamicTreeNode = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2DynamicTreeNode.prototype.__constructor = function() {
};
b2DynamicTreeNode.prototype.__varz = function() {
  this.aabb = new b2AABB
};
b2DynamicTreeNode.prototype.IsLeaf = function() {
  return this.child1 == null
};
b2DynamicTreeNode.prototype.userData = null;
b2DynamicTreeNode.prototype.aabb = new b2AABB;
b2DynamicTreeNode.prototype.parent = null;
b2DynamicTreeNode.prototype.child1 = null;
b2DynamicTreeNode.prototype.child2 = null;var b2BodyDef = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2BodyDef.prototype.__constructor = function() {
  this.userData = null;
  this.position.Set(0, 0);
  this.angle = 0;
  this.linearVelocity.Set(0, 0);
  this.angularVelocity = 0;
  this.linearDamping = 0;
  this.angularDamping = 0;
  this.allowSleep = true;
  this.awake = true;
  this.fixedRotation = false;
  this.bullet = false;
  this.type = b2Body.b2_staticBody;
  this.active = true;
  this.inertiaScale = 1
};
b2BodyDef.prototype.__varz = function() {
  this.position = new b2Vec2;
  this.linearVelocity = new b2Vec2
};
b2BodyDef.prototype.type = 0;
b2BodyDef.prototype.position = new b2Vec2;
b2BodyDef.prototype.angle = null;
b2BodyDef.prototype.linearVelocity = new b2Vec2;
b2BodyDef.prototype.angularVelocity = null;
b2BodyDef.prototype.linearDamping = null;
b2BodyDef.prototype.angularDamping = null;
b2BodyDef.prototype.allowSleep = null;
b2BodyDef.prototype.awake = null;
b2BodyDef.prototype.fixedRotation = null;
b2BodyDef.prototype.bullet = null;
b2BodyDef.prototype.active = null;
b2BodyDef.prototype.userData = null;
b2BodyDef.prototype.inertiaScale = null;var b2DynamicTreeBroadPhase = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2DynamicTreeBroadPhase.prototype.__constructor = function() {
};
b2DynamicTreeBroadPhase.prototype.__varz = function() {
  this.m_tree = new b2DynamicTree;
  this.m_moveBuffer = new Array;
  this.m_pairBuffer = new Array
};
b2DynamicTreeBroadPhase.prototype.BufferMove = function(proxy) {
  this.m_moveBuffer[this.m_moveBuffer.length] = proxy
};
b2DynamicTreeBroadPhase.prototype.UnBufferMove = function(proxy) {
  var i = this.m_moveBuffer.indexOf(proxy);
  this.m_moveBuffer.splice(i, 1)
};
b2DynamicTreeBroadPhase.prototype.ComparePairs = function(pair1, pair2) {
  return 0
};
b2DynamicTreeBroadPhase.prototype.CreateProxy = function(aabb, userData) {
  var proxy = this.m_tree.CreateProxy(aabb, userData);
  ++this.m_proxyCount;
  this.BufferMove(proxy);
  return proxy
};
b2DynamicTreeBroadPhase.prototype.DestroyProxy = function(proxy) {
  this.UnBufferMove(proxy);
  --this.m_proxyCount;
  this.m_tree.DestroyProxy(proxy)
};
b2DynamicTreeBroadPhase.prototype.MoveProxy = function(proxy, aabb, displacement) {
  var buffer = this.m_tree.MoveProxy(proxy, aabb, displacement);
  if(buffer) {
    this.BufferMove(proxy)
  }
};
b2DynamicTreeBroadPhase.prototype.TestOverlap = function(proxyA, proxyB) {
  var aabbA = this.m_tree.GetFatAABB(proxyA);
  var aabbB = this.m_tree.GetFatAABB(proxyB);
  return aabbA.TestOverlap(aabbB)
};
b2DynamicTreeBroadPhase.prototype.GetUserData = function(proxy) {
  return this.m_tree.GetUserData(proxy)
};
b2DynamicTreeBroadPhase.prototype.GetFatAABB = function(proxy) {
  return this.m_tree.GetFatAABB(proxy)
};
b2DynamicTreeBroadPhase.prototype.GetProxyCount = function() {
  return this.m_proxyCount
};
b2DynamicTreeBroadPhase.prototype.UpdatePairs = function(callback) {
  this.m_pairCount = 0;
  for(var i = 0, queryProxy = null;i < this.m_moveBuffer.length, queryProxy = this.m_moveBuffer[i];i++) {
    var that = this;
    function QueryCallback(proxy) {
      if(proxy == queryProxy) {
        return true
      }
      if(that.m_pairCount == that.m_pairBuffer.length) {
        that.m_pairBuffer[that.m_pairCount] = new b2DynamicTreePair
      }
      var pair = that.m_pairBuffer[that.m_pairCount];
      pair.proxyA = proxy < queryProxy ? proxy : queryProxy;
      pair.proxyB = proxy >= queryProxy ? proxy : queryProxy;
      ++that.m_pairCount;
      return true
    }
    var fatAABB = this.m_tree.GetFatAABB(queryProxy);
    this.m_tree.Query(QueryCallback, fatAABB)
  }
  this.m_moveBuffer.length = 0;
  for(var i = 0;i < this.m_pairCount;) {
    var primaryPair = this.m_pairBuffer[i];
    var userDataA = this.m_tree.GetUserData(primaryPair.proxyA);
    var userDataB = this.m_tree.GetUserData(primaryPair.proxyB);
    callback(userDataA, userDataB);
    ++i;
    while(i < this.m_pairCount) {
      var pair = this.m_pairBuffer[i];
      if(pair.proxyA != primaryPair.proxyA || pair.proxyB != primaryPair.proxyB) {
        break
      }
      ++i
    }
  }
};
b2DynamicTreeBroadPhase.prototype.Query = function(callback, aabb) {
  this.m_tree.Query(callback, aabb)
};
b2DynamicTreeBroadPhase.prototype.RayCast = function(callback, input) {
  this.m_tree.RayCast(callback, input)
};
b2DynamicTreeBroadPhase.prototype.Validate = function() {
};
b2DynamicTreeBroadPhase.prototype.Rebalance = function(iterations) {
  this.m_tree.Rebalance(iterations)
};
b2DynamicTreeBroadPhase.prototype.m_tree = new b2DynamicTree;
b2DynamicTreeBroadPhase.prototype.m_proxyCount = 0;
b2DynamicTreeBroadPhase.prototype.m_moveBuffer = new Array;
b2DynamicTreeBroadPhase.prototype.m_pairBuffer = new Array;
b2DynamicTreeBroadPhase.prototype.m_pairCount = 0;var b2BroadPhase = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2BroadPhase.prototype.__constructor = function(worldAABB) {
  var i = 0;
  this.m_pairManager.Initialize(this);
  this.m_worldAABB = worldAABB;
  this.m_proxyCount = 0;
  this.m_bounds = new Array;
  for(i = 0;i < 2;i++) {
    this.m_bounds[i] = new Array
  }
  var dX = worldAABB.upperBound.x - worldAABB.lowerBound.x;
  var dY = worldAABB.upperBound.y - worldAABB.lowerBound.y;
  this.m_quantizationFactor.x = b2Settings.USHRT_MAX / dX;
  this.m_quantizationFactor.y = b2Settings.USHRT_MAX / dY;
  this.m_timeStamp = 1;
  this.m_queryResultCount = 0
};
b2BroadPhase.prototype.__varz = function() {
  this.m_pairManager = new b2PairManager;
  this.m_proxyPool = new Array;
  this.m_querySortKeys = new Array;
  this.m_queryResults = new Array;
  this.m_quantizationFactor = new b2Vec2
};
b2BroadPhase.BinarySearch = function(bounds, count, value) {
  var low = 0;
  var high = count - 1;
  while(low <= high) {
    var mid = Math.round((low + high) / 2);
    var bound = bounds[mid];
    if(bound.value > value) {
      high = mid - 1
    }else {
      if(bound.value < value) {
        low = mid + 1
      }else {
        return parseInt(mid)
      }
    }
  }
  return parseInt(low)
};
b2BroadPhase.s_validate = false;
b2BroadPhase.b2_invalid = b2Settings.USHRT_MAX;
b2BroadPhase.b2_nullEdge = b2Settings.USHRT_MAX;
b2BroadPhase.prototype.ComputeBounds = function(lowerValues, upperValues, aabb) {
  var minVertexX = aabb.lowerBound.x;
  var minVertexY = aabb.lowerBound.y;
  minVertexX = b2Math.Min(minVertexX, this.m_worldAABB.upperBound.x);
  minVertexY = b2Math.Min(minVertexY, this.m_worldAABB.upperBound.y);
  minVertexX = b2Math.Max(minVertexX, this.m_worldAABB.lowerBound.x);
  minVertexY = b2Math.Max(minVertexY, this.m_worldAABB.lowerBound.y);
  var maxVertexX = aabb.upperBound.x;
  var maxVertexY = aabb.upperBound.y;
  maxVertexX = b2Math.Min(maxVertexX, this.m_worldAABB.upperBound.x);
  maxVertexY = b2Math.Min(maxVertexY, this.m_worldAABB.upperBound.y);
  maxVertexX = b2Math.Max(maxVertexX, this.m_worldAABB.lowerBound.x);
  maxVertexY = b2Math.Max(maxVertexY, this.m_worldAABB.lowerBound.y);
  lowerValues[0] = parseInt(this.m_quantizationFactor.x * (minVertexX - this.m_worldAABB.lowerBound.x)) & b2Settings.USHRT_MAX - 1;
  upperValues[0] = parseInt(this.m_quantizationFactor.x * (maxVertexX - this.m_worldAABB.lowerBound.x)) % 65535 | 1;
  lowerValues[1] = parseInt(this.m_quantizationFactor.y * (minVertexY - this.m_worldAABB.lowerBound.y)) & b2Settings.USHRT_MAX - 1;
  upperValues[1] = parseInt(this.m_quantizationFactor.y * (maxVertexY - this.m_worldAABB.lowerBound.y)) % 65535 | 1
};
b2BroadPhase.prototype.TestOverlapValidate = function(p1, p2) {
  for(var axis = 0;axis < 2;++axis) {
    var bounds = this.m_bounds[axis];
    var bound1 = bounds[p1.lowerBounds[axis]];
    var bound2 = bounds[p2.upperBounds[axis]];
    if(bound1.value > bound2.value) {
      return false
    }
    bound1 = bounds[p1.upperBounds[axis]];
    bound2 = bounds[p2.lowerBounds[axis]];
    if(bound1.value < bound2.value) {
      return false
    }
  }
  return true
};
b2BroadPhase.prototype.QueryAxis = function(lowerQueryOut, upperQueryOut, lowerValue, upperValue, bounds, boundCount, axis) {
  var lowerQuery = b2BroadPhase.BinarySearch(bounds, boundCount, lowerValue);
  var upperQuery = b2BroadPhase.BinarySearch(bounds, boundCount, upperValue);
  var bound;
  for(var j = lowerQuery;j < upperQuery;++j) {
    bound = bounds[j];
    if(bound.IsLower()) {
      this.IncrementOverlapCount(bound.proxy)
    }
  }
  if(lowerQuery > 0) {
    var i = lowerQuery - 1;
    bound = bounds[i];
    var s = bound.stabbingCount;
    while(s) {
      bound = bounds[i];
      if(bound.IsLower()) {
        var proxy = bound.proxy;
        if(lowerQuery <= proxy.upperBounds[axis]) {
          this.IncrementOverlapCount(bound.proxy);
          --s
        }
      }
      --i
    }
  }
  lowerQueryOut[0] = lowerQuery;
  upperQueryOut[0] = upperQuery
};
b2BroadPhase.prototype.IncrementOverlapCount = function(proxy) {
  if(proxy.timeStamp < this.m_timeStamp) {
    proxy.timeStamp = this.m_timeStamp;
    proxy.overlapCount = 1
  }else {
    proxy.overlapCount = 2;
    this.m_queryResults[this.m_queryResultCount] = proxy;
    ++this.m_queryResultCount
  }
};
b2BroadPhase.prototype.IncrementTimeStamp = function() {
  if(this.m_timeStamp == b2Settings.USHRT_MAX) {
    for(var i = 0;i < this.m_proxyPool.length;++i) {
      this.m_proxyPool[i].timeStamp = 0
    }
    this.m_timeStamp = 1
  }else {
    ++this.m_timeStamp
  }
};
b2BroadPhase.prototype.InRange = function(aabb) {
  var dX;
  var dY;
  var d2X;
  var d2Y;
  dX = aabb.lowerBound.x;
  dY = aabb.lowerBound.y;
  dX -= this.m_worldAABB.upperBound.x;
  dY -= this.m_worldAABB.upperBound.y;
  d2X = this.m_worldAABB.lowerBound.x;
  d2Y = this.m_worldAABB.lowerBound.y;
  d2X -= aabb.upperBound.x;
  d2Y -= aabb.upperBound.y;
  dX = b2Math.Max(dX, d2X);
  dY = b2Math.Max(dY, d2Y);
  return b2Math.Max(dX, dY) < 0
};
b2BroadPhase.prototype.CreateProxy = function(aabb, userData) {
  var index = 0;
  var proxy;
  var i = 0;
  var j = 0;
  if(!this.m_freeProxy) {
    this.m_freeProxy = this.m_proxyPool[this.m_proxyCount] = new b2Proxy;
    this.m_freeProxy.next = null;
    this.m_freeProxy.timeStamp = 0;
    this.m_freeProxy.overlapCount = b2BroadPhase.b2_invalid;
    this.m_freeProxy.userData = null;
    for(i = 0;i < 2;i++) {
      j = this.m_proxyCount * 2;
      this.m_bounds[i][j++] = new b2Bound;
      this.m_bounds[i][j] = new b2Bound
    }
  }
  proxy = this.m_freeProxy;
  this.m_freeProxy = proxy.next;
  proxy.overlapCount = 0;
  proxy.userData = userData;
  var boundCount = 2 * this.m_proxyCount;
  var lowerValues = new Array;
  var upperValues = new Array;
  this.ComputeBounds(lowerValues, upperValues, aabb);
  for(var axis = 0;axis < 2;++axis) {
    var bounds = this.m_bounds[axis];
    var lowerIndex = 0;
    var upperIndex = 0;
    var lowerIndexOut = new Array;
    lowerIndexOut.push(lowerIndex);
    var upperIndexOut = new Array;
    upperIndexOut.push(upperIndex);
    this.QueryAxis(lowerIndexOut, upperIndexOut, lowerValues[axis], upperValues[axis], bounds, boundCount, axis);
    lowerIndex = lowerIndexOut[0];
    upperIndex = upperIndexOut[0];
    bounds.splice(upperIndex, 0, bounds[bounds.length - 1]);
    bounds.length--;
    bounds.splice(lowerIndex, 0, bounds[bounds.length - 1]);
    bounds.length--;
    ++upperIndex;
    var tBound1 = bounds[lowerIndex];
    var tBound2 = bounds[upperIndex];
    tBound1.value = lowerValues[axis];
    tBound1.proxy = proxy;
    tBound2.value = upperValues[axis];
    tBound2.proxy = proxy;
    var tBoundAS3 = bounds[parseInt(lowerIndex - 1)];
    tBound1.stabbingCount = lowerIndex == 0 ? 0 : tBoundAS3.stabbingCount;
    tBoundAS3 = bounds[parseInt(upperIndex - 1)];
    tBound2.stabbingCount = tBoundAS3.stabbingCount;
    for(index = lowerIndex;index < upperIndex;++index) {
      tBoundAS3 = bounds[index];
      tBoundAS3.stabbingCount++
    }
    for(index = lowerIndex;index < boundCount + 2;++index) {
      tBound1 = bounds[index];
      var proxy2 = tBound1.proxy;
      if(tBound1.IsLower()) {
        proxy2.lowerBounds[axis] = index
      }else {
        proxy2.upperBounds[axis] = index
      }
    }
  }
  ++this.m_proxyCount;
  for(i = 0;i < this.m_queryResultCount;++i) {
    this.m_pairManager.AddBufferedPair(proxy, this.m_queryResults[i])
  }
  this.m_queryResultCount = 0;
  this.IncrementTimeStamp();
  return proxy
};
b2BroadPhase.prototype.DestroyProxy = function(proxy_) {
  var proxy = proxy_;
  var tBound1;
  var tBound2;
  var boundCount = 2 * this.m_proxyCount;
  for(var axis = 0;axis < 2;++axis) {
    var bounds = this.m_bounds[axis];
    var lowerIndex = proxy.lowerBounds[axis];
    var upperIndex = proxy.upperBounds[axis];
    tBound1 = bounds[lowerIndex];
    var lowerValue = tBound1.value;
    tBound2 = bounds[upperIndex];
    var upperValue = tBound2.value;
    bounds.splice(upperIndex, 1);
    bounds.splice(lowerIndex, 1);
    bounds.push(tBound1);
    bounds.push(tBound2);
    var tEnd = boundCount - 2;
    for(var index = lowerIndex;index < tEnd;++index) {
      tBound1 = bounds[index];
      var proxy2 = tBound1.proxy;
      if(tBound1.IsLower()) {
        proxy2.lowerBounds[axis] = index
      }else {
        proxy2.upperBounds[axis] = index
      }
    }
    tEnd = upperIndex - 1;
    for(var index2 = lowerIndex;index2 < tEnd;++index2) {
      tBound1 = bounds[index2];
      tBound1.stabbingCount--
    }
    var ignore = new Array;
    this.QueryAxis(ignore, ignore, lowerValue, upperValue, bounds, boundCount - 2, axis)
  }
  for(var i = 0;i < this.m_queryResultCount;++i) {
    this.m_pairManager.RemoveBufferedPair(proxy, this.m_queryResults[i])
  }
  this.m_queryResultCount = 0;
  this.IncrementTimeStamp();
  proxy.userData = null;
  proxy.overlapCount = b2BroadPhase.b2_invalid;
  proxy.lowerBounds[0] = b2BroadPhase.b2_invalid;
  proxy.lowerBounds[1] = b2BroadPhase.b2_invalid;
  proxy.upperBounds[0] = b2BroadPhase.b2_invalid;
  proxy.upperBounds[1] = b2BroadPhase.b2_invalid;
  proxy.next = this.m_freeProxy;
  this.m_freeProxy = proxy;
  --this.m_proxyCount
};
b2BroadPhase.prototype.MoveProxy = function(proxy_, aabb, displacement) {
  var proxy = proxy_;
  var as3arr;
  var as3int = 0;
  var axis = 0;
  var index = 0;
  var bound;
  var prevBound;
  var nextBound;
  var nextProxyId = 0;
  var nextProxy;
  if(proxy == null) {
    return
  }
  if(aabb.IsValid() == false) {
    return
  }
  var boundCount = 2 * this.m_proxyCount;
  var newValues = new b2BoundValues;
  this.ComputeBounds(newValues.lowerValues, newValues.upperValues, aabb);
  var oldValues = new b2BoundValues;
  for(axis = 0;axis < 2;++axis) {
    bound = this.m_bounds[axis][proxy.lowerBounds[axis]];
    oldValues.lowerValues[axis] = bound.value;
    bound = this.m_bounds[axis][proxy.upperBounds[axis]];
    oldValues.upperValues[axis] = bound.value
  }
  for(axis = 0;axis < 2;++axis) {
    var bounds = this.m_bounds[axis];
    var lowerIndex = proxy.lowerBounds[axis];
    var upperIndex = proxy.upperBounds[axis];
    var lowerValue = newValues.lowerValues[axis];
    var upperValue = newValues.upperValues[axis];
    bound = bounds[lowerIndex];
    var deltaLower = lowerValue - bound.value;
    bound.value = lowerValue;
    bound = bounds[upperIndex];
    var deltaUpper = upperValue - bound.value;
    bound.value = upperValue;
    if(deltaLower < 0) {
      index = lowerIndex;
      while(index > 0 && lowerValue < bounds[parseInt(index - 1)].value) {
        bound = bounds[index];
        prevBound = bounds[parseInt(index - 1)];
        var prevProxy = prevBound.proxy;
        prevBound.stabbingCount++;
        if(prevBound.IsUpper() == true) {
          if(this.TestOverlapBound(newValues, prevProxy)) {
            this.m_pairManager.AddBufferedPair(proxy, prevProxy)
          }
          as3arr = prevProxy.upperBounds;
          as3int = as3arr[axis];
          as3int++;
          as3arr[axis] = as3int;
          bound.stabbingCount++
        }else {
          as3arr = prevProxy.lowerBounds;
          as3int = as3arr[axis];
          as3int++;
          as3arr[axis] = as3int;
          bound.stabbingCount--
        }
        as3arr = proxy.lowerBounds;
        as3int = as3arr[axis];
        as3int--;
        as3arr[axis] = as3int;
        bound.Swap(prevBound);
        --index
      }
    }
    if(deltaUpper > 0) {
      index = upperIndex;
      while(index < boundCount - 1 && bounds[parseInt(index + 1)].value <= upperValue) {
        bound = bounds[index];
        nextBound = bounds[parseInt(index + 1)];
        nextProxy = nextBound.proxy;
        nextBound.stabbingCount++;
        if(nextBound.IsLower() == true) {
          if(this.TestOverlapBound(newValues, nextProxy)) {
            this.m_pairManager.AddBufferedPair(proxy, nextProxy)
          }
          as3arr = nextProxy.lowerBounds;
          as3int = as3arr[axis];
          as3int--;
          as3arr[axis] = as3int;
          bound.stabbingCount++
        }else {
          as3arr = nextProxy.upperBounds;
          as3int = as3arr[axis];
          as3int--;
          as3arr[axis] = as3int;
          bound.stabbingCount--
        }
        as3arr = proxy.upperBounds;
        as3int = as3arr[axis];
        as3int++;
        as3arr[axis] = as3int;
        bound.Swap(nextBound);
        index++
      }
    }
    if(deltaLower > 0) {
      index = lowerIndex;
      while(index < boundCount - 1 && bounds[parseInt(index + 1)].value <= lowerValue) {
        bound = bounds[index];
        nextBound = bounds[parseInt(index + 1)];
        nextProxy = nextBound.proxy;
        nextBound.stabbingCount--;
        if(nextBound.IsUpper()) {
          if(this.TestOverlapBound(oldValues, nextProxy)) {
            this.m_pairManager.RemoveBufferedPair(proxy, nextProxy)
          }
          as3arr = nextProxy.upperBounds;
          as3int = as3arr[axis];
          as3int--;
          as3arr[axis] = as3int;
          bound.stabbingCount--
        }else {
          as3arr = nextProxy.lowerBounds;
          as3int = as3arr[axis];
          as3int--;
          as3arr[axis] = as3int;
          bound.stabbingCount++
        }
        as3arr = proxy.lowerBounds;
        as3int = as3arr[axis];
        as3int++;
        as3arr[axis] = as3int;
        bound.Swap(nextBound);
        index++
      }
    }
    if(deltaUpper < 0) {
      index = upperIndex;
      while(index > 0 && upperValue < bounds[parseInt(index - 1)].value) {
        bound = bounds[index];
        prevBound = bounds[parseInt(index - 1)];
        prevProxy = prevBound.proxy;
        prevBound.stabbingCount--;
        if(prevBound.IsLower() == true) {
          if(this.TestOverlapBound(oldValues, prevProxy)) {
            this.m_pairManager.RemoveBufferedPair(proxy, prevProxy)
          }
          as3arr = prevProxy.lowerBounds;
          as3int = as3arr[axis];
          as3int++;
          as3arr[axis] = as3int;
          bound.stabbingCount--
        }else {
          as3arr = prevProxy.upperBounds;
          as3int = as3arr[axis];
          as3int++;
          as3arr[axis] = as3int;
          bound.stabbingCount++
        }
        as3arr = proxy.upperBounds;
        as3int = as3arr[axis];
        as3int--;
        as3arr[axis] = as3int;
        bound.Swap(prevBound);
        index--
      }
    }
  }
};
b2BroadPhase.prototype.UpdatePairs = function(callback) {
  this.m_pairManager.Commit(callback)
};
b2BroadPhase.prototype.TestOverlap = function(proxyA, proxyB) {
  var proxyA_ = proxyA;
  var proxyB_ = proxyB;
  if(proxyA_.lowerBounds[0] > proxyB_.upperBounds[0]) {
    return false
  }
  if(proxyB_.lowerBounds[0] > proxyA_.upperBounds[0]) {
    return false
  }
  if(proxyA_.lowerBounds[1] > proxyB_.upperBounds[1]) {
    return false
  }
  if(proxyB_.lowerBounds[1] > proxyA_.upperBounds[1]) {
    return false
  }
  return true
};
b2BroadPhase.prototype.GetUserData = function(proxy) {
  return proxy.userData
};
b2BroadPhase.prototype.GetFatAABB = function(proxy_) {
  var aabb = new b2AABB;
  var proxy = proxy_;
  aabb.lowerBound.x = this.m_worldAABB.lowerBound.x + this.m_bounds[0][proxy.lowerBounds[0]].value / this.m_quantizationFactor.x;
  aabb.lowerBound.y = this.m_worldAABB.lowerBound.y + this.m_bounds[1][proxy.lowerBounds[1]].value / this.m_quantizationFactor.y;
  aabb.upperBound.x = this.m_worldAABB.lowerBound.x + this.m_bounds[0][proxy.upperBounds[0]].value / this.m_quantizationFactor.x;
  aabb.upperBound.y = this.m_worldAABB.lowerBound.y + this.m_bounds[1][proxy.upperBounds[1]].value / this.m_quantizationFactor.y;
  return aabb
};
b2BroadPhase.prototype.GetProxyCount = function() {
  return this.m_proxyCount
};
b2BroadPhase.prototype.Query = function(callback, aabb) {
  var lowerValues = new Array;
  var upperValues = new Array;
  this.ComputeBounds(lowerValues, upperValues, aabb);
  var lowerIndex = 0;
  var upperIndex = 0;
  var lowerIndexOut = new Array;
  lowerIndexOut.push(lowerIndex);
  var upperIndexOut = new Array;
  upperIndexOut.push(upperIndex);
  this.QueryAxis(lowerIndexOut, upperIndexOut, lowerValues[0], upperValues[0], this.m_bounds[0], 2 * this.m_proxyCount, 0);
  this.QueryAxis(lowerIndexOut, upperIndexOut, lowerValues[1], upperValues[1], this.m_bounds[1], 2 * this.m_proxyCount, 1);
  for(var i = 0;i < this.m_queryResultCount;++i) {
    var proxy = this.m_queryResults[i];
    if(!callback(proxy)) {
      break
    }
  }
  this.m_queryResultCount = 0;
  this.IncrementTimeStamp()
};
b2BroadPhase.prototype.Validate = function() {
  var pair;
  var proxy1;
  var proxy2;
  var overlap;
  for(var axis = 0;axis < 2;++axis) {
    var bounds = this.m_bounds[axis];
    var boundCount = 2 * this.m_proxyCount;
    var stabbingCount = 0;
    for(var i = 0;i < boundCount;++i) {
      var bound = bounds[i];
      if(bound.IsLower() == true) {
        stabbingCount++
      }else {
        stabbingCount--
      }
    }
  }
};
b2BroadPhase.prototype.Rebalance = function(iterations) {
};
b2BroadPhase.prototype.RayCast = function(callback, input) {
  var subInput = new b2RayCastInput;
  subInput.p1.SetV(input.p1);
  subInput.p2.SetV(input.p2);
  subInput.maxFraction = input.maxFraction;
  var dx = (input.p2.x - input.p1.x) * this.m_quantizationFactor.x;
  var dy = (input.p2.y - input.p1.y) * this.m_quantizationFactor.y;
  var sx = dx < -Number.MIN_VALUE ? -1 : dx > Number.MIN_VALUE ? 1 : 0;
  var sy = dy < -Number.MIN_VALUE ? -1 : dy > Number.MIN_VALUE ? 1 : 0;
  var p1x = this.m_quantizationFactor.x * (input.p1.x - this.m_worldAABB.lowerBound.x);
  var p1y = this.m_quantizationFactor.y * (input.p1.y - this.m_worldAABB.lowerBound.y);
  var startValues = new Array;
  var startValues2 = new Array;
  startValues[0] = parseInt(p1x) & b2Settings.USHRT_MAX - 1;
  startValues[1] = parseInt(p1y) & b2Settings.USHRT_MAX - 1;
  startValues2[0] = startValues[0] + 1;
  startValues2[1] = startValues[1] + 1;
  var startIndices = new Array;
  var xIndex = 0;
  var yIndex = 0;
  var proxy;
  var lowerIndex = 0;
  var upperIndex = 0;
  var lowerIndexOut = new Array;
  lowerIndexOut.push(lowerIndex);
  var upperIndexOut = new Array;
  upperIndexOut.push(upperIndex);
  this.QueryAxis(lowerIndexOut, upperIndexOut, startValues[0], startValues2[0], this.m_bounds[0], 2 * this.m_proxyCount, 0);
  if(sx >= 0) {
    xIndex = upperIndexOut[0] - 1
  }else {
    xIndex = lowerIndexOut[0]
  }
  this.QueryAxis(lowerIndexOut, upperIndexOut, startValues[1], startValues2[1], this.m_bounds[1], 2 * this.m_proxyCount, 1);
  if(sy >= 0) {
    yIndex = upperIndexOut[0] - 1
  }else {
    yIndex = lowerIndexOut[0]
  }
  for(var i = 0;i < this.m_queryResultCount;i++) {
    subInput.maxFraction = callback(this.m_queryResults[i], subInput)
  }
  for(;;) {
    var xProgress = 0;
    var yProgress = 0;
    xIndex += sx >= 0 ? 1 : -1;
    if(xIndex < 0 || xIndex >= this.m_proxyCount * 2) {
      break
    }
    if(sx != 0) {
      xProgress = (this.m_bounds[0][xIndex].value - p1x) / dx
    }
    yIndex += sy >= 0 ? 1 : -1;
    if(yIndex < 0 || yIndex >= this.m_proxyCount * 2) {
      break
    }
    if(sy != 0) {
      yProgress = (this.m_bounds[1][yIndex].value - p1y) / dy
    }
    for(;;) {
      if(sy == 0 || sx != 0 && xProgress < yProgress) {
        if(xProgress > subInput.maxFraction) {
          break
        }
        if(sx > 0 ? this.m_bounds[0][xIndex].IsLower() : this.m_bounds[0][xIndex].IsUpper()) {
          proxy = this.m_bounds[0][xIndex].proxy;
          if(sy >= 0) {
            if(proxy.lowerBounds[1] <= yIndex - 1 && proxy.upperBounds[1] >= yIndex) {
              subInput.maxFraction = callback(proxy, subInput)
            }
          }else {
            if(proxy.lowerBounds[1] <= yIndex && proxy.upperBounds[1] >= yIndex + 1) {
              subInput.maxFraction = callback(proxy, subInput)
            }
          }
        }
        if(subInput.maxFraction == 0) {
          break
        }
        if(sx > 0) {
          xIndex++;
          if(xIndex == this.m_proxyCount * 2) {
            break
          }
        }else {
          xIndex--;
          if(xIndex < 0) {
            break
          }
        }
        xProgress = (this.m_bounds[0][xIndex].value - p1x) / dx
      }else {
        if(yProgress > subInput.maxFraction) {
          break
        }
        if(sy > 0 ? this.m_bounds[1][yIndex].IsLower() : this.m_bounds[1][yIndex].IsUpper()) {
          proxy = this.m_bounds[1][yIndex].proxy;
          if(sx >= 0) {
            if(proxy.lowerBounds[0] <= xIndex - 1 && proxy.upperBounds[0] >= xIndex) {
              subInput.maxFraction = callback(proxy, subInput)
            }
          }else {
            if(proxy.lowerBounds[0] <= xIndex && proxy.upperBounds[0] >= xIndex + 1) {
              subInput.maxFraction = callback(proxy, subInput)
            }
          }
        }
        if(subInput.maxFraction == 0) {
          break
        }
        if(sy > 0) {
          yIndex++;
          if(yIndex == this.m_proxyCount * 2) {
            break
          }
        }else {
          yIndex--;
          if(yIndex < 0) {
            break
          }
        }
        yProgress = (this.m_bounds[1][yIndex].value - p1y) / dy
      }
    }
    break
  }
  this.m_queryResultCount = 0;
  this.IncrementTimeStamp();
  return
};
b2BroadPhase.prototype.TestOverlapBound = function(b, p) {
  for(var axis = 0;axis < 2;++axis) {
    var bounds = this.m_bounds[axis];
    var bound = bounds[p.upperBounds[axis]];
    if(b.lowerValues[axis] > bound.value) {
      return false
    }
    bound = bounds[p.lowerBounds[axis]];
    if(b.upperValues[axis] < bound.value) {
      return false
    }
  }
  return true
};
b2BroadPhase.prototype.m_pairManager = new b2PairManager;
b2BroadPhase.prototype.m_proxyPool = new Array;
b2BroadPhase.prototype.m_freeProxy = null;
b2BroadPhase.prototype.m_bounds = null;
b2BroadPhase.prototype.m_querySortKeys = new Array;
b2BroadPhase.prototype.m_queryResults = new Array;
b2BroadPhase.prototype.m_queryResultCount = 0;
b2BroadPhase.prototype.m_worldAABB = null;
b2BroadPhase.prototype.m_quantizationFactor = new b2Vec2;
b2BroadPhase.prototype.m_proxyCount = 0;
b2BroadPhase.prototype.m_timeStamp = 0;var b2Manifold = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2Manifold.prototype.__constructor = function() {
  this.m_points = new Array(b2Settings.b2_maxManifoldPoints);
  for(var i = 0;i < b2Settings.b2_maxManifoldPoints;i++) {
    this.m_points[i] = new b2ManifoldPoint
  }
  this.m_localPlaneNormal = new b2Vec2;
  this.m_localPoint = new b2Vec2
};
b2Manifold.prototype.__varz = function() {
};
b2Manifold.e_circles = 1;
b2Manifold.e_faceA = 2;
b2Manifold.e_faceB = 4;
b2Manifold.prototype.Reset = function() {
  for(var i = 0;i < b2Settings.b2_maxManifoldPoints;i++) {
    this.m_points[i].Reset()
  }
  this.m_localPlaneNormal.SetZero();
  this.m_localPoint.SetZero();
  this.m_type = 0;
  this.m_pointCount = 0
};
b2Manifold.prototype.Set = function(m) {
  this.m_pointCount = m.m_pointCount;
  for(var i = 0;i < b2Settings.b2_maxManifoldPoints;i++) {
    this.m_points[i].Set(m.m_points[i])
  }
  this.m_localPlaneNormal.SetV(m.m_localPlaneNormal);
  this.m_localPoint.SetV(m.m_localPoint);
  this.m_type = m.m_type
};
b2Manifold.prototype.Copy = function() {
  var copy = new b2Manifold;
  copy.Set(this);
  return copy
};
b2Manifold.prototype.m_points = null;
b2Manifold.prototype.m_localPlaneNormal = null;
b2Manifold.prototype.m_localPoint = null;
b2Manifold.prototype.m_type = 0;
b2Manifold.prototype.m_pointCount = 0;var b2CircleShape = function() {
  b2Shape.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2CircleShape.prototype, b2Shape.prototype);
b2CircleShape.prototype._super = b2Shape.prototype;
b2CircleShape.prototype.__constructor = function(radius) {
  this._super.__constructor.apply(this, []);
  this.m_type = b2Shape.e_circleShape;
  this.m_radius = radius
};
b2CircleShape.prototype.__varz = function() {
  this.m_p = new b2Vec2
};
b2CircleShape.prototype.Copy = function() {
  var s = new b2CircleShape;
  s.Set(this);
  return s
};
b2CircleShape.prototype.Set = function(other) {
  this._super.Set.apply(this, [other]);
  if(isInstanceOf(other, b2CircleShape)) {
    var other2 = other;
    this.m_p.SetV(other2.m_p)
  }
};
b2CircleShape.prototype.TestPoint = function(transform, p) {
  var tMat = transform.R;
  var dX = transform.position.x + (tMat.col1.x * this.m_p.x + tMat.col2.x * this.m_p.y);
  var dY = transform.position.y + (tMat.col1.y * this.m_p.x + tMat.col2.y * this.m_p.y);
  dX = p.x - dX;
  dY = p.y - dY;
  return dX * dX + dY * dY <= this.m_radius * this.m_radius
};
b2CircleShape.prototype.RayCast = function(output, input, transform) {
  var tMat = transform.R;
  var positionX = transform.position.x + (tMat.col1.x * this.m_p.x + tMat.col2.x * this.m_p.y);
  var positionY = transform.position.y + (tMat.col1.y * this.m_p.x + tMat.col2.y * this.m_p.y);
  var sX = input.p1.x - positionX;
  var sY = input.p1.y - positionY;
  var b = sX * sX + sY * sY - this.m_radius * this.m_radius;
  var rX = input.p2.x - input.p1.x;
  var rY = input.p2.y - input.p1.y;
  var c = sX * rX + sY * rY;
  var rr = rX * rX + rY * rY;
  var sigma = c * c - rr * b;
  if(sigma < 0 || rr < Number.MIN_VALUE) {
    return false
  }
  var a = -(c + Math.sqrt(sigma));
  if(0 <= a && a <= input.maxFraction * rr) {
    a /= rr;
    output.fraction = a;
    output.normal.x = sX + a * rX;
    output.normal.y = sY + a * rY;
    output.normal.Normalize();
    return true
  }
  return false
};
b2CircleShape.prototype.ComputeAABB = function(aabb, transform) {
  var tMat = transform.R;
  var pX = transform.position.x + (tMat.col1.x * this.m_p.x + tMat.col2.x * this.m_p.y);
  var pY = transform.position.y + (tMat.col1.y * this.m_p.x + tMat.col2.y * this.m_p.y);
  aabb.lowerBound.Set(pX - this.m_radius, pY - this.m_radius);
  aabb.upperBound.Set(pX + this.m_radius, pY + this.m_radius)
};
b2CircleShape.prototype.ComputeMass = function(massData, density) {
  massData.mass = density * b2Settings.b2_pi * this.m_radius * this.m_radius;
  massData.center.SetV(this.m_p);
  massData.I = massData.mass * (0.5 * this.m_radius * this.m_radius + (this.m_p.x * this.m_p.x + this.m_p.y * this.m_p.y))
};
b2CircleShape.prototype.ComputeSubmergedArea = function(normal, offset, xf, c) {
  var p = b2Math.MulX(xf, this.m_p);
  var l = -(b2Math.Dot(normal, p) - offset);
  if(l < -this.m_radius + Number.MIN_VALUE) {
    return 0
  }
  if(l > this.m_radius) {
    c.SetV(p);
    return Math.PI * this.m_radius * this.m_radius
  }
  var r2 = this.m_radius * this.m_radius;
  var l2 = l * l;
  var area = r2 * (Math.asin(l / this.m_radius) + Math.PI / 2) + l * Math.sqrt(r2 - l2);
  var com = -2 / 3 * Math.pow(r2 - l2, 1.5) / area;
  c.x = p.x + normal.x * com;
  c.y = p.y + normal.y * com;
  return area
};
b2CircleShape.prototype.GetLocalPosition = function() {
  return this.m_p
};
b2CircleShape.prototype.SetLocalPosition = function(position) {
  this.m_p.SetV(position)
};
b2CircleShape.prototype.GetRadius = function() {
  return this.m_radius
};
b2CircleShape.prototype.SetRadius = function(radius) {
  this.m_radius = radius
};
b2CircleShape.prototype.m_p = new b2Vec2;var b2Joint = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2Joint.prototype.__constructor = function(def) {
  b2Settings.b2Assert(def.bodyA != def.bodyB);
  this.m_type = def.type;
  this.m_prev = null;
  this.m_next = null;
  this.m_bodyA = def.bodyA;
  this.m_bodyB = def.bodyB;
  this.m_collideConnected = def.collideConnected;
  this.m_islandFlag = false;
  this.m_userData = def.userData
};
b2Joint.prototype.__varz = function() {
  this.m_edgeA = new b2JointEdge;
  this.m_edgeB = new b2JointEdge;
  this.m_localCenterA = new b2Vec2;
  this.m_localCenterB = new b2Vec2
};
b2Joint.Create = function(def, allocator) {
  var joint = null;
  switch(def.type) {
    case b2Joint.e_distanceJoint:
      joint = new b2DistanceJoint(def);
      break;
    case b2Joint.e_mouseJoint:
      joint = new b2MouseJoint(def);
      break;
    case b2Joint.e_prismaticJoint:
      joint = new b2PrismaticJoint(def);
      break;
    case b2Joint.e_revoluteJoint:
      joint = new b2RevoluteJoint(def);
      break;
    case b2Joint.e_pulleyJoint:
      joint = new b2PulleyJoint(def);
      break;
    case b2Joint.e_gearJoint:
      joint = new b2GearJoint(def);
      break;
    case b2Joint.e_lineJoint:
      joint = new b2LineJoint(def);
      break;
    case b2Joint.e_weldJoint:
      joint = new b2WeldJoint(def);
      break;
    case b2Joint.e_frictionJoint:
      joint = new b2FrictionJoint(def);
      break;
    default:
      break
  }
  return joint
};
b2Joint.Destroy = function(joint, allocator) {
};
b2Joint.e_unknownJoint = 0;
b2Joint.e_revoluteJoint = 1;
b2Joint.e_prismaticJoint = 2;
b2Joint.e_distanceJoint = 3;
b2Joint.e_pulleyJoint = 4;
b2Joint.e_mouseJoint = 5;
b2Joint.e_gearJoint = 6;
b2Joint.e_lineJoint = 7;
b2Joint.e_weldJoint = 8;
b2Joint.e_frictionJoint = 9;
b2Joint.e_inactiveLimit = 0;
b2Joint.e_atLowerLimit = 1;
b2Joint.e_atUpperLimit = 2;
b2Joint.e_equalLimits = 3;
b2Joint.prototype.InitVelocityConstraints = function(step) {
};
b2Joint.prototype.SolveVelocityConstraints = function(step) {
};
b2Joint.prototype.FinalizeVelocityConstraints = function() {
};
b2Joint.prototype.SolvePositionConstraints = function(baumgarte) {
  return false
};
b2Joint.prototype.GetType = function() {
  return this.m_type
};
b2Joint.prototype.GetAnchorA = function() {
  return null
};
b2Joint.prototype.GetAnchorB = function() {
  return null
};
b2Joint.prototype.GetReactionForce = function(inv_dt) {
  return null
};
b2Joint.prototype.GetReactionTorque = function(inv_dt) {
  return 0
};
b2Joint.prototype.GetBodyA = function() {
  return this.m_bodyA
};
b2Joint.prototype.GetBodyB = function() {
  return this.m_bodyB
};
b2Joint.prototype.GetNext = function() {
  return this.m_next
};
b2Joint.prototype.GetUserData = function() {
  return this.m_userData
};
b2Joint.prototype.SetUserData = function(data) {
  this.m_userData = data
};
b2Joint.prototype.IsActive = function() {
  return this.m_bodyA.IsActive() && this.m_bodyB.IsActive()
};
b2Joint.prototype.m_type = 0;
b2Joint.prototype.m_prev = null;
b2Joint.prototype.m_next = null;
b2Joint.prototype.m_edgeA = new b2JointEdge;
b2Joint.prototype.m_edgeB = new b2JointEdge;
b2Joint.prototype.m_bodyA = null;
b2Joint.prototype.m_bodyB = null;
b2Joint.prototype.m_islandFlag = null;
b2Joint.prototype.m_collideConnected = null;
b2Joint.prototype.m_userData = null;
b2Joint.prototype.m_localCenterA = new b2Vec2;
b2Joint.prototype.m_localCenterB = new b2Vec2;
b2Joint.prototype.m_invMassA = null;
b2Joint.prototype.m_invMassB = null;
b2Joint.prototype.m_invIA = null;
b2Joint.prototype.m_invIB = null;var b2LineJoint = function() {
  b2Joint.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2LineJoint.prototype, b2Joint.prototype);
b2LineJoint.prototype._super = b2Joint.prototype;
b2LineJoint.prototype.__constructor = function(def) {
  this._super.__constructor.apply(this, [def]);
  var tMat;
  var tX;
  var tY;
  this.m_localAnchor1.SetV(def.localAnchorA);
  this.m_localAnchor2.SetV(def.localAnchorB);
  this.m_localXAxis1.SetV(def.localAxisA);
  this.m_localYAxis1.x = -this.m_localXAxis1.y;
  this.m_localYAxis1.y = this.m_localXAxis1.x;
  this.m_impulse.SetZero();
  this.m_motorMass = 0;
  this.m_motorImpulse = 0;
  this.m_lowerTranslation = def.lowerTranslation;
  this.m_upperTranslation = def.upperTranslation;
  this.m_maxMotorForce = def.maxMotorForce;
  this.m_motorSpeed = def.motorSpeed;
  this.m_enableLimit = def.enableLimit;
  this.m_enableMotor = def.enableMotor;
  this.m_limitState = b2Joint.e_inactiveLimit;
  this.m_axis.SetZero();
  this.m_perp.SetZero()
};
b2LineJoint.prototype.__varz = function() {
  this.m_localAnchor1 = new b2Vec2;
  this.m_localAnchor2 = new b2Vec2;
  this.m_localXAxis1 = new b2Vec2;
  this.m_localYAxis1 = new b2Vec2;
  this.m_axis = new b2Vec2;
  this.m_perp = new b2Vec2;
  this.m_K = new b2Mat22;
  this.m_impulse = new b2Vec2
};
b2LineJoint.prototype.InitVelocityConstraints = function(step) {
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  var tMat;
  var tX;
  this.m_localCenterA.SetV(bA.GetLocalCenter());
  this.m_localCenterB.SetV(bB.GetLocalCenter());
  var xf1 = bA.GetTransform();
  var xf2 = bB.GetTransform();
  tMat = bA.m_xf.R;
  var r1X = this.m_localAnchor1.x - this.m_localCenterA.x;
  var r1Y = this.m_localAnchor1.y - this.m_localCenterA.y;
  tX = tMat.col1.x * r1X + tMat.col2.x * r1Y;
  r1Y = tMat.col1.y * r1X + tMat.col2.y * r1Y;
  r1X = tX;
  tMat = bB.m_xf.R;
  var r2X = this.m_localAnchor2.x - this.m_localCenterB.x;
  var r2Y = this.m_localAnchor2.y - this.m_localCenterB.y;
  tX = tMat.col1.x * r2X + tMat.col2.x * r2Y;
  r2Y = tMat.col1.y * r2X + tMat.col2.y * r2Y;
  r2X = tX;
  var dX = bB.m_sweep.c.x + r2X - bA.m_sweep.c.x - r1X;
  var dY = bB.m_sweep.c.y + r2Y - bA.m_sweep.c.y - r1Y;
  this.m_invMassA = bA.m_invMass;
  this.m_invMassB = bB.m_invMass;
  this.m_invIA = bA.m_invI;
  this.m_invIB = bB.m_invI;
  this.m_axis.SetV(b2Math.MulMV(xf1.R, this.m_localXAxis1));
  this.m_a1 = (dX + r1X) * this.m_axis.y - (dY + r1Y) * this.m_axis.x;
  this.m_a2 = r2X * this.m_axis.y - r2Y * this.m_axis.x;
  this.m_motorMass = this.m_invMassA + this.m_invMassB + this.m_invIA * this.m_a1 * this.m_a1 + this.m_invIB * this.m_a2 * this.m_a2;
  this.m_motorMass = this.m_motorMass > Number.MIN_VALUE ? 1 / this.m_motorMass : 0;
  this.m_perp.SetV(b2Math.MulMV(xf1.R, this.m_localYAxis1));
  this.m_s1 = (dX + r1X) * this.m_perp.y - (dY + r1Y) * this.m_perp.x;
  this.m_s2 = r2X * this.m_perp.y - r2Y * this.m_perp.x;
  var m1 = this.m_invMassA;
  var m2 = this.m_invMassB;
  var i1 = this.m_invIA;
  var i2 = this.m_invIB;
  this.m_K.col1.x = m1 + m2 + i1 * this.m_s1 * this.m_s1 + i2 * this.m_s2 * this.m_s2;
  this.m_K.col1.y = i1 * this.m_s1 * this.m_a1 + i2 * this.m_s2 * this.m_a2;
  this.m_K.col2.x = this.m_K.col1.y;
  this.m_K.col2.y = m1 + m2 + i1 * this.m_a1 * this.m_a1 + i2 * this.m_a2 * this.m_a2;
  if(this.m_enableLimit) {
    var jointTransition = this.m_axis.x * dX + this.m_axis.y * dY;
    if(b2Math.Abs(this.m_upperTranslation - this.m_lowerTranslation) < 2 * b2Settings.b2_linearSlop) {
      this.m_limitState = b2Joint.e_equalLimits
    }else {
      if(jointTransition <= this.m_lowerTranslation) {
        if(this.m_limitState != b2Joint.e_atLowerLimit) {
          this.m_limitState = b2Joint.e_atLowerLimit;
          this.m_impulse.y = 0
        }
      }else {
        if(jointTransition >= this.m_upperTranslation) {
          if(this.m_limitState != b2Joint.e_atUpperLimit) {
            this.m_limitState = b2Joint.e_atUpperLimit;
            this.m_impulse.y = 0
          }
        }else {
          this.m_limitState = b2Joint.e_inactiveLimit;
          this.m_impulse.y = 0
        }
      }
    }
  }else {
    this.m_limitState = b2Joint.e_inactiveLimit
  }
  if(this.m_enableMotor == false) {
    this.m_motorImpulse = 0
  }
  if(step.warmStarting) {
    this.m_impulse.x *= step.dtRatio;
    this.m_impulse.y *= step.dtRatio;
    this.m_motorImpulse *= step.dtRatio;
    var PX = this.m_impulse.x * this.m_perp.x + (this.m_motorImpulse + this.m_impulse.y) * this.m_axis.x;
    var PY = this.m_impulse.x * this.m_perp.y + (this.m_motorImpulse + this.m_impulse.y) * this.m_axis.y;
    var L1 = this.m_impulse.x * this.m_s1 + (this.m_motorImpulse + this.m_impulse.y) * this.m_a1;
    var L2 = this.m_impulse.x * this.m_s2 + (this.m_motorImpulse + this.m_impulse.y) * this.m_a2;
    bA.m_linearVelocity.x -= this.m_invMassA * PX;
    bA.m_linearVelocity.y -= this.m_invMassA * PY;
    bA.m_angularVelocity -= this.m_invIA * L1;
    bB.m_linearVelocity.x += this.m_invMassB * PX;
    bB.m_linearVelocity.y += this.m_invMassB * PY;
    bB.m_angularVelocity += this.m_invIB * L2
  }else {
    this.m_impulse.SetZero();
    this.m_motorImpulse = 0
  }
};
b2LineJoint.prototype.SolveVelocityConstraints = function(step) {
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  var v1 = bA.m_linearVelocity;
  var w1 = bA.m_angularVelocity;
  var v2 = bB.m_linearVelocity;
  var w2 = bB.m_angularVelocity;
  var PX;
  var PY;
  var L1;
  var L2;
  if(this.m_enableMotor && this.m_limitState != b2Joint.e_equalLimits) {
    var Cdot = this.m_axis.x * (v2.x - v1.x) + this.m_axis.y * (v2.y - v1.y) + this.m_a2 * w2 - this.m_a1 * w1;
    var impulse = this.m_motorMass * (this.m_motorSpeed - Cdot);
    var oldImpulse = this.m_motorImpulse;
    var maxImpulse = step.dt * this.m_maxMotorForce;
    this.m_motorImpulse = b2Math.Clamp(this.m_motorImpulse + impulse, -maxImpulse, maxImpulse);
    impulse = this.m_motorImpulse - oldImpulse;
    PX = impulse * this.m_axis.x;
    PY = impulse * this.m_axis.y;
    L1 = impulse * this.m_a1;
    L2 = impulse * this.m_a2;
    v1.x -= this.m_invMassA * PX;
    v1.y -= this.m_invMassA * PY;
    w1 -= this.m_invIA * L1;
    v2.x += this.m_invMassB * PX;
    v2.y += this.m_invMassB * PY;
    w2 += this.m_invIB * L2
  }
  var Cdot1 = this.m_perp.x * (v2.x - v1.x) + this.m_perp.y * (v2.y - v1.y) + this.m_s2 * w2 - this.m_s1 * w1;
  if(this.m_enableLimit && this.m_limitState != b2Joint.e_inactiveLimit) {
    var Cdot2 = this.m_axis.x * (v2.x - v1.x) + this.m_axis.y * (v2.y - v1.y) + this.m_a2 * w2 - this.m_a1 * w1;
    var f1 = this.m_impulse.Copy();
    var df = this.m_K.Solve(new b2Vec2, -Cdot1, -Cdot2);
    this.m_impulse.Add(df);
    if(this.m_limitState == b2Joint.e_atLowerLimit) {
      this.m_impulse.y = b2Math.Max(this.m_impulse.y, 0)
    }else {
      if(this.m_limitState == b2Joint.e_atUpperLimit) {
        this.m_impulse.y = b2Math.Min(this.m_impulse.y, 0)
      }
    }
    var b = -Cdot1 - (this.m_impulse.y - f1.y) * this.m_K.col2.x;
    var f2r;
    if(this.m_K.col1.x != 0) {
      f2r = b / this.m_K.col1.x + f1.x
    }else {
      f2r = f1.x
    }
    this.m_impulse.x = f2r;
    df.x = this.m_impulse.x - f1.x;
    df.y = this.m_impulse.y - f1.y;
    PX = df.x * this.m_perp.x + df.y * this.m_axis.x;
    PY = df.x * this.m_perp.y + df.y * this.m_axis.y;
    L1 = df.x * this.m_s1 + df.y * this.m_a1;
    L2 = df.x * this.m_s2 + df.y * this.m_a2;
    v1.x -= this.m_invMassA * PX;
    v1.y -= this.m_invMassA * PY;
    w1 -= this.m_invIA * L1;
    v2.x += this.m_invMassB * PX;
    v2.y += this.m_invMassB * PY;
    w2 += this.m_invIB * L2
  }else {
    var df2;
    if(this.m_K.col1.x != 0) {
      df2 = -Cdot1 / this.m_K.col1.x
    }else {
      df2 = 0
    }
    this.m_impulse.x += df2;
    PX = df2 * this.m_perp.x;
    PY = df2 * this.m_perp.y;
    L1 = df2 * this.m_s1;
    L2 = df2 * this.m_s2;
    v1.x -= this.m_invMassA * PX;
    v1.y -= this.m_invMassA * PY;
    w1 -= this.m_invIA * L1;
    v2.x += this.m_invMassB * PX;
    v2.y += this.m_invMassB * PY;
    w2 += this.m_invIB * L2
  }
  bA.m_linearVelocity.SetV(v1);
  bA.m_angularVelocity = w1;
  bB.m_linearVelocity.SetV(v2);
  bB.m_angularVelocity = w2
};
b2LineJoint.prototype.SolvePositionConstraints = function(baumgarte) {
  var limitC;
  var oldLimitImpulse;
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  var c1 = bA.m_sweep.c;
  var a1 = bA.m_sweep.a;
  var c2 = bB.m_sweep.c;
  var a2 = bB.m_sweep.a;
  var tMat;
  var tX;
  var m1;
  var m2;
  var i1;
  var i2;
  var linearError = 0;
  var angularError = 0;
  var active = false;
  var C2 = 0;
  var R1 = b2Mat22.FromAngle(a1);
  var R2 = b2Mat22.FromAngle(a2);
  tMat = R1;
  var r1X = this.m_localAnchor1.x - this.m_localCenterA.x;
  var r1Y = this.m_localAnchor1.y - this.m_localCenterA.y;
  tX = tMat.col1.x * r1X + tMat.col2.x * r1Y;
  r1Y = tMat.col1.y * r1X + tMat.col2.y * r1Y;
  r1X = tX;
  tMat = R2;
  var r2X = this.m_localAnchor2.x - this.m_localCenterB.x;
  var r2Y = this.m_localAnchor2.y - this.m_localCenterB.y;
  tX = tMat.col1.x * r2X + tMat.col2.x * r2Y;
  r2Y = tMat.col1.y * r2X + tMat.col2.y * r2Y;
  r2X = tX;
  var dX = c2.x + r2X - c1.x - r1X;
  var dY = c2.y + r2Y - c1.y - r1Y;
  if(this.m_enableLimit) {
    this.m_axis = b2Math.MulMV(R1, this.m_localXAxis1);
    this.m_a1 = (dX + r1X) * this.m_axis.y - (dY + r1Y) * this.m_axis.x;
    this.m_a2 = r2X * this.m_axis.y - r2Y * this.m_axis.x;
    var translation = this.m_axis.x * dX + this.m_axis.y * dY;
    if(b2Math.Abs(this.m_upperTranslation - this.m_lowerTranslation) < 2 * b2Settings.b2_linearSlop) {
      C2 = b2Math.Clamp(translation, -b2Settings.b2_maxLinearCorrection, b2Settings.b2_maxLinearCorrection);
      linearError = b2Math.Abs(translation);
      active = true
    }else {
      if(translation <= this.m_lowerTranslation) {
        C2 = b2Math.Clamp(translation - this.m_lowerTranslation + b2Settings.b2_linearSlop, -b2Settings.b2_maxLinearCorrection, 0);
        linearError = this.m_lowerTranslation - translation;
        active = true
      }else {
        if(translation >= this.m_upperTranslation) {
          C2 = b2Math.Clamp(translation - this.m_upperTranslation + b2Settings.b2_linearSlop, 0, b2Settings.b2_maxLinearCorrection);
          linearError = translation - this.m_upperTranslation;
          active = true
        }
      }
    }
  }
  this.m_perp = b2Math.MulMV(R1, this.m_localYAxis1);
  this.m_s1 = (dX + r1X) * this.m_perp.y - (dY + r1Y) * this.m_perp.x;
  this.m_s2 = r2X * this.m_perp.y - r2Y * this.m_perp.x;
  var impulse = new b2Vec2;
  var C1 = this.m_perp.x * dX + this.m_perp.y * dY;
  linearError = b2Math.Max(linearError, b2Math.Abs(C1));
  angularError = 0;
  if(active) {
    m1 = this.m_invMassA;
    m2 = this.m_invMassB;
    i1 = this.m_invIA;
    i2 = this.m_invIB;
    this.m_K.col1.x = m1 + m2 + i1 * this.m_s1 * this.m_s1 + i2 * this.m_s2 * this.m_s2;
    this.m_K.col1.y = i1 * this.m_s1 * this.m_a1 + i2 * this.m_s2 * this.m_a2;
    this.m_K.col2.x = this.m_K.col1.y;
    this.m_K.col2.y = m1 + m2 + i1 * this.m_a1 * this.m_a1 + i2 * this.m_a2 * this.m_a2;
    this.m_K.Solve(impulse, -C1, -C2)
  }else {
    m1 = this.m_invMassA;
    m2 = this.m_invMassB;
    i1 = this.m_invIA;
    i2 = this.m_invIB;
    var k11 = m1 + m2 + i1 * this.m_s1 * this.m_s1 + i2 * this.m_s2 * this.m_s2;
    var impulse1;
    if(k11 != 0) {
      impulse1 = -C1 / k11
    }else {
      impulse1 = 0
    }
    impulse.x = impulse1;
    impulse.y = 0
  }
  var PX = impulse.x * this.m_perp.x + impulse.y * this.m_axis.x;
  var PY = impulse.x * this.m_perp.y + impulse.y * this.m_axis.y;
  var L1 = impulse.x * this.m_s1 + impulse.y * this.m_a1;
  var L2 = impulse.x * this.m_s2 + impulse.y * this.m_a2;
  c1.x -= this.m_invMassA * PX;
  c1.y -= this.m_invMassA * PY;
  a1 -= this.m_invIA * L1;
  c2.x += this.m_invMassB * PX;
  c2.y += this.m_invMassB * PY;
  a2 += this.m_invIB * L2;
  bA.m_sweep.a = a1;
  bB.m_sweep.a = a2;
  bA.SynchronizeTransform();
  bB.SynchronizeTransform();
  return linearError <= b2Settings.b2_linearSlop && angularError <= b2Settings.b2_angularSlop
};
b2LineJoint.prototype.GetAnchorA = function() {
  return this.m_bodyA.GetWorldPoint(this.m_localAnchor1)
};
b2LineJoint.prototype.GetAnchorB = function() {
  return this.m_bodyB.GetWorldPoint(this.m_localAnchor2)
};
b2LineJoint.prototype.GetReactionForce = function(inv_dt) {
  return new b2Vec2(inv_dt * (this.m_impulse.x * this.m_perp.x + (this.m_motorImpulse + this.m_impulse.y) * this.m_axis.x), inv_dt * (this.m_impulse.x * this.m_perp.y + (this.m_motorImpulse + this.m_impulse.y) * this.m_axis.y))
};
b2LineJoint.prototype.GetReactionTorque = function(inv_dt) {
  return inv_dt * this.m_impulse.y
};
b2LineJoint.prototype.GetJointTranslation = function() {
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  var tMat;
  var p1 = bA.GetWorldPoint(this.m_localAnchor1);
  var p2 = bB.GetWorldPoint(this.m_localAnchor2);
  var dX = p2.x - p1.x;
  var dY = p2.y - p1.y;
  var axis = bA.GetWorldVector(this.m_localXAxis1);
  var translation = axis.x * dX + axis.y * dY;
  return translation
};
b2LineJoint.prototype.GetJointSpeed = function() {
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  var tMat;
  tMat = bA.m_xf.R;
  var r1X = this.m_localAnchor1.x - bA.m_sweep.localCenter.x;
  var r1Y = this.m_localAnchor1.y - bA.m_sweep.localCenter.y;
  var tX = tMat.col1.x * r1X + tMat.col2.x * r1Y;
  r1Y = tMat.col1.y * r1X + tMat.col2.y * r1Y;
  r1X = tX;
  tMat = bB.m_xf.R;
  var r2X = this.m_localAnchor2.x - bB.m_sweep.localCenter.x;
  var r2Y = this.m_localAnchor2.y - bB.m_sweep.localCenter.y;
  tX = tMat.col1.x * r2X + tMat.col2.x * r2Y;
  r2Y = tMat.col1.y * r2X + tMat.col2.y * r2Y;
  r2X = tX;
  var p1X = bA.m_sweep.c.x + r1X;
  var p1Y = bA.m_sweep.c.y + r1Y;
  var p2X = bB.m_sweep.c.x + r2X;
  var p2Y = bB.m_sweep.c.y + r2Y;
  var dX = p2X - p1X;
  var dY = p2Y - p1Y;
  var axis = bA.GetWorldVector(this.m_localXAxis1);
  var v1 = bA.m_linearVelocity;
  var v2 = bB.m_linearVelocity;
  var w1 = bA.m_angularVelocity;
  var w2 = bB.m_angularVelocity;
  var speed = dX * -w1 * axis.y + dY * w1 * axis.x + (axis.x * (v2.x + -w2 * r2Y - v1.x - -w1 * r1Y) + axis.y * (v2.y + w2 * r2X - v1.y - w1 * r1X));
  return speed
};
b2LineJoint.prototype.IsLimitEnabled = function() {
  return this.m_enableLimit
};
b2LineJoint.prototype.EnableLimit = function(flag) {
  this.m_bodyA.SetAwake(true);
  this.m_bodyB.SetAwake(true);
  this.m_enableLimit = flag
};
b2LineJoint.prototype.GetLowerLimit = function() {
  return this.m_lowerTranslation
};
b2LineJoint.prototype.GetUpperLimit = function() {
  return this.m_upperTranslation
};
b2LineJoint.prototype.SetLimits = function(lower, upper) {
  this.m_bodyA.SetAwake(true);
  this.m_bodyB.SetAwake(true);
  this.m_lowerTranslation = lower;
  this.m_upperTranslation = upper
};
b2LineJoint.prototype.IsMotorEnabled = function() {
  return this.m_enableMotor
};
b2LineJoint.prototype.EnableMotor = function(flag) {
  this.m_bodyA.SetAwake(true);
  this.m_bodyB.SetAwake(true);
  this.m_enableMotor = flag
};
b2LineJoint.prototype.SetMotorSpeed = function(speed) {
  this.m_bodyA.SetAwake(true);
  this.m_bodyB.SetAwake(true);
  this.m_motorSpeed = speed
};
b2LineJoint.prototype.GetMotorSpeed = function() {
  return this.m_motorSpeed
};
b2LineJoint.prototype.SetMaxMotorForce = function(force) {
  this.m_bodyA.SetAwake(true);
  this.m_bodyB.SetAwake(true);
  this.m_maxMotorForce = force
};
b2LineJoint.prototype.GetMaxMotorForce = function() {
  return this.m_maxMotorForce
};
b2LineJoint.prototype.GetMotorForce = function() {
  return this.m_motorImpulse
};
b2LineJoint.prototype.m_localAnchor1 = new b2Vec2;
b2LineJoint.prototype.m_localAnchor2 = new b2Vec2;
b2LineJoint.prototype.m_localXAxis1 = new b2Vec2;
b2LineJoint.prototype.m_localYAxis1 = new b2Vec2;
b2LineJoint.prototype.m_axis = new b2Vec2;
b2LineJoint.prototype.m_perp = new b2Vec2;
b2LineJoint.prototype.m_s1 = null;
b2LineJoint.prototype.m_s2 = null;
b2LineJoint.prototype.m_a1 = null;
b2LineJoint.prototype.m_a2 = null;
b2LineJoint.prototype.m_K = new b2Mat22;
b2LineJoint.prototype.m_impulse = new b2Vec2;
b2LineJoint.prototype.m_motorMass = null;
b2LineJoint.prototype.m_motorImpulse = null;
b2LineJoint.prototype.m_lowerTranslation = null;
b2LineJoint.prototype.m_upperTranslation = null;
b2LineJoint.prototype.m_maxMotorForce = null;
b2LineJoint.prototype.m_motorSpeed = null;
b2LineJoint.prototype.m_enableLimit = null;
b2LineJoint.prototype.m_enableMotor = null;
b2LineJoint.prototype.m_limitState = 0;var b2ContactSolver = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2ContactSolver.prototype.__constructor = function() {
};
b2ContactSolver.prototype.__varz = function() {
  this.m_step = new b2TimeStep;
  this.m_constraints = new Array
};
b2ContactSolver.s_worldManifold = new b2WorldManifold;
b2ContactSolver.s_psm = new b2PositionSolverManifold;
b2ContactSolver.prototype.Initialize = function(step, contacts, contactCount, allocator) {
  var contact;
  this.m_step.Set(step);
  this.m_allocator = allocator;
  var i = 0;
  var tVec;
  var tMat;
  this.m_constraintCount = contactCount;
  while(this.m_constraints.length < this.m_constraintCount) {
    this.m_constraints[this.m_constraints.length] = new b2ContactConstraint
  }
  for(i = 0;i < contactCount;++i) {
    contact = contacts[i];
    var fixtureA = contact.m_fixtureA;
    var fixtureB = contact.m_fixtureB;
    var shapeA = fixtureA.m_shape;
    var shapeB = fixtureB.m_shape;
    var radiusA = shapeA.m_radius;
    var radiusB = shapeB.m_radius;
    var bodyA = fixtureA.m_body;
    var bodyB = fixtureB.m_body;
    var manifold = contact.GetManifold();
    var friction = b2Settings.b2MixFriction(fixtureA.GetFriction(), fixtureB.GetFriction());
    var restitution = b2Settings.b2MixRestitution(fixtureA.GetRestitution(), fixtureB.GetRestitution());
    var vAX = bodyA.m_linearVelocity.x;
    var vAY = bodyA.m_linearVelocity.y;
    var vBX = bodyB.m_linearVelocity.x;
    var vBY = bodyB.m_linearVelocity.y;
    var wA = bodyA.m_angularVelocity;
    var wB = bodyB.m_angularVelocity;
    b2Settings.b2Assert(manifold.m_pointCount > 0);
    b2ContactSolver.s_worldManifold.Initialize(manifold, bodyA.m_xf, radiusA, bodyB.m_xf, radiusB);
    var normalX = b2ContactSolver.s_worldManifold.m_normal.x;
    var normalY = b2ContactSolver.s_worldManifold.m_normal.y;
    var cc = this.m_constraints[i];
    cc.bodyA = bodyA;
    cc.bodyB = bodyB;
    cc.manifold = manifold;
    cc.normal.x = normalX;
    cc.normal.y = normalY;
    cc.pointCount = manifold.m_pointCount;
    cc.friction = friction;
    cc.restitution = restitution;
    cc.localPlaneNormal.x = manifold.m_localPlaneNormal.x;
    cc.localPlaneNormal.y = manifold.m_localPlaneNormal.y;
    cc.localPoint.x = manifold.m_localPoint.x;
    cc.localPoint.y = manifold.m_localPoint.y;
    cc.radius = radiusA + radiusB;
    cc.type = manifold.m_type;
    for(var k = 0;k < cc.pointCount;++k) {
      var cp = manifold.m_points[k];
      var ccp = cc.points[k];
      ccp.normalImpulse = cp.m_normalImpulse;
      ccp.tangentImpulse = cp.m_tangentImpulse;
      ccp.localPoint.SetV(cp.m_localPoint);
      var rAX = ccp.rA.x = b2ContactSolver.s_worldManifold.m_points[k].x - bodyA.m_sweep.c.x;
      var rAY = ccp.rA.y = b2ContactSolver.s_worldManifold.m_points[k].y - bodyA.m_sweep.c.y;
      var rBX = ccp.rB.x = b2ContactSolver.s_worldManifold.m_points[k].x - bodyB.m_sweep.c.x;
      var rBY = ccp.rB.y = b2ContactSolver.s_worldManifold.m_points[k].y - bodyB.m_sweep.c.y;
      var rnA = rAX * normalY - rAY * normalX;
      var rnB = rBX * normalY - rBY * normalX;
      rnA *= rnA;
      rnB *= rnB;
      var kNormal = bodyA.m_invMass + bodyB.m_invMass + bodyA.m_invI * rnA + bodyB.m_invI * rnB;
      ccp.normalMass = 1 / kNormal;
      var kEqualized = bodyA.m_mass * bodyA.m_invMass + bodyB.m_mass * bodyB.m_invMass;
      kEqualized += bodyA.m_mass * bodyA.m_invI * rnA + bodyB.m_mass * bodyB.m_invI * rnB;
      ccp.equalizedMass = 1 / kEqualized;
      var tangentX = normalY;
      var tangentY = -normalX;
      var rtA = rAX * tangentY - rAY * tangentX;
      var rtB = rBX * tangentY - rBY * tangentX;
      rtA *= rtA;
      rtB *= rtB;
      var kTangent = bodyA.m_invMass + bodyB.m_invMass + bodyA.m_invI * rtA + bodyB.m_invI * rtB;
      ccp.tangentMass = 1 / kTangent;
      ccp.velocityBias = 0;
      var tX = vBX + -wB * rBY - vAX - -wA * rAY;
      var tY = vBY + wB * rBX - vAY - wA * rAX;
      var vRel = cc.normal.x * tX + cc.normal.y * tY;
      if(vRel < -b2Settings.b2_velocityThreshold) {
        ccp.velocityBias += -cc.restitution * vRel
      }
    }
    if(cc.pointCount == 2) {
      var ccp1 = cc.points[0];
      var ccp2 = cc.points[1];
      var invMassA = bodyA.m_invMass;
      var invIA = bodyA.m_invI;
      var invMassB = bodyB.m_invMass;
      var invIB = bodyB.m_invI;
      var rn1A = ccp1.rA.x * normalY - ccp1.rA.y * normalX;
      var rn1B = ccp1.rB.x * normalY - ccp1.rB.y * normalX;
      var rn2A = ccp2.rA.x * normalY - ccp2.rA.y * normalX;
      var rn2B = ccp2.rB.x * normalY - ccp2.rB.y * normalX;
      var k11 = invMassA + invMassB + invIA * rn1A * rn1A + invIB * rn1B * rn1B;
      var k22 = invMassA + invMassB + invIA * rn2A * rn2A + invIB * rn2B * rn2B;
      var k12 = invMassA + invMassB + invIA * rn1A * rn2A + invIB * rn1B * rn2B;
      var k_maxConditionNumber = 100;
      if(k11 * k11 < k_maxConditionNumber * (k11 * k22 - k12 * k12)) {
        cc.K.col1.Set(k11, k12);
        cc.K.col2.Set(k12, k22);
        cc.K.GetInverse(cc.normalMass)
      }else {
        cc.pointCount = 1
      }
    }
  }
};
b2ContactSolver.prototype.InitVelocityConstraints = function(step) {
  var tVec;
  var tVec2;
  var tMat;
  for(var i = 0;i < this.m_constraintCount;++i) {
    var c = this.m_constraints[i];
    var bodyA = c.bodyA;
    var bodyB = c.bodyB;
    var invMassA = bodyA.m_invMass;
    var invIA = bodyA.m_invI;
    var invMassB = bodyB.m_invMass;
    var invIB = bodyB.m_invI;
    var normalX = c.normal.x;
    var normalY = c.normal.y;
    var tangentX = normalY;
    var tangentY = -normalX;
    var tX;
    var j = 0;
    var tCount = 0;
    if(step.warmStarting) {
      tCount = c.pointCount;
      for(j = 0;j < tCount;++j) {
        var ccp = c.points[j];
        ccp.normalImpulse *= step.dtRatio;
        ccp.tangentImpulse *= step.dtRatio;
        var PX = ccp.normalImpulse * normalX + ccp.tangentImpulse * tangentX;
        var PY = ccp.normalImpulse * normalY + ccp.tangentImpulse * tangentY;
        bodyA.m_angularVelocity -= invIA * (ccp.rA.x * PY - ccp.rA.y * PX);
        bodyA.m_linearVelocity.x -= invMassA * PX;
        bodyA.m_linearVelocity.y -= invMassA * PY;
        bodyB.m_angularVelocity += invIB * (ccp.rB.x * PY - ccp.rB.y * PX);
        bodyB.m_linearVelocity.x += invMassB * PX;
        bodyB.m_linearVelocity.y += invMassB * PY
      }
    }else {
      tCount = c.pointCount;
      for(j = 0;j < tCount;++j) {
        var ccp2 = c.points[j];
        ccp2.normalImpulse = 0;
        ccp2.tangentImpulse = 0
      }
    }
  }
};
b2ContactSolver.prototype.SolveVelocityConstraints = function() {
  var j = 0;
  var ccp;
  var rAX;
  var rAY;
  var rBX;
  var rBY;
  var dvX;
  var dvY;
  var vn;
  var vt;
  var lambda;
  var maxFriction;
  var newImpulse;
  var PX;
  var PY;
  var dX;
  var dY;
  var P1X;
  var P1Y;
  var P2X;
  var P2Y;
  var tMat;
  var tVec;
  for(var i = 0;i < this.m_constraintCount;++i) {
    var c = this.m_constraints[i];
    var bodyA = c.bodyA;
    var bodyB = c.bodyB;
    var wA = bodyA.m_angularVelocity;
    var wB = bodyB.m_angularVelocity;
    var vA = bodyA.m_linearVelocity;
    var vB = bodyB.m_linearVelocity;
    var invMassA = bodyA.m_invMass;
    var invIA = bodyA.m_invI;
    var invMassB = bodyB.m_invMass;
    var invIB = bodyB.m_invI;
    var normalX = c.normal.x;
    var normalY = c.normal.y;
    var tangentX = normalY;
    var tangentY = -normalX;
    var friction = c.friction;
    var tX;
    for(j = 0;j < c.pointCount;j++) {
      ccp = c.points[j];
      dvX = vB.x - wB * ccp.rB.y - vA.x + wA * ccp.rA.y;
      dvY = vB.y + wB * ccp.rB.x - vA.y - wA * ccp.rA.x;
      vt = dvX * tangentX + dvY * tangentY;
      lambda = ccp.tangentMass * -vt;
      maxFriction = friction * ccp.normalImpulse;
      newImpulse = b2Math.Clamp(ccp.tangentImpulse + lambda, -maxFriction, maxFriction);
      lambda = newImpulse - ccp.tangentImpulse;
      PX = lambda * tangentX;
      PY = lambda * tangentY;
      vA.x -= invMassA * PX;
      vA.y -= invMassA * PY;
      wA -= invIA * (ccp.rA.x * PY - ccp.rA.y * PX);
      vB.x += invMassB * PX;
      vB.y += invMassB * PY;
      wB += invIB * (ccp.rB.x * PY - ccp.rB.y * PX);
      ccp.tangentImpulse = newImpulse
    }
    var tCount = c.pointCount;
    if(c.pointCount == 1) {
      ccp = c.points[0];
      dvX = vB.x + -wB * ccp.rB.y - vA.x - -wA * ccp.rA.y;
      dvY = vB.y + wB * ccp.rB.x - vA.y - wA * ccp.rA.x;
      vn = dvX * normalX + dvY * normalY;
      lambda = -ccp.normalMass * (vn - ccp.velocityBias);
      newImpulse = ccp.normalImpulse + lambda;
      newImpulse = newImpulse > 0 ? newImpulse : 0;
      lambda = newImpulse - ccp.normalImpulse;
      PX = lambda * normalX;
      PY = lambda * normalY;
      vA.x -= invMassA * PX;
      vA.y -= invMassA * PY;
      wA -= invIA * (ccp.rA.x * PY - ccp.rA.y * PX);
      vB.x += invMassB * PX;
      vB.y += invMassB * PY;
      wB += invIB * (ccp.rB.x * PY - ccp.rB.y * PX);
      ccp.normalImpulse = newImpulse
    }else {
      var cp1 = c.points[0];
      var cp2 = c.points[1];
      var aX = cp1.normalImpulse;
      var aY = cp2.normalImpulse;
      var dv1X = vB.x - wB * cp1.rB.y - vA.x + wA * cp1.rA.y;
      var dv1Y = vB.y + wB * cp1.rB.x - vA.y - wA * cp1.rA.x;
      var dv2X = vB.x - wB * cp2.rB.y - vA.x + wA * cp2.rA.y;
      var dv2Y = vB.y + wB * cp2.rB.x - vA.y - wA * cp2.rA.x;
      var vn1 = dv1X * normalX + dv1Y * normalY;
      var vn2 = dv2X * normalX + dv2Y * normalY;
      var bX = vn1 - cp1.velocityBias;
      var bY = vn2 - cp2.velocityBias;
      tMat = c.K;
      bX -= tMat.col1.x * aX + tMat.col2.x * aY;
      bY -= tMat.col1.y * aX + tMat.col2.y * aY;
      var k_errorTol = 0.0010;
      for(;;) {
        tMat = c.normalMass;
        var xX = -(tMat.col1.x * bX + tMat.col2.x * bY);
        var xY = -(tMat.col1.y * bX + tMat.col2.y * bY);
        if(xX >= 0 && xY >= 0) {
          dX = xX - aX;
          dY = xY - aY;
          P1X = dX * normalX;
          P1Y = dX * normalY;
          P2X = dY * normalX;
          P2Y = dY * normalY;
          vA.x -= invMassA * (P1X + P2X);
          vA.y -= invMassA * (P1Y + P2Y);
          wA -= invIA * (cp1.rA.x * P1Y - cp1.rA.y * P1X + cp2.rA.x * P2Y - cp2.rA.y * P2X);
          vB.x += invMassB * (P1X + P2X);
          vB.y += invMassB * (P1Y + P2Y);
          wB += invIB * (cp1.rB.x * P1Y - cp1.rB.y * P1X + cp2.rB.x * P2Y - cp2.rB.y * P2X);
          cp1.normalImpulse = xX;
          cp2.normalImpulse = xY;
          break
        }
        xX = -cp1.normalMass * bX;
        xY = 0;
        vn1 = 0;
        vn2 = c.K.col1.y * xX + bY;
        if(xX >= 0 && vn2 >= 0) {
          dX = xX - aX;
          dY = xY - aY;
          P1X = dX * normalX;
          P1Y = dX * normalY;
          P2X = dY * normalX;
          P2Y = dY * normalY;
          vA.x -= invMassA * (P1X + P2X);
          vA.y -= invMassA * (P1Y + P2Y);
          wA -= invIA * (cp1.rA.x * P1Y - cp1.rA.y * P1X + cp2.rA.x * P2Y - cp2.rA.y * P2X);
          vB.x += invMassB * (P1X + P2X);
          vB.y += invMassB * (P1Y + P2Y);
          wB += invIB * (cp1.rB.x * P1Y - cp1.rB.y * P1X + cp2.rB.x * P2Y - cp2.rB.y * P2X);
          cp1.normalImpulse = xX;
          cp2.normalImpulse = xY;
          break
        }
        xX = 0;
        xY = -cp2.normalMass * bY;
        vn1 = c.K.col2.x * xY + bX;
        vn2 = 0;
        if(xY >= 0 && vn1 >= 0) {
          dX = xX - aX;
          dY = xY - aY;
          P1X = dX * normalX;
          P1Y = dX * normalY;
          P2X = dY * normalX;
          P2Y = dY * normalY;
          vA.x -= invMassA * (P1X + P2X);
          vA.y -= invMassA * (P1Y + P2Y);
          wA -= invIA * (cp1.rA.x * P1Y - cp1.rA.y * P1X + cp2.rA.x * P2Y - cp2.rA.y * P2X);
          vB.x += invMassB * (P1X + P2X);
          vB.y += invMassB * (P1Y + P2Y);
          wB += invIB * (cp1.rB.x * P1Y - cp1.rB.y * P1X + cp2.rB.x * P2Y - cp2.rB.y * P2X);
          cp1.normalImpulse = xX;
          cp2.normalImpulse = xY;
          break
        }
        xX = 0;
        xY = 0;
        vn1 = bX;
        vn2 = bY;
        if(vn1 >= 0 && vn2 >= 0) {
          dX = xX - aX;
          dY = xY - aY;
          P1X = dX * normalX;
          P1Y = dX * normalY;
          P2X = dY * normalX;
          P2Y = dY * normalY;
          vA.x -= invMassA * (P1X + P2X);
          vA.y -= invMassA * (P1Y + P2Y);
          wA -= invIA * (cp1.rA.x * P1Y - cp1.rA.y * P1X + cp2.rA.x * P2Y - cp2.rA.y * P2X);
          vB.x += invMassB * (P1X + P2X);
          vB.y += invMassB * (P1Y + P2Y);
          wB += invIB * (cp1.rB.x * P1Y - cp1.rB.y * P1X + cp2.rB.x * P2Y - cp2.rB.y * P2X);
          cp1.normalImpulse = xX;
          cp2.normalImpulse = xY;
          break
        }
        break
      }
    }
    bodyA.m_angularVelocity = wA;
    bodyB.m_angularVelocity = wB
  }
};
b2ContactSolver.prototype.FinalizeVelocityConstraints = function() {
  for(var i = 0;i < this.m_constraintCount;++i) {
    var c = this.m_constraints[i];
    var m = c.manifold;
    for(var j = 0;j < c.pointCount;++j) {
      var point1 = m.m_points[j];
      var point2 = c.points[j];
      point1.m_normalImpulse = point2.normalImpulse;
      point1.m_tangentImpulse = point2.tangentImpulse
    }
  }
};
b2ContactSolver.prototype.SolvePositionConstraints = function(baumgarte) {
  var minSeparation = 0;
  for(var i = 0;i < this.m_constraintCount;i++) {
    var c = this.m_constraints[i];
    var bodyA = c.bodyA;
    var bodyB = c.bodyB;
    var invMassA = bodyA.m_mass * bodyA.m_invMass;
    var invIA = bodyA.m_mass * bodyA.m_invI;
    var invMassB = bodyB.m_mass * bodyB.m_invMass;
    var invIB = bodyB.m_mass * bodyB.m_invI;
    b2ContactSolver.s_psm.Initialize(c);
    var normal = b2ContactSolver.s_psm.m_normal;
    for(var j = 0;j < c.pointCount;j++) {
      var ccp = c.points[j];
      var point = b2ContactSolver.s_psm.m_points[j];
      var separation = b2ContactSolver.s_psm.m_separations[j];
      var rAX = point.x - bodyA.m_sweep.c.x;
      var rAY = point.y - bodyA.m_sweep.c.y;
      var rBX = point.x - bodyB.m_sweep.c.x;
      var rBY = point.y - bodyB.m_sweep.c.y;
      minSeparation = minSeparation < separation ? minSeparation : separation;
      var C = b2Math.Clamp(baumgarte * (separation + b2Settings.b2_linearSlop), -b2Settings.b2_maxLinearCorrection, 0);
      var impulse = -ccp.equalizedMass * C;
      var PX = impulse * normal.x;
      var PY = impulse * normal.y;
      bodyA.m_sweep.c.x -= invMassA * PX;
      bodyA.m_sweep.c.y -= invMassA * PY;
      bodyA.m_sweep.a -= invIA * (rAX * PY - rAY * PX);
      bodyA.SynchronizeTransform();
      bodyB.m_sweep.c.x += invMassB * PX;
      bodyB.m_sweep.c.y += invMassB * PY;
      bodyB.m_sweep.a += invIB * (rBX * PY - rBY * PX);
      bodyB.SynchronizeTransform()
    }
  }
  return minSeparation > -1.5 * b2Settings.b2_linearSlop
};
b2ContactSolver.prototype.m_step = new b2TimeStep;
b2ContactSolver.prototype.m_allocator = null;
b2ContactSolver.prototype.m_constraints = new Array;
b2ContactSolver.prototype.m_constraintCount = 0;var b2Simplex = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2Simplex.prototype.__constructor = function() {
  this.m_vertices[0] = this.m_v1;
  this.m_vertices[1] = this.m_v2;
  this.m_vertices[2] = this.m_v3
};
b2Simplex.prototype.__varz = function() {
  this.m_v1 = new b2SimplexVertex;
  this.m_v2 = new b2SimplexVertex;
  this.m_v3 = new b2SimplexVertex;
  this.m_vertices = new Array(3)
};
b2Simplex.prototype.ReadCache = function(cache, proxyA, transformA, proxyB, transformB) {
  b2Settings.b2Assert(0 <= cache.count && cache.count <= 3);
  var wALocal;
  var wBLocal;
  this.m_count = cache.count;
  var vertices = this.m_vertices;
  for(var i = 0;i < this.m_count;i++) {
    var v = vertices[i];
    v.indexA = cache.indexA[i];
    v.indexB = cache.indexB[i];
    wALocal = proxyA.GetVertex(v.indexA);
    wBLocal = proxyB.GetVertex(v.indexB);
    v.wA = b2Math.MulX(transformA, wALocal);
    v.wB = b2Math.MulX(transformB, wBLocal);
    v.w = b2Math.SubtractVV(v.wB, v.wA);
    v.a = 0
  }
  if(this.m_count > 1) {
    var metric1 = cache.metric;
    var metric2 = this.GetMetric();
    if(metric2 < 0.5 * metric1 || 2 * metric1 < metric2 || metric2 < Number.MIN_VALUE) {
      this.m_count = 0
    }
  }
  if(this.m_count == 0) {
    v = vertices[0];
    v.indexA = 0;
    v.indexB = 0;
    wALocal = proxyA.GetVertex(0);
    wBLocal = proxyB.GetVertex(0);
    v.wA = b2Math.MulX(transformA, wALocal);
    v.wB = b2Math.MulX(transformB, wBLocal);
    v.w = b2Math.SubtractVV(v.wB, v.wA);
    this.m_count = 1
  }
};
b2Simplex.prototype.WriteCache = function(cache) {
  cache.metric = this.GetMetric();
  cache.count = parseInt(this.m_count);
  var vertices = this.m_vertices;
  for(var i = 0;i < this.m_count;i++) {
    cache.indexA[i] = parseInt(vertices[i].indexA);
    cache.indexB[i] = parseInt(vertices[i].indexB)
  }
};
b2Simplex.prototype.GetSearchDirection = function() {
  switch(this.m_count) {
    case 1:
      return this.m_v1.w.GetNegative();
    case 2:
      var e12 = b2Math.SubtractVV(this.m_v2.w, this.m_v1.w);
      var sgn = b2Math.CrossVV(e12, this.m_v1.w.GetNegative());
      if(sgn > 0) {
        return b2Math.CrossFV(1, e12)
      }else {
        return b2Math.CrossVF(e12, 1)
      }
    ;
    default:
      b2Settings.b2Assert(false);
      return new b2Vec2
  }
};
b2Simplex.prototype.GetClosestPoint = function() {
  switch(this.m_count) {
    case 0:
      b2Settings.b2Assert(false);
      return new b2Vec2;
    case 1:
      return this.m_v1.w;
    case 2:
      return new b2Vec2(this.m_v1.a * this.m_v1.w.x + this.m_v2.a * this.m_v2.w.x, this.m_v1.a * this.m_v1.w.y + this.m_v2.a * this.m_v2.w.y);
    default:
      b2Settings.b2Assert(false);
      return new b2Vec2
  }
};
b2Simplex.prototype.GetWitnessPoints = function(pA, pB) {
  switch(this.m_count) {
    case 0:
      b2Settings.b2Assert(false);
      break;
    case 1:
      pA.SetV(this.m_v1.wA);
      pB.SetV(this.m_v1.wB);
      break;
    case 2:
      pA.x = this.m_v1.a * this.m_v1.wA.x + this.m_v2.a * this.m_v2.wA.x;
      pA.y = this.m_v1.a * this.m_v1.wA.y + this.m_v2.a * this.m_v2.wA.y;
      pB.x = this.m_v1.a * this.m_v1.wB.x + this.m_v2.a * this.m_v2.wB.x;
      pB.y = this.m_v1.a * this.m_v1.wB.y + this.m_v2.a * this.m_v2.wB.y;
      break;
    case 3:
      pB.x = pA.x = this.m_v1.a * this.m_v1.wA.x + this.m_v2.a * this.m_v2.wA.x + this.m_v3.a * this.m_v3.wA.x;
      pB.y = pA.y = this.m_v1.a * this.m_v1.wA.y + this.m_v2.a * this.m_v2.wA.y + this.m_v3.a * this.m_v3.wA.y;
      break;
    default:
      b2Settings.b2Assert(false);
      break
  }
};
b2Simplex.prototype.GetMetric = function() {
  switch(this.m_count) {
    case 0:
      b2Settings.b2Assert(false);
      return 0;
    case 1:
      return 0;
    case 2:
      return b2Math.SubtractVV(this.m_v1.w, this.m_v2.w).Length();
    case 3:
      return b2Math.CrossVV(b2Math.SubtractVV(this.m_v2.w, this.m_v1.w), b2Math.SubtractVV(this.m_v3.w, this.m_v1.w));
    default:
      b2Settings.b2Assert(false);
      return 0
  }
};
b2Simplex.prototype.Solve2 = function() {
  var w1 = this.m_v1.w;
  var w2 = this.m_v2.w;
  var e12 = b2Math.SubtractVV(w2, w1);
  var d12_2 = -(w1.x * e12.x + w1.y * e12.y);
  if(d12_2 <= 0) {
    this.m_v1.a = 1;
    this.m_count = 1;
    return
  }
  var d12_1 = w2.x * e12.x + w2.y * e12.y;
  if(d12_1 <= 0) {
    this.m_v2.a = 1;
    this.m_count = 1;
    this.m_v1.Set(this.m_v2);
    return
  }
  var inv_d12 = 1 / (d12_1 + d12_2);
  this.m_v1.a = d12_1 * inv_d12;
  this.m_v2.a = d12_2 * inv_d12;
  this.m_count = 2
};
b2Simplex.prototype.Solve3 = function() {
  var w1 = this.m_v1.w;
  var w2 = this.m_v2.w;
  var w3 = this.m_v3.w;
  var e12 = b2Math.SubtractVV(w2, w1);
  var w1e12 = b2Math.Dot(w1, e12);
  var w2e12 = b2Math.Dot(w2, e12);
  var d12_1 = w2e12;
  var d12_2 = -w1e12;
  var e13 = b2Math.SubtractVV(w3, w1);
  var w1e13 = b2Math.Dot(w1, e13);
  var w3e13 = b2Math.Dot(w3, e13);
  var d13_1 = w3e13;
  var d13_2 = -w1e13;
  var e23 = b2Math.SubtractVV(w3, w2);
  var w2e23 = b2Math.Dot(w2, e23);
  var w3e23 = b2Math.Dot(w3, e23);
  var d23_1 = w3e23;
  var d23_2 = -w2e23;
  var n123 = b2Math.CrossVV(e12, e13);
  var d123_1 = n123 * b2Math.CrossVV(w2, w3);
  var d123_2 = n123 * b2Math.CrossVV(w3, w1);
  var d123_3 = n123 * b2Math.CrossVV(w1, w2);
  if(d12_2 <= 0 && d13_2 <= 0) {
    this.m_v1.a = 1;
    this.m_count = 1;
    return
  }
  if(d12_1 > 0 && d12_2 > 0 && d123_3 <= 0) {
    var inv_d12 = 1 / (d12_1 + d12_2);
    this.m_v1.a = d12_1 * inv_d12;
    this.m_v2.a = d12_2 * inv_d12;
    this.m_count = 2;
    return
  }
  if(d13_1 > 0 && d13_2 > 0 && d123_2 <= 0) {
    var inv_d13 = 1 / (d13_1 + d13_2);
    this.m_v1.a = d13_1 * inv_d13;
    this.m_v3.a = d13_2 * inv_d13;
    this.m_count = 2;
    this.m_v2.Set(this.m_v3);
    return
  }
  if(d12_1 <= 0 && d23_2 <= 0) {
    this.m_v2.a = 1;
    this.m_count = 1;
    this.m_v1.Set(this.m_v2);
    return
  }
  if(d13_1 <= 0 && d23_1 <= 0) {
    this.m_v3.a = 1;
    this.m_count = 1;
    this.m_v1.Set(this.m_v3);
    return
  }
  if(d23_1 > 0 && d23_2 > 0 && d123_1 <= 0) {
    var inv_d23 = 1 / (d23_1 + d23_2);
    this.m_v2.a = d23_1 * inv_d23;
    this.m_v3.a = d23_2 * inv_d23;
    this.m_count = 2;
    this.m_v1.Set(this.m_v3);
    return
  }
  var inv_d123 = 1 / (d123_1 + d123_2 + d123_3);
  this.m_v1.a = d123_1 * inv_d123;
  this.m_v2.a = d123_2 * inv_d123;
  this.m_v3.a = d123_3 * inv_d123;
  this.m_count = 3
};
b2Simplex.prototype.m_v1 = new b2SimplexVertex;
b2Simplex.prototype.m_v2 = new b2SimplexVertex;
b2Simplex.prototype.m_v3 = new b2SimplexVertex;
b2Simplex.prototype.m_vertices = new Array(3);
b2Simplex.prototype.m_count = 0;var b2WeldJoint = function() {
  b2Joint.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2WeldJoint.prototype, b2Joint.prototype);
b2WeldJoint.prototype._super = b2Joint.prototype;
b2WeldJoint.prototype.__constructor = function(def) {
  this._super.__constructor.apply(this, [def]);
  this.m_localAnchorA.SetV(def.localAnchorA);
  this.m_localAnchorB.SetV(def.localAnchorB);
  this.m_referenceAngle = def.referenceAngle;
  this.m_impulse.SetZero();
  this.m_mass = new b2Mat33
};
b2WeldJoint.prototype.__varz = function() {
  this.m_localAnchorA = new b2Vec2;
  this.m_localAnchorB = new b2Vec2;
  this.m_impulse = new b2Vec3;
  this.m_mass = new b2Mat33
};
b2WeldJoint.prototype.InitVelocityConstraints = function(step) {
  var tMat;
  var tX;
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  tMat = bA.m_xf.R;
  var rAX = this.m_localAnchorA.x - bA.m_sweep.localCenter.x;
  var rAY = this.m_localAnchorA.y - bA.m_sweep.localCenter.y;
  tX = tMat.col1.x * rAX + tMat.col2.x * rAY;
  rAY = tMat.col1.y * rAX + tMat.col2.y * rAY;
  rAX = tX;
  tMat = bB.m_xf.R;
  var rBX = this.m_localAnchorB.x - bB.m_sweep.localCenter.x;
  var rBY = this.m_localAnchorB.y - bB.m_sweep.localCenter.y;
  tX = tMat.col1.x * rBX + tMat.col2.x * rBY;
  rBY = tMat.col1.y * rBX + tMat.col2.y * rBY;
  rBX = tX;
  var mA = bA.m_invMass;
  var mB = bB.m_invMass;
  var iA = bA.m_invI;
  var iB = bB.m_invI;
  this.m_mass.col1.x = mA + mB + rAY * rAY * iA + rBY * rBY * iB;
  this.m_mass.col2.x = -rAY * rAX * iA - rBY * rBX * iB;
  this.m_mass.col3.x = -rAY * iA - rBY * iB;
  this.m_mass.col1.y = this.m_mass.col2.x;
  this.m_mass.col2.y = mA + mB + rAX * rAX * iA + rBX * rBX * iB;
  this.m_mass.col3.y = rAX * iA + rBX * iB;
  this.m_mass.col1.z = this.m_mass.col3.x;
  this.m_mass.col2.z = this.m_mass.col3.y;
  this.m_mass.col3.z = iA + iB;
  if(step.warmStarting) {
    this.m_impulse.x *= step.dtRatio;
    this.m_impulse.y *= step.dtRatio;
    this.m_impulse.z *= step.dtRatio;
    bA.m_linearVelocity.x -= mA * this.m_impulse.x;
    bA.m_linearVelocity.y -= mA * this.m_impulse.y;
    bA.m_angularVelocity -= iA * (rAX * this.m_impulse.y - rAY * this.m_impulse.x + this.m_impulse.z);
    bB.m_linearVelocity.x += mB * this.m_impulse.x;
    bB.m_linearVelocity.y += mB * this.m_impulse.y;
    bB.m_angularVelocity += iB * (rBX * this.m_impulse.y - rBY * this.m_impulse.x + this.m_impulse.z)
  }else {
    this.m_impulse.SetZero()
  }
};
b2WeldJoint.prototype.SolveVelocityConstraints = function(step) {
  var tMat;
  var tX;
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  var vA = bA.m_linearVelocity;
  var wA = bA.m_angularVelocity;
  var vB = bB.m_linearVelocity;
  var wB = bB.m_angularVelocity;
  var mA = bA.m_invMass;
  var mB = bB.m_invMass;
  var iA = bA.m_invI;
  var iB = bB.m_invI;
  tMat = bA.m_xf.R;
  var rAX = this.m_localAnchorA.x - bA.m_sweep.localCenter.x;
  var rAY = this.m_localAnchorA.y - bA.m_sweep.localCenter.y;
  tX = tMat.col1.x * rAX + tMat.col2.x * rAY;
  rAY = tMat.col1.y * rAX + tMat.col2.y * rAY;
  rAX = tX;
  tMat = bB.m_xf.R;
  var rBX = this.m_localAnchorB.x - bB.m_sweep.localCenter.x;
  var rBY = this.m_localAnchorB.y - bB.m_sweep.localCenter.y;
  tX = tMat.col1.x * rBX + tMat.col2.x * rBY;
  rBY = tMat.col1.y * rBX + tMat.col2.y * rBY;
  rBX = tX;
  var Cdot1X = vB.x - wB * rBY - vA.x + wA * rAY;
  var Cdot1Y = vB.y + wB * rBX - vA.y - wA * rAX;
  var Cdot2 = wB - wA;
  var impulse = new b2Vec3;
  this.m_mass.Solve33(impulse, -Cdot1X, -Cdot1Y, -Cdot2);
  this.m_impulse.Add(impulse);
  vA.x -= mA * impulse.x;
  vA.y -= mA * impulse.y;
  wA -= iA * (rAX * impulse.y - rAY * impulse.x + impulse.z);
  vB.x += mB * impulse.x;
  vB.y += mB * impulse.y;
  wB += iB * (rBX * impulse.y - rBY * impulse.x + impulse.z);
  bA.m_angularVelocity = wA;
  bB.m_angularVelocity = wB
};
b2WeldJoint.prototype.SolvePositionConstraints = function(baumgarte) {
  var tMat;
  var tX;
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  tMat = bA.m_xf.R;
  var rAX = this.m_localAnchorA.x - bA.m_sweep.localCenter.x;
  var rAY = this.m_localAnchorA.y - bA.m_sweep.localCenter.y;
  tX = tMat.col1.x * rAX + tMat.col2.x * rAY;
  rAY = tMat.col1.y * rAX + tMat.col2.y * rAY;
  rAX = tX;
  tMat = bB.m_xf.R;
  var rBX = this.m_localAnchorB.x - bB.m_sweep.localCenter.x;
  var rBY = this.m_localAnchorB.y - bB.m_sweep.localCenter.y;
  tX = tMat.col1.x * rBX + tMat.col2.x * rBY;
  rBY = tMat.col1.y * rBX + tMat.col2.y * rBY;
  rBX = tX;
  var mA = bA.m_invMass;
  var mB = bB.m_invMass;
  var iA = bA.m_invI;
  var iB = bB.m_invI;
  var C1X = bB.m_sweep.c.x + rBX - bA.m_sweep.c.x - rAX;
  var C1Y = bB.m_sweep.c.y + rBY - bA.m_sweep.c.y - rAY;
  var C2 = bB.m_sweep.a - bA.m_sweep.a - this.m_referenceAngle;
  var k_allowedStretch = 10 * b2Settings.b2_linearSlop;
  var positionError = Math.sqrt(C1X * C1X + C1Y * C1Y);
  var angularError = b2Math.Abs(C2);
  if(positionError > k_allowedStretch) {
    iA *= 1;
    iB *= 1
  }
  this.m_mass.col1.x = mA + mB + rAY * rAY * iA + rBY * rBY * iB;
  this.m_mass.col2.x = -rAY * rAX * iA - rBY * rBX * iB;
  this.m_mass.col3.x = -rAY * iA - rBY * iB;
  this.m_mass.col1.y = this.m_mass.col2.x;
  this.m_mass.col2.y = mA + mB + rAX * rAX * iA + rBX * rBX * iB;
  this.m_mass.col3.y = rAX * iA + rBX * iB;
  this.m_mass.col1.z = this.m_mass.col3.x;
  this.m_mass.col2.z = this.m_mass.col3.y;
  this.m_mass.col3.z = iA + iB;
  var impulse = new b2Vec3;
  this.m_mass.Solve33(impulse, -C1X, -C1Y, -C2);
  bA.m_sweep.c.x -= mA * impulse.x;
  bA.m_sweep.c.y -= mA * impulse.y;
  bA.m_sweep.a -= iA * (rAX * impulse.y - rAY * impulse.x + impulse.z);
  bB.m_sweep.c.x += mB * impulse.x;
  bB.m_sweep.c.y += mB * impulse.y;
  bB.m_sweep.a += iB * (rBX * impulse.y - rBY * impulse.x + impulse.z);
  bA.SynchronizeTransform();
  bB.SynchronizeTransform();
  return positionError <= b2Settings.b2_linearSlop && angularError <= b2Settings.b2_angularSlop
};
b2WeldJoint.prototype.GetAnchorA = function() {
  return this.m_bodyA.GetWorldPoint(this.m_localAnchorA)
};
b2WeldJoint.prototype.GetAnchorB = function() {
  return this.m_bodyB.GetWorldPoint(this.m_localAnchorB)
};
b2WeldJoint.prototype.GetReactionForce = function(inv_dt) {
  return new b2Vec2(inv_dt * this.m_impulse.x, inv_dt * this.m_impulse.y)
};
b2WeldJoint.prototype.GetReactionTorque = function(inv_dt) {
  return inv_dt * this.m_impulse.z
};
b2WeldJoint.prototype.m_localAnchorA = new b2Vec2;
b2WeldJoint.prototype.m_localAnchorB = new b2Vec2;
b2WeldJoint.prototype.m_referenceAngle = null;
b2WeldJoint.prototype.m_impulse = new b2Vec3;
b2WeldJoint.prototype.m_mass = new b2Mat33;var b2Math = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2Math.prototype.__constructor = function() {
};
b2Math.prototype.__varz = function() {
};
b2Math.IsValid = function(x) {
  return isFinite(x)
};
b2Math.Dot = function(a, b) {
  return a.x * b.x + a.y * b.y
};
b2Math.CrossVV = function(a, b) {
  return a.x * b.y - a.y * b.x
};
b2Math.CrossVF = function(a, s) {
  var v = new b2Vec2(s * a.y, -s * a.x);
  return v
};
b2Math.CrossFV = function(s, a) {
  var v = new b2Vec2(-s * a.y, s * a.x);
  return v
};
b2Math.MulMV = function(A, v) {
  var u = new b2Vec2(A.col1.x * v.x + A.col2.x * v.y, A.col1.y * v.x + A.col2.y * v.y);
  return u
};
b2Math.MulTMV = function(A, v) {
  var u = new b2Vec2(b2Math.Dot(v, A.col1), b2Math.Dot(v, A.col2));
  return u
};
b2Math.MulX = function(T, v) {
  var a = b2Math.MulMV(T.R, v);
  a.x += T.position.x;
  a.y += T.position.y;
  return a
};
b2Math.MulXT = function(T, v) {
  var a = b2Math.SubtractVV(v, T.position);
  var tX = a.x * T.R.col1.x + a.y * T.R.col1.y;
  a.y = a.x * T.R.col2.x + a.y * T.R.col2.y;
  a.x = tX;
  return a
};
b2Math.AddVV = function(a, b) {
  var v = new b2Vec2(a.x + b.x, a.y + b.y);
  return v
};
b2Math.SubtractVV = function(a, b) {
  var v = new b2Vec2(a.x - b.x, a.y - b.y);
  return v
};
b2Math.Distance = function(a, b) {
  var cX = a.x - b.x;
  var cY = a.y - b.y;
  return Math.sqrt(cX * cX + cY * cY)
};
b2Math.DistanceSquared = function(a, b) {
  var cX = a.x - b.x;
  var cY = a.y - b.y;
  return cX * cX + cY * cY
};
b2Math.MulFV = function(s, a) {
  var v = new b2Vec2(s * a.x, s * a.y);
  return v
};
b2Math.AddMM = function(A, B) {
  var C = b2Mat22.FromVV(b2Math.AddVV(A.col1, B.col1), b2Math.AddVV(A.col2, B.col2));
  return C
};
b2Math.MulMM = function(A, B) {
  var C = b2Mat22.FromVV(b2Math.MulMV(A, B.col1), b2Math.MulMV(A, B.col2));
  return C
};
b2Math.MulTMM = function(A, B) {
  var c1 = new b2Vec2(b2Math.Dot(A.col1, B.col1), b2Math.Dot(A.col2, B.col1));
  var c2 = new b2Vec2(b2Math.Dot(A.col1, B.col2), b2Math.Dot(A.col2, B.col2));
  var C = b2Mat22.FromVV(c1, c2);
  return C
};
b2Math.Abs = function(a) {
  return a > 0 ? a : -a
};
b2Math.AbsV = function(a) {
  var b = new b2Vec2(b2Math.Abs(a.x), b2Math.Abs(a.y));
  return b
};
b2Math.AbsM = function(A) {
  var B = b2Mat22.FromVV(b2Math.AbsV(A.col1), b2Math.AbsV(A.col2));
  return B
};
b2Math.Min = function(a, b) {
  return a < b ? a : b
};
b2Math.MinV = function(a, b) {
  var c = new b2Vec2(b2Math.Min(a.x, b.x), b2Math.Min(a.y, b.y));
  return c
};
b2Math.Max = function(a, b) {
  return a > b ? a : b
};
b2Math.MaxV = function(a, b) {
  var c = new b2Vec2(b2Math.Max(a.x, b.x), b2Math.Max(a.y, b.y));
  return c
};
b2Math.Clamp = function(a, low, high) {
  return a < low ? low : a > high ? high : a
};
b2Math.ClampV = function(a, low, high) {
  return b2Math.MaxV(low, b2Math.MinV(a, high))
};
b2Math.Swap = function(a, b) {
  var tmp = a[0];
  a[0] = b[0];
  b[0] = tmp
};
b2Math.Random = function() {
  return Math.random() * 2 - 1
};
b2Math.RandomRange = function(lo, hi) {
  var r = Math.random();
  r = (hi - lo) * r + lo;
  return r
};
b2Math.NextPowerOfTwo = function(x) {
  x |= x >> 1 & 2147483647;
  x |= x >> 2 & 1073741823;
  x |= x >> 4 & 268435455;
  x |= x >> 8 & 16777215;
  x |= x >> 16 & 65535;
  return x + 1
};
b2Math.IsPowerOfTwo = function(x) {
  var result = x > 0 && (x & x - 1) == 0;
  return result
};
b2Math.b2Vec2_zero = new b2Vec2(0, 0);
b2Math.b2Mat22_identity = b2Mat22.FromVV(new b2Vec2(1, 0), new b2Vec2(0, 1));
b2Math.b2Transform_identity = new b2Transform(b2Math.b2Vec2_zero, b2Math.b2Mat22_identity);var b2PulleyJoint = function() {
  b2Joint.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2PulleyJoint.prototype, b2Joint.prototype);
b2PulleyJoint.prototype._super = b2Joint.prototype;
b2PulleyJoint.prototype.__constructor = function(def) {
  this._super.__constructor.apply(this, [def]);
  var tMat;
  var tX;
  var tY;
  this.m_ground = this.m_bodyA.m_world.m_groundBody;
  this.m_groundAnchor1.x = def.groundAnchorA.x - this.m_ground.m_xf.position.x;
  this.m_groundAnchor1.y = def.groundAnchorA.y - this.m_ground.m_xf.position.y;
  this.m_groundAnchor2.x = def.groundAnchorB.x - this.m_ground.m_xf.position.x;
  this.m_groundAnchor2.y = def.groundAnchorB.y - this.m_ground.m_xf.position.y;
  this.m_localAnchor1.SetV(def.localAnchorA);
  this.m_localAnchor2.SetV(def.localAnchorB);
  this.m_ratio = def.ratio;
  this.m_constant = def.lengthA + this.m_ratio * def.lengthB;
  this.m_maxLength1 = b2Math.Min(def.maxLengthA, this.m_constant - this.m_ratio * b2PulleyJoint.b2_minPulleyLength);
  this.m_maxLength2 = b2Math.Min(def.maxLengthB, (this.m_constant - b2PulleyJoint.b2_minPulleyLength) / this.m_ratio);
  this.m_impulse = 0;
  this.m_limitImpulse1 = 0;
  this.m_limitImpulse2 = 0
};
b2PulleyJoint.prototype.__varz = function() {
  this.m_groundAnchor1 = new b2Vec2;
  this.m_groundAnchor2 = new b2Vec2;
  this.m_localAnchor1 = new b2Vec2;
  this.m_localAnchor2 = new b2Vec2;
  this.m_u1 = new b2Vec2;
  this.m_u2 = new b2Vec2
};
b2PulleyJoint.b2_minPulleyLength = 2;
b2PulleyJoint.prototype.InitVelocityConstraints = function(step) {
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  var tMat;
  tMat = bA.m_xf.R;
  var r1X = this.m_localAnchor1.x - bA.m_sweep.localCenter.x;
  var r1Y = this.m_localAnchor1.y - bA.m_sweep.localCenter.y;
  var tX = tMat.col1.x * r1X + tMat.col2.x * r1Y;
  r1Y = tMat.col1.y * r1X + tMat.col2.y * r1Y;
  r1X = tX;
  tMat = bB.m_xf.R;
  var r2X = this.m_localAnchor2.x - bB.m_sweep.localCenter.x;
  var r2Y = this.m_localAnchor2.y - bB.m_sweep.localCenter.y;
  tX = tMat.col1.x * r2X + tMat.col2.x * r2Y;
  r2Y = tMat.col1.y * r2X + tMat.col2.y * r2Y;
  r2X = tX;
  var p1X = bA.m_sweep.c.x + r1X;
  var p1Y = bA.m_sweep.c.y + r1Y;
  var p2X = bB.m_sweep.c.x + r2X;
  var p2Y = bB.m_sweep.c.y + r2Y;
  var s1X = this.m_ground.m_xf.position.x + this.m_groundAnchor1.x;
  var s1Y = this.m_ground.m_xf.position.y + this.m_groundAnchor1.y;
  var s2X = this.m_ground.m_xf.position.x + this.m_groundAnchor2.x;
  var s2Y = this.m_ground.m_xf.position.y + this.m_groundAnchor2.y;
  this.m_u1.Set(p1X - s1X, p1Y - s1Y);
  this.m_u2.Set(p2X - s2X, p2Y - s2Y);
  var length1 = this.m_u1.Length();
  var length2 = this.m_u2.Length();
  if(length1 > b2Settings.b2_linearSlop) {
    this.m_u1.Multiply(1 / length1)
  }else {
    this.m_u1.SetZero()
  }
  if(length2 > b2Settings.b2_linearSlop) {
    this.m_u2.Multiply(1 / length2)
  }else {
    this.m_u2.SetZero()
  }
  var C = this.m_constant - length1 - this.m_ratio * length2;
  if(C > 0) {
    this.m_state = b2Joint.e_inactiveLimit;
    this.m_impulse = 0
  }else {
    this.m_state = b2Joint.e_atUpperLimit
  }
  if(length1 < this.m_maxLength1) {
    this.m_limitState1 = b2Joint.e_inactiveLimit;
    this.m_limitImpulse1 = 0
  }else {
    this.m_limitState1 = b2Joint.e_atUpperLimit
  }
  if(length2 < this.m_maxLength2) {
    this.m_limitState2 = b2Joint.e_inactiveLimit;
    this.m_limitImpulse2 = 0
  }else {
    this.m_limitState2 = b2Joint.e_atUpperLimit
  }
  var cr1u1 = r1X * this.m_u1.y - r1Y * this.m_u1.x;
  var cr2u2 = r2X * this.m_u2.y - r2Y * this.m_u2.x;
  this.m_limitMass1 = bA.m_invMass + bA.m_invI * cr1u1 * cr1u1;
  this.m_limitMass2 = bB.m_invMass + bB.m_invI * cr2u2 * cr2u2;
  this.m_pulleyMass = this.m_limitMass1 + this.m_ratio * this.m_ratio * this.m_limitMass2;
  this.m_limitMass1 = 1 / this.m_limitMass1;
  this.m_limitMass2 = 1 / this.m_limitMass2;
  this.m_pulleyMass = 1 / this.m_pulleyMass;
  if(step.warmStarting) {
    this.m_impulse *= step.dtRatio;
    this.m_limitImpulse1 *= step.dtRatio;
    this.m_limitImpulse2 *= step.dtRatio;
    var P1X = (-this.m_impulse - this.m_limitImpulse1) * this.m_u1.x;
    var P1Y = (-this.m_impulse - this.m_limitImpulse1) * this.m_u1.y;
    var P2X = (-this.m_ratio * this.m_impulse - this.m_limitImpulse2) * this.m_u2.x;
    var P2Y = (-this.m_ratio * this.m_impulse - this.m_limitImpulse2) * this.m_u2.y;
    bA.m_linearVelocity.x += bA.m_invMass * P1X;
    bA.m_linearVelocity.y += bA.m_invMass * P1Y;
    bA.m_angularVelocity += bA.m_invI * (r1X * P1Y - r1Y * P1X);
    bB.m_linearVelocity.x += bB.m_invMass * P2X;
    bB.m_linearVelocity.y += bB.m_invMass * P2Y;
    bB.m_angularVelocity += bB.m_invI * (r2X * P2Y - r2Y * P2X)
  }else {
    this.m_impulse = 0;
    this.m_limitImpulse1 = 0;
    this.m_limitImpulse2 = 0
  }
};
b2PulleyJoint.prototype.SolveVelocityConstraints = function(step) {
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  var tMat;
  tMat = bA.m_xf.R;
  var r1X = this.m_localAnchor1.x - bA.m_sweep.localCenter.x;
  var r1Y = this.m_localAnchor1.y - bA.m_sweep.localCenter.y;
  var tX = tMat.col1.x * r1X + tMat.col2.x * r1Y;
  r1Y = tMat.col1.y * r1X + tMat.col2.y * r1Y;
  r1X = tX;
  tMat = bB.m_xf.R;
  var r2X = this.m_localAnchor2.x - bB.m_sweep.localCenter.x;
  var r2Y = this.m_localAnchor2.y - bB.m_sweep.localCenter.y;
  tX = tMat.col1.x * r2X + tMat.col2.x * r2Y;
  r2Y = tMat.col1.y * r2X + tMat.col2.y * r2Y;
  r2X = tX;
  var v1X;
  var v1Y;
  var v2X;
  var v2Y;
  var P1X;
  var P1Y;
  var P2X;
  var P2Y;
  var Cdot;
  var impulse;
  var oldImpulse;
  if(this.m_state == b2Joint.e_atUpperLimit) {
    v1X = bA.m_linearVelocity.x + -bA.m_angularVelocity * r1Y;
    v1Y = bA.m_linearVelocity.y + bA.m_angularVelocity * r1X;
    v2X = bB.m_linearVelocity.x + -bB.m_angularVelocity * r2Y;
    v2Y = bB.m_linearVelocity.y + bB.m_angularVelocity * r2X;
    Cdot = -(this.m_u1.x * v1X + this.m_u1.y * v1Y) - this.m_ratio * (this.m_u2.x * v2X + this.m_u2.y * v2Y);
    impulse = this.m_pulleyMass * -Cdot;
    oldImpulse = this.m_impulse;
    this.m_impulse = b2Math.Max(0, this.m_impulse + impulse);
    impulse = this.m_impulse - oldImpulse;
    P1X = -impulse * this.m_u1.x;
    P1Y = -impulse * this.m_u1.y;
    P2X = -this.m_ratio * impulse * this.m_u2.x;
    P2Y = -this.m_ratio * impulse * this.m_u2.y;
    bA.m_linearVelocity.x += bA.m_invMass * P1X;
    bA.m_linearVelocity.y += bA.m_invMass * P1Y;
    bA.m_angularVelocity += bA.m_invI * (r1X * P1Y - r1Y * P1X);
    bB.m_linearVelocity.x += bB.m_invMass * P2X;
    bB.m_linearVelocity.y += bB.m_invMass * P2Y;
    bB.m_angularVelocity += bB.m_invI * (r2X * P2Y - r2Y * P2X)
  }
  if(this.m_limitState1 == b2Joint.e_atUpperLimit) {
    v1X = bA.m_linearVelocity.x + -bA.m_angularVelocity * r1Y;
    v1Y = bA.m_linearVelocity.y + bA.m_angularVelocity * r1X;
    Cdot = -(this.m_u1.x * v1X + this.m_u1.y * v1Y);
    impulse = -this.m_limitMass1 * Cdot;
    oldImpulse = this.m_limitImpulse1;
    this.m_limitImpulse1 = b2Math.Max(0, this.m_limitImpulse1 + impulse);
    impulse = this.m_limitImpulse1 - oldImpulse;
    P1X = -impulse * this.m_u1.x;
    P1Y = -impulse * this.m_u1.y;
    bA.m_linearVelocity.x += bA.m_invMass * P1X;
    bA.m_linearVelocity.y += bA.m_invMass * P1Y;
    bA.m_angularVelocity += bA.m_invI * (r1X * P1Y - r1Y * P1X)
  }
  if(this.m_limitState2 == b2Joint.e_atUpperLimit) {
    v2X = bB.m_linearVelocity.x + -bB.m_angularVelocity * r2Y;
    v2Y = bB.m_linearVelocity.y + bB.m_angularVelocity * r2X;
    Cdot = -(this.m_u2.x * v2X + this.m_u2.y * v2Y);
    impulse = -this.m_limitMass2 * Cdot;
    oldImpulse = this.m_limitImpulse2;
    this.m_limitImpulse2 = b2Math.Max(0, this.m_limitImpulse2 + impulse);
    impulse = this.m_limitImpulse2 - oldImpulse;
    P2X = -impulse * this.m_u2.x;
    P2Y = -impulse * this.m_u2.y;
    bB.m_linearVelocity.x += bB.m_invMass * P2X;
    bB.m_linearVelocity.y += bB.m_invMass * P2Y;
    bB.m_angularVelocity += bB.m_invI * (r2X * P2Y - r2Y * P2X)
  }
};
b2PulleyJoint.prototype.SolvePositionConstraints = function(baumgarte) {
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  var tMat;
  var s1X = this.m_ground.m_xf.position.x + this.m_groundAnchor1.x;
  var s1Y = this.m_ground.m_xf.position.y + this.m_groundAnchor1.y;
  var s2X = this.m_ground.m_xf.position.x + this.m_groundAnchor2.x;
  var s2Y = this.m_ground.m_xf.position.y + this.m_groundAnchor2.y;
  var r1X;
  var r1Y;
  var r2X;
  var r2Y;
  var p1X;
  var p1Y;
  var p2X;
  var p2Y;
  var length1;
  var length2;
  var C;
  var impulse;
  var oldImpulse;
  var oldLimitPositionImpulse;
  var tX;
  var linearError = 0;
  if(this.m_state == b2Joint.e_atUpperLimit) {
    tMat = bA.m_xf.R;
    r1X = this.m_localAnchor1.x - bA.m_sweep.localCenter.x;
    r1Y = this.m_localAnchor1.y - bA.m_sweep.localCenter.y;
    tX = tMat.col1.x * r1X + tMat.col2.x * r1Y;
    r1Y = tMat.col1.y * r1X + tMat.col2.y * r1Y;
    r1X = tX;
    tMat = bB.m_xf.R;
    r2X = this.m_localAnchor2.x - bB.m_sweep.localCenter.x;
    r2Y = this.m_localAnchor2.y - bB.m_sweep.localCenter.y;
    tX = tMat.col1.x * r2X + tMat.col2.x * r2Y;
    r2Y = tMat.col1.y * r2X + tMat.col2.y * r2Y;
    r2X = tX;
    p1X = bA.m_sweep.c.x + r1X;
    p1Y = bA.m_sweep.c.y + r1Y;
    p2X = bB.m_sweep.c.x + r2X;
    p2Y = bB.m_sweep.c.y + r2Y;
    this.m_u1.Set(p1X - s1X, p1Y - s1Y);
    this.m_u2.Set(p2X - s2X, p2Y - s2Y);
    length1 = this.m_u1.Length();
    length2 = this.m_u2.Length();
    if(length1 > b2Settings.b2_linearSlop) {
      this.m_u1.Multiply(1 / length1)
    }else {
      this.m_u1.SetZero()
    }
    if(length2 > b2Settings.b2_linearSlop) {
      this.m_u2.Multiply(1 / length2)
    }else {
      this.m_u2.SetZero()
    }
    C = this.m_constant - length1 - this.m_ratio * length2;
    linearError = b2Math.Max(linearError, -C);
    C = b2Math.Clamp(C + b2Settings.b2_linearSlop, -b2Settings.b2_maxLinearCorrection, 0);
    impulse = -this.m_pulleyMass * C;
    p1X = -impulse * this.m_u1.x;
    p1Y = -impulse * this.m_u1.y;
    p2X = -this.m_ratio * impulse * this.m_u2.x;
    p2Y = -this.m_ratio * impulse * this.m_u2.y;
    bA.m_sweep.c.x += bA.m_invMass * p1X;
    bA.m_sweep.c.y += bA.m_invMass * p1Y;
    bA.m_sweep.a += bA.m_invI * (r1X * p1Y - r1Y * p1X);
    bB.m_sweep.c.x += bB.m_invMass * p2X;
    bB.m_sweep.c.y += bB.m_invMass * p2Y;
    bB.m_sweep.a += bB.m_invI * (r2X * p2Y - r2Y * p2X);
    bA.SynchronizeTransform();
    bB.SynchronizeTransform()
  }
  if(this.m_limitState1 == b2Joint.e_atUpperLimit) {
    tMat = bA.m_xf.R;
    r1X = this.m_localAnchor1.x - bA.m_sweep.localCenter.x;
    r1Y = this.m_localAnchor1.y - bA.m_sweep.localCenter.y;
    tX = tMat.col1.x * r1X + tMat.col2.x * r1Y;
    r1Y = tMat.col1.y * r1X + tMat.col2.y * r1Y;
    r1X = tX;
    p1X = bA.m_sweep.c.x + r1X;
    p1Y = bA.m_sweep.c.y + r1Y;
    this.m_u1.Set(p1X - s1X, p1Y - s1Y);
    length1 = this.m_u1.Length();
    if(length1 > b2Settings.b2_linearSlop) {
      this.m_u1.x *= 1 / length1;
      this.m_u1.y *= 1 / length1
    }else {
      this.m_u1.SetZero()
    }
    C = this.m_maxLength1 - length1;
    linearError = b2Math.Max(linearError, -C);
    C = b2Math.Clamp(C + b2Settings.b2_linearSlop, -b2Settings.b2_maxLinearCorrection, 0);
    impulse = -this.m_limitMass1 * C;
    p1X = -impulse * this.m_u1.x;
    p1Y = -impulse * this.m_u1.y;
    bA.m_sweep.c.x += bA.m_invMass * p1X;
    bA.m_sweep.c.y += bA.m_invMass * p1Y;
    bA.m_sweep.a += bA.m_invI * (r1X * p1Y - r1Y * p1X);
    bA.SynchronizeTransform()
  }
  if(this.m_limitState2 == b2Joint.e_atUpperLimit) {
    tMat = bB.m_xf.R;
    r2X = this.m_localAnchor2.x - bB.m_sweep.localCenter.x;
    r2Y = this.m_localAnchor2.y - bB.m_sweep.localCenter.y;
    tX = tMat.col1.x * r2X + tMat.col2.x * r2Y;
    r2Y = tMat.col1.y * r2X + tMat.col2.y * r2Y;
    r2X = tX;
    p2X = bB.m_sweep.c.x + r2X;
    p2Y = bB.m_sweep.c.y + r2Y;
    this.m_u2.Set(p2X - s2X, p2Y - s2Y);
    length2 = this.m_u2.Length();
    if(length2 > b2Settings.b2_linearSlop) {
      this.m_u2.x *= 1 / length2;
      this.m_u2.y *= 1 / length2
    }else {
      this.m_u2.SetZero()
    }
    C = this.m_maxLength2 - length2;
    linearError = b2Math.Max(linearError, -C);
    C = b2Math.Clamp(C + b2Settings.b2_linearSlop, -b2Settings.b2_maxLinearCorrection, 0);
    impulse = -this.m_limitMass2 * C;
    p2X = -impulse * this.m_u2.x;
    p2Y = -impulse * this.m_u2.y;
    bB.m_sweep.c.x += bB.m_invMass * p2X;
    bB.m_sweep.c.y += bB.m_invMass * p2Y;
    bB.m_sweep.a += bB.m_invI * (r2X * p2Y - r2Y * p2X);
    bB.SynchronizeTransform()
  }
  return linearError < b2Settings.b2_linearSlop
};
b2PulleyJoint.prototype.GetAnchorA = function() {
  return this.m_bodyA.GetWorldPoint(this.m_localAnchor1)
};
b2PulleyJoint.prototype.GetAnchorB = function() {
  return this.m_bodyB.GetWorldPoint(this.m_localAnchor2)
};
b2PulleyJoint.prototype.GetReactionForce = function(inv_dt) {
  return new b2Vec2(inv_dt * this.m_impulse * this.m_u2.x, inv_dt * this.m_impulse * this.m_u2.y)
};
b2PulleyJoint.prototype.GetReactionTorque = function(inv_dt) {
  return 0
};
b2PulleyJoint.prototype.GetGroundAnchorA = function() {
  var a = this.m_ground.m_xf.position.Copy();
  a.Add(this.m_groundAnchor1);
  return a
};
b2PulleyJoint.prototype.GetGroundAnchorB = function() {
  var a = this.m_ground.m_xf.position.Copy();
  a.Add(this.m_groundAnchor2);
  return a
};
b2PulleyJoint.prototype.GetLength1 = function() {
  var p = this.m_bodyA.GetWorldPoint(this.m_localAnchor1);
  var sX = this.m_ground.m_xf.position.x + this.m_groundAnchor1.x;
  var sY = this.m_ground.m_xf.position.y + this.m_groundAnchor1.y;
  var dX = p.x - sX;
  var dY = p.y - sY;
  return Math.sqrt(dX * dX + dY * dY)
};
b2PulleyJoint.prototype.GetLength2 = function() {
  var p = this.m_bodyB.GetWorldPoint(this.m_localAnchor2);
  var sX = this.m_ground.m_xf.position.x + this.m_groundAnchor2.x;
  var sY = this.m_ground.m_xf.position.y + this.m_groundAnchor2.y;
  var dX = p.x - sX;
  var dY = p.y - sY;
  return Math.sqrt(dX * dX + dY * dY)
};
b2PulleyJoint.prototype.GetRatio = function() {
  return this.m_ratio
};
b2PulleyJoint.prototype.m_ground = null;
b2PulleyJoint.prototype.m_groundAnchor1 = new b2Vec2;
b2PulleyJoint.prototype.m_groundAnchor2 = new b2Vec2;
b2PulleyJoint.prototype.m_localAnchor1 = new b2Vec2;
b2PulleyJoint.prototype.m_localAnchor2 = new b2Vec2;
b2PulleyJoint.prototype.m_u1 = new b2Vec2;
b2PulleyJoint.prototype.m_u2 = new b2Vec2;
b2PulleyJoint.prototype.m_constant = null;
b2PulleyJoint.prototype.m_ratio = null;
b2PulleyJoint.prototype.m_maxLength1 = null;
b2PulleyJoint.prototype.m_maxLength2 = null;
b2PulleyJoint.prototype.m_pulleyMass = null;
b2PulleyJoint.prototype.m_limitMass1 = null;
b2PulleyJoint.prototype.m_limitMass2 = null;
b2PulleyJoint.prototype.m_impulse = null;
b2PulleyJoint.prototype.m_limitImpulse1 = null;
b2PulleyJoint.prototype.m_limitImpulse2 = null;
b2PulleyJoint.prototype.m_state = 0;
b2PulleyJoint.prototype.m_limitState1 = 0;
b2PulleyJoint.prototype.m_limitState2 = 0;var b2PrismaticJoint = function() {
  b2Joint.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2PrismaticJoint.prototype, b2Joint.prototype);
b2PrismaticJoint.prototype._super = b2Joint.prototype;
b2PrismaticJoint.prototype.__constructor = function(def) {
  this._super.__constructor.apply(this, [def]);
  var tMat;
  var tX;
  var tY;
  this.m_localAnchor1.SetV(def.localAnchorA);
  this.m_localAnchor2.SetV(def.localAnchorB);
  this.m_localXAxis1.SetV(def.localAxisA);
  this.m_localYAxis1.x = -this.m_localXAxis1.y;
  this.m_localYAxis1.y = this.m_localXAxis1.x;
  this.m_refAngle = def.referenceAngle;
  this.m_impulse.SetZero();
  this.m_motorMass = 0;
  this.m_motorImpulse = 0;
  this.m_lowerTranslation = def.lowerTranslation;
  this.m_upperTranslation = def.upperTranslation;
  this.m_maxMotorForce = def.maxMotorForce;
  this.m_motorSpeed = def.motorSpeed;
  this.m_enableLimit = def.enableLimit;
  this.m_enableMotor = def.enableMotor;
  this.m_limitState = b2Joint.e_inactiveLimit;
  this.m_axis.SetZero();
  this.m_perp.SetZero()
};
b2PrismaticJoint.prototype.__varz = function() {
  this.m_localAnchor1 = new b2Vec2;
  this.m_localAnchor2 = new b2Vec2;
  this.m_localXAxis1 = new b2Vec2;
  this.m_localYAxis1 = new b2Vec2;
  this.m_axis = new b2Vec2;
  this.m_perp = new b2Vec2;
  this.m_K = new b2Mat33;
  this.m_impulse = new b2Vec3
};
b2PrismaticJoint.prototype.InitVelocityConstraints = function(step) {
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  var tMat;
  var tX;
  this.m_localCenterA.SetV(bA.GetLocalCenter());
  this.m_localCenterB.SetV(bB.GetLocalCenter());
  var xf1 = bA.GetTransform();
  var xf2 = bB.GetTransform();
  tMat = bA.m_xf.R;
  var r1X = this.m_localAnchor1.x - this.m_localCenterA.x;
  var r1Y = this.m_localAnchor1.y - this.m_localCenterA.y;
  tX = tMat.col1.x * r1X + tMat.col2.x * r1Y;
  r1Y = tMat.col1.y * r1X + tMat.col2.y * r1Y;
  r1X = tX;
  tMat = bB.m_xf.R;
  var r2X = this.m_localAnchor2.x - this.m_localCenterB.x;
  var r2Y = this.m_localAnchor2.y - this.m_localCenterB.y;
  tX = tMat.col1.x * r2X + tMat.col2.x * r2Y;
  r2Y = tMat.col1.y * r2X + tMat.col2.y * r2Y;
  r2X = tX;
  var dX = bB.m_sweep.c.x + r2X - bA.m_sweep.c.x - r1X;
  var dY = bB.m_sweep.c.y + r2Y - bA.m_sweep.c.y - r1Y;
  this.m_invMassA = bA.m_invMass;
  this.m_invMassB = bB.m_invMass;
  this.m_invIA = bA.m_invI;
  this.m_invIB = bB.m_invI;
  this.m_axis.SetV(b2Math.MulMV(xf1.R, this.m_localXAxis1));
  this.m_a1 = (dX + r1X) * this.m_axis.y - (dY + r1Y) * this.m_axis.x;
  this.m_a2 = r2X * this.m_axis.y - r2Y * this.m_axis.x;
  this.m_motorMass = this.m_invMassA + this.m_invMassB + this.m_invIA * this.m_a1 * this.m_a1 + this.m_invIB * this.m_a2 * this.m_a2;
  if(this.m_motorMass > Number.MIN_VALUE) {
    this.m_motorMass = 1 / this.m_motorMass
  }
  this.m_perp.SetV(b2Math.MulMV(xf1.R, this.m_localYAxis1));
  this.m_s1 = (dX + r1X) * this.m_perp.y - (dY + r1Y) * this.m_perp.x;
  this.m_s2 = r2X * this.m_perp.y - r2Y * this.m_perp.x;
  var m1 = this.m_invMassA;
  var m2 = this.m_invMassB;
  var i1 = this.m_invIA;
  var i2 = this.m_invIB;
  this.m_K.col1.x = m1 + m2 + i1 * this.m_s1 * this.m_s1 + i2 * this.m_s2 * this.m_s2;
  this.m_K.col1.y = i1 * this.m_s1 + i2 * this.m_s2;
  this.m_K.col1.z = i1 * this.m_s1 * this.m_a1 + i2 * this.m_s2 * this.m_a2;
  this.m_K.col2.x = this.m_K.col1.y;
  this.m_K.col2.y = i1 + i2;
  this.m_K.col2.z = i1 * this.m_a1 + i2 * this.m_a2;
  this.m_K.col3.x = this.m_K.col1.z;
  this.m_K.col3.y = this.m_K.col2.z;
  this.m_K.col3.z = m1 + m2 + i1 * this.m_a1 * this.m_a1 + i2 * this.m_a2 * this.m_a2;
  if(this.m_enableLimit) {
    var jointTransition = this.m_axis.x * dX + this.m_axis.y * dY;
    if(b2Math.Abs(this.m_upperTranslation - this.m_lowerTranslation) < 2 * b2Settings.b2_linearSlop) {
      this.m_limitState = b2Joint.e_equalLimits
    }else {
      if(jointTransition <= this.m_lowerTranslation) {
        if(this.m_limitState != b2Joint.e_atLowerLimit) {
          this.m_limitState = b2Joint.e_atLowerLimit;
          this.m_impulse.z = 0
        }
      }else {
        if(jointTransition >= this.m_upperTranslation) {
          if(this.m_limitState != b2Joint.e_atUpperLimit) {
            this.m_limitState = b2Joint.e_atUpperLimit;
            this.m_impulse.z = 0
          }
        }else {
          this.m_limitState = b2Joint.e_inactiveLimit;
          this.m_impulse.z = 0
        }
      }
    }
  }else {
    this.m_limitState = b2Joint.e_inactiveLimit
  }
  if(this.m_enableMotor == false) {
    this.m_motorImpulse = 0
  }
  if(step.warmStarting) {
    this.m_impulse.x *= step.dtRatio;
    this.m_impulse.y *= step.dtRatio;
    this.m_motorImpulse *= step.dtRatio;
    var PX = this.m_impulse.x * this.m_perp.x + (this.m_motorImpulse + this.m_impulse.z) * this.m_axis.x;
    var PY = this.m_impulse.x * this.m_perp.y + (this.m_motorImpulse + this.m_impulse.z) * this.m_axis.y;
    var L1 = this.m_impulse.x * this.m_s1 + this.m_impulse.y + (this.m_motorImpulse + this.m_impulse.z) * this.m_a1;
    var L2 = this.m_impulse.x * this.m_s2 + this.m_impulse.y + (this.m_motorImpulse + this.m_impulse.z) * this.m_a2;
    bA.m_linearVelocity.x -= this.m_invMassA * PX;
    bA.m_linearVelocity.y -= this.m_invMassA * PY;
    bA.m_angularVelocity -= this.m_invIA * L1;
    bB.m_linearVelocity.x += this.m_invMassB * PX;
    bB.m_linearVelocity.y += this.m_invMassB * PY;
    bB.m_angularVelocity += this.m_invIB * L2
  }else {
    this.m_impulse.SetZero();
    this.m_motorImpulse = 0
  }
};
b2PrismaticJoint.prototype.SolveVelocityConstraints = function(step) {
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  var v1 = bA.m_linearVelocity;
  var w1 = bA.m_angularVelocity;
  var v2 = bB.m_linearVelocity;
  var w2 = bB.m_angularVelocity;
  var PX;
  var PY;
  var L1;
  var L2;
  if(this.m_enableMotor && this.m_limitState != b2Joint.e_equalLimits) {
    var Cdot = this.m_axis.x * (v2.x - v1.x) + this.m_axis.y * (v2.y - v1.y) + this.m_a2 * w2 - this.m_a1 * w1;
    var impulse = this.m_motorMass * (this.m_motorSpeed - Cdot);
    var oldImpulse = this.m_motorImpulse;
    var maxImpulse = step.dt * this.m_maxMotorForce;
    this.m_motorImpulse = b2Math.Clamp(this.m_motorImpulse + impulse, -maxImpulse, maxImpulse);
    impulse = this.m_motorImpulse - oldImpulse;
    PX = impulse * this.m_axis.x;
    PY = impulse * this.m_axis.y;
    L1 = impulse * this.m_a1;
    L2 = impulse * this.m_a2;
    v1.x -= this.m_invMassA * PX;
    v1.y -= this.m_invMassA * PY;
    w1 -= this.m_invIA * L1;
    v2.x += this.m_invMassB * PX;
    v2.y += this.m_invMassB * PY;
    w2 += this.m_invIB * L2
  }
  var Cdot1X = this.m_perp.x * (v2.x - v1.x) + this.m_perp.y * (v2.y - v1.y) + this.m_s2 * w2 - this.m_s1 * w1;
  var Cdot1Y = w2 - w1;
  if(this.m_enableLimit && this.m_limitState != b2Joint.e_inactiveLimit) {
    var Cdot2 = this.m_axis.x * (v2.x - v1.x) + this.m_axis.y * (v2.y - v1.y) + this.m_a2 * w2 - this.m_a1 * w1;
    var f1 = this.m_impulse.Copy();
    var df = this.m_K.Solve33(new b2Vec3, -Cdot1X, -Cdot1Y, -Cdot2);
    this.m_impulse.Add(df);
    if(this.m_limitState == b2Joint.e_atLowerLimit) {
      this.m_impulse.z = b2Math.Max(this.m_impulse.z, 0)
    }else {
      if(this.m_limitState == b2Joint.e_atUpperLimit) {
        this.m_impulse.z = b2Math.Min(this.m_impulse.z, 0)
      }
    }
    var bX = -Cdot1X - (this.m_impulse.z - f1.z) * this.m_K.col3.x;
    var bY = -Cdot1Y - (this.m_impulse.z - f1.z) * this.m_K.col3.y;
    var f2r = this.m_K.Solve22(new b2Vec2, bX, bY);
    f2r.x += f1.x;
    f2r.y += f1.y;
    this.m_impulse.x = f2r.x;
    this.m_impulse.y = f2r.y;
    df.x = this.m_impulse.x - f1.x;
    df.y = this.m_impulse.y - f1.y;
    df.z = this.m_impulse.z - f1.z;
    PX = df.x * this.m_perp.x + df.z * this.m_axis.x;
    PY = df.x * this.m_perp.y + df.z * this.m_axis.y;
    L1 = df.x * this.m_s1 + df.y + df.z * this.m_a1;
    L2 = df.x * this.m_s2 + df.y + df.z * this.m_a2;
    v1.x -= this.m_invMassA * PX;
    v1.y -= this.m_invMassA * PY;
    w1 -= this.m_invIA * L1;
    v2.x += this.m_invMassB * PX;
    v2.y += this.m_invMassB * PY;
    w2 += this.m_invIB * L2
  }else {
    var df2 = this.m_K.Solve22(new b2Vec2, -Cdot1X, -Cdot1Y);
    this.m_impulse.x += df2.x;
    this.m_impulse.y += df2.y;
    PX = df2.x * this.m_perp.x;
    PY = df2.x * this.m_perp.y;
    L1 = df2.x * this.m_s1 + df2.y;
    L2 = df2.x * this.m_s2 + df2.y;
    v1.x -= this.m_invMassA * PX;
    v1.y -= this.m_invMassA * PY;
    w1 -= this.m_invIA * L1;
    v2.x += this.m_invMassB * PX;
    v2.y += this.m_invMassB * PY;
    w2 += this.m_invIB * L2
  }
  bA.m_linearVelocity.SetV(v1);
  bA.m_angularVelocity = w1;
  bB.m_linearVelocity.SetV(v2);
  bB.m_angularVelocity = w2
};
b2PrismaticJoint.prototype.SolvePositionConstraints = function(baumgarte) {
  var limitC;
  var oldLimitImpulse;
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  var c1 = bA.m_sweep.c;
  var a1 = bA.m_sweep.a;
  var c2 = bB.m_sweep.c;
  var a2 = bB.m_sweep.a;
  var tMat;
  var tX;
  var m1;
  var m2;
  var i1;
  var i2;
  var linearError = 0;
  var angularError = 0;
  var active = false;
  var C2 = 0;
  var R1 = b2Mat22.FromAngle(a1);
  var R2 = b2Mat22.FromAngle(a2);
  tMat = R1;
  var r1X = this.m_localAnchor1.x - this.m_localCenterA.x;
  var r1Y = this.m_localAnchor1.y - this.m_localCenterA.y;
  tX = tMat.col1.x * r1X + tMat.col2.x * r1Y;
  r1Y = tMat.col1.y * r1X + tMat.col2.y * r1Y;
  r1X = tX;
  tMat = R2;
  var r2X = this.m_localAnchor2.x - this.m_localCenterB.x;
  var r2Y = this.m_localAnchor2.y - this.m_localCenterB.y;
  tX = tMat.col1.x * r2X + tMat.col2.x * r2Y;
  r2Y = tMat.col1.y * r2X + tMat.col2.y * r2Y;
  r2X = tX;
  var dX = c2.x + r2X - c1.x - r1X;
  var dY = c2.y + r2Y - c1.y - r1Y;
  if(this.m_enableLimit) {
    this.m_axis = b2Math.MulMV(R1, this.m_localXAxis1);
    this.m_a1 = (dX + r1X) * this.m_axis.y - (dY + r1Y) * this.m_axis.x;
    this.m_a2 = r2X * this.m_axis.y - r2Y * this.m_axis.x;
    var translation = this.m_axis.x * dX + this.m_axis.y * dY;
    if(b2Math.Abs(this.m_upperTranslation - this.m_lowerTranslation) < 2 * b2Settings.b2_linearSlop) {
      C2 = b2Math.Clamp(translation, -b2Settings.b2_maxLinearCorrection, b2Settings.b2_maxLinearCorrection);
      linearError = b2Math.Abs(translation);
      active = true
    }else {
      if(translation <= this.m_lowerTranslation) {
        C2 = b2Math.Clamp(translation - this.m_lowerTranslation + b2Settings.b2_linearSlop, -b2Settings.b2_maxLinearCorrection, 0);
        linearError = this.m_lowerTranslation - translation;
        active = true
      }else {
        if(translation >= this.m_upperTranslation) {
          C2 = b2Math.Clamp(translation - this.m_upperTranslation + b2Settings.b2_linearSlop, 0, b2Settings.b2_maxLinearCorrection);
          linearError = translation - this.m_upperTranslation;
          active = true
        }
      }
    }
  }
  this.m_perp = b2Math.MulMV(R1, this.m_localYAxis1);
  this.m_s1 = (dX + r1X) * this.m_perp.y - (dY + r1Y) * this.m_perp.x;
  this.m_s2 = r2X * this.m_perp.y - r2Y * this.m_perp.x;
  var impulse = new b2Vec3;
  var C1X = this.m_perp.x * dX + this.m_perp.y * dY;
  var C1Y = a2 - a1 - this.m_refAngle;
  linearError = b2Math.Max(linearError, b2Math.Abs(C1X));
  angularError = b2Math.Abs(C1Y);
  if(active) {
    m1 = this.m_invMassA;
    m2 = this.m_invMassB;
    i1 = this.m_invIA;
    i2 = this.m_invIB;
    this.m_K.col1.x = m1 + m2 + i1 * this.m_s1 * this.m_s1 + i2 * this.m_s2 * this.m_s2;
    this.m_K.col1.y = i1 * this.m_s1 + i2 * this.m_s2;
    this.m_K.col1.z = i1 * this.m_s1 * this.m_a1 + i2 * this.m_s2 * this.m_a2;
    this.m_K.col2.x = this.m_K.col1.y;
    this.m_K.col2.y = i1 + i2;
    this.m_K.col2.z = i1 * this.m_a1 + i2 * this.m_a2;
    this.m_K.col3.x = this.m_K.col1.z;
    this.m_K.col3.y = this.m_K.col2.z;
    this.m_K.col3.z = m1 + m2 + i1 * this.m_a1 * this.m_a1 + i2 * this.m_a2 * this.m_a2;
    this.m_K.Solve33(impulse, -C1X, -C1Y, -C2)
  }else {
    m1 = this.m_invMassA;
    m2 = this.m_invMassB;
    i1 = this.m_invIA;
    i2 = this.m_invIB;
    var k11 = m1 + m2 + i1 * this.m_s1 * this.m_s1 + i2 * this.m_s2 * this.m_s2;
    var k12 = i1 * this.m_s1 + i2 * this.m_s2;
    var k22 = i1 + i2;
    this.m_K.col1.Set(k11, k12, 0);
    this.m_K.col2.Set(k12, k22, 0);
    var impulse1 = this.m_K.Solve22(new b2Vec2, -C1X, -C1Y);
    impulse.x = impulse1.x;
    impulse.y = impulse1.y;
    impulse.z = 0
  }
  var PX = impulse.x * this.m_perp.x + impulse.z * this.m_axis.x;
  var PY = impulse.x * this.m_perp.y + impulse.z * this.m_axis.y;
  var L1 = impulse.x * this.m_s1 + impulse.y + impulse.z * this.m_a1;
  var L2 = impulse.x * this.m_s2 + impulse.y + impulse.z * this.m_a2;
  c1.x -= this.m_invMassA * PX;
  c1.y -= this.m_invMassA * PY;
  a1 -= this.m_invIA * L1;
  c2.x += this.m_invMassB * PX;
  c2.y += this.m_invMassB * PY;
  a2 += this.m_invIB * L2;
  bA.m_sweep.a = a1;
  bB.m_sweep.a = a2;
  bA.SynchronizeTransform();
  bB.SynchronizeTransform();
  return linearError <= b2Settings.b2_linearSlop && angularError <= b2Settings.b2_angularSlop
};
b2PrismaticJoint.prototype.GetAnchorA = function() {
  return this.m_bodyA.GetWorldPoint(this.m_localAnchor1)
};
b2PrismaticJoint.prototype.GetAnchorB = function() {
  return this.m_bodyB.GetWorldPoint(this.m_localAnchor2)
};
b2PrismaticJoint.prototype.GetReactionForce = function(inv_dt) {
  return new b2Vec2(inv_dt * (this.m_impulse.x * this.m_perp.x + (this.m_motorImpulse + this.m_impulse.z) * this.m_axis.x), inv_dt * (this.m_impulse.x * this.m_perp.y + (this.m_motorImpulse + this.m_impulse.z) * this.m_axis.y))
};
b2PrismaticJoint.prototype.GetReactionTorque = function(inv_dt) {
  return inv_dt * this.m_impulse.y
};
b2PrismaticJoint.prototype.GetJointTranslation = function() {
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  var tMat;
  var p1 = bA.GetWorldPoint(this.m_localAnchor1);
  var p2 = bB.GetWorldPoint(this.m_localAnchor2);
  var dX = p2.x - p1.x;
  var dY = p2.y - p1.y;
  var axis = bA.GetWorldVector(this.m_localXAxis1);
  var translation = axis.x * dX + axis.y * dY;
  return translation
};
b2PrismaticJoint.prototype.GetJointSpeed = function() {
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  var tMat;
  tMat = bA.m_xf.R;
  var r1X = this.m_localAnchor1.x - bA.m_sweep.localCenter.x;
  var r1Y = this.m_localAnchor1.y - bA.m_sweep.localCenter.y;
  var tX = tMat.col1.x * r1X + tMat.col2.x * r1Y;
  r1Y = tMat.col1.y * r1X + tMat.col2.y * r1Y;
  r1X = tX;
  tMat = bB.m_xf.R;
  var r2X = this.m_localAnchor2.x - bB.m_sweep.localCenter.x;
  var r2Y = this.m_localAnchor2.y - bB.m_sweep.localCenter.y;
  tX = tMat.col1.x * r2X + tMat.col2.x * r2Y;
  r2Y = tMat.col1.y * r2X + tMat.col2.y * r2Y;
  r2X = tX;
  var p1X = bA.m_sweep.c.x + r1X;
  var p1Y = bA.m_sweep.c.y + r1Y;
  var p2X = bB.m_sweep.c.x + r2X;
  var p2Y = bB.m_sweep.c.y + r2Y;
  var dX = p2X - p1X;
  var dY = p2Y - p1Y;
  var axis = bA.GetWorldVector(this.m_localXAxis1);
  var v1 = bA.m_linearVelocity;
  var v2 = bB.m_linearVelocity;
  var w1 = bA.m_angularVelocity;
  var w2 = bB.m_angularVelocity;
  var speed = dX * -w1 * axis.y + dY * w1 * axis.x + (axis.x * (v2.x + -w2 * r2Y - v1.x - -w1 * r1Y) + axis.y * (v2.y + w2 * r2X - v1.y - w1 * r1X));
  return speed
};
b2PrismaticJoint.prototype.IsLimitEnabled = function() {
  return this.m_enableLimit
};
b2PrismaticJoint.prototype.EnableLimit = function(flag) {
  this.m_bodyA.SetAwake(true);
  this.m_bodyB.SetAwake(true);
  this.m_enableLimit = flag
};
b2PrismaticJoint.prototype.GetLowerLimit = function() {
  return this.m_lowerTranslation
};
b2PrismaticJoint.prototype.GetUpperLimit = function() {
  return this.m_upperTranslation
};
b2PrismaticJoint.prototype.SetLimits = function(lower, upper) {
  this.m_bodyA.SetAwake(true);
  this.m_bodyB.SetAwake(true);
  this.m_lowerTranslation = lower;
  this.m_upperTranslation = upper
};
b2PrismaticJoint.prototype.IsMotorEnabled = function() {
  return this.m_enableMotor
};
b2PrismaticJoint.prototype.EnableMotor = function(flag) {
  this.m_bodyA.SetAwake(true);
  this.m_bodyB.SetAwake(true);
  this.m_enableMotor = flag
};
b2PrismaticJoint.prototype.SetMotorSpeed = function(speed) {
  this.m_bodyA.SetAwake(true);
  this.m_bodyB.SetAwake(true);
  this.m_motorSpeed = speed
};
b2PrismaticJoint.prototype.GetMotorSpeed = function() {
  return this.m_motorSpeed
};
b2PrismaticJoint.prototype.SetMaxMotorForce = function(force) {
  this.m_bodyA.SetAwake(true);
  this.m_bodyB.SetAwake(true);
  this.m_maxMotorForce = force
};
b2PrismaticJoint.prototype.GetMotorForce = function() {
  return this.m_motorImpulse
};
b2PrismaticJoint.prototype.m_localAnchor1 = new b2Vec2;
b2PrismaticJoint.prototype.m_localAnchor2 = new b2Vec2;
b2PrismaticJoint.prototype.m_localXAxis1 = new b2Vec2;
b2PrismaticJoint.prototype.m_localYAxis1 = new b2Vec2;
b2PrismaticJoint.prototype.m_refAngle = null;
b2PrismaticJoint.prototype.m_axis = new b2Vec2;
b2PrismaticJoint.prototype.m_perp = new b2Vec2;
b2PrismaticJoint.prototype.m_s1 = null;
b2PrismaticJoint.prototype.m_s2 = null;
b2PrismaticJoint.prototype.m_a1 = null;
b2PrismaticJoint.prototype.m_a2 = null;
b2PrismaticJoint.prototype.m_K = new b2Mat33;
b2PrismaticJoint.prototype.m_impulse = new b2Vec3;
b2PrismaticJoint.prototype.m_motorMass = null;
b2PrismaticJoint.prototype.m_motorImpulse = null;
b2PrismaticJoint.prototype.m_lowerTranslation = null;
b2PrismaticJoint.prototype.m_upperTranslation = null;
b2PrismaticJoint.prototype.m_maxMotorForce = null;
b2PrismaticJoint.prototype.m_motorSpeed = null;
b2PrismaticJoint.prototype.m_enableLimit = null;
b2PrismaticJoint.prototype.m_enableMotor = null;
b2PrismaticJoint.prototype.m_limitState = 0;var b2RevoluteJoint = function() {
  b2Joint.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2RevoluteJoint.prototype, b2Joint.prototype);
b2RevoluteJoint.prototype._super = b2Joint.prototype;
b2RevoluteJoint.prototype.__constructor = function(def) {
  this._super.__constructor.apply(this, [def]);
  this.m_localAnchor1.SetV(def.localAnchorA);
  this.m_localAnchor2.SetV(def.localAnchorB);
  this.m_referenceAngle = def.referenceAngle;
  this.m_impulse.SetZero();
  this.m_motorImpulse = 0;
  this.m_lowerAngle = def.lowerAngle;
  this.m_upperAngle = def.upperAngle;
  this.m_maxMotorTorque = def.maxMotorTorque;
  this.m_motorSpeed = def.motorSpeed;
  this.m_enableLimit = def.enableLimit;
  this.m_enableMotor = def.enableMotor;
  this.m_limitState = b2Joint.e_inactiveLimit
};
b2RevoluteJoint.prototype.__varz = function() {
  this.K = new b2Mat22;
  this.K1 = new b2Mat22;
  this.K2 = new b2Mat22;
  this.K3 = new b2Mat22;
  this.impulse3 = new b2Vec3;
  this.impulse2 = new b2Vec2;
  this.reduced = new b2Vec2;
  this.m_localAnchor1 = new b2Vec2;
  this.m_localAnchor2 = new b2Vec2;
  this.m_impulse = new b2Vec3;
  this.m_mass = new b2Mat33
};
b2RevoluteJoint.tImpulse = new b2Vec2;
b2RevoluteJoint.prototype.InitVelocityConstraints = function(step) {
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  var tMat;
  var tX;
  if(this.m_enableMotor || this.m_enableLimit) {
  }
  tMat = bA.m_xf.R;
  var r1X = this.m_localAnchor1.x - bA.m_sweep.localCenter.x;
  var r1Y = this.m_localAnchor1.y - bA.m_sweep.localCenter.y;
  tX = tMat.col1.x * r1X + tMat.col2.x * r1Y;
  r1Y = tMat.col1.y * r1X + tMat.col2.y * r1Y;
  r1X = tX;
  tMat = bB.m_xf.R;
  var r2X = this.m_localAnchor2.x - bB.m_sweep.localCenter.x;
  var r2Y = this.m_localAnchor2.y - bB.m_sweep.localCenter.y;
  tX = tMat.col1.x * r2X + tMat.col2.x * r2Y;
  r2Y = tMat.col1.y * r2X + tMat.col2.y * r2Y;
  r2X = tX;
  var m1 = bA.m_invMass;
  var m2 = bB.m_invMass;
  var i1 = bA.m_invI;
  var i2 = bB.m_invI;
  this.m_mass.col1.x = m1 + m2 + r1Y * r1Y * i1 + r2Y * r2Y * i2;
  this.m_mass.col2.x = -r1Y * r1X * i1 - r2Y * r2X * i2;
  this.m_mass.col3.x = -r1Y * i1 - r2Y * i2;
  this.m_mass.col1.y = this.m_mass.col2.x;
  this.m_mass.col2.y = m1 + m2 + r1X * r1X * i1 + r2X * r2X * i2;
  this.m_mass.col3.y = r1X * i1 + r2X * i2;
  this.m_mass.col1.z = this.m_mass.col3.x;
  this.m_mass.col2.z = this.m_mass.col3.y;
  this.m_mass.col3.z = i1 + i2;
  this.m_motorMass = 1 / (i1 + i2);
  if(this.m_enableMotor == false) {
    this.m_motorImpulse = 0
  }
  if(this.m_enableLimit) {
    var jointAngle = bB.m_sweep.a - bA.m_sweep.a - this.m_referenceAngle;
    if(b2Math.Abs(this.m_upperAngle - this.m_lowerAngle) < 2 * b2Settings.b2_angularSlop) {
      this.m_limitState = b2Joint.e_equalLimits
    }else {
      if(jointAngle <= this.m_lowerAngle) {
        if(this.m_limitState != b2Joint.e_atLowerLimit) {
          this.m_impulse.z = 0
        }
        this.m_limitState = b2Joint.e_atLowerLimit
      }else {
        if(jointAngle >= this.m_upperAngle) {
          if(this.m_limitState != b2Joint.e_atUpperLimit) {
            this.m_impulse.z = 0
          }
          this.m_limitState = b2Joint.e_atUpperLimit
        }else {
          this.m_limitState = b2Joint.e_inactiveLimit;
          this.m_impulse.z = 0
        }
      }
    }
  }else {
    this.m_limitState = b2Joint.e_inactiveLimit
  }
  if(step.warmStarting) {
    this.m_impulse.x *= step.dtRatio;
    this.m_impulse.y *= step.dtRatio;
    this.m_motorImpulse *= step.dtRatio;
    var PX = this.m_impulse.x;
    var PY = this.m_impulse.y;
    bA.m_linearVelocity.x -= m1 * PX;
    bA.m_linearVelocity.y -= m1 * PY;
    bA.m_angularVelocity -= i1 * (r1X * PY - r1Y * PX + this.m_motorImpulse + this.m_impulse.z);
    bB.m_linearVelocity.x += m2 * PX;
    bB.m_linearVelocity.y += m2 * PY;
    bB.m_angularVelocity += i2 * (r2X * PY - r2Y * PX + this.m_motorImpulse + this.m_impulse.z)
  }else {
    this.m_impulse.SetZero();
    this.m_motorImpulse = 0
  }
};
b2RevoluteJoint.prototype.SolveVelocityConstraints = function(step) {
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  var tMat;
  var tX;
  var newImpulse;
  var r1X;
  var r1Y;
  var r2X;
  var r2Y;
  var v1 = bA.m_linearVelocity;
  var w1 = bA.m_angularVelocity;
  var v2 = bB.m_linearVelocity;
  var w2 = bB.m_angularVelocity;
  var m1 = bA.m_invMass;
  var m2 = bB.m_invMass;
  var i1 = bA.m_invI;
  var i2 = bB.m_invI;
  if(this.m_enableMotor && this.m_limitState != b2Joint.e_equalLimits) {
    var Cdot = w2 - w1 - this.m_motorSpeed;
    var impulse = this.m_motorMass * -Cdot;
    var oldImpulse = this.m_motorImpulse;
    var maxImpulse = step.dt * this.m_maxMotorTorque;
    this.m_motorImpulse = b2Math.Clamp(this.m_motorImpulse + impulse, -maxImpulse, maxImpulse);
    impulse = this.m_motorImpulse - oldImpulse;
    w1 -= i1 * impulse;
    w2 += i2 * impulse
  }
  if(this.m_enableLimit && this.m_limitState != b2Joint.e_inactiveLimit) {
    tMat = bA.m_xf.R;
    r1X = this.m_localAnchor1.x - bA.m_sweep.localCenter.x;
    r1Y = this.m_localAnchor1.y - bA.m_sweep.localCenter.y;
    tX = tMat.col1.x * r1X + tMat.col2.x * r1Y;
    r1Y = tMat.col1.y * r1X + tMat.col2.y * r1Y;
    r1X = tX;
    tMat = bB.m_xf.R;
    r2X = this.m_localAnchor2.x - bB.m_sweep.localCenter.x;
    r2Y = this.m_localAnchor2.y - bB.m_sweep.localCenter.y;
    tX = tMat.col1.x * r2X + tMat.col2.x * r2Y;
    r2Y = tMat.col1.y * r2X + tMat.col2.y * r2Y;
    r2X = tX;
    var Cdot1X = v2.x + -w2 * r2Y - v1.x - -w1 * r1Y;
    var Cdot1Y = v2.y + w2 * r2X - v1.y - w1 * r1X;
    var Cdot2 = w2 - w1;
    this.m_mass.Solve33(this.impulse3, -Cdot1X, -Cdot1Y, -Cdot2);
    if(this.m_limitState == b2Joint.e_equalLimits) {
      this.m_impulse.Add(this.impulse3)
    }else {
      if(this.m_limitState == b2Joint.e_atLowerLimit) {
        newImpulse = this.m_impulse.z + this.impulse3.z;
        if(newImpulse < 0) {
          this.m_mass.Solve22(this.reduced, -Cdot1X, -Cdot1Y);
          this.impulse3.x = this.reduced.x;
          this.impulse3.y = this.reduced.y;
          this.impulse3.z = -this.m_impulse.z;
          this.m_impulse.x += this.reduced.x;
          this.m_impulse.y += this.reduced.y;
          this.m_impulse.z = 0
        }
      }else {
        if(this.m_limitState == b2Joint.e_atUpperLimit) {
          newImpulse = this.m_impulse.z + this.impulse3.z;
          if(newImpulse > 0) {
            this.m_mass.Solve22(this.reduced, -Cdot1X, -Cdot1Y);
            this.impulse3.x = this.reduced.x;
            this.impulse3.y = this.reduced.y;
            this.impulse3.z = -this.m_impulse.z;
            this.m_impulse.x += this.reduced.x;
            this.m_impulse.y += this.reduced.y;
            this.m_impulse.z = 0
          }
        }
      }
    }
    v1.x -= m1 * this.impulse3.x;
    v1.y -= m1 * this.impulse3.y;
    w1 -= i1 * (r1X * this.impulse3.y - r1Y * this.impulse3.x + this.impulse3.z);
    v2.x += m2 * this.impulse3.x;
    v2.y += m2 * this.impulse3.y;
    w2 += i2 * (r2X * this.impulse3.y - r2Y * this.impulse3.x + this.impulse3.z)
  }else {
    tMat = bA.m_xf.R;
    r1X = this.m_localAnchor1.x - bA.m_sweep.localCenter.x;
    r1Y = this.m_localAnchor1.y - bA.m_sweep.localCenter.y;
    tX = tMat.col1.x * r1X + tMat.col2.x * r1Y;
    r1Y = tMat.col1.y * r1X + tMat.col2.y * r1Y;
    r1X = tX;
    tMat = bB.m_xf.R;
    r2X = this.m_localAnchor2.x - bB.m_sweep.localCenter.x;
    r2Y = this.m_localAnchor2.y - bB.m_sweep.localCenter.y;
    tX = tMat.col1.x * r2X + tMat.col2.x * r2Y;
    r2Y = tMat.col1.y * r2X + tMat.col2.y * r2Y;
    r2X = tX;
    var CdotX = v2.x + -w2 * r2Y - v1.x - -w1 * r1Y;
    var CdotY = v2.y + w2 * r2X - v1.y - w1 * r1X;
    this.m_mass.Solve22(this.impulse2, -CdotX, -CdotY);
    this.m_impulse.x += this.impulse2.x;
    this.m_impulse.y += this.impulse2.y;
    v1.x -= m1 * this.impulse2.x;
    v1.y -= m1 * this.impulse2.y;
    w1 -= i1 * (r1X * this.impulse2.y - r1Y * this.impulse2.x);
    v2.x += m2 * this.impulse2.x;
    v2.y += m2 * this.impulse2.y;
    w2 += i2 * (r2X * this.impulse2.y - r2Y * this.impulse2.x)
  }
  bA.m_linearVelocity.SetV(v1);
  bA.m_angularVelocity = w1;
  bB.m_linearVelocity.SetV(v2);
  bB.m_angularVelocity = w2
};
b2RevoluteJoint.prototype.SolvePositionConstraints = function(baumgarte) {
  var oldLimitImpulse;
  var C;
  var tMat;
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  var angularError = 0;
  var positionError = 0;
  var tX;
  var impulseX;
  var impulseY;
  if(this.m_enableLimit && this.m_limitState != b2Joint.e_inactiveLimit) {
    var angle = bB.m_sweep.a - bA.m_sweep.a - this.m_referenceAngle;
    var limitImpulse = 0;
    if(this.m_limitState == b2Joint.e_equalLimits) {
      C = b2Math.Clamp(angle - this.m_lowerAngle, -b2Settings.b2_maxAngularCorrection, b2Settings.b2_maxAngularCorrection);
      limitImpulse = -this.m_motorMass * C;
      angularError = b2Math.Abs(C)
    }else {
      if(this.m_limitState == b2Joint.e_atLowerLimit) {
        C = angle - this.m_lowerAngle;
        angularError = -C;
        C = b2Math.Clamp(C + b2Settings.b2_angularSlop, -b2Settings.b2_maxAngularCorrection, 0);
        limitImpulse = -this.m_motorMass * C
      }else {
        if(this.m_limitState == b2Joint.e_atUpperLimit) {
          C = angle - this.m_upperAngle;
          angularError = C;
          C = b2Math.Clamp(C - b2Settings.b2_angularSlop, 0, b2Settings.b2_maxAngularCorrection);
          limitImpulse = -this.m_motorMass * C
        }
      }
    }
    bA.m_sweep.a -= bA.m_invI * limitImpulse;
    bB.m_sweep.a += bB.m_invI * limitImpulse;
    bA.SynchronizeTransform();
    bB.SynchronizeTransform()
  }
  tMat = bA.m_xf.R;
  var r1X = this.m_localAnchor1.x - bA.m_sweep.localCenter.x;
  var r1Y = this.m_localAnchor1.y - bA.m_sweep.localCenter.y;
  tX = tMat.col1.x * r1X + tMat.col2.x * r1Y;
  r1Y = tMat.col1.y * r1X + tMat.col2.y * r1Y;
  r1X = tX;
  tMat = bB.m_xf.R;
  var r2X = this.m_localAnchor2.x - bB.m_sweep.localCenter.x;
  var r2Y = this.m_localAnchor2.y - bB.m_sweep.localCenter.y;
  tX = tMat.col1.x * r2X + tMat.col2.x * r2Y;
  r2Y = tMat.col1.y * r2X + tMat.col2.y * r2Y;
  r2X = tX;
  var CX = bB.m_sweep.c.x + r2X - bA.m_sweep.c.x - r1X;
  var CY = bB.m_sweep.c.y + r2Y - bA.m_sweep.c.y - r1Y;
  var CLengthSquared = CX * CX + CY * CY;
  var CLength = Math.sqrt(CLengthSquared);
  positionError = CLength;
  var invMass1 = bA.m_invMass;
  var invMass2 = bB.m_invMass;
  var invI1 = bA.m_invI;
  var invI2 = bB.m_invI;
  var k_allowedStretch = 10 * b2Settings.b2_linearSlop;
  if(CLengthSquared > k_allowedStretch * k_allowedStretch) {
    var uX = CX / CLength;
    var uY = CY / CLength;
    var k = invMass1 + invMass2;
    var m = 1 / k;
    impulseX = m * -CX;
    impulseY = m * -CY;
    var k_beta = 0.5;
    bA.m_sweep.c.x -= k_beta * invMass1 * impulseX;
    bA.m_sweep.c.y -= k_beta * invMass1 * impulseY;
    bB.m_sweep.c.x += k_beta * invMass2 * impulseX;
    bB.m_sweep.c.y += k_beta * invMass2 * impulseY;
    CX = bB.m_sweep.c.x + r2X - bA.m_sweep.c.x - r1X;
    CY = bB.m_sweep.c.y + r2Y - bA.m_sweep.c.y - r1Y
  }
  this.K1.col1.x = invMass1 + invMass2;
  this.K1.col2.x = 0;
  this.K1.col1.y = 0;
  this.K1.col2.y = invMass1 + invMass2;
  this.K2.col1.x = invI1 * r1Y * r1Y;
  this.K2.col2.x = -invI1 * r1X * r1Y;
  this.K2.col1.y = -invI1 * r1X * r1Y;
  this.K2.col2.y = invI1 * r1X * r1X;
  this.K3.col1.x = invI2 * r2Y * r2Y;
  this.K3.col2.x = -invI2 * r2X * r2Y;
  this.K3.col1.y = -invI2 * r2X * r2Y;
  this.K3.col2.y = invI2 * r2X * r2X;
  this.K.SetM(this.K1);
  this.K.AddM(this.K2);
  this.K.AddM(this.K3);
  this.K.Solve(b2RevoluteJoint.tImpulse, -CX, -CY);
  impulseX = b2RevoluteJoint.tImpulse.x;
  impulseY = b2RevoluteJoint.tImpulse.y;
  bA.m_sweep.c.x -= bA.m_invMass * impulseX;
  bA.m_sweep.c.y -= bA.m_invMass * impulseY;
  bA.m_sweep.a -= bA.m_invI * (r1X * impulseY - r1Y * impulseX);
  bB.m_sweep.c.x += bB.m_invMass * impulseX;
  bB.m_sweep.c.y += bB.m_invMass * impulseY;
  bB.m_sweep.a += bB.m_invI * (r2X * impulseY - r2Y * impulseX);
  bA.SynchronizeTransform();
  bB.SynchronizeTransform();
  return positionError <= b2Settings.b2_linearSlop && angularError <= b2Settings.b2_angularSlop
};
b2RevoluteJoint.prototype.GetAnchorA = function() {
  return this.m_bodyA.GetWorldPoint(this.m_localAnchor1)
};
b2RevoluteJoint.prototype.GetAnchorB = function() {
  return this.m_bodyB.GetWorldPoint(this.m_localAnchor2)
};
b2RevoluteJoint.prototype.GetReactionForce = function(inv_dt) {
  return new b2Vec2(inv_dt * this.m_impulse.x, inv_dt * this.m_impulse.y)
};
b2RevoluteJoint.prototype.GetReactionTorque = function(inv_dt) {
  return inv_dt * this.m_impulse.z
};
b2RevoluteJoint.prototype.GetJointAngle = function() {
  return this.m_bodyB.m_sweep.a - this.m_bodyA.m_sweep.a - this.m_referenceAngle
};
b2RevoluteJoint.prototype.GetJointSpeed = function() {
  return this.m_bodyB.m_angularVelocity - this.m_bodyA.m_angularVelocity
};
b2RevoluteJoint.prototype.IsLimitEnabled = function() {
  return this.m_enableLimit
};
b2RevoluteJoint.prototype.EnableLimit = function(flag) {
  this.m_enableLimit = flag
};
b2RevoluteJoint.prototype.GetLowerLimit = function() {
  return this.m_lowerAngle
};
b2RevoluteJoint.prototype.GetUpperLimit = function() {
  return this.m_upperAngle
};
b2RevoluteJoint.prototype.SetLimits = function(lower, upper) {
  this.m_lowerAngle = lower;
  this.m_upperAngle = upper
};
b2RevoluteJoint.prototype.IsMotorEnabled = function() {
  this.m_bodyA.SetAwake(true);
  this.m_bodyB.SetAwake(true);
  return this.m_enableMotor
};
b2RevoluteJoint.prototype.EnableMotor = function(flag) {
  this.m_enableMotor = flag
};
b2RevoluteJoint.prototype.SetMotorSpeed = function(speed) {
  this.m_bodyA.SetAwake(true);
  this.m_bodyB.SetAwake(true);
  this.m_motorSpeed = speed
};
b2RevoluteJoint.prototype.GetMotorSpeed = function() {
  return this.m_motorSpeed
};
b2RevoluteJoint.prototype.SetMaxMotorTorque = function(torque) {
  this.m_maxMotorTorque = torque
};
b2RevoluteJoint.prototype.GetMotorTorque = function() {
  return this.m_maxMotorTorque
};
b2RevoluteJoint.prototype.K = new b2Mat22;
b2RevoluteJoint.prototype.K1 = new b2Mat22;
b2RevoluteJoint.prototype.K2 = new b2Mat22;
b2RevoluteJoint.prototype.K3 = new b2Mat22;
b2RevoluteJoint.prototype.impulse3 = new b2Vec3;
b2RevoluteJoint.prototype.impulse2 = new b2Vec2;
b2RevoluteJoint.prototype.reduced = new b2Vec2;
b2RevoluteJoint.prototype.m_localAnchor1 = new b2Vec2;
b2RevoluteJoint.prototype.m_localAnchor2 = new b2Vec2;
b2RevoluteJoint.prototype.m_impulse = new b2Vec3;
b2RevoluteJoint.prototype.m_motorImpulse = null;
b2RevoluteJoint.prototype.m_mass = new b2Mat33;
b2RevoluteJoint.prototype.m_motorMass = null;
b2RevoluteJoint.prototype.m_enableMotor = null;
b2RevoluteJoint.prototype.m_maxMotorTorque = null;
b2RevoluteJoint.prototype.m_motorSpeed = null;
b2RevoluteJoint.prototype.m_enableLimit = null;
b2RevoluteJoint.prototype.m_referenceAngle = null;
b2RevoluteJoint.prototype.m_lowerAngle = null;
b2RevoluteJoint.prototype.m_upperAngle = null;
b2RevoluteJoint.prototype.m_limitState = 0;var b2JointDef = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2JointDef.prototype.__constructor = function() {
  this.type = b2Joint.e_unknownJoint;
  this.userData = null;
  this.bodyA = null;
  this.bodyB = null;
  this.collideConnected = false
};
b2JointDef.prototype.__varz = function() {
};
b2JointDef.prototype.type = 0;
b2JointDef.prototype.userData = null;
b2JointDef.prototype.bodyA = null;
b2JointDef.prototype.bodyB = null;
b2JointDef.prototype.collideConnected = null;var b2LineJointDef = function() {
  b2JointDef.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2LineJointDef.prototype, b2JointDef.prototype);
b2LineJointDef.prototype._super = b2JointDef.prototype;
b2LineJointDef.prototype.__constructor = function() {
  this._super.__constructor.apply(this, arguments);
  this.type = b2Joint.e_lineJoint;
  this.localAxisA.Set(1, 0);
  this.enableLimit = false;
  this.lowerTranslation = 0;
  this.upperTranslation = 0;
  this.enableMotor = false;
  this.maxMotorForce = 0;
  this.motorSpeed = 0
};
b2LineJointDef.prototype.__varz = function() {
  this.localAnchorA = new b2Vec2;
  this.localAnchorB = new b2Vec2;
  this.localAxisA = new b2Vec2
};
b2LineJointDef.prototype.Initialize = function(bA, bB, anchor, axis) {
  this.bodyA = bA;
  this.bodyB = bB;
  this.localAnchorA = this.bodyA.GetLocalPoint(anchor);
  this.localAnchorB = this.bodyB.GetLocalPoint(anchor);
  this.localAxisA = this.bodyA.GetLocalVector(axis)
};
b2LineJointDef.prototype.localAnchorA = new b2Vec2;
b2LineJointDef.prototype.localAnchorB = new b2Vec2;
b2LineJointDef.prototype.localAxisA = new b2Vec2;
b2LineJointDef.prototype.enableLimit = null;
b2LineJointDef.prototype.lowerTranslation = null;
b2LineJointDef.prototype.upperTranslation = null;
b2LineJointDef.prototype.enableMotor = null;
b2LineJointDef.prototype.maxMotorForce = null;
b2LineJointDef.prototype.motorSpeed = null;var b2DistanceJoint = function() {
  b2Joint.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2DistanceJoint.prototype, b2Joint.prototype);
b2DistanceJoint.prototype._super = b2Joint.prototype;
b2DistanceJoint.prototype.__constructor = function(def) {
  this._super.__constructor.apply(this, [def]);
  var tMat;
  var tX;
  var tY;
  this.m_localAnchor1.SetV(def.localAnchorA);
  this.m_localAnchor2.SetV(def.localAnchorB);
  this.m_length = def.length;
  this.m_frequencyHz = def.frequencyHz;
  this.m_dampingRatio = def.dampingRatio;
  this.m_impulse = 0;
  this.m_gamma = 0;
  this.m_bias = 0
};
b2DistanceJoint.prototype.__varz = function() {
  this.m_localAnchor1 = new b2Vec2;
  this.m_localAnchor2 = new b2Vec2;
  this.m_u = new b2Vec2
};
b2DistanceJoint.prototype.InitVelocityConstraints = function(step) {
  var tMat;
  var tX;
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  tMat = bA.m_xf.R;
  var r1X = this.m_localAnchor1.x - bA.m_sweep.localCenter.x;
  var r1Y = this.m_localAnchor1.y - bA.m_sweep.localCenter.y;
  tX = tMat.col1.x * r1X + tMat.col2.x * r1Y;
  r1Y = tMat.col1.y * r1X + tMat.col2.y * r1Y;
  r1X = tX;
  tMat = bB.m_xf.R;
  var r2X = this.m_localAnchor2.x - bB.m_sweep.localCenter.x;
  var r2Y = this.m_localAnchor2.y - bB.m_sweep.localCenter.y;
  tX = tMat.col1.x * r2X + tMat.col2.x * r2Y;
  r2Y = tMat.col1.y * r2X + tMat.col2.y * r2Y;
  r2X = tX;
  this.m_u.x = bB.m_sweep.c.x + r2X - bA.m_sweep.c.x - r1X;
  this.m_u.y = bB.m_sweep.c.y + r2Y - bA.m_sweep.c.y - r1Y;
  var length = Math.sqrt(this.m_u.x * this.m_u.x + this.m_u.y * this.m_u.y);
  if(length > b2Settings.b2_linearSlop) {
    this.m_u.Multiply(1 / length)
  }else {
    this.m_u.SetZero()
  }
  var cr1u = r1X * this.m_u.y - r1Y * this.m_u.x;
  var cr2u = r2X * this.m_u.y - r2Y * this.m_u.x;
  var invMass = bA.m_invMass + bA.m_invI * cr1u * cr1u + bB.m_invMass + bB.m_invI * cr2u * cr2u;
  this.m_mass = invMass != 0 ? 1 / invMass : 0;
  if(this.m_frequencyHz > 0) {
    var C = length - this.m_length;
    var omega = 2 * Math.PI * this.m_frequencyHz;
    var d = 2 * this.m_mass * this.m_dampingRatio * omega;
    var k = this.m_mass * omega * omega;
    this.m_gamma = step.dt * (d + step.dt * k);
    this.m_gamma = this.m_gamma != 0 ? 1 / this.m_gamma : 0;
    this.m_bias = C * step.dt * k * this.m_gamma;
    this.m_mass = invMass + this.m_gamma;
    this.m_mass = this.m_mass != 0 ? 1 / this.m_mass : 0
  }
  if(step.warmStarting) {
    this.m_impulse *= step.dtRatio;
    var PX = this.m_impulse * this.m_u.x;
    var PY = this.m_impulse * this.m_u.y;
    bA.m_linearVelocity.x -= bA.m_invMass * PX;
    bA.m_linearVelocity.y -= bA.m_invMass * PY;
    bA.m_angularVelocity -= bA.m_invI * (r1X * PY - r1Y * PX);
    bB.m_linearVelocity.x += bB.m_invMass * PX;
    bB.m_linearVelocity.y += bB.m_invMass * PY;
    bB.m_angularVelocity += bB.m_invI * (r2X * PY - r2Y * PX)
  }else {
    this.m_impulse = 0
  }
};
b2DistanceJoint.prototype.SolveVelocityConstraints = function(step) {
  var tMat;
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  tMat = bA.m_xf.R;
  var r1X = this.m_localAnchor1.x - bA.m_sweep.localCenter.x;
  var r1Y = this.m_localAnchor1.y - bA.m_sweep.localCenter.y;
  var tX = tMat.col1.x * r1X + tMat.col2.x * r1Y;
  r1Y = tMat.col1.y * r1X + tMat.col2.y * r1Y;
  r1X = tX;
  tMat = bB.m_xf.R;
  var r2X = this.m_localAnchor2.x - bB.m_sweep.localCenter.x;
  var r2Y = this.m_localAnchor2.y - bB.m_sweep.localCenter.y;
  tX = tMat.col1.x * r2X + tMat.col2.x * r2Y;
  r2Y = tMat.col1.y * r2X + tMat.col2.y * r2Y;
  r2X = tX;
  var v1X = bA.m_linearVelocity.x + -bA.m_angularVelocity * r1Y;
  var v1Y = bA.m_linearVelocity.y + bA.m_angularVelocity * r1X;
  var v2X = bB.m_linearVelocity.x + -bB.m_angularVelocity * r2Y;
  var v2Y = bB.m_linearVelocity.y + bB.m_angularVelocity * r2X;
  var Cdot = this.m_u.x * (v2X - v1X) + this.m_u.y * (v2Y - v1Y);
  var impulse = -this.m_mass * (Cdot + this.m_bias + this.m_gamma * this.m_impulse);
  this.m_impulse += impulse;
  var PX = impulse * this.m_u.x;
  var PY = impulse * this.m_u.y;
  bA.m_linearVelocity.x -= bA.m_invMass * PX;
  bA.m_linearVelocity.y -= bA.m_invMass * PY;
  bA.m_angularVelocity -= bA.m_invI * (r1X * PY - r1Y * PX);
  bB.m_linearVelocity.x += bB.m_invMass * PX;
  bB.m_linearVelocity.y += bB.m_invMass * PY;
  bB.m_angularVelocity += bB.m_invI * (r2X * PY - r2Y * PX)
};
b2DistanceJoint.prototype.SolvePositionConstraints = function(baumgarte) {
  var tMat;
  if(this.m_frequencyHz > 0) {
    return true
  }
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  tMat = bA.m_xf.R;
  var r1X = this.m_localAnchor1.x - bA.m_sweep.localCenter.x;
  var r1Y = this.m_localAnchor1.y - bA.m_sweep.localCenter.y;
  var tX = tMat.col1.x * r1X + tMat.col2.x * r1Y;
  r1Y = tMat.col1.y * r1X + tMat.col2.y * r1Y;
  r1X = tX;
  tMat = bB.m_xf.R;
  var r2X = this.m_localAnchor2.x - bB.m_sweep.localCenter.x;
  var r2Y = this.m_localAnchor2.y - bB.m_sweep.localCenter.y;
  tX = tMat.col1.x * r2X + tMat.col2.x * r2Y;
  r2Y = tMat.col1.y * r2X + tMat.col2.y * r2Y;
  r2X = tX;
  var dX = bB.m_sweep.c.x + r2X - bA.m_sweep.c.x - r1X;
  var dY = bB.m_sweep.c.y + r2Y - bA.m_sweep.c.y - r1Y;
  var length = Math.sqrt(dX * dX + dY * dY);
  dX /= length;
  dY /= length;
  var C = length - this.m_length;
  C = b2Math.Clamp(C, -b2Settings.b2_maxLinearCorrection, b2Settings.b2_maxLinearCorrection);
  var impulse = -this.m_mass * C;
  this.m_u.Set(dX, dY);
  var PX = impulse * this.m_u.x;
  var PY = impulse * this.m_u.y;
  bA.m_sweep.c.x -= bA.m_invMass * PX;
  bA.m_sweep.c.y -= bA.m_invMass * PY;
  bA.m_sweep.a -= bA.m_invI * (r1X * PY - r1Y * PX);
  bB.m_sweep.c.x += bB.m_invMass * PX;
  bB.m_sweep.c.y += bB.m_invMass * PY;
  bB.m_sweep.a += bB.m_invI * (r2X * PY - r2Y * PX);
  bA.SynchronizeTransform();
  bB.SynchronizeTransform();
  return b2Math.Abs(C) < b2Settings.b2_linearSlop
};
b2DistanceJoint.prototype.GetAnchorA = function() {
  return this.m_bodyA.GetWorldPoint(this.m_localAnchor1)
};
b2DistanceJoint.prototype.GetAnchorB = function() {
  return this.m_bodyB.GetWorldPoint(this.m_localAnchor2)
};
b2DistanceJoint.prototype.GetReactionForce = function(inv_dt) {
  return new b2Vec2(inv_dt * this.m_impulse * this.m_u.x, inv_dt * this.m_impulse * this.m_u.y)
};
b2DistanceJoint.prototype.GetReactionTorque = function(inv_dt) {
  return 0
};
b2DistanceJoint.prototype.GetLength = function() {
  return this.m_length
};
b2DistanceJoint.prototype.SetLength = function(length) {
  this.m_length = length
};
b2DistanceJoint.prototype.GetFrequency = function() {
  return this.m_frequencyHz
};
b2DistanceJoint.prototype.SetFrequency = function(hz) {
  this.m_frequencyHz = hz
};
b2DistanceJoint.prototype.GetDampingRatio = function() {
  return this.m_dampingRatio
};
b2DistanceJoint.prototype.SetDampingRatio = function(ratio) {
  this.m_dampingRatio = ratio
};
b2DistanceJoint.prototype.m_localAnchor1 = new b2Vec2;
b2DistanceJoint.prototype.m_localAnchor2 = new b2Vec2;
b2DistanceJoint.prototype.m_u = new b2Vec2;
b2DistanceJoint.prototype.m_frequencyHz = null;
b2DistanceJoint.prototype.m_dampingRatio = null;
b2DistanceJoint.prototype.m_gamma = null;
b2DistanceJoint.prototype.m_bias = null;
b2DistanceJoint.prototype.m_impulse = null;
b2DistanceJoint.prototype.m_mass = null;
b2DistanceJoint.prototype.m_length = null;var b2PulleyJointDef = function() {
  b2JointDef.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2PulleyJointDef.prototype, b2JointDef.prototype);
b2PulleyJointDef.prototype._super = b2JointDef.prototype;
b2PulleyJointDef.prototype.__constructor = function() {
  this._super.__constructor.apply(this, arguments);
  this.type = b2Joint.e_pulleyJoint;
  this.groundAnchorA.Set(-1, 1);
  this.groundAnchorB.Set(1, 1);
  this.localAnchorA.Set(-1, 0);
  this.localAnchorB.Set(1, 0);
  this.lengthA = 0;
  this.maxLengthA = 0;
  this.lengthB = 0;
  this.maxLengthB = 0;
  this.ratio = 1;
  this.collideConnected = true
};
b2PulleyJointDef.prototype.__varz = function() {
  this.groundAnchorA = new b2Vec2;
  this.groundAnchorB = new b2Vec2;
  this.localAnchorA = new b2Vec2;
  this.localAnchorB = new b2Vec2
};
b2PulleyJointDef.prototype.Initialize = function(bA, bB, gaA, gaB, anchorA, anchorB, r) {
  this.bodyA = bA;
  this.bodyB = bB;
  this.groundAnchorA.SetV(gaA);
  this.groundAnchorB.SetV(gaB);
  this.localAnchorA = this.bodyA.GetLocalPoint(anchorA);
  this.localAnchorB = this.bodyB.GetLocalPoint(anchorB);
  var d1X = anchorA.x - gaA.x;
  var d1Y = anchorA.y - gaA.y;
  this.lengthA = Math.sqrt(d1X * d1X + d1Y * d1Y);
  var d2X = anchorB.x - gaB.x;
  var d2Y = anchorB.y - gaB.y;
  this.lengthB = Math.sqrt(d2X * d2X + d2Y * d2Y);
  this.ratio = r;
  var C = this.lengthA + this.ratio * this.lengthB;
  this.maxLengthA = C - this.ratio * b2PulleyJoint.b2_minPulleyLength;
  this.maxLengthB = (C - b2PulleyJoint.b2_minPulleyLength) / this.ratio
};
b2PulleyJointDef.prototype.groundAnchorA = new b2Vec2;
b2PulleyJointDef.prototype.groundAnchorB = new b2Vec2;
b2PulleyJointDef.prototype.localAnchorA = new b2Vec2;
b2PulleyJointDef.prototype.localAnchorB = new b2Vec2;
b2PulleyJointDef.prototype.lengthA = null;
b2PulleyJointDef.prototype.maxLengthA = null;
b2PulleyJointDef.prototype.lengthB = null;
b2PulleyJointDef.prototype.maxLengthB = null;
b2PulleyJointDef.prototype.ratio = null;var b2DistanceJointDef = function() {
  b2JointDef.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2DistanceJointDef.prototype, b2JointDef.prototype);
b2DistanceJointDef.prototype._super = b2JointDef.prototype;
b2DistanceJointDef.prototype.__constructor = function() {
  this._super.__constructor.apply(this, arguments);
  this.type = b2Joint.e_distanceJoint;
  this.length = 1;
  this.frequencyHz = 0;
  this.dampingRatio = 0
};
b2DistanceJointDef.prototype.__varz = function() {
  this.localAnchorA = new b2Vec2;
  this.localAnchorB = new b2Vec2
};
b2DistanceJointDef.prototype.Initialize = function(bA, bB, anchorA, anchorB) {
  this.bodyA = bA;
  this.bodyB = bB;
  this.localAnchorA.SetV(this.bodyA.GetLocalPoint(anchorA));
  this.localAnchorB.SetV(this.bodyB.GetLocalPoint(anchorB));
  var dX = anchorB.x - anchorA.x;
  var dY = anchorB.y - anchorA.y;
  this.length = Math.sqrt(dX * dX + dY * dY);
  this.frequencyHz = 0;
  this.dampingRatio = 0
};
b2DistanceJointDef.prototype.localAnchorA = new b2Vec2;
b2DistanceJointDef.prototype.localAnchorB = new b2Vec2;
b2DistanceJointDef.prototype.length = null;
b2DistanceJointDef.prototype.frequencyHz = null;
b2DistanceJointDef.prototype.dampingRatio = null;var b2FrictionJointDef = function() {
  b2JointDef.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2FrictionJointDef.prototype, b2JointDef.prototype);
b2FrictionJointDef.prototype._super = b2JointDef.prototype;
b2FrictionJointDef.prototype.__constructor = function() {
  this._super.__constructor.apply(this, arguments);
  this.type = b2Joint.e_frictionJoint;
  this.maxForce = 0;
  this.maxTorque = 0
};
b2FrictionJointDef.prototype.__varz = function() {
  this.localAnchorA = new b2Vec2;
  this.localAnchorB = new b2Vec2
};
b2FrictionJointDef.prototype.Initialize = function(bA, bB, anchor) {
  this.bodyA = bA;
  this.bodyB = bB;
  this.localAnchorA.SetV(this.bodyA.GetLocalPoint(anchor));
  this.localAnchorB.SetV(this.bodyB.GetLocalPoint(anchor))
};
b2FrictionJointDef.prototype.localAnchorA = new b2Vec2;
b2FrictionJointDef.prototype.localAnchorB = new b2Vec2;
b2FrictionJointDef.prototype.maxForce = null;
b2FrictionJointDef.prototype.maxTorque = null;var b2WeldJointDef = function() {
  b2JointDef.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2WeldJointDef.prototype, b2JointDef.prototype);
b2WeldJointDef.prototype._super = b2JointDef.prototype;
b2WeldJointDef.prototype.__constructor = function() {
  this._super.__constructor.apply(this, arguments);
  this.type = b2Joint.e_weldJoint;
  this.referenceAngle = 0
};
b2WeldJointDef.prototype.__varz = function() {
  this.localAnchorA = new b2Vec2;
  this.localAnchorB = new b2Vec2
};
b2WeldJointDef.prototype.Initialize = function(bA, bB, anchor) {
  this.bodyA = bA;
  this.bodyB = bB;
  this.localAnchorA.SetV(this.bodyA.GetLocalPoint(anchor));
  this.localAnchorB.SetV(this.bodyB.GetLocalPoint(anchor));
  this.referenceAngle = this.bodyB.GetAngle() - this.bodyA.GetAngle()
};
b2WeldJointDef.prototype.localAnchorA = new b2Vec2;
b2WeldJointDef.prototype.localAnchorB = new b2Vec2;
b2WeldJointDef.prototype.referenceAngle = null;var b2GearJointDef = function() {
  b2JointDef.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2GearJointDef.prototype, b2JointDef.prototype);
b2GearJointDef.prototype._super = b2JointDef.prototype;
b2GearJointDef.prototype.__constructor = function() {
  this._super.__constructor.apply(this, arguments);
  this.type = b2Joint.e_gearJoint;
  this.joint1 = null;
  this.joint2 = null;
  this.ratio = 1
};
b2GearJointDef.prototype.__varz = function() {
};
b2GearJointDef.prototype.joint1 = null;
b2GearJointDef.prototype.joint2 = null;
b2GearJointDef.prototype.ratio = null;var b2Color = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2Color.prototype.__constructor = function(rr, gg, bb) {
  this._r = parseInt(255 * b2Math.Clamp(rr, 0, 1));
  this._g = parseInt(255 * b2Math.Clamp(gg, 0, 1));
  this._b = parseInt(255 * b2Math.Clamp(bb, 0, 1))
};
b2Color.prototype.__varz = function() {
};
b2Color.prototype.Set = function(rr, gg, bb) {
  this._r = parseInt(255 * b2Math.Clamp(rr, 0, 1));
  this._g = parseInt(255 * b2Math.Clamp(gg, 0, 1));
  this._b = parseInt(255 * b2Math.Clamp(bb, 0, 1))
};
b2Color.prototype.__defineGetter__("r", function() {
  return this._r
});
b2Color.prototype.__defineSetter__("r", function(rr) {
  this._r = parseInt(255 * b2Math.Clamp(rr, 0, 1))
});
b2Color.prototype.__defineGetter__("g", function() {
  return this._g
});
b2Color.prototype.__defineSetter__("g", function(gg) {
  this._g = parseInt(255 * b2Math.Clamp(gg, 0, 1))
});
b2Color.prototype.__defineGetter__("b", function() {
  return this._g
});
b2Color.prototype.__defineSetter__("b", function(bb) {
  this._b = parseInt(255 * b2Math.Clamp(bb, 0, 1))
});
b2Color.prototype.__defineGetter__("color", function() {
  return this._r << 16 | this._g << 8 | this._b
});
b2Color.prototype._r = 0;
b2Color.prototype._g = 0;
b2Color.prototype._b = 0;var b2FrictionJoint = function() {
  b2Joint.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2FrictionJoint.prototype, b2Joint.prototype);
b2FrictionJoint.prototype._super = b2Joint.prototype;
b2FrictionJoint.prototype.__constructor = function(def) {
  this._super.__constructor.apply(this, [def]);
  this.m_localAnchorA.SetV(def.localAnchorA);
  this.m_localAnchorB.SetV(def.localAnchorB);
  this.m_linearMass.SetZero();
  this.m_angularMass = 0;
  this.m_linearImpulse.SetZero();
  this.m_angularImpulse = 0;
  this.m_maxForce = def.maxForce;
  this.m_maxTorque = def.maxTorque
};
b2FrictionJoint.prototype.__varz = function() {
  this.m_localAnchorA = new b2Vec2;
  this.m_localAnchorB = new b2Vec2;
  this.m_linearImpulse = new b2Vec2;
  this.m_linearMass = new b2Mat22
};
b2FrictionJoint.prototype.InitVelocityConstraints = function(step) {
  var tMat;
  var tX;
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  tMat = bA.m_xf.R;
  var rAX = this.m_localAnchorA.x - bA.m_sweep.localCenter.x;
  var rAY = this.m_localAnchorA.y - bA.m_sweep.localCenter.y;
  tX = tMat.col1.x * rAX + tMat.col2.x * rAY;
  rAY = tMat.col1.y * rAX + tMat.col2.y * rAY;
  rAX = tX;
  tMat = bB.m_xf.R;
  var rBX = this.m_localAnchorB.x - bB.m_sweep.localCenter.x;
  var rBY = this.m_localAnchorB.y - bB.m_sweep.localCenter.y;
  tX = tMat.col1.x * rBX + tMat.col2.x * rBY;
  rBY = tMat.col1.y * rBX + tMat.col2.y * rBY;
  rBX = tX;
  var mA = bA.m_invMass;
  var mB = bB.m_invMass;
  var iA = bA.m_invI;
  var iB = bB.m_invI;
  var K = new b2Mat22;
  K.col1.x = mA + mB;
  K.col2.x = 0;
  K.col1.y = 0;
  K.col2.y = mA + mB;
  K.col1.x += iA * rAY * rAY;
  K.col2.x += -iA * rAX * rAY;
  K.col1.y += -iA * rAX * rAY;
  K.col2.y += iA * rAX * rAX;
  K.col1.x += iB * rBY * rBY;
  K.col2.x += -iB * rBX * rBY;
  K.col1.y += -iB * rBX * rBY;
  K.col2.y += iB * rBX * rBX;
  K.GetInverse(this.m_linearMass);
  this.m_angularMass = iA + iB;
  if(this.m_angularMass > 0) {
    this.m_angularMass = 1 / this.m_angularMass
  }
  if(step.warmStarting) {
    this.m_linearImpulse.x *= step.dtRatio;
    this.m_linearImpulse.y *= step.dtRatio;
    this.m_angularImpulse *= step.dtRatio;
    var P = this.m_linearImpulse;
    bA.m_linearVelocity.x -= mA * P.x;
    bA.m_linearVelocity.y -= mA * P.y;
    bA.m_angularVelocity -= iA * (rAX * P.y - rAY * P.x + this.m_angularImpulse);
    bB.m_linearVelocity.x += mB * P.x;
    bB.m_linearVelocity.y += mB * P.y;
    bB.m_angularVelocity += iB * (rBX * P.y - rBY * P.x + this.m_angularImpulse)
  }else {
    this.m_linearImpulse.SetZero();
    this.m_angularImpulse = 0
  }
};
b2FrictionJoint.prototype.SolveVelocityConstraints = function(step) {
  var tMat;
  var tX;
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  var vA = bA.m_linearVelocity;
  var wA = bA.m_angularVelocity;
  var vB = bB.m_linearVelocity;
  var wB = bB.m_angularVelocity;
  var mA = bA.m_invMass;
  var mB = bB.m_invMass;
  var iA = bA.m_invI;
  var iB = bB.m_invI;
  tMat = bA.m_xf.R;
  var rAX = this.m_localAnchorA.x - bA.m_sweep.localCenter.x;
  var rAY = this.m_localAnchorA.y - bA.m_sweep.localCenter.y;
  tX = tMat.col1.x * rAX + tMat.col2.x * rAY;
  rAY = tMat.col1.y * rAX + tMat.col2.y * rAY;
  rAX = tX;
  tMat = bB.m_xf.R;
  var rBX = this.m_localAnchorB.x - bB.m_sweep.localCenter.x;
  var rBY = this.m_localAnchorB.y - bB.m_sweep.localCenter.y;
  tX = tMat.col1.x * rBX + tMat.col2.x * rBY;
  rBY = tMat.col1.y * rBX + tMat.col2.y * rBY;
  rBX = tX;
  var maxImpulse;
  var Cdot = wB - wA;
  var impulse = -this.m_angularMass * Cdot;
  var oldImpulse = this.m_angularImpulse;
  maxImpulse = step.dt * this.m_maxTorque;
  this.m_angularImpulse = b2Math.Clamp(this.m_angularImpulse + impulse, -maxImpulse, maxImpulse);
  impulse = this.m_angularImpulse - oldImpulse;
  wA -= iA * impulse;
  wB += iB * impulse;
  var CdotX = vB.x - wB * rBY - vA.x + wA * rAY;
  var CdotY = vB.y + wB * rBX - vA.y - wA * rAX;
  var impulseV = b2Math.MulMV(this.m_linearMass, new b2Vec2(-CdotX, -CdotY));
  var oldImpulseV = this.m_linearImpulse.Copy();
  this.m_linearImpulse.Add(impulseV);
  maxImpulse = step.dt * this.m_maxForce;
  if(this.m_linearImpulse.LengthSquared() > maxImpulse * maxImpulse) {
    this.m_linearImpulse.Normalize();
    this.m_linearImpulse.Multiply(maxImpulse)
  }
  impulseV = b2Math.SubtractVV(this.m_linearImpulse, oldImpulseV);
  vA.x -= mA * impulseV.x;
  vA.y -= mA * impulseV.y;
  wA -= iA * (rAX * impulseV.y - rAY * impulseV.x);
  vB.x += mB * impulseV.x;
  vB.y += mB * impulseV.y;
  wB += iB * (rBX * impulseV.y - rBY * impulseV.x);
  bA.m_angularVelocity = wA;
  bB.m_angularVelocity = wB
};
b2FrictionJoint.prototype.SolvePositionConstraints = function(baumgarte) {
  return true
};
b2FrictionJoint.prototype.GetAnchorA = function() {
  return this.m_bodyA.GetWorldPoint(this.m_localAnchorA)
};
b2FrictionJoint.prototype.GetAnchorB = function() {
  return this.m_bodyB.GetWorldPoint(this.m_localAnchorB)
};
b2FrictionJoint.prototype.GetReactionForce = function(inv_dt) {
  return new b2Vec2(inv_dt * this.m_linearImpulse.x, inv_dt * this.m_linearImpulse.y)
};
b2FrictionJoint.prototype.GetReactionTorque = function(inv_dt) {
  return inv_dt * this.m_angularImpulse
};
b2FrictionJoint.prototype.SetMaxForce = function(force) {
  this.m_maxForce = force
};
b2FrictionJoint.prototype.GetMaxForce = function() {
  return this.m_maxForce
};
b2FrictionJoint.prototype.SetMaxTorque = function(torque) {
  this.m_maxTorque = torque
};
b2FrictionJoint.prototype.GetMaxTorque = function() {
  return this.m_maxTorque
};
b2FrictionJoint.prototype.m_localAnchorA = new b2Vec2;
b2FrictionJoint.prototype.m_localAnchorB = new b2Vec2;
b2FrictionJoint.prototype.m_linearImpulse = new b2Vec2;
b2FrictionJoint.prototype.m_angularImpulse = null;
b2FrictionJoint.prototype.m_maxForce = null;
b2FrictionJoint.prototype.m_maxTorque = null;
b2FrictionJoint.prototype.m_linearMass = new b2Mat22;
b2FrictionJoint.prototype.m_angularMass = null;var b2Distance = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2Distance.prototype.__constructor = function() {
};
b2Distance.prototype.__varz = function() {
};
b2Distance.Distance = function(output, cache, input) {
  ++b2Distance.b2_gjkCalls;
  var proxyA = input.proxyA;
  var proxyB = input.proxyB;
  var transformA = input.transformA;
  var transformB = input.transformB;
  var simplex = b2Distance.s_simplex;
  simplex.ReadCache(cache, proxyA, transformA, proxyB, transformB);
  var vertices = simplex.m_vertices;
  var k_maxIters = 20;
  var saveA = b2Distance.s_saveA;
  var saveB = b2Distance.s_saveB;
  var saveCount = 0;
  var closestPoint = simplex.GetClosestPoint();
  var distanceSqr1 = closestPoint.LengthSquared();
  var distanceSqr2 = distanceSqr1;
  var i = 0;
  var p;
  var iter = 0;
  while(iter < k_maxIters) {
    saveCount = simplex.m_count;
    for(i = 0;i < saveCount;i++) {
      saveA[i] = vertices[i].indexA;
      saveB[i] = vertices[i].indexB
    }
    switch(simplex.m_count) {
      case 1:
        break;
      case 2:
        simplex.Solve2();
        break;
      case 3:
        simplex.Solve3();
        break;
      default:
        b2Settings.b2Assert(false)
    }
    if(simplex.m_count == 3) {
      break
    }
    p = simplex.GetClosestPoint();
    distanceSqr2 = p.LengthSquared();
    if(distanceSqr2 > distanceSqr1) {
    }
    distanceSqr1 = distanceSqr2;
    var d = simplex.GetSearchDirection();
    if(d.LengthSquared() < Number.MIN_VALUE * Number.MIN_VALUE) {
      break
    }
    var vertex = vertices[simplex.m_count];
    vertex.indexA = proxyA.GetSupport(b2Math.MulTMV(transformA.R, d.GetNegative()));
    vertex.wA = b2Math.MulX(transformA, proxyA.GetVertex(vertex.indexA));
    vertex.indexB = proxyB.GetSupport(b2Math.MulTMV(transformB.R, d));
    vertex.wB = b2Math.MulX(transformB, proxyB.GetVertex(vertex.indexB));
    vertex.w = b2Math.SubtractVV(vertex.wB, vertex.wA);
    ++iter;
    ++b2Distance.b2_gjkIters;
    var duplicate = false;
    for(i = 0;i < saveCount;i++) {
      if(vertex.indexA == saveA[i] && vertex.indexB == saveB[i]) {
        duplicate = true;
        break
      }
    }
    if(duplicate) {
      break
    }
    ++simplex.m_count
  }
  b2Distance.b2_gjkMaxIters = b2Math.Max(b2Distance.b2_gjkMaxIters, iter);
  simplex.GetWitnessPoints(output.pointA, output.pointB);
  output.distance = b2Math.SubtractVV(output.pointA, output.pointB).Length();
  output.iterations = iter;
  simplex.WriteCache(cache);
  if(input.useRadii) {
    var rA = proxyA.m_radius;
    var rB = proxyB.m_radius;
    if(output.distance > rA + rB && output.distance > Number.MIN_VALUE) {
      output.distance -= rA + rB;
      var normal = b2Math.SubtractVV(output.pointB, output.pointA);
      normal.Normalize();
      output.pointA.x += rA * normal.x;
      output.pointA.y += rA * normal.y;
      output.pointB.x -= rB * normal.x;
      output.pointB.y -= rB * normal.y
    }else {
      p = new b2Vec2;
      p.x = 0.5 * (output.pointA.x + output.pointB.x);
      p.y = 0.5 * (output.pointA.y + output.pointB.y);
      output.pointA.x = output.pointB.x = p.x;
      output.pointA.y = output.pointB.y = p.y;
      output.distance = 0
    }
  }
};
b2Distance.b2_gjkCalls = 0;
b2Distance.b2_gjkIters = 0;
b2Distance.b2_gjkMaxIters = 0;
b2Distance.s_simplex = new b2Simplex;
b2Distance.s_saveA = new Array(3);
b2Distance.s_saveB = new Array(3);var b2MouseJoint = function() {
  b2Joint.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2MouseJoint.prototype, b2Joint.prototype);
b2MouseJoint.prototype._super = b2Joint.prototype;
b2MouseJoint.prototype.__constructor = function(def) {
  this._super.__constructor.apply(this, [def]);
  this.m_target.SetV(def.target);
  var tX = this.m_target.x - this.m_bodyB.m_xf.position.x;
  var tY = this.m_target.y - this.m_bodyB.m_xf.position.y;
  var tMat = this.m_bodyB.m_xf.R;
  this.m_localAnchor.x = tX * tMat.col1.x + tY * tMat.col1.y;
  this.m_localAnchor.y = tX * tMat.col2.x + tY * tMat.col2.y;
  this.m_maxForce = def.maxForce;
  this.m_impulse.SetZero();
  this.m_frequencyHz = def.frequencyHz;
  this.m_dampingRatio = def.dampingRatio;
  this.m_beta = 0;
  this.m_gamma = 0
};
b2MouseJoint.prototype.__varz = function() {
  this.K = new b2Mat22;
  this.K1 = new b2Mat22;
  this.K2 = new b2Mat22;
  this.m_localAnchor = new b2Vec2;
  this.m_target = new b2Vec2;
  this.m_impulse = new b2Vec2;
  this.m_mass = new b2Mat22;
  this.m_C = new b2Vec2
};
b2MouseJoint.prototype.InitVelocityConstraints = function(step) {
  var b = this.m_bodyB;
  var mass = b.GetMass();
  var omega = 2 * Math.PI * this.m_frequencyHz;
  var d = 2 * mass * this.m_dampingRatio * omega;
  var k = mass * omega * omega;
  this.m_gamma = step.dt * (d + step.dt * k);
  this.m_gamma = this.m_gamma != 0 ? 1 / this.m_gamma : 0;
  this.m_beta = step.dt * k * this.m_gamma;
  var tMat;
  tMat = b.m_xf.R;
  var rX = this.m_localAnchor.x - b.m_sweep.localCenter.x;
  var rY = this.m_localAnchor.y - b.m_sweep.localCenter.y;
  var tX = tMat.col1.x * rX + tMat.col2.x * rY;
  rY = tMat.col1.y * rX + tMat.col2.y * rY;
  rX = tX;
  var invMass = b.m_invMass;
  var invI = b.m_invI;
  this.K1.col1.x = invMass;
  this.K1.col2.x = 0;
  this.K1.col1.y = 0;
  this.K1.col2.y = invMass;
  this.K2.col1.x = invI * rY * rY;
  this.K2.col2.x = -invI * rX * rY;
  this.K2.col1.y = -invI * rX * rY;
  this.K2.col2.y = invI * rX * rX;
  this.K.SetM(this.K1);
  this.K.AddM(this.K2);
  this.K.col1.x += this.m_gamma;
  this.K.col2.y += this.m_gamma;
  this.K.GetInverse(this.m_mass);
  this.m_C.x = b.m_sweep.c.x + rX - this.m_target.x;
  this.m_C.y = b.m_sweep.c.y + rY - this.m_target.y;
  b.m_angularVelocity *= 0.98;
  this.m_impulse.x *= step.dtRatio;
  this.m_impulse.y *= step.dtRatio;
  b.m_linearVelocity.x += invMass * this.m_impulse.x;
  b.m_linearVelocity.y += invMass * this.m_impulse.y;
  b.m_angularVelocity += invI * (rX * this.m_impulse.y - rY * this.m_impulse.x)
};
b2MouseJoint.prototype.SolveVelocityConstraints = function(step) {
  var b = this.m_bodyB;
  var tMat;
  var tX;
  var tY;
  tMat = b.m_xf.R;
  var rX = this.m_localAnchor.x - b.m_sweep.localCenter.x;
  var rY = this.m_localAnchor.y - b.m_sweep.localCenter.y;
  tX = tMat.col1.x * rX + tMat.col2.x * rY;
  rY = tMat.col1.y * rX + tMat.col2.y * rY;
  rX = tX;
  var CdotX = b.m_linearVelocity.x + -b.m_angularVelocity * rY;
  var CdotY = b.m_linearVelocity.y + b.m_angularVelocity * rX;
  tMat = this.m_mass;
  tX = CdotX + this.m_beta * this.m_C.x + this.m_gamma * this.m_impulse.x;
  tY = CdotY + this.m_beta * this.m_C.y + this.m_gamma * this.m_impulse.y;
  var impulseX = -(tMat.col1.x * tX + tMat.col2.x * tY);
  var impulseY = -(tMat.col1.y * tX + tMat.col2.y * tY);
  var oldImpulseX = this.m_impulse.x;
  var oldImpulseY = this.m_impulse.y;
  this.m_impulse.x += impulseX;
  this.m_impulse.y += impulseY;
  var maxImpulse = step.dt * this.m_maxForce;
  if(this.m_impulse.LengthSquared() > maxImpulse * maxImpulse) {
    this.m_impulse.Multiply(maxImpulse / this.m_impulse.Length())
  }
  impulseX = this.m_impulse.x - oldImpulseX;
  impulseY = this.m_impulse.y - oldImpulseY;
  b.m_linearVelocity.x += b.m_invMass * impulseX;
  b.m_linearVelocity.y += b.m_invMass * impulseY;
  b.m_angularVelocity += b.m_invI * (rX * impulseY - rY * impulseX)
};
b2MouseJoint.prototype.SolvePositionConstraints = function(baumgarte) {
  return true
};
b2MouseJoint.prototype.GetAnchorA = function() {
  return this.m_target
};
b2MouseJoint.prototype.GetAnchorB = function() {
  return this.m_bodyB.GetWorldPoint(this.m_localAnchor)
};
b2MouseJoint.prototype.GetReactionForce = function(inv_dt) {
  return new b2Vec2(inv_dt * this.m_impulse.x, inv_dt * this.m_impulse.y)
};
b2MouseJoint.prototype.GetReactionTorque = function(inv_dt) {
  return 0
};
b2MouseJoint.prototype.GetTarget = function() {
  return this.m_target
};
b2MouseJoint.prototype.SetTarget = function(target) {
  if(this.m_bodyB.IsAwake() == false) {
    this.m_bodyB.SetAwake(true)
  }
  this.m_target = target
};
b2MouseJoint.prototype.GetMaxForce = function() {
  return this.m_maxForce
};
b2MouseJoint.prototype.SetMaxForce = function(maxForce) {
  this.m_maxForce = maxForce
};
b2MouseJoint.prototype.GetFrequency = function() {
  return this.m_frequencyHz
};
b2MouseJoint.prototype.SetFrequency = function(hz) {
  this.m_frequencyHz = hz
};
b2MouseJoint.prototype.GetDampingRatio = function() {
  return this.m_dampingRatio
};
b2MouseJoint.prototype.SetDampingRatio = function(ratio) {
  this.m_dampingRatio = ratio
};
b2MouseJoint.prototype.K = new b2Mat22;
b2MouseJoint.prototype.K1 = new b2Mat22;
b2MouseJoint.prototype.K2 = new b2Mat22;
b2MouseJoint.prototype.m_localAnchor = new b2Vec2;
b2MouseJoint.prototype.m_target = new b2Vec2;
b2MouseJoint.prototype.m_impulse = new b2Vec2;
b2MouseJoint.prototype.m_mass = new b2Mat22;
b2MouseJoint.prototype.m_C = new b2Vec2;
b2MouseJoint.prototype.m_maxForce = null;
b2MouseJoint.prototype.m_frequencyHz = null;
b2MouseJoint.prototype.m_dampingRatio = null;
b2MouseJoint.prototype.m_beta = null;
b2MouseJoint.prototype.m_gamma = null;var b2PrismaticJointDef = function() {
  b2JointDef.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2PrismaticJointDef.prototype, b2JointDef.prototype);
b2PrismaticJointDef.prototype._super = b2JointDef.prototype;
b2PrismaticJointDef.prototype.__constructor = function() {
  this._super.__constructor.apply(this, arguments);
  this.type = b2Joint.e_prismaticJoint;
  this.localAxisA.Set(1, 0);
  this.referenceAngle = 0;
  this.enableLimit = false;
  this.lowerTranslation = 0;
  this.upperTranslation = 0;
  this.enableMotor = false;
  this.maxMotorForce = 0;
  this.motorSpeed = 0
};
b2PrismaticJointDef.prototype.__varz = function() {
  this.localAnchorA = new b2Vec2;
  this.localAnchorB = new b2Vec2;
  this.localAxisA = new b2Vec2
};
b2PrismaticJointDef.prototype.Initialize = function(bA, bB, anchor, axis) {
  this.bodyA = bA;
  this.bodyB = bB;
  this.localAnchorA = this.bodyA.GetLocalPoint(anchor);
  this.localAnchorB = this.bodyB.GetLocalPoint(anchor);
  this.localAxisA = this.bodyA.GetLocalVector(axis);
  this.referenceAngle = this.bodyB.GetAngle() - this.bodyA.GetAngle()
};
b2PrismaticJointDef.prototype.localAnchorA = new b2Vec2;
b2PrismaticJointDef.prototype.localAnchorB = new b2Vec2;
b2PrismaticJointDef.prototype.localAxisA = new b2Vec2;
b2PrismaticJointDef.prototype.referenceAngle = null;
b2PrismaticJointDef.prototype.enableLimit = null;
b2PrismaticJointDef.prototype.lowerTranslation = null;
b2PrismaticJointDef.prototype.upperTranslation = null;
b2PrismaticJointDef.prototype.enableMotor = null;
b2PrismaticJointDef.prototype.maxMotorForce = null;
b2PrismaticJointDef.prototype.motorSpeed = null;var b2TimeOfImpact = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2TimeOfImpact.prototype.__constructor = function() {
};
b2TimeOfImpact.prototype.__varz = function() {
};
b2TimeOfImpact.TimeOfImpact = function(input) {
  ++b2TimeOfImpact.b2_toiCalls;
  var proxyA = input.proxyA;
  var proxyB = input.proxyB;
  var sweepA = input.sweepA;
  var sweepB = input.sweepB;
  b2Settings.b2Assert(sweepA.t0 == sweepB.t0);
  b2Settings.b2Assert(1 - sweepA.t0 > Number.MIN_VALUE);
  var radius = proxyA.m_radius + proxyB.m_radius;
  var tolerance = input.tolerance;
  var alpha = 0;
  var k_maxIterations = 1E3;
  var iter = 0;
  var target = 0;
  b2TimeOfImpact.s_cache.count = 0;
  b2TimeOfImpact.s_distanceInput.useRadii = false;
  for(;;) {
    sweepA.GetTransform(b2TimeOfImpact.s_xfA, alpha);
    sweepB.GetTransform(b2TimeOfImpact.s_xfB, alpha);
    b2TimeOfImpact.s_distanceInput.proxyA = proxyA;
    b2TimeOfImpact.s_distanceInput.proxyB = proxyB;
    b2TimeOfImpact.s_distanceInput.transformA = b2TimeOfImpact.s_xfA;
    b2TimeOfImpact.s_distanceInput.transformB = b2TimeOfImpact.s_xfB;
    b2Distance.Distance(b2TimeOfImpact.s_distanceOutput, b2TimeOfImpact.s_cache, b2TimeOfImpact.s_distanceInput);
    if(b2TimeOfImpact.s_distanceOutput.distance <= 0) {
      alpha = 1;
      break
    }
    b2TimeOfImpact.s_fcn.Initialize(b2TimeOfImpact.s_cache, proxyA, b2TimeOfImpact.s_xfA, proxyB, b2TimeOfImpact.s_xfB);
    var separation = b2TimeOfImpact.s_fcn.Evaluate(b2TimeOfImpact.s_xfA, b2TimeOfImpact.s_xfB);
    if(separation <= 0) {
      alpha = 1;
      break
    }
    if(iter == 0) {
      if(separation > radius) {
        target = b2Math.Max(radius - tolerance, 0.75 * radius)
      }else {
        target = b2Math.Max(separation - tolerance, 0.02 * radius)
      }
    }
    if(separation - target < 0.5 * tolerance) {
      if(iter == 0) {
        alpha = 1;
        break
      }
      break
    }
    var newAlpha = alpha;
    var x1 = alpha;
    var x2 = 1;
    var f1 = separation;
    sweepA.GetTransform(b2TimeOfImpact.s_xfA, x2);
    sweepB.GetTransform(b2TimeOfImpact.s_xfB, x2);
    var f2 = b2TimeOfImpact.s_fcn.Evaluate(b2TimeOfImpact.s_xfA, b2TimeOfImpact.s_xfB);
    if(f2 >= target) {
      alpha = 1;
      break
    }
    var rootIterCount = 0;
    for(;;) {
      var x;
      if(rootIterCount & 1) {
        x = x1 + (target - f1) * (x2 - x1) / (f2 - f1)
      }else {
        x = 0.5 * (x1 + x2)
      }
      sweepA.GetTransform(b2TimeOfImpact.s_xfA, x);
      sweepB.GetTransform(b2TimeOfImpact.s_xfB, x);
      var f = b2TimeOfImpact.s_fcn.Evaluate(b2TimeOfImpact.s_xfA, b2TimeOfImpact.s_xfB);
      if(b2Math.Abs(f - target) < 0.025 * tolerance) {
        newAlpha = x;
        break
      }
      if(f > target) {
        x1 = x;
        f1 = f
      }else {
        x2 = x;
        f2 = f
      }
      ++rootIterCount;
      ++b2TimeOfImpact.b2_toiRootIters;
      if(rootIterCount == 50) {
        break
      }
    }
    b2TimeOfImpact.b2_toiMaxRootIters = b2Math.Max(b2TimeOfImpact.b2_toiMaxRootIters, rootIterCount);
    if(newAlpha < (1 + 100 * Number.MIN_VALUE) * alpha) {
      break
    }
    alpha = newAlpha;
    iter++;
    ++b2TimeOfImpact.b2_toiIters;
    if(iter == k_maxIterations) {
      break
    }
  }
  b2TimeOfImpact.b2_toiMaxIters = b2Math.Max(b2TimeOfImpact.b2_toiMaxIters, iter);
  return alpha
};
b2TimeOfImpact.b2_toiCalls = 0;
b2TimeOfImpact.b2_toiIters = 0;
b2TimeOfImpact.b2_toiMaxIters = 0;
b2TimeOfImpact.b2_toiRootIters = 0;
b2TimeOfImpact.b2_toiMaxRootIters = 0;
b2TimeOfImpact.s_cache = new b2SimplexCache;
b2TimeOfImpact.s_distanceInput = new b2DistanceInput;
b2TimeOfImpact.s_xfA = new b2Transform;
b2TimeOfImpact.s_xfB = new b2Transform;
b2TimeOfImpact.s_fcn = new b2SeparationFunction;
b2TimeOfImpact.s_distanceOutput = new b2DistanceOutput;var b2GearJoint = function() {
  b2Joint.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2GearJoint.prototype, b2Joint.prototype);
b2GearJoint.prototype._super = b2Joint.prototype;
b2GearJoint.prototype.__constructor = function(def) {
  this._super.__constructor.apply(this, [def]);
  var type1 = def.joint1.m_type;
  var type2 = def.joint2.m_type;
  this.m_revolute1 = null;
  this.m_prismatic1 = null;
  this.m_revolute2 = null;
  this.m_prismatic2 = null;
  var coordinate1;
  var coordinate2;
  this.m_ground1 = def.joint1.GetBodyA();
  this.m_bodyA = def.joint1.GetBodyB();
  if(type1 == b2Joint.e_revoluteJoint) {
    this.m_revolute1 = def.joint1;
    this.m_groundAnchor1.SetV(this.m_revolute1.m_localAnchor1);
    this.m_localAnchor1.SetV(this.m_revolute1.m_localAnchor2);
    coordinate1 = this.m_revolute1.GetJointAngle()
  }else {
    this.m_prismatic1 = def.joint1;
    this.m_groundAnchor1.SetV(this.m_prismatic1.m_localAnchor1);
    this.m_localAnchor1.SetV(this.m_prismatic1.m_localAnchor2);
    coordinate1 = this.m_prismatic1.GetJointTranslation()
  }
  this.m_ground2 = def.joint2.GetBodyA();
  this.m_bodyB = def.joint2.GetBodyB();
  if(type2 == b2Joint.e_revoluteJoint) {
    this.m_revolute2 = def.joint2;
    this.m_groundAnchor2.SetV(this.m_revolute2.m_localAnchor1);
    this.m_localAnchor2.SetV(this.m_revolute2.m_localAnchor2);
    coordinate2 = this.m_revolute2.GetJointAngle()
  }else {
    this.m_prismatic2 = def.joint2;
    this.m_groundAnchor2.SetV(this.m_prismatic2.m_localAnchor1);
    this.m_localAnchor2.SetV(this.m_prismatic2.m_localAnchor2);
    coordinate2 = this.m_prismatic2.GetJointTranslation()
  }
  this.m_ratio = def.ratio;
  this.m_constant = coordinate1 + this.m_ratio * coordinate2;
  this.m_impulse = 0
};
b2GearJoint.prototype.__varz = function() {
  this.m_groundAnchor1 = new b2Vec2;
  this.m_groundAnchor2 = new b2Vec2;
  this.m_localAnchor1 = new b2Vec2;
  this.m_localAnchor2 = new b2Vec2;
  this.m_J = new b2Jacobian
};
b2GearJoint.prototype.InitVelocityConstraints = function(step) {
  var g1 = this.m_ground1;
  var g2 = this.m_ground2;
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  var ugX;
  var ugY;
  var rX;
  var rY;
  var tMat;
  var tVec;
  var crug;
  var tX;
  var K = 0;
  this.m_J.SetZero();
  if(this.m_revolute1) {
    this.m_J.angularA = -1;
    K += bA.m_invI
  }else {
    tMat = g1.m_xf.R;
    tVec = this.m_prismatic1.m_localXAxis1;
    ugX = tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
    ugY = tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
    tMat = bA.m_xf.R;
    rX = this.m_localAnchor1.x - bA.m_sweep.localCenter.x;
    rY = this.m_localAnchor1.y - bA.m_sweep.localCenter.y;
    tX = tMat.col1.x * rX + tMat.col2.x * rY;
    rY = tMat.col1.y * rX + tMat.col2.y * rY;
    rX = tX;
    crug = rX * ugY - rY * ugX;
    this.m_J.linearA.Set(-ugX, -ugY);
    this.m_J.angularA = -crug;
    K += bA.m_invMass + bA.m_invI * crug * crug
  }
  if(this.m_revolute2) {
    this.m_J.angularB = -this.m_ratio;
    K += this.m_ratio * this.m_ratio * bB.m_invI
  }else {
    tMat = g2.m_xf.R;
    tVec = this.m_prismatic2.m_localXAxis1;
    ugX = tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
    ugY = tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
    tMat = bB.m_xf.R;
    rX = this.m_localAnchor2.x - bB.m_sweep.localCenter.x;
    rY = this.m_localAnchor2.y - bB.m_sweep.localCenter.y;
    tX = tMat.col1.x * rX + tMat.col2.x * rY;
    rY = tMat.col1.y * rX + tMat.col2.y * rY;
    rX = tX;
    crug = rX * ugY - rY * ugX;
    this.m_J.linearB.Set(-this.m_ratio * ugX, -this.m_ratio * ugY);
    this.m_J.angularB = -this.m_ratio * crug;
    K += this.m_ratio * this.m_ratio * (bB.m_invMass + bB.m_invI * crug * crug)
  }
  this.m_mass = K > 0 ? 1 / K : 0;
  if(step.warmStarting) {
    bA.m_linearVelocity.x += bA.m_invMass * this.m_impulse * this.m_J.linearA.x;
    bA.m_linearVelocity.y += bA.m_invMass * this.m_impulse * this.m_J.linearA.y;
    bA.m_angularVelocity += bA.m_invI * this.m_impulse * this.m_J.angularA;
    bB.m_linearVelocity.x += bB.m_invMass * this.m_impulse * this.m_J.linearB.x;
    bB.m_linearVelocity.y += bB.m_invMass * this.m_impulse * this.m_J.linearB.y;
    bB.m_angularVelocity += bB.m_invI * this.m_impulse * this.m_J.angularB
  }else {
    this.m_impulse = 0
  }
};
b2GearJoint.prototype.SolveVelocityConstraints = function(step) {
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  var Cdot = this.m_J.Compute(bA.m_linearVelocity, bA.m_angularVelocity, bB.m_linearVelocity, bB.m_angularVelocity);
  var impulse = -this.m_mass * Cdot;
  this.m_impulse += impulse;
  bA.m_linearVelocity.x += bA.m_invMass * impulse * this.m_J.linearA.x;
  bA.m_linearVelocity.y += bA.m_invMass * impulse * this.m_J.linearA.y;
  bA.m_angularVelocity += bA.m_invI * impulse * this.m_J.angularA;
  bB.m_linearVelocity.x += bB.m_invMass * impulse * this.m_J.linearB.x;
  bB.m_linearVelocity.y += bB.m_invMass * impulse * this.m_J.linearB.y;
  bB.m_angularVelocity += bB.m_invI * impulse * this.m_J.angularB
};
b2GearJoint.prototype.SolvePositionConstraints = function(baumgarte) {
  var linearError = 0;
  var bA = this.m_bodyA;
  var bB = this.m_bodyB;
  var coordinate1;
  var coordinate2;
  if(this.m_revolute1) {
    coordinate1 = this.m_revolute1.GetJointAngle()
  }else {
    coordinate1 = this.m_prismatic1.GetJointTranslation()
  }
  if(this.m_revolute2) {
    coordinate2 = this.m_revolute2.GetJointAngle()
  }else {
    coordinate2 = this.m_prismatic2.GetJointTranslation()
  }
  var C = this.m_constant - (coordinate1 + this.m_ratio * coordinate2);
  var impulse = -this.m_mass * C;
  bA.m_sweep.c.x += bA.m_invMass * impulse * this.m_J.linearA.x;
  bA.m_sweep.c.y += bA.m_invMass * impulse * this.m_J.linearA.y;
  bA.m_sweep.a += bA.m_invI * impulse * this.m_J.angularA;
  bB.m_sweep.c.x += bB.m_invMass * impulse * this.m_J.linearB.x;
  bB.m_sweep.c.y += bB.m_invMass * impulse * this.m_J.linearB.y;
  bB.m_sweep.a += bB.m_invI * impulse * this.m_J.angularB;
  bA.SynchronizeTransform();
  bB.SynchronizeTransform();
  return linearError < b2Settings.b2_linearSlop
};
b2GearJoint.prototype.GetAnchorA = function() {
  return this.m_bodyA.GetWorldPoint(this.m_localAnchor1)
};
b2GearJoint.prototype.GetAnchorB = function() {
  return this.m_bodyB.GetWorldPoint(this.m_localAnchor2)
};
b2GearJoint.prototype.GetReactionForce = function(inv_dt) {
  return new b2Vec2(inv_dt * this.m_impulse * this.m_J.linearB.x, inv_dt * this.m_impulse * this.m_J.linearB.y)
};
b2GearJoint.prototype.GetReactionTorque = function(inv_dt) {
  var tMat = this.m_bodyB.m_xf.R;
  var rX = this.m_localAnchor1.x - this.m_bodyB.m_sweep.localCenter.x;
  var rY = this.m_localAnchor1.y - this.m_bodyB.m_sweep.localCenter.y;
  var tX = tMat.col1.x * rX + tMat.col2.x * rY;
  rY = tMat.col1.y * rX + tMat.col2.y * rY;
  rX = tX;
  var PX = this.m_impulse * this.m_J.linearB.x;
  var PY = this.m_impulse * this.m_J.linearB.y;
  return inv_dt * (this.m_impulse * this.m_J.angularB - rX * PY + rY * PX)
};
b2GearJoint.prototype.GetRatio = function() {
  return this.m_ratio
};
b2GearJoint.prototype.SetRatio = function(ratio) {
  this.m_ratio = ratio
};
b2GearJoint.prototype.m_ground1 = null;
b2GearJoint.prototype.m_ground2 = null;
b2GearJoint.prototype.m_revolute1 = null;
b2GearJoint.prototype.m_prismatic1 = null;
b2GearJoint.prototype.m_revolute2 = null;
b2GearJoint.prototype.m_prismatic2 = null;
b2GearJoint.prototype.m_groundAnchor1 = new b2Vec2;
b2GearJoint.prototype.m_groundAnchor2 = new b2Vec2;
b2GearJoint.prototype.m_localAnchor1 = new b2Vec2;
b2GearJoint.prototype.m_localAnchor2 = new b2Vec2;
b2GearJoint.prototype.m_J = new b2Jacobian;
b2GearJoint.prototype.m_constant = null;
b2GearJoint.prototype.m_ratio = null;
b2GearJoint.prototype.m_mass = null;
b2GearJoint.prototype.m_impulse = null;var b2TOIInput = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2TOIInput.prototype.__constructor = function() {
};
b2TOIInput.prototype.__varz = function() {
  this.proxyA = new b2DistanceProxy;
  this.proxyB = new b2DistanceProxy;
  this.sweepA = new b2Sweep;
  this.sweepB = new b2Sweep
};
b2TOIInput.prototype.proxyA = new b2DistanceProxy;
b2TOIInput.prototype.proxyB = new b2DistanceProxy;
b2TOIInput.prototype.sweepA = new b2Sweep;
b2TOIInput.prototype.sweepB = new b2Sweep;
b2TOIInput.prototype.tolerance = null;var b2RevoluteJointDef = function() {
  b2JointDef.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2RevoluteJointDef.prototype, b2JointDef.prototype);
b2RevoluteJointDef.prototype._super = b2JointDef.prototype;
b2RevoluteJointDef.prototype.__constructor = function() {
  this._super.__constructor.apply(this, arguments);
  this.type = b2Joint.e_revoluteJoint;
  this.localAnchorA.Set(0, 0);
  this.localAnchorB.Set(0, 0);
  this.referenceAngle = 0;
  this.lowerAngle = 0;
  this.upperAngle = 0;
  this.maxMotorTorque = 0;
  this.motorSpeed = 0;
  this.enableLimit = false;
  this.enableMotor = false
};
b2RevoluteJointDef.prototype.__varz = function() {
  this.localAnchorA = new b2Vec2;
  this.localAnchorB = new b2Vec2
};
b2RevoluteJointDef.prototype.Initialize = function(bA, bB, anchor) {
  this.bodyA = bA;
  this.bodyB = bB;
  this.localAnchorA = this.bodyA.GetLocalPoint(anchor);
  this.localAnchorB = this.bodyB.GetLocalPoint(anchor);
  this.referenceAngle = this.bodyB.GetAngle() - this.bodyA.GetAngle()
};
b2RevoluteJointDef.prototype.localAnchorA = new b2Vec2;
b2RevoluteJointDef.prototype.localAnchorB = new b2Vec2;
b2RevoluteJointDef.prototype.referenceAngle = null;
b2RevoluteJointDef.prototype.enableLimit = null;
b2RevoluteJointDef.prototype.lowerAngle = null;
b2RevoluteJointDef.prototype.upperAngle = null;
b2RevoluteJointDef.prototype.enableMotor = null;
b2RevoluteJointDef.prototype.motorSpeed = null;
b2RevoluteJointDef.prototype.maxMotorTorque = null;var b2MouseJointDef = function() {
  b2JointDef.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2MouseJointDef.prototype, b2JointDef.prototype);
b2MouseJointDef.prototype._super = b2JointDef.prototype;
b2MouseJointDef.prototype.__constructor = function() {
  this._super.__constructor.apply(this, arguments);
  this.type = b2Joint.e_mouseJoint;
  this.maxForce = 0;
  this.frequencyHz = 5;
  this.dampingRatio = 0.7
};
b2MouseJointDef.prototype.__varz = function() {
  this.target = new b2Vec2
};
b2MouseJointDef.prototype.target = new b2Vec2;
b2MouseJointDef.prototype.maxForce = null;
b2MouseJointDef.prototype.frequencyHz = null;
b2MouseJointDef.prototype.dampingRatio = null;var b2Contact = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2Contact.prototype.__constructor = function() {
};
b2Contact.prototype.__varz = function() {
  this.m_nodeA = new b2ContactEdge;
  this.m_nodeB = new b2ContactEdge;
  this.m_manifold = new b2Manifold;
  this.m_oldManifold = new b2Manifold
};
b2Contact.s_input = new b2TOIInput;
b2Contact.e_sensorFlag = 1;
b2Contact.e_continuousFlag = 2;
b2Contact.e_islandFlag = 4;
b2Contact.e_toiFlag = 8;
b2Contact.e_touchingFlag = 16;
b2Contact.e_enabledFlag = 32;
b2Contact.e_filterFlag = 64;
b2Contact.prototype.Reset = function(fixtureA, fixtureB) {
  this.m_flags = b2Contact.e_enabledFlag;
  if(!fixtureA || !fixtureB) {
    this.m_fixtureA = null;
    this.m_fixtureB = null;
    return
  }
  if(fixtureA.IsSensor() || fixtureB.IsSensor()) {
    this.m_flags |= b2Contact.e_sensorFlag
  }
  var bodyA = fixtureA.GetBody();
  var bodyB = fixtureB.GetBody();
  if(bodyA.GetType() != b2Body.b2_dynamicBody || bodyA.IsBullet() || bodyB.GetType() != b2Body.b2_dynamicBody || bodyB.IsBullet()) {
    this.m_flags |= b2Contact.e_continuousFlag
  }
  this.m_fixtureA = fixtureA;
  this.m_fixtureB = fixtureB;
  this.m_manifold.m_pointCount = 0;
  this.m_prev = null;
  this.m_next = null;
  this.m_nodeA.contact = null;
  this.m_nodeA.prev = null;
  this.m_nodeA.next = null;
  this.m_nodeA.other = null;
  this.m_nodeB.contact = null;
  this.m_nodeB.prev = null;
  this.m_nodeB.next = null;
  this.m_nodeB.other = null
};
b2Contact.prototype.Update = function(listener) {
  var tManifold = this.m_oldManifold;
  this.m_oldManifold = this.m_manifold;
  this.m_manifold = tManifold;
  this.m_flags |= b2Contact.e_enabledFlag;
  var touching = false;
  var wasTouching = (this.m_flags & b2Contact.e_touchingFlag) == b2Contact.e_touchingFlag;
  var bodyA = this.m_fixtureA.m_body;
  var bodyB = this.m_fixtureB.m_body;
  var aabbOverlap = this.m_fixtureA.m_aabb.TestOverlap(this.m_fixtureB.m_aabb);
  if(this.m_flags & b2Contact.e_sensorFlag) {
    if(aabbOverlap) {
      var shapeA = this.m_fixtureA.GetShape();
      var shapeB = this.m_fixtureB.GetShape();
      var xfA = bodyA.GetTransform();
      var xfB = bodyB.GetTransform();
      touching = b2Shape.TestOverlap(shapeA, xfA, shapeB, xfB)
    }
    this.m_manifold.m_pointCount = 0
  }else {
    if(bodyA.GetType() != b2Body.b2_dynamicBody || bodyA.IsBullet() || bodyB.GetType() != b2Body.b2_dynamicBody || bodyB.IsBullet()) {
      this.m_flags |= b2Contact.e_continuousFlag
    }else {
      this.m_flags &= ~b2Contact.e_continuousFlag
    }
    if(aabbOverlap) {
      this.Evaluate();
      touching = this.m_manifold.m_pointCount > 0;
      for(var i = 0;i < this.m_manifold.m_pointCount;++i) {
        var mp2 = this.m_manifold.m_points[i];
        mp2.m_normalImpulse = 0;
        mp2.m_tangentImpulse = 0;
        var id2 = mp2.m_id;
        for(var j = 0;j < this.m_oldManifold.m_pointCount;++j) {
          var mp1 = this.m_oldManifold.m_points[j];
          if(mp1.m_id.key == id2.key) {
            mp2.m_normalImpulse = mp1.m_normalImpulse;
            mp2.m_tangentImpulse = mp1.m_tangentImpulse;
            break
          }
        }
      }
    }else {
      this.m_manifold.m_pointCount = 0
    }
    if(touching != wasTouching) {
      bodyA.SetAwake(true);
      bodyB.SetAwake(true)
    }
  }
  if(touching) {
    this.m_flags |= b2Contact.e_touchingFlag
  }else {
    this.m_flags &= ~b2Contact.e_touchingFlag
  }
  if(wasTouching == false && touching == true) {
    listener.BeginContact(this)
  }
  if(wasTouching == true && touching == false) {
    listener.EndContact(this)
  }
  if((this.m_flags & b2Contact.e_sensorFlag) == 0) {
    listener.PreSolve(this, this.m_oldManifold)
  }
};
b2Contact.prototype.Evaluate = function() {
};
b2Contact.prototype.ComputeTOI = function(sweepA, sweepB) {
  b2Contact.s_input.proxyA.Set(this.m_fixtureA.GetShape());
  b2Contact.s_input.proxyB.Set(this.m_fixtureB.GetShape());
  b2Contact.s_input.sweepA = sweepA;
  b2Contact.s_input.sweepB = sweepB;
  b2Contact.s_input.tolerance = b2Settings.b2_linearSlop;
  return b2TimeOfImpact.TimeOfImpact(b2Contact.s_input)
};
b2Contact.prototype.GetManifold = function() {
  return this.m_manifold
};
b2Contact.prototype.GetWorldManifold = function(worldManifold) {
  var bodyA = this.m_fixtureA.GetBody();
  var bodyB = this.m_fixtureB.GetBody();
  var shapeA = this.m_fixtureA.GetShape();
  var shapeB = this.m_fixtureB.GetShape();
  worldManifold.Initialize(this.m_manifold, bodyA.GetTransform(), shapeA.m_radius, bodyB.GetTransform(), shapeB.m_radius)
};
b2Contact.prototype.IsTouching = function() {
  return(this.m_flags & b2Contact.e_touchingFlag) == b2Contact.e_touchingFlag
};
b2Contact.prototype.IsContinuous = function() {
  return(this.m_flags & b2Contact.e_continuousFlag) == b2Contact.e_continuousFlag
};
b2Contact.prototype.SetSensor = function(sensor) {
  if(sensor) {
    this.m_flags |= b2Contact.e_sensorFlag
  }else {
    this.m_flags &= ~b2Contact.e_sensorFlag
  }
};
b2Contact.prototype.IsSensor = function() {
  return(this.m_flags & b2Contact.e_sensorFlag) == b2Contact.e_sensorFlag
};
b2Contact.prototype.SetEnabled = function(flag) {
  if(flag) {
    this.m_flags |= b2Contact.e_enabledFlag
  }else {
    this.m_flags &= ~b2Contact.e_enabledFlag
  }
};
b2Contact.prototype.IsEnabled = function() {
  return(this.m_flags & b2Contact.e_enabledFlag) == b2Contact.e_enabledFlag
};
b2Contact.prototype.GetNext = function() {
  return this.m_next
};
b2Contact.prototype.GetFixtureA = function() {
  return this.m_fixtureA
};
b2Contact.prototype.GetFixtureB = function() {
  return this.m_fixtureB
};
b2Contact.prototype.FlagForFiltering = function() {
  this.m_flags |= b2Contact.e_filterFlag
};
b2Contact.prototype.m_flags = 0;
b2Contact.prototype.m_prev = null;
b2Contact.prototype.m_next = null;
b2Contact.prototype.m_nodeA = new b2ContactEdge;
b2Contact.prototype.m_nodeB = new b2ContactEdge;
b2Contact.prototype.m_fixtureA = null;
b2Contact.prototype.m_fixtureB = null;
b2Contact.prototype.m_manifold = new b2Manifold;
b2Contact.prototype.m_oldManifold = new b2Manifold;
b2Contact.prototype.m_toi = null;var b2ContactConstraint = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2ContactConstraint.prototype.__constructor = function() {
  this.points = new Array(b2Settings.b2_maxManifoldPoints);
  for(var i = 0;i < b2Settings.b2_maxManifoldPoints;i++) {
    this.points[i] = new b2ContactConstraintPoint
  }
};
b2ContactConstraint.prototype.__varz = function() {
  this.localPlaneNormal = new b2Vec2;
  this.localPoint = new b2Vec2;
  this.normal = new b2Vec2;
  this.normalMass = new b2Mat22;
  this.K = new b2Mat22
};
b2ContactConstraint.prototype.points = null;
b2ContactConstraint.prototype.localPlaneNormal = new b2Vec2;
b2ContactConstraint.prototype.localPoint = new b2Vec2;
b2ContactConstraint.prototype.normal = new b2Vec2;
b2ContactConstraint.prototype.normalMass = new b2Mat22;
b2ContactConstraint.prototype.K = new b2Mat22;
b2ContactConstraint.prototype.bodyA = null;
b2ContactConstraint.prototype.bodyB = null;
b2ContactConstraint.prototype.type = 0;
b2ContactConstraint.prototype.radius = null;
b2ContactConstraint.prototype.friction = null;
b2ContactConstraint.prototype.restitution = null;
b2ContactConstraint.prototype.pointCount = 0;
b2ContactConstraint.prototype.manifold = null;var b2ContactResult = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2ContactResult.prototype.__constructor = function() {
};
b2ContactResult.prototype.__varz = function() {
  this.position = new b2Vec2;
  this.normal = new b2Vec2;
  this.id = new b2ContactID
};
b2ContactResult.prototype.shape1 = null;
b2ContactResult.prototype.shape2 = null;
b2ContactResult.prototype.position = new b2Vec2;
b2ContactResult.prototype.normal = new b2Vec2;
b2ContactResult.prototype.normalImpulse = null;
b2ContactResult.prototype.tangentImpulse = null;
b2ContactResult.prototype.id = new b2ContactID;var b2PolygonContact = function() {
  b2Contact.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2PolygonContact.prototype, b2Contact.prototype);
b2PolygonContact.prototype._super = b2Contact.prototype;
b2PolygonContact.prototype.__constructor = function() {
  this._super.__constructor.apply(this, arguments)
};
b2PolygonContact.prototype.__varz = function() {
};
b2PolygonContact.Create = function(allocator) {
  return new b2PolygonContact
};
b2PolygonContact.Destroy = function(contact, allocator) {
};
b2PolygonContact.prototype.Evaluate = function() {
  var bA = this.m_fixtureA.GetBody();
  var bB = this.m_fixtureB.GetBody();
  b2Collision.CollidePolygons(this.m_manifold, this.m_fixtureA.GetShape(), bA.m_xf, this.m_fixtureB.GetShape(), bB.m_xf)
};
b2PolygonContact.prototype.Reset = function(fixtureA, fixtureB) {
  this._super.Reset.apply(this, [fixtureA, fixtureB])
};var ClipVertex = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
ClipVertex.prototype.__constructor = function() {
};
ClipVertex.prototype.__varz = function() {
  this.v = new b2Vec2;
  this.id = new b2ContactID
};
ClipVertex.prototype.Set = function(other) {
  this.v.SetV(other.v);
  this.id.Set(other.id)
};
ClipVertex.prototype.v = new b2Vec2;
ClipVertex.prototype.id = new b2ContactID;var b2ContactFilter = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2ContactFilter.prototype.__constructor = function() {
};
b2ContactFilter.prototype.__varz = function() {
};
b2ContactFilter.b2_defaultFilter = new b2ContactFilter;
b2ContactFilter.prototype.ShouldCollide = function(fixtureA, fixtureB) {
  var filter1 = fixtureA.GetFilterData();
  var filter2 = fixtureB.GetFilterData();
  if(filter1.groupIndex == filter2.groupIndex && filter1.groupIndex != 0) {
    return filter1.groupIndex > 0
  }
  var collide = (filter1.maskBits & filter2.categoryBits) != 0 && (filter1.categoryBits & filter2.maskBits) != 0;
  return collide
};
b2ContactFilter.prototype.RayCollide = function(userData, fixture) {
  if(!userData) {
    return true
  }
  return this.ShouldCollide(userData, fixture)
};var b2NullContact = function() {
  b2Contact.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2NullContact.prototype, b2Contact.prototype);
b2NullContact.prototype._super = b2Contact.prototype;
b2NullContact.prototype.__constructor = function() {
  this._super.__constructor.apply(this, arguments)
};
b2NullContact.prototype.__varz = function() {
};
b2NullContact.prototype.Evaluate = function() {
};var b2ContactListener = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2ContactListener.prototype.__constructor = function() {
};
b2ContactListener.prototype.__varz = function() {
};
b2ContactListener.b2_defaultListener = new b2ContactListener;
b2ContactListener.prototype.BeginContact = function(contact) {
};
b2ContactListener.prototype.EndContact = function(contact) {
};
b2ContactListener.prototype.PreSolve = function(contact, oldManifold) {
};
b2ContactListener.prototype.PostSolve = function(contact, impulse) {
};var b2Island = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2Island.prototype.__constructor = function() {
  this.m_bodies = new Array;
  this.m_contacts = new Array;
  this.m_joints = new Array
};
b2Island.prototype.__varz = function() {
};
b2Island.s_impulse = new b2ContactImpulse;
b2Island.prototype.Initialize = function(bodyCapacity, contactCapacity, jointCapacity, allocator, listener, contactSolver) {
  var i = 0;
  this.m_bodyCapacity = bodyCapacity;
  this.m_contactCapacity = contactCapacity;
  this.m_jointCapacity = jointCapacity;
  this.m_bodyCount = 0;
  this.m_contactCount = 0;
  this.m_jointCount = 0;
  this.m_allocator = allocator;
  this.m_listener = listener;
  this.m_contactSolver = contactSolver;
  for(i = this.m_bodies.length;i < bodyCapacity;i++) {
    this.m_bodies[i] = null
  }
  for(i = this.m_contacts.length;i < contactCapacity;i++) {
    this.m_contacts[i] = null
  }
  for(i = this.m_joints.length;i < jointCapacity;i++) {
    this.m_joints[i] = null
  }
};
b2Island.prototype.Clear = function() {
  this.m_bodyCount = 0;
  this.m_contactCount = 0;
  this.m_jointCount = 0
};
b2Island.prototype.Solve = function(step, gravity, allowSleep) {
  var i = 0;
  var j = 0;
  var b;
  var joint;
  for(i = 0;i < this.m_bodyCount;++i) {
    b = this.m_bodies[i];
    if(b.GetType() != b2Body.b2_dynamicBody) {
      continue
    }
    b.m_linearVelocity.x += step.dt * (gravity.x + b.m_invMass * b.m_force.x);
    b.m_linearVelocity.y += step.dt * (gravity.y + b.m_invMass * b.m_force.y);
    b.m_angularVelocity += step.dt * b.m_invI * b.m_torque;
    b.m_linearVelocity.Multiply(b2Math.Clamp(1 - step.dt * b.m_linearDamping, 0, 1));
    b.m_angularVelocity *= b2Math.Clamp(1 - step.dt * b.m_angularDamping, 0, 1)
  }
  this.m_contactSolver.Initialize(step, this.m_contacts, this.m_contactCount, this.m_allocator);
  var contactSolver = this.m_contactSolver;
  contactSolver.InitVelocityConstraints(step);
  for(i = 0;i < this.m_jointCount;++i) {
    joint = this.m_joints[i];
    joint.InitVelocityConstraints(step)
  }
  for(i = 0;i < step.velocityIterations;++i) {
    for(j = 0;j < this.m_jointCount;++j) {
      joint = this.m_joints[j];
      joint.SolveVelocityConstraints(step)
    }
    contactSolver.SolveVelocityConstraints()
  }
  for(i = 0;i < this.m_jointCount;++i) {
    joint = this.m_joints[i];
    joint.FinalizeVelocityConstraints()
  }
  contactSolver.FinalizeVelocityConstraints();
  for(i = 0;i < this.m_bodyCount;++i) {
    b = this.m_bodies[i];
    if(b.GetType() == b2Body.b2_staticBody) {
      continue
    }
    var translationX = step.dt * b.m_linearVelocity.x;
    var translationY = step.dt * b.m_linearVelocity.y;
    if(translationX * translationX + translationY * translationY > b2Settings.b2_maxTranslationSquared) {
      b.m_linearVelocity.Normalize();
      b.m_linearVelocity.x *= b2Settings.b2_maxTranslation * step.inv_dt;
      b.m_linearVelocity.y *= b2Settings.b2_maxTranslation * step.inv_dt
    }
    var rotation = step.dt * b.m_angularVelocity;
    if(rotation * rotation > b2Settings.b2_maxRotationSquared) {
      if(b.m_angularVelocity < 0) {
        b.m_angularVelocity = -b2Settings.b2_maxRotation * step.inv_dt
      }else {
        b.m_angularVelocity = b2Settings.b2_maxRotation * step.inv_dt
      }
    }
    b.m_sweep.c0.SetV(b.m_sweep.c);
    b.m_sweep.a0 = b.m_sweep.a;
    b.m_sweep.c.x += step.dt * b.m_linearVelocity.x;
    b.m_sweep.c.y += step.dt * b.m_linearVelocity.y;
    b.m_sweep.a += step.dt * b.m_angularVelocity;
    b.SynchronizeTransform()
  }
  for(i = 0;i < step.positionIterations;++i) {
    var contactsOkay = contactSolver.SolvePositionConstraints(b2Settings.b2_contactBaumgarte);
    var jointsOkay = true;
    for(j = 0;j < this.m_jointCount;++j) {
      joint = this.m_joints[j];
      var jointOkay = joint.SolvePositionConstraints(b2Settings.b2_contactBaumgarte);
      jointsOkay = jointsOkay && jointOkay
    }
    if(contactsOkay && jointsOkay) {
      break
    }
  }
  this.Report(contactSolver.m_constraints);
  if(allowSleep) {
    var minSleepTime = Number.MAX_VALUE;
    var linTolSqr = b2Settings.b2_linearSleepTolerance * b2Settings.b2_linearSleepTolerance;
    var angTolSqr = b2Settings.b2_angularSleepTolerance * b2Settings.b2_angularSleepTolerance;
    for(i = 0;i < this.m_bodyCount;++i) {
      b = this.m_bodies[i];
      if(b.GetType() == b2Body.b2_staticBody) {
        continue
      }
      if((b.m_flags & b2Body.e_allowSleepFlag) == 0) {
        b.m_sleepTime = 0;
        minSleepTime = 0
      }
      if((b.m_flags & b2Body.e_allowSleepFlag) == 0 || b.m_angularVelocity * b.m_angularVelocity > angTolSqr || b2Math.Dot(b.m_linearVelocity, b.m_linearVelocity) > linTolSqr) {
        b.m_sleepTime = 0;
        minSleepTime = 0
      }else {
        b.m_sleepTime += step.dt;
        minSleepTime = b2Math.Min(minSleepTime, b.m_sleepTime)
      }
    }
    if(minSleepTime >= b2Settings.b2_timeToSleep) {
      for(i = 0;i < this.m_bodyCount;++i) {
        b = this.m_bodies[i];
        b.SetAwake(false)
      }
    }
  }
};
b2Island.prototype.SolveTOI = function(subStep) {
  var i = 0;
  var j = 0;
  this.m_contactSolver.Initialize(subStep, this.m_contacts, this.m_contactCount, this.m_allocator);
  var contactSolver = this.m_contactSolver;
  for(i = 0;i < this.m_jointCount;++i) {
    this.m_joints[i].InitVelocityConstraints(subStep)
  }
  for(i = 0;i < subStep.velocityIterations;++i) {
    contactSolver.SolveVelocityConstraints();
    for(j = 0;j < this.m_jointCount;++j) {
      this.m_joints[j].SolveVelocityConstraints(subStep)
    }
  }
  for(i = 0;i < this.m_bodyCount;++i) {
    var b = this.m_bodies[i];
    if(b.GetType() == b2Body.b2_staticBody) {
      continue
    }
    var translationX = subStep.dt * b.m_linearVelocity.x;
    var translationY = subStep.dt * b.m_linearVelocity.y;
    if(translationX * translationX + translationY * translationY > b2Settings.b2_maxTranslationSquared) {
      b.m_linearVelocity.Normalize();
      b.m_linearVelocity.x *= b2Settings.b2_maxTranslation * subStep.inv_dt;
      b.m_linearVelocity.y *= b2Settings.b2_maxTranslation * subStep.inv_dt
    }
    var rotation = subStep.dt * b.m_angularVelocity;
    if(rotation * rotation > b2Settings.b2_maxRotationSquared) {
      if(b.m_angularVelocity < 0) {
        b.m_angularVelocity = -b2Settings.b2_maxRotation * subStep.inv_dt
      }else {
        b.m_angularVelocity = b2Settings.b2_maxRotation * subStep.inv_dt
      }
    }
    b.m_sweep.c0.SetV(b.m_sweep.c);
    b.m_sweep.a0 = b.m_sweep.a;
    b.m_sweep.c.x += subStep.dt * b.m_linearVelocity.x;
    b.m_sweep.c.y += subStep.dt * b.m_linearVelocity.y;
    b.m_sweep.a += subStep.dt * b.m_angularVelocity;
    b.SynchronizeTransform()
  }
  var k_toiBaumgarte = 0.75;
  for(i = 0;i < subStep.positionIterations;++i) {
    var contactsOkay = contactSolver.SolvePositionConstraints(k_toiBaumgarte);
    var jointsOkay = true;
    for(j = 0;j < this.m_jointCount;++j) {
      var jointOkay = this.m_joints[j].SolvePositionConstraints(b2Settings.b2_contactBaumgarte);
      jointsOkay = jointsOkay && jointOkay
    }
    if(contactsOkay && jointsOkay) {
      break
    }
  }
  this.Report(contactSolver.m_constraints)
};
b2Island.prototype.Report = function(constraints) {
  if(this.m_listener == null) {
    return
  }
  for(var i = 0;i < this.m_contactCount;++i) {
    var c = this.m_contacts[i];
    var cc = constraints[i];
    for(var j = 0;j < cc.pointCount;++j) {
      b2Island.s_impulse.normalImpulses[j] = cc.points[j].normalImpulse;
      b2Island.s_impulse.tangentImpulses[j] = cc.points[j].tangentImpulse
    }
    this.m_listener.PostSolve(c, b2Island.s_impulse)
  }
};
b2Island.prototype.AddBody = function(body) {
  body.m_islandIndex = this.m_bodyCount;
  this.m_bodies[this.m_bodyCount++] = body
};
b2Island.prototype.AddContact = function(contact) {
  this.m_contacts[this.m_contactCount++] = contact
};
b2Island.prototype.AddJoint = function(joint) {
  this.m_joints[this.m_jointCount++] = joint
};
b2Island.prototype.m_allocator = null;
b2Island.prototype.m_listener = null;
b2Island.prototype.m_contactSolver = null;
b2Island.prototype.m_bodies = null;
b2Island.prototype.m_contacts = null;
b2Island.prototype.m_joints = null;
b2Island.prototype.m_bodyCount = 0;
b2Island.prototype.m_jointCount = 0;
b2Island.prototype.m_contactCount = 0;
b2Island.prototype.m_bodyCapacity = 0;
b2Island.prototype.m_contactCapacity = 0;
b2Island.prototype.m_jointCapacity = 0;var b2PolyAndEdgeContact = function() {
  b2Contact.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2PolyAndEdgeContact.prototype, b2Contact.prototype);
b2PolyAndEdgeContact.prototype._super = b2Contact.prototype;
b2PolyAndEdgeContact.prototype.__constructor = function() {
  this._super.__constructor.apply(this, arguments)
};
b2PolyAndEdgeContact.prototype.__varz = function() {
};
b2PolyAndEdgeContact.Create = function(allocator) {
  return new b2PolyAndEdgeContact
};
b2PolyAndEdgeContact.Destroy = function(contact, allocator) {
};
b2PolyAndEdgeContact.prototype.Evaluate = function() {
  var bA = this.m_fixtureA.GetBody();
  var bB = this.m_fixtureB.GetBody();
  this.b2CollidePolyAndEdge(this.m_manifold, this.m_fixtureA.GetShape(), bA.m_xf, this.m_fixtureB.GetShape(), bB.m_xf)
};
b2PolyAndEdgeContact.prototype.b2CollidePolyAndEdge = function(manifold, polygon, xf1, edge, xf2) {
};
b2PolyAndEdgeContact.prototype.Reset = function(fixtureA, fixtureB) {
  this._super.Reset.apply(this, [fixtureA, fixtureB]);
  b2Settings.b2Assert(fixtureA.GetType() == b2Shape.e_polygonShape);
  b2Settings.b2Assert(fixtureB.GetType() == b2Shape.e_edgeShape)
};var b2Collision = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2Collision.prototype.__constructor = function() {
};
b2Collision.prototype.__varz = function() {
};
b2Collision.MakeClipPointVector = function() {
  var r = new Array(2);
  r[0] = new ClipVertex;
  r[1] = new ClipVertex;
  return r
};
b2Collision.ClipSegmentToLine = function(vOut, vIn, normal, offset) {
  var cv;
  var numOut = 0;
  cv = vIn[0];
  var vIn0 = cv.v;
  cv = vIn[1];
  var vIn1 = cv.v;
  var distance0 = normal.x * vIn0.x + normal.y * vIn0.y - offset;
  var distance1 = normal.x * vIn1.x + normal.y * vIn1.y - offset;
  if(distance0 <= 0) {
    vOut[numOut++].Set(vIn[0])
  }
  if(distance1 <= 0) {
    vOut[numOut++].Set(vIn[1])
  }
  if(distance0 * distance1 < 0) {
    var interp = distance0 / (distance0 - distance1);
    cv = vOut[numOut];
    var tVec = cv.v;
    tVec.x = vIn0.x + interp * (vIn1.x - vIn0.x);
    tVec.y = vIn0.y + interp * (vIn1.y - vIn0.y);
    cv = vOut[numOut];
    var cv2;
    if(distance0 > 0) {
      cv2 = vIn[0];
      cv.id = cv2.id
    }else {
      cv2 = vIn[1];
      cv.id = cv2.id
    }
    ++numOut
  }
  return numOut
};
b2Collision.EdgeSeparation = function(poly1, xf1, edge1, poly2, xf2) {
  var count1 = poly1.m_vertexCount;
  var vertices1 = poly1.m_vertices;
  var normals1 = poly1.m_normals;
  var count2 = poly2.m_vertexCount;
  var vertices2 = poly2.m_vertices;
  var tMat;
  var tVec;
  tMat = xf1.R;
  tVec = normals1[edge1];
  var normal1WorldX = tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
  var normal1WorldY = tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
  tMat = xf2.R;
  var normal1X = tMat.col1.x * normal1WorldX + tMat.col1.y * normal1WorldY;
  var normal1Y = tMat.col2.x * normal1WorldX + tMat.col2.y * normal1WorldY;
  var index = 0;
  var minDot = Number.MAX_VALUE;
  for(var i = 0;i < count2;++i) {
    tVec = vertices2[i];
    var dot = tVec.x * normal1X + tVec.y * normal1Y;
    if(dot < minDot) {
      minDot = dot;
      index = i
    }
  }
  tVec = vertices1[edge1];
  tMat = xf1.R;
  var v1X = xf1.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
  var v1Y = xf1.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
  tVec = vertices2[index];
  tMat = xf2.R;
  var v2X = xf2.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
  var v2Y = xf2.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
  v2X -= v1X;
  v2Y -= v1Y;
  var separation = v2X * normal1WorldX + v2Y * normal1WorldY;
  return separation
};
b2Collision.FindMaxSeparation = function(edgeIndex, poly1, xf1, poly2, xf2) {
  var count1 = poly1.m_vertexCount;
  var normals1 = poly1.m_normals;
  var tVec;
  var tMat;
  tMat = xf2.R;
  tVec = poly2.m_centroid;
  var dX = xf2.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
  var dY = xf2.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
  tMat = xf1.R;
  tVec = poly1.m_centroid;
  dX -= xf1.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
  dY -= xf1.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
  var dLocal1X = dX * xf1.R.col1.x + dY * xf1.R.col1.y;
  var dLocal1Y = dX * xf1.R.col2.x + dY * xf1.R.col2.y;
  var edge = 0;
  var maxDot = -Number.MAX_VALUE;
  for(var i = 0;i < count1;++i) {
    tVec = normals1[i];
    var dot = tVec.x * dLocal1X + tVec.y * dLocal1Y;
    if(dot > maxDot) {
      maxDot = dot;
      edge = i
    }
  }
  var s = b2Collision.EdgeSeparation(poly1, xf1, edge, poly2, xf2);
  var prevEdge = edge - 1 >= 0 ? edge - 1 : count1 - 1;
  var sPrev = b2Collision.EdgeSeparation(poly1, xf1, prevEdge, poly2, xf2);
  var nextEdge = edge + 1 < count1 ? edge + 1 : 0;
  var sNext = b2Collision.EdgeSeparation(poly1, xf1, nextEdge, poly2, xf2);
  var bestEdge = 0;
  var bestSeparation;
  var increment = 0;
  if(sPrev > s && sPrev > sNext) {
    increment = -1;
    bestEdge = prevEdge;
    bestSeparation = sPrev
  }else {
    if(sNext > s) {
      increment = 1;
      bestEdge = nextEdge;
      bestSeparation = sNext
    }else {
      edgeIndex[0] = edge;
      return s
    }
  }
  while(true) {
    if(increment == -1) {
      edge = bestEdge - 1 >= 0 ? bestEdge - 1 : count1 - 1
    }else {
      edge = bestEdge + 1 < count1 ? bestEdge + 1 : 0
    }
    s = b2Collision.EdgeSeparation(poly1, xf1, edge, poly2, xf2);
    if(s > bestSeparation) {
      bestEdge = edge;
      bestSeparation = s
    }else {
      break
    }
  }
  edgeIndex[0] = bestEdge;
  return bestSeparation
};
b2Collision.FindIncidentEdge = function(c, poly1, xf1, edge1, poly2, xf2) {
  var count1 = poly1.m_vertexCount;
  var normals1 = poly1.m_normals;
  var count2 = poly2.m_vertexCount;
  var vertices2 = poly2.m_vertices;
  var normals2 = poly2.m_normals;
  var tMat;
  var tVec;
  tMat = xf1.R;
  tVec = normals1[edge1];
  var normal1X = tMat.col1.x * tVec.x + tMat.col2.x * tVec.y;
  var normal1Y = tMat.col1.y * tVec.x + tMat.col2.y * tVec.y;
  tMat = xf2.R;
  var tX = tMat.col1.x * normal1X + tMat.col1.y * normal1Y;
  normal1Y = tMat.col2.x * normal1X + tMat.col2.y * normal1Y;
  normal1X = tX;
  var index = 0;
  var minDot = Number.MAX_VALUE;
  for(var i = 0;i < count2;++i) {
    tVec = normals2[i];
    var dot = normal1X * tVec.x + normal1Y * tVec.y;
    if(dot < minDot) {
      minDot = dot;
      index = i
    }
  }
  var tClip;
  var i1 = index;
  var i2 = i1 + 1 < count2 ? i1 + 1 : 0;
  tClip = c[0];
  tVec = vertices2[i1];
  tMat = xf2.R;
  tClip.v.x = xf2.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
  tClip.v.y = xf2.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
  tClip.id.features.referenceEdge = edge1;
  tClip.id.features.incidentEdge = i1;
  tClip.id.features.incidentVertex = 0;
  tClip = c[1];
  tVec = vertices2[i2];
  tMat = xf2.R;
  tClip.v.x = xf2.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
  tClip.v.y = xf2.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
  tClip.id.features.referenceEdge = edge1;
  tClip.id.features.incidentEdge = i2;
  tClip.id.features.incidentVertex = 1
};
b2Collision.CollidePolygons = function(manifold, polyA, xfA, polyB, xfB) {
  var cv;
  manifold.m_pointCount = 0;
  var totalRadius = polyA.m_radius + polyB.m_radius;
  var edgeA = 0;
  b2Collision.s_edgeAO[0] = edgeA;
  var separationA = b2Collision.FindMaxSeparation(b2Collision.s_edgeAO, polyA, xfA, polyB, xfB);
  edgeA = b2Collision.s_edgeAO[0];
  if(separationA > totalRadius) {
    return
  }
  var edgeB = 0;
  b2Collision.s_edgeBO[0] = edgeB;
  var separationB = b2Collision.FindMaxSeparation(b2Collision.s_edgeBO, polyB, xfB, polyA, xfA);
  edgeB = b2Collision.s_edgeBO[0];
  if(separationB > totalRadius) {
    return
  }
  var poly1;
  var poly2;
  var xf1;
  var xf2;
  var edge1 = 0;
  var flip = 0;
  var k_relativeTol = 0.98;
  var k_absoluteTol = 0.0010;
  var tMat;
  if(separationB > k_relativeTol * separationA + k_absoluteTol) {
    poly1 = polyB;
    poly2 = polyA;
    xf1 = xfB;
    xf2 = xfA;
    edge1 = edgeB;
    manifold.m_type = b2Manifold.e_faceB;
    flip = 1
  }else {
    poly1 = polyA;
    poly2 = polyB;
    xf1 = xfA;
    xf2 = xfB;
    edge1 = edgeA;
    manifold.m_type = b2Manifold.e_faceA;
    flip = 0
  }
  var incidentEdge = b2Collision.s_incidentEdge;
  b2Collision.FindIncidentEdge(incidentEdge, poly1, xf1, edge1, poly2, xf2);
  var count1 = poly1.m_vertexCount;
  var vertices1 = poly1.m_vertices;
  var local_v11 = vertices1[edge1];
  var local_v12;
  if(edge1 + 1 < count1) {
    local_v12 = vertices1[parseInt(edge1 + 1)]
  }else {
    local_v12 = vertices1[0]
  }
  var localTangent = b2Collision.s_localTangent;
  localTangent.Set(local_v12.x - local_v11.x, local_v12.y - local_v11.y);
  localTangent.Normalize();
  var localNormal = b2Collision.s_localNormal;
  localNormal.x = localTangent.y;
  localNormal.y = -localTangent.x;
  var planePoint = b2Collision.s_planePoint;
  planePoint.Set(0.5 * (local_v11.x + local_v12.x), 0.5 * (local_v11.y + local_v12.y));
  var tangent = b2Collision.s_tangent;
  tMat = xf1.R;
  tangent.x = tMat.col1.x * localTangent.x + tMat.col2.x * localTangent.y;
  tangent.y = tMat.col1.y * localTangent.x + tMat.col2.y * localTangent.y;
  var tangent2 = b2Collision.s_tangent2;
  tangent2.x = -tangent.x;
  tangent2.y = -tangent.y;
  var normal = b2Collision.s_normal;
  normal.x = tangent.y;
  normal.y = -tangent.x;
  var v11 = b2Collision.s_v11;
  var v12 = b2Collision.s_v12;
  v11.x = xf1.position.x + (tMat.col1.x * local_v11.x + tMat.col2.x * local_v11.y);
  v11.y = xf1.position.y + (tMat.col1.y * local_v11.x + tMat.col2.y * local_v11.y);
  v12.x = xf1.position.x + (tMat.col1.x * local_v12.x + tMat.col2.x * local_v12.y);
  v12.y = xf1.position.y + (tMat.col1.y * local_v12.x + tMat.col2.y * local_v12.y);
  var frontOffset = normal.x * v11.x + normal.y * v11.y;
  var sideOffset1 = -tangent.x * v11.x - tangent.y * v11.y + totalRadius;
  var sideOffset2 = tangent.x * v12.x + tangent.y * v12.y + totalRadius;
  var clipPoints1 = b2Collision.s_clipPoints1;
  var clipPoints2 = b2Collision.s_clipPoints2;
  var np = 0;
  np = b2Collision.ClipSegmentToLine(clipPoints1, incidentEdge, tangent2, sideOffset1);
  if(np < 2) {
    return
  }
  np = b2Collision.ClipSegmentToLine(clipPoints2, clipPoints1, tangent, sideOffset2);
  if(np < 2) {
    return
  }
  manifold.m_localPlaneNormal.SetV(localNormal);
  manifold.m_localPoint.SetV(planePoint);
  var pointCount = 0;
  for(var i = 0;i < b2Settings.b2_maxManifoldPoints;++i) {
    cv = clipPoints2[i];
    var separation = normal.x * cv.v.x + normal.y * cv.v.y - frontOffset;
    if(separation <= totalRadius) {
      var cp = manifold.m_points[pointCount];
      tMat = xf2.R;
      var tX = cv.v.x - xf2.position.x;
      var tY = cv.v.y - xf2.position.y;
      cp.m_localPoint.x = tX * tMat.col1.x + tY * tMat.col1.y;
      cp.m_localPoint.y = tX * tMat.col2.x + tY * tMat.col2.y;
      cp.m_id.Set(cv.id);
      cp.m_id.features.flip = flip;
      ++pointCount
    }
  }
  manifold.m_pointCount = pointCount
};
b2Collision.CollideCircles = function(manifold, circle1, xf1, circle2, xf2) {
  manifold.m_pointCount = 0;
  var tMat;
  var tVec;
  tMat = xf1.R;
  tVec = circle1.m_p;
  var p1X = xf1.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
  var p1Y = xf1.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
  tMat = xf2.R;
  tVec = circle2.m_p;
  var p2X = xf2.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
  var p2Y = xf2.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
  var dX = p2X - p1X;
  var dY = p2Y - p1Y;
  var distSqr = dX * dX + dY * dY;
  var radius = circle1.m_radius + circle2.m_radius;
  if(distSqr > radius * radius) {
    return
  }
  manifold.m_type = b2Manifold.e_circles;
  manifold.m_localPoint.SetV(circle1.m_p);
  manifold.m_localPlaneNormal.SetZero();
  manifold.m_pointCount = 1;
  manifold.m_points[0].m_localPoint.SetV(circle2.m_p);
  manifold.m_points[0].m_id.key = 0
};
b2Collision.CollidePolygonAndCircle = function(manifold, polygon, xf1, circle, xf2) {
  manifold.m_pointCount = 0;
  var tPoint;
  var dX;
  var dY;
  var positionX;
  var positionY;
  var tVec;
  var tMat;
  tMat = xf2.R;
  tVec = circle.m_p;
  var cX = xf2.position.x + (tMat.col1.x * tVec.x + tMat.col2.x * tVec.y);
  var cY = xf2.position.y + (tMat.col1.y * tVec.x + tMat.col2.y * tVec.y);
  dX = cX - xf1.position.x;
  dY = cY - xf1.position.y;
  tMat = xf1.R;
  var cLocalX = dX * tMat.col1.x + dY * tMat.col1.y;
  var cLocalY = dX * tMat.col2.x + dY * tMat.col2.y;
  var dist;
  var normalIndex = 0;
  var separation = -Number.MAX_VALUE;
  var radius = polygon.m_radius + circle.m_radius;
  var vertexCount = polygon.m_vertexCount;
  var vertices = polygon.m_vertices;
  var normals = polygon.m_normals;
  for(var i = 0;i < vertexCount;++i) {
    tVec = vertices[i];
    dX = cLocalX - tVec.x;
    dY = cLocalY - tVec.y;
    tVec = normals[i];
    var s = tVec.x * dX + tVec.y * dY;
    if(s > radius) {
      return
    }
    if(s > separation) {
      separation = s;
      normalIndex = i
    }
  }
  var vertIndex1 = normalIndex;
  var vertIndex2 = vertIndex1 + 1 < vertexCount ? vertIndex1 + 1 : 0;
  var v1 = vertices[vertIndex1];
  var v2 = vertices[vertIndex2];
  if(separation < Number.MIN_VALUE) {
    manifold.m_pointCount = 1;
    manifold.m_type = b2Manifold.e_faceA;
    manifold.m_localPlaneNormal.SetV(normals[normalIndex]);
    manifold.m_localPoint.x = 0.5 * (v1.x + v2.x);
    manifold.m_localPoint.y = 0.5 * (v1.y + v2.y);
    manifold.m_points[0].m_localPoint.SetV(circle.m_p);
    manifold.m_points[0].m_id.key = 0;
    return
  }
  var u1 = (cLocalX - v1.x) * (v2.x - v1.x) + (cLocalY - v1.y) * (v2.y - v1.y);
  var u2 = (cLocalX - v2.x) * (v1.x - v2.x) + (cLocalY - v2.y) * (v1.y - v2.y);
  if(u1 <= 0) {
    if((cLocalX - v1.x) * (cLocalX - v1.x) + (cLocalY - v1.y) * (cLocalY - v1.y) > radius * radius) {
      return
    }
    manifold.m_pointCount = 1;
    manifold.m_type = b2Manifold.e_faceA;
    manifold.m_localPlaneNormal.x = cLocalX - v1.x;
    manifold.m_localPlaneNormal.y = cLocalY - v1.y;
    manifold.m_localPlaneNormal.Normalize();
    manifold.m_localPoint.SetV(v1);
    manifold.m_points[0].m_localPoint.SetV(circle.m_p);
    manifold.m_points[0].m_id.key = 0
  }else {
    if(u2 <= 0) {
      if((cLocalX - v2.x) * (cLocalX - v2.x) + (cLocalY - v2.y) * (cLocalY - v2.y) > radius * radius) {
        return
      }
      manifold.m_pointCount = 1;
      manifold.m_type = b2Manifold.e_faceA;
      manifold.m_localPlaneNormal.x = cLocalX - v2.x;
      manifold.m_localPlaneNormal.y = cLocalY - v2.y;
      manifold.m_localPlaneNormal.Normalize();
      manifold.m_localPoint.SetV(v2);
      manifold.m_points[0].m_localPoint.SetV(circle.m_p);
      manifold.m_points[0].m_id.key = 0
    }else {
      var faceCenterX = 0.5 * (v1.x + v2.x);
      var faceCenterY = 0.5 * (v1.y + v2.y);
      separation = (cLocalX - faceCenterX) * normals[vertIndex1].x + (cLocalY - faceCenterY) * normals[vertIndex1].y;
      if(separation > radius) {
        return
      }
      manifold.m_pointCount = 1;
      manifold.m_type = b2Manifold.e_faceA;
      manifold.m_localPlaneNormal.x = normals[vertIndex1].x;
      manifold.m_localPlaneNormal.y = normals[vertIndex1].y;
      manifold.m_localPlaneNormal.Normalize();
      manifold.m_localPoint.Set(faceCenterX, faceCenterY);
      manifold.m_points[0].m_localPoint.SetV(circle.m_p);
      manifold.m_points[0].m_id.key = 0
    }
  }
};
b2Collision.TestOverlap = function(a, b) {
  var t1 = b.lowerBound;
  var t2 = a.upperBound;
  var d1X = t1.x - t2.x;
  var d1Y = t1.y - t2.y;
  t1 = a.lowerBound;
  t2 = b.upperBound;
  var d2X = t1.x - t2.x;
  var d2Y = t1.y - t2.y;
  if(d1X > 0 || d1Y > 0) {
    return false
  }
  if(d2X > 0 || d2Y > 0) {
    return false
  }
  return true
};
b2Collision.b2_nullFeature = 255;
b2Collision.s_incidentEdge = b2Collision.MakeClipPointVector();
b2Collision.s_clipPoints1 = b2Collision.MakeClipPointVector();
b2Collision.s_clipPoints2 = b2Collision.MakeClipPointVector();
b2Collision.s_edgeAO = new Array(1);
b2Collision.s_edgeBO = new Array(1);
b2Collision.s_localTangent = new b2Vec2;
b2Collision.s_localNormal = new b2Vec2;
b2Collision.s_planePoint = new b2Vec2;
b2Collision.s_normal = new b2Vec2;
b2Collision.s_tangent = new b2Vec2;
b2Collision.s_tangent2 = new b2Vec2;
b2Collision.s_v11 = new b2Vec2;
b2Collision.s_v12 = new b2Vec2;
b2Collision.b2CollidePolyTempVec = new b2Vec2;var b2PolyAndCircleContact = function() {
  b2Contact.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2PolyAndCircleContact.prototype, b2Contact.prototype);
b2PolyAndCircleContact.prototype._super = b2Contact.prototype;
b2PolyAndCircleContact.prototype.__constructor = function() {
  this._super.__constructor.apply(this, arguments)
};
b2PolyAndCircleContact.prototype.__varz = function() {
};
b2PolyAndCircleContact.Create = function(allocator) {
  return new b2PolyAndCircleContact
};
b2PolyAndCircleContact.Destroy = function(contact, allocator) {
};
b2PolyAndCircleContact.prototype.Evaluate = function() {
  var bA = this.m_fixtureA.m_body;
  var bB = this.m_fixtureB.m_body;
  b2Collision.CollidePolygonAndCircle(this.m_manifold, this.m_fixtureA.GetShape(), bA.m_xf, this.m_fixtureB.GetShape(), bB.m_xf)
};
b2PolyAndCircleContact.prototype.Reset = function(fixtureA, fixtureB) {
  this._super.Reset.apply(this, [fixtureA, fixtureB]);
  b2Settings.b2Assert(fixtureA.GetType() == b2Shape.e_polygonShape);
  b2Settings.b2Assert(fixtureB.GetType() == b2Shape.e_circleShape)
};var b2ContactPoint = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2ContactPoint.prototype.__constructor = function() {
};
b2ContactPoint.prototype.__varz = function() {
  this.position = new b2Vec2;
  this.velocity = new b2Vec2;
  this.normal = new b2Vec2;
  this.id = new b2ContactID
};
b2ContactPoint.prototype.shape1 = null;
b2ContactPoint.prototype.shape2 = null;
b2ContactPoint.prototype.position = new b2Vec2;
b2ContactPoint.prototype.velocity = new b2Vec2;
b2ContactPoint.prototype.normal = new b2Vec2;
b2ContactPoint.prototype.separation = null;
b2ContactPoint.prototype.friction = null;
b2ContactPoint.prototype.restitution = null;
b2ContactPoint.prototype.id = new b2ContactID;var b2CircleContact = function() {
  b2Contact.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2CircleContact.prototype, b2Contact.prototype);
b2CircleContact.prototype._super = b2Contact.prototype;
b2CircleContact.prototype.__constructor = function() {
  this._super.__constructor.apply(this, arguments)
};
b2CircleContact.prototype.__varz = function() {
};
b2CircleContact.Create = function(allocator) {
  return new b2CircleContact
};
b2CircleContact.Destroy = function(contact, allocator) {
};
b2CircleContact.prototype.Evaluate = function() {
  var bA = this.m_fixtureA.GetBody();
  var bB = this.m_fixtureB.GetBody();
  b2Collision.CollideCircles(this.m_manifold, this.m_fixtureA.GetShape(), bA.m_xf, this.m_fixtureB.GetShape(), bB.m_xf)
};
b2CircleContact.prototype.Reset = function(fixtureA, fixtureB) {
  this._super.Reset.apply(this, [fixtureA, fixtureB])
};var b2EdgeAndCircleContact = function() {
  b2Contact.prototype.__varz.call(this);
  this.__varz();
  this.__constructor.apply(this, arguments)
};
extend(b2EdgeAndCircleContact.prototype, b2Contact.prototype);
b2EdgeAndCircleContact.prototype._super = b2Contact.prototype;
b2EdgeAndCircleContact.prototype.__constructor = function() {
  this._super.__constructor.apply(this, arguments)
};
b2EdgeAndCircleContact.prototype.__varz = function() {
};
b2EdgeAndCircleContact.Create = function(allocator) {
  return new b2EdgeAndCircleContact
};
b2EdgeAndCircleContact.Destroy = function(contact, allocator) {
};
b2EdgeAndCircleContact.prototype.Evaluate = function() {
  var bA = this.m_fixtureA.GetBody();
  var bB = this.m_fixtureB.GetBody();
  this.b2CollideEdgeAndCircle(this.m_manifold, this.m_fixtureA.GetShape(), bA.m_xf, this.m_fixtureB.GetShape(), bB.m_xf)
};
b2EdgeAndCircleContact.prototype.b2CollideEdgeAndCircle = function(manifold, edge, xf1, circle, xf2) {
};
b2EdgeAndCircleContact.prototype.Reset = function(fixtureA, fixtureB) {
  this._super.Reset.apply(this, [fixtureA, fixtureB])
};var b2ContactManager = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2ContactManager.prototype.__constructor = function() {
  this.m_world = null;
  this.m_contactCount = 0;
  this.m_contactFilter = b2ContactFilter.b2_defaultFilter;
  this.m_contactListener = b2ContactListener.b2_defaultListener;
  this.m_contactFactory = new b2ContactFactory(this.m_allocator);
  this.m_broadPhase = new b2DynamicTreeBroadPhase
};
b2ContactManager.prototype.__varz = function() {
};
b2ContactManager.s_evalCP = new b2ContactPoint;
b2ContactManager.prototype.AddPair = function(proxyUserDataA, proxyUserDataB) {
  var fixtureA = proxyUserDataA;
  var fixtureB = proxyUserDataB;
  var bodyA = fixtureA.GetBody();
  var bodyB = fixtureB.GetBody();
  if(bodyA == bodyB) {
    return
  }
  var edge = bodyB.GetContactList();
  while(edge) {
    if(edge.other == bodyA) {
      var fA = edge.contact.GetFixtureA();
      var fB = edge.contact.GetFixtureB();
      if(fA == fixtureA && fB == fixtureB) {
        return
      }
      if(fA == fixtureB && fB == fixtureA) {
        return
      }
    }
    edge = edge.next
  }
  if(bodyB.ShouldCollide(bodyA) == false) {
    return
  }
  if(this.m_contactFilter.ShouldCollide(fixtureA, fixtureB) == false) {
    return
  }
  var c = this.m_contactFactory.Create(fixtureA, fixtureB);
  fixtureA = c.GetFixtureA();
  fixtureB = c.GetFixtureB();
  bodyA = fixtureA.m_body;
  bodyB = fixtureB.m_body;
  c.m_prev = null;
  c.m_next = this.m_world.m_contactList;
  if(this.m_world.m_contactList != null) {
    this.m_world.m_contactList.m_prev = c
  }
  this.m_world.m_contactList = c;
  c.m_nodeA.contact = c;
  c.m_nodeA.other = bodyB;
  c.m_nodeA.prev = null;
  c.m_nodeA.next = bodyA.m_contactList;
  if(bodyA.m_contactList != null) {
    bodyA.m_contactList.prev = c.m_nodeA
  }
  bodyA.m_contactList = c.m_nodeA;
  c.m_nodeB.contact = c;
  c.m_nodeB.other = bodyA;
  c.m_nodeB.prev = null;
  c.m_nodeB.next = bodyB.m_contactList;
  if(bodyB.m_contactList != null) {
    bodyB.m_contactList.prev = c.m_nodeB
  }
  bodyB.m_contactList = c.m_nodeB;
  ++this.m_world.m_contactCount;
  return
};
b2ContactManager.prototype.FindNewContacts = function() {
  var that = this;
  this.m_broadPhase.UpdatePairs(function(a, b) {
    return that.AddPair(a, b)
  })
};
b2ContactManager.prototype.Destroy = function(c) {
  var fixtureA = c.GetFixtureA();
  var fixtureB = c.GetFixtureB();
  var bodyA = fixtureA.GetBody();
  var bodyB = fixtureB.GetBody();
  if(c.IsTouching()) {
    this.m_contactListener.EndContact(c)
  }
  if(c.m_prev) {
    c.m_prev.m_next = c.m_next
  }
  if(c.m_next) {
    c.m_next.m_prev = c.m_prev
  }
  if(c == this.m_world.m_contactList) {
    this.m_world.m_contactList = c.m_next
  }
  if(c.m_nodeA.prev) {
    c.m_nodeA.prev.next = c.m_nodeA.next
  }
  if(c.m_nodeA.next) {
    c.m_nodeA.next.prev = c.m_nodeA.prev
  }
  if(c.m_nodeA == bodyA.m_contactList) {
    bodyA.m_contactList = c.m_nodeA.next
  }
  if(c.m_nodeB.prev) {
    c.m_nodeB.prev.next = c.m_nodeB.next
  }
  if(c.m_nodeB.next) {
    c.m_nodeB.next.prev = c.m_nodeB.prev
  }
  if(c.m_nodeB == bodyB.m_contactList) {
    bodyB.m_contactList = c.m_nodeB.next
  }
  this.m_contactFactory.Destroy(c);
  --this.m_contactCount
};
b2ContactManager.prototype.Collide = function() {
  var c = this.m_world.m_contactList;
  while(c) {
    var fixtureA = c.GetFixtureA();
    var fixtureB = c.GetFixtureB();
    var bodyA = fixtureA.GetBody();
    var bodyB = fixtureB.GetBody();
    if(bodyA.IsAwake() == false && bodyB.IsAwake() == false) {
      c = c.GetNext();
      continue
    }
    if(c.m_flags & b2Contact.e_filterFlag) {
      if(bodyB.ShouldCollide(bodyA) == false) {
        var cNuke = c;
        c = cNuke.GetNext();
        this.Destroy(cNuke);
        continue
      }
      if(this.m_contactFilter.ShouldCollide(fixtureA, fixtureB) == false) {
        cNuke = c;
        c = cNuke.GetNext();
        this.Destroy(cNuke);
        continue
      }
      c.m_flags &= ~b2Contact.e_filterFlag
    }
    var proxyA = fixtureA.m_proxy;
    var proxyB = fixtureB.m_proxy;
    var overlap = this.m_broadPhase.TestOverlap(proxyA, proxyB);
    if(overlap == false) {
      cNuke = c;
      c = cNuke.GetNext();
      this.Destroy(cNuke);
      continue
    }
    c.Update(this.m_contactListener);
    c = c.GetNext()
  }
};
b2ContactManager.prototype.m_world = null;
b2ContactManager.prototype.m_broadPhase = null;
b2ContactManager.prototype.m_contactList = null;
b2ContactManager.prototype.m_contactCount = 0;
b2ContactManager.prototype.m_contactFilter = null;
b2ContactManager.prototype.m_contactListener = null;
b2ContactManager.prototype.m_contactFactory = null;
b2ContactManager.prototype.m_allocator = null;var b2World = function() {
  this.__varz();
  this.__constructor.apply(this, arguments)
};
b2World.prototype.__constructor = function(gravity, doSleep) {
  this.m_destructionListener = null;
  this.m_debugDraw = null;
  this.m_bodyList = null;
  this.m_contactList = null;
  this.m_jointList = null;
  this.m_controllerList = null;
  this.m_bodyCount = 0;
  this.m_contactCount = 0;
  this.m_jointCount = 0;
  this.m_controllerCount = 0;
  b2World.m_warmStarting = true;
  b2World.m_continuousPhysics = true;
  this.m_allowSleep = doSleep;
  this.m_gravity = gravity;
  this.m_inv_dt0 = 0;
  this.m_contactManager.m_world = this;
  var bd = new b2BodyDef;
  this.m_groundBody = this.CreateBody(bd)
};
b2World.prototype.__varz = function() {
  this.s_stack = new Array;
  this.m_contactManager = new b2ContactManager;
  this.m_contactSolver = new b2ContactSolver;
  this.m_island = new b2Island
};
b2World.s_timestep2 = new b2TimeStep;
b2World.s_backupA = new b2Sweep;
b2World.s_backupB = new b2Sweep;
b2World.s_timestep = new b2TimeStep;
b2World.s_queue = new Array;
b2World.e_newFixture = 1;
b2World.e_locked = 2;
b2World.s_xf = new b2Transform;
b2World.s_jointColor = new b2Color(0.5, 0.8, 0.8);
b2World.m_warmStarting = null;
b2World.m_continuousPhysics = null;
b2World.prototype.Solve = function(step) {
  var b;
  for(var controller = this.m_controllerList;controller;controller = controller.m_next) {
    controller.Step(step)
  }
  var island = this.m_island;
  island.Initialize(this.m_bodyCount, this.m_contactCount, this.m_jointCount, null, this.m_contactManager.m_contactListener, this.m_contactSolver);
  for(b = this.m_bodyList;b;b = b.m_next) {
    b.m_flags &= ~b2Body.e_islandFlag
  }
  for(var c = this.m_contactList;c;c = c.m_next) {
    c.m_flags &= ~b2Contact.e_islandFlag
  }
  for(var j = this.m_jointList;j;j = j.m_next) {
    j.m_islandFlag = false
  }
  var stackSize = this.m_bodyCount;
  var stack = this.s_stack;
  for(var seed = this.m_bodyList;seed;seed = seed.m_next) {
    if(seed.m_flags & b2Body.e_islandFlag) {
      continue
    }
    if(seed.IsAwake() == false || seed.IsActive() == false) {
      continue
    }
    if(seed.GetType() == b2Body.b2_staticBody) {
      continue
    }
    island.Clear();
    var stackCount = 0;
    stack[stackCount++] = seed;
    seed.m_flags |= b2Body.e_islandFlag;
    while(stackCount > 0) {
      b = stack[--stackCount];
      island.AddBody(b);
      if(b.IsAwake() == false) {
        b.SetAwake(true)
      }
      if(b.GetType() == b2Body.b2_staticBody) {
        continue
      }
      var other;
      for(var ce = b.m_contactList;ce;ce = ce.next) {
        if(ce.contact.m_flags & b2Contact.e_islandFlag) {
          continue
        }
        if(ce.contact.IsSensor() == true || ce.contact.IsEnabled() == false || ce.contact.IsTouching() == false) {
          continue
        }
        island.AddContact(ce.contact);
        ce.contact.m_flags |= b2Contact.e_islandFlag;
        other = ce.other;
        if(other.m_flags & b2Body.e_islandFlag) {
          continue
        }
        stack[stackCount++] = other;
        other.m_flags |= b2Body.e_islandFlag
      }
      for(var jn = b.m_jointList;jn;jn = jn.next) {
        if(jn.joint.m_islandFlag == true) {
          continue
        }
        other = jn.other;
        if(other.IsActive() == false) {
          continue
        }
        island.AddJoint(jn.joint);
        jn.joint.m_islandFlag = true;
        if(other.m_flags & b2Body.e_islandFlag) {
          continue
        }
        stack[stackCount++] = other;
        other.m_flags |= b2Body.e_islandFlag
      }
    }
    island.Solve(step, this.m_gravity, this.m_allowSleep);
    for(var i = 0;i < island.m_bodyCount;++i) {
      b = island.m_bodies[i];
      if(b.GetType() == b2Body.b2_staticBody) {
        b.m_flags &= ~b2Body.e_islandFlag
      }
    }
  }
  for(i = 0;i < stack.length;++i) {
    if(!stack[i]) {
      break
    }
    stack[i] = null
  }
  for(b = this.m_bodyList;b;b = b.m_next) {
    if(b.IsAwake() == false || b.IsActive() == false) {
      continue
    }
    if(b.GetType() == b2Body.b2_staticBody) {
      continue
    }
    b.SynchronizeFixtures()
  }
  this.m_contactManager.FindNewContacts()
};
b2World.prototype.SolveTOI = function(step) {
  var b;
  var fA;
  var fB;
  var bA;
  var bB;
  var cEdge;
  var j;
  var island = this.m_island;
  island.Initialize(this.m_bodyCount, b2Settings.b2_maxTOIContactsPerIsland, b2Settings.b2_maxTOIJointsPerIsland, null, this.m_contactManager.m_contactListener, this.m_contactSolver);
  var queue = b2World.s_queue;
  for(b = this.m_bodyList;b;b = b.m_next) {
    b.m_flags &= ~b2Body.e_islandFlag;
    b.m_sweep.t0 = 0
  }
  var c;
  for(c = this.m_contactList;c;c = c.m_next) {
    c.m_flags &= ~(b2Contact.e_toiFlag | b2Contact.e_islandFlag)
  }
  for(j = this.m_jointList;j;j = j.m_next) {
    j.m_islandFlag = false
  }
  for(;;) {
    var minContact = null;
    var minTOI = 1;
    for(c = this.m_contactList;c;c = c.m_next) {
      if(c.IsSensor() == true || c.IsEnabled() == false || c.IsContinuous() == false) {
        continue
      }
      var toi = 1;
      if(c.m_flags & b2Contact.e_toiFlag) {
        toi = c.m_toi
      }else {
        fA = c.m_fixtureA;
        fB = c.m_fixtureB;
        bA = fA.m_body;
        bB = fB.m_body;
        if((bA.GetType() != b2Body.b2_dynamicBody || bA.IsAwake() == false) && (bB.GetType() != b2Body.b2_dynamicBody || bB.IsAwake() == false)) {
          continue
        }
        var t0 = bA.m_sweep.t0;
        if(bA.m_sweep.t0 < bB.m_sweep.t0) {
          t0 = bB.m_sweep.t0;
          bA.m_sweep.Advance(t0)
        }else {
          if(bB.m_sweep.t0 < bA.m_sweep.t0) {
            t0 = bA.m_sweep.t0;
            bB.m_sweep.Advance(t0)
          }
        }
        toi = c.ComputeTOI(bA.m_sweep, bB.m_sweep);
        b2Settings.b2Assert(0 <= toi && toi <= 1);
        if(toi > 0 && toi < 1) {
          toi = (1 - toi) * t0 + toi;
          if(toi > 1) {
            toi = 1
          }
        }
        c.m_toi = toi;
        c.m_flags |= b2Contact.e_toiFlag
      }
      if(Number.MIN_VALUE < toi && toi < minTOI) {
        minContact = c;
        minTOI = toi
      }
    }
    if(minContact == null || 1 - 100 * Number.MIN_VALUE < minTOI) {
      break
    }
    fA = minContact.m_fixtureA;
    fB = minContact.m_fixtureB;
    bA = fA.m_body;
    bB = fB.m_body;
    b2World.s_backupA.Set(bA.m_sweep);
    b2World.s_backupB.Set(bB.m_sweep);
    bA.Advance(minTOI);
    bB.Advance(minTOI);
    minContact.Update(this.m_contactManager.m_contactListener);
    minContact.m_flags &= ~b2Contact.e_toiFlag;
    if(minContact.IsSensor() == true || minContact.IsEnabled() == false) {
      bA.m_sweep.Set(b2World.s_backupA);
      bB.m_sweep.Set(b2World.s_backupB);
      bA.SynchronizeTransform();
      bB.SynchronizeTransform();
      continue
    }
    if(minContact.IsTouching() == false) {
      continue
    }
    var seed = bA;
    if(seed.GetType() != b2Body.b2_dynamicBody) {
      seed = bB
    }
    island.Clear();
    var queueStart = 0;
    var queueSize = 0;
    queue[queueStart + queueSize++] = seed;
    seed.m_flags |= b2Body.e_islandFlag;
    while(queueSize > 0) {
      b = queue[queueStart++];
      --queueSize;
      island.AddBody(b);
      if(b.IsAwake() == false) {
        b.SetAwake(true)
      }
      if(b.GetType() != b2Body.b2_dynamicBody) {
        continue
      }
      for(cEdge = b.m_contactList;cEdge;cEdge = cEdge.next) {
        if(island.m_contactCount == island.m_contactCapacity) {
          break
        }
        if(cEdge.contact.m_flags & b2Contact.e_islandFlag) {
          continue
        }
        if(cEdge.contact.IsSensor() == true || cEdge.contact.IsEnabled() == false || cEdge.contact.IsTouching() == false) {
          continue
        }
        island.AddContact(cEdge.contact);
        cEdge.contact.m_flags |= b2Contact.e_islandFlag;
        var other = cEdge.other;
        if(other.m_flags & b2Body.e_islandFlag) {
          continue
        }
        if(other.GetType() != b2Body.b2_staticBody) {
          other.Advance(minTOI);
          other.SetAwake(true)
        }
        queue[queueStart + queueSize] = other;
        ++queueSize;
        other.m_flags |= b2Body.e_islandFlag
      }
      for(var jEdge = b.m_jointList;jEdge;jEdge = jEdge.next) {
        if(island.m_jointCount == island.m_jointCapacity) {
          continue
        }
        if(jEdge.joint.m_islandFlag == true) {
          continue
        }
        other = jEdge.other;
        if(other.IsActive() == false) {
          continue
        }
        island.AddJoint(jEdge.joint);
        jEdge.joint.m_islandFlag = true;
        if(other.m_flags & b2Body.e_islandFlag) {
          continue
        }
        if(other.GetType() != b2Body.b2_staticBody) {
          other.Advance(minTOI);
          other.SetAwake(true)
        }
        queue[queueStart + queueSize] = other;
        ++queueSize;
        other.m_flags |= b2Body.e_islandFlag
      }
    }
    var subStep = b2World.s_timestep;
    subStep.warmStarting = false;
    subStep.dt = (1 - minTOI) * step.dt;
    subStep.inv_dt = 1 / subStep.dt;
    subStep.dtRatio = 0;
    subStep.velocityIterations = step.velocityIterations;
    subStep.positionIterations = step.positionIterations;
    island.SolveTOI(subStep);
    var i = 0;
    for(i = 0;i < island.m_bodyCount;++i) {
      b = island.m_bodies[i];
      b.m_flags &= ~b2Body.e_islandFlag;
      if(b.IsAwake() == false) {
        continue
      }
      if(b.GetType() != b2Body.b2_dynamicBody) {
        continue
      }
      b.SynchronizeFixtures();
      for(cEdge = b.m_contactList;cEdge;cEdge = cEdge.next) {
        cEdge.contact.m_flags &= ~b2Contact.e_toiFlag
      }
    }
    for(i = 0;i < island.m_contactCount;++i) {
      c = island.m_contacts[i];
      c.m_flags &= ~(b2Contact.e_toiFlag | b2Contact.e_islandFlag)
    }
    for(i = 0;i < island.m_jointCount;++i) {
      j = island.m_joints[i];
      j.m_islandFlag = false
    }
    this.m_contactManager.FindNewContacts()
  }
};
b2World.prototype.DrawJoint = function(joint) {
  var b1 = joint.GetBodyA();
  var b2 = joint.GetBodyB();
  var xf1 = b1.m_xf;
  var xf2 = b2.m_xf;
  var x1 = xf1.position;
  var x2 = xf2.position;
  var p1 = joint.GetAnchorA();
  var p2 = joint.GetAnchorB();
  var color = b2World.s_jointColor;
  switch(joint.m_type) {
    case b2Joint.e_distanceJoint:
      this.m_debugDraw.DrawSegment(p1, p2, color);
      break;
    case b2Joint.e_pulleyJoint:
      var pulley = joint;
      var s1 = pulley.GetGroundAnchorA();
      var s2 = pulley.GetGroundAnchorB();
      this.m_debugDraw.DrawSegment(s1, p1, color);
      this.m_debugDraw.DrawSegment(s2, p2, color);
      this.m_debugDraw.DrawSegment(s1, s2, color);
      break;
    case b2Joint.e_mouseJoint:
      this.m_debugDraw.DrawSegment(p1, p2, color);
      break;
    default:
      if(b1 != this.m_groundBody) {
        this.m_debugDraw.DrawSegment(x1, p1, color)
      }
      this.m_debugDraw.DrawSegment(p1, p2, color);
      if(b2 != this.m_groundBody) {
        this.m_debugDraw.DrawSegment(x2, p2, color)
      }
  }
};
b2World.prototype.DrawShape = function(shape, xf, color) {
  switch(shape.m_type) {
    case b2Shape.e_circleShape:
      var circle = shape;
      var center = b2Math.MulX(xf, circle.m_p);
      var radius = circle.m_radius;
      var axis = xf.R.col1;
      this.m_debugDraw.DrawSolidCircle(center, radius, axis, color);
      break;
    case b2Shape.e_polygonShape:
      var i = 0;
      var poly = shape;
      var vertexCount = poly.GetVertexCount();
      var localVertices = poly.GetVertices();
      var vertices = new Array(vertexCount);
      for(i = 0;i < vertexCount;++i) {
        vertices[i] = b2Math.MulX(xf, localVertices[i])
      }
      this.m_debugDraw.DrawSolidPolygon(vertices, vertexCount, color);
      break;
    case b2Shape.e_edgeShape:
      var edge = shape;
      this.m_debugDraw.DrawSegment(b2Math.MulX(xf, edge.GetVertex1()), b2Math.MulX(xf, edge.GetVertex2()), color);
      break
  }
};
b2World.prototype.SetDestructionListener = function(listener) {
  this.m_destructionListener = listener
};
b2World.prototype.SetContactFilter = function(filter) {
  this.m_contactManager.m_contactFilter = filter
};
b2World.prototype.SetContactListener = function(listener) {
  this.m_contactManager.m_contactListener = listener
};
b2World.prototype.SetDebugDraw = function(debugDraw) {
  this.m_debugDraw = debugDraw
};
b2World.prototype.SetBroadPhase = function(broadPhase) {
  var oldBroadPhase = this.m_contactManager.m_broadPhase;
  this.m_contactManager.m_broadPhase = broadPhase;
  for(var b = this.m_bodyList;b;b = b.m_next) {
    for(var f = b.m_fixtureList;f;f = f.m_next) {
      f.m_proxy = broadPhase.CreateProxy(oldBroadPhase.GetFatAABB(f.m_proxy), f)
    }
  }
};
b2World.prototype.Validate = function() {
  this.m_contactManager.m_broadPhase.Validate()
};
b2World.prototype.GetProxyCount = function() {
  return this.m_contactManager.m_broadPhase.GetProxyCount()
};
b2World.prototype.CreateBody = function(def) {
  if(this.IsLocked() == true) {
    return null
  }
  var b = new b2Body(def, this);
  b.m_prev = null;
  b.m_next = this.m_bodyList;
  if(this.m_bodyList) {
    this.m_bodyList.m_prev = b
  }
  this.m_bodyList = b;
  ++this.m_bodyCount;
  return b
};
b2World.prototype.DestroyBody = function(b) {
  if(this.IsLocked() == true) {
    return
  }
  var jn = b.m_jointList;
  while(jn) {
    var jn0 = jn;
    jn = jn.next;
    if(this.m_destructionListener) {
      this.m_destructionListener.SayGoodbyeJoint(jn0.joint)
    }
    this.DestroyJoint(jn0.joint)
  }
  var coe = b.m_controllerList;
  while(coe) {
    var coe0 = coe;
    coe = coe.nextController;
    coe0.controller.RemoveBody(b)
  }
  var ce = b.m_contactList;
  while(ce) {
    var ce0 = ce;
    ce = ce.next;
    this.m_contactManager.Destroy(ce0.contact)
  }
  b.m_contactList = null;
  var f = b.m_fixtureList;
  while(f) {
    var f0 = f;
    f = f.m_next;
    if(this.m_destructionListener) {
      this.m_destructionListener.SayGoodbyeFixture(f0)
    }
    f0.DestroyProxy(this.m_contactManager.m_broadPhase);
    f0.Destroy()
  }
  b.m_fixtureList = null;
  b.m_fixtureCount = 0;
  if(b.m_prev) {
    b.m_prev.m_next = b.m_next
  }
  if(b.m_next) {
    b.m_next.m_prev = b.m_prev
  }
  if(b == this.m_bodyList) {
    this.m_bodyList = b.m_next
  }
  --this.m_bodyCount
};
b2World.prototype.CreateJoint = function(def) {
  var j = b2Joint.Create(def, null);
  j.m_prev = null;
  j.m_next = this.m_jointList;
  if(this.m_jointList) {
    this.m_jointList.m_prev = j
  }
  this.m_jointList = j;
  ++this.m_jointCount;
  j.m_edgeA.joint = j;
  j.m_edgeA.other = j.m_bodyB;
  j.m_edgeA.prev = null;
  j.m_edgeA.next = j.m_bodyA.m_jointList;
  if(j.m_bodyA.m_jointList) {
    j.m_bodyA.m_jointList.prev = j.m_edgeA
  }
  j.m_bodyA.m_jointList = j.m_edgeA;
  j.m_edgeB.joint = j;
  j.m_edgeB.other = j.m_bodyA;
  j.m_edgeB.prev = null;
  j.m_edgeB.next = j.m_bodyB.m_jointList;
  if(j.m_bodyB.m_jointList) {
    j.m_bodyB.m_jointList.prev = j.m_edgeB
  }
  j.m_bodyB.m_jointList = j.m_edgeB;
  var bodyA = def.bodyA;
  var bodyB = def.bodyB;
  if(def.collideConnected == false) {
    var edge = bodyB.GetContactList();
    while(edge) {
      if(edge.other == bodyA) {
        edge.contact.FlagForFiltering()
      }
      edge = edge.next
    }
  }
  return j
};
b2World.prototype.DestroyJoint = function(j) {
  var collideConnected = j.m_collideConnected;
  if(j.m_prev) {
    j.m_prev.m_next = j.m_next
  }
  if(j.m_next) {
    j.m_next.m_prev = j.m_prev
  }
  if(j == this.m_jointList) {
    this.m_jointList = j.m_next
  }
  var bodyA = j.m_bodyA;
  var bodyB = j.m_bodyB;
  bodyA.SetAwake(true);
  bodyB.SetAwake(true);
  if(j.m_edgeA.prev) {
    j.m_edgeA.prev.next = j.m_edgeA.next
  }
  if(j.m_edgeA.next) {
    j.m_edgeA.next.prev = j.m_edgeA.prev
  }
  if(j.m_edgeA == bodyA.m_jointList) {
    bodyA.m_jointList = j.m_edgeA.next
  }
  j.m_edgeA.prev = null;
  j.m_edgeA.next = null;
  if(j.m_edgeB.prev) {
    j.m_edgeB.prev.next = j.m_edgeB.next
  }
  if(j.m_edgeB.next) {
    j.m_edgeB.next.prev = j.m_edgeB.prev
  }
  if(j.m_edgeB == bodyB.m_jointList) {
    bodyB.m_jointList = j.m_edgeB.next
  }
  j.m_edgeB.prev = null;
  j.m_edgeB.next = null;
  b2Joint.Destroy(j, null);
  --this.m_jointCount;
  if(collideConnected == false) {
    var edge = bodyB.GetContactList();
    while(edge) {
      if(edge.other == bodyA) {
        edge.contact.FlagForFiltering()
      }
      edge = edge.next
    }
  }
};
b2World.prototype.AddController = function(c) {
  c.m_next = this.m_controllerList;
  c.m_prev = null;
  this.m_controllerList = c;
  c.m_world = this;
  this.m_controllerCount++;
  return c
};
b2World.prototype.RemoveController = function(c) {
  if(c.m_prev) {
    c.m_prev.m_next = c.m_next
  }
  if(c.m_next) {
    c.m_next.m_prev = c.m_prev
  }
  if(this.m_controllerList == c) {
    this.m_controllerList = c.m_next
  }
  this.m_controllerCount--
};
b2World.prototype.CreateController = function(controller) {
  if(controller.m_world != this) {
    throw new Error("Controller can only be a member of one world");
  }
  controller.m_next = this.m_controllerList;
  controller.m_prev = null;
  if(this.m_controllerList) {
    this.m_controllerList.m_prev = controller
  }
  this.m_controllerList = controller;
  ++this.m_controllerCount;
  controller.m_world = this;
  return controller
};
b2World.prototype.DestroyController = function(controller) {
  controller.Clear();
  if(controller.m_next) {
    controller.m_next.m_prev = controller.m_prev
  }
  if(controller.m_prev) {
    controller.m_prev.m_next = controller.m_next
  }
  if(controller == this.m_controllerList) {
    this.m_controllerList = controller.m_next
  }
  --this.m_controllerCount
};
b2World.prototype.SetWarmStarting = function(flag) {
  b2World.m_warmStarting = flag
};
b2World.prototype.SetContinuousPhysics = function(flag) {
  b2World.m_continuousPhysics = flag
};
b2World.prototype.GetBodyCount = function() {
  return this.m_bodyCount
};
b2World.prototype.GetJointCount = function() {
  return this.m_jointCount
};
b2World.prototype.GetContactCount = function() {
  return this.m_contactCount
};
b2World.prototype.SetGravity = function(gravity) {
  this.m_gravity = gravity
};
b2World.prototype.GetGravity = function() {
  return this.m_gravity
};
b2World.prototype.GetGroundBody = function() {
  return this.m_groundBody
};
b2World.prototype.Step = function(dt, velocityIterations, positionIterations) {
  if(this.m_flags & b2World.e_newFixture) {
    this.m_contactManager.FindNewContacts();
    this.m_flags &= ~b2World.e_newFixture
  }
  this.m_flags |= b2World.e_locked;
  var step = b2World.s_timestep2;
  step.dt = dt;
  step.velocityIterations = velocityIterations;
  step.positionIterations = positionIterations;
  if(dt > 0) {
    step.inv_dt = 1 / dt
  }else {
    step.inv_dt = 0
  }
  step.dtRatio = this.m_inv_dt0 * dt;
  step.warmStarting = b2World.m_warmStarting;
  this.m_contactManager.Collide();
  if(step.dt > 0) {
    this.Solve(step)
  }
  if(b2World.m_continuousPhysics && step.dt > 0) {
    this.SolveTOI(step)
  }
  if(step.dt > 0) {
    this.m_inv_dt0 = step.inv_dt
  }
  this.m_flags &= ~b2World.e_locked
};
b2World.prototype.ClearForces = function() {
  for(var body = this.m_bodyList;body;body = body.m_next) {
    body.m_force.SetZero();
    body.m_torque = 0
  }
};
b2World.prototype.DrawDebugData = function() {
  if(this.m_debugDraw == null) {
    return
  }
  this.m_debugDraw.Clear();
  var flags = this.m_debugDraw.GetFlags();
  var i = 0;
  var b;
  var f;
  var s;
  var j;
  var bp;
  var invQ = new b2Vec2;
  var x1 = new b2Vec2;
  var x2 = new b2Vec2;
  var xf;
  var b1 = new b2AABB;
  var b2 = new b2AABB;
  var vs = [new b2Vec2, new b2Vec2, new b2Vec2, new b2Vec2];
  var color = new b2Color(0, 0, 0);
  if(flags & b2DebugDraw.e_shapeBit) {
    for(b = this.m_bodyList;b;b = b.m_next) {
      xf = b.m_xf;
      for(f = b.GetFixtureList();f;f = f.m_next) {
        s = f.GetShape();
        if(b.IsActive() == false) {
          color.Set(0.5, 0.5, 0.3);
          this.DrawShape(s, xf, color)
        }else {
          if(b.GetType() == b2Body.b2_staticBody) {
            color.Set(0.5, 0.9, 0.5);
            this.DrawShape(s, xf, color)
          }else {
            if(b.GetType() == b2Body.b2_kinematicBody) {
              color.Set(0.5, 0.5, 0.9);
              this.DrawShape(s, xf, color)
            }else {
              if(b.IsAwake() == false) {
                color.Set(0.6, 0.6, 0.6);
                this.DrawShape(s, xf, color)
              }else {
                color.Set(0.9, 0.7, 0.7);
                this.DrawShape(s, xf, color)
              }
            }
          }
        }
      }
    }
  }
  if(flags & b2DebugDraw.e_jointBit) {
    for(j = this.m_jointList;j;j = j.m_next) {
      this.DrawJoint(j)
    }
  }
  if(flags & b2DebugDraw.e_controllerBit) {
    for(var c = this.m_controllerList;c;c = c.m_next) {
      c.Draw(this.m_debugDraw)
    }
  }
  if(flags & b2DebugDraw.e_pairBit) {
    color.Set(0.3, 0.9, 0.9);
    for(var contact = this.m_contactManager.m_contactList;contact;contact = contact.GetNext()) {
      var fixtureA = contact.GetFixtureA();
      var fixtureB = contact.GetFixtureB();
      var cA = fixtureA.GetAABB().GetCenter();
      var cB = fixtureB.GetAABB().GetCenter();
      this.m_debugDraw.DrawSegment(cA, cB, color)
    }
  }
  if(flags & b2DebugDraw.e_aabbBit) {
    bp = this.m_contactManager.m_broadPhase;
    vs = [new b2Vec2, new b2Vec2, new b2Vec2, new b2Vec2];
    for(b = this.m_bodyList;b;b = b.GetNext()) {
      if(b.IsActive() == false) {
        continue
      }
      for(f = b.GetFixtureList();f;f = f.GetNext()) {
        var aabb = bp.GetFatAABB(f.m_proxy);
        vs[0].Set(aabb.lowerBound.x, aabb.lowerBound.y);
        vs[1].Set(aabb.upperBound.x, aabb.lowerBound.y);
        vs[2].Set(aabb.upperBound.x, aabb.upperBound.y);
        vs[3].Set(aabb.lowerBound.x, aabb.upperBound.y);
        this.m_debugDraw.DrawPolygon(vs, 4, color)
      }
    }
  }
  if(flags & b2DebugDraw.e_centerOfMassBit) {
    for(b = this.m_bodyList;b;b = b.m_next) {
      xf = b2World.s_xf;
      xf.R = b.m_xf.R;
      xf.position = b.GetWorldCenter();
      this.m_debugDraw.DrawTransform(xf)
    }
  }
};
b2World.prototype.QueryAABB = function(callback, aabb) {
  var broadPhase = this.m_contactManager.m_broadPhase;
  function WorldQueryWrapper(proxy) {
    return callback(broadPhase.GetUserData(proxy))
  }
  broadPhase.Query(WorldQueryWrapper, aabb)
};
b2World.prototype.QueryShape = function(callback, shape, transform) {
  if(transform == null) {
    transform = new b2Transform;
    transform.SetIdentity()
  }
  var broadPhase = this.m_contactManager.m_broadPhase;
  function WorldQueryWrapper(proxy) {
    var fixture = broadPhase.GetUserData(proxy);
    if(b2Shape.TestOverlap(shape, transform, fixture.GetShape(), fixture.GetBody().GetTransform())) {
      return callback(fixture)
    }
    return true
  }
  var aabb = new b2AABB;
  shape.ComputeAABB(aabb, transform);
  broadPhase.Query(WorldQueryWrapper, aabb)
};
b2World.prototype.QueryPoint = function(callback, p) {
  var broadPhase = this.m_contactManager.m_broadPhase;
  function WorldQueryWrapper(proxy) {
    var fixture = broadPhase.GetUserData(proxy);
    if(fixture.TestPoint(p)) {
      return callback(fixture)
    }
    return true
  }
  var aabb = new b2AABB;
  aabb.lowerBound.Set(p.x - b2Settings.b2_linearSlop, p.y - b2Settings.b2_linearSlop);
  aabb.upperBound.Set(p.x + b2Settings.b2_linearSlop, p.y + b2Settings.b2_linearSlop);
  broadPhase.Query(WorldQueryWrapper, aabb)
};
b2World.prototype.RayCast = function(callback, point1, point2) {
  var broadPhase = this.m_contactManager.m_broadPhase;
  var output = new b2RayCastOutput;
  function RayCastWrapper(input, proxy) {
    var userData = broadPhase.GetUserData(proxy);
    var fixture = userData;
    var hit = fixture.RayCast(output, input);
    if(hit) {
      var fraction = output.fraction;
      var point = new b2Vec2((1 - fraction) * point1.x + fraction * point2.x, (1 - fraction) * point1.y + fraction * point2.y);
      return callback(fixture, point, output.normal, fraction)
    }
    return input.maxFraction
  }
  var input = new b2RayCastInput(point1, point2);
  broadPhase.RayCast(RayCastWrapper, input)
};
b2World.prototype.RayCastOne = function(point1, point2) {
  var result;
  function RayCastOneWrapper(fixture, point, normal, fraction) {
    result = fixture;
    return fraction
  }
  this.RayCast(RayCastOneWrapper, point1, point2);
  return result
};
b2World.prototype.RayCastAll = function(point1, point2) {
  var result = new Array;
  function RayCastAllWrapper(fixture, point, normal, fraction) {
    result[result.length] = fixture;
    return 1
  }
  this.RayCast(RayCastAllWrapper, point1, point2);
  return result
};
b2World.prototype.GetBodyList = function() {
  return this.m_bodyList
};
b2World.prototype.GetJointList = function() {
  return this.m_jointList
};
b2World.prototype.GetContactList = function() {
  return this.m_contactList
};
b2World.prototype.IsLocked = function() {
  return(this.m_flags & b2World.e_locked) > 0
};
b2World.prototype.s_stack = new Array;
b2World.prototype.m_flags = 0;
b2World.prototype.m_contactManager = new b2ContactManager;
b2World.prototype.m_contactSolver = new b2ContactSolver;
b2World.prototype.m_island = new b2Island;
b2World.prototype.m_bodyList = null;
b2World.prototype.m_jointList = null;
b2World.prototype.m_contactList = null;
b2World.prototype.m_bodyCount = 0;
b2World.prototype.m_contactCount = 0;
b2World.prototype.m_jointCount = 0;
b2World.prototype.m_controllerList = null;
b2World.prototype.m_controllerCount = 0;
b2World.prototype.m_gravity = null;
b2World.prototype.m_allowSleep = null;
b2World.prototype.m_groundBody = null;
b2World.prototype.m_destructionListener = null;
b2World.prototype.m_debugDraw = null;
b2World.prototype.m_inv_dt0 = null;if(typeof exports !== "undefined") {
  exports.b2BoundValues = b2BoundValues;
  exports.b2Math = b2Math;
  exports.b2DistanceOutput = b2DistanceOutput;
  exports.b2Mat33 = b2Mat33;
  exports.b2ContactPoint = b2ContactPoint;
  exports.b2PairManager = b2PairManager;
  exports.b2PositionSolverManifold = b2PositionSolverManifold;
  exports.b2OBB = b2OBB;
  exports.b2CircleContact = b2CircleContact;
  exports.b2PulleyJoint = b2PulleyJoint;
  exports.b2Pair = b2Pair;
  exports.b2TimeStep = b2TimeStep;
  exports.b2FixtureDef = b2FixtureDef;
  exports.b2World = b2World;
  exports.b2PrismaticJoint = b2PrismaticJoint;
  exports.b2Controller = b2Controller;
  exports.b2ContactID = b2ContactID;
  exports.b2RevoluteJoint = b2RevoluteJoint;
  exports.b2JointDef = b2JointDef;
  exports.b2Transform = b2Transform;
  exports.b2GravityController = b2GravityController;
  exports.b2EdgeAndCircleContact = b2EdgeAndCircleContact;
  exports.b2EdgeShape = b2EdgeShape;
  exports.b2BuoyancyController = b2BuoyancyController;
  exports.b2LineJointDef = b2LineJointDef;
  exports.b2Contact = b2Contact;
  exports.b2DistanceJoint = b2DistanceJoint;
  exports.b2Body = b2Body;
  exports.b2DestructionListener = b2DestructionListener;
  exports.b2PulleyJointDef = b2PulleyJointDef;
  exports.b2ContactEdge = b2ContactEdge;
  exports.b2ContactConstraint = b2ContactConstraint;
  exports.b2ContactImpulse = b2ContactImpulse;
  exports.b2DistanceJointDef = b2DistanceJointDef;
  exports.b2ContactResult = b2ContactResult;
  exports.b2EdgeChainDef = b2EdgeChainDef;
  exports.b2Vec2 = b2Vec2;
  exports.b2Vec3 = b2Vec3;
  exports.b2DistanceProxy = b2DistanceProxy;
  exports.b2FrictionJointDef = b2FrictionJointDef;
  exports.b2PolygonContact = b2PolygonContact;
  exports.b2TensorDampingController = b2TensorDampingController;
  exports.b2ContactFactory = b2ContactFactory;
  exports.b2WeldJointDef = b2WeldJointDef;
  exports.b2ConstantAccelController = b2ConstantAccelController;
  exports.b2GearJointDef = b2GearJointDef;
  exports.ClipVertex = ClipVertex;
  exports.b2SeparationFunction = b2SeparationFunction;
  exports.b2ManifoldPoint = b2ManifoldPoint;
  exports.b2Color = b2Color;
  exports.b2PolygonShape = b2PolygonShape;
  exports.b2DynamicTreePair = b2DynamicTreePair;
  exports.b2ContactConstraintPoint = b2ContactConstraintPoint;
  exports.b2FrictionJoint = b2FrictionJoint;
  exports.b2ContactFilter = b2ContactFilter;
  exports.b2ControllerEdge = b2ControllerEdge;
  exports.b2Distance = b2Distance;
  exports.b2Fixture = b2Fixture;
  exports.b2DynamicTreeNode = b2DynamicTreeNode;
  exports.b2MouseJoint = b2MouseJoint;
  exports.b2DistanceInput = b2DistanceInput;
  exports.b2BodyDef = b2BodyDef;
  exports.b2DynamicTreeBroadPhase = b2DynamicTreeBroadPhase;
  exports.b2Settings = b2Settings;
  exports.b2Proxy = b2Proxy;
  exports.b2Point = b2Point;
  exports.b2BroadPhase = b2BroadPhase;
  exports.b2Manifold = b2Manifold;
  exports.b2WorldManifold = b2WorldManifold;
  exports.b2PrismaticJointDef = b2PrismaticJointDef;
  exports.b2RayCastOutput = b2RayCastOutput;
  exports.b2ConstantForceController = b2ConstantForceController;
  exports.b2TimeOfImpact = b2TimeOfImpact;
  exports.b2CircleShape = b2CircleShape;
  exports.b2MassData = b2MassData;
  exports.b2Joint = b2Joint;
  exports.b2GearJoint = b2GearJoint;
  exports.b2DynamicTree = b2DynamicTree;
  exports.b2JointEdge = b2JointEdge;
  exports.b2LineJoint = b2LineJoint;
  exports.b2NullContact = b2NullContact;
  exports.b2ContactListener = b2ContactListener;
  exports.b2RayCastInput = b2RayCastInput;
  exports.b2TOIInput = b2TOIInput;
  exports.Features = Features;
  exports.b2FilterData = b2FilterData;
  exports.b2Island = b2Island;
  exports.b2ContactManager = b2ContactManager;
  exports.b2ContactSolver = b2ContactSolver;
  exports.b2Simplex = b2Simplex;
  exports.b2AABB = b2AABB;
  exports.b2Jacobian = b2Jacobian;
  exports.b2Bound = b2Bound;
  exports.b2RevoluteJointDef = b2RevoluteJointDef;
  exports.b2PolyAndEdgeContact = b2PolyAndEdgeContact;
  exports.b2SimplexVertex = b2SimplexVertex;
  exports.b2WeldJoint = b2WeldJoint;
  exports.b2Collision = b2Collision;
  exports.b2Mat22 = b2Mat22;
  exports.b2SimplexCache = b2SimplexCache;
  exports.b2PolyAndCircleContact = b2PolyAndCircleContact;
  exports.b2MouseJointDef = b2MouseJointDef;
  exports.b2Shape = b2Shape;
  exports.b2Segment = b2Segment;
  exports.b2ContactRegister = b2ContactRegister;
  exports.b2DebugDraw = b2DebugDraw;
  exports.b2Sweep = b2Sweep
}
;

}};
__resources__["/__builtin__/libs/cocos2d/ActionManager.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util'),
    console = require('system').console,
    Timer = require('./Scheduler').Timer,
    Scheduler = require('./Scheduler').Scheduler;

var ActionManager = BObject.extend(/** @lends cocos.ActionManager# */{
    targets: null,
    currentTarget: null,
    currentTargetSalvaged: null,

    /**
     * <p>A singleton that manages all the actions. Normally you
     * won't need to use this singleton directly. 99% of the cases you will use the
     * cocos.nodes.Node interface, which uses this singleton. But there are some cases where
     * you might need to use this singleton. Examples:</p>
     *
     * <ul>
     * <li>When you want to run an action where the target is different from a cocos.nodes.Node</li>
     * <li>When you want to pause / resume the actions</li>
     * </ul>
     *
     * @memberOf cocos
     * @constructs
     * @extends BObject
     * @singleton
     */
    init: function () {
        ActionManager.superclass.init.call(this);

        Scheduler.get('sharedScheduler').scheduleUpdate({target: this, priority: 0, paused: false});
        this.targets = [];
    },

    /**
     * Adds an action with a target. If the target is already present, then the
     * action will be added to the existing target. If the target is not
     * present, a new instance of this target will be created either paused or
     * paused, and the action will be added to the newly created target. When
     * the target is paused, the queued actions won't be 'ticked'.
     *
     * @opt {cocos.nodes.Node} target Node to run the action on
     */
    addAction: function (opts) {

        var targetID = opts.target.get('id');
        var element = this.targets[targetID];

        if (!element) {
            element = this.targets[targetID] = {
                paused: false,
                target: opts.target,
                actions: []
            };
        }

        element.actions.push(opts.action);

        opts.action.startWithTarget(opts.target);
    },

    /**
     * Remove an action
     *
     * @param {cocos.actions.Action} action Action to remove
     */
    removeAction: function (action) {
        var targetID = action.originalTarget.get('id'),
            element = this.targets[targetID];

        if (!element) {
            return;
        }

        var actionIndex = element.actions.indexOf(action);

        if (actionIndex == -1) {
            return;
        }

        if (this.currentTarget == element) {
            element.currentActionSalvaged = true;
        } 
        
        element.actions[actionIndex] = null;
        element.actions.splice(actionIndex, 1); // Delete array item

        if (element.actions.length === 0) {
            if (this.currentTarget == element) {
                this.set('currentTargetSalvaged', true);
            }
        }
            
    },

    /**
     * Fetch an action belonging to a cocos.nodes.Node
     *
     * @returns {cocos.actions.Action}
     *
     * @opts {cocos.nodes.Node} target Target of the action
     * @opts {String} tag Tag of the action
     */
    getActionFromTarget: function(opts) {
        var tag = opts.tag,
            targetID = opts.target.get('id');

        var element = this.targets[targetID];
        if (!element) {
            return null;
        }
        for (var i = 0; i < element.actions.length; i++ ) {
            if (element.actions[i] && 
                (element.actions[i].get('tag') === tag)) {
                return element.actions[i];
            }
        }
        // Not found
        return null;
    },
     
    /**
     * Remove all actions for a cocos.nodes.Node
     *
     * @param {cocos.nodes.Node} target Node to remove all actions for
     */
    removeAllActionsFromTarget: function (target) {
        var targetID = target.get('id');

        var element = this.targets[targetID];
        if (!element) {
            return;
        }
        // Delete everything in array but don't replace it incase something else has a reference
        element.actions.splice(0, element.actions.length);
    },

    /**
     * @private
     */
    update: function (dt) {
        var self = this;
        util.each(this.targets, function (currentTarget, i) {

            if (!currentTarget) {
                return;
            }
            self.currentTarget = currentTarget;

            if (!currentTarget.paused) {
                util.each(currentTarget.actions, function (currentAction, j) {
                    if (!currentAction) {
                        return;
                    }

                    currentTarget.currentAction = currentAction;
                    currentTarget.currentActionSalvaged = false;

                    currentTarget.currentAction.step(dt);

                    if (currentTarget.currentAction.get('isDone')) {
                        currentTarget.currentAction.stop();

                        var a = currentTarget.currentAction;
                        currentTarget.currentAction = null;
                        self.removeAction(a);
                    }

                    currentTarget.currentAction = null;

                });
            }

            if (self.currentTargetSalvaged && currentTarget.actions.length === 0) {
                self.targets[i] = null;
                delete self.targets[i];
            }
        });
    },

    pauseTarget: function (target) {
    },

    resumeTarget: function (target) {
        // TODO
    }
});

util.extend(ActionManager, /** @lends cocos.ActionManager */{
    /**
     * Singleton instance of cocos.ActionManager
     * @getter sharedManager
     * @type cocos.ActionManager
     */
    get_sharedManager: function (key) {
        if (!this._instance) {
            this._instance = this.create();
        }

        return this._instance;
    }
});

exports.ActionManager = ActionManager;

}};
__resources__["/__builtin__/libs/cocos2d/actions/Action.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util'),
    console = require('system').console,
    geo = require('geometry'),
    ccp = geo.ccp;

/** 
 * @memberOf cocos.actions
 * @class Base class for Actions
 * @extends BObject
 * @constructor
 */
var Action = BObject.extend(/** @lends cocos.actions.Action# */{
    /**
     * The Node the action is being performed on
     * @type cocos.nodes.Node
     */
    target: null,
    originalTarget: null,
    
    /**
     * Unique tag to identify the action
     * @type *
     */
    tag: null,
    
    /**
     * Called every frame with it's delta time.
     *
     * @param {Float} dt The delta time
     */
    step: function (dt) {
        window.console.warn("Action.step() Override me");
    },

    /**
     * Called once per frame.
     *
     * @param {Float} time How much of the animation has played. 0.0 = just started, 1.0 just finished.
     */
    update: function (time) {
        window.console.warn("Action.update() Override me");
    },

    /**
     * Called before the action start. It will also set the target.
     *
     * @param {cocos.nodes.Node} target The Node to run the action on
     */
    startWithTarget: function (target) {
        this.target = this.originalTarget = target;
    },

    /**
     * Called after the action has finished. It will set the 'target' to nil.
     * <strong>Important</strong>: You should never call cocos.actions.Action#stop manually.
     * Instead, use cocos.nodes.Node#stopAction(action)
     */
    stop: function () {
        this.target = null;
    },

    /**
     * @getter isDone
     * @type {Boolean} 
     */
    get_isDone: function (key) {
        return true;
    },


    /**
     * Returns a copy of this Action but in reverse
     *
     * @returns {cocos.actions.Action} A new Action in reverse
     */
    reverse: function () {
    }
});

var RepeatForever = Action.extend(/** @lends cocos.actions.RepeatForever# */{
    other: null,

    /**
     * @memberOf cocos.actions
     * @class Repeats an action forever. To repeat the an action for a limited
     * number of times use the cocos.Repeat action.
     * @extends cocos.actions.Action
     * @param {cocos.actions.Action} action An action to repeat forever
     * @constructs
     */
    init: function (action) {
        RepeatForever.superclass.init(this, action);

        this.other = action;
    },

    startWithTarget: function (target) {
        RepeatForever.superclass.startWithTarget.call(this, target);

        this.other.startWithTarget(this.target);
    },

    step: function (dt) {
        this.other.step(dt);
        if (this.other.get('isDone')) {
            var diff = dt - this.other.get('duration') - this.other.get('elapsed');
            this.other.startWithTarget(this.target);

            this.other.step(diff);
        }
    },

    get_isDone: function () {
        return false;
    },

    reverse: function () {
        return RepeatForever.create(this.other.reverse());
    },

    copy: function () {
        return RepeatForever.create(this.other.copy());
    }
});

var FiniteTimeAction = Action.extend(/** @lends cocos.actions.FiniteTimeAction# */{
    /**
     * Number of seconds to run the Action for
     * @type Float
     */
    duration: 2,

    /** 
     * Repeats an action a number of times. To repeat an action forever use the
     * cocos.RepeatForever action.
     *
     * @memberOf cocos.actions
     * @constructs
     * @extends cocos.actions.Action
     */
    init: function () {
        FiniteTimeAction.superclass.init.call(this);
    },

    /** @ignore */
    reverse: function () {
        console.log('FiniteTimeAction.reverse() Override me');
    }
});

var Speed = Action.extend(/** @lends cocos.actions.Speed# */{
    other: null,
    
    /** 
     * speed of the inner function
     * @type Float
     */
    speed: 1.0,
    
    /** 
     * Changes the speed of an action, making it take longer (speed>1)
     * or less (speed<1) time.
     * Useful to simulate 'slow motion' or 'fast forward' effect.
     * @warning This action can't be Sequenceable because it is not an IntervalAction
     *
     * @memberOf cocos.actions
     * @constructs
     * @extends cocos.actions.Action
     */
    init: function(opts) {
        Speed.superclass.init.call(this, opts);
        
        this.other = opts.action;
        this.speed = opts.speed;
    },
    
    startWithTarget: function(target) {
        Speed.superclass.startWithTarget.call(this, target);
        this.other.startWithTarget(this.target);
    },
    
    setSpeed: function(speed) {
        this.speed = speed;
    },
    
    stop: function() {
        this.other.stop();
        Speed.superclass.stop.call(this);
    },
    
    step: function(dt) {
        this.other.step(dt * this.speed);
    },
    
    get_isDone: function() {
        return this.other.get_isDone();
    },
    
    copy: function() {
        return Speed.create({action: this.other.copy(), speed: this.speed});
    },
    
    reverse: function() {
        return Speed.create({action: this.other.reverse(), speed: this.speed});
    }
});

var Follow = Action.extend(/** @lends cocos.actions.Follow# */{
    /**
     * node to follow
     */
    followedNode: null,
    
    /**
     * whether camera should be limited to certain area
     * @type {Boolean}
     */
    boundarySet: false,
    
    /**
     * if screensize is bigger than the boundary - update not needed 
     * @type {Boolean}
     */
    boundaryFullyCovered: false,
    
    /**
     * fast access to the screen dimensions 
     * @type {geometry.Point}
     */
    halfScreenSize: null,
    fullScreenSize: null,
    
    /**
     * world boundaries
     * @type {Float}
     */
    leftBoundary: 0,
    rightBoundary: 0,
    topBoundary: 0,
    bottomBoundary: 0,
    
    /** 
     * @class Follow an action that "follows" a node.
     *
     * Eg:
     * layer.runAction(cocos.actions.Follow.create({target: hero}))
     *
     * @memberOf cocos.actions
     * @constructs
     * @extends cocos.actions.Action
     *
     * @opt {cocos.nodes.Node} target
     * @opt {geometry.Rect} worldBoundary
     */
    init: function(opts) {
        Follow.superclass.init.call(this, opts);
        
        this.followedNode = opts.target;
        
        var s = require('../Director').Director.get('sharedDirector').get('winSize');
        this.fullScreenSize = geo.ccp(s.width, s.height);
        this.halfScreenSize = geo.ccpMult(this.fullScreenSize, geo.ccp(0.5, 0.5));
        
        if (opts.worldBoundary !== undefined) {
            this.boundarySet = true;
            this.leftBoundary = -((opts.worldBoundary.origin.x + opts.worldBoundary.size.width) - this.fullScreenSize.x);
            this.rightBoundary = -opts.worldBoundary.origin.x;
            this.topBoundary = -opts.worldBoundary.origin.y;
            this.bottomBoundary = -((opts.worldBoundary.origin.y+opts.worldBoundary.size.height) - this.fullScreenSize.y);
            
            if (this.rightBoundary < this.leftBoundary) {
                // screen width is larger than world's boundary width
                //set both in the middle of the world
                this.rightBoundary = this.leftBoundary = (this.leftBoundary + this.rightBoundary) / 2;
            }
            if (this.topBoundary < this.bottomBoundary)
            {
                // screen width is larger than world's boundary width
                //set both in the middle of the world
                this.topBoundary = this.bottomBoundary = (this.topBoundary + this.bottomBoundary) / 2;
            }
            if ((this.topBoundary == this.bottomBoundary) && (this.leftBoundary == this.rightBoundary)) {
                this.boundaryFullyCovered = true;
            }
        }
    },
    
    step: function(dt) {
        if (this.boundarySet) {
            // whole map fits inside a single screen, no need to modify the position - unless map boundaries are increased
            if (this.boundaryFullyCovered) {
                return;
            }
            var tempPos = geo.ccpSub(this.halfScreenSize, this.followedNode.get('position'));
            this.target.set('position', ccp(
                Math.min(Math.max(tempPos.x, this.leftBoundary), this.rightBoundary),
                Math.min(Math.max(tempPos.y, this.bottomBoundary), this.topBoundary))
            );
        } else {
            this.target.set('position', geo.ccpSub(this.halfScreenSize, this.followedNode.get('position')));
        }
    },
    
    get_isDone: function() {
        return !this.followedNode.get('isRunning');
    }
});


exports.Action = Action;
exports.RepeatForever = RepeatForever;
exports.FiniteTimeAction = FiniteTimeAction;
exports.Speed = Speed;
exports.Follow = Follow;

}};
__resources__["/__builtin__/libs/cocos2d/actions/ActionEase.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util'),
    ActionInterval = require('./ActionInterval').ActionInterval,
    geo = require('geometry'),
    ccp = geo.ccp;

var ActionEase = ActionInterval.extend(/** @lends cocos.actions.ActionEase# */{
    other: null,
    
    /**
     * @class Base class for Easing actions
     *
     * @memberOf cocos.actions
     * @constructs
     * @extends cocos.actions.ActionInterval
     *
     * @opt {cocos.actions.ActionInterval} action
     */
    init: function(opts) {
        if (!opts.action) {
            throw "Ease: action argument must be non-nil";
        }
        ActionEase.superclass.init.call(this, {duration: opts.action.duration});
        
        this.other = opts.action;
    },
    
    startWithTarget: function(target) {
        ActionEase.superclass.startWithTarget.call(this, target);
        this.other.startWithTarget(this.target);
    },
    
    stop: function() {
        this.other.stop();
        ActionEase.superclass.stop.call(this);
    },
    /*
    update: function(t) {
        this.other.update(t);
    },
    */
    copy: function() {
        return ActionEase.create({action: this.other.copy()});
    },
    
    reverse: function() {
        return ActionEase.create({action: this.other.reverse()});
    }
});

var EaseRate = ActionEase.extend(/** @lends cocos.actions.EaseRate# */{
    /**
     * rate value for the actions 
     * @type {Float} 
     */
    rate: 0,
    
    /**
    * @class Base class for Easing actions with rate parameter
    *
    * @memberOf cocos.actions
    * @constructs
    * @extends cocos.actions.ActionEase
    *
    * @opt {cocos.actions.ActionInterval} action
    * @opt {Float} rate
    */
    init: function(opts) {
        EaseRate.superclass.init.call(this, opts);

        this.rate = opts.rate;
    },
    
    copy: function() {
        return EaseRate.create({action: this.other.copy(), rate: this.rate});
    },
    
    reverse: function() {
        return EaseRate.create({action: this.other.reverse(), rate: 1 / this.rate});
    }
});

/**
 * @class EaseIn action with a rate
 */
var EaseIn = EaseRate.extend(/** @lends cocos.actions.EaseIn# */{
    update: function(t) {
        this.other.update(Math.pow(t, this.rate));
    },
    
    copy: function() {
        return EaseIn.create({action: this.other.copy(), rate: this.rate});
    },
    
    reverse: function() {
        return EaseIn.create({action: this.other.reverse(), rate: 1 / this.rate});
    }
});

/**
 * @class EaseOut action with a rate
 */
var EaseOut = EaseRate.extend(/** @lends cocos.actions.EaseOut# */{
    update: function(t) {
        this.other.update(Math.pow(t, 1/this.rate));
    },
    
    copy: function() {
        return EaseOut.create({action: this.other.copy(), rate: this.rate});
    },
    
    reverse: function() {
        return EaseOut.create({action: this.other.reverse(), rate: 1 / this.rate});
    }
});

/**
 * @class EaseInOut action with a rate
 */
var EaseInOut = EaseRate.extend(/** @lends cocos.actions.EaseInOut# */{
    update: function(t) {
        var sign = 1;
        var r = Math.floor(this.rate);
        if (r % 2 == 0) {
            sign = -1;
        }
        t *= 2;
        if (t < 1) {
            this.other.update(0.5 * Math.pow(t, this.rate));
        } else {
            this.other.update(sign * 0.5 * (Math.pow(t-2, this.rate) + sign * 2));
        }
    },
    
    copy: function() {
        return EaseInOut.create({action: this.other.copy(), rate: this.rate});
    },
    
    reverse: function() {
        return EaseInOut.create({action: this.other.reverse(), rate: this.rate});
    }
});

/**
 * @class EaseExponentialIn action
 */
var EaseExponentialIn = ActionEase.extend(/** @lends cocos.actions.EaseExponentialIn# */{
    update: function(t) {
        this.other.update((t == 0) ? 0 : (Math.pow(2, 10 * (t/1 - 1)) - 1 * 0.001));
    },
    
    copy: function() {
        return EaseExponentialIn.create({action: this.other.copy()});
    },
    
    reverse: function() {
        return exports.EaseExponentialOut.create({action: this.other.reverse()});
    }
});

/**
 * @class EaseExponentialOut action
 */
var EaseExponentialOut = ActionEase.extend(/** @lends cocos.actions.EaseExponentialOut# */{
    update: function(t) {
        this.other.update((t == 1) ? 1 : (-Math.pow(2, -10 * t/1) + 1));
    },
    
    copy: function() {
        return EaseExponentialOut.create({action: this.other.copy()});
    },
    
    reverse: function() {
        return exports.EaseExponentialIn.create({action: this.other.reverse()});
    }
});

/**
 * @class EaseExponentialInOut action
 */
var EaseExponentialInOut = ActionEase.extend(/** @lends cocos.actions.EaseExponentialInOut# */{
    update: function(t) {
        t /= 0.5;
        if (t < 1) {
            t = 0.5 * Math.pow(2, 10 * (t - 1));
        } else {
            t = 0.5 * (-Math.pow(2, -10 * (t - 1)) + 2);
        }
        this.other.update(t);
    },
    
    copy: function() {
        return EaseExponentialInOut.create({action: this.other.copy()});
    },
    
    reverse: function() {
        return EaseExponentialInOut.create({action: this.other.reverse()});
    }
});

/**
 * @class EaseSineIn action
 */
var EaseSineIn = ActionEase.extend(/** @lends cocos.actions.EaseSineIn# */{
    update: function(t) {
        this.other.update(-1 * Math.cos(t * Math.PI_2) + 1);
    },
    
    copy: function() {
        return EaseSineIn.create({action: this.other.copy()});
    },
    
    reverse: function() {
        return exports.EaseSineOut.create({action: this.other.reverse()});
    }
});

/**
 * @class EaseSineOut action
 */
var EaseSineOut = ActionEase.extend(/** @lends cocos.actions.EaseSineOut# */{
    update: function(t) {
        this.other.update(Math.sin(t * Math.PI_2));
    },
    
    copy: function() {
        return EaseSineOut.create({action: this.other.copy()});
    },
    
    reverse: function() {
        return exports.EaseSineIn.create({action: this.other.reverse()});
    }
});

/**
 * @class EaseSineInOut action
 */
var EaseSineInOut = ActionEase.extend(/** @lends cocos.actions.EaseSineInOut# */{
    update: function(t) {
        this.other.update(-0.5 * (Math.cos(t * Math.PI) - 1));
    },
    
    copy: function() {
        return EaseSineInOut.create({action: this.other.copy()});
    },
    
    reverse: function() {
        return EaseSineInOut.create({action: this.other.reverse()});
    }
});

var EaseElastic = ActionEase.extend(/** @lends cocos.actions.EaseElastic# */{
    /**
    * period of the wave in radians. default is 0.3
    * @type {Float}
    */
    period: 0.3,

    /**
    * @class EaseElastic Ease Elastic abstract class
    *
    * @memberOf cocos.actions
    * @constructs
    * @extends cocos.actions.ActionEase
    *
    * @opt {cocos.actions.ActionInterval} action
    * @opt {Float} period
    */
    init: function(opts) {
        EaseElastic.superclass.init.call(this, {action: opts.action});

        if (opts.period !== undefined) {
            this.period = opts.period;
        }
    },

    copy: function() {
        return EaseElastic.create({action: this.other.copy(), period: this.period});
    },

    reverse: function() {
        window.console.warn("EaseElastic reverse(): Override me");
        return null;
    }
});

var EaseElasticIn = EaseElastic.extend(/** @lends cocos.actions.EaseElasticIn# */{
    /** 
     * @class EaseElasticIn Ease Elastic In action
     */
    update: function(t) {
        var newT = 0;
        if (t == 0 || t == 1) {
            newT = t;
        } else {
            var s = this.period / 4;
            t -= 1;
            newT = -Math.pow(2, 10 * t) * Math.sin((t - s) * Math.PI*2 / this.period);
        }
        this.other.update(newT);
    },
    
    // Wish we could use base class's copy
    copy: function() {
        return EaseElasticIn.create({action: this.other.copy(), period: this.period});
    },
    
    reverse: function() {
        return exports.EaseElasticOut.create({action: this.other.reverse(), period: this.period});
    }
});

var EaseElasticOut = EaseElastic.extend(/** @lends cocos.actions.EaseElasticOut# */{
    /** 
     * @class EaseElasticOut Ease Elastic Out action
     */
    update: function(t) {
        var newT = 0;
        if (t == 0 || t == 1) {
            newT = t;
        } else {
            var s = this.period / 4;
            newT = Math.pow(2, -10 * t) * Math.sin((t - s) * Math.PI*2 / this.period) + 1;
        }
        this.other.update(newT);
    },
    
    copy: function() {
        return EaseElasticOut.create({action: this.other.copy(), period: this.period});
    },
    
    reverse: function() {
        return exports.EaseElasticIn.create({action: this.other.reverse(), period: this.period});
    }
});

var EaseElasticInOut = EaseElastic.extend(/** @lends cocos.actions.EaseElasticInOut# */{
    /** 
     * @class EaseElasticInOut Ease Elastic InOut action
     */
    update: function(t) {
        var newT = 0;
        if (t == 0 || t == 1) {
            newT = t;
        } else {
            t *= 2;
            if (this.period == 0) {
                this.period = 0.3 * 1.5;
            }
            var s = this.period / 4;
            
            t -= 1;
            if (t < 0) {
                newT = -0.5 * Math.pow(2, 10 * t) * Math.sin((t - s) * Math.PI*2 / this.period);
            } else {
                newT = Math.pow(2, -10 * t) * Math.sin((t - s) * Math.PI*2 / this.period) * 0.5 + 1;
            }
        }
        this.other.update(newT);
    },
    
    copy: function() {
        return EaseElasticInOut.create({action: this.other.copy(), period: this.period});
    },
    
    reverse: function() {
        return EaseElasticInOut.create({action: this.other.reverse(), period: this.period});
    }
});

var EaseBounce = ActionEase.extend(/** @lends cocos.actions.EaseBounce# */{
    /** 
     * @class EaseBounce abstract class
     */
    bounceTime: function(t) {
        // Direct cut & paste from CCActionEase.m, obviously.
        // Glad someone else figured out all this math...
        if (t < 1 / 2.75) {
            return 7.5625 * t * t;
        }
        else if (t < 2 / 2.75) {
            t -= 1.5 / 2.75;
            return 7.5625 * t * t + 0.75;
        }
        else if (t < 2.5 / 2.75) {
            t -= 2.25 / 2.75;
            return 7.5625 * t * t + 0.9375;
        }

        t -= 2.625 / 2.75;
        return 7.5625 * t * t + 0.984375;
    }
});

var EaseBounceIn = EaseBounce.extend(/** @lends cocos.actions.EaseBounceIn# */{
    /** 
     * @class EaseBounceIn EaseBounceIn action
     */
    update: function(t) {
        var newT = 1 - this.bounceTime(1-t);
        this.other.update(newT);
    },
    
    copy: function() {
        return EaseBounceIn.create({action: this.other.copy()});
    },
    
    reverse: function() {
        return exports.EaseBounceOut.create({action: this.other.reverse()});
    }
});

var EaseBounceOut = EaseBounce.extend(/** @lends cocos.actions.EaseBounceOut# */{
    /** 
     * @class EaseBounceOut EaseBounceOut action
     */
    update: function(t) {
        var newT = this.bounceTime(t);
        this.other.update(newT);
    },
    
    copy: function() {
        return EaseBounceOut.create({action: this.other.copy()});
    },
    
    reverse: function() {
        return exports.EaseBounceIn.create({action: this.other.reverse()});
    }
});

var EaseBounceInOut = EaseBounce.extend(/** @lends cocos.actions.EaseBounceInOut# */{
    /** 
     * @class EaseBounceInOut EaseBounceInOut action
     */
    update: function(t) {
        var newT = 0;
        if (t < 0.5) {
            t *= 2;
            newT = (1 - this.bounceTime(1 - t)) * 0.5;
        } else {
            newT = this.bounceTime(t * 2 - 1) * 0.5 + 0.5;
        }
        this.other.update(newT);
    },
    
    copy: function() {
        return EaseBounceInOut.create({action: this.other.copy()});
    },
    
    reverse: function() {
        return EaseBounceInOut.create({action: this.other.reverse()});
    }
});

var EaseBackIn = ActionEase.extend(/** @lends cocos.actions.EaseBackIn# */{
    /** 
     * @class EaseBackIn EaseBackIn action
     */
    update: function(t) {
        var overshoot = 1.70158;
        this.other.update(t * t * ((overshoot + 1) * t - overshoot));
    },
    
    copy: function() {
        return EaseBackIn.create({action: this.other.copy()});
    },
    
    reverse: function() {
        return exports.EaseBackOut.create({action: this.other.reverse()});
    }
});

var EaseBackOut = ActionEase.extend(/** @lends cocos.actions.EaseBackOut# */{
    /** 
     * @class EaseBackOut EaseBackOut action
     */
    update: function(t) {
        var overshoot = 1.70158;
        t -= 1;
        this.other.update(t * t * ((overshoot + 1) * t + overshoot) + 1);
    },
    
    copy: function() {
        return EaseBackOut.create({action: this.other.copy()});
    },
    
    reverse: function() {
        return exports.EaseBackIn.create({action: this.other.reverse()});
    }
});

var EaseBackInOut = ActionEase.extend(/** @lends cocos.actions.EaseBackInOut# */{
    /** 
     * @class EaseBackInOut EaseBackInOut action
     */
    update: function(t) {
        // Where do these constants come from?
        var overshoot = 1.70158 * 1.525;
        t *= 2;
        if (t < 1) {
            this.other.update((t * t * ((overshoot + 1) * t - overshoot)) / 2);
        } else {
            t -= 2;
            this.other.update((t * t * ((overshoot + 1) * t + overshoot)) / 2 + 1);
        }
    },
    
    copy: function() {
        return EaseBackInOut.create({action: this.other.copy()});
    },
    
    reverse: function() {
        return EaseBackInOut.create({action: this.other.reverse()});
    }
});

exports.ActionEase = ActionEase;
exports.EaseRate = EaseRate;
exports.EaseIn = EaseIn;
exports.EaseOut = EaseOut;
exports.EaseInOut = EaseInOut;
exports.EaseExponentialIn = EaseExponentialIn;
exports.EaseExponentialOut = EaseExponentialOut;
exports.EaseExponentialInOut = EaseExponentialInOut;
exports.EaseSineIn = EaseSineIn;
exports.EaseSineOut = EaseSineOut;
exports.EaseSineInOut = EaseSineInOut;
exports.EaseElastic = EaseElastic;
exports.EaseElasticIn = EaseElasticIn;
exports.EaseElasticOut = EaseElasticOut;
exports.EaseElasticInOut = EaseElasticInOut;
exports.EaseBounce = EaseBounce;
exports.EaseBounceIn = EaseBounceIn;
exports.EaseBounceOut = EaseBounceOut;
exports.EaseBounceInOut = EaseBounceInOut;
exports.EaseBackIn = EaseBackIn;
exports.EaseBackOut = EaseBackOut;
exports.EaseBackInOut = EaseBackInOut;


}};
__resources__["/__builtin__/libs/cocos2d/actions/ActionInstant.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util'),
    act = require('./Action'),
    ccp = require('geometry').ccp;

var ActionInstant = act.FiniteTimeAction.extend(/** @lends cocos.actions.ActionInstant */{
    /**
     * @class Base class for actions that triggers instantly. They have no duration.
     *
     * @memberOf cocos.actions
     * @extends cocos.actions.FiniteTimeAction
     * @constructs
     */
    init: function (opts) {
        ActionInstant.superclass.init.call(this, opts);

        this.duration = 0;
    },
    
    get_isDone: function () {
        return true;
    },
    
    step: function (dt) {
        this.update(1);
    },
    
    update: function (t) {
        // ignore
    },
    
    copy: function() {
        return this;
    },
    
    reverse: function () {
        return this.copy();
    }
});

var Show = ActionInstant.extend(/** @lends cocos.actions.Show# */{
    /** 
    * @class Show Show the node
    **/
    startWithTarget: function(target) {
        Show.superclass.startWithTarget.call(this, target);
        this.target.set('visible', true);
    },

    copy: function() {
        return Show.create();
    },
    
    reverse: function() {
        return exports.Hide.create();
    }
});

var Hide = ActionInstant.extend(/** @lends cocos.actions.Hide# */{
    /** 
    * @class Hide Hide the node
    **/
    startWithTarget: function(target) {
        Show.superclass.startWithTarget.call(this, target);
        this.target.set('visible', false);
    },

    copy: function() {
        return Hide.create();
    },
    
    reverse: function() {
        return exports.Show.create();
    }
});

var ToggleVisibility = ActionInstant.extend(/** @lends cocos.actions.ToggleVisibility# */{
    /** 
    * @class ToggleVisibility Toggles the visibility of a node
    **/
    startWithTarget: function(target) {
        ToggleVisibility.superclass.startWithTarget.call(this, target);
        var vis = this.target.get('visible');
        this.target.set('visible', !vis);
    },
    
    copy: function() {
        return ToggleVisibility.create();
    }
});

var FlipX = ActionInstant.extend(/** @lends cocos.actions.FlipX# */{
    flipX: false,

    /**
     * @class FlipX Flips a sprite horizontally
     *
     * @memberOf cocos.actions
     * @extends cocos.actions.ActionInstant
     * @constructs
     *
     * @opt {Boolean} flipX Should the sprite be flipped
     */
    init: function (opts) {
        FlipX.superclass.init.call(this, opts);

        this.flipX = opts.flipX;
    },
    
    startWithTarget: function (target) {
        FlipX.superclass.startWithTarget.call(this, target);

        target.set('flipX', this.flipX);
    },
    
    reverse: function () {
        return FlipX.create({flipX: !this.flipX});
    },
    
    copy: function () {
        return FlipX.create({flipX: this.flipX});
    }
});

var FlipY = ActionInstant.extend(/** @lends cocos.actions.FlipY# */{
    flipY: false,

    /**
     * @class FlipY Flips a sprite vertically
     *
     * @memberOf cocos.actions
     * @extends cocos.actions.ActionInstant
     * @constructs
     *
     * @opt {Boolean} flipY Should the sprite be flipped
     */
    init: function (opts) {
        FlipY.superclass.init.call(this, opts);

        this.flipY = opts.flipY;
    },
    
    startWithTarget: function (target) {
        FlipY.superclass.startWithTarget.call(this, target);

        target.set('flipY', this.flipY);
    },
    
    reverse: function () {
        return FlipY.create({flipY: !this.flipY});
    },
    
    copy: function () {
        return FlipY.create({flipY: this.flipY});
    }
});

var Place = ActionInstant.extend(/** @lends cocos.actions.Place# */{
    position: null,
    
    /**
	 * @class Place Places the node in a certain position
	 *
     * @memberOf cocos.actions
     * @extends cocos.actions.ActionInstant
     * @constructs
     *
     * @opt {geometry.Point} position
     */
    init: function(opts) {
        Place.superclass.init.call(this, opts);
        this.set('position', util.copy(opts.position));
    },
    
    startWithTarget: function(target) {
        Place.superclass.startWithTarget.call(this, target);
        this.target.set('position', this.position);
    },
    
    copy: function() {
        return Place.create({position: this.position});
    }
});

var CallFunc = ActionInstant.extend(/** @lends cocos.actions.CallFunc# */{
	callback: null,
    target: null,
    method: null,
    
	/**
	 * @class CallFunc Calls a 'callback'
	 *
     * @memberOf cocos.actions
     * @extends cocos.actions.ActionInstant
     * @constructs
     *
     * @opt {BObject} target
     * @opt {String|Function} method
     */
	init: function(opts) {
		CallFunc.superclass.init.call(this, opts);
		
		// Save target & method so that copy() can recreate callback
		this.target = opts.target;
		this.method = opts.method;
		this.callback = util.callback(this.target, this.method);
	},
	
	startWithTarget: function(target) {
		CallFunc.superclass.startWithTarget.call(this, target);
		this.execute(target);
	},
	
	execute: function(target) {
	    // Pass target to callback
		this.callback.call(this, target);
	},
	
	copy: function() {
	    return CallFunc.create({target: this.target, method: this.method});
	}
});

exports.ActionInstant = ActionInstant;
exports.Show = Show;
exports.Hide = Hide;
exports.ToggleVisibility = ToggleVisibility;
exports.FlipX = FlipX;
exports.FlipY = FlipY;
exports.Place = Place;
exports.CallFunc = CallFunc;


}};
__resources__["/__builtin__/libs/cocos2d/actions/ActionInterval.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util'),
    act = require('./Action'),
    geo = require('geometry'),
    ccp = geo.ccp;


var ActionInterval = act.FiniteTimeAction.extend(/** @lends cocos.actions.ActionInterval# */{
    /**
     * Number of seconds that have elapsed
     * @type Float
     */
    elapsed: 0.0,

    _firstTick: true,

    /**
     * Base class actions that do have a finite time duration.
     *
     * Possible actions:
     *
     * - An action with a duration of 0 seconds
     * - An action with a duration of 35.5 seconds Infinite time actions are valid
     *
     * @memberOf cocos.actions
     * @constructs
     * @extends cocos.actions.FiniteTimeAction
     *
     * @opt {Float} duration Number of seconds to run action for
     */
    init: function (opts) {
        ActionInterval.superclass.init.call(this, opts);

        var dur = opts.duration || 0;
        if (dur === 0) {
            dur = 0.0000001;
        }

        this.set('duration', dur);
        this.set('elapsed', 0);
        this._firstTick = true;
    },

    get_isDone: function () {
        return (this.elapsed >= this.duration);
    },

    step: function (dt) {
        if (this._firstTick) {
            this._firstTick = false;
            this.elapsed = 0;
        } else {
            this.elapsed += dt;
        }

        this.update(Math.min(1, this.elapsed / this.duration));
    },

    startWithTarget: function (target) {
        ActionInterval.superclass.startWithTarget.call(this, target);

        this.elapsed = 0.0;
        this._firstTick = true;
    },

    copy: function() {
        throw "copy() not implemented";
    },
    
    reverse: function () {
        throw "Reverse Action not implemented";
    }
});

var DelayTime = ActionInterval.extend(/** @lends cocos.actions.DelayTime# */{
    /**
     * @class DelayTime Delays the action a certain amount of seconds
     *
     * @memberOf cocos.actions
     * @constructs
     * @extends cocos.actions.ActionInterval
     */
    update: function (t) {
        if (t === 1.0) {
            this.stop();
        }
    },

    copy: function () {
        return DelayTime.create({duration: this.get('duration')});
    },

    reverse: function () {
        return DelayTime.create({duration: this.get('duration')});
    }
});


var ScaleTo = ActionInterval.extend(/** @lends cocos.actions.ScaleTo# */{
    /**
     * Current X Scale
     * @type Float
     */
    scaleX: 1,

    /**
     * Current Y Scale
     * @type Float
     */
    scaleY: 1,

    /**
     * Initial X Scale
     * @type Float
     */
    startScaleX: 1,

    /**
     * Initial Y Scale
     * @type Float
     */
    startScaleY: 1,

    /**
     * Final X Scale
     * @type Float
     */
    endScaleX: 1,

    /**
     * Final Y Scale
     * @type Float
     */
    endScaleY: 1,

    /**
     * Delta X Scale
     * @type Float
     * @private
     */
    deltaX: 0.0,

    /**
     * Delta Y Scale
     * @type Float
     * @private
     */
    deltaY: 0.0,

    /**
     * @class ScaleTo Scales a cocos.Node object to a zoom factor by modifying it's scale attribute.
     *
     * @memberOf cocos.actions
     * @constructs
     * @extends cocos.actions.ActionInterval
     *
     * @opt {Float} duration Number of seconds to run action for
     * @opt {Float} [scale] Size to scale Node to
     * @opt {Float} [scaleX] Size to scale width of Node to
     * @opt {Float} [scaleY] Size to scale height of Node to
     */
    init: function (opts) {
        ScaleTo.superclass.init.call(this, opts);

        if (opts.scale !== undefined) {
            this.endScaleX = this.endScaleY = opts.scale;
        } else {
            this.endScaleX = opts.scaleX;
            this.endScaleY = opts.scaleY;
        }


    },

    startWithTarget: function (target) {
        ScaleTo.superclass.startWithTarget.call(this, target);

        this.startScaleX = this.target.get('scaleX');
        this.startScaleY = this.target.get('scaleY');
        this.deltaX = this.endScaleX - this.startScaleX;
        this.deltaY = this.endScaleY - this.startScaleY;
    },

    update: function (t) {
        if (!this.target) {
            return;
        }

        this.target.set('scaleX', this.startScaleX + this.deltaX * t);
        this.target.set('scaleY', this.startScaleY + this.deltaY * t);
    },

    copy: function () {
        return ScaleTo.create({duration: this.get('duration'),
                                 scaleX: this.get('endScaleX'),
                                 scaleY: this.get('endScaleY')});
    }
});

var ScaleBy = ScaleTo.extend(/** @lends cocos.actions.ScaleBy# */{
    /**
     * @class ScaleBy Scales a cocos.Node object to a zoom factor by modifying it's scale attribute.
     *
     * @memberOf cocos.actions
     * @constructs
     * @extends cocos.actions.ScaleTo
     *
     * @opt {Float} duration Number of seconds to run action for
     * @opt {Float} [scale] Size to scale Node by
     * @opt {Float} [scaleX] Size to scale width of Node by
     * @opt {Float} [scaleY] Size to scale height of Node by
     */
    init: function (opts) {
        ScaleBy.superclass.init.call(this, opts);
    },

    startWithTarget: function (target) {
        ScaleBy.superclass.startWithTarget.call(this, target);

        this.deltaX = this.startScaleX * this.endScaleX - this.startScaleX;
        this.deltaY = this.startScaleY * this.endScaleY - this.startScaleY;
    },

    reverse: function () {
        return ScaleBy.create({duration: this.get('duration'), scaleX: 1 / this.endScaleX, scaleY: 1 / this.endScaleY});
    }
});


var RotateTo = ActionInterval.extend(/** @lends cocos.actions.RotateTo# */{
    /**
     * Final angle
     * @type Float
     */
    dstAngle: 0,

    /**
     * Initial angle
     * @type Float
     */
    startAngle: 0,

    /**
     * Angle delta
     * @type Float
     */
    diffAngle: 0,

    /**
     * @class RotateTo Rotates a cocos.Node object to a certain angle by modifying its rotation
     * attribute. The direction will be decided by the shortest angle.
     *
     * @memberOf cocos.actions
     * @constructs
     * @extends cocos.actions.ActionInterval
     *
     * @opt {Float} duration Number of seconds to run action for
     * @opt {Float} angle Angle in degrees to rotate to
     */
    init: function (opts) {
        RotateTo.superclass.init.call(this, opts);

        this.dstAngle = opts.angle;
    },

    startWithTarget: function (target) {
        RotateTo.superclass.startWithTarget.call(this, target);

        this.startAngle = target.get('rotation');

        if (this.startAngle > 0) {
            this.startAngle = (this.startAngle % 360);
        } else {
            this.startAngle = (this.startAngle % -360);
        }

        this.diffAngle = this.dstAngle - this.startAngle;
        if (this.diffAngle > 180) {
            this.diffAngle -= 360;
        } else if (this.diffAngle < -180) {
            this.diffAngle += 360;
        }
    },

    update: function (t) {
        this.target.set('rotation', this.startAngle + this.diffAngle * t);
    },

    copy: function () {
        return RotateTo.create({duration: this.get('duration'), angle: this.get('dstAngle')});
    }
});

var RotateBy = RotateTo.extend(/** @lends cocos.actions.RotateBy# */{
    /**
     * Number of degrees to rotate by
     * @type Float
     */
    angle: 0,

    /**
     * @class RotateBy Rotates a cocos.Node object to a certain angle by modifying its rotation
     * attribute. The direction will be decided by the shortest angle.
     *
     * @memberOf cocos.action
     * @constructs
     * @extends cocos.actions.RotateTo
     *
     * @opt {Float} duration Number of seconds to run action for
     * @opt {Float} angle Angle in degrees to rotate by
     */
    init: function (opts) {
        RotateBy.superclass.init.call(this, opts);

        this.angle = opts.angle;
    },

    startWithTarget: function (target) {
        RotateBy.superclass.startWithTarget.call(this, target);

        this.startAngle = this.target.get('rotation');
    },

    update: function (t) {
        this.target.set('rotation', this.startAngle + this.angle * t);
    },

    copy: function () {
        return RotateBy.create({duration: this.get('duration'), angle: this.angle});
    },
    
    reverse: function () {
        return RotateBy.create({duration: this.get('duration'), angle: -this.angle});
    }
});

var MoveTo = ActionInterval.extend(/** @lends cocos.actions.MoveTo# */{
    delta: null,
    startPosition: null,
    endPosition: null,

    /**
     * @class MoveTo Animates moving a cocos.nodes.Node object to a another point.
     *
     * @memberOf cocos.actions
     * @constructs
     * @extends cocos.actions.ActionInterval
     *
     * @opt {Float} duration Number of seconds to run action for
     * @opt {geometry.Point} position Destination position
     */
    init: function (opts) {
        MoveTo.superclass.init.call(this, opts);

        this.set('endPosition', util.copy(opts.position));
    },

    startWithTarget: function (target) {
        MoveTo.superclass.startWithTarget.call(this, target);

        this.set('startPosition', util.copy(target.get('position')));
        this.set('delta', geo.ccpSub(this.get('endPosition'), this.get('startPosition')));
    },

    update: function (t) {
        var startPosition = this.get('startPosition'),
            delta = this.get('delta');
        this.target.set('position', ccp(startPosition.x + delta.x * t, startPosition.y + delta.y * t));
    },
    
    copy: function() {
        return MoveTo.create({duration: this.get('duration'), position: this.get('endPosition')});
    }
});

var MoveBy = MoveTo.extend(/** @lends cocos.actions.MoveBy# */{
    /**
     * @class MoveBy Animates moving a cocos.node.Node object by a given number of pixels
     *
     * @memberOf cocos.actions
     * @constructs
     * @extends cocos.actions.MoveTo
     *
     * @opt {Float} duration Number of seconds to run action for
     * @opt {geometry.Point} position Number of pixels to move by
     */
    init: function (opts) {
        MoveBy.superclass.init.call(this, opts);

        this.set('delta', util.copy(opts.position));
    },

    startWithTarget: function (target) {
        var dTmp = this.get('delta');
        MoveBy.superclass.startWithTarget.call(this, target);
        this.set('delta', dTmp);
    },
    
    copy: function() {
         return MoveBy.create({duration: this.get('duration'), position: this.get('delta')});
    },
    
    reverse: function() {
        var delta = this.get('delta');
        return MoveBy.create({duration: this.get('duration'), position: geo.ccp(-delta.x, -delta.y)});
    }
});

var JumpBy = ActionInterval.extend(/** @lends cocos.actions.JumpBy# */{
    /**
     * Number of pixels to jump by
     * @type geometry.Point
     */
    delta: null,
    
    /**
     * Height of jump
     * @type Float
     */
    height: 0,
    
    /**
     * Number of times to jump
     * @type Integer
     */
    jumps: 0,
    
    /**
     * Starting point
     * @type geometry.Point
     */
    startPosition: null,
    
    /**
     * @class JumpBy Moves a CCNode object simulating a parabolic jump movement by modifying it's position attribute.
     *
     * @memberOf cocos.actions
     * @constructs
     * @extends cocos.actions.ActionInterval
     *
     * @opt {Float} duration Number of seconds to run action for
     * @opt {geometry.Point} startPosition Point at which jump starts
     * @opt {geometry.Point} delta Number of pixels to jump by
     * @opt {Float} height Height of jump
     * @opt {Int} jumps Number of times to repeat
     */
    init: function(opts) {
        JumpBy.superclass.init.call(this, opts);
        
        this.delta  = util.copy(opts.delta);
        this.height = opts.height;
        this.jumps  = opts.jumps;
    },
    
    copy: function() {
        return JumpBy.create({duration: this.duration, 
                                 delta: this.delta,
                                height: this.height,
                                 jumps: this.jumps});
    },
    
    startWithTarget: function(target) {
        JumpBy.superclass.startWithTarget.call(this, target);
        this.set('startPosition', target.get('position'));
    },
    
    update: function(t) {
        // parabolic jump
        var frac = (t * this.jumps) % 1.0;
        var y = this.height * 4 * frac * (1 - frac);
        y += this.delta.y * t;
        var x = this.delta.x * t;
        this.target.set('position', geo.ccp(this.startPosition.x + x, this.startPosition.y + y));
    },
    
    reverse: function() {
        return JumpBy.create({duration: this.duration,
                                 delta: geo.ccp(-this.delta.x, -this.delta.y),
                                height: this.height,
                                 jumps: this.jumps});
    }
});

var JumpTo = JumpBy.extend(/** @lends cocos.actions.JumpTo# */{
    /**
     * @class JumpTo Moves a Node object to a parabolic position simulating a jump 
     * movement by modifying it's position attribute.
     *
     * @memberOf cocos.actions
     * @extends cocos.actions.JumpBy
     */
    startWithTarget: function(target) {
        JumpTo.superclass.startWithTarget.call(this, target);
        this.delta = geo.ccp(this.delta.x - this.startPosition.x, this.delta.y - this.startPosition.y);
    }
});

var BezierBy = ActionInterval.extend(/** @lends cocos.actions.BezierBy# */{
    /**
     * @type {geometry.BezierConfig}
     */
    config: null,
    
    startPosition: null,
    
    /**
     * @class BezierBy An action that moves the target with a cubic Bezier curve by a certain distance.
     *
     * @memberOf cocos.actions
     * @constructs
     * @extends cocos.actions.ActionInterval
     *
     * @opts {geometry.BezierConfig} bezier Bezier control points object
     * @opts {Float} duration
     */
    init: function(opts) {
        BezierBy.superclass.init.call(this, opts);
        
        this.config = util.copy(opts.bezier);
    },
    
    startWithTarget: function(target) {
        BezierBy.superclass.startWithTarget.call(this, target);
        this.set('startPosition', this.target.get('position'));
    },
    
    update: function(t) {
        var c = this.get('config');
        var xa = 0,
            xb = c.controlPoint1.x,
            xc = c.controlPoint2.x,
            xd = c.endPosition.x,
            ya = 0,
            yb = c.controlPoint1.y,
            yc = c.controlPoint2.y,
            yd = c.endPosition.y;
        
        var x = BezierBy.bezierat(xa, xb, xc, xd, t);
        var y = BezierBy.bezierat(ya, yb, yc, yd, t);
        
        this.target.set('position', geo.ccpAdd(this.get('startPosition'), geo.ccp(x, y)));
    },
    
    copy: function() {
        return BezierBy.create({bezier: this.get('config'), duration: this.get('duration')});
    },
    
    reverse: function() {
        var c = this.get('config'),
            bc = new geo.BezierConfig();
            
        bc.endPosition = geo.ccpNeg(c.endPosition);
        bc.controlPoint1 = geo.ccpAdd(c.controlPoint2, geo.ccpNeg(c.endPosition));
        bc.controlPoint2 = geo.ccpAdd(c.controlPoint1, geo.ccpNeg(c.endPosition));
        
        return BezierBy.create({bezier: bc, duration: this.get('duration')});
    }
});

util.extend(BezierBy, {
    /**
     * Bezier cubic formula
     * ((1 - t) + t)3 = 1 
     */
    bezierat: function(a, b, c, d, t) {
       return Math.pow(1-t, 3) * a + 
            3 * t * Math.pow(1-t, 2) * b +
            3 * Math.pow(t, 2) * (1 - t) * c +
            Math.pow(t, 3) * d;
    }
});

var BezierTo = BezierBy.extend(/** @lends cocos.actions.BezierTo# */{
    /**
     * @class BezierTo An action that moves the target with a cubic Bezier curve to a destination point.
     *
     * @memberOf cocos.actions
     * @extends cocos.actions.BezierBy
     */
    startWithTarget: function(target) {
        BezierTo.superclass.startWithTarget.call(this, target);
        
        var c = this.get('config');
        c.controlPoint1 = geo.ccpSub(c.controlPoint1, this.get('startPosition'));
        c.controlPoint2 = geo.ccpSub(c.controlPoint2, this.get('startPosition'));
        c.endPosition = geo.ccpSub(c.endPosition, this.get('startPosition'));
    }
});

var Blink = ActionInterval.extend(/** @lends cocos.actions.Blink# */{
    /**
     * @type {Integer}
     */
    times: 1,
    
    /**
     * @class Blink Blinks a Node object by modifying it's visible attribute
     *
     * @memberOf cocos.actions
     * @constructs
     * @extends cocos.actions.ActionInterval
     *
     * @opts {Integer} blinks Number of times to blink
     * @opts {Float} duration
     */
    init: function(opts) {
        Blink.superclass.init.call(this, opts);
        this.times = opts.blinks;
    },
    
    update: function(t) {
        if (! this.get_isDone()) {
            var slice = 1 / this.times;
            var m = t % slice;
            this.target.set('visible', (m > slice/2));
        }
    },
    
    copy: function() {
        return Blink.create({duration: this.get('duration'), blinks: this.get('times')});
    },
    
    reverse: function() {
        return this.copy();
    }
});

var FadeOut = ActionInterval.extend(/** @lends cocos.actions.FadeOut# */{
   /**
    * @class FadeOut Fades out a cocos.nodes.Node to zero opacity
    *
    * @memberOf cocos.actions
    * @extends cocos.actions.ActionInterval
    */     
    update: function (t) {
        var target = this.get('target');
        if (!target) return;
        target.set('opacity', 255 - (255 * t));
    },

    copy: function () {
        return FadeOut.create({duration: this.get('duration')});
    },
    
    reverse: function () {
        return exports.FadeIn.create({duration: this.get('duration')});
    }
});


var FadeIn = ActionInterval.extend(/** @lends cocos.actions.FadeIn# */{
    /**
     * @class FadeIn Fades in a cocos.nodes.Node to 100% opacity
     *
     * @memberOf cocos.actions
     * @extends cocos.actions.ActionInterval
     */
    update: function (t) {
        var target = this.get('target');
        if (!target) return;
        target.set('opacity', t * 255);
    },

    copy: function () {
        return FadeIn.create({duration: this.get('duration')});
    },
    
    reverse: function () {
        return exports.FadeOut.create({duration: this.get('duration')});
    }
});

var FadeTo = ActionInterval.extend(/** @lends cocos.actions.FadeTo# */{
    /**
     * The final opacity
     * @type Float
     */
    toOpacity: null,

    /**
     * The initial opacity
     * @type Float
     */
    fromOpacity: null,

    /**
     * @class FadeTo Fades a cocos.nodes.Node to a given opacity
     *
     * @memberOf cocos.actions
     * @constructor
     * @extends cocos.actions.ActionInterval
     */
    init: function (opts) {
        FadeTo.superclass.init.call(this, opts);
        this.set('toOpacity', opts.toOpacity);
    },

    startWithTarget: function (target) {
        FadeTo.superclass.startWithTarget.call(this, target);
        this.set('fromOpacity', this.target.get('opacity'));
    },

    update: function (t) {
        var target = this.get('target');
        if (!target) return;

        target.set('opacity', this.fromOpacity + ( this.toOpacity - this.fromOpacity ) * t);
    },
    
    copy: function() {
        return FadeTo.create({duration: this.get('duration'), toOpacity: this.get('toOpacity')});
    }
});

var Sequence = ActionInterval.extend(/** @lends cocos.actions.Sequence# */{
    /**
     * Array of actions to run
     * @type cocos.nodes.Node[]
     */
    actions: null,

    split: 0,
    last: 0,
    
    /**
     * Runs a pair of actions sequentially, one after another
     *
     * @memberOf cocos.actions
     * @constructs
     * @extends cocos.actions.ActionInterval
     *
     * @opt {cocos.actions.FiniteTimeAction} one 1st action to run
     * @opt {cocos.actions.FiniteTimeAction} two 2nd action to run
     */
    init: function (opts) {
        if (!opts.one) {
            throw "Sequence argument one must be non-nil";
        }
        if (!opts.two) {
            throw "Sequence argument two must be non-nil";
        }
        this.actions = [];
        
        var d = opts.one.get('duration') + opts.two.get('duration');
        
        Sequence.superclass.init.call(this, {duration: d});
        
        this.actions[0] = opts.one;
        this.actions[1] = opts.two;
    },
    
    startWithTarget: function (target) {
        Sequence.superclass.startWithTarget.call(this, target);
        this.split = this.actions[0].get('duration') / this.get('duration');
        this.last = -1;
    },

    stop: function () {
        this.actions[0].stop();
        this.actions[1].stop();
        Sequence.superclass.stop.call(this);
    },

    update: function (t) {
        // This is confusing but will hopefully work better in conjunction
        // with modifer actions like Repeat & Spawn...
        var found = 0;
        var new_t = 0;
        
        if (t >= this.split) {
            found = 1;
            if (this.split == 1) {
                new_t = 1;
            } else {
                new_t = (t - this.split) / (1 - this.split);
            }
        } else {
            found = 0;
            if (this.split != 0) {
                new_t = t / this.split;
            } else {
                new_t = 1;
            }
        }
        if (this.last == -1 && found == 1) {
            this.actions[0].startWithTarget(this.target);
            this.actions[0].update(1);
            this.actions[0].stop();
        }
        if (this.last != found) {
            if (this.last != -1) {
                this.actions[this.last].update(1);
                this.actions[this.last].stop();
            }
            this.actions[found].startWithTarget(this.target);
        }
        this.actions[found].update(new_t);
        this.last = found;
    },

    copy: function () {
        // Constructor will copy actions 
        return Sequence.create({actions: this.get('actions')});
    },

    reverse: function() {
        return Sequence.create({actions: [this.actions[1].reverse(), this.actions[0].reverse()]});
    }
});

util.extend(Sequence, {
    /** 
     * Override BObject.create in order to implement recursive construction
     * of actions array
     */
    create: function() {
        // Don't copy actions array, copy the actions
        var actions = arguments[0].actions;
        var prev = actions[0].copy();
        
        // Recursively create Sequence with pair of actions
        for (var i=1; i<actions.length; i++) {
            var now = actions[i].copy();
            if (now) {
                prev = this.initFromPair(prev, now);
            } else {
                break;
            }
        }
        return prev;
    },
    
    /** 
     * Create sequence object from a pair of actions
     */
    initFromPair: function(a1, a2) {
        var ret = new this();
        ret.init.apply(ret, [{one: a1, two: a2}]);
        return ret;
    }
});

var Repeat = ActionInterval.extend(/** @lends cocos.actions.Repeat# */{
    times: 1,
    total: 0,
    other: null,
    
    /**
     * @class Repeat Repeats an action a number of times.
     *
     * @memberOf cocos.actions
     * @constructs
     * @extends cocos.actions.ActionInterval
     *
     * @opt {cocos.actions.FiniteTimeAction} action Action to repeat
     * @opt {Number} times Number of times to repeat
     */
     init: function(opts) {
         var d = opts.action.get('duration') * opts.times;

         Repeat.superclass.init.call(this, {duration: d});
         
         this.times = opts.times;
         this.other = opts.action.copy();
         this.total = 0;
     },
     
     startWithTarget: function(target) {
         this.total = 0;
         Repeat.superclass.startWithTarget.call(this, target);
         this.other.startWithTarget(target);
     },
     
     stop: function() {
         this.other.stop();
         Repeat.superclass.stop.call(this);
     },
     
     update: function(dt) {
         var t = dt * this.times;
         
         if (t > (this.total+1)) {
             this.other.update(1);
             this.total += 1;
             this.other.stop();
             this.other.startWithTarget(this.target);
             
             // If repeat is over
             if (this.total == this.times) {
                 // set it in the original position
                 this.other.update(0);
             } else {
                 // otherwise start next repeat
                 this.other.update(t - this.total);
             }
         } else {
             var r = t % 1.0;
             
             // fix last repeat position otherwise it could be 0
             if (dt == 1) {
                 r = 1;
                 this.total += 1;
             }
             this.other.update(Math.min(r, 1));
         }
     },
     
     get_isDone: function() {
         return this.total == this.times;
     },
     
     copy: function() {
         // Constructor copies action
         return Repeat.create({action: this.other, times: this.times});
     },
     
     reverse: function() {
         return Repeat.create({action: this.other.reverse(), times: this.times});
     }
});

var Spawn = ActionInterval.extend(/** @lends cocos.actions.Spawn# */{
    one: null,
    two: null,

    /**
     * @class Spawn Executes multiple actions simultaneously
     *
     * @memberOf cocos.actions
     * @constructs
     * @extends cocos.actions.ActionInterval
     *
     * @opt {cocos.actions.FiniteTimeAction} one: first action to spawn
     * @opt {cocos.actions.FiniteTimeAction} two: second action to spawn
     */
    init: function (opts) {
        var action1 = opts.one, 
            action2 = opts.two;
            
        if (!action1 || !action2) {
            throw "cocos.actions.Spawn: required actions missing";
        }
        var d1 = action1.get('duration'), 
            d2 = action2.get('duration');
        
        Spawn.superclass.init.call(this, {duration: Math.max(d1, d2)});
        
        this.set('one', action1);
        this.set('two', action2);
        
        if (d1 > d2) {
            this.set('two', Sequence.create({actions: [
                action2, 
                DelayTime.create({duration: d1-d2})
            ]}));
        } else if (d1 < d2) {
            this.set('one', Sequence.create({actions: [
                action1,
                DelayTime.create({duration: d2-d1})
            ]}));
        }
    },
    
    startWithTarget: function (target) {
        Spawn.superclass.startWithTarget.call(this, target);
        this.get('one').startWithTarget(this.target);
        this.get('two').startWithTarget(this.target);
    },
    
    stop: function () {
        this.get('one').stop();
        this.get('two').stop();
        Spawn.superclass.stop.call(this);
    },
    
    step: function (dt) {
        if (this._firstTick) {
            this._firstTick = false;
            this.elapsed = 0;
        } else {
            this.elapsed += dt;
        }
        this.get('one').step(dt);
        this.get('two').step(dt);
    },
    
    update: function (t) {
        this.get('one').update(t);
        this.get('two').update(t);
    },
    
    copy: function () {
        return Spawn.create({one: this.get('one').copy(), two: this.get('two').copy()});
    },
    
    reverse: function () {
        return Spawn.create({one: this.get('one').reverse(), two: this.get('two').reverse()});
    }
});

util.extend(Spawn, {
    /**
     * Helper class function to create Spawn object from array of actions
     *
     * @opt {Array} actions: list of actions to run simultaneously
     */
    initWithActions: function (opts) {
        var now, prev = opts.actions.shift();
        while (opts.actions.length > 0) {
            now = opts.actions.shift();
            if (now) {
                prev = this.create({one: prev, two: now});
            } else {
                break;
            }
        }
        return prev;
    }
});

var Animate = ActionInterval.extend(/** @lends cocos.actions.Animate# */{
    animation: null,
    restoreOriginalFrame: true,
    origFrame: null,


    /**
     * Animates a sprite given the name of an Animation
     *
     * @memberOf cocos.actions
     * @constructs
     * @extends cocos.actions.ActionInterval
     *
     * @opt {Float} duration Number of seconds to run action for
     * @opt {cocos.Animation} animation Animation to run
     * @opt {Boolean} [restoreOriginalFrame=true] Return to first frame when finished
     */
    init: function (opts) {
        this.animation = opts.animation;
        this.restoreOriginalFrame = opts.restoreOriginalFrame !== false;
        opts.duration = this.animation.frames.length * this.animation.delay;

        Animate.superclass.init.call(this, opts);
    },

    startWithTarget: function (target) {
        Animate.superclass.startWithTarget.call(this, target);

        if (this.restoreOriginalFrame) {
            this.set('origFrame', this.target.get('displayedFrame'));
        }
    },

    stop: function () {
        if (this.target && this.restoreOriginalFrame) {
            var sprite = this.target;
            sprite.set('displayFrame', this.origFrame);
        }

        Animate.superclass.stop.call(this);
    },

    update: function (t) {
        var frames = this.animation.get('frames'),
            numberOfFrames = frames.length,
            idx = Math.floor(t * numberOfFrames);

        if (idx >= numberOfFrames) {
            idx = numberOfFrames - 1;
        }

        var sprite = this.target;
        if (!sprite.isFrameDisplayed(frames[idx])) {
            sprite.set('displayFrame', frames[idx]);
        }
    },

    copy: function () {
        return Animate.create({animation: this.animation, restoreOriginalFrame: this.restoreOriginalFrame});
    }

});

exports.ActionInterval = ActionInterval;
exports.DelayTime = DelayTime;
exports.ScaleTo = ScaleTo;
exports.ScaleBy = ScaleBy;
exports.RotateTo = RotateTo;
exports.RotateBy = RotateBy;
exports.MoveTo = MoveTo;
exports.MoveBy = MoveBy;
exports.JumpBy = JumpBy;
exports.JumpTo = JumpTo;
exports.BezierBy = BezierBy;
exports.BezierTo = BezierTo;
exports.Blink = Blink;
exports.FadeIn = FadeIn;
exports.FadeOut = FadeOut;
exports.FadeTo = FadeTo;
exports.Spawn = Spawn;
exports.Sequence = Sequence;
exports.Repeat = Repeat;
exports.Animate = Animate;

}};
__resources__["/__builtin__/libs/cocos2d/actions/index.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util'),
    path = require('path');

var modules = 'Action ActionInterval ActionInstant ActionEase'.w();

/**
 * @memberOf cocos
 * @namespace Actions used to animate or change a Node
 */
var actions = {};

util.each(modules, function (mod, i) {
    util.extend(actions, require('./' + mod));
});

module.exports = actions;

}};
__resources__["/__builtin__/libs/cocos2d/Animation.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util');

var Animation = BObject.extend(/** @lends cocos.Animation# */{
    name: null,
    delay: 0.0,
    frames: null,

    /** 
     * A cocos.Animation object is used to perform animations on the Sprite objects.
     * 
     * The Animation object contains cocos.SpriteFrame objects, and a possible delay between the frames.
     * You can animate a cocos.Animation object by using the cocos.actions.Animate action.
     * 
     * @memberOf cocos
     * @constructs
     * @extends BObject
     *
     * @opt {cocos.SpriteFrame[]} frames Frames to animate
     * @opt {Float} [delay=0.0] Delay between each frame
     * 
     * @example
     * var animation = cocos.Animation.create({frames: [f1, f2, f3], delay: 0.1});
     * sprite.runAction(cocos.actions.Animate.create({animation: animation}));
     */
    init: function (opts) {
        Animation.superclass.init.call(this, opts);

        this.frames = opts.frames || [];
        this.delay  = opts.delay  || 0.0;
    }
});

exports.Animation = Animation;

}};
__resources__["/__builtin__/libs/cocos2d/AnimationCache.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util'),
    Plist = require('Plist').Plist;

var AnimationCache = BObject.extend(/** @lends cocos.AnimationCache# */{
    /**
     * Cached animations
     * @type Object
     */
    animations: null,

    /**
     * @memberOf cocos
     * @constructs
     * @extends BObject
     * @singleton
     */
    init: function () {
        AnimationCache.superclass.init.call(this);

        this.set('animations', {});
    },

    /**
     * Add an animation to the cache
     *
     * @opt {String} name Unique name of the animation
     * @opt {cocos.Animcation} animation Animation to cache
     */
    addAnimation: function (opts) {
        var name = opts.name,
            animation = opts.animation;

        this.get('animations')[name] = animation;
    },

    /**
     * Remove an animation from the cache
     *
     * @opt {String} name Unique name of the animation
     */
    removeAnimation: function (opts) {
        var name = opts.name;

        delete this.get('animations')[name];
    },

    /**
     * Get an animation from the cache
     *
     * @opt {String} name Unique name of the animation
     * @returns {cocos.Animation} Cached animation
     */
    getAnimation: function (opts) {
        var name = opts.name;

        return this.get('animations')[name];
    }
});

/**
 * Class methods
 */
util.extend(AnimationCache, /** @lends cocos.AnimationCache */{
    /**
     * @getter sharedAnimationCache
     * @type cocos.AnimationCache
     */
    get_sharedAnimationCache: function (key) {
        if (!this._instance) {
            this._instance = this.create();
        }

        return this._instance;
    }
});

exports.AnimationCache = AnimationCache;

}};
__resources__["/__builtin__/libs/cocos2d/Director.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray FLIP_Y_AXIS SHOW_REDRAW_REGIONS*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util'),
    geo = require('geometry'),
    ccp = geo.ccp,
    events    = require('events'),
    Scheduler = require('./Scheduler').Scheduler,
    EventDispatcher = require('./EventDispatcher').EventDispatcher,
    Scene = require('./nodes/Scene').Scene;


/**
 * requestAnimationFrame for smart animating
 * @see http://paulirish.com/2011/requestanimationframe-for-smart-animating/
 */
window.requestAnimFrame = (function (){
    return  window.requestAnimationFrame       || 
            window.webkitRequestAnimationFrame || 
            window.mozRequestAnimationFrame    || 
            window.oRequestAnimationFrame      || 
            window.msRequestAnimationFrame     || 
            function (callback) {
                window.setTimeout(callback, 1000 / 30);
            };
})();

var Director = BObject.extend(/** @lends cocos.Director# */{
    backgroundColor: 'rgb(0, 0, 0)',
    canvas: null,
    context: null,
    sceneStack: null,
    winSize: null,
    isPaused: false,
    maxFrameRate: 30,
    displayFPS: false,
    preloadScene: null,
    isReady: false,

    // Time delta
    dt: 0,
    nextDeltaTimeZero: false,
    lastUpdate: 0,

    _nextScene: null,

    /**
     * <p>Creates and handles the main view and manages how and when to execute the
     * Scenes.</p>
     *
     * <p>This class is a singleton so don't instantiate it yourself, instead use
     * cocos.Director.get('sharedDirector') to return the instance.</p>
     *
     * @memberOf cocos
     * @constructs
     * @extends BObject
     * @singleton
     */
    init: function () {
        Director.superclass.init.call(this);

        this.set('sceneStack', []);
    },

    /**
     * Append to a HTML element. It will create a canvas tag
     *
     * @param {HTMLElement} view Any HTML element to add the application to
     */
    attachInView: function (view) {
        if (!view.tagName) {
            throw "Director.attachInView must be given a HTML DOM Node";
        }

        while (view.firstChild) {
            view.removeChild(view.firstChild);
        }


        var canvas = document.createElement('canvas');
        this.set('canvas', canvas);
        canvas.setAttribute('width', view.clientWidth);
        canvas.setAttribute('height', view.clientHeight);

        var context = canvas.getContext('2d');
        this.set('context', context);

        if (FLIP_Y_AXIS) {
            context.translate(0, view.clientHeight);
            context.scale(1, -1);
        }

        view.appendChild(canvas);

        this.set('winSize', {width: view.clientWidth, height: view.clientHeight});


        // Setup event handling

        // Mouse events
        var eventDispatcher = EventDispatcher.get('sharedDispatcher');
        var self = this;
        function mouseDown(evt) {
            evt.locationInWindow = ccp(evt.clientX, evt.clientY);
            evt.locationInCanvas = self.convertEventToCanvas(evt);

            function mouseDragged(evt) {
                evt.locationInWindow = ccp(evt.clientX, evt.clientY);
                evt.locationInCanvas = self.convertEventToCanvas(evt);

                eventDispatcher.mouseDragged(evt);
            }
            function mouseUp(evt) {
                evt.locationInWindow = ccp(evt.clientX, evt.clientY);
                evt.locationInCanvas = self.convertEventToCanvas(evt);

                document.body.removeEventListener('mousemove', mouseDragged, false);
                document.body.removeEventListener('mouseup',   mouseUp,   false);


                eventDispatcher.mouseUp(evt);
            }

            document.body.addEventListener('mousemove', mouseDragged, false);
            document.body.addEventListener('mouseup',   mouseUp,   false);

            eventDispatcher.mouseDown(evt);
        }
        function mouseMoved(evt) {
            evt.locationInWindow = ccp(evt.clientX, evt.clientY);
            evt.locationInCanvas = self.convertEventToCanvas(evt);

            eventDispatcher.mouseMoved(evt);
        }
        canvas.addEventListener('mousedown', mouseDown, false);
        canvas.addEventListener('mousemove', mouseMoved, false);

        // Keyboard events
        function keyDown(evt) {
            this._keysDown = this._keysDown || {};
            eventDispatcher.keyDown(evt);
        }
        function keyUp(evt) {
            eventDispatcher.keyUp(evt);
        }

        document.documentElement.addEventListener('keydown', keyDown, false);
        document.documentElement.addEventListener('keyup', keyUp, false);
    },

    runPreloadScene: function () {
        var preloader = this.get('preloadScene');
        if (!preloader) {
            var PreloadScene = require('./nodes/PreloadScene').PreloadScene;
            preloader = PreloadScene.create();
            this.set('preloadScene', preloader);
        }

        events.addListener(preloader, 'complete', util.callback(this, function (preloader) {
            this.isReady = true;
            events.trigger(this, 'ready', this);
        }));

        this.pushScene(preloader);
        this.startAnimation();
    },

    /**
     * Enters the Director's main loop with the given Scene. Call it to run
     * only your FIRST scene. Don't call it if there is already a running
     * scene.
     *
     * @param {cocos.Scene} scene The scene to start
     */
    runWithScene: function (scene) {
        if (!(scene instanceof Scene)) {
            throw "Director.runWithScene must be given an instance of Scene";
        }

        if (this._runningScene) {
            throw "You can't run a Scene if another Scene is already running. Use replaceScene or pushScene instead";
        }

        this.pushScene(scene);
        this.startAnimation();
    },

    /**
     * Replaces the running scene with a new one. The running scene is
     * terminated. ONLY call it if there is a running scene.
     *
     * @param {cocos.Scene} scene The scene to replace with
     */
    replaceScene: function (scene) {
        var index = this.sceneStack.length;

        this._sendCleanupToScene = true;
        this.sceneStack.pop();
        this.sceneStack.push(scene);
        this._nextScene = scene;
    },

    /**
     * Pops out a scene from the queue. This scene will replace the running
     * one. The running scene will be deleted. If there are no more scenes in
     * the stack the execution is terminated. ONLY call it if there is a
     * running scene.
     */
    popScene: function () {
    },

    /**
     * Suspends the execution of the running scene, pushing it on the stack of
     * suspended scenes. The new scene will be executed. Try to avoid big
     * stacks of pushed scenes to reduce memory allocation. ONLY call it if
     * there is a running scene.
     *
     * @param {cocos.Scene} scene The scene to add to the stack
     */
    pushScene: function (scene) {
        this._nextScene = scene;
    },

    /**
     * The main loop is triggered again. Call this function only if
     * cocos.Directory#stopAnimation was called earlier.
     */
    startAnimation: function () {
        this.animate();
    },

    animate: function() {
        this.drawScene();
        window.requestAnimFrame(util.callback(this, 'animate'), this.canvas);
    },

    /**
     * Stops the animation. Nothing will be drawn. The main loop won't be
     * triggered anymore. If you want to pause your animation call
     * cocos.Directory#pause instead.
     */
    stopAnimation: function () {
        if (this._animationTimer) {
            clearInterval(this._animationTimer);
            this._animationTimer = null;
        }
    },

    /**
     * Calculate time since last call
     * @private
     */
    calculateDeltaTime: function () {
        var now = (new Date()).getTime() / 1000;

        if (this.nextDeltaTimeZero) {
            this.dt = 0;
            this.nextDeltaTimeZero = false;
        }

        this.dt = Math.max(0, now - this.lastUpdate);

        this.lastUpdate = now;
    },

    /**
     * The main run loop
     * @private
     */
    drawScene: function () {
        this.calculateDeltaTime();
        
        if (!this.isPaused) {
            Scheduler.get('sharedScheduler').tick(this.dt);
        }


        var context = this.get('context');
        context.fillStyle = this.get('backgroundColor');
        context.fillRect(0, 0, this.winSize.width, this.winSize.height);
        //this.canvas.width = this.canvas.width


        if (this._nextScene) {
            this.setNextScene();
        }

        var rect = new geo.Rect(0, 0, this.winSize.width, this.winSize.height);

        if (rect) {
            context.beginPath();
            context.rect(rect.origin.x, rect.origin.y, rect.size.width, rect.size.height);
            context.clip();
            context.closePath();
        }

        this._runningScene.visit(context, rect);

        if (SHOW_REDRAW_REGIONS) {
            if (rect) {
                context.beginPath();
                context.rect(rect.origin.x, rect.origin.y, rect.size.width, rect.size.height);
                context.fillStyle = "rgba(255, 0, 0, 0.5)";
                //context.fill();
                context.closePath();
            }
        }

        if (this.get('displayFPS')) {
            this.showFPS();
        }
    },

    /**
     * Initialises the next scene
     * @private
     */
    setNextScene: function () {
        // TODO transitions

        if (this._runningScene) {
            this._runningScene.onExit();
            if (this._sendCleanupToScene) {
                this._runningScene.cleanup();
            }
        }

        this._runningScene = this._nextScene;

        this._nextScene = null;

        this._runningScene.onEnter();
    },

    convertEventToCanvas: function (evt) {
        var x = this.canvas.offsetLeft - document.documentElement.scrollLeft,
            y = this.canvas.offsetTop - document.documentElement.scrollTop;

        var o = this.canvas;
        while ((o = o.offsetParent)) {
            x += o.offsetLeft - o.scrollLeft;
            y += o.offsetTop - o.scrollTop;
        }

        var p = geo.ccpSub(evt.locationInWindow, ccp(x, y));
        if (FLIP_Y_AXIS) {
            p.y = this.canvas.height - p.y;
        }

        return p;
    },

    showFPS: function () {
        if (!this._fpsLabel) {
            var Label = require('./nodes/Label').Label;
            this._fpsLabel = Label.create({string: '', fontSize: 16});
            this._fpsLabel.set('anchorPoint', ccp(0, 1));
            this._frames = 0;
            this._accumDt = 0;
        }


        this._frames++;
        this._accumDt += this.get('dt');
        
        if (this._accumDt > 1.0 / 3.0)  {
            var frameRate = this._frames / this._accumDt;
            this._frames = 0;
            this._accumDt = 0;

            this._fpsLabel.set('string', 'FPS: ' + (Math.round(frameRate * 100) / 100).toString());
        }


        var s = this.get('winSize');
        this._fpsLabel.set('position', ccp(10, s.height - 10));

        this._fpsLabel.visit(this.get('context'));
    }

});

/**
 * Class methods
 */
util.extend(Director, /** @lends cocos.Director */{
    /**
     * A shared singleton instance of cocos.Director
     *
     * @getter sharedDirector
     * @type cocos.Director
     */
    get_sharedDirector: function (key) {
        if (!Director._instance) {
            Director._instance = this.create();
        }

        return Director._instance;
    }
});

/**
 * @memberOf cocos
 * @class Pretends to run at a constant frame rate even if it slows down
 * @extends cocos.Director
 */
var DirectorFixedSpeed = Director.extend(/** @lends cocos.DirectorFixedSpeed */{
    /**
     * Frames per second to draw.
     * @type Integer
     */
    frameRate: 60,

    /**
     * Calculate time since last call
     * @private
     */
    calculateDeltaTime: function () {
        if (this.nextDeltaTimeZero) {
            this.dt = 0;
            this.nextDeltaTimeZero = false;
        }

        this.dt = 1.0 / this.get('frameRate');
    },

    /**
     * The main loop is triggered again. Call this function only if
     * cocos.Directory#stopAnimation was called earlier.
     */
    startAnimation: function () {
        this._animationTimer = setInterval(util.callback(this, 'drawScene'), 1000 / this.get('frameRate'));
        this.drawScene();
    }

});

exports.Director = Director;
exports.DirectorFixedSpeed = DirectorFixedSpeed;

}};
__resources__["/__builtin__/libs/cocos2d/EventDispatcher.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray FLIP_Y_AXIS*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util'),
    geo = require('geometry');

var EventDispatcher = BObject.extend(/** @lends cocos.EventDispatcher# */{
    dispatchEvents: true,
    keyboardDelegates: null,
    mouseDelegates: null,
    _keysDown: null,
    
    /**
     * This singleton is responsible for dispatching Mouse and Keyboard events.
     *
     * @memberOf cocos
     * @constructs
     * @extends BObject
     * @singleton
     */
    init: function () {
        EventDispatcher.superclass.init.call(this);

        this.keyboardDelegates = [];
        this.mouseDelegates = [];

        this._keysDown = {};
    },

    addDelegate: function (opts) {
        var delegate = opts.delegate,
            priority = opts.priority,
            flags    = opts.flags,
            list     = opts.list;

        var listElement = {
            delegate: delegate,
            priority: priority,
            flags: flags
        };

        var added = false;
        for (var i = 0; i < list.length; i++) {
            var elem = list[i];
            if (priority < elem.priority) {
                // Priority is lower, so insert before elem
                list.splice(i, 0, listElement);
                added = true;
                break;
            }
        }

        // High priority; append to array
        if (!added) {
            list.push(listElement);
        }
    },

    removeDelegate: function (opts) {
        var delegate = opts.delegate,
            list = opts.list;

        var idx = -1,
            i;
        for (i = 0; i < list.length; i++) {
            var l = list[i];
            if (l.delegate == delegate) {
                idx = i;
                break;
            }
        }
        if (idx == -1) {
            return;
        }
        list.splice(idx, 1);
    },
    removeAllDelegates: function (opts) {
        var list = opts.list;

        list.splice(0, list.length - 1);
    },

    addMouseDelegate: function (opts) {
        var delegate = opts.delegate,
            priority = opts.priority;

        var flags = 0;

        // TODO flags

        this.addDelegate({delegate: delegate, priority: priority, flags: flags, list: this.mouseDelegates});
    },

    removeMouseDelegate: function (opts) {
        var delegate = opts.delegate;

        this.removeDelegate({delegate: delegate, list: this.mouseDelegates});
    },

    removeAllMouseDelegate: function () {
        this.removeAllDelegates({list: this.mouseDelegates});
    },

    addKeyboardDelegate: function (opts) {
        var delegate = opts.delegate,
            priority = opts.priority;

        var flags = 0;

        // TODO flags

        this.addDelegate({delegate: delegate, priority: priority, flags: flags, list: this.keyboardDelegates});
    },

    removeKeyboardDelegate: function (opts) {
        var delegate = opts.delegate;

        this.removeDelegate({delegate: delegate, list: this.keyboardDelegates});
    },

    removeAllKeyboardDelegate: function () {
        this.removeAllDelegates({list: this.keyboardDelegates});
    },



    // Mouse Events

    mouseDown: function (evt) {
        if (!this.dispatchEvents) {
            return;
        }

        this._previousMouseMovePosition = geo.ccp(evt.clientX, evt.clientY);
        this._previousMouseDragPosition = geo.ccp(evt.clientX, evt.clientY);

        for (var i = 0; i < this.mouseDelegates.length; i++) {
            var entry = this.mouseDelegates[i];
            if (entry.delegate.mouseDown) {
                var swallows = entry.delegate.mouseDown(evt);
                if (swallows) {
                    break;
                }
            }
        }
    },
    mouseMoved: function (evt) {
        if (!this.dispatchEvents) {
            return;
        }

        if (this._previousMouseMovePosition) {
            evt.deltaX = evt.clientX - this._previousMouseMovePosition.x;
            evt.deltaY = evt.clientY - this._previousMouseMovePosition.y;
            if (FLIP_Y_AXIS) {
                evt.deltaY *= -1;
            }
        } else {
            evt.deltaX = 0;
            evt.deltaY = 0;
        }
        this._previousMouseMovePosition = geo.ccp(evt.clientX, evt.clientY);

        for (var i = 0; i < this.mouseDelegates.length; i++) {
            var entry = this.mouseDelegates[i];
            if (entry.delegate.mouseMoved) {
                var swallows = entry.delegate.mouseMoved(evt);
                if (swallows) {
                    break;
                }
            }
        }
    },
    mouseDragged: function (evt) {
        if (!this.dispatchEvents) {
            return;
        }

        if (this._previousMouseDragPosition) {
            evt.deltaX = evt.clientX - this._previousMouseDragPosition.x;
            evt.deltaY = evt.clientY - this._previousMouseDragPosition.y;
            if (FLIP_Y_AXIS) {
                evt.deltaY *= -1;
            }
        } else {
            evt.deltaX = 0;
            evt.deltaY = 0;
        }
        this._previousMouseDragPosition = geo.ccp(evt.clientX, evt.clientY);

        for (var i = 0; i < this.mouseDelegates.length; i++) {
            var entry = this.mouseDelegates[i];
            if (entry.delegate.mouseDragged) {
                var swallows = entry.delegate.mouseDragged(evt);
                if (swallows) {
                    break;
                }
            }
        }
    },
    mouseUp: function (evt) {
        if (!this.dispatchEvents) {
            return;
        }

        for (var i = 0; i < this.mouseDelegates.length; i++) {
            var entry = this.mouseDelegates[i];
            if (entry.delegate.mouseUp) {
                var swallows = entry.delegate.mouseUp(evt);
                if (swallows) {
                    break;
                }
            }
        }
    },

    // Keyboard events
    keyDown: function (evt) {
        var kc = evt.keyCode;
        if (!this.dispatchEvents || this._keysDown[kc]) {
            return;
        }

        this._keysDown[kc] = true;

        for (var i = 0; i < this.keyboardDelegates.length; i++) {
            var entry = this.keyboardDelegates[i];
            if (entry.delegate.keyDown) {
                var swallows = entry.delegate.keyDown(evt);
                if (swallows) {
                    break;
                }
            }
        }
    },

    keyUp: function (evt) {
        if (!this.dispatchEvents) {
            return;
        }

        var kc = evt.keyCode;
        if (this._keysDown[kc]) {
            delete this._keysDown[kc];
        }

        for (var i = 0; i < this.keyboardDelegates.length; i++) {
            var entry = this.keyboardDelegates[i];
            if (entry.delegate.keyUp) {
                var swallows = entry.delegate.keyUp(evt);
                if (swallows) {
                    break;
                }
            }
        }
    }

});

/**
 * Class methods
 */
util.extend(EventDispatcher, /** @lends cocos.EventDispatcher */{
    /**
     * A shared singleton instance of cocos.EventDispatcher
     *
     * @getter sharedDispatcher
     * @type cocos.EventDispatcher
     */
    get_sharedDispatcher: function (key) {
        if (!this._instance) {
            this._instance = this.create();
        }

        return this._instance;
    }
});
exports.EventDispatcher = EventDispatcher;

}};
__resources__["/__builtin__/libs/cocos2d/index.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util'),
    path = require('path');

var modules = 'TextureAtlas Texture2D Preloader RemoteImage RemoteResource SpriteFrame SpriteFrameCache Director Animation AnimationCache Scheduler ActionManager TMXXMLParser'.w();

/**
 * @namespace All cocos2d objects live in this namespace
 */
var cocos = {
    nodes: require('./nodes'),
    actions: require('./actions')
};

util.each(modules, function (mod, i) {
    util.extend(cocos, require('./' + mod));
});

module.exports = cocos;

}};
__resources__["/__builtin__/libs/cocos2d/nodes/AtlasNode.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var SpriteBatchNode = require('./BatchNode').SpriteBatchNode,
    TextureAtlas = require('../TextureAtlas').TextureAtlas,
    geo   = require('geometry');

var AtlasNode = SpriteBatchNode.extend(/** @lends cocos.AtlasNode# */{
    /**
     * Characters per row
     * @type Integer
     */
    itemsPerRow: 0,

    /**
     * Characters per column
     * @type Integer
     */
    itemsPerColumn: 0,

    /**
     * Width of a character
     * @type Integer
     */
    itemWidth: 0,

    /**
     * Height of a character
     * @type Integer
     */
    itemHeight: 0,


    /**
     * @type cocos.TextureAtlas
     */
     textureAtlas: null,

    /**
     * @class
     * It knows how to render a TextureAtlas object. If you are going to
     * render a TextureAtlas consider subclassing cocos.nodes.AtlasNode (or a
     * subclass of cocos.nodes.AtlasNode)
     * @memberOf cocos
     * @extends cocos.nodes.SpriteBatchNode
     * @constructs
     *
     * @opt {String} file Path to Atals image
     * @opt {Integer} itemWidth Character width
     * @opt {Integer} itemHeight Character height
     * @opt {Integer} itemsToRender Quantity of items to render
     */
    init: function (opts) {
        AtlasNode.superclass.init.call(this, opts);

        this.itemWidth = opts.itemWidth;
        this.itemHeight = opts.itemHeight;
        
        this.textureAtlas = TextureAtlas.create({file: opts.file, capacity: opts.itemsToRender});


        this._calculateMaxItems();
    },

    updateAtlasValues: function () {
        throw "cocos.nodes.AtlasNode:Abstract - updateAtlasValue not overriden";
    },

    _calculateMaxItems: function () {
        var s = this.textureAtlas.get('texture.contentSize');
        this.itemsPerColumn = s.height / this.itemHeight;
        this.itemsPerRow = s.width / this.itemWidth;
    }
});

exports.AtlasNode = AtlasNode;

}};
__resources__["/__builtin__/libs/cocos2d/nodes/BatchNode.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray SHOW_REDRAW_REGIONS*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util'),
    evt = require('events'),
    geo = require('geometry'),
    ccp = geo.ccp,
    TextureAtlas = require('../TextureAtlas').TextureAtlas,
    RenderTexture = require('./RenderTexture').RenderTexture,
    Node = require('./Node').Node;

var BatchNode = Node.extend(/** @lends cocos.nodes.BatchNode# */{
    partialDraw: false,
    contentRect: null,
    renderTexture: null,
    dirty: true,

    /**
     * Region to redraw
     * @type geometry.Rect
     */
    dirtyRegion: null,
    dynamicResize: false,

    /** @private
     * Areas that need redrawing
     *
     * Not implemented
     */
    _dirtyRects: null,


    /**
     * Draws all children to an in-memory canvas and only redraws when something changes
     *
     * @memberOf cocos.nodes
     * @constructs
     * @extends cocos.nodes.Node
     *
     * @opt {geometry.Size} size The size of the in-memory canvas used for drawing to
     * @opt {Boolean} [partialDraw=false] Draw only the area visible on screen. Small maps may be slower in some browsers if this is true.
     */
    init: function (opts) {
        BatchNode.superclass.init.call(this, opts);

        var size = opts.size || geo.sizeMake(1, 1);
        this.set('partialDraw', opts.partialDraw);

        evt.addListener(this, 'contentsize_changed', util.callback(this, this._resizeCanvas));
        
        this._dirtyRects = [];
        this.set('contentRect', geo.rectMake(0, 0, size.width, size.height));
        this.renderTexture = RenderTexture.create(size);
        this.renderTexture.sprite.set('isRelativeAnchorPoint', false);
        this.addChild({child: this.renderTexture});
    },

    addChild: function (opts) {
        BatchNode.superclass.addChild.call(this, opts);

        var child = opts.child,
            z     = opts.z;

        if (child == this.renderTexture) {
            return;
        }

        // TODO handle texture resize

        // Watch for changes in child
        var watchEvents = ['position_before_changed',
                           'scalex_before_changed',
                           'scaley_before_changed',
                           'rotation_before_changed',
                           'anchorpoint_before_changed',
                           'opacity_before_changed',
                           'visible_before_changed'];
        evt.addListener(child, watchEvents, util.callback(this, function () {
            this.addDirtyRegion(child.get('boundingBox'));
        }));

        this.addDirtyRegion(child.get('boundingBox'));
    },

    removeChild: function (opts) {
        BatchNode.superclass.removeChild.call(this, opts);

        // TODO remove istransformdirty_changed and visible_changed listeners

        this.set('dirty', true);
    },

    addDirtyRegion: function (rect) {
        // Increase rect slightly to compensate for subpixel artifacts
        rect = util.copy(rect);
        rect.origin.x -= 2;
        rect.origin.y -= 2;
        rect.size.width += 4;
        rect.size.height += 4;

        var region = this.get('dirtyRegion');
        if (!region) {
            region = rect;
        } else {
            region = geo.rectUnion(region, rect);
        }

        this.set('dirtyRegion', region);
        this.set('dirty', true);
    },

    _resizeCanvas: function (oldSize) {
        var size = this.get('contentSize');

        if (geo.sizeEqualToSize(size, oldSize)) {
            return; // No change
        }


        this.renderTexture.set('contentSize', size);
        this.set('dirty', true);
    },

    update: function () {

    },

    visit: function (context) {
        if (!this.visible) {
            return;
        }

        context.save();

        this.transform(context);

        var rect = this.get('dirtyRegion');
        // Only redraw if something changed
        if (this.dirty) {

            if (rect) {
                if (this.get('partialDraw')) {
                    // Clip region to visible area
                    var s = require('../Director').Director.get('sharedDirector').get('winSize'),
                        p = this.get('position');
                    var r = new geo.Rect(
                        0, 0,
                        s.width, s.height
                    );
                    r = geo.rectApplyAffineTransform(r, this.worldToNodeTransform());
                    rect = geo.rectIntersection(r, rect);
                }

                this.renderTexture.clear(rect);

                this.renderTexture.context.save();
                this.renderTexture.context.beginPath();
                this.renderTexture.context.rect(rect.origin.x, rect.origin.y, rect.size.width, rect.size.height);
                this.renderTexture.context.clip();
                this.renderTexture.context.closePath();
            } else {
                this.renderTexture.clear();
            }

            for (var i = 0, childLen = this.children.length; i < childLen; i++) {
                var c = this.children[i];
                if (c == this.renderTexture) {
                    continue;
                }

                // Draw children inside rect
                if (!rect || geo.rectOverlapsRect(c.get('boundingBox'), rect)) {
                    c.visit(this.renderTexture.context, rect);
                }
            }

            if (SHOW_REDRAW_REGIONS) {
                if (rect) {
                    this.renderTexture.context.beginPath();
                    this.renderTexture.context.rect(rect.origin.x, rect.origin.y, rect.size.width, rect.size.height);
                    this.renderTexture.context.fillStyle = "rgba(0, 0, 255, 0.5)";
                    this.renderTexture.context.fill();
                    this.renderTexture.context.closePath();
                }
            }

            if (rect) {
                this.renderTexture.context.restore();
            }

            this.set('dirty', false);
            this.set('dirtyRegion', null);
        }

        this.renderTexture.visit(context);

        context.restore();
    },

    draw: function (ctx) {
    },

    onEnter: function () {
        if (this.get('partialDraw')) {
            evt.addListener(this.get('parent'), 'istransformdirty_changed', util.callback(this, function () {
                var box = this.get('visibleRect');
                this.addDirtyRegion(box);
            }));
        }
    }
});

var SpriteBatchNode = BatchNode.extend(/** @lends cocos.nodes.SpriteBatchNode# */{
    textureAtlas: null,

    /**
     * @memberOf cocos.nodes
     * @class A BatchNode that accepts only Sprite using the same texture
     * @extends cocos.nodes.BatchNode
     * @constructs
     *
     * @opt {String} file (Optional) Path to image to use as sprite atlas
     * @opt {Texture2D} texture (Optional) Texture to use as sprite atlas
     * @opt {cocos.TextureAtlas} textureAtlas (Optional) TextureAtlas to use as sprite atlas
     */
    init: function (opts) {
        SpriteBatchNode.superclass.init.call(this, opts);

        var file         = opts.file,
            textureAtlas = opts.textureAtlas,
            texture      = opts.texture;

        if (file || texture) {
            textureAtlas = TextureAtlas.create({file: file, texture: texture});
        }

        this.set('textureAtlas', textureAtlas);
    },

    /**
     * @getter texture
     * @type cocos.Texture2D
     */
    get_texture: function () {
        return this.textureAtlas ? this.textureAtlas.texture : null;
    },

    set_opacity: function (newOpacity) {
        this.opacity = newOpacity;
        for (var i = 0, len = this.children.length; i < len; i++) {
            var child = this.children[i];
            child.set('opacity', newOpacity);
        }
    }

});

exports.BatchNode = BatchNode;
exports.SpriteBatchNode = SpriteBatchNode;

}};
__resources__["/__builtin__/libs/cocos2d/nodes/index.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util'),
    path = require('path');

var modules = 'AtlasNode LabelAtlas ProgressBar PreloadScene Node Layer Scene Label Sprite TMXTiledMap BatchNode RenderTexture Menu MenuItem Transition'.w();

/** 
 * @memberOf cocos
 * @namespace All cocos2d nodes. i.e. anything that can be added to a Scene
 */
var nodes = {};

util.each(modules, function (mod, i) {
    util.extend(nodes, require('./' + mod));
});

module.exports = nodes;

}};
__resources__["/__builtin__/libs/cocos2d/nodes/Label.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray FLIP_Y_AXIS*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util'),
    console = require('system').console,
    Director = require('../Director').Director,
    Node = require('./Node').Node,
    ccp = require('geometry').ccp;

var Label = Node.extend(/** @lends cocos.nodes.Label# */{
    string:   '',
    fontName: 'Helvetica',
    fontSize: 16,
    fontColor: 'white',

    /**
     * Renders a simple text label
     *
     * @constructs
     * @extends cocos.nodes.Node
     *
     * @opt {String} [string=""] The text string to draw
     * @opt {Float} [fontSize=16] The size of the font
     * @opt {String} [fontName="Helvetica"] The name of the font to use
     * @opt {String} [fontColor="white"] The color of the text
     */
    init: function (opts) {
        Label.superclass.init.call(this, opts);

        util.each('fontSize fontName fontColor string'.w(), util.callback(this, function (name) {
            // Set property on init
            if (opts[name]) {
                this.set(name, opts[name]);
            }

            // Update content size
            this._updateLabelContentSize();
        }));
    },

    /** 
     * String of the font name and size to use in a format &lt;canvas&gt; understands
     *
     * @getter font
     * @type String
     */
    get_font: function (key) {
        return this.get('fontSize') + 'px ' + this.get('fontName');
    },

    draw: function (context) {
        if (FLIP_Y_AXIS) {
            context.save();

            // Flip Y axis
            context.scale(1, -1);
            context.translate(0, -this.get('fontSize'));
        }


        context.fillStyle = this.get('fontColor');
        context.font = this.get('font');
        context.textBaseline = 'top';
        if (context.fillText) {
            context.fillText(this.get('string'), 0, 0);
        } else if (context.mozDrawText) {
            context.mozDrawText(this.get('string'));
        }

        if (FLIP_Y_AXIS) {
            context.restore();
        }
    },

    /**
     * @private
     */
    _updateLabelContentSize: function () {
        var ctx = Director.get('sharedDirector').get('context');
        var size = {width: 0, height: this.get('fontSize')};

        var prevFont = ctx.font;
        ctx.font = this.get('font');

        if (ctx.measureText) {
            var txtSize = ctx.measureText(this.get('string'));
            size.width = txtSize.width;
        } else if (ctx.mozMeasureText) {
            size.width = ctx.mozMeasureText(this.get('string'));
        }

        ctx.font = prevFont;

        this.set('contentSize', size);
    }
});

module.exports.Label = Label;

}};
__resources__["/__builtin__/libs/cocos2d/nodes/LabelAtlas.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var AtlasNode = require('./AtlasNode').AtlasNode,
    Sprite = require('./Sprite').Sprite,
    geo   = require('geometry');

var LabelAtlas = AtlasNode.extend(/** @lends cocos.nodes.LabelAtlas# */{
    string: '',

    mapStartChar: '',

    /**
     * @memberOf cocos.nodes
     * @extends cocos.nodes.BatchNode
     * @constructs
     *
     * @opt {String} [string=] Initial text to draw
     * @opt {String} charMapFile
     * @opt {Integer} itemWidth
     * @opt {Integer} itemHeight
     * @opt {String} startCharMap Single character
     */
    init: function (opts) {
        LabelAtlas.superclass.init.call(this, {
            file: opts.charMapFile,
            itemWidth: opts.itemWidth,
            itemHeight: opts.itemHeight,
            itemsToRender: opts.string.length,
            size: new geo.Size(opts.itemWidth * opts.string.length, opts.itemHeight)
        });


        this.mapStartChar = opts.startCharMap.charCodeAt(0);
        this.set('string', opts.string);
    },

    updateAtlasValue: function () {
        var n = this.string.length,
            s = this.get('string');
    
        // FIXME this should reuse children to improve performance
        while (this.children.length > 0) {
            this.removeChild(this.children[0]);
        }
        for (var i = 0; i < n; i++) {
            var a = s.charCodeAt(i) - this.mapStartChar,
                row = (a % this.itemsPerRow),
                col = Math.floor(a / this.itemsPerRow);
    
            var left = row * this.itemWidth,
                top  = col * this.itemHeight;

            var tile = Sprite.create({rect: new geo.Rect(left, top, this.itemWidth, this.itemHeight),
                              textureAtlas: this.textureAtlas});

            tile.set('position', new geo.Point(i * this.itemWidth, 0));
            tile.set('anchorPoint', new geo.Point(0, 0));
            tile.set('opacity', this.get('opacity'));
            
            this.addChild({child: tile});
        }
    },

    set_string: function (newString) {
        this.string = newString;

        this.updateAtlasValue();
    }
});


exports.LabelAtlas = LabelAtlas;

}};
__resources__["/__builtin__/libs/cocos2d/nodes/Layer.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var Node = require('./Node').Node,
    util = require('util'),
    evt = require('events'),
    Director = require('../Director').Director,
    ccp    = require('geometry').ccp,
    EventDispatcher = require('../EventDispatcher').EventDispatcher;

var Layer = Node.extend(/** @lends cocos.nodes.Layer# */{
    isMouseEnabled: false,
    isKeyboardEnabled: false,
    mouseDelegatePriority: 0,
    keyboardDelegatePriority: 0,

    /** 
     * A fullscreen Node. You need at least 1 layer in your app to add other nodes to.
     *
     * @memberOf cocos.nodes
     * @constructs
     * @extends cocos.nodes.Node
     */
    init: function () {
        Layer.superclass.init.call(this);

        var s = Director.get('sharedDirector').get('winSize');

        this.set('isRelativeAnchorPoint', false);
        this.anchorPoint = ccp(0.5, 0.5);
        this.set('contentSize', s);

        evt.addListener(this, 'ismouseenabled_changed', util.callback(this, function () {
            if (this.isRunning) {
                if (this.isMouseEnabled) {
                    EventDispatcher.get('sharedDispatcher').addMouseDelegate({delegate: this, priority: this.get('mouseDelegatePriority')});
                } else {
                    EventDispatcher.get('sharedDispatcher').removeMouseDelegate({delegate: this});
                }
            }
        }));


        evt.addListener(this, 'iskeyboardenabled_changed', util.callback(this, function () {
            if (this.isRunning) {
                if (this.isKeyboardEnabled) {
                    EventDispatcher.get('sharedDispatcher').addKeyboardDelegate({delegate: this, priority: this.get('keyboardDelegatePriority')});
                } else {
                    EventDispatcher.get('sharedDispatcher').removeKeyboardDelegate({delegate: this});
                }
            }
        }));
    },

    onEnter: function () {
        if (this.isMouseEnabled) {
            EventDispatcher.get('sharedDispatcher').addMouseDelegate({delegate: this, priority: this.get('mouseDelegatePriority')});
        }
        if (this.isKeyboardEnabled) {
            EventDispatcher.get('sharedDispatcher').addKeyboardDelegate({delegate: this, priority: this.get('keyboardDelegatePriority')});
        }
				
        Layer.superclass.onEnter.call(this);
    },

    onExit: function () {
        if (this.isMouseEnabled) {
            EventDispatcher.get('sharedDispatcher').removeMouseDelegate({delegate: this});
        }
        if (this.isKeyboardEnabled) {
            EventDispatcher.get('sharedDispatcher').removeKeyboardDelegate({delegate: this});
        }

        Layer.superclass.onExit.call(this);
    }
});

module.exports.Layer = Layer;

}};
__resources__["/__builtin__/libs/cocos2d/nodes/Menu.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util'),
    Layer = require('./Layer').Layer,
    Director = require('../Director').Director,
    MenuItem = require('./MenuItem').MenuItem,
    geom = require('geometry'), ccp = geom.ccp;

/**
 * @private
 * @constant
 */
var kMenuStateWaiting = 0;

/**
 * @private
 * @constant
 */
var kMenuStateTrackingTouch = 1;
    

var Menu = Layer.extend(/** @lends cocos.nodes.Menu# */{
    mouseDelegatePriority: (-Number.MAX_VALUE + 1),
    state: kMenuStateWaiting,
    selectedItem: null,
    color: null,

    /**
     * A fullscreen node used to render a selection of menu options
     *
     * @memberOf cocos.nodes
     * @constructs
     * @extends cocos.nodes.Layer
     *
     * @opt {cocos.nodes.MenuItem[]} items An array of MenuItems to draw on the menu
     */
    init: function (opts) {
        Menu.superclass.init.call(this, opts);

        var items = opts.items;

        this.set('isMouseEnabled', true);
        
        var s = Director.get('sharedDirector').get('winSize');

        this.set('isRelativeAnchorPoint', false);
        this.anchorPoint = ccp(0.5, 0.5);
        this.set('contentSize', s);

        this.set('position', ccp(s.width / 2, s.height / 2));


        if (items) {
            var z = 0;
            util.each(items, util.callback(this, function (item) {
                this.addChild({child: item, z: z++});
            }));
        }

        
    },

    addChild: function (opts) {
        if (!opts.child instanceof MenuItem) {
            throw "Menu only supports MenuItem objects as children";
        }

        Menu.superclass.addChild.call(this, opts);
    },

    itemForMouseEvent: function (event) {
        var location = event.locationInCanvas;

        var children = this.get('children');
        for (var i = 0, len = children.length; i < len; i++) {
            var item = children[i];

            if (item.get('visible') && item.get('isEnabled')) {
                var local = item.convertToNodeSpace(location);
                
                var r = item.get('rect');
                r.origin = ccp(0, 0);

                if (geom.rectContainsPoint(r, local)) {
                    return item;
                }

            }
        }

        return null;
    },

    mouseUp: function (event) {
        var selItem = this.get('selectedItem');

        if (selItem) {
            selItem.unselected();
            selItem.activate();
        }

        if (this.state != kMenuStateWaiting) {
            this.set('state', kMenuStateWaiting);
        }
        if (selItem) {
            return true;
        }
        return false;

    },
    mouseDown: function (event) {
        if (this.state != kMenuStateWaiting || !this.visible) {
            return false;
        }

        var selectedItem = this.itemForMouseEvent(event);
        this.set('selectedItem', selectedItem);
        if (selectedItem) {
            selectedItem.selected()
            this.set('state', kMenuStateTrackingTouch);

            return true;
        }

        return false;
    },

    mouseDragged: function (event) {
        var currentItem = this.itemForMouseEvent(event);

        if (currentItem != this.selectedItem) {
            if (this.selectedItem) {
                this.selectedItem.unselected();
            }
            this.set('selectedItem', currentItem);
            if (this.selectedItem) {
                this.selectedItem.selected();
            }
        }

        if (currentItem && this.state == kMenuStateTrackingTouch) {
            return true;
        }

        return false;
        
    }

});

exports.Menu = Menu;

}};
__resources__["/__builtin__/libs/cocos2d/nodes/MenuItem.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util'),
    Node = require('./Node').Node,
    Sprite = require('./Sprite').Sprite,
    rectMake = require('geometry').rectMake,
    ccp = require('geometry').ccp;

var MenuItem = Node.extend(/** @lends cocos.nodes.MenuItem# */{
    isEnabled: true,
    isSelected: false,
    callback: null,

    /**
     * Base class for any buttons or options in a menu
     *
     * @memberOf cocos.nodes
     * @constructs
     * @extends cocos.nodes.Node
     *
     * @opt {Function} callback Function to call when menu item is activated
     */
    init: function (opts) {
        MenuItem.superclass.init.call(this, opts);

        var callback = opts.callback;

        this.set('anchorPoint', ccp(0.5, 0.5));
        this.set('callback', callback);
    },

    activate: function () {
        if (this.isEnabled && this.callback) {
            this.callback(this);
        }
    },

    /**
     * @getter rect
     * @type geometry.Rect
     */
    get_rect: function () {
        return rectMake(
            this.position.x - this.contentSize.width  * this.anchorPoint.x,
            this.position.y - this.contentSize.height * this.anchorPoint.y,
            this.contentSize.width,
            this.contentSize.height
        );
    },

    selected: function () {
        this.isSelected = true;
    },

    unselected: function () {
        this.isSelected = false;
    }
});

var MenuItemSprite = MenuItem.extend(/** @lends cocos.nodes.MenuItemSprite# */{
    normalImage: null,
    selectedImage: null,
    disabledImage: null,

    /**
     * A menu item that accepts any cocos.nodes.Node
     *
     * @memberOf cocos.nodes
     * @constructs
     * @extends cocos.nodes.MenuItem
     *
     * @opt {cocos.nodes.Node} normalImage Main Node to draw
     * @opt {cocos.nodes.Node} selectedImage Node to draw when menu item is selected
     * @opt {cocos.nodes.Node} disabledImage Node to draw when menu item is disabled
     */
    init: function (opts) {
        MenuItemSprite.superclass.init.call(this, opts);

        var normalImage   = opts.normalImage,
            selectedImage = opts.selectedImage,
            disabledImage = opts.disabledImage;

        this.set('normalImage', normalImage);
        this.set('selectedImage', selectedImage);
        this.set('disabledImage', disabledImage);

        this.set('contentSize', normalImage.get('contentSize'));
    },

    set_normalImage: function (image) {
        if (image != this.normalImage) {
            image.set('anchorPoint', ccp(0, 0));
            image.set('visible', true);
            this.removeChild({child: this.normalImage, cleanup: true});
            this.addChild(image);

            this.normalImage = image;
        }
    },

    set_selectedImage: function (image) {
        if (image != this.selectedImage) {
            image.set('anchorPoint', ccp(0, 0));
            image.set('visible', false);
            this.removeChild({child: this.selectedImage, cleanup: true});
            this.addChild(image);

            this.selectedImage = image;
        }
    },

    set_disabledImage: function (image) {
        if (image != this.disabledImage) {
            image.set('anchorPoint', ccp(0, 0));
            image.set('visible', false);
            this.removeChild({child: this.disabledImage, cleanup: true});
            this.addChild(image);

            this.disabledImage = image;
        }
    },

    selected: function () {
        MenuItemSprite.superclass.selected.call(this);

        if (this.selectedImage) {
            this.normalImage.set('visible',   false);
            this.selectedImage.set('visible', true);
            if (this.disabledImage) this.disabledImage.set('visible', false);
        } else {
            this.normalImage.set('visible',   true);
            if (this.disabledImage) this.disabledImage.set('visible', false);
        }
    },

    unselected: function () {
        MenuItemSprite.superclass.unselected.call(this);

        this.normalImage.set('visible',   true);
        if (this.selectedImage) this.selectedImage.set('visible', false);
        if (this.disabledImage) this.disabledImage.set('visible', false);
    },

    set_isEnabled: function (enabled) {
        this.isEnabled = enabled;

        if (enabled) {
            this.normalImage.set('visible',   true);
            if (this.selectedImage) this.selectedImage.set('visible', false);
            if (this.disabledImage) this.disabledImage.set('visible', false);
        } else {
            if (this.disabledImage) {
                this.normalImage.set('visible',   false);
                if (this.selectedImage) this.selectedImage.set('visible', false);
                this.disabledImage.set('visible', true);
            } else {
                this.normalImage.set('visible',   true);
                if (this.selectedImage) this.selectedImage.set('visible', false);
            }
        }
    }

});

var MenuItemImage = MenuItemSprite.extend(/** @lends cocos.nodes.MenuItemImage# */{

    /**
     * MenuItem that accepts image files
     *
     * @memberOf cocos.nodes
     * @constructs
     * @extends cocos.nodes.MenuItemSprite
     *
     * @opt {String} normalImage Main image file to draw
     * @opt {String} selectedImage Image file to draw when menu item is selected
     * @opt {String} disabledImage Image file to draw when menu item is disabled
     */
    init: function (opts) {
        var normalI   = opts.normalImage,
            selectedI = opts.selectedImage,
            disabledI = opts.disabledImage,
            callback  = opts.callback;

        var normalImage = Sprite.create({file: normalI}),
            selectedImage = Sprite.create({file: selectedI}),
            disabledImage = null;

        if (disabledI) {
            disabledImage = Sprite.create({file: disabledI});
        }

        return MenuItemImage.superclass.init.call(this, {normalImage: normalImage, selectedImage: selectedImage, disabledImage: disabledImage, callback: callback});
    }
});

exports.MenuItem = MenuItem;
exports.MenuItemImage = MenuItemImage;
exports.MenuItemSprite = MenuItemSprite;

}};
__resources__["/__builtin__/libs/cocos2d/nodes/Node.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util'),
    evt = require('events'),
    Scheduler = require('../Scheduler').Scheduler,
    ActionManager = require('../ActionManager').ActionManager,
    geo = require('geometry'), ccp = geo.ccp;

var Node = BObject.extend(/** @lends cocos.nodes.Node# */{
    isCocosNode: true,

    /**
     * Is the node visible
     * @type boolean
     */
    visible: true,

    /**
     * Position relative to parent node
     * @type geometry.Point
     */
    position: null,

    /**
     * Parent node
     * @type cocos.nodes.Node
     */
    parent: null,

    /**
     * Unique tag to identify the node
     * @type *
     */
    tag: null,

    /**
     * Size of the node
     * @type geometry.Size
     */
    contentSize: null,

    /**
     * Nodes Z index. i.e. draw order
     * @type Integer
     */
    zOrder: 0,

    /**
     * Anchor point for scaling and rotation. 0x0 is top left and 1x1 is bottom right
     * @type geometry.Point
     */
    anchorPoint: null,

    /**
     * Anchor point for scaling and rotation in pixels from top left
     * @type geometry.Point
     */
    anchorPointInPixels: null,

    /**
     * Rotation angle in degrees
     * @type Float
     */
    rotation: 0,

    /**
     * X scale factor
     * @type Float
     */
    scaleX: 1,

    /**
     * Y scale factor
     * @type Float
     */
    scaleY: 1,

    /**
     * Opacity of the Node. 0 is totally transparent, 255 is totally opaque
     * @type Float
     */
    opacity: 255,

    isRunning: false,
    isRelativeAnchorPoint: true,

    isTransformDirty: true,
    isInverseDirty: true,
    inverse: null,
    transformMatrix: null,

    /**
     * The child Nodes
     * @type cocos.nodes.Node[]
     */
    children: null,

    /**
     * @memberOf cocos.nodes
     * @class The base class all visual elements extend from
     * @extends BObject
     * @constructs
     */
    init: function () {
        Node.superclass.init.call(this);
        this.set('contentSize', {width: 0, height: 0});
        this.anchorPoint = ccp(0.5, 0.5);
        this.anchorPointInPixels = ccp(0, 0);
        this.position = ccp(0, 0);
        this.children = [];

        util.each(['scaleX', 'scaleY', 'rotation', 'position', 'anchorPoint', 'contentSize', 'isRelativeAnchorPoint'], util.callback(this, function (key) {
            evt.addListener(this, key.toLowerCase() + '_changed', util.callback(this, this._dirtyTransform));
        }));
        evt.addListener(this, 'anchorpoint_changed', util.callback(this, this._updateAnchorPointInPixels));
        evt.addListener(this, 'contentsize_changed', util.callback(this, this._updateAnchorPointInPixels));
    },

    /**
     * Calculates the anchor point in pixels and updates the
     * anchorPointInPixels property
     * @private
     */
    _updateAnchorPointInPixels: function () {
        var ap = this.get('anchorPoint'),
            cs = this.get('contentSize');
        this.set('anchorPointInPixels', ccp(cs.width * ap.x, cs.height * ap.y));
    },

    /**
     * Add a child Node
     *
     * @opt {cocos.nodes.Node} child The child node to add
     * @opt {Integer} [z] Z Index for the child
     * @opt {Integer|String} [tag] A tag to reference the child with
     * @returns {cocos.nodes.Node} The node the child was added to. i.e. 'this'
     */
    addChild: function (opts) {
        if (opts.isCocosNode) {
            return this.addChild({child: opts});
        }

        var child = opts.child,
            z = opts.z,
            tag = opts.tag;

        if (z === undefined || z === null) {
            z = child.get('zOrder');
        }

        //this.insertChild({child: child, z:z});
        var added = false;


        for (var i = 0, childLen = this.children.length; i < childLen; i++) {
            var c = this.children[i];
            if (c.zOrder > z) {
                added = true;
                this.children.splice(i, 0, child);
                break;
            }
        }

        if (!added) {
            this.children.push(child);
        }

        child.set('tag', tag);
        child.set('zOrder', z);
        child.set('parent', this);

        if (this.isRunning) {
            child.onEnter();
        }

        return this;
    },
    getChild: function (opts) {
        var tag = opts.tag;

        for (var i = 0; i < this.children.length; i++) {
            if (this.children[i].tag == tag) {
                return this.children[i];
            }
        }

        return null;
    },

    removeChild: function (opts) {
        if (opts.isCocosNode) {
            return this.removeChild({child: opts});
        }

        var child = opts.child,
            cleanup = opts.cleanup;

        if (!child) {
            return;
        }

        var children = this.get('children'),
            idx = children.indexOf(child);

        if (idx > -1) {
            this.detatchChild({child: child, cleanup: cleanup});
        }
    },

    removeChildren: function(opts) {
        var children = this.get('children'),
            isRunning = this.get('isRunning');
        
        // Perform cleanup on each child but can't call removeChild() 
        // due to Array.splice's destructive nature during iteration.
        for (var i = 0; i < children.length; i++) {
            if (opts.cleanup) {
                children[i].cleanup();
            }
            if (isRunning) {
                children[i].onExit();
            }
            children[i].set('parent', null);
        }
        // Now safe to empty children list
        this.children = [];
    },
    
    detatchChild: function (opts) {
        var child = opts.child,
            cleanup = opts.cleanup;

        var children = this.get('children'),
            isRunning = this.get('isRunning'),
            idx = children.indexOf(child);

        if (isRunning) {
            child.onExit();
        }

        if (cleanup) {
            child.cleanup();
        }

        child.set('parent', null);
        children.splice(idx, 1);
    },

    reorderChild: function (opts) {
        var child = opts.child,
            z     = opts.z;

        var pos = this.children.indexOf(child);
        if (pos == -1) {
            throw "Node isn't a child of this node";
        }

        child.set('zOrder', z);

        // Remove child
        this.children.splice(pos, 1);

        // Add child back at correct location
        var added = false;
        for (var i = 0, childLen = this.children.length; i < childLen; i++) {
            var c = this.children[i];
            if (c.zOrder > z) {
                added = true;
                this.children.splice(i, 0, child);
                break;
            }
        }

        if (!added) {
            this.children.push(child);
        }
    },

    /**
     * Draws the node. Override to do custom drawing. If it's less efficient to
     * draw only the area inside the rect then don't bother. The result will be
     * clipped to that area anyway.
     *
     * @param {CanvasRenderingContext2D|WebGLRenderingContext} context Canvas rendering context
     * @param {geometry.Rect} rect Rectangular region that needs redrawing. Limit drawing to this area only if it's more efficient to do so.
     */
    draw: function (context, rect) {
        // All draw code goes here
    },

    /**
     * @getter scale
     * @type Float
     */
    get_scale: function () {
        if (this.scaleX != this.scaleY) {
            throw "scaleX and scaleY aren't identical";
        }

        return this.scaleX;
    },

    /**
     * @setter scale
     * @type Float
     */
    set_scale: function (val) {
        this.set('scaleX', val);
        this.set('scaleY', val);
    },
		
    scheduleUpdate: function (opts) {
        opts = opts || {};
        var priority = opts.priority || 0;

        Scheduler.get('sharedScheduler').scheduleUpdate({target: this, priority: priority, paused: !this.get('isRunning')});
    },

    /**
     * Triggered when the node is added to a scene
     *
     * @event
     */
    onEnter: function () {
        util.each(this.children, function (child) {
            child.onEnter();
        });

        this.resumeSchedulerAndActions();
        this.set('isRunning', true);
    },

    /**
     * Triggered when the node is removed from a scene
     *
     * @event
     */
    onExit: function () {
        this.pauseSchedulerAndActions();
        this.set('isRunning', false);

        util.each(this.children, function (child) {
            child.onExit();
        });
    },

    cleanup: function () {
        this.stopAllActions();
        this.unscheduleAllSelectors();
        util.each(this.children, function (child) {
            child.cleanup();
        });
    },

    resumeSchedulerAndActions: function () {
        Scheduler.get('sharedScheduler').resumeTarget(this);
        ActionManager.get('sharedManager').resumeTarget(this);
    },
    pauseSchedulerAndActions: function () {
        Scheduler.get('sharedScheduler').pauseTarget(this);
        ActionManager.get('sharedManager').pauseTarget(this);
    },
    unscheduleSelector: function (selector) {
        Scheduler.get('sharedScheduler').unschedule({target: this, method: selector});
    },
    unscheduleAllSelectors: function () {
        Scheduler.get('sharedScheduler').unscheduleAllSelectorsForTarget(this);
    },
    stopAllActions: function () {
        ActionManager.get('sharedManager').removeAllActionsFromTarget(this);
    },

    visit: function (context, rect) {
        if (!this.visible) {
            return;
        }

        context.save();

        this.transform(context);

        // Set alpha value (global only for now)
        context.globalAlpha = this.get('opacity') / 255.0;
        
        // Adjust redraw region by nodes position
        if (rect) {
            var pos = this.get('position');
            rect = new geo.Rect(rect.origin.x - pos.x, rect.origin.y - pos.y, rect.size.width, rect.size.height);
        }

        // Draw background nodes
        util.each(this.children, function (child, i) {
            if (child.zOrder < 0) {
                child.visit(context, rect);
            }
        });
        
        this.draw(context, rect);

        // Draw foreground nodes
        util.each(this.children, function (child, i) {
            if (child.zOrder >= 0) {
                child.visit(context, rect);
            }
        });

        context.restore();
    },
    transform: function (context) {
        // Translate
        if (this.isRelativeAnchorPoint && (this.anchorPointInPixels.x !== 0 || this.anchorPointInPixels.y !== 0)) {
            context.translate(Math.round(-this.anchorPointInPixels.x), Math.round(-this.anchorPointInPixels.y));
        }

        if (this.anchorPointInPixels.x !== 0 || this.anchorPointInPixels.y !== 0) {
            context.translate(Math.round(this.position.x + this.anchorPointInPixels.x), Math.round(this.position.y + this.anchorPointInPixels.y));
        } else {
            context.translate(Math.round(this.position.x), Math.round(this.position.y));
        }

        // Rotate
        context.rotate(geo.degreesToRadians(this.get('rotation')));

        // Scale
        context.scale(this.scaleX, this.scaleY);

        if (this.anchorPointInPixels.x !== 0 || this.anchorPointInPixels.y !== 0) {
            context.translate(Math.round(-this.anchorPointInPixels.x), Math.round(-this.anchorPointInPixels.y));
        }
    },

    runAction: function (action) {
        ActionManager.get('sharedManager').addAction({action: action, target: this, paused: this.get('isRunning')});
    },
    
    /**
     * @opts {String} tag Tag of the action to return
     */
    getAction: function(opts) {
        return ActionManager.get('sharedManager').getActionFromTarget({target: this, tag: opts.tag});
    },
    
    nodeToParentTransform: function () {
        if (this.isTransformDirty) {
            this.transformMatrix = geo.affineTransformIdentity();

            if (!this.isRelativeAnchorPoint && !geo.pointEqualToPoint(this.anchorPointInPixels, ccp(0, 0))) {
                this.transformMatrix = geo.affineTransformTranslate(this.transformMatrix, this.anchorPointInPixels.x, this.anchorPointInPixels.y);
            }

            if (!geo.pointEqualToPoint(this.position, ccp(0, 0))) {
                this.transformMatrix = geo.affineTransformTranslate(this.transformMatrix, this.position.x, this.position.y);
            }

            if (this.rotation !== 0) {
                this.transformMatrix = geo.affineTransformRotate(this.transformMatrix, -geo.degreesToRadians(this.rotation));
            }
            if (!(this.scaleX == 1 && this.scaleY == 1)) {
                this.transformMatrix = geo.affineTransformScale(this.transformMatrix, this.scaleX, this.scaleY);
            }

            if (!geo.pointEqualToPoint(this.anchorPointInPixels, ccp(0, 0))) {
                this.transformMatrix = geo.affineTransformTranslate(this.transformMatrix, -this.anchorPointInPixels.x, -this.anchorPointInPixels.y);
            }

            this.set('isTransformDirty', false);

        }

        return this.transformMatrix;
    },

    parentToNodeTransform: function () {
        // TODO
    },

    nodeToWorldTransform: function () {
        var t = this.nodeToParentTransform();

        var p;
        for (p = this.get('parent'); p; p = p.get('parent')) {
            t = geo.affineTransformConcat(t, p.nodeToParentTransform());
        }

        return t;
    },

    worldToNodeTransform: function () {
        return geo.affineTransformInvert(this.nodeToWorldTransform());
    },

    convertToNodeSpace: function (worldPoint) {
        return geo.pointApplyAffineTransform(worldPoint, this.worldToNodeTransform());
    },

    /**
     * @getter boundingBox
     * @type geometry.Rect
     */
    get_boundingBox: function () {
        var cs = this.get('contentSize');
        var rect = geo.rectMake(0, 0, cs.width, cs.height);
        rect = geo.rectApplyAffineTransform(rect, this.nodeToParentTransform());
        return rect;
    },

    /**
     * @getter worldBoundingBox
     * @type geometry.Rect
     */
    get_worldBoundingBox: function () {
        var cs = this.get('contentSize');

        var rect = geo.rectMake(0, 0, cs.width, cs.height);
        rect = geo.rectApplyAffineTransform(rect, this.nodeToWorldTransform());
        return rect;
    },

    /**
     * The area of the node currently visible on screen. Returns an rect even
     * if visible is false.
     *
     * @getter visibleRect
     * @type geometry.Rect
     */
    get_visibleRect: function () {
        var s = require('../Director').Director.get('sharedDirector').get('winSize');
        var rect = new geo.Rect(
            0, 0,
            s.width, s.height
        );

        return geo.rectApplyAffineTransform(rect, this.worldToNodeTransform());
    },

    /**
     * @private
     */
    _dirtyTransform: function () {
        this.set('isTransformDirty', true);
    },

    /**
     * Schedules a custom method with an interval time in seconds.
     * If time is 0 it will be ticked every frame.
     * If time is 0, it is recommended to use 'scheduleUpdate' instead.
     * 
     * If the method is already scheduled, then the interval parameter will
     * be updated without scheduling it again.
     *
     * @opt {String|Function} method Function of method name to schedule
     * @opt {Float} [interval=0] Interval in seconds
     */
    schedule: function (opts) {
        if (typeof opts == 'string') {
            return this.schedule({method: opts, interval: 0});
        }

        opts.interval = opts.interval || 0;

        Scheduler.get('sharedScheduler').schedule({target: this, method: opts.method, interval: opts.interval, paused: this.isRunning});
    },

    /**
     * Unschedules a custom method
     *
     * @param {String|Function} method
     */
    unschedule: function (method) {
        if (!method) {
            return;
        }

        if (typeof method == 'string') {
            method = this[method];
        }
        
        Scheduler.get('sharedScheduler').unschedule({target: this, method: method});
    }

});

module.exports.Node = Node;

}};
__resources__["/__builtin__/libs/cocos2d/nodes/PreloadScene.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var Scene       = require('./Scene').Scene,
    Director    = require('../Director').Director,
    Label       = require('./Label').Label,
    ProgressBar = require('./ProgressBar').ProgressBar,
    Preloader   = require('../Preloader').Preloader,
    RemoteResource = require('../RemoteResource').RemoteResource,
    geo         = require('geometry'),
    util        = require('util'),
    events      = require('events');

var PreloadScene = Scene.extend(/** @lends cocos.nodes.PreloadScene# */{
    progressBar: null,
    label: null,
    preloader: null,
    isReady: false, // True when both progress bar images have loaded
    emptyImage: "/__builtin__/libs/cocos2d/resources/progress-bar-empty.png",
    fullImage:  "/__builtin__/libs/cocos2d/resources/progress-bar-full.png",

    /**
     * @memberOf cocos.nodes
     * @extends cocos.nodes.Scene
     * @constructs
     */
    init: function (opts) {
        PreloadScene.superclass.init.call(this, opts);
        var size = Director.get('sharedDirector').get('winSize');

        // Setup 'please wait' label
        var label = Label.create({
            fontSize: 14,
            fontName: 'Helvetica',
            fontColor: '#ffffff',
            string: 'Please wait...'
        });
        label.set('position', new geo.Point(size.width / 2, (size.height / 2) + 32));
        this.set('label', label);
        this.addChild({child: label});

        // Setup preloader
        var preloader = Preloader.create();
        this.set('preloader', preloader);
        var self = this;

        // Listen for preload events
        events.addListener(preloader, 'load', function (uri, preloader) {
            var loaded = preloader.get('loaded'),
                count = preloader.get('count');
            //console.log("Loaded: %d%% -- %d of %d -- %s", (loaded / count) * 100, loaded, count, uri);
            events.trigger(self, 'load', uri, preloader);
        });

        events.addListener(preloader, 'complete', function (preloader) {
            events.trigger(self, 'complete', preloader);
        });


        // Load the images used by the progress bar
        var emptyImage = resource(this.get('emptyImage')),
            fullImage  = resource(this.get('fullImage'));


        var loaded = 0;
        function imageLoaded() {
            if (loaded == 2) {
                this.isReady = true;
                this.createProgressBar();
                if (this.get('isRunning')) {
                    preloader.load();
                }
            }
        }

        if (emptyImage instanceof RemoteResource) {
            events.addListener(emptyImage, 'load', util.callback(this, function() {
                loaded++;
                imageLoaded.call(this);
            }));
            emptyImage.load();
        } else {
            loaded++;
            imageLoaded.call(this);
        }
        if (fullImage instanceof RemoteResource) {
            events.addListener(fullImage, 'load', util.callback(this, function() {
                loaded++;
                imageLoaded.call(this);
            }));
            fullImage.load();
        } else {
            loaded++;
            imageLoaded.call(this);
        }

    },

    createProgressBar: function () {
        var preloader = this.get('preloader'),
            size = Director.get('sharedDirector').get('winSize');

        var progressBar = ProgressBar.create({
            emptyImage: "/__builtin__/libs/cocos2d/resources/progress-bar-empty.png",
            fullImage:  "/__builtin__/libs/cocos2d/resources/progress-bar-full.png"
        });

        progressBar.set('position', new geo.Point(size.width / 2, size.height / 2));

        this.set('progressBar', progressBar);
        this.addChild({child: progressBar});

        progressBar.bindTo('maxValue', preloader, 'count');
        progressBar.bindTo('value',    preloader, 'loaded');
    },

    onEnter: function () {
        PreloadScene.superclass.onEnter.call(this);
        var preloader = this.get('preloader');

        // Preload everything
        if (this.isReady) {
            preloader.load();
        }
    }
});

exports.PreloadScene = PreloadScene;

}};
__resources__["/__builtin__/libs/cocos2d/nodes/ProgressBar.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var Node   = require('./Node').Node,
    util   = require('util'),
    geo    = require('geometry'),
    events = require('events'),
    Sprite = require('./Sprite').Sprite;

var ProgressBar = Node.extend(/** @lends cocos.nodes.ProgressBar# */{
    emptySprite: null,
    fullSprite: null,
    maxValue: 100,
    value: 0,

    /**
     * @memberOf cocos.nodes
     * @extends cocos.nodes.Node
     * @constructs
     */
    init: function (opts) {
        ProgressBar.superclass.init.call(this, opts);
        var size = new geo.Size(272, 32);
        this.set('contentSize', size);

        var s;
        if (opts.emptyImage) {
            s = Sprite.create({file: opts.emptyImage, rect: new geo.Rect(0, 0, size.width, size.height)});
            s.set('anchorPoint', new geo.Point(0, 0));
            this.set('emptySprite', s);
            this.addChild({child: s});
        }
        if (opts.fullImage) {
            s = Sprite.create({file: opts.fullImage, rect: new geo.Rect(0, 0, 0, size.height)});
            s.set('anchorPoint', new geo.Point(0, 0));
            this.set('fullSprite', s);
            this.addChild({child: s});
        }

        events.addListener(this, 'maxvalue_changed', util.callback(this, 'updateImages'));
        events.addListener(this, 'value_changed', util.callback(this, 'updateImages'));

        this.updateImages();
    },

    updateImages: function () {
        var empty = this.get('emptySprite'),
            full  = this.get('fullSprite'),
            value = this.get('value'),
            size  = this.get('contentSize'),
            maxValue = this.get('maxValue'),
            ratio = (value / maxValue);

        var diff = Math.round(size.width * ratio);
        if (diff === 0) {
            full.set('visible', false);
        } else {
            full.set('visible', true);
            full.set('rect', new geo.Rect(0, 0, diff, size.height));
            full.set('contentSize', new geo.Size(diff, size.height));
        }

        if ((size.width - diff) === 0) {
            empty.set('visible', false);
        } else {
            empty.set('visible', true);
            empty.set('rect', new geo.Rect(diff, 0, size.width - diff, size.height));
            empty.set('position', new geo.Point(diff, 0));
            empty.set('contentSize', new geo.Size(size.width - diff, size.height));
        }
    }
});

exports.ProgressBar = ProgressBar;

}};
__resources__["/__builtin__/libs/cocos2d/nodes/RenderTexture.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray FLIP_Y_AXIS*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util'),
    evt = require('events'),
    Node = require('./Node').Node,
    geo = require('geometry'),
    Sprite = require('./Sprite').Sprite,
    TextureAtlas = require('../TextureAtlas').TextureAtlas,
    ccp = geo.ccp;

var RenderTexture = Node.extend(/** @lends cocos.nodes.RenderTexture# */{
    canvas: null,
    context: null,
    sprite: null,

    /** 
     * An in-memory canvas which can be drawn to in the background before drawing on screen
     *
     * @memberOf cocos.nodes
     * @constructs
     * @extends cocos.nodes.Node
     *
     * @opt {Integer} width The width of the canvas
     * @opt {Integer} height The height of the canvas
     */
    init: function (opts) {
        RenderTexture.superclass.init.call(this, opts);

        var width = opts.width,
            height = opts.height;

        evt.addListener(this, 'contentsize_changed', util.callback(this, this._resizeCanvas));

        this.canvas = document.createElement('canvas');
        this.context = this.canvas.getContext('2d');

        var atlas = TextureAtlas.create({canvas: this.canvas});
        this.sprite = Sprite.create({textureAtlas: atlas, rect: {origin: ccp(0, 0), size: {width: width, height: height}}});

        this.set('contentSize', geo.sizeMake(width, height));
        this.addChild(this.sprite);
        this.set('anchorPoint', ccp(0, 0));
        this.sprite.set('anchorPoint', ccp(0, 0));

    },

    /**
     * @private
     */
    _resizeCanvas: function () {
        var size = this.get('contentSize'),
            canvas = this.get('canvas');

        canvas.width  = size.width;
        canvas.height = size.height;
        if (FLIP_Y_AXIS) {
            this.context.scale(1, -1);
            this.context.translate(0, -canvas.height);
        }

        var s = this.get('sprite');
        if (s) {
            s.set('textureRect', {rect: geo.rectMake(0, 0, size.width, size.height)});
        }
    },

    /**
     * Clear the canvas
     */
    clear: function (rect) {
        if (rect) {
            this.context.clearRect(rect.origin.x, rect.origin.y, rect.size.width, rect.size.height);
        } else {
            this.canvas.width = this.canvas.width;
            if (FLIP_Y_AXIS) {
                this.context.scale(1, -1);
                this.context.translate(0, -this.canvas.height);
            }
        }
    }
});

module.exports.RenderTexture = RenderTexture;

}};
__resources__["/__builtin__/libs/cocos2d/nodes/Scene.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var Node = require('./Node').Node,
    geo = require('geometry');

var Scene = Node.extend(/** @lends cocos.nodes.Scene */{
    /**
     * Everything in your view will be a child of this object. You need at least 1 scene per app.
     *
     * @memberOf cocos.nodes
     * @constructs
     * @extends cocos.nodes.Node
     */
    init: function () {
        Scene.superclass.init.call(this);


        var Director = require('../Director').Director;
        var s = Director.get('sharedDirector').get('winSize');
        this.set('isRelativeAnchorPoint', false);
        this.anchorPoint = new geo.Point(0.5, 0.5);
        this.set('contentSize', s);
    }

});

module.exports.Scene = Scene;

}};
__resources__["/__builtin__/libs/cocos2d/nodes/Sprite.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util'),
    evt = require('events'),
    Director = require('../Director').Director,
    TextureAtlas = require('../TextureAtlas').TextureAtlas,
    Node = require('./Node').Node,
    geo = require('geometry'),
    ccp = geo.ccp;

var Sprite = Node.extend(/** @lends cocos.nodes.Sprite# */{
    textureAtlas: null,
    rect: null,
    dirty: true,
    recursiveDirty: true,
    quad: null,
    flipX: false,
    flipY: false,
    offsetPosition: null,
    unflippedOffsetPositionFromCenter: null,
    untrimmedSize: null,

    /**
     * A small 2D graphics than can be animated
     *
     * @memberOf cocos.nodes
     * @constructs
     * @extends cocos.nodes.Node
     *
     * @opt {String} file Path to image to use as sprite atlas
     * @opt {Rect} [rect] The rect in the sprite atlas image file to use as the sprite
     */
    init: function (opts) {
        Sprite.superclass.init.call(this, opts);

        opts = opts || {};

        var file         = opts.file,
            textureAtlas = opts.textureAtlas,
            texture      = opts.texture,
            frame        = opts.frame,
            spritesheet  = opts.spritesheet,
            rect         = opts.rect;

        this.set('offsetPosition', ccp(0, 0));
        this.set('unflippedOffsetPositionFromCenter', ccp(0, 0));


        if (frame) {
            texture = frame.get('texture');
            rect    = frame.get('rect');
        }

        util.each(['scale', 'scaleX', 'scaleY', 'rect', 'flipX', 'flipY', 'contentSize'], util.callback(this, function (key) {
            evt.addListener(this, key.toLowerCase() + '_changed', util.callback(this, this._updateQuad));
        }));
        evt.addListener(this, 'textureatlas_changed', util.callback(this, this._updateTextureQuad));

        if (file || texture) {
            textureAtlas = TextureAtlas.create({file: file, texture: texture});
        } else if (spritesheet) {
            textureAtlas = spritesheet.get('textureAtlas');
            this.set('useSpriteSheet', true);
        } else if (!textureAtlas) {
            //throw "Sprite has no texture";
        }

        if (!rect && textureAtlas) {
            rect = {origin: ccp(0, 0), size: {width: textureAtlas.texture.size.width, height: textureAtlas.texture.size.height}};
        }

        if (rect) {
            this.set('rect', rect);
            this.set('contentSize', rect.size);

            this.quad = {
                drawRect: {origin: ccp(0, 0), size: rect.size},
                textureRect: rect
            };
        }

        this.set('textureAtlas', textureAtlas);

        if (frame) {
            this.set('displayFrame', frame);
        }
    },

    /**
     * @private
     */
    _updateTextureQuad: function (obj, key, texture, oldTexture) {
        if (oldTexture) {
            oldTexture.removeQuad({quad: this.get('quad')});
        }

        if (texture) {
            texture.insertQuad({quad: this.get('quad')});
        }
    },

    /**
     * @setter textureCoords
     * @type geometry.Rect
     */
    set_textureCoords: function (rect) {
        var quad = this.get('quad');
        if (!quad) {
            quad = {
                drawRect: geo.rectMake(0, 0, 0, 0), 
                textureRect: geo.rectMake(0, 0, 0, 0)
            };
        }

        quad.textureRect = util.copy(rect);

        this.set('quad', quad);
    },

    /**
     * @setter textureRect
     * @type geometry.Rect
     */
    set_textureRect: function (opts) {
        var rect = opts.rect,
            rotated = !!opts.rotated,
            untrimmedSize = opts.untrimmedSize || rect.size;

        this.set('contentSize', untrimmedSize);
        this.set('rect', util.copy(rect));
        this.set('textureCoords', rect);

        var quad = this.get('quad');

        var relativeOffset = util.copy(this.get('unflippedOffsetPositionFromCenter'));

        if (this.get('flipX')) {
            relativeOffset.x = -relativeOffset.x;
        }
        if (this.get('flipY')) {
            relativeOffset.y = -relativeOffset.y;
        }

        var offsetPosition = util.copy(this.get('offsetPosition'));
        offsetPosition.x =  relativeOffset.x + (this.get('contentSize').width  - rect.size.width) / 2;
        offsetPosition.y = -relativeOffset.y + (this.get('contentSize').height - rect.size.height) / 2;

        quad.drawRect.origin = util.copy(offsetPosition);
        quad.drawRect.size = util.copy(rect.size);
        if (this.flipX) {
            quad.drawRect.size.width *= -1;
            quad.drawRect.origin.x = -rect.size.width;
        }
        if (this.flipY) {
            quad.drawRect.size.height *= -1;
            quad.drawRect.origin.y = -rect.size.height;
        }

        this.set('quad', quad);
    },

    /**
     * @private
     */
    _updateQuad: function () {
        if (!this.get('rect')) {
            return;
        }
        if (!this.quad) {
            this.quad = {
                drawRect: geo.rectMake(0, 0, 0, 0), 
                textureRect: geo.rectMake(0, 0, 0, 0)
            };
        }

        var relativeOffset = util.copy(this.get('unflippedOffsetPositionFromCenter'));

        if (this.get('flipX')) {
            relativeOffset.x = -relativeOffset.x;
        }
        if (this.get('flipY')) {
            relativeOffset.y = -relativeOffset.y;
        }

        var offsetPosition = util.copy(this.get('offsetPosition'));
        offsetPosition.x = relativeOffset.x + (this.get('contentSize').width  - this.get('rect').size.width) / 2;
        offsetPosition.y = relativeOffset.y + (this.get('contentSize').height - this.get('rect').size.height) / 2;

        this.quad.textureRect = util.copy(this.rect);
        this.quad.drawRect.origin = util.copy(offsetPosition);
        this.quad.drawRect.size = util.copy(this.rect.size);

        if (this.flipX) {
            this.quad.drawRect.size.width *= -1;
            this.quad.drawRect.origin.x = -this.rect.size.width;
        }
        if (this.flipY) {
            this.quad.drawRect.size.height *= -1;
            this.quad.drawRect.origin.y = -this.rect.size.height;
        }
    },

    updateTransform: function (ctx) {
        if (!this.useSpriteSheet) {
            throw "updateTransform is only valid when Sprite is being rendered using a SpriteSheet";
        }

        if (!this.visible) {
            this.set('dirty', false);
            this.set('recursiveDirty', false);
            return;
        }

        // TextureAtlas has hard reference to this quad so we can just update it directly
        this.quad.drawRect.origin = {
            x: this.position.x - this.anchorPointInPixels.x * this.scaleX,
            y: this.position.y - this.anchorPointInPixels.y * this.scaleY
        };
        this.quad.drawRect.size = {
            width: this.rect.size.width * this.scaleX,
            height: this.rect.size.height * this.scaleY
        };

        this.set('dirty', false);
        this.set('recursiveDirty', false);
    },

    draw: function (ctx) {
        if (!this.quad) {
            return;
        }
        this.get('textureAtlas').drawQuad(ctx, this.quad);
    },

    isFrameDisplayed: function (frame) {
        if (!this.rect || !this.textureAtlas) {
            return false;
        }
        return (frame.texture === this.textureAtlas.texture && geo.rectEqualToRect(frame.rect, this.rect));
    },


    /**
     * @setter displayFrame
     * @type cocos.SpriteFrame
     */
    set_displayFrame: function (frame) {
        if (!frame) {
            delete this.quad;
            return;
        }
        this.set('unflippedOffsetPositionFromCenter', util.copy(frame.offset));


        // change texture
        if (!this.textureAtlas || frame.texture !== this.textureAtlas.texture) {
            this.set('textureAtlas', TextureAtlas.create({texture: frame.texture}));
        }

        this.set('textureRect', {rect: frame.rect, rotated: frame.rotated, untrimmedSize: frame.originalSize});
    }
});

module.exports.Sprite = Sprite;

}};
__resources__["/__builtin__/libs/cocos2d/nodes/TMXLayer.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray FLIP_Y_AXIS*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util'),
    SpriteBatchNode = require('./BatchNode').SpriteBatchNode,
    Sprite = require('./Sprite').Sprite,
    TMXOrientationOrtho = require('../TMXOrientation').TMXOrientationOrtho,
    TMXOrientationHex   = require('../TMXOrientation').TMXOrientationHex,
    TMXOrientationIso   = require('../TMXOrientation').TMXOrientationIso,
    geo    = require('geometry'),
    ccp    = geo.ccp,
    Node = require('./Node').Node;

var TMXLayer = SpriteBatchNode.extend(/** @lends cocos.nodes.TMXLayer# */{
    layerSize: null,
    layerName: '',
    tiles: null,
    tilset: null,
    layerOrientation: 0,
    mapTileSize: null,
    properties: null,

    /** 
     * A tile map layer loaded from a TMX file. This will probably automatically be made by cocos.TMXTiledMap
     *
     * @memberOf cocos.nodes
     * @constructs
     * @extends cocos.nodes.SpriteBatchNode
     *
     * @opt {cocos.TMXTilesetInfo} tilesetInfo
     * @opt {cocos.TMXLayerInfo} layerInfo
     * @opt {cocos.TMXMapInfo} mapInfo
     */
    init: function (opts) {
        var tilesetInfo = opts.tilesetInfo,
            layerInfo = opts.layerInfo,
            mapInfo = opts.mapInfo;

        var size = layerInfo.get('layerSize'),
            totalNumberOfTiles = size.width * size.height;

        var tex = null;
        if (tilesetInfo) {
            tex = tilesetInfo.sourceImage;
        }

        TMXLayer.superclass.init.call(this, {file: tex});

        this.set('anchorPoint', ccp(0, 0));

        this.layerName = layerInfo.get('name');
        this.layerSize = layerInfo.get('layerSize');
        this.tiles = layerInfo.get('tiles');
        this.minGID = layerInfo.get('minGID');
        this.maxGID = layerInfo.get('maxGID');
        this.opacity = layerInfo.get('opacity');
        this.properties = util.copy(layerInfo.properties);

        this.tileset = tilesetInfo;
        this.mapTileSize = mapInfo.get('tileSize');
        this.layerOrientation = mapInfo.get('orientation');

        var offset = this.calculateLayerOffset(layerInfo.get('offset'));
        this.set('position', offset);

        this.set('contentSize', geo.sizeMake(this.layerSize.width * this.mapTileSize.width, (this.layerSize.height * (this.mapTileSize.height - 1)) + this.tileset.tileSize.height));
    },

    calculateLayerOffset: function (pos) {
        var ret = ccp(0, 0);

        switch (this.layerOrientation) {
        case TMXOrientationOrtho:
            ret = ccp(pos.x * this.mapTileSize.width, pos.y * this.mapTileSize.height);
            break;
        case TMXOrientationIso:
            // TODO
            break;
        case TMXOrientationHex:
            // TODO
            break;
        }

        return ret;
    },

    setupTiles: function () {
        this.tileset.bindTo('imageSize', this.get('texture'), 'contentSize');


        for (var y = 0; y < this.layerSize.height; y++) {
            for (var x = 0; x < this.layerSize.width; x++) {
                
                var pos = x + this.layerSize.width * y,
                    gid = this.tiles[pos];
                
                if (gid !== 0) {
                    this.appendTile({gid: gid, position: ccp(x, y)});
                    
                    // Optimization: update min and max GID rendered by the layer
                    this.minGID = Math.min(gid, this.minGID);
                    this.maxGID = Math.max(gid, this.maxGID);
                }
            }
        }
    },
    appendTile: function (opts) {
        var gid = opts.gid,
            pos = opts.position;

        var z = pos.x + pos.y * this.layerSize.width;
            
        var rect = this.tileset.rectForGID(gid);
        var tile = Sprite.create({rect: rect, textureAtlas: this.textureAtlas});
        tile.set('position', this.positionAt(pos));
        tile.set('anchorPoint', ccp(0, 0));
        tile.set('opacity', this.get('opacity'));
        
        this.addChild({child: tile, z: 0, tag: z});
    },
    positionAt: function (pos) {
        switch (this.layerOrientation) {
        case TMXOrientationOrtho:
            return this.positionForOrthoAt(pos);
        case TMXOrientationIso:
            return this.positionForIsoAt(pos);
        /*
        case TMXOrientationHex:
            // TODO
        */
        default:
            return ccp(0, 0);
        }
    },
    positionForOrthoAt: function (pos) {
        var overlap = this.mapTileSize.height - this.tileset.tileSize.height;
        var x = Math.floor(pos.x * this.mapTileSize.width + 0.49);
        var y;
        if (FLIP_Y_AXIS) {
            y = Math.floor((this.get('layerSize').height - pos.y - 1) * this.mapTileSize.height + 0.49);
        } else {
            y = Math.floor(pos.y * this.mapTileSize.height + 0.49) + overlap;
        }
        return ccp(x, y);
    },

    positionForIsoAt: function (pos) {
        var mapTileSize = this.get('mapTileSize'),
            layerSize = this.get('layerSize');

        if (FLIP_Y_AXIS) {
            return ccp(
                mapTileSize.width  / 2 * (layerSize.width + pos.x - pos.y - 1),
                mapTileSize.height / 2 * ((layerSize.height * 2 - pos.x - pos.y) - 2)
            );
        } else {
            throw "Isometric tiles without FLIP_Y_AXIS is currently unsupported";
        }
    },

    /**
     * Get the tile at a specifix tile coordinate
     *
     * @param {geometry.Point} pos Position of tile to get in tile coordinates (not pixels)
     * @returns {cocos.nodes.Sprite} The tile
     */
    tileAt: function (pos) {
        var layerSize = this.get('layerSize'),
            tiles = this.get('tiles');

        if (pos.x < 0 || pos.y < 0 || pos.x >= layerSize.width || pos.y >= layerSize.height) {
            throw "TMX Layer: Invalid position";
        }

        var tile,
            gid = this.tileGIDAt(pos);

        // if GID is 0 then no tile exists at that point
        if (gid) {
            var z = pos.x + pos.y * layerSize.width;
            tile = this.getChild({tag: z});
        }

        return tile;
    },


    tileGID: function (pos) {
        var tilesPerRow = this.get('layerSize').width,
            tilePos = pos.x + (pos.y * tilesPerRow);

        return this.tiles[tilePos];
    },
    tileGIDAt: function (pos) {
        return this.tileGID(pos);
    },

    removeTile: function (pos) {
        var gid = this.tileGID(pos);
        if (gid === 0) {
            // Tile is already blank
            return;
        }

        var tiles = this.get('tiles'),
            tilesPerRow = this.get('layerSize').width,
            tilePos = pos.x + (pos.y * tilesPerRow);


        tiles[tilePos] = 0;

        var sprite = this.getChild({tag: tilePos});
        if (sprite) {
            this.removeChild({child: sprite});
        }
    }
});

exports.TMXLayer = TMXLayer;

}};
__resources__["/__builtin__/libs/cocos2d/nodes/TMXTiledMap.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray console*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util'),
    geo = require('geometry'),
    ccp = geo.ccp,
    Node = require('./Node').Node,
    TMXOrientationOrtho = require('../TMXOrientation').TMXOrientationOrtho,
    TMXOrientationHex   = require('../TMXOrientation').TMXOrientationHex,
    TMXOrientationIso   = require('../TMXOrientation').TMXOrientationIso,
    TMXLayer   = require('./TMXLayer').TMXLayer,
    TMXMapInfo = require('../TMXXMLParser').TMXMapInfo;

var TMXTiledMap = Node.extend(/** @lends cocos.nodes.TMXTiledMap# */{
    mapSize: null,
    tileSize: null,
    mapOrientation: 0,
    objectGroups: null,
    properties: null,
    tileProperties: null,

    /**
     * A TMX Map loaded from a .tmx file
     *
     * @memberOf cocos.nodes
     * @constructs
     * @extends cocos.nodes.Node
     *
     * @opt {String} file The file path of the TMX map to load
     */
    init: function (opts) {
        TMXTiledMap.superclass.init.call(this, opts);

        this.set('anchorPoint', ccp(0, 0));

        var mapInfo = TMXMapInfo.create(opts.file);

        this.mapSize        = mapInfo.get('mapSize');
        this.tileSize       = mapInfo.get('tileSize');
        this.mapOrientation = mapInfo.get('orientation');
        this.objectGroups   = mapInfo.get('objectGroups');
        this.properties     = mapInfo.get('properties');
        this.tileProperties = mapInfo.get('tileProperties');

        // Add layers to map
        var idx = 0;
        util.each(mapInfo.layers, util.callback(this, function (layerInfo) {
            if (layerInfo.get('visible')) {
                var child = this.parseLayer({layerInfo: layerInfo, mapInfo: mapInfo});
                this.addChild({child: child, z: idx, tag: idx});

                var childSize   = child.get('contentSize');
                var currentSize = this.get('contentSize');
                currentSize.width  = Math.max(currentSize.width,  childSize.width);
                currentSize.height = Math.max(currentSize.height, childSize.height);
                this.set('contentSize', currentSize);

                idx++;
            }
        }));
    },
    
    parseLayer: function (opts) {
        var tileset = this.tilesetForLayer(opts);
        var layer = TMXLayer.create({tilesetInfo: tileset, layerInfo: opts.layerInfo, mapInfo: opts.mapInfo});

        layer.setupTiles();

        return layer;
    },

    tilesetForLayer: function (opts) {
        var layerInfo = opts.layerInfo,
            mapInfo = opts.mapInfo,
            size = layerInfo.get('layerSize');

        // Reverse loop
        var tileset;
        for (var i = mapInfo.tilesets.length - 1; i >= 0; i--) {
            tileset = mapInfo.tilesets[i];

            for (var y = 0; y < size.height; y++) {
                for (var x = 0; x < size.width; x++) {
                    var pos = x + size.width * y, 
                        gid = layerInfo.tiles[pos];

                    if (gid !== 0 && gid >= tileset.firstGID) {
                        return tileset;
                    }
                } // for (var x
            } // for (var y
        } // for (var i

        //console.log("cocos2d: Warning: TMX Layer '%s' has no tiles", layerInfo.name);
        return tileset;
    },

    /**
     * Get a layer
     *
     * @opt {String} name The name of the layer to get
     * @returns {cocos.nodes.TMXLayer} The layer requested
     */
    getLayer: function (opts) {
        var layerName = opts.name,
            layer = null;

        this.get('children').forEach(function (item) {
            if (item instanceof TMXLayer && item.layerName == layerName) {
                layer = item;
            }
        });
        if (layer !== null) {
            return layer;
        }
    },
    
    /**
     * Return the ObjectGroup for the secific group
     *
     * @opt {String} name The object group name
     * @returns {cocos.TMXObjectGroup} The object group
     */
    getObjectGroup: function (opts) {
        var objectGroupName = opts.name,
            objectGroup = null;

        this.objectGroups.forEach(function (item) {
            if (item.name == objectGroupName) {
                objectGroup = item;
            }
        });
        if (objectGroup !== null) {
            return objectGroup;
        }
    },

    /**
     * @deprected Since v0.2. You should now use cocos.TMXTiledMap#getObjectGroup.
     */
    objectGroupNamed: function (opts) {
        console.warn('TMXTiledMap#objectGroupNamed is deprected. Use TMXTiledMap#getObjectGroup instread');
        return this.getObjectGroup(opts);
    }
});

exports.TMXTiledMap = TMXTiledMap;


}};
__resources__["/__builtin__/libs/cocos2d/nodes/Transition.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var geo             = require('geometry'),
    util            = require('util'),
    actions         = require('../actions'),
    Scene           = require('./Scene').Scene,
    Director        = require('../Director').Director,
    EventDispatcher = require('../EventDispatcher').EventDispatcher,
    Scheduler       = require('../Scheduler').Scheduler;

/** Orientation Type used by some transitions
 */
var tOrientation = {
    kOrientationLeftOver: 0,
    kOrientationRightOver: 1,
    kOrientationUpOver: 0,
    kOrientationDownOver: 1
};

/**
 */
var TransitionScene = Scene.extend(/** @lends cocos.nodes.TransitionScene */{
    /**
     * Incoming scene
     * @type {cocos.nodes.Scene}
     */
    inScene: null,

    /**
     * Outgoing (current) scene
     * @type {cocos.nodes.Scene}
     */
    outScene: null,

    /**
     * transition duration
     * @type Float
     */
    duration: null,

    inSceneOnTop: null,
    sendCleanupToScene: null,

    /**
     * @class Base class for Transition scenes
     * @memberOf cocos.nodes
     * @extends cocos.nodes.Scene
     * @constructs
     *
     * @opt {Float} duration How long the transition should last
     * @opt {cocos.nodes.Scene} scene Income scene
     */
    init: function (opts) {
        TransitionScene.superclass.init.call(this, opts);

        this.set('duration', opts.duration);
        if (!opts.scene) {
            throw "TransitionScene requires scene property";
        }
        this.set('inScene', opts.scene);
        this.set('outScene', Director.get('sharedDirector')._runningScene);

        if (this.inScene == this.outScene) {
            throw "Incoming scene must be different from the outgoing scene";
        }
        EventDispatcher.get('sharedDispatcher').set('dispatchEvents', false);
        this.sceneOrder();
    },

    /**
     * Called after the transition finishes
     */
    finish: function () {
        var is = this.get('inScene'),
            os = this.get('outScene');

        /* clean up */
        is.set('visible', true);
        is.set('position', geo.PointZero());
        is.set('scale', 1.0);
        is.set('rotation', 0);

        os.set('visible', false);
        os.set('position', geo.PointZero());
        os.set('scale', 1.0);
        os.set('rotation', 0);

        Scheduler.get('sharedScheduler').schedule({
            target: this,
            method: this.setNewScene,
            interval: 0
        });
    },

    /**
     * Used by some transitions to hide the outer scene
     */
    hideOutShowIn: function () {
        this.get('inScene').set('visible', true);
        this.get('outScene').set('visible', false);
    },
    
    setNewScene: function (dt) {
        var dir = Director.get('sharedDirector');
        
        this.unscheduleSelector(this.setNewScene);
        // Save 'send cleanup to scene'
        // Not sure if it's cool to be accessing all these Director privates like this...
        this.set('sendCleanupToScene', dir._sendCleanupToScene);
        
        dir.replaceScene(this.get('inScene'));
        
        // enable events while transitions
        EventDispatcher.get('sharedDispatcher').set('dispatchEvents', true);

        // issue #267 
        this.get('outScene').set('visible', true);
    },

    sceneOrder: function () {
        this.set('inSceneOnTop', true);
    },

    draw: function (context, rect) {
        if (this.get('inSceneOnTop')) {
            this.get('outScene').visit(context, rect);
            this.get('inScene').visit(context, rect);
        } else {
            this.get('inScene').visit(context, rect);
            this.get('outScene').visit(context, rect);
        }
    },
    
    onEnter: function () {
        TransitionScene.superclass.onEnter.call(this);
        this.get('inScene').onEnter();
        // outScene_ should not receive the onEnter callback
    },

    onExit: function () {
        TransitionScene.superclass.onExit.call(this);
        this.get('outScene').onExit();
        // inScene_ should not receive the onExit callback
        // only the onEnterTransitionDidFinish
        if (this.get('inScene').hasOwnProperty('onEnterTransitionDidFinish')) {
            this.get('inScene').onEnterTransitionDidFinish();
        }
    },

    cleanup: function () {
        TransitionScene.superclass.cleanup.call(this);

        if (this.get('sendCleanupToScene')) {
            this.get('outScene').cleanup();
        }
    }
});

/**
 * @class Rotate and zoom out the outgoing scene, and then rotate and zoom in the incoming 
 * @memberOf cocos.nodes
 * @extends cocos.nodes.TransitionScene
 */
var TransitionRotoZoom = TransitionScene.extend(/** @lends cocos.nodes.TransitionRotoZoom */{
    onEnter: function() {
        TransitionRotoZoom.superclass.onEnter.call(this);
        
        var dur = this.get('duration');
        this.get('inScene').set('scale', 0.001);
        this.get('outScene').set('scale', 1.0);
        
        this.get('inScene').set('anchorPoint', geo.ccp(0.5, 0.5));
        this.get('outScene').set('anchorPoint', geo.ccp(0.5, 0.5));
        
        var outzoom = [
            actions.Spawn.initWithActions({actions: [
                actions.ScaleBy.create({scale: 0.001, duration: dur/2}),
                actions.RotateBy.create({angle: 360*2, duration: dur/2})
                ]}),
            actions.DelayTime.create({duration: dur/2})];
        
        // Can't nest sequences or reverse them very easily, so incoming scene actions must be put 
        // together manually for now...
        var inzoom = [
            actions.DelayTime.create({duration: dur/2}),
            
            actions.Spawn.initWithActions({actions: [
                actions.ScaleTo.create({scale: 1.0, duration: dur/2}),
                actions.RotateBy.create({angle: -360*2, duration: dur/2})
                ]}),
            actions.CallFunc.create({
                target: this,
                method: this.finish
            })
        ];
        
        // Sequence init() copies actions
        this.get('outScene').runAction(actions.Sequence.create({actions: outzoom}));
        this.get('inScene').runAction(actions.Sequence.create({actions: inzoom}));
    }
});

/**
 * @class Move in from to the left the incoming scene.
 * @memberOf cocos.nodes
 * @extends cocos.nodes.TransitionScene
 */
var TransitionMoveInL = TransitionScene.extend(/** @lends cocos.nodes.TransitionMoveInL */{
    onEnter: function () {
        TransitionMoveInL.superclass.onEnter.call(this);

        this.initScenes();

        this.get('inScene').runAction(actions.Sequence.create({actions: [
            this.action(),
            actions.CallFunc.create({
                target: this,
                method: this.finish
            })]
        }));
    },
    
    action: function () {
        return actions.MoveTo.create({
            position: geo.ccp(0, 0),
            duration: this.get('duration')
        });
    },
    
    initScenes: function () {
        var s = Director.get('sharedDirector').get('winSize');
        this.get('inScene').set('position', geo.ccp(-s.width, 0));
    }
});
    
/**
 * @class Move in from to the right the incoming scene.
 * @memberOf cocos.nodes
 * @extends cocos.nodes.TransitionMoveInL
 */
var TransitionMoveInR = TransitionMoveInL.extend(/** @lends cocos.nodes.TransitionMoveInR */{
    initScenes: function () {
        var s = Director.get('sharedDirector').get('winSize');
        this.get('inScene').set('position', geo.ccp(s.width, 0));
    }
});

/**
 * @class Move the incoming scene in from the top.
 * @memberOf cocos.nodes
 * @extends cocos.nodes.TransitionMoveInL
 */
var TransitionMoveInT = TransitionMoveInL.extend(/** @lends cocos.nodes.TransitionMoveInT */{
    initScenes: function () {
        var s = Director.get('sharedDirector').get('winSize');
        this.get('inScene').set('position', geo.ccp(0, s.height));
    }
});

/**
 * @class Move the incoming scene in from the bottom.
 * @memberOf cocos.nodes
 * @extends cocos.nodes.TransitionMoveInL
 */
var TransitionMoveInB = TransitionMoveInL.extend(/** @lends cocos.nodes.TransitionMoveInB */{
    initScenes: function () {
        var s = Director.get('sharedDirector').get('winSize');
        this.get('inScene').set('position', geo.ccp(0, -s.height));
    }
});

/**
 * @class Slide in the incoming scene from the left.
 * @memberOf cocos.nodes
 * @extends cocos.nodes.TransitionScene
 */
var TransitionSlideInL = TransitionScene.extend(/** @lends cocos.nodes.TransitionSlideInL */{
    onEnter: function () {
        TransitionSlideInL.superclass.onEnter.call(this);

        this.initScenes();

        var movein = this.action();
        var moveout = this.action();
        var outAction = actions.Sequence.create({
            actions: [
            moveout, 
            actions.CallFunc.create({
                target: this,
                method: this.finish
            })]
        });
        this.get('inScene').runAction(movein);
        this.get('outScene').runAction(outAction);
    },

    sceneOrder: function () {
        this.set('inSceneOnTop', false);
    },

    initScenes: function () {
        var s = Director.get('sharedDirector').get('winSize');
        this.get('inScene').set('position', geo.ccp(-s.width, 0));
    },
    
    action: function () {
        var s = Director.get('sharedDirector').get('winSize');
        return actions.MoveBy.create({
            position: geo.ccp(s.width, 0),
            duration: this.get('duration')
        });
    }
});

/** 
 * @class Slide in the incoming scene from the right.
 * @memberOf cocos.nodes
 * @extends cocos.nodes.TransitionSlideInL
 */
var TransitionSlideInR = TransitionSlideInL.extend(/** @lends cocos.nodes.TransitionSlideInR */{
    sceneOrder: function () {
        this.set('inSceneOnTop', true);
    },

    initScenes: function () {
        var s = Director.get('sharedDirector').get('winSize');
        this.get('inScene').set('position', geo.ccp(s.width, 0));
    },
    
    action: function () {
        var s = Director.get('sharedDirector').get('winSize');
        return actions.MoveBy.create({
            position: geo.ccp(-s.width, 0),
            duration: this.get('duration')
        });
    }
});

/**
 * @class Slide in the incoming scene from the top.
 * @memberOf cocos.nodes
 * @extends cocos.nodes.TransitionSlideInL
 */
var TransitionSlideInT = TransitionSlideInL.extend(/** @lends cocos.nodes.TransitionSlideInT */{
    sceneOrder: function () {
        this.set('inSceneOnTop', false);
    },

    initScenes: function () {
        var s = Director.get('sharedDirector').get('winSize');
        this.get('inScene').set('position', geo.ccp(0, s.height));
    },
    
    action: function () {
        var s = Director.get('sharedDirector').get('winSize');
        return actions.MoveBy.create({
            position: geo.ccp(0, -s.height),
            duration: this.get('duration')
        });
    }
});

/**
 * @class Slide in the incoming scene from the bottom.
 * @memberOf cocos.nodes
 * @extends cocos.nodes.TransitionSlideInL
 */
var TransitionSlideInB = TransitionSlideInL.extend(/** @lends cocos.nodes.TransitionSlideInB */{
    sceneOrder: function () {
        this.set('inSceneOnTop', true);
    },

    initScenes: function () {
        var s = Director.get('sharedDirector').get('winSize');
        this.get('inScene').set('position', geo.ccp(0, -s.height));
    },
    
    action: function () {
        var s = Director.get('sharedDirector').get('winSize');
        return actions.MoveBy.create({
            position: geo.ccp(0, s.height),
            duration: this.get('duration')
        });
    }
});

exports.TransitionScene = TransitionScene;
exports.TransitionRotoZoom = TransitionRotoZoom;
exports.TransitionMoveInL = TransitionMoveInL;
exports.TransitionMoveInR = TransitionMoveInR;
exports.TransitionMoveInT = TransitionMoveInT;
exports.TransitionMoveInB = TransitionMoveInB;
exports.TransitionSlideInL = TransitionSlideInL;
exports.TransitionSlideInR = TransitionSlideInR;
exports.TransitionSlideInT = TransitionSlideInT;
exports.TransitionSlideInB = TransitionSlideInB;

}};
__resources__["/__builtin__/libs/cocos2d/Preloader.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util'),
    events = require('events');

var Preloader = BObject.extend(/** @lends cocos.Preloader# */{
    /**
     * Total number of resources.
     * @type Integer
     */
    count: -1,

    /**
     * Number of resources that have finished loading
     * @type Integer
     */
    loaded: 0,

    _listeners: null,

    /**
     * @class Preloads all remote resources
     * @memberOf cocos
     * @extends BObject
     * @constructs
     */
    init: function (opts) {
        Preloader.superclass.init.call(this, opts);

        this._listeners = {};
        this.set('count', Object.keys(__remote_resources__).length);
    },

    load: function() {
        this.set('loaded', 0);
        this.set('count', Object.keys(__remote_resources__).length);

        for (var uri in __remote_resources__) {
            if (__remote_resources__.hasOwnProperty(uri)) {
                if (__resources__[uri]) {
                    // Already loaded
                    this.didLoadResource(uri);
                    continue;
                }
                var file = resource(uri);

                // Notify when a resource has loaded
                this._listeners[uri] = events.addListener(file, 'load', util.callback(this, (function(uri) {
                    return function () { this.didLoadResource(uri); };
                })(uri)));

                file.load()
            }
        }
    },
    
    didLoadResource: function(uri) {
        this.set('loaded', this.get('loaded') +1);
        if (this._listeners[uri]) {
            events.removeListener(this._listeners[uri]);
        }
        events.trigger(this, 'load', uri, this);

        if (this.get('loaded') >= this.get('count')) {
            events.trigger(this, 'complete', this);
        }
    }
});

exports.Preloader = Preloader;

}};
__resources__["/__builtin__/libs/cocos2d/RemoteImage.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
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

            var r = __remote_resources__[path];
            __resources__[path] = util.copy(r);
            __resources__[path].data = img;
            __resources__[path].meta.remote = true;

            events.trigger(self, 'load', self);
        };
        
        img.src = this.get('url');

        return img;
    }
});

exports.RemoteImage = RemoteImage;

}};
__resources__["/__builtin__/libs/cocos2d/RemoteResource.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
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
        var self = this;

        $.ajax({
            url: this.get('url'),
            success: function (data) {
                var path = self.get('path');
                
                var r = __remote_resources__[path];
                __resources__[path] = util.copy(r);
                __resources__[path].data = data;
                __resources__[path].meta.remote = true;

                events.trigger(self, 'load', self);
            },
            error: function(jqXHR, textStatus, errorThrown) {
                events.trigger(self, 'fail', textStatus, errorThrown);
            }
        });
    }
});


exports.RemoteResource = RemoteResource;

}};
__resources__["/__builtin__/libs/cocos2d/resources/progress-bar-empty.png"] = {meta: {mimetype: "image/png"}, data: __imageResource("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAARAAAAAgCAYAAADaBycMAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAwRJREFUeNrsnbFLW1EUxm9cpP0HLDgUC4JDhoJuOggdBYcg7Sw4BSl0K0inItSpUMSp4NxSHAqOBQfdInTIIAQMDoX4D7TNlJ6PnGtOg76mwUXf7wcf5N28LAfy8d6593630uv10ojMmhZNC6aqacY0ZZpMAHBX6ZouTW1T09QwnZhao/y4MoKBLJtqplXTY+oNcO+5MH01HZiOxjWQJ6YN07rpETUFKB0d077po+n8fwzkmemVaSWM6cZvpmPTqenM9MO/+0WtAe4kD0zTpjnTvGnJ//+VcM+h6b3///9pIHpVeZP6vY7MZ9Mnf6QBgPuNWhYvTM/DmHojb/3V5kYDkfO8C+ahx5Zd017qN1sAoBxocqRu2kz9dkY2kdfxSSQaiG76EF5bvpu2TV+oJUBpWTNtmZ6G15mX/nCRJsKNG8E8zjEPAHAP2E6DJuqKe0WKBrKc+rMtmV3MAwCCieyG63X3jCsDUdMkT9WqYbpHzQAgsOfekNwratlAtMJ01b9QQ0SzLTRMASDSdW/ITVN5xqwMRMvT8wpTdVeZqgWA6zhIgxkYecaiDCSu9zimRgBQQPSIBRlINQycUh8AKCB6RFUGMhMGzqgPABQQPWJGC8l+p8GW/IeJfS0AcDPaO/PTP3cnqAcAjIsM5DJcT1MSACggesSlDKQdBuaoDwAUED2iLQNphoF56gMABUSPaMpAGmFgifoAQAHRIxoyEAWoXviA8kBq1AgArqHmHpHcM05kIEpfzilDijFTEhFJ6wAQmXRvyFGH8oxWnsbVGveOf1aMWZ16AUCgngYRhx33jKvt/Eepn76cUYzZGjUDAPeCzXC9757xVyKZotsP/bPiDbcwEQDMw70g56IeulekYQNRZJmi2/OsjDIQd1L/eAd6IgDlYtL/+ztpkIfacI+4OiOGYx0AYJixj3XIcLAUQDm49YOlMhxtCVBuxj7aMrKcOFwboEzcyuHawyh8Wfmp6o0oxUxBRFOJBivAXUZhydqRr0212henXodWp7dG+fEfAQYAt2e24R/QqdsAAAAASUVORK5CYII=")};
__resources__["/__builtin__/libs/cocos2d/resources/progress-bar-full.png"] = {meta: {mimetype: "image/png"}, data: __imageResource("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAARAAAAAgCAYAAADaBycMAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA5lJREFUeNrsnT9IlVEYxo8uUdTSYmAQBoKDQ6KTf0BocAgcLpKrgjSIBC1mRVNU6hKEOISgaxENQUNDIKh3UmxwEARFKNClpaicbs/D9x6/t4vR9eJy73l+8MDx3O9zeOE8nO8957ynoVQqhQpphXqgLqgdaoGaoHNBCFGrHEGH0B60Ba1Da9BOJS83VGAg/VABGoSuKd5C1D370HvoHbRcrYFch8agUeiKYipEchxAi9ACtHsaA7kJ3YNuuT4++AlahTagbeir/fZLsRaiJjkPNUNtUCfUa+O/wT3zAXph4/+/BsJPlcchy3VE3kCvbUojhKhvmLIYhm67PuZGntinzT8NhM4z7cyD05Y5aD5kyRYhRBpwcWQcmghZOiOayJSfiXgD4UMv3WfLZ+gp9Nb906vQANQHddg7FxVrIWqWHzZR2IRWoI/QF/f7EPQIuuE+Z+7aO38ZyDPogZt53Hfmwe8hJlRHoG7FXIi6pQgthSxxWnImMuNmIs+hh2w0Wkd/yFZbInPOPC7bZ80rmYcQdU+3jfVpG/vBvGDOPTNqnnFsIEyaxKVaJkzn3cyDM5FJxVWIpJi0sR9XY+bNG4J5RSEaCHeYDtoPnLJwtSUmTMdkHkIkbSJj1j4yb4ifNfSMVhoIt6fHHabMrsalWiZMRxRDIZJmxLwgmDfEFRh6Rg8NxO/3WHXtgaCchxCp021ecJJHdNFA2l3Hhmv3KXZCiDIv8B7RTgNpcR3brt2huAkhyrzAe0QL94H8DvmR/AshP9fyPWiTmBAi22x2ydo8O/PT2keNio0QolpoIIfu72bX3lV4hBBlXuA94pAGsuc62lx7U3ETQpR5gfeIPRrIluvodO0VxU0IUeYF3iO2aCDrrqPXtXkqr6jYCZE0RfOCkzxinQbCAqr71sF6IAVr80jvkuInRNIshfx4f8E8IphnrNFAWH05VhniwRlWIorLujzSO6sYCpEks+YBwTxhOOSH6+gZO3EZl3vcD6zNMmbj1ubBmRmZiBBJmsdMyA/PjYe8xOGBecbxcf7lkFVfjrCM2ZC1v4WsjNmdoJyIEPVO0cb6lI39YF4w4Z5ZNM9QSUMhEufMShoSFVUWQpBTF1WO6FoHIdKm6msd/ExEF0sJUf+c+cVSEV1tKUTaVH21pac/6HJtIVLiTC7XLofFl1k/lbkRVjFjIaKmkG86E0LUHlwc4Yl8HqrluTjmOrg7faeSl/8IMABgRvK9Q/ireQAAAABJRU5ErkJggg==")};
__resources__["/__builtin__/libs/cocos2d/Scheduler.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util');

/** @ignore */
function HashUpdateEntry() {
    this.timers = [];
    this.timerIndex = 0;
    this.currentTimer = null;
    this.currentTimerSalvaged = false;
    this.paused = false;
}

/** @ignore */
function HashMethodEntry() {
    this.timers = [];
    this.timerIndex = 0;
    this.currentTimer = null;
    this.currentTimerSalvaged = false;
    this.paused = false;
}

var Timer = BObject.extend(/** @lends cocos.Timer# */{
    callback: null,
    interval: 0,
    elapsed: -1,

    /**
     * Runs a function repeatedly at a fixed interval
     *
     * @memberOf cocos
     * @constructs
     * @extends BObject
     *
     * @opt {Function} callback The function to run at each interval
     * @opt {Float} interval Number of milliseconds to wait between each exectuion of callback
     */
    init: function (opts) {
        Timer.superclass.init(this, opts);

        this.set('callback', opts.callback);
        this.set('interval', opts.interval || 0);
        this.set('elapsed', -1);
    },

    /**
     * @private
     */
    update: function (dt) {
        if (this.elapsed == -1) {
            this.elapsed = 0;
        } else {
            this.elapsed += dt;
        }

        if (this.elapsed >= this.interval) {
            this.callback(this.elapsed);
            this.elapsed = 0;
        }
    }
});


var Scheduler = BObject.extend(/** @lends cocos.Scheduler# */{
    updates0: null,
    updatesNeg: null,
    updatesPos: null,
    hashForUpdates: null,
    hashForMethods: null,
    timeScale: 1.0,

    /**
     * Runs the timers
     *
     * @memberOf cocos
     * @constructs
     * @extends BObject
     * @singleton
     * @private
     */
    init: function () {
        this.updates0 = [];
        this.updatesNeg = [];
        this.updatesPos = [];
        this.hashForUpdates = {};
        this.hashForMethods = {};
    },

    /**
     * The scheduled method will be called every 'interval' seconds.
     * If paused is YES, then it won't be called until it is resumed.
     * If 'interval' is 0, it will be called every frame, but if so, it recommened to use 'scheduleUpdateForTarget:' instead.
     * If the selector is already scheduled, then only the interval parameter will be updated without re-scheduling it again.
     */
    schedule: function (opts) {
        var target   = opts.target,
            method   = opts.method,
            interval = opts.interval,
            paused   = opts.paused || false;

        var element = this.hashForMethods[target.get('id')];

        if (!element) {
            element = new HashMethodEntry();
            this.hashForMethods[target.get('id')] = element;
            element.target = target;
            element.paused = paused;
        } else if (element.paused != paused) {
            throw "cocos.Scheduler. Trying to schedule a method with a pause value different than the target";
        }

        var timer = Timer.create({callback: util.callback(target, method), interval: interval});
        element.timers.push(timer);
    },

    /**
     * Schedules the 'update' selector for a given target with a given priority.
     * The 'update' selector will be called every frame.
     * The lower the priority, the earlier it is called.
     */
    scheduleUpdate: function (opts) {
        var target   = opts.target,
            priority = opts.priority,
            paused   = opts.paused;

        var i, len;
        var entry = {target: target, priority: priority, paused: paused};
        var added = false;

        if (priority === 0) {
            this.updates0.push(entry);
        } else if (priority < 0) {
            for (i = 0, len = this.updatesNeg.length; i < len; i++) {
                if (priority < this.updatesNeg[i].priority) {
                    this.updatesNeg.splice(i, 0, entry);
                    added = true;
                    break;
                }
            }

            if (!added) {
                this.updatesNeg.push(entry);
            }
        } else /* priority > 0 */{
            for (i = 0, len = this.updatesPos.length; i < len; i++) {
                if (priority < this.updatesPos[i].priority) {
                    this.updatesPos.splice(i, 0, entry);
                    added = true;
                    break;
                }
            }

            if (!added) {
                this.updatesPos.push(entry);
            }
        }

        this.hashForUpdates[target.get('id')] = entry;
    },

    /**
     * 'tick' the scheduler.
     * You should NEVER call this method, unless you know what you are doing.
     */
    tick: function (dt) {
        var i, len, x;
        if (this.timeScale != 1.0) {
            dt *= this.timeScale;
        }

        var entry;
        for (i = 0, len = this.updatesNeg.length; i < len; i++) {
            entry = this.updatesNeg[i];
            if (entry && !entry.paused) {
                entry.target.update(dt);
            }
        }

        for (i = 0, len = this.updates0.length; i < len; i++) {
            entry = this.updates0[i];
            if (entry && !entry.paused) {
                entry.target.update(dt);
            }
        }

        for (i = 0, len = this.updatesPos.length; i < len; i++) {
            entry = this.updatesPos[i];
            if (entry && !entry.paused) {
                entry.target.update(dt);
            }
        }

        for (x in this.hashForMethods) {
            if (this.hashForMethods.hasOwnProperty(x)) {
                entry = this.hashForMethods[x];

                if (entry) {
                    for (i = 0, len = entry.timers.length; i < len; i++) {
                        var timer = entry.timers[i];
                        if (timer) {
                            timer.update(dt);
                        }
                    }
                }
            }
        }

    },

    /**
     * Unshedules a selector for a given target.
     * If you want to unschedule the "update", use unscheduleUpdateForTarget.
     */
    unschedule: function (opts) {
        if (!opts.target || !opts.method) {
            return;
        }
        var element = this.hashForMethods[opts.target.get('id')];
        if (element) {
            for (var i=0; i<element.timers.length; i++) {
                // Compare callback function
                if (element.timers[i].callback == util.callback(opts.target, opts.method)) {
                    var timer = element.timers.splice(i, 1);
                    timer = null;
                }
            }
        }
    },

    /**
     * Unschedules the update selector for a given target
     */
    unscheduleUpdateForTarget: function (target) {
        if (!target) {
            return;
        }
        var id = target.get('id'),
            elementUpdate = this.hashForUpdates[id];
        if (elementUpdate) {
            // Remove from updates list
            if (elementUpdate.priority === 0) {
                this.updates0.splice(this.updates0.indexOf(elementUpdate), 1);
            } else if (elementUpdate.priority < 0) {
                this.updatesNeg.splice(this.updatesNeg.indexOf(elementUpdate), 1);
            } else /* priority > 0 */{
                this.updatesPos.splice(this.updatesPos.indexOf(elementUpdate), 1);
            }
        }
        // Release HashMethodEntry object
        this.hashForUpdates[id] = null;
    },

    /**
     * Unschedules all selectors from all targets.
     * You should NEVER call this method, unless you know what you are doing.
     */
    unscheduleAllSelectors: function () {
        var i, x, entry;

        // Custom selectors
        for (x in this.hashForMethods) {
            if (this.hashForMethods.hasOwnProperty(x)) {
                entry = this.hashForMethods[x];
                this.unscheduleAllSelectorsForTarget(entry.target);
            }
        }
        // Updates selectors
        for (i = 0, len = this.updatesNeg.length; i < len; i++) {
            entry = this.updatesNeg[i];
            if (entry) {
                this.unscheduleUpdateForTarget(entry.target);
            }
        }

        for (i = 0, len = this.updates0.length; i < len; i++) {
            entry = this.updates0[i];
            if (entry) {
                this.unscheduleUpdateForTarget(entry.target);
            }
        }

        for (i = 0, len = this.updatesPos.length; i < len; i++) {
            entry = this.updatesPos[i];
            if (entry) {
                this.unscheduleUpdateForTarget(entry.target);
            }
        }
    },

    /**
     * Unschedules all selectors for a given target.
     * This also includes the "update" selector.
     */
    unscheduleAllSelectorsForTarget: function (target) {
        if (!target) {
            return;
        }
        // Custom selector
        var element = this.hashForMethods[target.get('id')];
        if (element) {
            element.paused = true;
            element.timers = []; // Clear all timers
        }
        // Release HashMethodEntry object
        this.hashForMethods[target.get('id')] = null;

        // Update selector
        this.unscheduleUpdateForTarget(target);
    },

    /**
     * Pauses the target.
     * All scheduled selectors/update for a given target won't be 'ticked' until the target is resumed.
     * If the target is not present, nothing happens.
     */

    pauseTarget: function (target) {
        var element = this.hashForMethods[target.get('id')];
        if (element) {
            element.paused = true;
        }

        var elementUpdate = this.hashForUpdates[target.get('id')];
        if (elementUpdate) {
            elementUpdate.paused = true;
        }
    },

    /**
     * Resumes the target.
     * The 'target' will be unpaused, so all schedule selectors/update will be 'ticked' again.
     * If the target is not present, nothing happens.
     */

    resumeTarget: function (target) {
        var element = this.hashForMethods[target.get('id')];
        if (element) {
            element.paused = false;
        }

        var elementUpdate = this.hashForUpdates[target.get('id')];
        //console.log('foo', target.get('id'), elementUpdate);
        if (elementUpdate) {
            elementUpdate.paused = false;
        }
    }
});

util.extend(Scheduler, /** @lends cocos.Scheduler */{
    /**
     * A shared singleton instance of cocos.Scheduler
     * @getter sharedScheduler 
     * @type cocos.Scheduler
     */
    get_sharedScheduler: function (key) {
        if (!this._instance) {
            this._instance = this.create();
        }

        return this._instance;
    }
});

exports.Timer = Timer;
exports.Scheduler = Scheduler;

}};
__resources__["/__builtin__/libs/cocos2d/SpriteFrame.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util'),
    geo = require('geometry'),
    ccp = geo.ccp;

var SpriteFrame = BObject.extend(/** @lends cocos.SpriteFrame# */{
    rect: null,
    rotated: false,
    offset: null,
    originalSize: null,
    texture: null,

    /**
     * Represents a single frame of animation for a cocos.Sprite
     *
     * <p>A SpriteFrame has:<br>
     * - texture: A Texture2D that will be used by the Sprite<br>
     * - rectangle: A rectangle of the texture</p>
     *
     * <p>You can modify the frame of a Sprite by doing:</p>
     * 
     * <code>var frame = SpriteFrame.create({texture: texture, rect: rect});
     * sprite.set('displayFrame', frame);</code>
     *
     * @memberOf cocos
     * @constructs
     * @extends BObject
     *
     * @opt {cocos.Texture2D} texture The texture to draw this frame using
     * @opt {geometry.Rect} rect The rectangle inside the texture to draw
     */
    init: function (opts) {
        SpriteFrame.superclass.init(this, opts);

        this.texture      = opts.texture;
        this.rect         = opts.rect;
        this.rotated      = !!opts.rotate;
        this.offset       = opts.offset || ccp(0, 0);
        this.originalSize = opts.originalSize || util.copy(this.rect.size);
    },

    /**
     * @ignore
     */
    toString: function () {
        return "[object SpriteFrame | TextureName=" + this.texture.get('name') + ", Rect = (" + this.rect.origin.x + ", " + this.rect.origin.y + ", " + this.rect.size.width + ", " + this.rect.size.height + ")]";
    },

    /**
     * Make a copy of this frame
     *
     * @returns {cocos.SpriteFrame} Exact copy of this object
     */
    copy: function () {
        return SpriteFrame.create({rect: this.rect, rotated: this.rotated, offset: this.offset, originalSize: this.originalSize, texture: this.texture});
    }

});

exports.SpriteFrame = SpriteFrame;

}};
__resources__["/__builtin__/libs/cocos2d/SpriteFrameCache.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray FLIP_Y_AXIS*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util'),
    geo = require('geometry'),
    Plist = require('Plist').Plist,
    SpriteFrame = require('./SpriteFrame').SpriteFrame,
    Texture2D = require('./Texture2D').Texture2D;

var SpriteFrameCache = BObject.extend(/** @lends cocos.SpriteFrameCache# */{
    /**
     * List of sprite frames
     * @type Object
     */
    spriteFrames: null,

    /**
     * List of sprite frame aliases
     * @type Object
     */
    spriteFrameAliases: null,


    /**
     * @memberOf cocos
     * @extends BObject
     * @constructs
     * @singleton
     */
    init: function () {
        SpriteFrameCache.superclass.init.call(this);

        this.set('spriteFrames', {});
        this.set('spriteFrameAliases', {});
    },

    /**
     * Add SpriteFrame(s) to the cache
     *
     * @param {String} opts.file The filename of a Zwoptex .plist containing the frame definiitons.
     */
    addSpriteFrames: function (opts) {
        var plistPath = opts.file,
            plist = Plist.create({file: plistPath}),
            plistData = plist.get('data');


        var metaDataDict = plistData.metadata,
            framesDict = plistData.frames;

        var format = 0,
            texturePath = null;

        if (metaDataDict) {
            format = metaDataDict.format;
            // Get texture path from meta data
            texturePath = metaDataDict.textureFileName;
        }

        if (!texturePath) {
            // No texture path so assuming it's the same name as the .plist but ending in .png
            texturePath = plistPath.replace(/\.plist$/i, '.png');
        }


        var texture = Texture2D.create({file: texturePath});

        // Add frames
        for (var frameDictKey in framesDict) {
            if (framesDict.hasOwnProperty(frameDictKey)) {
                var frameDict = framesDict[frameDictKey],
                    spriteFrame = null;

                switch (format) {
                case 0:
                    var x = frameDict.x,
                        y =  frameDict.y,
                        w =  frameDict.width,
                        h =  frameDict.height,
                        ox = frameDict.offsetX,
                        oy = frameDict.offsetY,
                        ow = frameDict.originalWidth,
                        oh = frameDict.originalHeight;

                    // check ow/oh
                    if (!ow || !oh) {
                        //console.log("cocos2d: WARNING: originalWidth/Height not found on the CCSpriteFrame. AnchorPoint won't work as expected. Regenerate the .plist");
                    }

                    if (FLIP_Y_AXIS) {
                        oy *= -1;
                    }

                    // abs ow/oh
                    ow = Math.abs(ow);
                    oh = Math.abs(oh);

                    // create frame
                    spriteFrame = SpriteFrame.create({texture: texture,
                                                         rect: geo.rectMake(x, y, w, h),
                                                       rotate: false,
                                                       offset: geo.ccp(ox, oy),
                                                 originalSize: geo.sizeMake(ow, oh)});
                    break;

                case 1:
                case 2:
                    var frame      = geo.rectFromString(frameDict.frame),
                        rotated    = !!frameDict.rotated,
                        offset     = geo.pointFromString(frameDict.offset),
                        sourceSize = geo.sizeFromString(frameDict.sourceSize);

                    if (FLIP_Y_AXIS) {
                        offset.y *= -1;
                    }


                    // create frame
                    spriteFrame = SpriteFrame.create({texture: texture,
                                                         rect: frame,
                                                       rotate: rotated,
                                                       offset: offset,
                                                 originalSize: sourceSize});
                    break;

                case 3:
                    var spriteSize       = geo.sizeFromString(frameDict.spriteSize),
                        spriteOffset     = geo.pointFromString(frameDict.spriteOffset),
                        spriteSourceSize = geo.sizeFromString(frameDict.spriteSourceSize),
                        textureRect      = geo.rectFromString(frameDict.textureRect),
                        textureRotated   = frameDict.textureRotated;
                    

                    if (FLIP_Y_AXIS) {
                        spriteOffset.y *= -1;
                    }

                    // get aliases
                    var aliases = frameDict.aliases;
                    for (var i = 0, len = aliases.length; i < len; i++) {
                        var alias = aliases[i];
                        this.get('spriteFrameAliases')[frameDictKey] = alias;
                    }
                    
                    // create frame
                    spriteFrame = SpriteFrame.create({texture: texture,
                                                         rect: geo.rectMake(textureRect.origin.x, textureRect.origin.y, spriteSize.width, spriteSize.height),
                                                       rotate: textureRotated,
                                                       offset: spriteOffset,
                                                 originalSize: spriteSourceSize});
                    break;

                default:
                    throw "Unsupported Zwoptex format: " + format;
                }

                // Add sprite frame
                this.get('spriteFrames')[frameDictKey] = spriteFrame;
            }
        }
    },

    /**
     * Get a single SpriteFrame
     *
     * @param {String} opts.name The name of the sprite frame
     * @returns {cocos.SpriteFrame} The sprite frame
     */
    getSpriteFrame: function (opts) {
        var name = opts.name;

        var frame = this.get('spriteFrames')[name];

        if (!frame) {
            // No frame, look for an alias
            var key = this.get('spriteFrameAliases')[name];

            if (key) {
                frame = this.get('spriteFrames')[key];
            }

            if (!frame) {
                throw "Unable to find frame: " + name;
            }
        }

        return frame;
    }
});

/**
 * Class methods
 */
util.extend(SpriteFrameCache, /** @lends cocos.SpriteFrameCache */{
    /**
     * @field
     * @name cocos.SpriteFrameCache.sharedSpriteFrameCache
     * @type cocos.SpriteFrameCache
     */
    get_sharedSpriteFrameCache: function (key) {
        if (!this._instance) {
            this._instance = this.create();
        }

        return this._instance;
    }
});

exports.SpriteFrameCache = SpriteFrameCache;

}};
__resources__["/__builtin__/libs/cocos2d/Texture2D.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util'),
    events = require('events'),
    RemoteResource = require('./RemoteResource').RemoteResource;

var Texture2D = BObject.extend(/** @lends cocos.Texture2D# */{
    imgElement: null,
    size: null,
    name: null,
    isLoaded: false,

    /**
     * @memberOf cocos
     * @constructs
     * @extends BObject
     *
     * @opt {String} [file] The file path of the image to use as a texture
     * @opt {Texture2D|HTMLImageElement} [data] Image data to read from
     */
    init: function (opts) {
        var file = opts.file,
            data = opts.data,
            texture = opts.texture;

        if (file) {
            this.name = file;
            data = resource(file);
        } else if (texture) {
            this.name = texture.get('name');
            data = texture.get('imgElement');
        }

        this.size = {width: 0, height: 0};

        if (data instanceof RemoteResource) {
            events.addListener(data, 'load', util.callback(this, this.dataDidLoad));
            this.set('imgElement', data.load());
        } else {
            this.set('imgElement', data);
            this.dataDidLoad(data);
        }
    },

    dataDidLoad: function (data) {
        this.isLoaded = true;
        this.set('size', {width: this.imgElement.width, height: this.imgElement.height});
        events.trigger(self, 'load', self);
    },

    drawAtPoint: function (ctx, point) {
        if (!this.isLoaded) {
            return;
        }
        ctx.drawImage(this.imgElement, point.x, point.y);
    },
    drawInRect: function (ctx, rect) {
        if (!this.isLoaded) {
            return;
        }
        ctx.drawImage(this.imgElement,
            rect.origin.x, rect.origin.y,
            rect.size.width, rect.size.height
        );
    },

    /**
     * @getter data
     * @type {String} Base64 encoded image data
     */
    get_data: function () {
        return this.imgElement ? this.imgElement.src : null;
    },

    /**
     * @getter contentSize
     * @type {geometry.Size} Size of the texture
     */
    get_contentSize: function () {
        return this.size;
    },

    get_pixelsWide: function () {
        return this.size.width;
    },

    get_pixelsHigh: function () {
        return this.size.height;
    }
});

exports.Texture2D = Texture2D;

}};
__resources__["/__builtin__/libs/cocos2d/TextureAtlas.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray FLIP_Y_AXIS*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util'),
    Texture2D = require('./Texture2D').Texture2D;


/* QUAD STRUCTURE
 quad = {
     drawRect: <rect>, // Where the quad is drawn to
     textureRect: <rect>  // The slice of the texture to draw in drawRect
 }
*/

var TextureAtlas = BObject.extend(/** @lends cocos.TextureAtlas# */{
    quads: null,
    imgElement: null,
    texture: null,

    /**
     * A single texture that can represent lots of smaller images
     *
     * @memberOf cocos
     * @constructs
     * @extends BObject
     *
     * @opt {String} file The file path of the image to use as a texture
     * @opt {Texture2D|HTMLImageElement} [data] Image data to read from
     * @opt {CanvasElement} [canvas] A canvas to use as a texture
     */
    init: function (opts) {
        var file = opts.file,
            data = opts.data,
            texture = opts.texture,
            canvas = opts.canvas;

        if (canvas) {
            // If we've been given a canvas element then we'll use that for our image
            this.imgElement = canvas;
        } else {
            texture = Texture2D.create({texture: texture, file: file, data: data});
            this.set('texture', texture);
            this.imgElement = texture.get('imgElement');
        }

        this.quads = [];
    },

    insertQuad: function (opts) {
        var quad = opts.quad,
            index = opts.index || 0;

        this.quads.splice(index, 0, quad);
    },
    removeQuad: function (opts) {
        var index = opts.index;

        this.quads.splice(index, 1);
    },


    drawQuads: function (ctx) {
        util.each(this.quads, util.callback(this, function (quad) {
            if (!quad) {
                return;
            }

            this.drawQuad(ctx, quad);
        }));
    },

    drawQuad: function (ctx, quad) {
        var sx = quad.textureRect.origin.x,
            sy = quad.textureRect.origin.y,
            sw = quad.textureRect.size.width, 
            sh = quad.textureRect.size.height;

        var dx = quad.drawRect.origin.x,
            dy = quad.drawRect.origin.y,
            dw = quad.drawRect.size.width, 
            dh = quad.drawRect.size.height;


        var scaleX = 1;
        var scaleY = 1;

        if (FLIP_Y_AXIS) {
            dy -= dh;
            dh *= -1;
        }

            
        if (dw < 0) {
            dw *= -1;
            scaleX = -1;
        }
            
        if (dh < 0) {
            dh *= -1;
            scaleY = -1;
        }

        ctx.scale(scaleX, scaleY);

        var img = this.get('imgElement');
        ctx.drawImage(img, 
            sx, sy, // Draw slice from x,y
            sw, sh, // Draw slice size
            dx, dy, // Draw at 0, 0
            dw, dh  // Draw size
        );
        ctx.scale(1, 1);
    }
});

exports.TextureAtlas = TextureAtlas;

}};
__resources__["/__builtin__/libs/cocos2d/TMXOrientation.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

/**
 * @memberOf cocos
 * @namespace
 */
var TMXOrientation = /** @lends cocos.TMXOrientation */{
    /**
     * Orthogonal orientation
     * @constant
     */
    TMXOrientationOrtho: 1,

    /**
     * Hexagonal orientation
     * @constant
     */
    TMXOrientationHex: 2,

    /**
     * Isometric orientation
     * @constant
     */
    TMXOrientationIso: 3
};

module.exports = TMXOrientation;

}};
__resources__["/__builtin__/libs/cocos2d/TMXXMLParser.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray DOMParser console*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util'),
    path = require('path'),
    ccp = require('geometry').ccp,
    base64 = require('base64'),
    gzip   = require('gzip'),
    TMXOrientationOrtho = require('./TMXOrientation').TMXOrientationOrtho,
    TMXOrientationHex = require('./TMXOrientation').TMXOrientationHex,
    TMXOrientationIso = require('./TMXOrientation').TMXOrientationIso;

var TMXTilesetInfo = BObject.extend(/** @lends cocos.TMXTilesetInfo# */{
    name: '',
    firstGID: 0,
    tileSize: null,
    spacing: 0,
    margin: 0,
    sourceImage: null,

    /**
     * @memberOf cocos
     * @constructs
     * @extends BObject
     */
    init: function () {
        TMXTilesetInfo.superclass.init.call(this);
    },

    rectForGID: function (gid) {
        var rect = {size: {}, origin: ccp(0, 0)};
        rect.size = util.copy(this.tileSize);
        
        gid = gid - this.firstGID;

        var imgSize = this.get('imageSize');
        
        var maxX = Math.floor((imgSize.width - this.margin * 2 + this.spacing) / (this.tileSize.width + this.spacing));
        
        rect.origin.x = (gid % maxX) * (this.tileSize.width + this.spacing) + this.margin;
        rect.origin.y = Math.floor(gid / maxX) * (this.tileSize.height + this.spacing) + this.margin;
        
        return rect;
    }
});

var TMXLayerInfo = BObject.extend(/** @lends cocos.TMXLayerInfo# */{
    name: '',
    layerSize: null,
    tiles: null,
    visible: true,
    opacity: 255,
    minGID: 100000,
    maxGID: 0,
    properties: null,
    offset: null,

    /**
     * @memberOf cocos
     * @constructs
     * @extends BObject
     */
    init: function () {
        TMXLayerInfo.superclass.init.call(this);

        this.properties = {};
        this.offset = ccp(0, 0);
    }
});

var TMXObjectGroup = BObject.extend(/** @lends cocos.TMXObjectGroup# */{
    name: '',
    properties: null,
    offset: null,
    objects: null,

    /**
     * @memberOf cocos
     * @constructs
     * @extends BObject
     */
    init: function () {
        TMXObjectGroup.superclass.init.call(this);

        this.properties = {};
        this.objects = {};
        this.offset = ccp(0, 0);
    },

    /**
     * Get the value for the specific property name
     *
     * @opt {String} name Property name
     * @returns {String} Property value
     */
    getProperty: function (opts) {
        var propertyName = opts.name;
        return this.properties[propertyName];
    },

    /**
     * @deprected Since v0.2. You should now use cocos.TMXObjectGroup#getProperty
     */
    propertyNamed: function (opts) {
        console.warn('TMXObjectGroup#propertyNamed is deprected. Use TMXTiledMap#getProperty instread');
        return this.getProperty(opts);
    },

    /**
     * Get the object for the specific object name. It will return the 1st
     * object found on the array for the given name.
     *
     * @opt {String} name Object name
     * @returns {Object} Object
     */
    getObject: function (opts) {
        var objectName = opts.name;
        var object = null;
        
        this.objects.forEach(function (item) {
            if (item.name == objectName) {
                object = item;
            }
        });
        if (object !== null) {
            return object;
        }
    },

    /**
     * @deprected Since v0.2. You should now use cocos.TMXObjectGroup#getProperty
     */
    objectNamed: function (opts) {
        console.warn('TMXObjectGroup#objectNamed is deprected. Use TMXObjectGroup#getObject instread');
        return this.getObject(opts);
    }
});

var TMXMapInfo = BObject.extend(/** @lends cocos.TMXMapInfo# */{
    filename: '',
    orientation: 0,
    mapSize: null,
    tileSize: null,
    layer: null,
    tilesets: null,
    objectGroups: null,
    properties: null,
    tileProperties: null,

    /**
     * @memberOf cocos
     * @constructs
     * @extends BObject
     *
     * @param {String} tmxFile The file path of the TMX file to load
     */
    init: function (tmxFile) {
        TMXMapInfo.superclass.init.call(this, tmxFile);

        this.tilesets = [];
        this.layers = [];
        this.objectGroups = [];
        this.properties = {};
        this.tileProperties = {};
        this.filename = tmxFile;

        this.parseXMLFile(tmxFile);
    },

    parseXMLFile: function (xmlFile) {
        var parser = new DOMParser(),
            doc = parser.parseFromString(resource(xmlFile), 'text/xml');

        // PARSE <map>
        var map = doc.documentElement;

        // Set Orientation
        switch (map.getAttribute('orientation')) {
        case 'orthogonal':
            this.orientation = TMXOrientationOrtho;
            break;
        case 'isometric':
            this.orientation = TMXOrientationIso;
            break;
        case 'hexagonal':
            this.orientation = TMXOrientationHex;
            break;
        default:
            throw "cocos2d: TMXFomat: Unsupported orientation: " + map.getAttribute('orientation');
        }
        this.mapSize = {width: parseInt(map.getAttribute('width'), 10), height: parseInt(map.getAttribute('height'), 10)};
        this.tileSize = {width: parseInt(map.getAttribute('tilewidth'), 10), height: parseInt(map.getAttribute('tileheight'), 10)};


        // PARSE <tilesets>
        var tilesets = map.getElementsByTagName('tileset');
        var i, j, len, jen, s;
        for (i = 0, len = tilesets.length; i < len; i++) {
            var t = tilesets[i];

            var tileset = TMXTilesetInfo.create();
            tileset.set('name', t.getAttribute('name'));
            tileset.set('firstGID', parseInt(t.getAttribute('firstgid'), 10));
            if (t.getAttribute('spacing')) {
                tileset.set('spacing', parseInt(t.getAttribute('spacing'), 10));
            }
            if (t.getAttribute('margin')) {
                tileset.set('margin', parseInt(t.getAttribute('margin'), 10));
            }

            s = {};
            s.width = parseInt(t.getAttribute('tilewidth'), 10);
            s.height = parseInt(t.getAttribute('tileheight'), 10);
            tileset.set('tileSize', s);

            // PARSE <image> We assume there's only 1
            var image = t.getElementsByTagName('image')[0];
            tileset.set('sourceImage', path.join(path.dirname(this.filename), image.getAttribute('source')));

            this.tilesets.push(tileset);
        }

        // PARSE <layers>
        var layers = map.getElementsByTagName('layer');
        for (i = 0, len = layers.length; i < len; i++) {
            var l = layers[i];
            var data = l.getElementsByTagName('data')[0];
            var layer = TMXLayerInfo.create();

            layer.set('name', l.getAttribute('name'));
            if (l.getAttribute('visible') !== false) {
                layer.set('visible', true);
            } else {
                layer.set('visible', !!parseInt(l.getAttribute('visible'), 10));
            }

            s = {};
            s.width = parseInt(l.getAttribute('width'), 10);
            s.height = parseInt(l.getAttribute('height'), 10);
            layer.set('layerSize', s);

            var opacity = l.getAttribute('opacity');
            if (!opacity && opacity !== 0) {
                layer.set('opacity', 255);
            } else {
                layer.set('opacity', 255 * parseFloat(opacity));
            }

            var x = parseInt(l.getAttribute('x'), 10),
                y = parseInt(l.getAttribute('y'), 10);
            if (isNaN(x)) {
                x = 0;
            }
            if (isNaN(y)) {
                y = 0;
            }
            layer.set('offset', ccp(x, y));


            // Firefox has a 4KB limit on node values. It will split larger
            // nodes up into multiple nodes. So, we'll stitch them back
            // together.
            var nodeValue = '';
            for (j = 0, jen = data.childNodes.length; j < jen; j++) {
                nodeValue += data.childNodes[j].nodeValue;
            }

            // Unpack the tilemap data
            var compression = data.getAttribute('compression');
            switch (compression) {
            case 'gzip':
                layer.set('tiles', gzip.unzipBase64AsArray(nodeValue, 4));
                break;
                
            // Uncompressed
            case null:
            case '': 
                layer.set('tiles', base64.decodeAsArray(nodeValue, 4));
                break;

            default: 
                throw "Unsupported TMX Tile Map compression: " + compression;
            }

            this.layers.push(layer);
        }

        // TODO PARSE <tile>

        // PARSE <objectgroup>
        var objectgroups = map.getElementsByTagName('objectgroup');
        for (i = 0, len = objectgroups.length; i < len; i++) {
            var g = objectgroups[i],
                objectGroup = TMXObjectGroup.create();

            objectGroup.set('name', g.getAttribute('name'));
            
            var properties = g.querySelectorAll('objectgroup > properties property'),
                propertiesValue = {},
                property;
            
            for (j = 0; j < properties.length; j++) {
                property = properties[j];
                if (property.getAttribute('name')) {
                    propertiesValue[property.getAttribute('name')] = property.getAttribute('value');
                }
            }
           
            objectGroup.set('properties', propertiesValue);

            var objectsArray = [],
                objects = g.querySelectorAll('object');

            for (j = 0; j < objects.length; j++) {
                var object = objects[j];
                var objectValue = {
                    x       : parseInt(object.getAttribute('x'), 10),
                    y       : parseInt(object.getAttribute('y'), 10),
                    width   : parseInt(object.getAttribute('width'), 10),
                    height  : parseInt(object.getAttribute('height'), 10)
                };
                if (object.getAttribute('name')) {
                    objectValue.name = object.getAttribute('name');
                }
                if (object.getAttribute('type')) {
                    objectValue.type = object.getAttribute('type');
                }
                properties = object.querySelectorAll('property');
                for (var k = 0; k < properties.length; k++) {
                    property = properties[k];
                    if (property.getAttribute('name')) {
                        objectValue[property.getAttribute('name')] = property.getAttribute('value');
                    }
                }
                objectsArray.push(objectValue);

            }
            objectGroup.set('objects', objectsArray);
            this.objectGroups.push(objectGroup);
        }


        // PARSE <map><property>
        var properties = doc.querySelectorAll('map > properties > property');

        for (i = 0; i < properties.length; i++) {
            var property = properties[i];
            if (property.getAttribute('name')) {
                this.properties[property.getAttribute('name')] = property.getAttribute('value');
            }
        }
    }
});

exports.TMXMapInfo = TMXMapInfo;
exports.TMXLayerInfo = TMXLayerInfo;
exports.TMXTilesetInfo = TMXTilesetInfo;
exports.TMXObjectGroup = TMXObjectGroup;

}};
__resources__["/__builtin__/libs/geometry.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*globals module exports resource require BObject BArray*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util');

var RE_PAIR = /\{\s*([\d.\-]+)\s*,\s*([\d.\-]+)\s*\}/,
    RE_DOUBLE_PAIR = /\{\s*(\{[\s\d,.\-]+\})\s*,\s*(\{[\s\d,.\-]+\})\s*\}/;

Math.PI_2 = 1.57079632679489661923132169163975144     /* pi/2 */

/** @namespace */
var geometry = {
    /**
     * @class
     * A 2D point in space
     *
     * @param {Float} x X value
     * @param {Float} y Y value
     */
    Point: function (x, y) {
        /**
         * X coordinate
         * @type Float
         */
        this.x = x;

        /**
         * Y coordinate
         * @type Float
         */
        this.y = y;
    },

    /**
     * @class
     * A 2D size
     *
     * @param {Float} w Width
     * @param {Float} h Height
     */
    Size: function (w, h) {
        /**
         * Width
         * @type Float
         */
        this.width = w;

        /**
         * Height
         * @type Float
         */
        this.height = h;
    },

    /**
     * @class
     * A rectangle
     *
     * @param {Float} x X value
     * @param {Float} y Y value
     * @param {Float} w Width
     * @param {Float} h Height
     */
    Rect: function (x, y, w, h) {
        /**
         * Coordinate in 2D space
         * @type {geometry.Point}
         */
        this.origin = new geometry.Point(x, y);

        /**
         * Size in 2D space
         * @type {geometry.Size}
         */
        this.size   = new geometry.Size(w, h);
    },

    /**
     * @class
     * Transform matrix
     *
     * @param {Float} a
     * @param {Float} b
     * @param {Float} c
     * @param {Float} d
     * @param {Float} tx
     * @param {Float} ty
     */
    TransformMatrix: function (a, b, c, d, tx, ty) {
        this.a = a;
        this.b = b;
        this.c = c;
        this.d = d;
        this.tx = tx;
        this.ty = ty;
    },

    /**
     * @class 
     * Bezier curve control object
     *
     * @param {geometry.Point} controlPoint1
     * @param {geometry.Point} controlPoint2
     * @param {geometry.Point} endPoint
     */
    BezierConfig: function(p1, p2, ep) {
        this.controlPoint1 = util.copy(p1);
        this.controlPoint2 = util.copy(p2);
        this.endPosition = util.copy(ep);
    },
    
    /**
     * Creates a geometry.Point instance
     *
     * @param {Float} x X coordinate
     * @param {Float} y Y coordinate
     * @returns {geometry.Point} 
     */
    ccp: function (x, y) {
        return module.exports.pointMake(x, y);
    },

    /**
     * Add the values of two points together
     *
     * @param {geometry.Point} p1 First point
     * @param {geometry.Point} p2 Second point
     * @returns {geometry.Point} New point
     */
    ccpAdd: function (p1, p2) {
        return geometry.ccp(p1.x + p2.x, p1.y + p2.y);
    },

    /**
     * Subtract the values of two points
     *
     * @param {geometry.Point} p1 First point
     * @param {geometry.Point} p2 Second point
     * @returns {geometry.Point} New point
     */
    ccpSub: function (p1, p2) {
        return geometry.ccp(p1.x - p2.x, p1.y - p2.y);
    },

    /**
     * Muliply the values of two points together
     *
     * @param {geometry.Point} p1 First point
     * @param {geometry.Point} p2 Second point
     * @returns {geometry.Point} New point
     */
    ccpMult: function (p1, p2) {
        return geometry.ccp(p1.x * p2.x, p1.y * p2.y);
    },


    /**
     * Invert the values of a geometry.Point
     *
     * @param {geometry.Point} p Point to invert
     * @returns {geometry.Point} New point
     */
    ccpNeg: function (p) {
        return geometry.ccp(-p.x, -p.y);
    },

    /**
     * Round values on a geometry.Point to whole numbers
     *
     * @param {geometry.Point} p Point to round
     * @returns {geometry.Point} New point
     */
    ccpRound: function (p) {
        return geometry.ccp(Math.round(p.x), Math.round(p.y));
    },

    /**
     * Round up values on a geometry.Point to whole numbers
     *
     * @param {geometry.Point} p Point to round
     * @returns {geometry.Point} New point
     */
    ccpCeil: function (p) {
        return geometry.ccp(Math.ceil(p.x), Math.ceil(p.y));
    },

    /**
     * Round down values on a geometry.Point to whole numbers
     *
     * @param {geometry.Point} p Point to round
     * @returns {geometry.Point} New point
     */
    ccpFloor: function (p) {
        return geometry.ccp(Math.floor(p.x), Math.floor(p.y));
    },

    /**
     * A point at 0x0
     *
     * @returns {geometry.Point} New point at 0x0
     */
    PointZero: function () {
        return geometry.ccp(0, 0);
    },

    /**
     * @returns {geometry.Rect}
     */
    rectMake: function (x, y, w, h) {
        return new geometry.Rect(x, y, w, h);
    },

    /**
     * @returns {geometry.Rect}
     */
    rectFromString: function (str) {
        var matches = str.match(RE_DOUBLE_PAIR),
            p = geometry.pointFromString(matches[1]),
            s = geometry.sizeFromString(matches[2]);

        return geometry.rectMake(p.x, p.y, s.width, s.height);
    },

    /**
     * @returns {geometry.Size}
     */
    sizeMake: function (w, h) {
        return new geometry.Size(w, h);
    },

    /**
     * @returns {geometry.Size}
     */
    sizeFromString: function (str) {
        var matches = str.match(RE_PAIR),
            w = parseFloat(matches[1]),
            h = parseFloat(matches[2]);

        return geometry.sizeMake(w, h);
    },

    /**
     * @returns {geometry.Point}
     */
    pointMake: function (x, y) {
        return new geometry.Point(x, y);
    },

    /**
     * @returns {geometry.Point}
     */
    pointFromString: function (str) {
        var matches = str.match(RE_PAIR),
            x = parseFloat(matches[1]),
            y = parseFloat(matches[2]);

        return geometry.pointMake(x, y);
    },

    /**
     * @returns {Boolean}
     */
    rectContainsPoint: function (r, p) {
        return ((p.x >= r.origin.x && p.x <= r.origin.x + r.size.width) &&
                (p.y >= r.origin.y && p.y <= r.origin.y + r.size.height));
    },

    /**
     * Returns the smallest rectangle that contains the two source rectangles.
     *
     * @param {geometry.Rect} r1
     * @param {geometry.Rect} r2
     * @returns {geometry.Rect}
     */
    rectUnion: function (r1, r2) {
        var rect = new geometry.Rect(0, 0, 0, 0);

        rect.origin.x = Math.min(r1.origin.x, r2.origin.x);
        rect.origin.y = Math.min(r1.origin.y, r2.origin.y);
        rect.size.width = Math.max(r1.origin.x + r1.size.width, r2.origin.x + r2.size.width) - rect.origin.x;
        rect.size.height = Math.max(r1.origin.y + r1.size.height, r2.origin.y + r2.size.height) - rect.origin.y;

        return rect;
    },

    /**
     * @returns {Boolean}
     */
    rectOverlapsRect: function (r1, r2) {
        if (r1.origin.x + r1.size.width < r2.origin.x) {
            return false;
        }
        if (r2.origin.x + r2.size.width < r1.origin.x) {
            return false;
        }
        if (r1.origin.y + r1.size.height < r2.origin.y) {
            return false;
        }
        if (r2.origin.y + r2.size.height < r1.origin.y) {
            return false;
        }

        return true;
    },

    /**
     * Returns the overlapping portion of 2 rectangles
     *
     * @param {geometry.Rect} lhsRect First rectangle
     * @param {geometry.Rect} rhsRect Second rectangle
     * @returns {geometry.Rect} The overlapping portion of the 2 rectangles
     */
    rectIntersection: function (lhsRect, rhsRect) {

        var intersection = new geometry.Rect(
            Math.max(geometry.rectGetMinX(lhsRect), geometry.rectGetMinX(rhsRect)),
            Math.max(geometry.rectGetMinY(lhsRect), geometry.rectGetMinY(rhsRect)),
            0,
            0
        );

        intersection.size.width = Math.min(geometry.rectGetMaxX(lhsRect), geometry.rectGetMaxX(rhsRect)) - geometry.rectGetMinX(intersection);
        intersection.size.height = Math.min(geometry.rectGetMaxY(lhsRect), geometry.rectGetMaxY(rhsRect)) - geometry.rectGetMinY(intersection);

        return intersection;
    },

    /**
     * @returns {Boolean}
     */
    pointEqualToPoint: function (point1, point2) {
        return (point1.x == point2.x && point1.y == point2.y);
    },

    /**
     * @returns {Boolean}
     */
    sizeEqualToSize: function (size1, size2) {
        return (size1.width == size2.width && size1.height == size2.height);
    },

    /**
     * @returns {Boolean}
     */
    rectEqualToRect: function (rect1, rect2) {
        return (module.exports.sizeEqualToSize(rect1.size, rect2.size) && module.exports.pointEqualToPoint(rect1.origin, rect2.origin));
    },

    /**
     * @returns {Float}
     */
    rectGetMinX: function (rect) {
        return rect.origin.x;
    },

    /**
     * @returns {Float}
     */
    rectGetMinY: function (rect) {
        return rect.origin.y;
    },

    /**
     * @returns {Float}
     */
    rectGetMaxX: function (rect) {
        return rect.origin.x + rect.size.width;
    },

    /**
     * @returns {Float}
     */
    rectGetMaxY: function (rect) {
        return rect.origin.y + rect.size.height;
    },

    boundingRectMake: function (p1, p2, p3, p4) {
        var minX = Math.min(p1.x, p2.x, p3.x, p4.x);
        var minY = Math.min(p1.y, p2.y, p3.y, p4.y);
        var maxX = Math.max(p1.x, p2.x, p3.x, p4.x);
        var maxY = Math.max(p1.y, p2.y, p3.y, p4.y);

        return new geometry.Rect(minX, minY, (maxX - minX), (maxY - minY));
    },

    /**
     * @returns {geometry.Point}
     */
    pointApplyAffineTransform: function (point, t) {

        /*
        aPoint.x * aTransform.a + aPoint.y * aTransform.c + aTransform.tx,
        aPoint.x * aTransform.b + aPoint.y * aTransform.d + aTransform.ty
        */

        return new geometry.Point(t.a * point.x + t.c * point.y + t.tx, t.b * point.x + t.d * point.y + t.ty);

    },

    /**
     * Apply a transform matrix to a rectangle
     *
     * @param {geometry.Rect} rect Rectangle to transform
     * @param {geometry.TransformMatrix} trans TransformMatrix to apply to rectangle
     * @returns {geometry.Rect} A new transformed rectangle
     */
    rectApplyAffineTransform: function (rect, trans) {

        var p1 = geometry.ccp(geometry.rectGetMinX(rect), geometry.rectGetMinY(rect));
        var p2 = geometry.ccp(geometry.rectGetMaxX(rect), geometry.rectGetMinY(rect));
        var p3 = geometry.ccp(geometry.rectGetMinX(rect), geometry.rectGetMaxY(rect));
        var p4 = geometry.ccp(geometry.rectGetMaxX(rect), geometry.rectGetMaxY(rect));

        p1 = geometry.pointApplyAffineTransform(p1, trans);
        p2 = geometry.pointApplyAffineTransform(p2, trans);
        p3 = geometry.pointApplyAffineTransform(p3, trans);
        p4 = geometry.pointApplyAffineTransform(p4, trans);

        return geometry.boundingRectMake(p1, p2, p3, p4);
    },

    /**
     * Inverts a transform matrix
     *
     * @param {geometry.TransformMatrix} trans TransformMatrix to invert
     * @returns {geometry.TransformMatrix} New transform matrix
     */
    affineTransformInvert: function (trans) {
        var determinant = 1 / (trans.a * trans.d - trans.b * trans.c);

        return new geometry.TransformMatrix(
            determinant * trans.d,
            -determinant * trans.b,
            -determinant * trans.c,
            determinant * trans.a,
            determinant * (trans.c * trans.ty - trans.d * trans.tx),
            determinant * (trans.b * trans.tx - trans.a * trans.ty)
        );
    },

    /**
     * Multiply 2 transform matrices together
     * @param {geometry.TransformMatrix} lhs Left matrix
     * @param {geometry.TransformMatrix} rhs Right matrix
     * @returns {geometry.TransformMatrix} New transform matrix
     */
    affineTransformConcat: function (lhs, rhs) {
        return new geometry.TransformMatrix(
            lhs.a * rhs.a + lhs.b * rhs.c,
            lhs.a * rhs.b + lhs.b * rhs.d,
            lhs.c * rhs.a + lhs.d * rhs.c,
            lhs.c * rhs.b + lhs.d * rhs.d,
            lhs.tx * rhs.a + lhs.ty * rhs.c + rhs.tx,
            lhs.tx * rhs.b + lhs.ty * rhs.d + rhs.ty
        );
    },

    /**
     * @returns {Float}
     */
    degreesToRadians: function (angle) {
        return angle / 180.0 * Math.PI;
    },

    /**
     * @returns {Float}
     */
    radiansToDegrees: function (angle) {
        return angle * (180.0 / Math.PI);
    },

    /**
     * Translate (move) a transform matrix
     *
     * @param {geometry.TransformMatrix} trans TransformMatrix to translate
     * @param {Float} tx Amount to translate along X axis
     * @param {Float} ty Amount to translate along Y axis
     * @returns {geometry.TransformMatrix} A new TransformMatrix
     */
    affineTransformTranslate: function (trans, tx, ty) {
        var newTrans = util.copy(trans);
        newTrans.tx = trans.tx + trans.a * tx + trans.c * ty;
        newTrans.ty = trans.ty + trans.b * tx + trans.d * ty;
        return newTrans;
    },

    /**
     * Rotate a transform matrix
     *
     * @param {geometry.TransformMatrix} trans TransformMatrix to rotate
     * @param {Float} angle Angle in radians
     * @returns {geometry.TransformMatrix} A new TransformMatrix
     */
    affineTransformRotate: function (trans, angle) {
        var sin = Math.sin(angle),
            cos = Math.cos(angle);

        return new geometry.TransformMatrix(
            trans.a * cos + trans.c * sin,
            trans.b * cos + trans.d * sin,
            trans.c * cos - trans.a * sin,
            trans.d * cos - trans.b * sin,
            trans.tx,
            trans.ty
        );
    },

    /**
     * Scale a transform matrix
     *
     * @param {geometry.TransformMatrix} trans TransformMatrix to scale
     * @param {Float} sx X scale factor
     * @param {Float} [sy=sx] Y scale factor
     * @returns {geometry.TransformMatrix} A new TransformMatrix
     */
    affineTransformScale: function (trans, sx, sy) {
        if (sy === undefined) {
            sy = sx;
        }

        return new geometry.TransformMatrix(trans.a * sx, trans.b * sx, trans.c * sy, trans.d * sy, trans.tx, trans.ty);
    },

    /**
     * @returns {geometry.TransformMatrix} identity matrix
     */
    affineTransformIdentity: function () {
        return new geometry.TransformMatrix(1, 0, 0, 1, 0, 0);
    }
};

module.exports = geometry;

}};
__resources__["/__builtin__/libs/gzip.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/**
 * @fileoverview 
 */

/** @ignore */
var JXG = require('./JXGUtil');

/**
 * @namespace
 * Wrappers around JXG's GZip utils
 * @see JXG.Util
 */
var gzip = {
    /**
     * Unpack a gzipped byte array
     *
     * @param {Integer[]} input Byte array
     * @returns {String} Unpacked byte string
     */
    unzip: function(input) {
        return (new JXG.Util.Unzip(input)).unzip()[0][0];
    },

    /**
     * Unpack a gzipped byte string encoded as base64
     *
     * @param {String} input Byte string encoded as base64
     * @returns {String} Unpacked byte string
     */
    unzipBase64: function(input) {
        return (new JXG.Util.Unzip(JXG.Util.Base64.decodeAsArray(input))).unzip()[0][0];
    },

    /**
     * Unpack a gzipped byte string encoded as base64
     *
     * @param {String} input Byte string encoded as base64
     * @param {Integer} bytes Bytes per array item
     * @returns {Integer[]} Unpacked byte array
     */
    unzipBase64AsArray: function(input, bytes) {
        bytes = bytes || 1;

        var dec = this.unzipBase64(input),
            ar = [], i, j, len;
        for (i = 0, len = dec.length/bytes; i < len; i++){
            ar[i] = 0;
            for (j = bytes-1; j >= 0; --j){
                ar[i] += dec.charCodeAt((i *bytes) +j) << (j *8);
            }
        }
        return ar;
    },

    /**
     * Unpack a gzipped byte array
     *
     * @param {Integer[]} input Byte array
     * @param {Integer} bytes Bytes per array item
     * @returns {Integer[]} Unpacked byte array
     */
    unzipAsArray: function (input, bytes) {
        bytes = bytes || 1;

        var dec = this.unzip(input),
            ar = [], i, j, len;
        for (i = 0, len = dec.length/bytes; i < len; i++){
            ar[i] = 0;
            for (j = bytes-1; j >= 0; --j){
                ar[i] += dec.charCodeAt((i *bytes) +j) << (j *8);
            }
        }
        return ar;
    }

};

module.exports = gzip;

}};
__resources__["/__builtin__/libs/JXGUtil.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*
    Copyright 2008,2009
        Matthias Ehmann,
        Michael Gerhaeuser,
        Carsten Miller,
        Bianca Valentin,
        Alfred Wassermann,
        Peter Wilfahrt

    This file is part of JSXGraph.

    JSXGraph is free software: you can redistribute it and/or modify
    it under the terms of the GNU Lesser General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    JSXGraph is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Lesser General Public License for more details.

    You should have received a copy of the GNU Lesser General Public License
    along with JSXGraph.  If not, see <http://www.gnu.org/licenses/>.
*/

/**
 * @fileoverview Utilities for uncompressing and base64 decoding
 */

/** @namespace */
var JXG = {};

/**
  * @class Util class
  * Class for gunzipping, unzipping and base64 decoding of files.
  * It is used for reading GEONExT, Geogebra and Intergeo files.
  *
  * Only Huffman codes are decoded in gunzip.
  * The code is based on the source code for gunzip.c by Pasi Ojala 
  * @see <a href="http://www.cs.tut.fi/~albert/Dev/gunzip/gunzip.c">http://www.cs.tut.fi/~albert/Dev/gunzip/gunzip.c</a>
  * @see <a href="http://www.cs.tut.fi/~albert">http://www.cs.tut.fi/~albert</a>
  */
JXG.Util = {};
                                 
/**
 * Unzip zip files
 */
JXG.Util.Unzip = function (barray){
    var outputArr = [],
        output = "",
        debug = false,
        gpflags,
        files = 0,
        unzipped = [],
        crc,
        buf32k = new Array(32768),
        bIdx = 0,
        modeZIP=false,

        CRC, SIZE,
    
        bitReverse = [
        0x00, 0x80, 0x40, 0xc0, 0x20, 0xa0, 0x60, 0xe0,
        0x10, 0x90, 0x50, 0xd0, 0x30, 0xb0, 0x70, 0xf0,
        0x08, 0x88, 0x48, 0xc8, 0x28, 0xa8, 0x68, 0xe8,
        0x18, 0x98, 0x58, 0xd8, 0x38, 0xb8, 0x78, 0xf8,
        0x04, 0x84, 0x44, 0xc4, 0x24, 0xa4, 0x64, 0xe4,
        0x14, 0x94, 0x54, 0xd4, 0x34, 0xb4, 0x74, 0xf4,
        0x0c, 0x8c, 0x4c, 0xcc, 0x2c, 0xac, 0x6c, 0xec,
        0x1c, 0x9c, 0x5c, 0xdc, 0x3c, 0xbc, 0x7c, 0xfc,
        0x02, 0x82, 0x42, 0xc2, 0x22, 0xa2, 0x62, 0xe2,
        0x12, 0x92, 0x52, 0xd2, 0x32, 0xb2, 0x72, 0xf2,
        0x0a, 0x8a, 0x4a, 0xca, 0x2a, 0xaa, 0x6a, 0xea,
        0x1a, 0x9a, 0x5a, 0xda, 0x3a, 0xba, 0x7a, 0xfa,
        0x06, 0x86, 0x46, 0xc6, 0x26, 0xa6, 0x66, 0xe6,
        0x16, 0x96, 0x56, 0xd6, 0x36, 0xb6, 0x76, 0xf6,
        0x0e, 0x8e, 0x4e, 0xce, 0x2e, 0xae, 0x6e, 0xee,
        0x1e, 0x9e, 0x5e, 0xde, 0x3e, 0xbe, 0x7e, 0xfe,
        0x01, 0x81, 0x41, 0xc1, 0x21, 0xa1, 0x61, 0xe1,
        0x11, 0x91, 0x51, 0xd1, 0x31, 0xb1, 0x71, 0xf1,
        0x09, 0x89, 0x49, 0xc9, 0x29, 0xa9, 0x69, 0xe9,
        0x19, 0x99, 0x59, 0xd9, 0x39, 0xb9, 0x79, 0xf9,
        0x05, 0x85, 0x45, 0xc5, 0x25, 0xa5, 0x65, 0xe5,
        0x15, 0x95, 0x55, 0xd5, 0x35, 0xb5, 0x75, 0xf5,
        0x0d, 0x8d, 0x4d, 0xcd, 0x2d, 0xad, 0x6d, 0xed,
        0x1d, 0x9d, 0x5d, 0xdd, 0x3d, 0xbd, 0x7d, 0xfd,
        0x03, 0x83, 0x43, 0xc3, 0x23, 0xa3, 0x63, 0xe3,
        0x13, 0x93, 0x53, 0xd3, 0x33, 0xb3, 0x73, 0xf3,
        0x0b, 0x8b, 0x4b, 0xcb, 0x2b, 0xab, 0x6b, 0xeb,
        0x1b, 0x9b, 0x5b, 0xdb, 0x3b, 0xbb, 0x7b, 0xfb,
        0x07, 0x87, 0x47, 0xc7, 0x27, 0xa7, 0x67, 0xe7,
        0x17, 0x97, 0x57, 0xd7, 0x37, 0xb7, 0x77, 0xf7,
        0x0f, 0x8f, 0x4f, 0xcf, 0x2f, 0xaf, 0x6f, 0xef,
        0x1f, 0x9f, 0x5f, 0xdf, 0x3f, 0xbf, 0x7f, 0xff
    ],
    
    cplens = [
        3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31,
        35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258, 0, 0
    ],

    cplext = [
        0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2,
        3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0, 99, 99
    ], /* 99==invalid */

    cpdist = [
        0x0001, 0x0002, 0x0003, 0x0004, 0x0005, 0x0007, 0x0009, 0x000d,
        0x0011, 0x0019, 0x0021, 0x0031, 0x0041, 0x0061, 0x0081, 0x00c1,
        0x0101, 0x0181, 0x0201, 0x0301, 0x0401, 0x0601, 0x0801, 0x0c01,
        0x1001, 0x1801, 0x2001, 0x3001, 0x4001, 0x6001
    ],

    cpdext = [
        0,  0,  0,  0,  1,  1,  2,  2,
        3,  3,  4,  4,  5,  5,  6,  6,
        7,  7,  8,  8,  9,  9, 10, 10,
        11, 11, 12, 12, 13, 13
    ],
    
    border = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15],
    
    bA = barray,

    bytepos=0,
    bitpos=0,
    bb = 1,
    bits=0,
    
    NAMEMAX = 256,
    
    nameBuf = [],
    
    fileout;
    
    function readByte(){
        bits+=8;
        if (bytepos<bA.length){
            //if (debug)
            //    document.write(bytepos+": "+bA[bytepos]+"<br>");
            return bA[bytepos++];
        } else
            return -1;
    };

    function byteAlign(){
        bb = 1;
    };
    
    function readBit(){
        var carry;
        bits++;
        carry = (bb & 1);
        bb >>= 1;
        if (bb==0){
            bb = readByte();
            carry = (bb & 1);
            bb = (bb>>1) | 0x80;
        }
        return carry;
    };

    function readBits(a) {
        var res = 0,
            i = a;
    
        while(i--) {
            res = (res<<1) | readBit();
        }
        if(a) {
            res = bitReverse[res]>>(8-a);
        }
        return res;
    };
        
    function flushBuffer(){
        //document.write('FLUSHBUFFER:'+buf32k);
        bIdx = 0;
    };
    function addBuffer(a){
        SIZE++;
        //CRC=updcrc(a,crc);
        buf32k[bIdx++] = a;
        outputArr.push(String.fromCharCode(a));
        //output+=String.fromCharCode(a);
        if(bIdx==0x8000){
            //document.write('ADDBUFFER:'+buf32k);
            bIdx=0;
        }
    };
    
    function HufNode() {
        this.b0=0;
        this.b1=0;
        this.jump = null;
        this.jumppos = -1;
    };

    var LITERALS = 288;
    
    var literalTree = new Array(LITERALS);
    var distanceTree = new Array(32);
    var treepos=0;
    var Places = null;
    var Places2 = null;
    
    var impDistanceTree = new Array(64);
    var impLengthTree = new Array(64);
    
    var len = 0;
    var fpos = new Array(17);
    fpos[0]=0;
    var flens;
    var fmax;
    
    function IsPat() {
        while (1) {
            if (fpos[len] >= fmax)
                return -1;
            if (flens[fpos[len]] == len)
                return fpos[len]++;
            fpos[len]++;
        }
    };

    function Rec() {
        var curplace = Places[treepos];
        var tmp;
        if (debug)
    		document.write("<br>len:"+len+" treepos:"+treepos);
        if(len==17) { //war 17
            return -1;
        }
        treepos++;
        len++;
    	
        tmp = IsPat();
        if (debug)
        	document.write("<br>IsPat "+tmp);
        if(tmp >= 0) {
            curplace.b0 = tmp;    /* leaf cell for 0-bit */
            if (debug)
            	document.write("<br>b0 "+curplace.b0);
        } else {
        /* Not a Leaf cell */
        curplace.b0 = 0x8000;
        if (debug)
        	document.write("<br>b0 "+curplace.b0);
        if(Rec())
            return -1;
        }
        tmp = IsPat();
        if(tmp >= 0) {
            curplace.b1 = tmp;    /* leaf cell for 1-bit */
            if (debug)
            	document.write("<br>b1 "+curplace.b1);
            curplace.jump = null;    /* Just for the display routine */
        } else {
            /* Not a Leaf cell */
            curplace.b1 = 0x8000;
            if (debug)
            	document.write("<br>b1 "+curplace.b1);
            curplace.jump = Places[treepos];
            curplace.jumppos = treepos;
            if(Rec())
                return -1;
        }
        len--;
        return 0;
    };

    function CreateTree(currentTree, numval, lengths, show) {
        var i;
        /* Create the Huffman decode tree/table */
        //document.write("<br>createtree<br>");
        if (debug)
        	document.write("currentTree "+currentTree+" numval "+numval+" lengths "+lengths+" show "+show);
        Places = currentTree;
        treepos=0;
        flens = lengths;
        fmax  = numval;
        for (i=0;i<17;i++)
            fpos[i] = 0;
        len = 0;
        if(Rec()) {
            //fprintf(stderr, "invalid huffman tree\n");
            if (debug)
            	alert("invalid huffman tree\n");
            return -1;
        }
        if (debug){
        	document.write('<br>Tree: '+Places.length);
        	for (var a=0;a<32;a++){
            	document.write("Places["+a+"].b0="+Places[a].b0+"<br>");
            	document.write("Places["+a+"].b1="+Places[a].b1+"<br>");
        	}
        }

        return 0;
    };
    
    function DecodeValue(currentTree) {
        var len, i,
            xtreepos=0,
            X = currentTree[xtreepos],
            b;

        /* decode one symbol of the data */
        while(1) {
            b=readBit();
            if (debug)
            	document.write("b="+b);
            if(b) {
                if(!(X.b1 & 0x8000)){
                	if (debug)
                    	document.write("ret1");
                    return X.b1;    /* If leaf node, return data */
                }
                X = X.jump;
                len = currentTree.length;
                for (i=0;i<len;i++){
                    if (currentTree[i]===X){
                        xtreepos=i;
                        break;
                    }
                }
                //xtreepos++;
            } else {
                if(!(X.b0 & 0x8000)){
                	if (debug)
                    	document.write("ret2");
                    return X.b0;    /* If leaf node, return data */
                }
                //X++; //??????????????????
                xtreepos++;
                X = currentTree[xtreepos];
            }
        }
        if (debug)
        	document.write("ret3");
        return -1;
    };
    
    function DeflateLoop() {
    var last, c, type, i, len;

    do {
        /*if((last = readBit())){
            fprintf(errfp, "Last Block: ");
        } else {
            fprintf(errfp, "Not Last Block: ");
        }*/
        last = readBit();
        type = readBits(2);
        switch(type) {
            case 0:
            	if (debug)
                	alert("Stored\n");
                break;
            case 1:
            	if (debug)
                	alert("Fixed Huffman codes\n");
                break;
            case 2:
            	if (debug)
                	alert("Dynamic Huffman codes\n");
                break;
            case 3:
            	if (debug)
                	alert("Reserved block type!!\n");
                break;
            default:
            	if (debug)
                	alert("Unexpected value %d!\n", type);
                break;
        }

        if(type==0) {
            var blockLen, cSum;

            // Stored 
            byteAlign();
            blockLen = readByte();
            blockLen |= (readByte()<<8);

            cSum = readByte();
            cSum |= (readByte()<<8);

            if(((blockLen ^ ~cSum) & 0xffff)) {
                document.write("BlockLen checksum mismatch\n");
            }
            while(blockLen--) {
                c = readByte();
                addBuffer(c);
            }
        } else if(type==1) {
            var j;

            /* Fixed Huffman tables -- fixed decode routine */
            while(1) {
            /*
                256    0000000        0
                :   :     :
                279    0010111        23
                0   00110000    48
                :    :      :
                143    10111111    191
                280 11000000    192
                :    :      :
                287 11000111    199
                144    110010000    400
                :    :       :
                255    111111111    511
    
                Note the bit order!
                */

            j = (bitReverse[readBits(7)]>>1);
            if(j > 23) {
                j = (j<<1) | readBit();    /* 48..255 */

                if(j > 199) {    /* 200..255 */
                    j -= 128;    /*  72..127 */
                    j = (j<<1) | readBit();        /* 144..255 << */
                } else {        /*  48..199 */
                    j -= 48;    /*   0..151 */
                    if(j > 143) {
                        j = j+136;    /* 280..287 << */
                        /*   0..143 << */
                    }
                }
            } else {    /*   0..23 */
                j += 256;    /* 256..279 << */
            }
            if(j < 256) {
                addBuffer(j);
                //document.write("out:"+String.fromCharCode(j));
                /*fprintf(errfp, "@%d %02x\n", SIZE, j);*/
            } else if(j == 256) {
                /* EOF */
                break;
            } else {
                var len, dist;

                j -= 256 + 1;    /* bytes + EOF */
                len = readBits(cplext[j]) + cplens[j];

                j = bitReverse[readBits(5)]>>3;
                if(cpdext[j] > 8) {
                    dist = readBits(8);
                    dist |= (readBits(cpdext[j]-8)<<8);
                } else {
                    dist = readBits(cpdext[j]);
                }
                dist += cpdist[j];

                /*fprintf(errfp, "@%d (l%02x,d%04x)\n", SIZE, len, dist);*/
                for(j=0;j<len;j++) {
                    var c = buf32k[(bIdx - dist) & 0x7fff];
                    addBuffer(c);
                }
            }
            } // while
        } else if(type==2) {
            var j, n, literalCodes, distCodes, lenCodes;
            var ll = new Array(288+32);    // "static" just to preserve stack
    
            // Dynamic Huffman tables 
    
            literalCodes = 257 + readBits(5);
            distCodes = 1 + readBits(5);
            lenCodes = 4 + readBits(4);
            //document.write("<br>param: "+literalCodes+" "+distCodes+" "+lenCodes+"<br>");
            for(j=0; j<19; j++) {
                ll[j] = 0;
            }
    
            // Get the decode tree code lengths
    
            //document.write("<br>");
            for(j=0; j<lenCodes; j++) {
                ll[border[j]] = readBits(3);
                //document.write(ll[border[j]]+" ");
            }
            //fprintf(errfp, "\n");
            //document.write('<br>ll:'+ll);
            len = distanceTree.length;
            for (i=0; i<len; i++)
                distanceTree[i]=new HufNode();
            if(CreateTree(distanceTree, 19, ll, 0)) {
                flushBuffer();
                return 1;
            }
            if (debug){
            	document.write("<br>distanceTree");
            	for(var a=0;a<distanceTree.length;a++){
                	document.write("<br>"+distanceTree[a].b0+" "+distanceTree[a].b1+" "+distanceTree[a].jump+" "+distanceTree[a].jumppos);
                	/*if (distanceTree[a].jumppos!=-1)
                    	document.write(" "+distanceTree[a].jump.b0+" "+distanceTree[a].jump.b1);
                	*/
            	}
            }
            //document.write('<BR>tree created');
    
            //read in literal and distance code lengths
            n = literalCodes + distCodes;
            i = 0;
            var z=-1;
            if (debug)
            	document.write("<br>n="+n+" bits: "+bits+"<br>");
            while(i < n) {
                z++;
                j = DecodeValue(distanceTree);
                if (debug)
                	document.write("<br>"+z+" i:"+i+" decode: "+j+"    bits "+bits+"<br>");
                if(j<16) {    // length of code in bits (0..15)
                       ll[i++] = j;
                } else if(j==16) {    // repeat last length 3 to 6 times 
                       var l;
                    j = 3 + readBits(2);
                    if(i+j > n) {
                        flushBuffer();
                        return 1;
                    }
                    l = i ? ll[i-1] : 0;
                    while(j--) {
                        ll[i++] = l;
                    }
                } else {
                    if(j==17) {        // 3 to 10 zero length codes
                        j = 3 + readBits(3);
                    } else {        // j == 18: 11 to 138 zero length codes 
                        j = 11 + readBits(7);
                    }
                    if(i+j > n) {
                        flushBuffer();
                        return 1;
                    }
                    while(j--) {
                        ll[i++] = 0;
                    }
                }
            }
            /*for(j=0; j<literalCodes+distCodes; j++) {
                //fprintf(errfp, "%d ", ll[j]);
                if ((j&7)==7)
                    fprintf(errfp, "\n");
            }
            fprintf(errfp, "\n");*/
            // Can overwrite tree decode tree as it is not used anymore
            len = literalTree.length;
            for (i=0; i<len; i++)
                literalTree[i]=new HufNode();
            if(CreateTree(literalTree, literalCodes, ll, 0)) {
                flushBuffer();
                return 1;
            }
            len = literalTree.length;
            for (i=0; i<len; i++)
                distanceTree[i]=new HufNode();
            var ll2 = new Array();
            for (i=literalCodes; i <ll.length; i++){
                ll2[i-literalCodes]=ll[i];
            }    
            if(CreateTree(distanceTree, distCodes, ll2, 0)) {
                flushBuffer();
                return 1;
            }
            if (debug)
           		document.write("<br>literalTree");
            while(1) {
                j = DecodeValue(literalTree);
                if(j >= 256) {        // In C64: if carry set
                    var len, dist;
                    j -= 256;
                    if(j == 0) {
                        // EOF
                        break;
                    }
                    j--;
                    len = readBits(cplext[j]) + cplens[j];
    
                    j = DecodeValue(distanceTree);
                    if(cpdext[j] > 8) {
                        dist = readBits(8);
                        dist |= (readBits(cpdext[j]-8)<<8);
                    } else {
                        dist = readBits(cpdext[j]);
                    }
                    dist += cpdist[j];
                    while(len--) {
                        var c = buf32k[(bIdx - dist) & 0x7fff];
                        addBuffer(c);
                    }
                } else {
                    addBuffer(j);
                }
            }
        }
    } while(!last);
    flushBuffer();

    byteAlign();
    return 0;
};

JXG.Util.Unzip.prototype.unzipFile = function(name) {
    var i;
	this.unzip();
	//alert(unzipped[0][1]);
	for (i=0;i<unzipped.length;i++){
		if(unzipped[i][1]==name) {
			return unzipped[i][0];
		}
	}
	
  };
    
    
JXG.Util.Unzip.prototype.unzip = function() {
	//convertToByteArray(input);
	if (debug)
		alert(bA);
	/*for (i=0;i<bA.length*8;i++){
		document.write(readBit());
		if ((i+1)%8==0)
			document.write(" ");
	}*/
	/*for (i=0;i<bA.length;i++){
		document.write(readByte()+" ");
		if ((i+1)%8==0)
			document.write(" ");
	}
	for (i=0;i<bA.length;i++){
		document.write(bA[i]+" ");
		if ((i+1)%16==0)
			document.write("<br>");
	}	
	*/
	//alert(bA);
	nextFile();
	return unzipped;
  };
    
 function nextFile(){
 	if (debug)
 		alert("NEXTFILE");
 	outputArr = [];
 	var tmp = [];
 	modeZIP = false;
	tmp[0] = readByte();
	tmp[1] = readByte();
	if (debug)
		alert("type: "+tmp[0]+" "+tmp[1]);
	if (tmp[0] == parseInt("78",16) && tmp[1] == parseInt("da",16)){ //GZIP
		if (debug)
			alert("GEONExT-GZIP");
		DeflateLoop();
		if (debug)
			alert(outputArr.join(''));
		unzipped[files] = new Array(2);
    	unzipped[files][0] = outputArr.join('');
    	unzipped[files][1] = "geonext.gxt";
    	files++;
	}
	if (tmp[0] == parseInt("1f",16) && tmp[1] == parseInt("8b",16)){ //GZIP
		if (debug)
			alert("GZIP");
		//DeflateLoop();
		skipdir();
		if (debug)
			alert(outputArr.join(''));
		unzipped[files] = new Array(2);
    	unzipped[files][0] = outputArr.join('');
    	unzipped[files][1] = "file";
    	files++;
	}
	if (tmp[0] == parseInt("50",16) && tmp[1] == parseInt("4b",16)){ //ZIP
		modeZIP = true;
		tmp[2] = readByte();
		tmp[3] = readByte();
		if (tmp[2] == parseInt("3",16) && tmp[3] == parseInt("4",16)){
			//MODE_ZIP
			tmp[0] = readByte();
			tmp[1] = readByte();
			if (debug)
				alert("ZIP-Version: "+tmp[1]+" "+tmp[0]/10+"."+tmp[0]%10);
			
			gpflags = readByte();
			gpflags |= (readByte()<<8);
			if (debug)
				alert("gpflags: "+gpflags);
			
			var method = readByte();
			method |= (readByte()<<8);
			if (debug)
				alert("method: "+method);
			
			readByte();
			readByte();
			readByte();
			readByte();
			
			var crc = readByte();
			crc |= (readByte()<<8);
			crc |= (readByte()<<16);
			crc |= (readByte()<<24);
			
			var compSize = readByte();
			compSize |= (readByte()<<8);
			compSize |= (readByte()<<16);
			compSize |= (readByte()<<24);
			
			var size = readByte();
			size |= (readByte()<<8);
			size |= (readByte()<<16);
			size |= (readByte()<<24);
			
			if (debug)
				alert("local CRC: "+crc+"\nlocal Size: "+size+"\nlocal CompSize: "+compSize);
			
			var filelen = readByte();
			filelen |= (readByte()<<8);
			
			var extralen = readByte();
			extralen |= (readByte()<<8);
			
			if (debug)
				alert("filelen "+filelen);
			i = 0;
			nameBuf = [];
			while (filelen--){ 
				var c = readByte();
				if (c == "/" | c ==":"){
					i = 0;
				} else if (i < NAMEMAX-1)
					nameBuf[i++] = String.fromCharCode(c);
			}
			if (debug)
				alert("nameBuf: "+nameBuf);
			
			//nameBuf[i] = "\0";
			if (!fileout)
				fileout = nameBuf;
			
			var i = 0;
			while (i < extralen){
				c = readByte();
				i++;
			}
				
			CRC = 0xffffffff;
			SIZE = 0;
			
			if (size = 0 && fileOut.charAt(fileout.length-1)=="/"){
				//skipdir
				if (debug)
					alert("skipdir");
			}
			if (method == 8){
				DeflateLoop();
				if (debug)
					alert(outputArr.join(''));
				unzipped[files] = new Array(2);
				unzipped[files][0] = outputArr.join('');
    			unzipped[files][1] = nameBuf.join('');
    			files++;
				//return outputArr.join('');
			}
			skipdir();
		}
	}
 };
	
function skipdir(){
    var crc, 
        tmp = [],
        compSize, size, os, i, c;
    
	if ((gpflags & 8)) {
		tmp[0] = readByte();
		tmp[1] = readByte();
		tmp[2] = readByte();
		tmp[3] = readByte();
		
		if (tmp[0] == parseInt("50",16) && 
            tmp[1] == parseInt("4b",16) && 
            tmp[2] == parseInt("07",16) && 
            tmp[3] == parseInt("08",16))
        {
            crc = readByte();
            crc |= (readByte()<<8);
            crc |= (readByte()<<16);
            crc |= (readByte()<<24);
		} else {
			crc = tmp[0] | (tmp[1]<<8) | (tmp[2]<<16) | (tmp[3]<<24);
		}
		
		compSize = readByte();
		compSize |= (readByte()<<8);
		compSize |= (readByte()<<16);
		compSize |= (readByte()<<24);
		
		size = readByte();
		size |= (readByte()<<8);
		size |= (readByte()<<16);
		size |= (readByte()<<24);
		
		if (debug)
			alert("CRC:");
	}

	if (modeZIP)
		nextFile();
	
	tmp[0] = readByte();
	if (tmp[0] != 8) {
		if (debug)
			alert("Unknown compression method!");
        return 0;	
	}
	
	gpflags = readByte();
	if (debug){
		if ((gpflags & ~(parseInt("1f",16))))
			alert("Unknown flags set!");
	}
	
	readByte();
	readByte();
	readByte();
	readByte();
	
	readByte();
	os = readByte();
	
	if ((gpflags & 4)){
		tmp[0] = readByte();
		tmp[2] = readByte();
		len = tmp[0] + 256*tmp[1];
		if (debug)
			alert("Extra field size: "+len);
		for (i=0;i<len;i++)
			readByte();
	}
	
	if ((gpflags & 8)){
		i=0;
		nameBuf=[];
		while (c=readByte()){
			if(c == "7" || c == ":")
				i=0;
			if (i<NAMEMAX-1)
				nameBuf[i++] = c;
		}
		//nameBuf[i] = "\0";
		if (debug)
			alert("original file name: "+nameBuf);
	}
		
	if ((gpflags & 16)){
		while (c=readByte()){
			//FILE COMMENT
		}
	}
	
	if ((gpflags & 2)){
		readByte();
		readByte();
	}
	
	DeflateLoop();
	
	crc = readByte();
	crc |= (readByte()<<8);
	crc |= (readByte()<<16);
	crc |= (readByte()<<24);
	
	size = readByte();
	size |= (readByte()<<8);
	size |= (readByte()<<16);
	size |= (readByte()<<24);
	
	if (modeZIP)
		nextFile();
	
};

};

/**
*  Base64 encoding / decoding
*  @see <a href="http://www.webtoolkit.info/">http://www.webtoolkit.info/</A>
*/
JXG.Util.Base64 = {

    // private property
    _keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

    // public method for encoding
    encode : function (input) {
        var output = [],
            chr1, chr2, chr3, enc1, enc2, enc3, enc4,
            i = 0;

        input = JXG.Util.Base64._utf8_encode(input);

        while (i < input.length) {

            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);

            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;

            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }

            output.push([this._keyStr.charAt(enc1),
                         this._keyStr.charAt(enc2),
                         this._keyStr.charAt(enc3),
                         this._keyStr.charAt(enc4)].join(''));
        }

        return output.join('');
    },

    // public method for decoding
    decode : function (input, utf8) {
        var output = [],
            chr1, chr2, chr3,
            enc1, enc2, enc3, enc4,
            i = 0;

        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

        while (i < input.length) {

            enc1 = this._keyStr.indexOf(input.charAt(i++));
            enc2 = this._keyStr.indexOf(input.charAt(i++));
            enc3 = this._keyStr.indexOf(input.charAt(i++));
            enc4 = this._keyStr.indexOf(input.charAt(i++));

            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;

            output.push(String.fromCharCode(chr1));

            if (enc3 != 64) {
                output.push(String.fromCharCode(chr2));
            }
            if (enc4 != 64) {
                output.push(String.fromCharCode(chr3));
            }
        }
        
        output = output.join(''); 
        
        if (utf8) {
            output = JXG.Util.Base64._utf8_decode(output);
        }
        return output;

    },

    // private method for UTF-8 encoding
    _utf8_encode : function (string) {
        string = string.replace(/\r\n/g,"\n");
        var utftext = "";

        for (var n = 0; n < string.length; n++) {

            var c = string.charCodeAt(n);

            if (c < 128) {
                utftext += String.fromCharCode(c);
            }
            else if((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            }
            else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }

        }

        return utftext;
    },

    // private method for UTF-8 decoding
    _utf8_decode : function (utftext) {
        var string = [],
            i = 0,
            c = 0, c2 = 0, c3 = 0;

        while ( i < utftext.length ) {
            c = utftext.charCodeAt(i);
            if (c < 128) {
                string.push(String.fromCharCode(c));
                i++;
            }
            else if((c > 191) && (c < 224)) {
                c2 = utftext.charCodeAt(i+1);
                string.push(String.fromCharCode(((c & 31) << 6) | (c2 & 63)));
                i += 2;
            }
            else {
                c2 = utftext.charCodeAt(i+1);
                c3 = utftext.charCodeAt(i+2);
                string.push(String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63)));
                i += 3;
            }
        }
        return string.join('');
    },
    
    _destrip: function (stripped, wrap){
        var lines = [], lineno, i,
            destripped = [];
        
        if (wrap==null) 
            wrap = 76;
            
        stripped.replace(/ /g, "");
        lineno = stripped.length / wrap;
        for (i = 0; i < lineno; i++)
            lines[i]=stripped.substr(i * wrap, wrap);
        if (lineno != stripped.length / wrap)
            lines[lines.length]=stripped.substr(lineno * wrap, stripped.length-(lineno * wrap));
            
        for (i = 0; i < lines.length; i++)
            destripped.push(lines[i]);
        return destripped.join('\n');
    },
    
    decodeAsArray: function (input){
        var dec = this.decode(input),
            ar = [], i;
        for (i=0;i<dec.length;i++){
            ar[i]=dec.charCodeAt(i);
        }
        return ar;
    },
    
    decodeGEONExT : function (input) {
        return decodeAsArray(destrip(input),false);
    }
};

/**
 * @private
 */
JXG.Util.asciiCharCodeAt = function(str,i){
	var c = str.charCodeAt(i);
	if (c>255){
    	switch (c) {
			case 8364: c=128;
	    	break;
	    	case 8218: c=130;
	    	break;
	    	case 402: c=131;
	    	break;
	    	case 8222: c=132;
	    	break;
	    	case 8230: c=133;
	    	break;
	    	case 8224: c=134;
	    	break;
	    	case 8225: c=135;
	    	break;
	    	case 710: c=136;
	    	break;
	    	case 8240: c=137;
	    	break;
	    	case 352: c=138;
	    	break;
	    	case 8249: c=139;
	    	break;
	    	case 338: c=140;
	    	break;
	    	case 381: c=142;
	    	break;
	    	case 8216: c=145;
	    	break;
	    	case 8217: c=146;
	    	break;
	    	case 8220: c=147;
	    	break;
	    	case 8221: c=148;
	    	break;
	    	case 8226: c=149;
	    	break;
	    	case 8211: c=150;
	    	break;
	    	case 8212: c=151;
	    	break;
	    	case 732: c=152;
	    	break;
	    	case 8482: c=153;
	    	break;
	    	case 353: c=154;
	    	break;
	    	case 8250: c=155;
	    	break;
	    	case 339: c=156;
	    	break;
	    	case 382: c=158;
	    	break;
	    	case 376: c=159;
	    	break;
	    	default:
	    	break;
	    }
	}
	return c;
};

/**
 * Decoding string into utf-8
 * @param {String} string to decode
 * @return {String} utf8 decoded string
 */
JXG.Util.utf8Decode = function(utftext) {
  var string = [];
  var i = 0;
  var c = 0, c1 = 0, c2 = 0;

  while ( i < utftext.length ) {
    c = utftext.charCodeAt(i);

    if (c < 128) {
      string.push(String.fromCharCode(c));
      i++;
    } else if((c > 191) && (c < 224)) {
      c2 = utftext.charCodeAt(i+1);
      string.push(String.fromCharCode(((c & 31) << 6) | (c2 & 63)));
      i += 2;
    } else {
      c2 = utftext.charCodeAt(i+1);
      c3 = utftext.charCodeAt(i+2);
      string.push(String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63)));
      i += 3;
    }
  };
  return string.join('');
};

// Added to exports for Cocos2d
module.exports = JXG;

}};
__resources__["/__builtin__/libs/Plist.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/**
 * XML Node types
 */
var ELEMENT_NODE                = 1,
    ATTRIBUTE_NODE              = 2,
    TEXT_NODE                   = 3,
    CDATA_SECTION_NODE          = 4,
    ENTITY_REFERENCE_NODE       = 5,
    ENTITY_NODE                 = 6,
    PROCESSING_INSTRUCTION_NODE = 7,
    COMMENT_NODE                = 8,
    DOCUMENT_NODE               = 9,
    DOCUMENT_TYPE_NODE          = 10,
    DOCUMENT_FRAGMENT_NODE      = 11,
    NOTATION_NODE               = 12;


var Plist = BObject.extend (/** @lends Plist# */{
    /**
     * The unserialized data inside the Plist file
     * @type Object
     */
    data: null,

    /**
     * An object representation of an XML Property List file
     *
     * @constructs
     * @extends BObject
     * @param {Options} opts Options
     * @config {String} [file] The path to a .plist file
     * @config {String} [data] The contents of a .plist file
     */
    init: function(opts) {
        var file = opts['file'],
            data = opts['data'];

        if (file && !data) {
            data = resource(file);
        }


        var parser = new DOMParser(),
            doc = parser.parseFromString(data, 'text/xml'),
            plist = doc.documentElement;

        if (plist.tagName != 'plist') {
            throw "Not a plist file";
        }


        // Get first real node
        var node = null;
        for (var i = 0, len = plist.childNodes.length; i < len; i++) {
            node = plist.childNodes[i];
            if (node.nodeType == ELEMENT_NODE) {
                break;
            }
        }

        this.set('data', this.parseNode_(node));
    },


    /**
     * @private
     * Parses an XML node inside the Plist file
     * @returns {Object/Array/String/Integer/Float} A JS representation of the node value
     */
    parseNode_: function(node) {
        var data = null;
        switch(node.tagName) {
        case 'dict':
            data = this.parseDict_(node); 
            break;
        case 'array':
            data = this.parseArray_(node); 
            break;
        case 'string':
            // FIXME - This needs to handle Firefox's 4KB nodeValue limit
            data = node.firstChild.nodeValue;
            break
        case 'false':
            data = false;
            break
        case 'true':
            data = true;
            break
        case 'real':
            data = parseFloat(node.firstChild.nodeValue);
            break
        case 'integer':
            data = parseInt(node.firstChild.nodeValue, 10);
            break
        }

        return data;
    },

    /**
     * @private
     * Parses a <dict> node in a plist file
     *
     * @param {XMLElement}
     * @returns {Object} A simple key/value JS Object representing the <dict>
     */
    parseDict_: function(node) {
        var data = {};

        var key = null;
        for (var i = 0, len = node.childNodes.length; i < len; i++) {
            var child = node.childNodes[i];
            if (child.nodeType != ELEMENT_NODE) {
                continue;
            }

            // Grab the key, next noe should be the value
            if (child.tagName == 'key') {
                key = child.firstChild.nodeValue;
            } else {
                // Parse the value node
                data[key] = this.parseNode_(child);
            }
        }


        return data;
    },

    /**
     * @private
     * Parses an <array> node in a plist file
     *
     * @param {XMLElement}
     * @returns {Array} A simple JS Array representing the <array>
     */
    parseArray_: function(node) {
        var data = [];

        for (var i = 0, len = node.childNodes.length; i < len; i++) {
            var child = node.childNodes[i];
            if (child.nodeType != ELEMENT_NODE) {
                continue;
            }

            data.push(this.parseNode_(child));
        }

        return data;
    }
});


exports.Plist = Plist;

}};
__resources__["/__builtin__/libs/qunit.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/*
 * QUnit - A JavaScript Unit Testing Framework
 * 
 * http://docs.jquery.com/QUnit
 *
 * Copyright (c) 2011 John Resig, Jörn Zaefferer
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * or GPL (GPL-LICENSE.txt) licenses.
 */

(function(window) {

var defined = {
	setTimeout: typeof window.setTimeout !== "undefined",
	sessionStorage: (function() {
		try {
			return !!sessionStorage.getItem;
		} catch(e){
			return false;
		}
  })()
}

var testId = 0;

var Test = function(name, testName, expected, testEnvironmentArg, async, callback) {
	this.name = name;
	this.testName = testName;
	this.expected = expected;
	this.testEnvironmentArg = testEnvironmentArg;
	this.async = async;
	this.callback = callback;
	this.assertions = [];
};
Test.prototype = {
	init: function() {
		var tests = id("qunit-tests");
		if (tests) {
			var b = document.createElement("strong");
				b.innerHTML = "Running " + this.name;
			var li = document.createElement("li");
				li.appendChild( b );
				li.id = this.id = "test-output" + testId++;
			tests.appendChild( li );
		}
	},
	setup: function() {
		if (this.module != config.previousModule) {
			if ( config.previousModule ) {
				QUnit.moduleDone( {
					name: config.previousModule,
					failed: config.moduleStats.bad,
					passed: config.moduleStats.all - config.moduleStats.bad,
					total: config.moduleStats.all
				} );
			}
			config.previousModule = this.module;
			config.moduleStats = { all: 0, bad: 0 };
			QUnit.moduleStart( {
				name: this.module
			} );
		}

		config.current = this;
		this.testEnvironment = extend({
			setup: function() {},
			teardown: function() {}
		}, this.moduleTestEnvironment);
		if (this.testEnvironmentArg) {
			extend(this.testEnvironment, this.testEnvironmentArg);
		}

		QUnit.testStart( {
			name: this.testName
		} );

		// allow utility functions to access the current test environment
		// TODO why??
		QUnit.current_testEnvironment = this.testEnvironment;
		
		try {
			if ( !config.pollution ) {
				saveGlobal();
			}

			this.testEnvironment.setup.call(this.testEnvironment);
		} catch(e) {
			QUnit.ok( false, "Setup failed on " + this.testName + ": " + e.message );
		}
	},
	run: function() {
		if ( this.async ) {
			QUnit.stop();
		}

		if ( config.notrycatch ) {
			this.callback.call(this.testEnvironment);
			return;
		}
		try {
			this.callback.call(this.testEnvironment);
		} catch(e) {
			fail("Test " + this.testName + " died, exception and test follows", e, this.callback);
			QUnit.ok( false, "Died on test #" + (this.assertions.length + 1) + ": " + e.message + " - " + QUnit.jsDump.parse(e) );
			// else next test will carry the responsibility
			saveGlobal();

			// Restart the tests if they're blocking
			if ( config.blocking ) {
				start();
			}
		}
	},
	teardown: function() {
		try {
			checkPollution();
			this.testEnvironment.teardown.call(this.testEnvironment);
		} catch(e) {
			QUnit.ok( false, "Teardown failed on " + this.testName + ": " + e.message );
		}
	},
	finish: function() {
		if ( this.expected && this.expected != this.assertions.length ) {
			QUnit.ok( false, "Expected " + this.expected + " assertions, but " + this.assertions.length + " were run" );
		}
		
		var good = 0, bad = 0,
			tests = id("qunit-tests");

		config.stats.all += this.assertions.length;
		config.moduleStats.all += this.assertions.length;

		if ( tests ) {
			var ol  = document.createElement("ol");

			for ( var i = 0; i < this.assertions.length; i++ ) {
				var assertion = this.assertions[i];

				var li = document.createElement("li");
				li.className = assertion.result ? "pass" : "fail";
				li.innerHTML = assertion.message || (assertion.result ? "okay" : "failed");
				ol.appendChild( li );

				if ( assertion.result ) {
					good++;
				} else {
					bad++;
					config.stats.bad++;
					config.moduleStats.bad++;
				}
			}

			// store result when possible
			defined.sessionStorage && sessionStorage.setItem("qunit-" + this.testName, bad);

			if (bad == 0) {
				ol.style.display = "none";
			}

			var b = document.createElement("strong");
			b.innerHTML = this.name + " <b class='counts'>(<b class='failed'>" + bad + "</b>, <b class='passed'>" + good + "</b>, " + this.assertions.length + ")</b>";
			
			addEvent(b, "click", function() {
				var next = b.nextSibling, display = next.style.display;
				next.style.display = display === "none" ? "block" : "none";
			});
			
			addEvent(b, "dblclick", function(e) {
				var target = e && e.target ? e.target : window.event.srcElement;
				if ( target.nodeName.toLowerCase() == "span" || target.nodeName.toLowerCase() == "b" ) {
					target = target.parentNode;
				}
				if ( window.location && target.nodeName.toLowerCase() === "strong" ) {
					window.location.search = "?" + encodeURIComponent(getText([target]).replace(/\(.+\)$/, "").replace(/(^\s*|\s*$)/g, ""));
				}
			});

			var li = id(this.id);
			li.className = bad ? "fail" : "pass";
			li.style.display = resultDisplayStyle(!bad);
			li.removeChild( li.firstChild );
			li.appendChild( b );
			li.appendChild( ol );

		} else {
			for ( var i = 0; i < this.assertions.length; i++ ) {
				if ( !this.assertions[i].result ) {
					bad++;
					config.stats.bad++;
					config.moduleStats.bad++;
				}
			}
		}

		try {
			QUnit.reset();
		} catch(e) {
			fail("reset() failed, following Test " + this.testName + ", exception and reset fn follows", e, QUnit.reset);
		}

		QUnit.testDone( {
			name: this.testName,
			failed: bad,
			passed: this.assertions.length - bad,
			total: this.assertions.length
		} );
	},
	
	queue: function() {
		var test = this;
		synchronize(function() {
			test.init();
		});
		function run() {
			// each of these can by async
			synchronize(function() {
				test.setup();
			});
			synchronize(function() {
				test.run();
			});
			synchronize(function() {
				test.teardown();
			});
			synchronize(function() {
				test.finish();
			});
		}
		// defer when previous test run passed, if storage is available
		var bad = defined.sessionStorage && +sessionStorage.getItem("qunit-" + this.testName);
		if (bad) {
			run();
		} else {
			synchronize(run);
		};
	}
	
}

var QUnit = {

	// call on start of module test to prepend name to all tests
	module: function(name, testEnvironment) {
		config.currentModule = name;
		config.currentModuleTestEnviroment = testEnvironment;
	},

	asyncTest: function(testName, expected, callback) {
		if ( arguments.length === 2 ) {
			callback = expected;
			expected = 0;
		}

		QUnit.test(testName, expected, callback, true);
	},
	
	test: function(testName, expected, callback, async) {
		var name = '<span class="test-name">' + testName + '</span>', testEnvironmentArg;

		if ( arguments.length === 2 ) {
			callback = expected;
			expected = null;
		}
		// is 2nd argument a testEnvironment?
		if ( expected && typeof expected === 'object') {
			testEnvironmentArg =  expected;
			expected = null;
		}

		if ( config.currentModule ) {
			name = '<span class="module-name">' + config.currentModule + "</span>: " + name;
		}

		if ( !validTest(config.currentModule + ": " + testName) ) {
			return;
		}
		
		var test = new Test(name, testName, expected, testEnvironmentArg, async, callback);
		test.module = config.currentModule;
		test.moduleTestEnvironment = config.currentModuleTestEnviroment;
		test.queue();
	},
	
	/**
	 * Specify the number of expected assertions to gurantee that failed test (no assertions are run at all) don't slip through.
	 */
	expect: function(asserts) {
		config.current.expected = asserts;
	},

	/**
	 * Asserts true.
	 * @example ok( "asdfasdf".length > 5, "There must be at least 5 chars" );
	 */
	ok: function(a, msg) {
		a = !!a;
		var details = {
			result: a,
			message: msg
		};
		msg = escapeHtml(msg);
		QUnit.log(details);
		config.current.assertions.push({
			result: a,
			message: msg
		});
	},

	/**
	 * Checks that the first two arguments are equal, with an optional message.
	 * Prints out both actual and expected values.
	 *
	 * Prefered to ok( actual == expected, message )
	 *
	 * @example equal( format("Received {0} bytes.", 2), "Received 2 bytes." );
	 *
	 * @param Object actual
	 * @param Object expected
	 * @param String message (optional)
	 */
	equal: function(actual, expected, message) {
		QUnit.push(expected == actual, actual, expected, message);
	},

	notEqual: function(actual, expected, message) {
		QUnit.push(expected != actual, actual, expected, message);
	},
	
	deepEqual: function(actual, expected, message) {
		QUnit.push(QUnit.equiv(actual, expected), actual, expected, message);
	},

	notDeepEqual: function(actual, expected, message) {
		QUnit.push(!QUnit.equiv(actual, expected), actual, expected, message);
	},

	strictEqual: function(actual, expected, message) {
		QUnit.push(expected === actual, actual, expected, message);
	},

	notStrictEqual: function(actual, expected, message) {
		QUnit.push(expected !== actual, actual, expected, message);
	},

	raises: function(block, expected, message) {
		var actual, ok = false;
	
		if (typeof expected === 'string') {
			message = expected;
			expected = null;
		}
	
		try {
			block();
		} catch (e) {
			actual = e;
		}
	
		if (actual) {
			// we don't want to validate thrown error
			if (!expected) {
				ok = true;
			// expected is a regexp	
			} else if (QUnit.objectType(expected) === "regexp") {
				ok = expected.test(actual);
			// expected is a constructor	
			} else if (actual instanceof expected) {
				ok = true;
			// expected is a validation function which returns true is validation passed	
			} else if (expected.call({}, actual) === true) {
				ok = true;
			}
		}
			
		QUnit.ok(ok, message);
	},

	start: function() {
		config.semaphore--;
		if (config.semaphore > 0) {
			// don't start until equal number of stop-calls
			return;
		}
		if (config.semaphore < 0) {
			// ignore if start is called more often then stop
			config.semaphore = 0;
		}
		// A slight delay, to avoid any current callbacks
		if ( defined.setTimeout ) {
			window.setTimeout(function() {
				if ( config.timeout ) {
					clearTimeout(config.timeout);
				}

				config.blocking = false;
				process();
			}, 13);
		} else {
			config.blocking = false;
			process();
		}
	},
	
	stop: function(timeout) {
		config.semaphore++;
		config.blocking = true;

		if ( timeout && defined.setTimeout ) {
			clearTimeout(config.timeout);
			config.timeout = window.setTimeout(function() {
				QUnit.ok( false, "Test timed out" );
				QUnit.start();
			}, timeout);
		}
	}

};

// Backwards compatibility, deprecated
QUnit.equals = QUnit.equal;
QUnit.same = QUnit.deepEqual;

// Maintain internal state
var config = {
	// The queue of tests to run
	queue: [],

	// block until document ready
	blocking: true
};

// Load paramaters
(function() {
	var location = window.location || { search: "", protocol: "file:" },
		GETParams = location.search.slice(1).split('&');

	for ( var i = 0; i < GETParams.length; i++ ) {
		GETParams[i] = decodeURIComponent( GETParams[i] );
		if ( GETParams[i] === "noglobals" ) {
			GETParams.splice( i, 1 );
			i--;
			config.noglobals = true;
		} else if ( GETParams[i] === "notrycatch" ) {
			GETParams.splice( i, 1 );
			i--;
			config.notrycatch = true;
		} else if ( GETParams[i].search('=') > -1 ) {
			GETParams.splice( i, 1 );
			i--;
		}
	}
	
	// restrict modules/tests by get parameters
	config.filters = GETParams;
	
	// Figure out if we're running the tests from a server or not
	QUnit.isLocal = !!(location.protocol === 'file:');
})();

// Expose the API as global variables, unless an 'exports'
// object exists, in that case we assume we're in CommonJS
if ( typeof exports === "undefined" || typeof require === "undefined" ) {
	extend(window, QUnit);
	window.QUnit = QUnit;
} else {
	extend(exports, QUnit);
	exports.QUnit = QUnit;
}

// define these after exposing globals to keep them in these QUnit namespace only
extend(QUnit, {
	config: config,

	// Initialize the configuration options
	init: function() {
		extend(config, {
			stats: { all: 0, bad: 0 },
			moduleStats: { all: 0, bad: 0 },
			started: +new Date,
			updateRate: 1000,
			blocking: false,
			autostart: true,
			autorun: false,
			filters: [],
			queue: [],
			semaphore: 0
		});

		var tests = id("qunit-tests"),
			banner = id("qunit-banner"),
			result = id("qunit-testresult");

		if ( tests ) {
			tests.innerHTML = "";
		}

		if ( banner ) {
			banner.className = "";
		}

		if ( result ) {
			result.parentNode.removeChild( result );
		}
	},
	
	/**
	 * Resets the test setup. Useful for tests that modify the DOM.
	 * 
	 * If jQuery is available, uses jQuery's html(), otherwise just innerHTML.
	 */
	reset: function() {
		if ( window.jQuery ) {
			jQuery( "#main, #qunit-fixture" ).html( config.fixture );
		} else {
			var main = id( 'main' ) || id( 'qunit-fixture' );
			if ( main ) {
				main.innerHTML = config.fixture;
			}
		}
	},
	
	/**
	 * Trigger an event on an element.
	 *
	 * @example triggerEvent( document.body, "click" );
	 *
	 * @param DOMElement elem
	 * @param String type
	 */
	triggerEvent: function( elem, type, event ) {
		if ( document.createEvent ) {
			event = document.createEvent("MouseEvents");
			event.initMouseEvent(type, true, true, elem.ownerDocument.defaultView,
				0, 0, 0, 0, 0, false, false, false, false, 0, null);
			elem.dispatchEvent( event );

		} else if ( elem.fireEvent ) {
			elem.fireEvent("on"+type);
		}
	},
	
	// Safe object type checking
	is: function( type, obj ) {
		return QUnit.objectType( obj ) == type;
	},
	
	objectType: function( obj ) {
		if (typeof obj === "undefined") {
				return "undefined";

		// consider: typeof null === object
		}
		if (obj === null) {
				return "null";
		}

		var type = Object.prototype.toString.call( obj )
			.match(/^\[object\s(.*)\]$/)[1] || '';

		switch (type) {
				case 'Number':
						if (isNaN(obj)) {
								return "nan";
						} else {
								return "number";
						}
				case 'String':
				case 'Boolean':
				case 'Array':
				case 'Date':
				case 'RegExp':
				case 'Function':
						return type.toLowerCase();
		}
		if (typeof obj === "object") {
				return "object";
		}
		return undefined;
	},
	
	push: function(result, actual, expected, message) {
		var details = {
			result: result,
			message: message,
			actual: actual,
			expected: expected
		};
		
		message = escapeHtml(message) || (result ? "okay" : "failed");
		message = '<span class="test-message">' + message + "</span>";
		expected = escapeHtml(QUnit.jsDump.parse(expected));
		actual = escapeHtml(QUnit.jsDump.parse(actual));
		var output = message + '<table><tr class="test-expected"><th>Expected: </th><td><pre>' + expected + '</pre></td></tr>';
		if (actual != expected) {
			output += '<tr class="test-actual"><th>Result: </th><td><pre>' + actual + '</pre></td></tr>';
			output += '<tr class="test-diff"><th>Diff: </th><td><pre>' + QUnit.diff(expected, actual) +'</pre></td></tr>';
		}
		if (!result) {
			var source = sourceFromStacktrace();
			if (source) {
				details.source = source;
				output += '<tr class="test-source"><th>Source: </th><td><pre>' + source +'</pre></td></tr>';
			}
		}
		output += "</table>";
		
		QUnit.log(details);
		
		config.current.assertions.push({
			result: !!result,
			message: output
		});
	},
	
	// Logging callbacks; all receive a single argument with the listed properties
	// run test/logs.html for any related changes
	begin: function() {},
	// done: { failed, passed, total, runtime }
	done: function() {},
	// log: { result, actual, expected, message }
	log: function() {},
	// testStart: { name }
	testStart: function() {},
	// testDone: { name, failed, passed, total }
	testDone: function() {},
	// moduleStart: { name }
	moduleStart: function() {},
	// moduleDone: { name, failed, passed, total }
	moduleDone: function() {}
});

if ( typeof document === "undefined" || document.readyState === "complete" ) {
	config.autorun = true;
}

addEvent(window, "load", function() {
	QUnit.begin({});
	
	// Initialize the config, saving the execution queue
	var oldconfig = extend({}, config);
	QUnit.init();
	extend(config, oldconfig);

	config.blocking = false;

	var userAgent = id("qunit-userAgent");
	if ( userAgent ) {
		userAgent.innerHTML = navigator.userAgent;
	}
	var banner = id("qunit-header");
	if ( banner ) {
		var paramsIndex = location.href.lastIndexOf(location.search);
		if ( paramsIndex > -1 ) {
			var mainPageLocation = location.href.slice(0, paramsIndex);
			if ( mainPageLocation == location.href ) {
				banner.innerHTML = '<a href=""> ' + banner.innerHTML + '</a> ';
			} else {
				var testName = decodeURIComponent(location.search.slice(1));
				banner.innerHTML = '<a href="' + mainPageLocation + '">' + banner.innerHTML + '</a> &#8250; <a href="">' + testName + '</a>';
			}
		}
	}
	
	var toolbar = id("qunit-testrunner-toolbar");
	if ( toolbar ) {
		var filter = document.createElement("input");
		filter.type = "checkbox";
		filter.id = "qunit-filter-pass";
		addEvent( filter, "click", function() {
			var li = document.getElementsByTagName("li");
			for ( var i = 0; i < li.length; i++ ) {
				if ( li[i].className.indexOf("pass") > -1 ) {
					li[i].style.display = filter.checked ? "none" : "";
				}
			}
			if ( defined.sessionStorage ) {
				sessionStorage.setItem("qunit-filter-passed-tests", filter.checked ? "true" : "");
			}
		});
		if ( defined.sessionStorage && sessionStorage.getItem("qunit-filter-passed-tests") ) {
			filter.checked = true;
		}
		toolbar.appendChild( filter );

		var label = document.createElement("label");
		label.setAttribute("for", "qunit-filter-pass");
		label.innerHTML = "Hide passed tests";
		toolbar.appendChild( label );
	}

	var main = id('main') || id('qunit-fixture');
	if ( main ) {
		config.fixture = main.innerHTML;
	}

	if (config.autostart) {
		QUnit.start();
	}
});

function done() {
	config.autorun = true;

	// Log the last module results
	if ( config.currentModule ) {
		QUnit.moduleDone( {
			name: config.currentModule,
			failed: config.moduleStats.bad,
			passed: config.moduleStats.all - config.moduleStats.bad,
			total: config.moduleStats.all
		} );
	}

	var banner = id("qunit-banner"),
		tests = id("qunit-tests"),
		runtime = +new Date - config.started,
		passed = config.stats.all - config.stats.bad,
		html = [
			'Tests completed in ',
			runtime,
			' milliseconds.<br/>',
			'<span class="passed">',
			passed,
			'</span> tests of <span class="total">',
			config.stats.all,
			'</span> passed, <span class="failed">',
			config.stats.bad,
			'</span> failed.'
		].join('');

	if ( banner ) {
		banner.className = (config.stats.bad ? "qunit-fail" : "qunit-pass");
	}

	if ( tests ) {	
		var result = id("qunit-testresult");

		if ( !result ) {
			result = document.createElement("p");
			result.id = "qunit-testresult";
			result.className = "result";
			tests.parentNode.insertBefore( result, tests.nextSibling );
		}

		result.innerHTML = html;
	}

	QUnit.done( {
		failed: config.stats.bad,
		passed: passed, 
		total: config.stats.all,
		runtime: runtime
	} );
}

function validTest( name ) {
	var i = config.filters.length,
		run = false;

	if ( !i ) {
		return true;
	}
	
	while ( i-- ) {
		var filter = config.filters[i],
			not = filter.charAt(0) == '!';

		if ( not ) {
			filter = filter.slice(1);
		}

		if ( name.indexOf(filter) !== -1 ) {
			return !not;
		}

		if ( not ) {
			run = true;
		}
	}

	return run;
}

// so far supports only Firefox, Chrome and Opera (buggy)
// could be extended in the future to use something like https://github.com/csnover/TraceKit
function sourceFromStacktrace() {
	try {
		throw new Error();
	} catch ( e ) {
		if (e.stacktrace) {
			// Opera
			return e.stacktrace.split("\n")[6];
		} else if (e.stack) {
			// Firefox, Chrome
			return e.stack.split("\n")[4];
		}
	}
}

function resultDisplayStyle(passed) {
	return passed && id("qunit-filter-pass") && id("qunit-filter-pass").checked ? 'none' : '';
}

function escapeHtml(s) {
	if (!s) {
		return "";
	}
	s = s + "";
	return s.replace(/[\&"<>\\]/g, function(s) {
		switch(s) {
			case "&": return "&amp;";
			case "\\": return "\\\\";
			case '"': return '\"';
			case "<": return "&lt;";
			case ">": return "&gt;";
			default: return s;
		}
	});
}

function synchronize( callback ) {
	config.queue.push( callback );

	if ( config.autorun && !config.blocking ) {
		process();
	}
}

function process() {
	var start = (new Date()).getTime();

	while ( config.queue.length && !config.blocking ) {
		if ( config.updateRate <= 0 || (((new Date()).getTime() - start) < config.updateRate) ) {
			config.queue.shift()();
		} else {
			window.setTimeout( process, 13 );
			break;
		}
	}
  if (!config.blocking && !config.queue.length) {
    done();
  }
}

function saveGlobal() {
	config.pollution = [];
	
	if ( config.noglobals ) {
		for ( var key in window ) {
			config.pollution.push( key );
		}
	}
}

function checkPollution( name ) {
	var old = config.pollution;
	saveGlobal();
	
	var newGlobals = diff( old, config.pollution );
	if ( newGlobals.length > 0 ) {
		ok( false, "Introduced global variable(s): " + newGlobals.join(", ") );
		config.current.expected++;
	}

	var deletedGlobals = diff( config.pollution, old );
	if ( deletedGlobals.length > 0 ) {
		ok( false, "Deleted global variable(s): " + deletedGlobals.join(", ") );
		config.current.expected++;
	}
}

// returns a new Array with the elements that are in a but not in b
function diff( a, b ) {
	var result = a.slice();
	for ( var i = 0; i < result.length; i++ ) {
		for ( var j = 0; j < b.length; j++ ) {
			if ( result[i] === b[j] ) {
				result.splice(i, 1);
				i--;
				break;
			}
		}
	}
	return result;
}

function fail(message, exception, callback) {
	if ( typeof console !== "undefined" && console.error && console.warn ) {
		console.error(message);
		console.error(exception);
		console.warn(callback.toString());

	} else if ( window.opera && opera.postError ) {
		opera.postError(message, exception, callback.toString);
	}
}

function extend(a, b) {
	for ( var prop in b ) {
		a[prop] = b[prop];
	}

	return a;
}

function addEvent(elem, type, fn) {
	if ( elem.addEventListener ) {
		elem.addEventListener( type, fn, false );
	} else if ( elem.attachEvent ) {
		elem.attachEvent( "on" + type, fn );
	} else {
		fn();
	}
}

function id(name) {
	return !!(typeof document !== "undefined" && document && document.getElementById) &&
		document.getElementById( name );
}

// Test for equality any JavaScript type.
// Discussions and reference: http://philrathe.com/articles/equiv
// Test suites: http://philrathe.com/tests/equiv
// Author: Philippe Rathé <prathe@gmail.com>
QUnit.equiv = function () {

    var innerEquiv; // the real equiv function
    var callers = []; // stack to decide between skip/abort functions
    var parents = []; // stack to avoiding loops from circular referencing

    // Call the o related callback with the given arguments.
    function bindCallbacks(o, callbacks, args) {
        var prop = QUnit.objectType(o);
        if (prop) {
            if (QUnit.objectType(callbacks[prop]) === "function") {
                return callbacks[prop].apply(callbacks, args);
            } else {
                return callbacks[prop]; // or undefined
            }
        }
    }
    
    var callbacks = function () {

        // for string, boolean, number and null
        function useStrictEquality(b, a) {
            if (b instanceof a.constructor || a instanceof b.constructor) {
                // to catch short annotaion VS 'new' annotation of a declaration
                // e.g. var i = 1;
                //      var j = new Number(1);
                return a == b;
            } else {
                return a === b;
            }
        }

        return {
            "string": useStrictEquality,
            "boolean": useStrictEquality,
            "number": useStrictEquality,
            "null": useStrictEquality,
            "undefined": useStrictEquality,

            "nan": function (b) {
                return isNaN(b);
            },

            "date": function (b, a) {
                return QUnit.objectType(b) === "date" && a.valueOf() === b.valueOf();
            },

            "regexp": function (b, a) {
                return QUnit.objectType(b) === "regexp" &&
                    a.source === b.source && // the regex itself
                    a.global === b.global && // and its modifers (gmi) ...
                    a.ignoreCase === b.ignoreCase &&
                    a.multiline === b.multiline;
            },

            // - skip when the property is a method of an instance (OOP)
            // - abort otherwise,
            //   initial === would have catch identical references anyway
            "function": function () {
                var caller = callers[callers.length - 1];
                return caller !== Object &&
                        typeof caller !== "undefined";
            },

            "array": function (b, a) {
                var i, j, loop;
                var len;

                // b could be an object literal here
                if ( ! (QUnit.objectType(b) === "array")) {
                    return false;
                }   
                
                len = a.length;
                if (len !== b.length) { // safe and faster
                    return false;
                }
                
                //track reference to avoid circular references
                parents.push(a);
                for (i = 0; i < len; i++) {
                    loop = false;
                    for(j=0;j<parents.length;j++){
                        if(parents[j] === a[i]){
                            loop = true;//dont rewalk array
                        }
                    }
                    if (!loop && ! innerEquiv(a[i], b[i])) {
                        parents.pop();
                        return false;
                    }
                }
                parents.pop();
                return true;
            },

            "object": function (b, a) {
                var i, j, loop;
                var eq = true; // unless we can proove it
                var aProperties = [], bProperties = []; // collection of strings

                // comparing constructors is more strict than using instanceof
                if ( a.constructor !== b.constructor) {
                    return false;
                }

                // stack constructor before traversing properties
                callers.push(a.constructor);
                //track reference to avoid circular references
                parents.push(a);
                
                for (i in a) { // be strict: don't ensures hasOwnProperty and go deep
                    loop = false;
                    for(j=0;j<parents.length;j++){
                        if(parents[j] === a[i])
                            loop = true; //don't go down the same path twice
                    }
                    aProperties.push(i); // collect a's properties

                    if (!loop && ! innerEquiv(a[i], b[i])) {
                        eq = false;
                        break;
                    }
                }

                callers.pop(); // unstack, we are done
                parents.pop();

                for (i in b) {
                    bProperties.push(i); // collect b's properties
                }

                // Ensures identical properties name
                return eq && innerEquiv(aProperties.sort(), bProperties.sort());
            }
        };
    }();

    innerEquiv = function () { // can take multiple arguments
        var args = Array.prototype.slice.apply(arguments);
        if (args.length < 2) {
            return true; // end transition
        }

        return (function (a, b) {
            if (a === b) {
                return true; // catch the most you can
            } else if (a === null || b === null || typeof a === "undefined" || typeof b === "undefined" || QUnit.objectType(a) !== QUnit.objectType(b)) {
                return false; // don't lose time with error prone cases
            } else {
                return bindCallbacks(a, callbacks, [b, a]);
            }

        // apply transition with (1..n) arguments
        })(args[0], args[1]) && arguments.callee.apply(this, args.splice(1, args.length -1));
    };

    return innerEquiv;

}();

/**
 * jsDump
 * Copyright (c) 2008 Ariel Flesler - aflesler(at)gmail(dot)com | http://flesler.blogspot.com
 * Licensed under BSD (http://www.opensource.org/licenses/bsd-license.php)
 * Date: 5/15/2008
 * @projectDescription Advanced and extensible data dumping for Javascript.
 * @version 1.0.0
 * @author Ariel Flesler
 * @link {http://flesler.blogspot.com/2008/05/jsdump-pretty-dump-of-any-javascript.html}
 */
QUnit.jsDump = (function() {
	function quote( str ) {
		return '"' + str.toString().replace(/"/g, '\\"') + '"';
	};
	function literal( o ) {
		return o + '';	
	};
	function join( pre, arr, post ) {
		var s = jsDump.separator(),
			base = jsDump.indent(),
			inner = jsDump.indent(1);
		if ( arr.join )
			arr = arr.join( ',' + s + inner );
		if ( !arr )
			return pre + post;
		return [ pre, inner + arr, base + post ].join(s);
	};
	function array( arr ) {
		var i = arr.length,	ret = Array(i);					
		this.up();
		while ( i-- )
			ret[i] = this.parse( arr[i] );				
		this.down();
		return join( '[', ret, ']' );
	};
	
	var reName = /^function (\w+)/;
	
	var jsDump = {
		parse:function( obj, type ) { //type is used mostly internally, you can fix a (custom)type in advance
			var	parser = this.parsers[ type || this.typeOf(obj) ];
			type = typeof parser;			
			
			return type == 'function' ? parser.call( this, obj ) :
				   type == 'string' ? parser :
				   this.parsers.error;
		},
		typeOf:function( obj ) {
			var type;
			if ( obj === null ) {
				type = "null";
			} else if (typeof obj === "undefined") {
				type = "undefined";
			} else if (QUnit.is("RegExp", obj)) {
				type = "regexp";
			} else if (QUnit.is("Date", obj)) {
				type = "date";
			} else if (QUnit.is("Function", obj)) {
				type = "function";
			} else if (typeof obj.setInterval !== undefined && typeof obj.document !== "undefined" && typeof obj.nodeType === "undefined") {
				type = "window";
			} else if (obj.nodeType === 9) {
				type = "document";
			} else if (obj.nodeType) {
				type = "node";
			} else if (typeof obj === "object" && typeof obj.length === "number" && obj.length >= 0) {
				type = "array";
			} else {
				type = typeof obj;
			}
			return type;
		},
		separator:function() {
			return this.multiline ?	this.HTML ? '<br />' : '\n' : this.HTML ? '&nbsp;' : ' ';
		},
		indent:function( extra ) {// extra can be a number, shortcut for increasing-calling-decreasing
			if ( !this.multiline )
				return '';
			var chr = this.indentChar;
			if ( this.HTML )
				chr = chr.replace(/\t/g,'   ').replace(/ /g,'&nbsp;');
			return Array( this._depth_ + (extra||0) ).join(chr);
		},
		up:function( a ) {
			this._depth_ += a || 1;
		},
		down:function( a ) {
			this._depth_ -= a || 1;
		},
		setParser:function( name, parser ) {
			this.parsers[name] = parser;
		},
		// The next 3 are exposed so you can use them
		quote:quote, 
		literal:literal,
		join:join,
		//
		_depth_: 1,
		// This is the list of parsers, to modify them, use jsDump.setParser
		parsers:{
			window: '[Window]',
			document: '[Document]',
			error:'[ERROR]', //when no parser is found, shouldn't happen
			unknown: '[Unknown]',
			'null':'null',
			undefined:'undefined',
			'function':function( fn ) {
				var ret = 'function',
					name = 'name' in fn ? fn.name : (reName.exec(fn)||[])[1];//functions never have name in IE
				if ( name )
					ret += ' ' + name;
				ret += '(';
				
				ret = [ ret, QUnit.jsDump.parse( fn, 'functionArgs' ), '){'].join('');
				return join( ret, QUnit.jsDump.parse(fn,'functionCode'), '}' );
			},
			array: array,
			nodelist: array,
			arguments: array,
			object:function( map ) {
				var ret = [ ];
				QUnit.jsDump.up();
				for ( var key in map )
					ret.push( QUnit.jsDump.parse(key,'key') + ': ' + QUnit.jsDump.parse(map[key]) );
				QUnit.jsDump.down();
				return join( '{', ret, '}' );
			},
			node:function( node ) {
				var open = QUnit.jsDump.HTML ? '&lt;' : '<',
					close = QUnit.jsDump.HTML ? '&gt;' : '>';
					
				var tag = node.nodeName.toLowerCase(),
					ret = open + tag;
					
				for ( var a in QUnit.jsDump.DOMAttrs ) {
					var val = node[QUnit.jsDump.DOMAttrs[a]];
					if ( val )
						ret += ' ' + a + '=' + QUnit.jsDump.parse( val, 'attribute' );
				}
				return ret + close + open + '/' + tag + close;
			},
			functionArgs:function( fn ) {//function calls it internally, it's the arguments part of the function
				var l = fn.length;
				if ( !l ) return '';				
				
				var args = Array(l);
				while ( l-- )
					args[l] = String.fromCharCode(97+l);//97 is 'a'
				return ' ' + args.join(', ') + ' ';
			},
			key:quote, //object calls it internally, the key part of an item in a map
			functionCode:'[code]', //function calls it internally, it's the content of the function
			attribute:quote, //node calls it internally, it's an html attribute value
			string:quote,
			date:quote,
			regexp:literal, //regex
			number:literal,
			'boolean':literal
		},
		DOMAttrs:{//attributes to dump from nodes, name=>realName
			id:'id',
			name:'name',
			'class':'className'
		},
		HTML:false,//if true, entities are escaped ( <, >, \t, space and \n )
		indentChar:'  ',//indentation unit
		multiline:true //if true, items in a collection, are separated by a \n, else just a space.
	};

	return jsDump;
})();

// from Sizzle.js
function getText( elems ) {
	var ret = "", elem;

	for ( var i = 0; elems[i]; i++ ) {
		elem = elems[i];

		// Get the text from text nodes and CDATA nodes
		if ( elem.nodeType === 3 || elem.nodeType === 4 ) {
			ret += elem.nodeValue;

		// Traverse everything else, except comment nodes
		} else if ( elem.nodeType !== 8 ) {
			ret += getText( elem.childNodes );
		}
	}

	return ret;
};

/*
 * Javascript Diff Algorithm
 *  By John Resig (http://ejohn.org/)
 *  Modified by Chu Alan "sprite"
 *
 * Released under the MIT license.
 *
 * More Info:
 *  http://ejohn.org/projects/javascript-diff-algorithm/
 *  
 * Usage: QUnit.diff(expected, actual)
 * 
 * QUnit.diff("the quick brown fox jumped over", "the quick fox jumps over") == "the  quick <del>brown </del> fox <del>jumped </del><ins>jumps </ins> over"
 */
QUnit.diff = (function() {
	function diff(o, n){
		var ns = new Object();
		var os = new Object();
		
		for (var i = 0; i < n.length; i++) {
			if (ns[n[i]] == null) 
				ns[n[i]] = {
					rows: new Array(),
					o: null
				};
			ns[n[i]].rows.push(i);
		}
		
		for (var i = 0; i < o.length; i++) {
			if (os[o[i]] == null) 
				os[o[i]] = {
					rows: new Array(),
					n: null
				};
			os[o[i]].rows.push(i);
		}
		
		for (var i in ns) {
			if (ns[i].rows.length == 1 && typeof(os[i]) != "undefined" && os[i].rows.length == 1) {
				n[ns[i].rows[0]] = {
					text: n[ns[i].rows[0]],
					row: os[i].rows[0]
				};
				o[os[i].rows[0]] = {
					text: o[os[i].rows[0]],
					row: ns[i].rows[0]
				};
			}
		}
		
		for (var i = 0; i < n.length - 1; i++) {
			if (n[i].text != null && n[i + 1].text == null && n[i].row + 1 < o.length && o[n[i].row + 1].text == null &&
			n[i + 1] == o[n[i].row + 1]) {
				n[i + 1] = {
					text: n[i + 1],
					row: n[i].row + 1
				};
				o[n[i].row + 1] = {
					text: o[n[i].row + 1],
					row: i + 1
				};
			}
		}
		
		for (var i = n.length - 1; i > 0; i--) {
			if (n[i].text != null && n[i - 1].text == null && n[i].row > 0 && o[n[i].row - 1].text == null &&
			n[i - 1] == o[n[i].row - 1]) {
				n[i - 1] = {
					text: n[i - 1],
					row: n[i].row - 1
				};
				o[n[i].row - 1] = {
					text: o[n[i].row - 1],
					row: i - 1
				};
			}
		}
		
		return {
			o: o,
			n: n
		};
	}
	
	return function(o, n){
		o = o.replace(/\s+$/, '');
		n = n.replace(/\s+$/, '');
		var out = diff(o == "" ? [] : o.split(/\s+/), n == "" ? [] : n.split(/\s+/));

		var str = "";
		
		var oSpace = o.match(/\s+/g);
		if (oSpace == null) {
			oSpace = [" "];
		}
		else {
			oSpace.push(" ");
		}
		var nSpace = n.match(/\s+/g);
		if (nSpace == null) {
			nSpace = [" "];
		}
		else {
			nSpace.push(" ");
		}
		
		if (out.n.length == 0) {
			for (var i = 0; i < out.o.length; i++) {
				str += '<del>' + out.o[i] + oSpace[i] + "</del>";
			}
		}
		else {
			if (out.n[0].text == null) {
				for (n = 0; n < out.o.length && out.o[n].text == null; n++) {
					str += '<del>' + out.o[n] + oSpace[n] + "</del>";
				}
			}
			
			for (var i = 0; i < out.n.length; i++) {
				if (out.n[i].text == null) {
					str += '<ins>' + out.n[i] + nSpace[i] + "</ins>";
				}
				else {
					var pre = "";
					
					for (n = out.n[i].row + 1; n < out.o.length && out.o[n].text == null; n++) {
						pre += '<del>' + out.o[n] + oSpace[n] + "</del>";
					}
					str += " " + out.n[i].text + nSpace[i] + pre;
				}
			}
		}
		
		return str;
	};
})();

})(this);

}};
__resources__["/__builtin__/libs/util.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
var path = require('path');

/**
 * @namespace
 * Useful utility functions
 */
var util = {
    /**
     * Merge two or more objects and return the result.
     *
     * @param {Object} firstObject First object to merge with
     * @param {Object} secondObject Second object to merge with
     * @param {Object} [...] More objects to merge
     * @returns {Object} A new object containing the properties of all the objects passed in
     */
    merge: function(firstObject, secondObject) {
        var result = {};

        for (var i = 0; i < arguments.length; i++) {
            var obj = arguments[i];

            for (var x in obj) {
                if (!obj.hasOwnProperty(x)) {
                    continue;
                }

                result[x] = obj[x];
            }
        };

        return result;
    },

    /**
     * Creates a deep copy of an object
     *
     * @param {Object} obj The Object to copy
     * @returns {Object} A copy of the original Object
     */
    copy: function(obj) {
        if (obj === null) {
            return null;
        }

        var copy;

        if (obj instanceof Array) {
            copy = [];
            for (var i = 0, len = obj.length; i < len; i++) {
                copy[i] = arguments.callee(obj[i]);
            }
        } else if (typeof(obj) == 'object') {
            if (typeof(obj.copy) == 'function') {
                copy = obj.copy();
            } else {
                copy = {};

                var o, x;
                for (x in obj) {
                    copy[x] = arguments.callee(obj[x]);
                }
            }
        } else {
            // Primative type. Doesn't need copying
            copy = obj;
        }

        return copy;
    },

    /**
     * Iterates over an array and calls a function for each item.
     *
     * @param {Array} arr An Array to iterate over
     * @param {Function} func A function to call for each item in the array
     * @returns {Array} The original array
     */
    each: function(arr, func) {
        var i = 0,
            len = arr.length;
        for (i = 0; i < len; i++) {
            func(arr[i], i);
        }

        return arr;
    },

    /**
     * Iterates over an array, calls a function for each item and returns the results.
     *
     * @param {Array} arr An Array to iterate over
     * @param {Function} func A function to call for each item in the array
     * @returns {Array} The return values from each function call
     */
    map: function(arr, func) {
        var i = 0,
            len = arr.length,
            result = [];

        for (i = 0; i < len; i++) {
            result.push(func(arr[i], i));
        }

        return result;
    },

    extend: function(target, ext) {
        if (arguments.length < 2) {
            throw "You must provide at least a target and 1 object to extend from"
        }

        var i, j, obj, key, val;

        for (i = 1; i < arguments.length; i++) {
            obj = arguments[i];
            for (key in obj) {
                // Don't copy built-ins
                if (!obj.hasOwnProperty(key)) {
                    continue;
                }

                val = obj[key];
                // Don't copy undefineds or references to target (would cause infinite loop)
                if (val === undefined || val === target) {
                    continue;
                }

                // Replace existing function and store reference to it in .base
                if (val instanceof Function && target[key] && val !== target[key]) {
                    val.base = target[key];
                    val._isProperty = val.base._isProperty;
                }
                target[key] = val;

                if (val instanceof Function) {
                    // If this function observes make a reference to it so we can set
                    // them up when this get instantiated
                    if (val._observing) {
                        // Force a COPY of the array or we will probably end up with various
                        // classes sharing the same one.
                        if (!target._observingFunctions) {
                            target._observingFunctions = [];
                        } else {
                            target._observingFunctions = target._observingFunctions.slice(0);
                        }


                        for (j = 0; j<val._observing.length; j++) {
                            target._observingFunctions.push({property:val._observing[j], method: key});
                        }
                    } // if (val._observing)

                    // If this is a computer property then add it to the list so get/set know where to look
                    if (val._isProperty) {
                        if (!target._computedProperties) {
                            target._computedProperties = [];
                        } else {
                            target._computedProperties = target._computedProperties.slice(0);
                        }

                        target._computedProperties.push(key)
                    }
                }
        
            }
        }


        return target;
    },

    beget: function(o) {
        var F = function(){};
        F.prototype = o;
        var ret  = new F();
        F.prototype = null;
        return ret;
    },

    callback: function(target, method) {
        if (typeof(method) == 'string') {
            var methodName = method;
            method = target[method];
            if (!method) {
                throw "Callback to undefined method: " + methodName;
            }
        }
        if (!method) {
            throw "Callback with no method to call";
        }

        return function() {
            method.apply(target, arguments);
        }
    },

    domReady: function() {
        if (this._isReady) {
            return;
        }

        if (!document.body) {
            setTimeout(function() { util.domReady(); }, 13);
        }

        window.__isReady = true;

        if (window.__readyList) {
            var fn, i = 0;
            while ( (fn = window.__readyList[ i++ ]) ) {
                fn.call(document);
            }

            window.__readyList = null;
            delete window.__readyList;
        }
    },


    /**
     * Adapted from jQuery
     * @ignore
     */
    bindReady: function() {

        if (window.__readyBound) {
            return;
        }

        window.__readyBound = true;

        // Catch cases where $(document).ready() is called after the
        // browser event has already occurred.
        if ( document.readyState === "complete" ) {
            return util.domReady();
        }

        // Mozilla, Opera and webkit nightlies currently support this event
        if ( document.addEventListener ) {
            // Use the handy event callback
            //document.addEventListener( "DOMContentLoaded", DOMContentLoaded, false );
            
            // A fallback to window.onload, that will always work
            window.addEventListener( "load", util.domReady, false );

        // If IE event model is used
        } else if ( document.attachEvent ) {
            // ensure firing before onload,
            // maybe late but safe also for iframes
            //document.attachEvent("onreadystatechange", DOMContentLoaded);
            
            // A fallback to window.onload, that will always work
            window.attachEvent( "onload", util.domReady );

            // If IE and not a frame
            /*
            // continually check to see if the document is ready
            var toplevel = false;

            try {
                toplevel = window.frameElement == null;
            } catch(e) {}

            if ( document.documentElement.doScroll && toplevel ) {
                doScrollCheck();
            }
            */
        }
    },



    ready: function(func) {
        if (window.__isReady) {
            func()
        } else {
            if (!window.__readyList) {
                window.__readyList = [];
            }
            window.__readyList.push(func);
        }

        util.bindReady();
    },


    /**
     * Tests if a given object is an Array
     *
     * @param {Array} ar The object to test
     *
     * @returns {Boolean} True if it is an Array, otherwise false
     */
    isArray: function(ar) {
      return ar instanceof Array
          || (ar && ar !== Object.prototype && util.isArray(ar.__proto__));
    },


    /**
     * Tests if a given object is a RegExp
     *
     * @param {RegExp} ar The object to test
     *
     * @returns {Boolean} True if it is an RegExp, otherwise false
     */
    isRegExp: function(re) {
      var s = ""+re;
      return re instanceof RegExp // easy case
          || typeof(re) === "function" // duck-type for context-switching evalcx case
          && re.constructor.name === "RegExp"
          && re.compile
          && re.test
          && re.exec
          && s.charAt(0) === "/"
          && s.substr(-1) === "/";
    },


    /**
     * Tests if a given object is a Date
     *
     * @param {Date} ar The object to test
     *
     * @returns {Boolean} True if it is an Date, otherwise false
     */
    isDate: function(d) {
        if (d instanceof Date) return true;
        if (typeof d !== "object") return false;
        var properties = Date.prototype && Object.getOwnPropertyNames(Date.prototype);
        var proto = d.__proto__ && Object.getOwnPropertyNames(d.__proto__);
        return JSON.stringify(proto) === JSON.stringify(properties);
    },

    /**
     * Utility to populate a namespace's index with its modules
     *
     * @param {Object} parent The module the namespace lives in. parent.exports will be populated automatically
     * @param {String} modules A space separated string of all the module names
     *
     * @returns {Object} The index namespace
     */
    populateIndex: function(parent, modules) {
        var namespace = {};
        modules = modules.split(' ');

        util.each(modules, function(mod, i) {
            // Use the global 'require' which allows overriding the parent module
            util.extend(namespace, window.require('./' + mod, parent));
        });

        util.extend(parent.exports, namespace);

        return namespace;
    }


}

util.extend(String.prototype, /** @scope String.prototype */ {
    /**
     * Create an array of words from a string
     *
     * @returns {String[]} Array of the words in the string
     */
    w: function() {
        return this.split(' ');
    }
});




module.exports = util;

}};
__resources__["/__builtin__/path.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/** @namespace */
var path = {
    /**
     * Returns full directory path for the filename given. The path must be formed using forward slashes '/'.
     *
     * @param {String} path Path to return the directory name of
     * @returns {String} Directory name
     */
    dirname: function(path) {
        var tokens = path.split('/');
        tokens.pop();
        return tokens.join('/');
    },

    /**
     * Returns just the filename portion of a path.
     *
     * @param {String} path Path to return the filename portion of
     * @returns {String} Filename
     */
    basename: function(path) {
        var tokens = path.split('/');
        return tokens[tokens.length-1];
    },

    /**
     * Joins multiple paths together to form a single path
     * @param {String} ... Any number of string arguments to join together
     * @returns {String} The joined path
     */
    join: function () {
        return module.exports.normalize(Array.prototype.join.call(arguments, "/"));
    },

    /**
     * Tests if a path exists
     *
     * @param {String} path Path to test
     * @returns {Boolean} True if the path exists, false if not
     */
    exists: function(path) {
        return (__resources__[path] !== undefined);
    },

    /**
     * @private
     */
    normalizeArray: function (parts, keepBlanks) {
      var directories = [], prev;
      for (var i = 0, l = parts.length - 1; i <= l; i++) {
        var directory = parts[i];

        // if it's blank, but it's not the first thing, and not the last thing, skip it.
        if (directory === "" && i !== 0 && i !== l && !keepBlanks) continue;

        // if it's a dot, and there was some previous dir already, then skip it.
        if (directory === "." && prev !== undefined) continue;

        // if it starts with "", and is a . or .., then skip it.
        if (directories.length === 1 && directories[0] === "" && (
            directory === "." || directory === "..")) continue;

        if (
          directory === ".."
          && directories.length
          && prev !== ".."
          && prev !== "."
          && prev !== undefined
          && (prev !== "" || keepBlanks)
        ) {
          directories.pop();
          prev = directories.slice(-1)[0]
        } else {
          if (prev === ".") directories.pop();
          directories.push(directory);
          prev = directory;
        }
      }
      return directories;
    },

    /**
     * Returns the real path by expanding any '.' and '..' portions
     *
     * @param {String} path Path to normalize
     * @param {Boolean} [keepBlanks=false] Whether to keep blanks. i.e. double slashes in a path
     * @returns {String} Normalized path
     */
    normalize: function (path, keepBlanks) {
      return module.exports.normalizeArray(path.split("/"), keepBlanks).join("/");
    }
};

module.exports = path;

}};
__resources__["/__builtin__/system.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/** @namespace */
var system = {
    /** @namespace */
    stdio: {
        /**
         * Print text and objects to the debug console if the browser has one
         * 
         * @param {*} Any value to output
         */
        print: function() {
            if (console) {
                console.log.apply(console, arguments);
            } else {
                // TODO
            }
        }
    }
};

if (window.console) {
    system.console = window.console
} else {
    system.console = {
        log: function(){}
    }
}

}};
__resources__["/Background.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
var cocos = require('cocos2d');
var geom = require('geometry');

var Dashboard = require('Dashboard').Dashboard

var Background = cocos.nodes.Node.extend({
    dash: null,
    init: function(lanes) {
        Background.superclass.init.call(this);
        
        // Create the right hand side dash
        var dash = Dashboard.create();
        dash.set('position', new geom.Point(750, 0));
        this.set('dash', dash);
        this.addChild({child: dash});
    },
    
    draw: function(context) {
        // Ground
        context.fillStyle = "#44AA22";
        context.beginPath();
        context.moveTo(-10,50);
        context.lineTo(-10,610);
        context.lineTo(810,610);
        context.lineTo(810,50);
        context.closePath();
        context.fill();
        
        // Sky
        context.fillStyle = "#1122BB";
        context.beginPath();
        context.moveTo(-10,-10);
        context.lineTo(-10,50);
        context.lineTo(810,50);
        context.lineTo(810,-10);
        context.closePath();
        context.fill();
        
        // Road
        context.fillStyle = "#808080";
        context.beginPath();
        context.moveTo(375,50);
        context.lineTo(100,610);
        context.lineTo(700,610);
        context.lineTo(425,50);
        context.closePath();
        context.fill();
        
        // Lanes
        context.strokeStyle = "#FFFF00";
        context.lineWidth = 4
        context.beginPath();
        context.moveTo(390,50);
        context.lineTo(300,610);
        context.stroke();
        context.closePath();
        
        context.beginPath();
        context.moveTo(410,50);
        context.lineTo(500,610);
        context.stroke();
        context.closePath();
    },
});

exports.Background = Background
}};
__resources__["/Dashboard.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
var cocos = require('cocos2d');
var geom = require('geometry');

// Displays the dashboard on the right hand side
// TODO: Add speedometer, race progress, medal tracker, penalty time
var Dashboard = cocos.nodes.Node.extend({
    elapsedTime: null,  // Time in race elapsed so far
    displayTime: null,  // Timer displayed to player
    penaltyTime: null,  // Displayed penalty time
    pTime:null,         // Stores numerical penalty time
    init: function() {
        Dashboard.superclass.init.call(this);
        
        // Create the visible timer
        var opts = Object();
        opts['string'] = '-3.0';
        var disp = cocos.nodes.Label.create(opts);
        disp.set('position', new geom.Point(50, 50));
        this.set('displayTime', disp)
        this.addChild({child: disp});
        this.set('elapsedTime', -3);
        
        opts['string'] = '0.0';
        disp = cocos.nodes.Label.create(opts);
        disp.set('position', new geom.Point(50, 100));
        this.addChild({child: disp});
        this.set('penaltyTime', disp);
        this.set('pTime', 0);
    },
    
    start: function () {
        this.scheduleUpdate();
    },
    
    modifyPenaltyTime: function(dt) {
        this.set('pTime', this.get('pTime') + dt);
        this.get('penaltyTime').set('string', this.get('pTime') + '.0');
    },
    
    // Updates the time
    update: function(dt) {
        var t = this.get('elapsedTime') + dt;
        this.set('elapsedTime', t);
        
        var d = this.get('displayTime');
        // Track to the nearest tenth of a second
        t = Math.round(t*10)
        // Hack to get X.0 to display properly
        if(t % 10 == 0) {
            t = t / 10.0 + ".0";
        }
        else {
            t /= 10;
        }
        d.set('string', t);
    },
    
    // Draws the dash
    draw: function(context) {
        context.fillStyle = "#8B7765";
        context.beginPath();
        context.moveTo(0,-10);
        context.lineTo(0,610);
        context.lineTo(150,610);
        context.lineTo(150,-10);
        context.closePath();
        context.fill();
    },
});

exports.Dashboard = Dashboard
}};
__resources__["/FractionRenderer.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
var cocos = require('cocos2d');
var geom = require('geometry');
var util = require('util');

// TODO: Subclass this off a Value/Expression class or have it pulled in when needed by such a class
var FractionRenderer = cocos.nodes.Node.extend({
    numerator: null,        // The numerator of the fraction
    denominator: null,      // The denominator of the fraction
    bgColor: null,          // Color of the background rectangle
    textColor: null,        // Color of the numerator and denominator (TODO: Seperate colors for each?)
    seperatorColor: null,   // Color of the fraction bar between the numerator and denominator
    init: function(opts) {
        FractionRenderer.superclass.init.call(this);
        this.set('numerator', 1);
        this.set('denominator', 2);
        
        this.set('bgColor', "#FFFFFF");
        this.set('textColor', "#000000");
        this.set('seperatorColor', "#AA2222");
        
        // Set properties from the option object
        util.each('numerator denominator bgColor textColor seperatorColor'.w(), util.callback(this, function (name) {
            if (opts[name]) {
                this.set(name, opts[name]);
            }
        }));
        
        // Create the numerical labels for the numerator and denominator
        var opts = Object();
        opts["string"] = this.get("numerator");
        opts["fontColor"] = this.get("textColor");
        var label = cocos.nodes.Label.create(opts);
        label.set('position', new geom.Point(0, -15));
        this.addChild({child: label});
        
        opts["string"] = this.get("denominator");
        opts["fontColor"] = this.get("textColor");
        label = cocos.nodes.Label.create(opts);
        label.set('position', new geom.Point(0, 15));
        this.addChild({child: label});
        
        this.set('contentSize') = new geom.Size(40, 50);
    },
    
    // Draw the background and the horizontal fraction bar
    draw: function(context) {
        var size = this.get('contentSize');
    
        context.fillStyle = this.get('bgColor');
        context.beginPath();
        context.moveTo(size.width /  2, size.height /  2);
        context.lineTo(size.width /  2, size.height / -2);
        context.lineTo(size.width / -2, size.height / -2);
        context.lineTo(size.width / -2, size.height /  2);
        context.closePath();
        context.fill();
        
        context.strokeStyle = this.get('seperatorColor');
        context.beginPath();
        context.moveTo(size.height /  4, 0);
        context.lineTo(size.height / -4, 0);
        context.closePath();
        context.stroke();
    },
});

// Static helper function to build the creation options object
FractionRenderer.helper = function(n, d, b, t, s) {
    var opts = new Object();
    opts['numerator'] = n;
    opts['denominator'] = d;
    opts['bgColor'] = b;
    opts['textColor' ] = t;
    opts['seperatorColor'] = s;
    
    return opts;
}

exports.FractionRenderer = FractionRenderer
}};
__resources__["/KeyboardLayer.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
// Import the cocos2d module
var cocos = require('cocos2d');
    
// Handles reading keyboard input, allows us to ignore "Key Repeat" settings as the key is either down, or up
var KeyboardLayer = cocos.nodes.Layer.extend({
    keys: null,
    init: function() {
        // You must always call the super class version of init
        KeyboardLayer.superclass.init.call(this);
        
        this.set('isKeyboardEnabled', true);
        
        var keys = new Array(256);
        for(key in keys) {
            key = 0;
        }
        
        this.set('keys', keys);
    },
    
    //Sets key to true when pressed
    keyDown: function(evt) {
        keys = this.get('keys');
        keys[evt.keyCode] = 1;
    },
    //Sets key to false when no longer pressed
    keyUp: function(evt) {
        keys = this.get('keys');
        keys[evt.keyCode] = 0;
    },
    //Check to see if a valid key is pressed
    checkKey: function(keyCode) {
        keys = this.get('keys');
        if(keyCode > -1 && keyCode < 256) {
            var ret = keys[keyCode];
            
            // Lets us know if we have polled this key before and the user has not let it back up
            // Can make this += 1 instead and it would give us total number of frames held
            if(ret == 1) {
                keys[keyCode] = 2;
            }
            return ret;
        }
        
        return false;
    }
});

exports.KeyboardLayer = KeyboardLayer
}};
__resources__["/LabelBG.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
// Import the cocos2d module
var cocos = require('cocos2d');

var LabelBG = cocos.nodes.Node.extend({
    label: null,        //The label that the class wraps
    bgColor: null,      //The color of the background that will be behind the label
    init: function(opts, bgColor) {
        // You must always call the super class version of init
        LabelBG.superclass.init.call(this);
        
        this.set('label', cocos.nodes.Label.create(opts));
        this.addChild({child: this.get('label')});
        
        if(opts.hasOwnProperty('bgColor')) {
            this.set('bgColor', opts['bgColor']);
        }
        else {
            this.set('bgColor', '#FFFFFF');
        }
        this.set('contentSize', this.get('label').get('contentSize'));
    },
    // Draws the background for the label
    draw: function(context) {
        var size = this.get('contentSize');
        
        context.fillStyle = this.get('bgColor');
        context.fillRect(size.width * -0.6, size.height * -0.75, size.width * 1.2, size.height * 1.5);
    }
});

// Static helper function to build the creation options object
LabelBG.helper = function(string, fontColor, bgColor, fontSize, fontName) {
    var opts = Object();
    opts['string'] = string;
    opts['fontColor'] = fontColor;
    opts['bgColor'] = bgColor;
    opts['fontSize'] = fontSize;
    opts['fontName'] = fontName;
    
    return opts;
}

exports.LabelBG = LabelBG
}};
__resources__["/main.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
// Import the cocos2d module
var cocos = require('cocos2d');
var geo = require('geometry');
var events = require('events');

// Project Imports
var Player = require('Player').Player;
var KeyboardLayer = require('KeyboardLayer').KeyboardLayer
var FractionRenderer = require('FractionRenderer').FractionRenderer
var Background = require('Background').Background;
var Question = require('Question').Question;
var QuestionList = require('QuestionList').QuestionList;
var Preloader = require('Preloader').Preloader;
var LabelBG = require('LabelBG').LabelBG;
    
// Create a new layer
var FluencyApp = KeyboardLayer.extend({
    player: null,           // Holds the instance of the player
    background:null,        // Holds the instance of the background object
    currentQuestion:null,   // The current question displayed
    questionList:null,      // List of all questions in the input
    speed:null,             // Current speed in units/second
    speedMin:null,          // Minimum speed in units/second
    speedMax:null,          // Maximum speed in units/second
    nextQuestionDelay:null, // Delay between finishing a question and starting the next one (milliseconds)
    // Not the 'real init', sets up and starts preloading
    init: function() {
        // You must always call the super class version of init
        FluencyApp.superclass.init.call(this);
        
        // Uncomment to run locally
        //this.runLocally()
        
        // Set up remote resources
        __remote_resources__["resources/testset.xml"] = {meta: {mimetype: "text/xml"}, data: "set001.xml"};
        
        // Preload remote resources
        var p = cocos.Preloader.create();
        events.addListener(p, 'complete', this.runRemotely.bind(this));
        p.load();
    },
    // Remote resources failed to load, generate dummy data then proceed
    // TODO: Determine what to do if we get 404s in production
    runLocally: function() {
        console.log("Now running locally from this point forward");
        
        var qlist = QuestionList.create();
        for(var i=0; i<6; i+=1) {
            qlist.addIntermission({selector: 20+i});
            for(var j=0; j<3; j+=1) {
                qlist.addQuestion(Question.create(1, 10+i, 30+i));
            }
        }
        
        this.set('questionList', qlist);
        
        this.preprocessingComplete();
    },
    // Remote resources loaded successfully, proceed as normal
    runRemotely: function() {
        this.parseXML(resource("resources/testset.xml"));
    },
    // Parses (part of) the level xml file
    // TODO: Decide on input file format and rewrite this as needed.
    parseXML: function(xmlDoc) {
        var problemRoot = xmlDoc.getElementsByTagName('PROBLEM_SET')[0];
        
        var qlist = QuestionList.create();

        var subset = problemRoot.firstElementChild;
        
        while(subset != null) {
            var node = subset.firstElementChild;
            if(qlist.addIntermission(node.getAttribute("VALUE"))) {
                var player = Player.create();
                player.set('position', new geo.Point(400, 450));
                player.changeSelector(node.getAttribute("VALUE"));
                this.set('player', player);
            }
            
            var d1, d2, ans;
            node = node.nextElementSibling;
            
            while(node != null) {
                var vals = node.firstElementChild;
                var delims = vals.firstElementChild;
                d1 = delims.getAttribute("VALUE");
                d2 = delims.nextElementSibling.getAttribute("VALUE");
                while(vals != null) {
                    if(vals.tagName == "ANSWER") {
                        ans = vals.getAttribute("VALUE");
                    }
                    
                    vals = vals.nextElementSibling;
                }
                
                qlist.addQuestion(Question.create(ans, d1, d2));
                
                node = node.nextElementSibling;
            }
            
            subset = subset.nextElementSibling;
        }
        
        this.set('questionList', qlist);
        
        this.preprocessingComplete();
    },
    // The 'real init()' called after all the preloading/parsing is completed
    preprocessingComplete: function () {
        // Initializing variables
        var bg = Background.create();
        this.set('background', bg);
        this.addChild({child: bg});
        
        this.addChild({child: this.get('player')});
        
        this.set('elapsedTime', 0.0);
        this.set('speed', 1000);
        this.set('speedMin', 250);
        this.set('speedMax', 8000);
        this.set('nextQuestionDelay', 1000);
        
        // Setup event handling on the QuestionList
        var qlist = this.get('questionList');
        events.addListener(qlist, 'noQuestionsRemaining', this.endOfGame.bind(this));
        events.addListener(qlist, 'intermission', this.intermissionHandler.bind(this));
        events.addListener(qlist, 'QuestionReady', this.nextQuestion.bind(this));
    },
    
    // Three second countdown before the game begins
    countdown: function () {
        this.get('background').get('dash').start();
        setTimeout(this.startGame.bind(this), 3000);
    },
    
    startGame: function () {
        // Start the game
        this.get('questionList').nextQuestion();

        // Schedule per frame update function
        this.scheduleUpdate();
    },
    
    // Called when game ends, should collect results, display them to the screen and output the result XML
    // TODO: Calculate the rest of the statistics needed
    // TODO: Format into XML and send to server
    endOfGame: function(evt) {
        // Stop the dash from updating and increasing the overall elapsed time
        cocos.Scheduler.get('sharedScheduler').unscheduleUpdateForTarget(this.get('background').get('dash'));
    
        // Make sure we remove the final question
        var cq = this.get('currentQuestion');
        if(cq != null) {
            this.removeChild(cq);
        }
    
        var ql = this.get('questionList').get('questions');
        var i = 0, correct = 0, incorrect = 0, unanswered = 0;
        
        // Tally question results
        while(i < ql.length) {
            if(ql[i].get('answeredCorrectly')) {
                correct += 1;
            }
            else if(ql[i].get('answeredCorrectly') == false) {
                incorrect += 1;
            }
            else {
                unanswered += 1;
            }
            i += 1;
        }
        alert("Correct: " + correct);
    },
    
    // Handles when an intermission occurs
    // TODO: Add more visuals on intermission (eg. overhead signs in ft1)
    intermissionHandler: function(selector) {
        if(selector) {
            this.get('player').changeSelector(selector);
            console.log("New subset starting");
            setTimeout(this.get('questionList').nextQuestion, this.get('nextQuestionDelay'));
        }
        else {
            console.log("****ERROR: no new selector given for new subset");
        }
    },
    
    // Handles switching in the next question
    nextQuestion: function(question) {
        var cq = this.get('currentQuestion');
        if(cq != null) {
            cq.unbind('speed');
            this.removeChild(cq);
        }
        
        question.set('speed', this.get('speed'));
        question.bindTo('speed', this, 'speed', true);
        events.addListener(question, 'QuestionTimeExpired', this.answerQuestion.bind(this));
        
        this.addChild(question);
        this.set('currentQuestion', question);
    },
    
    //Handles answering the current question when time expires
    answerQuestion: function() {
        var cq = this.get('currentQuestion');
        var result;
        
        var player = this.get('player');
        var playerPos = player.get('position');
        
        // Determine answer based on the lane
        if(playerPos.x < 325) {
            result = cq.answerQuestion(0);
        }
        else if(playerPos.x < 475) {
            result = cq.answerQuestion(1);
        }
        else {
            result = cq.answerQuestion(2);
        }
        
        // Store the question back in the list
        this.get('questionList').storeQuestion(cq);
        
        // Handle correct / incorrect feedback
        if(result) {
        }
        else {
            player.wipeout(1);
            this.get('background').get('dash').modifyPenaltyTime(8);
        }
        
        // Delays the next question from appearing
        setTimeout(this.get('questionList').nextQuestion, this.get('nextQuestionDelay'));
    },
    
    // Called every frame, manages keyboard input
    update: function(dt) {
        var player = this.get('player');
        var playerPos = player.get('position');
        var s = this.get('speed');
        
    // Move the player according to keyboard
        // 'A' Move left, continuous
        if(this.checkKey(65) > 0) {
            playerPos.x -= 250 * dt
            if(playerPos.x < 225) {
                playerPos.x = 225
            }
            player.set('position', playerPos);
        }
        // 'D' Move right, continuous
        else if(this.checkKey(68) > 0) {
            playerPos.x += 250 * dt
            if(playerPos.x > 575) {
                playerPos.x = 575
            }
            player.set('position', playerPos);
        }
        // 'S' Slow down, press
        // TODO: Discreet or continuous for speed changes?
        // TODO: Parameterize acceleration/braking?
        if(this.checkKey(83) == 1) {
            if(s > this.get('speedMin')) {
                s /= 2;
                this.set('speed', s);
                
                console.log("Slowing down, current speed: " + s);
            }
        }
        // 'W' Speed up, press
        else if(this.checkKey(87) == 1) {
            if(s < this.get('speedMax')) {
                s *= 2;
                this.set('speed', s);
                
                console.log("Speeding up, current speed: " + s);
            }
        }
    },
});

// For button-like interactions (e.g. starting the game)
var MenuLayer = cocos.nodes.Menu.extend({
    startButton:null,   //Holds the button to start the game
    startGame:null,     //Holds the function in the app that starts the game
    init: function(hook) {
        MenuLayer.superclass.init.call(this, {});
        
        // Create the button
        var opts = Object();
        opts['normalImage'] = '/resources/start-button.jpeg';
        opts['selectedImage'] = '/resources/start-button.jpeg';
        opts['disabledImage'] = '/resources/start-button.jpeg';
        // We use this callback so we can do cleanup before handing everything over to the main game
        opts['callback'] = this.startButtonCallback.bind(this);
        
        var sb = cocos.nodes.MenuItemImage.create(opts);
        sb.set('position', new geo.Point(0, 0));
        sb.set('scaleX', 0.5);
        sb.set('scaleY', 0.5);
        this.set('startButton', sb);
        this.addChild({child: sb});
        
        // Store the function to call when pressing the button
        this.set('startGame', hook);
    },
    
    // Called when the button is pressed, clears the button, then hands control over to the main game
    startButtonCallback: function() {
        this.removeChild(this.get('startButton'));
        this.get('startGame').call();
    }
});

exports.main = function() {
    // Initialise application
    
    // Get director
    var director = cocos.Director.get('sharedDirector');

    // Attach director to our <div> element
    director.attachInView(document.getElementById('cocos_test_app'));
    
    // Create a scene
    var scene = cocos.nodes.Scene.create();

    // Add our layers to the scene
    var app = FluencyApp.create();
    scene.addChild({child: app});
    var menu = MenuLayer.create(app.countdown.bind(app));
    scene.addChild({child: menu});

    // Run the scene
    director.runWithScene(scene);
};

}};
__resources__["/PieChart.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
var cocos = require('cocos2d');
var geom = require('geometry');
var util = require('util');

// Draws a pie chart
var PieChart = cocos.nodes.Node.extend({
    numSections:null,   // Total number of pie slices
    numFilled:null,     // Number of filled pie slices
    bgColor:null,       // Color of the background
    lineColor:null,     // Color of the lines used to outlijne and mark each section
    fillColor:null,     // Color of the filled in sections
    radius:null,        // Size of the chart
    init: function(opts) {
        PieChart.superclass.init.call(this);
        
        // Default values
        this.set('numSections', 2);
        this.set('numFilled', 1);
        this.set('bgColor', "#FFFFFF");
        this.set('lineColor', "#000000");
        this.set('fillColor', "#A0A0A0");
        this.set('radius', 10);
        
        //Set properties from the option object
        util.each('numSections numFilled bgColor lineColor fillColor radius'.w(), util.callback(this, function (name) {
            if (opts[name]) {
                this.set(name, opts[name]);
            }
        }));
        
        // Explictly set contentSize so it plays nice with formating based on it
        this.set('contentSize', new geom.Size(this.get('radius') * 2.4, this.get('radius') * 2.4));
    },
    
    // Draws the PieChart to the canvas
    draw: function(context) {
        var r = this.get('radius');
        
        // Draw background
        context.fillStyle = this.get('bgColor');
        context.fillRect(r * -1.2, r * -1.2, r * 2.4, r * 2.4);
    
        var step = Math.PI*2 / this.get('numSections');
        var offset = Math.PI * 3 / 2    //This is so we draw with 'up' as our 0
    
        // Draw the filled portion
        context.fillStyle = this.get('fillColor');
        context.beginPath();
        context.arc(0, 0, r, offset, offset + step * this.get('numFilled'));
        context.lineTo(0, 0);
        context.lineTo(0, -1 * r);
        context.closePath();
        context.fill();
    
        // Draw the outline
        context.strokeStyle = this.get('lineColor');
        context.beginPath();
        context.arc(0, 0, r, 0, Math.PI*2);
        context.closePath();
        context.stroke();
        
        // Draw the individual dividers
        for(var i=0; i<this.get('numSections'); i+= 1) {
            context.beginPath();
            context.moveTo(0, 0);
            context.lineTo(Math.sin(i*step)*r, Math.cos(i*step)*r*-1)
            context.closePath();
            context.stroke();
        }
    },
});

// Static helper function to build the creation options object
PieChart.helper = function(sections, filled, bgColor, lineColor, fillColor, radius) {
    opts = Object();
    opts['numSections'] = sections;
    opts['numFilled'] = filled;
    opts['bgColor'] = bgColor;
    opts['lineColor'] = lineColor;
    opts['fillColor'] = fillColor;
    opts['radius'] = radius;
    
    return opts
}

exports.PieChart = PieChart
}};
__resources__["/Player.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
var cocos = require('cocos2d');
var geom = require('geometry');

var LabelBG = require('LabelBG').LabelBG;

// Represents the player in the game
var Player = cocos.nodes.Node.extend({
    selector: null,         // Label that represents the value the player has control over
    wipeoutDuration: null,  // Duration remaining on a wipeout
    selectorX: null,        // The X coordinate that the label should be at, ignoring rotational transforms
    selectorY: null,        // The Y coordinate that the label should be at, ignoring rotational transforms
    init: function() {
        Player.superclass.init.call(this);
       
        // Load the car sprite for the player
        var sprite = cocos.nodes.Sprite.create({file: '/resources/car1.png',});
        sprite.set('scaleX', 0.5);
        sprite.set('scaleY', 0.5);
        this.addChild({child: sprite});
        
        this.set('wipeoutDuration', 0);
        
        this.scheduleUpdate();
    },
    
    // Changes the currently displayed selector on the car
    changeSelector: function(newVal) {
        // Remove previous selector if there was one
        var prev = this.get('selector');
        if(prev != null) {
            this.removeChild(prev);
        }
    
        // Create the new selector
        var opts = Object()
        opts["string"] = newVal;
        opts["fontColor"] = '#000000';
        var selector = LabelBG.create(opts, '#FFFFFF');
        selector.set('position', new geom.Point(selector.get('contentSize').width / 2, 80));
        this.set('selectorX', selector.get('contentSize').width / 2);
        this.set('selectorY', 80);
        this.addChild({child: selector});
        this.set('selector', selector);
    },
    
    // Sets the wipeout status of the car, causing it to spin
    // Use multiples of 0.5 seconds, otherwise the car will stop spinning at an off angle and then snap to driving forward
    wipeout: function(duration) {
        this.set('wipeoutDuration', duration);
    },
    
    // Keep the selector from rotating with the car
    update: function(dt) {
        var pos = this.get('position');
        
        //Spin the car as a result of getting a wrong answer
        if(this.get('wipeoutDuration') > 0) {
            this.set('rotation', this.get('rotation') + 720 * dt)
            this.set('wipeoutDuration', this.get('wipeoutDuration') - dt);
        }
        // Otherwise just rotate the player as they move to keep the visual angles realistic
        else {
            if(400.0 - pos.x > 0) {
                this.set('rotation', (90 - 180.0/Math.PI * Math.atan((pos.y - 50) / (400.0 - pos.x))) / 1.5)
            }
            else {
                this.set('rotation', (90 - 180.0/Math.PI * Math.atan((pos.y - 50) / (pos.x - 400.0))) / -1.5)
            }
        }
    
        // Do not rotate the label, keep its facing constant
        var rot = this.get('rotation');
        this.get('selector').set('rotation', rot * -1);
        
        //Cocos works in degrees, Math works in radians, so convert
        rot = rot * Math.PI / 180.0
        
        // Keep the label in a fixed position beneath the car, regardless of car rotation
        var x =      this.get('selectorX') * Math.cos(rot) + this.get('selectorY') * Math.sin(rot)
        var y = -1 * this.get('selectorX') * Math.sin(rot) + this.get('selectorY') * Math.cos(rot)
        
        this.get('selector').set('position', new geom.Point(x, y));
    },
});

exports.Player = Player;
}};
__resources__["/Preloader.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
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
    // Queues an image or resource in the preloader
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
    // Starts loading all queued images and resources
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
    loadCallback: function() {
        this.set('totalLoaded', this.get('totalLoaded') + 1);
        
        //console.log(this.get('totalLoaded') + " / " this.get('toLoad'));
        //events.trigger(this, 'progress', this.get('totalLoaded') * 1.0 / this.get('toLoad'));
        
        if(this.get('totalLoaded') >= this.get('toLoad') && !this.get('failbit')) {
            console.log("Preloading completed");
            events.trigger(this, 'complete');
        }
    },
    
    // Called when a remote resource 404's
    failCallback: function() {
        if(this.get('failbit') == false) {
            this.set('failbit', true);
            console.log("A remote resource has 404'ed");
            events.trigger(this, 'loadFailure');
        }
    }
});

exports.Preloader = Preloader;

}};
__resources__["/Question.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
var cocos = require('cocos2d');
var events = require('events');
var geom = require('geometry');

var LabelBG = require('LabelBG').LabelBG;

// Represents a single question to be answered by the player
// TODO: Build with an options object to allow easier initialization when customizing away from default values
var Question = cocos.nodes.Node.extend({
    correctAnswer: null,        //The correct response
    answeredCorrectly: null,    //Stores if question has been correctly/incorrectly (null=not answered)
    coneL:null,                 //Holds the left delimiter
    coneR:null,                 //Holds the left delimiter
    timeElapsed:null,           //Real time elapsed since start of question (including delimeterStaticTime)
    speed:null,                 //Speed in "units"/second of the player's car
    totalDist:null,             //Distance in "units" player needs to cover before answering
    coveredDist:null,           //Distance in "units" covered thus far
    delimeterStaticTime:null,   //Duration that the question will remain static in the distance (seconds)
    init: function(ans, d1, d2) {
        Question.superclass.init.call(this);
        
        // Initialize all variables
        this.set('correctAnswer', ans);
        this.set('timeElapsed', 0.0);
        this.set('speed', 1000);
        this.set('totalDist', 5000 / 0.92); //0.92 is to account for the question being evaluated at 92% distance
        this.set('coveredDist', 0);
        this.set('delimeterStaticTime', 1);
        
        // Create and display the question content
        var opts = Object()
        opts["string"] = d1;
        opts["fontColor"] = '#000000';
        var delim = LabelBG.create(opts, '#FFFFFF');
        delim.set('zOrder', 100);
        this.addChild({child: delim});
        this.set('coneL', delim);
        
        opts["string"] = d2;
        opts["fontColor"] = '#000000';
        delim = LabelBG.create(opts, '#FFFFFF');
        delim.set('zOrder', 101);
        this.addChild({child: delim});
        this.set('coneR', delim);
        
        // Schedule the per frame update
        this.scheduleUpdate();
    },
    
    // Called when the question is answered, sets and returns the result
    answerQuestion: function(ans) {
        if(this.get('answeredCorrectly') == null) {
            if(this.get('correctAnswer') == ans) {
                this.set('answeredCorrectly', true);
                return true;
            }
            this.set('answeredCorrectly', false);
            return false;
        }
        
        return null;
    },
    
    // Manages question timing and movement
    update: function(dt) {
        var te = this.get('timeElapsed') + dt;
        this.set('timeElapsed', te);
        
        var pc = 0;
        
        // Creates a delay before the content starts to move
        // TODO: Possibly vary the delay based on player's speed
        if(te - this.get('delimeterStaticTime') > 0) {
            var cd = this.get('coveredDist');
            cd += this.get('speed') * dt;
            this.set('coveredDist', cd);
        
            pc = cd / this.get('totalDist');
            
            // Approximately even with the car AND unanswered
            if(pc > 0.92 && this.get('answeredCorrectly') == null) {
                events.trigger(this, "QuestionTimeExpired");
            }
            
            // Illusion of distance
            pc = Math.pow(pc, 3);
        }
        
        var scale = 0.75 + 0.75 * pc;
        
        // Places/Moves the delimeters
        var move = this.get('coneL');
        move.set('position', new geom.Point(390 - 90 * pc + move.contentSize.width * scale * pc / 2, 50 + 560 * pc));
        move.set('scaleX', scale);
        move.set('scaleY', scale);
        
        move = this.get('coneR');
        move.set('position', new geom.Point(410 + 90 * pc + move.contentSize.width * scale * (1 - pc / 2), 50 + 560 * pc));
        move.set('scaleX', scale);
        move.set('scaleY', scale);
    },
});

// TODO: Write static helper for building an options object to initialize a question

exports.Question = Question
}};
__resources__["/QuestionList.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
var events = require('events');

// Contains the list of questions to be presented
var QuestionList = BObject.extend({
    questions:null,             //List of questions
    current:null,               //Curent question index
    intermissions:null,         //List of intermissions
    nextIntermission:null,      //Question index of next intermission
    init: function() {
        QuestionList.superclass.init.call(this);
        
        this.set('questions', []);
        this.set('current', -1);
        this.set('intermissions', []);
        this.set('nextIntermission', -2);
        
        this.nextQuestion = this.nextQuestion.bind(this)
    },
    // Adds a question to the list
    addQuestion: function(q) {
        var list = this.get('questions');
        list[list.length] = q;
        this.set('questions', list);
    },
    // Adds an intermission set at the current end of the question list
    // Returns true on first intermission, signaling that the value passed it should be applyed to the Player
    addIntermission: function(s) {
        if(this.get('nextIntermission') == -2) {
            this.set('nextIntermission', -1);
            return true;
        }
        else if(this.get('nextIntermission') == -1) {
            this.set('nextIntermission', this.get('questions').length);
        }

        var list = this.get('intermissions');
        list[list.length] = {selector: s, onQuestion: this.get('questions').length};
        this.set('intermissions', list);
        
        return false;
    },
    //Stores the currently displayed question
    storeQuestion: function(question) {
        this.get('questions')[this.get('current')] = question;
    },
    // Advances to the next question
    nextQuestion: function() {
        console.log("Advancing to next question");
    
        var questions = this.get('questions');
        var c = this.get('current');
        
        // Check to see if there is an intermission ahead
        if(c + 1 == this.get('nextIntermission')) {
            console.log("    New subset detected, triggering intermission");
            var inter = this.get('intermissions')
            events.trigger(this, 'intermission', inter[0].selector);
            
            // Remove the intermission that was just triggered and set up the next one, if there is one
            inter.shift();
            if(inter.length > 0) {
                this.set('nextIntermission', inter[0].onQuestion);
            }
            else {
                this.set('nextIntermission', -3);
            }
            this.set('intermissions', inter);
        }
        
        // Proceed to next question
        else if(c < questions.length - 1) {
            c += 1;
            this.set('current', c);
            
            events.trigger(this, 'QuestionReady', questions[c]);
            console.log("    Showing question # " + (c + 1));
        }
        // Otherwise signal the end of the game
        else {
            console.log("    No more questions remaining");
        
            events.trigger(this, 'noQuestionsRemaining');
        }
    },
});

exports.QuestionList = QuestionList
}};
__resources__["/resources/car1.png"] = {meta: {mimetype: "image/png"}, data: __imageResource("data:image/png;base64,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")};
__resources__["/resources/start-button.jpeg"] = {meta: {mimetype: "image/jpeg"}, data: __imageResource("data:image/jpeg;base64,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")};/*globals module exports resource require window Module __main_module_name__ __resources__*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

function resource(path) {
    // Check for packed resource
    var r = __resources__[path];
    if (r) {
        return r.data;
    }

    // Check for remote resource
    r = __remote_resources__[path];
    if (r) {
        // Load remote image
        if (r.meta.mimetype.split('/')[0] == 'image') {
            return require('cocos2d').RemoteImage.create({url: r.data, path: path});
        } else {
            return require('cocos2d').RemoteResource.create({url: r.data, path: path});
        }
    }

    throw("Unable to find resource: " + path.toString());
}

(function () {
    var process = {};
    var modulePaths = ['/__builtin__', '/__builtin__/libs', '/libs', '/'];

    var path; // Will be loaded further down

    function resolveModulePath(request, parent) {
        // If not a relative path then search the modulePaths for it
        var start = request.substring(0, 2);
        if (start !== "./" && start !== "..") {
            return modulePaths;
        }

        var parentIsIndex = path.basename(parent.filename).match(/^index\.js$/),
            parentPath    = parentIsIndex ? parent.id : path.dirname(parent.id);

        // Relative path so searching inside parent's directory
        return [path.dirname(parent.filename)];
    }

    function findModulePath(id, dirs) {
        if (id.charAt(0) === '/') {
            dirs = [''];
        }
        for (var i = 0; i < dirs.length; i++) {
            var dir = dirs[i];
            var p = path.join(dir, id);

            // Check for index first
            if (path.exists(path.join(p, 'index.js'))) {
                return path.join(p, 'index.js');
            } else if (path.exists(p + '.js')) {
                return p + '.js';
            }
        }

        return false;
    }

    function loadModule(request, parent) {
        parent = parent || process.mainModule;

        var paths    = resolveModulePath(request, parent),
            filename = findModulePath(request, paths);

        if (filename === false) {
            throw "Unable to find module: " + request;
        }


        if (parent) {
            var cachedModule = parent.moduleCache[filename];
            if (cachedModule) {
                return cachedModule;
            }
        }

        //console.log('Loading module: ', filename);

        var module = new Module(filename, parent);

        // Assign main module to process
        if (request == __main_module_name__ && !process.mainModule) {
            process.mainModule = module;
        }

        // Run all the code in the module
        module._initialize(filename);

        return module;
    }

    function Module(id, parent) {
        this.id = id;
        this.parent = parent;
        this.children = [];
        this.exports = {};

        if (parent) {
            this.moduleCache = parent.moduleCache;
            parent.children.push(this);
        } else {
            this.moduleCache = {};
        }
        this.moduleCache[this.id] = this;

        this.filename = null;
        this.dirname = null;
    }

    Module.prototype._initialize = function (filename) {
        var module = this;
        function require(request) {
            return loadModule(request, module).exports;
        }

        this.filename = filename;

        // Work around incase this IS the path module
        if (path) {
            this.dirname = path.dirname(filename);
        } else {
            this.dirname = '';
        }

        require.paths = modulePaths;
        require.main = process.mainModule;

        __resources__[this.filename].data.apply(this.exports, [this.exports, require, this, this.filename, this.dirname]);

        return this;
    };

    // Manually load the path module because we need it to load other modules
    path = (new Module('path'))._initialize('/__builtin__/path.js').exports;

    var util = loadModule('util').exports;
    util.ready(function () {
        // Populate globals
        var globals = loadModule('global').exports;
        for (var x in globals) {
            if (globals.hasOwnProperty(x)) {
                window[x] = globals[x];
            }
        }

        // Add a global require. Useful in the debug console.
        window.require = function require(request, parent) {
            return loadModule(request, parent).exports;
        };
        window.require.paths = modulePaths;

        process.mainModule = loadModule(__main_module_name__);

        window.require.main = process.mainModule;

        if (process.mainModule.exports.main) {
            process.mainModule.exports.main();
        }

    });
})();

// vim:ft=javascript

})();

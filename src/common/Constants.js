"use strict";

var medal = exports.medal = {
    
    MEDALS: ['none', 'bronze', 'silver', 'gold'],
    
    codeToString: function (code)
    {
        return medal.MEDALS[code || 0];
    },
    
    stringToCode: function (str)
    {
        return {
            g: 3,
            s: 2,
            b: 1
        }[str && str.length > 0 && str.charAt(0).toLowerCase()] || 0;
    }
};

var endState = exports.endState = {
    
    STATES: ['completed', 'aborted'],
    
    codeToString: function (code)
    {
        return endState.STATES[code] || 'unknown';
    },
    
    stringToCode: function (str)
    {
        return {
            FINISH: 0,
            ABORT: 1
        }[str];
    }
};

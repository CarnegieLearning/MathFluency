(function (window) {
    
    var assetURL = "racecar/assets"
    var scripts  = ["racecar/jah.js","racecar/cocos2d.js","racecar/racecar.js"]

    var ts = Date.now().toString()
      , identifier = "__cocos2d-app-" + ts.substring(ts.length - 3)

    while (document.getElementById(identifier)) {
      ts = Date.now().toString()
      identifier = "__cocos2d-app-" + ts.substring(ts.length - 3)
    }

    //document.write('<div id="' + identifier + '"></div>');
    var d = document.createElement('div');
    d.id = identifier
    //document.getElementById('cocos_test_app').appendChild(d);
    var base = $('#cocos_test_app')
    base.append(d);

    var initializeApplication = function () {
        if (window.document.readyState != 'complete') {
            return;
        }

        //var container = window.document.getElementById(identifier).parentNode
        var container = $('#' + identifier);
        if(container.length == 0) {
            setTimeout(initializeApplication, 100);
        }
        
        container = container[0].parentNode;
        
        var frame = window.document.createElement('iframe')
        frame.className = 'cocos2d-app-frame'
        frame.style.position = 'absolute'
        frame.style.left = '-10000px'
        frame.style.width = '1px'
        frame.style.height = '1px'
        frame.style.visibility = 'hidden'

        frame.onload = function () {
            var i = 0
            function nextScript () {
                if (scripts.length > i) {
                    addScript(frameDoc, scripts[i], nextScript)
                    i++
                } else {
                    frameWin.__jah__.__triggerReady()
                }
            }

            var frameWin = frame.contentWindow
            var frameDoc = frameWin.document
            var frameBody = frameDoc.body

            frameWin.__jah__ = {resources:{}, assetURL: assetURL, __blockReady: true};
            if (!frameBody) {
                var frameHTML = frameDoc.createElement('html')
                frameBody = frameDoc.createElement('body')
                frameHTML.appendChild(frameBody)
                frameDoc.appendChild(frameHTML)
            }

            frameWin.container = container

            nextScript()
        };

        $(container).before(frame)
    }

    var addScript = function (document, script, callback) {
        s = document.createElement('script')
        s.type = 'text/javascript'
        s.defer = true
        s.onload = callback
        s.src = script
        document.body.appendChild(s)
    };


    if (typeof window.document.onreadystatechange !== 'undefined') {
        if(window.document.readyState !== 'complete') {
            var listener = window.document.addEventListener('readystatechange', initializeApplication, false)
        }
        else {
            initializeApplication();
        }
    }
    else if (window.document.readyState) {
        var checkReadyState = function () {
            if (window.document.readyState == 'complete') {
                initializeApplication()
            } else {
                setTimeout(checkReadyState, 13)
            }
        }
        checkReadyState()
    }
    else {
        window.onload = initializeApplication
    }
    
})(window)

// vim:et:st=4:fdm=marker:fdl=0:fdc=1:ft=javascript

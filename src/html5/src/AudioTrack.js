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

// Cocos requires
var cocos = require('cocos2d')

// Wrapper class for the <audio> element
var AudioTrack = BObject.extend({
    audio       : null,     // Holds the actual audio element
    loop        : false,    // Whether or not the track should loop on ending
    isPlaying   : false,    // True if the track is current playing
    volume      : 1,        // [0-1] the volume for this specific AudioTrack
    masterVolume: 1,        // [0-1] the volume of the AudioMixer
    init: function(file) {
        this.audio = document.createElement('audio');
        this.audio.setAttribute('src', file);
        this.audio.onended = this.endCallback.bind(this);
        this.set('isPlaying', false);
    },
    
    // Starts playing the audio if it is not already playing
    // Returns true if the audio started to play
    play: function() {
        if(!this.get('isPlaying')) {
            this.audio.play();
            this.set('isPlaying', true);
            return true;
        }
        return false;
    },
    
    // Forces the audio to start playing regardless of its current state
    forcePlay: function() {
        this.stop();
        this.play();
    },
    
    // Stops the audio if it is currently playing
    // Returns true if the audio was stopped
    stop: function() {
        if(this.get('isPlaying')) {
            this.audio.pause();
            this.audio.currentTime = 0;
            this.set('isPlaying', false);
            return true;
        }
        return false;
    },
    
    // Called when a track finishes playing, loops if needed
    endCallback: function() {
        this.set('isPlaying', false);
        
        if(this.get('loop')) {
            this.play();
        }
    },
    
    // Sets the muted attribute for the audio
    setMute: function(b) {
        this.audio.muted = b;
    },
    
    // Called by AudioMixer when the master volume level is changed
    updateMasterVolume: function(v) {
        this.set('masterVolume', v);
        this.audio.volume = v * this.get('volume');
    },
    
    // Called to change the volume of this specific AudioTrack
    setVolume: function(v) {
        // Keep the volume level within acceptable range
        v = Math.min(Math.max(0, v), 1);
        
        this.set('volume', v);
        this.audio.volume = this.get('masterVolume') * v;
    }
});

exports.AudioTrack = AudioTrack
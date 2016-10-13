var soundContext = new AudioContext();
var url = window.location;
var path = url.pathname;
path = "../public/";

var sounds = {
  "dead" : {
    buffer : null,
    url : path + "/sounds/dead.wav"
  },
  "crash" : {
    buffer : null,
    url : path + "/sounds/crash.mp3"
  },
  "checkpoint" : {
    buffer : null,
    url : path + "/sounds/point2.mp3"
  },
  "bump" : {
    buffer : null,
    url : path + "/sounds/nojump.mp3"
  },
  "jump" : {
    buffer : null,
    url : path + "/sounds/jump.wav"
  },
  "coin" : {
    buffer : null,
    url : path + "/sounds/coin.mp3"
  }
};

for(var key in sounds) {
  loadSound(key);
}

function loadSound(name){
  var url = sounds[name].url;
  var buffer = sounds[name].buffer;

  var request = new XMLHttpRequest();
  request.open('GET', url, true);
  request.responseType = 'arraybuffer';

  // Decode asynchronously
  request.onload = function() {
    soundContext.decodeAudioData(request.response, function(newBuffer) {
      sounds[name].buffer = newBuffer;
    });
  }
  request.send();
}

function playSound(name){
  return;

  var buffer = sounds[name].buffer;
  if(buffer){
    var source = soundContext.createBufferSource(); // creates a sound source
    source.buffer = buffer;                    // tell the source which sound to play
    source.connect(soundContext.destination);       // connect the source to the context's destination (the speakers)
    source.start(0);
  }
}

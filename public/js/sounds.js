var soundContext = new AudioContext();

var url = window.location;
var path = url.pathname;
path = "./public";

var sounds = {
  "dead" : {
    buffer : null,
    url : path + "/sounds/dead.wav"
  },
  "fall" : {
    buffer : null,
    url : path + "/sounds/NFF-chromatic-fall.wav",
    volume : .05
  },


  "turbo" : {
    buffer : null,
    url : path + "/sounds/NFF-whizz.wav"
  },
  "crash" : {
    buffer : null,
    url : path + "/sounds/NFF-car-hit.wav"
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
  },
  "skid" : {
    buffer : null,
    url : path + "/sounds/skid.wav"
  },
  "engine" : {
    buffer : null,
    url : path + "/sounds/engine.ogg"
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
  // return;

  var buffer = sounds[name].buffer;
  var soundVolume = sounds[name].volume || 1;

  if(buffer){
    var source = soundContext.createBufferSource(); // creates a sound source
    source.buffer = buffer;                    // tell the source which sound to play
    
    var volume = soundContext.createGain();
    volume.gain.value = soundVolume;
    
    
    if(name == "crash") {
      volume.gain.value = .05;
    }
    if(name == "turbo") {
      volume.gain.value = .2;
    }
    
    volume.connect(soundContext.destination)
    
    source.connect(volume);       // connect the source to the context's destination (the speakers)
    source.start(0);
  }
}

var skidBuffer;
var skidVol;
var skidSource;

function startSkid() {
	
  var skidBuffer = sounds["skid"].buffer;
  if(skidBuffer){

    skidVol = soundContext.createGain();
	  skidVol.gain.value = .01;
    
    skidVol.connect(soundContext.destination);

    skidSource = soundContext.createBufferSource(); // creates a sound source
    skidSource.buffer = skidBuffer;                    // tell the source which sound to play
    
    skidSource.connect(skidVol);       // connect the source to the context's destination (the speakers)

    skidSource.start(0);
    skidSource.loop = true;
  }
	
}

setTimeout(function(){
  startSkid();
}, 3000);


var engineBuffer;
var engineVol;
var engineSource;
var enginePitch = 1;

function startEngine() {
	
  var engineBuffer = sounds["engine"].buffer;
  if(engineBuffer){

    engineVol = soundContext.createGain();
	  engineVol.gain.value = .15;
    
    engineVol.connect(soundContext.destination);

    engineSource = soundContext.createBufferSource(); // creates a sound source
    engineSource.buffer = engineBuffer;               // tell the source which sound to play
    
    engineSource.playbackRate.value = enginePitch;
    
    engineSource.connect(engineVol);       // connect the source to the context's destination (the speakers)


	  engineSource.loop = true;
    engineSource.start(0);
  }
	
}

setTimeout(function(){
  startEngine();
}, 3000);



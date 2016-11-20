// var playerRecords, lastTrack;
// var lastTrack;

// For keeping track of what the replay car is doing (for recording?)
var replayCar = {
  direction: "none",
  gas : "off"
}

$(document).ready(function(){

  buildTrackChooser();

  var lastTrack = localStorage.getItem("lastSingleTrack");
  
  if(!trackList[lastTrack]) {
    lastTrack = false;
  }
  
  var leaderboardID = getParameterByName('leaderboard');

  if(leaderboardID) {
    // if we are trying to load a custom leaderboard   
    leaderBoard.changeLeaderboard(leaderboardID);
  } else {
    if(!lastTrack){
      $(".track-chooser").show();
    } else {
      leaderBoard.changeLeaderboard(lastTrack);
      race.changeTrack(lastTrack);
    }
  }

  gameLoop();
  
});

var race = {

  // Ghost stuff... might want to simplify this stuff to just get commands, will be more lifelike.
  ghostRecording : false,
  ghostData : [],
  
  ghostCarData : [],

  // The ghost data last recorded
  tempGhostData : {
    start : false,
    controls : []
  },
  
    
  // Keeps track of the best ghost data,
  // for the current player!
  bestGhostData : {
    start : {},
    controls : []
  },

  playerName : "flooky-poo",
  
  activeGhostCars : [], // array of the 'new' style ghosts! These are the ones that are in play..

  
  ghostFrameIndex : 0,
  
  // ghostPlaying : false,

  updateTime : false,
  currentlap: 0,
  lapTime : 0,

  track : "",

  trackShortname : "",

  bestlap : false,

  lapHistory : [],
  
  willRespawn: false, // Keeps track of a respawning condition....

  quickRestart : function(){

    this.willRespawn = false;

    if(soundEnabled) {
      engineVol.gain.value = .15;
    }

    $("[checkpoint]").addClass("cleared");

    spawnCars();
    
    this.lapTime = 0;
    this.currentlap = 0;
    this.ghostRecording = false;

    this.updateTime = false;
    // this.ghostPlaying = false;
    
    // Reset the ghost data after each lap, this is what we will be recording into
    this.tempGhostData = {
      start : false,
      lapTime : false,
      controls : []
    }
    
    // Nuke all existing ghosts...
    for(var i = 0; i < this.activeGhostCars.length; i++) {
      var ghostCar = this.activeGhostCars[i];
      ghostCar.el.remove();
    }
    
    this.activeGhostCars = [];
    
    $(".lap-time").text(formatTime(race.lapTime));

    for(var k in cars){
      var c = cars[k];
      c.speed = 0;
      c.el.show();
      c.mode = "normal";
      c.jumpHeight = 0;
      c.showx = c.showx;

      for(var i = 7; i > 0; i--){
        if(checkPosition(c.x + i,c.y) == "road"){
          c.showx = c.showx + i * scaling;
          break;
        }
      }
    }
  },
  
  
  // Removes all ghosts from the race
  // Remove all ghost car elements from the .track
  // Loads player's ghost from localStorage

  loadPlayerGhost : function(){

    this.bestGhostData = {
      start : {},
      controls : []
    }

    var ghostData = leaderBoard.getLocalGhost();

    if(ghostData){
      if(ghostData.ghost) {
        this.bestGhostData = ghostData.ghost;
      }
    } 

    this.tempGhostData = {
      start : false,
      controls : []
    }
  },

  
  // When the track first loads
  startTrial: function(){

    $(".track-wrapper").css("opacity",0);

    // showMessage("GET READY!");

    cars = [];
    $(".car").remove();

    setTimeout(function(){
      var car = newCar("single", {"showname" : false, "trailColor" : trackData.trailcolor});
      cars.push(car);

      keyboardcar = car;
      spawnCars();
      $(".track-wrapper").show();
      $(".track-wrapper").css("opacity",1);
    },500); // increase to 1000

  },

  // Changes the current track
  // Tells the leaderboard to change the leaderboard too
  changeTrack: function(trackName){

    $(".track-wrapper").css("opacity",0);
    $(".track-wrapper").hide();

    prepareTrack(trackName);

    localStorage.setItem("lastSingleTrack",trackName);
  
    this.track = trackName;
    this.trackShortname = trackName;

    this.lapTime = 0;
    this.bestlap = 0;
    this.currentlap = 0;
    this.ghostRecording = false;
    this.updateTime = false;


    leaderBoard.trackName = trackName;
    
    this.loadPlayerGhost(); // Loads up player ghost (from leaderBoard.js);
    
    this.startTrial();
    
  },
  
  
  addGhostCarData : function(data) {
    this.ghostCarData.push(data);
  },
  
  // Adds a ghost from ghost data
  // appends it to the track..
  
  addNewGhost : function(data){

    // console.log("Adding new ghost car",data);
    
    var ghostData = data.ghost;

    var newGhost = newCar("ghost", {
      type : "ghost",
      showx : ghostData.start.showx,
      showy : ghostData.start.showy,
      angle : ghostData.start.angle,
      actualAngle : ghostData.start.actualAngle,
      steeringVelocity : ghostData.start.steeringVelocity,
      turningVelocity : ghostData.start.turningVelocity,
      speed : ghostData.start.speed,
      controls : ghostData.controls,
      frameIndex : false,
      showname : false,
      driver : data.name
      
    });

    this.activeGhostCars.push(newGhost);
  },
  
  // Whenever the car crosses the finish...
  finishLap : function(car){

    if(car.type == "ghost") {
      return;
    }

    //Kill all ghosts...
    for(var i = 0; i < this.activeGhostCars.length; i++) {
      var ghostCar = this.activeGhostCars[i];
      ghostCar.el.remove();
    }
    this.activeGhostCars = [];
    

    // Adds each ghost car
    for(var i = 0; i < this.ghostCarData.length; i++) {
      var data = this.ghostCarData[i];
      console.log("adding from finishlap");
      this.addNewGhost(data);
    }
    

    if(trackData.checkPoints == car.checkpoints.length || car.laps == 0) {

      car.laps++;

      this.ghostRecording = true;
      this.updateTime = false;
      // this.ghostPlaying = true;

      $(".delta-time").show();

      if(this.currentlap == 0) {
        this.updateTime = true;
      } else {
        setTimeout(function(t) {
          return function() {
            t.updateTime = true;
            $(".delta-time").hide();
          };
        }(this), 1000);
      }

      // Display the time delta...
      var timeString = "";
      var faster = false;
      $(".delta-time").removeClass("slower").removeClass("faster");

      if(this.currentlap > 0) {

        playSound("coin");

        if(this.lapTime - this.bestlap > 0) {
          timeString = timeString + "+";
          $(".delta-time").addClass("slower");
        } else {
          timeString = timeString + "-";
          $(".delta-time").addClass("faster");
          car.showMessage("yea!");
        }

        timeString = timeString + formatTime(Math.abs(this.lapTime - this.bestlap));
        
        if(this.lapTime < this.bestlap || !this.bestlap) {
          this.bestlap = this.lapTime;
          this.bestGhostData = JSON.parse(JSON.stringify(this.tempGhostData));
          leaderBoard.newRecord(this.playerName, this.bestlap, this.bestGhostData);
        }

        this.bestGhostData = JSON.parse(JSON.stringify(this.tempGhostData));
        
        $(".delta-time").text(timeString);
        $(".best-time-wrapper").show();
        $(".best-time").text(formatTime(this.bestlap));
      }

      this.currentlap++;

    } else {

      playSound("bump");
      this.lapTime = 0;
    }
    
    
    // Reset the ghost no matter what if we've got one
    if(this.activeGhostCars.length < 1 && this.bestGhostData.controls.length > 0) {
      console.log("adding from somewhere");
      this.addNewGhost({
        time : this.bestlap,
        name : "frank",
        ghost: this.bestGhostData
      });
    }
    

    // Do no matter what...

    $("[checkpoint]").removeClass("cleared");
    car.checkpoints = [];

    // Reset this shit?????

    this.tempGhostData = {
      start : false,
      controls : []
    }

    this.lapTime = 0;
    trackAnimation("finish");
    
  },
  
  // Explodes the car
  explodeCar: function(car, tempAngle){
   
    launchCar(car.showx, car.showy, car.actualAngle, car.color);
    launchDude(car.showx, car.showy, car.actualAngle);
    makeExplosion(car.showx, car.showy, 100);
    shakeScreen();    
    crashDebris(car.showx, car.showy, car.actualAngle, car.color);

    playSound("crash");
    
    // Engine volume off

	  engineVol.gain.value = 0;
    car.mode = "gone";
    car.el.hide();

    var that = this;

    race.willRespawn = true;

    setTimeout(function(){
      if(race.willRespawn == true) {
        that.quickRestart();
      }
    },1800);
    
  },

  
  getAveragelapTime : function() {
    var totalLaps = this.lapHistory.length;
    var totalTime = 0;

    for(var i = 0; i < this.lapHistory.length; i++) {
      var thisLap = this.lapHistory[i];
      totalTime += thisLap;
    }
    var averageTime = Math.round(totalTime / totalLaps);
    
    return averageTime;
  }
}


// Just updates the Ghost in the localstorage
// leaderboard.js does everythign else... 



var ticks = 0;
function gameLoop() {

  var now = new Date().getTime();
  delta = now - (time || now);
  time = now;
  
  // New style of replay recording

  //Drive each car
  for(var i = 0; i < cars.length; i++){
    var car = cars[i];
    driveCar(car, race.lapTime);
  }
  
  if(keyboardcar && race.ghostRecording) {

    // Add the start to the beginning of the replay 
    if(race.tempGhostData.start == false) {
      race.tempGhostData.start = {
        "showx" : keyboardcar.showx,
        "showy" : keyboardcar.showy,
        "angle" : keyboardcar.angle,
        "actualAngle" : keyboardcar.actualAngle,
        "speed" : keyboardcar.speed,
        "steeringVelocity" : keyboardcar.steeringVelocity,
        "turningVelocity" : keyboardcar.turningVelocity
      }
    }

    // If there are any changes in controls, we add them to ghost controls
    // or if we dont' have any controsl yet!

    if(keyboardcar.direction != replayCar.direction || keyboardcar.gas != replayCar.gas || race.tempGhostData.controls.length == 0) {

      replayCar.direction = keyboardcar.direction;
      replayCar.gas = keyboardcar.gas;

      race.tempGhostData.controls.push({
        "time" : race.lapTime,
        "gas" : replayCar.gas,
        "direction" : replayCar.direction,
        "showx" : keyboardcar.showx,
        "showy" : keyboardcar.showy,
        "steeringVelocity" : keyboardcar.steeringVelocity,
        "turningVelocity" : keyboardcar.turningVelocity,
        "actualAngle" : keyboardcar.actualAngle,
        "angle" : keyboardcar.angle,
        "speed" : keyboardcar.speed,
      });
    }
  }

  // Drive the ghost cars... .. .. .. .. .. .. .. ..
  for(var i = 0; i < race.activeGhostCars.length; i++){
    var newGhost = race.activeGhostCars[i];
    driveCar(newGhost, race.lapTime);
  }

  race.lapTime = race.lapTime + delta; //Update the race lap timer

  if(race.updateTime){
    $(".lap-time").text(formatTime(race.lapTime));
  }

  tiltTrack();

  window.requestAnimationFrame(gameLoop);
}


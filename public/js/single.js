var playerRecords, lastTrack;

// For keeping track of what the replay car is doing (for recording?)
var replayCar = {
  direction: "none",
  gas : "off"
}

$(document).ready(function(){

  buildTrackChooser();

  lastTrack = localStorage.getItem("lastSingleTrack");
  
  if(!trackList[lastTrack]) {
    lastTrack = false;
  }

  playerRecords = JSON.parse(localStorage.getItem("playerRecords")) || false;

  if(!lastTrack){
    $(".track-chooser").show();
  } else {
    race.changeTrack(lastTrack);
    race.startTrial();
  }

  gameLoop();
  
});

var race = {

  // Ghost stuff... might want to simplify this stuff to just get commands, will be more lifelike.
  ghostRecording : false,
  ghostData : [],

  // The ghost data last recorded
  newGhostData : {
    start : false,
    lapTime : false,
    controls : []
  },
  
  // Keeps track of the best ghost data
  bestGhostData : {
    start : {},
    lapTime : 99999999999999999,
    controls : []
  },
  
  playerName : "flooky-poo",
  
  newGhostCars : [], // array of the 'new' style ghosts!

  tinyGhostData : [],
  ghostFrameIndex : 0,
  ghostPlayData : [],
  ghostPlaying : false,

  updateTime : false,
  currentlap: 0,
  lapTime : 0,

  track : "",
  trackShortname : "",

  ghostCars : [],
  bestlap : false,

  lapHistory : [],
  
  willRespawn: false, // Keeps track of a respawning condition....

  quickRestart : function(){

    this.willRespawn = false;

    if(soundEnabled) {
      engineVol.gain.value = .15;
    }

    $("[checkpoint]").removeClass("cleared");

    spawnCars();
    
    this.lapTime = 0;
    this.currentlap = 0;
    this.ghostRecording = false;

    this.updateTime = false;
    this.ghostPlaying = false;
    
    this.newGhostData = {
      start : false,
      lapTime : false,
      controls : []
    }
    
    for(var i = 0; i < this.newGhostCars.length; i++) {
      var ghostCar = this.newGhostCars[i];
      ghostCar.el.remove();
    }
    
    this.newGhostCars = [];
    
    $(".lap-time").text(formatTime(race.lapTime));

    for(var i = 0; i < this.ghostCars.length; i++){
      var ghost = this.ghostCars[i];
      ghost.reset();
    }

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

  addGhost : function(ghostData) {

    var newGhost = createGhost(ghostData);

    $(".track").append(newGhost.el);

    if(this.currentlap == 0) {
      newGhost.status = "idle";
    }

    this.ghostCars.push(newGhost);
  },
  
  // Removes all ghosts from the race
  // Remove all ghost car elements from the .track
  killGhosts : function(){
    for(var i = 0; i < this.ghostCars.length; i++) {
      var ghost = this.ghostCars[i];
      ghost.el.remove();
    }
    this.ghostCars = [];
  },


  // Loads ghost from localstorage..?
  loadGhost : function(){

    var trackRecord = false;

    if(playerRecords){
      trackRecord = playerRecords[race.trackShortname] || false;

      if(trackRecord.ghost) {
        this.bestGhostData = trackRecord.ghost;
      } else {
        this.bestGhostData = {
          start : {},
          lapTime : 99999999999999999,
          controls : []
        }
      }
    }

    this.newGhostData = {
      start : false,
      lapTime : false,
      controls : []
    }

  },
  
  
  // When the track first loads
  startTrial: function(){

    $(".track-wrapper").css("opacity",0);

    showMessage("GET READY!");

    cars = [];
    $(".car").remove();

    // Adds a new car after one second
    setTimeout(function(){
      var car = newCar("single", {"showname" : false, "trailColor" : trackData.trailcolor});
      cars.push(car);

      keyboardcar = car;
      spawnCars();
      $(".track-wrapper").show();
      $(".track-wrapper").css("opacity",1);
    },500); // increase to 1000

  },

  changeTrack: function(trackName){

    $(".track-wrapper").css("opacity",0);
    $(".track-wrapper").hide();

    prepareTrack(trackName);
    localStorage.setItem("lastSingleTrack",trackName);  // TODO - Probably move to the menu code
  
    this.track = trackName;

    this.trackShortname = trackList[trackName].shortname;
    this.lapTime = 0;
    this.bestlap = 0;
    this.currentlap = 0;
    this.ghostRecording = false;
    this.ghostPlayData = [];
    this.ghostPlaying = false;

    this.updateTime = false;

    this.loadGhost(); // Gets a ghost, if available... 

    leaderBoard.changeTracks(this.trackShortname);
  },
  
  
  // Adds a ghost from ghost data
  addNewGhost : function(data){
    
    var ghostData = JSON.parse(JSON.stringify(data));

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
      frameIndex : false
    });

    this.newGhostCars.push(newGhost);
  },
    
  
  // Whenever the car crosses the finish...
  finishLap : function(car){

    //Kill all ghosts...
    for(var i = 0; i < this.newGhostCars.length; i++) {
      var ghostCar = this.newGhostCars[i];
      ghostCar.el.remove();
    }
    
    this.newGhostCars = [];

    if(car.type == "ghost") {
      return;
    }

    if(trackData.checkPoints == car.checkpoints.length || car.laps == 0) {

      car.laps++;

      this.ghostRecording = true;
      this.updateTime = false;
      this.ghostPlaying = true;

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

          this.newGhostData.lapTime = this.lapTime;
        
          this.bestGhostData = JSON.parse(JSON.stringify(this.newGhostData));
          
          // Reset ghost data
          this.newGhostData = {
            start : false,
            lapTime : false,
            controls : []
          }
        
          updatePlayerRecord({
            ghost : this.bestGhostData
          });

          leaderBoard.newRecord(this.trackShortname, this.bestlap);
        }

        if(!playerRecords[race.trackShortname].ghost) {
          updatePlayerRecord({
            ghost: this.newGhostData
          });
          this.bestGhostData = JSON.parse(JSON.stringify(this.newGhostData));
        }

        // What if it doesn't havea ghost... we need to add one....
        
        $(".delta-time").text(timeString);
        $(".best-time-wrapper").show();
        $(".best-time").text(formatTime(this.bestlap));
      }


      if(this.newGhostCars.length < 1 && this.bestGhostData.controls.length > 0) {
        this.addNewGhost(this.bestGhostData);
      }
  
      this.currentlap++;

    } else {
      // Player missed checkpoints

      $("[checkpoint]:not(.cleared)").each(function(el){
        addAnimationClass($(this), "checkpoint-strobe");
      });

      playSound("bump");
      
      this.lapTime = 0;
    }
    
    // Do no matter what...

    $("[checkpoint]").removeClass("cleared");
    car.checkpoints = [];

    // Reset this shit?????

    this.newGhostData = {
      start : false,
      lapTime : false,
      controls : []
    }

    this.lapTime = 0;
    trackAnimation("finish");
    
  },
  
  explodeCar: function(car, tempAngle){

	  engineVol.gain.value = 0;
    // make a particle for the exploded car
    var options = {
      x : car.showx,
      y : car.showy,
      angle: car.actualAngle * -1 + getRandom(-10,10),
      speed : getRandom(1,2),
      
      zRv : getRandom(-5,5),
      xRv : getRandom(-20,20),
      yRv : getRandom(-20,20),

      gravity : .15,
      bounce : true,
      
      zV : getRandom(8,10),
      color: car.color,
      width: 15,
      o: 3.5,
      oV : -.05,
      height: 15,
      
      lifespan: 100,
    }
    makeParticle(options);
      
    options.gravity = 0;
    options.xRv = 0;
    options.yRv = 0;
    options.zV = 0;
    options.gravity = 0;
    options.o = .3;
    options.oV = -.004;
    options.color = "black";

    makeParticle(options);

    makeExplosion(car.showx, car.showy, 100);

    shakeScreen();
    
    crashDebris(car.showx, car.showy, car.actualAngle, car.color);
    playSound("crash");
    
    // engine volume off
    
    car.mode = "gone";
    car.el.hide();

    var that = this;

    setTimeout(function(){
      that.quickRestart();
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

function updatePlayerRecord(data){

  // console.log(data);

  if(!playerRecords) {
    playerRecords = {};
  }

  if(!playerRecords[race.trackShortname]) {
    playerRecords[race.trackShortname] = {};
  }
  
  var rec = playerRecords[race.trackShortname];
  
  for(var k in data) {
    var value = data[k];
    rec[k] = value;
  }

  console.log("updatePlayerRecords");
  console.log(playerRecords);
  localStorage.setItem("playerRecords",JSON.stringify(playerRecords));
}

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
    if(race.newGhostData.start == false) {
      race.newGhostData.start = {
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

    if(keyboardcar.direction != replayCar.direction || keyboardcar.gas != replayCar.gas) {
      replayCar.direction = keyboardcar.direction;
      replayCar.gas = keyboardcar.gas;

      race.newGhostData.controls.push({
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
  for(var i = 0; i < race.newGhostCars.length; i++){
    var newGhost = race.newGhostCars[i];
    driveCar(newGhost, race.lapTime);
  }

  race.lapTime = race.lapTime + delta; //Update the race lap timer

  if(race.updateTime){
    $(".lap-time").text(formatTime(race.lapTime));
  }

  tiltTrack();

  window.requestAnimationFrame(gameLoop);
}


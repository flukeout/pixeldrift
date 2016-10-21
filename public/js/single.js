$(document).ready(function(){

  buildTrackChooser();

  var lastTrack = localStorage.getItem("lastSingleTrack");
  var playerRecords = JSON.parse(localStorage.getItem("playerRecords")) || false;


  if(!lastTrack){
    $(".track-chooser").show();
  } else {
    race.changeTrack(lastTrack);
    race.startTrial();
  }

  var trackRecord = false;

  if(playerRecords){
    trackRecord = playerRecords[race.trackShortname] || false;
  }


  if(trackRecord){
    race.addGhost(trackRecord);
  }

  gameLoop();
});

var race = {

  // Ghost stuff... might want to simplify this stuff to just get commands, will be more lifelike.
  ghostRecording : false,
  ghostData : [],
  tinyGhostData : [],
  ghostFrameIndex : 0,
  ghostPlayData : [],
  ghostPlaying : false,

  updateTime : false,
  currentlap: 0,
  laptime : 0,

  track : "",
  trackShortname : "",

  ghostCars : [],
  bestlap : false,

  lapHistory : [],

  quickRestart : function(){

    spawnCars();
    this.laptime = 0;
    this.currentlap = 0;
    this.ghostRecording = false;
    this.ghostData = [];
    this.updateTime = false;
    this.ghostPlaying = false;
    $(".lap-time").text(formatTime(race.laptime));

    for(var i = 0; i < this.ghostCars.length; i++){
      var ghost = this.ghostCars[i];
      ghost.reset();
    }

    for(var k in cars){
      var c = cars[k];
      c.speed = 0;
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

    // this.addGhost()

  },

  addGhost : function(ghostData) {

    var newGhost = createGhost(ghostData);

    $(".track").append(newGhost.el);

    if(this.currentlap == 0) {
      newGhost.status = "idle";
    }

    this.ghostCars.push(newGhost);
  },
  
  killGhosts : function(){

  },
  
  updateGhosts : function(){


    $(".track .ghost").remove();
    this.ghostCars = [];

    for(var i = 0; i < this.ghostPlayData.length; i++){
      var ghost = this.ghostPlayData[i];
      this.addGhost(ghost);
    }

  },
  
  startTrial: function(){

    // standings.load();

    $(".track-wrapper").css("opacity",0);

    showMessage("GET READY!");

    //Resets all the the cars in case there are other ones...

    for(var i = 0; i < cars.length; i++){
      var thisCar = cars[i];
    }

    cars = [];

    $(".car").remove();

    //Add a new car
    // we need to wait until the track has loaded
    // solving this with a half second delay, but that's not great

    setTimeout(function(){
      var car = newCar("single", {"showname" : false, "trailColor" : trackData.trailcolor});
      cars.push(car);
      keyboardcar = car;
      spawnCars();
      $(".track-wrapper").show();
      $(".track-wrapper").css("opacity",1);
    },1000);

  },

  changeTrack: function(trackName){

    standings.clearLeaderBoard();

    $(".track-wrapper").css("opacity",0);
    $(".track-wrapper").hide();
    prepareTrack(trackName);
    localStorage.setItem("lastSingleTrack",trackName);

    this.track = trackName;

    this.trackShortname = trackList[trackName].shortname;
    this.laptime = 0;
    this.bestlap = 0;
    this.currentlap = 0;
    this.ghostRecording = false;
    this.ghostPlayData = [];
    this.ghostPlaying = false;
    this.ghostData = [];
    this.updateTime = false;
    // end of reset block

    this.resetStandings();

  },
  
  resetStandings : function(){
    var standingsEl = $(".standings");
    $("body").removeClass("with-standings");

    // if(trackTimes[this.track]){
      // var times = trackTimes[this.track];
      // standingsEl.find(".gold").text(formatTime(times.gold)+"s");
      // standingsEl.find(".silver").text(formatTime(times.silver)+"s");
      // standingsEl.find(".bronze").text(formatTime(times.bronze)+"s");
      // $("body").addClass("with-standings");
    // }
  },
  
  finishLap : function(car){
    playSound("coin");

    //Reset ghosts


    for(var i = 0; i < this.ghostCars.length; i++){
      var ghost = this.ghostCars[i];
      ghost.lapEnd();
    }

    if(trackData.checkPoints == car.checkpoints.length || car.laps == 0) {

      car.laps++;
      car.checkpoints = [];
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

      var timeString = "";
      var faster = false;
      $(".delta-time").removeClass("slower").removeClass("faster");

      if(this.currentlap > 0) {


        if(this.laptime < this.bestlap || !this.bestlap) {
          this.bestlap = this.laptime;
        }

        if(this.laptime - this.bestlap > 0) {
          timeString = timeString + "+";
          $(".delta-time").addClass("slower");
        } else {
          timeString = timeString + "-";
          $(".delta-time").addClass("faster");
        }

        timeString = timeString + formatTime(Math.abs(this.laptime - this.bestlap));

        $(".delta-time").text(timeString);
        $(".best-time-wrapper").show();

        $(".best-time").text(formatTime(this.bestlap));
      }

      //Add one last frame to the ghost data right at the finish line...
      this.ghostData.push({
        "time" : race.laptime,
        "x" : Math.round(keyboardcar.showx.toFixed(1)),
        "y" : Math.round(keyboardcar.showy.toFixed(1)),
        "angle" : Math.round(keyboardcar.angle.toFixed(1)),
        "z" : Math.round(keyboardcar.zPosition.toFixed(1))
      });

      if(this.currentlap > 0){
        var f = JSON.parse(JSON.stringify(this.ghostData));
        standings.updatePlayer(this.laptime,f);

        this.lapHistory.push(this.laptime);
      
        var avgTime = this.getAverageLaptime();
        $(".avg-lap-time").text(formatTime(avgTime));

      }

      
      this.ghostData = [];
      this.laptime = 0;
      this.currentlap++;
      trackAnimation("finish");

    }
  },
  
  getAverageLaptime : function() {
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

function prepareRandomTrack(){


  var tracknames = [];
  for(key in trackList){
    tracknames.push(key);
  }

  var randomIndex = Math.floor(Math.random() * tracknames.length);
  var trackName = tracknames[randomIndex];

  trackData = trackList[trackName];
  prepareTrack(trackData.filename);
}




var ticky = 0;


function gameLoop() {

  var now = new Date().getTime();
  delta = now - (time || now);
  time = now;

  //Drive each car
  for(var i = 0; i < cars.length; i++){
    var car = cars[i];
    driveCar(car);
  }

  // Ghost Stuff - I SHOULD TAKE THIS OUT OF DRIVECAR
  ticky++;

  if(race.ghostRecording && ticky > 7){
    race.ghostData.push({
      "time" : race.laptime,
      "x" : Math.round(keyboardcar.showx.toFixed(1)),
      "y" : Math.round(keyboardcar.showy.toFixed(1)),
      "angle" : Math.round(keyboardcar.angle.toFixed(1)),
      "z" : Math.round(car.zPosition.toFixed(1))
    });
    ticky = 0;

  }

  for(var i = 0; i < race.ghostCars.length; i++){
    var ghostCar = race.ghostCars[i];
    ghostCar.timeElapsed = delta;
    ghostCar.drive();
  }

  race.laptime = race.laptime + delta; //update the race lap timer

  if(race.updateTime){
    $(".lap-time").text(formatTime(race.laptime));
  }

  tiltTrack();

  window.requestAnimationFrame(gameLoop);
}



var scaling = 15;  //1 pixel = 15 pixels
var othercars = {}; //Wtf are these

var cars = []; //This holds the player car?

var playSounds = false;
var keyboardcar;
var enginevol;
var time, delta, elapsedTime; //keep track of time between laps
var canvasTrack, context, trackHeight, trackWidth; //Need to revisit where these gos
var trackData = {};
var audioContext = new AudioContext();

// filename
// carcolors
// trailcolor
// leaveskids
// hexes
// startPositions - added by prepareTrack()
// laps

function showMessage(message){

  $(".game-message").css("opacity",1);

  setTimeout(function(){
    $(".game-message .message").html(message).css("opacity",1);
  },500);

  setTimeout(function(){
    $(".game-message .message").css("opacity",0);
  },1500);

  setTimeout(function(){
    $(".game-message").css("opacity",0);
  },2000);
}

function trackAnimation(type){
  // console.log("utils.trackAnimation("+type+")");
  if(type == "pop") {
    $(".track-wrapper").addClass("trackpop");
    setTimeout(function(){
      $(".track-wrapper").removeClass("trackpop");
    },200);
  }

  if(type == "carland") {
    $(".track-wrapper").addClass("carland");
    setTimeout(function(){
      $(".track-wrapper").removeClass("carland");
    },500);
  }

  if(type == "finish") {
    $(".track-wrapper").addClass("trackpop");
    $(".finish-line").removeClass("finishpop");
    $(".finish-line").width($(".finish-line").width());
    $(".finish-line").addClass("finishpop");

    setTimeout(function(){
      $(".track-wrapper").removeClass("trackpop");
    },200);
  }

}

function prepareTrack(level){

  canvasTrack = $("canvas.track-source");
  context = canvasTrack[0].getContext("2d");

  trackData = trackList[level];

  var image = new Image();
  $("body").append(image);
  $(image).hide();

  var url = window.location;

  var href = url.href.replace("#","");

  image.src = href + 'public/tracks/' + level;

  $(".track").css("background-image", "url(./public/tracks/"+level+")");

  $(image).on("load",function(){

    $(".bigtree, .lamp, .tree, .windmill, .water").remove(); // maybe add a sprite clas to these?

    context.clearRect(0, 0, 500, 500); //500 is max? ... lame...
    context.drawImage(image, 0, 0);

    trackHeight = $(this).height();
    trackWidth = $(this).width();
    $(".track").height(trackHeight * scaling).width(trackWidth * scaling);

    $(".track-shadow").height(trackHeight * scaling).width(trackWidth * scaling);

    var h = trackHeight * scaling / 2;
    var w = trackWidth * scaling / 2;
    $(".track").css("top","calc(45% - "+h+"px)");
    $(".track").css("left","calc(50% - "+w+"px)");

    h = h - 50;
    $(".track-shadow").css("top","calc(45% - "+h+"px)");
    $(".track-shadow").css("left","calc(50% - "+w+"px)");


    $(".track").css("min-height",trackHeight * scaling).css("min-width",trackWidth * scaling);

    canvasTrack.height(trackHeight);
    canvasTrack.width(trackWidth);

    // Set up the skid canvas
    var skidCanvas = $(".skids");
    ctx = skidCanvas[0].getContext("2d");
    skidCanvas.attr("width", trackWidth * scaling).attr("height",trackHeight * scaling);

    trackData.startPositions = [];
    trackData.checkpointPositions = [];

    for(var i = 0; i < parseInt(trackWidth); i++){
      for(var j = 0; j < parseInt(trackHeight); j++){
        var result = checkPosition(i,j);

        if(result == "finish"){
          trackData.startPositions.push({"x": i, "y" : j});
        }

        if(result == "checkpoint"){
          trackData.checkpointPositions.push({"x": i, "y" : j});
        }

        if(result == "lamp"){
          var lamp = $("<div class='lamp'></div>");
          $(".track").append(lamp)
          lamp.css("left", scaling * (i));
          lamp.css("top", scaling * (j - 3));
        }

        if(result == "windmill"){
          var el = $("<div class='windmill'><div class='prop'></div>");
          $(".track").append(el)
          el.css("left", scaling * (i));
          el.css("top", scaling * (j - 3));
        }

        if(result == "tree"){
          var tree = $("<div class='tree'><div class='tree-inner'></div></div>");
          $(".track").append(tree)
          tree.css("left", scaling * (i - 1));
          tree.css("top", scaling * (j - 3));
        }

        if(result == "bigtree"){
          var tree = $("<div class='bigtree'><div class='tree-inner'></div></div>");
          $(".track").append(tree)
          tree.css("left", scaling * (i - 1));
          tree.css("top", scaling * (j - 8));
        }

        if(result == "water"){
          var chance = getRandom(0,4);
          if(chance < 1) {
            var delay = getRandom(0,8);
            var el = $("<div class='water'></div>");
            el.css("animation-delay",delay+"s");
            $(".track").append(el)
            el.css("left", scaling * i);
            el.css("top", scaling * j);
          }
        }
      }
    }

    makeCheckpoints();
    addFinishLine();

  });

}

function makeCheckpoints(){

  id = 1;

  for(var i = 0; i < trackData.checkpointPositions.length; i++){
    var p = trackData.checkpointPositions[i];

    if(p.id == undefined) {
      p.id = id;
      id++;
    }

    for(var j = 0; j < trackData.checkpointPositions.length; j++){
      var q = trackData.checkpointPositions[j];
      if(i != j) {
        if((p.x == q.x && p.y + 1 == q.y) || (p.y == q.y && p.x + 1 == q.x)) {
          q.id = p.id;
        }
      }
    }
  }


  trackData.checkPoints = id - 1;

}

function addFinishLine(){
  // console.log("addFinishline() - utils.js");

  $(".track .finish-line").remove();



  //This is such garbage... come on.
  var startX = 999999999;
  var endX = -1;
  var startY = 999999999;
  var endY = -1;

  var sP = trackData.startPositions;

  for(i = 0; i < sP.length; i++){
    if(sP[i].x < startX) {
      startX = sP[i].x
    }
    if(sP[i].x > endX) {
      endX = sP[i].x
    }

    if(sP[i].y < startY) {
      startY = sP[i].y
    }
    if(sP[i].y > endY) {
      endY = sP[i].y
    }
  }


  var finishColor = "orange";
  var roadColor = "pink";

  for(var k in trackData.hexes){
    if(trackData.hexes[k] == "road"){
      roadColor = k;
    }
    if(trackData.hexes[k] == "finish"){
      finishColor = k;
    }
  }

  var finishLine = $("<div class='finish-line'><div class='line'></div></div>");
  finishLine.css("top",startY * scaling).css("left",startX * scaling).height((endY - startY + 1) * scaling).width(scaling);
  finishLine.find(".line").css("background",finishColor);
  finishLine.css("background",roadColor);
  finishLine.css("border-color",roadColor);
  $(".track").append(finishLine);
}

function getCar(id){
  var foundcar;
  for(var c in cars){
    var car = cars[c];
    if(car.id == id){
      foundcar = car;
    }
  }
  return foundcar;
}

function checkPosition(x,y){

  var p = context.getImageData(x, y, 1, 1).data;

  var hex = "#" + ("000000" + rgbToHex(p[0], p[1], p[2])).slice(-6);
  if(hex == "#000000") {
    return "void";
  } else {
    return trackData.hexes[hex];
  }
}



// Takes current and next position and mode to see if there is a collision coming up...

function checkCollision(x, y, nextx, nexty, mode) {


  var thisP = context.getImageData(x, y, 1, 1).data;
  var thisHex = "#" + ("000000" + rgbToHex(thisP[0], thisP[1], thisP[2])).slice(-6);
  var thisType = trackData.hexes[thisHex];

  var nextP = context.getImageData(nextx, nexty, 1, 1).data;
  var nextHex = "#" + ("000000" + rgbToHex(nextP[0], nextP[1], nextP[2])).slice(-6);
  var nextType = trackData.hexes[nextHex];

  if(nextType == "wall") {
    return true;
  }

  if(mode == "under" && thisType == "overpass" && nextType == "road") {
    return true;
  }

  if(mode == "under" && thisType == "ledge" && nextType == "grass") {
    return true;
  }


  if(mode == "normal" && thisType == "overpass" && nextType == "ledge") {
    return true;
  }
  
  

  return false;

}


function checkColor(x,y){
  var p = context.getImageData(x, y, 1, 1).data;
  var hex = "#" + ("000000" + rgbToHex(p[0], p[1], p[2])).slice(-6);
  return hex;
}


function checkRGB(x,y){
  var color = context.getImageData(x, y, 1, 1).data;
  // var hex = "#" + ("000000" + rgbToHex(p[0], p[1], p[2])).slice(-6);
  return color;
}

function rgbToHex(r, g, b) {
  if (r > 255 || g > 255 || b > 255)
    throw "Invalid color component";
  return ((r << 16) | (g << 8) | b).toString(16);
}

function tiltTrack(){

  //Tilts the track according to where all the cars are

  var xtotal = 0;
  var ytotal = 0;

  for(var i = 0; i < cars.length; i++){
    var car = cars[i];
    xtotal = xtotal + car.x;
    ytotal = ytotal + car.y;
  }

  var xavg = xtotal / cars.length || 0;
  var yavg = ytotal / cars.length || 0;
  var xdeg = 5 * (-1 + (2 * xavg / trackWidth));
  var ydeg = 45 + 5 * (1 - (2 * yavg / trackHeight));

  $(".track").css("transform","rotateX(" +ydeg+"deg) rotateY("+xdeg+"deg)");


}

function formatTime(totalms){

  var min = Math.floor((totalms/1000/60));
  var sec = Math.floor((totalms/1000) % 60);
  var ms = Math.floor(totalms % 1000);

  if(ms < 10){
    ms = "00" + ms;
  } else  if ( ms < 100) {
    ms = "0" + ms;
  }
  
  if(min > 0 && sec < 10) {
    sec = "0" + sec;
  }

  if(min > 0) {
    min = min + ":";
  } else {
    min = "";
  }

  var timeString = min + sec + "." + ms;
  return timeString;
}

function toDegrees (angle) {
  return angle * (180 / Math.PI);
}

function toRadians (angle) {
  return angle * (Math.PI / 180);
}

function spawnCars(){

  for(var c in cars) {
    var car = cars[c];
    spawnCar(car);
  }
}

function spawnCar(car,x,y,angle){

  if(angle == undefined) {
    car.angle = 270;
  } else {
    car.angle = angle;
  }

  car.actualAngle = car.angle;

  var random = Math.floor(Math.random() * trackData.startPositions.length);

  car.body.css("background",trackData.carcolors[0]);
  car.nameEl.css("color",trackData.carcolors[0]);
  car.trailColor = trackData.trailcolor;

  car.speed = 0;
  car.crashed = false;
  car.xRotation = 0;
  car.yRotation = 0;
  car.zRotation = 0;
  car.xRotationSpeed = 0;
  car.yRotationSpeed = 0;
  car.zRotationSpeed = 0;
  car.mode = "normal";
  car.zPosition = 100;
  car.laps = 0;

  $(".ghost").find(".body").css("background",trackData.carcolors[0]);

  // Place it where you're told, otherwise behind the start line
  if(x != undefined && y != undefined){
    car.x = x;
    car.y = y;
  } else {
    car.x = trackData.startPositions[random].x + 4;
    car.y = trackData.startPositions[random].y;
  }
  car.showx = car.x * scaling;
  car.showy = car.y * scaling;
}

function newCar(id,config){

  var carconfig = config || {};

  var car = {
    id : id,
    x : 0,
    y : 0,
    checkpoints : [],
    crashed : false,

    showx : 410,
    showy : 230,

    nextx :0,
    nexty : 0,

    lastx : 0,
    lasty : 0,

    tiltGravity : .1,
    tiltVelocity : 0,

    tilt : 0,

    zRotation : 0,
    xRotation: 0,
    yRotation: 0,

    xRotationSpeed : 0,
    yRotationSpeed : 0,
    zRotationSpeed : 0,

    xV : 0,
    yV : 0,

    height: 0,
    jumpElapsed: 0,
    jumpTotal: 0,
    jumpHeight : 0,
    jumpVelocity : .65, // Percentage of car speed

    zVelocity : 0,
    zPosition : 0,

    angle: 270,
    actualAngle : 270,
    acceleration : .06,  // accelleration, is this what we add to the speed?

    xVelocity : 0,
    yVelocity: 0,

    steeringAccel : .5,       // How fast the steering wheel turn accellerates
    steeringVelocityMax : 4,  // maximum car turn speed
    steeringVelocity : 0,     // How quickly the car can turn at a maximum

    turningAccel : .5,        // how fast the car turn can accellerate
    turningVelocityMax : 3,   // maximum car turn speed
    turningVelocity : 0,      // How fast the car is turning

    driftSlowdownRatio : .5, //Amount of 'friction' applied when drifting

    gravity : .180,
    minJumpSpeed : 2.5,

    mode: "normal",
    driver : "Bob",
    showname : true,
    laps : 0,

    maxspeed : 5, // the value adjusted by framerate...
    baseMaxspeed : 5, // the base value...
    maxspeedModifier : 0,
    maxAbsoluteSpeed : 10,


    turboBoost : 6,


    direction : "none",
    speed : 0,

    skidDuration : 0,

    trailColor : "#ffffff",
    bestlap : 0,
    laptime: 0,

    gas : "off",
    left : "off",
    right : "off",
    positionHistory : [],
  };
 

  // Updates car defaults based on what is passed in
  for(var key in carconfig){
    car[key] = carconfig[key];
  }

  car.respawn = function(){
    setTimeout(function(c){
      return function() {
        var x = c.positionHistory[0].x;
        var y = c.positionHistory[0].y;
        var angle = c.positionHistory[0].angle;
        c.respawning = false;
        if(car.mode != "normal") {
          spawnCar(c,x,y,angle);
        }
      };
    }(this), 500);
  }

  // Limit the driver name to 3 uppercase letters
  car.changeDriver = function(name){
    car.driver = name.substr(0,3).toUpperCase();
    car.el.find(".name").text(car.driver);
    if(car.id == myid){
      localStorage.setItem("drivername", car.driver);
    }
    $(".driver-name").val(car.driver);
  }

  // SHOW A CHAT MESSAGE
  car.showMessage = function(message){
    car.el.find(".name").css("opacity",0);
    var messageEl = $("<div class='message'>"+message+"</div>");
    car.el.prepend(messageEl);
    setTimeout(function(el) {
      return function() {
        el.parent().find(".name").css("opacity",.8);
        el.remove();
      };
    }(messageEl), 2000);
  }

  car.setDirection = function(action, direction){

    if(action == "steering") {

      if(direction == "right-on"){
        this.right = "on";
        if(this.direction == "none") {
          this.direction = "right";
        } else if (this.direction == "left") {
          this.direction = "none";
        }
      }

      if(direction == "right-off"){
        this.right = "off";
        if(this.left == "on") {
          this.direction = "left";
        } else {
          this.direction = "none";
        }
      }

      if(direction == "left-on"){
        this.left = "on";
        if(this.direction == "none") {
          this.direction = "left";
        } else if (this.direction == "right") {
          this.direction = "none";
        }
      }

      if(direction == "left-off"){
        this.left = "off";
        if(this.right == "on") {
          this.direction = "right";
        } else {
          this.direction = "none";
        }
      }
    }

    if(action == "gas"){
      this.gas = direction;
    }
  }

  car.el = $("<div class='car'></div>");

  car.el.width(scaling);
  car.el.height(scaling);

  $(".track").append(car.el)

  var nameEl = $("<div class='name'>" + car.driver + "</div>");
  car.nameEl = nameEl;

  if(car.showname){
    car.el.append(car.nameEl);
  }



  var shadow = $("<div class='shadow'></div>");
  car.shadow = shadow;

  var idler = $("<div class='idler'></div>");
  car.idler = idler;

  var body = $("<div class='body'></div>");
  car.body = body;

  var jumper = $("<div class='jumper'></div>");
  car.jumper = jumper;

  car.jumper.append(idler);
  car.idler.append(body)


  // Direction indicator when car is stopped
  var indicator = $("<div class='indicator'></div>");
  car.indicator= indicator;
  car.jumper.append(indicator);

  var desiredIndicator = $("<div class='pink'></div>");
  car.desiredIndicator = desiredIndicator;
  car.jumper.append(desiredIndicator);



  var randomColor = Math.floor(Math.random() * trackData.carcolors.length);

  var chosenColor = trackData.carcolors[randomColor]

  car.body.css("background", chosenColor);
  indicator.css("border-color", chosenColor);

  desiredIndicator.css("border-color", "pink");

  car.el.append(jumper);
  car.el.append(shadow);

  return car;
}

function buildTrackChooser(){

  //Get records from localstorage
  var playerRecords = JSON.parse(localStorage.getItem("playerRecords")) || {};

  // one of the problems is we have to figure out the fricken player Rank vs global board...

  for(var k in trackList){

    var track = trackList[k];

    if(includeTracks.indexOf(track.shortname) > -1) {

      //Clone the template...

      var trackOption = $(".track-template").clone();
      trackOption.removeClass("track-template");
      trackOption.attr("track", track.filename);
      trackOption.attr("trackname", track.shortname);

      var pRecord = playerRecords[track.shortname] || {};

      trackOption.find(".player-time").text(formatTime(pRecord.lapTime));

      trackOption.find(".track-thumbnail-wrapper").css("background-image","url(./public/tracks/" + track.filename + ")");

      var trackName = track.prettyname || track.shortname;

      trackOption.find(".track-name").text(trackName);

      $(".track-chooser .tracks").append(trackOption)

      trackOption.on("click",function(){
        var track = $(this).attr('track');
        trackData = trackList[track];
        race.changeTrack(trackData.filename);
        race.startTrial();
        $(".track-chooser").hide();
      });
    }

  } // End track chooser


   // var times = new Firebase('https://pixelracer.firebaseio.com/');

   // times.once("value", function(snapshot) {
   //   return; // dont do weird firebase shit
   //   var fbRecords = snapshot.val();
   //
   //   // This goes through all of the tracks..
   //   for(var key in fbRecords){
   //     if(includeTracks.indexOf(key) > -1) {
   //
   //       var trackName = key;
   //
   //       var playerKey = playerRecords[key].key; //The localstorage record key
   //
   //       var chooserEl = $(".track-chooser .track-option[trackname="+trackName+"]");
   //
   //       var trackData = fbRecords[key];
   //       var numRecords = Object.keys(trackData).length;
   //
   //       var trackRecords = [];
   //
   //       for(var r in trackData) {
   //         var data = trackData[r];
   //         var record = {
   //           "lapTime" : data.lapTime,
   //           "name" : data.name,
   //           "key" : data.key
   //         }
   //
   //
   //         if(record.key == playerKey){
   //           record.type = "player";
   //         }
   //
   //         trackRecords.push(record);
   //
   //         // console.log(trackRecords);
   //       }
   //
   //       trackRecords = trackRecords.sort(sortRecords);
   //
   //       var playerRank = "unranked";
   //
   //       for(var i = 0; i < trackRecords.length; i++) {
   //         var record = trackRecords[i];
   //         if(i < 3) {
   //           var recordWrapper = chooserEl.find(".leaders-wrapper");
   //           var newRecord = $("<div class='fastest-time'><div class='name'>" + record.name + "</div> <div class='time'>"+formatTime(record.lapTime)+"</div></div>");
   //           recordWrapper.append(newRecord);
   //         }
   //         if(record.type == "player") {
   //           playerRank = i + 1;
   //         }
   //       }
   //
   //           // this.records = this.records.sort(this.sortRecords);
   //
   //       chooserEl.find(".total-records .value").text(numRecords);
   //       chooserEl.find(".player-rank").text(playerRank);
   //     }
   //   }
   // });




}


function getRandom(min,max){
  return min + Math.random() * (max - min);
}

function sortRecords(x,y) {
  if(x.lapTime == "DNS") {
    return 1;
  }
  if(x.lapTime > y.lapTime) {
    return 1;
  }
  if(x.lapTime < y.lapTime) {
    return -1;
  }
  if(x.lapTime == y.lapTime) {
    return 0;
  }
}

var scaling = 15;   // 1 pixel = 15 pixels

var cars = []; //This holds the player car?
var playSounds = false;
var keyboardcar;
var enginevol;    // Engine volume
var time, delta, elapsedTime; //keep track of time between laps
var canvasTrack, context, trackHeight, trackWidth; //Need to revisit where these gos
var trackData = {};
var audioContext = new AudioContext();
var cameraFollow = false;


// Shows a message in an overlay over the game

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


// Adds an animation to the track
// * pop - when you finish a lap
// * carland - when a car lands after a jump 

function trackAnimation(type){

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


// Takes current and next position and mode to see if there is a collision coming up
// takes into account the current state (mode) of the car for things like overpasses

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

  if(nextType == "tree") {
    // return true;
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

  // Tilts the track according to where all the cars are all the cars?? what about just the 
  // player..?

  var xtotal = 0;
  var ytotal = 0;
  var move = true;
  
  for(var i = 0; i < cars.length; i++){
    var car = cars[i];
    xtotal = xtotal + car.x;
    ytotal = ytotal + car.y;
    if(car.mode == "gone") {
      move = false;
    }
  }

  var xavg = xtotal / cars.length || 0;
  var yavg = ytotal / cars.length || 0;
  var xdeg = 5 * (-1 + (2 * xavg / trackWidth));
  var ydeg = 45 + 5 * (1 - (2 * yavg / trackHeight));

  var xoff = 0;
  if(cars[0] && cameraFollow) {
    xoff = (.5 * trackWidth * 15) - (cars[0].showx * 1);
  }

  var yoff = 0;
  if(cars[0] && cameraFollow) {
    yoff = (.5 * trackHeight * 15) - (cars[0].showy * 1);
  }

  // If the camera is following the car, let's soom zoom in
  cameraFollow ? scale = 1.75 : scale = 1;

  if(move) {
    $(".track").css("transform","scale("+scale+") rotateX(" +ydeg+"deg) rotateY("+xdeg+"deg) translateX(" + xoff +"px) translateY(" + yoff +"px)");    
    $(".track-image").css("transform","scale("+scale+") rotateX(" +ydeg+"deg) rotateY("+xdeg+"deg) translateX(" + xoff +"px) translateY(" + yoff +"px)");    

  }
}


function formatTime(totalms){

  if(!totalms) {
    return "-.---";
  }

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

  // console.log("newCar", config);

  var carconfig = config || {};

  var car = {
    id : id,
    x : 0,
    y : 0,
    checkpoints : [],
    crashed : false,
    color : "",

    showx : 410,
    showy : 230,

    nextx : 0,
    nexty : 0,

    // lapTime : 0, // for ghosts

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
    showname : false,
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
    lapTime: 0,

    gas : "off",
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
        // el.parent().find(".name").css("opacity",.8);
        el.remove();
      };
    }(messageEl), 1500);
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

  if(car.type == "ghost") {
    car.el.addClass("g");
  }

  car.el.width(scaling);
  car.el.height(scaling);

  $(".track").append(car.el);

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
  
  car.color = chosenColor;


  car.body.css("background", chosenColor);
  indicator.css("border-color", chosenColor);
  
  // car.nameEl.css("color",chosenColor);

  desiredIndicator.css("border-color", "pink");

  car.el.append(jumper);
  car.el.append(shadow);

  return car;
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

function getParameterByName(name) {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
    results = regex.exec(location.search);
  return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

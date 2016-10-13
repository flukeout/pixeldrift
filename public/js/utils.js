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
  console.log("utils.prepareTrack("+level+")");
  canvasTrack = $("canvas.track-source");
  context = canvasTrack[0].getContext("2d");

  trackData = trackList[level];

  var image = new Image();
  $("body").append(image);
  $(image).hide();
  image.src = './public/tracks/' + level;

  $(".track").css("background-image", "url(./public/tracks/"+level+")");

  $(image).on("load",function(){

    $(".lamp, .tree, .windmill, .water").remove(); // maybe add a sprite clas to these?

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
          el.css("left", scaling * (i - 1));
          el.css("top", scaling * (j - 3));
        }

        if(result == "tree"){
          var tree = $("<div class='tree'><div class='tree-inner'></div></div>");
          $(".track").append(tree)
          tree.css("left", scaling * (i - 1));
          tree.css("top", scaling * (j - 4));
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

function easeOutCubic(currentIteration, startValue, changeInValue, totalIterations) {
	return changeInValue * (Math.pow(currentIteration / totalIterations - 1, 3) + 1) + startValue;
}

function easeInCubic(currentIteration, startValue, changeInValue, totalIterations) {
	return changeInValue * Math.pow(currentIteration / totalIterations, 3) + startValue;
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
  $(".track-shadow").css("transform","translateZ(-60px) rotateX(40deg) rotateY(-"+xdeg/4+"deg)");
}

function formatTime(total){
  var ms = Math.floor(total / 1 % 1000);

  if(ms < 10){
    ms = "00" + ms;
  } else  if ( ms < 100) {
    ms = "0" + ms;
  }

  var totalSec = Math.floor(total/1000);
  // var sec = Math.floor(total / 1000 % 60);

  return totalSec + "." + ms;
}

function toDegrees (angle) {
  return angle * (180 / Math.PI);
}

function toRadians (angle) {
  return angle * (Math.PI / 180);
}

function spawnCars(){

  // console.log("spawnCars() - placing cars near start line");
  for(var c in cars) {
    var car = cars[c];
    spawnCar(car);
  }
}

function spawnCar(car,x,y,angle){

  // console.log("spawnCar("+x,y+") - spawning individual car");
  if(angle == undefined) {
    car.angle = 270;
  } else {
    car.angle = angle;
  }

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

function driveCar(car) {

  car.x = Math.round(car.showx / scaling);
  car.y = Math.round(car.showy / scaling);

  //Only check the current terrIain if we are on a new pixel
  movedPixels = false;
  if(car.x != car.lastx || car.y != car.lasty) {
    movedPixels = true;
  }

  // Add position to history if it traveled a pixel
  if(movedPixels) {
    car.currentPosition = checkPosition(car.x,car.y) || "grass";
    if(car.mode != "crashed" && car.mode != "gone" && car.mode != "jumping" && car.zPosition == 0){
      car.positionHistory.push({x : car.x, y: car.y, angle : car.angle});
      if(car.positionHistory.length  > 10) {
        car.positionHistory.shift();
      }
    }
  }

  if(car.currentPosition == "checkpoint") {
    for(var i = 0; i < trackData.checkpointPositions.length; i++){
      var p = trackData.checkpointPositions[i];
      if(car.x == p.x && car.y == p.y) {
        if(car.checkpoints.indexOf(p.id) < 0){
          car.checkpoints.push(p.id);
          playSound("checkpoint");
        }
      }
    }
  }

  // SPEED
  if(car.currentPosition == "turbo") {
    car.speed = car.speed + 4; // TODO - adjust by framerate
  }

  if(car.speed > car.maxAbsoluteSpeed){
    car.speed = car.maxAbsoluteSpeed;
  }



  var speedchange = car.acceleration;

  var frameAdjuster = delta / 16.67;

  speedchange = speedchange * frameAdjuster;
  car.maxspeed = car.baseMaxspeed * frameAdjuster;  // getting better

  if(car.speed > 6) {
    car.speed = 6;
  }

  // console.log(car.speed); // need to divide this into vectors
  // if(particle.angle) {
  // particle.angle =  particle.angle - 180;


  // console.log(car.xV);   // negative is left, positive is right
  // console.log(car.yV);   // negative is down, positive is up

  // console.log(car.speed);
  // if(car.speed == 0){

  car.indicator.css("opacity",.4);
  car.el.addClass("idle");

  // car.desiredIndicator.css("opacity",.4);

  // } else {
    // car.indicator.css("opacity",0);
    // car.el.removeClass("idle");
  // }


  // CAR TURNING
  var steeringVelocityMax = car.steeringVelocityMax * frameAdjuster;  // This should be in the car definition, not here... dumbdumb asdf

  var turning = car.maxspeed - 1;  // wtf are these two

  if(car.zPosition > 0 || car.zPosition < 0 || car.mode == "frozen" || car.mode == "crashed") {
    turning = false;
  }

  if(car.currentPosition == "water"){
    steeringVelocityMax = steeringVelocityMax / 3; // TODO - frameRate adjuster? like the over 3?...
    if(movedPixels) {
      for(var i = 0; i < 2; i++){
        makeParticle(car.x, car.y, car.speed, car.angle, "water");
      }
    }
  }


  if(car.currentPosition == "grass" && car.zPosition == 0){
    if(movedPixels) {
      for(var i = 0; i < 2; i++){
        makeParticle(car.x, car.y, car.speed, car.angle, "grass");
      }
    }
  }



  var steeringAccel = car.steeringAccel * frameAdjuster;

    if(car.direction == "right" || car.direction == "left"){
      if(car.direction == "left") {
        car.steeringVelocity = car.steeringVelocity - steeringAccel;
        if(Math.abs(car.steeringVelocity) > steeringVelocityMax){
          car.steeringVelocity = -1 * steeringVelocityMax;
        }
      }
      if(car.direction == "right") {
        car.steeringVelocity = car.steeringVelocity + steeringAccel;
        if(car.steeringVelocity > Math.abs(steeringVelocityMax)){
          car.steeringVelocity = steeringVelocityMax;
        }
      }
    } else if (car.direction == "none") {
      if(car.steeringVelocity > 0) {
        car.steeringVelocity = car.steeringVelocity - steeringAccel;
        if(car.steeringVelocity < 0){
          car.steeringVelocity = 0;
        }
      }
      if(car.steeringVelocity < 0 ){
        car.steeringVelocity = car.steeringVelocity + steeringAccel;
        if(car.steeringVelocity > 0){
          car.steeringVelocity = 0;
        }
      }
    }

    if(turning) {
      car.angle = car.angle + car.steeringVelocity;
    }

    var angleDelta = car.actualAngle - car.angle;
    car.angleDelta = angleDelta;

    if(angleDelta > 110) {
      car.actualAngle = car.angle + 110;
    }

    if(angleDelta < -110) {
      car.actualAngle = car.angle - 110;
    }

    // console.log(car.steeringAccel);
    // car.angle - the desired angle of the car
    // car.actualAngle - the angle we want
    // car.actualAngle = car.angle;

    if(Math.abs(car.turningVelocity) > car.turningVelocityMax) {
      if(car.turningVelocity > 0) {
        car.turningVelocity = car.turningVelocityMax;
      }
      if(car.turningVelocity < 0) {
        car.turningVelocity = -1* car.turningVelocityMax;
      }
    }

    car.turningAccel = .2;

    var angleDelta = car.actualAngle - car.angle;


    if(angleDelta > 0) {


      if(Math.abs(angleDelta) <= 10 && car.turningVelocity < (car.turningAccel * -2)) {
        car.turningVelocity += car.turningAccel;
      } else {
        car.turningVelocity -= car.turningAccel;
      }



    } else if (angleDelta < 0) {

      if(Math.abs(angleDelta) <= 10 && car.turningVelocity > (car.turningAccel * 2)) {
        car.turningVelocity -= car.turningAccel;
      } else {
        car.turningVelocity += car.turningAccel;
      }


    }

    car.actualAngle = car.actualAngle + car.turningVelocity;

    var newAngleDelta = car.actualAngle - car.angle;

    if(Math.abs(newAngleDelta) <= .5) {
      car.angle = car.actualAngle;
      car.turningVelocity = 0;
    }


    var totalVelocity = Math.sqrt(Math.pow(Math.abs(car.xV),2) + Math.pow(Math.abs(car.yV),2));

    var angleDelta = Math.round(Math.abs(car.actualAngle - car.angle));

    // console.log(angleDelta);

    var lateralVelocity = totalVelocity * Math.sin(angleDelta *(Math.PI/180)) - 2;

    var lateralAngle = car.actualAngle + 180; // This will the the lateral force pushing back

    var ratio = 1.2; // This is the slowdown ratio on lateral movement

    if(lateralVelocity > 0) {
      var xVlateral = Math.sin(lateralAngle * (Math.PI/180)) * lateralVelocity * ratio;
      var yVlateral = -1 * Math.cos(lateralAngle * (Math.PI/180)) * lateralVelocity * ratio;
    } else {
      var xVlateral = 0;
      var yVlateral = 0;
    }


    if(car.currentPosition == "grass" && car.speed > 0 && car.zPosition == 0) {
      car.el.addClass("idle");
    } else {
      car.el.removeClass("idle");
    }

    if(car.gas == "on") {
      car.speed = car.speed + .06;
    }

  var done = false;

  while(done == false) {

    car.xV = Math.sin(car.actualAngle * (Math.PI/180)) * car.speed;
    car.yV = -1 * Math.cos(car.actualAngle * (Math.PI/180)) * car.speed;

    car.xV = car.xV + xVlateral;
    car.yV = car.yV + yVlateral;

    car.nextx = Math.round((car.showx + car.xV) / scaling);
    car.nexty = Math.round((car.showy + car.yV) / scaling);

    var movedPixelPosition = false;
    var nextPosition;

    if(car.x != car.nextx || car.y != car.nexty) {
      movedPixelPosition = true;
    }

    if(movedPixelPosition) {
      nextPosition = checkPosition(car.nextx,car.nexty);
    } else {
      nextPosition = car.currentPosition;
    }

    if(nextPosition == "wall" && car.currentPosition == "wall"){
      done = true;
      car.speed = car.maxspeed;
    }

    //If the next position is a wall, then add the bump off
    //and re-check the next position
    if(nextPosition == "wall" && car.zPosition == 0 && car.speed < 4.5 && car.mode != "crashed") {
      playSound("bump");

      var direction = "forward";
      if(car.speed < 0){
        direction = "backwards";
      }
      if(direction == "forward") {
        car.speed = -2;
      } else {
        car.speed = 2;
      }
    } else {
      done = true;
    }
  }

  //Write down the old position
  car.lastx = car.x;
  car.lasty = car.y;

  if(nextPosition == "wall" && car.zPosition == 0){

    if(car.speed >= 4.5 ) {
      car.zVelocity =  .7 * car.speed; // .5 car speed for normal jump
      car.speed = car.speed * .5;
      car.mode = "crashed";
      playSound("crash");

      car.xRotationSpeed = getRandom(8,16);
      car.yRotationSpeed = getRandom(1,3);
      car.zRotationSpeed = getRandom(1,3);

      for(var j = 0; j < 10; j++){
        makeParticle(car.x, car.y, car.speed, car.angle);
      }

      trackAnimation("pop");
    }
  }

  // CAR SKIDS
  // Leave a skid mark on the track
  // If it's on the road - then depends on speed and turning radius
  // If it's not, then just rip it up a bit
  var turnpercent = Math.abs(car.steeringVelocity) / car.steeringVelocityMax;
  var speedpercent = car.speed / car.maxspeed;

  if(movedPixels && car.currentPosition == "grass" && car.zPosition == 0 && trackData.lawnmower) {
    ctx.fillStyle = "rgba(154,113,54,.3)";
    ctx.fillRect(car.x * scaling, car.y * scaling, scaling, scaling);

  }


  // what are the conditions for a tilt
  // * minimum skid duration
  // * steering wheel adding turn
  // * minimum speed

  var tiltgain = 1;

  if((car.direction == "left" || car.direction == "right")  && car.speed > 4 && car.skidDuration > 10) {
    // Raising up
    if(car.direction ==  "left" && car.speed > 4) {
      car.tilt = car.tilt + tiltgain;
    } else if (car.direction == "right" && car.speed > 4) {
      car.tilt = car.tilt - tiltgain;
    }
  } else {
    // Falling down

    car.tiltGravity = .3;

    if(car.tilt > 0) {
      car.tiltVelocity = car.tiltVelocity - car.tiltGravity;
      car.tilt = car.tilt + car.tiltVelocity;
      if(car.tilt < 0) {
        car.tilt = 0;
        car.tiltVelocity = 0;
      }
    }

    if(car.tilt < 0) {
      car.tiltVelocity = car.tiltVelocity + car.tiltGravity;
      car.tilt = car.tilt + car.tiltVelocity;
      if(car.tilt > 0) {
        car.tilt = 0;
        car.tiltVelocity = 0;
      }
    }


  }



  var maxTilt = 25;
  // var rotation = Math.abs(car.turnvelocity) / 4 * maxRotation;

  if(Math.abs(car.tilt) > maxTilt){
    if(car.tilt > 0) { car.tilt = maxTilt};
    if(car.tilt < 0) { car.tilt = -1*maxTilt};
  }

  if(car.tilt > 0) {
    $(".car .idler").css("transform-origin","right");
  } else {
    $(".car .idler").css("transform-origin","left");
  }
  $(".car .idler").css("transform","rotateY("+car.tilt+"deg) translateZ(0px)")

  // if(movedPixels){
  //   if(trackData.leaveSkids && car.mode != "jumping" && car.zPosition == 0 && car.skidDuration > 10) {
  //
  //     var averagepercent = (speedpercent + turnpercent) / 2 * 100;
  //     var jam  = -75 + averagepercent;
  //     var opacity = jam/25 * .1;
      // if(opacity > .12){
      //   opacity = .12;
      // }
      // if(car.currentPosition == "road" || car.currentPosition == "overpass" || car.currentPosition == "checkpoint") {
      //   ctx.fillStyle = "rgba(0,0,0,"+opacity+")";
      //   ctx.fillRect(car.x * scaling, car.y * scaling, scaling, scaling);
      // } else if (car.currentPosition == "grass"){
      //   ctx.fillStyle = "rgba(0,0,0,.05)";
      //   ctx.fillRect(car.x * scaling, car.y * scaling, scaling, scaling);
      // }
  //   }
  // }

  if(movedPixels){
    if(trackData.leaveSkids && car.mode != "jumping" && car.zPosition == 0) {

      var skid = false;
      // var startSkid = 15;

      var skidAngle = 90;

      var maxOpacity = .25;
      var angleDelta = Math.abs(car.actualAngle - car.angle);

      var opacity = maxOpacity * (angleDelta / skidAngle);



      if(opacity > maxOpacity) {
        opacity = maxOpacity;
      }
      // if(angleDelta > 1) {
      //   skid = true;
      // }
      // if(Mathcar.actualAngle - car.angle)

      if(car.currentPosition == "road" || car.currentPosition == "overpass" || car.currentPosition == "checkpoint") {
        ctx.fillStyle = "rgba(0,0,0,"+opacity+")";
        ctx.fillRect(car.x * scaling, car.y * scaling, scaling, scaling);
      }
    }
  }





  var move = true;

  if(car.mode == "frozen"){
    move = false;
  }

  if(car.mode == "normal") {
    if(car.currentPosition == "overpass" && nextPosition == "ledge" ) {
      move = false;
    }
    if(car.currentPosition == "road" && nextPosition == "ledge" ) {
      car.mode = "under";
    }
  } else if (car.mode == "under") {
    if(car.currentPosition == "overpass" && nextPosition == "road"){
      move = false;
    }
    if(car.currentPosition == "ledge" && nextPosition == "road") {
      car.mode = "normal";
    }
    if(car.currentPosition == "ledge" && nextPosition == "grass") {
      move = false;
    }
  }

  car.el.attr("mode",car.mode);

  if(move){
    car.showx = car.showx + car.xV;
    car.showy = car.showy + car.yV;
  } else {
    car.speed = 1;
  }

  // CAR ENGINE
  var maxfq = 400;
  var minfq = 200;

  if(car.mode == "jumping"){
    maxfq = 600;
  }

  //ENGINE SOUNDS....

  var frequency = minfq + ((car.speed/car.maxspeed) * (maxfq - minfq));
  car.engine.frequency.value = frequency - (turnpercent * 50);
  car.enginesine.frequency.value = 20 + (20 * speedpercent) + (turnpercent * 5);

  if(car.mode == "crashed") {
    car.enginevol.gain.value = 0;
  } else {
    car.enginevol.gain.value = .12;
  }

  if(turnpercent > .5 && speedpercent > .5) {
    car.skidDuration++;
  } else {
    car.skidDuration = 0;
  }

  var skidPercent = car.skidDuration - 25 / 25;

  if(skidPercent > 1) {
    skidPercent = 1;
  }

  if(car.skidDuration > 25) {
    car.skidVolume.gain.value = .025  * turnpercent || 0 * skidPercent;
  } else {
    car.skidVolume.gain.value = 0;
  }

  car.el.attr("mode",car.mode);

  if(car.currentPosition == "finish"){
    if(car.x != car.nextx) {
      race.finishLap(car);
      car.laptime = 0;
    }
  }

  //JUMPING
  if(car.currentPosition == "jump" && car.speed >= car.minJumpSpeed && car.zPosition == 0){
    car.zVelocity = .5 * car.speed; // .5 car speed for normal jump
    car.mode = "jumping";
    // car.yRotationSpeed = getRandom(-2,2);
    // car.xRotationSpeed = getRandom(-2,2);
    playSound("jump");
  }

  //Apply any car rotations if the car is flyin'....
  if(car.zPosition > 0 || car.zPosition < 0) {
    car.xRotation = car.xRotation + car.xRotationSpeed;
    car.yRotation = car.yRotation + car.yRotationSpeed;
    car.zRotation = car.zRotation + car.zRotationSpeed;
  }

  if(car.currentPosition == "void" || car.zPosition > 0) {
    car.zVelocity = car.zVelocity - car.gravity
  }

  car.zPosition = car.zPosition + car.zVelocity;

  if(car.zPosition < 0 && car.currentPosition == "void") {
    if(car.mode != "gone") {
      if(!car.respawning){
        car.respawn();
        car.respawning = true;
      }
    }
    car.mode = "gone";
  } else {

  }

  // console.log(car.zPosition);

  if(car.zPosition <= 0){
    car.shadow.hide();
  } else {
    car.shadow.show();
  }

  // Safe Landing
  if(car.zPosition < 0 && car.zVelocity < 0 && car.mode != "gone" && car.mode != "crashed"){

    trackAnimation("carland");
    $(".car .idler").addClass("carlanding");
    setTimeout(function(){
      $(".car .idler").removeClass("carlanding");
    },400)

    car.mode = "normal";
    car.zPosition = 0;
    car.zVelocity = 0;
    car.zRotation = 0;
    car.xRotation = 0;
    car.yRotation = 0;
  }

  // Crash landing
  if(car.zPosition < 0 && car.zVelocity < 0 && car.mode != "gone" && car.mode == "crashed"){
    car.zPosition = 0;
    car.speed = 0;
    car.zRotationSpeed = 0;
    car.xRotationSpeed = 0;
    car.yRotationSpeed = 0;
    if(!car.respawning){
      car.respawn();
      car.respawning = true;
    }
  }

  // CAR JUMP TRAIL
  if(movedPixels){
    if(car.zPosition > 0 && car.mode != "crashed"){
      var trail = $("<div class='trail'></div>");
      trail.css("background",car.trailColor || "#32a6dc")
      trail.height(scaling).width(scaling);
      trail.css("left",car.x * scaling).css("top",car.y * scaling);
      trail.css("transform","translateZ("+ car.zPosition +"px)");
      $(".track").append(trail); // <- gotta figure this out i guess
      setTimeout(function(el) { return function() { el.remove(); }; }(trail), 400);
    }
  }

  // moves the car holder
  car.el.css("transform", "translateY("+car.showy+"px) translateZ(1px) translateX("+car.showx+"px)");

  //makes the body jump
  if(car.currentPosition == "overpass" && car.mode == "normal") {
    car.jumper.css("transform", "scale(1.1) rotateZ("+car.angle+"deg) translateZ("+car.zPosition+"px");
    car.body.css("transform", "rotateZ("+car.zRotation+"deg)");
  } else {
    car.jumper.css("transform", " rotateZ("+car.angle+"deg) translateZ("+car.zPosition+"px");
    car.body.css("transform", "rotateX("+car.xRotation+"deg) rotateY("+car.yRotation+"deg) rotateZ("+car.zRotation+"deg)");
    car.nameEl.css("transform", "translateZ("+ parseInt(38 + car.zPosition) + "px) rotateX(-70deg)");
  }


  car.desiredIndicator.css("transform", "rotateZ("+car.angleDelta+"deg)"); //asdf

  car.shadow.css("transform", "rotateZ("+car.angle+"deg)");
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

    zVelocity : 0,
    zPosition : 0,


    desiredangle: 270,
    angle: 270,
    actualAngle : 270,
    acceleration : .06,  // accelleration, is this what we add to the speed?

    xVelocity : 0,
    yVelocity: 0,
    friction : .06,  // each frame we need to add friction...

    // we need to apply an impulse...
    // impulse will have an X and Y component, and change the X and Y velocity

    steeringAccel : .5,       // How fast the steering wheel turn accellerates
    steeringVelocityMax : 4,  // maximum car turn speed
    steeringVelocity : 0,     // How quickly the car can turn at a maximum

    turningAccel : .5,        // how fast the car turn can accellerate
    turningVelocityMax : 2,   // maximum car turn speed
    turningVelocity : 0,      // How fast the car is turning

    gravity : .180,
    minJumpSpeed : 2.5,

    mode: "normal",
    driver : "Bob",
    showname : true,
    laps : 0,
    wheelturn : false,
    maxspeed : 5, // the value adjusted by framerate...
    baseMaxspeed : 5, // the base value...
    maxspeedModifier : 0,
    maxAbsoluteSpeed : 10,
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

  car.shutDown = function(){
    car.engine.stop();
    car.enginesine.stop();
    car.skidOscillator.stop();
    car.oscillator.stop();
  }

  car.initAudio = function(){

  // Skid Volume

    car.skidVolume = audioContext.createGain();
    car.skidVolume.gain.value = 0; //.02 is max basically
    car.skidVolume.connect(audioContext.destination);

    car.skidOscillator = audioContext.createOscillator();
    car.skidOscillator.type = 'sine';
    car.skidOscillator.frequency.value = 20;
    car.skidOscillator.start(0);

    car.skidGain = audioContext.createGain();
    car.skidGain.gain.value = .5;
    car.skidGain.connect(car.skidVolume);

    car.skidOscillator.connect(car.skidGain.gain);

    car.oscillator = audioContext.createOscillator();
    car.oscillator.type = 'square';
    car.oscillator.frequency.value = 900; // value in hertz
    car.oscillator.start(0);
    car.oscillator.connect(car.skidGain);

    // ENGINE

    car.enginevol = audioContext.createGain();
    car.enginevol.gain.value = .12;
    car.enginevol.connect(audioContext.destination);

    car.engine = audioContext.createOscillator();
    car.engine.connect(car.enginevol);
    car.engine.type = 'sine';
    car.engine.frequency.value = 440; // value in hertz
    car.engine.start(0);

    car.enginesine = audioContext.createOscillator();
    car.enginesine.type = 'sine';
    car.enginesine.frequency.value = 40;
    car.enginesine.start(0);

    var sineGainba = audioContext.createGain();
    sineGainba.gain.value = 400;

    car.enginesine.connect(sineGainba); //connecxts the sine wave to the gain
    sineGainba.connect(car.engine.frequency);
  }

  car.initAudio();
  car.shutDown();

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

      trackOption.find("img").attr("src","../public/tracks/" + track.filename);

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


  $(window).on("keydown",function(e){
    if(e.keyCode == 27 && $(".track-chooser:visible").length > 0){
      $(".track-chooser").hide();
    }

    if(e.keyCode == 84) {
      console.log("toggle sound");
    }
  });

  $(".change-track").on("click",function(){
    $(".track-chooser").show();
  });
}

var particles = [];

// Ooky going to leave this off for now
function makeParticle(x,y, speed, angle,type, xVel,yVel){

  console.log("make particle");

  // and... apply some motion and stuff to these...?
  // Move them in a similar direction ot the car...... ?
  var particle = {
    xRot : 0,
    yRot : 0,
    zRot : 0
  };

  var lifespan = 2000;

  if(type == undefined){
    type = "crash";
  }

  if(type == "grass") {

    particle.xVel = getRandom(-1.5,1.5);
    particle.yVel = getRandom(-1.5,1.5);
    particle.zVel = 1;
    particle.gravity = .175;

    particle.opacity = 1;
    particle.opacityVelocity = 0.02;

    particle.xPos = x * scaling;
    particle.yPos = y * scaling;
    particle.zPos = 0;

    particle.xRotVel = getRandom(2,8);
    particle.yRotVel = getRandom(2,8);
    particle.zRotVel = getRandom(2,8);

  } else if ( type == "water") {
    particle.xVel = getRandom(-1.5,1.5);
    particle.yVel = getRandom(-1.5,1.5);
    particle.zVel = 1;
    particle.gravity = .175;

    particle.opacity = 1;
    particle.opacityVelocity = 0.03;

    particle.xPos = x * scaling;
    particle.yPos = y * scaling;
    particle.zPos = 0;

    particle.xRotVel = 0;
    particle.yRotVel = 0;
    particle.zRotVel = 0;

    particle.xRot = 90;
  } else if (type == "ghost") {

    particle.xVel = 0;
    particle.yVel = 0;
    particle.zVel = 2;
    particle.gravity = 0;

    particle.opacity = .4;
    particle.opacityVelocity = .02;

    particle.xPos = x * scaling;
    particle.yPos = y * scaling;
    particle.zPos = 0;

    particle.xRotVel = 0;
    particle.yRotVel = 0;
    particle.zRotVel = 0;

    lifespan = 1500;

  } else {
    var angleChange = getRandom(-20,20);
    angle = angle + angleChange;

    particle.xVel = getRandom(-3,3);
    particle.yVel = getRandom(-3,3);
    particle.zVel = speed;
    particle.gravity = .175;

    particle.opacity = 1;
    particle.opacityVelocity = 0.02;

    particle.xPos = x * scaling;
    particle.yPos = y * scaling;
    particle.zPos = 0;

    particle.xRotVel = getRandom(2,10);
    particle.yRotVel = getRandom(2,10);
    particle.zRotVel = getRandom(2,10);
  }

  var trail = $("<div class='particle'></div>");
  var rotator = $("<div class='rotator'></div>");
  trail.append(rotator);

  if(type == "grass"){
    trail.find(".rotator").css("background",trackData.lawnmower);
    particle.zVel = 4;
  } else if (type == "water") {
    trail.find(".rotator").css("background","#4cb5dc");
    trail.addClass("droplet");
    particle.zVel = 4;
  } else {
    trail.find(".rotator").css("background",trackData.carcolors[0]);
  }

  if(type == "ghost") {
    trail.height(scaling).width(scaling);
  } else {
    trail.height(scaling/2).width(scaling/2);
  }

  particle.el = trail;

  $(".track").append(particle.el); // <- gotta figure this out i guess

  setTimeout(function(el,p) {
    return function(){
      el.remove();
      for(var i = 0, len = particles.length; i < len; i++){
        if(particles[i] == p){
          particles.splice(i, 1);
        }
      }
    };
  }(trail,particle), lifespan);

  particles.push(particle);
}

function animateParticles(){
  for(var i = 0; i < particles.length; i++){
    var p = particles[i];

    //Position
    p.xPos = p.xPos + p.xVel;
    p.yPos = p.yPos + p.yVel;
    p.zPos = p.zPos + p.zVel;
    p.zVel = p.zVel - p.gravity;
    p.el.css("transform", "translateY("+p.yPos+"px)  translateX("+p.xPos+"px) translateZ("+p.zPos+"px)");

    p.opacity = p.opacity - p.opacityVelocity;
    p.el.css("opacity",p.opacity);

    //Rotation
    p.xRot = p.xRot + p.xRotVel;
    p.yRot = p.yRot + p.yRotVel;
    p.zRot = p.zRot + p.zRotVel;
    p.el.find(".rotator").css("transform", "rotateX("+p.xRot+"deg) rotateY("+p.yRot+"deg) rotateZ("+p.zRot+"deg)");
  }
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

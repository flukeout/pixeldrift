
function driveCar(car) {


  var frameAdjuster = delta / 16.67;

  // Properties adjusted for framerate

  var maxspeed =            car.maxspeed * frameAdjuster;
  var speed =               car.speed * frameAdjuster;
  var steeringAccel =       car.steeringAccel * frameAdjuster;
  var steeringVelocityMax = car.steeringVelocityMax * frameAdjuster;
  var turningVelocityMax =  car.turningVelocityMax * frameAdjuster;
  var turningAccel =        car.turningAccel * frameAdjuster;
  var acceleration =        car.acceleration * frameAdjuster;
  var turboBoost =          car.turboBoost * frameAdjuster;


  car.x = Math.round(car.showx / scaling);
  car.y = Math.round(car.showy / scaling);

  //Only check the current terrIain if we are on a new pixel
  var movedPixels = false;

  if(car.x != car.lastx || car.y != car.lasty) {
    movedPixels = true;
  }

  // If we've traveled a pixel since last time

  if(movedPixels) {

    car.currentPosition = checkPosition(car.x,car.y) || "grass";

    // This is just to keep track where to spawn someone
    if(car.mode != "crashed" && car.mode != "gone" && car.mode != "jumping" && car.zPosition == 0){
      car.positionHistory.push({x : car.x, y: car.y, angle : car.angle});
      if(car.positionHistory.length  > 10) {
        car.positionHistory.shift();
      }
    }

    // Turbo Boost
    if(car.currentPosition == "turbo" && car.zPosition == 0) {
      car.speed = maxspeed + turboBoost;
      playSound("turbo");
    }

    // Checkpoint
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

    // Grass
    if(car.currentPosition == "grass" && car.zPosition == 0 && trackData.lawnmower) {
      mowGrass(car);
    }

    // TODO - for later - water particles

  }


  // CAR TURNING
  var turning = true;

  if(car.zPosition != 0 || car.mode == "crashed") {
    turning = false;
  }

  // Steering Inputs
  if(car.direction == "left") {
    car.steeringVelocity -= steeringAccel;
    if(Math.abs(car.steeringVelocity) > steeringVelocityMax){
      car.steeringVelocity = -1 * steeringVelocityMax;
    }
  }

  if(car.direction == "right") {
    car.steeringVelocity += steeringAccel;
    if(car.steeringVelocity > Math.abs(steeringVelocityMax)){
      car.steeringVelocity = steeringVelocityMax;
    }
  }

  if (car.direction == "none") {
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

  // Update steering angle
  car.angle = car.angle + car.steeringVelocity;



  // TURNING

  // Difference between desired angle and actual angle


  // console.log(angleDelta);
  //
  // if(angleDelta > 270) {
  //   console.log("Hh");
  //   car.actualAngle = 360 - angleDelta;
  //   angleDelta = car.actualAngle - car.angle;
  // }


  // console.log(car.actualAngle, car.angle);

  // var angleDiff = car.actualAngle - car.angle;
  // angleDiff = -1 * ((angleDiff + 180) % 360 - 180);
  //
  // console.log(Math.round(angleDiff));


  // Just to make sure we never deal with negative angles, makes things easier
  if(car.actualAngle < 360) {
    car.actualAngle += 360;
  }

  if(car.angle < 360) {
    car.angle += 360;
  }

  var angleDelta = car.actualAngle - car.angle;
  
  // console.log(Math.abs(Math.round(car.angleDelta)));
  
  if(angleDelta < -180) {
    car.actualAngle += 360;
  }

  if(angleDelta > 180) {
    car.actualAngle -= 360;
  }
 
  angleDelta = car.actualAngle - car.angle;

  if(angleDelta > 90 && car.zPosition == 0) {
    car.actualAngle = car.angle + 90;
    angleDelta = 90;
  }

  if(angleDelta < -90 && car.zPosition == 0) {
    car.actualAngle = car.angle - 90;
    angleDelta = -90;
  }


  //
  // console.log(angleDelta);

  if(angleDelta > 0) {
    if(Math.abs(angleDelta) <= 10 && car.turningVelocity < (turningAccel * -2)) {
      car.turningVelocity += turningAccel;
    } else {
      car.turningVelocity -= turningAccel;
    }
  } else if (angleDelta < 0) {
    if(Math.abs(angleDelta) <= 10 && car.turningVelocity > (turningAccel * 2)) {
      car.turningVelocity -= turningAccel;
    } else {
      car.turningVelocity += turningAccel;
    }
  }

  if(car.turningVelocity > 0 && car.turningVelocity > turningVelocityMax) {
    car.turningVelocity = turningVelocityMax;
  }
  if(car.turningVelocity < 0 && Math.abs(car.turningVelocity) > turningVelocityMax) {
    car.turningVelocity = -1 * turningVelocityMax;
  }


  // Adjust the actual car rotation
  if(turning) {
    car.actualAngle = car.actualAngle + car.turningVelocity;
  }

  car.angleDelta = angleDelta;

  var newAngleDelta = car.actualAngle - car.angle;

  if(Math.abs(newAngleDelta) <= .5) {
    car.angle = car.actualAngle;
    car.turningVelocity = 0;
  }

  // Figuring out lateral friction

  var totalVelocity = Math.sqrt(Math.pow(Math.abs(car.xV),2) + Math.pow(Math.abs(car.yV),2));
  var angleDelta = Math.round(Math.abs(car.actualAngle - car.angle));
  var lateralVelocity = totalVelocity * Math.sin(angleDelta *(Math.PI/180));
  var lateralAngle = car.actualAngle + 180; // This will the the lateral force pushing back

  var xVlateral = 0;
  var yVlateral = 0;

  if(lateralVelocity > 0) {
    xVlateral = Math.sin(lateralAngle * (Math.PI/180)) * lateralVelocity * car.driftSlowdownRatio;
    yVlateral = -1 * Math.cos(lateralAngle * (Math.PI/180)) * lateralVelocity * car.driftSlowdownRatio;
  }


  // Car Speed

  if(car.zPosition == 0) {
    if(car.gas == "on") {
      car.speed += acceleration;
    } else {
      car.speed -= acceleration;
    }
  }

  // Slow down faster if we're above top speed
  // Probably due to a turbo
  if(speed > maxspeed) {
    car.speed -= acceleration * 3;
  }

  // Make sure we don't go backwards
  if(car.speed < 0) {
    car.speed = 0;
  }


  // This whole block is checking for collisions before moving basically....
  var done = false;

  while(done == false) {

    car.xV = Math.sin(car.actualAngle * (Math.PI/180)) * car.speed;
    car.yV = -1 * Math.cos(car.actualAngle * (Math.PI/180)) * car.speed;

    // Only apply lateral forces if car is on the ground
    if(car.zPosition == 0) {
      car.xV = car.xV + xVlateral;
      car.yV = car.yV + yVlateral;
    }

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

    var collision = false;

    if(movedPixelPosition && car.zPosition == 0) {
      collision = checkCollision(car.x, car.y, car.nextx, car.nexty, car.mode);
    }

    if(collision) {
      
      var angleDelta;
      var rotations = Math.floor(car.actualAngle / 360);
      var tempAngle = car.actualAngle - (rotations * 360);

      var currentX = car.showx - (Math.floor(car.showx / scaling) * scaling);
      var currentY = car.showy - (Math.floor(car.showy / scaling) * scaling);
      var oldAngle = tempAngle;

      var up = checkPosition(car.x, car.y - 1);
      var right = checkPosition(car.x + 1, car.y);
      var down = checkPosition(car.x, car.y + 1);
      var left = checkPosition(car.x - 1, car.y);

      var newAngle = tempAngle;
      var angleChange = 0;

      // TODO - simplify the conditionals below?

      if(tempAngle >= 0 && tempAngle <= 90) {
        if(car.x != car.nextx && car.y == car.nexty) {
          newAngle = 360 - tempAngle; // Right
        } else if(car.x == car.nextx && car.y != car.nexty) {
          newAngle = 180 - tempAngle; // Up
         } else if (car.x != car.nextx && car.y != car.nexty) {
           if(right) {
             newAngle = 360 - tempAngle;
           } else if (up) {
             newAngle = 180 - tempAngle;
           }
         }
       }

     // Down & right
     if(tempAngle >= 90 && tempAngle <= 180) {
       if(car.x != car.nextx && car.y == car.nexty) {
         newAngle = 360 - tempAngle; // Right
       } else if(car.x == car.nextx && car.y != car.nexty) {
         newAngle = 180 - tempAngle; // Down
        } else if (car.x != car.nextx && car.y != car.nexty) {
          if(right) {
            newAngle = 360 - tempAngle;
          } else if (down) {
            newAngle = 180 - tempAngle;
          }
        }
      }

      // Dow & left
      if(tempAngle >= 180 && tempAngle <= 270) {
        if(car.x != car.nextx && car.y == car.nexty) {
          newAngle = 360 - tempAngle; // Left
        } else if(car.x == car.nextx && car.y != car.nexty) {
          newAngle = 180 - tempAngle; // Down
         } else if (car.x != car.nextx && car.y != car.nexty) {
           if(left) {
             newAngle = 180 - tempAngle;
           } else if (down) {
             newAngle = 360 - tempAngle;
           }
         }
       }

       // Up & Left
       if(tempAngle >= 270 && tempAngle <= 360) {
         if(car.x != car.nextx && car.y == car.nexty) {
           newAngle = 360 - tempAngle; // Left
         } else if(car.x == car.nextx && car.y != car.nexty) {
           newAngle = 180 - tempAngle; // Up
         } else if (car.x != car.nextx && car.y != car.nexty) {
            if(left) {
              newAngle = 180 - tempAngle; // Up
            } else if (up) {
              newAngle = 360 - tempAngle; // Left
            }
          }
        }

        if(tempAngle > 360) {
          tempAngle -= 360;
        }

        if(newAngle > 360) {
          newAngle -= 360;
        }

        var angleChange = tempAngle - newAngle;
        angleChange = -1 * ((angleChange + 180) % 360 - 180);

        if(angleChange > 180 ) {
          angleChange = (360 - angleChange) * -1;
        }

        var ferocity = Math.abs(angleChange)/180;

        if(ferocity > .5) {
          ferocity = .5;
        }

        // Max angle change on crash
        var maxChange = 90;
        if(Math.abs(angleChange) > maxChange) {
          if(angleChange > 0) {
            angleChange = maxChange;
          }
          if(angleChange < 0) {
            angleChange = -maxChange;
          }
        }

        car.actualAngle = car.actualAngle + angleChange;
        car.angle = car.angle + angleChange;
        


        car.speed = car.speed - (ferocity * car.speed);
        
        playSound("crash");
        

    } else {
      done = true;
    }
  }

  //Write down the old position
  car.lastx = car.x;
  car.lasty = car.y;


  if(nextPosition == "wall" && car.zPosition == 0){
    if(car.speed >= 4.5 ) {
      // car.zVelocity =  .7 * car.speed; // .5 car speed for normal jump
      // car.speed = car.speed * .5;
      // car.mode = "crashed";
      // playSound("crash");
      //
      // car.xRotationSpeed = getRandom(8,16);
      // car.yRotationSpeed = getRandom(1,3);
      // car.zRotationSpeed = getRandom(1,3);
      //
      // for(var j = 0; j < 10; j++){
      //   makeParticle(car.x, car.y, car.speed, car.angle);
      // }
      //
      // trackAnimation("pop");
    }
  }



  var turnpercent = Math.abs(car.steeringVelocity) / car.steeringVelocityMax;
  var speedpercent = car.speed / car.maxspeed;


  var tiltAcceleration = 1;
  var tiltGravity = .3;
  var maxTilt = 25;

  if(car.direction != "none" && car.speed > .75 * maxspeed) {
    // Tilting Up
    if(car.direction == "right") {
      if(car.tilt > -1 * maxTilt){
        car.tilt = car.tilt - tiltAcceleration;
      }
    } else if (car.direction == "left") {
      if(car.tilt < maxTilt) {
        car.tilt = car.tilt + tiltAcceleration;
      }
    }
  } else {
    // Tilting Down
    if(car.tilt > 0) {
      car.tiltVelocity = car.tiltVelocity - tiltGravity;
      car.tilt = car.tilt + car.tiltVelocity;
      if(car.tilt < 0) {
        car.tilt = 0;
        car.tiltVelocity = 0;
      }
    }
    if(car.tilt < 0) {
      car.tiltVelocity = car.tiltVelocity + tiltGravity;
      car.tilt = car.tilt + car.tiltVelocity;
      if(car.tilt > 0) {
        car.tilt = 0;
        car.tiltVelocity = 0;
      }
    }
  }

  if(car.tilt > 0) {
    $(".car .idler").css("transform-origin","right");
  } else if (car.tilt < 0) {
    $(".car .idler").css("transform-origin","left");
  } else {
    $(".car .idler").css("transform-origin","center");
  }
  $(".car .idler").css("transform","rotateY("+car.tilt+"deg) translateZ(0px)")


  if(movedPixels
     && trackData.leaveSkids
     && car.zPosition == 0
     && (car.currentPosition == "road" || (car.currentPosition == "overpass" && car.mode == "normal") || car.currentPosition == "checkpoint"))
      {

    var skidAngle = 15;
    var maxOpacity = .2;
    var angleDelta = Math.abs(car.actualAngle - car.angle);
    var percent = 0;

    if(angleDelta > skidAngle) {
      percent = (angleDelta - skidAngle) / skidAngle;
      if(percent > 1) {
        percent = 1;
      }
    }

    var opacity = maxOpacity * percent;
    ctx.fillStyle = "rgba(0,0,0,"+opacity+")";
    ctx.fillRect(car.x * scaling, car.y * scaling, scaling, scaling);
  }
  
  
  
  // Skid Sounds
  var skidAngle = 15;
  var maxOpacity = .2;
  var angleDelta = Math.abs(car.actualAngle - car.angle);
  var percent = 0;

  if(angleDelta > skidAngle) {
    percent = (angleDelta - skidAngle) / skidAngle;
    if(percent > 1) {
      percent = 1;
    }
  }

  
  var maxGain = .3;

  if(skidVol) {
    if(car.speed > maxspeed/2 && car.zPosition == 0) {
  	  skidVol.gain.value = percent * maxGain;
    } else {
  	  skidVol.gain.value = 0;
    }
  }
  
  

  // Engine Sounds
  
  var minpitch = 1;
  var maxpitch;
  
  if(car.zPosition != 0) {
    maxpitch = 3;
  } else {
    maxpitch = 2.5;
  }
  
  var percentSpeed = car.speed / maxspeed;
  
  enginePitch = 1 + (maxpitch * percentSpeed);
  
  if(enginePitch > 1 + maxpitch) {
    enginePitch = 1 + maxpitch;
  }
  
  if(engineSource) {
    engineSource.playbackRate.value = enginePitch;    
  }

  




  if(car.mode == "normal") {
    if(car.currentPosition == "road" && nextPosition == "ledge" ) {
      car.mode = "under";
    }
  } else if (car.mode == "under") {
    if(car.currentPosition == "ledge" && nextPosition == "road") {
      car.mode = "normal";
    }
  }

  car.el.attr("mode",car.mode);

  car.showx = car.showx + car.xV;
  car.showy = car.showy + car.yV;

  
  car.el.attr("mode",car.mode);

  if(car.currentPosition == "finish"){
    if(car.x != car.nextx) {
      race.finishLap(car);
      car.laptime = 0;
    }
  }

  //JUMPING
  if(car.currentPosition == "jump" && car.speed >= car.minJumpSpeed && car.zPosition == 0){
    car.zVelocity = car.jumpVelocity * car.speed;
    car.mode = "jumping";
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

  // If the car falls off
  if(car.zPosition < 0 && car.currentPosition == "void") {
    if(car.mode != "gone") {

      setTimeout(function(){
        playSound("fall");        
      },250);

      if(!car.respawning){
        car.respawn();
        car.respawning = true;
      }
    }
    car.mode = "gone";
    car.shadow.css("opacity",0);
  } else {
    car.shadow.css("opacity",.3);
  }

  if(car.speed == 0) {
    car.idler.addClass("idle");
  } else {
    car.idler.removeClass("idle");
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
    // car.body.css("transform", "rotateZ("+car.zRotation+"deg)");
  } else {
    car.jumper.css("transform", " rotateZ("+car.angle+"deg) translateZ("+car.zPosition+"px");
    // car.body.css("transform", "rotateX("+car.xRotation+"deg) rotateY("+car.yRotation+"deg) rotateZ("+car.zRotation+"deg)");
    car.nameEl.css("transform", "translateZ("+ parseInt(38 + car.zPosition) + "px) rotateX(-70deg)");
  }

  // Stretching......
  var percent = car.speed / maxspeed - 1;
  var scaler = 1;
  if(percent > 0) {
    scaler = scaler + percent;
  }
  
  car.body.css("transform","scaleY("+scaler+")");

  car.desiredIndicator.css("transform", "rotateZ("+car.angleDelta+"deg)");

  car.shadow.css("transform", "rotateZ("+car.angle+"deg)");
}

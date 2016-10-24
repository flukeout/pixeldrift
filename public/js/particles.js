// var particles = [];
//
// // Ooky going to leave this off for now
// function makeParticle(x,y, speed, angle,type, xVel,yVel){
//
//   console.log("make particle");
//
//   // and... apply some motion and stuff to these...?
//   // Move them in a similar direction ot the car...... ?
//   var particle = {
//     xRot : 0,
//     yRot : 0,
//     zRot : 0
//   };
//
//   var lifespan = 2000;
//
//   if(type == undefined){
//     type = "crash";
//   }
//
//   if(type == "grass") {
//
//     particle.xVel = getRandom(-1.5,1.5);
//     particle.yVel = getRandom(-1.5,1.5);
//     particle.zVel = 1;
//     particle.gravity = .175;
//
//     particle.opacity = 1;
//     particle.opacityVelocity = 0.02;
//
//     particle.xPos = x * scaling;
//     particle.yPos = y * scaling;
//     particle.zPos = 0;
//
//     particle.xRotVel = getRandom(2,8);
//     particle.yRotVel = getRandom(2,8);
//     particle.zRotVel = getRandom(2,8);
//
//   } else if ( type == "water") {
//     particle.xVel = getRandom(-1.5,1.5);
//     particle.yVel = getRandom(-1.5,1.5);
//     particle.zVel = 1;
//     particle.gravity = .175;
//
//     particle.opacity = 1;
//     particle.opacityVelocity = 0.03;
//
//     particle.xPos = x * scaling;
//     particle.yPos = y * scaling;
//     particle.zPos = 0;
//
//     particle.xRotVel = 0;
//     particle.yRotVel = 0;
//     particle.zRotVel = 0;
//
//     particle.xRot = 90;
//   } else if (type == "ghost") {
//
//     particle.xVel = 0;
//     particle.yVel = 0;
//     particle.zVel = 2;
//     particle.gravity = 0;
//
//     particle.opacity = .4;
//     particle.opacityVelocity = .02;
//
//     particle.xPos = x * scaling;
//     particle.yPos = y * scaling;
//     particle.zPos = 0;
//
//     particle.xRotVel = 0;
//     particle.yRotVel = 0;
//     particle.zRotVel = 0;
//
//     lifespan = 1500;
//
//   } else {
//     var angleChange = getRandom(-20,20);
//     angle = angle + angleChange;
//
//     particle.xVel = getRandom(-3,3);
//     particle.yVel = getRandom(-3,3);
//     particle.zVel = speed;
//     particle.gravity = .175;
//
//     particle.opacity = 1;
//     particle.opacityVelocity = 0.02;
//
//     particle.xPos = x * scaling;
//     particle.yPos = y * scaling;
//     particle.zPos = 0;
//
//     particle.xRotVel = getRandom(2,10);
//     particle.yRotVel = getRandom(2,10);
//     particle.zRotVel = getRandom(2,10);
//   }
//
//   var trail = $("<div class='particle'></div>");
//   var rotator = $("<div class='rotator'></div>");
//   trail.append(rotator);
//
//   if(type == "grass"){
//     trail.find(".rotator").css("background",trackData.lawnmower);
//     particle.zVel = 4;
//   } else if (type == "water") {
//     trail.find(".rotator").css("background","#4cb5dc");
//     trail.addClass("droplet");
//     particle.zVel = 4;
//   } else {
//     trail.find(".rotator").css("background",trackData.carcolors[0]);
//   }
//
//   if(type == "ghost") {
//     trail.height(scaling).width(scaling);
//   } else {
//     trail.height(scaling/2).width(scaling/2);
//   }
//
//   particle.el = trail;
//
//   $(".track").append(particle.el); // <- gotta figure this out i guess
//
//   setTimeout(function(el,p) {
//     return function(){
//       el.remove();
//       for(var i = 0, len = particles.length; i < len; i++){
//         if(particles[i] == p){
//           particles.splice(i, 1);
//         }
//       }
//     };
//   }(trail,particle), lifespan);
//
//   particles.push(particle);
// }
//
// function animateParticles(){
//   for(var i = 0; i < particles.length; i++){
//     var p = particles[i];
//
//     //Position
//     p.xPos = p.xPos + p.xVel;
//     p.yPos = p.yPos + p.yVel;
//     p.zPos = p.zPos + p.zVel;
//     p.zVel = p.zVel - p.gravity;
//     p.el.css("transform", "translateY("+p.yPos+"px)  translateX("+p.xPos+"px) translateZ("+p.zPos+"px)");
//
//     p.opacity = p.opacity - p.opacityVelocity;
//     p.el.css("opacity",p.opacity);
//
//     //Rotation
//     p.xRot = p.xRot + p.xRotVel;
//     p.yRot = p.yRot + p.yRotVel;
//     p.zRot = p.zRot + p.zRotVel;
//     p.el.find(".rotator").css("transform", "rotateX("+p.xRot+"deg) rotateY("+p.yRot+"deg) rotateZ("+p.zRot+"deg)");
//   }
// }



// Animation loop for the Particle Effects


var particles = [];         // Holds all particle objects
var blankParticles = [];    // Holdes reference to pre-appended particle elements
var maxParticleCount = 100; // Number of pre-appended particle divs

$(document).ready(function(){
  for(var i = 0; i < maxParticleCount; i++){
    var blankParticle = $("<div class='blank-particle'></div>");
    $(".track").append(blankParticle);
    blankParticles.push({
      active: false,
      el: blankParticle
    });
  }
});

// Makes a particle

function makeParticle(options){



  var particle = {
    x :     options.x || 0,
    xV :    options.xV || 0,
    xVa :   options.xVa || 0,
    y :     options.y || 0,
    yV :    options.yV || 0,
    yVa :   options.yVa || 0,
    z :     options.z || 0,
    zV :    options.zV || 0,

    xR : options.xR || 0,
    xRv : options.xRv || 0,
    yR : options.yR || 0,
    yRv : options.yRv || 0,
    zR : options.zR || 0,
    zRv : options.zRv || 0,

    o : options.o || 1,
    oV : options.oV || 0,

    scale : options.scale || 1,
    scaleV : options.scaleV || 0,
    scaleVa : options.scaleVa || 0,

    speed : options.speed || false,
    speedA : options.speedA || 0,
    angle : options.angle || false,

    color:  options.color || false,
    width : options.width || 20,
    height: options.height || 20,

    gravity : options.gravity || 0,
    className : options.className || false,

    lifespan : options.lifespan || 0,
    delay : options.delay || 0, //how long to wait before moving
  };


  if(particle.angle) {
    particle.angle =  particle.angle - 180;
    particle.xV = Math.sin(particle.angle * (Math.PI/180)) * particle.speed;
    particle.yV = Math.cos(particle.angle * (Math.PI/180)) * particle.speed;

    particle.xVa = Math.sin(particle.angle * (Math.PI/180)) * particle.speedA;
    particle.yVa = Math.cos(particle.angle * (Math.PI/180)) * particle.speedA;
  }


  for(var i = 0; i < blankParticles.length; i++){
    var blankParticle = blankParticles[i];
    if(blankParticle.active == false) {
      blankParticle.active = true;
      particle.referenceParticle = blankParticle;
      particle.el = blankParticle.el;
      break;
    }
  }

  if(!particle.el){
    return;
  }

  // Grabs an available particle from the blankParticles array
  particle.referenceParticle = blankParticle;

  particle.el[0].style.height = particle.height;
  particle.el[0].style.width = particle.width;
  particle.el[0].classList.add(particle.className);
  particle.el[0].style.background = particle.color;


  particle.move = function(){
    var p = this;

    if(p.delay > 0) {
      p.delay--;
      return;
    }

    p.lifespan--;

    if(p.lifespan < 0 || p.o < 0) {
      p.referenceParticle.active = false;
      p.el.removeAttr("style");
      p.el.removeClass(p.className);
      p.el.hide();

      for(var i = 0; i < particles.length; i++){
        if(p == particles[i]){
          particles.splice(i, 1);
        }
      }
    }

    p.x = p.x + p.xV;
    p.y = p.y + p.yV;
    p.xV = p.xV + p.xVa;
    p.yV = p.yV + p.yVa;

    p.o = p.o + p.oV;

    // If the particle is invisible
    // and won't be visible again
    // kill it off.
    if(p.o <= 0 && p.oV <= 0) {
      p.lifespan = 0;
    }



    p.z = p.z + p.zV;
    p.zV = p.zV - p.gravity
    
    if(p.z < 0) {
      p.z = 0;
      p.zV = -.65 * p.zV;
    }

    p.scale = p.scale + p.scaleV;
    p.scaleV = p.scaleV + p.scaleVa;

    p.xR = p.xR + p.xRv;
    p.zR = p.zR + p.zRv;
    p.yR = p.yR + p.yRv;


    p.el[0].style.transform = "translate3d("+p.x+"px,"+p.y+"px,"+p.z+"px) rotateX("+p.xR+"deg) rotateZ("+p.zR+"deg) rotateY("+p.yR+"deg) scale("+p.scale+")";
    p.el[0].style.opacity = p.o;
  } // particle.move()

  particles.push(particle);
  particle.el[0].style.display = "block";
  particle.el[0].style.opacity = 0;
}



drawParticles();

function drawParticles(){
  for(var i = 0; i < particles.length; i++){
    var p = particles[i];
    p.move();
  }
  requestAnimationFrame(drawParticles);
}

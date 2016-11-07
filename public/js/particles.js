

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
    
    bounce : options.bounce || false,

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


    if(p.scale <= 0 && p.scaleV <= 0) {
      p.lifespan = 0;
    }



    p.z = p.z + p.zV;
    p.zV = p.zV - p.gravity
    
    if(p.z < 0 && p.bounce) {
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

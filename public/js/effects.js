// Scatters a bit of debris on the track when the car hits a wall.

function crashDebris(x, y, angle, color) {

    for(var i = 0; i < 3; i++){

      var debrisOptions = {
        x : x + 3,
        y : y + 3,
        width : 9,
        height: 9,
        angle : 360 - angle + getRandom(-30,30),
        speed : getRandom(1,4),
        speedA : -.04,
        zV: getRandom(1.5,3.5),
        gravity : .15,
        xRv : getRandom(-1,1),
        yRv : getRandom(-1,1),
        zRv : getRandom(-5,5),
        o : 2,
        oV : -.04,
        lifespan: 400,
        color: color,
        bounce : true
      }

      makeParticle(debrisOptions);

      // Shadow particle options
      
      var shadowOptions = JSON.parse(JSON.stringify(debrisOptions));
      shadowOptions.color = "rgba(0,0,0,.15)";
      shadowOptions.zV = 0;
      makeParticle(shadowOptions);
    }
  }


// Throws a grass pixel into the air
// TODO - probably shouldn't pass the whole car object into this

function mowGrass(car, percent, type) {

    if(!type) { type = "grass"; }
    if(!percent) { percent = 1; }

    var groundColor = checkRGB(car.x,car.y);

    for(var i = 0; i < 3; i++){
      groundColor[i] -= 30;
      if(groundColor[i] < 0) {
        groundColor[i] = 0;
      }
    }

    // Particle color for the particle debris that gets kicked up
    var particleColor = checkRGB(car.x, car.y);
    // If it's a skid (for dirt) we make it a bit darker
    if(type == "skid") {
      for(var i = 0; i < 3; i++){
        particleColor[i] -= 20;
        if(particleColor[i] < 0) {
          particleColor[i] = 0;
        }
      }
    }
    particleColor = "#" + rgbToHex(particleColor[0],particleColor[1],particleColor[2]);

    // New color is for the ground..
    var newGroundColor = rgbToHex(groundColor[0],groundColor[1],groundColor[2]);
    if(type == "grass") {
      ctx.fillStyle = "#" + newGroundColor;
      ctx.fillRect(car.x * scaling, car.y * scaling, scaling, scaling);
    }

    var options = {
      x : car.showx,
      y : car.showy,
      width : 15,
      height: 15,
      zV: 3.5 * percent,
      gravity : .15,

      xRv : getRandom(-1,1),
      yRv : getRandom(-1,1),
      zRv : getRandom(-3,3),

      xV : getRandom(-1.5,1.5),
      yV : getRandom(-1.5,1.5),
      lifespan: 50,
      color: particleColor
    }

    makeParticle(options);

    var newOptions = {
      x : options.x,
      y : options.y,
      width : options.width,
      height: options.height,
      zRv : options.zRv,
      xV : options.xV,
      yV : options.yV,
      lifespan: options.lifespan,
      o : .15,
      color: "black",
    }
    makeParticle(newOptions);
}


function addAnimationClass(el, className) {
  el.removeClass(className).width(el.width());
  el.addClass(className);
}


// Adds a bomb to the board at x,y
// Pixel position, not grid position

function makeExplosion(xposition, yposition, size){

  playSound("boom");
  // shakeScreen();

  var blastOffset = (size - 20) / 2;
  var x = xposition - blastOffset;
  var y = yposition - blastOffset;

  var particle = {};
  particle.el = $("<div class='boom'><div class='shock'/><div class='body'/></div>");
  particle.el.css("height", size);
  particle.el.css("width", size);
  particle.el.css("transform","translate3d("+x+"px,"+y+"px,0)");

  setTimeout(function(el) {
    return function(){
      el.remove();
    };
  }(particle.el),500);

  $(".track").append(particle.el);

  // Make smoke puffs around the explosion
  for(var i = 0; i < 6; i++){

    var options = {
      x : xposition,
      y : yposition,
      angle: getRandom(0,359),
      zR : getRandom(-15,15),
      z : 1,
      scale : 1,
      scaleV : -.01,
      width : getRandom(30,55),
      className : 'puff',
      lifespan: 125,
    }

    options.x = options.x - (options.width/2) + 10;
    options.y = options.y - (options.width/2) + 10;
    options.height = options.width;
    options.speed = 1 + (4 * (1 - options.width / 50)); // The bigger the particle, the lower the speed
    makeParticle(options);
  }
}


function landingPuffs(xposition, yposition, size){


  // Make smoke puffs around the explosion
  for(var i = 0; i < 6; i++){

    var options = {
      x : xposition,
      y : yposition,
      angle: getRandom(0,359),
      zR : getRandom(-15,15),
      z : 1,
      scale : 1,
      scaleV : -.04,
      width : 15,
      className : 'puff',
      lifespan: 125,
      speed : getRandom(1.25,1.75)
    }

    options.height = options.width;
    makeParticle(options);
  }
}


function shakeScreen(){

  var border = $(".track-wrapper");

  border.each(function(index,el){

    var styleTag = $("<style type='text/css'>* {background: pink;}</style>");
    $("head").append(styleTag);

    styleTag.html(`
      @keyframes shake-`+index+` {
        0% {
          transform: translateX(`+ getRandom(-20,-10)+ `px) translateY(`+ getRandom(-20,-10)+ `px);
        }
        25% {
          transform: translateX(`+ getRandom(10,15)+ `px) translateY(`+ getRandom(10,15)+ `px) rotate(`+getRandom(1,4)+`deg);
        }
        50% {
          transform: translateX(`+ getRandom(-10,-5)+ `px) translateY(`+ getRandom(-10,-5)+ `px);
        }
        75% {
          transform: translateX(`+ getRandom(5,10)+ `px) translateY(`+ getRandom(5,10)+ `px) rotate(`+getRandom(-1,-3)+`deg);
        }
      }
    `);

    $(el).css("animation","shake-" + index + " .2s ease-out");

    setTimeout(function(styleTag,shakeEl) {
      return function(){
        styleTag.remove();
        $(shakeEl).css("animation","");
      };
    }(styleTag,el),200);

  });
}

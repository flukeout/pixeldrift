

// water

if(car.currentPosition == "water"){
  steeringVelocityMax = steeringVelocityMax / 3; // TODO - frameRate adjuster? like the over 3?...
  if(movedPixels) {
    for(var i = 0; i < 2; i++){
      // add water particles
    }
  }
}



// particles for crashing

    // for(var j = 0; j < 3; j++){
  //
  //     var options = {
  //       x : car.showx + 4,
  //       y : car.showy + 4,
  //       width : 8,
  //       height: 8,
  //       zV: 3.5,
  //       gravity : .15,
  //
  //       xRv : getRandom(-1,1),
  //       yRv : getRandom(-1,1),
  //       zRv : getRandom(-3,3),
  //
  //       xV : getRandom(-1.5,1.5),
  //       yV : getRandom(-1.5,1.5),
  //
  //
  //       lifespan: 50,
  //       color:"white"
  //       // color: "#60aa1f", //asdf
  //     }
  //
  //
  //
  //     makeParticle(options);
  //
  //     var newOptions = {
  //       x : options.x,
  //       y : options.y,
  //       width : options.width,
  //       height: options.height,
  //       zRv : options.zRv,
  //       xV : options.xV,
  //       yV : options.yV,
  //       lifespan: options.lifespan,
  //       o : .15,
  //       color: "black",
  //     }
  //
  //     makeParticle(newOptions);
  //   }
  
  
  
  // pixel.el.removeClass("pop");
  // pixel.el.width(pixel.el.width);
  // pixel.el.addClass("pop");
  
  // for(var i = 0; i < getRandom(1,5); i++) {

  // var options = {
  //   x : x * this.scaling + 10,
  //   y : y * this.scaling + 10,
  //   angle : getRandom(0,359),
  //   speed : 4,
  //   speedA : -.2,
  //   lifespan: 25,
  //   color: this.selectedColor,
  //  delay : 20
  // }

  // var size = getRandom(5,10);
  // options.width = size;
  // options.height = size;
  // makeParticle(options);
  // }
  
  
  

  .standing {
    font-family: "Lato";
    font-size: 18px;
    color: rgba(255,255,255,.5);
    position: relative;
    margin-bottom: 15px;
    padding: 10px 10px 10px 44px;
    opacity: .2;

    &.achieved {
      opacity: 1;
    }

    &:after {
      content: "";
      position: absolute;
      left: 0;
      top: 3px;
      height: 30px;
      width: 30px;
      background-position: center;
      background-repeat: no-repeat;
      background-size: 100%;
      image-rendering: pixelated;
    }

    &.gold {
      color: gold;
      &:after {
        background-image: ~"url(/img/medal-gold.png)";
      }
    }

    &.silver {
      color: silver;
      &:after {
        background-image: ~"url(/img/medal-silver.png)";
      }
    }

    &.bronze {
      color: #CD7F32;
      &:after {
        background-image: ~"url(/img/medal-bronze.png)";
      }
    }
  }
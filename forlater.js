

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
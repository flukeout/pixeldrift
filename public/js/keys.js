$(document).ready(function(){

  $(window).on("keypress",function(e){
    if(e.keyCode == 114){
      race.quickRestart();
    }
    if(e.keyCode == 99){
      $(".track-chooser").show();
    }
  });

  $(".quick-restart").on("click",function(){
    race.quickRestart();
  });


  $(".player-name").on("click",".confirm", function(){
    var newName = $(".player-name input").val();
    if(newName.length != 0){
      standings.changePlayerName(newName);
    }
  });


  $(window).on("keydown",function(e){
    if(e.keyCode == 37) {
      keyboardcar.setDirection("steering","left-on");
    }
    if(e.keyCode == 39) {
      keyboardcar.setDirection("steering","right-on");
    }
    if(e.keyCode == 38 || e.keyCode == 90) {
      keyboardcar.setDirection("gas","on");
    }
  });

  $(window).on("keyup",function(e){
    if(e.keyCode == 37) {
      keyboardcar.setDirection("steering","left-off");
    }
    if(e.keyCode == 39) {
      keyboardcar.setDirection("steering","right-off");
    }
    if(e.keyCode == 38 || e.keyCode == 90) {
      keyboardcar.setDirection("gas","off");
    }
  });

});
$(document).ready(function(){

  $(".quick-restart").on("click",function(){
    race.quickRestart();
  });

  $(".player-name").on("click",".confirm", function(){
    var newName = $(".player-name input").val();
    if(newName.length != 0){
      standings.changePlayerName(newName);
    }
  });

  $(".change-track").on("click",function(){
    $(".track-chooser").show();
  });


  $(window).on("keydown",function(e){


    if(e.keyCode == 27 && $(".track-chooser:visible").length > 0){
      $(".track-chooser").hide();
    }

    if(e.keyCode == 84) {
      console.log("toggle sound");
    }

    if(e.keyCode == 82){
      race.quickRestart();
    }

    if(e.keyCode == 67){
      $(".track-chooser").show();
    }

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
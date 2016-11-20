function buildTrackChooser(){

  //Get records from localstorage
  // var playerRecords = JSON.parse(localStorage.getItem("playerRecords")) || {};
  
  for(var i = 0; i < includeTracks.length; i++) {
      
    var trackName = includeTracks[i];
    var track = trackList[trackName];
      
    if(track) {
      var trackOption = $(".track-template").clone();
      trackOption.removeClass("track-template");
      trackOption.attr("track", trackName);

      var playerRecord = JSON.parse(localStorage.getItem(trackName)) || {};

      

      trackOption.find(".player-time").text(formatTime(playerRecord.time));
      trackOption.find(".track-difficulty").text(track.difficulty);

      trackOption.find(".track-thumbnail-wrapper").css("background-image","url(./public/tracks/" + track.filename + ")");

      trackOption.find(".track-name").text(trackName);

      $(".track-chooser .tracks").append(trackOption)

      trackOption.on("click",function(){
        var track = $(this).attr('track');
        trackData = trackList[track];

        //Leaderboard always needs to change first
        leaderBoard.changeLeaderboard(track);
        race.changeTrack(track);

        // Nukes out any ?leaderboard= parameters in the address bar
        window.history.replaceState( {} , 'Pixel Drift Club!', window.location.pathname );
        $(".track-chooser").hide();
      });
    }
  }
}

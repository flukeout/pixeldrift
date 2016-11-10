function buildTrackChooser(){

  //Get records from localstorage
  var playerRecords = JSON.parse(localStorage.getItem("playerRecords")) || {};

  for(var k in trackList){

    var track = trackList[k];

    if(includeTracks.indexOf(track.shortname) > -1) {

      var trackOption = $(".track-template").clone();
      trackOption.removeClass("track-template");
      trackOption.attr("track", track.filename);
      trackOption.attr("trackname", track.shortname);

      var pRecord = playerRecords[track.shortname] || {};

      trackOption.find(".player-time").text(formatTime(pRecord.lapTime));
      trackOption.find(".track-difficulty").text(track.difficulty);

      trackOption.find(".track-thumbnail-wrapper").css("background-image","url(./public/tracks/" + track.filename + ")");

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
}

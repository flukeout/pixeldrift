
function buildTrackChooser(){

  //Get records from localstorage
  var playerRecords = JSON.parse(localStorage.getItem("playerRecords")) || {};

  // one of the problems is we have to figure out the fricken player Rank vs global board...

  for(var k in trackList){

    var track = trackList[k];

    if(includeTracks.indexOf(track.shortname) > -1) {

      //Clone the template...

      var trackOption = $(".track-template").clone();
      trackOption.removeClass("track-template");
      trackOption.attr("track", track.filename);
      trackOption.attr("trackname", track.shortname);

      var pRecord = playerRecords[track.shortname] || {};

      trackOption.find(".player-time").text(formatTime(pRecord.lapTime));

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


   // var times = new Firebase('https://pixelracer.firebaseio.com/');

   // times.once("value", function(snapshot) {
   //   return; // dont do weird firebase shit
   //   var fbRecords = snapshot.val();
   //
   //   // This goes through all of the tracks..
   //   for(var key in fbRecords){
   //     if(includeTracks.indexOf(key) > -1) {
   //
   //       var trackName = key;
   //
   //       var playerKey = playerRecords[key].key; //The localstorage record key
   //
   //       var chooserEl = $(".track-chooser .track-option[trackname="+trackName+"]");
   //
   //       var trackData = fbRecords[key];
   //       var numRecords = Object.keys(trackData).length;
   //
   //       var trackRecords = [];
   //
   //       for(var r in trackData) {
   //         var data = trackData[r];
   //         var record = {
   //           "lapTime" : data.lapTime,
   //           "name" : data.name,
   //           "key" : data.key
   //         }
   //
   //
   //         if(record.key == playerKey){
   //           record.type = "player";
   //         }
   //
   //         trackRecords.push(record);
   //
   //         // console.log(trackRecords);
   //       }
   //
   //       trackRecords = trackRecords.sort(sortRecords);
   //
   //       var playerRank = "unranked";
   //
   //       for(var i = 0; i < trackRecords.length; i++) {
   //         var record = trackRecords[i];
   //         if(i < 3) {
   //           var recordWrapper = chooserEl.find(".leaders-wrapper");
   //           var newRecord = $("<div class='fastest-time'><div class='name'>" + record.name + "</div> <div class='time'>"+formatTime(record.lapTime)+"</div></div>");
   //           recordWrapper.append(newRecord);
   //         }
   //         if(record.type == "player") {
   //           playerRank = i + 1;
   //         }
   //       }
   //
   //           // this.records = this.records.sort(this.sortRecords);
   //
   //       chooserEl.find(".total-records .value").text(numRecords);
   //       chooserEl.find(".player-rank").text(playerRank);
   //     }
   //   }
   // });




}


// Not sure what's in here....

var standings = {
  el : $(".standings .players"),
  addToRace: function(){

    this.records = this.records.sort(this.sortRecords);

    var playerRank = 9999999999999;

    for(var i = 0; i < this.records.length; i++) {
      var thisRecord = this.records[i];
      if(thisRecord == this.playerRecord){
        playerRank = i+1;
        this.playerRecord.rank = playerRank;
      }
    }

    for(var i = 0; i < this.records.length; i++) {
      var record = this.records[i];
      record.showing = false;
    }

    //Goes from last to first.. end is 'higher'
    var start = playerRank - 2;
    var end = playerRank - 5;
    // var end = 0;

    if(end < 0) {
      end = 0;
    }
    if(start < 0) {
      start = 0;
    }

    race.ghostPlayData = [];



    for(var i = start; i >= end; i--) {
      var record = this.records[i];
      if(record.frames.length > 0) {
        record.showing = true;
        race.ghostPlayData.push(record)
      }
    }

    race.updateGhosts();
  },
  changePlayerName : function(newName) {
    localStorage.setItem("playerName",newName);
    this.playerRecord.name = newName;

    // * update the player name display in bottom left
    // * update the player name in the standings

    // what if we just had something called .playername-update and change that text...

    // Have to update all of the records this player owns??
    // Or will new records just take this one?
    // As a default - maybe let's just have "NEW" records go in...
  },
  updatePlayerName : function(){
    $(".player-name input").val(this.playerRecord.name);
  },
  updatePlayer : function(lapTime,lapFrames) {
    // What does this do?
    // This gets triggered when the player finishes a lap...
    // We should do the logic here for determining if this is the 'best lap' or not,
    // that should just live in standings.playerRecord

    if(lapTime > this.playerRecord.lapTime) {
      return; // If this isn't the best lap... FUCK IT
    }

    //Need to update 3 places...
    // * Firebase (we need to get the Unique key first, so we can set it in the localstorage & playerRecord?)
    // * Localstorage
    // * playerRecord

    this.playerRecord.lapTime = lapTime;
    this.playerRecord.frames = lapFrames;
    this.records = this.records.sort(this.sortRecords);

    for(var i = 0; i < this.records.length; i++) {
      var record = this.records[i];
      if(record.type == "player") {
        record.rank = i + 1;
      }
    }

    //Before updating a record, we need to check if that record already exists, and replace / update it...
    //var times = new Firebase('https://pixelracer.firebaseio.com/' + race.trackShortname);

    var score = JSON.parse(JSON.stringify(this.playerRecord)); // cloning it basically
    if(score.type == "player") {
      delete score["type"]; // When we push, we don't need this key / value pair.
    }
    // var timeRef = times.push();
    // score.key = timeRef.key();
    // timeRef.set(score);

    //Put it into localstorage also

    var localRecords = JSON.parse(localStorage.getItem("playerRecords")) || {};

    var trackRecord = {};

    if(localRecords[race.trackShortname]) {
      trackRecord = localRecords[race.trackShortname];
    } else {
      localRecords[race.trackShortname] = trackRecord;
    }
    // See if it had one before...

    var oldKey = false;
    if(trackRecord.key) {
      oldKey = trackRecord.key;
    }

    // SO basically, we will remove the firebase record that you had previously...
    // IF you get a new record.. THEN we remove the old record based on your previous key.. this should keep it in sync...

    trackRecord.lapTime = lapTime;
    trackRecord.key = score.key;
    trackRecord.frames = lapFrames;

    localStorage.setItem("playerRecords",JSON.stringify(localRecords));


    // If there was an old Key, we remove it from Firebase

    if(oldKey){
      var removeKey = new Firebase('https://pixelracer.firebaseio.com/' + race.trackShortname + "/" + oldKey);
      removeKey.remove();
    }

    // this.addToRace();
    // this.displayRecords();

  },
  sortRecords : function(x,y) {
    if(x.lapTime == "DNS") {
      return 1;
    }
    if(x.lapTime > y.lapTime) {
      return 1;
    }
    if(x.lapTime < y.lapTime) {
      return -1;
    }
    if(x.lapTime == y.lapTime) {
      return 0;
    }
  },
  clearLeaderBoard : function(){
    $(".leaderboard .players * ").remove();
  },
  displayRecords : function(){

    this.clearLeaderBoard();
    this.records = this.records.sort(this.sortRecords);

    var showRecords = 15;

    for(var i = 0; i < this.records.length; i++) {
      var thisRecord = this.records[i];
      if(thisRecord == this.playerRecord){
        playerRank = i+1;
        this.playerRecord.rank = playerRank;
      }
    }

    var start = playerRank + 2;
    var end = playerRank - 12;

    $(".player-rank .current-rank").text(this.playerRecord.rank);
    $(".player-rank .total-records .value").text(this.records.length);

    var lastRankDigit = parseInt(String(playerRank).charAt(String(playerRank).length - 1));
    var suffix;

    if(lastRankDigit == 1) {
      suffix = "st";
    } else if (lastRankDigit == 2) {
      suffix = "nd";
    } else if (lastRankDigit == 2) {
      suffix = "rd";
    } else {
      suffix = "th";
    }

    $(".player-rank .count-suffix").text(suffix);

    if(playerRank < showRecords) {
      start = showRecords;
      end = 0;
    }

    if(start > this.records.length) {
      start = this.records.length - 1;
    }

    for(var i = start; i >= end; i--) {
      var record = this.records[i];
      this.addRecord(i,record);
    }

  },
  addRecord : function(rank, record){

    var el = $("<div class='record'>");

    var time = JSON.parse(JSON.stringify(record.lapTime));
    if(isNaN(time)) {
      time = "??:??";
    } else {
      time = formatTime(time);
    }

    var timeEl = $("<div class='time'>" + time + "</div>");
    var nameEl = $("<div class='name'>" + record.name.toUpperCase() + "</div>");
    var placeEl = $("<div class='rank'>" + (rank+1) + ".</div>");
    if(record.showing) {
      el.addClass("showing");
    }
    el.prepend(placeEl).append(nameEl).append(timeEl).addClass(record.type);
    $(".leaderboard .players").prepend(el);

  },
  records : [],
  playerRecord : {
    name : "PLY",
    lapTime : "DNS",
    type : "player",
    rank : false,
    frames : []
  },
  load: function(){

    // Uncomment to clear the data if we want to
    // var kill = new Firebase('https://pixelracer.firebaseio.com/' + race.trackShortname);
    // kill.remove();

    // How should we treat names in different saved records?
    // We should just have a name global from localStorage.

    var that = this;
    this.records = [];

    var playerName = localStorage.getItem("playerName") || "AAA";
    var localRecords = JSON.parse(localStorage.getItem("playerRecords")) || {};

    this.playerRecord = {
      name : playerName,
      lapTime : "DNS",
      type : "player",
      rank : false,
      frames : [],
      key : ""
    }

    var savedRecord = localRecords[race.trackShortname];

    if(savedRecord) {
      this.playerRecord.lapTime = savedRecord.lapTime || "DNS";
      this.playerRecord.frames = savedRecord.frames || [];
      this.playerRecord.key = savedRecord.key || "";
    } else {
      localRecords[race.trackShortname] = {};
    }

    this.updatePlayerName();

    $(".leaderboard").addClass("loading");


    // TODO - fix this up so if, somehow... someway, the service is unreachable (or offline..)
    // Things will still be ok!
    // var times = new Firebase('https://pixelracer.firebaseio.com/' + race.trackShortname);
    //
    // times.once("value", function(snapshot) {
    //
    //   $(".leaderboard").removeClass("loading");
    //
    //   var count = snapshot.numChildren();
    //   var fbRecords = snapshot.val();
    //
    //   for(var key in fbRecords){
    //
    //     var entry = fbRecords[key];
    //
    //     var newEntry = {
    //       name : entry.name || "BOB",
    //       frames : entry.frames,
    //       frameIndex : 0,
    //       type : "ghost",
    //       lapTime : entry.lapTime,
    //       showing : false
    //     };
    //
    //     if(key != that.playerRecord.key) {
    //       that.records.push(newEntry);
    //     }
    //   }
    //
    //   if(that.playerRecord.rank) {
    //     that.playerRecord.rank = that.records.length + 1;
    //   }
    //
    //   that.records.push(that.playerRecord);
    //   that.addToRace();
    //   that.displayRecords();
    // });
  }

}


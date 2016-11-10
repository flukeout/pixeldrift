// * showTrackRecords - updates the leaderboard display..

var names = ["bob","bill","lammy","jammor","bingor"]; // Just for setting dummy records...

$(document).ready(function(){

  $(".leaderboard").on("click",".share-time",function(){
    console.log("challenge sent");
    $(".popup-overlay").show();
  });


  
  $(".player-name").on("click",".confirm-name", function(){
    var newName = $(".player-name input").val();
    
    // Only change the name if it's at least 1 char
    if(newName.length != 0){
      $(".player-name").attr("mode","display");
      $(".player-name input").attr("disabled","true");
      leaderBoard.changeName(newName);
    }
  });

  $(".player-name").on("click",".change-name", function(){
    $(".player-name").attr("mode","input");
    $(".player-name input").removeAttr("disabled");
    $(".player-name input").select();
  });

  $(".leaderboard").on("click","a[type]", function(){
    var type = $(this).attr("type");
    leaderBoard.showType(type);
  });

  leaderBoard.init();
});


  // Initialize Firebase
var config = {
  apiKey: "AIzaSyAgOW6wJcxmV251IYqC7JMT3gqRMAoL7e0",
  authDomain: "pixeldrift-d37b7.firebaseapp.com",
  databaseURL: "https://pixeldrift-d37b7.firebaseio.com",
  storageBucket: "pixeldrift-d37b7.appspot.com",
  messagingSenderId: "582316948317"
};

var leaderBoard = {

  localRecords : {},
  playerName : "flukeout",
  trackName : "",

  showLimit : 10,           // How many records to show...

  playerRecordKey : false,  // -KVkSaEohHw83nCGkfmN
  playerRecordRef : {},     // Holds reference / pointer to the player record in the trackRecords array...

  trackRecords : [],        // Record object for current track;

  // Connects to firebase
  init : function(){
    firebase.initializeApp(config);

    this.localRecords = JSON.parse(localStorage.getItem("playerRecords")) || {};
    this.playerName = localStorage.getItem("playerName") || "driver_" + Math.round(getRandom(0,100));
    
    $(".display-name").text(this.playerName);
    $(".driver-name").val(this.playerName);
  },

  changeName : function(name) {

    name = name.trim();
    
    if(name.length < 1) {
      return;
    }
    
    this.playerName = name;
    
    $(".driver-name").val(this.playerName);
    $(".display-name").text(this.playerName);
    localStorage.setItem("playerName", name);
    
    if(this.playerRecordRef.key) {
      var r = this.playerRecordRef;
      this.updateRecord(this.trackName, r.key, this.playerName, r.time);
    }
  },

  // Toggles which view is function
  // * "top times" or "player times"
  showType : function(type){
    $(".rank-wrapper").attr("mode",type);
    $(".leaderboard .selected").removeClass("selected");
    $(".leaderboard [type="+type+"]").addClass("selected");
  },

  newRecord : function(track, time) {
  
    // got a new record
    
    if(!this.playerRecordKey) {
      var key = this.addRecord(track, this.playerName, time);
      this.playerRecordKey = key;
    } else {
      this.updateRecord(this.trackName, this.playerRecordKey, this.playerName, time);
    }

    if(!this.localRecords[track]){
      this.localRecords[track] = {};
    }
    
    // What does this update? 
    updatePlayerRecord({
      key : this.playerRecordKey || false,
      lapTime : time,
      name : this.playerName
    });

    
    this.getTrackRecords(this.trackName);
  },
  
  
  // Updates a firebase record 
  updateRecord : function(track, key, name, time) {
    var recordRef = firebase.database().ref('leaderboard/' + track + '/' + key);
    recordRef.update({ 
      name: name, 
      time: time
    });
    
    this.showTrackRecords();
  },
  
  
  // Starts changing tracks...
  changeTracks : function(trackName){
    this.playerRecordKey = false;
    this.trackName = trackName;
    this.getTrackRecords(trackName);

    // Gotta check what we have...
    var time = "-.---";
    this.localRecords = JSON.parse(localStorage.getItem("playerRecords")) || {}; 
    if(this.localRecords[trackName]){
      var localRecord = this.localRecords[trackName]
      var time = formatTime(localRecord.lapTime);
    }

    $(".lap-time").text("0.000");
    $(".best-time").text(time);
  },


  // Gets the records for this track from Firebase
  // then fires "tihs.showTrackRecords()"
  getTrackRecords : function(trackName){

    this.playerRecordRef = false;

    $(".leaderboard .loading").show();

    var localRecords = JSON.parse(localStorage.getItem("playerRecords")) || false;

    if(localRecords) {
      var localRecord = localRecords[trackName] || false;
    }

    if(localRecord) {
      this.playerRecordKey = localRecord.key || false;
      race.bestlap = localRecord.lapTime;
      $(".best-time").text(formatTime(localRecord.lapTime));
    }
 
    this.trackName = trackName;
    
    var that = this;
    this.trackRecords = [];

    firebase.database().ref('/leaderboard/' + trackName)
      .orderByChild('time')
      .once('value').then(function(snapshot) {

        var i = 0;

        if(!snapshot.val()) {
          that.showTrackRecords();
          return;
        }
        
        snapshot.forEach(function(child) {
          
          var c = child.val();
          
          var item = {
            name: c.name || "unknown_xx",
            time : c.time,
            key : child.key,
            place : i
          }
          
          i++;
          
          if(child.key == that.playerRecordKey) {
            that.playerRecordRef = item;
          }
          that.trackRecords.push(item)

        });
        that.showTrackRecords();
    });
  },


  // Updates what is shown in the leaderboards
  // Only fired when a track loads basically... 
  showTrackRecords : function(){

    if(this.playerRecordRef.name != this.playerName && this.playerRecordRef) {
      this.playerRecordRef.name = this.playerName;
      this.updateRecord(this.trackName, this.playerRecordKey, this.playerName, this.playerRecordRef.time);
    }

    $(".leaderboard .loading").hide();

    var that = this;

    $(".players .entry").remove(); // Nuke all existing records

    // We need to inject  player record in there if we dont't find it... 
    // Populate the list around the player's time & highlight player

    var playerIndex = this.playerRecordRef.place;
    if(playerIndex) {
      var start = playerIndex - this.showLimit/2;
      var end = playerIndex + this.showLimit/2;
    } else {
      var start = this.trackRecords.length -  this.showLimit;
      var end = this.trackRecords.length;
    }

    for(var i = start; i < end; i++) {
      var record = this.trackRecords[i];
      if(record) {
        record.key == this.playerRecordRef.key ? type = "player" : type = false;
        $(".leaderboard .player-rank").append(that.makeLeaderBoardEl(record.place + 1, record.name, record.time, type));
      }
    }
  },
  
  
  // Creats a leaderboard element to inject
  makeLeaderBoardEl : function(rank,name,time, type) {
    var displayName = name.substring(0,12);

    var recordEl = $("<div class='entry'/>");

    recordEl.append("<div class='rank'>" + rank + "</div>");
    recordEl.append("<div class='time'>" + formatTime(time) + "</div>");
    recordEl.append("<div class='name'>" + displayName + "</div>");

    if(type == "player") {
      recordEl.addClass(type);
      recordEl.append("<div class='share-time'>Send Challenge</div>");
    }

    return recordEl;
  },


  // Adds some junk records to the thing..
  addTestRecords : function(){
    for(var i = 0; i < 100; i++) {
      // console.log(getRandom(0,names.length-1));
      var firstName = names[Math.floor(getRandom(0,names.length - 1))];
      var lastName = names[Math.floor(getRandom(0,names.length - 1))];
      var name = firstName + lastName;
      var time = Math.floor(getRandom(100,25000));
      this.addRecord("chasm", name, time);
    }
  },


  // Adds a record into firebase..
  // we won't use this though, we'll be more careful...
  // ...and returns the key!
  addRecord : function(trackName, name, time) {
    
    var trackLeaderboard = firebase.database().ref('leaderboard/' + trackName);
    var newRecord = trackLeaderboard.push();
 
    newRecord.set({
      time : time,
      name : name
    });
    
    return newRecord.key;
  }
}

var names = ["bob","bill","lammy","jammor","bingor"]; // Just for setting dummy records...

$(document).ready(function(){

  $(".leaderboard").on("click",".make-leaderboard",function(){
    leaderBoard.makeLeaderboard();
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
  
  localRecord : false,
  
  playerName : "flukeout",
  trackName : "",
  
  leaderboardType : "global",   // Can be "global" or "custom" - custom leaderboards have ghosts, global ones dont 

  firebasePath : "",
  localPath : "",

  boardID : "",

  showLimit : 10,           // How many records to show...

  localRecord : false,      // Holds reference to the localStorage record for this track

  trackRecords : [],        // Record object for current track;

  // Connects to firebase
  init : function(){

    firebase.initializeApp(config);
    
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

  },

  // Adds a new record!
  newRecord : function(name, time, ghostData) {

    // Check if there is a local record for this leaderboard
    
    if(this.localRecord) {
      if(this.localRecord.key){
        this.updateFirebaseRecord(this.localRecord.key, this.playerName, time, ghostData);
      }
    } else {
      this.localRecord = {};
      var key = this.addFirebaseRecord(this.playerName, time, ghostData);
      this.localRecord.key = key;
    }

    // Update the localRecord
    this.updateLocalRecord({
      key : this.localRecord.key,
      time : time,
      name : this.playerName,
      ghost: ghostData
    });

    this.getTrackRecords();
  },
  
  
  // Updates record in localStorage
  updateLocalRecord : function(data){
    this.localRecord = JSON.parse(localStorage.getItem(this.localPath)) || {};
    
    for(var k in data) {
      this.localRecord[k] = data[k];
    }

    localStorage.setItem(this.localPath,JSON.stringify(this.localRecord));
  },

  // Gets the local record and returns it
  // called from single.js 
  getLocalGhost : function(){
    return JSON.parse(localStorage.getItem(this.localPath)) || false;
  },

  // Changes the leaderboard..
  // And the reference to localStorage stuff..
  changeLeaderboard : function(boardID){
    
    this.boardID = boardID;
  
    // This is the 'path' well use for firebase and 
    // localstorage (the keyname) to access data
    this.firebasePath = "leaderboards/" + this.boardID;
    this.localPath = this.boardID;
    
    // Figure out if it's a global or 'custom' leaderboard...
    if(includeTracks.indexOf(this.boardID) > -1) {
      this.leaderboardType = "global";
      var displayname = "Global"
      $(".leaderboard-author").hide();
    } else {
      this.leaderboardType = "custom";
      var displayname = "Custom"
      $(".leaderboard-author").show();
    }

    $(".leaderboard-type").text(displayname);
    
    // If it's a custom leaderboard, we have to change the track too.. 
    if(this.leaderboardType == "custom") {
      firebase.database().ref(this.firebasePath + "/track").once('value').then(function(snapshot) {
        var trackName = snapshot.val();
        race.changeTrack(trackName);
      });
      firebase.database().ref(this.firebasePath + "/owner_name").once('value').then(function(snapshot) {
        var createdBy = snapshot.val();
        $(".leaderboard-author .author-name").text(createdBy);
      });


    }

    var time = "-.---";

    this.localRecord = JSON.parse(localStorage.getItem(this.localPath)) || false;
    
    if(this.localRecord){
      var time = formatTime(this.localRecord.time);
      race.bestlap = this.localRecord.time;
    } else {
      race.bestlap = 0;
    }

    $(".lap-time").text("0.000");
    $(".best-time").text(time);

    this.getTrackRecords();
  },


  // Gets the records for this track from Firebase
  // then fires "tihs.showTrackRecords()"
  getTrackRecords : function(){

    // $(".leaderboard .loading").show();    
    $(".leaderboard .loading").hide();
    
    var that = this;

    // Holds all of the 
    this.trackRecords = [];

    race.ghostCarData = [];

    firebase.database().ref(this.firebasePath + "/records")
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
          
          if(c.ghost) {
            race.addGhostCarData(c);
          }
          
          i++;
          
          if(child.key == that.localRecord.key) {
            that.updateLocalRecord({ place : item.place + 1 });
          }
          
          that.trackRecords.push(item)
        });

        that.showTrackRecords();
    });
  },

  // Updates what is shown in the leaderboards
  // Only fired when a track loads basically... 
  showTrackRecords : function(){

    // $(".leaderboard .loading").hide();

    var that = this;

    $(".players .entry").remove(); // Nuke all existing records

    // We need to inject  player record in there if we dont't find it... 
    // Populate the list around the player's time & highlight player

    var playerPlace = this.localRecord.place;
    
    if(playerPlace) {
      var start = playerPlace - this.showLimit/2;
      var end = playerPlace + this.showLimit/2;
    } else {
      var start = this.trackRecords.length -  this.showLimit;
      var end = this.trackRecords.length;
    }

    for(var i = start; i < end; i++) {
      var record = this.trackRecords[i];
      if(record) {
        record.key == this.localRecord.key ? type = "player" : type = false;
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
    }

    return recordEl;
  },


  // Adds some junk records to the thing..
  addTestRecords : function(){
    // for(var i = 0; i < 100; i++) {
      // console.log(getRandom(0,names.length-1));
      // var firstName = names[Math.floor(getRandom(0,names.length - 1))];
      // var lastName = names[Math.floor(getRandom(0,names.length - 1))];
      // var name = firstName + lastName;
      // var time = Math.floor(getRandom(100,25000));
      // this.addFirebaseRecord("chasm", name, time);
    // }
  },

  //Creates a new leaderboard & adds the player's current record
  // * into the new leaderboard
  // * into localstorage
  makeLeaderboard : function() {

    var leaderboardList = firebase.database().ref('leaderboards/');
    var newLeaderboard = leaderboardList.push();

    newLeaderboard.update({
      owner_name : this.playerName,
      track : this.trackName,
      message : "Hello & welcome to my custom leaderboard.",
    });
    
    var leaderboardKey = newLeaderboard.key;
    
    // Add the local record into it...
    if(this.localRecord) {

      var records = firebase.database().ref('leaderboards/' + leaderboardKey + '/records');
      var newRecord = records.push();

      newRecord.set({
        name : this.localRecord.name,
        time : this.localRecord.time,
        ghost : this.localRecord.ghost
      });
      
      var recordKey = newRecord.key;
      this.localRecord.key = newRecord.key;

      localStorage.setItem(leaderboardKey,JSON.stringify(this.localRecord));
    }
  },


  // Updates a firebase record 
  updateFirebaseRecord : function(key, name, time, ghostData) {


    var recordRef = firebase.database().ref(this.firebasePath + '/records/' + key);

    // Don't add ghost data to the global leaderboards
    if(this.leaderboardType == "global") {
      ghostData = false; 
    }

    recordRef.update({ 
      name: name, 
      time: time,
      ghost : ghostData
    });

    this.showTrackRecords();
  },
    
  // Adds the leaderboard type & owner and stuff like that...
  // This barely happens, just when tehre isn't a 'global' leaderboard, and someone is the first entry in it
  // TODO - not sure if this is required...
  initLeaderboard(){

    var firebaseLeaderboard = firebase.database().ref(this.firebasePath);
    var that = this;

    firebaseLeaderboard.update({
      type : that.leaderboardType
    });
  },
  
  // Adds a record into firebase..
  // we won't use this though, we'll be more careful...
  // ...and returns the key!
  addFirebaseRecord : function(name, time, ghostData) {
    
    var that = this;

    var trackLeaderboard = firebase.database().ref(this.firebasePath);
    trackLeaderboard.once("value",function(snapshot){
      var contents = snapshot.val();
      if(!contents.type) {
        that.initLeaderboard();
      }
    });

    var trackLeaderboardRecords = firebase.database().ref(this.firebasePath + "/records");

    var newRecord = trackLeaderboardRecords.push();

    // Don't add ghost data to the global leaderboards
    if(this.leaderboardType == "global") {
      ghostData = false; 
    }

    newRecord.set({
      time : time,
      name : name,
      ghost : ghostData
    });

    return newRecord.key;
  }
}

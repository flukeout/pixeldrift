var challengeManager = {
  
  loadRace : function(id){
    // console.log("loading race ", id);
  },
  
  sendChallenge : function(){

    var trackName = race.track;
    var localRecords = JSON.parse(localStorage.getItem("playerRecords")) || {};
    var trackRecord = localRecords[trackName];

    var challangeList = firebase.database().ref('challenges/');
    var newChallenge = challangeList.push();
 
    newChallenge.set({
      author : trackRecord.name,
      message : "can you dig it?",
      leaderboard : [],
      track : trackName,
    });
    
    var key = newChallenge.key
    var challengeLeaderboard = firebase.database().ref('challenges/' + key + '/leaderboard');

    var newEntry = challengeLeaderboard.push();

    newEntry.set({
      name : trackRecord.name,
      time : trackRecord.lapTime,
      ghost : trackRecord.ghost
    });

  }
}
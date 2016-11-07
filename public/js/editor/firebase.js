$(document).ready(function(){
  firebaseManager.init();
  
  $(".user-bar .sign-out").on("click",function(){
    firebaseManager.signOutClicked();
  });

  $(".user-bar .delete-track").on("click",function(){
    firebaseManager.deleteTrackClicked();
  });

  $(".user-bar .sign-in").on("click",function(){
    firebaseManager.signInClicked();
  });

  $(".user-bar .your-tracks, .track-menu .hide").on("click",function(){
    firebaseManager.trackListToggle();
  });

  $(".user-bar .sign-in").on("click",function(){
    firebaseManager.signInClicked();
  });

  $(".user-bar .save-track").on("click",function(){
    firebaseManager.saveTrackClicked();
  });
  
  // firebaseManager.trackListToggle();
});

  // Initialize Firebase
var config = {
  apiKey: "AIzaSyAgOW6wJcxmV251IYqC7JMT3gqRMAoL7e0",
  authDomain: "pixeldrift-d37b7.firebaseapp.com",
  databaseURL: "https://pixeldrift-d37b7.firebaseio.com",
  storageBucket: "pixeldrift-d37b7.appspot.com",
  messagingSenderId: "582316948317"
};



var firebaseManager = {

  trackKey : 0,
  signedIn : false,

  saved : false,
  modified : false,

  updateSavedUI : function(){
    

    
    
  },

  saveTrackClicked : function(){
    var trackName = $(".user-bar input").val();
    trackName = trackName.toLowerCase();
    
    if(trackName.length == 0) {
      return;
    }
    
    var userTracksList = firebase.database().ref('user-tracks/' + this.user.uid);
    var newTrackRef = userTracksList.push();

    newTrackRef.set({
      'trackname' : trackName,
      'palette' : palette.colors
    });

    var key = newTrackRef.key;

    this.trackKey = key; //filename will be key + .png
    
    var fileName = key + ".png"; //filenames will just get the unique ID of the track entry
    
    var canvas = editor.canvasEl[0];

    var that = this;

    var blob = canvas.toBlob(function(blob){
      that.uploadFile(blob, fileName)
    },"image/png");
    
  },
  
  deleteTrackClicked : function(){
    
    // we need to get the user id...
    // delete it form two posts
    // console.log(this.trackKey);
    
    
  },

  uploadFile : function(blob, fileName) {

    var storageRef = firebase.storage().ref();
    var newImageRef = storageRef.child('user-tracks/'+ fileName);
    var that = this;

    newImageRef.put(blob).then(function(snapshot) {
      that.saved = true;
      that.updateUI();
    });
  },
  

  init : function(){

    firebase.initializeApp(config);
    
    var that = this;
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        that.signedIn = true;
        that.user = user;
        that.loadTrackList();
        
      } else {
        that.signedIn = false;
      }
      that.updateUI();
    });
  },

  signOutClicked: function(){

    var that = this;
    firebase.auth().signOut().then(function() {
      that.signedIn = false;
      that.updateUI();
    }, function(error) {
      console.error('Sign Out Error', error);
    });
  },
  
  updateUI : function(){
    $(".user-bar .track-name").val("unnamed track");
    
    if(this.signedIn) {
      $(".user-bar .user-avatar").attr("src",this.user.photoURL);
      $(".user-bar .user-name").text("hi, " + this.user.displayName);
      $(".user-bar .signed-in").show();
      $(".user-bar .signed-out").hide();
    } else {
      $(".user-bar .signed-in").hide();
      $(".user-bar .signed-out").show();
    }

    if(this.saved) {
      $(".delete-track").show();
    } else {
      $(".delete-track").hide();
    }
  },
  
  signInClicked : function(){

    var provider = new firebase.auth.TwitterAuthProvider();

    var that = this;

    firebase.auth().signInWithPopup(provider).then(function(result) {
      // This gives you a the Twitter OAuth 1.0 Access Token and Secret.
      // You can use these server side with your app's credentials to access the Twitter API.
      var token = result.credential.accessToken;
      var secret = result.credential.secret;
      var user = result.user;

      that.signedIn = true;
      that.user = user;
      that.updateUI();

      
    }).catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      // The email of the user's account used.
      var email = error.email;
      // The firebase.auth.AuthCredential type that was used.
      var credential = error.credential;

      that.user = false;
      that.signedIn = false;
      that.updateUI();

    });
    
  },

  addTrackItem : function(data){
    console.log(data);
    
    var trackItem = $("<div>"+data.trackname+"</div>");
    $(".track-list").append(trackItem);


    var storageRef = firebase.storage().ref();

    storageRef.child('user-tracks/' + data.filename + '.png').getDownloadURL().then(function(url) {

      console.log(url);

    }).catch(function(error) {
      // Handle any errors
    });
  },
  
  loadTrackList : function(){
    var that = this;
    var userId = this.user.uid;
    firebase.database().ref('/user-tracks/' + userId).once('value').then(function(snapshot) {
      snapshot.forEach(function(snapshot) {
         var key = snapshot.key;
         var childData = snapshot.val();
         childData.filename = key;
         that.addTrackItem(childData);
       });
    });
    
  },
  
  trackListToggle : function(){
    
    $(".track-menu").toggleClass("hidden");
  }
  
  
}
## Settings

* Track chooser is not displaying records correctly.. BUT WHY SIR WHY WHY WHY WHY WHY WHY W HY WHYW Hhljljkk...

**BUG**

* Your first time around the track registers as 'new record' after refreshing, even if it's slower
  * than your localRecord...
  * Must not be getting set properly (race.bestlap?)

##Left Off

* Hid the share and invite buttons in leaderboard

* When loading a global track with no localRecord, it plays the last ghost I think...

* Display names on custom leaderboards...

* Handle UX for creating, loading & displaying custom leaderboards.
  * Add share icons to the custom leaderboard...

## Custom Leaderboards


* For custom leaderboards, add..
 * Owner name?
 * Owner key? - why, what does it matter?
 * Allow them to be deleted?

* Probably we'll have to separate changing tracks and the leaderboard
  * leaderboard will have to tell the track what track to use, since it will be custom..
  * 

* getLocalGhost is using the wrong path... 

* What if there is a local record, but no corresponding firebase record?
  * Should we add it to the leaderboard, or wait for a new one?

* When switching to a different track, it tries to play the last track's ghost
* make sure we nuke bestghost from single.js

* Up next - should test if making & loading custom leaderboards works as expected

* Also make it so that the leaderboard can have records, a track, name etc..
* We can check.. if that stuff exists..?

/leaderboards/oval/ {
  type : custom or global
  track: oval,
  owner_key : key,
  owner_name : blam,
  records : []
}

* Plays the wrong ghost still when switching tracks
* make it so that ifyou have a custom leaderboard, it loads a track from that leaderboard
* So looks like now i just have to block the ghosts from being added to teh "global boards" in leaderboard.js
  * addFirebaseRecord
  * updateFirebaserRecord

Leaderboard entry item structure is...

key : {
  name : "flukeout",
  time : 2000,
  ghost : {
    controls : [],
    start : {}
  }
}

* Where i left off
* made a unified leaderboard system, so far adding a record into it each time

one problem is that every new lap , the ghost from the player gets added over and over to the 'new cars' i think...
will need to double check, but now guitar time.



##Working on

Okay so where we really left off was that we have..

* newGhostCars - this gets reset every lap, and the player ghost is added into it
* but, the leaderboard only adds the ghosts from the leaderboard once, so they get nuked

What we need to do is..

* Have a separate array of ghost data, then add thew newGhostCars from that every lap
* And also add the players best ghost to that too...
* rename newGhostCars to activeGhostCars or something, for clarity


leaderboard.changeLeaderboard()

  * making it so that you can load any ole leaderboard, 
  * any any ole local leaderboard


For ghosts, probably have to do it this way..

 * Load the leaderboard ghosts into a separate variable
 * Then each lap, add from that..

Where I left off..

* Looks like i left off being able to load either the global leaderboard
* OR a local challange leaderboard
  * Loads the ghosts from the leaderboard if they're available..
  


##Bugs

* Put back 'get ready' message, just off for dev

So, within a challenge, what do I want to do..

* Update the leaderboard!
* Do i want to keep things locally too?
* Like a challenges object in localStorage? With..
  * That players record / key for their record?
  * So if they get a good time, we need to scope localStorage & firebase Storage
  
  playerRecords

  * /trackname
    * ghost
    * lapTime
    * key
    * name

  challenges

  * /challange_id
    * ghost
    * lapTime
    * key
    * name
  
  
  

##Keep an Eye On

* Sometimes the ghost data doesn't have a frame at the [0] time frame, which it always should





##Problems 

* Leaderboard entries are easy to "hack"

**Solution**

* Create a node service that is responsible for..
  * Adding a new record
  * Updating an existing record


**How will this work?**

* When a new score is submitted, it needs to be validated. Some things we can use...
  * Minimum time to finish the track
  * Minimum number of checkpoints (we know this per track)

* We can submit the ghost data to this service along with the lap time and it can try to validate it
  * Are all of the commands sensical?
  * Do all of the keypresses happen with increasing timestamps?

* What prevents someone from creating a fake replay JSON to submit to all tracks one by one??
  * Should I bother with this? Or no?


##Improvements

 * Add a sorting to the track list (in the menu)
 * Should just re-order the existing items based on new data...
 * Fix up collisions, shit gets craaaazy inside tight levels...
 * Display "rank" on the level menu?
 * How should I do the track order?
 * Add medals?
 * Keybaord controls on track chooser
 * How to do track progression?
 * Add analytics
 * Twitter / FB share (take from CSS)
 * Add slight variation to engine noise on turns, so its not totally monotonous..

###Left off working on

* If localStorage has a track name that doesn't exist.. things go south..
  * Check, and if it doesn't exist, show the track menu...


Nice to haves?

* Show rank on the track menu...
* Indicate that you've posted a time on the track menu...
* Updating the leaderboard is very jerky, shouldn't happen when you move up the rank, 
* Add reverb to engine sound when you're under a bridge?


Big stuff

* Change leaderboards to do an average
* Figure out how to enforce getting the checkpoints in the right order
* Also how to punish for grass?
  * .. if you can rip right through the grass, what's holding people back from just smashing through it to get good times?
  * what about if you hit grass, we let you finish but mark it as a 'bad lap' somehow?
  * You can only get a good lap if you dont hit the grass...
  * Put an X on it, only perfect laps allowed!


Questions

* maybe separate each achievement / track into a separate localstorage item? ?? ? ?
* save replay data in localstorage independently of the 'playerRecord'?
* ghost doesn't stick around after recording it and refreshing....



##Editor

* Tryin to load in the images for the tack picker menu...
  * firebase.js line 200

* Add ability to crop / resize canvas
  * Draggable handles on sides.. i guess...

* probably make it so you can drive right on the track..
  * test / edit as a toggle..

* common view / styles for track list?



##Track considerations

Turbo 8 

* The turn at the bottom with the finish line sucks, encourages cutting of the turn
  * Need to be able to place finish lines in other spots wiht a 'direction' encoded in the track maybe
  * So that it doesn't create that weirdness
* Optinoally, shoudl be able to extend teh finish line two pixles above and below..? For near misses
* Also, keep getting a 180 bounce off


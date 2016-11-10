##Problems 

* Open leaderboard..!
* Where can we do the validation?
* Do we need to go back to node?

##Improvements

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


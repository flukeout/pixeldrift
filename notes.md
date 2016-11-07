
###Left off working on

* When it loads the leaderboard, it shoudl update your 'rank' in localstorage? Should it, for what?
  * For the menu ??
* If localstoreage has a track name that doesn't exist.. things go south..
  * Check, and if it doesn't exist, show the track menu...


Big stuff

* Move to a moving average .. 
* Figure out how to enforce getting the checkpoints in the right order

* Also how to punish for grass?
  * .. if you can rip right through the grass, what's holding people back from just smashing through it to get good times?
  * what about if you hit grass, we let you finish but mark it as a 'bad lap' somehow?
  * You can only get a good lap if you dont hit the grass...
  * Put an X on it, only perfect laps allowed!


Easy stuff 

* if player is in the 'top' then highlight the player too
* when you cross the finish without hitting the checkpints, the ghost doesn't restart with u

last shit
 * once you create a ghost, it doesn't seem to be the fastest.. does it get updated?
* if a ghost falls off, it does a quickrestart now! boo...
* ghost shouldn't do a trackbounce if it lands after a jump, only player car..... . .   
* add 'difficulty' to tracks
* maybe separate each achievement / track into a separate localstorage item? ?? ? ?
* add 'rank' of your time to the localstorage record...
* save replay data in localstorage independently of the 'playerRecord'?
* ghost doesn't stick around after recording it and refreshing....


cosmetic considerations
* top-to-bottom checkpoint 'gates' are barely visible.. what should do?


##Left Off##

For the editor

* Tryin to load in the images for the tack picker menu...
  * firebase.js line 200

* Add ability to crop / resize canvas
  * Draggable handles on sides.. i guess...

* probably make it so you can drive right on the track..
  * test / edit as a toggle..

* common view / styles for track list?


###TODO

New Ghost Problems

* Still pretty glitchy / jumpy obviously getting desynced a bit
* Keep investigating the 16ms delta problem
* Make it stop after the lap is completed..


* Add back the 'skids'
* Add back the "get ready" screen from single.js

* Inject a placeholder record for the leaderboard in the 'you' section when you load a track.. so its' not blank, but shows
* Player will have a "-.---" .. .. .. .







Fix Z-index bug

* something weird between .line, .car and .skids

BUGS 

* 

  

Ease of Experience

* If you do a lap but don't hit the checkpoints, reset the lap so they can go again, don't make them go get that one checkpoint they missed, son.
* Find a way to extend the finish line above and below a bit to avoid 'near misses'


BIG features

* Indicate the check points better!
* Change how the ghost drives & how the replay is recorded, just get the input controls


** BIG BUGS ** 

* The ghost doesn't reload correctly when you start a new level
  
** Juice ** 

* Tweak/refactor the car stretch when turboing
* Add some debris to crashes!

Usability 

* Add keyboard controls to the track menu




Turbo 8 

* The turn at the bottom with the finish line sucks, encourages cutting of the turn
  * Need to be able to place finish lines in other spots wiht a 'direction' encoded in the track maybe
  * So that it doesn't create that weirdness
* Optinoally, shoudl be able to extend teh finish line two pixles above and below..? For near misses
* Also, keep getting a 180 bounce off


* Get the Ready 2 player font for offline use..!



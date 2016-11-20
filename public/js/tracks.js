var playerAchievements = {}; // So that we can remember.. what you have gotten.....
var trackData = {}; //Place holder for current track -  gets populated, yo.

var includeTracks = [
  // "twitter",
  // "html5",
  "oval",
  "turbo-8",
  "ampersand",
  "chasm",
  "darkloop",
  "superjump",
  "yellow",
  "splash",
  "offroad"
  // "grass",
  // "testground",  
]



var trackTimes = {
  "offroad.png" : {
    gold : 12000,
    silver : 12500,
    bronze : 13000
  },
  "html5.png" : {
    gold : 7000,
    silver : 7750,
    bronze : 8250
  },
  "moon.png" : {
    gold : 4750,
    silver : 5500,
    bronze : 6000
  },
  "splash.png" : {
    gold : 7500,
    silver : 8000,
    bronze : 9000
  },
  "oval.png" : {
    gold : 3000,
    silver : 3500,
    bronze : 4000
  },
  "oval-8.png" : {
    gold : 3000,
    silver : 3500,
    bronze : 4000
  },
  "ampersand.png" : {
    gold : 6100,
    silver : 6550,
    bronze : 7000
  },
  "chasm.png" : {
    gold : 5500,
    silver : 6000,
    bronze : 6500
  },
  "yellow.png" : {
    gold : 8000,
    silver : 8500,
    bronze : 9000
  },
  "noirjump.png" : {
    gold : 8000,
    silver : 9000,
    bronze : 10000
  },
  "superjump.png" : {
    gold : 8000,
    silver : 9000,
    bronze : 10000
  },
  "twitter.png" : {
    gold : 5250,
    silver : 6000,
    bronze : 6500
  },
  "turbo-8.png" : {
    gold : 3500,
    silver : 4000,
    bronze : 4500
  }
}

var trackList = {
  "html5" : {
    filename : "html5.png",
    carcolors : ["#d04415"],
    prettyname: "HTML 5",
    trailcolor : "#d04415",
    leaveSkids : false,
    difficulty : "expert",
    laps : 3,
    hexes : {
      "#ffffff" : "road", //yellow
      "#616161" : "road",
      "#3c3c3c" : "checkpoint",
      "#444444" : "road",
      "#c7c7c7" : "road",
      "#535353" : "road",
      "#3a3a3a" : "road", //road shadow
      "#e1e1e1" : "road",
      "#ad3209" : "ledge",
      "#414141" : "turbo",
      "#bababa" : "finish",
      "#343434" : "jump",
      "#c25115" : "jump"
    }
  },
  "splash" : {
    filename : "splash.png",
    carcolors : ["#ffffff"],
    trailcolor : "#ffffff",
    leaveSkids : true,
    difficulty : "expert",
    laps : 3,
    hexes : {
      "#e4d900" : "road", //yellow
      "#ec008c" : "road", //magenta
      "#00aeef" : "road", //blue
      "#009dd8" : "finish",
      "#151515" : "jump"
    }
  },
  "offroad" : {
    filename : "offroad.png",
    // carcolors : ["#424130"],
    carcolors : ["#1766AD"],
    trailcolor : "#1766AD",
    lawnmower : false,
    prettyname : "Offroad",
    leaveSkids : false,
    skidMower : true,
    difficulty : "expert",
    laps : 5,
    hexes : {
      "#de5322" : "wall",
      "#ca4a1d" : "wall",
      "#fffffe" : "wall",
      "#e6e6e6" : "wall",
      "#c48c3b" : "road",
      // "#bebebe" : "lamp",
      // "#daa150" : "road",
      "#ffffff" : "finish",
      // "#c99241" : "road",
      "#ebc61b" : "jump",
      "#d59d4b" : "checkpoint",
      "#cdac14" : "jump",
      "#b37e31" : "checkpoint",
      "#7D9941" : "checkpoint-indicator"
    }
  },
  "yellow" : {
    filename : "yellow.png",
    carcolors : ["#424130"],
    trailcolor : "#424130",
    prettyname : "Yellow Road",
    leaveSkids : false,
    difficulty : "intermediate",
    laps : 5,
    hexes : {
      "#eee76a" : "road",
      "#ffffff" : "finish",
      "#e7dc2a" : "road",
      "#8d8512" : "jump",
      "#e0d525" : "checkpoint",
      "#9FCC12" : "checkpoint-indicator"
    }
  },
  "darkloop" : {
    filename : "noirjump.png",
    carcolors : ["#db0fed"],
    trailcolor : "#db0fed",
    prettyname : "Dark Loop",
    leaveSkids : true,
    difficulty : "expert",
    laps : 5,
    hexes : {
      "#636363" : "road",
      "#ffffff" : "road",
      "#db0fed" : "finish",
      "#c9c9c9" : "jump",
      "#3c3c3c" : "softledge",
      "#ececec" : "softledge",
      "#fefefe" : "overpass",
      "#fdedff" : "checkpoint",
      "#f4c5fa" : "checkpoint-indicator"
    }
  },
  "superjump" : {
    filename : "superjump.png",
    carcolors : ["#ffffff"],
    trailcolor : "#32a6dc",
    leaveSkids : true,
    difficulty : "expert",
    laps : 5,
    lawnmower : "#8fcf4b",
    hexes : {
      "#5a5a5a" : "road",
      "#8fcf4b" : "grass",
      "#f1aa22" : "turbo",
      "#39aed9" : "water",
      "#6ba52d" : "tree",
      "#ffffff" : "finish",
      "#d4c921" : "jump",
      "#707070" : "checkpoint"
    }
  },
  "chasm" : {
    filename : "chasm.png",
    carcolors : ["#ffffff"],
    trailcolor : "#32a6dc",
    lawnmower : "#8fcf4b",
    leaveSkids : true,
    difficulty : "expert",
    prettyname : "The Chasm",
    laps : 5,
    hexes : {
      "#5a5a5a" : "road",
      "#bcb21b" : "turbo",
      "#ffffff" : "finish",
      "#d4c921" : "jump",
      "#707070" : "checkpoint"
    }
  },
  "moon" : {
    filename : "moon.png",
    carcolors : ["#ffffff"],
    trailcolor : "#32a6dc",
    leaveSkids : false,
    lapt : 0,
    hexes : {
      "#d6c550" : "road",
      "#ffffff" : "finish",
      "#b0a13c" : "jump"
    }
  },
  "twitter" : {
    filename : "twitter.png",
    carcolors : ["#ffffff"],
    trailcolor : "#32a6dc",
    leaveSkids : true,
    difficulty : "intermediate",
    laps : 5,
    hexes : {
      "#5a5a5a" : "road",
      "#ffffff" : "finish",
      "#707070" : "checkpoint"
    }
  },
  "ampersand" : {
    filename : "ampersand.png",
    carcolors : ["#ffffff"],
    trailcolor : "#32a6dc",
    lawnmower : "#8fcf4b",
    prettyname : "Ampersand",
    difficulty : "intermediate",
    laps : 6,
    leaveSkids : true,
    hexes : {
      "#494949" : "road",
      "#5a5a5a" : "road",
      "#f48814" : "turbo",
      "#6ba52d" : "tree",
      "#639c26" : "bigtree",
      "#ffffff" : "finish",
      "#9adc55" : "ledge",
      "#747474" : "overpass",
      "#7dba3d" : "lamp",
      "#e6d918" : "jump",
      "#c1912b" : "wall",
      "#606060" : "checkpoint",
      "#277eba" : "checkpoint-indicator"
    }
  },
  "oval-8" : {
    filename : "oval-8.png",
    carcolors : ["#ffffff"],
    trailcolor : "#32a6dc",
    laps : 10,
    leaveSkids : true,
    lawnmower : "#8fcf4b",
    difficulty : "beginner",
    hexes : {
      "#5a5a5a" : "road",
      "#4c4a4a" : "road",
      "#8fcf4b" : "grass",
      "#f1aa22" : "turbo",
      "#b97d37" : "windmill",
      "#2194ca" : "water",
      "#6ba52d" : "tree",
      "#ffffff" : "finish",
      "#a9a9a9" : "ledge",
      "#373737" : "overpass",
      "#7dba3d" : "lamp",
      "#d4c921" : "jump"
    }
  },
  "oval" : {
    filename : "oval.png",
    carcolors : ["#ffffff"],
    trailcolor : "#32a6dc",
    laps : 12,
    difficulty : "beginner",
    leaveSkids : true,
    lawnmower : true,
    hexes : {
      "#606060" : "checkpoint",
      "#5a5a5a" : "road",
      "#ffffff" : "finish",
      "#eeeeee" : "lamp",
      "#b8b8b8" : "wall",
      "#d5d5d5" : "wall"
    }
  },
  "turbo-8" : {
    filename : "turbo-8.png",
    carcolors : ["#ffffff"],
    trailcolor : "#32a6dc",
    prettyname : "Turbo 8",
    lawnmower : "#60aa1f",
    difficulty : "intermediate",
    laps : 6,
    leaveSkids : true,
    hexes : {
      "#424242" : "road",
      "#5a5a5a" : "road",
      "#8fcf4b" : "grass",
      "#f1aa22" : "turbo",
      "#b97d37" : "windmill",
      "#2194ca" : "water",
      "#6ba52d" : "tree",
      "#ffffff" : "finish",
      "#9ad957" : "ledge",
      "#6b6b6b" : "overpass",
      "#7dba3d" : "lamp",
      "#d4c921" : "jump",
      "#707070" : "checkpoint",
      "#bbbbbb" : "wall",
      "#d5d5d5" : "wall"
    }
  },
  "grass" : {
    filename : "grass.png",
    carcolors : ["#ffffff"],
    trailcolor : "#32a6dc",
    shortname : "grass",
    prettyname : "Grass",
    lawnmower : "#60aa1f",
    laps : 6,
    leaveSkids : true,
    hexes : {
      "#424242" : "road",
      "#5a5a5a" : "road",
      "#8fcf4b" : "grass",
      "#f1aa22" : "turbo",
      "#b97d37" : "windmill",
      "#2194ca" : "water",
      "#6ba52d" : "tree",
      "#ffffff" : "finish",
      "#9ad957" : "ledge",
      "#6b6b6b" : "overpass",
      "#7dba3d" : "lamp",
      "#d4c921" : "jump",
      "#707070" : "checkpoint",
      "#bbbbbb" : "wall",
      "#d5d5d5" : "wall"

    }
  },
  "testground" : {
    filename : "testground.png",
    carcolors : ["#ffffff"],
    trailcolor : "#32a6dc",
    shortname : "testground",
    laps : 10,
    leaveSkids : true,
    hexes : {
      "#5a5a5a" : "road",
      "#464646" : "road",
      "#8c8c8c" : "road",
      "#8a864e" : "road",
      "#8fcf4b" : "grass",
      "#515151" : "lamp",
      "#c8c8c8" : "lamp",
      "#2194ca" : "water",
      "#6ba52d" : "tree",
      "#ffffff" : "finish",
      "#a9a9a9" : "ledge",
      "#747474" : "overpass",
      "#f1aa22" : "turbo",
      "#d4c921" : "jump",
      "#d5d5d5" : "wall",
      "#797979" : "wall"
    }
  }
}

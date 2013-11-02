// Set up a collection to contain player information. On the server,
// it is backed by a MongoDB collection named "players".

Players = new Meteor.Collection("players");

if (Meteor.isClient) {
  if ( _.isUndefined(Session.get("sort")) ) {
    Session.set("sort", {score: -1, name: 1}); 
  }
  Template.leaderboard.players = function () {
    return Players.find({}, {sort: Session.get("sort")});
  };
  /* Descirbes in English how the list is sorted */
  Template.leaderboard.sort = function () { 
    var sort = Session.get("sort");
    var output = "Sorting by ";
    _.each(sort, function(v,k,l) {
      var order  = "";
      if (v === 1) 
        order = "ascending";
      if (v === -1) 
        order = "descending";
      output += k+" "+order+", ";
    });
    return output;
  };
  Template.leaderboard.selected_name = function () {
    var player = Players.findOne(Session.get("selected_player"));
    return player && player.name;
  };

  Template.player.selected = function () {
    return Session.equals("selected_player", this._id) ? "warning" : '';
  };

  /* When you press the button, add 5 points to the player */
  Template.leaderboard.events({
    'click #increment': function () {
      Players.update(Session.get("selected_player"), {$inc: {score: 5}});
    },
    'click #delete': function () {
      Players.remove(Session.get("selected_player"));
    },
    'click #insert': function () {
      var n = $("input[name=name]").val();
      if (n != "") {
        Players.insert({name: n, score: 0});
        $("input[name=name]").val('');
      }
      // return false so the page will not reload
      return false;
    }, 
    'click #name': function () {
      var sort = Session.get("sort");
      sort = {"name" : sort.name * -1, score: sort.score }
      
      Session.set("sort", sort);  
    },
    'click #score': function () {
      var sort = Session.get("sort");
      if (_.has(sort,"score"))
        sort = {score: sort.score * -1, name: sort.name }
      else
        sort = {score: -1, name: sort.name}
      
      Session.set("sort", sort);  
    },
    'click #shuffle': function () {
      // get all players
      var players = Players.find({}).fetch();
      
      // clear all players
      for (var i = 0; i < players.length; i++) 
      {
        Players.remove(players[i]._id);
      }

      // Re-insert players with new scores
      for (var i = 0; i < players.length; i++) 
      {
        var player = {name: players[i].name, score: Math.floor(Random.fraction()*10)*5};
        Players.insert(player);
      }
    },
  });

  /* When you click a player, select it */
  Template.player.events({
    'click': function () {
      Session.set("selected_player", this._id);
    }
  });
}

// On server startup, create some players if the database is empty.
if (Meteor.isServer) {
  Meteor.startup(function () {
    if (Players.find().count() === 0) {
      var names = ["Roger Zurawicki",
                   "Ada Lovelace",
                   "Grace Hopper",
                   "Marie Curie",
                   "Carl Friedrich Gauss",
                   "Nikola Tesla",
                   "Claude Shannon"];
      for (var i = 0; i < names.length; i++)
        Players.insert({name: names[i], score: Math.floor(Random.fraction()*10)*5});
    }
  });
}

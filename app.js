
var express = require('express');

var MongoClient = require("mongodb").MongoClient;


var app = express();

app.set( 'view engine', 'ejs' );

app.use( '/public', express.static( 'public' ) );


//variables utilisées

var player;
var games;
var teams;
var gamename;
var ac;
var playerstat;
var playerstats;
var teamid;
var teamname;
var gamestat;
var actiongame;
var p=false;
var g=false;
var players;
var player2;

var numplayers;
var bestplayers=[];
var timeplayer;
var assistplayer;


app.get( '/', function ( req, res ) {

            // Pour se connecté à la database , il faut ecrire à la place du miens : mongodb://localhost:[port]/[nomDeLaDatabase] (si vous utiliser un docker appeler mongodb)

            MongoClient.connect("mongodb://localhost:32770/NBA", function(error, db) {
                if (error) throw error;


                db.collection('Player').find().toArray(function (error, results) {
                    if (error) throw error;

                        players2=results;
                        if (results!=null){
                            players=playertoplayername(results);
                        }
                        //nombre de joueurs
                        db.collection('Player').find().count().then(function(data){
                            numplayers=data;
                            
                            //meilleur marqueur
                            db.collection('Actions').find().sort({"Points":-1}).toArray(function(error5,results5){
                                bestplayers=bestplayer(results5,players2);
                                
                                //joueur étant resté le pluslongtemps sur le terrain
                                db.collection('Actions').find().sort({"Minutes":-1}).toArray(function(error6,results6){
                                    timeplayer=timerplayer(results6,players2);

                                    //meilleur passeur
                                    db.collection('Actions').find().sort({"Assists":-1}).limit(1).toArray(function(error7,results7){
                                        assistplayer=assistplayer(results7,players2);
                                
                                        db.collection('Game').find().toArray(function (error2, results2) {
                                            games=results2;
                                            db.collection('Team').find().toArray(function (error3, results3) {
                                                teams=results3;
                                                gamename=gametogamename(games,teams);
                                            res.render('index', {assistplayer:assistplayer, timeplayer:timeplayer, bestplayer:bestplayers, numplayers:numplayers, players:players, playerstat:"", team:"" , act: "", gamename:gamename, actiongame:"", p:false, g:false});
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });



app.get( '/Player', function ( req, res ) {
    MongoClient.connect("mongodb://localhost:32770/NBA", function(error, db) {
                    if (error) throw error;

                    //stat du joueur choisi
                    db.collection('Player').findOne({ 'PlayerName':req.query.player },function (error, result) {
                        playerstat=result;
                        db.collection('Actions').find({ 'PlayerId':playerstat.PlayerId }).toArray(function (error2, results) {
                            if (error2) throw error;
                            playerstats=results;
                            calculstat(playerstats);
                            teamid=results[0].TeamId;
                            p=true;
                            db.collection('Team').findOne({ 'TeamId':teamid }, function (error3, result2) {
                                teamname=result2;
                                res.render('index',{assistplayer:assistplayer, timeplayer:timeplayer, bestplayer:bestplayers, numplayers:numplayers, p:p, g:g, players:players, playerstat:playerstat, team:teamname , act: ac, gamename:gamename, actiongame:actiongame});

                            });
                      });
                });
            });
        });

app.get( '/Game', function ( req, res ) {
            MongoClient.connect("mongodb://localhost:32770/NBA", function(error, db) {
                            if (error) throw error;

                            //stats du match choisi
                            db.collection('Actions').find({ 'GameId':parseInt(req.query.game) }).toArray(function (error, result) {
                                gamestat=result;
                                calculgame(result);
                                g=true;
                                if (playerstats!=undefined){
                                    res.render('index',{assistplayer:assistplayer, timeplayer:timeplayer, bestplayer:bestplayers, numplayers:numplayers, p:p, g:g, players:players, playerstat:playerstat, team:teamname , act: ac, actiongame:actiongame, gamename:gamename});
                                }
                                else{
                                    res.render('index', {assistplayer:assistplayer, timeplayer:timeplayer, bestplayer:bestplayers, numplayers:numplayers , p:p,g:g, players:players, playerstat:"", team:"" , act: "", gamename:gamename, actiongame:actiongame});
                                }

                            });

                      });

});




//fonctions de calcul

function playertoplayername(players){
    var playername=new Array(players.length);
    players.forEach(function(play,i){
       playername[i]=play.PlayerName; 
    });
    return playername=playername.sort();
}

function gametogamename(games,teams){
    var gamename=new Array(games.length);
    games.forEach(function(game,i){
        gamename[i]=new Object();
       var team1name="";
       var team2name="";
       var j=0; 
       while(team1name=="" || team2name=="" && j<teams.length){
            if(game.Team1Id==teams[j].TeamId && team1name==""){
                team1name=teams[j];
            }
            else if(game.Team2Id==teams[j].TeamId && team2name==""){
                team2name=teams[j];
            }
            j=j+1;
       }
       gamename[i].Team1=team1name;
       gamename[i].Team2=team2name;
       gamename[i].infos=game.URL;
       gamename[i].date=game.Date;
       gamename[i].GameId=i+1;
    });
    return gamename;
}

function calculgame(actions){
    actiongame=[ {
        "Points":0,
        "FieldGoalsMade":0,
  "FieldGoalAttempts":0,
   "3PointsMade":0, 
   "3PointAttempts":0,
    "FreeThrowsMade":0,
    "FreeThrowAttempts":0,
    "OffensiveRebounds":0,
     "DefensiveRebounds":0,
     "Assists":0,
     "PersonalFouls":0,
     "Steals":0,
     "Turnovers":0,
     "BlockedShots":0,
     "BlocksAgainst":0
    },
    {
        "Points":0,
        "FieldGoalsMade":0,
  "FieldGoalAttempts":0,
   "3PointsMade":0, 
   "3PointAttempts":0,
    "FreeThrowsMade":0,
    "FreeThrowAttempts":0,
    "OffensiveRebounds":0,
     "DefensiveRebounds":0,
     "Assists":0,
     "PersonalFouls":0,
     "Steals":0,
     "Turnovers":0,
     "BlockedShots":0,
     "BlocksAgainst":0
    },{'gamename':gamename[actions[0].GameId-1]}];
    var playerexist =[];
    var here=false;
    actions.forEach(function(action,i){
        if(i==0){
            playerexist.push(action.PlayerId);
        }
        else{
            var here=false;
            var j=0;
            while(!here && j<playerexist.length){
                if(action.PlayerId==playerexist[j]){
                    here=true;
                }
                j=j+1;
            }
            if(!here){
                if (action.TeamId==gamename[action.GameId-1].Team1.TeamId){
                    actiongame[0].FieldGoalsMade+=action.FieldGoalsMade;
                    actiongame[0].FieldGoalAttempts+=action.FieldGoalAttempts;
                    var jsonvar="3PointsMade";
                    actiongame[0][jsonvar]+=action[jsonvar];
                    jsonvar="3PointAttempts";
                    actiongame[0][jsonvar]+=action[jsonvar];
                    actiongame[0].FreeThrowsMade+=action.FreeThrowsMade;
                    actiongame[0].FreeThrowAttempts+=action.FreeThrowAttempts;
                    actiongame[0].OffensiveRebounds+=action.OffensiveRebounds;
                    actiongame[0].DefensiveRebounds+=action.DefensiveRebounds;
                    actiongame[0].Assists+=action.Assists;
                    actiongame[0].PersonalFouls+=action.PersonalFouls;
                    actiongame[0].Steals+=action.Steals;
                    actiongame[0].Turnovers+=action.Turnovers;
                    actiongame[0].BlockedShots+=action.BlockedShots;
                    actiongame[0].BlocksAgainst+=action.BlocksAgainst;
                    actiongame[0].Points+=action.Points;
                    }
                    else{
                        actiongame[1].FieldGoalsMade+=action.FieldGoalsMade;
                    actiongame[1].FieldGoalAttempts+=action.FieldGoalAttempts;
                    var jsonvar="3PointsMade";
                    actiongame[1][jsonvar]+=action[jsonvar];
                    jsonvar="3PointAttempts";
                    actiongame[1][jsonvar]+=action[jsonvar];
                    actiongame[1].FreeThrowsMade+=action.FreeThrowsMade;
                    actiongame[1].FreeThrowAttempts+=action.FreeThrowAttempts;
                    actiongame[1].OffensiveRebounds+=action.OffensiveRebounds;
                    actiongame[1].DefensiveRebounds+=action.DefensiveRebounds;
                    actiongame[1].Assists+=action.Assists;
                    actiongame[1].PersonalFouls+=action.PersonalFouls;
                    actiongame[1].Steals+=action.Steals;
                    actiongame[1].Turnovers+=action.Turnovers;
                    actiongame[1].BlockedShots+=action.BlockedShots;
                    actiongame[1].BlocksAgainst+=action.BlocksAgainst;
                    actiongame[1].Points+=action.Points;
                    }
                    playerexist.push(action.PlayerId);
                }
            }
        
        
    });



}


function calculstat(actions){
    ac={ "Minutes":0,
 "FieldGoalsMade":0,
  "FieldGoalAttempts":0,
   "3PointsMade":0, 
   "3PointAttempts":0,
    "FreeThrowsMade":0,
    "FreeThrowAttempts":0,
    "OffensiveRebounds":0,
     "DefensiveRebounds":0,
     "Assists":0,
     "PersonalFouls":0,
     "Steals":0,
     "Turnovers":0,
     "BlockedShots":0,
     "BlocksAgainst":0,
     "Points":0,
     "Starter":0};
    var gameexist=[];
    var here=false;
    
    actions.forEach(function(action,i){
        if(i==0){
            gameexist.push(action.GameId);
        }
        else{
            var here=false;
            var j=0;
            while(!here && j<gameexist.length){
                if(action.GameId==gameexist[j]){
                    here=true;
                }
                j=j+1;
            }
            if(!here){
                ac.Minutes+=action.Minutes;
                ac.FieldGoalsMade+=action.FieldGoalsMade;
                ac.FieldGoalAttempts+=action.FieldGoalAttempts;
                var jsonvar="3PointsMade";
                ac[jsonvar]+=action[jsonvar];
                jsonvar="3PointAttempts";
                ac[jsonvar]+=action[jsonvar];
                ac.FreeThrowsMade+=action.FreeThrowsMade;
                ac.FreeThrowAttempts+=action.FreeThrowAttempts;
                ac.OffensiveRebounds+=action.OffensiveRebounds;
                ac.DefensiveRebounds+=action.DefensiveRebounds;
                ac.Assists+=action.Assists;
                ac.PersonalFouls+=action.PersonalFouls;
                ac.Steals+=action.Steals;
                ac.Turnovers+=action.Turnovers;
                ac.BlockedShots+=action.BlockedShots;
                ac.BlocksAgainst+=action.BlocksAgainst;
                ac.Points+=action.Points;
                ac.Starter+=action.Starter;

                gameexist.push(action.GameId);
            }
        }

    });

}

function bestplayer(actions,playersss){
    var bestplayer=[];
    var i=0;
    while(actions[0].PlayerId!=playersss[i].PlayerId && i<playersss.length){
        i++;
    }
    bestplayer.push(playersss[i]);
    var i=1;
    while(actions[i].Points==actions[0].Points){
        var j=0;
        while(actions[i].PlayerId!=playersss[j].PlayerId && j<playersss.length){
            j++;
        }
        i++;
        var find=false;
        var k=0;
        while(!find && k<bestplayer.length){
            if(bestplayer[k].PlayerName==playersss[j].PlayerName){
                find=true;
            }
            k++;
        }
        if(!find){
            bestplayer.push(playersss[j]);
        }
    }
    bestplayer.push(actions[0].Points);
    return bestplayer;
}

function timerplayer(tp,playersss){
    var timplayer=[];
    var i=0;
    while(tp[0].PlayerId!=playersss[i].PlayerId && i<playersss.length){
        i++;
    }
    timplayer.push(playersss[i]);
    timplayer.push(tp[0].Minutes);
    return timplayer;
}

function assistplayer(ap,playersss){
    var assisplayer=[];
    var i=0;
    while(ap[0].PlayerId!=playersss[i].PlayerId && i<playersss.length){
        i++;
    }
    assisplayer.push(playersss[i]);
    assisplayer.push(ap[0].Assists);
    return assisplayer;
}


app.listen( 8080, function () {
    console.log( 'App listening on port 8080!' );
});



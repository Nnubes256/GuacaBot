#!/usr/bin/env node
// ############################
// ##       DON'T TOUCH      ##
// ## ---------------------- ##
// ## IRC/Shell Color charts ##
// ############################
ansicodes = {
'reset': '\033[0m',
'bold': '\033[1m',
'italic': '\033[3m',
'underline': '\033[4m',
'blink': '\033[5m',
'black': '\033[30m',
'red': '\033[31m',
'green': '\033[32m',
'yellow': '\033[33m',
'blue': '\033[34m',
'magenta': '\033[35m',
'cyan': '\033[36m',
'white': '\033[37m',
};
codes = {
    white: '\u000300',
    black: '\u000301',
    dark_blue: '\u000302',
    dark_green: '\u000303',
    light_red: '\u000304',
    dark_red: '\u000305',
    magenta: '\u000306',
    orange: '\u000307',
    yellow: '\u000308',
    light_green: '\u000309',
    cyan: '\u000310',
    light_cyan: '\u000311',
    light_blue: '\u000312',
    light_magenta: '\u000313',
    gray: '\u000314',
    light_gray: '\u000315',
    reset: '\u000f',
    bold: '\u0002',
};
// ############################
// ##      IRC bot base      ##
// ############################

// Webserver
var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs');

app.listen(150);
io.set('log level', 0);

function handler (req, res) {
  fs.readFile(path.resolve('./ws/index.html'),
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }

    res.writeHead(200);
    res.end(data);
  });
}
// Random stuff, ignore
var startsWith = function (strToEv,str) {
  	return strToEv.split("").slice(0, str.length) == str;
};
var http = require("http");
// IRC Library
var irc  = require('./lib/irc.js');

// Utils from Node.js
var util = require('util');

// Minecraft Server query library
var Query = require('./lib/mcquery.js');
var path = require('path');
    
// Config
var f = path.resolve('./config.json');
var config = require(f);

// Library used by !videoname
var vi = require("./lib/videoinfo/lib/main.js");

// Bot creation and connection
var c = new irc.Client(config.host,config.nickname,{channels: config.channels,stripColors: true,userName: config.username,realName: config.realname});

// Anti-spammer stuff
var comCount = 0;
var comMaxPerTenSec = 12;
var isLockdownDisabled = true;
var minusComCount = setInterval(function(){
    if (!(comCount <= 0)) {
        comCount--;
    }
    if (comCount < comMaxPerTenSec) {
    	isLockdownDisabled = true;
    }
    if (comCount >= comMaxPerTenSec) {
        c.say(config.channels,"I think I'm being spammed by my commands. I'm enabling my anti-spam mechanism");
        sendToLog(ansicodes.bold + ansicodes.red + "[ALERT] " + ansicodes.reset + ansicodes.reset + ansicodes.yellow + "Anti-spammer was auto-enabled due to command abuse." + ansicodes.reset);
        isLockdownDisabled = false;
    }
},10000);
// ############################
// ##   Raw input listener   ##
// ############################
c.addListener('raw', function(message) { 
	var command = message.command;
	var commandType = message.commandType;
	var msgArgs = message.args;
	var rawCommand = message.rawCommand;
	switch(command) {
		// ############################
		// ##      Input Sorter      ##
		// ############################
		// If the input is a server notice
		case "NOTICE":
        // Log the notice to console and to log file, then break
			var receivedNotice = message.args[1];
			sendToLog(ansicodes.blue + ansicodes.bold + "[NOTICE] " + ansicodes.reset + ansicodes.reset + ansicodes.yellow + receivedNotice + ansicodes.reset);
			break;
		// If the input is the welcoming message of the server
		case "001"||"002"||"003":
			break;
		// If the input is some connection settings sent from bot for make connection to IRC server
		case "rpl_myinfo"||"rpl_isupport"||"rpl_namreply"||"rpl_endofnames"||"rpl_channelmodeis":
			break;
		// Server STATS logging!
		case "rpl_luserop"||"rpl_luserchannels":
			var secondArg = message.args[1];
			var reMsg = message.args[2];
			sendToLog(ansicodes.cyan + ansicodes.bold + "[STATS] " + ansicodes.reset + ansicodes.reset + ansicodes.magenta + "There are " + secondArg + " " + reMsg + ansicodes.reset);
			break;
		case "rpl_luserclient"||"rpl_luserme"||"rpl_statsconn":
			var recMsg = message.args[1];
			sendToLog(ansicodes.cyan + ansicodes.bold + "[STATS] " + ansicodes.reset + ansicodes.reset + ansicodes.magenta + recMsg + ansicodes.reset);
			break;
		case "rpl_localusers"||"rpl_globalusers":
			var receMsg = message.args[3];
			sendToLog(ansicodes.cyan + ansicodes.bold + "[STATS] " + ansicodes.reset + ansicodes.reset + ansicodes.magenta + receMsg + ansicodes.reset);
			break;
		// If the input is the topic from the channel
		case "rpl_topic":
			var topic = message.args[2];
			var fromWho = message.args[1];
			sendToLog(ansicodes.magenta + "--------- Topic from " + fromWho + ": ---------" + ansicodes.reset);
			sendToLog(ansicodes.magenta + topic + ansicodes.reset);
			sendToLog(ansicodes.magenta + "-----------------------------------------------" + ansicodes.reset);
			break;
		// If it is a normal chat message
		case "PRIVMSG":
			// Extra check: Verify if the nick that sends the message isn't undefined. If it is, break
			if(message.nick != undefined) {
			    var usernick = message.nick;
			    var reccMsg = message.args[1];
                var toChan = message.args[0];
                // Bukkit Flavour 1:
                //
                // If you use CraftIRC or another plugin that outputs the server activity(chat/joins/quits/etc...) you can make the bot say something when a user connects at your server.
                // You can make the bot say something default to all users, and, by the way, you can input messages to custom users.
                // Just uncomment the line below, and, at the regular expression, replace the word "connnected" by the connecting message.
                // For example, if your message is {user} joined the game, change "connected" for "joined the game".
                // Also, remind that this function DOESN'T SUPPORT ANY TYPE OF NICK. It will only read the valid Minecraft usernames.
                /* 
                if(/^[A-ZFa-z0-9_-]{3,16} connected$/.test(reccMsg)) {
			    	var helperSplit = reccMsg.split(" ");
			    	var userConnected = helperSplit[0];
			    	switch(userConnected) {
			    		// Modify these "foo" and "bar" for the custom names, and modify the second argument of c.say for customize the messages.
			    		// userConnected = user who connected
			    		case "foo":
			    		    setTimeout(function(){c.say(toChan, "Hi foo")},2000);
			    		    break;
			    		case "bar":
			    		    setTimeout(function(){c.say(toChan, "Hey!")},2000);
			    		    setTimeout(function(){c.say(toChan, "How are you?")},4000);
			    		    break;
			    		default:
			    		    setTimeout(function(){c.say(toChan, "Hello there " + userConnected)},2000);
			    		    break;
			    	}
			    }
			    */
			    if(/^!guacahelp$/.test(reccMsg)) {
                    if (isLockdownDisabled){
			     	    c.say(usernick, "\u0002" + codes.dark_blue +"--------------------- " + codes.orange + "GuacaBot Help" + codes.dark_blue + " -----------------------");
			     	    c.say(usernick, "\u0002" + codes.orange +" !hello  " + codes.dark_red + " -- " + codes.reset + " Makes the bot say 'Hello World!'");
			     	    c.say(usernick, "\u0002" + codes.orange +" !eatnacho " + codes.dark_red +" -- " + codes.reset + " Makes the bot eat a nacho.");
			     	    c.say(usernick, "\u0002" + codes.orange +" !time " + codes.dark_red +" -- " + codes.reset + " Shows the current time for the bot.");
			     	    c.say(usernick, "\u0002" + codes.orange +" !date " + codes.dark_red +" -- " + codes.reset + " Shows the current date for the bot.");
			     	    c.say(usernick, "\u0002" + codes.orange +" !8ball [question] " + codes.dark_red +" -- " + codes.reset + " Let the 8 ball answer your questions :)");
			     	    c.say(usernick, "\u0002" + codes.orange +" !mcstatus " + codes.dark_red +" -- " + codes.reset + " Queries CookieCraft and shows various stats.");
			     	    c.say(usernick, "\u0002" + codes.orange +" !videoname [url] " + codes.dark_red +" -- " + codes.reset + " Given a YouTube/Vimeo video URL, shows its name.");
			     	    c.say(usernick, "\u0002" + codes.orange +" !chuck  " + codes.dark_red + " -- " + codes.reset + " Get an instant Chuck Norris joke");
			     	    c.say(usernick, "\u0002" + codes.dark_blue +"---------------------------------------------------------");
			     	    sendToLog(ansicodes.blue + "[INFO] " + ansicodes.reset + ansicodes.yellow + usernick + " issued bot command: !guacahelp" + ansicodes.reset);
                        comCount = comCount + 6;
                    }
			    } else if (/^!hello$/.test(reccMsg)) {
                    if (isLockdownDisabled){
			     	    c.say(toChan,"\u0002" + codes.dark_red + "H" + codes.light_red + "e" + codes.orange + "l" + codes.yellow + "l" + codes.light_green + "o " + codes.dark_green + "W" + codes.light_blue + "o" + codes.dark_blue + "r" + codes.light_magenta + "l" + codes.magenta + "d" + codes.dark_red + "!");
			     	    sendToLog(ansicodes.blue + "[INFO] " + ansicodes.reset + ansicodes.yellow + usernick + " issued bot command: !hello" + ansicodes.reset);
                        comCount++;
                    }
                } else if (/^!eatnacho$/.test(reccMsg)) {
                    if (isLockdownDisabled){
			     	    c.action(toChan," eats a nacho");
			     	    sendToLog(ansicodes.blue + "[INFO] " + ansicodes.reset + ansicodes.yellow + usernick + " issued bot command: !eatnacho" + ansicodes.reset);
                        comCount++;
                    }
                } else if (/^!time$/.test(reccMsg)) {
                    if (isLockdownDisabled){
			     	    var currentTime = new Date();
			     	    var curHour = currentTime.getHours() + 1;
			     	    var curMinute = currentTime.getMinutes() + 1;
			     	    var curSecond = currentTime.getSeconds() + 1;
			     	    if (curHour < 10) {
			     	        curHour = "0" + curHour;
			     	    }
			     	    if (curMinute < 10) {
			     	        curMinute = "0" + curMinute;
			     	    }
			     	    if (curSecond < 10) {
			     	        curSecond = "0" + curSecond;
			     	    }
			     	    c.say(toChan, "Current Time: " + curHour + ":" + curMinute + ":" + curSecond);
			     	    sendToLog(ansicodes.blue + "[INFO] " + ansicodes.reset + ansicodes.yellow + usernick + " issued bot command: !time" + ansicodes.reset);
                        comCount++;
                    }
                } else if (/^!date$/.test(reccMsg)) {
                    if (isLockdownDisabled){
			     	    var currentDate = new Date();
			     	    var curDay = currentDate.getDate();
			     	    var curWeekDay = currentDate.getUTCDay();
			     	    switch(curWeekDay) {
			     	        case 0:
			     	            curWeekDay = "Sunday";
			     	            break;
			     	        case 1:
			     	            curWeekDay = "Monday";
			     	            break;
			     	        case 2:
			     	            curWeekDay = "Tuesday";
			     	            break;
			     	        case 3:
			     	            curWeekDay = "Wednesday";
			     	            break;
			     	        case 4:
			     	            curWeekDay = "Thursday";
			     	            break;
			     	        case 5:
			     	            curWeekDay = "Friday";
			     	            break;
			     	        case 6:
			     	            curWeekDay = "Saturday";
			     	            break;
			     	        }
			     	    var curMonth = currentDate.getMonth() + 1;
			     	    var curYear = currentDate.getFullYear();
			     	    c.say(toChan, "For me, today's " + curWeekDay + ", " + curDay + "/" + curMonth + "/" + curYear + ".");
			     	    sendToLog(ansicodes.blue + "[INFO] " + ansicodes.reset + ansicodes.yellow + usernick + " issued bot command: !date" + ansicodes.reset);
                        comCount++;
                    }
                } else if (/^!8ball$/.test(reccMsg) || /^!8ball /.test(reccMsg)) {
                    if (isLockdownDisabled){
                        var EigthBallWithArgs = false;
                        var arg = null;
			     	    if(/^!8ball$/.test(reccMsg) || /^!8ball +/.test(reccMsg) || "!8ball" == reccMsg != true) {
			     	        arg = reccMsg.substr(reccMsg.indexOf(" ") + 1);
			     	        EightballWithArgs = true;
			     	    }
			     	    var ballLines = [
			     	    "Ask again later",
			     	    "Better not tell you now",
			     	    "Concentrate and ask again",
			     	    "Don't count on it",
			     	    "It is certain",
			     	    "Most likely",
			     	    "My reply is no",
			     	    "My sources say no",
			     	    "No",
			     	    "Outlook good",
			     	    "Outlook not so good",
			     	    "Reply hazy, try again",
			     	    "Signs point to yes",
			     	    "Yes",
			     	    "Yes, definitely",
			     	    "You may rely on it"
			     	    ];
			     	    var item = ballLines[Math.floor(Math.random()*ballLines.length)];
			     	    if (EightballWithArgs) {
                            if(arg == "!8ball") {
                                arg = "(no question)";
                            }
                            c.say(toChan,"To the question: " + arg);
			     	    }
			     	    c.say(toChan, "8 ball says: " + item);
			     	    sendToLog(ansicodes.blue + "[INFO] " + ansicodes.reset + ansicodes.yellow + usernick + " issued bot command: !8ball with argument: " + arg + ansicodes.reset);
                        comCount = comCount + 2;
                    }
                // Bukkit flavour 2:
                // Simple Minecraft server query tool
                // You can configure it in the config.json
                } else if (/^!mcstatus$/.test(reccMsg)) {
                    if (isLockdownDisabled){
			            // I'll explain this command for being pretty hard to understand:
			            // This search for a config.json file and, if exists, returns its config. Else, returns default values.
			            c.say(usernick, "Doing a query to the server...");
			            // Creates a new query object with host and port atributes
			            var query = new Query(config.mcquery.host, config.mcquery.port);
			            
			            // Variable that tells the command how many times it should do the query
			            var reqcount = 1;
			            
			            // The main stuff:
			            // Connect to server and receive data
			            query.connect( function(err){
			            	// TODO: Better error handling
			            	// If there's an error while doing the ping
			            	if(err){
			            		c.say(usernick, "-------------------");
			            		c.say(usernick, "Server Status: Probably offline");
			            		c.say(usernick, "Error: " + err.error);
			            		c.say(usernick, "-------------------");
			            		sendToLog(ansicodes.blue + "[INFO] " + ansicodes.reset + ansicodes.yellow + usernick + " issued bot command: !ccstatus with result: Timeout Error" + ansicodes.reset);
			            	} else {
			            		query.basic_stat(statCallback);
			            	}
			            });	
			            // This function gets the data made by query.connect and sends it to the player
			            function statCallback(err, stat){
			            	if(err){
			            		// TODO: Better error handling
			            		console.error(err);
			            	} else {
			            		// Here, we store in variables the MOTD, the number of players connected 
			            		// and the max players that the server can handle
			            		var motd = stat.MOTD;
			            		var numPlayers = stat.numplayers;
			            		var maxPlayers = stat.maxplayers;
			            		c.say(usernick, "-------------------");
			                    c.say(usernick, "Server Status: Online");
			                    c.say(usernick, "Players: " + numPlayers + "/" + maxPlayers);
			                    c.say(usernick, "Server List MOTD: \'" + motd + "\'");
			                    c.say(usernick, "-------------------");
			                    sendToLog(ansicodes.blue + "[INFO] " + ansicodes.reset + ansicodes.yellow + usernick + " issued bot command: !ccstatus with result: Online, " + numPlayers + "/" + maxPlayers + ", \'" + motd + "'" + ansicodes.reset);
			                }
			            	reqcount--;
			            	if(reqcount<1){
			            		query.close();
			            	}
			            };
                        comCount = comCount + 2;
                    }
                } else if(/^!videoname$/.test(reccMsg) || /^!videoname /.test(reccMsg)) {
                	if (isLockdownDisabled){
                        var VIWithArgs = false;
                        var VIArg = null;
			     	    if(/^!videoname$/.test(reccMsg) || /^!videoname +/.test(reccMsg) || "!videoname" == reccMsg != true) {
			     	        VIArg = reccMsg.substr(reccMsg.indexOf(" ") + 1);
			     	        VIWithArgs = true;
			     	    }
			     	    if (VIWithArgs) {
			     	    	vi.fetch(VIArg, function(err,data){
			     	    		if(err){
			     	    			sendToLog(ansicodes.blue + "[INFO] " + ansicodes.reset + ansicodes.yellow + usernick + " issued bot command: !videoname with argument: " + VIArg + " and result: Error:" + err + ansicodes.reset);
			     	    			c.say(toChan,"There was an error: " + err);
			     	    		} else {
			     	    			c.say(toChan,"Name: " + data.title);
			     	    			sendToLog(ansicodes.blue + "[INFO] " + ansicodes.reset + ansicodes.yellow + usernick + " issued bot command: !videoname with argument: " + VIArg + " and result: Success(Name Got: " + data.title + ansicodes.reset);
			     	    		}
			     	    	});
			     	    }
			     	    comCount = comCount + 3;
			     	}
			    } else if(/^!chuck$/.test(reccMsg)) {
			    	if (isLockdownDisabled){
                        http.get("http://api.icndb.com/jokes/random?escape=javascript?exclude=[explicit]", function(res) {
                        	var body = '';
                        	res.on("data",function(chunk){
                        		body += chunk;
                        	});
                            res.on("end",function(){
                          	    var fullRes = JSON.parse(body);
                          	    if(fullRes.type == "success") {
                          	    	var joke = fullRes.value.joke;
                          	    	var jokeNumber = fullRes.value.id;
                          	    	var finalJoke = joke.replace("&quot","'");
                          	    	c.say(toChan,"Num. " + jokeNumber + ": " + joke);
                          	    	sendToLog("[INFO] " + usernick + " issued bot command: !chuck with result: Success (joke number " + jokeNumber + ")");
                          	    } else {
                          	    	c.say("I think there was an error getting the joke, so try again later.");
                          	    	sendToLog("[INFO] " + usernick + " issued bot command: !chuck with result: DB error: The response type wasn't 'success'.");
                          	    }
                            }).on("error", function(e){
                            	c.say("The Chuck Norris joke database appears to be unreachable :(. Try again later");
                            	sendToLog(ansicodes.blue + "[INFO] " + ansicodes.reset + ansicodes.yellow + usernick + " issued bot command: !chuck with result: Connect error: " + e + ansicodes.reset);
                            });
                        });
                        comCount++;
                    }
                } else {
			     	// If it isn't a registered command, the bot will know that it is a chat message, so the bot will log it as chat
			     	sendToLog(ansicodes.red + "[" + ansicodes.reset + ansicodes.yellow + toChan + ansicodes.reset + ansicodes.red + "] " + ansicodes.reset + ansicodes.cyan + usernick + ": " + ansicodes.reset + reccMsg);
			    }
			} else {
			    break;
			};
	default:
		break;
	}
});
c.addListener('error', function(message) { sendToLog('error: ' + message) });

c.addListener('join', function(channel,nick,message) {
	sendToLog(ansicodes.red + "[" + ansicodes.reset + ansicodes.yellow + channel + ansicodes.reset + ansicodes.red + "] " + ansicodes.reset + ansicodes.green + nick + " joined " + channel + ansicodes.reset);
});
c.addListener("part", function(channel,nick,reason) {
	sendToLog(ansicodes.red + "[" + ansicodes.reset + ansicodes.yellow + channel + ansicodes.reset + ansicodes.red + "] " + ansicodes.reset + ansicodes.cyan + nick + " left " + channel + " (" + reason + ")" + ansicodes.reset);
});
c.addListener("quit", function(nick,reason) {
	sendToLog(ansicodes.red + "[" + ansicodes.reset + ansicodes.yellow + "All channels" + ansicodes.reset + ansicodes.red + "] " + ansicodes.reset + ansicodes.red + nick + " has quit IRC (" + reason + ")" + ansicodes.reset);
});
c.addListener("kick", function(channel, nick, by, reason) {
	sendToLog(ansicodes.red + "[" + ansicodes.reset + ansicodes.yellow + channel + ansicodes.reset + ansicodes.red + "] " + ansicodes.reset + ansicodes.blue + nick + " was kicked by " + by + " (" + reason + ")");
});
var colorStrip = function (str) {
  return str.replace(/\033\[[0-9;]*m/g, '')
}
var sendToLog = function(message) {
	console.log(message);
	var parsedMsg = colorStrip(message);
	fs.open('GuacaLogOutput.log', 'a', function( e, id ) {
        fs.write( id, parsedMsg+'\n', null, 'utf8', function(){
            fs.close(id, function(){ });
        });
    });
    io.sockets.emit('sendEvent',{"text":parsedMsg});
}
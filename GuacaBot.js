#!/usr/bin/env node
// ############################
// ## IRC/Shell Color charts ##
// ############################
var ansicodes = {
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
var codes = {
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

var CHUCK_API = "http://api.icndb.com/jokes/random?escape=javascript?exclude=";
// ############################
// ##       Webserver        ##
// ############################
var app = require('http').createServer(handler),
	io = require('socket.io').listen(app),
	fs = require('fs');

app.listen(150);
io.set('log level', 1);

function handler (req, res) {
    fs.readFile(path.resolve('./ws/index.html'),function (err, data) {
        if (err) {
            res.writeHead(500);
            return res.end('Error loading index.html');
        }
        res.writeHead(200);
        res.end(data);
    });
}
// ############################
// ##        Requires        ##
// ############################
// IRC Library
var irc  = require('./lib/irc.js');

// Utils from Node.js
var util = require('util');

// Minecraft Server query library
var Query = require('./lib/mcquery.js');
var path = require('path');

// Config
var config = require(path.resolve('./config.json'));

// Libraries used by !videoname
var vi = require("videoinfo");
var http = require("http");

// ############################
// ##        Bot base        ##
// ############################

// Bot creation and connection
var c = new irc.Client(
	config.host,
	config.nickname,
	{
		channels: config.channels,stripColors: true,
		userName: config.username,
		realName: config.realname
	}
);

// Anti-spammer stuff
var comCount = 0;
var comMax = 15;
var isLockdownDisabled = true;
var minusComCount = setInterval(function(){
	if (comCount > 0) {
		comCount--;
	}
	if (comCount < comMax) {
		isLockdownDisabled = true;
	}
	if (comCount >= comMax) {
		c.say(
			config.channels,
			"I think I'm being command-spammed." +
			" I'm enabling my anti-spam mechanism");
		sendToLog(
			ansicodes.bold + ansicodes.red + "[ALERT] " +
			ansicodes.yellow +
			"Anti-spammer was enabled due to command abuse." + ansicodes.reset
		);
		isLockdownDisabled = false;
	}
},10000);


function replaceAll(string, find, replace) {
	return string.replace(
		new RegExp(
			find.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1"), // Escaping
			'g'
		),
	replace);
}

function stringReplacer(replaceList, string) {
	for (var i = 0; i < replaceList.length; i++) {
		var rule = replaceList[i];
		string = replaceAll(string, rule[0], rule[1]);
	}
	return string;
}

function CommandProcessor() {
	this.self = this;
}

CommandProcessor.prototype.onNotice = function(receivedNotice) {
	sendToLog(
		ansicodes.blue + ansicodes.bold +
		"[NOTICE] " + ansicodes.reset + ansicodes.yellow + receivedNotice +
		ansicodes.reset
	);
};

CommandProcessor.prototype.onStats = function(type, num) {
	sendToLog(
		ansicodes.cyan + ansicodes.bold + "[STATS] " + ansicodes.reset +
		ansicodes.magenta +
		(num ? ("There are " + num + " " + type) : type) +
		ansicodes.reset
	);
};

CommandProcessor.prototype.onTopic = function(topic, who) {
	sendToLog(
		ansicodes.magenta +
		"--------- Topic from " + fromWho + ": ---------" +
		ansicodes.reset
	);
	sendToLog(
		ansicodes.magenta +
		topic +
		ansicodes.reset
	);
	sendToLog(
		ansicodes.magenta +
		"-----------------------------------------------" +
		ansicodes.reset
	);
};

CommandProcessor.prototype.onPrivMsg = function(message) {
	// Extra check: Verify if the nick that sends the message isn't
	// undefined. If it is, break
	if(typeof message.nick !== 'undefined') {
		var usernick = message.nick;
		var reccMsg = message.args[1];
		var toChan = message.args[0];
		// Bukkit Flavour 1:
		//
		// If you use CraftIRC or another plugin that outputs the server
		// activity(chat/joins/quits/etc...) to your IRC channel you can make
		// the bot say something when a user connects at your server.
		// You can make the bot say something default to all users, and,
		// by the way, you can input messages to custom users.
		// Just set triggers.mcircjoin.enabled to true and, at the regular
		// expression, replace the word "connnected" by the connecting message.
		// For example, if your message is {user} joined the game, change
		// "connected" for "joined the game".
		// Also, remind that this function DOESN'T SUPPORT ANY TYPE OF NICK.
		// It will only read the valid Minecraft usernames.
		if(
			config.triggers.mcircjoin.enabled &&
			/^[A-ZFa-z0-9_\-]{3,16} connected$/.test(reccMsg)
		) {
			var helperSplit = reccMsg.split(" ");
			var userConnected = helperSplit[0];
			switch(userConnected) {
				// Modify these "foo" and "bar" for the custom names, and
				// modify the second argument of c.say for customize the
				// messages.
				// userConnected is the user who did connect
				case "foo":
					setTimeout(function(){
						c.say(toChan, "Hi foo");
					}, 2000);
					break;
				case "bar":
					setTimeout(function(){
						c.say(toChan, "Hey!");
					}, 2000);
					setTimeout(function(){
						c.say(toChan, "How are you?");
					}, 4000);
					break;
				default:
					setTimeout(function(){
						c.say(toChan, "Hello there " + userConnected);
					}, 2000);
					break;
			}
		}
		if(/^!guacahelp$/.test(reccMsg) && isLockdownDisabled) {
			c.say(
				usernick,
				"\u0002" + codes.dark_blue + "--------------------- " +
				codes.orange + "GuacaBot Help" + codes.dark_blue +
				" -----------------------"
			);
			if(config.commands.hello.enabled) {
				c.say(
					usernick,
					"\u0002" + codes.orange +" !hello  " +
					codes.dark_red + " -- " + codes.reset +
					" Makes the bot say 'Hello World!'"
				);
			}
			if(config.commands.eatnacho.enabled) {
				c.say(
					usernick,
					"\u0002" + codes.orange +" !eatnacho " +
					codes.dark_red +" -- " + codes.reset +
					" Makes the bot eat a nacho."
				);
			}
			if(config.commands.hour.enabled) {
				c.say(
					usernick,
					"\u0002" + codes.orange + " !hour " +
					codes.dark_red + " -- " + codes.reset +
					" Shows the current time for the bot."
				);
			}
			if(config.commands.date.enabled) {
				c.say(
					usernick,
					"\u0002" + codes.orange + " !date " +
					codes.dark_red + " -- " + codes.reset +
					" Shows the current date for the bot."
				);
			}
			if(config.commands.eigthball.enabled) {
				c.say(
					usernick,
					"\u0002" + codes.orange + " !8ball [question] " +
					codes.dark_red + " -- " + codes.reset +
					" Let the 8 ball answer your questions :)"
				);
			}
			if(config.commands.mcstatus.enabled) {
				c.say(
					usernick,
					"\u0002" + codes.orange +" !mcstatus " + codes.dark_red +
					" -- " + codes.reset +
					" Queries a Minecraft server and shows various stats."
				);
			}
			if(config.commands.videoname.enabled) {
				c.say(
					usernick, "\u0002" + codes.orange + " !videoname [url] " +
					codes.dark_red +" -- " + codes.reset +
					" Given a YouTube/Vimeo video URL, shows its name."
				);
			}
			if(config.commands.chuck.enabled) {
				c.say(
					usernick, "\u0002" + codes.orange + " !chuck  " +
					codes.dark_red + " -- " + codes.reset +
					" Get an instant Chuck Norris joke"
				);
			}
			c.say(
				usernick,
				"\u0002" + codes.dark_blue +
				"---------------------------------------------------------"
			);
			sendToLog(
				ansicodes.blue + "[INFO] " + ansicodes.yellow + usernick +
				" issued bot command: !guacahelp"
			);
			comCount += 6;
		} else if (
			/^!hello$/.test(reccMsg) &&
			isLockdownDisabled &&
			config.commands.hello.enabled
		) {
			c.say(
				toChan,
				"\u0002" + codes.dark_red + "H" + codes.light_red + "e" +
				codes.orange + "l" + codes.yellow + "l" + codes.light_green +
				"o " + codes.dark_green + "W" + codes.light_blue + "o" +
				codes.dark_blue + "r" + codes.light_magenta + "l" +
				codes.magenta + "d" + codes.dark_red + "!"
			);
			sendToLog(
				ansicodes.blue + "[INFO] " + ansicodes.yellow + usernick +
				" issued bot command: !hello"
			);
			comCount += config.commands.hello.antispammer;
		} else if (
			/^!eatnacho$/.test(reccMsg) &&
			isLockdownDisabled &&
			config.commands.eatnacho.enabled
		) {
			c.action(toChan," eats a nacho");
			sendToLog(
				ansicodes.blue + "[INFO] " + ansicodes.yellow + usernick +
				" issued bot command: !eatnacho"
			);
			comCount += config.commands.eatnacho.antispammer;
		} else if (
			/^!hour$/.test(reccMsg) &&
			isLockdownDisabled &&
			config.commands.hour.enabled
		) {
			var currentTime = new Date();
			var curHour = currentTime.getHours() + 1;
			var curMinute = currentTime.getMinutes() + 1;
			var curSecond = currentTime.getSeconds() + 1;
			if (curHour < 10) {curHour = "0" + curHour;}
			if (curMinute < 10) {curMinute = "0" + curMinute;}
			if (curSecond < 10) {curSecond = "0" + curSecond;}
			c.say(
				toChan,
				"Current Time: " + curHour + ":" + curMinute + ":" + curSecond
			);
			sendToLog(
				ansicodes.blue + "[INFO] " + ansicodes.yellow + usernick +
				" issued bot command: !hour"
			);
			comCount += config.commands.hour.antispammer;
		} else if (
			/^!date$/.test(reccMsg) &&
			isLockdownDisabled &&
			config.commands.date.enabled
		) {
			var currentDate = new Date();
			var curDay = currentDate.getDate();
			var curWeekDay = currentDate.getUTCDay();
			switch(curWeekDay) {
				case 0: curWeekDay = "Sunday"; break;
				case 1: curWeekDay = "Monday"; break;
				case 2: curWeekDay = "Tuesday"; break;
				case 3: curWeekDay = "Wednesday"; break;
				case 4: curWeekDay = "Thursday"; break;
				case 5: curWeekDay = "Friday"; break;
				case 6: curWeekDay = "Saturday"; break;
			}
			var curMonth = currentDate.getMonth() + 1;
			var curYear = currentDate.getFullYear();
			c.say(
				toChan,
				"In my timezone, today's " + curWeekDay + ", " +
				curDay + "/" + curMonth + "/" + curYear + "."
			);
			sendToLog(
				ansicodes.blue + "[INFO] " + ansicodes.yellow + usernick +
				" issued bot command: !date"
			);
			comCount += config.commands.date.antispammer;
		} else if (
			(/^!8ball$/.test(reccMsg) || /^!8ball /.test(reccMsg)) &&
			isLockdownDisabled && config.commands.eigthball.enabled
		) {
			var EightBallWithArgs = false;
			var arg = null;
			if(
				/^!8ball$/.test(reccMsg) ||
				/^!8ball +/.test(reccMsg) ||
				"!8ball" != reccMsg
			) {
				arg = reccMsg.substr(reccMsg.indexOf(" ") + 1);
				EightBallWithArgs = true;
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
			var item = ballLines[
				Math.floor(Math.random() * ballLines.length
			)];
			if(arg == "!8ball") {
				arg = "(no question)";
			}
			c.say(toChan, "To the question: " + arg);
			c.say(toChan, "8 ball says: " + item);
			sendToLog(
				ansicodes.blue + "[INFO] " + ansicodes.yellow + usernick +
				" issued bot command: !8ball with argument: " + arg
			);
			comCount += config.commands.eigthball.antispammer;
		// Bukkit flavour 2:
		// Simple Minecraft server query tool
		} else if (
			/^!mcstatus$/.test(reccMsg) &&
			isLockdownDisabled &&
			config.commands.mcstatus.enabled
		) {
			// TODO: Add localization support

			c.say(usernick, "Doing a query to the server...");
			// Creates a new query object with host and port atributes
			var query = new Query(config.mcstatus.host, config.mcstatus.port);

			// Variable that tells the command how many times it should do the
			// query
			var reqcount = 1;

			// The main stuff:
			// Connect to server and receive data
			query.connect(function(err){
				// TODO: Better error handling
				// If there's an error while doing the ping
				if(err){
					c.say(usernick, "-------------------");
					c.say(usernick, "Server Status: Probably offline");
					c.say(usernick, "Error: " + err.error);
					c.say(usernick, "-------------------");
					sendToLog(
						ansicodes.blue + "[INFO] " + ansicodes.yellow +
						usernick + " issued bot command: !ccstatus " +
						"with result: Timeout Error"
					);
				} else {
					query.basic_stat(function(err, stat){
						// This function gets the data made by query.connect
						// and sends it to the player
						if(err){
							// TODO: Better error handling
							console.error(err);
						} else {
							// Here, we store in variables the MOTD, the number
							// of players connected and the max players that
							// the server can handle
							var motd = stat.MOTD;
							var numPlayers = stat.numplayers;
							var maxPlayers = stat.maxplayers;
							c.say(usernick, "-------------------");
							c.say(usernick, "Server Status: Online");
							c.say(
								usernick, "Players: " +
								numPlayers + "/" + maxPlayers
							);
							c.say(
								usernick, "Server List MOTD: \'" +
								motd + "\'"
							);
							c.say(usernick, "-------------------");
							sendToLog(
								ansicodes.blue + "[INFO] " + ansicodes.yellow +
								usernick + " issued bot command:" +
								"!ccstatus with result: Online, " +
								numPlayers + "/" + maxPlayers + ", \'" +
								motd + "'"
							);
						}
						reqcount--;
						if(reqcount<1){
							query.close();
						}
					});
				}
			});
			comCount += config.commands.mcstatus.antispammer;
		} else if(
			(/^!videoname$/.test(reccMsg) || /^!videoname /.test(reccMsg)) &&
			isLockdownDisabled &&
			config.commands.videoname.enabled
		) {
			var VIWithArgs, VIArg, onNameReplace, onFetchError;
			if(
				/^!videoname$/.test(reccMsg) ||
				/^!videoname +/.test(reccMsg) ||
				"!videoname" != reccMsg
			) {
				VIArg = reccMsg.substr(reccMsg.indexOf(" ") + 1);
				VIWithArgs = true;
			} if (VIArg !== "!videoname") {
				vi.fetch(VIArg, function(err,data) {
					if(err){
						onFetchError = stringReplacer(
							[
								["{ERR}", err]
							],
							config.commands.videoname.messages.onErr
						);
						sendToLog(
							ansicodes.blue + "[INFO] " + ansicodes.yellow +
							usernick +
							" issued bot command: !videoname with argument: " +
							VIArg + " and result: " + err
						);
						c.say(toChan,onFetchError);
					} else {
						onNameReplace = stringReplacer(
							[
								["{NAME}", data.title]
							],
							config.commands.videoname.messages.onName
						);
						c.say(toChan,onNameReplace);
						sendToLog(
							ansicodes.blue + "[INFO] " + ansicodes.yellow +
							usernick +
							" issued bot command: !videoname with argument: " +
							VIArg + " and result: " +
							"Success(Name Got: " + data.title + ")"
						);
					}
				});
			} else {
				c.say(toChan,"Usage: !videoname <video url>");
				sendToLog(
					ansicodes.blue + "[INFO]" + ansicodes.yellow + usernick +
					" issued bot command: !videoname with result: " +
					"Ignored (no argument)."
				);
			}
			comCount += config.commands.videoname.antispammer;
		} else if(
			/^!chuck$/.test(reccMsg) &&
			config.commands.chuck.enabled &&
			isLockdownDisabled
		) {
			http.get(CHUCK_API + config.commands.chuck.exclude, function(res) {
				var body = '';
				var fullRes;
				res.on("data",function(chunk){
					body += chunk;
				});
				res.on("end",function(){
					fullRes = JSON.parse(body);
					if(fullRes.type == "success") {
						var joke = fullRes.value.joke;
						var jokeNumber = fullRes.value.id;
						var finalJoke = joke.replace(/&quot;/g,"'");
						var jokeMsg = stringReplacer(
							[
								["{NUMBER}", jokeNumber],
								["{JOKE}", finalJoke]
							],
							config.commands.chuck.messages.onJoke
						);
						c.say(toChan,jokeMsg);
						sendToLog(
							ansicodes.blue + "[INFO] " +
							ansicodes.yellow + usernick +
							" issued bot command: !chuck with result:" +
							" Success (joke number " + jokeNumber + ")"
						);
					} else {
						c.say(config.commands.chuck.messages.onDBErr);
						sendToLog(
							ansicodes.blue + "[INFO] " + ansicodes.yellow +
							usernick + " issued bot command: !chuck with" +
							" result: DB error: The response type" +
							" wasn't 'success'."
						);
					}
				});
				res.on("error", function(e){
					c.say(config.commands.chuck.messages.onConnectErr);
					sendToLog(
						ansicodes.blue + "[INFO] " +
						ansicodes.yellow + usernick +
						" issued bot command:" +
						"!chuck with result: Connect error: " + e
					);
				});
			});
			comCount += config.commands.chuck.antispammer;
		} else {
			// If it isn't a registered command, the bot will know that
			// it is a chat message, so the bot will log it as chat
			sendToLog(
				ansicodes.red +
				"[" + ansicodes.yellow + toChan + ansicodes.red + "] " +
				ansicodes.cyan + usernick + ": " + ansicodes.reset + reccMsg
			);
		}
	}
};

var commandProcessor = new CommandProcessor();

// ############################
// ##    Message handlers    ##
// ############################
c.addListener('raw', function(message) {
	var command = message.command;
	switch(command) {
		// ############################
		// ##       Input Sorter     ##
		// ############################
		// If the input is a server notice
		case "NOTICE":
			// Log the notice to console and to log file, then break
			commandProcessor.onNotice(message.args[1]);
			break;
		// If the input is the welcoming message of the server
		case "001" || "002" || "003": break;
		// If the input is some connection settings sent from the bot to make
		// the connection to IRC server
		case "rpl_myinfo" ||
			 "rpl_isupport" ||
			 "rpl_namreply" ||
			 "rpl_endofnames" ||
			 "rpl_channelmodeis": break;
		// Server STATS logging!
		case "rpl_luserop" || "rpl_luserchannels":
			commandProcessor.onStats(message.args[2], message.args[1]);
			break;
		case "rpl_luserclient"||"rpl_luserme"||"rpl_statsconn":
			commandProcessor.onStats(message.args[1]);
			break;
		case "rpl_localusers"||"rpl_globalusers":
			commandProcessor.onStats(message.args[3]);
			break;
		// If the input is the topic from the channel
		case "rpl_topic":
			commandProcessor.onTopic(message.args[2], message.args[1]);
			break;
		// If it is a normal chat message
		case "PRIVMSG":
			commandProcessor.onPrivMsg(message);
            break;
	default:
		break;
	}
});

// TODO: Better error handling
c.addListener('error', function(message) { sendToLog('error: ' + message); });

c.addListener('join', function(channel,nick,message) {
	sendToLog(
		ansicodes.red +
		"[" + ansicodes.yellow + channel + ansicodes.red + "] " +
		ansicodes.green + nick + " joined " + channel
	);
});
c.addListener("part", function(channel,nick,reason) {
	sendToLog(
		ansicodes.red +
		"[" + ansicodes.yellow + channel + ansicodes.red + "] " +
		ansicodes.cyan + nick + " left " + channel + " (" + reason + ")"
	);
});
c.addListener("quit", function(nick,reason) {
	sendToLog(
		ansicodes.red +
		"[" + ansicodes.yellow + "All channels" + ansicodes.red + "] " +
		ansicodes.red + nick + " has quit IRC (" + reason + ")"
	);
});
c.addListener("kick", function(channel, nick, by, reason) {
	sendToLog(
		ansicodes.red +
		"[" + ansicodes.yellow + channel + ansicodes.red + "] " +
		ansicodes.blue + nick + " was kicked by " + by + " (" + reason + ")"
	);
});
var colorStrip = function (str) {
  return str.replace(/\033\[[0-9;]*m/g, '');
};
var sendToLog = function(message) {
	console.log(message);
	var parsedMsg = colorStrip(message);
	if(config.logging === true) {
		fs.open('GuacaLogOutput.log', 'a', function( e, id ) {
			fs.write( id, parsedMsg+'\n', null, 'utf8', function(){
				fs.close(id, function(){ });
			});
		});
	}
	io.sockets.emit('sendEvent',{"text":parsedMsg});
};

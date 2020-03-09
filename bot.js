const fs = require('fs');
const mineflayer = require('mineflayer');
const Discord = require('discord.js');
const Hashmap = require('hashmap');
const verifyingMap = new Hashmap();
const verifying = [];

var client = new Discord.Client();
var voiceChannel;
var gangGuild;

var gangName = "-";
var guildId = "-";
var prefix = ".";
var token = "-";
var serverIP = "play.minejunkie.com";

var bot = mineflayer.createBot({
	host: serverIP,
	username: "-",
	password: "-",
	viewDistance: "tiny",
	version: "1.8"
});

var generateCode = (n) => {
	let chars = "abcdefghijklmnopqrstuvwxyz0123456789";
	let code = "";

	for (let i = 0; i < n; i++) {
		code += chars.charAt(Math.floor(Math.random() * chars.length))
	}

	return code;
};

client.on('ready', () => {
	console.log("Discord connected");
	client.user.setActivity('with the gang', { type: "PLAYING" });
	client.user.setStatus('dnd');
	voiceChannel = client.channels.cache.get("685119927144808529");
	gangGuild = client.guilds.cache.get(guildId);
});

bot.on('login', () => {
	console.log("Bot joined");

	setTimeout(() => {
		bot.chat("/server junkie");
		console.log("Joined Junkie");
	}, 2000);

	setInterval(() => {
		sendCommand();
		setTimeout(() => {
			bot.chat("/server Junkie");
		}, 4000);
	}, 60000)
});


client.on('message', (message) => {
	var args = message.content.slice(prefix.length).split(' ');
	var command = args.shift().toLowerCase();

	if (message.content.startsWith(prefix + "code")) {
		if (!args[0]) {
			message.channel.send("`" + prefix + "code <your in-game name>`");
			return;
		}

		if (!message.member.roles.cache.find(x => x.id == "685124666465321078")) {
			message.channel.send("> You are not from the gang");
			return;
		}

		var verifiedUsers = fs.readFileSync('./verified.json');
		let jsonData = JSON.parse(verifiedUsers);
		for (let i = 0; i < jsonData.users.length; i++) {
			if (jsonData.users[i].discord_id == message.author.id) {
				message.channel.send("`You are verified already.`");
				return;
			}
		}

		var found = verifying.find(x => x.includes(args[0])) + "";
		if (found.includes(args[0])) {
			message.channel.send("`You've already requested for a code look Direct Messages with me.`");
			return;
		}

		var code = generateCode(5);
		//verifyingMap.set(args[0], code + "|" + message.author.id);
		verifying.push(args[0] + "|" + code + "|" + message.author.id);

		message.channel.send("Check direct messages.");
		message.author.send("Connect to `"
			+ serverIP + "` and send this in the chat: \n`/msg "
			+ bot.username + " "
			+ code + " is my code`\n\nAny bugs be sure to message nikch0 in discord niko#3302");
	} else if (message.content.startsWith(prefix + "stats")) {
		let target = message.guild.member(message.mentions.users.first());

		if (!target) {
			message.channel.send("`[INVALID USER] " + prefix + "stats <@user>`");
			return;
		}

		var verifiedUsers = fs.readFileSync('./verified.json');
		let jsonData = JSON.parse(verifiedUsers);

		for (let i = 0; i < jsonData.users.length; i++) {
			if (jsonData.users[i].discord_id == target.id) {
				let embed = new Discord.MessageEmbed();

				embed.setColor("GREEN");
				embed.setTitle("STATS CHECK FOR " + target.id);
				embed.addField("Username", jsonData.users[i].username + "", true);
				embed.addField("Blocks Mined", jsonData.users[i].blocks + "", true);
				embed.setThumbnail('https://minotar.net/avatar/' + jsonData.users[i].username);

				message.channel.send(embed);
			}
		}
	} else if (message.content.startsWith(prefix + "coinflips")) {
		var coinflips = JSON.parse(fs.readFileSync("./coinflips.json"));

		if (!args[0]) {
			message.channel.send("`" + prefix + "coinflips <the actual username u want to check coinflips for>`");
			return;
		}

		var found = coinflips.findIndex(x => x.username == args[0]);

		if (found == -1) {
			message.channel.send("`I haven't captured any of this user's coinflips sorry!`");
			return;
		}

		var username = coinflips[found].username;

		var winsLength = coinflips[found].wins.length;
		var losesLength = coinflips[found].loses.length;
		var totalLength = winsLength + losesLength;

		var embed = new Discord.MessageEmbed();

		try {
			embed.setDescription(`**LAST LOSE**\n**Lost To:** *${coinflips[found].loses[losesLength - 1].lostVs}*\n**Lost Amount:** *$${coinflips[found].loses[losesLength - 1].lostAmount} T*\n\n**LAST WIN**\n**Won To:** *${coinflips[found].wins[winsLength - 1].wonVs}*\n**Won Amount:** *$${coinflips[found].wins[winsLength - 1].wonAmount} T*\n\n**WINS:** *${winsLength}*\n**LOSES:** *${losesLength}*\n**TOTAL:** *${totalLength}*`);
			embed.setColor("PURPLE");
			embed.setTitle(username + "'s Coinflips.");
			embed.setThumbnail('https://minotar.net/avatar/' + username);

			message.channel.send(embed);
		} catch (e) { message.channel.send("`Something went wrong..`"); console.log(e) }

	}
});

function addLose(username, amount, lostTo, worth, coinflips) {
	var emptyObject = {
		"username": username,
		"loses": [],
		"wins": []
	}

	var loseArray = {
		"lostVs": lostTo,
		"lostAmount": parseInt(amount),
		"betWorth": parseInt(worth)
	}

	coinflips.findIndex(x => x.username == username) == -1 ? coinflips.push(emptyObject) : console.log("object already exists")

	var found = coinflips.findIndex(x => x.username == username);

	if (coinflips[found].loses.length < 1) {
		coinflips[found].loses = [];
		coinflips[found].loses.push(loseArray);
	} else {
		coinflips[found].loses.push(loseArray);
	}
}

function addWin(username, amount, winTo, worth, coinflips) {
	var emptyObject = {
		"username": username,
		"loses": [],
		"wins": []
	}

	var wonArray = {
		"wonVs": winTo,
		"wonAmount": parseInt(amount),
		"betWorth": parseInt(worth)
	}

	coinflips.findIndex(x => x.username == username) == -1 ? coinflips.push(emptyObject) : console.log("object already exists")

	var found = coinflips.findIndex(x => x.username == username);

	if (coinflips[found].wins.length < 1) {
		coinflips[found].wins = [];
		coinflips[found].wins.push(wonArray);
	} else {
		coinflips[found].wins.push(wonArray);
	}
}

bot.on("message", (json) => {
	var message = json.toString();
	var blocksMined;

	if (message.match(/\[\d+\] \[.+\]/)) {
		let username;
		console.log(message);

		if (json.json.extra != null && json.json.extra[1] != null && json.json.extra[1].hoverEvent != null && json.json.extra[1].hoverEvent.value != null) {
			blocksMined = removeColors(json.json.extra[1].hoverEvent.value[5].text).replace("Blocks Mined: ", "");
			username = removeColors(json.json.extra[1].hoverEvent.value[0].text).replace("Player: ", "").replace(/\s/, "");
		}

		let messageSentAt = new Date();
		
		var verifiedUsers = fs.readFileSync('./verified.json');
		let jsonData = JSON.parse(verifiedUsers);

		for (let i = 0; i < jsonData.users.length; i++) {
			if (jsonData.users[i].username == username) {
				let channel = client.channels.cache.find(channel => channel.name == username.toLowerCase() + "-logs");

				if (!channel) {
					gangGuild.channels.create(username.toLowerCase() + "-logs", {
						type: 'text'
					}).catch((dimo) => { console.log(dimo); });
				}

				channel = client.channels.cache.find(channel => channel.name == username.toLowerCase() + "-logs");

				let embed = new Discord.MessageEmbed();

				embed.setColor("GREEN");
				embed.setTitle("LOGS [" + messageSentAt.getHours() + ":" + messageSentAt.getMinutes() + ":" + messageSentAt.getSeconds() + "]");
				embed.addField("Username", username + "", true);
				embed.addField("Blocks Mined", blocksMined + "", true);
				embed.addField("Message", "`" + message + "`", false);
				embed.setThumbnail('https://minotar.net/avatar/' + username);

				jsonData.users[i].blocks = blocksMined;

				channel.send(embed);
			}
		}

		fs.writeFileSync("./verified.json", JSON.stringify(jsonData, null, 2));
	} else if (message.includes("Trophies:")) {
		var trophies = message.replace("Trophies:", "");

		voiceChannel.setName("Trophies: " + trophies);
		console.log("[LOG] Updated the Trophies Count Channel.");
	} else if (message.includes("->") && message.includes("me]")) {
		var username = message.split(" ")[0].replace("[", "");

		var mcMessage = message.split(" ").slice(3);

		if (mcMessage.includes("dimoopela")) {
			bot.chat("/gang info " + gangName);
		} else if (mcMessage.includes("is") && mcMessage.includes("my") && mcMessage.includes("code")) {
			var code = mcMessage[0];
			var found = verifying.find(x => x.includes(username)) + "";

			var verifiedUsers = fs.readFileSync('./verified.json');
			var jsonData = JSON.parse(verifiedUsers);

			for (let i = 0; i < jsonData.users.length; i++) {
				if (jsonData.users[i].username == username) {
					return console.log("[LOG] Already verified.");
				}
			}

			if (found.split("|")[1] == code) {
				var userData = {
					username: username,
					discord_id: found.split("|")[2],
					blocks: 0
				}

				jsonData.users.push(userData);
				console.log("[LOG] Added " + username + " to the verified database.");
				bot.chat("/r You are now verified with DISCORD ID: " + found.split("|")[2]);

				var channel = client.channels.cache.find(channel => channel.name == username.toLowerCase() + "-logs");

				if (!channel) {
					gangGuild.channels.create(username.toLowerCase() + "-logs", {
						type: 'text',
						permissionOverwrites: [
							{
								id: gangGuild.id,
								deny: ['VIEW_CHANNEL'],
							},
							{
								id: found.split("|")[2],
								allow: ['VIEW_CHANNEL'],
							}
						],
						parent: "685847459980902441",
					});
				}
			}

			fs.writeFileSync("./verified.json", JSON.stringify(jsonData, null, 2));
		} else if (mcMessage.includes(".command")) {
			if (username != "nikch0") {
				return;
			}

			mcMessage.shift();

			bot.chat(mcMessage.join(" "));
		}
	} else if (message.match(/([^\s]+) just won a bet worth \$?\d+?\.\d+ T  against ([^\s]+)/)) {
		var wtf = fs.readFileSync("./coinflips.json")
		var coinflips = JSON.parse(wtf);

		var splitMessage = message.split(" ");

		var winner = splitMessage[0];
		var betWorth = Math.ceil(splitMessage[6].replace("$", ""));//(Math.floor(splitMessage[6].replace("$", "")) / 2);
		var amountEach = parseInt(betWorth / 2);
		var loser = splitMessage[10].replace(".", "");
		var date = new Date();

		var channel = gangGuild.channels.cache.find(channel => channel.name == "coinflip-logs");
		var embed = new Discord.MessageEmbed();
		var foundWinner = coinflips.findIndex(x => x.username == winner);
		var foundLoser = coinflips.findIndex(x => x.username == loser);
		var winnerWins = 1, winnerLoses = 0, loserWins = 0, loserLoses = 1;

		if (foundLoser != -1) {
			loserWins = coinflips[foundLoser].wins.length;
			loserLoses = coinflips[foundLoser].loses.length;
		}

		if (foundWinner != -1) {
			winnerWins = coinflips[foundWinner].wins.length;
			winnerLoses = coinflips[foundWinner].loses.length;
		}

		embed.setColor("YELLOW");
		embed.setTitle("COINFLIP CAPTURED ON [" + date.getHours() + ":" + date.getMinutes() + "]");
		embed.addField("WINNER", "***" + winner + "*** **(" + winnerWins + " W) " + "(" + winnerLoses + " L)**", true);
		embed.addField("LOSER", "***" + loser + "*** **(" + loserWins + " W) " + "(" + loserLoses + " L)**", true);
		embed.addField("BET WORTH", "$" + (splitMessage[6].replace("$", "")) + " T");

		channel.send(embed);

		addWin(winner, amountEach, loser, betWorth, coinflips);
		addLose(loser, amountEach, winner, betWorth, coinflips);
		
		fs.writeFileSync("./coinflips.json", JSON.stringify(coinflips, null, 2));
	}
});

bot.on("error", (err) => {
	console.log(err);
});

client.on("error", (err) => {
	console.log(err);
});

function sendCommand() {
	let date = new Date();

	if (date.getMinutes() == 1) {
		bot.chat("/gang info " + gangName);
	}
}

function removeColors(message) {
	return message.replace(/\u00A7[0-9A-FK-OR]/ig, '');
}

client.login(token);


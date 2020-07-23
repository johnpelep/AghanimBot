// require the discord.js module
const Discord = require('discord.js');
const config = require('./config.json');
const fetch = require('node-fetch');

// create a new Discord client
const client = new Discord.Client();

// when the client is ready, run this code
// this event will only trigger one time after logging in
client.once('ready', () => {
	console.log('Ready!');
});

client.on('message', async message => {
	if (message.author.bot) 
		return;

	if (message.content.toLowerCase().includes('friends!')) {
		const url = buildUrl();
		const res = await fetch(url).then(response => response.json());
		let players = res.response.players;
		const ingamePlayers = players.filter(item => item.gameextrainfo != undefined);
		const onlinePlayers = players.filter(item => item.personastate > 0 && item.gameextrainfo == undefined);
		const offlinePlayers = players.filter(item => item.personastate == 0 && item.lastlogoff != undefined);
		const offlinePlayersNotFriend = players.filter(item => item.personastate == 0 && item.lastlogoff == undefined);

		// sort ingame and online players by status
		ingamePlayers.sort((a, b) => a.personastate - b.personastate);
		onlinePlayers.sort((a, b) => a.personastate - b.personastate);
						
		//sort offline players by lastlogoff
		offlinePlayers.sort((a, b) => b.lastlogoff - a.lastlogoff);

		//soft offline not friend players by personaname
		offlinePlayersNotFriend.sort((a, b) => a.personaname.localeCompare(b.personaname));

		// merge all player arrays to single array
		players = ingamePlayers.concat(onlinePlayers).concat(offlinePlayers).concat(offlinePlayersNotFriend);

		let fields = [ 
			{
				name: '\u200b',
				value: '\u200b',
				inline: false
			}
		];

		let embedMessage = {
			color: 0x0099ff,
			title: 'Let us skirmish!',
		};

		for (var i = 0; i < players.length; i++) {
			fields = buildMessageFields(players[i], fields);

			if ((i+1) % 6 == 0 || i == players.length-1) {
				embedMessage.fields = fields;
				embedMessage.footer = {
					text: `Page ${Math.ceil((i+1)/6)} of ${Math.ceil(players.length/6)}`
				}
				fields = [ 
					{
						name: '\u200b',
						value: '\u200b',
						inline: false
					}
				];
				message.reply({ embed: embedMessage });
			}
		}
	}
});

// login to Discord with your app's token
client.login(config.token);

function buildUrl() {
	let steamIds = [];
	
	for (var i = 0; i < config.accounts.length; i++) {
		steamIds.push(config.accounts[i].steamIds);
	}

	return `http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${config.steamApiKey}&steamids=${steamIds.join(',')}`
}

function buildMessageFields(player, fields) {
	let status = '';
	
	switch(player.personastate) {
		case 0:
			status = 'Offline';
			break;
		case 1:
			status = 'Online';
			break;
		case 2:
			status = 'Busy';
			break;
		case 3:
			status = 'Away';
			break;
		case 4:
			status = 'Snooze';
			break;
		case 5:
			status = 'Looking to Trade';
			break;
		case 6:
			status = 'Looing to Play';
			break;
		default:
			status = 'Ambot daw'
	}
	
	// Name
	fields.push({
		name: 'Name',
		value: player.personaname,
		inline: false
	});
	
	// Status and Game
	if (player.gameextrainfo != undefined) {
		fields.push({
			name: 'Status',
			value: `${status} (Currently In-Game)`,
			inline: false
		});

		fields.push({
			name: 'Game',
			value: player.gameextrainfo,
			inline: false
		});
	}
	else {
		fields.push({
			name: 'Status',
			value: status,
			inline: false
		});
	}
		
	// Last Log Off
	if (status === 'Offline' && player.lastlogoff != undefined) {
		var date = new Date(player.lastlogoff * 1000);
		fields.push({
			name: 'Logged Off Since',
			value: `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`,
			inline: false
		});
	}	
	
	//break line
	fields.push({
		name: '\u200b',
		value: '\u200b',
		inline: false
	});
	
	return fields;
}